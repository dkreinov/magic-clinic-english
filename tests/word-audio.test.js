import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { deriveWordList } from '../scripts/build-word-audio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'build-word-audio.js');
const wordsDir = path.join(root, 'public', 'audio', 'words');

test('build-word-audio.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', scriptPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('the generator derives its word list from the band data, not a hardcoded list', () => {
  const src = readFileSync(scriptPath, 'utf8');
  assert.ok(src.includes('buildAllowedSet'));
  assert.ok(src.includes('band1.json'));
  assert.ok(src.includes('band2.json'));
  assert.ok(src.includes("'A2'"));
  assert.ok(!src.includes("'apartment'"));
  assert.ok(!src.includes("'telecommunications'"));
});

test('the generator is resumable and retries', () => {
  const src = readFileSync(scriptPath, 'utf8');
  assert.ok(src.includes('existsSync'));
  assert.ok(src.includes('WORD_AUDIO_DRY_RUN'));
  assert.ok(src.includes('attempt'));
});

test('dry run reports the derived word count without a network call', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, WORD_AUDIO_DRY_RUN: '1', OPENAI_API_KEY: '' },
  });
  assert.strictEqual(result.status, 0, `expected exit 0, got stderr: ${result.stderr}`);
  assert.ok(result.stdout.toString().includes('words: 2254'));
});

// Criterion 6. This calls the generator's OWN deriveWordList rather than
// re-deriving the allowed set here: verifying code against a re-implementation
// of itself is how a wrong word-regex once put a wrong count in all three bands.
// It is a drift alarm as much as a one-off check -- add a word to a band JSON
// and this fails until the clip exists, instead of shipping a play button that
// silently does nothing.
test('every allowed word has a clip, and every clip is an allowed word', () => {
  const expected = new Set(deriveWordList());
  const actual = new Set(
    readdirSync(wordsDir)
      .filter((f) => f.endsWith('.aac'))
      .map((f) => f.slice(0, -'.aac'.length))
  );

  const missing = [...expected].filter((w) => !actual.has(w));
  const extra = [...actual].filter((w) => !expected.has(w));

  assert.deepStrictEqual(missing, [], `allowed words with no clip: ${missing.slice(0, 20).join(', ')}`);
  assert.deepStrictEqual(extra, [], `clips that are not allowed words: ${extra.slice(0, 20).join(', ')}`);
  assert.strictEqual(actual.size, 2254);
});
