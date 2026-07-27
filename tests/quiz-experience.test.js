// Step 4.6 -- the adversarial child-experience pass.
//
// Every episode drives the REAL api/profile.js handler and the REAL public/quiz.js
// component. Assertions about "does she still know it" go through knownLemmaSet
// (lib/vocab.js) -- the same lens the story generator uses -- never the raw
// `status` string. This file was written by a worker who did not write the
// implementation and is instructed to try to break it.

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

import profileHandler from '../api/profile.js';
import { startQuiz } from '../public/quiz.js';
import { pickQuizWords } from '../public/quiz-core.js';
import { knownLemmaSet } from '../lib/vocab.js';

// ---- harness, copied verbatim per the packet ----

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-quiz-exp-'));
  const originalDataDir = process.env.DATA_DIR;
  const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.DATA_DIR = tmpDir;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  return Promise.resolve()
    .then(() => fn(tmpDir))
    .finally(() => {
      if (originalDataDir === undefined) delete process.env.DATA_DIR;
      else process.env.DATA_DIR = originalDataDir;
      if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
}
function withOpenGate(fn) {
  const original = process.env.APP_CODE;
  delete process.env.APP_CODE;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (original !== undefined) process.env.APP_CODE = original;
    });
}
function createMockRes() {
  return {
    statusCode: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) { this.statusCode = status; this.headers = headers; },
    end(body) { this.body = body; },
  };
}
function createPostReq(bodyObj) {
  const raw = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
  const req = Readable.from([Buffer.from(raw, 'utf8')]);
  req.method = 'POST';
  return req;
}
function createGetReq() {
  const req = Readable.from([]);
  req.method = 'GET';
  return req;
}

// ---- episode-local helpers ----

// A real-shaped quiz item that does not depend on any file under public/quiz/:
// sense, a sentence containing "___", answer === the lemma, and >= 5 plain-string
// distractors (selectOptions requires strings).
const DISTRACTOR_POOL = ['apple', 'dog', 'chair', 'river', 'cloud', 'stone', 'music', 'garden', 'window', 'bridge'];
function makeItem(lemma) {
  return {
    sense: `a plain sense for ${lemma}`,
    sentence: `Look at the ___ over there.`,
    answer: lemma,
    distractors: DISTRACTOR_POOL.filter((w) => w !== lemma).slice(0, 8),
  };
}

function makeContainer() {
  return { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
}

// post wired to the REAL handler -- unwraps the {ok, data} envelope, as noted
// in the packet ("startQuiz's post result is used as the profile").
function makeRealPost() {
  return async (body) => {
    const req = createPostReq(body);
    const res = createMockRes();
    await profileHandler(req, res);
    const parsed = JSON.parse(res.body);
    if (res.statusCode !== 200) throw new Error('HTTP ' + res.statusCode);
    return parsed.data;
  };
}

async function getProfile() {
  const req = createGetReq();
  const res = createMockRes();
  await profileHandler(req, res);
  const parsed = JSON.parse(res.body);
  if (res.statusCode !== 200) throw new Error('HTTP ' + res.statusCode);
  return parsed.data;
}

// ---- episode 1: a sitting mints a fresh session id (criterion 3) ----

test('episode 1: a sitting mints a fresh session id; one sitting keeps one id across answers', () =>
  withOpenGate(() => withTempDataDir(async () => {
    const w1 = 'zqe-sitting-a';
    const w2 = 'zqe-sitting-b';
    const w3 = 'zqe-sitting-c';
    const calls = [];
    const post = async (body) => { calls.push(body); return { words: {} }; };
    const load = async (lemma) => makeItem(lemma);

    const sitting1 = await startQuiz(makeContainer(), {
      lemmas: [w1, w2, w3],
      knownSet: new Set([w1, w2, w3]),
      count: 3,
      load,
      post,
    });
    assert.strictEqual(sitting1.questions.length, 3, 'sitting 1 should have built all three questions');

    await sitting1.answer(sitting1.questions[0].item.answer);
    sitting1.next();
    await sitting1.answer(sitting1.questions[1].item.answer);
    sitting1.next();
    await sitting1.answer(sitting1.questions[2].item.answer);
    sitting1.next();

    assert.strictEqual(calls.length, 3, 'three answers should post three times');
    for (const body of calls) {
      assert.strictEqual(body.sessionId, sitting1.sessionId, 'every answer in one sitting must carry the same id');
    }

    const sitting2 = await startQuiz(makeContainer(), {
      lemmas: [w1],
      knownSet: new Set([w1]),
      count: 1,
      load,
      post,
    });
    assert.notStrictEqual(sitting2.sessionId, sitting1.sessionId, 'a second sitting must mint a fresh id');
  }))
);

// ---- episode 2: three wrong answers, one sitting, cost ONE strike (D16) ----

test('episode 2: three wrong answers in one sitting cost exactly one strike', () =>
  withOpenGate(() => withTempDataDir(async () => {
    const post = makeRealPost();
    const word = 'zqe-strike-once';
    await post({ action: 'mark-known', lemma: word, source: 'tap' });

    await post({ action: 'quiz-answer', lemma: word, correct: false, sessionId: 'sit-1' });
    await post({ action: 'quiz-answer', lemma: word, correct: false, sessionId: 'sit-1' });
    const afterThird = await post({ action: 'quiz-answer', lemma: word, correct: false, sessionId: 'sit-1' });

    assert.ok(knownLemmaSet(afterThird).has(word), 'three wrong answers in ONE sitting must not demote the word');
    assert.strictEqual(afterThird.words[word].strikes, 1, 'same-sitting wrong answers must add at most one strike');

    const profile = await getProfile();
    assert.ok(knownLemmaSet(profile).has(word), 'GET must agree the word is still known');
    assert.strictEqual(profile.words[word].strikes, 1);
  }))
);

// ---- episode 3: three sittings demote the word, AND she is told (criterion 5) ----

test('episode 3: three wrong answers in three sittings demote the word and the HTML tells her', () =>
  withOpenGate(() => withTempDataDir(async () => {
    const word = 'zqe-demote-me';
    const post = makeRealPost();
    await post({ action: 'mark-known', lemma: word, source: 'tap' });

    const load = async () => makeItem(word);
    const knownSet = new Set([word]);
    let container = makeContainer();

    for (let i = 0; i < 2; i++) {
      const sitting = await startQuiz(container, { lemmas: [word], knownSet, count: 1, load, post });
      const wrongOption = sitting.questions[0].item.distractors[0];
      await sitting.answer(wrongOption);
      assert.ok(
        !container.innerHTML.includes('המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד'),
        `sitting ${i + 1} must not render the demotion line before the third strike`
      );
    }

    container = makeContainer();
    const finalSitting = await startQuiz(container, { lemmas: [word], knownSet, count: 1, load, post });
    const wrongOption = finalSitting.questions[0].item.distractors[0];
    await finalSitting.answer(wrongOption);

    assert.ok(
      container.innerHTML.includes('המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד'),
      'the third strike must render the demotion line'
    );
    assert.ok(container.innerHTML.includes(word), 'the rendered card must mention the word itself');

    const profile = await getProfile();
    assert.ok(!knownLemmaSet(profile).has(word), 'after the third strike the word must have left knownLemmaSet');
  }))
);

// ---- episode 4: a missing quiz item is skipped in silence (criterion 4) ----

test('episode 4: a lemma with no quiz item is skipped silently, others still asked', () =>
  withOpenGate(() => withTempDataDir(async () => {
    const w1 = 'zqe-silence-a';
    const missing = 'zqe-silence-missing';
    const w3 = 'zqe-silence-c';
    const realPost = makeRealPost();
    const calls = [];
    const post = async (body) => { calls.push(body); return realPost(body); };

    await post({ action: 'mark-known', lemma: w1, source: 'tap' });
    await post({ action: 'mark-known', lemma: missing, source: 'tap' });
    await post({ action: 'mark-known', lemma: w3, source: 'tap' });
    calls.length = 0; // only care about calls made during/after the quiz sitting

    const load = async (lemma) => (lemma === missing ? null : makeItem(lemma));
    const container = makeContainer();
    const knownSet = new Set([w1, missing, w3]);

    const session = await startQuiz(container, {
      lemmas: [w1, missing, w3],
      knownSet,
      count: 2,
      load,
      post,
    });

    assert.strictEqual(session.questions.length, 2, 'the missing lemma must not consume a question slot');
    assert.deepStrictEqual(session.questions.map((q) => q.lemma), [w1, w3], 'the other two lemmas must be asked in order');

    await session.answer(session.questions[0].item.answer);
    session.next();
    await session.answer(session.questions[1].item.answer);
    session.next();

    assert.ok(!calls.some((c) => c.lemma === missing), 'the missing lemma must never be posted about');

    const profile = await getProfile();
    assert.ok(knownLemmaSet(profile).has(missing), 'the missing-item word must remain known, untouched by the quiz');
    assert.strictEqual(profile.words[missing].quizRight, undefined, 'the missing word must gain no quizRight key');
    assert.strictEqual(profile.words[missing].quizWrong, undefined, 'the missing word must gain no quizWrong key');
    assert.strictEqual(profile.words[missing].lastQuizAt, undefined, 'the missing word must gain no lastQuizAt key');
    assert.strictEqual(profile.words[w1].quizRight, 1, 'the actually-asked word should have been recorded');
    assert.strictEqual(profile.words[w3].quizRight, 1, 'the actually-asked word should have been recorded');
  }))
);

// ---- episode 5: a word mid-demotion is asked first (obligation 4) ----

test('episode 5: pickQuizWords asks the struck word first, then the flagged one, then never-quizzed, then quizzed', () =>
  withOpenGate(() => withTempDataDir(async () => {
    const post = makeRealPost();
    const A = 'zqe-order-a-strike';
    const B = 'zqe-order-b-flag';
    const C = 'zqe-order-c-quizzed';
    const D = 'zqe-order-d-never';

    await post({ action: 'mark-known', lemma: A, source: 'tap' });
    await post({ action: 'mark-known', lemma: B, source: 'tap' });
    await post({ action: 'mark-known', lemma: C, source: 'tap' });
    await post({ action: 'mark-known', lemma: D, source: 'tap' });

    // A: one wrong answer -> strikes === 1.
    await post({ action: 'quiz-answer', lemma: A, correct: false, sessionId: 'order-s1' });
    // B: flagged for review via a word-tap on an already-known word.
    await post({ action: 'word-tap', lemma: B });
    // C: quizzed once, correctly -> has a lastQuizAt, not "never quizzed".
    await post({ action: 'quiz-answer', lemma: C, correct: true, sessionId: 'order-s2' });
    // D: never touched again after mark-known -> never quizzed.

    const profile = await getProfile();
    const known = knownLemmaSet(profile);
    for (const lemma of [A, B, C, D]) {
      assert.ok(known.has(lemma), `${lemma} should still be in knownLemmaSet`);
    }

    const order = pickQuizWords(profile);
    assert.deepStrictEqual(order, [A, B, D, C], 'strikes first, then flagged, then never-quizzed, then quizzed');
  }))
);
