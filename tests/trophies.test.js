// word-trophies phase 1, step 1.1 -- T1 schema (.oplan/word-trophies/design.md)
import { test } from 'node:test';
import assert from 'node:assert';
import { defaultProfile, validateProfile } from '../lib/profile.js';
import { TROPHY_CATALOG, TROPHY_TIERS } from '../lib/profile.js';
import { awardTrophies } from '../lib/profile.js';

const NOW = '2026-01-01T00:00:00.000Z';

test('defaultProfile carries an empty trophies map', () => {
  const profile = defaultProfile(NOW);
  assert.deepStrictEqual(profile.trophies, {});
  assert.ok('trophies' in profile);
  assert.deepStrictEqual(validateProfile(defaultProfile(NOW)), { ok: true, errors: [] });
});

test('validateProfile accepts an absent trophies key, an empty map, unknown trophy ids, and all three tier keys', () => {
  const p1 = defaultProfile(NOW);
  delete p1.trophies;
  const r1 = validateProfile(p1);
  assert.deepStrictEqual(r1.errors, []);

  const p2 = defaultProfile(NOW);
  p2.trophies = {};
  const r2 = validateProfile(p2);
  assert.deepStrictEqual(r2.errors, []);

  const p3 = defaultProfile(NOW);
  p3.trophies = { zzzFutureTrophy: { bronze: NOW } };
  const r3 = validateProfile(p3);
  assert.deepStrictEqual(r3.errors, []);

  const p4 = defaultProfile(NOW);
  p4.trophies = { known: { bronze: NOW, silver: NOW, gold: NOW } };
  const r4 = validateProfile(p4);
  assert.deepStrictEqual(r4.errors, []);
});

test('validateProfile rejects a non-object trophies, a non-object trophy entry, an unknown tier key, and an unparseable award timestamp', () => {
  const p1 = defaultProfile(NOW);
  p1.trophies = { known: { platinum: NOW }, days: { bronze: 'nope' }, streak: 5 };
  const r1 = validateProfile(p1);
  const expected1 = [
    'trophies.days.bronze: expected a parseable date string',
    'trophies.known.platinum: unknown tier key',
    'trophies.streak: expected an object',
  ];
  assert.deepStrictEqual([...r1.errors].sort(), [...expected1].sort());

  const p2 = defaultProfile(NOW);
  p2.trophies = 'oops';
  const r2 = validateProfile(p2);
  assert.deepStrictEqual(r2.errors, ['trophies: expected an object']);
});

test('TROPHY_CATALOG and TROPHY_TIERS are exactly the signed catalogue', () => {
  assert.deepStrictEqual(TROPHY_TIERS, ['bronze', 'silver', 'gold']);
  const expected = [
    { id: 'chapters', bronze: 5, silver: 15, gold: 40 },
    { id: 'days', bronze: 3, silver: 10, gold: 30 },
    { id: 'streak', bronze: 2, silver: 4, gold: 7 },
    { id: 'known', bronze: 5, silver: 15, gold: 30 },
    { id: 'quizRight', bronze: 10, silver: 40, gold: 100 },
    { id: 'quizzer', bronze: 20, silver: 60, gold: 150 },
    { id: 'curious', bronze: 25, silver: 75, gold: 200 },
    { id: 'proven', bronze: 1, silver: 5, gold: 15 },
  ];
  assert.deepStrictEqual(
    TROPHY_CATALOG.map(({ id, bronze, silver, gold }) => ({ id, bronze, silver, gold })),
    expected
  );
  assert.strictEqual(TROPHY_CATALOG.length, 8);
  assert.strictEqual(new Set(TROPHY_CATALOG.map((t) => t.id)).size, 8);
  for (const entry of TROPHY_CATALOG) {
    assert.strictEqual(typeof entry.metric, 'function');
    assert.ok(entry.bronze < entry.silver);
    assert.ok(entry.silver < entry.gold);
  }
});

test('the chapters metric counts story.chapters and is defensive about a missing or malformed story', () => {
  const chaptersEntry = TROPHY_CATALOG.find((t) => t.id === 'chapters');
  const makeProfile = (n) => ({ story: { chapters: Array.from({ length: n }, () => ({})) } });
  assert.strictEqual(chaptersEntry.metric(makeProfile(0)), 0);
  assert.strictEqual(chaptersEntry.metric(makeProfile(4)), 4);
  assert.strictEqual(chaptersEntry.metric(makeProfile(5)), 5);
  assert.strictEqual(chaptersEntry.metric(makeProfile(15)), 15);
  assert.strictEqual(chaptersEntry.metric(makeProfile(40)), 40);
  assert.strictEqual(chaptersEntry.metric({}), 0);
  assert.strictEqual(chaptersEntry.metric({ story: null }), 0);
  assert.strictEqual(chaptersEntry.metric({ story: { chapters: 'x' } }), 0);
});

test('the known metric counts words whose status is known', () => {
  const knownEntry = TROPHY_CATALOG.find((t) => t.id === 'known');
  const words = {};
  for (let i = 0; i < 5; i++) words['known' + i] = { status: 'known' };
  for (let i = 0; i < 3; i++) words['learning' + i] = { status: 'learning' };
  for (let i = 0; i < 2; i++) words['candidate' + i] = { status: 'candidate' };
  assert.strictEqual(knownEntry.metric({ words }), 5);
});

test('the quizRight metric sums quizRight over words', () => {
  const quizRightEntry = TROPHY_CATALOG.find((t) => t.id === 'quizRight');
  const words = {
    a: { quizRight: 4 },
    b: { quizRight: 6 },
    c: {},
    d: { quizRight: 'x' },
  };
  assert.strictEqual(quizRightEntry.metric({ words }), 10);
});

test('the quizzer metric sums quizRight plus quizWrong over words', () => {
  const quizzerEntry = TROPHY_CATALOG.find((t) => t.id === 'quizzer');
  const words = {
    a: { quizRight: 4, quizWrong: 7 },
    b: { quizRight: 6, quizWrong: 3 },
  };
  assert.strictEqual(quizzerEntry.metric({ words }), 20);
  const rightOnly = { a: { quizRight: 4 }, b: { quizRight: 6 } };
  assert.strictEqual(quizzerEntry.metric({ words: rightOnly }), 10);
});

test('the curious metric sums taps over words', () => {
  const curiousEntry = TROPHY_CATALOG.find((t) => t.id === 'curious');
  const words = { a: { taps: 10 }, b: { taps: 15 } };
  assert.strictEqual(curiousEntry.metric({ words }), 25);
});

test('the proven metric counts known words with at least one nomination', () => {
  const provenEntry = TROPHY_CATALOG.find((t) => t.id === 'proven');
  const words = {
    a: { status: 'known', nominations: 1 },
    b: { status: 'known', nominations: 0 },
    c: { status: 'candidate', nominations: 2 },
    d: { status: 'learning', nominations: 3 },
  };
  assert.strictEqual(provenEntry.metric({ words }), 1);
});

test('the days metric unions chapter generatedAt with word lastQuizAt and lastSeen and de-duplicates by UTC day', () => {
  const daysEntry = TROPHY_CATALOG.find((t) => t.id === 'days');
  const profile = {
    words: {
      a: { lastSeen: '2026-01-01T09:00:00.000Z' },
      b: { lastSeen: '2026-01-02T09:00:00.000Z' },
      c: { lastSeen: '2026-01-01T18:00:00.000Z', lastQuizAt: '2026-01-03T09:00:00.000Z' },
    },
    story: {
      chapters: [
        { generatedAt: '2026-01-05T09:00:00.000Z' },
        { generatedAt: '2026-01-06T09:00:00.000Z' },
        {},
        { generatedAt: 'not-a-date' },
      ],
    },
  };
  assert.strictEqual(daysEntry.metric(profile), 5);
});

test('the streak metric is the longest run of consecutive days, across month and year boundaries', () => {
  const streakEntry = TROPHY_CATALOG.find((t) => t.id === 'streak');
  const daysEntry = TROPHY_CATALOG.find((t) => t.id === 'days');
  const profile = {
    words: {
      a: { lastSeen: '2026-01-01T09:00:00.000Z' },
      b: { lastSeen: '2026-01-02T09:00:00.000Z' },
      c: { lastSeen: '2026-01-01T18:00:00.000Z', lastQuizAt: '2026-01-03T09:00:00.000Z' },
    },
    story: {
      chapters: [
        { generatedAt: '2026-01-05T09:00:00.000Z' },
        { generatedAt: '2026-01-06T09:00:00.000Z' },
        {},
        { generatedAt: 'not-a-date' },
      ],
    },
  };
  assert.strictEqual(streakEntry.metric(profile), 3);

  const boundary = {
    words: {
      a: { lastSeen: '2025-12-31T09:00:00.000Z' },
      b: { lastSeen: '2026-01-01T09:00:00.000Z' },
      c: { lastSeen: '2026-01-31T09:00:00.000Z' },
      d: { lastSeen: '2026-02-01T09:00:00.000Z' },
    },
  };
  assert.strictEqual(daysEntry.metric(boundary), 4);
  assert.strictEqual(streakEntry.metric(boundary), 2);

  assert.strictEqual(streakEntry.metric({}), 0);
  assert.strictEqual(
    streakEntry.metric({ words: { a: { lastSeen: '2026-01-01T09:00:00.000Z' } } }),
    1
  );
});

test('a value that is not a well-formed ISO date never becomes an active day', () => {
  const daysEntry = TROPHY_CATALOG.find((t) => t.id === 'days');
  const profile = {
    words: {
      a: { lastSeen: 'not-a-date' },
      b: { lastSeen: 'January 1, 2026' },
      c: { lastSeen: '2026-02-30T00:00:00.000Z' },
      d: { lastSeen: 12345 },
      e: { lastSeen: null },
      f: { lastSeen: undefined },
    },
  };
  assert.strictEqual(daysEntry.metric(profile), 0);

  profile.words.g = { lastSeen: '2026-01-01T09:00:00.000Z' };
  assert.strictEqual(daysEntry.metric(profile), 1);
});

test('awardTrophies awards a tier exactly at its threshold and writes no key for an unearned trophy', () => {
  const p = { words: Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['w' + i, { status: 'known' }])) };
  awardTrophies(p, '2026-06-01T09:00:00.000Z');
  assert.deepStrictEqual(p.trophies, { known: { bronze: '2026-06-01T09:00:00.000Z' } });

  const p2 = { words: Object.fromEntries(Array.from({ length: 4 }, (_, i) => ['w' + i, { status: 'known' }])) };
  awardTrophies(p2, '2026-06-01T09:00:00.000Z');
  assert.deepStrictEqual(p2.trophies, {});
});

test('awardTrophies is idempotent: a second call with a different now changes nothing', () => {
  const p = { words: Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['w' + i, { status: 'known' }])) };
  awardTrophies(p, '2026-06-01T09:00:00.000Z');
  const snapshot = structuredClone(p.trophies);
  awardTrophies(p, '2027-01-01T09:00:00.000Z');
  assert.deepStrictEqual(p.trophies, snapshot);
});

test('awardTrophies never regresses: a fabricated higher tier survives a metric below every threshold', () => {
  const p = { words: {} };
  p.trophies = { known: { gold: '2020-01-01T09:00:00.000Z' } };
  awardTrophies(p, '2026-06-01T09:00:00.000Z');
  assert.deepStrictEqual(p.trophies.known, { gold: '2020-01-01T09:00:00.000Z' });
});

test('awardTrophies never rewrites an existing tier timestamp', () => {
  const p = { words: Object.fromEntries(Array.from({ length: 30 }, (_, i) => ['w' + i, { status: 'known' }])) };
  p.trophies = { known: { bronze: '2020-01-01T09:00:00.000Z' } };
  awardTrophies(p, '2026-06-01T09:00:00.000Z');
  assert.strictEqual(p.trophies.known.bronze, '2020-01-01T09:00:00.000Z');
  assert.strictEqual(p.trophies.known.silver, '2026-06-01T09:00:00.000Z');
  assert.strictEqual(p.trophies.known.gold, '2026-06-01T09:00:00.000Z');
});

test('awardTrophies leaves an unknown trophy id and a non-object trophies value untouched', () => {
  const pa = { words: {} };
  pa.trophies = { ghostTrophy: { bronze: '2020-01-01T09:00:00.000Z' } };
  awardTrophies(pa, '2026-06-01T09:00:00.000Z');
  assert.deepStrictEqual(pa.trophies, { ghostTrophy: { bronze: '2020-01-01T09:00:00.000Z' } });

  const pb = { words: Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['w' + i, { status: 'known' }])) };
  pb.trophies = 'oops';
  awardTrophies(pb, '2026-06-01T09:00:00.000Z');
  assert.strictEqual(pb.trophies, 'oops');
});

test('awardTrophies mutates nothing outside profile.trophies and returns the same object', () => {
  const p = { words: Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['w' + i, { status: 'known' }])) };
  const clone = structuredClone(p);
  const result = awardTrophies(p, NOW);
  assert.strictEqual(result, p);
  delete clone.trophies;
  const stripped = structuredClone(p);
  delete stripped.trophies;
  assert.deepStrictEqual(stripped, clone);
});

test('every profile awardTrophies produces still passes validateProfile', () => {
  const p1 = defaultProfile(NOW);
  awardTrophies(p1, NOW);
  assert.deepStrictEqual(validateProfile(p1), { ok: true, errors: [] });

  const p2 = defaultProfile(NOW);
  for (let i = 0; i < 5; i++) {
    p2.words['w' + i] = { status: 'known', source: 'tap', he: null, taps: 1, firstSeen: NOW, lastSeen: NOW };
  }
  awardTrophies(p2, NOW);
  assert.deepStrictEqual(validateProfile(p2), { ok: true, errors: [] });

  const p3 = defaultProfile(NOW);
  p3.story.chapters = Array.from({ length: 40 }, (_, i) => ({
    generatedAt: '2026-01-' + String((i % 27) + 1).padStart(2, '0') + 'T09:00:00.000Z',
  }));
  for (let i = 0; i < 30; i++) {
    p3.words['w' + i] = {
      status: 'known',
      source: 'tap',
      he: null,
      taps: 10,
      firstSeen: NOW,
      lastSeen: NOW,
      nominations: 1,
      quizRight: 10,
      quizWrong: 5,
    };
  }
  awardTrophies(p3, NOW);
  assert.deepStrictEqual(validateProfile(p3), { ok: true, errors: [] });

  const p4 = defaultProfile(NOW);
  p4.trophies = { known: { gold: NOW } };
  awardTrophies(p4, NOW);
  assert.deepStrictEqual(validateProfile(p4), { ok: true, errors: [] });

  const p5 = defaultProfile(NOW);
  p5.trophies = { zzzFutureTrophy: { bronze: NOW } };
  awardTrophies(p5, NOW);
  assert.deepStrictEqual(validateProfile(p5), { ok: true, errors: [] });
});
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import profileHandler from '../api/profile.js';
import chapterHandler from '../api/chapter.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { setTransport, resetTransport } from '../lib/openai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- T2 wiring harness helpers (copied pattern from tests/api-profile-post.test.js:9-60) ----
function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-trophies-'));
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

function listJsFiles(dir) {
  const entries = readdirSync(dir);
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files = files.concat(listJsFiles(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const Q = '\u05e9\u05d0\u05dc\u05d4';
const OPTS = ['\u05d0', '\u05d1', '\u05d2', '\u05d3'];
const GLOSS = [
  { word: 'hurt',  he: '\u05e4\u05e6\u05d5\u05e2' },
  { word: 'old',   he: '\u05d6\u05e7\u05df' },
  { word: 'happy', he: '\u05e9\u05de\u05d7' },
];

function chapterFixture(text) {
  return {
    title: 'The Hurt Wing',
    text,
    cliffhanger: 'But then the wing did not heal.',
    summarySoFar: 'The apprentice met a hurt dragon and a unicorn.',
    glossary: GLOSS.map((g) => ({ word: g.word, he: g.he })),
    questions: [
      {
        prompt: Q,
        options: OPTS,
        correctIndex: 0,
        evidence: 'The dragon has a hurt wing and its tail is very little.',
      },
      {
        prompt: Q + Q,
        options: OPTS,
        correctIndex: 1,
        evidence: 'The unicorn has one horn and new feathers.',
      },
    ],
  };
}

test('a threshold-crossing POST /api/profile awards through the real handler and persists the award', async () => {
  await withOpenGate(() => withTempDataDir(async (tmpDir) => {
    const words = ['dog', 'cat', 'light', 'fair', 'method'];
    let parsed;
    for (let i = 0; i < words.length; i++) {
      const req = createPostReq({ action: 'mark-known', lemma: words[i], source: 'placement' });
      const res = createMockRes();
      await profileHandler(req, res);
      assert.strictEqual(res.statusCode, 200);
      parsed = JSON.parse(res.body);
      if (i === 3) {
        assert.deepStrictEqual(parsed.data.trophies, {});
      }
    }
    assert.deepStrictEqual(Object.keys(parsed.data.trophies), ['known']);
    assert.deepStrictEqual(Object.keys(parsed.data.trophies.known), ['bronze']);
    assert.ok(!Number.isNaN(Date.parse(parsed.data.trophies.known.bronze)));

    const profilePath = path.join(tmpDir, 'profile.json');
    const onDisk = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    assert.deepStrictEqual(onDisk.trophies, parsed.data.trophies);
  }));
});

test('a POST /api/profile that 400s awards nothing and writes nothing to disk', async () => {
  await withOpenGate(() => withTempDataDir(async (tmpDir) => {
    const words = ['dog', 'cat', 'light', 'fair', 'method'];
    for (const w of words) {
      const req = createPostReq({ action: 'mark-known', lemma: w, source: 'placement' });
      const res = createMockRes();
      await profileHandler(req, res);
      assert.strictEqual(res.statusCode, 200);
    }

    const profilePath = path.join(tmpDir, 'profile.json');
    const seededParsed = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    assert.deepStrictEqual(Object.keys(seededParsed.trophies), ['known']);
    const snapshot = fs.readFileSync(profilePath);

    const badActionReq = createPostReq({ action: 'nope' });
    const badActionRes = createMockRes();
    await profileHandler(badActionReq, badActionRes);
    assert.strictEqual(badActionRes.statusCode, 400);
    assert.strictEqual(JSON.parse(badActionRes.body).error, 'unknown action');
    assert.ok(snapshot.equals(fs.readFileSync(profilePath)));

    const badWordTapReq = createPostReq({ action: 'word-tap' });
    const badWordTapRes = createMockRes();
    await profileHandler(badWordTapReq, badWordTapRes);
    assert.strictEqual(badWordTapRes.statusCode, 400);
    assert.ok(snapshot.equals(fs.readFileSync(profilePath)));
  }));
});

test('GET /api/profile never awards, even on a profile that has already earned trophies', async () => {
  await withOpenGate(() => withTempDataDir(async (tmpDir) => {
    const seeded = defaultProfile(NOW);
    const lemmas = ['cat', 'dog', 'fair', 'light', 'method'];
    for (const lemma of lemmas) {
      seeded.words[lemma] = {
        status: 'known',
        source: 'placement',
        he: null,
        taps: 0,
        firstSeen: NOW,
        lastSeen: NOW,
      };
    }
    seeded.trophies = { known: { bronze: NOW } };
    // Also seed 'days'/'streak' right at their bronze thresholds (3 consecutive
    // days via chapters, distinct from NOW) but NOT yet awarded, so a GET that
    // wrongly called awardTrophies would visibly mint a new trophy key here --
    // proving "GET never awards" rather than merely failing to disprove it.
    seeded.story.chapters = [
      { n: 1, text: 'One.', generatedAt: '2025-06-01T00:00:00.000Z' },
      { n: 2, text: 'Two.', generatedAt: '2025-06-02T00:00:00.000Z' },
      { n: 3, text: 'Three.', generatedAt: '2025-06-03T00:00:00.000Z' },
    ];

    const profilePath = path.join(tmpDir, 'profile.json');
    fs.writeFileSync(profilePath, JSON.stringify(seeded, null, 2));
    const before = fs.readFileSync(profilePath);

    const req = createGetReq();
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);

    const after = fs.readFileSync(profilePath);
    assert.ok(before.equals(after));

    const parsed = JSON.parse(res.body);
    assert.deepStrictEqual(parsed.data.trophies, { known: { bronze: NOW } });
  }));
});

test('POST /api/chapter awards after the new chapter is pushed, so the new chapter counts', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const p = defaultProfile();
    p.placement.completed = true;
    p.learner.heroineName = 'Noa';
    p.learner.petName = 'Sparky';
    p.story.chapters = [1, 2, 3, 4].map((n) => ({
      n,
      text: 'Chapter ' + n + ' text.',
      generatedAt: '2026-01-01T00:00:00.000Z',
    }));
    await saveProfile(p);

    setTransport(async () => chapterFixture("She is an apprentice at the vet clinic for magical animals. Now a big dragon came into the clinic. The dragon has a hurt wing and its tail is very little. She saw a little unicorn too. The unicorn has one horn and new feathers. She took a potion and gave it to the dragon. The potion is good magic from an old wizard. Then a witch came with a new spell. She said the spell is to heal the wing. She and the vet did the spell again and again. The wing got new again and the dragon was good again. Her dog and cat and mom and dad were happy too."));
    try {
      const req = createPostReq({ action: 'generate' });
      const res = createMockRes();
      await chapterHandler(req, res);
      assert.strictEqual(res.statusCode, 200, res.body);

      const stored = await loadProfile();
      assert.strictEqual(stored.story.chapters.length, 5);
      assert.deepStrictEqual(Object.keys(stored.trophies), ['chapters']);
      assert.deepStrictEqual(Object.keys(stored.trophies.chapters), ['bronze']);
    } finally {
      resetTransport();
    }
  }));
});

test('awardTrophies is wired at exactly the two designed call sites and nowhere else', () => {
  const root = path.join(__dirname, '..');
  const profileSrc = fs.readFileSync(path.join(root, 'api', 'profile.js'), 'utf8');
  const chapterSrc = fs.readFileSync(path.join(root, 'api', 'chapter.js'), 'utf8');
  const placementSrc = fs.readFileSync(path.join(root, 'api', 'placement.js'), 'utf8');
  const translateSrc = fs.readFileSync(path.join(root, 'api', 'translate.js'), 'utf8');
  const healthSrc = fs.readFileSync(path.join(root, 'api', 'health.js'), 'utf8');

  function countCalls(src) {
    const matches = src.match(/awardTrophies\(/g);
    return matches ? matches.length : 0;
  }

  assert.strictEqual(countCalls(profileSrc), 1);
  assert.strictEqual(countCalls(chapterSrc), 1);
  assert.strictEqual(countCalls(placementSrc), 0);
  assert.strictEqual(countCalls(translateSrc), 0);
  assert.strictEqual(countCalls(healthSrc), 0);

  const publicDir = path.join(root, 'public');
  const publicFiles = listJsFiles(publicDir);
  for (const f of publicFiles) {
    assert.strictEqual(countCalls(fs.readFileSync(f, 'utf8')), 0, 'unexpected awardTrophies( in ' + f);
  }

  const pushIdx = chapterSrc.indexOf('p.story.chapters.push(r.chapter);');
  const callIdx = chapterSrc.indexOf('awardTrophies(p);');
  assert.ok(pushIdx >= 0, 'expected to find the chapters.push call');
  assert.ok(callIdx >= 0, 'expected to find the awardTrophies(p) call');
  assert.ok(pushIdx < callIdx, 'awardTrophies(p) must come after the chapters push (SK-1)');
});
