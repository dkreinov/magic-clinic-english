// STEP 2.4: the session learns two typed kinds, one free retry on a near-miss,
// and posts exactly once per question no matter how many times she taps or
// types. Every test is a flat top-level test() -- no describe blocks, no
// nesting. No raw Hebrew glyph appears in this file: entry.he values below are
// plain ASCII placeholders (buildQuestion/renderQuizCard never inspect their
// script, they only place them).
import { test } from 'node:test';
import assert from 'node:assert';
import { startQuiz } from '../public/quiz.js';

// Deterministic seeded rand -- never Math.random. Kind selection in buildQuestion
// depends only on availability flags and position, not on rand, so any fixed
// seed is fine for reproducibility of the shuffles inside selectOptions /
// selectHeOptions.
function makeRand(seed) {
  let s = (seed >>> 0) || 1;
  return function rand() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// fakeContainer(), extended per the oplan: querySelector('.quiz-input') returns
// a stub object carrying a value, so renderCurrent's post-render focus logic
// (which guards every DOM call) never throws.
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

// A usable cloze-pick item (isUsableItem: sense non-empty, sentence has ___,
// answer non-empty, >=5 string distractors).
const ITEM = {
  sense: 'not heavy and easy to lift',
  sentence: 'The box was so ___ that she could lift it.',
  answer: 'light',
  distractors: ['big', 'small', 'wide', 'round', 'old', 'new'],
};

function makePost(posts) {
  return async (body) => {
    posts.push(body);
    return { words: {} };
  };
}

// 1. THE SEAM (lesson 15(b)): a typed-correct answer and a tapped-correct
// answer for the SAME lemma must produce deepStrictEqual post bodies apart
// from sessionId -- same action, same lemma, correct: true.
test('THE SEAM: a typed-correct answer and a tapped-correct answer post the same shape', async () => {
  const tappedPosts = [];
  const tappedSession = await startQuiz(fakeContainer(), {
    lemmas: ['light'],
    knownSet: new Set(),
    count: 1,
    load: async () => ITEM,
    post: makePost(tappedPosts),
    rand: makeRand(1),
  });
  assert.strictEqual(tappedSession.questions[0].kind, 'cloze-pick');
  await tappedSession.answer(ITEM.answer);

  const typedPosts = [];
  const typedSession = await startQuiz(fakeContainer(), {
    lemmas: ['light'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { light: { he: 'H0' } },
    post: makePost(typedPosts),
    rand: makeRand(2),
  });
  assert.strictEqual(typedSession.questions[0].kind, 'he-type');
  await typedSession.check('light');

  assert.strictEqual(tappedPosts.length, 1);
  assert.strictEqual(typedPosts.length, 1);
  const { sessionId: sid1, ...restTapped } = tappedPosts[0];
  const { sessionId: sid2, ...restTyped } = typedPosts[0];
  assert.ok(sid1 && sid2, 'both posts must carry a sessionId');
  assert.deepStrictEqual(restTapped, restTyped);
  assert.deepStrictEqual(restTapped, { action: 'quiz-answer', lemma: 'light', correct: true });
});

// 2. near-miss then CORRECT retry: exactly 1 post, correct true.
test('near-miss then CORRECT retry: exactly 1 post, correct true', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(3),
  });
  assert.strictEqual(session.questions[0].kind, 'he-type');
  await session.check('cet'); // near-miss: one substitution from "cat"
  assert.strictEqual(posts.length, 0);
  await session.check('cat'); // correct on the free retry
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].correct, true);
  assert.strictEqual(session.right, 1);
  assert.strictEqual(session.wrong, 0);
});

// 3. near-miss then WRONG retry: exactly 1 post, correct false.
test('near-miss then WRONG retry: exactly 1 post, correct false', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(4),
  });
  await session.check('cet'); // near-miss
  assert.strictEqual(posts.length, 0);
  await session.check('dog'); // wrong on the retry
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].correct, false);
  assert.strictEqual(session.wrong, 1);
  assert.strictEqual(session.right, 0);
});

// 4. THE LOOP-FOREVER CASE: near-miss then ANOTHER near-miss. This can only
// pass because gradeTyped with { isRetry: true } can never return 'near-miss'.
test('the loop-forever case: near-miss then ANOTHER near-miss counts as wrong, exactly 1 post', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(5),
  });
  await session.check('cet'); // near-miss
  assert.strictEqual(posts.length, 0);
  await session.check('cbt'); // ALSO distance 1 from "cat" -- but isRetry forces wrong
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].correct, false);
  assert.strictEqual(session.wrong, 1);
  assert.strictEqual(session.right, 0);
});

// 5. Nothing is posted on the near-miss itself, checked BEFORE the retry.
test('nothing is posted on the near-miss itself', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(6),
  });
  await session.check('cet');
  assert.strictEqual(posts.length, 0, 'a near-miss must post nothing');
});

// 6. straight-wrong (distance >= 2): posts once immediately, correct false.
test('straight-wrong (distance >= 2) posts once immediately, correct false', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(7),
  });
  await session.check('zzzzz');
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].correct, false);
  assert.strictEqual(session.wrong, 1);
  assert.strictEqual(session.right, 0);
});

// 7. correct on the first try: posts once, correct true, no retry state.
test('correct on the first try posts once, no retry state', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(8),
  });
  await session.check('cat');
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].correct, true);
  assert.strictEqual(session.right, 1);
  assert.strictEqual(session.wrong, 0);
});

// 8. session.check called twice after resolution: still exactly 1 post.
test('session.check called twice after resolution still posts exactly once', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(9),
  });
  await session.check('cat');
  assert.strictEqual(posts.length, 1);
  await session.check('cat');
  assert.strictEqual(posts.length, 1, 'a second check after resolution must not post again');
});

// 9. R-W-13: an empty or whitespace-only box is a NO-OP -- nothing posted, the
// retry is NOT consumed, and the card does not change.
test('R-W-13: empty or whitespace-only check is a no-op that does not consume the retry', async () => {
  const posts = [];
  const container = fakeContainer();
  const session = await startQuiz(container, {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(10),
  });

  const before = container.innerHTML;
  await session.check('');
  await session.check('   ');
  assert.strictEqual(posts.length, 0, 'an empty/whitespace box must post nothing');
  assert.strictEqual(container.innerHTML, before, 'the card must not change on an empty check');

  // The free retry must still be available: a real near-miss followed by the
  // correct retry must still post exactly once.
  await session.check('cet'); // near-miss
  assert.strictEqual(posts.length, 0);
  await session.check('cat'); // correct on the still-available retry
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].correct, true);
});

// 10. session.right / session.wrong move by exactly 1 per question, across
// every path: correct-first, wrong-first, near-miss+correct, near-miss+wrong,
// near-miss+near-miss(wrong). One sitting, five questions, five posts total.
test('session.right and session.wrong move by exactly 1 per question on every path', async () => {
  const posts = [];
  const words = {
    w1: { he: 'H1' },
    w2: { he: 'H2' },
    w3: { he: 'H3' },
    w4: { he: 'H4' },
    w5: { he: 'H5' },
  };
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['w1', 'w2', 'w3', 'w4', 'w5'],
    knownSet: new Set(),
    count: 5,
    load: async () => null,
    words,
    post: makePost(posts),
    rand: makeRand(11),
  });
  for (const q of session.questions) assert.strictEqual(q.kind, 'he-type');

  await session.check('w1'); // correct first try
  session.next();
  await session.check('zzzzzz'); // straight wrong
  session.next();
  await session.check('q3'); // near-miss
  await session.check('w3'); // correct retry
  session.next();
  await session.check('q4'); // near-miss
  await session.check('nope'); // wrong retry
  session.next();
  await session.check('q5'); // near-miss
  await session.check('x5'); // ANOTHER near-miss -> forced wrong

  assert.strictEqual(posts.length, 5, 'exactly one post per question');
  assert.strictEqual(session.right, 2);
  assert.strictEqual(session.wrong, 3);
  assert.strictEqual(session.right + session.wrong, 5);
});

// 11. A sitting of 4 with all four kinds buildable asks each kind exactly
// once -- collect the kinds and compare the SET with a duplicate check.
test('a sitting of 4 with all four kinds buildable asks each kind exactly once', async () => {
  const words = {
    w0: { he: 'H0' },
    w1: { he: 'H1' },
    w2: { he: 'H2' },
    w3: { he: 'H3' },
    d4: { he: 'H4' },
    d5: { he: 'H5' },
    d6: { he: 'H6' },
    d7: { he: 'H7' },
    d8: { he: 'H8' },
  };
  const audioSet = new Set(['w0', 'w1', 'w2', 'w3']);
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['w0', 'w1', 'w2', 'w3'],
    knownSet: new Set(),
    count: 4,
    load: async () => ITEM,
    words,
    audioSet,
    post: makePost([]),
    rand: makeRand(12),
  });
  const kinds = session.questions.map((q) => q.kind);
  assert.strictEqual(kinds.length, 4);
  const uniqueKinds = new Set(kinds);
  assert.strictEqual(uniqueKinds.size, 4, `expected 4 distinct kinds, got ${kinds.join(', ')}`);
  assert.deepStrictEqual(uniqueKinds, new Set(['cloze-pick', 'he-pick', 'he-type', 'listen-type']));
});

// 12. A lemma for which buildQuestion returns null is SKIPPED, and the
// sitting still reaches count when the list is long enough.
test('a lemma buildQuestion cannot build is skipped, and the sitting still reaches count', async () => {
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['a', 'bad', 'b', 'c'],
    knownSet: new Set(),
    count: 3,
    load: async (lemma) => (lemma === 'bad' ? null : ITEM),
    post: makePost([]),
    rand: makeRand(13),
  });
  assert.strictEqual(session.questions.length, 3);
  assert.deepStrictEqual(
    session.questions.map((q) => q.lemma),
    ['a', 'b', 'c']
  );
});

// 13. startQuiz with NO words and NO audioSet produces only cloze-pick
// questions -- the defaulting that keeps the pre-2.4 suite honest.
test('startQuiz with no words and no audioSet produces only cloze-pick questions', async () => {
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['p', 'q', 'r', 's'],
    knownSet: new Set(),
    count: 4,
    load: async () => ITEM,
    post: makePost([]),
    rand: makeRand(14),
  });
  assert.strictEqual(session.questions.length, 4);
  for (const q of session.questions) assert.strictEqual(q.kind, 'cloze-pick');
});

// 14. session.hint() on a typed kind does not throw.
test('session.hint() on a typed kind does not throw', async () => {
  const posts = [];
  const session = await startQuiz(fakeContainer(), {
    lemmas: ['cat'],
    knownSet: new Set(),
    count: 1,
    load: async () => null,
    words: { cat: { he: 'H0' } },
    post: makePost(posts),
    rand: makeRand(15),
  });
  assert.strictEqual(session.questions[0].kind, 'he-type');
  assert.doesNotThrow(() => session.hint());
  assert.strictEqual(posts.length, 0);
});
