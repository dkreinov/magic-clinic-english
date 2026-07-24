import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import placementHandler from '../api/placement.js';
import profileHandler from '../api/profile.js';
import { validateProfile } from '../lib/profile.js';
import bank from '../data/placement-items.json' with { type: 'json' };
import { bandForScore } from '../lib/placement.js';

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-api-placement-'));
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

function buildTask1Answers({ wrongCount }) {
  const items = bank.task1;
  return items.map((item, index) => {
    const answerWrong = index < wrongCount;
    const choice = answerWrong
      ? (item.correctIndex + 1) % item.options.length
      : item.correctIndex;
    return { id: item.id, choice };
  });
}

function buildAllCorrectTask2Answers() {
  return bank.task2.flatMap((text) => text.questions.map((q) => ({ id: q.id, choice: q.correctIndex })));
}

test('GET returns stripped item bank', async () => {
  await withTempDataDir(async () => {
    const req = createGetReq();
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.ok(!res.body.includes('"correctIndex"'));
    assert.strictEqual(parsed.data.task1.length, bank.task1.length);
  });
});

test('POST submit task1 scores answers and updates profile', async () => {
  await withTempDataDir(async () => {
    const answers = buildTask1Answers({ wrongCount: 2 });
    const req = createPostReq({ action: 'submit', task1: answers });
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);

    const total = answers.length;
    const correct = total - 2;
    const expectedScore = correct / total;

    assert.strictEqual(parsed.data.skills.receptiveVocab.state, 'estimated');
    assert.strictEqual(parsed.data.skills.receptiveVocab.band, bandForScore(expectedScore));
    assert.strictEqual(parsed.data.placement.task1.correct, correct);
    assert.strictEqual(parsed.data.placement.task1.total, total);

    // The last correctly-answered item's lemma should be known via placement.
    const lastCorrectItem = bank.task1[bank.task1.length - 1];
    const wordEntry = parsed.data.words[lastCorrectItem.lemma.toLowerCase()];
    assert.ok(wordEntry, 'expected known lemma in profile.words');
    assert.strictEqual(wordEntry.status, 'known');
    assert.strictEqual(wordEntry.source, 'placement');
  });
});

test('profile persists across a subsequent GET to api/profile.js', async () => {
  await withTempDataDir(async () => {
    const answers = buildTask1Answers({ wrongCount: 2 });
    const postReq = createPostReq({ action: 'submit', task1: answers });
    const postRes = createMockRes();
    await placementHandler(postReq, postRes);
    assert.strictEqual(postRes.statusCode, 200);

    const getReq = createGetReq();
    const getRes = createMockRes();
    await profileHandler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    const parsed = JSON.parse(getRes.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.data.skills.receptiveVocab.state, 'estimated');

    const lastCorrectItem = bank.task1[bank.task1.length - 1];
    const wordEntry = parsed.data.words[lastCorrectItem.lemma.toLowerCase()];
    assert.ok(wordEntry);
    assert.strictEqual(wordEntry.status, 'known');
  });
});

test('POST submit task2 (all correct) marks completed', async () => {
  await withTempDataDir(async () => {
    const task1Answers = buildTask1Answers({ wrongCount: 0 });
    const req1 = createPostReq({ action: 'submit', task1: task1Answers });
    const res1 = createMockRes();
    await placementHandler(req1, res1);
    assert.strictEqual(res1.statusCode, 200);

    const task2Answers = buildAllCorrectTask2Answers();
    const req2 = createPostReq({ action: 'submit', task2: task2Answers });
    const res2 = createMockRes();
    await placementHandler(req2, res2);
    assert.strictEqual(res2.statusCode, 200);
    const parsed = JSON.parse(res2.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.skills.readingComprehension.state, 'estimated');
    assert.strictEqual(parsed.data.placement.completed, true);
    assert.ok(typeof parsed.data.placement.completedAt === 'string');
  });
});

test('malformed JSON body returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq('{');
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'invalid JSON body');
  });
});

test('unknown action returns 400', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'nope' });
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'unknown action');
  });
});

test('submit with no answer arrays returns 400 "no answers"', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'submit' });
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'no answers');
  });
});

test('submit with only unknown-id answers returns 400 "no valid answers"', async () => {
  await withTempDataDir(async () => {
    const req = createPostReq({ action: 'submit', task1: [{ id: 'zzz', choice: 0 }] });
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'no valid answers');
  });
});

test('PUT method returns 405', async () => {
  await withTempDataDir(async () => {
    const req = { method: 'PUT' };
    const res = createMockRes();
    await placementHandler(req, res);
    assert.strictEqual(res.statusCode, 405);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
  });
});

test('final profile after full submission passes validateProfile', async () => {
  await withTempDataDir(async () => {
    const task1Answers = buildTask1Answers({ wrongCount: 0 });
    const req1 = createPostReq({ action: 'submit', task1: task1Answers });
    const res1 = createMockRes();
    await placementHandler(req1, res1);
    assert.strictEqual(res1.statusCode, 200);

    const task2Answers = buildAllCorrectTask2Answers();
    const req2 = createPostReq({ action: 'submit', task2: task2Answers });
    const res2 = createMockRes();
    await placementHandler(req2, res2);
    assert.strictEqual(res2.statusCode, 200);
    const parsed = JSON.parse(res2.body);

    const result = validateProfile(parsed.data);
    assert.strictEqual(result.ok, true, JSON.stringify(result.errors));
  });
});
