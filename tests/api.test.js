import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import healthHandler from '../api/health.js';
import profileHandler from '../api/profile.js';
import { validateProfile } from '../lib/profile.js';

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-api-'));
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

function createMockReqRes(method) {
  const req = { method };
  const res = {
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
  return { req, res };
}

test('health GET returns 200 with status up', async () => {
  const { req, res } = createMockReqRes('GET');
  await healthHandler(req, res);
  assert.strictEqual(res.statusCode, 200);
  const parsed = JSON.parse(res.body);
  assert.deepStrictEqual(parsed, { ok: true, data: { status: 'up', version: 1 } });
});

test('health POST returns 405', async () => {
  const { req, res } = createMockReqRes('POST');
  await healthHandler(req, res);
  assert.strictEqual(res.statusCode, 405);
  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.ok, false);
});

test('profile GET returns a valid profile', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const { req, res } = createMockReqRes('GET');
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(validateProfile(parsed.data).ok, true);
  }));
});

test('second profile GET returns the persisted profile', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const { req: req1, res: res1 } = createMockReqRes('GET');
    await profileHandler(req1, res1);
    const first = JSON.parse(res1.body);

    const { req: req2, res: res2 } = createMockReqRes('GET');
    await profileHandler(req2, res2);
    const second = JSON.parse(res2.body);

    assert.strictEqual(second.data.meta.createdAt, first.data.meta.createdAt);
  }));
});

test('profile PUT returns 405', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const { req, res } = createMockReqRes('PUT');
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 405);
    const parsed = JSON.parse(res.body);
    assert.strictEqual(parsed.ok, false);
  }));
});
