import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'placement.js');

test('placement.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('placement.js exports render(container, ctx)', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.match(src, /export\s+(async\s+)?function\s+render/);
});

test('placement.js contains all frozen Hebrew strings', () => {
  const src = readFileSync(viewPath, 'utf8');
  const frozenStrings = [
    'מתחילים',
    'הקשיבי ובחרי את התמונה הנכונה',
    '▶ השמעה',
    'הביטי בתמונה ובחרי את המילה',
    'שאלה',
    'מתוך',
    'כל הכבוד! סיימת את המשימה הראשונה.',
    'אפשר לנוח רגע.',
    'ממשיכים למשימה 2',
    'אמשיך אחר כך',
    'קראי את הטקסט ועני על השאלות',
    'סיימת את המבחן!',
    'עכשיו הסיפור יתאים בדיוק לך.',
    'לסיפור',
    'משהו השתבש, נסי שוב.',
  ];
  for (const str of frozenStrings) {
    assert.ok(src.includes(str), `expected placement.js to include "${str}"`);
  }
});

test('placement.js uses the expected endpoints, submit action, and ltr direction', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(src.includes('/api/placement'));
  assert.ok(src.includes('/api/profile'));
  assert.ok(src.includes('"submit"'));
  assert.ok(src.includes('dir="ltr"'));
});
