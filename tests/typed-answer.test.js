import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeTyped, isNearMiss, gradeTyped } from '../public/quiz-core.js';

// --- normalizeTyped -------------------------------------------------------

test('normalizeTyped trims both ends and lowercases', () => {
  assert.equal(normalizeTyped('  Light  '), 'light');
  assert.equal(normalizeTyped('LIGHT'), 'light');
  assert.equal(normalizeTyped('\t light\n'), 'light');
});

test('normalizeTyped accepts null, undefined and a number without throwing', () => {
  assert.equal(normalizeTyped(null), '');
  assert.equal(normalizeTyped(undefined), '');
  assert.equal(normalizeTyped(42), '42');
});

// --- exact match -> 'correct' ---------------------------------------------

test('gradeTyped: identical input is correct', () => {
  assert.equal(gradeTyped('light', 'light'), 'correct');
});

test('gradeTyped: different case is correct', () => {
  assert.equal(gradeTyped('LIGHT', 'light'), 'correct');
});

test('gradeTyped: leading and trailing whitespace is correct', () => {
  assert.equal(gradeTyped('  light  ', 'light'), 'correct');
});

test('gradeTyped: case AND whitespace combined is correct', () => {
  assert.equal(gradeTyped('  LiGHt  ', 'light'), 'correct');
});

// --- the named pair from the spec ------------------------------------------

test("isNearMiss('lgiht','light') === true (adjacent transposition)", () => {
  assert.equal(isNearMiss('lgiht', 'light'), true);
});

// --- near-miss fixtures: one sub, one insertion, one deletion --------------
// Each pair below is hand-verified to be Damerau-Levenshtein (OSA) distance 1.
const nearMissFixtures = [
  { typed: 'lgiht', answer: 'light', label: 'transposition' }, // g/i swapped, adjacent
  { typed: 'apply', answer: 'apple', label: 'substitution' }, // y vs e, one substitution
  { typed: 'appple', answer: 'apple', label: 'insertion' }, // one extra p
  { typed: 'aple', answer: 'apple', label: 'deletion' }, // one missing p
];

for (const { typed, answer, label } of nearMissFixtures) {
  test(`gradeTyped: ${label} (${typed} vs ${answer}) is near-miss`, () => {
    assert.equal(gradeTyped(typed, answer), 'near-miss');
  });
}

// --- distance 2 must NOT be a near-miss ------------------------------------

test('gradeTyped: two substitutions (distance 2) is wrong, not near-miss', () => {
  // cat -> cop: a/o and t/p, two independent substitutions, no adjacent transposition.
  assert.equal(gradeTyped('cop', 'cat'), 'wrong');
  assert.equal(isNearMiss('cop', 'cat'), false);
});

// --- empty / whitespace-only typed input ------------------------------------

test('gradeTyped: empty typed string is wrong, never near-miss', () => {
  assert.equal(gradeTyped('', 'light'), 'wrong');
  assert.equal(isNearMiss('', 'light'), false);
});

test('gradeTyped: whitespace-only typed string is wrong, never near-miss', () => {
  assert.equal(gradeTyped('   ', 'light'), 'wrong');
  assert.equal(isNearMiss('   ', 'light'), false);
});

// --- equal strings are never a near-miss ------------------------------------

test('isNearMiss(x, x) === false for every fixture answer', () => {
  assert.equal(isNearMiss('light', 'light'), false);
  assert.equal(isNearMiss('apple', 'apple'), false);
  assert.equal(isNearMiss('', ''), false);
});

// --- isRetry: true NEVER yields 'near-miss' ---------------------------------

for (const { typed, answer, label } of nearMissFixtures) {
  test(`gradeTyped: isRetry true forces wrong for the ${label} near-miss fixture`, () => {
    assert.equal(gradeTyped(typed, answer, { isRetry: true }), 'wrong');
  });
}

// --- symmetry: isNearMiss(a,b) === isNearMiss(b,a) --------------------------

const symmetryPairs = [
  ['lgiht', 'light'],
  ['apply', 'apple'],
  ['appple', 'apple'],
  ['aple', 'apple'],
  ['cop', 'cat'],
  ['light', 'light'],
  ['', 'light'],
  ['', ''],
];

for (const [x, y] of symmetryPairs) {
  test(`isNearMiss is symmetric for ('${x}', '${y}')`, () => {
    assert.equal(isNearMiss(x, y), isNearMiss(y, x));
  });
}
