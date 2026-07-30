import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import profileHandler from '../api/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'quiz.js');
const lightPath = path.join(root, 'public', 'quiz', 'light.json');

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-quiz-ui-'));
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

function createMockRes() {
  return {
    statusCode: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
  };
}

function createPostReq(bodyObj) {
  const raw = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
  const req = Readable.from([Buffer.from(raw, 'utf8')]);
  req.method = 'POST';
  return req;
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

function fakeContainer() {
  return { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
}

test('quiz.js passes node --check and imports cleanly under node', async () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);

  const mod = await import('../public/quiz.js');
  assert.strictEqual(typeof mod.startQuiz, 'function');
});

test('D22 - renderQuizCard puts the sense above the sentence, prompt/progress render, options+say render, escaping holds', async () => {
  const { renderQuizCard } = await import('../public/quiz.js');
  const items = JSON.parse(readFileSync(lightPath, 'utf8'));
  const item = items[1];
  const options = [item.answer, ...item.distractors.slice(0, 5)];

  const hiddenHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
  });
  assert.ok(hiddenHtml.includes('quiz-hint-btn'), 'hint button must render before an answer/hint');
  assert.ok(hiddenHtml.includes('רמז'), 'hint button label missing');
  assert.ok(!hiddenHtml.includes(item.sense), 'sense must stay hidden before hint/answer');

  const hintShownHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
    hintShown: true,
  });
  assert.ok(hintShownHtml.includes(item.sense), 'sense must render once hintShown is true');
  assert.ok(!hintShownHtml.includes('quiz-hint-btn'), 'hint button must not render once hintShown is true');
  assert.ok(
    hintShownHtml.indexOf(item.sentence) < hintShownHtml.indexOf(item.sense),
    'sentence must render above the sense'
  );

  const html = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: item.answer,
    correct: true,
    demoted: false,
  });
  assert.ok(html.includes(item.sense), 'sense must render once answered');
  assert.ok(!html.includes('quiz-hint-btn'), 'hint button must not render once answered');
  assert.ok(html.includes('איזו מילה מתאימה?'), 'prompt missing');
  assert.ok(html.includes('שאלה 1 מתוך 4'), 'progress text missing');

  for (const opt of options) {
    assert.ok(html.includes(`data-choice="${opt}"`), `option ${opt} missing data-choice`);
    const sayIdx = html.indexOf(`data-say="${opt}"`);
    assert.ok(sayIdx >= 0, `option ${opt} missing sibling data-say`);
  }
  assert.ok(html.includes('aria-label="הקשיבי למילה"'), 'say button missing aria-label');

  const withAngle = renderQuizCard({
    lemma: 'light',
    item: { ...item, sense: 'a < b sense' },
    options,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
    hintShown: true,
  });
  assert.ok(withAngle.includes('a &lt; b sense'), '< in sense must be escaped');
});

test('feedback: correct/wrong/null chosen states render as frozen', async () => {
  const { renderQuizCard } = await import('../public/quiz.js');
  const items = JSON.parse(readFileSync(lightPath, 'utf8'));
  const item = items[0];
  const options = [item.answer, ...item.distractors.slice(0, 5)];

  const correctHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: item.answer,
    correct: true,
    demoted: false,
  });
  assert.ok(correctHtml.includes('כל הכבוד!'));
  const answerBtnMatch = correctHtml.match(new RegExp(`<button[^>]*data-choice="${item.answer}"[^>]*>`));
  assert.ok(answerBtnMatch, 'answer button missing');
  assert.ok(answerBtnMatch[0].includes('class="quiz-option correct"'), 'answer button missing correct class');
  assert.ok(answerBtnMatch[0].includes('disabled'), 'answer button must be disabled');
  for (const opt of options) {
    const m = correctHtml.match(new RegExp(`<button[^>]*data-choice="${opt}"[^>]*>`));
    assert.ok(m[0].includes('disabled'), `option ${opt} must be disabled once chosen`);
  }

  const wrongChoice = options.find((o) => o !== item.answer);
  const wrongHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: wrongChoice,
    correct: false,
    demoted: false,
  });
  assert.ok(wrongHtml.includes('כמעט! המילה הנכונה היא'));
  assert.ok(wrongHtml.includes(item.answer));
  const wrongBtnMatch = wrongHtml.match(new RegExp(`<button[^>]*data-choice="${wrongChoice}"[^>]*>`));
  assert.ok(wrongBtnMatch[0].includes('wrong'), 'chosen wrong button missing wrong class');
  const rightBtnMatch = wrongHtml.match(new RegExp(`<button[^>]*data-choice="${item.answer}"[^>]*>`));
  assert.ok(rightBtnMatch[0].includes('correct'), 'answer button missing correct class in wrong case');

  const nullHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
  });
  assert.ok(!nullHtml.includes('כל הכבוד!'));
  assert.ok(!nullHtml.includes('כמעט! המילה הנכונה היא'));
  assert.ok(!nullHtml.includes('disabled'));
  assert.ok(!nullHtml.includes('quiz-next'));
});

test('D1 - demotion line renders only when demoted is true', async () => {
  const { renderQuizCard } = await import('../public/quiz.js');
  const items = JSON.parse(readFileSync(lightPath, 'utf8'));
  const item = items[0];
  const options = [item.answer, ...item.distractors.slice(0, 5)];

  const demotedHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: options.find((o) => o !== item.answer),
    correct: false,
    demoted: true,
  });
  assert.ok(demotedHtml.includes('המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד'));

  const notDemotedHtml = renderQuizCard({
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: options.find((o) => o !== item.answer),
    correct: false,
    demoted: false,
  });
  assert.ok(!notDemotedHtml.includes('המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד'));
});

test('answerBody shape and acceptance by the real /api/profile handler', async () => {
  const { answerBody } = await import('../public/quiz.js');
  assert.deepStrictEqual(answerBody('s1', 'light', false), {
    action: 'quiz-answer',
    lemma: 'light',
    correct: false,
    sessionId: 's1',
  });

  await withOpenGate(() =>
    withTempDataDir(async () => {
      const markReq = createPostReq({ action: 'mark-known', lemma: 'light', source: 'tap' });
      const markRes = createMockRes();
      await profileHandler(markReq, markRes);
      assert.strictEqual(markRes.statusCode, 200);

      const answerReq = createPostReq(answerBody('s1', 'light', false));
      const answerRes = createMockRes();
      await profileHandler(answerReq, answerRes);
      assert.strictEqual(answerRes.statusCode, 200);
      const parsed = JSON.parse(answerRes.body);
      assert.strictEqual(parsed.ok, true);
      assert.strictEqual(parsed.data.words.light.strikes, 1);
    })
  );
});

test('criterion 3: sessions differ across sittings, one sitting shares a sessionId, double-answer posts once', async () => {
  const { startQuiz } = await import('../public/quiz.js');
  const items = JSON.parse(readFileSync(lightPath, 'utf8'));
  const item = items[0];

  function makeLoad() {
    return async () => item;
  }

  const posts1 = [];
  const container1 = fakeContainer();
  const session1 = await startQuiz(container1, {
    lemmas: ['light'],
    knownSet: new Set(),
    count: 1,
    load: makeLoad(),
    post: async (body) => {
      posts1.push(body);
      return { words: {} };
    },
    rand: Math.random,
  });

  const posts2 = [];
  const container2 = fakeContainer();
  const session2 = await startQuiz(container2, {
    lemmas: ['light'],
    knownSet: new Set(),
    count: 1,
    load: makeLoad(),
    post: async (body) => {
      posts2.push(body);
      return { words: {} };
    },
    rand: Math.random,
  });

  assert.notStrictEqual(session1.sessionId, session2.sessionId);

  const posts3 = [];
  const container3 = fakeContainer();
  const session3 = await startQuiz(container3, {
    lemmas: ['aa', 'bb', 'cc'],
    knownSet: new Set(),
    count: 3,
    load: makeLoad(),
    post: async (body) => {
      posts3.push(body);
      return { words: {} };
    },
    rand: Math.random,
  });

  assert.deepStrictEqual(
    session3.questions.map((q) => q.lemma),
    ['aa', 'bb', 'cc']
  );

  await session3.answer(item.answer);
  await session3.next();
  await session3.answer(item.answer);
  await session3.next();
  await session3.answer(item.answer);

  assert.strictEqual(posts3.length, 3);
  assert.deepStrictEqual(
    posts3.map((p) => p.lemma),
    ['aa', 'bb', 'cc']
  );
  for (const p of posts3) {
    assert.strictEqual(p.sessionId, session3.sessionId);
  }

  // Answering the same question twice must not double-POST.
  const posts4 = [];
  const container4 = fakeContainer();
  const session4 = await startQuiz(container4, {
    lemmas: ['light'],
    knownSet: new Set(),
    count: 1,
    load: makeLoad(),
    post: async (body) => {
      posts4.push(body);
      return { words: {} };
    },
    rand: Math.random,
  });
  await session4.answer(item.answer);
  await session4.answer(item.answer);
  assert.strictEqual(posts4.length, 1);
});

test('criterion 4: a missing item is silence, loadItem itself returns null for every unusable input', async () => {
  const { startQuiz, loadItem } = await import('../public/quiz.js');
  const items = JSON.parse(readFileSync(lightPath, 'utf8'));
  const item = items[0];

  const posts = [];
  const container = fakeContainer();
  const session = await startQuiz(container, {
    lemmas: ['a', 'b', 'c'],
    knownSet: new Set(),
    count: 3,
    load: async (lemma) => (lemma === 'b' ? null : item),
    post: async (body) => {
      posts.push(body);
      return { words: {} };
    },
    rand: Math.random,
  });

  assert.strictEqual(session.questions.length, 2);
  assert.strictEqual(session.questions[0].lemma, 'a');
  assert.strictEqual(session.questions[1].lemma, 'c');

  await session.answer(item.answer);
  await session.next();
  await session.answer(item.answer);

  for (const p of posts) {
    assert.notStrictEqual(p.lemma, 'b');
  }

  let doneArg = null;
  const emptyContainer = fakeContainer();
  await startQuiz(emptyContainer, {
    lemmas: ['x', 'y', 'z'],
    knownSet: new Set(),
    count: 3,
    load: async () => null,
    onDone: (arg) => {
      doneArg = arg;
    },
    post: async () => ({ words: {} }),
    rand: Math.random,
  });
  assert.deepStrictEqual(doneArg, { right: 0, total: 0 });
  assert.strictEqual(emptyContainer.innerHTML, '');

  // loadItem itself: rejecting fetch
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      throw new Error('network down');
    };
    assert.strictEqual(await loadItem('light'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  // res.ok === false
  try {
    globalThis.fetch = async () => ({ ok: false, json: async () => [] });
    assert.strictEqual(await loadItem('light'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  // non-array JSON body
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ not: 'an array' }) });
    assert.strictEqual(await loadItem('light'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  // empty array
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => [] });
    assert.strictEqual(await loadItem('light'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  // every element unusable
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => [{ nope: true }, { also: 'no' }] });
    assert.strictEqual(await loadItem('light'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  // res.json() rejecting
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => {
        throw new Error('bad json');
      },
    });
    assert.strictEqual(await loadItem('light'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('source and style: frozen strings, VIEW_STYLE token-only, contrast gate unaffected', () => {
  const src = readFileSync(viewPath, 'utf8');
  const needles = [
    '/api/profile',
    'quiz-answer',
    'postJson',
    'btn-say',
    '/quiz/',
    'encodeURIComponent',
    'איזו מילה מתאימה?',
    'כל הכבוד!',
    'כמעט! המילה הנכונה היא',
    'המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד',
    'הלאה',
    'סיימנו את התרגול!',
    'הקשיבי למילה',
    'quiz-hint-btn',
    'quiz-hint',
    'רמז',
  ];
  for (const needle of needles) {
    assert.ok(src.includes(needle), `quiz.js missing "${needle}"`);
  }

  const styleMatch = src.match(/const VIEW_STYLE = `([\s\S]*?)`;/);
  assert.ok(styleMatch, 'could not find VIEW_STYLE');
  const style = styleMatch[1];
  assert.ok(!style.includes('#'), 'VIEW_STYLE must not contain a raw hex color');
  assert.ok(!style.includes('color-mix('), 'VIEW_STYLE must not use color-mix()');

  const result = spawnSync(process.execPath, ['scripts/check-contrast.mjs'], { cwd: root });
  assert.strictEqual(result.status, 0, `contrast gate exited non-zero: ${result.stderr}`);
  const stdout = result.stdout.toString();
  assert.ok(stdout.includes('ALL PASS'), 'contrast gate did not print ALL PASS');
  const passLines = stdout.split('\n').filter((l) => l.startsWith('PASS'));
  assert.strictEqual(passLines.length, 58, `expected exactly 58 PASS lines, got ${passLines.length}`);
});

test('B6(iii): a demoted candidate gets the softer line, a demoted claim keeps its own, and neither appears without a demotion', async () => {
  const { renderQuizCard, startQuiz } = await import('../public/quiz.js');
  const items = JSON.parse(readFileSync(lightPath, 'utf8'));
  const item = items[0];
  const options = [item.answer, ...item.distractors.slice(0, 5)];

  const SOFT = '\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA';
  const HARD = '\u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA \u05D7\u05D5\u05D6\u05E8\u05EA \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4, \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D5\u05EA\u05D4 \u05E9\u05D5\u05D1 \u05D9\u05D7\u05D3';

  const base = {
    lemma: 'light',
    item,
    options,
    index: 0,
    total: 4,
    chosen: options.find((o) => o !== item.answer),
    correct: false,
  };

  const candidateDemoted = renderQuizCard({ ...base, demoted: true, wasCandidate: true });
  assert.ok(candidateDemoted.includes(SOFT), 'a demoted candidate must render the soft line');
  assert.ok(!candidateDemoted.includes(HARD), 'a demoted candidate must not render the claimed-word line');
  assert.strictEqual(
    candidateDemoted.split('<p class="quiz-demoted">').length - 1,
    1,
    'exactly one quiz-demoted node on a demoted candidate card'
  );

  const claimDemoted = renderQuizCard({ ...base, demoted: true, wasCandidate: false });
  assert.ok(claimDemoted.includes(HARD), 'a demoted claim must keep its own (hard) line');
  assert.ok(!claimDemoted.includes(SOFT), 'a demoted claim must not render the soft line');
  assert.strictEqual(
    claimDemoted.split('<p class="quiz-demoted">').length - 1,
    1,
    'exactly one quiz-demoted node on a demoted claim card'
  );

  const notDemoted = renderQuizCard({ ...base, demoted: false, wasCandidate: true });
  assert.ok(!notDemoted.includes(SOFT), 'no demotion means no soft line, even for a candidate');
  assert.ok(!notDemoted.includes(HARD), 'no demotion means no hard line, even for a candidate');

  const stubItem = {
    sense: 's',
    sentence: 'a ___ b',
    answer: 'x',
    distractors: ['p', 'q', 'r', 's', 't', 'u', 'v', 'w'],
  };
  const load = async () => stubItem;
  const post = async () => ({ words: { x: { status: 'learning' } } });

  const containerA = fakeContainer();
  const sessionA = await startQuiz(containerA, {
    lemmas: ['x'],
    knownSet: new Set(),
    candidateSet: new Set(['x']),
    count: 1,
    load,
    post,
  });
  await sessionA.answer('p');
  assert.ok(
    containerA.innerHTML.includes(SOFT),
    'startQuiz must thread candidateSet through to the card as the soft line'
  );
  assert.ok(!containerA.innerHTML.includes(HARD));

  const containerB = fakeContainer();
  const sessionB = await startQuiz(containerB, {
    lemmas: ['x'],
    knownSet: new Set(),
    count: 1,
    load,
    post,
  });
  await sessionB.answer('p');
  assert.ok(
    containerB.innerHTML.includes(HARD),
    'omitting candidateSet must default to the claimed-word (hard) line'
  );
  assert.ok(!containerB.innerHTML.includes(SOFT));
});
