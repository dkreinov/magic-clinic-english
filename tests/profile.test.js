import { test } from 'node:test';
import assert from 'node:assert';
import { defaultProfile, validateProfile } from '../lib/profile.js';

const NOW = '2026-01-01T00:00:00.000Z';

test('defaultProfile produces the expected schema-v1 shape', () => {
  const profile = defaultProfile(NOW);
  assert.deepStrictEqual(profile, {
    version: 1,
    learner: { heroineName: null, petName: null },
    skills: {
      receptiveVocab: { state: 'unknown', score: null, band: null },
      readingComprehension: { state: 'unknown', score: null, band: null },
      writing: { state: 'unknown', score: null, band: null },
      grammarInContext: { state: 'unknown', score: null, band: null },
      pronunciation: { state: 'unknown', score: null, band: null },
    },
    words: {},
    placement: { completed: false, task1: null, task2: null, completedAt: null },
    story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
    meta: { createdAt: NOW, updatedAt: NOW },
  });
});

test('defaultProfile defaults nowIso to the current time', () => {
  const before = Date.now();
  const profile = defaultProfile();
  const after = Date.now();
  const createdAtMs = Date.parse(profile.meta.createdAt);
  assert.ok(createdAtMs >= before && createdAtMs <= after);
  assert.strictEqual(profile.meta.createdAt, profile.meta.updatedAt);
});

test('validateProfile accepts a freshly created default profile', () => {
  const result = validateProfile(defaultProfile());
  assert.deepStrictEqual(result, { ok: true, errors: [] });
});

test('validateProfile rejects a wrong version', () => {
  const profile = defaultProfile();
  profile.version = 2;
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('version')));
});

test('validateProfile rejects a missing top-level key', () => {
  const profile = defaultProfile();
  delete profile.words;
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('words')));
});

test('validateProfile rejects a bad skills.*.state', () => {
  const profile = defaultProfile();
  profile.skills.writing.state = 'bogus';
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('skills.writing.state')));
});

test('validateProfile rejects a bad word status', () => {
  const profile = defaultProfile();
  profile.words.dog = {
    status: 'mastered',
    source: 'tap',
    he: null,
    taps: 1,
    firstSeen: NOW,
    lastSeen: NOW,
  };
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('words.dog.status')));
});

test('validateProfile rejects a bad word source', () => {
  const profile = defaultProfile();
  profile.words.dog = {
    status: 'known',
    source: 'guess',
    he: null,
    taps: 1,
    firstSeen: NOW,
    lastSeen: NOW,
  };
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('words.dog.source')));
});

test('validateProfile rejects non-number taps', () => {
  const profile = defaultProfile();
  profile.words.dog = {
    status: 'known',
    source: 'tap',
    he: null,
    taps: '1',
    firstSeen: NOW,
    lastSeen: NOW,
  };
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('words.dog.taps')));
});

test('validateProfile rejects a numeric he field', () => {
  const profile = defaultProfile();
  profile.words.dog = {
    status: 'known',
    source: 'tap',
    he: 123,
    taps: 1,
    firstSeen: NOW,
    lastSeen: NOW,
  };
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('words.dog.he')));
});

test('validateProfile rejects an unparseable firstSeen', () => {
  const profile = defaultProfile();
  profile.words.dog = {
    status: 'known',
    source: 'tap',
    he: null,
    taps: 1,
    firstSeen: 'not-a-date',
    lastSeen: NOW,
  };
  const result = validateProfile(profile);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith('words.dog.firstSeen')));
});
