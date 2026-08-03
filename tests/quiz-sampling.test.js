import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sampleRanked } from '../public/quiz-core.js';

// A small seeded linear congruential generator so the tests are reproducible.
// NEVER use Math.random in these assertions (lesson 2 / WK-5 control).
function makeLcg(seed) {
  let state = seed >>> 0;
  return function rand() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeRanked(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push('w' + i);
  return out;
}

// --- membership preserved ---------------------------------------------------

test('sampleRanked: sorted output equals sorted input for a 20-element input', () => {
  const ranked = makeRanked(20);
  const out = sampleRanked(ranked, 4, makeLcg(12345));
  assert.equal(out.length, ranked.length);
  assert.deepEqual([...out].sort(), [...ranked].sort());
});

// --- input not mutated -------------------------------------------------------

test('sampleRanked: does not mutate its input array', () => {
  const ranked = makeRanked(20);
  const before = ranked.slice();
  sampleRanked(ranked, 4, makeLcg(999));
  assert.deepEqual(ranked, before);
});

// --- top-8 draw ---------------------------------------------------------------

test('sampleRanked: with a seeded rand, first 4 outputs are all from the input top 8', () => {
  const ranked = makeRanked(20);
  const top8 = new Set(ranked.slice(0, 8));
  const out = sampleRanked(ranked, 4, makeLcg(42));
  for (let i = 0; i < 4; i++) {
    assert.ok(top8.has(out[i]), `output[${i}]=${out[i]} should be in top 8`);
  }
});

// --- THE POINT OF THE STEP: rank #1 sometimes and not always in the first 4 -

test('sampleRanked: over a sweep of seeds, rank #1 appears among first 4 sometimes and not always', () => {
  const ranked = makeRanked(20);
  const rank1 = ranked[0];
  let appeared = false;
  let missing = false;
  let rank1InFirstFourCount = 0;
  const seedCount = 500;
  let observedCount = 0;
  for (let seed = 1; seed <= seedCount; seed++) {
    observedCount++;
    const out = sampleRanked(ranked, 4, makeLcg(seed));
    const first4 = out.slice(0, 4);
    if (first4.includes(rank1)) {
      appeared = true;
      rank1InFirstFourCount++;
    } else {
      missing = true;
    }
  }
  console.log(`OBSERVED_SEEDS=${observedCount}`);
  assert.ok(appeared, 'rank #1 should appear among the first 4 in at least one seed');
  assert.ok(missing, 'rank #1 should be ABSENT from the first 4 in at least one seed');
  const rate = rank1InFirstFourCount / seedCount;
  assert.ok(rate > 0.35 && rate < 0.65, `rank #1 rate among first 4 should be 35-65%, got ${(rate * 100).toFixed(1)}%`);
});

// --- tail untouched -----------------------------------------------------------

test('sampleRanked: with 20 entries, output indexes 8..19 match input indexes 8..19', () => {
  const ranked = makeRanked(20);
  const out = sampleRanked(ranked, 4, makeLcg(7));
  assert.deepEqual(out.slice(8), ranked.slice(8));
});

// --- short input ----------------------------------------------------------------

test('sampleRanked: length < 8 still returns a full permutation with membership preserved', () => {
  const ranked = makeRanked(5);
  const out = sampleRanked(ranked, 4, makeLcg(3));
  assert.equal(out.length, 5);
  assert.deepEqual([...out].sort(), [...ranked].sort());
});

// --- edge cases -------------------------------------------------------------

test('sampleRanked: empty array returns []', () => {
  assert.deepEqual(sampleRanked([], 4, makeLcg(1)), []);
});

test('sampleRanked: non-array inputs (null, undefined, string, number) return []', () => {
  assert.deepEqual(sampleRanked(null, 4, makeLcg(1)), []);
  assert.deepEqual(sampleRanked(undefined, 4, makeLcg(1)), []);
  assert.deepEqual(sampleRanked('hello', 4, makeLcg(1)), []);
  assert.deepEqual(sampleRanked(42, 4, makeLcg(1)), []);
});
