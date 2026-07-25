# Plan — run `placement-fix-and-art`

Base commit: `04267f5` (warm-dark-theme RUN CLOSED). Test baseline: 146 pass / 0 fail.

## Goal

Two pieces of work, in priority order.

1. **URGENT BUG.** The placement test cannot be completed. Diagnosed before this plan was
   written: `renderTask2()` in `public/views/placement.js` starts with
   `const text = currentTask2Text();` and immediately dereferences `text.questions`, but
   `currentTask2Text()` is `bank.task2.find(t => !t.questions.every(q => doneIds.has(q.id)))` —
   which returns `undefined` the moment every task2 question has an answer. Answering the last
   question of the last text therefore throws
   `TypeError: Cannot read properties of undefined (reading 'questions')`, the re-render dies,
   and the UI freezes with the answer visually unregistered. Reproduced deterministically (see
   journal). This is why the learner's profile still reads "placement not started".
2. **FEATURE.** The six `audio-to-picture` items (`t1-01`–`t1-06`) answer with emoji, and
   several are unguessable: `fan` (מאוורר) is `🌀`, `desk` (שולחן) is `🧑‍💻`, `zoo` (גן חיות) is
   `🦁`. Replace the 11 unique emoji options with generated illustrations in the frozen cartoon
   style of `docs/visual-design.md`.

## Non-goals (run-wide)

- No changes to `api/`, `lib/`, `data/band1.json`, or anything that reads or writes the learner
  profile's stored shape.
- No re-theming. `public/styles.css` and the other views are finished and frozen by the previous
  run; the WCAG AA gate must keep passing untouched.
- No copy/text changes except where the bug fix strictly requires one (it does not).
- Hebrew RTL and every existing class name / `data-*` attribute unchanged.
- **The learner's live profile must never be touched.** All verification runs against the
  isolated sandbox (`DATA_DIR` pointed at a scratch directory, no `BLOB_READ_WRITE_TOKEN`, so
  `lib/store.js` uses the local file backend). Never verify against production.

## Frozen contracts

### PFA-1 — the task2 flow (what the fix must make true)

The placement reading task shows ONE text at a time. The learner answers that text's questions;
the `ממשיכים` button (enabled only when all of the current text's questions are answered)
advances to the next text, or, on the last text, submits and moves to the done screen. Which
text is current must be **explicit state**, never derived from how many questions are answered —
deriving it is the entire cause of the bug, and it also makes the first text auto-skip forward
without the learner ever pressing `ממשיכים`.

### PFA-2 — the item-bank schema is test-frozen and may only be extended

`tests/placement-items.test.js` pins, for every `task1` item: `id` matching `/^t1-\d{2}$/`,
`lemma`, `he` (Hebrew), **`emoji` as a non-empty string, unique across items**, `options` of
exactly 4 distinct entries, `correctIndex` such that
`options[correctIndex] === (direction === 'audio-to-picture' ? emoji : lemma)`, `section`, and
`meta.task1Count` / `meta.task2TextCount` / `meta.task2QuestionCount`.

Therefore the image work is **additive only**: the `emoji` field and the `options` arrays keep
their exact current values, and pictures are attached through a NEW lookup keyed by emoji. No
existing assertion is weakened. If a step ever needs to change an existing assertion, that is a
contract change: STOP and surface it to the owner.

### PFA-3 — the accessibility gate still applies

`node scripts/check-contrast.mjs` must exit 0 on every step. Any image-based option must still
present a text alternative (the Hebrew word) for screen readers, and tap targets stay >= 48px.

## Phase 1 — fix the placement crash  (SHIP IMMEDIATELY)

One step. Small, contained, and urgent: the app's core onboarding flow is broken in production.

### Step 1.1 — make the current task2 text explicit state

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/views/placement.js` — and nothing else.
- **Goal:** replace the derived-current-text logic with an explicit index, so the flow matches
  PFA-1 and the crash becomes impossible. Exactly four edits, all inside
  `export async function render(container, ctx)`:

  NOTE ON INDENTATION: every block below is quoted at its REAL indentation in the file, taken
  with `cat -A`. Match it exactly. Note also that the line `const text = currentTask2Text();`
  appears TWICE in the file at two different indentations — 4 spaces inside `renderTask2` (edit 3)
  and 8 spaces inside the `task2-submit` handler (edit 4). Do not confuse them.

  **(1)** In the state declarations near the top of `render` (around line 193), which read:
  ```js
  let bank = null;
  let stage = "intro";
  const answers = { task1: [], task2: {} };
  ```
  add one line so they read:
  ```js
  let bank = null;
  let stage = "intro";
  let task2Index = 0;
  const answers = { task1: [], task2: {} };
  ```

  **(2)** Replace the whole of `currentTask2Text`, which reads:
  ```js
  function currentTask2Text() {
    const doneIds = new Set(Object.keys(answers.task2));
    return bank.task2.find((text) => !text.questions.every((q) => doneIds.has(q.id)));
  }
  ```
  with:
  ```js
  function currentTask2Text() {
    return bank.task2[task2Index] ?? null;
  }
  ```

  **(3)** In `renderTask2`, whose first body line (4-space indent) reads:
  ```js
    const text = currentTask2Text();
  ```
  add a guard immediately after it, so those two lines read:
  ```js
    const text = currentTask2Text();
    if (!text) return renderError();
  ```

  **(4)** In the `task2-submit` click handler, this block (8-space indent) reads:
  ```js
        const text = currentTask2Text();
        const isLastText = bank.task2[bank.task2.length - 1].id === text.id;

        if (!isLastText) {
          draw();
          return;
        }
  ```
  and becomes:
  ```js
        const isLastText = task2Index >= bank.task2.length - 1;

        if (!isLastText) {
          task2Index += 1;
          draw();
          return;
        }
  ```
  The `const text = ...` line is deleted here because `text` is not used anywhere else in this
  handler — confirmed at plan time by a fresh reviewer. If you find `text` IS used later in the
  handler, STOP and ask.

- **Relevant frozen contracts:** PFA-1 above. Also: `renderError` already exists in this file
  and is already used by `draw()`'s final `else` branch — do not create a new error renderer.
  `resumeStage()` may return `"task2"`, and a resumed session correctly starts at
  `task2Index = 0`, which is the intended behaviour (the whole reading task is re-shown).
- **Non-goals / boundary:** ONLY `public/views/placement.js`. Do not touch `tests/`, `api/`,
  `lib/`, `data/`, any other view, or `public/styles.css`. Do not change any Hebrew or English
  string. Do not touch the `VIEW_STYLE` block, any class name, or any `data-*` attribute. Do not
  refactor anything else in the file, and do not "improve" task1. Make exactly the four edits.
- **Validation (frozen):**
  ```
  cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
    && npm test 2>&1 | tail -8 \
    && [ "$(node scripts/check-contrast.mjs | tail -1)" = 'ALL PASS' ] \
    && grep -qF -- 'let task2Index = 0;' public/views/placement.js \
    && grep -qF -- 'return bank.task2[task2Index] ?? null;' public/views/placement.js \
    && grep -qF -- 'if (!text) return renderError();' public/views/placement.js \
    && grep -qF -- 'const isLastText = task2Index >= bank.task2.length - 1;' public/views/placement.js \
    && grep -qF -- 'task2Index += 1;' public/views/placement.js \
    && ! grep -qF -- 'const doneIds = new Set(Object.keys(answers.task2));' public/views/placement.js \
    && ! grep -qF -- 'bank.task2[bank.task2.length - 1].id === text.id' public/views/placement.js \
    && [ "$(grep -c 'task2Index' public/views/placement.js)" = "4" ] \
    && echo STEP-1.1-OK
  ```
  Pass = `# pass 146` / `# fail 0` in the tail AND final line `STEP-1.1-OK`.

### Step 1.2 — orchestrator end-to-end proof (not dispatched)

The grep validation proves the shape of the fix, not that the flow works. The orchestrator
additionally drives the REAL module headlessly: a scratchpad-only harness imports
`public/views/placement.js` with a minimal DOM + `fetch` stub, plays the entire placement flow
(intro → all 12 task1 items → task2 text 1 → `ממשיכים` → task2 text 2 → `ממשיכים`), and asserts
that it reaches the `done` stage with no exception thrown. The same harness is run against the
PRE-fix file first, and must reproduce the original `TypeError` — a regression test that does not
fail before the fix is not evidence.

No repo file is created; the harness lives in the scratchpad. No network, no API, no profile.

### Step 1.3 — bump the service-worker cache (ADDED mid-phase; see journal)

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/sw.js` and `tests/shell.test.js` — and nothing else.
- **Why this was missed and then added:** `/views/placement.js` is line 8 of the PRECACHE list in
  `public/sw.js`. Shipping the fix WITHOUT bumping the cache version means every returning device
  keeps serving the old, broken `placement.js` from its cache — the learner would still be unable
  to finish the test. Field-guide lesson 9 exists precisely because the previous run was bitten by
  this, and the original Phase 1 plan still deferred the bump to Phase 4. That was a planning
  defect; the bump belongs in whichever phase ships a precached file.
- **Goal:** two edits. In `public/sw.js`, the `CACHE` constant `"magic-vet-v3"` becomes
  `"magic-vet-v4"`. In `tests/shell.test.js`, the assertion `assert.ok(sw.includes('magic-vet-v3'));`
  becomes `assert.ok(sw.includes('magic-vet-v4'));`. Nothing else changes in either file — in
  particular the PRECACHE array is frozen by a `deepStrictEqual` test and must stay byte-identical,
  and no other assertion in `shell.test.js` may be touched.
- **Validation (frozen):**
  ```
  cd C:/Users/dkreinov/claude/english-app && set -o pipefail     && npm test 2>&1 | tail -8     && grep -qF -- 'magic-vet-v4' public/sw.js     && grep -qF -- "sw.includes('magic-vet-v4')" tests/shell.test.js     && [ "$(grep -rl 'magic-vet-v3' public/ tests/ | wc -l)" = "0" ]     && [ "$(git diff HEAD -- public/sw.js | grep -c '^[+-][^+-]')" = "2" ]     && [ "$(git diff HEAD -- tests/shell.test.js | grep -c '^[+-][^+-]')" = "2" ]     && echo STEP-1.3-OK
  ```
  Pass = `# pass 146` / `# fail 0` and final line `STEP-1.3-OK`. The last two clauses prove each
  file changed by exactly one line (one `-`, one `+`).

### Phase 1 acceptance criteria (frozen before execution)

1. `npm test` reports `# pass 146` / `# fail 0`.
2. `node scripts/check-contrast.mjs` exits 0, last line `ALL PASS`.
3. The step 1.1 grep validation prints `STEP-1.1-OK`.
4. `git diff --name-only 04267f5 -- public tests scripts docs api lib data` lists exactly
   `public/views/placement.js`.
5. No string change: `git diff 04267f5 -- public/views/placement.js` contains no added or
   removed line carrying Hebrew text, and no change inside the `VIEW_STYLE` literal.
6. The step 1.2 harness reproduces the `TypeError` on the pre-fix file and reaches `done`
   cleanly on the fixed file.
7. Deployed to production, and the live site SERVES the fixed code: fetching
   `/views/placement.js` from the production URL shows `let task2Index = 0;` and no
   `const doneIds = new Set`, and `/sw.js` shows `magic-vet-v4`.
   CORRECTED MID-PHASE: the original wording said "the placement flow completes on the LIVE
   site", which is incoherent with this run's own hard constraint — driving the flow on
   production would write the learner's profile, the exact thing we must not touch. The flow
   itself is proved by the step 1.2 harness against the isolated sandbox; production is verified
   by asserting it serves the fixed bytes.

---

## OWNER GATE (after Phase 1 ships)

The image work spends the owner's OpenAI credit and changes what the test looks like, so it is
gated. Questions and the recommendation are in `STATUS.md`.

## Phase 2 — content fix: the unfair "pet" item  (owner-approved)

### Step 2.1 — swap the horse distractor in t1-01

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `data/placement-items.json` — and nothing else.
- **Goal:** in the object with `"id": "t1-01"`, change its `options` array from
  `["\🐕","🎬","🐎","👩"]` to `["🐕","🎬","🏕️","👩"]` — i.e. replace the third element
  `🐎` (horse) with `🏕️` (camp). Change nothing else: `correctIndex` stays `0`, the correct
  answer `🐕` stays at index 0, `emoji`/`lemma`/`he`/`audio`/`section`/`direction` all unchanged.
  Do not touch any other item, or `meta`.
- **Why:** a horse is a pet, so the old item had two defensible answers. `🏕️` (camp) is
  unambiguously not a pet, already appears elsewhere in the bank so it is a known-good pictograph,
  and keeps the four options distinct.
- **Non-goals:** only `data/placement-items.json`, only the t1-01 options array, only element 2
  (0-indexed). No test change, no other file.
- **Validation (frozen):**
  ```
  cd C:/Users/dkreinov/claude/english-app && set -o pipefail     && npm test 2>&1 | tail -8     && node -e "const b=require('./data/placement-items.json');const it=b.task1.find(i=>i.id==='t1-01');const o=it.options;if(JSON.stringify(o)!==JSON.stringify(['🐕','🎬','🏕️','👩']))throw new Error('options wrong: '+JSON.stringify(o));if(it.correctIndex!==0)throw new Error('correctIndex moved');if(o[it.correctIndex]!==it.emoji)throw new Error('correct answer moved');console.log('DATA-OK');"     && [ "$(git diff HEAD -- data/placement-items.json | grep -c '^[+-][^+-]')" = "2" ]     && echo STEP-2.1-OK
  ```
  Pass = `# pass 146` / `# fail 0`, `DATA-OK`, and final line `STEP-2.1-OK`. The last clause proves
  exactly one line changed (one removed, one added).

### Phase 2 acceptance criteria

1. `npm test` 146/146. 2. The step 2.1 validation prints `STEP-2.1-OK`.
3. `git diff --name-only <phase-2-baseline> -- .` (excluding `.oplan`) lists only
   `data/placement-items.json`.

---

## Phase 3 — generate the 12 rich scenes  (ORCHESTRATOR-RUN, method proven)

Route: **ChatGPT web, free** — owner policy 2026-07-25: "whatever is not needed realtime
generation in the app, always go with the free option of web." The paid API is reserved for
runtime generation (`api/chapter.js`). This phase is orchestrator-run because it drives a
browser; its OUTPUT is gated mechanically (below), which is where the oplan rigour lives.

### Proven capture method (replaces the delight-pass download-button dance)

The old method clicked ChatGPT's Download control and guessed "newest file in ~/Downloads" — the
method that produced the 89-duplicate incident. Superseded. The new method, proven on `pet`:

1. Generate in ONE chat, one image at a time (ChatGPT serialises within a chat; one chat also
   keeps the style consistent). Chat in use:
   `https://chatgpt.com/c/6a6491a2-cf44-83eb-96bb-023d4345d4d9`.
2. Verify composer text before every send (stray-character injection is a known ChatGPT quirk).
3. Capture with in-page JS: `fetch(img.src, {credentials:'include'})` -> blob -> object URL ->
   a single synthetic `<a download="placement-<lemma>.png">` clicked **exactly once**.
   The explicit filename removes the "newest file" guesswork entirely, and one programmatic
   click cannot double-fire. (Posting bytes straight to a localhost sink was tried first and is
   blocked by chatgpt.com's CSP — do not retry that.)
4. Poll from Bash for `~/Downloads/placement-<lemma>.png`, assert exactly ONE such file exists,
   then `mv` it to `assets/placement/<lemma>.png`.

### FROZEN RICH PROMPTS (restored — an earlier plan rewrite deleted them; see journal)

Owner directed RICH SCENES, not flat icons. Each prompt names its subject as the CENTRAL HERO so
it still reads once shrunk to a tile. The first chat message carries the full style sentence;
every later message begins "Same style, same square 1:1 format. Now:" and ends "No text, no
letters, no watermark, no frame or border."

Style sentence: "Warm cozy cartoon illustration: soft painterly 3D-cartoon look, warm golden
lighting, wood-and-magic fantasy world, teal and violet and amber accents. Aimed at an
11-year-old, charming and adventurous, not babyish."

| lemma | subject clause |
|---|---|
| pet | a happy puppy dog curled on a cushion in a cozy magical veterinary clinic |
| mom | a warm smiling cartoon mother in the clinic's round doorway, arms gently open in welcome |
| camp | a cozy campsite at golden hour — a glowing tent, a small campfire, tall pine trees, fireflies |
| fan | a cartoon electric fan with spinning blades on a wooden clinic shelf, papers fluttering |
| dad | a warm smiling cartoon father in the clinic, sleeves rolled up |
| desk | a cozy wooden study desk with a glowing lamp, an open book and potion bottles |
| singer | a cheerful cartoon singer on a small stage holding a microphone in a warm spotlight |
| horse | a friendly cartoon horse in a sunny magical meadow beside a wooden stable |
| zoo | a magical zoo scene — an archway, a giraffe and a lion, colourful banners |
| movie | a cozy movie-night scene — a glowing screen, a film clapperboard, a bucket of popcorn |
| monkey | a cheerful cartoon monkey swinging on a vine in a leafy jungle, holding a banana |
| steak | a hearty grilled steak on a plate on a rustic wooden table in warm tavern light |

Progress: pet DONE (owner-approved) · mom DONE · camp DONE · remaining: fan, dad, desk, singer,
horse, zoo, movie, monkey, steak.

### Phase 3 acceptance criteria (frozen)

1. `assets/placement/` contains exactly 12 PNGs, named `<lemma>.png` for the 12 lemmas above.
2. Every one is square (width === height) and >= 512px.
3. All 12 are content-distinct by md5 (guards against a duplicate grab — the delight-pass lesson).
4. `npm test` still 146/146 and the contrast gate still exits 0 (nothing in `public/` changed yet).

```
cd C:/Users/dkreinov/claude/english-app && node -e "
const sharp=require('./node_modules/sharp/dist/index.cjs');const fs=require('fs'),crypto=require('crypto');
const L=['pet','mom','camp','fan','dad','desk','singer','horse','zoo','movie','monkey','steak'];
(async()=>{const seen=new Map();
for(const l of L){const f='assets/placement/'+l+'.png';
 if(!fs.existsSync(f))throw new Error('MISSING '+f);
 const m=await sharp(f).metadata(); const b=fs.readFileSync(f);
 const h=crypto.createHash('md5').update(b).digest('hex');
 if(m.width!==m.height)throw new Error('not square: '+l);
 if(m.width<512)throw new Error('too small: '+l);
 if(seen.has(h))throw new Error('DUPLICATE bytes: '+l+' == '+seen.get(h));
 seen.set(h,l); console.log(l,m.width+'x'+m.height,h.slice(0,8));}
console.log('PHASE3-OK 12 distinct square masters');})();"
```

## Phase 4 — optimize + wire into the UI  (executor steps)

### Step 4.1 — web derivatives  (WORKER, retry 2)

- **Files:** `scripts/optimize-placement.js` (NEW) only.
- **Goal:** Node ESM script mirroring `scripts/optimize-assets.js`. It MUST
  `await mkdir(OUT, { recursive: true })` — `public/assets/placement/` does not exist yet. Reads
  the 12 masters `assets/placement/<lemma>.png`, writes `public/assets/placement/<lemma>.webp`
  at `width: 256` (`withoutEnlargement: true`), `webp({ quality: 72, effort: 4 })`, logging each
  file. LEMMAS, in order: pet, mom, camp, fan, dad, desk, singer, horse, zoo, movie, monkey, steak.
- **Non-goals:** do not touch `scripts/optimize-assets.js`, the masters, `public/views/`, or tests.
- **Validation (frozen):**

```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && node scripts/optimize-placement.js \
  && node -e "
const sharp=require('./node_modules/sharp/dist/index.cjs');const fs=require('fs'),c=require('crypto');
const L=['pet','mom','camp','fan','dad','desk','singer','horse','zoo','movie','monkey','steak'];
(async()=>{const seen=new Map();
for(const l of L){const f='public/assets/placement/'+l+'.webp';
 if(!fs.existsSync(f))throw new Error('MISSING '+f);
 const m=await sharp(f).metadata(); const b=fs.readFileSync(f);
 if(m.format!=='webp')throw new Error('not webp: '+l);
 if(m.width!==256)throw new Error('bad width '+m.width+': '+l);
 if(m.width!==m.height)throw new Error('not square: '+l);
 if(b.length>60000)throw new Error('too big '+b.length+': '+l);
 const h=c.createHash('md5').update(b).digest('hex');
 if(seen.has(h))throw new Error('DUPLICATE '+l+' == '+seen.get(h)); seen.set(h,l);}
console.log('WEBP-OK 12 distinct');})();" \
  && npm test 2>&1 | tail -4 \
  && echo STEP-4.1-OK
```

### Step 4.2 — render the artwork  (WORKER, retry 2)

- **Files:** `public/views/placement.js` only. ADDITIVE — `data/` untouched, so every existing
  assertion stays green.
- **(a)** Add ONE module-level constant plus helper, immediately above `function header(`:

```js
const OPT_ART = {
  "\u{1F415}": { src: "/assets/placement/pet.webp", alt: "חיית מחמד" },
  "\u{1F469}": { src: "/assets/placement/mom.webp", alt: "אמא" },
  "\u{1F3D5}\uFE0F": { src: "/assets/placement/camp.webp", alt: "מחנה" },
  "\u{1F300}": { src: "/assets/placement/fan.webp", alt: "מאוורר" },
  "\u{1F468}": { src: "/assets/placement/dad.webp", alt: "אבא" },
  "\u{1F9D1}\u200D\u{1F4BB}": { src: "/assets/placement/desk.webp", alt: "שולחן" },
  "\u{1F3A4}": { src: "/assets/placement/singer.webp", alt: "זמר" },
  "\u{1F40E}": { src: "/assets/placement/horse.webp", alt: "סוס" },
  "\u{1F981}": { src: "/assets/placement/zoo.webp", alt: "גן חיות" },
  "\u{1F3AC}": { src: "/assets/placement/movie.webp", alt: "סרט" },
  "\u{1F412}": { src: "/assets/placement/monkey.webp", alt: "קוף" },
  "\u{1F969}": { src: "/assets/placement/steak.webp", alt: "סטייק" },
};

function optArt(emoji) {
  const a = OPT_ART[emoji];
  return a ? `<img class="opt-art" src="${a.src}" alt="${a.alt}" />` : emoji;
}
```

  The `\u{...}` escapes are deliberate: no multi-byte emoji has to survive hand-editing, which is
  a known hazard on this machine. `\u{1F3D5}\uFE0F` carries the variation selector and
  `\u{1F9D1}\u200D\u{1F4BB}` the ZWJ, exactly as the data file stores them.
- **(b)** In `renderTask1Item`, in the `audio-to-picture` option map, the button template ends
  `data-choice="${i}">${emoji}</button>`. Change ONLY `${emoji}` to `${optArt(emoji)}`.
- **(c)** In the same function, `<div class="placement-emoji-big">${item.emoji}</div>` becomes
  `<div class="placement-emoji-big">${optArt(item.emoji)}</div>`.
- **(d)** In `VIEW_STYLE`: in `.placement-option-btn`, change `min-height: 76px;` to
  `min-height: 150px;` and `padding: 8px;` to `padding: 6px;`. Then APPEND these two rules at the
  very end of the template literal (exact values):

```css
  .opt-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: calc(var(--radius) - 4px);
  }

  .placement-emoji-big .opt-art {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    border-radius: var(--radius);
  }
```

- **Non-goals:** no Hebrew/English user-visible string changed; no class name, `data-action`,
  `data-choice`, `data-src` or `dir` changed; `.placement-option-btn.word` untouched (it holds
  English words, not pictures); no other file.
- **Validation (frozen):**

```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -4 \
  && [ "$(node scripts/check-contrast.mjs | tail -1)" = 'ALL PASS' ] \
  && grep -qF -- 'const OPT_ART = {' public/views/placement.js \
  && grep -qF -- 'function optArt(emoji)' public/views/placement.js \
  && grep -qF -- '${optArt(emoji)}</button>' public/views/placement.js \
  && grep -qF -- '${optArt(item.emoji)}</div>' public/views/placement.js \
  && grep -qF -- 'min-height: 150px;' public/views/placement.js \
  && grep -qF -- 'object-fit: cover;' public/views/placement.js \
  && [ "$(grep -c 'assets/placement/' public/views/placement.js)" = "12" ] \
  && [ "$(git diff HEAD --name-only -- public data lib api tests scripts)" = "public/views/placement.js" ] \
  && echo STEP-4.2-OK
```

### Step 4.3 — service-worker cache bump  (WORKER, retry 2)

- **Files:** `public/sw.js` + `tests/shell.test.js`. `magic-vet-v4` -> `magic-vet-v5`, plus the
  matching assertion string. PRECACHE list frozen (deepStrictEqual). Required because
  `placement.js` is precached; without it returning devices keep the old view forever.
- **Validation (frozen):**

```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -4 \
  && grep -qF -- 'magic-vet-v5' public/sw.js \
  && grep -qF -- "sw.includes('magic-vet-v5')" tests/shell.test.js \
  && [ "$(grep -rl 'magic-vet-v4' public/ tests/ | wc -l)" = "0" ] \
  && [ "$(git diff HEAD -- public/sw.js | grep -c '^[+-][^+-]')" = "2" ] \
  && [ "$(git diff HEAD -- tests/shell.test.js | grep -c '^[+-][^+-]')" = "2" ] \
  && echo STEP-4.3-OK
```

### Step 4.4 — orchestrator RUNTIME proof (not dispatched)

Static greps can pass while the feature is broken at runtime, so — as in step 1.2 — the
orchestrator drives the REAL module headlessly (linkedom DOM, stubbed `Audio`/`location`, `fetch`
pointed at the isolated sandbox on :3010), renders task1, and asserts from the LIVE DOM that:
every `audio-to-picture` option button contains an `<img class="opt-art">` whose `src` starts
`/assets/placement/` and whose `alt` is non-empty; the `picture-to-word` prompt likewise; and
clicking an option still advances the item — proving the `<img>` child did not break the click
handler. Sandbox only; the learner profile is never contacted.

### Phase 4 acceptance criteria (frozen)

1. `npm test` 146/146 and the contrast gate exits 0.
2. STEP-4.1-OK, STEP-4.2-OK and STEP-4.3-OK all print.
3. `git diff --name-only <phase-4 baseline> -- public data lib api tests scripts` lists exactly:
   `public/sw.js`, `public/views/placement.js`, `scripts/optimize-placement.js`,
   `tests/shell.test.js`, plus the 12 files under `public/assets/placement/`.
4. No user-visible Hebrew string added or removed in `public/views/placement.js` — the only new
   Hebrew is `alt` text inside `OPT_ART`.
5. The step 4.4 runtime proof passes: 4 option `<img>`s on an audio item, a prompt `<img>` on a
   picture item, all with non-empty `alt`, and a click still advances.

## Phase 5 — deploy and verify

Deploy to the existing Vercel project. Verify live: `/views/placement.js` serves the image map,
`/assets/placement/pet.webp` returns 200 `image/webp`, `/sw.js` serves `magic-vet-v5`. Confirm
via READ-ONLY GETs only — the learner profile is never contacted (no API call, no placement run
on production; the sandbox on :3010 is used for any interactive check).
