import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { profileKeyFor, resolveTokens, renderCards } from '../public/views/exam-words.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'exam-words.js');

test('exam-words.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('exam-words.js exports render(container, ctx)', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.match(src, /export\s+(async\s+)?function\s+render/);
});

test('exam-words.js wires pronunciation, mark-known and the collect-band-words bulk import', () => {
  const src = readFileSync(viewPath, 'utf8');
  const needles = [
    'saySlot',
    'data-say',
    'new Audio',
    '/audio/words/',
    '.aac',
    'encodeURIComponent',
    '/api/profile',
    'collect-band-words',
    'markKnownBody',
    'data-action="know"',
    'startQuiz',
    'knownSetFromProfile',
    'data-action="start-quiz"',
    'יודעת את זה',
  ];
  for (const needle of needles) {
    assert.ok(src.includes(needle), `exam-words.js missing "${needle}"`);
  }
});

test('exam-words.js never calls maybeCelebrateTrophy -- T5/SK3-11 caps celebration at three files', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(!src.includes('maybeCelebrateTrophy'), 'a fourth celebration hook must never be added here');
});

test('profileKeyFor resolves a surface form to its manifest lemma, and falls back to itself when unresolvable', () => {
  const allowed = new Set(['cookie', 'sofa']);
  assert.strictEqual(profileKeyFor('cookies', allowed), 'cookie');
  assert.strictEqual(profileKeyFor('Sofa', allowed), 'sofa');
  assert.strictEqual(profileKeyFor('ice cream', allowed), 'ice cream');
});

test('resolveTokens splits a phrase into its whitespace tokens and requires every token to resolve', () => {
  const allowed = new Set(['ice', 'cream', 'sofa']);
  assert.deepStrictEqual(resolveTokens('ice cream', allowed), ['ice', 'cream']);
  assert.deepStrictEqual(resolveTokens('Sofa', allowed), ['sofa']);
  assert.strictEqual(resolveTokens('children', allowed), null, 'no clip for this word at all');
  assert.strictEqual(resolveTokens('ice storm', allowed), null, 'one token unresolved fails the whole phrase');
});

test('renderCards: know button only on learning/candidate, badge only when a profile exists, he prefers the profile over the pre-baked value', () => {
  const allowed = new Set(['cookie', 'sofa']);
  const examWords = [
    { word: 'cookies', he: 'BAKED' },
    { word: 'sofa', he: 'BAKED' },
    { word: 'children', he: 'BAKED' },
  ];
  const profile = {
    words: {
      cookie: { status: 'learning', he: 'LIVE' },
      sofa: { status: 'known', he: 'LIVE' },
      // "children" deliberately absent from profile.words
    },
  };

  const withProfile = renderCards(examWords, allowed, profile);
  const cookieRow = withProfile.slice(withProfile.indexOf('cookies'), withProfile.indexOf('sofa'));
  const sofaRow = withProfile.slice(withProfile.indexOf('>sofa<'), withProfile.indexOf('children'));
  const childrenRow = withProfile.slice(withProfile.indexOf('children'));

  assert.ok(cookieRow.includes('data-lemma="cookie"'), 'learning row must have a know button');
  assert.ok(cookieRow.includes('LIVE'), 'must show the live profile translation, not the pre-baked one');
  assert.ok(!cookieRow.includes('BAKED'));

  assert.ok(!sofaRow.includes('data-action="know"'), 'known row must not offer a know button');
  assert.ok(sofaRow.includes('exam-badge known'));

  assert.ok(!childrenRow.includes('data-action="know"'), 'a word absent from her profile gets no know button');
  assert.ok(!childrenRow.includes('exam-badge'), 'a word absent from her profile gets no badge');
  assert.ok(childrenRow.includes('BAKED'), 'falls back to the pre-baked translation with no profile entry');
  assert.ok(childrenRow.includes('btn-say na'), 'children has no clip and must show the crossed-out speaker');
  assert.ok(childrenRow.includes('coming soon'));

  const withoutProfile = renderCards(examWords, allowed, null);
  assert.ok(!withoutProfile.includes('data-action="know"'), 'no profile at all: no know buttons anywhere');
  assert.ok(!withoutProfile.includes('exam-badge'), 'no profile at all: no badges anywhere');
  assert.ok(withoutProfile.includes('BAKED'), 'falls back entirely to the pre-baked translations');
});

test('renderCards shows the example sentence, sourced from exam-words.json only, never the profile', () => {
  const allowed = new Set();
  const withSentence = renderCards([{ word: 'sofa', he: 'x', sentence: 'I sit on the sofa.' }], allowed, null);
  assert.ok(withSentence.includes('exam-card-sentence'));
  assert.ok(withSentence.includes('I sit on the sofa.'));

  const noSentence = renderCards([{ word: 'sofa', he: 'x' }], allowed, null);
  assert.ok(!noSentence.includes('exam-card-sentence'), 'no sentence paragraph when the entry has none');
});

test('renderCards escapes he, word and sentence text', () => {
  const allowed = new Set();
  const html = renderCards([{ word: 'x', he: '<script>&', sentence: '<b>bad</b>' }], allowed, null);
  assert.ok(!html.includes('<script>'), 'he must be escaped, not rendered raw');
  assert.ok(!html.includes('<b>bad</b>'), 'sentence must be escaped, not rendered raw');
  assert.ok(html.includes('&lt;script&gt;'));
});
