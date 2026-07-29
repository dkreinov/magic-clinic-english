// word-trophies phase 1, step 1.1 -- T1 schema (.oplan/word-trophies/design.md)
import { test } from 'node:test';
import assert from 'node:assert';
import { defaultProfile, validateProfile } from '../lib/profile.js';

const NOW = '2026-01-01T00:00:00.000Z';

test('defaultProfile carries an empty trophies map', () => {
  const profile = defaultProfile(NOW);
  assert.deepStrictEqual(profile.trophies, {});
  assert.ok('trophies' in profile);
  assert.deepStrictEqual(validateProfile(defaultProfile(NOW)), { ok: true, errors: [] });
});

test('validateProfile accepts an absent trophies key, an empty map, unknown trophy ids, and all three tier keys', () => {
  const p1 = defaultProfile(NOW);
  delete p1.trophies;
  const r1 = validateProfile(p1);
  assert.deepStrictEqual(r1.errors, []);

  const p2 = defaultProfile(NOW);
  p2.trophies = {};
  const r2 = validateProfile(p2);
  assert.deepStrictEqual(r2.errors, []);

  const p3 = defaultProfile(NOW);
  p3.trophies = { zzzFutureTrophy: { bronze: NOW } };
  const r3 = validateProfile(p3);
  assert.deepStrictEqual(r3.errors, []);

  const p4 = defaultProfile(NOW);
  p4.trophies = { known: { bronze: NOW, silver: NOW, gold: NOW } };
  const r4 = validateProfile(p4);
  assert.deepStrictEqual(r4.errors, []);
});

test('validateProfile rejects a non-object trophies, a non-object trophy entry, an unknown tier key, and an unparseable award timestamp', () => {
  const p1 = defaultProfile(NOW);
  p1.trophies = { known: { platinum: NOW }, days: { bronze: 'nope' }, streak: 5 };
  const r1 = validateProfile(p1);
  const expected1 = [
    'trophies.days.bronze: expected a parseable date string',
    'trophies.known.platinum: unknown tier key',
    'trophies.streak: expected an object',
  ];
  assert.deepStrictEqual([...r1.errors].sort(), [...expected1].sort());

  const p2 = defaultProfile(NOW);
  p2.trophies = 'oops';
  const r2 = validateProfile(p2);
  assert.deepStrictEqual(r2.errors, ['trophies: expected an object']);
});
