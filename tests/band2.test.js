import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'band2.json');

function loadBand2() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

test('data/band2.json parses and meta counts are within expected ranges', () => {
  const data = loadBand2();
  assert.ok(data && typeof data === 'object');
  assert.ok(Array.isArray(data.entries));
  assert.strictEqual(data.meta.entryCount, data.entries.length);
  assert.ok(
    data.meta.entryCount >= 1900 && data.meta.entryCount <= 2200,
    `entryCount ${data.meta.entryCount} out of range [1900, 2200]`
  );
  const singleWordCount = data.entries.filter((e) => e.single).length;
  assert.strictEqual(data.meta.singleWordCount, singleWordCount);
  assert.ok(
    data.meta.singleWordCount >= 1400,
    `singleWordCount ${data.meta.singleWordCount} below expected minimum 1400`
  );
});

test('every entry passes the schema', () => {
  const data = loadBand2();
  const singlePattern = /^[a-z]+$/;
  for (const e of data.entries) {
    assert.strictEqual(typeof e.lemma, 'string');
    assert.ok(e.lemma.length > 0);
    assert.strictEqual(e.lemma, e.lemma.toLowerCase());
    assert.strictEqual(e.lemma, e.lemma.trim());
    assert.ok(e.pos === null || typeof e.pos === 'string');
    assert.ok(e.meaning === null || typeof e.meaning === 'string');
    assert.ok(e.reg === 'Prod' || e.reg === 'Rec' || e.reg === null);
    assert.ok(e.section === 'bandIIcoreI' || e.section === 'bandIIcoreII');
    assert.strictEqual(typeof e.single, 'boolean');
    assert.strictEqual(e.single, singlePattern.test(e.lemma));
  }
});

test('both sections are present and substantial', () => {
  const data = loadBand2();
  const coreICount = data.entries.filter((e) => e.section === 'bandIIcoreI').length;
  const coreIICount = data.entries.filter((e) => e.section === 'bandIIcoreII').length;
  assert.ok(coreICount >= 100, `bandIIcoreI count ${coreICount} below 100`);
  assert.ok(coreIICount >= 100, `bandIIcoreII count ${coreIICount} below 100`);
});

test('known single-word lemmas exist', () => {
  const data = loadBand2();
  const singleWords = data.entries.filter((e) => e.single === true);
  const lemmas = new Set(singleWords.map((e) => e.lemma));
  for (const lemma of ['abroad', 'accept', 'accident', 'wrong', 'zone']) {
    assert.ok(lemmas.has(lemma), `expected single-word lemma "${lemma}" to exist`);
  }
});

test('at least one multi-word entry exists', () => {
  const data = loadBand2();
  const hasMultiWord = data.entries.some((e) => e.single === false);
  assert.ok(hasMultiWord, 'expected at least one entry with single === false');
});
