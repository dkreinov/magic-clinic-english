import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile, validateProfile, applyWordTap, markWordKnown } from '../lib/profile.js';

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
