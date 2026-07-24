import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseForms } from '../lib/vocab.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'data', 'placement-items.json');
const band1Path = path.join(__dirname, '..', 'data', 'band1.json');

// Frozen list — duplicated VERBATIM from scripts/build-item-bank.js.
const FUNCTION_FORMS = [
  'is', 'are', 'was', 'were', 'am', 'been', 'being', 'has', 'had', 'did', 'done', 'does', 'went', 'gone',
  'said', 'saw', 'seen', 'got', 'made', 'came', 'come', 'took', 'taken', 'ran', 'ate', 'gave', 'given',
  'found', 'knew', 'known', 'put', 'let', 'its', 'an', 'her', 'him', 'his', 'hers', 'them', 'they',
  'their', 'theirs', 'us', 'our', 'ours', 'me', 'my', 'mine', 'your', 'yours',
];

const HEBREW_RE = /[֐-׿]/;
const PICTOGRAPHIC_RE = /\p{Extended_Pictographic}/u;
const LEMMA_RE = /^[a-z]+$/;

function loadBank() {
  const raw = fs.readFileSync(bankPath, 'utf-8');
  return JSON.parse(raw);
}

function loadBand1() {
  const raw = fs.readFileSync(band1Path, 'utf-8');
  return JSON.parse(raw);
}

function buildAllowedTokens(band1) {
  const allowed = new Set();
  for (const entry of band1.entries) {
    const matches = String(entry.lemma).toLowerCase().match(/[a-z]+/g) || [];
    for (const m of matches) allowed.add(m);
  }
  for (const f of FUNCTION_FORMS) allowed.add(f);
  return allowed;
}

function tokenizeEnglish(text) {
  return String(text).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
}

test('placement-items.json parses and meta counts are consistent', () => {
  const bank = loadBank();
  assert.ok(bank && typeof bank === 'object');
  assert.ok(bank.meta && typeof bank.meta === 'object');
  assert.strictEqual(bank.meta.task1Count, bank.task1.length);
  assert.ok(
    bank.task1.length >= 10 && bank.task1.length <= 16,
    `task1.length ${bank.task1.length} out of range [10, 16]`
  );
  assert.strictEqual(bank.meta.task2TextCount, 2);
  assert.strictEqual(bank.meta.task2QuestionCount, 6);
});

test('every task1 item passes the schema and invariants', () => {
  const bank = loadBank();
  const band1 = loadBand1();
  const band1Sections = new Map(band1.entries.map((e) => [e.lemma, e.section]));

  const seenEmoji = new Set();
  const seenIds = new Set();

  for (const item of bank.task1) {
    assert.match(item.id, /^t1-\d{2}$/, `bad id: ${item.id}`);
    assert.ok(!seenIds.has(item.id), `duplicate id: ${item.id}`);
    seenIds.add(item.id);

    assert.ok(
      item.direction === 'audio-to-picture' || item.direction === 'picture-to-word',
      `bad direction for ${item.id}`
    );
    assert.match(item.lemma, LEMMA_RE, `bad lemma for ${item.id}: ${item.lemma}`);
    assert.strictEqual(typeof item.he, 'string');
    assert.ok(item.he.length > 0, `empty he for ${item.id}`);
    assert.match(item.he, HEBREW_RE, `he not Hebrew for ${item.id}`);
    assert.strictEqual(typeof item.emoji, 'string');
    assert.ok(item.emoji.length > 0, `empty emoji for ${item.id}`);

    assert.ok(Array.isArray(item.options) && item.options.length === 4, `options not len 4 for ${item.id}`);
    assert.strictEqual(new Set(item.options).size, 4, `options not distinct for ${item.id}`);
    assert.ok(
      Number.isInteger(item.correctIndex) && item.correctIndex >= 0 && item.correctIndex <= 3,
      `bad correctIndex for ${item.id}`
    );

    const expectedCorrect = item.direction === 'audio-to-picture' ? item.emoji : item.lemma;
    assert.strictEqual(item.options[item.correctIndex], expectedCorrect, `correctIndex mismatch for ${item.id}`);

    assert.ok(item.section === 'preBandI' || item.section === 'bandI', `bad section for ${item.id}`);
    assert.ok(band1Sections.has(item.lemma), `lemma not found in band1 for ${item.id}: ${item.lemma}`);
    assert.strictEqual(
      band1Sections.get(item.lemma),
      item.section,
      `section mismatch with band1 for ${item.id}`
    );

    assert.ok(!seenEmoji.has(item.emoji), `duplicate emoji across items: ${item.emoji}`);
    seenEmoji.add(item.emoji);

    if (item.direction === 'audio-to-picture') {
      assert.strictEqual(item.audio, `audio/word-${item.lemma}.mp3`, `bad audio path for ${item.id}`);
      for (const opt of item.options) {
        assert.match(opt, PICTOGRAPHIC_RE, `option not pictographic for ${item.id}: ${opt}`);
      }
    } else {
      assert.ok(!('audio' in item), `unexpected audio key on picture-to-word item ${item.id}`);
      for (const opt of item.options) {
        assert.match(opt, LEMMA_RE, `option not lemma-shaped for ${item.id}: ${opt}`);
      }
    }
  }
});

test('task2 has exactly 2 texts with 3 questions each and well-formed ids/options', () => {
  const bank = loadBank();
  assert.ok(Array.isArray(bank.task2) && bank.task2.length === 2, 'task2 must have exactly 2 items');

  const validIds = ['t2-t1', 't2-t2'];
  for (let i = 0; i < bank.task2.length; i++) {
    const t = bank.task2[i];
    assert.strictEqual(t.id, validIds[i], `bad task2 id at index ${i}`);
    assert.strictEqual(typeof t.title, 'string');
    assert.match(t.title, HEBREW_RE, `title not Hebrew for ${t.id}`);
    assert.strictEqual(typeof t.text, 'string');
    assert.ok(t.text.length > 0, `empty text for ${t.id}`);
    assert.ok(!/'/.test(t.text), `apostrophe found in text for ${t.id}`);

    assert.ok(Array.isArray(t.questions) && t.questions.length === 3, `bad questions length for ${t.id}`);
    for (let qi = 0; qi < t.questions.length; qi++) {
      const q = t.questions[qi];
      const expectedId = `${t.id}-q${qi + 1}`;
      assert.strictEqual(q.id, expectedId, `bad question id for ${t.id}`);
      assert.strictEqual(typeof q.prompt, 'string');
      assert.match(q.prompt, HEBREW_RE, `prompt not Hebrew for ${q.id}`);
      assert.ok(Array.isArray(q.options) && q.options.length === 4, `bad options length for ${q.id}`);
      assert.strictEqual(new Set(q.options).size, 4, `options not distinct for ${q.id}`);
      for (const opt of q.options) {
        assert.match(opt, HEBREW_RE, `option not Hebrew for ${q.id}: ${opt}`);
      }
      assert.ok(
        Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3,
        `bad correctIndex for ${q.id}`
      );
    }
  }
});

test('task2 texts use only vocabulary from the allowed word list', () => {
  const bank = loadBank();
  const band1 = loadBand1();
  const allowedTokens = buildAllowedTokens(band1);

  for (const t of bank.task2) {
    const tokens = tokenizeEnglish(t.text);
    for (const token of tokens) {
      const bases = baseForms(token);
      const ok = bases.some((b) => allowedTokens.has(b));
      assert.ok(ok, `token "${token}" in text "${t.id}" has no base form in the allowed word list`);
    }
  }
});
