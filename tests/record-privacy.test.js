// The pre-push record-privacy tripwire (scripts/check-record-privacy.mjs).
//
// POISON CONTROLS, in this project's own tradition: a checker that cannot catch
// PLANTED leaks has not earned the right to bless a real push. Every poison below
// is modelled on an ACTUAL line from the 2026-08-03 incident, rewritten with
// invented words -- none of the learner's vocabulary appears in this file, which
// is itself published.
//
// The false-positive control matters just as much: a hook that cries wolf on the
// real record gets switched off, and then it protects nothing at all. That is not
// hypothetical here -- the FIRST version of this scanner flagged a legitimate
// 37-word exclusions list and seven planning documents, and was rewritten.

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { scanText } from '../scripts/check-record-privacy.mjs';

const hit = (text, p = '.oplan/poison.md') => scanText(p, text, null);

// ---------------------------------------------------------------------------
// POISON: each of these MUST be caught.
// ---------------------------------------------------------------------------

test('POISON 1 -- a sentence claiming the words are hers', () => {
  const t = 'MEASURED today: her 9 `known` words are `plinth` `garble` `wisp` `korrel` `thatch`';
  assert.ok(hit(t).length, 'a sentence naming her words must trip the wire');
});

test('POISON 2 -- a top-up list', () => {
  const t = '6.3 top-up list: 9 words (plinth garble wisp korrel thatch quill drell fen mote),';
  assert.ok(hit(t).length, 'a top-up list must trip the wire');
});

test('POISON 3 -- a per-word SCORE table (her performance, worse than the words)', () => {
  const t = 'hardest: plinth 0/3 · garble 0/3 · wisp 1/3';
  const f = hit(t);
  assert.ok(f.length, 'a per-word score table must trip the wire');
  assert.strictEqual(f[0].shape, 'SCORES');
});

test('POISON 4 -- a BARE LIST file, the shape a cluster test cannot see', () => {
  // This is the one that got through on 2026-08-03: one word per line means no
  // line ever holds three words, so a cluster test calls the most direct leak clean.
  const t = ['plinth', 'garble', 'wisp', 'korrel', 'thatch', 'quill', 'drell'].join('\n');
  const f = hit(t, '.oplan/word-quiz/topup-9-words.txt');
  assert.ok(f.length, 'a bare word list must trip the wire');
  assert.strictEqual(f[0].shape, 'LIST');
});

test('POISON 5 -- the exact-word pass, when a real capture IS supplied', () => {
  const t = 'the pool was plinth, garble, wisp and then some ordinary prose about the bank';
  assert.strictEqual(hit(t).length, 0, 'without a word list this line is unremarkable');
  const f = scanText('.oplan/x.md', t, ['plinth', 'garble', 'wisp']);
  assert.ok(f.some((x) => x.shape === 'EXACT'), 'with a capture supplied it must be caught');
});

// ---------------------------------------------------------------------------
// FALSE-POSITIVE CONTROLS: these must NOT be caught.
// ---------------------------------------------------------------------------

test('CONTROL -- ordinary story text is not a disclosure', () => {
  const t = 'const TEXT = "She walked into the garden before the sun came up. The grass was cold and wet."';
  assert.strictEqual(hit(t).length, 0, 'generated story prose must not trip the wire');
});

test('CONTROL -- discussing the word bank is allowed', () => {
  const t = 'the band-2 pool holds 2254 lemmas and the manifest holds 2266; they are not the same list';
  assert.strictEqual(hit(t).length, 0, 'bank discussion must not trip the wire');
});

test('CONTROL -- an already-redacted line stays quiet', () => {
  const t = 'her 9 known words are [REDACTED: her vocabulary -- D27/R-F3-5, counts only]';
  assert.strictEqual(hit(t).length, 0, 'a redacted line must not re-trip forever');
});

test('CONTROL -- THE WHOLE REAL RECORD passes, or the hook gets switched off', () => {
  const root = '.oplan';
  const files = [];
  (function walk(d) {
    for (const e of readdirSync(d)) {
      const p = path.join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(md|txt|mjs|js)$/.test(e)) files.push(p);
    }
  })(root);
  assert.ok(files.length > 20, 'expected a substantial record to test against');
  const flagged = [];
  for (const f of files) {
    const found = scanText(f, readFileSync(f, 'utf8'), null);
    if (found.length) flagged.push(f + ' :: ' + found[0].shape + ' ' + found[0].detail);
  }
  assert.deepStrictEqual(flagged, [],
    'the real record must pass cleanly -- a noisy hook is a disabled hook');
});

// ---------------------------------------------------------------------------
// The control is only real if it is actually INSTALLED.
// ---------------------------------------------------------------------------

test('the pre-push hook is installed via version-controlled core.hooksPath', () => {
  const configured = execFileSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8' }).trim();
  assert.strictEqual(configured, 'scripts/hooks',
    'core.hooksPath must point at the tracked hooks dir, or the control does not run');
  const hook = readFileSync(new URL('../scripts/hooks/pre-push', import.meta.url), 'utf8');
  assert.ok(/check-record-privacy\.mjs/.test(hook), 'the hook must invoke the scanner');
  assert.ok(/remote_sha\.\.\$local_sha|remote_sha"\.\."\$local_sha/.test(hook.replace(/\s+/g, ' ')) ||
            /\$remote_sha\.\.\$local_sha/.test(hook),
    'the hook must check the range being PUBLISHED, not the working tree');
});
