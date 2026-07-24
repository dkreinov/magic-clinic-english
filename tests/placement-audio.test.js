import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const BANK_PATH = path.join(REPO_ROOT, 'data', 'placement-items.json');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const SW_PATH = path.join(REPO_ROOT, 'public', 'sw.js');

function loadBank() {
  const raw = fs.readFileSync(BANK_PATH, 'utf-8');
  return JSON.parse(raw);
}

test('every task1 audio field has a non-trivial mp3 file on disk', () => {
  const bank = loadBank();
  const task1 = Array.isArray(bank.task1) ? bank.task1 : [];
  const audioItems = task1.filter((item) => item && typeof item.audio === 'string');

  assert.ok(audioItems.length > 0, 'expected at least one task1 item with an audio field');

  for (const item of audioItems) {
    const filePath = path.join(PUBLIC_DIR, item.audio);
    assert.ok(fs.existsSync(filePath), `missing audio file for ${item.id}: ${filePath}`);
    const { size } = fs.statSync(filePath);
    assert.ok(size > 1000, `audio file too small for ${item.id}: ${filePath} (${size} bytes)`);
  }
});

test('audio field presence matches direction exactly (audio-to-picture only)', () => {
  const bank = loadBank();
  const task1 = Array.isArray(bank.task1) ? bank.task1 : [];

  assert.ok(task1.length > 0, 'expected task1 to contain items');

  for (const item of task1) {
    if (item.direction === 'audio-to-picture') {
      assert.ok(
        typeof item.audio === 'string' && item.audio.length > 0,
        `expected audio field on audio-to-picture item ${item.id}`
      );
    } else {
      assert.ok(
        !('audio' in item),
        `unexpected audio field on non-audio-to-picture item ${item.id} (direction=${item.direction})`
      );
    }
  }
});

test('sw.js PRECACHE does not include any audio/ paths', () => {
  const swSource = fs.readFileSync(SW_PATH, 'utf-8');
  const match = swSource.match(/const PRECACHE\s*=\s*(\[[\s\S]*?\]);/);
  assert.ok(match, 'could not locate PRECACHE array in public/sw.js');

  const precache = JSON.parse(match[1]);
  assert.ok(Array.isArray(precache), 'PRECACHE must parse as an array');

  for (const entry of precache) {
    assert.ok(
      typeof entry === 'string' && !entry.startsWith('/audio'),
      `PRECACHE must not include audio paths, found: ${entry}`
    );
  }
});
