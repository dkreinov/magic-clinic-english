// Phase 3 (word-trophies), step 3.1 -- design.md T7: three :root tier tokens
// (--color-bronze / --color-silver / --color-gold) and the six tier-ring pairs
// that move the contrast anchor from 52 to 58. These two tests are what make
// the tokens and the new anchor real; no view, no route, no CACHE bump.
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const cssPath = path.join(root, 'public', 'styles.css');

const TIER_TOKENS = [
  ['--color-bronze', '#a4622a'],
  ['--color-silver', '#6f6a63'],
  ['--color-gold', '#9a7200'],
];

const TIER_LABELS = [
  'bronze trophy ring on card (WCAG 1.4.11)',
  'bronze trophy ring on raised surface (WCAG 1.4.11)',
  'silver trophy ring on card (WCAG 1.4.11)',
  'silver trophy ring on raised surface (WCAG 1.4.11)',
  'gold trophy ring on card (WCAG 1.4.11)',
  'gold trophy ring on raised surface (WCAG 1.4.11)',
];

test('styles.css defines the three tier tokens with their frozen hex values inside :root', () => {
  const css = readFileSync(cssPath, 'utf8');
  // the same regex scripts/check-contrast.mjs:64 uses to find the token block
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  assert.ok(rootMatch, 'styles.css must contain a :root { ... } block');
  const rootBody = rootMatch[1];
  for (const [name, hex] of TIER_TOKENS) {
    const decl = `${name}: ${hex};`;
    assert.ok(css.includes(decl), `styles.css must declare ${decl}`);
    assert.ok(rootBody.includes(decl), `${decl} must be declared INSIDE :root, or the contrast gate cannot see it`);
    const hits = css.split(hex).length - 1;
    assert.strictEqual(hits, 1, `${hex} must appear exactly once in styles.css (no raw hex outside :root), got ${hits}`);
  }
});

test('the contrast gate covers the six tier-ring pairs at 3:1 and prints exactly 58 PASS lines', () => {
  const result = spawnSync(process.execPath, ['scripts/check-contrast.mjs'], { cwd: root });
  assert.strictEqual(result.status, 0, `contrast gate exited non-zero: ${result.stderr}`);
  const stdout = result.stdout.toString();
  assert.ok(stdout.includes('ALL PASS'), 'contrast gate did not print ALL PASS');
  const passLines = stdout.split('\n').filter((l) => l.startsWith('PASS'));
  assert.strictEqual(passLines.length, 58, `expected exactly 58 PASS lines, got ${passLines.length}`);
  for (const label of TIER_LABELS) {
    assert.ok(stdout.includes(label), `contrast gate must still cover the pair labelled "${label}"`);
  }
});
