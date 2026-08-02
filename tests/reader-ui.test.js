import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sentenceFor, afterChapterStage, chapterQuizState } from '../public/views/reader.js';

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
  assert.strictEqual(passLines.length, 58, 'contrast gate should print exactly 58 PASS lines');
});

// Phase 3. The two decisions that are easy to get backwards, pinned by calling
// the real function rather than grepping for it.
test('wordTapBody saves the lemma but finds the sentence by the printed form', async () => {
  const { wordTapBody } = await import('../public/views/reader.js');
  const text = 'The cat sat. She feels happy today. The end.';

  const body = wordTapBody({ lemma: 'feel', surface: 'feels', he: 'להרגיש', text });

  assert.strictEqual(body.action, 'word-tap');
  assert.strictEqual(body.lemma, 'feel', 'the LEMMA is what gets saved');
  assert.strictEqual(
    body.context,
    'She feels happy today.',
    'the sentence is found by the SURFACE form; searching for the lemma finds nothing'
  );

  // Searching by the lemma would have found nothing at all -- this is the bug
  // the assertion above exists to catch.
  const wrongWayRound = wordTapBody({ lemma: 'feel', surface: 'feel', he: null, text });
  assert.ok(!('context' in wrongWayRound), 'the lemma does not appear in the chapter text');
});

test('reader.js resolves the printed word against the manifest', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(src.includes('resolveLemma'), 'reader must resolve the tapped word');
  assert.ok(src.includes('getAllowedSet'), 'reader must load the manifest');
  assert.ok(src.includes('activePopup.canSay'), 'the button is conditional on having a clip');
});

// Step 4.4. The after-chapter check of 4 words.
test('afterChapterStage follows the frozen decision table', () => {
  assert.strictEqual(
    afterChapterStage({ doneAll: false, quizDone: false, lemmaCount: 5 }),
    'questions',
    'not done answering questions yet'
  );
  assert.strictEqual(
    afterChapterStage({ doneAll: false, quizDone: true, lemmaCount: 0 }),
    'questions',
    'doneAll=false always wins regardless of the other two'
  );
  assert.strictEqual(
    afterChapterStage({ doneAll: true, quizDone: true, lemmaCount: 5 }),
    'celebrate',
    'quiz already done'
  );
  assert.strictEqual(
    afterChapterStage({ doneAll: true, quizDone: false, lemmaCount: 0 }),
    'celebrate',
    'nothing to ask -- she is NEVER blocked'
  );
  assert.strictEqual(
    afterChapterStage({ doneAll: true, quizDone: false, lemmaCount: 5 }),
    'quiz',
    'questions done, quiz not done, words available'
  );
  assert.strictEqual(
    afterChapterStage({ doneAll: true, quizDone: false, lemmaCount: 1 }),
    'quiz',
    'one word is still enough to run the quiz'
  );
});

test('reader.js wires the after-chapter quiz: imports, exports, slot, and existing hooks', () => {
  const src = readFileSync(viewPath, 'utf8');
  for (const needle of [
    '../quiz.js',
    '../quiz-core.js',
    'startQuiz',
    'pickQuizWords',
    'knownSetFromProfile',
    'afterChapterStage',
    'chapterQuizState',
    'reader-quiz-slot',
    'wordTapBody',
    'sentenceFor',
  ]) {
    assert.ok(src.includes(needle), `reader.js should include "${needle}"`);
  }
});

test('chapterQuizState is keyed by chapter number: a fresh chapter gets a fresh quiz', () => {
  const m = {};
  chapterQuizState(m, 1).done = true;
  assert.deepStrictEqual(
    chapterQuizState(m, 2),
    { started: false, done: false },
    "chapter 2's quiz must run even after chapter 1's finished"
  );
  assert.strictEqual(
    chapterQuizState(m, 1),
    chapterQuizState(m, 1),
    'the same chapter must return the SAME object on a second call, so a started-guard actually guards'
  );
});

test('reader.js reserves one candidate slot: the frozen merge, candidateSet, and the pre-existing quiz wiring', () => {
  const src = readFileSync(viewPath, 'utf8');
  const needles = [
    'pickCandidateWords',
    'const candidateLemmas = pickCandidateWords(profile, 1);',
    'candidateSet = new Set(candidateLemmas);',
    'lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));',
    'candidateSet,',
    'startQuiz',
    'knownSetFromProfile',
    'count: 4',
  ];
  for (const needle of needles) {
    assert.ok(src.includes(needle), `reader.js missing "${needle}"`);
  }

  assert.ok(
    !/^\s*lemmas = pickQuizWords\(profile, 20\);\s*$/m.test(src),
    'the OLD unmerged pick must be gone, replaced by the frozen merge'
  );
});

// Step 1.2 (T3a). canSay is honest today by accident of construction: reader.js
// resolves the tapped word against the audio manifest itself, so the speaker
// button cannot be drawn for a word we have no clip for. Nothing asserted that.
// These three tests turn the accident into an invariant, so phase 2's new clips
// have something real to be measured against.
import { readdirSync, existsSync } from 'node:fs';
import { resolveLemma } from '../public/lemma.js';
import { normalizeWord } from '../public/views/reader.js';

const clipsDir = path.join(root, 'public', 'audio', 'words');
const manifestPath = path.join(clipsDir, 'index.json');

test('every word in the audio manifest has a clip on disk, and every clip is in the manifest', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.ok(Array.isArray(manifest), 'the audio manifest must be a JSON array');
  assert.strictEqual(manifest.length, 2254, 'the manifest must list exactly 2254 words');

  const files = readdirSync(clipsDir);
  assert.strictEqual(files.length, 2255, 'public/audio/words holds 2254 clips plus index.json');

  const clips = new Set(files.filter((f) => f.endsWith('.aac')).map((f) => f.slice(0, -4)));
  assert.strictEqual(clips.size, 2254, 'there must be exactly 2254 .aac clips on disk');

  // Name the offenders. This is the invariant phase 2 is about to stress, so a
  // failure has to say WHICH word broke it, not merely that something did.
  const missing = manifest.filter((w) => !clips.has(w));
  const orphans = [...clips].filter((w) => !manifest.includes(w));
  assert.strictEqual(missing.length, 0, `manifest entries with no clip: ${missing.join(', ')}`);
  assert.strictEqual(orphans.length, 0, `clips missing from the manifest: ${orphans.join(', ')}`);
});

test('resolveLemma only ever returns a word that has a clip, so a speaker button cannot be dead', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const allowed = new Set(manifest);
  const clips = new Set(
    readdirSync(clipsDir)
      .filter((f) => f.endsWith('.aac'))
      .map((f) => f.slice(0, -4))
  );

  // Every manifest entry, plus an inflection sweep of the forms the story
  // generator is allowed to print, plus words the chapter can contain that we
  // deliberately have nothing for.
  const inputs = [];
  for (const word of manifest) {
    inputs.push(word, `${word}s`, `${word}ed`, `${word}ing`, `${word}es`);
  }
  inputs.push(
    'deepbreath',
    'growls',
    'glows',
    'nervous',
    'scary',
    'harm',
    'deer',
    'feet',
    'moon',
    'tightly',
    'zzzz',
    ''
  );

  let nulls = 0;
  for (const input of inputs) {
    // normalizeWord + resolveLemma is exactly what reader.js does at :266 and
    // :670, and `lemma !== null` is exactly the predicate at :674 that decides
    // whether the button is drawn. Executing the shipped code, not a copy of it.
    const lemma = resolveLemma(normalizeWord(input), allowed);
    if (lemma === null) nulls += 1;
    assert.ok(
      lemma === null || clips.has(lemma),
      `resolveLemma returned "${lemma}" which has no clip`
    );
  }

  assert.ok(inputs.length > 2254, `the sweep must drive more than 2254 inputs, drove ${inputs.length}`);
  assert.ok(nulls > 0, 'negative control: a sweep where nothing ever resolves to null passes vacuously');
});

test('the browser and the server read the SAME word list, and the button plays the value it was drawn from', () => {
  const browserSrc = readFileSync(path.join(root, 'public', 'words-index.js'), 'utf8');
  assert.ok(
    browserSrc.includes("fetch('/audio/words/index.json')"),
    'the browser must build allowedWords from /audio/words/index.json'
  );

  const serverSrc = readFileSync(path.join(root, 'api', 'profile.js'), 'utf8');
  assert.ok(
    serverSrc.includes("'../public/audio/words/index.json'"),
    'the server must build ALLOWED_WORDS from ../public/audio/words/index.json'
  );

  const browserFile = path.join(root, 'public', 'audio', 'words', 'index.json');
  const serverFile = path.resolve(root, 'api', '../public/audio/words/index.json');
  assert.strictEqual(serverFile, browserFile, 'the two sides must name the same file');
  assert.ok(existsSync(browserFile), 'the shared manifest file must exist');
  const browserWords = JSON.parse(readFileSync(browserFile, 'utf8'));
  const serverWords = JSON.parse(readFileSync(serverFile, 'utf8'));
  assert.strictEqual(browserWords.length, 2254, 'the shared list is 2254 words long');
  assert.deepStrictEqual(
    serverWords,
    browserWords,
    'allowedWords and ALLOWED_WORDS are the same bytes, so resolveLemma cannot mean two things'
  );

  // The seam: the button is drawn from the same `lemma` binding the clip URL is
  // built from. These four are SOURCE NEEDLES and they fail OPEN -- they are
  // guards, not gates. What proves the affordance is the test above, which
  // executes the shipped predicate, and the human visual gate in step 1.4.
  const src = readFileSync(viewPath, 'utf8');
  for (const needle of [
    'canSay: lemma !== null,',
    'lemma: lemma || dataWord,',
    'data-say="${escapeHtml(activePopup.lemma)}"',
  ]) {
    assert.ok(src.includes(needle), `reader.js missing "${needle}"`);
  }
  for (const forbidden of [
    'data-say="${escapeHtml(activePopup.surface)}"',
    'data-say="${escapeHtml(dataWord)}"',
  ]) {
    assert.ok(!src.includes(forbidden), `the button must not be drawn from "${forbidden}"`);
  }
});

test('chapterQuizLemmas puts the chapter glossary first and drops what the server could not record', async () => {
  const { chapterQuizLemmas } = await import('../public/views/reader.js');
  const chapter = {
    n: 1,
    glossary: [
      { word: 'shadow' },
      { word: 'deep breath' },
      { word: 'Moon' },
      { word: 'nowhere' },
      { word: 'shadow' },
    ],
  };
  // 'deep breath' IS a key in words on purpose: the SPACE, not the profile, is
  // what must drop it. 'nowhere' is the opposite control -- no space, dropped
  // only because api/profile.js:130 would answer its quiz-answer with
  // 400 'unknown word' and public/quiz.js:304 would swallow that in silence.
  const words = { shadow: {}, moon: {}, 'deep breath': {}, zoo: {} };
  const got = chapterQuizLemmas(chapter, words, ['zoo', 'dark'], new Set(), () => 0.999);
  assert.deepStrictEqual(
    got,
    ['shadow', 'moon', 'zoo', 'dark'],
    "the chapter's own recordable words come first, lower-cased and de-duplicated, then the pool"
  );
});

test('chapterQuizLemmas varies the order of the chapter words but never loses one', async () => {
  const { chapterQuizLemmas } = await import('../public/views/reader.js');
  const chapter = { n: 2, glossary: [{ word: 'a' }, { word: 'b' }, { word: 'c' }] };
  const words = { a: {}, b: {}, c: {} };

  // Both derived by hand off the Fisher-Yates copied from quiz-core.js:26-29.
  assert.deepStrictEqual(
    chapterQuizLemmas(chapter, words, [], new Set(), () => 0),
    ['b', 'c', 'a'],
    'rand()=0 swaps the last element to the front, twice'
  );
  assert.deepStrictEqual(
    chapterQuizLemmas(chapter, words, [], new Set(), () => 0.999),
    ['a', 'b', 'c'],
    'rand()=0.999 swaps every element with itself, so the order is untouched'
  );

  const orders = new Set();
  for (let i = 0; i < 200; i++) {
    const got = chapterQuizLemmas(chapter, words, [], new Set());
    assert.deepStrictEqual(
      [...got].sort(),
      ['a', 'b', 'c'],
      'a shuffle may reorder the chapter words but may never drop or duplicate one'
    );
    orders.add(got.join(','));
  }
  assert.ok(
    orders.size > 1,
    `re-opening a chapter must not always ask the same first four, saw ${orders.size} order(s)`
  );

  // GUARD, not a gate (field-guide lesson 15a): Insert D lives inside render(),
  // which needs a DOM, so no node test can execute the wiring. This asserts the
  // wiring LINE exists. It fails open against a rewrite, but it does catch the
  // deletion -- which is the specific regression that would silently bring back
  // the repeated-questions bug the learner reported.
  const readerSrc = readFileSync(viewPath, 'utf8');
  assert.strictEqual(
    readerSrc.split('askedThisSitting.add(q.lemma)').length - 1,
    1,
    'the already-asked wiring must be present exactly once in render(), or the repeat bug returns silently'
  );
});

test('a lemma already asked in this sitting goes to the tail, and the list still reaches four', async () => {
  const { chapterQuizLemmas } = await import('../public/views/reader.js');
  const got = chapterQuizLemmas(
    { n: 3, glossary: [] },
    {},
    ['a', 'b', 'c', 'd', 'e', 'f'],
    new Set(['a', 'b']),
    () => 0.999
  );
  assert.deepStrictEqual(
    got,
    ['c', 'd', 'e', 'f', 'a', 'b'],
    'an already-asked lemma moves to the TAIL; nothing is ever dropped'
  );
  assert.ok(got.length >= 4, 'a sitting must always still be able to fill four questions');
});

test('a second chapter in the same sitting is not asked the same four words', async () => {
  const { chapterQuizLemmas } = await import('../public/views/reader.js');
  const { startQuiz } = await import('../public/quiz.js');

  const withItem = new Set(['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']);
  const pool = ['w1', 'x1', 'w2', 'w3', 'w4', 'x2', 'w5', 'w6', 'w7', 'w8'];
  const load = async (lemma) =>
    withItem.has(lemma)
      ? {
          sense: 'a sense',
          sentence: 'the ___ is here',
          answer: lemma,
          distractors: ['d1', 'd2', 'd3', 'd4', 'd5'],
        }
      : null;
  const opts = (lemmas) => ({
    lemmas,
    knownSet: new Set(),
    count: 4,
    load,
    post: async () => ({ words: {} }),
    rand: () => 0,
  });
  const container = () => ({ innerHTML: '', querySelector: () => null, querySelectorAll: () => [] });
  const listFor = (n, asked) => chapterQuizLemmas({ n, glossary: [] }, {}, pool, asked, () => 0);

  // quiz.js, not reader.js, decides which of the list actually loaded, so the
  // asked set is fed from session.questions exactly as Insert D does: at start,
  // not in onDone.
  const asked = new Set();
  const s1 = await startQuiz(container(), opts(listFor(1, asked)));
  for (const q of s1.questions) asked.add(q.lemma);
  const s2 = await startQuiz(container(), opts(listFor(2, asked)));
  const first = s1.questions.map((q) => q.lemma);
  const second = s2.questions.map((q) => q.lemma);
  assert.strictEqual(first.length, 4, 'chapter 1 must still be asked four questions');
  assert.strictEqual(second.length, 4, 'chapter 2 must still be asked four questions');
  assert.deepStrictEqual(
    second.filter((l) => first.includes(l)),
    [],
    'the second chapter of one sitting must not re-ask a word from the first'
  );

  // The negative control: nothing remembers what was asked. That is the app as
  // it shipped, and it is defect D2. Without this a green test cannot tell
  // 'fixed' from 'never broken'.
  const never = new Set();
  const c1 = await startQuiz(container(), opts(listFor(1, never)));
  const c2 = await startQuiz(container(), opts(listFor(2, never)));
  assert.deepStrictEqual(
    c2.questions.map((q) => q.lemma),
    c1.questions.map((q) => q.lemma),
    'with nothing recorded the identical four come back -- the defect this step fixes'
  );
});

// --- long press must do the app's own thing, not the OS "Copy" callout -------------
// She long-pressed a word and got the system copy menu instead of the word popup.
// Two halves, both required: the text must not be selectable (that is what summons
// the callout), and the context menu must be refused so the release still fires click.
test('the story text suppresses the OS selection callout', () => {
  const src = readFileSync(viewPath, 'utf8');
  const block = src.slice(src.indexOf('.reader-text {'), src.indexOf('.reader-text .w {'));
  assert.ok(block.includes('-webkit-touch-callout: none'), 'no -webkit-touch-callout: none on .reader-text');
  assert.ok(block.includes('-webkit-user-select: none'), 'no -webkit-user-select: none on .reader-text');
  assert.ok(/[^-]user-select: none/.test(block), 'no unprefixed user-select: none on .reader-text');
});

test('a long press on the story is answered by the app, not the browser', () => {
  const src = readFileSync(viewPath, 'utf8');
  assert.ok(/addEventListener\("contextmenu"/.test(src), 'reader.js binds no contextmenu handler');
  const at = src.indexOf('addEventListener("contextmenu"');
  assert.ok(src.slice(at, at + 160).includes('preventDefault'), 'the contextmenu handler does not preventDefault');
});

// ===== step 1.3 (C, word-finish): coming back from the dictionary repaints
// the chapter she left, once, from kept state -- while the profile is still
// refetched every time (public/views/reader.js:9-20).
function t13Container() {
  const paints = [];
  let html = '';
  const container = {
    get innerHTML() { return html; },
    set innerHTML(v) { html = v; paints.push(v); },
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  return { container, paints };
}

function t13Chapter(n, title, text) {
  return { n, title, text, glossary: [], questions: [] };
}

function t13Profile(chapters) {
  return {
    version: 1,
    placement: { completed: true },
    learner: { heroineName: 'Mia', petName: 'Fox' },
    words: {},
    story: { chapters },
    trophies: {},
  };
}

// Stubs the two endpoints render() touches. words-index.js caches the audio
// manifest ONCE for the life of this process, so it is fetched at most once
// across this whole file; /api/profile calls are counted so a test can prove
// the refetch still happens on every entry.
function t13StubFetch(getProfile) {
  let profileCalls = 0;
  const stub = async (url) => {
    const u = String(url);
    if (u.includes('/audio/words/index.json')) return { ok: true, json: async () => [] };
    if (u === '/api/profile') {
      profileCalls += 1;
      return { status: 200, json: async () => ({ ok: true, data: getProfile() }) };
    }
    throw new Error('t13StubFetch: unexpected url ' + u);
  };
  return { stub, calls: () => profileCalls };
}

test('coming back to the reader paints the story once, from kept state, and still refetches the profile', async () => {
  const { render } = await import('../public/views/reader.js');
  const { container, paints } = t13Container();
  let profile = t13Profile([t13Chapter(1, 'Chapter One', 'The cat sat still.')]);
  const { stub, calls } = t13StubFetch(() => profile);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stub;

  try {
    // FIRST ENTRY: nothing kept yet -- a loading paint, then the story.
    await render(container, {});
    assert.strictEqual(paints.length, 2, 'first entry must paint exactly twice: loading, then the story');
    assert.ok(!paints[0].includes('class="reader-text"'), 'the first paint must not contain the story');
    assert.ok(paints[1].includes('class="reader-text"'), 'the second paint must contain the story');
    const callsAfterFirst = calls();

    // RE-ENTRY, same profile: the fix. One paint, already the story, and the
    // profile is still refetched exactly once more.
    paints.length = 0;
    await render(container, {});
    assert.strictEqual(paints.length, 1, 'a re-entry with an unchanged profile must paint exactly once');
    assert.ok(paints[0].includes('class="reader-text"'), 'the one paint must already show the kept story');
    assert.strictEqual(calls() - callsAfterFirst, 1, 'the profile must still be refetched exactly once on re-entry');

    // RE-ENTRY, changed profile: no blank screen, and the new chapter lands.
    profile = t13Profile([
      t13Chapter(1, 'Chapter One', 'The cat sat still.'),
      t13Chapter(2, 'Chapter Two', 'A fox ran fast.'),
    ]);
    paints.length = 0;
    await render(container, {});
    assert.strictEqual(paints.length, 2, 're-entry after a real change must paint twice: kept, then fresh');
    assert.ok(paints[0].includes('class="reader-text"'), 'the first paint on a changed re-entry must already show the kept story, never a blank screen');
    assert.ok(paints[1].includes('Chapter Two'), 'the final paint must show the new chapter');
  } finally {
    globalThis.fetch = originalFetch;
  }

  // Stale-mount guard: a render that is still in flight when a newer one
  // takes over the SAME container must never paint after losing the mount.
  {
    const { container: staleContainer, paints: staleP } = t13Container();
    let fetchCalls = 0;
    let rejectStale;
    const staleGate = new Promise((_, reject) => { rejectStale = reject; });
    const staleProfile = t13Profile([t13Chapter(1, 'Chapter One', 'The cat sat still.')]);
    const originalFetch2 = globalThis.fetch;
    globalThis.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/audio/words/index.json')) return { ok: true, json: async () => [] };
      fetchCalls += 1;
      if (fetchCalls === 1) await staleGate; // the first caller never gets an answer until told to fail
      return { status: 200, json: async () => ({ ok: true, data: staleProfile }) };
    };
    try {
      const stalePromise = render(staleContainer, {}); // started, never awaited
      await render(staleContainer, {}); // takes over the same container, completes fully
      const paintsAfterTakeover = staleP.length;
      rejectStale(new Error('network down'));
      await stalePromise; // let the stale render unwind through its own catch
      assert.strictEqual(
        staleP.length,
        paintsAfterTakeover,
        'a stale mount must not paint after losing the mount to a newer render'
      );
    } finally {
      globalThis.fetch = originalFetch2;
    }
  }
});

test('the invalidation signal is total, and a failed refetch never blanks a story she is reading', async () => {
  const { profileSignature, render } = await import('../public/views/reader.js');

  const base = {
    version: 1,
    placement: { completed: true },
    learner: { heroineName: 'Mia', petName: 'Fox' },
    words: { cat: { status: 'known', taps: 1 } },
    story: {
      chapters: [
        {
          n: 1,
          title: 'Chapter One',
          text: 'The cat sat.',
          glossary: [{ word: 'cat', he: 'placeholder' }],
          questions: [{ id: 'q1', prompt: 'p', options: ['a', 'b'], correctIndex: 0 }],
        },
      ],
    },
    trophies: { known: { bronze: '2026-01-01T00:00:00.000Z' } },
  };
  const identical = JSON.parse(JSON.stringify(base));
  assert.strictEqual(
    profileSignature(base),
    profileSignature(identical),
    'two structurally identical profiles must sign the same'
  );

  const baseSig = profileSignature(base);
  const mutations = [
    (p) => { p.version = 2; },
    (p) => { p.learner.heroineName = 'Zoe'; },
    (p) => { p.words.cat.status = 'learning'; },
    (p) => { p.words.dog = { status: 'known' }; },
    (p) => { p.story.chapters[0].text = 'The cat ran.'; },
    (p) => { p.story.chapters[0].glossary[0].he = 'changed'; },
    (p) => { p.trophies.known.bronze = '2026-02-02T00:00:00.000Z'; },
  ];
  assert.ok(mutations.length >= 6, 'need at least six mutations at different depths');
  for (const mutate of mutations) {
    const mutated = JSON.parse(JSON.stringify(base));
    mutate(mutated);
    assert.notStrictEqual(
      profileSignature(mutated),
      baseSig,
      'a nested mutation must change the signature: ' + mutate.toString()
    );
  }

  const cyclic = {};
  cyclic.self = cyclic;
  assert.strictEqual(profileSignature(cyclic), null, 'a cyclic object must return null rather than throw');

  // A failed refetch on a re-entry must never blank a story she is already reading.
  const { container, paints } = t13Container();
  const profile = t13Profile([t13Chapter(1, 'Chapter One', 'The cat sat still.')]);
  const { stub } = t13StubFetch(() => profile);
  const originalFetch = globalThis.fetch;

  globalThis.fetch = stub;
  try {
    await render(container, {}); // populate `sitting`
  } finally {
    globalThis.fetch = originalFetch;
  }

  paints.length = 0;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('/audio/words/index.json')) return { ok: true, json: async () => [] };
    if (u === '/api/profile') throw new Error('network down');
    throw new Error('unexpected url ' + u);
  };
  try {
    await render(container, {});
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.ok(
    paints[0].includes('class="reader-text"'),
    'a re-entry must still show the kept story even if the refetch fails'
  );
  const ERROR_CARD = '\u05de\u05e9\u05d4\u05d5 \u05d4\u05e9\u05ea\u05d1\u05e9';
  for (const p of paints) {
    assert.ok(!p.includes(ERROR_CARD), 'a failed refetch on a re-entry must never show the error card');
  }
});

test('a re-entry restarts the quiz and keeps what she already did, and C does not touch checkLog', async () => {
  const { restartQuizzes } = await import('../public/views/reader.js');

  const quizState = {
    1: { started: true, done: false },
    2: { started: false, done: true },
    3: { started: true, done: true },
  };
  const got = restartQuizzes(quizState);
  assert.strictEqual(got, quizState, 'restartQuizzes must return the SAME object it was given');
  assert.deepStrictEqual(
    quizState,
    {
      1: { started: false, done: false },
      2: { started: false, done: true },
      3: { started: false, done: true },
    },
    'every started flag must be reset to false; done must be left exactly alone'
  );

  assert.strictEqual(restartQuizzes(null), null, 'null must be tolerated');
  assert.strictEqual(restartQuizzes(undefined), undefined, 'undefined must be tolerated');
  assert.strictEqual(restartQuizzes('nope'), 'nope', 'a non-object must be tolerated');
  const withBadEntry = { 1: { started: true, done: false }, 2: 'not-an-object', 3: null };
  assert.deepStrictEqual(
    restartQuizzes(withBadEntry),
    { 1: { started: false, done: false }, 2: 'not-an-object', 3: null },
    'an entry that is not an object must be left alone rather than throwing'
  );

  const src = readFileSync(viewPath, 'utf8');
  const bootAt = src.indexOf('async function boot() {');
  assert.ok(bootAt >= 0, 'reader.js must declare boot()');
  const bootClose = src.indexOf('\n  }', bootAt);
  assert.ok(bootClose > bootAt, 'boot() must close');
  const bootBody = src.slice(bootAt, bootClose);
  assert.ok(
    bootBody.includes('restartQuizzes(quizState)'),
    'boot() must call restartQuizzes(quizState) on a resumed re-entry'
  );

  assert.ok(
    src.includes('const checkState = kept ? kept.checkState : {};'),
    'checkState must be bound from kept'
  );
  assert.ok(
    src.includes('const quizState = kept ? kept.quizState : {};'),
    'quizState must be bound from kept'
  );

  assert.strictEqual(
    src.split('checkLog').length - 1,
    0,
    'reader.js must not mention checkLog -- R4(ii) is a later, carried obligation'
  );
});

test('the reader records its scroll position only while the reader route is mounted', async () => {
  const { shouldRecordScroll } = await import('../public/views/reader.js');
  assert.strictEqual(shouldRecordScroll('#/reader'), true, '#/reader must be recorded');
  const notReader = ['#/words', '#/home', '#/trophies', '#/placement', '#/parent', '', '#/reader?x'];
  for (const hash of notReader) {
    assert.strictEqual(shouldRecordScroll(hash), false, `${JSON.stringify(hash)} must not be recorded`);
  }

  const src = readFileSync(viewPath, 'utf8');
  const guardStr = 'if (typeof window !== "undefined" && typeof window.addEventListener === "function") {';
  assert.strictEqual(
    src.split(guardStr).length - 1,
    1,
    'the listener registration must be guarded exactly once'
  );
  const guardAt = src.indexOf(guardStr);
  assert.strictEqual(
    src.split('window.addEventListener(').length - 1,
    1,
    'the scroll listener must be registered exactly once'
  );
  const addAt = src.indexOf('window.addEventListener(', guardAt);
  assert.ok(addAt > guardAt, 'the listener must be registered inside the guard');
  const closeAt = src.indexOf(');', addAt);
  const block = src.slice(guardAt, closeAt + 2);
  assert.ok(block.includes('"scroll"'), 'must listen for the scroll event');
  assert.ok(block.includes('{ passive: true }'), 'the listener must be passive');

  const originalWindow = globalThis.window;
  delete globalThis.window;
  try {
    const freshUrl = new URL('../public/views/reader.js', import.meta.url).href + '?scrollGuardProbe';
    await assert.doesNotReject(
      import(freshUrl),
      'reader.js must import cleanly in node with no window defined'
    );
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test('restoring the scroll is attempted on a re-entry and never on a first entry', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const scrollCalls = [];
  globalThis.window = {
    location: { hash: '#/reader' },
    scrollTo: (...args) => { scrollCalls.push(args); },
    addEventListener: () => {},
  };
  try {
    const freshUrl = new URL('../public/views/reader.js', import.meta.url).href + '?scrollRestoreProbe';
    const { render } = await import(freshUrl);
    const { container } = t13Container();
    const profile = t13Profile([t13Chapter(1, 'Chapter One', 'The cat sat still.')]);
    const { stub } = t13StubFetch(() => profile);
    globalThis.fetch = stub;

    await render(container, {}); // first entry: nothing kept yet
    assert.strictEqual(scrollCalls.length, 0, 'scrollTo must never be called on a first entry');

    await render(container, {}); // re-entry: kept state exists now
    assert.ok(scrollCalls.length >= 1, 'scrollTo must be called at least once on a re-entry');
    assert.strictEqual(scrollCalls[0][0], 0, 'the x argument to scrollTo must be 0');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
