import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { pickPairs, buildCards, isMatch, renderBoard, startMatchGame } from '../public/match-game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const modulePath = path.join(root, 'public', 'match-game.js');

function seededRand(seq) {
  let i = 0;
  return () => seq[i++ % seq.length];
}

test('match-game.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', modulePath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('pickPairs only keeps entries with both word and he, and never exceeds what is usable', () => {
  const examWords = [
    { word: 'cat', he: 'חתול' },
    { word: 'dog', he: '' },
    { word: 'bird' },
    { word: 'fish', he: 'דג' },
  ];
  const pairs = pickPairs(examWords, 10, Math.random);
  assert.strictEqual(pairs.length, 2, 'only cat and fish have both sides');
  assert.ok(pairs.every((p) => p.he), 'every returned pair has a non-empty he');

  const limited = pickPairs(examWords, 1, Math.random);
  assert.strictEqual(limited.length, 1);
});

test('pickPairs is deterministic under an injected rand', () => {
  const examWords = [
    { word: 'a', he: '1' },
    { word: 'b', he: '2' },
    { word: 'c', he: '3' },
  ];
  const rand = seededRand([0.9, 0.1, 0.5]);
  const first = pickPairs(examWords, 3, seededRand([0.9, 0.1, 0.5]));
  const second = pickPairs(examWords, 3, seededRand([0.9, 0.1, 0.5]));
  assert.deepStrictEqual(first, second);
  void rand;
});

test('buildCards makes exactly two cards per pair, one en and one he, sharing a pairId', () => {
  const pairs = [
    { word: 'cat', he: 'חתול' },
    { word: 'dog', he: 'כלב' },
  ];
  const cards = buildCards(pairs, Math.random);
  assert.strictEqual(cards.length, 4);

  const byPair = new Map();
  for (const c of cards) {
    if (!byPair.has(c.pairId)) byPair.set(c.pairId, []);
    byPair.get(c.pairId).push(c);
  }
  assert.strictEqual(byPair.size, 2);
  for (const [, group] of byPair) {
    assert.strictEqual(group.length, 2);
    const kinds = group.map((c) => c.kind).sort();
    assert.deepStrictEqual(kinds, ['en', 'he']);
  }

  const ids = new Set(cards.map((c) => c.id));
  assert.strictEqual(ids.size, 4, 'every card id is unique');
});

test('isMatch: true for the two cards of the same pair, false for itself or a different pair', () => {
  const cards = buildCards([{ word: 'cat', he: 'חתול' }, { word: 'dog', he: 'כלב' }], Math.random);
  const [a, b, c] = cards;
  assert.strictEqual(isMatch(a, a), false, 'a card can never match itself');
  const samePair = cards.find((x) => x.pairId === a.pairId && x.id !== a.id);
  assert.strictEqual(isMatch(a, samePair), true);
  const otherPair = cards.find((x) => x.pairId !== a.pairId);
  assert.strictEqual(isMatch(a, otherPair), false);
  void b;
  void c;
});

test('renderBoard: face-down shows no text, flipped shows text with correct dir, matched is disabled', () => {
  const cards = [
    { id: 'en-0', pairId: 0, kind: 'en', text: 'cat' },
    { id: 'he-0', pairId: 0, kind: 'he', text: 'חתול' },
  ];
  const facedown = renderBoard(cards, {});
  assert.ok(!facedown.includes('cat'), 'face-down card must not leak its text');
  assert.ok(!facedown.includes('disabled'));

  const flipped = renderBoard(cards, { flippedIds: ['en-0'] });
  assert.ok(flipped.includes('dir="ltr"'), 'an english card flips face up with ltr');
  const heFlipped = renderBoard(cards, { flippedIds: ['he-0'] });
  assert.ok(heFlipped.includes('dir="rtl"'), 'a hebrew card flips face up with rtl');

  const matched = renderBoard(cards, { matchedIds: new Set(['en-0', 'he-0']) });
  assert.ok(matched.includes('match-card up matched'));
  const matchedButtons = (matched.match(/disabled/g) || []).length;
  assert.strictEqual(matchedButtons, 2, 'both matched cards must be disabled');
});

test('renderBoard escapes card text', () => {
  const cards = [{ id: 'en-0', pairId: 0, kind: 'en', text: '<script>&' }];
  const html = renderBoard(cards, { flippedIds: ['en-0'] });
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('startMatchGame with fewer than 2 usable pairs shows a graceful message and still offers exit', async () => {
  const container = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
  const calls = [];
  container.querySelector = (sel) => {
    if (sel.includes('match-exit')) {
      return { addEventListener: (_, fn) => calls.push(fn) };
    }
    return null;
  };
  await startMatchGame(container, { examWords: [{ word: 'lonely', he: 'בודד' }], onExit: () => {} });
  assert.ok(container.innerHTML.includes('אין עדיין'), 'must explain there are not enough words, not crash');
  assert.strictEqual(calls.length, 1, 'the exit button must still be wired');
});

test('exam-words.js wires the matching game: import, launcher, and handler', () => {
  const viewSrc = readFileSync(path.join(root, 'public', 'views', 'exam-words.js'), 'utf8');
  const needles = [
    '../match-game.js',
    'startMatchGame',
    'data-action="start-match"',
    'משחק זיכרון',
  ];
  for (const needle of needles) {
    assert.ok(viewSrc.includes(needle), `exam-words.js missing "${needle}"`);
  }
});
