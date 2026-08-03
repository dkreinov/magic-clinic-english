import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildQuestion } from '../public/quiz-core.js';

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
// anyone's real vocabulary. Code points, decimal: A=1488,1489,1490 B=1491,1492,1493
// C=1494,1495,1496 D=1497,1498,1499.
const VALUE_A = '\u05d0\u05d1\u05d2';
const VALUE_B = '\u05d3\u05d4\u05d5';
const VALUE_C = '\u05d6\u05d7\u05d8';
const VALUE_D = '\u05d9\u05da\u05db';

const VALID_ITEM = Object.freeze({
  sense: 'x',
  sentence: 'The ___ thing.',
  answer: 'alpha',
  distractors: ['bravo', 'charlie', 'delta', 'echo', 'foxtrot'],
});

// 6 non-alpha candidates with distinct he clusters -- enough for selectHeOptions(lemma, words, rand, 6).
const FULL_WORDS = Object.freeze({
  alpha: { he: VALUE_A },
  bravo: { he: VALUE_B },
  charlie: { he: VALUE_C },
  delta: { he: VALUE_D },
  echo: { he: VALUE_B + 'x' },
  foxtrot: { he: VALUE_C + 'y' },
  golf: { he: VALUE_D + 'z' },
});

// Only 2 non-alpha candidates -- below the 5 required for count=6 -- so hePick is false
// while heType (which only reads entry.he) is still true. This is assertion 4's whole point.
const SMALL_WORDS = Object.freeze({
  alpha: { he: VALUE_A },
  bravo: { he: VALUE_B },
  charlie: { he: VALUE_C },
});

// --- assertion 1: the four kinds, one each, over the same lemma ------------------------

test('buildQuestion: positions 0-3 over the same lemma yield the four kinds each exactly once', () => {
  const input = { item: VALID_ITEM, entry: { he: VALUE_A }, audioSet: new Set(['alpha']), words: FULL_WORDS };
  const kinds = [];
  for (let position = 0; position < 4; position++) {
    const q = buildQuestion(position, 'alpha', input, makeLcg(42 + position));
    assert.ok(q, `position ${position} should produce a question`);
    kinds.push(q.kind);
  }
  assert.equal(new Set(kinds).size, 4, `expected 4 distinct kinds, got ${kinds.join(',')}`);
  assert.deepEqual(
    new Set(kinds),
    new Set(['cloze-pick', 'he-pick', 'he-type', 'listen-type']),
    `expected the exact set of 4 kinds, got ${kinds.join(',')}`
  );
});

// --- assertion 2: item: null ------------------------------------------------------------

test('buildQuestion: item null means cloze-pick is never returned; position 0 falls through to he-pick', () => {
  const input = { item: null, entry: { he: VALUE_A }, audioSet: new Set(['alpha']), words: FULL_WORDS };
  const q0 = buildQuestion(0, 'alpha', input, makeLcg(1));
  assert.equal(q0.kind, 'he-pick');
  for (let position = 0; position < 4; position++) {
    const q = buildQuestion(position, 'alpha', input, makeLcg(position + 1));
    assert.notEqual(q.kind, 'cloze-pick', `position ${position} must never return cloze-pick when item is null`);
  }
});

// --- assertion 3: entry.he missing / null / empty / whitespace-only --------------------

test('buildQuestion: entry.he missing/null/empty/whitespace excludes he-pick and he-type', () => {
  const badEntries = [undefined, null, {}, { he: null }, { he: '' }, { he: '   ' }];
  for (const entry of badEntries) {
    const input = { item: VALID_ITEM, entry, audioSet: new Set(['alpha']), words: FULL_WORDS };
    for (let position = 0; position < 4; position++) {
      const q = buildQuestion(position, 'alpha', input, makeLcg(position + 1));
      assert.ok(q, `position ${position} with entry ${JSON.stringify(entry)} should still produce a question`);
      assert.notEqual(q.kind, 'he-pick', `entry ${JSON.stringify(entry)} must never yield he-pick`);
      assert.notEqual(q.kind, 'he-type', `entry ${JSON.stringify(entry)} must never yield he-type`);
    }
  }
});

// --- assertion 4: hePick and heType differ ----------------------------------------------

test('buildQuestion: too few candidates for 6 he-pick options still leaves he-type available', () => {
  const input = { item: null, entry: { he: VALUE_A }, audioSet: null, words: SMALL_WORDS };
  const q = buildQuestion(1, 'alpha', input, makeLcg(5));
  assert.equal(q.kind, 'he-type');
});

// --- assertion 5: the de-inflection seam, by name ---------------------------------------

test('buildQuestion: listen-type goes through resolveLemma -- softly speaks as soft', () => {
  const input = { item: null, entry: undefined, audioSet: new Set(['soft']), words: {} };
  const q = buildQuestion(0, 'softly', input, makeLcg(3));
  assert.ok(q);
  assert.equal(q.kind, 'listen-type');
  assert.equal(q.sayLemma, 'soft');
});

// --- assertion 6: audioSet null or empty --------------------------------------------------

test('buildQuestion: audioSet null or empty never yields listen-type', () => {
  const bases = [null, new Set()];
  for (const audioSet of bases) {
    const input = { item: VALID_ITEM, entry: { he: VALUE_A }, audioSet, words: FULL_WORDS };
    for (let position = 0; position < 4; position++) {
      const q = buildQuestion(position, 'alpha', input, makeLcg(position + 1));
      assert.ok(q);
      assert.notEqual(q.kind, 'listen-type');
    }
  }
});

// --- assertion 7: all four unavailable ----------------------------------------------------

test('buildQuestion: all four kinds unavailable returns null', () => {
  const input = { item: null, entry: undefined, audioSet: null, words: {} };
  for (let position = 0; position < 4; position++) {
    const q = buildQuestion(position, 'alpha', input, makeLcg(position + 1));
    assert.equal(q, null, `position ${position} should return null`);
  }
});

// --- assertion 8: promptHe is never blank --------------------------------------------------

test('buildQuestion: promptHe is never empty or whitespace on he-pick/he-type', () => {
  const input = { item: VALID_ITEM, entry: { he: VALUE_A }, audioSet: new Set(['alpha']), words: FULL_WORDS };
  for (let position = 0; position < 4; position++) {
    const q = buildQuestion(position, 'alpha', input, makeLcg(position + 100));
    if (q.kind === 'he-pick' || q.kind === 'he-type') {
      assert.equal(typeof q.promptHe, 'string');
      assert.notEqual(q.promptHe.trim(), '');
    }
  }
});

// --- assertion 9: he-pick options shape ------------------------------------------------

test('buildQuestion: he-pick options contain the lemma, length exactly 6, no duplicates', () => {
  const input = { item: null, entry: { he: VALUE_A }, audioSet: null, words: FULL_WORDS };
  const q = buildQuestion(0, 'alpha', input, makeLcg(9));
  assert.equal(q.kind, 'he-pick');
  assert.ok(Array.isArray(q.options));
  assert.ok(q.options.includes('alpha'));
  assert.equal(q.options.length, 6);
  assert.equal(new Set(q.options).size, 6);
});

// --- assertion 10: cloze-pick shape ------------------------------------------------------

test('buildQuestion: cloze-pick returns options null and answer === item.answer', () => {
  const input = { item: VALID_ITEM, entry: { he: VALUE_A }, audioSet: new Set(['alpha']), words: FULL_WORDS };
  const q = buildQuestion(0, 'alpha', input, makeLcg(11));
  assert.equal(q.kind, 'cloze-pick');
  assert.equal(q.options, null);
  assert.equal(q.answer, VALID_ITEM.answer);
});

// --- assertion 11: inputs never mutated ------------------------------------------------

test('buildQuestion: words, item and entry are never mutated', () => {
  const item = { sense: 'x', sentence: 'The ___ thing.', answer: 'alpha', distractors: ['bravo', 'charlie', 'delta', 'echo', 'foxtrot'] };
  const entry = { he: VALUE_A };
  const words = {
    alpha: { he: VALUE_A },
    bravo: { he: VALUE_B },
    charlie: { he: VALUE_C },
    delta: { he: VALUE_D },
    echo: { he: VALUE_B + 'x' },
    foxtrot: { he: VALUE_C + 'y' },
    golf: { he: VALUE_D + 'z' },
  };
  const audioSet = new Set(['alpha']);

  const wordsBefore = JSON.parse(JSON.stringify(words));
  const itemBefore = JSON.parse(JSON.stringify(item));
  const entryBefore = JSON.parse(JSON.stringify(entry));

  for (let position = 0; position < 4; position++) {
    buildQuestion(position, 'alpha', { item, entry, audioSet, words }, makeLcg(position + 20));
  }

  assert.deepEqual(words, wordsBefore);
  assert.deepEqual(item, itemBefore);
  assert.deepEqual(entry, entryBefore);
});

// --- assertion 12: no network reachable --------------------------------------------------

test('buildQuestion: works with no network reachable', () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('network reached during buildQuestion -- this must never happen');
  };
  try {
    const input = { item: VALID_ITEM, entry: { he: VALUE_A }, audioSet: new Set(['alpha']), words: FULL_WORDS };
    for (let position = 0; position < 4; position++) {
      const q = buildQuestion(position, 'alpha', input, makeLcg(position + 30));
      assert.ok(q);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// --- assertion 13: rotation sweep, real counter -------------------------------------------

test('buildQuestion: rotation sweep -- returned kind always one the fixture actually supports', () => {
  let observed = 0;
  for (let variant = 1; variant <= 2; variant++) {
    for (let mask = 0; mask < 16; mask++) {
      const cloze = (mask & 1) !== 0;
      const heAvail = (mask & 2) !== 0;
      const enough = (mask & 4) !== 0;
      const listen = (mask & 8) !== 0;

      const fixture = {
        item: cloze ? VALID_ITEM : null,
        entry: heAvail ? { he: VALUE_A } : undefined,
        words: heAvail ? (enough ? FULL_WORDS : SMALL_WORDS) : {},
        audioSet: listen ? new Set(['alpha']) : null,
      };

      const allowed = [];
      if (cloze) allowed.push('cloze-pick');
      if (heAvail && enough) allowed.push('he-pick');
      if (heAvail) allowed.push('he-type');
      if (listen) allowed.push('listen-type');

      for (let position = 0; position < 4; position++) {
        observed++;
        const q = buildQuestion(position, 'alpha', fixture, makeLcg(variant * 1000 + mask * 10 + position));
        if (allowed.length === 0) {
          assert.equal(q, null, `mask ${mask} position ${position} should be null (no kind supported)`);
        } else {
          assert.ok(q, `mask ${mask} position ${position} should produce a question`);
          assert.ok(
            allowed.includes(q.kind),
            `mask ${mask} position ${position} returned ${q.kind}, not in supported [${allowed.join(',')}]`
          );
        }
      }
    }
  }
  console.log(`OBSERVED_ROTATIONS=${observed}`);
  assert.ok(observed >= 100, `expected >=100 observed combinations, got ${observed}`);
});
