import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile, migrateWordKeys, defaultProfile } from '../lib/profile.js';

// Step 1.2 / B4 (docs/growth.md section 8). "candidate" becomes a legal word
// status, sitting between "learning" and "known" in trust rank, and a word
// entry gains an optional non-negative-integer "nominations" count. A merge
// (migrateWordKeys) must resolve status by rank -- known > candidate >
// learning -- and nominations by max, staying idempotent.

function wordEntry(over = {}) {
  return {
    status: 'learning',
    source: 'tap',
    he: null,
    taps: 1,
    firstSeen: '2026-01-02T00:00:00.000Z',
    lastSeen: '2026-01-02T00:00:00.000Z',
    ...over,
  };
}

test('validateProfile accepts candidate status and an optional nominations integer, and rejects a bad one', () => {
  const okProfile = defaultProfile();
  okProfile.words.feel = wordEntry({ status: 'candidate', nominations: 1 });
  const okResult = validateProfile(okProfile);
  assert.equal(okResult.ok, true);
  assert.deepEqual(okResult.errors, []);

  for (const bad of [-1, 1.5, '1']) {
    const badProfile = defaultProfile();
    badProfile.words.feel = wordEntry({ status: 'candidate', nominations: bad });
    const badResult = validateProfile(badProfile);
    assert.equal(badResult.ok, false, `nominations ${JSON.stringify(bad)} must be invalid`);
    assert.ok(
      badResult.errors.some((e) => e.includes('nominations: expected a non-negative integer')),
      `expected a nominations error for ${JSON.stringify(bad)}, got ${JSON.stringify(badResult.errors)}`
    );
  }

  const bogusProfile = defaultProfile();
  bogusProfile.words.feel = wordEntry({ status: 'bogus' });
  const bogusResult = validateProfile(bogusProfile);
  assert.equal(bogusResult.ok, false, 'an unrecognised status must still fail validation');
});

test('migrateWordKeys merges status by rank known > candidate > learning and nominations by max', () => {
  const ALLOWED = new Set(['feel']);

  const profileA = defaultProfile();
  profileA.words = {
    feel: wordEntry({ status: 'learning', nominations: 1 }),
    feels: wordEntry({ status: 'candidate', nominations: 2 }),
  };
  migrateWordKeys(profileA, ALLOWED);
  assert.equal(profileA.words.feel.status, 'candidate', 'candidate beats learning');
  assert.equal(profileA.words.feel.nominations, 2, 'max of 1 and 2 is 2');

  // Reverse which key carries which status -- rank must decide, not key order.
  const profileB = defaultProfile();
  profileB.words = {
    feel: wordEntry({ status: 'candidate', nominations: 2 }),
    feels: wordEntry({ status: 'learning', nominations: 1 }),
  };
  migrateWordKeys(profileB, ALLOWED);
  assert.equal(profileB.words.feel.status, 'candidate');
  assert.equal(profileB.words.feel.nominations, 2);

  // known always wins over candidate.
  const profileC = defaultProfile();
  profileC.words = {
    feel: wordEntry({ status: 'known', nominations: 0 }),
    feels: wordEntry({ status: 'candidate', nominations: 5 }),
  };
  migrateWordKeys(profileC, ALLOWED);
  assert.equal(profileC.words.feel.status, 'known', 'known must not be demoted by a candidate merge');
  assert.equal(profileC.words.feel.nominations, 5);

  // Idempotence: running it a second time on its own output changes nothing.
  const once = JSON.stringify(profileA.words);
  migrateWordKeys(profileA, ALLOWED);
  assert.equal(JSON.stringify(profileA.words), once, 'a second run must change nothing');
});

test('a pre-G1 profile still validates and gains no new key', () => {
  // GUARD, not evidence: this passes before the change too. It just confirms
  // the new optional field does not get invented where it was never present.
  const profile = defaultProfile();
  profile.words.feel = wordEntry({ status: 'learning' });

  const result = validateProfile(profile);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);

  const ALLOWED = new Set(['feel']);
  migrateWordKeys(profile, ALLOWED);
  assert.equal('nominations' in profile.words.feel, false, 'no merge occurred, so no key was invented');
});
