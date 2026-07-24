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

test('all mutations produce a profile that passes validateProfile', () => {
  const profile = defaultProfile();
  applyWordTap(profile, { lemma: 'Dog ', he: 'כלב', now: '2026-01-01T00:00:00.000Z' });
  applyWordTap(profile, { lemma: 'dog', now: '2026-01-02T00:00:00.000Z' });
  markWordKnown(profile, { lemma: 'cat', source: 'placement', now: '2026-01-01T00:00:00.000Z' });
  markWordKnown(profile, { lemma: 'dog', source: 'band', now: '2026-01-03T00:00:00.000Z' });

  const result = validateProfile(profile);
  assert.equal(result.ok, true);
});
