import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

test('every manifest icon file exists and has its declared pixel size', () => {
  const manifest = JSON.parse(readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf8'));
  for (const icon of manifest.icons) {
    const filePath = path.join(publicDir, icon.src.replace(/^\//, ''));
    assert.ok(existsSync(filePath), `expected ${filePath} to exist`);

    if (icon.type === 'image/png') {
      const buf = readFileSync(filePath);
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      const [wantWidth, wantHeight] = icon.sizes.split('x').map(Number);
      assert.strictEqual(width, wantWidth, `expected ${filePath} width to be ${wantWidth}`);
      assert.strictEqual(height, wantHeight, `expected ${filePath} height to be ${wantHeight}`);
    }
  }
});

test('manifest icons list the svg fallback plus the three generated pngs, in order', () => {
  const manifest = JSON.parse(readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf8'));
  assert.deepStrictEqual(manifest.icons, [
    { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ]);
});

test('index.html points apple-touch-icon at the png', () => {
  const html = readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  assert.ok(html.includes('<link rel="apple-touch-icon" href="/icons/icon-192.png" />'));
  assert.ok(!html.includes('apple-touch-icon" href="/icons/icon.svg'));
});
