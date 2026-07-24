import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile, validateProfile, setLearner, logCheck } from '../lib/profile.js';

test('defaultProfile: story.checkLog is an empty array and profile validates', () => {
  const profile = defaultProfile();
  assert.deepEqual(profile.story.checkLog, []);
  const result = validateProfile(profile);
  assert.equal(result.ok, true);
});

test('setLearner: sets both names trimmed and profile still validates', () => {
  const profile = defaultProfile();
  setLearner(profile, { heroineName: '  Maya  ', petName: ' Rex ' });

  assert.equal(profile.learner.heroineName, 'Maya');
  assert.equal(profile.learner.petName, 'Rex');
  const result = validateProfile(profile);
  assert.equal(result.ok, true);
});

test('setLearner: only heroineName provided leaves petName untouched', () => {
  const profile = defaultProfile();
  setLearner(profile, { heroineName: 'Maya' });

  assert.equal(profile.learner.heroineName, 'Maya');
  assert.equal(profile.learner.petName, null);
});

test('setLearner: blank heroineName throws "name required"', () => {
  const profile = defaultProfile();
  assert.throws(() => setLearner(profile, { heroineName: '   ' }), /name required/);
});

test('setLearner: 25-char name throws "name too long"', () => {
  const profile = defaultProfile();
  const longName = 'a'.repeat(25);
  assert.throws(() => setLearner(profile, { heroineName: longName }), /name too long/);
});

test('logCheck: appends entries with correct true/false based on indexes', () => {
  const profile = defaultProfile();
  const now = '2026-01-01T00:00:00.000Z';

  logCheck(profile, { chapter: 1, questionId: 'q1', chosenIndex: 2, correctIndex: 2, now });
  logCheck(profile, { chapter: 1, questionId: 'q2', chosenIndex: 0, correctIndex: 3, now });

  assert.equal(profile.story.checkLog.length, 2);
  assert.deepEqual(profile.story.checkLog[0], {
    chapter: 1,
    questionId: 'q1',
    chosenIndex: 2,
    correctIndex: 2,
    correct: true,
    at: now,
  });
  assert.deepEqual(profile.story.checkLog[1], {
    chapter: 1,
    questionId: 'q2',
    chosenIndex: 0,
    correctIndex: 3,
    correct: false,
    at: now,
  });
});

test('logCheck: migrates old profile missing story.checkLog', () => {
  const profile = defaultProfile();
  delete profile.story.checkLog;
  const now = '2026-01-01T00:00:00.000Z';

  logCheck(profile, { chapter: 2, questionId: 'q1', chosenIndex: 1, correctIndex: 1, now });

  assert.ok(Array.isArray(profile.story.checkLog));
  assert.equal(profile.story.checkLog.length, 1);
  assert.equal(profile.story.checkLog[0].correct, true);
});

test('validateProfile: story.checkLog not an array is invalid, absent is valid', () => {
  const profile = defaultProfile();
  profile.story.checkLog = 'nope';
  const badResult = validateProfile(profile);
  assert.equal(badResult.ok, false);
  assert.ok(badResult.errors.some((e) => e.includes('story.checkLog')));

  delete profile.story.checkLog;
  const okResult = validateProfile(profile);
  assert.equal(okResult.ok, true);
});
