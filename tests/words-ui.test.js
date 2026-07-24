import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'words.js');

test('words.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('words.js exports render(container, ctx)', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.match(src, /export\s+(async\s+)?function\s+render/);
});

test('words.js contains all frozen Hebrew strings', () => {
  const src = readFileSync(viewPath, 'utf8');
  const frozenStrings = ['עוד אין מילים באוסף', 'יודעת', 'לומדת'];
  for (const str of frozenStrings) {
    assert.ok(src.includes(str), `expected words.js to include "${str}"`);
  }
});

test('words.js references /api/profile', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(src.includes('/api/profile'));
});
