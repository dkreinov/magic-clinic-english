import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  newSessionId,
  knownSetFromProfile,
  selectOptions,
  isUsableItem,
  pickItem,
  pickQuizWords,
  pickCandidateWords,
} from '../public/quiz-core.js';
import { knownLemmaSet } from '../lib/vocab.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const lightItems = JSON.parse(readFileSync(path.join(root, 'public/quiz/light.json'), 'utf8'));

test('newSessionId: two calls differ, 100 calls are distinct, and every one matches the frozen shape', () => {
  const a = newSessionId();
  const b = newSessionId();
  assert.notEqual(a, b);

  const seen = new Set();
  for (let i = 0; i < 100; i++) {
    const id = newSessionId();
    assert.match(id, /^q-[0-9a-z]+-[0-9a-z]{1,8}$/);
    assert.ok(id.length <= 64, `expected <= 64 chars, got ${id.length}: ${id}`);
    seen.add(id);
  }
  assert.equal(seen.size, 100);
});

test('knownSetFromProfile agrees with lib/vocab.js knownLemmaSet on a fixture with known, learning and a non-object entry', () => {
  const profile = {
    words: {
      light: { status: 'known' },
      run: { status: 'learning' },
      bogus: 'not-an-object',
      happy: { status: 'known' },
    },
  };
  const a = Array.from(knownSetFromProfile(profile)).sort();
  const b = Array.from(knownLemmaSet(profile)).sort();
  assert.deepStrictEqual(a, b);
});

test('selectOptions: always 6 distinct strings, always contains the answer, every option from the item vocabulary (50 runs)', () => {
  const item = {
    answer: 'light',
    distractors: ['big', 'small', 'wide', 'round', 'old', 'new', 'tall', 'deep'],
  };
  const knownSet = new Set(['small', 'wide']);
  for (let i = 0; i < 50; i++) {
    const opts = selectOptions(item, knownSet);
    assert.equal(opts.length, 6);
    assert.equal(new Set(opts).size, 6);
    assert.ok(opts.includes(item.answer));
    for (const o of opts) {
      assert.ok(o === item.answer || item.distractors.includes(o), `unexpected option: ${o}`);
    }
  }
});

test('selectOptions prefers known distractors: full known, partial known, empty known', () => {
  const item = {
    answer: 'light',
    distractors: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  };
  const stub = () => 0;

  const known5 = new Set(['b', 'd', 'f', 'g', 'h']);
  const chosen5 = new Set(selectOptions(item, known5, stub).filter((o) => o !== item.answer));
  assert.deepStrictEqual(chosen5, known5);

  const known2 = new Set(['c', 'f']);
  const chosen2 = new Set(selectOptions(item, known2, stub).filter((o) => o !== item.answer));
  // remainder in item order excluding {c,f}: a,b,d,e,g,h -> first 3: a,b,d
  assert.deepStrictEqual(chosen2, new Set(['c', 'f', 'a', 'b', 'd']));

  const empty = new Set();
  const chosenEmpty = new Set(selectOptions(item, empty, stub).filter((o) => o !== item.answer));
  assert.deepStrictEqual(chosenEmpty, new Set(['a', 'b', 'c', 'd', 'e']));
});

test('selectOptions really shuffles and is deterministic under a stub rand, on public/quiz/light.json[1]', () => {
  const item = lightItems[1];
  const stub = () => 0;
  const opts1 = selectOptions(item, new Set(), stub);
  const opts2 = selectOptions(item, new Set(), stub);
  assert.deepStrictEqual(opts1, ['radio', 'television', 'oven', 'fan', 'camera', 'light']);
  assert.deepStrictEqual(opts2, opts1);
});

test('pickQuizWords: known-only, honours limit, and orders a 7-word fixture by all six comparator clauses in turn', () => {
  const profile = {
    words: {
      w1_strikes: { status: 'known', strikes: 10 },
      w2_review: { status: 'known', strikes: 1, needsReview: true },
      w3_never_recent: { status: 'known', strikes: 1, needsReview: false, lastSeen: '2024-01-10' },
      w4_never_older: { status: 'known', strikes: 1, needsReview: false, lastSeen: '2024-01-01' },
      w5_quizzed_older: { status: 'known', strikes: 1, needsReview: false, lastQuizAt: '2023-01-01' },
      w6_quizzed_a: { status: 'known', strikes: 1, needsReview: false, lastQuizAt: '2023-06-01' },
      w7_quizzed_b: { status: 'known', strikes: 1, needsReview: false, lastQuizAt: '2023-06-01' },
      zz_learning: { status: 'learning', strikes: 999 },
    },
  };

  const expected = [
    'w1_strikes',
    'w2_review',
    'w3_never_recent',
    'w4_never_older',
    'w5_quizzed_older',
    'w6_quizzed_a',
    'w7_quizzed_b',
  ];

  const full = pickQuizWords(profile, 20);
  assert.deepStrictEqual(full, expected);
  assert.ok(!full.includes('zz_learning'), 'a learning word must never be returned');

  const limited = pickQuizWords(profile, 3);
  assert.deepStrictEqual(limited, expected.slice(0, 3));
});

test('isUsableItem rejects malformed shapes and accepts a real item; pickItem respects it and a stubbed rand', () => {
  const good = {
    sense: 'ok',
    sentence: 'The ___ is here.',
    answer: 'x',
    distractors: ['a', 'b', 'c', 'd', 'e'],
  };
  assert.equal(isUsableItem(null), false);
  assert.equal(isUsableItem('not-an-object'), false);
  assert.equal(isUsableItem({ ...good, sense: '   ' }), false);
  assert.equal(isUsableItem({ ...good, sentence: 'no blank here' }), false);
  assert.equal(isUsableItem({ ...good, answer: undefined }), false);
  assert.equal(isUsableItem({ ...good, distractors: ['a', 'b', 'c', 'd'] }), false);
  assert.equal(isUsableItem({ ...good, distractors: ['a', 'b', 'c', 'd', 5] }), false);
  assert.equal(isUsableItem(lightItems[0]), true);

  assert.equal(pickItem([]), null);
  assert.equal(pickItem([{ ...good, sense: '' }, { ...good, answer: '' }]), null);

  const stub = () => 0.999;
  const picked = pickItem(lightItems, stub);
  assert.equal(picked, lightItems[Math.floor(0.999 * lightItems.length)]);
});

test('pickCandidateWords: candidates only, at most limit, ranked by the frozen comparator, and the profile is never mutated', () => {
  const e = (over) => ({
    status: 'candidate',
    source: 'tap',
    he: null,
    taps: 1,
    firstSeen: '2026-01-01T00:00:00.000Z',
    lastSeen: '2026-01-01T00:00:00.000Z',
    ...over,
  });
  const profile = {
    words: {
      aaa: e({ strikes: 2, lastSeen: '2026-01-01T00:00:00.000Z' }),
      bbb: e({ needsReview: true, lastSeen: '2026-01-02T00:00:00.000Z' }),
      ccc: e({ lastSeen: '2026-01-03T00:00:00.000Z' }),
      ddd: e({ lastSeen: '2026-01-05T00:00:00.000Z' }),
      kkk: e({ status: 'known', lastSeen: '2026-01-09T00:00:00.000Z' }),
      lll: e({ status: 'learning', lastSeen: '2026-01-08T00:00:00.000Z' }),
      zzz: null,
    },
  };
  const before = JSON.stringify(profile);

  const one = pickCandidateWords(profile);
  assert.deepStrictEqual(one, ['aaa']);

  const all = pickCandidateWords(profile, 10);
  assert.deepStrictEqual(all, ['aaa', 'bbb', 'ddd', 'ccc']);

  const known = pickQuizWords(profile, 20);
  assert.deepStrictEqual(known, ['kkk']);

  assert.equal(JSON.stringify(profile), before);

  assert.deepStrictEqual(pickCandidateWords({}, 5), []);
  assert.deepStrictEqual(pickCandidateWords(null, 5), []);
});
