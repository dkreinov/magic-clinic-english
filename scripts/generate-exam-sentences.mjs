// One-time (resumable) example-sentence generator for the exam word list.
//
// Reads public/exam-words.json and, for every entry whose "sentence" is
// still null, calls the OpenAI chat model for ONE short example sentence
// using that word, then writes the result BACK into the file. Same shape as
// scripts/translate-exam-words.mjs: a build-time, pre-baked field, so the
// exam page never has to call an LLM itself and every viewer sees the same
// sentence.
//
// Deliberately UNGRADED: this is context to read, not a task to complete, so
// it carries none of the quiz-bank's validation rules (lib/quiz-item.js) --
// those exist because a cloze-pick item is auto-graded against an exact
// answer and a fixed distractor set. A sentence she only reads has no such
// failure mode.
//
// Usage:
//   set -a; . ./.env; set +a; node scripts/generate-exam-sentences.mjs
//
// Dry run (no network, no API key required):
//   EXAM_SENTENCES_DRY_RUN=1 node scripts/generate-exam-sentences.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chatJSON } from '../lib/openai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const EXAM_WORDS_PATH = path.join(REPO_ROOT, 'public', 'exam-words.json');

const SYSTEM =
  'Write ONE short, simple example sentence for an eleven-year-old English learner, using the ' +
  'given English word or phrase naturally and exactly as given. 4 to 12 words, everyday ' +
  'vocabulary, simple present or past tense. Respond ONLY with JSON {"sentence": "..."}.';

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

async function generateSentence(word) {
  const r = await chatJSON({ system: SYSTEM, user: word, temperature: 0.7 });
  if (typeof r.sentence !== 'string' || r.sentence.trim() === '') {
    throw new Error(`sentence for "${word}" came back empty: ${JSON.stringify(r)}`);
  }
  return r.sentence.trim();
}

async function main() {
  const entries = readExamWordEntries();
  const missing = entries.filter((e) => !e.sentence);

  if (process.env.EXAM_SENTENCES_DRY_RUN === '1') {
    console.log(`entries: ${entries.length}`);
    console.log(`missing: ${missing.length}`);
    return;
  }

  if (missing.length > 0 && !process.env.OPENAI_API_KEY) {
    console.error(
      'OPENAI_API_KEY is not set. Usage: set -a; . ./.env; set +a; node scripts/generate-exam-sentences.mjs'
    );
    process.exit(1);
    return;
  }

  let wrote = 0;
  for (const entry of entries) {
    if (entry.sentence) {
      console.log(`skip ${entry.word} (already has a sentence)`);
      continue;
    }
    entry.sentence = await generateSentence(entry.word);
    console.log(`wrote ${entry.word} -> ${entry.sentence}`);
    wrote++;
    // Written after EVERY word: a run that dies partway leaves a file honest
    // about what it actually has, same resumability as the other two scripts.
    writeExamWordEntries(entries);
  }

  console.log(`generated ${wrote} of ${entries.length}`);
}

const isDirectRun = process.argv[1] !== undefined && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(1);
  });
}
