import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import profileHandler from '../api/profile.js';

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-api-post-'));
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

function assertEnvelope(parsed) {
  assert.strictEqual(typeof parsed, 'object');
  if (parsed.ok === true) {
    assert.ok('data' in parsed);
  } else if (parsed.ok === false) {
    assert.strictEqual(typeof parsed.error, 'string');
  } else {
    assert.fail('response envelope must have ok: true or ok: false');
  }
}

test('word-tap POST creates a learning word with taps=1', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'word-tap', lemma: 'dog', he: 'כלב' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.words.dog.status, 'learning');
    assert.strictEqual(parsed.data.words.dog.taps, 1);
    assert.strictEqual(parsed.data.words.dog.he, 'כלב');
  });
});

test('word-tap persists across a subsequent GET', async () => {
  await withTempDataDir(async () => {
    const postReq = createPostReq({ action: 'word-tap', lemma: 'dog', he: 'כלב' });
    const postRes = createMockRes();
    await profileHandler(postReq, postRes);
    assert.strictEqual(postRes.statusCode, 200);

    const getReq = createGetReq();
    const getRes = createMockRes();
    await profileHandler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    const parsed = JSON.parse(getRes.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.data.words.dog.taps, 1);
  });
});

test('second identical word-tap POST increments taps to 2', async () => {
  await withTempDataDir(async () => {
    const req1 = createPostReq({ action: 'word-tap', lemma: 'dog', he: 'כלב' });
    const res1 = createMockRes();
    await profileHandler(req1, res1);
    assert.strictEqual(res1.statusCode, 200);

    const req2 = createPostReq({ action: 'word-tap', lemma: 'dog', he: 'כלב' });
    const res2 = createMockRes();
    await profileHandler(req2, res2);
    assert.strictEqual(res2.statusCode, 200);
    const parsed = JSON.parse(res2.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.data.words.dog.taps, 2);
  });
});

test('mark-known POST with valid source marks the word known', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'mark-known', lemma: 'cat', source: 'placement' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.words.cat.status, 'known');
  });
});

test('mark-known POST without source returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'mark-known', lemma: 'cat' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
  });
});

test('unknown action POST returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'nope' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'unknown action');
  });
});

test('malformed JSON body POST returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq('{');
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'invalid JSON body');
  });
});

test('word-tap POST without lemma returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'word-tap' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
  });
});

test('set-learner POST sets both names and persists via GET', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'set-learner', heroineName: 'Noa', petName: 'Sparky' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.learner.heroineName, 'Noa');
    assert.strictEqual(parsed.data.learner.petName, 'Sparky');

    const getReq = createGetReq();
    const getRes = createMockRes();
    await profileHandler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    const getParsed = JSON.parse(getRes.body);
    assert.strictEqual(getParsed.data.learner.heroineName, 'Noa');
    assert.strictEqual(getParsed.data.learner.petName, 'Sparky');
  });
});

test('set-learner POST with neither name returns 400 "name required"', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'set-learner' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'name required');
  });
});

test('set-learner POST with blank heroineName returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'set-learner', heroineName: '   ' });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'name required');
  });
});

test('log-check POST appends an entry to story.checkLog and persists', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({
      action: 'log-check',
      chapter: 1,
      questionId: 'ch1-q1',
      chosenIndex: 0,
      correctIndex: 0,
    });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.story.checkLog.length, 1);
    assert.strictEqual(parsed.data.story.checkLog[0].questionId, 'ch1-q1');
    assert.strictEqual(parsed.data.story.checkLog[0].correct, true);

    const getReq = createGetReq();
    const getRes = createMockRes();
    await profileHandler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    const getParsed = JSON.parse(getRes.body);
    assert.strictEqual(getParsed.data.story.checkLog.length, 1);
  });
});

test('log-check POST missing questionId returns 400 "invalid check"', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'log-check', chapter: 1, chosenIndex: 0, correctIndex: 0 });
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'invalid check');
  });
});

test('PUT method returns 405', async () => {
  await withTempDataDir(async () => {
    const req = { method: 'PUT' };
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 405);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
  });
});
