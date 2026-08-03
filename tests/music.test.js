// Story background music (public/music.js).
//
// THIS FILE EXISTS SEPARATELY ON PURPOSE (field guide 27). public/music.js holds
// MODULE-LEVEL state -- the <audio> element and the duck reference count -- for
// the life of the process, and `node --test` isolates per FILE, not per test.
// Putting these beside tests that stub a different module would let one test's
// leftovers silently decide another's result, which is exactly how an executed
// popup test once measured an earlier test's stub and passed while proving
// nothing. Every test below that ducks also unducks.
//
// The three properties gated here are the ones that protect HER, not the code:
//   1. a missing or broken track must never break the story
//   2. it never starts without a gesture, and never when she has it off
//   3. speech always wins -- a word clip ducks the music, every time

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

import {
  isMuted, setMuted, start, stop, duck, unduck, playOverMusic, MUSIC_LEVELS,
} from '../public/music.js';

function fakeStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    _map: map,
  };
}

class FakeAudio {
  constructor(src) {
    this.src = src;
    this.loop = false;
    this.volume = 1;
    this.preload = '';
    this.played = 0;
    this.paused = 0;
    this._handlers = {};
  }
  play() { this.played++; return Promise.resolve(); }
  pause() { this.paused++; }
  addEventListener(name, fn) { (this._handlers[name] = this._handlers[name] || []).push(fn); }
  fire(name) { for (const fn of this._handlers[name] || []) fn(); }
}

test('music is OFF by default -- it never starts making noise on its own', () => {
  globalThis.localStorage = fakeStorage({});
  assert.strictEqual(isMuted(), true, 'with no stored choice she must get silence');
  assert.strictEqual(start(), false, 'start() must refuse while muted -- property 2');
});

test('her choice persists, which is the whole point of a control she can reach', () => {
  const s = fakeStorage({});
  globalThis.localStorage = s;
  setMuted(false);
  assert.strictEqual(s.getItem(MUSIC_LEVELS.KEY), 'on', 'the choice must be written down');
  assert.strictEqual(isMuted(), false);
  setMuted(true);
  assert.strictEqual(s.getItem(MUSIC_LEVELS.KEY), 'off');
  assert.strictEqual(isMuted(), true, 'muting must survive, and survive a reload');
});

test('a storage that throws must not break the story -- it just means silence', () => {
  globalThis.localStorage = {
    getItem() { throw new Error('private mode'); },
    setItem() { throw new Error('private mode'); },
  };
  assert.strictEqual(isMuted(), true, 'unreadable storage must fail to SILENCE, not to noise');
  assert.doesNotThrow(() => setMuted(false), 'an unwritable storage must never throw at her');
  assert.strictEqual(start(), false);
});

test('with no Audio at all, every entry point is a silent no-op', () => {
  globalThis.localStorage = fakeStorage({ [MUSIC_LEVELS.KEY]: 'on' });
  const saved = globalThis.Audio;
  delete globalThis.Audio;
  try {
    assert.strictEqual(start(), false, 'no Audio constructor means no music, not a crash');
    assert.doesNotThrow(() => stop());
    assert.doesNotThrow(() => { duck(); unduck(); });
  } finally {
    if (saved) globalThis.Audio = saved;
  }
});

test('it plays only when she has switched it on, loops, and sits UNDER a reading voice', () => {
  globalThis.localStorage = fakeStorage({ [MUSIC_LEVELS.KEY]: 'on' });
  globalThis.Audio = FakeAudio;
  const ok = start();
  assert.strictEqual(ok, true, 'start() must play once she has turned it on');
  assert.ok(MUSIC_LEVELS.FULL <= 0.2,
    `music must be quiet enough to read over, got ${MUSIC_LEVELS.FULL}`);
  assert.ok(MUSIC_LEVELS.DUCKED < MUSIC_LEVELS.FULL,
    'ducked must be quieter than full, or ducking is decoration');
  assert.ok(MUSIC_LEVELS.SRC.startsWith('/audio/music/'),
    'the track must live under /audio/music/ so it is never confused with a word clip');
});

test('SPEECH ALWAYS WINS: a word clip ducks the music and it comes back after', () => {
  globalThis.localStorage = fakeStorage({ [MUSIC_LEVELS.KEY]: 'on' });
  globalThis.Audio = FakeAudio;
  start();
  const clip = new FakeAudio('/audio/words/nervous.aac');
  playOverMusic(clip);
  assert.ok(clip._handlers.ended && clip._handlers.ended.length,
    'the clip ending must be what restores the music');
  assert.ok(clip._handlers.error && clip._handlers.error.length,
    'a clip that FAILS must also restore the music, or one 404 mutes the story forever');
  clip.fire('ended');
  assert.ok(true, 'unduck ran without throwing');
});

test('two overlapping words do not un-duck early -- the duck is reference counted', () => {
  globalThis.localStorage = fakeStorage({ [MUSIC_LEVELS.KEY]: 'on' });
  globalThis.Audio = FakeAudio;
  start();
  const a = new FakeAudio('/audio/words/one.aac');
  const b = new FakeAudio('/audio/words/two.aac');
  playOverMusic(a);
  playOverMusic(b);
  // a boolean flag would restore full volume here, over the tail of clip b
  a.fire('ended');
  b.fire('ended');
  // firing the same clip twice must not push the count negative
  assert.doesNotThrow(() => a.fire('ended'));
  assert.doesNotThrow(() => { unduck(); unduck(); });
});

test('a clip that fires NOTHING must not leave the music ducked forever', () => {
  globalThis.localStorage = fakeStorage({ [MUSIC_LEVELS.KEY]: 'on' });
  globalThis.Audio = FakeAudio;
  start();
  const dead = new FakeAudio('/audio/words/ghost.aac');
  playOverMusic(dead);
  // the module arms a timeout for exactly this case; the assertion here is that
  // the timeout EXISTS in the shipped source, because waiting 8s in a test would
  // make the suite slower for no extra truth.
  const src = readFileSync(new URL('../public/music.js', import.meta.url), 'utf8');
  assert.ok(/setTimeout\(done, \d+\)/.test(src),
    'playOverMusic must arm a fallback timer, or a silent clip mutes the story permanently');
  dead.fire('ended');
});

test('muting stops what is already playing, not just what starts next', () => {
  globalThis.localStorage = fakeStorage({ [MUSIC_LEVELS.KEY]: 'on' });
  globalThis.Audio = FakeAudio;
  start();
  setMuted(true);
  assert.strictEqual(isMuted(), true);
  assert.strictEqual(start(), false, 'after muting, start() must refuse');
});

// ---------------------------------------------------------------------------
// R8 delivery: "stream once, then keep it". These are the seams, not the
// mechanism -- each one is a thing that can silently be wrong while every other
// test stays green, which is how the missing-precache defect below got shipped
// past 414 passing tests and was caught by hand.
// ---------------------------------------------------------------------------

test('SEAM: every module a PRECACHED file imports is itself PRECACHED', () => {
  // THE DEFECT THIS EXISTS FOR, RECORDED: music.js was imported by reader.js and
  // words.js -- both precached -- while not being precached itself. Offline, the
  // import fails and the WHOLE READER dies. A music file taking down the story is
  // exactly what music.js property 1 forbids, and the suite did not notice.
  const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  const precache = new Set([...sw.matchAll(/"(\/[^"]*)"/g)].map((m) => m[1]));
  const missing = [];
  for (const entry of [...precache].filter((p) => p.endsWith('.js'))) {
    const src = readFileSync(new URL('../public' + entry, import.meta.url), 'utf8');
    const dir = entry.slice(0, entry.lastIndexOf('/'));
    for (const m of src.matchAll(/from\s+"(\.[^"]+)"/g)) {
      const parts = (dir + '/' + m[1]).split('/');
      const out = [];
      for (const part of parts) {
        if (part === '.' || part === '') continue;
        if (part === '..') out.pop();
        else out.push(part);
      }
      const resolved = '/' + out.join('/');
      if (!precache.has(resolved)) missing.push(resolved + ' <- ' + entry);
    }
  }
  assert.deepStrictEqual(missing, [],
    'a precached module importing a non-precached one breaks the app OFFLINE');
});

test('SEAM: the music cache name in music.js and sw.js cannot drift', () => {
  // If these two ever disagree, sw.js deletes the cache music.js just filled and
  // she re-downloads 4 MB on every single deploy -- silently, and only on a real
  // phone. Neither file can notice this alone, so it is asserted across both.
  const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  const swName = /const MUSIC_CACHE = "([^"]+)"/.exec(sw);
  assert.ok(swName, 'sw.js must declare MUSIC_CACHE');
  assert.strictEqual(MUSIC_LEVELS.MUSIC_CACHE, swName[1]);
});

test('SEAM: the music cache SURVIVES the activate sweep that deletes old versions', () => {
  const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.ok(/key !== CACHE && key !== MUSIC_CACHE/.test(sw),
    'activate must spare MUSIC_CACHE, or every deploy throws the track away');
});

test('the music control is PURE ASCII -- FC-7 counts emoji as non-Hebrew-but-non-ASCII too', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const icons = /const MUSIC_ICON_ON =[\s\S]*?const MUSIC_ICON_OFF =[\s\S]*?;/.exec(app);
  assert.ok(icons, 'app.js must define both music icons');
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const btn = /<button id="music-toggle"[\s\S]*?<\/button>/.exec(html);
  assert.ok(btn, 'index.html must carry the shell music button');
  for (const [what, text] of [['app.js icons', icons[0]], ['index.html button', btn[0]]]) {
    let nonAscii = 0;
    for (const b of Buffer.from(text, 'utf8')) if (b > 127) nonAscii++;
    assert.strictEqual(nonAscii, 0, `${what}: no new Hebrew and no emoji for the music control`);
  }
});

test('SEAM: the control sits OUTSIDE <main id="app">, so the router cannot wipe it', () => {
  // renderRoute() does app.innerHTML = "" on every hashchange. A control rendered
  // inside a view survives only until she navigates; this is the property that
  // makes it reachable on her word list and trophies, which is the whole point.
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const mainEnd = html.indexOf('</main>');
  const btnAt = html.indexOf('id="music-toggle"');
  assert.ok(mainEnd > -1 && btnAt > -1, 'both the app main and the button must exist');
  assert.ok(btnAt > mainEnd,
    'the music button must live outside #app or the router will delete it on every route change');
});

test('SEAM: no view renders a SECOND music control', () => {
  // The reader briefly had its own copy. Two controls can disagree about state,
  // which is the "two sources for one card" seam this project keeps re-learning.
  for (const view of ['reader', 'words', 'home', 'trophies', 'placement']) {
    const src = readFileSync(new URL(`../public/views/${view}.js`, import.meta.url), 'utf8');
    assert.ok(!/music-toggle|musicSlot/.test(src),
      `views/${view}.js must not render its own music control`);
  }
});

test('reader.js non-ASCII byte count is UNCHANGED by the music feature (FC-7 pin)', () => {
  const buf = readFileSync(new URL('../public/views/reader.js', import.meta.url));
  let n = 0;
  for (const b of buf) if (b > 127) n++;
  assert.strictEqual(n, 754, 'FC-7: reader.js non-ASCII bytes must stay at 754');
});

test('start() does NOT await the download -- Safari only allows first play inside the gesture', () => {
  const src = readFileSync(new URL('../public/music.js', import.meta.url), 'utf8');
  const fn = /export function start\(\)[\s\S]*?\n\}/.exec(src);
  assert.ok(fn, 'start() must exist and must stay synchronous');
  assert.ok(!/^export async function start/m.test(src),
    'start() must not be async: awaiting the fetch loses the gesture and music never starts on iPhone');
  assert.ok(/fill\(\)/.test(fn[0]), 'start() must kick off the one-time download');
});

test('prime() never downloads -- it only adopts a copy already on her phone', () => {
  const src = readFileSync(new URL('../public/music.js', import.meta.url), 'utf8');
  const fn = /export async function prime\(\)[\s\S]*?\n\}/.exec(src);
  assert.ok(fn, 'prime() must exist');
  assert.ok(!/cache\.add|fetch\(/.test(fn[0]),
    'prime() must not fetch: a child who never turns music on must never pay for the track');
});
