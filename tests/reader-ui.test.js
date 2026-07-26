import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sentenceFor } from '../public/views/reader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'reader.js');
const stylesPath = path.join(root, 'public', 'styles.css');

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

test('sentenceFor extracts the whole-word, first-matching, trimmed, 200-char-capped sentence', () => {
  assert.strictEqual(
    sentenceFor('A cat ran. A cat sat.', 'cat'),
    'A cat ran.',
    'first matching sentence should win'
  );
  assert.strictEqual(
    sentenceFor('The catalogue is big. The cat sat.', 'cat'),
    'The cat sat.',
    'matching must be whole-word, not substring'
  );
  assert.strictEqual(
    sentenceFor("Let's go now. We stayed.", "let's"),
    "Let's go now.",
    'an apostrophe word must not break matching'
  );
  assert.strictEqual(
    sentenceFor('Nothing here at all.', 'zebra'),
    '',
    'no match must return exactly empty string'
  );
  const long = 'x'.repeat(300) + ' cat.';
  const got = sentenceFor(long + ' Tail.', 'cat');
  assert.strictEqual(got.length, 200, 'a long matching sentence must be capped to 200 chars');
  assert.strictEqual(got, got.trim(), 'the returned sentence must be trimmed');
});

test('the play affordance: markup, wiring, CSS, and the contrast gate all hold', () => {
  const src = readFileSync(viewPath, 'utf8');
  for (const needle of ['btn-say', 'data-say', 'new Audio', '/audio/words/', '.aac', 'encodeURIComponent']) {
    assert.ok(src.includes(needle), `reader.js should include "${needle}"`);
  }
  assert.ok(src.includes('הקשיבי למילה'), 'reader.js should include the frozen Hebrew aria-label');

  const css = readFileSync(stylesPath, 'utf8');
  for (const cls of ['.btn-say', '.btn-know']) {
    const start = css.indexOf(`${cls} {`);
    assert.ok(start >= 0, `styles.css should contain a ${cls} block`);
    const end = css.indexOf('}', start);
    const block = css.slice(start, end);
    assert.ok(block.includes('color: var(--color-ink);'), `${cls} should declare color: var(--color-ink);`);
    assert.ok(block.includes('background: var(--color-surface-2);'), `${cls} should declare background: var(--color-surface-2);`);
    assert.ok(!block.includes('#'), `${cls} must not contain a raw hex color`);
    assert.ok(!block.includes('color-mix('), `${cls} must not use color-mix()`);
  }

  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'check-contrast.mjs')]);
  assert.strictEqual(result.status, 0, `contrast gate should exit 0: ${result.stderr}`);
  const out = result.stdout.toString();
  assert.ok(out.includes('ALL PASS'), 'contrast gate should print ALL PASS');
  const passLines = out.split('\n').filter((line) => line.startsWith('PASS'));
  assert.strictEqual(passLines.length, 52, 'contrast gate should print exactly 52 PASS lines');
});
