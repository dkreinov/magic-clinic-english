import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

test('styles.css defines the four background paint tokens with their frozen values', () => {
  const css = readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
  assert.ok(css.includes('--color-bg-top: #361d08;'));
  assert.ok(css.includes('--color-bg-glow-violet: #321f1a;'));
  assert.ok(css.includes('--color-bg-glow-teal: #282416;'));
  assert.ok(css.includes('--color-bg-glow-amber: #331f0c;'));
});

test('body background-image is composed only of the frozen background paint layers', () => {
  const css = readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
  const match = css.match(/background-image:\s*([^;]*);/);
  assert.ok(match);
  const normalized = match[1].replace(/\s+/g, ' ').trim();
  assert.strictEqual(
    normalized,
    'radial-gradient(circle 520px at 8% 2%, var(--color-bg-glow-violet) 0%, transparent 70%), radial-gradient(circle 420px at 96% 12%, var(--color-bg-glow-teal) 0%, transparent 70%), radial-gradient(circle 640px at 50% 104%, var(--color-bg-glow-amber) 0%, transparent 72%), linear-gradient(180deg, var(--color-bg-top) 0%, var(--color-bg) 340px)'
  );
  assert.ok(!normalized.includes('#'));
});

test('scripts/check-contrast.mjs exits 0', () => {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'check-contrast.mjs')]);
  assert.strictEqual(result.status, 0);
});
