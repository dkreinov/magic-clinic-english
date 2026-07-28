import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

test('index.html has rtl, lang, manifest link, and module script', () => {
  const html = readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  assert.ok(html.includes('dir="rtl"'));
  assert.ok(html.includes('lang="he"'));
  assert.ok(html.includes('rel="manifest" href="/manifest.webmanifest"'));
  assert.ok(html.includes('<script type="module" src="/app.js">'));
});

test('manifest.webmanifest parses and has expected fields', () => {
  const manifest = JSON.parse(readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf8'));
  assert.strictEqual(manifest.name, 'מרפאת הקסמים');
  assert.strictEqual(manifest.short_name, 'קסמים');
  assert.strictEqual(manifest.start_url, '/');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.dir, 'rtl');
  assert.strictEqual(manifest.lang, 'he');
  assert.strictEqual(manifest.background_color, '#fff4e2');
  assert.strictEqual(manifest.theme_color, '#fff8ec');
  assert.strictEqual(manifest.icons[0].src, '/icons/icon.svg');
});

function listJsFiles(dir) {
  const entries = readdirSync(dir);
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files = files.concat(listJsFiles(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

test('every .js file under public/ passes node --check', () => {
  const files = listJsFiles(publicDir);
  assert.ok(files.length > 0, 'expected to find .js files under public/');
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file]);
    assert.strictEqual(result.status, 0, `node --check failed for ${file}: ${result.stderr}`);
  }
});

test('sw.js has the expected cache name and precache list resolving to real files', () => {
  const sw = readFileSync(path.join(publicDir, 'sw.js'), 'utf8');
  assert.ok(sw.includes('magic-vet-v16'));

  const match = sw.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
  assert.ok(match, 'expected to find PRECACHE array literal in sw.js');
  const precache = JSON.parse(match[1]);

  assert.deepStrictEqual(precache, [
    '/',
    '/styles.css',
    '/app.js',
    '/api.js',
    '/lemma.js',
    '/words-index.js',
    '/quiz-core.js',
    '/quiz.js',
    '/views/home.js',
    '/views/placement.js',
    '/views/reader.js',
    '/views/words.js',
    '/manifest.webmanifest',
    '/icons/icon.svg',
  ]);

  for (const entry of precache) {
    const relative = entry === '/' ? 'index.html' : entry.replace(/^\//, '');
    const filePath = path.join(publicDir, relative);
    assert.ok(existsSync(filePath), `expected ${filePath} to exist`);
  }
});

test('styles.css defines all six design tokens', () => {
  const css = readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
  const tokens = ['--color-primary', '--color-teal', '--color-accent', '--color-bg', '--color-ink', '--radius'];
  for (const token of tokens) {
    assert.ok(css.includes(`${token}:`), `expected styles.css to define ${token}`);
  }
});
