import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile, validateProfile, applyWordTap } from '../lib/profile.js';
import { knownLemmaSet } from '../lib/vocab.js';

test('applyWordTap: re-tap on a known word flags needsReview without striking or demoting', () => {
  const profile = defaultProfile();
  const firstNow = '2026-01-01T00:00:00.000Z';
  const tapNow = '2026-01-02T00:00:00.000Z';

  profile.words.dog = {
    status: 'known',
    source: 'placement',
    he: 'כלב',
    taps: 0,
    firstSeen: firstNow,
    lastSeen: firstNow,
  };

  applyWordTap(profile, { lemma: 'dog', now: tapNow });

  const entry = profile.words.dog;
  assert.equal(entry.needsReview, true);
  assert.equal(entry.status, 'known');
  assert.ok(!('strikes' in entry));
  assert.ok(!('lastQuizAt' in entry));
  assert.ok(!('lastStrikeSession' in entry));
  assert.ok(!('quizRight' in entry));
  assert.ok(!('quizWrong' in entry));
  assert.equal(entry.taps, 1);
  assert.equal(entry.lastSeen, tapNow);
  assert.equal(validateProfile(profile).ok, true);
});

test('applyWordTap: re-tap on a learning word adds no needsReview key', () => {
  const profile = defaultProfile();
  const firstNow = '2026-01-01T00:00:00.000Z';
  const tapNow = '2026-01-02T00:00:00.000Z';

  profile.words.cat = {
    status: 'learning',
    source: 'tap',
    he: null,
    taps: 1,
    firstSeen: firstNow,
    lastSeen: firstNow,
  };
  const before = structuredClone(profile.words.cat);

  applyWordTap(profile, { lemma: 'cat', now: tapNow });

  const entry = profile.words.cat;
  assert.equal('needsReview' in entry, false);
  const expected = { ...before, taps: before.taps + 1, lastSeen: tapNow };
  assert.deepStrictEqual(entry, expected);
  assert.equal(validateProfile(profile).ok, true);
});

test('applyWordTap: first-ever tap yields the exact frozen entry shape', () => {
  const profile = defaultProfile();
  const now = '2026-01-01T00:00:00.000Z';

  applyWordTap(profile, { lemma: 'bird', he: 'ציפור', now });

  const entry = profile.words.bird;
  assert.deepStrictEqual(entry, {
    status: 'learning',
    source: 'tap',
    he: 'ציפור',
    taps: 1,
    firstSeen: now,
    lastSeen: now,
  });
  assert.equal(validateProfile(profile).ok, true);
});

test('applyWordTap: five taps on a known word never remove it from knownLemmaSet', () => {
  const profile = defaultProfile();
  const firstNow = '2026-01-01T00:00:00.000Z';

  profile.words.fish = {
    status: 'known',
    source: 'placement',
    he: 'דג',
    taps: 0,
    firstSeen: firstNow,
    lastSeen: firstNow,
  };

  for (let i = 0; i < 5; i++) {
    applyWordTap(profile, { lemma: 'fish', now: `2026-01-0${i + 2}T00:00:00.000Z` });
  }

  const entry = profile.words.fish;
  assert.ok(knownLemmaSet(profile).has('fish'));
  assert.equal(entry.status, 'known');
  assert.equal(entry.needsReview, true);
  assert.ok(!('strikes' in entry));
  assert.equal(validateProfile(profile).ok, true);
});
