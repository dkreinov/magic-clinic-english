import { test } from 'node:test';
import assert from 'node:assert';

// WHY THIS TEST LIVES IN ITS OWN FILE, and it is not a stylistic choice.
//
// public/words-index.js caches the manifest in a module-level `cached`
// variable for the lifetime of the PROCESS. tests/reader-ui.test.js stubs that
// fetch as [] (t13StubFetch), so by the time any later test in that file runs,
// getAllowedSet() returns an EMPTY set no matter what that test stubs -- and an
// empty Set is truthy, so the cache never refills. A popup test appended there
// would silently measure the earlier test's manifest instead of its own.
//
// node --test isolates per FILE, not per test. Here the stub below is the only
// manifest this process ever sees, so "cat has a clip and ellie does not" is
// actually true of the code under test.

// ===== step 2.4 (word-finish phase 2, design section 8). THE POPUP, EXECUTED.
// reader.js was source-needle tested for two whole runs (field guide 20). It does
// not have to be: render() already runs in node against a fake container, and the
// popup is one click away from there. This drives the SHIPPED code end to end and
// reads the real popup markup back.
//
// THE ONE TRAP: draw() re-assigns container.innerHTML and bindHandlers() re-runs
// querySelectorAll, so a fake span that keeps EVERY handler it is given
// accumulates them, and firing them all recurses until node dies of heap
// exhaustion. _fire therefore invokes ONLY the most recently registered handler.
function p2Span(dataWord) {
  const handlers = [];
  return {
    _fire: async (name) => {
      const hs = handlers.filter(([t]) => t === name);
      if (hs.length === 0) throw new Error(`no ${name} handler was ever bound to "${dataWord}"`);
      await hs[hs.length - 1][1]({ stopPropagation() {} });
    },
    getAttribute: (k) => (k === 'data-word' ? dataWord : null),
    addEventListener: (t, h) => handlers.push([t, h]),
    classList: { add() {}, remove() {} },
    style: {},
  };
}

function p2Container(spans) {
  const paints = [];
  let html = '';
  return {
    paints,
    container: {
      get innerHTML() { return html; },
      set innerHTML(v) { html = v; paints.push(v); },
      querySelector: () => null,
      querySelectorAll: (sel) => (String(sel).includes('.w') || String(sel).includes('data-word') ? spans : []),
    },
  };
}

test('tapping a word we cannot speak opens a popup with a crossed-out speaker and "coming soon"', async () => {
  const { render } = await import('../public/views/reader.js');
  const spans = { cat: p2Span('cat'), ellie: p2Span('ellie') };
  const { container, paints } = p2Container(Object.values(spans));
  const profile = {
    version: 1,
    placement: { completed: true },
    learner: { heroineName: 'Ellie', petName: 'Sparkle' },
    words: {},
    trophies: {},
    story: {
      chapters: [{
        n: 1, title: 'One', text: 'The cat saw Ellie.',
        glossary: [{ word: 'cat', he: 'HE-CAT' }], questions: [],
      }],
    },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    // the manifest has "cat" and does NOT have "ellie" -- that is the whole point
    if (u.includes('/audio/words/index.json')) return { ok: true, json: async () => ['cat'] };
    if (u === '/api/profile') return { status: 200, json: async () => ({ ok: true, data: profile }) };
    if (u === '/api/translate') return { status: 200, json: async () => ({ ok: true, he: 'HE-ELLIE' }) };
    throw new Error('unexpected url ' + u);
  };

  let observed = 0;
  try {
    await render(container, {});
    assert.ok(paints[paints.length - 1].includes('class="w" data-word='), 'the story must render tappable spans');

    // (a) a word WITH a clip: a live, pressable button that carries data-say.
    paints.length = 0;
    await spans.cat._fire('click');
    observed += 1;
    const livePainted = paints[paints.length - 1];
    const liveAt = livePainted.indexOf('<div class="reader-popup"');
    assert.ok(liveAt >= 0, 'tapping must open the popup');
    const live = livePainted.slice(liveAt);
    assert.ok(live.includes('data-say="cat"'), 'a word with a clip must get a pressable button');
    assert.ok(!live.includes('btn-say na'), 'a word with a clip must NOT be marked unavailable');
    assert.ok(!live.includes('coming soon'), 'a word with a clip must not say coming soon');

    // (b) a word with NO clip: the marker, and NO data-say anywhere in the popup.
    paints.length = 0;
    await spans.ellie._fire('click');
    observed += 1;
    const painted = paints[paints.length - 1];
    // SLICE THE POPUP OUT FIRST. The paint also carries <style>${VIEW_STYLE}</style>,
    // in which ".reader-popup-he" appears as a CSS SELECTOR long before the markup --
    // so an indexOf() ordering check over the whole paint measures the stylesheet,
    // not the popup. (Found by running this; field guide 18.)
    const popAt = painted.indexOf('<div class="reader-popup"');
    assert.ok(popAt >= 0, 'tapping must open the popup');
    const na = painted.slice(popAt);
    assert.ok(na.includes('btn-say na'), 'a word with no clip must still show the speaker, crossed out');
    assert.ok(na.includes('coming soon'), 'a word with no clip must carry the frozen ASCII caption');
    assert.ok(na.includes('disabled'), 'the crossed-out speaker must not be pressable');
    assert.ok(!na.includes('data-say'), 'THE HONESTY PROPERTY: no data-say may exist for a word with no clip');
    // design section 8: "The Hebrew and the save line must not move."
    assert.ok(na.includes('data-action="popup-save"'), 'the save button must still be there');
    assert.ok(na.includes('class="reader-popup-he"'), 'the Hebrew line must still be there');
    assert.ok(na.indexOf('reader-popup-word') < na.indexOf('btn-say na'), 'the word still comes first');
    assert.ok(na.indexOf('btn-say na') < na.indexOf('class="reader-popup-he"'), 'the marker still sits above the Hebrew');
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.strictEqual(observed, 2, 'the harness must have driven exactly 2 taps; 0 would mean it inspected nothing');
});
