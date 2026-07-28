import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'quiz-topup.mjs');

// Fixtures live in an OS temp dir, never in public/quiz/: a stray file there
// would dirty the very bank the real script reads by default, and other
// suites assert exact file counts elsewhere in the tree. os.tmpdir() is read
// inside node on purpose -- Git Bash's /tmp is not node's, and handing node a
// /c/Users/... path yields C:\c\Users\... (the house pattern, from
// tests/quiz-bank.test.js).
function withFixture({ profile, manifest, exclusions = [], bank = [] }, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'quiz-topup-'));
  try {
    const profilePath = path.join(dir, 'profile.json');
    writeFileSync(profilePath, JSON.stringify(profile));
    const manifestPath = path.join(dir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest));
    const exclusionsPath = path.join(dir, 'exclusions.txt');
    writeFileSync(exclusionsPath, exclusions.map((w) => `${w}\n`).join(''));
    const bankDir = path.join(dir, 'bank');
    mkdirSync(bankDir);
    for (const name of bank) writeFileSync(path.join(bankDir, `${name}.json`), '[]\n');
    return fn({ profilePath, manifestPath, exclusionsPath, bankDir });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const run = (f) =>
  spawnSync(
    process.execPath,
    [scriptPath, '--profile', f.profilePath, '--dir', f.bankDir, '--manifest', f.manifestPath, '--exclusions', f.exclusionsPath],
    { encoding: 'utf8' }
  );

const lines = (out) => out.split(/\r?\n/);

test('the pool is known union candidate: a candidate with no item is NEED, a learning word is not', () => {
  const result = withFixture(
    {
      profile: { words: { apple: { status: 'known' }, banana: { status: 'candidate' }, cherry: { status: 'learning' } } },
      manifest: ['apple', 'banana', 'cherry'],
    },
    run
  );
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stdout}${result.stderr}`);
  assert.ok(
    result.stdout.includes('TOPUP known=1 candidate=1 pool=2 dropped=0 covered=0 missing=2 banned=0'),
    `header wrong, got: ${result.stdout}`
  );
  assert.ok(lines(result.stdout).includes('NEED apple'), `known member must be NEED, got: ${result.stdout}`);
  assert.ok(lines(result.stdout).includes('NEED banana'), `candidate member must be NEED, got: ${result.stdout}`);
  assert.ok(!result.stdout.includes('cherry'), `learning word must not appear at all, got: ${result.stdout}`);
});

test('a covered word is not NEED: missing=0 and exit 0 on a fully covered profile', () => {
  const result = withFixture(
    {
      profile: { words: { apple: { status: 'known' }, banana: { status: 'candidate' } } },
      manifest: ['apple', 'banana'],
      bank: ['apple', 'banana'],
    },
    run
  );
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stdout}${result.stderr}`);
  assert.ok(
    result.stdout.includes('TOPUP known=1 candidate=1 pool=2 dropped=0 covered=2 missing=0 banned=0'),
    `header wrong, got: ${result.stdout}`
  );
  assert.ok(!/^NEED /m.test(result.stdout), `a fully covered profile must have no NEED lines, got: ${result.stdout}`);
});

test('a QZ-8 excluded word is dropped with reason excluded-qz8 and never appears as NEED', () => {
  const result = withFixture(
    {
      profile: { words: { badword: { status: 'known' }, apple: { status: 'candidate' } } },
      manifest: ['badword', 'apple'],
      exclusions: ['badword'],
    },
    run
  );
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stdout}${result.stderr}`);
  assert.ok(
    lines(result.stdout).includes('DROP badword excluded-qz8'),
    `excluded word must be DROP excluded-qz8, got: ${result.stdout}`
  );
  assert.ok(!result.stdout.includes('NEED badword'), `excluded word must never be NEED, got: ${result.stdout}`);
  assert.ok(lines(result.stdout).includes('NEED apple'), `the other pool word must still be NEED, got: ${result.stdout}`);
  assert.ok(
    result.stdout.includes('TOPUP known=1 candidate=1 pool=2 dropped=1 covered=0 missing=1 banned=0'),
    `header wrong, got: ${result.stdout}`
  );
});

test('an existing bank file for a QZ-8 word is BANNED and the script exits 1', () => {
  const result = withFixture(
    {
      profile: { words: { badword: { status: 'known' } } },
      manifest: ['badword'],
      exclusions: ['badword'],
      bank: ['badword'],
    },
    run
  );
  assert.equal(result.status, 1, `a banned bank file must exit 1, got ${result.status}: ${result.stdout}${result.stderr}`);
  assert.ok(lines(result.stdout).includes('BANNED badword'), `must report BANNED badword, got: ${result.stdout}`);
  assert.ok(
    lines(result.stdout).includes('DROP badword excluded-qz8'),
    `an excluded word is still DROPped regardless of the bank, got: ${result.stdout}`
  );
  assert.ok(
    lines(result.stdout).includes('TOPUP FAILED: 1 banned file(s)'),
    `missing the FAILED line, got: ${result.stdout}`
  );
});

test('an off-manifest word is dropped with reason off-manifest and is not counted as missing', () => {
  const result = withFixture(
    {
      profile: { words: { ghost: { status: 'known' }, apple: { status: 'candidate' } } },
      manifest: ['apple'],
    },
    run
  );
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stdout}${result.stderr}`);
  assert.ok(
    lines(result.stdout).includes('DROP ghost off-manifest'),
    `an off-manifest word must be DROP off-manifest, got: ${result.stdout}`
  );
  assert.ok(!result.stdout.includes('NEED ghost'), `an off-manifest word must never count as missing, got: ${result.stdout}`);
  assert.ok(
    result.stdout.includes('TOPUP known=1 candidate=1 pool=2 dropped=1 covered=0 missing=1 banned=0'),
    `header wrong (off-manifest word must not inflate missing), got: ${result.stdout}`
  );
});
