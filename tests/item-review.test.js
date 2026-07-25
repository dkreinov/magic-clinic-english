import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const docsDir = path.join(root, 'docs');
const reviewPath = path.join(docsDir, 'item-bank-review.html');
const bankPath = path.join(root, 'data', 'placement-items.json');

function loadBank() {
  return JSON.parse(readFileSync(bankPath, 'utf8'));
}

function countOccurrences(haystack, needle) {
  return (haystack.match(new RegExp(needle, 'g')) || []).length;
}

test('the review page is a single self-contained rtl html file', () => {
  assert.ok(existsSync(reviewPath), 'docs/item-bank-review.html must exist');
  const html = readFileSync(reviewPath, 'utf8');
  assert.ok(html.includes('<!doctype html>'));
  assert.ok(html.includes('lang="he"'));
  assert.ok(html.includes('dir="rtl"'));
  assert.ok(!html.includes('type="module"'));
  assert.ok(!html.includes('http://'));
  assert.ok(!html.includes('https://'));
  assert.ok(!html.includes('fetch('));
  assert.ok(!html.includes('localStorage'));
});

test('the review page covers every item, text and question in the bank', () => {
  const bank = loadBank();
  const html = readFileSync(reviewPath, 'utf8');

  for (const item of bank.task1) {
    assert.ok(html.includes(`id="${item.id}"`), `missing id="${item.id}"`);
  }
  for (const text of bank.task2) {
    assert.ok(html.includes(`id="${text.id}"`), `missing id="${text.id}"`);
    for (const question of text.questions) {
      assert.ok(html.includes(`id="${question.id}"`), `missing id="${question.id}"`);
    }
  }

  assert.strictEqual(countOccurrences(html, '<audio'), 6);
  assert.strictEqual(countOccurrences(html, '<img'), 30);
  assert.strictEqual(countOccurrences(html, 'type="checkbox"'), 18);
  assert.ok(html.includes('מתוך 18'));
});

test('every asset the review page references exists on disk', () => {
  const html = readFileSync(reviewPath, 'utf8');
  const matches = html.matchAll(/src="(\.\.\/public\/[^"]+)"/g);
  const seen = new Set();
  for (const m of matches) {
    const rel = m[1];
    seen.add(rel);
    const resolved = path.join(docsDir, rel);
    assert.ok(existsSync(resolved), `missing asset on disk: ${rel}`);
  }
  assert.strictEqual(seen.size, 18, `expected 18 distinct assets, found ${seen.size}`);
});

test('the review page marks exactly one correct answer per item and question', () => {
  const bank = loadBank();
  const html = readFileSync(reviewPath, 'utf8');

  assert.strictEqual(countOccurrences(html, 'class="opt correct"'), 18);

  for (const item of bank.task1) {
    assert.ok(html.includes(item.he), `missing he string for ${item.id}: ${item.he}`);
  }
  for (const text of bank.task2) {
    for (const question of text.questions) {
      assert.ok(html.includes(question.prompt), `missing prompt for ${question.id}: ${question.prompt}`);
    }
  }
});
