#!/usr/bin/env node
// Contract QZ-3: the quiz-bank gate.
//
//   node scripts/check-quiz-bank.mjs [--dir <path>] [--sample <N>]
//
// ESM, zero npm dependencies. Two mutually exclusive modes:
//
//   gate (default)  -- walk <dir>/*.json, apply every QZ-1 rule, print one line
//                      per problem, exit 1 if there was any.
//   --sample <N>    -- print N items for a human to read, exit 0, no gating.
//
// Every rule lives in lib/quiz-item.js and is applied ONLY through
// validateItemFile. This file re-implements nothing: a gate that re-derives a
// rule is a second, drifting copy of the contract. Error strings (including the
// bare rule-4 token list) are passed through verbatim and merely prefixed with
// the file they came from, because a downstream worker cannot fix "rule 4
// failed" but it can fix "feel.json[1] rule 4: children, after".

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPosIndex, validateItemFile } from '../lib/quiz-item.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const DEFAULT_DIR = path.join(root, 'public', 'quiz');

function usage(message) {
  console.error(`error: ${message}`);
  console.error('usage: node scripts/check-quiz-bank.mjs [--dir <path>] [--sample <N>]');
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { dir: DEFAULT_DIR, sample: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dir') {
      const value = argv[++i];
      if (value === undefined) usage('--dir needs a path');
      opts.dir = path.resolve(value);
    } else if (arg === '--sample') {
      const value = argv[++i];
      if (value === undefined) usage('--sample needs a number');
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0) usage(`--sample needs a non-negative integer, got "${value}"`);
      opts.sample = n;
    } else {
      usage(`unknown argument "${arg}"`);
    }
  }
  return opts;
}

// A MISSING directory is treated exactly like an empty one, and is never
// created as a side effect: public/quiz/ does not exist until the generator
// step runs, and `node scripts/check-quiz-bank.mjs` must still be green before
// then rather than crashing or conjuring the directory.
function listFiles(dir) {
  let names;
  try {
    names = readdirSync(dir);
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) return [];
    throw err;
  }
  return names
    .filter((name) => name.endsWith('.json'))
    .filter((name) => {
      try {
        return statSync(path.join(dir, name)).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}

// { file, items } on success, { file, error } on a read/parse failure.
// A file whose top level is not an array is NOT an error here: it is handed to
// validateItemFile, which owns that verdict (rule 2).
function loadFile(dir, name) {
  let text;
  try {
    text = readFileSync(path.join(dir, name), 'utf8');
  } catch (err) {
    return { file: name, error: `cannot be read: ${err.message}` };
  }
  try {
    return { file: name, items: JSON.parse(text) };
  } catch (err) {
    return { file: name, error: `invalid JSON: ${err.message}` };
  }
}

function loadContext() {
  const read = (...p) => JSON.parse(readFileSync(path.join(root, ...p), 'utf8'));
  const allowed = new Set(read('public', 'audio', 'words', 'index.json'));
  const posIndex = buildPosIndex(read('data', 'band1.json'), read('data', 'band2.json'), allowed);
  return { allowed, posIndex };
}

function runGate(dir) {
  const ctx = loadContext();
  const problems = [];
  let items = 0;
  let multiSense = 0;

  const files = listFiles(dir);
  for (const name of files) {
    const loaded = loadFile(dir, name);
    if (loaded.error) {
      problems.push(`${name} ${loaded.error}`);
      continue;
    }
    if (Array.isArray(loaded.items)) {
      items += loaded.items.length;
      if (loaded.items.length >= 2) multiSense++;
    }
    const lemma = name.slice(0, -'.json'.length);
    for (const err of validateItemFile(lemma, loaded.items, ctx).errors) {
      // Item-level errors already carry their "[i] " index, so they are
      // concatenated to give feel.json[1]; file-level ones get a space.
      problems.push(err.startsWith('[') ? `${name}${err}` : `${name} ${err}`);
    }
  }

  if (problems.length) {
    for (const line of problems) console.log(line);
    console.log(`QUIZ BANK FAILED: ${problems.length} problems`);
    process.exit(1);
  }

  console.log(`QUIZ BANK OK: ${files.length} files, ${items} items`);
  console.log(`MULTI-SENSE: ${multiSense} files with >=2 items`);
  process.exit(0);
}

// Sampling is DETERMINISTIC -- no Math.random(), ever, so two runs are
// byte-identical and a human reviewing a sample is reviewing the same sample.
//
// It samples ITEMS, not files: the flat (file, index-within-file) list sorted
// by filename then index, walked with a fixed stride. Sampling per file and
// always printing item[0] would hide exactly the multi-sense items that the
// multi-sense generation rule exists to produce, which is precisely what the
// human review gate is looking for.
function sampleIndices(total, n) {
  if (total === 0 || n <= 0) return [];
  if (n >= total) return Array.from({ length: total }, (_, i) => i);
  // floor(i * total / n), NOT i * floor(total / n). A uniform integer stride
  // from 0 stops at (n-1)*floor(total/n) and never reaches the tail of the
  // bank: with 80 items, --sample 50 gave a stride of 1 and showed only the
  // alphabetically-first 50 items -- 63% of the bank, all of it front-loaded.
  // The sampler exists to give the human review gate an UNBIASED look, so a
  // sample that silently omits the last third of the words is the same class of
  // defect this project has already shipped twice: an output that looks correct
  // while measuring something adjacent to what matters. This form spans 98-100%
  // at every total, stays deterministic, and stays strictly increasing (so the
  // n indices are always distinct) because total >= n here.
  return Array.from({ length: n }, (_, i) => Math.floor((i * total) / n));
}

function runSample(dir, n) {
  const flat = [];
  for (const name of listFiles(dir)) {
    const loaded = loadFile(dir, name);
    if (loaded.error) {
      // Sampling does not gate; the gate mode is what reports this as a
      // problem. Warn on stderr so stdout stays byte-stable.
      console.error(`warning: skipping ${name}: ${loaded.error}`);
      continue;
    }
    if (!Array.isArray(loaded.items)) {
      console.error(`warning: skipping ${name}: top level is not an array`);
      continue;
    }
    loaded.items.forEach((item, index) => flat.push({ file: name, index, item }));
  }

  for (const at of sampleIndices(flat.length, n)) {
    const { file, index, item } = flat[at];
    const it = item && typeof item === 'object' ? item : {};
    const distractors = Array.isArray(it.distractors) ? it.distractors : [];
    console.log(`${file}[${index}]`);
    console.log(`  sense:       ${it.sense}`);
    console.log(`  sentence:    ${it.sentence}`);
    console.log(`  answer:      ${it.answer}`);
    console.log(`  distractors: ${distractors.join(', ')}`);
    console.log('');
  }
  process.exit(0);
}

const opts = parseArgs(process.argv.slice(2));
if (opts.sample !== null) {
  runSample(opts.dir, opts.sample);
} else {
  runGate(opts.dir);
}
