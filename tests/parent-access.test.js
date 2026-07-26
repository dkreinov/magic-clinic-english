import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const homePath = path.join(root, 'public', 'views', 'home.js');

test('home.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', homePath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('a long press on the home title opens the parent view', () => {
  const src = readFileSync(homePath, 'utf8');
  const expected = [
    'const LONG_PRESS_MS = 1500;',
    'function bindOwnerGesture(container)',
    'bindOwnerGesture(container);',
    '"pointerdown"',
    '"pointercancel"',
    '"contextmenu"',
    'location.hash = "#/parent";',
  ];
  for (const str of expected) {
    assert.ok(src.includes(str), `expected home.js to include "${str}"`);
  }
});

test('the parent door is invisible in the shipped UI', () => {
  const indexSrc = readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
  const homeSrc = readFileSync(homePath, 'utf8');

  assert.ok(!indexSrc.includes('#/parent'));
  assert.ok(!indexSrc.includes('data-route="/parent"'));
  assert.ok(!homeSrc.includes('href="#/parent"'));
  assert.ok(!homeSrc.includes('הורים'));
});
