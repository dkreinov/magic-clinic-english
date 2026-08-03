// STEP 2.5: both quiz call sites hand the engine her words and the audio manifest,
// and words.js reorders the ranked pool so a word once wrong is not question #1
// every sitting. Every test is a flat top-level test() -- no describe blocks, no
// nesting. No raw Hebrew glyph appears in this file: any Hebrew-shaped fixture is
// built from decimal code points (String.fromCharCode), never typed by hand.
import { test } from 'node:test';
import assert from 'node:assert';
import { startQuiz } from '../public/quiz.js';
import { sampleRanked } from '../public/quiz-core.js';

// Deterministic seeded rand -- never Math.random.
function makeRand(seed) {
  let s = (seed >>> 0) || 1;
  return function rand() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Same fakeContainer shape as tests/quiz-typed-session.test.js: querySelector
// answers just enough (.quiz-input stub) that startQuiz's post-render focus
// logic never throws.
function fakeContainer() {
  const inputStub = {
    value: '',
    disabled: false,
    focus() {},
    setSelectionRange() {},
    addEventListener() {},
  };
  return {
    innerHTML: '',
    querySelector(sel) {
      return sel === '.quiz-input' ? inputStub : null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function makePost(posts) {
  return async (body) => {
    posts.push(body);
    return { words: {} };
  };
}

// A usable cloze-pick item (isUsableItem: sense non-empty, sentence has ___,
// answer non-empty, >=5 string distractors).
const ITEM = {
  sense: 'not heavy and easy to lift',
  sentence: 'The box was so ___ that she could lift it.',
  answer: 'light',
  distractors: ['big', 'small', 'wide', 'round', 'old', 'new'],
};

// Three Hebrew-shaped fixture values, built from the decimal code points given
// in the oplan -- never typed as a raw glyph.
const HE_A = String.fromCharCode(1488, 1489, 1490);
const HE_B = String.fromCharCode(1491, 1492, 1493);
const HE_C = String.fromCharCode(1494, 1495, 1496);

// 1. words fixture + audioSet: an he-pick question actually appears.
test('startQuiz with a words fixture and an audioSet: an he-pick question appears', async () => {
  const words = {
    answerword: { he: HE_A, status: 'known' },
    otherword1: { he: HE_B, status: 'known' },
    otherword2: { he: HE_B, status: 'known' },
    otherword3: { he: HE_B, status: 'known' },
    otherword4: { he: HE_B, status: 'known' },
    otherword5: { he: HE_C, status: 'known' },
  };
  const audioSet = new Set(['someunrelatedword']);
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['answerword'],
    knownSet: new Set(),
    count: 1,
    load: async () => null, // no cloze item available for this word
    post: makePost(posts),
    rand: makeRand(1),
    words,
    audioSet,
  });
  assert.strictEqual(session.questions.length, 1, 'expected one question to be built');
  assert.strictEqual(session.questions[0].kind, 'he-pick');
});

// 2. audioSet present: a listen-type question appears.
test('startQuiz with an audioSet: a listen-type question appears', async () => {
  const audioSet = new Set(['soundword']);
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['soundword'],
    knownSet: new Set(),
    count: 1,
    load: async () => null, // no cloze item available
    post: makePost(posts),
    rand: makeRand(2),
    audioSet,
  });
  assert.strictEqual(session.questions.length, 1, 'expected one question to be built');
  assert.strictEqual(session.questions[0].kind, 'listen-type');
});

// 3. Neither words nor audioSet: every question falls back to cloze-pick --
//    the defaulting that keeps the existing untouched suite honest.
test('startQuiz with neither words nor audioSet: every question is cloze-pick', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['light', 'heavy', 'quick', 'slow'],
    knownSet: new Set(),
    count: 4,
    load: async () => ITEM,
    post: makePost(posts),
    rand: makeRand(3),
  });
  assert.strictEqual(session.questions.length, 4);
  for (const q of session.questions) {
    assert.strictEqual(q.kind, 'cloze-pick');
  }
});

// 4. The uniformity sweep: over >=200 seeded runs of
//    sampleRanked(rankedFixture, 4, seededRand), count how often the rank-1
//    entry lands in the first four. A uniform draw predicts ~0.5; the band is
//    0.35-0.65. `observed` is a REAL counter incremented once per loop
//    iteration -- never a hardcoded number.
test('sampleRanked: rank-1 lands in the first four between 35% and 65% of the time over >=200 seeded runs', () => {
  const rankedFixture = Array.from({ length: 20 }, (_, i) => 'rank' + i); // rank0 is rank-1
  const RUNS = 200;
  let hits = 0;
  let observed = 0;
  for (let seed = 1; seed <= RUNS; seed++) {
    const rand = makeRand(seed);
    const result = sampleRanked(rankedFixture, 4, rand);
    observed += 1;
    assert.strictEqual(result.length, 20, 'sampleRanked must reorder, never truncate');
    if (result.slice(0, 4).includes('rank0')) hits += 1;
  }
  console.log(`OBSERVED_RUNS=${observed}`);
  const rate = hits / observed;
  assert.ok(rate >= 0.35 && rate <= 0.65, `rank-1-in-first-4 rate ${rate} out of the 0.35-0.65 band`);
});

// 5. candidateLemmas stays in front of the concatenation used by words.js,
//    regardless of seed.
test('the words.js concatenation puts candidateLemmas first regardless of seed', () => {
  const candidateLemmas = ['candidateA'];
  const rankedPool = Array.from({ length: 20 }, (_, i) => 'pool' + i);
  for (const seed of [1, 2, 3, 42, 999]) {
    const rand = makeRand(seed);
    const result = candidateLemmas.concat(sampleRanked(rankedPool, 4, rand));
    assert.strictEqual(result[0], 'candidateA', `seed ${seed}: candidateLemmas must lead`);
    assert.strictEqual(result.length, candidateLemmas.length + rankedPool.length);
  }
});
