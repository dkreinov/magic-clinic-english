import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'build-word-audio.js');

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
