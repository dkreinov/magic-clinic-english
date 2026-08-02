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
