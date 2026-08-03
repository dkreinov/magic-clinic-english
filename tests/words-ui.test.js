import { test } from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { renderList, markKnownBody, renderQuizLauncher } from '../public/views/words.js';
import profileHandler from '../api/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viewPath = path.join(root, 'public', 'views', 'words.js');

function withTempDataDir(fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-words-ui-'));
  const originalDataDir = process.env.DATA_DIR;
  const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.DATA_DIR = tmpDir;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  return Promise.resolve()
    .then(() => fn(tmpDir))
    .finally(() => {
      if (originalDataDir === undefined) delete process.env.DATA_DIR;
      else process.env.DATA_DIR = originalDataDir;
      if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
}

function withOpenGate(fn) {
  const original = process.env.APP_CODE;
  delete process.env.APP_CODE;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (original !== undefined) process.env.APP_CODE = original;
    });
}

function createMockRes() {
  return {
    statusCode: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
  };
}

function createPostReq(bodyObj) {
  const raw = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
  const req = Readable.from([Buffer.from(raw, 'utf8')]);
  req.method = 'POST';
  return req;
}

test('words.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', viewPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

test('words.js exports render(container, ctx)', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.match(src, /export\s+(async\s+)?function\s+render/);
});

test('words.js contains all frozen Hebrew strings', () => {
  const src = readFileSync(viewPath, 'utf8');
  const frozenStrings = ['עוד אין מילים באוסף', 'יודעת', 'לומדת'];
  for (const str of frozenStrings) {
    assert.ok(src.includes(str), `expected words.js to include "${str}"`);
  }
});

test('words.js references /api/profile', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(src.includes('/api/profile'));
});

test('renderList renders context/escaping/btn-say/btn-know per row', () => {
  const html = renderList({
    cat: { status: 'learning', he: 'חתול', taps: 1, lastSeen: '2026-01-02T00:00:00.000Z', context: 'The cat sat.' },
    dog: { status: 'known', he: 'כלב', taps: 2, lastSeen: '2026-01-01T00:00:00.000Z' },
  });

  assert.ok(html.includes('<p class="word-context"'), 'context paragraph missing for cat');
  assert.ok(html.includes('The cat sat.'), 'context text missing for cat');

  const dogPart = html.slice(html.indexOf('dog'));
  assert.ok(!dogPart.includes('word-context'), 'dog has no context and must render no word-context element');

  assert.ok(html.includes('data-say="cat"'), 'btn-say missing for cat');
  assert.ok(html.includes('data-say="dog"'), 'btn-say missing for dog (every row needs one)');

  assert.ok(html.includes('data-lemma="cat"'), 'learning row (cat) must have a btn-know');
  assert.ok(!html.includes('data-lemma="dog"'), 'known row (dog) must NOT have a btn-know');

  const esc = renderList({
    x: { status: 'learning', he: 'a', taps: 1, lastSeen: '2026-01-01T00:00:00.000Z', context: '<script>&' },
  });
  assert.ok(!esc.includes('<script>'), 'context must be HTML-escaped, not rendered raw');
  assert.ok(esc.includes('&lt;script&gt;'), 'escaped context missing &lt;script&gt;');
  assert.ok(esc.includes('&amp;'), 'escaped context missing &amp;');
});

test('markKnownBody is accepted by the real /api/profile handler', async () => {
  await withOpenGate(() => withTempDataDir(async () => {
    const req = createPostReq(markKnownBody('cat'));
    const res = createMockRes();
    await profileHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const parsed = JSON.parse(res.body);
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.data.words.cat.status, 'known');
  }));
});

test('words.js wires the play affordance, mark-known, and the token-only contrast gate', () => {
  const src = readFileSync(viewPath, 'utf8');
  const needles = [
    'btn-say',
    'data-say',
    'new Audio',
    '/audio/words/',
    '.aac',
    'encodeURIComponent',
    'mark-known',
    'postJson',
    'הקשיבי למילה',
    'יודעת את זה',
  ];
  for (const needle of needles) {
    assert.ok(src.includes(needle), `words.js missing "${needle}"`);
  }

  // Only the NEW rules (.word-context) are held to the no-hex/no-color-mix bar: the
  // pre-existing .word-badge rules already use color-mix() and are untouched by this step.
  const styleMatch = src.match(/const VIEW_STYLE = `([\s\S]*?)`;/);
  assert.ok(styleMatch, 'could not find VIEW_STYLE');
  const style = styleMatch[1];
  const ctxIdx = style.indexOf('.word-context');
  assert.ok(ctxIdx >= 0, 'no .word-context rule found in VIEW_STYLE');
  const ctxBlock = style.slice(ctxIdx, style.indexOf('}', ctxIdx));
  assert.ok(!ctxBlock.includes('#'), '.word-context must not contain a raw hex color');
  assert.ok(!ctxBlock.includes('color-mix('), '.word-context must not use color-mix()');

  const result = spawnSync(process.execPath, ['scripts/check-contrast.mjs'], { cwd: root });
  assert.strictEqual(result.status, 0, `contrast gate exited non-zero: ${result.stderr}`);
  const stdout = result.stdout.toString();
  assert.ok(stdout.includes('ALL PASS'), 'contrast gate did not print ALL PASS');
  const passLines = stdout.split('\n').filter((l) => l.startsWith('PASS'));
  assert.strictEqual(passLines.length, 58, `expected exactly 58 PASS lines, got ${passLines.length}`);
});

// Phase 3 / WB-4: a row only offers a play button when a clip really exists.
test('renderList speaks the resolved lemma and marks the button coming-soon when there is no clip', async () => {
  const { renderList } = await import('../public/views/words.js');
  const allowed = new Set(['feel', 'cat']);
  const words = {
    feels: { status: 'learning', he: 'x', taps: 1, lastSeen: '2026-01-03T00:00:00.000Z' },
    cat: { status: 'known', he: 'x', taps: 1, lastSeen: '2026-01-02T00:00:00.000Z' },
    zzzunknown: { status: 'learning', he: 'x', taps: 1, lastSeen: '2026-01-01T00:00:00.000Z' },
  };

  const html = renderList(words, allowed);

  assert.ok(html.includes('data-say="feel"'), 'an inflected key speaks its lemma');
  assert.ok(!html.includes('data-say="feels"'), 'never point at a clip that does not exist');
  assert.ok(html.includes('data-say="cat"'));

  // RE-EXPRESSED 2026-08-02 (field guide 22). This pin used to read
  //   assert.ok(!unknownRow.includes(BTN_SAY), 'no play button on a row we cannot speak')
  // and design.md section 8 -- FROZEN BY THE OWNER -- deliberately overturns it:
  // absence was honest but SILENT, and she could not tell "this word has no
  // sound" from "this app has no sound". The pin named a real PROPERTY, so it is
  // re-expressed rather than deleted, and it was seen to fail before the change.
  // The 2026-08-02 form of the same sentence: NOTHING ON THIS ROW CAN PLAY A
  // SOUND THAT DOES NOT EXIST.
  const unknownRow = html.slice(html.indexOf('zzzunknown'));
  assert.ok(unknownRow.includes('btn-say na'), 'a row we cannot speak must still show the speaker, crossed out');
  assert.ok(unknownRow.includes('coming soon'), 'a row we cannot speak must say why');
  assert.ok(unknownRow.includes('disabled'), 'the crossed-out speaker must not be pressable');
  assert.ok(!unknownRow.includes('data-say'), 'no data-say for a row we cannot speak -- the player binds to it');
});

// Step 4.3: renderQuizLauncher and renderList's third parameter.
test('renderQuizLauncher renders nothing at zero and the launcher markup otherwise; renderList places it between words-count and words-grid', () => {
  assert.strictEqual(renderQuizLauncher(0), '');

  const launcher = renderQuizLauncher(3);
  assert.ok(launcher.includes('start-quiz'), 'launcher missing start-quiz action');
  assert.ok(launcher.includes('btn btn-primary'), 'launcher missing btn btn-primary class');
  assert.ok(launcher.includes('בואי נתרגל מילים'), 'launcher missing label');

  const fixture = {
    cat: { status: 'learning', he: 'חתול', taps: 1, lastSeen: '2026-01-02T00:00:00.000Z' },
  };

  const withoutLauncher = renderList(fixture, null);
  assert.ok(!withoutLauncher.includes('start-quiz'), 'default renderList call must not include the launcher');

  const withLauncher = renderList(fixture, null, '<b>MARK</b>');
  const countIdx = withLauncher.indexOf('<p class="words-count"');
  const markIdx = withLauncher.indexOf('<b>MARK</b>');
  const gridIdx = withLauncher.indexOf('<div class="words-grid">');
  assert.ok(countIdx >= 0 && markIdx >= 0 && gridIdx >= 0, 'expected words-count, MARK and words-grid all present');
  assert.ok(markIdx > countIdx, 'launcherHtml must come after words-count');
  assert.ok(markIdx < gridIdx, 'launcherHtml must come before words-grid');
});

test('words.js wires the quiz launcher: imports, handler wiring, and pre-existing frozen strings survive', () => {
  const src = readFileSync(viewPath, 'utf8');
  const needles = [
    '../quiz.js',
    '../quiz-core.js',
    'startQuiz',
    'pickQuizWords',
    'knownSetFromProfile',
    'data-action="start-quiz"',
    'בואי נתרגל מילים',
  ];
  for (const needle of needles) {
    assert.ok(src.includes(needle), `words.js missing "${needle}"`);
  }

  const frozenStrings = ['עוד אין מילים באוסף', 'יודעת', 'לומדת'];
  for (const str of frozenStrings) {
    assert.ok(src.includes(str), `expected words.js to still include "${str}"`);
  }
});

test('a candidate row shows the almost-knows badge and keeps the claim button', () => {
  const ALMOST = '\u05DB\u05DE\u05E2\u05D8 \u05D9\u05D5\u05D3\u05E2\u05EA';
  const KNOWN = '\u05D9\u05D5\u05D3\u05E2\u05EA';
  const LEARN = '\u05DC\u05D5\u05DE\u05D3\u05EA';
  const words = {
    aaa: { status: 'candidate', he: 'x', taps: 1, lastSeen: '2026-01-03T00:00:00.000Z' },
    bbb: { status: 'learning', he: 'x', taps: 1, lastSeen: '2026-01-02T00:00:00.000Z' },
    ccc: { status: 'known', he: 'x', taps: 1, lastSeen: '2026-01-01T00:00:00.000Z' },
  };

  const html = renderList(words, null);
  const aaaSlice = html.slice(html.indexOf('aaa'), html.indexOf('bbb'));
  const cccSlice = html.slice(html.indexOf('ccc'));

  assert.ok(aaaSlice.includes('word-badge candidate'), 'candidate row must have the candidate badge class');
  assert.ok(aaaSlice.includes(ALMOST), 'candidate row must show the almost-knows badge text');
  assert.ok(aaaSlice.includes('data-lemma="aaa"'), 'candidate row must keep the claim button (B6 ii)');
  assert.ok(!cccSlice.includes('data-lemma="ccc"'), 'known row must NOT have a claim button (negative control)');
  assert.ok(html.includes('>' + KNOWN + '<'), 'known badge text must still render');
  assert.ok(html.includes('>' + LEARN + '<'), 'learning badge text must still render');
});

test('words.js reserves one candidate slot: the frozen merge, candidateSet, and the pre-existing quiz wiring', () => {
  const src = readFileSync(viewPath, 'utf8');
  const needles = [
    'pickCandidateWords',
    'const candidateLemmas = pickCandidateWords(profile, 1);',
    'candidateSet = new Set(candidateLemmas);',
    'lemmas = candidateLemmas.concat(sampleRanked(pickQuizWords(profile, 20), 4));',
    'sampleRanked(',
    'candidateSet,',
    'startQuiz',
    'knownSetFromProfile',
    'count: 4',
  ];
  for (const needle of needles) {
    assert.ok(src.includes(needle), `words.js missing "${needle}"`);
  }

  assert.ok(
    !/^\s*lemmas = pickQuizWords\(profile, 20\);\s*$/m.test(src),
    'the OLD unmerged pick must be gone, replaced by the frozen merge'
  );

  // The reserved candidate slot must stay at the head of the list: the
  // concat wraps the sampled pool, never the other way around.
  const concatIdx = src.indexOf('candidateLemmas.concat(');
  const sampleIdx = src.indexOf('sampleRanked(');
  assert.ok(
    concatIdx >= 0 && sampleIdx >= 0 && concatIdx < sampleIdx,
    'the reserved candidate slot must stay at the head of the list'
  );
});

// ---------------------------------------------------------------------------
// STEP 2.3 -- design.md section 8, FROZEN BY THE OWNER 2026-08-02.
// canSay gates the button's STATE, no longer its EXISTENCE.
// ---------------------------------------------------------------------------

// FIELD GUIDE 14. Every view here emits `<style>${VIEW_STYLE}</style>` INSIDE its
// own container.innerHTML, so view CSS exists only while that view is mounted.
// The marker is needed by TWO views, so its rules must live in the globally
// linked sheet. Putting them in a VIEW_STYLE would leave the reader's popup
// marker unstyled on the one route it matters on -- and every test would pass.
test('the section-8 marker rules live in the globally linked sheet and in no view VIEW_STYLE', async () => {
  const css = readFileSync(path.join(root, 'public', 'styles.css'), 'utf8');
  for (const rule of ['.btn-say.na {', '.btn-say.na::after {', '.btn-say-soon {', '.say-soon-wrap {']) {
    assert.ok(css.includes(rule), `${rule} must be in public/styles.css, the globally linked sheet`);
  }

  const views = ['words.js', 'reader.js', 'placement.js', 'parent.js', 'trophies.js', 'home.js'];
  let examined = 0;
  for (const v of views) {
    const src = readFileSync(path.join(root, 'public', 'views', v), 'utf8');
    examined++;
    const m = src.match(/const VIEW_STYLE = `([\s\S]*?)`;/);
    if (!m) continue;
    assert.ok(
      !m[1].includes('btn-say'),
      `public/views/${v} styles btn-say inside VIEW_STYLE -- it would be unstyled on every other route`
    );
  }
  assert.strictEqual(examined, 6, `expected to examine 6 view files, examined ${examined}`);
});

// FC-5. The owner froze these exact rules. They were copied out of design.md by
// script and never retyped, and this test makes that unfalsifiable in both
// directions: a "tidy-up" of the owner's CSS fails the suite, and so does a
// drift in design.md.
test('the frozen section-8 CSS in styles.css is byte-for-byte what design.md declares', () => {
  const design = readFileSync(path.join(root, '.oplan', 'word-finish', 'design.md'), 'utf8');
  const blocks = [...design.matchAll(/```css\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.strictEqual(blocks.length, 2, `design.md must hold exactly 2 css blocks, found ${blocks.length}`);

  const frozenLf = blocks[0] + '\n' + blocks[1];
  assert.strictEqual(
    createHash('md5').update(frozenLf).digest('hex'),
    '6e43cb5e463520f5d277d7d02c5ff26c',
    'the FROZEN section-8 CSS in design.md has moved -- the owner froze these bytes'
  );

  // styles.css is CRLF; the frozen block must be present as CONTIGUOUS CRLF bytes
  const frozenCrlf = frozenLf.split('\n').join('\r\n');
  const css = readFileSync(path.join(root, 'public', 'styles.css'), 'utf8');
  assert.ok(
    css.includes(frozenCrlf),
    'public/styles.css does not contain the owner-frozen section-8 rules contiguously'
  );
});

// Before the manifest loads, words.js falls back to the raw key so a row gets a
// live button immediately. Flashing "coming soon" and then replacing it with a
// live button is a worse thing for a child to watch than a button that briefly
// does nothing -- and a key in her dictionary is a lemma the server already
// normalised against this very manifest, so the optimistic guess is right
// nearly always. Without this test a future simplification quietly makes every
// row say "coming soon" for the first few hundred milliseconds of every visit.
test('renderList keeps the optimistic pre-manifest branch: live buttons, no coming-soon flash', () => {
  const words = {
    cat: { status: 'known', he: 'x', taps: 1, lastSeen: '2026-01-03T00:00:00.000Z' },
    feels: { status: 'learning', he: 'x', taps: 1, lastSeen: '2026-01-02T00:00:00.000Z' },
    zzzunknown: { status: 'learning', he: 'x', taps: 1, lastSeen: '2026-01-01T00:00:00.000Z' },
  };

  const html = renderList(words, null);
  const live = (html.match(/class="btn-say"/g) || []).length;
  const na = (html.match(/btn-say na/g) || []).length;
  assert.strictEqual(live, 3, `all three rows must get a live button before the manifest loads, got ${live}`);
  assert.strictEqual(na, 0, `no row may say "coming soon" before the manifest loads, got ${na}`);
  assert.ok(!html.includes('coming soon'), 'no coming-soon caption before the manifest loads');
});
