import { test } from 'node:test';
import assert from 'node:assert';
import { Readable } from 'node:stream';

import translateHandler from '../api/translate.js';
import { setTransport, resetTransport } from '../lib/openai.js';

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

function withOpenGate(fn) {
  const original = process.env.APP_CODE;
  delete process.env.APP_CODE;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (original !== undefined) process.env.APP_CODE = original;
    });
}

test('POST translates a word using the injected transport', () => withOpenGate(async () => {
  setTransport(async () => ({ he: 'כלב' }));
  try {
    const req = createPostReq({ word: ' dog ' });
    const res = createMockRes();
    await translateHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.word, 'dog');
    assert.strictEqual(parsed.data.he, 'כלב');
  } finally {
    resetTransport();
  }
}));

test('POST returns 502 when the transport throws', () => withOpenGate(async () => {
  setTransport(async () => {
    throw new Error('network blip');
  });
  try {
    const req = createPostReq({ word: 'dog' });
    const res = createMockRes();
    await translateHandler(req, res);
    assert.strictEqual(res.statusCode, 502);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'translation failed');
  } finally {
    resetTransport();
  }
}));

test('POST with a blank word returns 400', () => withOpenGate(async () => {
  const req = createPostReq({ word: '   ' });
  const res = createMockRes();
  await translateHandler(req, res);
  assert.strictEqual(res.statusCode, 400);
  const parsed = JSON.parse(res.body);
  assertEnvelope(parsed);
  assert.strictEqual(parsed.ok, false);
  assert.strictEqual(parsed.error, 'word required');
}));

test('POST without a word returns 400', () => withOpenGate(async () => {
  const req = createPostReq({});
  const res = createMockRes();
  await translateHandler(req, res);
  assert.strictEqual(res.statusCode, 400);
  const parsed = JSON.parse(res.body);
  assertEnvelope(parsed);
  assert.strictEqual(parsed.ok, false);
  assert.strictEqual(parsed.error, 'word required');
}));

test('GET returns 405', () => withOpenGate(async () => {
  const req = createGetReq();
  const res = createMockRes();
  await translateHandler(req, res);
  assert.strictEqual(res.statusCode, 405);
  const parsed = JSON.parse(res.body);
  assertEnvelope(parsed);
  assert.strictEqual(parsed.ok, false);
}));

test('malformed JSON body returns 400', () => withOpenGate(async () => {
  const req = createPostReq('{');
  const res = createMockRes();
  await translateHandler(req, res);
  assert.strictEqual(res.statusCode, 400);
  const parsed = JSON.parse(res.body);
  assertEnvelope(parsed);
  assert.strictEqual(parsed.ok, false);
  assert.strictEqual(parsed.error, 'invalid JSON body');
}));
