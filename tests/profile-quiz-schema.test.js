import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile, validateProfile } from '../lib/profile.js';

// Phase 3 / QZ-9. A word entry gains six OPTIONAL keys: strikes, needsReview,
// lastQuizAt, lastStrikeSession, quizRight, quizWrong. Absent means untouched
// and still valid -- this file proves the schema only, no behaviour change.

function baseWordEntry(over = {}) {
  return {
    status: 'learning',
    source: 'tap',
    he: null,
    taps: 1,
    firstSeen: '2026-01-01T00:00:00.000Z',
    lastSeen: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

test('validateProfile: an old-shape profile (no quiz keys at all) still validates', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry();

  const result = validateProfile(profile);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  const entry = profile.words.dog;
  for (const key of ['strikes', 'needsReview', 'lastQuizAt', 'lastStrikeSession', 'quizRight', 'quizWrong']) {
    assert.ok(!(key in entry), `${key} must not be present`);
  }
});

test('validateProfile: all six new keys with legal values validate', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({
    strikes: 2,
    needsReview: true,
    lastQuizAt: '2026-01-05T00:00:00.000Z',
    lastStrikeSession: 's1',
    quizRight: 5,
    quizWrong: 3,
  });

  const result = validateProfile(profile);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('validateProfile: strikes is type-strict (non-negative integer only)', () => {
  for (const bad of ['2', -1, 1.5, null, NaN]) {
    const profile = defaultProfile();
    profile.words.dog = baseWordEntry({ strikes: bad });

    const result = validateProfile(profile);
    assert.equal(result.ok, false, `strikes ${JSON.stringify(bad)} must be invalid`);
    assert.ok(
      result.errors.some((e) => e.startsWith('words.dog.strikes: ')),
      `expected a words.dog.strikes: error for ${JSON.stringify(bad)}, got ${JSON.stringify(result.errors)}`
    );
  }
});

test('validateProfile: needsReview is type-strict (boolean only)', () => {
  for (const bad of ['true', 1, null]) {
    const profile = defaultProfile();
    profile.words.dog = baseWordEntry({ needsReview: bad });

    const result = validateProfile(profile);
    assert.equal(result.ok, false, `needsReview ${JSON.stringify(bad)} must be invalid`);
    assert.ok(
      result.errors.some((e) => e.startsWith('words.dog.needsReview: ')),
      `expected a words.dog.needsReview: error for ${JSON.stringify(bad)}, got ${JSON.stringify(result.errors)}`
    );
  }
});

test('validateProfile: lastQuizAt must be a parseable date string, lastStrikeSession a string with no length limit', () => {
  for (const bad of ['not a date', 12345]) {
    const profile = defaultProfile();
    profile.words.dog = baseWordEntry({ lastQuizAt: bad });

    const result = validateProfile(profile);
    assert.equal(result.ok, false, `lastQuizAt ${JSON.stringify(bad)} must be invalid`);
    assert.ok(
      result.errors.some((e) => e.startsWith('words.dog.lastQuizAt: ')),
      `expected a words.dog.lastQuizAt: error for ${JSON.stringify(bad)}, got ${JSON.stringify(result.errors)}`
    );
  }

  const badSessionProfile = defaultProfile();
  badSessionProfile.words.dog = baseWordEntry({ lastStrikeSession: 42 });
  const badSessionResult = validateProfile(badSessionProfile);
  assert.equal(badSessionResult.ok, false);
  assert.ok(badSessionResult.errors.some((e) => e.startsWith('words.dog.lastStrikeSession: ')));

  const longSessionProfile = defaultProfile();
  longSessionProfile.words.dog = baseWordEntry({ lastStrikeSession: 'x'.repeat(200) });
  const longSessionResult = validateProfile(longSessionProfile);
  assert.equal(longSessionResult.ok, true, 'a 200-character lastStrikeSession has no length limit at this layer');
  assert.deepEqual(longSessionResult.errors, []);
});

test('validateProfile: quizRight/quizWrong are type-strict, and strikes is range-lenient (no upper bound)', () => {
  for (const bad of [1.5, '3', -1]) {
    const rightProfile = defaultProfile();
    rightProfile.words.dog = baseWordEntry({ quizRight: bad });
    const rightResult = validateProfile(rightProfile);
    assert.equal(rightResult.ok, false, `quizRight ${JSON.stringify(bad)} must be invalid`);
    assert.ok(
      rightResult.errors.some((e) => e.startsWith('words.dog.quizRight: ')),
      `expected a words.dog.quizRight: error for ${JSON.stringify(bad)}, got ${JSON.stringify(rightResult.errors)}`
    );

    const wrongProfile = defaultProfile();
    wrongProfile.words.dog = baseWordEntry({ quizWrong: bad });
    const wrongResult = validateProfile(wrongProfile);
    assert.equal(wrongResult.ok, false, `quizWrong ${JSON.stringify(bad)} must be invalid`);
    assert.ok(
      wrongResult.errors.some((e) => e.startsWith('words.dog.quizWrong: ')),
      `expected a words.dog.quizWrong: error for ${JSON.stringify(bad)}, got ${JSON.stringify(wrongResult.errors)}`
    );
  }

  const highStrikesProfile = defaultProfile();
  highStrikesProfile.words.dog = baseWordEntry({ strikes: 99 });
  const highStrikesResult = validateProfile(highStrikesProfile);
  assert.equal(highStrikesResult.ok, true, 'strikes: 99 must be valid -- no upper/policy bound');
  assert.deepEqual(highStrikesResult.errors, []);
});
