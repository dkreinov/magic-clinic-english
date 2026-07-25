import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'parent.js');

test('parent.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('parent.js exports render(container, ctx)', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.match(src, /export\s+(async\s+)?function\s+render/);
});

test('parent.js contains all frozen Hebrew strings', () => {
  const src = readFileSync(viewPath, 'utf8');
  const frozenStrings = [
    'תצוגת הורים',
    'מה האפליקציה יודעת עליה',
    'רמת אוצר המילים',
    'טרם נקבעה',
    'היא עוד לא עשתה את מבחן המיון.',
    'מבחן המיון',
    'משימה 1 — מילים ותמונות',
    'משימה 2 — הבנת הנקרא',
    'טרם נעשתה',
    'נעשה בתאריך',
    'אוצר המילים שלה',
    'מילים באוסף',
    'התוצאה לא נראית נכונה?',
    'מבחן מיון מחדש',
    'תצוגה זו נועדה להורה בלבד ואינה מופיעה בתפריט של האפליקציה.',
    'משהו השתבש, נסי שוב.',
    'טוען...',
  ];
  for (const str of frozenStrings) {
    assert.ok(src.includes(str), `expected parent.js to include "${str}"`);
  }
});

test('parent.js is read-only and reads the profile fields it promises', () => {
  const src = readFileSync(viewPath, 'utf8');
  const fields = ['/api/profile', 'skills', 'receptiveVocab', 'placement', 'task1', 'task2', 'words'];
  for (const field of fields) {
    assert.ok(src.includes(field), `expected parent.js to include "${field}"`);
  }
  assert.ok(!src.includes('postJson'));
  assert.ok(!src.includes('/api/placement'));
});

test('the vocabulary sizes parent.js states match buildAllowedSet', async () => {
  const { buildAllowedSet } = await import('../lib/story.js');
  const src = readFileSync(viewPath, 'utf8');
  const band1 = JSON.parse(readFileSync(path.join(root, 'data', 'band1.json'), 'utf8'));
  const band2 = JSON.parse(readFileSync(path.join(root, 'data', 'band2.json'), 'utf8'));

  for (const band of ['preA1', 'A1', 'A2']) {
    const profile = { skills: { receptiveVocab: { band } }, words: {}, learner: {} };
    const set = buildAllowedSet(profile, band1, band2);
    assert.ok(
      src.includes(`הסיפורים נבנים מ-${set.size} מילים.`),
      `expected parent.js to state ${set.size} words for band ${band}`
    );
  }
});

test('#/parent is routed lazily and is not in the tab bar', () => {
  const appSrc = readFileSync(path.join(root, 'public', 'app.js'), 'utf8');
  const indexSrc = readFileSync(path.join(root, 'public', 'index.html'), 'utf8');

  assert.ok(appSrc.includes('const OWNER_ROUTE = "/parent";'));
  assert.ok(appSrc.includes('import("./views/parent.js")'));
  assert.ok(!appSrc.includes('from "./views/parent.js"'));
  assert.ok(!indexSrc.includes('#/parent'));
});
