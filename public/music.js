// Story background music. Owner decision 2026-08-02: music plays behind the
// reader, not only on a celebration.
//
// THE OBJECTION THIS MODULE ANSWERS, rather than dodges. She is eleven and
// learning English by TAPPING WORDS TO HEAR THEM. A music bed under a word clip
// makes the one sound she is trying to learn harder to hear, and every existing
// use of audio in this app (quiz.js, reader.js, words.js, placement.js) is
// speech. So the music DUCKS: the moment a word clip plays it drops to near
// silence, and it comes back when the clip ends. Speech always wins.
//
// THREE PROPERTIES, each of which is a gate in tests/music.test.js:
//
//   1. A MISSING OR BROKEN TRACK MUST NEVER BREAK THE STORY. Every entry point
//      is wrapped, the element is created lazily, and every failure path is a
//      silent no-op. This is the same rule public/words-index.js states for the
//      audio manifest -- "a dictionary that loads without audio beats one that
//      does not load" -- applied to music.
//   2. IT NEVER STARTS WITHOUT A GESTURE. Browsers block autoplay, and a page
//      that tries anyway throws an unhandled rejection on every load. start()
//      is only ever called from a real interaction.
//   3. HER CHOICE PERSISTS. The mute state lives in localStorage and is read
//      before the element exists, so muting survives a reload -- which is the
//      whole point of a control she can reach.
//
// No Hebrew is authored here. The control is a glyph plus an ASCII aria-label.

const KEY = 'storyMusic';           // 'on' | 'off'
const SRC = '/audio/music/story-loop.mp3';
const FULL = 0.14;                  // deliberately low: it sits UNDER a reading voice
const DUCKED = 0.02;
const FADE_MS = 220;

let el = null;
let fadeTimer = null;
let ducks = 0;                      // reference count: two clips can overlap

function storage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;                    // Safari private mode throws on access
  }
}

// DEFAULT IS OFF. She has never had music before; something that starts making
// noise on its own is a worse first impression than something she switches on.
export function isMuted() {
  const s = storage();
  if (!s) return true;
  try {
    return s.getItem(KEY) !== 'on';
  } catch {
    return true;
  }
}

export function setMuted(muted) {
  const s = storage();
  if (s) {
    try {
      s.setItem(KEY, muted ? 'off' : 'on');
    } catch {
      /* a full or blocked quota must not break the story */
    }
  }
  if (muted) stop();
  return muted;
}

function element() {
  if (el) return el;
  if (typeof Audio === 'undefined') return null;
  try {
    el = new Audio(SRC);
    el.loop = true;
    el.volume = FULL;
    el.preload = 'none';            // never fetched until she asks for it
  } catch {
    el = null;
  }
  return el;
}

// Called ONLY from a user gesture (property 2).
export function start() {
  if (isMuted()) return false;
  const a = element();
  if (!a) return false;
  try {
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    return false;
  }
  return true;
}

export function stop() {
  if (!el) return;
  try {
    el.pause();
  } catch {
    /* nothing to do */
  }
}

function fadeTo(target) {
  const a = el;
  if (!a) return;
  if (fadeTimer && typeof clearInterval === 'function') clearInterval(fadeTimer);
  if (typeof setInterval !== 'function') {
    try { a.volume = target; } catch { /* ignore */ }
    return;
  }
  const steps = 6;
  const step = (target - a.volume) / steps;
  let n = 0;
  fadeTimer = setInterval(() => {
    n++;
    try {
      const next = n >= steps ? target : a.volume + step;
      a.volume = Math.min(1, Math.max(0, next));
    } catch {
      /* ignore */
    }
    if (n >= steps && typeof clearInterval === 'function') clearInterval(fadeTimer);
  }, FADE_MS / steps);
}

// SPEECH ALWAYS WINS. duck() is reference-counted because she can tap a second
// word before the first clip ends; a boolean would un-duck too early and the
// music would swell back up over the tail of a word she is still listening to.
export function duck() {
  ducks++;
  if (el) fadeTo(DUCKED);
}

export function unduck() {
  ducks = Math.max(0, ducks - 1);
  if (ducks === 0 && el) fadeTo(FULL);
}

// The one call site a view needs: play this word clip with the music out of its
// way, whatever happens. Returns the element so a caller can still bind to it.
export function playOverMusic(audio) {
  duck();
  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
    unduck();
  };
  try {
    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    audio.addEventListener('pause', done);
  } catch {
    done();
    return audio;
  }
  // A clip that never fires any event must not leave the music ducked forever.
  if (typeof setTimeout === 'function') setTimeout(done, 8000);
  return audio;
}

// Exported for the test only: the values are the contract, not the mechanism.
export const MUSIC_LEVELS = { FULL, DUCKED, SRC, KEY };
