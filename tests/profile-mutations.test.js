import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile, validateProfile, applyWordTap, markWordKnown, migrateWordKeys } from '../lib/profile.js';

test('applyWordTap: new tap normalizes lemma and creates entry', () => {
  const profile = defaultProfile();
  const now = '2026-01-01T00:00:00.000Z';
  applyWordTap(profile, { lemma: 'Dog ', he: 'כלב', now });

  const entry = profile.words.dog;
  assert.ok(entry, 'entry created at normalized key "dog"');
  assert.equal(entry.status, 'learning');
  assert.equal(entry.source, 'tap');
  assert.equal(entry.taps, 1);
  assert.equal(entry.he, 'כלב');
  assert.equal(entry.firstSeen, now);
  assert.equal(entry.lastSeen, now);
});

test('applyWordTap: second tap increments taps and updates lastSeen only', () => {
  const profile = defaultProfile();
  const firstNow = '2026-01-01T00:00:00.000Z';
  const laterNow = '2026-01-02T00:00:00.000Z';

  applyWordTap(profile, { lemma: 'Dog ', he: 'כלב', now: firstNow });
  applyWordTap(profile, { lemma: 'dog', now: laterNow });

  const entry = profile.words.dog;
  assert.equal(entry.taps, 2);
  assert.equal(entry.lastSeen, laterNow);
  assert.equal(entry.firstSeen, firstNow);
  assert.equal(entry.status, 'learning');
});

test('markWordKnown: new lemma with source "placement" creates known entry with 0 taps', () => {
  const profile = defaultProfile();
  const now = '2026-01-01T00:00:00.000Z';
  markWordKnown(profile, { lemma: 'cat', source: 'placement', now });

  const entry = profile.words.cat;
  assert.equal(entry.status, 'known');
  assert.equal(entry.source, 'placement');
  assert.equal(entry.taps, 0);
  assert.equal(entry.firstSeen, now);
  assert.equal(entry.lastSeen, now);
});

test('markWordKnown: on already-tapped lemma flips status, preserves taps and source', () => {
  const profile = defaultProfile();
  const firstNow = '2026-01-01T00:00:00.000Z';
  const secondNow = '2026-01-02T00:00:00.000Z';
  const knownNow = '2026-01-03T00:00:00.000Z';

  applyWordTap(profile, { lemma: 'dog', now: firstNow });
  applyWordTap(profile, { lemma: 'dog', now: secondNow });
  markWordKnown(profile, { lemma: 'dog', source: 'band', now: knownNow });

  const entry = profile.words.dog;
  assert.equal(entry.status, 'known');
  assert.equal(entry.taps, 2);
  assert.equal(entry.source, 'tap');
  assert.equal(entry.lastSeen, knownNow);
});

test('markWordKnown: missing source and invalid source both throw', () => {
  const profile = defaultProfile();
  assert.throws(() => markWordKnown(profile, { lemma: 'dog' }), /invalid source/);
  assert.throws(() => markWordKnown(profile, { lemma: 'dog', source: 'bogus' }), /invalid source/);
});

test('applyWordTap: blank lemma throws', () => {
  const profile = defaultProfile();
  assert.throws(() => applyWordTap(profile, { lemma: '' }), /lemma required/);
  assert.throws(() => applyWordTap(profile, { lemma: '   ' }), /lemma required/);
});

test('applyWordTap: first tap with a context stores it truncated to 200 characters', () => {
  const profile = defaultProfile();
  const now = '2026-01-01T00:00:00.000Z';
  const longContext = 'x'.repeat(250);
  applyWordTap(profile, { lemma: 'dog', context: longContext, now });

  const entry = profile.words.dog;
  assert.equal(entry.context.length, 200);
  assert.equal(entry.context, longContext.slice(0, 200));
});

test('applyWordTap: unusable context is never stored, and an existing context is never overwritten on re-tap', () => {
  const profile = defaultProfile();
  const firstNow = '2026-01-01T00:00:00.000Z';
  const laterNow = '2026-01-02T00:00:00.000Z';

  applyWordTap(profile, { lemma: 'cat', context: '   ', now: firstNow });
  const noContextEntry = profile.words.cat;
  assert.ok(!('context' in noContextEntry));

  applyWordTap(profile, { lemma: 'dog', context: 'The dog ran fast.', now: firstNow });
  applyWordTap(profile, { lemma: 'dog', context: 'A different sentence.', now: laterNow });
  const dogEntry = profile.words.dog;
  assert.equal(dogEntry.context, 'The dog ran fast.');
});

test('validateProfile: a pre-context profile fixture (no context key) still validates', () => {
  const profile = defaultProfile();
  profile.words.dog = {
    status: 'learning',
    source: 'tap',
    he: 'כלב',
    taps: 1,
    firstSeen: '2026-01-01T00:00:00.000Z',
    lastSeen: '2026-01-01T00:00:00.000Z',
  };

  const result = validateProfile(profile);
  assert.equal(result.ok, true);
});

test('all mutations produce a profile that passes validateProfile', () => {
  const profile = defaultProfile();
  applyWordTap(profile, { lemma: 'Dog ', he: 'כלב', now: '2026-01-01T00:00:00.000Z' });
  applyWordTap(profile, { lemma: 'dog', now: '2026-01-02T00:00:00.000Z' });
  markWordKnown(profile, { lemma: 'cat', source: 'placement', now: '2026-01-01T00:00:00.000Z' });
  markWordKnown(profile, { lemma: 'dog', source: 'band', now: '2026-01-03T00:00:00.000Z' });

  const result = validateProfile(profile);
  assert.equal(result.ok, true);
});

// Phase 3 / WB-5. This runs on every profile load, against her real collection,
// so the two things that matter are: it never loses a word, and running it twice
// changes nothing.
const ALLOWED = new Set(['feel', 'run', 'cat', 'story', 'happy']);

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

test('migrateWordKeys folds surface forms into the lemma and merges them', () => {
  const profile = defaultProfile();
  profile.words = {
    feel: wordEntry({ taps: 2, he: 'להרגיש', firstSeen: '2026-01-01T00:00:00.000Z', lastSeen: '2026-01-01T00:00:00.000Z' }),
    feels: wordEntry({ taps: 3, status: 'known', lastSeen: '2026-01-05T00:00:00.000Z', context: 'She feels happy.' }),
    running: wordEntry({ taps: 1 }),
  };

  migrateWordKeys(profile, ALLOWED);

  assert.deepEqual(Object.keys(profile.words).sort(), ['feel', 'run']);
  const feel = profile.words.feel;
  assert.equal(feel.taps, 5, 'taps are summed');
  assert.equal(feel.status, 'known', 'known beats learning');
  assert.equal(feel.he, 'להרגיש', 'the non-null Hebrew survives');
  assert.equal(feel.context, 'She feels happy.', 'a context is not lost in the merge');
  assert.equal(feel.firstSeen, '2026-01-01T00:00:00.000Z', 'earliest firstSeen wins');
  assert.equal(feel.lastSeen, '2026-01-05T00:00:00.000Z', 'latest lastSeen wins');
});

test('migrateWordKeys is idempotent and never drops a word it cannot resolve', () => {
  const profile = defaultProfile();
  profile.words = {
    cats: wordEntry({ taps: 2 }),
    cat: wordEntry({ taps: 1 }),
    zzzunknown: wordEntry({ taps: 7 }),
  };

  migrateWordKeys(profile, ALLOWED);
  const once = JSON.stringify(profile.words);
  migrateWordKeys(profile, ALLOWED);
  assert.equal(JSON.stringify(profile.words), once, 'running it twice must change nothing');

  assert.equal(profile.words.cat.taps, 3);
  assert.ok(profile.words.zzzunknown, 'an unresolvable word is kept, never dropped');
  assert.equal(profile.words.zzzunknown.taps, 7);
});

test('migrateWordKeys leaves an already-lemma profile semantically untouched, and it still validates', () => {
  const profile = defaultProfile();
  profile.words = { feel: wordEntry(), cat: wordEntry({ status: 'known' }) };
  const before = structuredClone(profile.words);

  migrateWordKeys(profile, ALLOWED);

  // Key ORDER may change -- the migration iterates sorted so that merges are
  // deterministic, and the dictionary sorts by lastSeen for display anyway.
  // Nothing about the content may change.
  assert.deepEqual(profile.words, before);
  assert.deepEqual(Object.keys(profile.words).sort(), ['cat', 'feel']);
  assert.equal(validateProfile(profile).ok, true);
});
