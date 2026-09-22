// One-time (resumable) generator for per-word audio clips.
// Derives WHAT TO GENERATE from the same allowed-vocabulary builder the story
// generator uses (lib/story.js + data/band1.json + data/band2.json) UNION the
// explicit story-word extras in data/story-words.json, then
// calls the OpenAI TTS API to synthesize each word and writes the resulting
// aac bytes to public/audio/words/<lemma>.aac.
//
// Usage:
//   set -a; . ./.env; set +a; node scripts/build-word-audio.js
//
// Dry run (no network, no API key required):
//   WORD_AUDIO_DRY_RUN=1 node scripts/build-word-audio.js
//
// Requires OPENAI_API_KEY in the environment for the real run. Zero npm
// dependencies (uses global fetch). Node ESM. Resumable: re-running skips
// any word whose .aac file already exists.

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAllowedSet } from '../lib/story.js';
import { resolveLemma } from '../public/lemma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const BAND1_PATH = path.join(REPO_ROOT, 'data', 'band1.json');
const BAND2_PATH = path.join(REPO_ROOT, 'data', 'band2.json');
const WORDS_DIR = path.join(REPO_ROOT, 'public', 'audio', 'words');
const MANIFEST_PATH = path.join(WORDS_DIR, 'index.json');
const STORY_WORDS_PATH = path.join(REPO_ROOT, 'data', 'story-words.json');
// Lives under public/, not data/, on purpose: the same file is read here by
// Node (fs) AND fetched by the browser view that lists it (public/ is the
// only directory the client can reach), so there is one file, not two copies
// that could drift.
const EXAM_WORDS_PATH = path.join(REPO_ROOT, 'public', 'exam-words.json');

const MODEL = 'gpt-4o-mini-tts';
const VOICE = 'nova';
const INSTRUCTIONS =
  'Speak slowly and clearly, like a warm, friendly teacher pronouncing one English word for a young learner.';

const WORD_RE = /^[a-z]+(?:'[a-z]+)?$/;
const MAX_ATTEMPTS = 4;
const RETRY_BASE_MS = 1500;

// TWO CONCEPTS, TWO NAMES. One function used to mean both at once, and that
// ambiguity is exactly what let the manifest drift away from the disk.
//
//   wordsToGenerate()  = WHAT WE INTEND TO HAVE. The curriculum bands, plus the
//                        explicit story-word extras. Drives the generation loop.
//   clipsOnDisk()      = WHAT EXISTS. The .aac files, and nothing else.
//
// THE MANIFEST IS clipsOnDisk(), ALWAYS. A manifest entry with no file is a dead
// speaker button in a child's story; deriving it from the disk makes that state
// structurally unreachable rather than merely unlikely.
//
// The extras are a DATA FILE, never a literal in this script: a hardcoded word
// list here is what tests/word-audio.test.js has forbidden since the first run.
// BASE LEMMAS ONLY. See .oplan/word-polish/journal.md ruling B2: an inflected
// surface form in the manifest stops migrateWordKeys (lib/profile.js) folding it
// into its lemma, which SPLITS a word she has already collected into two entries.
export function readStoryWords() {
  if (!existsSync(STORY_WORDS_PATH)) return [];
  const raw = JSON.parse(readFileSync(STORY_WORDS_PATH, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('data/story-words.json must be a JSON array');
  const seen = new Set();
  for (const w of raw) {
    if (typeof w !== 'string' || !WORD_RE.test(w)) {
      throw new Error(`data/story-words.json holds ${JSON.stringify(w)}, which can never be a lemma file`);
    }
    if (seen.has(w)) throw new Error(`data/story-words.json lists "${w}" twice`);
    seen.add(w);
  }
  return [...seen];
}

export function bandWords() {
  const band1 = JSON.parse(readFileSync(BAND1_PATH, 'utf8'));
  const band2 = JSON.parse(readFileSync(BAND2_PATH, 'utf8'));
  const profile = { skills: { receptiveVocab: { band: 'A2' } }, words: {}, learner: {} };
  const allowed = buildAllowedSet(profile, band1, band2);
  return [...allowed].filter((w) => WORD_RE.test(w)).sort();
}

// The exam list itself (a teacher-supplied word list, e.g. public/exam-words.json)
// -- entries may be phrases ("ice cream"), unlike the single-lemma sources above.
export function readExamWords() {
  if (!existsSync(EXAM_WORDS_PATH)) return [];
  const raw = JSON.parse(readFileSync(EXAM_WORDS_PATH, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('public/exam-words.json must be a JSON array');
  for (const w of raw) {
    if (typeof w !== 'string' || w.trim() === '') {
      throw new Error(`public/exam-words.json holds ${JSON.stringify(w)}, which can never be a word`);
    }
  }
  return raw;
}

// "children" is PERMANENTLY EXCLUDED, even though nothing today resolves it.
// It is the canonical known-absent-from-the-manifest irregular plural that
// tests/quiz-item.test.js, tests/item-batch.test.js and tests/quiz-bank.test.js
// rely on to prove their "rule 4" gate actually fires on a real out-of-vocabulary
// token. Giving it a clip would silently turn those into false negatives. The
// exam view falls back to its existing "coming soon" state for this one word.
const RESERVED_ABSENT = new Set(['children']);

// Only the exam-list tokens that need a NEW clip. A phrase like "ice cream"
// contributes its whitespace-split tokens ("ice", "cream"), each checked with
// resolveLemma against the band/story universe FIRST -- anything it can already
// reach (exact match, or de-inflected, e.g. "cookies" -> "cookie") is left alone.
// Generating "cookies" as its own exact clip would be the FC-6 split bug: exact
// match is tried first, so it would divert resolveLemma away from "cookie",
// splitting a word she may already have collected under that key.
export function examWordsToGenerate() {
  const already = new Set([...bandWords(), ...readStoryWords()]);
  const tokens = new Set();
  for (const phrase of readExamWords()) {
    for (const tok of phrase.toLowerCase().split(/\s+/)) {
      if (RESERVED_ABSENT.has(tok)) continue;
      if (WORD_RE.test(tok) && resolveLemma(tok, already) === null) tokens.add(tok);
    }
  }
  return [...tokens].sort();
}

export function wordsToGenerate() {
  return [...new Set([...bandWords(), ...readStoryWords(), ...examWordsToGenerate()])].sort();
}

export function clipsOnDisk() {
  if (!existsSync(WORDS_DIR)) return [];
  return readdirSync(WORDS_DIR)
    .filter((f) => f.endsWith('.aac'))
    .map((f) => f.slice(0, -'.aac'.length))
    .sort();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function synthesizeWord(apiKey, lemma) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICE,
      input: lemma,
      response_format: 'aac',
      instructions: INSTRUCTIONS,
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '<no body>');
    throw new Error(`OpenAI TTS API call failed for "${lemma}": ${res.status} ${res.statusText} — ${bodyText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function synthesizeWithRetry(apiKey, lemma) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await synthesizeWord(apiKey, lemma);
    } catch (err) {
      lastErr = err;
      console.log(`  retry ${attempt}/${MAX_ATTEMPTS} for "${lemma}": ${err.message || err}`);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_MS * attempt);
      }
    }
  }
  throw lastErr;
}

// The manifest the browser AND api/profile.js resolve against. It is written
// from the DISK, so "listed" and "exists" cannot come apart. It takes no
// argument on purpose: there is no caller-supplied list that could be wrong.
export function writeManifestFromDisk() {
  mkdirSync(WORDS_DIR, { recursive: true });
  const words = clipsOnDisk();
  writeFileSync(MANIFEST_PATH, JSON.stringify(words) + '\n');
  return { path: MANIFEST_PATH, count: words.length };
}

async function main() {
  const words = wordsToGenerate();

  if (process.env.WORD_AUDIO_DRY_RUN === '1') {
    console.log(`words: ${words.length}`);
    console.log(`extras: ${readStoryWords().length}`);
    console.log(`examWords: ${examWordsToGenerate().length}`);
    console.log(`clips: ${clipsOnDisk().length}`);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      'OPENAI_API_KEY is not set in the environment. Usage: set -a; . ./.env; set +a; node scripts/build-word-audio.js'
    );
    process.exit(1);
    return;
  }

  mkdirSync(WORDS_DIR, { recursive: true });

  let wrote = 0;
  let skipped = 0;

  try {
    for (const lemma of words) {
      const outPath = path.join(WORDS_DIR, `${lemma}.aac`);
      if (existsSync(outPath)) {
        console.log(`skip ${lemma} (already exists)`);
        skipped++;
        continue;
      }

      const bytes = await synthesizeWithRetry(apiKey, lemma);
      writeFileSync(outPath, bytes);
      console.log(`wrote ${lemma} (${bytes.length} bytes)`);
      wrote++;
    }
  } finally {
    // ALWAYS, even on a half-finished run: the manifest is a statement about
    // the disk, and it must be true of the disk we actually have. A run that
    // dies after 6 of 10 leaves 6 clips and a manifest that lists 6 -- honest,
    // just incomplete, and completed by re-running (this script is resumable).
    const m = writeManifestFromDisk();
    console.log(`manifest: ${m.count} words -> ${m.path}`);
  }

  console.log(`wrote ${wrote}, skipped ${skipped}`);
}

// Only generate when run as a script. Without this guard, importing the module
// -- which tests/word-audio.test.js does, so it can check the REAL derived word
// list rather than a re-implementation of it -- would start spending money.
const isDirectRun =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  main().catch((err) => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(1);
  });
}
