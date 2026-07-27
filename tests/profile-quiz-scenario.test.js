import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import profileHandler from '../api/profile.js';
import { knownLemmaSet } from '../lib/vocab.js';

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-scenario-'));
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

// Drive one real HTTP POST through the real handler and confirm it actually
// succeeded. A POST that silently 400s must never let an episode "pass" while
// nothing happened.
async function post(bodyObj) {
  const res = createMockRes();
  await profileHandler(createPostReq(bodyObj), res);
  assert.strictEqual(
    res.statusCode,
    200,
    `POST ${bodyObj.action} for ${bodyObj.lemma ?? ''} should succeed, got ${res.statusCode}: ${res.body}`
  );
  return JSON.parse(res.body).data;
}

// Drive one real HTTP GET and read the profile back from disk, so persistence
// is part of every episode, not an assumption.
async function get() {
  const res = createMockRes();
  await profileHandler(createGetReq(), res);
  assert.strictEqual(res.statusCode, 200, `GET should succeed, got ${res.statusCode}: ${res.body}`);
  return JSON.parse(res.body).data;
}

// isAuthorized() 401s every call when APP_CODE happens to be exported on the
// machine running the suite. These episodes never authenticate, so hold the
// gate open for their duration and put back whatever was there before.
async function withOpenGate(fn) {
  const original = process.env.APP_CODE;
  delete process.env.APP_CODE;
  try {
    return await fn();
  } finally {
    if (original === undefined) delete process.env.APP_CODE;
    else process.env.APP_CODE = original;
  }
}

test('a perfect week of correct quiz answers changes nothing she can see', async () => {
  await withTempDataDir(() =>
    withOpenGate(async () => {
      const words = ['light', 'fair', 'method'];
      for (const lemma of words) {
        await post({ action: 'mark-known', lemma, source: 'tap' });
      }

      // Several distinct sittings spread across the week, every answer right.
      const sittings = ['mon-morning', 'tue-evening', 'thu-morning', 'sat-evening'];
      for (const sessionId of sittings) {
        for (const lemma of words) {
          await post({ action: 'quiz-answer', lemma, correct: true, sessionId });
        }
      }

      const profile = await get();
      const known = knownLemmaSet(profile);
      for (const lemma of words) {
        assert.ok(known.has(lemma), `${lemma} should still be in knownLemmaSet after a perfect week`);
        const entry = profile.words[lemma];
        assert.ok((entry.strikes ?? 0) === 0, `${lemma} should have no strikes after only correct answers`);
      }
    })
  );
});

test('tapping a word to hear it is never a wrong answer', async () => {
  await withTempDataDir(() =>
    withOpenGate(async () => {
      const lemma = 'dog';
      await post({ action: 'mark-known', lemma, source: 'tap' });

      for (let i = 0; i < 6; i++) {
        await post({ action: 'word-tap', lemma });
      }

      const profile = await get();
      const entry = profile.words[lemma];
      assert.ok(knownLemmaSet(profile).has(lemma), 'a tapped word must remain known');
      assert.strictEqual(entry.status, 'known');
      assert.ok((entry.strikes ?? 0) === 0, 'tapping must never add a strike');
      assert.strictEqual(entry.needsReview, true, 'a tap on a known word must flag it for re-quiz');
    })
  );
});

test('three bad days on three separate occasions do take the word back', async () => {
  await withTempDataDir(() =>
    withOpenGate(async () => {
      const lemma = 'cat';
      await post({ action: 'mark-known', lemma, source: 'tap' });

      const sittings = ['day-1', 'day-2', 'day-3'];
      for (const sessionId of sittings) {
        await post({ action: 'quiz-answer', lemma, correct: false, sessionId });
      }

      const profile = await get();
      assert.ok(!knownLemmaSet(profile).has(lemma), 'three separate failures with no success between must take the word back');
    })
  );
});

test('six wrong answers in one frustrated sitting cost only one strike', async () => {
  await withTempDataDir(() =>
    withOpenGate(async () => {
      const lemma = 'light';
      await post({ action: 'mark-known', lemma, source: 'tap' });

      const sessionId = 'one-frustrated-sitting';
      for (let i = 0; i < 6; i++) {
        await post({ action: 'quiz-answer', lemma, correct: false, sessionId });
      }

      const profile = await get();
      const entry = profile.words[lemma];
      assert.ok(knownLemmaSet(profile).has(lemma), 'repeated wrong taps in one sitting must never cost the word');
      assert.strictEqual(entry.strikes ?? 0, 1, 'one sitting, however many wrong answers, is exactly one strike');
    })
  );
});

test('a right answer wipes the strike slate clean', async () => {
  await withTempDataDir(() =>
    withOpenGate(async () => {
      const lemma = 'fair';
      await post({ action: 'mark-known', lemma, source: 'tap' });

      const sequence = [false, false, true, false, false];
      const sittings = ['sit-1', 'sit-2', 'sit-3', 'sit-4', 'sit-5'];
      for (let i = 0; i < sequence.length; i++) {
        await post({ action: 'quiz-answer', lemma, correct: sequence[i], sessionId: sittings[i] });
      }

      const profile = await get();
      const entry = profile.words[lemma];
      assert.ok(knownLemmaSet(profile).has(lemma), 'wrong-wrong-RIGHT-wrong-wrong must never take the word');
      assert.strictEqual(entry.strikes ?? 0, 2, 'the right answer must reset the count, not merely pause it');
    })
  );
});
