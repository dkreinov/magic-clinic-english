// The weekly quiz top-up list. B7 (docs/growth.md section 8, signed 2026-07-28):
// the top-up covers `known` UNION `candidate`, on-manifest words only.
// Filters, in this order: QZ-8's 37 excluded words, then words absent from
// public/audio/words/index.json (QZ-1 rule 12 makes an item impossible for them,
// and they have no clip either -- B7's off-list rider defers them to their own step),
// then words that already have public/quiz/<lemma>.json.
// Every dropped word is printed with its reason. This script never writes anything.
// Usage: node scripts/quiz-topup.mjs --profile /c/Users/<you>/english-app-backups/profile-<ts>.json

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DEFAULT_DIR = path.join(root, 'public', 'quiz');
const DEFAULT_MANIFEST = path.join(root, 'public', 'audio', 'words', 'index.json');
const DEFAULT_EXCLUSIONS = path.join(root, '.oplan', 'word-quiz', 'qz8-exclusions.txt');

function fail(message, code) {
  console.log(message);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = { profile: null, dir: DEFAULT_DIR, manifest: DEFAULT_MANIFEST, exclusions: DEFAULT_EXCLUSIONS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--profile') opts.profile = argv[++i];
    else if (arg === '--dir') opts.dir = argv[++i];
    else if (arg === '--manifest') opts.manifest = argv[++i];
    else if (arg === '--exclusions') opts.exclusions = argv[++i];
  }
  if (!opts.profile) fail('TOPUP FAILED: --profile is required', 2);
  opts.profile = path.resolve(opts.profile);
  opts.dir = path.resolve(opts.dir);
  opts.manifest = path.resolve(opts.manifest);
  opts.exclusions = path.resolve(opts.exclusions);
  return opts;
}

function listBank(dir) {
  const names = readdirSync(dir);
  return new Set(names.filter((name) => name.endsWith('.json')).map((name) => name.slice(0, -'.json'.length)));
}

function readExclusions(file) {
  return new Set(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  );
}

const opts = parseArgs(process.argv.slice(2));

const env = JSON.parse(readFileSync(opts.profile, 'utf8'));
const prof = env && env.data ? env.data : env;
if (!prof || typeof prof.words !== 'object' || prof.words === null || Object.keys(prof.words).length === 0) {
  fail('TOPUP FAILED: no words map', 2);
}

const allowed = new Set(JSON.parse(readFileSync(opts.manifest, 'utf8')));
const exclusions = readExclusions(opts.exclusions);
const bank = listBank(opts.dir);

const known = [];
const candidate = [];
for (const [word, info] of Object.entries(prof.words)) {
  if (!info || typeof info !== 'object') continue;
  if (info.status === 'known') known.push(word);
  else if (info.status === 'candidate') candidate.push(word);
}
const pool = [...known, ...candidate];

// Filters, in order: QZ-8 exclusion first, then the manifest -- by DIRECT
// membership only (QZ-1 rule 12: "answer must itself be a manifest word --
// allowed.has(answer), checked directly and not via any transform"). Never
// resolveLemma. Then the bank.
const dropLines = [];
const needLines = [];
let covered = 0;
for (const word of pool) {
  if (exclusions.has(word)) {
    dropLines.push(`DROP ${word} excluded-qz8`);
    continue;
  }
  if (!allowed.has(word)) {
    dropLines.push(`DROP ${word} off-manifest`);
    continue;
  }
  if (bank.has(word)) {
    covered++;
    continue;
  }
  needLines.push(`NEED ${word}`);
}

// BANNED is independent of the pool: it reports any bank file that exists for
// an excluded word at all, so a bank that quietly grew an item for a QZ-8 word
// (through some other path than this script) is caught even if that word is
// not currently known or candidate.
const bannedLines = [];
for (const word of exclusions) {
  if (bank.has(word)) bannedLines.push(`BANNED ${word}`);
}

const K = known.length;
const C = candidate.length;
const P = pool.length;
const D = dropLines.length;
const V = covered;
const M = needLines.length;
const B = bannedLines.length;

console.log(`TOPUP known=${K} candidate=${C} pool=${P} dropped=${D} covered=${V} missing=${M} banned=${B}`);
for (const line of dropLines.sort()) console.log(line);
for (const line of needLines.sort()) console.log(line);
for (const line of bannedLines.sort()) console.log(line);

if (B === 0) {
  process.exit(0);
} else {
  console.log(`TOPUP FAILED: ${B} banned file(s)`);
  process.exit(1);
}
