import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import chapterHandler from '../api/chapter.js';
import profileHandler from '../api/profile.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile } from '../lib/profile.js';
import { setTransport, resetTransport } from '../lib/openai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'band1.json');

function loadBand1() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-api-chapter-'));
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

// This text uses only CORE_FUNCTION_WORDS + STORY_LEXICON + a few preBandI
// words that are always present in the real allowed set (dog, cat, mom, dad),
// so it verifies against the real buildAllowedSet output regardless of the
// profile's placement words.
const GOOD_TEXT = 'She is an apprentice at the vet clinic for magical animals. Now a big dragon came into the clinic. The dragon has a hurt wing and its tail is very little. She saw a little unicorn too. The unicorn has one horn and new feathers. She took a potion and gave it to the dragon. The potion is good magic from an old wizard. Then a witch came with a new spell. She said the spell is to heal the wing. She and the vet did the spell again and again. The wing got new again and the dragon was good again. Her dog and cat and mom and dad were happy too.';

function goodChapterFixture() {
  return {
    title: 'The Hurt Wing',
    text: GOOD_TEXT,
    cliffhanger: 'But then the wing did not heal.',
    summarySoFar: 'The apprentice met a hurt dragon and a unicorn.',
    glossary: [
      { word: 'hurt', he: 'פצוע' },
      { word: 'old', he: 'זקן' },
      { word: 'happy', he: 'שמח' },
    ],
    questions: [
      {
        prompt: 'מה קרה לכנף של הדרקון?',
        options: ['היא נפצעה', 'היא ירוקה', 'היא קטנה', 'היא כחולה'],
        correctIndex: 0,
        evidence: 'The dragon has a hurt wing and its tail is very little.',
      },
      {
        prompt: 'כמה קרניים יש לחד קרן?',
        options: ['שתיים', 'אחת', 'שלוש', 'אפס'],
        correctIndex: 1,
        evidence: 'The unicorn has one horn and new feathers.',
      },
    ],
  };
}

function tooHardChapterFixture() {
  return {
    title: 'Too Hard',
    text: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
    cliffhanger: 'Something happened.',
    summarySoFar: 'irrelevant',
    glossary: [],
    questions: [
      {
        prompt: 'שאלה אחת?',
        options: ['א', 'ב', 'ג', 'ד'],
        correctIndex: 0,
        evidence: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
      },
      {
        prompt: 'שאלה שתיים?',
        options: ['ה', 'ו', 'ז', 'ח'],
        correctIndex: 1,
        evidence: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
      },
    ],
  };
}

test('POST generate with no placement returns 400 "placement required"', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    setTransport(async () => goodChapterFixture());
    try {
      const req = createPostReq({ action: 'generate' });
      const res = createMockRes();
      await chapterHandler(req, res);
      assert.strictEqual(res.statusCode, 400);
      const parsed = JSON.parse(res.body);
      assertEnvelope(parsed);
      assert.strictEqual(parsed.ok, false);
      assert.strictEqual(parsed.error, 'placement required');
    } finally {
      resetTransport();
    }
  }));
});

test('POST generate with placement but no learner names returns 400 "learner required"', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const p = defaultProfile();
    p.placement.completed = true;
    await saveProfile(p);

    setTransport(async () => goodChapterFixture());
    try {
      const req = createPostReq({ action: 'generate' });
      const res = createMockRes();
      await chapterHandler(req, res);
      assert.strictEqual(res.statusCode, 400);
      const parsed = JSON.parse(res.body);
      assertEnvelope(parsed);
      assert.strictEqual(parsed.ok, false);
      assert.strictEqual(parsed.error, 'learner required');
    } finally {
      resetTransport();
    }
  }));
});

test('POST generate with placement and learner names returns 200 and persists chapter', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const p = defaultProfile();
    p.placement.completed = true;
    p.learner.heroineName = 'Noa';
    p.learner.petName = 'Sparky';
    await saveProfile(p);

    setTransport(async () => goodChapterFixture());
    try {
      const req = createPostReq({ action: 'generate' });
      const res = createMockRes();
      await chapterHandler(req, res);
      assert.strictEqual(res.statusCode, 200);
      const parsed = JSON.parse(res.body);
      assertEnvelope(parsed);
      assert.strictEqual(parsed.ok, true);
      const chapter = parsed.data.chapter;
      assert.strictEqual(chapter.n, 1);
      assert.ok(chapter.coverageRatio >= 0.95, `expected coverageRatio >= 0.95, got ${chapter.coverageRatio}`);
      assert.strictEqual(chapter.questions[0].id, 'ch1-q1');
      assert.strictEqual(chapter.questions[1].id, 'ch1-q2');

      const getReq = createGetReq();
      const getRes = createMockRes();
      await profileHandler(getReq, getRes);
      assert.strictEqual(getRes.statusCode, 200);
      const getParsed = JSON.parse(getRes.body);
      assert.strictEqual(getParsed.data.story.chapters.length, 1);
      assert.strictEqual(typeof getParsed.data.story.summarySoFar, 'string');
      assert.notStrictEqual(getParsed.data.story.summarySoFar, '');
      assert.strictEqual(getParsed.data.story.cliffhanger, chapter.cliffhanger);
    } finally {
      resetTransport();
    }
  }));
});

test('POST generate returns 502 when transport always returns a too-hard chapter, without persisting', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const p = defaultProfile();
    p.placement.completed = true;
    p.learner.heroineName = 'Noa';
    p.learner.petName = 'Sparky';
    await saveProfile(p);

    setTransport(async () => tooHardChapterFixture());
    try {
      const req = createPostReq({ action: 'generate' });
      const res = createMockRes();
      await chapterHandler(req, res);
      assert.strictEqual(res.statusCode, 502);
      const parsed = JSON.parse(res.body);
      assertEnvelope(parsed);
      assert.strictEqual(parsed.ok, false);
      assert.strictEqual(parsed.error, 'chapter generation failed');

      const stored = await loadProfile();
      assert.strictEqual(stored.story.chapters.length, 0);
    } finally {
      resetTransport();
    }
  }));
});

test('GET returns 405', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const req = createGetReq();
    const res = createMockRes();
    await chapterHandler(req, res);
    assert.strictEqual(res.statusCode, 405);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
  }));
});

test('unknown action returns 400', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const req = createPostReq({ action: 'nope' });
    const res = createMockRes();
    await chapterHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'unknown action');
  }));
});

test('malformed JSON body returns 400', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const req = createPostReq('{');
    const res = createMockRes();
    await chapterHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    const parsed = JSON.parse(res.body);
    assertEnvelope(parsed);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error, 'invalid JSON body');
  }));
});

// Sanity check that GOOD_TEXT actually passes the real verifier against the
// real band1 data + a freshly-placed profile, independent of the API layer.
test('fixture sanity: GOOD_TEXT verifies against the real allowed set', async () => {
  const { buildAllowedSet, verifyChapter } = await import('../lib/story.js');
  const band1 = loadBand1();
  const profile = defaultProfile();
  const allowed = buildAllowedSet(profile, band1);
  const chapter = { ...goodChapterFixture(), questions: goodChapterFixture().questions.map((q, i) => ({ id: `ch1-q${i + 1}`, ...q })) };
  const v = verifyChapter(chapter, allowed);
  assert.strictEqual(v.ok, true, JSON.stringify(v.errors));
});
