import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { readExamWordEntries } from '../scripts/generate-exam-sentences.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'generate-exam-sentences.mjs');
const examWordsPath = path.join(root, 'public', 'exam-words.json');

test('generate-exam-sentences.mjs passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', scriptPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('every exam word has an example sentence that actually contains the word', () => {
  const entries = readExamWordEntries();
  assert.ok(entries.length > 40, `only ${entries.length} entries -- this check inspected nothing`);
  const missing = entries.filter((e) => !e.sentence).map((e) => e.word);
  assert.deepStrictEqual(missing, [], `exam words shipped with no example sentence: ${missing.join(', ')}`);

  for (const entry of entries) {
    const lower = entry.sentence.toLowerCase();
    assert.ok(
      lower.includes(entry.word.toLowerCase()),
      `the sentence for "${entry.word}" does not contain the word itself: "${entry.sentence}"`
    );
  }
});

test('dry run reports entry and missing counts without a network call', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, EXAM_SENTENCES_DRY_RUN: '1', OPENAI_API_KEY: '' },
  });
  assert.strictEqual(result.status, 0, `expected exit 0, got stderr: ${result.stderr}`);
  const out = result.stdout.toString();
  const entries = readExamWordEntries();
  assert.ok(out.includes(`entries: ${entries.length}`), `entries line wrong: ${out}`);
  assert.ok(out.includes('missing: 0'), `missing line wrong (file should already be fully generated): ${out}`);
});

test('public/exam-words.json entries hold word, he and sentence, all non-empty strings', () => {
  const raw = JSON.parse(readFileSync(examWordsPath, 'utf8'));
  assert.ok(Array.isArray(raw));
  for (const entry of raw) {
    for (const key of ['word', 'he', 'sentence']) {
      assert.strictEqual(typeof entry[key], 'string', `${entry.word || '?'}.${key} must be a string`);
      assert.ok(entry[key].trim() !== '', `${entry.word || '?'}.${key} must not be empty`);
    }
  }
});
