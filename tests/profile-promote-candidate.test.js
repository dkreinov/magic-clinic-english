import test from 'node:test';
import assert from 'node:assert/strict';
import { promoteToCandidate } from '../lib/profile.js';
import { knownLemmaSet } from '../lib/vocab.js';

// Step 1.3 / G1 (docs/growth.md section 5.1) with the B5 nomination cap.
// A "learning" word is promoted to "candidate" once it has appeared -- via
// baseForms, the same matcher coverageAgainst already uses -- in at least
// KNOWN_AFTER_QUIET_CHAPTERS chapters whose generatedAt is strictly later
// than that word's lastSeen. Automatic nominations stop at MAX_AUTO_NOMINATIONS.

function wordEntry(over = {}) {
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

function chapter(text, generatedAt) {
  return { text, generatedAt };
}

test('two chapters generated after lastSeen promote a learning word; one is not enough', () => {
  const promoted = {
    words: { dragon: wordEntry() },
    story: {
      chapters: [
        chapter('The dragons came.', '2026-02-01T00:00:00.000Z'),
        chapter('A dragon slept.', '2026-03-01T00:00:00.000Z'),
      ],
    },
  };
  promoteToCandidate(promoted);
  assert.equal(promoted.words.dragon.status, 'candidate');
  assert.equal(promoted.words.dragon.nominations, 1);

  const notEnough = {
    words: { dragon: wordEntry() },
    story: {
      chapters: [chapter('The dragons came.', '2026-02-01T00:00:00.000Z')],
    },
  };
  promoteToCandidate(notEnough);
  assert.equal(notEnough.words.dragon.status, 'learning');
  assert.equal('nominations' in notEnough.words.dragon, false);
});

test('inflected chapter forms match, and chapters generated before lastSeen never count', () => {
  const inflectedDragon = {
    words: { dragon: wordEntry() },
    story: {
      chapters: [
        chapter('The dragons roared.', '2026-02-01T00:00:00.000Z'),
        chapter('Another dragon appeared.', '2026-03-01T00:00:00.000Z'),
      ],
    },
  };
  promoteToCandidate(inflectedDragon);
  assert.equal(inflectedDragon.words.dragon.status, 'candidate', 'dragons matches dragon');

  const inflectedCamp = {
    words: { camp: wordEntry() },
    story: {
      chapters: [
        chapter('We are camping tonight.', '2026-02-01T00:00:00.000Z'),
        chapter('More camping happened.', '2026-03-01T00:00:00.000Z'),
      ],
    },
  };
  promoteToCandidate(inflectedCamp);
  assert.equal(inflectedCamp.words.camp.status, 'candidate', 'camping matches camp');

  const tooEarly = {
    words: { dragon: wordEntry({ lastSeen: '2026-05-01T00:00:00.000Z' }) },
    story: {
      chapters: [
        chapter('The dragons came.', '2026-02-01T00:00:00.000Z'),
        chapter('A dragon slept.', '2026-03-01T00:00:00.000Z'),
      ],
    },
  };
  promoteToCandidate(tooEarly);
  assert.equal(tooEarly.words.dragon.status, 'learning', 'both chapters are before lastSeen');
  assert.equal('nominations' in tooEarly.words.dragon, false);

  const missingGeneratedAt = {
    words: { dragon: wordEntry() },
    story: {
      chapters: [
        chapter('The dragons came.', undefined),
        chapter('A dragon slept.', '2026-03-01T00:00:00.000Z'),
      ],
    },
  };
  promoteToCandidate(missingGeneratedAt);
  assert.equal(missingGeneratedAt.words.dragon.status, 'learning', 'a missing generatedAt is skipped');
  assert.equal('nominations' in missingGeneratedAt.words.dragon, false);
});

test('promoteToCandidate never touches known or candidate words and never enters knownLemmaSet', () => {
  const chapters = [
    chapter('The dragons came.', '2026-02-01T00:00:00.000Z'),
    chapter('A dragon slept.', '2026-03-01T00:00:00.000Z'),
  ];

  const profile = {
    words: {
      dragon: wordEntry({ status: 'known' }),
      castle: wordEntry({ status: 'candidate', nominations: 1 }),
    },
    story: { chapters: [chapter('The dragons and the castles.', '2026-04-01T00:00:00.000Z')] },
  };
  const before = JSON.stringify(profile);
  promoteToCandidate(profile);
  assert.equal(JSON.stringify(profile), before, 'known and candidate entries are byte-identical after the call');

  const learningProfile = {
    words: { dragon: wordEntry() },
    story: { chapters },
  };
  promoteToCandidate(learningProfile);
  assert.equal(learningProfile.words.dragon.status, 'candidate');
  assert.equal(knownLemmaSet(learningProfile).has('dragon'), false, 'candidate must never enter knownLemmaSet');
});

test('automatic nominations stop at MAX_AUTO_NOMINATIONS and the function is idempotent', () => {
  const chapters = [
    chapter('The dragons came.', '2026-02-01T00:00:00.000Z'),
    chapter('A dragon slept.', '2026-03-01T00:00:00.000Z'),
  ];

  const capped = {
    words: { dragon: wordEntry({ nominations: 2 }) },
    story: { chapters },
  };
  const cappedBefore = JSON.stringify(capped);
  promoteToCandidate(capped);
  assert.equal(capped.words.dragon.status, 'learning', 'capped at MAX_AUTO_NOMINATIONS: not promoted again');
  assert.equal(capped.words.dragon.nominations, 2);
  assert.equal(JSON.stringify(capped), cappedBefore, 'a capped entry is left byte-identical');

  const oneToGo = {
    words: { dragon: wordEntry({ nominations: 1 }) },
    story: { chapters },
  };
  promoteToCandidate(oneToGo);
  assert.equal(oneToGo.words.dragon.status, 'candidate');
  assert.equal(oneToGo.words.dragon.nominations, 2);

  // Idempotence, across every fixture used above.
  for (const profile of [capped, oneToGo]) {
    const once = JSON.stringify(profile);
    promoteToCandidate(profile);
    assert.equal(JSON.stringify(profile), once, 'calling promoteToCandidate twice changes nothing');
  }
});
