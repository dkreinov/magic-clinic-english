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
