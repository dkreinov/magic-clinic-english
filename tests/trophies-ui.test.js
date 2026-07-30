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

// ===== step 3.2 (T4): the trophies screen module =====================
// Appended by $HOME/trophies-art/build-trophy-names.js. The two Hebrew tokens
// asserted below are written as \u escapes BY THAT SCRIPT from the same sources
// the view is built from -- this file holds no raw non-ASCII byte (SK3-8).
// The view module is imported dynamically inside each test, the precedent
// tests/words-ui.test.js sets, so this block is a pure append.

const trophiesViewPath = path.join(root, 'public', 'views', 'trophies.js');
const VIEW_STYLE_RE = /const VIEW_STYLE = `([\s\S]*?)`;/;
const T32_ISO = '2026-01-01T00:00:00.000Z';

function t32Profile(words, chapters) {
  return { version: 1, words, story: { chapters }, trophies: {} };
}

function t32KnownWords(n) {
  const words = {};
  for (let i = 0; i < n; i += 1) words['w' + i] = { status: 'known' };
  return words;
}

test('the view catalogue mirrors lib/profile.js TROPHY_CATALOG exactly: ids, order and all 24 thresholds', async () => {
  const { TROPHY_VIEW } = await import('../public/views/trophies.js');
  const { TROPHY_CATALOG } = await import('../lib/profile.js');

  // SK3-6's single assertion: ids, ORDER and all 24 thresholds at once.
  const shape = (t) => ({ id: t.id, bronze: t.bronze, silver: t.silver, gold: t.gold });
  assert.deepStrictEqual(TROPHY_VIEW.map(shape), TROPHY_CATALOG.map(shape));

  assert.strictEqual(TROPHY_VIEW.length, 8);
  const ids = TROPHY_VIEW.map((t) => t.id);
  assert.strictEqual(new Set(ids).size, 8, `the eight view ids must be unique, got ${ids.join(',')}`);
  for (const t of TROPHY_VIEW) {
    assert.strictEqual(typeof t.metric, 'function', `${t.id} must carry a metric function`);
    assert.ok(t.bronze < t.silver, `${t.id}: bronze must be below silver`);
    assert.ok(t.silver < t.gold, `${t.id}: silver must be below gold`);
  }
});

test('every view metric agrees with the engine metric over eight shared fixtures', async () => {
  const { TROPHY_VIEW } = await import('../public/views/trophies.js');
  const { TROPHY_CATALOG, defaultProfile } = await import('../lib/profile.js');

  // (e) four chapters on one day, then words carrying lastSeen/lastQuizAt on
  // three further days -- this is what exercises 'days' and 'streak' together,
  // and it is the fixture that catches a dropped half of the day union.
  const sharedDay = t32Profile(
    {
      a: { status: 'known', lastSeen: '2026-03-02T09:00:00.000Z' },
      b: { status: 'learning', lastQuizAt: '2026-03-03T09:00:00.000Z' },
      c: { status: 'learning', lastSeen: '2026-03-04T21:00:00.000Z', lastQuizAt: '2026-03-04T09:00:00.000Z' },
    },
    [
      { generatedAt: '2026-03-01T07:00:00.000Z' },
      { generatedAt: '2026-03-01T08:00:00.000Z' },
      { generatedAt: '2026-03-01T09:00:00.000Z' },
      { generatedAt: '2026-03-01T10:00:00.000Z' },
    ],
  );

  // (h) every metric at or above its gold threshold: 40 consecutive chapter
  // days, 30 known+nominated words, 120 right, 180 answered, 210 taps.
  const goldChapters = [];
  const goldStart = Date.parse('2026-04-01T00:00:00.000Z');
  for (let i = 0; i < 40; i += 1) {
    goldChapters.push({ generatedAt: new Date(goldStart + i * 86400000).toISOString() });
  }
  const goldWords = {};
  for (let i = 0; i < 30; i += 1) {
    goldWords['g' + i] = { status: 'known', nominations: 1, quizRight: 4, quizWrong: 2, taps: 7 };
  }

  const fixtures = [
    ['(a) empty object', {}],
    ['(b) defaultProfile', defaultProfile(T32_ISO)],
    ['(c) five known words', t32Profile(t32KnownWords(5), [])],
    [
      '(d) twelve known, three learning, two candidate',
      t32Profile(
        (() => {
          const words = t32KnownWords(12);
          for (let i = 0; i < 3; i += 1) words['l' + i] = { status: 'learning', taps: 2 };
          for (let i = 0; i < 2; i += 1) words['c' + i] = { status: 'candidate', taps: 1, nominations: 1 };
          return words;
        })(),
        [],
      ),
    ],
    ['(e) four chapters on one day plus three further active days', sharedDay],
    [
      '(f) across a year boundary',
      t32Profile(
        {
          a: { status: 'known', lastSeen: '2025-12-31T22:00:00.000Z' },
          b: { status: 'known', lastQuizAt: '2026-01-31T22:00:00.000Z' },
        },
        [
          { generatedAt: '2026-01-01T06:00:00.000Z' },
          { generatedAt: '2026-02-01T06:00:00.000Z' },
        ],
      ),
    ],
    [
      '(g) malformed timestamps and counters',
      t32Profile(
        {
          a: { status: 'known', lastSeen: 'not-a-date', lastQuizAt: 'January 1, 2026' },
          b: { status: 'learning', lastSeen: '2026-02-30T00:00:00.000Z', lastQuizAt: 12345 },
          c: { status: 'candidate', lastSeen: null, taps: 'many', quizRight: null, nominations: 'x' },
        },
        [
          { generatedAt: 'not-a-date' },
          { generatedAt: null },
          'not-an-object',
          { generatedAt: '2026-05-05T00:00:00.000Z' },
        ],
      ),
    ],
    ['(h) every metric at or above gold', t32Profile(goldWords, goldChapters)],
  ];

  assert.strictEqual(fixtures.length, 8);
  assert.strictEqual(TROPHY_VIEW.length, TROPHY_CATALOG.length);

  // Nothing is derived by hand here: the assertion is AGREEMENT. The
  // hand-derived numbers live in tests/trophies.test.js for the engine side.
  for (const [label, profile] of fixtures) {
    for (let i = 0; i < TROPHY_CATALOG.length; i += 1) {
      const engine = TROPHY_CATALOG[i];
      const view = TROPHY_VIEW[i];
      assert.strictEqual(view.id, engine.id, `catalogue drifted at index ${i}`);
      const got = view.metric(profile);
      const want = engine.metric(profile);
      assert.strictEqual(got, want, `${label}: ${engine.id} -- view says ${got}, engine says ${want}`);
    }
  }
});

test('tierOf reports the highest earned tier and null when nothing is earned', async () => {
  const { tierOf } = await import('../public/views/trophies.js');
  assert.strictEqual(tierOf({}), null);
  assert.strictEqual(tierOf(undefined), null);
  assert.strictEqual(tierOf({ bronze: T32_ISO }), 'bronze');
  assert.strictEqual(tierOf({ bronze: T32_ISO, silver: T32_ISO }), 'silver');
  assert.strictEqual(tierOf({ bronze: T32_ISO, silver: T32_ISO, gold: T32_ISO }), 'gold');
  // Never-regress: phase 1 test A3 proves the engine can produce a higher tier
  // with no lower ones, so a lone gold must still read gold.
  assert.strictEqual(tierOf({ gold: T32_ISO }), 'gold');
});

test('the progress line reads from the live metric, is empty at gold, and starts at the bronze threshold when locked', async () => {
  const { TROPHY_VIEW, progressLine, nextThreshold, tierOf } = await import('../public/views/trophies.js');
  const MITOCH = '\u05de\u05ea\u05d5\u05da';
  assert.strictEqual(MITOCH.length, 4);

  const known = TROPHY_VIEW.find((t) => t.id === 'known');
  const withKnown = (n) => t32Profile(t32KnownWords(n), []);

  // SK3-4, the three cases.
  assert.strictEqual(progressLine(known, withKnown(0), null), `0 ${MITOCH} 5`);
  assert.strictEqual(progressLine(known, withKnown(7), 'bronze'), `7 ${MITOCH} 15`);
  assert.strictEqual(progressLine(known, withKnown(20), 'silver'), `20 ${MITOCH} 30`);
  assert.strictEqual(progressLine(known, withKnown(31), 'gold'), '');

  assert.strictEqual(nextThreshold(known, null), 5);
  assert.strictEqual(nextThreshold(known, 'bronze'), 15);
  assert.strictEqual(nextThreshold(known, 'silver'), 30);
  assert.strictEqual(nextThreshold(known, 'gold'), null);

  // The line is the LIVE metric on every call, never a stored high-water mark:
  // the same trophy at the same tier reads whatever the profile says right now.
  assert.strictEqual(progressLine(known, withKnown(3), 'bronze'), `3 ${MITOCH} 15`);

  // Never-regress: a LOWER metric than before still shows the gold ring, and
  // the line stays empty -- no "loss" is representable on this screen.
  const goldEntry = { bronze: T32_ISO, silver: T32_ISO, gold: T32_ISO };
  assert.strictEqual(tierOf(goldEntry), 'gold');
  assert.strictEqual(progressLine(known, withKnown(0), tierOf(goldEntry)), '');

  // The word is the one already shipped in public/quiz.js -- nothing authored.
  const viewSrc = readFileSync(trophiesViewPath, 'utf8');
  assert.ok(viewSrc.includes(MITOCH), 'the view must carry the extracted progress word');
  const quizSrc = readFileSync(path.join(root, 'public', 'quiz.js'), 'utf8');
  assert.ok(quizSrc.includes(MITOCH), 'the progress word must still be quiz.js own score-line word');
});

test('screenHtml emits the shelf-header banner, the title and exactly eight cards in catalogue order, each pointing at its own webp', async () => {
  const { TROPHY_VIEW, screenHtml } = await import('../public/views/trophies.js');
  const TITLE = '\u05d4\u05d2\u05d1\u05d9\u05e2\u05d9\u05dd \u05e9\u05dc\u05d9';
  assert.strictEqual(TITLE.length, 11);

  const html = screenHtml(t32Profile({}, []));

  assert.strictEqual(html.split('class="trophy-card"').length - 1, 8, 'expected exactly eight cards');

  const banner = 'src="/assets/trophies/shelf-header.webp"';
  assert.strictEqual(html.split(banner).length - 1, 1, 'the shelf-header must appear exactly once');
  assert.ok(html.indexOf(banner) >= 0);
  assert.ok(html.indexOf(banner) < html.indexOf('class="trophy-card"'), 'the banner must come before the first card');

  let previous = -1;
  for (const trophy of TROPHY_VIEW) {
    const needle = `src="/assets/trophies/${trophy.id}.webp"`;
    const at = html.indexOf(needle);
    assert.ok(at >= 0, `missing artwork for ${trophy.id}`);
    assert.ok(at > previous, `${trophy.id} is out of catalogue order`);
    previous = at;
  }
  assert.ok(html.includes('src="/assets/trophies/quizRight.webp"'), 'the camelCase stem quizRight is frozen');

  assert.ok(html.includes(`<h1 class="app-title">${TITLE}</h1>`), 'the screen title is the extracted tab label');
});

test('a locked trophy is the same artwork dimmed by CSS, never a second asset', async () => {
  const { TROPHY_VIEW, cardHtml, screenHtml } = await import('../public/views/trophies.js');

  // known at bronze, everything else unearned.
  const profile = t32Profile(t32KnownWords(5), []);
  profile.trophies = { known: { bronze: T32_ISO } };

  for (const trophy of TROPHY_VIEW) {
    const card = cardHtml(trophy, profile, profile.trophies);
    if (trophy.id === 'known') {
      assert.ok(!card.includes('trophy-card--locked'), 'the earned trophy must not be locked');
      assert.ok(card.includes('trophy-card--bronze'), 'the earned trophy carries its tier ring');
    } else {
      assert.ok(card.includes('trophy-card--locked'), `${trophy.id} must render locked`);
    }
    assert.ok(
      card.includes(`src="/assets/trophies/${trophy.id}.webp"`),
      `${trophy.id} must use its own single artwork in every state`,
    );
  }

  const html = screenHtml(profile);
  const sources = html.match(/src="[^"]*"/g) || [];
  const allowed = new Set(TROPHY_VIEW.map((t) => `src="/assets/trophies/${t.id}.webp"`));
  allowed.add('src="/assets/trophies/shelf-header.webp"');
  for (const source of sources) {
    assert.ok(allowed.has(source), `unexpected image source ${source} -- there is no second asset`);
  }
  assert.strictEqual(sources.length, 9, 'eight trophies plus the shelf header');
  assert.ok(!html.includes('-locked.webp'), 'no -locked artwork path may appear');
  assert.ok(!html.includes('-grey'), 'no -grey artwork path may appear');
  assert.ok(!html.includes('.png'), 'no second artwork format may appear');

  const style = readFileSync(trophiesViewPath, 'utf8').match(VIEW_STYLE_RE);
  assert.ok(style, 'could not find VIEW_STYLE');
  const lockedAt = style[1].indexOf('.trophy-card--locked .trophy-art');
  assert.ok(lockedAt >= 0, 'VIEW_STYLE must dim the locked artwork');
  const lockedBlock = style[1].slice(lockedAt, style[1].indexOf('}', lockedAt));
  assert.ok(lockedBlock.includes('grayscale('), 'the locked rule must grayscale the same artwork');
  assert.ok(lockedBlock.includes('opacity:'), 'the locked rule must dim the same artwork');
});

test('the trophies VIEW_STYLE is token-only and the screen has no progress bar or chart', async () => {
  const { screenHtml } = await import('../public/views/trophies.js');
  const src = readFileSync(trophiesViewPath, 'utf8');
  const styleMatch = src.match(VIEW_STYLE_RE);
  assert.ok(styleMatch, 'could not find VIEW_STYLE');
  const style = styleMatch[1];

  assert.ok(!style.includes('#'), 'VIEW_STYLE must not contain a raw hex color');
  assert.ok(!style.includes('color-mix('), 'VIEW_STYLE must not use color-mix()');
  assert.ok(!style.includes('background-image'), 'VIEW_STYLE must not use background-image');
  for (const token of ['var(--color-bronze)', 'var(--color-silver)', 'var(--color-gold)']) {
    assert.ok(style.includes(token), `VIEW_STYLE must consume ${token}`);
  }

  // T9: no progress bars, no chart machinery.
  const html = screenHtml(t32Profile({}, []));
  assert.ok(!html.includes('<progress'), 'T9 forbids a progress element');
  assert.ok(!html.includes('<canvas'), 'T9 forbids chart machinery');
  assert.ok(!html.includes('<svg'), 'T9 forbids chart machinery');
  for (const attribute of html.match(/class="[^"]*"/g) || []) {
    assert.ok(!attribute.includes('bar'), `T9 forbids a bar-ish class name: ${attribute}`);
  }
  assert.ok(!/width:\s*[^;]*%/.test(html), 'T9 forbids a percentage width -- that is a progress bar in disguise');
});
