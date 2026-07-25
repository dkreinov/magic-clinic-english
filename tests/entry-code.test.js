import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

test('api.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', path.join(publicDir, 'api.js')]);
  assert.strictEqual(result.status, 0);
});

test('api.js replaces window.prompt with the entry-code screen', () => {
  const src = readFileSync(path.join(publicDir, 'api.js'), 'utf8');
  assert.ok(!src.includes('window.prompt'));
  assert.ok(!src.includes('allowRetry'));
  assert.ok(src.includes('כניסה למרפאת הקסמים'));
  assert.ok(src.includes('הקוד לא נכון. נסי שוב.'));
  assert.ok(src.includes('קוד כניסה'));
  assert.ok(src.includes('כניסה'));
  assert.ok(src.includes('entry-gate'));
  assert.ok(src.includes('let entryGate = null;'));
  assert.ok(src.includes('if (entryGate) return entryGate;'));
});

test('the entry-gate styles are token-only and sit at the end of styles.css', () => {
  const css = readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
  const MARKER = '/* ---------- Entry code gate ---------- */';
  assert.ok(css.indexOf(MARKER) !== -1);
  const block = css.slice(css.indexOf(MARKER));
  assert.ok(!block.includes('#'));
  assert.ok(!block.includes('background-image'));
  assert.ok(!block.includes('color-mix'));
  assert.ok(block.includes('.entry-gate {'));
  assert.ok(block.includes('.entry-gate-card {'));
  assert.ok(block.includes('.entry-gate-input {'));
  assert.ok(block.includes('.entry-gate-error {'));
  assert.ok(block.includes('z-index: 100;'));
});
