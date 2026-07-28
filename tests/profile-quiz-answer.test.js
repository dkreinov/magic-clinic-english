import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile, validateProfile, applyQuizAnswer, markWordKnown, migrateWordKeys } from '../lib/profile.js';
import { knownLemmaSet } from '../lib/vocab.js';

// Phase 3 / QZ-12, QZ-14. applyQuizAnswer is the strike state machine; markWordKnown
// learns to clear quiz keys on a re-claim; migrateWordKeys learns to merge the six
// quiz keys instead of dropping them.

const ALLOWED = new Set(['feel', 'run', 'cat', 'story', 'happy']);

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

// 1. Row 1 -- a correct answer.
test('applyQuizAnswer: correct answer resets strikes, clears session, never promotes', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({
    status: 'known',
    strikes: 2,
    lastStrikeSession: 's1',
    quizRight: 1,
    quizWrong: 4,
  });
  const now = '2026-02-01T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: true, sessionId: 's2', now });

  const entry = profile.words.dog;
  assert.equal(entry.strikes, 0);
  assert.equal(entry.status, 'known', 'status unchanged, never promotes');
  assert.equal(entry.needsReview, false);
  assert.ok(!('lastStrikeSession' in entry), 'lastStrikeSession deleted');
  assert.equal(entry.lastQuizAt, now);
  assert.equal(entry.quizRight, 2);
  assert.equal(entry.quizWrong, 4);
  assert.equal(validateProfile(profile).ok, true);

  // a correct answer on a learning word leaves it learning -- never promotes
  const profile2 = defaultProfile();
  profile2.words.cat = baseWordEntry({ status: 'learning', strikes: 1 });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: true, sessionId: 's1', now });
  assert.equal(profile2.words.cat.status, 'learning');
  assert.equal(validateProfile(profile2).ok, true);
});

// 2. Row 2 -- wrong, new session, count stays below 3.
test('applyQuizAnswer: wrong answer in a new session below the strike threshold increments strikes', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({ status: 'known' });
  const now = '2026-02-01T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: false, sessionId: 's1', now });

  const entry = profile.words.dog;
  assert.equal(entry.strikes, 1);
  assert.equal(entry.status, 'known');
  assert.equal(entry.needsReview, false);
  assert.equal(entry.lastStrikeSession, 's1');
  assert.equal(entry.lastQuizAt, now);
  assert.equal(entry.quizWrong, 1);
  assert.equal(validateProfile(profile).ok, true);
});

// 3. Row 3 -- wrong, new session, count reaches 3.
test('applyQuizAnswer: wrong answer in a new session reaching 3 demotes known to learning', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({ status: 'known', strikes: 2, lastStrikeSession: 's1' });
  const now = '2026-02-01T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: false, sessionId: 's2', now });

  const entry = profile.words.dog;
  assert.equal(entry.strikes, 0);
  assert.equal(entry.status, 'learning', 'known demotes to learning');
  assert.equal(entry.lastStrikeSession, 's2', 'session id kept, not deleted');
  assert.equal(entry.quizWrong, 1);
  assert.equal(validateProfile(profile).ok, true);

  // a learning word reaching 3 stays learning
  const profile2 = defaultProfile();
  profile2.words.cat = baseWordEntry({ status: 'learning', strikes: 2, lastStrikeSession: 'sA' });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: false, sessionId: 'sB', now });
  assert.equal(profile2.words.cat.status, 'learning');
  assert.equal(profile2.words.cat.strikes, 0);
  assert.equal(validateProfile(profile2).ok, true);
});

// 4. Row 4 -- wrong, same session.
test('applyQuizAnswer: wrong answer in the same session does not strike again, still moves lastQuizAt and counter', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({ status: 'known', strikes: 1, lastStrikeSession: 's1', quizWrong: 1 });
  const laterNow = '2026-02-02T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: false, sessionId: 's1', now: laterNow });

  const entry = profile.words.dog;
  assert.equal(entry.strikes, 1, 'strikes unchanged');
  assert.equal(entry.lastStrikeSession, 's1', 'session unchanged');
  assert.equal(entry.lastQuizAt, laterNow, 'lastQuizAt still moves');
  assert.equal(entry.quizWrong, 2, 'counter still increments');
  assert.equal(validateProfile(profile).ok, true);

  // QZ-11 invariant: wrong -> correct -> wrong within ONE sessionId ends at strikes === 1
  const profile2 = defaultProfile();
  profile2.words.cat = baseWordEntry({ status: 'known' });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: false, sessionId: 'sX', now: '2026-02-03T00:00:00.000Z' });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: true, sessionId: 'sX', now: '2026-02-04T00:00:00.000Z' });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: false, sessionId: 'sX', now: '2026-02-05T00:00:00.000Z' });
  assert.equal(profile2.words.cat.strikes, 1);
  assert.equal(validateProfile(profile2).ok, true);
});

// 5. Row 3 fires on a pre-existing strikes: 99 -- the >= 3 guard.
test('applyQuizAnswer: a pre-existing strikes: 99 still demotes on the next wrong answer (>= 3, not == 3)', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({ status: 'known', strikes: 99 });
  const now = '2026-02-01T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: false, sessionId: 's1', now });

  const entry = profile.words.dog;
  assert.equal(entry.status, 'learning');
  assert.equal(entry.strikes, 0);
  assert.equal(validateProfile(profile).ok, true);
});

// 6. Rows 5 and 6 -- markWordKnown.
test('markWordKnown: re-claiming an existing entry deletes quiz-strike keys; first claim adds none', () => {
  const profile = defaultProfile();
  const now = '2026-02-01T00:00:00.000Z';
  profile.words.dog = baseWordEntry({
    status: 'learning',
    strikes: 2,
    needsReview: true,
    lastStrikeSession: 's1',
    lastQuizAt: '2026-01-15T00:00:00.000Z',
    quizRight: 3,
    quizWrong: 5,
  });

  markWordKnown(profile, { lemma: 'dog', source: 'band', now });

  const entry = profile.words.dog;
  assert.ok(!('strikes' in entry), 'strikes deleted');
  assert.ok(!('needsReview' in entry), 'needsReview deleted');
  assert.ok(!('lastStrikeSession' in entry), 'lastStrikeSession deleted');
  assert.equal(entry.status, 'known');
  assert.equal(entry.lastQuizAt, '2026-01-15T00:00:00.000Z', 'lastQuizAt untouched');
  assert.equal(entry.quizRight, 3, 'quizRight untouched');
  assert.equal(entry.quizWrong, 5, 'quizWrong untouched');
  assert.equal(validateProfile(profile).ok, true);

  const profile2 = defaultProfile();
  markWordKnown(profile2, { lemma: 'newword', source: 'placement', now });
  assert.deepStrictEqual(profile2.words.newword, {
    status: 'known',
    source: 'placement',
    he: null,
    taps: 0,
    firstSeen: now,
    lastSeen: now,
  });
  assert.equal(validateProfile(profile2).ok, true);
});

// 7. The four throws, each leaving the profile unmodified. Precedence order asserted.
test('applyQuizAnswer: the four throw conditions in precedence order, each leaving the profile unmodified', () => {
  function snapshotAndAssertUnchanged(profile, fn, msgRegex) {
    const before = structuredClone(profile);
    assert.throws(fn, msgRegex);
    assert.deepStrictEqual(profile, before);
  }

  const now = '2026-02-01T00:00:00.000Z';

  // lemma required: missing, blank, non-string
  {
    const profile = defaultProfile();
    profile.words.dog = baseWordEntry({ status: 'known' });
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { correct: true, sessionId: 's1', now }), /lemma required/);
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: '   ', correct: true, sessionId: 's1', now }), /lemma required/);
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 42, correct: true, sessionId: 's1', now }), /lemma required/);
  }

  // session required: missing, blank, 65 chars
  {
    const profile = defaultProfile();
    profile.words.dog = baseWordEntry({ status: 'known' });
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'dog', correct: true, now }), /session required/);
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'dog', correct: true, sessionId: '   ', now }), /session required/);
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'dog', correct: true, sessionId: 'x'.repeat(65), now }), /session required/);
  }

  // answer required: "true", 0, 1
  {
    const profile = defaultProfile();
    profile.words.dog = baseWordEntry({ status: 'known' });
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'dog', correct: 'true', sessionId: 's1', now }), /answer required/);
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'dog', correct: 0, sessionId: 's1', now }), /answer required/);
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'dog', correct: 1, sessionId: 's1', now }), /answer required/);
  }

  // unknown word: no entry
  {
    const profile = defaultProfile();
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'ghost', correct: true, sessionId: 's1', now }), /unknown word/);
  }

  // precedence: several conditions wrong at once -- lemma required wins
  {
    const profile = defaultProfile();
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: '  ', sessionId: undefined, correct: 'yes', now }), /lemma required/);
  }

  // precedence: session required beats answer required and unknown word
  {
    const profile = defaultProfile();
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'ghost', sessionId: '', correct: 'yes', now }), /session required/);
  }

  // precedence: answer required beats unknown word
  {
    const profile = defaultProfile();
    snapshotAndAssertUnchanged(profile, () => applyQuizAnswer(profile, { lemma: 'ghost', sessionId: 's1', correct: 'yes', now }), /answer required/);
  }
});

// 8. QZ-14's six merge fields, including A4 and the "neither side has it" case.
test('migrateWordKeys: merges strikes (max), needsReview (or), counters (sum), lastQuizAt (later), lastStrikeSession (A4)', () => {
  const profile = defaultProfile();
  profile.words = {
    feel: baseWordEntry({
      strikes: 5,
      needsReview: false,
      quizRight: 2,
      quizWrong: 1,
      lastQuizAt: '2026-01-01T00:00:00.000Z',
      lastStrikeSession: 'old-session',
    }),
    feels: baseWordEntry({
      strikes: 2,
      needsReview: true,
      quizRight: 3,
      quizWrong: 4,
      lastQuizAt: '2026-01-10T00:00:00.000Z',
      // A4: the later-lastQuizAt side has NO lastStrikeSession
    }),
  };

  migrateWordKeys(profile, ALLOWED);

  const merged = profile.words.feel;
  assert.equal(merged.strikes, 5, 'strikes is the max');
  assert.equal(merged.needsReview, true, 'needsReview is the OR');
  assert.equal(merged.quizRight, 5, 'quizRight is the sum');
  assert.equal(merged.quizWrong, 5, 'quizWrong is the sum');
  assert.equal(merged.lastQuizAt, '2026-01-10T00:00:00.000Z', 'lastQuizAt is the later date');
  assert.ok(!('lastStrikeSession' in merged), 'A4: winning side had no session, so merged has none');
  assert.equal(validateProfile(profile).ok, true);

  // neither side has a given quiz key -> key not added
  const profile2 = defaultProfile();
  profile2.words = {
    story: baseWordEntry({ taps: 1 }),
    stories: baseWordEntry({ taps: 1 }),
  };
  migrateWordKeys(profile2, ALLOWED);
  const mergedNoQuiz = profile2.words.story;
  for (const key of ['strikes', 'needsReview', 'quizRight', 'quizWrong', 'lastQuizAt', 'lastStrikeSession']) {
    assert.ok(!(key in mergedNoQuiz), `${key} must not be added when neither side has it`);
  }
  assert.equal(validateProfile(profile2).ok, true);
});

// 9. A new-shape entry as the non-surviving merge side keeps its keys.
test('migrateWordKeys: a new-shape entry merged into an old-shape existing keeps its quiz keys', () => {
  const profile = defaultProfile();
  profile.words = {
    feel: baseWordEntry(), // old-shape, becomes `existing` (alphabetically first, sorted-key iteration)
    feels: baseWordEntry({
      strikes: 4,
      needsReview: true,
      quizRight: 6,
      quizWrong: 7,
      lastQuizAt: '2026-01-20T00:00:00.000Z',
      lastStrikeSession: 'sess-9',
    }),
  };

  migrateWordKeys(profile, ALLOWED);

  const merged = profile.words.feel;
  assert.equal(merged.strikes, 4);
  assert.equal(merged.needsReview, true);
  assert.equal(merged.quizRight, 6);
  assert.equal(merged.quizWrong, 7);
  assert.equal(merged.lastQuizAt, '2026-01-20T00:00:00.000Z');
  assert.equal(merged.lastStrikeSession, 'sess-9');
  assert.equal(validateProfile(profile).ok, true);
});

// 10. Idempotency, re-run on the merged result.
test('migrateWordKeys: idempotent on a real merge -- running it twice changes nothing, no word dropped', () => {
  const profile = defaultProfile();
  profile.words = {
    feel: baseWordEntry({ strikes: 1, quizRight: 2, quizWrong: 1, lastQuizAt: '2026-01-01T00:00:00.000Z' }),
    feels: baseWordEntry({ strikes: 3, quizRight: 4, quizWrong: 2, lastQuizAt: '2026-01-10T00:00:00.000Z', lastStrikeSession: 's9' }),
    running: baseWordEntry({ taps: 1 }),
  };

  migrateWordKeys(profile, ALLOWED);
  assert.deepEqual(Object.keys(profile.words).sort(), ['feel', 'run']);

  const once = structuredClone(profile.words);
  migrateWordKeys(profile, ALLOWED);
  assert.deepStrictEqual(profile.words, once, 'running it twice must change nothing');
  assert.equal(profile.words.feel.quizRight, 6, 'sum did not double-count');
  assert.equal(validateProfile(profile).ok, true);
});

// 11. B2 + B5 -- a candidate answered wrong.
test('applyQuizAnswer: a candidate answered WRONG returns to learning with its clock reset, counts the answer, and never touches the strike machinery', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({
    status: 'candidate',
    lastSeen: '2026-01-01T00:00:00.000Z',
    nominations: 1,
  });
  const now = '2026-03-01T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: false, sessionId: 's1', now });

  const entry = profile.words.dog;
  assert.equal(entry.status, 'learning');
  assert.equal(entry.lastSeen, now, 'the promotion clock resets');
  assert.equal(entry.lastQuizAt, now);
  assert.equal(entry.quizWrong, 1);
  assert.ok(!('strikes' in entry), 'strike machinery not entered');
  assert.ok(!('lastStrikeSession' in entry), 'no strike session armed');
  assert.equal(entry.nominations, 1, 'nominations untouched');
  assert.equal(validateProfile(profile).ok, true);

  // NEGATIVE CONTROL: a known word answered wrong once in a new session is
  // still known with strikes === 1 -- the one-wrong rule must not leak into her claims.
  const profile2 = defaultProfile();
  profile2.words.cat = baseWordEntry({ status: 'known' });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: false, sessionId: 's1', now });
  assert.equal(profile2.words.cat.status, 'known');
  assert.equal(profile2.words.cat.strikes, 1);
  assert.equal(validateProfile(profile2).ok, true);
});

// 12. B2 + B5 -- a candidate answered right.
test('applyQuizAnswer: a candidate answered RIGHT becomes known, clears strike bookkeeping, and leaves lastSeen alone', () => {
  const profile = defaultProfile();
  profile.words.dog = baseWordEntry({
    status: 'candidate',
    lastSeen: '2026-01-01T00:00:00.000Z',
    strikes: 2,
    needsReview: true,
    lastStrikeSession: 'old-session',
    nominations: 2,
  });
  const now = '2026-03-01T00:00:00.000Z';

  applyQuizAnswer(profile, { lemma: 'dog', correct: true, sessionId: 's1', now });

  const entry = profile.words.dog;
  assert.equal(entry.status, 'known');
  assert.ok(!('strikes' in entry), 'strikes deleted');
  assert.ok(!('needsReview' in entry), 'needsReview deleted');
  assert.ok(!('lastStrikeSession' in entry), 'lastStrikeSession deleted');
  assert.equal(entry.lastSeen, '2026-01-01T00:00:00.000Z', 'a pass must not move lastSeen');
  assert.equal(entry.quizRight, 1);
  assert.equal(entry.nominations, 2, 'nominations untouched');
  assert.equal(knownLemmaSet(profile).has('dog'), true);
  assert.equal(validateProfile(profile).ok, true);

  // NEGATIVE CONTROL: a learning word answered right is still learning
  // (QZ-12 row 1: never promotes) -- proves the branch keys on candidate exactly.
  const profile2 = defaultProfile();
  profile2.words.cat = baseWordEntry({ status: 'learning' });
  applyQuizAnswer(profile2, { lemma: 'cat', correct: true, sessionId: 's1', now });
  assert.equal(profile2.words.cat.status, 'learning');
  assert.equal(validateProfile(profile2).ok, true);
});
