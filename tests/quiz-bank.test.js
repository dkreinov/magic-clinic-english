import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'check-quiz-bank.mjs');

// Fixtures live in an OS temp dir, never in public/quiz/: a stray file there
// would dirty the very bank this gate measures, and tests/word-audio.test.js
// and tests/lemma.test.js assert exact file counts elsewhere in the tree.
// os.tmpdir() is read inside node on purpose -- Git Bash's /tmp is not node's,
// and handing node a /c/Users/... path yields C:\c\Users\...
function withBank(files, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'quiz-bank-'));
  try {
    for (const [name, items] of Object.entries(files)) {
      writeFileSync(path.join(dir, name), `${JSON.stringify(items, null, 2)}\n`);
    }
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const run = (...args) => spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });

// These three items are the ones tests/quiz-item.test.js already proves legal
// under every QZ-1 rule. They are reused verbatim rather than re-invented,
// because the allowed vocabulary is NOT ordinary English: "children", "after",
// "men", "women" and "feet" are all absent from the manifest and rule 4 rejects
// a sentence containing even one of them.
const FEEL_TOUCH = {
  lemma: 'feel',
  sense: 'to touch something with your hand',
  sentence: 'I ___ the soft cat with my hand.',
  answer: 'feel',
  distractors: ['jump', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'],
};

// The gloss is in HER vocabulary because rule 11 now holds it to the same
// standard as the sentence. This fixture used to read "to have an emotion", and
// "emotion" is not a manifest word.
const FEEL_EMOTION = {
  ...FEEL_TOUCH,
  sense: 'to be happy or sad inside',
  sentence: 'I ___ happy when my dog can play.',
};

const KIND = {
  lemma: 'kind',
  sense: 'nice to other people',
  sentence: 'The ___ girl gave the small dog some warm milk.',
  answer: 'kind',
  distractors: ['small', 'warm', 'big', 'old', 'little', 'red', 'soft', 'cat'],
};

// A two-item feel.json plus a one-item kind.json: 2 files, 3 items, and exactly
// one multi-sense file, which is what the MULTI-SENSE line must count.
const GOOD_BANK = { 'feel.json': [FEEL_TOUCH, FEEL_EMOTION], 'kind.json': [KIND] };

test('check-quiz-bank.mjs passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', scriptPath]);
  assert.equal(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('a legal fixture bank passes the gate and is counted', () => {
  const result = withBank(GOOD_BANK, (dir) => run('--dir', dir));
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stdout}${result.stderr}`);
  assert.ok(
    result.stdout.includes('QUIZ BANK OK: 2 files, 3 items'),
    `missing the OK line, got: ${result.stdout}`
  );
  assert.ok(
    result.stdout.includes('MULTI-SENSE: 1 files with >=2 items'),
    `missing the MULTI-SENSE line, got: ${result.stdout}`
  );
});

test('a broken item fails the gate and the output names the rule and the token', () => {
  // "men" is verified absent from the manifest, so this trips rule 4.
  const broken = { ...FEEL_TOUCH, sentence: 'I ___ the men with my hand.' };
  const result = withBank({ ...GOOD_BANK, 'feel.json': [broken] }, (dir) => run('--dir', dir));
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${result.stdout}`);
  assert.ok(
    result.stdout.includes('feel.json[0] rule 4:'),
    `a problem must name its file, item and rule, got: ${result.stdout}`
  );
  assert.ok(
    result.stdout.includes('men'),
    `rule 4 must name the offending token, got: ${result.stdout}`
  );
  assert.ok(result.stdout.includes('QUIZ BANK FAILED: '), `missing the FAILED line, got: ${result.stdout}`);
});

test('the REAL public/quiz/ bank gates green', () => {
  // Every other test in this suite builds a fixture bank in a temp dir, which
  // means the whole suite passed with 218 green tests while public/quiz/ was
  // MOVED ASIDE ENTIRELY. Nothing referenced the shipped bank, so "npm test is
  // green" said nothing whatsoever about the 71 items actually being shipped.
  //
  // This test is the one that fails when the bank is deleted or rots. Run with
  // no --dir, so it gates the real default directory. A missing directory is
  // treated as an empty one by design (the gate must be green before the
  // generator has ever run), so it would exit 0 reporting "0 files" -- which is
  // exactly why the file COUNT is asserted and not merely the exit code.
  const result = run();
  assert.equal(
    result.status,
    0,
    `the shipped bank must gate clean, got exit ${result.status}:\n${result.stdout}${result.stderr}`
  );
  assert.ok(
    !result.stdout.includes('QUIZ BANK FAILED'),
    `the shipped bank must have no hard problems, got:\n${result.stdout}`
  );

  const ok = /QUIZ BANK OK: (\d+) files, (\d+) items/.exec(result.stdout);
  assert.ok(ok, `missing the OK line, got:\n${result.stdout}`);
  // D23 reversed D8: the bank starts at the 50 pilot words and GROWS on demand,
  // so an exact count would go red on the first top-up. The property that matters
  // is unchanged -- the bank must never shrink, and a deleted public/quiz/ still
  // fails this test, which is the hole the audit found.
  assert.ok(Number(ok[1]) >= 50, `the shipped bank never shrinks below the 50 pilot files, got ${ok[1]}`);
  assert.ok(Number(ok[2]) >= Number(ok[1]), `every file must carry at least one item, got ${ok[2]} items in ${ok[1]} files`);

  // Rule 11 was briefly deferred to a warning while the 8 pre-D22 glosses were
  // rewritten. It is now armed, so this test carries the whole claim: the bank
  // she actually reads passes EVERY rule, including that every gloss D22 puts in
  // front of her is in her own vocabulary. This is the test the audit found
  // missing -- before it existed, `npm test` was green with public/quiz/ deleted.
  assert.ok(
    !/RULE-11 PENDING/.test(result.stdout),
    `rule 11 must be armed, not deferred, got:\n${result.stdout}`
  );
});

test('--sample is deterministic: two runs are byte-identical', () => {
  const [first, second] = withBank(GOOD_BANK, (dir) => [run('--dir', dir, '--sample', '2'), run('--dir', dir, '--sample', '2')]);
  assert.equal(first.status, 0, `expected exit 0, got ${first.status}: ${first.stderr}`);
  assert.equal(second.status, 0, `expected exit 0, got ${second.status}: ${second.stderr}`);
  assert.ok(first.stdout.length > 0, 'a sample of a non-empty bank must print something');
  assert.equal(second.stdout, first.stdout, 'two --sample runs must be byte-identical');
  // It samples ITEMS, not files: with 3 items and N=2 the stride lands on
  // feel.json[0] and feel.json[1], the second sense a per-file sampler hides.
  assert.ok(first.stdout.includes('feel.json[1]'), `sampling must walk items, got: ${first.stdout}`);
  assert.ok(!first.stdout.includes('QUIZ BANK'), `--sample must not run the gate, got: ${first.stdout}`);

  // ...and the sample must SPAN the bank, not stop short of its tail. A uniform
  // integer stride from 0 ends at (n-1)*floor(total/n): with 12 items and N=5 it
  // ran 0,2,4,6,8 and never reached ddd.json at all. At the real criterion-9
  // invocation that was worse -- 80 items sampled 50 showed only the
  // alphabetically-first 63%, so the owner would have reviewed a front-loaded
  // slice believing it was a sample of the whole bank.
  //
  // This fixture is deliberately NOT gate-legal: --sample does not validate, and
  // the index arithmetic under test is orthogonal to item validity.
  const spread = {};
  for (const name of ['aaa', 'bbb', 'ccc', 'ddd']) {
    spread[`${name}.json`] = [0, 1, 2].map((i) => ({
      lemma: name,
      sense: `sense ${i} of ${name}`,
      sentence: `The ___ is here ${i}.`,
      answer: name,
      distractors: ['jump', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'],
    }));
  }
  const wide = withBank(spread, (dir) => run('--dir', dir, '--sample', '5'));
  assert.equal(wide.status, 0, `expected exit 0, got ${wide.status}: ${wide.stderr}`);
  assert.ok(
    wide.stdout.includes('ddd.json'),
    `a sample must reach the last file in the bank, got: ${wide.stdout}`
  );
});
