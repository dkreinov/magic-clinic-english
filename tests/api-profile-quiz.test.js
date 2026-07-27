import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import profileHandler from '../api/profile.js';

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-api-quiz-'));
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

function createGetReq() {
  return { method: 'GET' };
}

function createPostReq(bodyObj) {
  const raw = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
  const req = Readable.from([Buffer.from(raw, 'utf8')]);
  req.method = 'POST';
  return req;
}

// --- small local helpers (not tests) -------------------------------------

async function doPost(bodyObj) {
  const req = createPostReq(bodyObj);
  const res = createMockRes();
  await profileHandler(req, res);
  return { res, parsed: JSON.parse(res.body) };
}

async function doGet() {
  const req = createGetReq();
  const res = createMockRes();
  await profileHandler(req, res);
  return { res, parsed: JSON.parse(res.body) };
}

async function markKnown(lemma) {
  return doPost({ action: 'mark-known', lemma, source: 'placement' });
}

// --------------------------------------------------------------------------

test('quiz-answer happy path persists across a GET', async () => {
  await withTempDataDir(async () => {
    await markKnown('light');
    const { res, parsed } = await doPost({
      action: 'quiz-answer',
      lemma: 'light',
      correct: false,
      sessionId: 's1',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.words.light.strikes, 1);
    assert.strictEqual(parsed.data.words.light.lastStrikeSession, 's1');

    const { res: getRes, parsed: getParsed } = await doGet();
    assert.strictEqual(getRes.statusCode, 200);
    assert.strictEqual(getParsed.data.words.light.strikes, 1);
    assert.strictEqual(getParsed.data.words.light.lastStrikeSession, 's1');
  });
});

test('three wrongs in three distinct sessions demote to learning', async () => {
  await withTempDataDir(async () => {
    await markKnown('fair');
    await doPost({ action: 'quiz-answer', lemma: 'fair', correct: false, sessionId: 's1' });
    await doPost({ action: 'quiz-answer', lemma: 'fair', correct: false, sessionId: 's2' });
    const { res, parsed } = await doPost({
      action: 'quiz-answer',
      lemma: 'fair',
      correct: false,
      sessionId: 's3',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(parsed.data.words.fair.status, 'learning');
    assert.strictEqual(parsed.data.words.fair.strikes, 0);
  });
});

test('three wrongs in one session do not demote', async () => {
  await withTempDataDir(async () => {
    await markKnown('method');
    await doPost({ action: 'quiz-answer', lemma: 'method', correct: false, sessionId: 'same-session' });
    await doPost({ action: 'quiz-answer', lemma: 'method', correct: false, sessionId: 'same-session' });
    const { res, parsed } = await doPost({
      action: 'quiz-answer',
      lemma: 'method',
      correct: false,
      sessionId: 'same-session',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(parsed.data.words.method.status, 'known');
    assert.strictEqual(parsed.data.words.method.strikes, 1);
  });
});

test('a correct answer resets strikes and never promotes', async () => {
  await withTempDataDir(async () => {
    await markKnown('dog');
    await doPost({ action: 'quiz-answer', lemma: 'dog', correct: false, sessionId: 's1' });
    await doPost({ action: 'quiz-answer', lemma: 'dog', correct: false, sessionId: 's2' });
    const { res, parsed } = await doPost({
      action: 'quiz-answer',
      lemma: 'dog',
      correct: true,
      sessionId: 's3',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(parsed.data.words.dog.strikes, 0);
    assert.strictEqual('lastStrikeSession' in parsed.data.words.dog, false);
    assert.strictEqual(parsed.data.words.dog.quizRight, 1);
    assert.strictEqual(parsed.data.words.dog.status, 'known');
  });
});

test('the four 400s use exact error strings and write nothing to disk', async () => {
  await withTempDataDir(async (tmpDir) => {
    await markKnown('cat');
    const profilePath = path.join(tmpDir, 'profile.json');

    const cases = [
      {
        body: { action: 'quiz-answer', sessionId: 's1', correct: true },
        error: 'lemma required',
      },
      {
        body: { action: 'quiz-answer', lemma: 'cat', correct: true },
        error: 'session required',
      },
      {
        body: { action: 'quiz-answer', lemma: 'cat', correct: true, sessionId: 'x'.repeat(65) },
        error: 'session required',
      },
      {
        body: { action: 'quiz-answer', lemma: 'cat', correct: 'true', sessionId: 's1' },
        error: 'answer required',
      },
      {
        body: { action: 'quiz-answer', lemma: 'nonexistent', correct: true, sessionId: 's1' },
        error: 'unknown word',
      },
      // precedence: no lemma, no sessionId, correct is bogus -> lemma required wins
      {
        body: { action: 'quiz-answer', correct: 'yes' },
        error: 'lemma required',
      },
    ];

    for (const { body, error } of cases) {
      const before = fs.readFileSync(profilePath, 'utf8');
      const { res, parsed } = await doPost(body);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(parsed.error, error);
      const after = fs.readFileSync(profilePath, 'utf8');
      assert.strictEqual(after, before);
    }
  });
});

test('an inflected lemma 400s as unknown word and mints no new entry', async () => {
  await withTempDataDir(async () => {
    await markKnown('light');
    const { res, parsed } = await doPost({
      action: 'quiz-answer',
      lemma: 'lights',
      correct: true,
      sessionId: 's1',
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(parsed.error, 'unknown word');

    const { parsed: getParsed } = await doGet();
    assert.strictEqual('lights' in getParsed.data.words, false);
  });
});

test('an old-shape profile survives a real GET with its bytes unchanged', async () => {
  await withTempDataDir(async (tmpDir) => {
    const nowIso = new Date().toISOString();
    const oldProfile = {
      version: 1,
      learner: { heroineName: null, petName: null },
      skills: {
        receptiveVocab: { state: 'unknown', score: null, band: null },
        readingComprehension: { state: 'unknown', score: null, band: null },
        writing: { state: 'unknown', score: null, band: null },
        grammarInContext: { state: 'unknown', score: null, band: null },
        pronunciation: { state: 'unknown', score: null, band: null },
      },
      words: {
        fair: {
          status: 'learning',
          source: 'tap',
          he: null,
          taps: 2,
          firstSeen: nowIso,
          lastSeen: nowIso,
        },
        light: {
          status: 'known',
          source: 'placement',
          he: null,
          taps: 0,
          firstSeen: nowIso,
          lastSeen: nowIso,
        },
      },
      placement: { completed: false, task1: null, task2: null, completedAt: null },
      story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
      meta: { createdAt: nowIso, updatedAt: nowIso },
    };

    const profilePath = path.join(tmpDir, 'profile.json');
    fs.writeFileSync(profilePath, JSON.stringify(oldProfile, null, 2));
    const before = fs.readFileSync(profilePath, 'utf8');

    const { res, parsed } = await doGet();
    assert.strictEqual(res.statusCode, 200);

    const after = fs.readFileSync(profilePath, 'utf8');
    assert.strictEqual(after, before);

    assert.strictEqual(parsed.data.words.light.status, 'known');
    assert.strictEqual(parsed.data.words.fair.status, 'learning');
  });
});
