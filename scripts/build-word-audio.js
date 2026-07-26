// One-time (resumable) generator for per-word audio clips.
// Derives the word list from the same allowed-vocabulary builder the story
// generator uses (lib/story.js + data/band1.json + data/band2.json), then
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

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAllowedSet } from '../lib/story.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const BAND1_PATH = path.join(REPO_ROOT, 'data', 'band1.json');
const BAND2_PATH = path.join(REPO_ROOT, 'data', 'band2.json');
const WORDS_DIR = path.join(REPO_ROOT, 'public', 'audio', 'words');

const MODEL = 'gpt-4o-mini-tts';
const VOICE = 'nova';
const INSTRUCTIONS =
  'Speak slowly and clearly, like a warm, friendly teacher pronouncing one English word for a young learner.';

const WORD_RE = /^[a-z]+(?:'[a-z]+)?$/;
const MAX_ATTEMPTS = 4;
const RETRY_BASE_MS = 1500;

export function deriveWordList() {
  const band1 = JSON.parse(readFileSync(BAND1_PATH, 'utf8'));
  const band2 = JSON.parse(readFileSync(BAND2_PATH, 'utf8'));
  const profile = { skills: { receptiveVocab: { band: 'A2' } }, words: {}, learner: {} };
  const allowed = buildAllowedSet(profile, band1, band2);
  return [...allowed].filter((w) => WORD_RE.test(w)).sort();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeWord(apiKey, lemma) {
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

async function main() {
  const words = deriveWordList();

  if (process.env.WORD_AUDIO_DRY_RUN === '1') {
    console.log(`words: ${words.length}`);
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
