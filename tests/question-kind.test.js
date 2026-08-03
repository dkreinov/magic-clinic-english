import { test } from 'node:test';
import assert from 'node:assert/strict';

import { QUESTION_KINDS, chooseKind } from '../public/quiz-core.js';

const ALL_TRUE = { clozePick: true, hePick: true, heType: true, listenType: true };
const ALL_FALSE = { clozePick: false, hePick: false, heType: false, listenType: false };

// --- QUESTION_KINDS export ---------------------------------------------------

test('QUESTION_KINDS is the exact four-element array, in order', () => {
  assert.deepEqual(QUESTION_KINDS, ['cloze-pick', 'he-pick', 'he-type', 'listen-type']);
});

// --- rotation property, asserted as a SET (lesson 15 / design criterion) ----

test('chooseKind: positions 0,1,2,3 with all flags true yield each kind exactly once', () => {
  const results = [0, 1, 2, 3].map((p) => chooseKind(p, ALL_TRUE));
  const asSet = new Set(results);
  assert.equal(asSet.size, 4);
  assert.deepEqual(asSet, new Set(['cloze-pick', 'he-pick', 'he-type', 'listen-type']));
});

test('chooseKind: positions 4,5,6,7 repeat the same cycle as 0,1,2,3', () => {
  const first = [0, 1, 2, 3].map((p) => chooseKind(p, ALL_TRUE));
  const second = [4, 5, 6, 7].map((p) => chooseKind(p, ALL_TRUE));
  assert.deepEqual(second, first);
});

// --- fallthrough, one case per kind ------------------------------------------

test('chooseKind: position 0 (cloze-pick) with clozePick false falls through to he-pick', () => {
  const avail = { ...ALL_TRUE, clozePick: false };
  assert.equal(chooseKind(0, avail), 'he-pick');
});

test('chooseKind: position 1 (he-pick) with hePick false falls through to he-type', () => {
  const avail = { ...ALL_TRUE, hePick: false };
  assert.equal(chooseKind(1, avail), 'he-type');
});

test('chooseKind: position 2 (he-type) with heType false falls through to listen-type', () => {
  const avail = { ...ALL_TRUE, heType: false };
  assert.equal(chooseKind(2, avail), 'listen-type');
});

test('chooseKind: position 3 (listen-type) with listenType false wraps to cloze-pick', () => {
  const avail = { ...ALL_TRUE, listenType: false };
  assert.equal(chooseKind(3, avail), 'cloze-pick');
});

// --- wraparound specifically --------------------------------------------------

test('chooseKind: position 3 with only clozePick true returns cloze-pick (wraparound)', () => {
  const avail = { clozePick: true, hePick: false, heType: false, listenType: false };
  assert.equal(chooseKind(3, avail), 'cloze-pick');
});

// --- all flags false -> null, every starting position -------------------------

test('chooseKind: all flags false returns null for every starting position', () => {
  for (const p of [0, 1, 2, 3]) {
    assert.equal(chooseKind(p, ALL_FALSE), null);
  }
});

// --- robust position ----------------------------------------------------------

test('chooseKind: negative position (-1) returns a valid kind, not a throw', () => {
  const result = chooseKind(-1, ALL_TRUE);
  assert.ok(QUESTION_KINDS.includes(result));
});

test('chooseKind: non-integer position (1.5) returns a valid kind, not a throw', () => {
  const result = chooseKind(1.5, ALL_TRUE);
  assert.ok(QUESTION_KINDS.includes(result));
});

test('chooseKind: undefined position returns a valid kind, not a throw', () => {
  const result = chooseKind(undefined, ALL_TRUE);
  assert.ok(QUESTION_KINDS.includes(result));
});

test('chooseKind: null position returns a valid kind, not a throw', () => {
  const result = chooseKind(null, ALL_TRUE);
  assert.ok(QUESTION_KINDS.includes(result));
});

test('chooseKind: NaN position returns a valid kind, not a throw', () => {
  const result = chooseKind(NaN, ALL_TRUE);
  assert.ok(QUESTION_KINDS.includes(result));
});

test('chooseKind: a string position returns a valid kind, not a throw', () => {
  const result = chooseKind('foo', ALL_TRUE);
  assert.ok(QUESTION_KINDS.includes(result));
});
