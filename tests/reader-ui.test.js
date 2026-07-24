import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'reader.js');

test('reader.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('reader.js exports render(container, ctx)', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.match(src, /export\s+(async\s+)?function\s+render/);
});

test('reader.js contains all frozen Hebrew strings', () => {
  const src = readFileSync(viewPath, 'utf8');
  const frozenStrings = [
    'קודם נעשה מבחן היכרות קטן',
    'איך נקרא לגיבורה שלנו?',
    'ואיך נקרא לחיה הקסומה הראשונה?',
    'יאללה, מתחילים!',
    'מתחילים את הסיפור',
    'שמרי למילים שלי',
    'המשך הסיפור',
    'רגע, הקסם מתעכב… ננסה שוב עוד רגע.',
    'כל הכבוד!',
    'לא נורא, ננסה שוב',
  ];
  for (const str of frozenStrings) {
    assert.ok(src.includes(str), `expected reader.js to include "${str}"`);
  }
});

test('reader.js references the expected endpoints, actions, and ltr direction', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(src.includes('/api/chapter'));
  assert.ok(src.includes('/api/profile'));
  assert.ok(src.includes('/api/translate'));
  assert.ok(src.includes('set-learner'));
  assert.ok(src.includes('word-tap'));
  assert.ok(src.includes('log-check'));
  assert.ok(src.includes('dir="ltr"'));
});
