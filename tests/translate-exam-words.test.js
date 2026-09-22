import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { readExamWordEntries } from '../scripts/translate-exam-words.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'translate-exam-words.mjs');
const examWordsPath = path.join(root, 'public', 'exam-words.json');

test('translate-exam-words.mjs passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', scriptPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('every exam word has been translated -- the shipped file has no null "he" left', () => {
  const entries = readExamWordEntries();
  assert.ok(entries.length > 40, `only ${entries.length} entries -- this check inspected nothing`);
  const missing = entries.filter((e) => !e.he).map((e) => e.word);
  assert.deepStrictEqual(missing, [], `exam words shipped with no Hebrew translation: ${missing.join(', ')}`);
});

test('dry run reports entry and missing counts without a network call', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, EXAM_TRANSLATE_DRY_RUN: '1', OPENAI_API_KEY: '' },
  });
  assert.strictEqual(result.status, 0, `expected exit 0, got stderr: ${result.stderr}`);
  const out = result.stdout.toString();
  const entries = readExamWordEntries();
  assert.ok(out.includes(`entries: ${entries.length}`), `entries line wrong: ${out}`);
  assert.ok(out.includes('missing: 0'), `missing line wrong (file should already be fully translated): ${out}`);
});

test('public/exam-words.json holds {word, he} objects, not bare strings', () => {
  const raw = JSON.parse(readFileSync(examWordsPath, 'utf8'));
  assert.ok(Array.isArray(raw));
  for (const entry of raw) {
    assert.strictEqual(typeof entry, 'object');
    assert.strictEqual(typeof entry.word, 'string');
    assert.ok(entry.word.trim() !== '');
  }
});
