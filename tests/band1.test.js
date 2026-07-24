import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'band1.json');

function loadBand1() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

test('data/band1.json parses and meta counts are within expected ranges', () => {
  const data = loadBand1();
  assert.ok(data && typeof data === 'object');
  assert.ok(Array.isArray(data.entries));
  assert.strictEqual(data.meta.entryCount, data.entries.length);
  assert.ok(
    data.meta.entryCount >= 1250 && data.meta.entryCount <= 1450,
    `entryCount ${data.meta.entryCount} out of range [1250, 1450]`
  );
  const singleWordCount = data.entries.filter((e) => e.single).length;
  assert.strictEqual(data.meta.singleWordCount, singleWordCount);
  assert.ok(
    data.meta.singleWordCount >= 1050 && data.meta.singleWordCount <= 1200,
    `singleWordCount ${data.meta.singleWordCount} out of range [1050, 1200]`
  );
});

test('every entry passes the schema', () => {
  const data = loadBand1();
  const singlePattern = /^[a-z]+$/;
  for (const e of data.entries) {
    assert.strictEqual(typeof e.lemma, 'string');
    assert.ok(e.pos === null || typeof e.pos === 'string');
    assert.ok(e.meaning === null || typeof e.meaning === 'string');
    assert.ok(e.reg === 'Prod' || e.reg === 'Rec' || e.reg === null);
    assert.ok(e.section === 'preBandI' || e.section === 'bandI');
    assert.strictEqual(typeof e.single, 'boolean');
    assert.strictEqual(e.single, singlePattern.test(e.lemma));
    assert.strictEqual(e.lemma, e.lemma.toLowerCase());
    assert.strictEqual(e.lemma, e.lemma.trim());
  }
});

test('known preBandI single-word lemmas exist', () => {
  const data = loadBand1();
  const preBandI = data.entries.filter((e) => e.section === 'preBandI' && e.single);
  const lemmas = new Set(preBandI.map((e) => e.lemma));
  for (const lemma of ['dog', 'cat', 'pet', 'friend', 'run']) {
    assert.ok(lemmas.has(lemma), `expected preBandI single-word lemma "${lemma}" to exist`);
  }
});

test('known bandI single-word lemmas exist', () => {
  const data = loadBand1();
  const bandI = data.entries.filter((e) => e.section === 'bandI' && e.single);
  const lemmas = new Set(bandI.map((e) => e.lemma));
  for (const lemma of ['animal', 'because', 'beautiful', 'apple', 'water']) {
    assert.ok(lemmas.has(lemma), `expected bandI single-word lemma "${lemma}" to exist`);
  }
});

test('at least one multi-word entry has a non-null pos', () => {
  const data = loadBand1();
  const hasMultiWordWithPos = data.entries.some((e) => e.single === false && e.pos !== null);
  assert.ok(hasMultiWordWithPos, 'expected at least one entry with single === false and non-null pos');
});
