import { test } from 'node:test';
import assert from 'node:assert/strict';

import { selectHeOptions } from '../public/quiz-core.js';

// A small seeded linear congruential generator so the tests are reproducible.
// NEVER use Math.random in these assertions (lesson 2).
function makeLcg(seed) {
  let state = seed >>> 0;
  return function rand() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Fixture Hebrew values, written ONLY as \u escapes (project rule -- Hebrew glyphs never
// pasted raw, never copied out of terminal output). These are nonsense syllables, not
// anyone's real vocabulary.
const VALUE_A = '\u05D0\u05D1\u05D2';
const VALUE_B = '\u05D3\u05D4\u05D5';
const VALUE_C = '\u05D6\u05D7\u05D8';

// --- basic success case, and the collision sweep --------------------------------

test('selectHeOptions: collision sweep -- alpha and bravo share VALUE_A, bravo never appears for alpha', () => {
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
    echo: { he: VALUE_B + 'x' },
    foxtrot: { he: VALUE_C + 'y' },
  };
  let violations = 0;
  let observedDraws = 0;
  for (let seed = 1; seed <= 200; seed++) {
    observedDraws++;
    const out = selectHeOptions('alpha', words, makeLcg(seed), 4);
    assert.ok(Array.isArray(out), `seed ${seed} should produce an array`);
    if (out.includes('bravo')) violations++;
  }
  console.log(`OBSERVED_DRAWS=${observedDraws}`);
  assert.equal(violations, 0, `expected 0 violations, got ${violations}`);
});

test('selectHeOptions: the answer is present in every returned array across a seed sweep', () => {
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
    echo: { he: VALUE_B + 'x' },
    foxtrot: { he: VALUE_C + 'y' },
  };
  for (let seed = 1; seed <= 50; seed++) {
    const out = selectHeOptions('alpha', words, makeLcg(seed), 4);
    assert.ok(out.includes('alpha'), `seed ${seed} should include the answer`);
  }
});

// --- null-return rules -----------------------------------------------------------

test('selectHeOptions: returns null when the answer he is missing', () => {
  const words = {
    alpha: {},
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
  };
  assert.equal(selectHeOptions('alpha', words, makeLcg(1), 4), null);
});

test('selectHeOptions: returns null when the answer he is null', () => {
  const words = {
    alpha: { he: null },
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
  };
  assert.equal(selectHeOptions('alpha', words, makeLcg(1), 4), null);
});

test('selectHeOptions: returns null when the answer he is an empty string', () => {
  const words = {
    alpha: { he: '' },
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
  };
  assert.equal(selectHeOptions('alpha', words, makeLcg(1), 4), null);
});

test('selectHeOptions: returns null when the answer he is whitespace-only', () => {
  const words = {
    alpha: { he: '   ' },
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
  };
  assert.equal(selectHeOptions('alpha', words, makeLcg(1), 4), null);
});

test('selectHeOptions: returns null when answerLemma is not a key of words', () => {
  const words = {
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_B },
    delta: { he: VALUE_C },
  };
  assert.equal(selectHeOptions('ghost', words, makeLcg(1), 4), null);
});

test('selectHeOptions: returns null when too few candidates survive the he-equality exclusion', () => {
  // count=4 needs 3 survivors. alpha shares VALUE_A with bravo and charlie (excluded),
  // leaving only delta -- 1 survivor, below the required 3.
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_A },
    charlie: { he: VALUE_A },
    delta: { he: VALUE_C },
  };
  assert.equal(selectHeOptions('alpha', words, makeLcg(1), 4), null);
});

// --- shape assertions --------------------------------------------------------------

test('selectHeOptions: output length is exactly count', () => {
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_B },
    charlie: { he: VALUE_C },
    delta: { he: VALUE_B + 'z' },
    echo: { he: VALUE_C + 'z' },
  };
  const out = selectHeOptions('alpha', words, makeLcg(7), 4);
  assert.equal(out.length, 4);
});

test('selectHeOptions: no duplicates in the output', () => {
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_B },
    charlie: { he: VALUE_C },
    delta: { he: VALUE_B + 'z' },
    echo: { he: VALUE_C + 'z' },
  };
  const out = selectHeOptions('alpha', words, makeLcg(9), 4);
  assert.equal(new Set(out).size, out.length);
});

test('selectHeOptions: words is not mutated', () => {
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_B },
    charlie: { he: VALUE_C },
    delta: { he: VALUE_B + 'z' },
    echo: { he: VALUE_C + 'z' },
  };
  const before = JSON.parse(JSON.stringify(words));
  selectHeOptions('alpha', words, makeLcg(11), 4);
  assert.deepEqual(words, before);
});
