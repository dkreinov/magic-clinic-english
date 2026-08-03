import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { QUIZ_STRINGS } from '../public/quiz-strings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const designPath = path.join(root, '.oplan', 'word-write', 'design.md');

const EXPECT_MD5 = 'ad6885fa6c4cc47751051b8f3fb9c9ea';
const EXPECT_LEN = 225;
const EXPECTED_KEYS = [
  'he_pick_prompt',
  'he_type_prompt',
  'listen_type_prompt',
  'near_miss',
  'check_button',
];

// The design file is the ORACLE. Re-parse its hebrew-strings block here, at
// test time, rather than re-typing any expected value -- so there is no
// literal anywhere in this file that could drift from the source.
function parseDesignBlock() {
  const src = readFileSync(designPath, 'utf8');
  const m = src.match(/```hebrew-strings\r?\n([\s\S]*?)```/);
  assert.ok(m, 'hebrew-strings fenced block must exist in design.md');
  const bodyText = m[1];
  const bodyBuf = Buffer.from(bodyText, 'utf8');
  const lines = bodyText.split(/\r?\n/).filter((l) => l.length > 0);
  const values = {};
  for (const line of lines) {
    const eq = line.indexOf('=');
    const key = line.slice(0, eq);
    const value = line.slice(eq + 1);
    values[key] = value;
  }
  return { bodyBuf, values };
}

const { bodyBuf: oracleBodyBuf, values: oracleValues } = parseDesignBlock();

test('all five keys exist on QUIZ_STRINGS and each value is non-empty after trim', () => {
  for (const key of EXPECTED_KEYS) {
    assert.ok(Object.prototype.hasOwnProperty.call(QUIZ_STRINGS, key), `missing key ${key}`);
    assert.equal(typeof QUIZ_STRINGS[key], 'string', `${key} must be a string`);
    assert.ok(QUIZ_STRINGS[key].trim().length > 0, `${key} must be non-empty after trim`);
  }
});

test('byte-identity: each QUIZ_STRINGS value matches the design.md block value exactly', () => {
  for (const key of EXPECTED_KEYS) {
    const got = Buffer.from(QUIZ_STRINGS[key], 'utf8');
    const want = Buffer.from(oracleValues[key], 'utf8');
    assert.equal(
      Buffer.compare(got, want),
      0,
      `key "${key}": QUIZ_STRINGS value is not byte-identical to design.md`
    );
  }
});

test('the design.md hebrew-strings block digest and byte length are unchanged', () => {
  const md5 = createHash('md5').update(oracleBodyBuf).digest('hex');
  assert.equal(md5, EXPECT_MD5);
  assert.equal(oracleBodyBuf.length, EXPECT_LEN);
});

test('every character of every QUIZ_STRINGS value has an allowed code point (Hebrew block, space, ! or ?)', () => {
  for (const key of EXPECTED_KEYS) {
    const value = QUIZ_STRINGS[key];
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      const allowed =
        (code >= 1424 && code <= 1535) || code === 32 || code === 33 || code === 63;
      assert.ok(
        allowed,
        `key "${key}" index ${i}: code point ${code} is not in the permitted set`
      );
    }
  }
});

test('public/quiz-strings.js contains zero bytes with a value of 128 or greater', () => {
  const bytes = readFileSync(path.join(root, 'public', 'quiz-strings.js'));
  let nonAscii = 0;
  for (const b of bytes) {
    if (b >= 128) nonAscii++;
  }
  assert.equal(nonAscii, 0);
});

test('QUIZ_STRINGS is frozen', () => {
  assert.equal(Object.isFrozen(QUIZ_STRINGS), true);
});
