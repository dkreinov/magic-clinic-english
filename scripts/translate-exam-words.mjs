// One-time (resumable) Hebrew-translation generator for the exam word list.
//
// Reads public/exam-words.json and, for every entry whose "he" is still
// null, calls the exact same OpenAI chat translation api/translate.js uses
// live for a freshly-tapped story word, then writes the result BACK into the
// file -- so the exam page never has to translate anything itself. The he
// values that land here are also what collectBandWords (lib/profile.js) uses
// to seed her profile the first time she opens the exam tab: pre-baking the
// translation here is what keeps that a pure, network-free write.
//
// Usage:
//   set -a; . ./.env; set +a; node scripts/translate-exam-words.mjs
//
// Dry run (no network, no API key required):
//   EXAM_TRANSLATE_DRY_RUN=1 node scripts/translate-exam-words.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chatJSON } from '../lib/openai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const EXAM_WORDS_PATH = path.join(REPO_ROOT, 'public', 'exam-words.json');

// Byte-identical to api/translate.js's system prompt, so a word gets the same
// translation whichever path produced it.
const SYSTEM = 'Translate ONE English word to a single common Hebrew word. Respond ONLY with JSON {"he": "..."}.';

export function readExamWordEntries() {
  const raw = JSON.parse(readFileSync(EXAM_WORDS_PATH, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('public/exam-words.json must be a JSON array');
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object' || typeof entry.word !== 'string' || entry.word.trim() === '') {
      throw new Error(`public/exam-words.json holds ${JSON.stringify(entry)}, which can never be a word entry`);
    }
  }
  return raw;
}

function writeExamWordEntries(entries) {
  writeFileSync(EXAM_WORDS_PATH, JSON.stringify(entries, null, 2) + '\n');
}

async function translate(word) {
  const r = await chatJSON({ system: SYSTEM, user: word, temperature: 0 });
  if (typeof r.he !== 'string' || r.he.trim() === '') {
    throw new Error(`translation for "${word}" came back empty: ${JSON.stringify(r)}`);
  }
  return r.he.trim();
}

async function main() {
  const entries = readExamWordEntries();
  const missing = entries.filter((e) => !e.he);

  if (process.env.EXAM_TRANSLATE_DRY_RUN === '1') {
    console.log(`entries: ${entries.length}`);
    console.log(`missing: ${missing.length}`);
    return;
  }

  if (missing.length > 0 && !process.env.OPENAI_API_KEY) {
    console.error(
      'OPENAI_API_KEY is not set. Usage: set -a; . ./.env; set +a; node scripts/translate-exam-words.mjs'
    );
    process.exit(1);
    return;
  }

  let wrote = 0;
  for (const entry of entries) {
    if (entry.he) {
      console.log(`skip ${entry.word} (already translated)`);
      continue;
    }
    entry.he = await translate(entry.word);
    console.log(`wrote ${entry.word} -> ${entry.he}`);
    wrote++;
    // Written after EVERY word, same resumability as build-word-audio.js: a
    // run that dies partway leaves a file honest about what it actually has.
    writeExamWordEntries(entries);
  }

  console.log(`translated ${wrote} of ${entries.length}`);
}

const isDirectRun = process.argv[1] !== undefined && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(1);
  });
}
