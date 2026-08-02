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
// Step 3.6a: the trophy rules moved OUT of the view and INTO the globally-
// linked stylesheet, because the celebration overlay is body-appended and
// fires ONLY on routes where the trophies view is not mounted. Every
// assertion below that scanned VIEW_STYLE now scans the same rule text in
// public/styles.css; the meanings are unchanged, only the source file is.
const TROPHY_CSS_MARKER = '/* ---------- Trophies screen and celebration ---------- */';
const ENTRY_CSS_MARKER = '/* ---------- Entry code gate ---------- */';

function trophyCss() {
  const css = readFileSync(cssPath, 'utf8');
  const from = css.indexOf(TROPHY_CSS_MARKER);
  assert.ok(from >= 0, 'public/styles.css must carry the trophies section marker');
  const to = css.indexOf(ENTRY_CSS_MARKER);
  assert.ok(to > from, 'the trophy rules must sit BEFORE the entry-code gate section');
  return css.slice(from + TROPHY_CSS_MARKER.length, to);
}
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

  const style = trophyCss();
  const lockedAt = style.indexOf('.trophy-card--locked .trophy-art');
  assert.ok(lockedAt >= 0, 'public/styles.css must dim the locked artwork');
  const lockedBlock = style.slice(lockedAt, style.indexOf('}', lockedAt));
  assert.ok(lockedBlock.includes('grayscale('), 'the locked rule must grayscale the same artwork');
  assert.ok(lockedBlock.includes('opacity:'), 'the locked rule must dim the same artwork');
});

test('the trophies VIEW_STYLE is token-only and the screen has no progress bar or chart', async () => {
  const { screenHtml } = await import('../public/views/trophies.js');
  const style = trophyCss();

  assert.ok(!style.includes('#'), 'the trophy rules must not contain a raw hex color');
  assert.ok(!style.includes('color-mix('), 'the trophy rules must not use color-mix()');
  assert.ok(!style.includes('background-image'), 'the trophy rules must not use background-image');
  for (const token of ['var(--color-bronze)', 'var(--color-silver)', 'var(--color-gold)']) {
    assert.ok(style.includes(token), `the trophy rules must consume ${token}`);
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

// ===== step 3.3 (T4 + carried obligation 1): the wiring -- /trophies in
// ROUTES, the fourth nav tab, PRECACHE += "/views/trophies.js", CACHE
// magic-vet-v18 -- plus the SK2-7 asset test the run has been deferring.
// Hebrew appears here ONLY as backslash-u escapes written by
// $HOME/trophies-art/apply-3.3.js; it is never typed.
import { existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const t33AppPath = path.join(root, 'public', 'app.js');
const t33IndexPath = path.join(root, 'public', 'index.html');
const t33SwPath = path.join(root, 'public', 'sw.js');
const t33ArtDir = path.join(root, 'public', 'assets', 'trophies');
const t33AssetsDir = path.join(root, 'public', 'assets');

test('app.js routes /trophies to the trophies view, keeps /placement tab-less and keeps /parent out of ROUTES', () => {
  const app = readFileSync(t33AppPath, 'utf8');
  const html = readFileSync(t33IndexPath, 'utf8');

  assert.ok(
    app.includes('import { render as renderTrophies } from "./views/trophies.js";'),
    'app.js must statically import the trophies view',
  );
  assert.ok(app.includes('"/trophies": renderTrophies,'), '/trophies must be a ROUTES entry');

  // the parent door stays exactly as it was: lazy, hash-only, never in ROUTES.
  assert.ok(app.includes('const OWNER_ROUTE = "/parent";'), 'OWNER_ROUTE must be untouched');
  assert.ok(app.includes('import("./views/parent.js")'), 'the parent view must stay lazily imported');
  assert.ok(!app.includes('"/parent":'), '/parent must never become a ROUTES entry');

  // /placement is the tab-less route: in ROUTES, absent from the nav.
  assert.ok(app.includes('"/placement":'), '/placement must stay a ROUTES entry');
  assert.ok(!html.includes('data-route="/placement"'), '/placement must stay tab-less');
});

test('index.html carries exactly four nav tabs and the trophies tab is last, after the words tab', () => {
  const html = readFileSync(t33IndexPath, 'utf8');
  const TITLE = '\u05d4\u05d2\u05d1\u05d9\u05e2\u05d9\u05dd \u05e9\u05dc\u05d9';
  assert.strictEqual(TITLE.length, 11, 'the extracted tab label is eleven characters');

  assert.strictEqual(html.split('class="nav-tab"').length - 1, 4, 'expected exactly four nav tabs');

  const trophiesAt = html.indexOf('data-route="/trophies"');
  const wordsAt = html.indexOf('data-route="/words"');
  assert.ok(trophiesAt >= 0, 'the trophies tab must exist');
  assert.ok(wordsAt >= 0, 'the words tab must exist');
  assert.ok(trophiesAt > wordsAt, 'T4 pins DOM order: the trophies tab comes AFTER the words tab');

  const start = html.indexOf('<a class="nav-tab" href="#/trophies"');
  assert.ok(start >= 0, 'the trophies tab must be an <a class="nav-tab"> with its own href');
  const block = html.slice(start, html.indexOf('</a>', start) + 4);
  assert.ok(block.includes('href="#/trophies"'), 'the tab must link to #/trophies');
  assert.ok(block.includes('viewBox="0 0 24 24"'), 'the icon must match the three existing tabs');
  assert.ok(block.includes('stroke-width="1.6"'), 'the icon must match the three existing tabs');
  assert.ok(block.includes('fill-opacity="0.15"'), 'the icon must match the three existing tabs');
  assert.ok(block.includes('<span>' + TITLE + '</span>'), 'the tab label is the extracted design.md label');

  // negative controls, restated from tests/parent-access.test.js:37-38 so that
  // a fourth tab can never smuggle the parent door into the shipped shell.
  assert.ok(!html.includes('#/parent'), 'the parent door must stay invisible');
  assert.ok(!html.includes('data-route="/parent"'), 'the parent door must stay invisible');
});

test('every trophy id has its own webp on disk, all nine are distinct, and none of them is precached', async () => {
  const { TROPHY_CATALOG } = await import('../lib/profile.js');

  // Documentation of intent only. existsSync is CASE-BLIND on this machine
  // (P3-AMENDMENT #1: existsSync("public/assets/trophies/quizright.webp")
  // returns true while the real file is quizRight.webp), so this loop CANNOT
  // police the frozen camelCase. It runs first on purpose: under a mis-cased
  // file it still passes and the deepStrictEqual below is what fails.
  for (const trophy of TROPHY_CATALOG) {
    assert.ok(existsSync(path.join(t33ArtDir, trophy.id + '.webp')), 'expected artwork for ' + trophy.id);
  }
  assert.ok(existsSync(path.join(t33ArtDir, 'shelf-header.webp')), 'expected the shelf-header banner');

  // THE GATE. readdirSync returns the TRUE on-disk spelling and is case-exact
  // on every platform. Vercel serves from a case-SENSITIVE Linux filesystem,
  // so a mis-cased derivative would 404 on her phone while existsSync stayed
  // green here. This also subsumes "the directory holds exactly nine files".
  const got = readdirSync(t33ArtDir).sort();
  const want = ['chapters', 'curious', 'days', 'known', 'proven', 'quizRight', 'quizzer', 'shelf-header', 'streak']
    .map((n) => n + '.webp')
    .sort();
  assert.deepStrictEqual(got, want);
  assert.strictEqual(got.length, 9, 'the trophies directory holds exactly nine files');

  // all nine distinct from each other...
  const seen = new Map();
  for (const name of got) {
    const digest = createHash('md5').update(readFileSync(path.join(t33ArtDir, name))).digest('hex');
    assert.ok(!seen.has(digest), name + ' is byte-identical to ' + seen.get(digest));
    seen.set(digest, name);
  }

  // ...and from the eight webps that already lived in public/assets.
  const others = readdirSync(t33AssetsDir).filter((n) => n.endsWith('.webp')).sort();
  assert.strictEqual(others.length, 8, 'expected the eight pre-existing public/assets webps');
  for (const name of others) {
    const digest = createHash('md5').update(readFileSync(path.join(t33AssetsDir, name))).digest('hex');
    assert.ok(!seen.has(digest), 'assets/' + name + ' is byte-identical to trophies/' + seen.get(digest));
  }

  // carried obligation 3 / design T6: trophy artwork is runtime-fetched and
  // must NEVER enter the precache list.
  const sw = readFileSync(t33SwPath, 'utf8');
  const precacheMatch = sw.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
  assert.ok(precacheMatch, 'expected to find the PRECACHE array literal in sw.js');
  for (const entry of JSON.parse(precacheMatch[1])) {
    assert.ok(!entry.includes('/assets/trophies/'), 'trophy artwork must never be precached, found ' + entry);
  }
});

// ===== step 3.4 (T5): the celebration -- ONE overlay per pass, localStorage
// memory, and exactly the three designed hook points. SK3-10 as AMENDED by
// P3-AMENDMENT #2 (owner ruling, 2026-07-30): the FIRST uncelebrated tier is
// shown and ONLY THAT ONE is marked, so the backlog DRAINS one per earning
// moment instead of being discarded. Hebrew appears here ONLY as backslash-u
// escapes written by $HOME/trophies-art/apply-3.4.js; it is never typed.
import { statSync } from 'node:fs';

const t34WordsPath = path.join(root, 'public', 'views', 'words.js');
const t34ReaderPath = path.join(root, 'public', 'views', 'reader.js');
const t34QuizPath = path.join(root, 'public', 'quiz.js');
const t34QuizCorePath = path.join(root, 'public', 'quiz-core.js');
const t34PublicDir = path.join(root, 'public');
const t34Count = (haystack, needle) => haystack.split(needle).length - 1;

// tests/shell.test.js:33-45's listJsFiles, reused.
function t34ListJsFiles(dir) {
  const entries = readdirSync(dir);
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files = files.concat(t34ListJsFiles(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

// The injected reader/writer of design T5. `read` is the parameter
// uncelebrated() takes; `store` is what the module sees as localStorage.
function t34Store(initial) {
  const map = new Map(Object.entries(initial || {}));
  const writes = [];
  return {
    writes,
    read: (key) => (map.has(key) ? map.get(key) : null),
    store: {
      getItem: (key) => (map.has(key) ? map.get(key) : null),
      setItem: (key, value) => { writes.push([key, value]); map.set(key, value); },
    },
  };
}

function t34WithStorage(stub, fn) {
  const had = Object.prototype.hasOwnProperty.call(globalThis, 'localStorage');
  const previous = globalThis.localStorage;
  globalThis.localStorage = stub;
  try {
    return fn();
  } finally {
    if (had) globalThis.localStorage = previous;
    else delete globalThis.localStorage;
  }
}

test('uncelebrated lists every unrecorded earned tier in catalogue then bronze-silver-gold order', async () => {
  const { uncelebrated } = await import('../public/views/trophies.js');
  const profile = {
    trophies: {
      known: { bronze: '2026-07-01T00:00:00.000Z', silver: '2026-07-02T00:00:00.000Z' },
      chapters: { bronze: '2026-07-03T00:00:00.000Z' },
      // an id this build does not know (T1 forward compatibility) is IGNORED
      dragons: { bronze: '2026-07-04T00:00:00.000Z' },
    },
  };

  // chapters precedes known in TROPHY_VIEW, and bronze precedes silver.
  const empty = t34Store({});
  const got = uncelebrated(profile, empty.read);
  assert.deepStrictEqual(got, [
    { id: 'chapters', tier: 'bronze' },
    { id: 'known', tier: 'bronze' },
    { id: 'known', tier: 'silver' },
  ]);
  assert.ok(!JSON.stringify(got).includes('dragons'), 'an unknown trophy id must never appear');

  // a tier this phone has already recorded drops out of the list
  const seen = t34Store({ 'trophyCelebrated:known:bronze': '2026-07-05T00:00:00.000Z' });
  assert.deepStrictEqual(uncelebrated(profile, seen.read), [
    { id: 'chapters', tier: 'bronze' },
    { id: 'known', tier: 'silver' },
  ]);

  // nothing earned at all
  assert.deepStrictEqual(uncelebrated({ trophies: {} }, empty.read), []);
  assert.deepStrictEqual(uncelebrated({}, empty.read), []);
});

test('maybeCelebrateTrophy shows exactly one overlay per pass and drains the backlog one at a time', async () => {
  const { maybeCelebrateTrophy } = await import('../public/views/trophies.js');

  // the REAL day-one set measured 2026-07-30: four bronze tiers at once.
  const iso = '2026-07-30T00:00:00.000Z';
  const profile = {
    trophies: {
      days: { bronze: iso },
      streak: { bronze: iso },
      known: { bronze: iso },
      curious: { bronze: iso },
    },
  };

  const s = t34Store({});
  const shown = [];
  t34WithStorage(s.store, () => {
    for (let i = 0; i < 4; i += 1) {
      const before = s.writes.length;
      const got = maybeCelebrateTrophy(profile);
      assert.ok(got, 'pass ' + (i + 1) + ' must still have a trophy to show');
      assert.strictEqual(got.tier, 'bronze');
      shown.push(got.id);
      // P3-AMENDMENT #2: exactly ONE key per pass...
      assert.strictEqual(s.writes.length - before, 1, 'pass ' + (i + 1) + ' must write exactly one key');
      // ...and it is the key of the tier that was SHOWN, never another one.
      const last = s.writes[s.writes.length - 1];
      assert.strictEqual(last[0], 'trophyCelebrated:' + got.id + ':' + got.tier);
      assert.ok(!Number.isNaN(Date.parse(last[1])), 'the stored value must parse as ISO, got ' + last[1]);
    }
    // the fifth pass: caught up, so nothing shown and nothing written
    const before = s.writes.length;
    assert.strictEqual(maybeCelebrateTrophy(profile), null);
    assert.strictEqual(s.writes.length, before, 'a caught-up phone must write nothing');
  });

  assert.deepStrictEqual(shown, ['days', 'streak', 'known', 'curious'],
    'the backlog drains in TROPHY_VIEW order, one per earning moment');
  assert.strictEqual(s.writes.length, 4, 'four earning moments, four keys -- never a parade');

  // negative control: an unearned profile shows nothing and writes nothing
  const none = t34Store({});
  t34WithStorage(none.store, () => {
    assert.strictEqual(maybeCelebrateTrophy({ trophies: {} }), null);
    assert.strictEqual(maybeCelebrateTrophy({}), null);
  });
  assert.strictEqual(none.writes.length, 0, 'an unearned profile must write nothing');
});

test('a localStorage failure never breaks the celebration path', async () => {
  const { uncelebrated, maybeCelebrateTrophy } = await import('../public/views/trophies.js');
  const profile = { trophies: { days: { bronze: '2026-07-30T00:00:00.000Z' } } };

  // private mode: the very first access throws (public/api.js:3-9).
  const boom = {
    getItem() { throw new Error('private mode'); },
    setItem() { throw new Error('private mode'); },
  };
  t34WithStorage(boom, () => {
    let got = 'not-run';
    assert.doesNotThrow(() => { got = maybeCelebrateTrophy(profile); },
      'a storage throw must never break the screen or the quiz');
    // fail towards SHOWING: a reader that throws means 'not celebrated'
    assert.deepStrictEqual(got, { id: 'days', tier: 'bronze' });
    assert.doesNotThrow(() => { uncelebrated(profile); }, 'the list must not throw either');
    assert.deepStrictEqual(uncelebrated(profile), [{ id: 'days', tier: 'bronze' }]);
    // the write could not be recorded, so the next pass shows it again
    assert.deepStrictEqual(maybeCelebrateTrophy(profile), { id: 'days', tier: 'bronze' });
  });

  // no storage object at all (node, and any phone with the API absent)
  t34WithStorage(undefined, () => {
    assert.deepStrictEqual(maybeCelebrateTrophy(profile), { id: 'days', tier: 'bronze' });
  });
});

test('the celebration is hooked at exactly the three designed moments, guarded on total > 0, and never inside renderQuizDone', () => {
  const words = readFileSync(t34WordsPath, 'utf8');
  const reader = readFileSync(t34ReaderPath, 'utf8');
  const quiz = readFileSync(t34QuizPath, 'utf8');
  const quizCore = readFileSync(t34QuizCorePath, 'utf8');

  // T5 names three hook points and SK3-11 refuses the free fourth one.
  assert.strictEqual(t34Count(words, 'maybeCelebrateTrophy('), 1, 'words.js celebrates exactly once');
  assert.strictEqual(t34Count(reader, 'maybeCelebrateTrophy('), 1, 'reader.js celebrates exactly once');
  assert.strictEqual(t34Count(quiz, 'maybeCelebrateTrophy('), 0, 'QZ-18: quiz.js must never celebrate');
  assert.strictEqual(t34Count(quizCore, 'maybeCelebrateTrophy('), 0, 'quiz-core.js must never celebrate');

  // every OTHER .js under public/ is silent about the celebration
  const owners = ['views/trophies.js', 'views/words.js', 'views/reader.js'];
  const files = t34ListJsFiles(t34PublicDir);
  assert.ok(files.length > 0, 'expected to find .js files under public/');
  const checked = [];
  for (const file of files) {
    const rel = path.relative(t34PublicDir, file).split(path.sep).join('/');
    if (owners.includes(rel)) continue;
    checked.push(rel);
    assert.strictEqual(t34Count(readFileSync(file, 'utf8'), 'maybeCelebrateTrophy'), 0,
      rel + ' must not mention the celebration -- exactly three hooks exist');
  }
  for (const rel of ['quiz.js', 'quiz-core.js', 'api.js', 'views/home.js', 'views/placement.js', 'views/parent.js']) {
    assert.ok(checked.includes(rel), 'expected ' + rel + ' to be among the files swept');
  }

  // SK3-2: the reader asks the server ONCE, into a LOCAL, and only boot() may
  // ever reassign the module-scope profile.
  assert.strictEqual(t34Count(reader, 'async function celebrateFromServer() {'), 1);
  assert.strictEqual(t34Count(reader, 'await celebrateFromServer();'), 2, 'exactly two designed calls');
  assert.strictEqual(t34Count(reader, 'celebrateFromServer'), 3, 'one declaration plus exactly two calls');
  const helperAt = reader.indexOf('async function celebrateFromServer() {');
  const celebrateAt = reader.indexOf('maybeCelebrateTrophy(fresh);', helperAt);
  assert.ok(celebrateAt > helperAt, 'the single celebration call must live inside celebrateFromServer');
  assert.ok(reader.slice(helperAt, celebrateAt).includes('let fresh;'),
    'celebrateFromServer must read the fresh profile into a LOCAL (SK3-2)');
  // SK3-2, RE-EXPRESSED by word-finish P1-AMENDMENT #4. The invariant is unchanged:
  // the reader asks the server ONCE in boot(), into a LOCAL, and only boot() may ever
  // adopt that answer into the module-scope profile. Step 1.3 had to split the fetch
  // from the adoption (it must compare the signature BEFORE adopting), so the old
  // single-line spelling `profile = await getJson(...)` no longer exists. Pinning the
  // spelling made this test fail on a change that STRENGTHENED the invariant.
  assert.strictEqual(t34Count(reader, 'await getJson("/api/profile")'), 2,
    'exactly two server reads: boot() and celebrateFromServer');
  assert.strictEqual(t34Count(reader, 'profile = fresh;'), 1,
    'the module-scope profile is adopted in exactly one place');
  const adoptAt = reader.indexOf('profile = fresh;');
  const bootAt = reader.indexOf('async function boot() {');
  assert.ok(bootAt >= 0 && adoptAt > bootAt && adoptAt < helperAt,
    'the one adoption must sit inside boot(), never in celebrateFromServer');

  // the no-questions path (quiz.js:247-250) fires onDone with NO done screen,
  // so both hooks are guarded on total > 0.
  const wordsHook = words.indexOf('onDone: async ({ total }) => {');
  assert.ok(wordsHook >= 0, 'the words hook must receive { total }');
  const wordsBlock = words.slice(wordsHook, words.indexOf('},', wordsHook) + 2);
  assert.ok(wordsBlock.includes('total > 0'), 'the words hook must skip the no-questions path');
  assert.ok(wordsBlock.includes('maybeCelebrateTrophy(profile)'), 'the words hook celebrates the re-read profile');
  const readerHook = reader.indexOf('onDone: async ({ total }) => {');
  assert.ok(readerHook >= 0, 'the reader hook must receive { total }');
  const readerBlock = reader.slice(readerHook, reader.indexOf('},', readerHook) + 2);
  assert.ok(readerBlock.includes('total > 0'), 'the reader hook must skip the no-questions path');
  assert.ok(readerBlock.includes('await celebrateFromServer();'), 'the reader hook celebrates from a fresh GET');

  // tests/reader-ui.test.js:192-196 deepStrictEquals this shape: no third key.
  assert.ok(reader.includes('{ started: false, done: false }'), 'the quizState shape is frozen');
  assert.strictEqual(t34Count(reader, 'celebrated:'), 0, 'no celebrated flag may join quizState');
  assert.strictEqual(t34Count(reader, '.celebrated'), 0, 'no celebrated flag may join quizState');

  // QZ-18: renderQuizDone keeps its two frozen text nodes and gains nothing.
  const DONE_TITLE = '<p class="quiz-done-title">\u05e1\u05d9\u05d9\u05de\u05e0\u05d5 \u05d0\u05ea \u05d4\u05ea\u05e8\u05d2\u05d5\u05dc!</p>';
  const DONE_SCORE = '<p class="quiz-done-score">${right} \u05de\u05ea\u05d5\u05da ${total}</p>';
  assert.ok(quiz.includes(DONE_TITLE), 'renderQuizDone must keep its frozen title node');
  assert.ok(quiz.includes(DONE_SCORE), 'renderQuizDone must keep its frozen score node');
  for (const needle of ['maybeCelebrateTrophy', 'trophyCelebrated', 'celebrate', 'Celebrate', 'trophies.js']) {
    assert.ok(!quiz.includes(needle), 'quiz.js must carry no celebration identifier, found ' + needle);
    assert.ok(!quizCore.includes(needle), 'quiz-core.js must carry no celebration identifier, found ' + needle);
  }
});

test('the celebration honours reduced motion and sits below the entry-code gate', () => {
  const src = readFileSync(trophiesViewPath, 'utf8');
  const style = trophyCss();

  // z-index 90: below the entry-code gate (public/styles.css:413), above the
  // bottom nav (:331). A celebration must never cover the login gate.
  const overlayAt = style.indexOf('.trophy-celebrate {');
  assert.ok(overlayAt >= 0, 'public/styles.css must carry the .trophy-celebrate overlay rule');
  const overlayRule = style.slice(overlayAt, style.indexOf('}', overlayAt));
  assert.ok(overlayRule.includes('z-index: 90'), 'the overlay must sit at z-index 90');
  assert.ok(!overlayRule.includes('100'), 'the overlay must stay BELOW the entry-code gate');
  assert.ok(overlayRule.includes('position: fixed'), 'the overlay must cover the screen');

  // A1 (design.md 9): the whole celebration block stays TOKEN-ONLY. The only
  // raw colour it may carry is rgba() -- the scrim and the two shadows -- and
  // it may reach for neither color-mix() nor a background-image.
  const celBlock = style.slice(overlayAt);
  assert.ok(!celBlock.includes('color-mix('),
    'the celebration rules must not use color-mix()');
  assert.ok(!celBlock.includes('background-image'),
    'the celebration rules must not use background-image');
  for (const token of ['var(--color-glow)', 'var(--color-primary-ink)']) {
    assert.ok(celBlock.includes(token), 'the celebration must consume ' + token);
  }

  // T5's reduced-motion clause (the public/views/reader.js:110 precedent).
  const rmAt = style.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.ok(rmAt >= 0, 'T5 requires the reduced-motion block');
  const rmBlock = style.slice(rmAt, style.indexOf('\n}', rmAt));
  assert.ok(rmBlock.includes('.trophy-celebrate-card'),
    'the celebration card must be named inside the reduced-motion block');
  assert.ok(rmBlock.includes('.trophy-celebrate-name'),
    'the name entrance must be stilled inside the reduced-motion block');
  // A1: the ray fan is REMOVED under reduced motion, not merely stopped -- a
  // frozen pinwheel reads as a rendering bug, not as a still image, so
  // `animation: none` on the rays is NOT an acceptable substitute here.
  assert.ok(/\.trophy-celebrate-rays\s*\{[^}]*display:\s*none/.test(rmBlock),
    'A1: under reduced motion the ray fan must be display: none, not merely un-animated');

  // the overlay markup: artwork + name. The tier is the RING, never a word.
  const markupAt = src.indexOf('function celebrateHtml(');
  assert.ok(markupAt >= 0, 'the overlay markup must live in celebrateHtml');
  const markup = src.slice(markupAt, src.indexOf('\n}', markupAt));
  assert.ok(markup.includes('src="/assets/trophies/${trophy.id}.webp"'), 'the overlay shows the artwork');
  assert.ok(markup.includes('${trophy.name}'), 'the overlay shows the trophy name');
  assert.ok(markup.includes('trophy-card--${tier}'), 'SK3-8: the tier is the ring class, not a word');
  assert.ok(markup.includes('trophy-celebrate-art'), 'the overlay art carries its own size class');

  // SK3-8: the module's Hebrew inventory is EXACTLY ten strings -- the eight
  // trophy names, the screen title and the progress word. The celebration
  // authors none, so a tier WORD would show up here as an eleventh.
  const runs = src.match(/[\u0590-\u05ff]+(?: [\u0590-\u05ff]+)*/g) || [];
  const distinct = new Set(runs);
  assert.strictEqual(distinct.size, 10,
    'expected exactly ten distinct Hebrew strings in the module, got ' + distinct.size);
  assert.strictEqual(runs.length, 10, 'each of the ten appears exactly once, got ' + runs.length);
});

// Phase 3, step 3.5 -- T10: the dated, ADDITIVE palette truth-fix in
// docs/visual-design.md. This asserts the correction is TRUE, not merely
// present: every 6-digit-hex token declared in the styles.css :root block must
// appear verbatim in the doc, so the day a token moves without being recorded,
// this fails.
test('docs/visual-design.md carries the dated palette correction, cites styles.css as the source of truth, and records the 58-pair gate', () => {
  const doc = readFileSync(path.join(root, 'docs', 'visual-design.md'), 'utf8');
  const css = readFileSync(cssPath, 'utf8');

  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  assert.ok(rootMatch, 'could not find the :root block in public/styles.css');
  const decls = rootMatch[1].match(/--[a-z0-9-]+\s*:\s*[^;]+;/g) || [];
  assert.ok(decls.length >= 20, 'expected at least 20 :root declarations, got ' + decls.length);
  let hexCount = 0;
  for (const decl of decls) {
    const parts = decl.match(/(--[a-z0-9-]+)\s*:\s*([^;]+);/);
    const name = parts[1];
    const value = parts[2].trim();
    if (!/^#[0-9a-f]{6}$/i.test(value)) continue;
    hexCount++;
    assert.ok(doc.includes(value),
      'docs/visual-design.md does not record the live value of ' + name + ' (' + value + ')');
  }
  assert.ok(hexCount >= 20, 'expected at least 20 six-digit-hex tokens in :root, got ' + hexCount);

  // the correction is dated
  assert.ok(doc.includes('2026-07-30'), 'the correction must carry its date');

  // styles.css is named as the source of truth right under the section-3 heading
  const docLines = doc.split(String.fromCharCode(10));
  const h3 = docLines.findIndex((l) => l.indexOf('## 3.') === 0);
  assert.ok(h3 >= 0, 'the section-3 heading is missing');
  const near = docLines.slice(h3 + 1, h3 + 41).join(String.fromCharCode(10));
  assert.ok(near.includes('public/styles.css'),
    'public/styles.css must be cited as the source of truth within 40 lines of the section-3 heading');

  // the gate size correction
  assert.ok(/58\W{0,4}pairs/.test(doc), 'the doc must record the 58-pair contrast gate');

  // phase 2's output must have survived a strictly additive edit
  assert.ok(doc.includes('### FROZEN STYLE SUFFIX'), 'the FROZEN STYLE SUFFIX heading must survive');
  const trophyIds = ['chapters', 'days', 'streak', 'known', 'quizRight', 'quizzer', 'curious', 'proven', 'shelf-header'];
  for (const id of trophyIds) {
    assert.ok(doc.includes('assets/delight/trophies/' + id + '.png'),
      'the trophy inventory row for ' + id + ' must survive');
  }
});

// ===== step 3.6a: the celebration must be styled WHEREVER IT FIRES ==========
// The step-3.6 visual gate measured what every mechanical gate missed: the
// overlay is document.body.appendChild-ed and fires from words.js and
// reader.js, i.e. only ever on routes where the trophies view is NOT mounted,
// so a view-local style block emitted inside container.innerHTML is never in
// the document when the celebration appears. Test 17 asserted the CSS TEXT
// EXISTED; nothing asserted it was REACHABLE. This is that assertion.
test('the celebration is styled from the globally-linked stylesheet, not from a view that may not be mounted', () => {
  const css = readFileSync(cssPath, 'utf8');
  const view = readFileSync(trophiesViewPath, 'utf8');
  const html = readFileSync(t33IndexPath, 'utf8');
  const sw = readFileSync(t33SwPath, 'utf8');

  // 1. every rule the shelf and the celebration need is in the stylesheet.
  //
  // P3-NOTE #7, hardened (owner-approved 2026-07-30). This used to be
  // css.includes(selector), which CANNOT see a whole rule being deleted:
  // '.trophy-celebrate' is a PREFIX of '.trophy-celebrate-card', so the
  // containment form kept passing over the corpse. It is now RULE-SHAPED --
  // the selector must OPEN ITS OWN RULE at the start of a line, which is what
  // a top-level rule looks like in this stylesheet. The copies inside the
  // reduced-motion media query are indented, and are deliberately not counted:
  // they modify a rule, they are not one.
  const ownRule = (selector) => css.indexOf(String.fromCharCode(10) + selector + ' {') >= 0;
  for (const selector of [
    '.trophy-celebrate', '.trophy-celebrate-card', '.trophy-celebrate-art',
    '.trophy-art', '.trophy-name', '.trophy-celebrate-name', '.trophy-celebrate-rays',
    '.trophy-card--locked',
    '.trophy-card--bronze .trophy-art', '.trophy-card--silver .trophy-art', '.trophy-card--gold .trophy-art',
    // word-trophy-tiers: the pips live in the GLOBAL sheet for the same reason every
    // rule above does -- a view-scoped block only exists while that view is mounted
    // (field guide 14), and the celebration card carries these classes too.
    '.trophy-pips', '.trophy-pip',
    '.trophy-card--bronze .trophy-pip--on', '.trophy-card--silver .trophy-pip--on', '.trophy-card--gold .trophy-pip--on',
  ]) {
    assert.ok(ownRule(selector),
      'public/styles.css must carry a rule of its OWN for ' + selector + ' -- the overlay fires on routes where the trophies view is not mounted');
  }

  // 2. the view carries no style block at all, so no rule can be view-local
  assert.ok(!view.includes('<style>'),
    'public/views/trophies.js must emit no style block -- it only exists while that view is mounted');
  assert.ok(!view.includes('VIEW_STYLE'),
    'public/views/trophies.js must declare no VIEW_STYLE -- the rules live in public/styles.css');

  // 3. the stylesheet really is always present: linked in the shell, precached
  assert.ok(html.includes('href="/styles.css"'),
    'public/index.html must link /styles.css on every route');
  const precacheMatch = sw.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
  assert.ok(precacheMatch, 'expected to find the PRECACHE array literal in sw.js');
  assert.ok(JSON.parse(precacheMatch[1]).includes('/styles.css'),
    'the service worker must precache /styles.css');
});

// ===== step 3.8: design.md section 9 amendment A1 -- the celebration is a
// MOMENT, not a list item. Phase 3 built the overlay out of shelf parts: the
// celebration card was the .trophy-card recipe (--color-card, --radius,
// --shadow-soft) and the name was the same 1rem/700 it has in the grid, so the
// reward carried no signal that it outranked a row. This is the assertion that
// the rebuild actually happened. The two font sizes are PARSED and compared,
// never hard-coded, so the test stays honest if either side is retuned.
test('the celebration is a floating medallion, not a shelf card, and its name is not caption-sized', () => {
  const css = readFileSync(cssPath, 'utf8');
  const view = readFileSync(trophiesViewPath, 'utf8');

  const celAt = css.indexOf('.trophy-celebrate {');
  assert.ok(celAt >= 0, 'public/styles.css must carry the .trophy-celebrate overlay rule');
  const entryAt = css.indexOf(ENTRY_CSS_MARKER);
  assert.ok(entryAt > celAt, 'the celebration rules must sit BEFORE the entry-code gate section');
  const celBlock = css.slice(celAt, entryAt);

  // 1. it is not built from shelf parts any more
  assert.ok(!celBlock.includes('background: var(--color-card)'),
    'A1: the celebration is not a card -- found background: var(--color-card)');
  assert.ok(!celBlock.includes('box-shadow: var(--shadow-soft)'),
    'A1: the medallion floats on a drop-shadow -- found box-shadow: var(--shadow-soft)');

  // 1b. the desktop ray cap (owner ruling 2026-07-30). .trophy-celebrate is
  //     fixed/inset:0, so on a laptop the fan spanned the whole window while
  //     the app column is 480px. The cap is a max-width plus auto inline
  //     margins, NOT a media query -- on a 390px phone 480px does not bind
  //     and the phone rendering is unchanged.
  const raysAt = css.indexOf('.trophy-celebrate-rays {');
  assert.ok(raysAt >= 0, 'public/styles.css must carry the .trophy-celebrate-rays rule');
  // the rule with its /* ... */ comments STRIPPED: this rule carries an
  //     explanatory comment that names max-width itself, and a comment is not
  //     a declaration -- reading one is the A3 defect all over again.
  const raysRule = css.slice(raysAt, css.indexOf('\n}', raysAt))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(/max-width:\s*480px/.test(raysRule),
    'the ray fan must be capped to the app column width on desktop');
  assert.ok(/margin-inline:\s*auto/.test(raysRule),
    'the capped ray fan must centre itself with auto inline margins');

  // 2. the celebration name outranks the shelf caption
  const remOf = (selector) => {
    const at = css.indexOf(selector + ' {');
    assert.ok(at >= 0, 'public/styles.css must carry ' + selector);
    const rule = css.slice(at, css.indexOf('}', at));
    const found = /font-size:\s*([0-9.]+)rem/.exec(rule);
    assert.ok(found, selector + ' must declare a font-size in rem');
    return parseFloat(found[1]);
  };
  const celebrateRem = remOf('.trophy-celebrate-name');
  const shelfRem = remOf('.trophy-name');
  assert.ok(celebrateRem > shelfRem,
    'A1: the celebration name (' + celebrateRem + 'rem) must outrank the shelf name (' + shelfRem + 'rem)');

  // 3. the name is a SIBLING of the medallion, not a child of it -- that is
  //    what lets the card BE the medallion.
  const markupAt = view.indexOf('function celebrateHtml(');
  assert.ok(markupAt >= 0, 'the overlay markup must live in celebrateHtml');
  const markup = view.slice(markupAt, view.indexOf('\n}', markupAt));
  const cardAt = markup.indexOf('<div class=\"trophy-celebrate-card');
  assert.ok(cardAt >= 0, 'the overlay must still carry the medallion element');
  const cardEnd = markup.indexOf('</div>', cardAt);
  assert.ok(cardEnd > cardAt, 'the medallion element must be closed');
  assert.ok(!markup.slice(cardAt, cardEnd).includes('trophy-celebrate-name'),
    'A1: the name must sit OUTSIDE .trophy-celebrate-card');
  assert.ok(markup.indexOf('trophy-celebrate-name') > cardEnd,
    'A1: the name is a sibling that FOLLOWS the medallion');
  assert.ok(!markup.includes('class=\"trophy-name\"'),
    'A1: the celebration must not reuse the shelf caption class');
});

// ===== step 3.9: design.md section 9, amendments A2 and A3. A2 REINSTATES the
// celebration sound, reversing signed T5 and T9; A3 records why the assertion
// that used to guard this ground was blind. It forbade three needles -- an
// Audio constructor, a media element and a play() call -- and Web Audio uses
// none of them, so sound could have shipped in full while a test named 'adds
// no sound' stayed green. Below is the REAL constraint: synthesis, and
// nothing but synthesis.
test('the celebration sound is Web Audio only -- no media element, no Audio object, and no audio asset', () => {
  const view = readFileSync(trophiesViewPath, 'utf8');

  // 1. the sound exists, and it is synthesised
  assert.ok(view.includes('createOscillator('),
    'A2: the celebration must synthesise its arpeggio with Web Audio');
  assert.ok(view.includes('AudioContext'),
    'A2: the celebration must obtain a Web Audio context');

  // 2. ...and it is synthesised ONLY: no media element, no Audio object, no
  //    src assignment and no audio file extension anywhere in the module.
  for (const needle of ['<audio', 'new Audio(', '.src =', '.mp3', '.wav', '.ogg', '.aac']) {
    assert.ok(!view.includes(needle),
      'A2: the sound path must stay Web-Audio-only, found ' + needle);
  }

  // 3. it can never break the celebration, the screen or the quiz: silence is
  //    an acceptable outcome of a blocked AudioContext, an exception is not.
  const soundAt = view.indexOf('function playEarnedSound() {');
  assert.ok(soundAt >= 0, 'A2: the celebration must carry playEarnedSound');
  const soundBody = view.slice(soundAt, view.indexOf('\n}', soundAt));
  assert.ok(soundBody.includes('try {'),
    'A2: the whole sound path must sit inside a try block');
  assert.ok(soundBody.includes('catch'),
    'A2: playEarnedSound must catch, so a blocked context costs only silence');

  // 4. nothing audio-shaped joined the precache list
  const sw = readFileSync(t33SwPath, 'utf8');
  const precacheMatch = sw.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
  assert.ok(precacheMatch, 'expected to find the PRECACHE array literal in sw.js');
  for (const entry of JSON.parse(precacheMatch[1])) {
    assert.ok(!/audio/i.test(entry),
      'A2: PRECACHE must gain no audio entry, found ' + entry);
  }

  // 5. and no audio ASSET was added. public/assets is WALKED, not counted, so
  //    a file dropped into any sub-directory of it is caught too.
  const audioAssets = [];
  const walkAssets = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walkAssets(full);
      else if (/[.](mp3|wav|ogg|aac|m4a)$/i.test(name)) audioAssets.push(name);
    }
  };
  walkAssets(t33AssetsDir);
  assert.deepStrictEqual(audioAssets, [],
    'A2: the celebration ships no audio asset, found ' + audioAssets.join(', '));
});

// Step 1.1 (word-polish) T1. The trophies screen stops borrowing .hero-banner.
// .hero-banner's bottom mask fades the shelf plank's front edge to about 57%
// opacity and the string of lights to about 49% -- the two features that make
// the artwork read AS a shelf -- but .chapter-banner and .celebrate-image share
// that rule and want the fade, so T1 adds a sibling class rather than editing
// it. Test 1 pins the new rule AND that .hero-banner did not move; test 2
// EXECUTES screenHtml and proves the markup asks for the new class, because two
// approved things (an approved image, approved CSS) make an unapproved third
// unless somebody asserts the wiring (field guide 15a/15c).
// public/styles.css is CRLF on disk, so the one multi-line needle below is
// matched against a line-ending-normalised copy; the endings themselves are
// byte-counted by this step's validation, never asserted here.

test('the shelf banner has its own class, no bottom mask, and .hero-banner is byte-unchanged', () => {
  const style = trophyCss();
  const at = style.indexOf('.shelf-banner {');
  assert.ok(at >= 0, 'the trophies CSS section must define .shelf-banner');

  const rule = style.slice(at, style.indexOf('}', at));
  for (const declaration of [
    'display: block;',
    'width: 100%;',
    'aspect-ratio: 3 / 2;',
    'object-fit: cover;',
    'border-radius: var(--radius);',
    'box-shadow: none;',
    'margin-bottom: 16px;',
  ]) {
    assert.ok(rule.includes(declaration), 'the shelf banner rule must declare ' + declaration);
  }
  for (const banned of ['mask-image', '-webkit-mask-image', 'linear-gradient', 'object-position']) {
    assert.ok(!rule.includes(banned), 'the shelf banner must carry no bottom mask, found ' + banned);
  }

  const css = readFileSync(cssPath, 'utf8');
  const flat = css.split('\r\n').join('\n');
  assert.strictEqual(
    flat.split('.hero-banner,\n.chapter-banner,\n.celebrate-image {').length - 1,
    1,
    '.hero-banner must still open its five-line group with .chapter-banner and .celebrate-image',
  );
  assert.strictEqual(
    css.split('mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);').length - 1,
    2,
    'the shared bottom mask must not move: the -webkit- line and the plain one',
  );
  assert.strictEqual(
    css.split('.hero-banner { margin-bottom: 16px; }').length - 1,
    1,
    '.hero-banner keeps its own margin rule',
  );
  assert.strictEqual(
    css.split('.shelf-banner').length - 1,
    1,
    'exactly one .shelf-banner definition in the sheet, never a second one',
  );
});

test('the trophies screen uses .shelf-banner, emits no style tag of its own, and .hero-banner is gone from it', async () => {
  const { screenHtml } = await import('../public/views/trophies.js');
  const html = screenHtml(t32Profile({}, []));

  const img = '<img class="shelf-banner" src="/assets/trophies/shelf-header.webp" alt="" />';
  assert.strictEqual(
    html.split(img).length - 1,
    1,
    'expected the shelf-header to use .shelf-banner, exactly once',
  );
  assert.strictEqual(
    html.split('hero-banner').length - 1,
    0,
    'expected the shelf-header to use .shelf-banner, not the masked .hero-banner',
  );
  assert.ok(
    html.indexOf(img) < html.indexOf('class="trophy-card"'),
    'the shelf banner must still come before the first trophy card',
  );

  const source = readFileSync(trophiesViewPath, 'utf8');
  assert.ok(
    !source.includes('<style>'),
    'field guide 14: this view may emit no style tag -- its CSS must stay in the globally-linked sheet, the only place it can reach an element written into container.innerHTML',
  );
});

// ===== step 1.2 (word-polish) D: one tier per card, so "greyed" and "target
// reached" cannot both be true. Until displayTier existed, cardHtml read the
// ring from STORED profile.trophies and the number from the LIVE metric, so
// the two could disagree -- a profile with twelve known words and an empty
// trophies map rendered the 'known' card locked while its line read "12 out
// of 5". The fix gives the card ONE tier and derives both the ring and the
// line from it, so the contradiction is not representable (field guide 15b).

const D_STORED_SHAPES = [
  undefined,
  null,
  {},
  { bronze: T32_ISO },
  { bronze: T32_ISO, silver: T32_ISO },
  { bronze: T32_ISO, silver: T32_ISO, gold: T32_ISO },
  { gold: T32_ISO },
  { silver: T32_ISO },
  { silver: T32_ISO, gold: T32_ISO },
  'notanobject',
  42,
];

// One synthesiser per trophy id, each producing a profile whose OWN metric is
// exactly m -- independent of the production metric functions, which is what
// lets this sweep catch a metric bug too, not just a displayTier bug.
function dSynthesizeProfile(id, m) {
  switch (id) {
    case 'chapters':
      return t32Profile({}, new Array(m).fill({}));
    case 'days': {
      const chapters = [];
      for (let i = 0; i < m; i += 1) {
        const at = Date.parse('2026-01-01T00:00:00.000Z') + i * 2 * 86400000;
        chapters.push({ generatedAt: new Date(at).toISOString() });
      }
      return t32Profile({}, chapters);
    }
    case 'streak': {
      const chapters = [];
      for (let i = 0; i < m; i += 1) {
        const at = Date.parse('2026-01-01T00:00:00.000Z') + i * 86400000;
        chapters.push({ generatedAt: new Date(at).toISOString() });
      }
      return t32Profile({}, chapters);
    }
    case 'known':
      return t32Profile(t32KnownWords(m), []);
    case 'quizRight':
      return t32Profile({ w0: { quizRight: m } }, []);
    case 'quizzer':
      return t32Profile({ w0: { quizRight: m, quizWrong: 0 } }, []);
    case 'curious':
      return t32Profile({ w0: { taps: m } }, []);
    case 'proven': {
      const words = {};
      for (let i = 0; i < m; i += 1) words['p' + i] = { status: 'known', nominations: 1 };
      return t32Profile(words, []);
    }
    default:
      throw new Error('no D synthesiser for trophy id ' + id);
  }
}

// The tier a metric justifies, computed independently of displayTier's own
// loop -- so a broken displayTier cannot pass by agreeing with itself.
function dLiveTier(trophy, metric) {
  let live = null;
  for (const tier of ['bronze', 'silver', 'gold']) {
    if (metric >= trophy[tier]) live = tier;
  }
  return live;
}

function dTierRank(tier) {
  return tier === null ? -1 : ['bronze', 'silver', 'gold'].indexOf(tier);
}

test('no trophy card can ever show a metric that has reached its displayed target', async () => {
  const { TROPHY_VIEW, displayTier, nextThreshold, tierOf } = await import('../public/views/trophies.js');

  let checked = 0;
  for (const trophy of TROPHY_VIEW) {
    for (let m = 0; m <= trophy.gold + 3; m += 1) {
      const profile = dSynthesizeProfile(trophy.id, m);
      const metric = trophy.metric(profile);
      const live = dLiveTier(trophy, metric);

      for (const entry of D_STORED_SHAPES) {
        checked += 1;
        const stored = tierOf(entry);
        const tier = displayTier(trophy, profile, entry);
        const next = nextThreshold(trophy, tier);

        // (a) the D invariant: a card can never show a target already reached.
        assert.ok(
          next === null || metric < next,
          `${trophy.id} metric=${metric} entry=${JSON.stringify(entry)}: displayTier=${tier}, next=${next}`,
        );

        // (b) never-regress: never below the stored tier.
        assert.ok(
          dTierRank(tier) >= dTierRank(stored),
          `${trophy.id} metric=${metric} entry=${JSON.stringify(entry)}: displayTier=${tier} is below stored=${stored}`,
        );

        // (c) the defect itself: never below what the live metric justifies.
        assert.ok(
          dTierRank(tier) >= dTierRank(live),
          `${trophy.id} metric=${metric} entry=${JSON.stringify(entry)}: displayTier=${tier} is below live=${live}`,
        );
      }
    }
  }

  // a synthesiser that silently stops producing cases cannot make this test vacuous.
  assert.strictEqual(checked, 6644, `expected exactly 6644 combinations, got ${checked}`);
});

test('cardHtml draws the ring and the progress line from the same single tier', async () => {
  const { TROPHY_VIEW, cardHtml } = await import('../public/views/trophies.js');
  const MITOCH = '\u05de\u05ea\u05d5\u05da';

  // the profile that reproduces the defect: five known words, trophies: {}.
  const profile = t32Profile(t32KnownWords(5), []);

  const progressOf = (card) => {
    const m = card.match(new RegExp('<p class="trophy-progress">(\\d+) ' + MITOCH + ' (\\d+)</p>'));
    return m ? { metric: Number(m[1]), target: Number(m[2]) } : null;
  };

  let sawBroken = false;
  let brokenId = null;
  for (const trophy of TROPHY_VIEW) {
    const card = cardHtml(trophy, profile, profile.trophies);
    const locked = card.includes('trophy-card--locked');
    const tiered = /trophy-card--(bronze|silver|gold)/.test(card);
    const progress = progressOf(card);

    if (locked) {
      assert.ok(progress, `${trophy.id}: a locked card must carry a progress line`);
      assert.ok(progress.metric < progress.target,
        `${trophy.id}: locked but metric ${progress.metric} has reached target ${progress.target}`);
    }
    if (tiered) {
      assert.ok(progress === null || progress.metric < progress.target,
        `${trophy.id}: ringed but metric ${progress && progress.metric} has reached target ${progress && progress.target}`);
    }

    if (locked && progress && progress.metric >= progress.target) {
      sawBroken = true;
      brokenId = trophy.id;
    }
  }

  // the one-line form of the whole defect: no card is both locked and at/past its target.
  assert.ok(!sawBroken, `card '${brokenId}' is both locked and at or past its target`);
});

test('the fix is display-only: awarding, the celebration and the catalogue are untouched', async () => {
  const src = readFileSync(trophiesViewPath, 'utf8');

  assert.ok(src.includes('export function tierOf(entry) {'), 'tierOf must survive byte-unchanged');
  assert.ok(src.includes('export function nextThreshold(trophy, tier) {'), 'nextThreshold must survive byte-unchanged');
  assert.ok(src.includes('export function progressLine(trophy, profile, tier) {'), 'progressLine must survive byte-unchanged');

  const collectAt = src.indexOf('function collectUncelebrated(profile, read) {');
  assert.ok(collectAt >= 0, 'collectUncelebrated must still exist');
  const collectBody = src.slice(collectAt, src.indexOf('\n}', collectAt));
  assert.ok(collectBody.includes('profile.trophies'), 'collectUncelebrated must still read profile.trophies');
  assert.ok(!collectBody.includes('displayTier'), 'collectUncelebrated must not learn about displayTier');

  assert.ok(!src.includes('awardTrophies'), 'the view must contain no awardTrophies -- awarding stays server-side only');

  const { uncelebrated } = await import('../public/views/trophies.js');
  // metric past the bronze threshold (ten known words, bronze is five), but no
  // stored tier at all -- passing a threshold must not, by itself, celebrate anything.
  const profileWithMetricPastBronzeButNoStoredTier = t32Profile(t32KnownWords(10), []);
  assert.deepStrictEqual(uncelebrated(profileWithMetricPastBronzeButNoStoredTier), []);
});

// P1-AMENDMENT #3 (word-finish). THE RENDER-LEVEL SWEEP.
//
// The auditor found the gap this closes. Test 1 sweeps displayTier in ISOLATION, so a
// regression that re-splits cardHtml's two sources while leaving displayTier correct
// would not be caught. The cardHtml test above DOES call the real render path, but with
// one profile in which only 'known' has a non-zero metric -- the other seven trophies sit
// at 0, so the same bug in any of them slips past both.
//
// This drives EVERY trophy over EVERY interesting metric value against EVERY stored shape,
// through the real cardHtml. The metric is substituted rather than the profile constructed,
// because the eight metrics read eight different profile fields and the thing under test is
// the CARD, not the arithmetic.
test('no trophy card can render greyed-out while its number has reached the target', async () => {
  const { TROPHY_VIEW, cardHtml } = await import('../public/views/trophies.js');
  const MITOCH = '\u05de\u05ea\u05d5\u05da';
  const profile = { words: {}, story: { chapters: [] }, meta: {} };

  // Extract the two numbers WITHOUT depending on the Hebrew word between them.
  // The first version of this helper used a regex containing MITOCH and matched
  // NOTHING on all 3020 cards, so the sweep silently checked zero of them.
  const progressOf = (card) => {
    const m = card.match(/<p class="trophy-progress">([^<]*)<\/p>/);
    if (!m) return null;
    const nums = m[1].match(/\d+/g);
    return nums && nums.length === 2 ? { metric: Number(nums[0]), target: Number(nums[1]) } : null;
  };

  let combos = 0;
  const violations = [];
  for (const trophy of TROPHY_VIEW) {
    for (const stored of [undefined, {}, { bronze: 'x' }, { bronze: 'x', silver: 'x' },
                          { bronze: 'x', silver: 'x', gold: 'x' }]) {
      for (let v = 0; v <= trophy.gold + 3; v++) {
        const faked = { ...trophy, metric: () => v };
        const card = cardHtml(faked, profile, { [trophy.id]: stored });
        const locked = card.includes('trophy-card--locked');
        const p = progressOf(card);
        combos += 1;
        if (locked && p && p.metric >= p.target) {
          violations.push(`${trophy.id} v=${v} stored=${JSON.stringify(stored)} -> locked but ${p.metric}/${p.target}`);
        }
      }
    }
  }
  assert.ok(combos > 1500, `sweep too small to mean anything: ${combos} combinations`);
  assert.deepStrictEqual(violations, [],
    `a card rendered greyed-out while at or past its target:\n${violations.slice(0, 5).join('\n')}`);
});

// ---------------------------------------------------------------------------
// word-trophy-tiers: THE LEVEL SHE IS AT MUST BE VISIBLE ON THE CARD.
//
// The learner's own report, 2026-08-02: "the trophies are all colored now, so
// she doesn't feel like she's achieving something ... maybe we should have some
// additional ranking, like the bronze, silver, gold".
//
// The ranking ALREADY EXISTED -- eight trophies x three tiers, thresholds
// owner-signed and pinned by the catalogue test above. What did not exist was
// any way for her to SEE which of the three she was on: the only difference
// between bronze and gold on the shelf was a 3px ring colour on a 96px circle,
// while LOCKED -> BRONZE flipped the whole card from greyscale/45% to full
// colour. So crossing the FIRST threshold looked like finishing.
//
// The pips are the fix, and they carry NO WORDS: three dots, filled to the tier.
// No new Hebrew is authored (the module's Hebrew inventory does not move), and
// nothing is translated. They are aria-hidden because the progress line already
// states the same fact in text.
//
// THE SEAM (field guide 15b): the pip count and the ring class must come from
// the SAME tier. This is the identical failure shape as the "12 out of 5" defect
// -- two correct parts disagreeing -- so it is asserted directly rather than
// hoped for, over every trophy and every tier.
// ---------------------------------------------------------------------------
test('cardHtml shows which of the three levels she is on, and the pips can never disagree with the ring', async () => {
  const { TROPHY_VIEW, cardHtml, TROPHY_TIERS_VIEW } = await import('../public/views/trophies.js');

  const pipsOf = (card) => {
    const block = card.match(/<p class="trophy-pips"[^>]*>([\s\S]*?)<\/p>/);
    if (!block) return null;
    const all = block[1].match(/<span class="trophy-pip[^"]*"><\/span>/g) || [];
    const on = block[1].match(/<span class="trophy-pip trophy-pip--on"><\/span>/g) || [];
    return { total: all.length, on: on.length };
  };

  let observed = 0;
  const violations = [];

  for (const trophy of TROPHY_VIEW) {
    // every tier, driven through the REAL render path by moving the METRIC, so
    // the tier is derived exactly as it is in production rather than injected.
    const cases = [
      { metric: 0, expectTier: null, expectOn: 0 },
      { metric: trophy.bronze, expectTier: 'bronze', expectOn: 1 },
      { metric: trophy.silver, expectTier: 'silver', expectOn: 2 },
      { metric: trophy.gold, expectTier: 'gold', expectOn: 3 },
      { metric: trophy.gold + 7, expectTier: 'gold', expectOn: 3 },
    ];
    for (const c of cases) {
      observed++;
      const faked = { ...trophy, metric: () => c.metric };
      const card = cardHtml(faked, { words: {} }, {});
      const pips = pipsOf(card);

      if (pips === null) { violations.push(`${trophy.id}@${c.metric}: no pip block at all`); continue; }
      if (pips.total !== 3) violations.push(`${trophy.id}@${c.metric}: ${pips.total} pips, expected 3`);
      if (pips.on !== c.expectOn) violations.push(`${trophy.id}@${c.metric}: ${pips.on} filled, expected ${c.expectOn}`);

      // THE SEAM: the ring class and the pip count must name the same tier.
      const ring = card.match(/trophy-card--(locked|bronze|silver|gold)/);
      const ringTier = ring && ring[1] === 'locked' ? null : ring && ring[1];
      const pipTier = pips.on === 0 ? null : TROPHY_TIERS_VIEW[pips.on - 1];
      if (ringTier !== pipTier) {
        violations.push(`${trophy.id}@${c.metric}: ring says ${ringTier} but pips say ${pipTier} -- the "12 out of 5" seam, again`);
      }
      if (ringTier !== c.expectTier) {
        violations.push(`${trophy.id}@${c.metric}: ring says ${ringTier}, expected ${c.expectTier}`);
      }
    }
  }

  assert.ok(observed === TROPHY_VIEW.length * 5,
    `sweep observed ${observed} cards, expected ${TROPHY_VIEW.length * 5} -- an uninstrumented sweep is decoration`);
  assert.deepStrictEqual(violations, [],
    `the level she is on is not legible, or contradicts the ring:\n${violations.slice(0, 6).join('\n')}`);
});

// The pips must be DECORATIVE ONLY. The progress line is the accessible statement
// of the same fact, so a screen reader must not hear "bullet bullet bullet".
test('the pips are aria-hidden, carry no text, and author no new Hebrew', async () => {
  const { TROPHY_VIEW, cardHtml } = await import('../public/views/trophies.js');
  const card = cardHtml(TROPHY_VIEW[0], { words: {} }, {});
  const block = card.match(/<p class="trophy-pips"([^>]*)>([\s\S]*?)<\/p>/);
  assert.ok(block, 'expected a trophy-pips block');
  assert.ok(block[1].includes('aria-hidden="true"'),
    'the pips duplicate the progress line, so they must be aria-hidden');
  const inner = block[2].replace(/<span class="trophy-pip[^"]*"><\/span>/g, '').trim();
  assert.strictEqual(inner, '', `the pip block must hold only pip spans, found: ${JSON.stringify(inner)}`);
  let nonAscii = 0;
  for (const ch of Buffer.from(block[0], 'utf8')) if (ch > 127) nonAscii++;
  assert.strictEqual(nonAscii, 0, 'the pip block must be pure ASCII -- no new Hebrew is authored for this feature');
});
