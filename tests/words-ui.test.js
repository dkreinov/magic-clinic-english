import { test } from 'node:test';
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
  assert.strictEqual(passLines.length, 52, `expected exactly 52 PASS lines, got ${passLines.length}`);
});

// Phase 3 / WB-4: a row only offers a play button when a clip really exists.
test('renderList speaks the resolved lemma and hides the button when there is none', async () => {
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

  const unknownRow = html.slice(html.indexOf('zzzunknown'));
  assert.ok(!unknownRow.includes('btn-say'), 'no play button on a row we cannot speak');
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
