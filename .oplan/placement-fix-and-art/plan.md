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

## Phase 3 — generate the option artwork  (DETAILED; execution BLOCKED — see STATUS)

### The 12 concepts (one square icon each, keyed by the item's `emoji` field)

| lemma | he | emoji (replaced) | used as |
|---|---|---|---|
| pet | חיית מחמד | 🐕 | audio→picture answer |
| mom | אמא | 👩 | audio→picture answer |
| camp | מחנה | 🏕️ | audio→picture answer |
| fan | מאוורר | 🌀 | audio→picture answer |
| dad | אבא | 👨 | audio→picture answer |
| desk | שולחן | 🧑‍💻 | audio→picture answer |
| singer | זמר | 🎤 | picture→word PROMPT (no audio) |
| horse | סוס | 🐎 | picture→word PROMPT (no audio) |
| zoo | גן חיות | 🦁 | picture→word PROMPT (no audio) |
| movie | סרט | 🎬 | picture→word PROMPT (no audio) |
| monkey | קוף | 🐒 | picture→word PROMPT (no audio) |
| steak | סטייק | 🥩 | picture→word PROMPT (no audio) |

### DESIGN DECISION (frozen): these are ICON TILES, not scenes

The option art renders at ~76px inside a button. A busy "wood-and-magic fantasy scene" is
unreadable at that size and would not tell a 6th-grader "steak" from "camp". So each prompt is a
SINGLE, CENTERED, INSTANTLY-RECOGNISABLE subject on a simple soft background, rendered in the
frozen cartoon style/palette — NOT the full FROZEN STYLE SUFFIX scene language. This is a
deliberate, logged departure from the §6 suffix, justified by the tile size; the owner approved
"pictures in the frozen cartoon style", and readability at 76px is the governing constraint.

### FROZEN ICON PROMPTS (concept + this shared ICON SUFFIX)

ICON SUFFIX (verbatim on every one): "Centered single subject, simple soft warm-amber background
with a gentle glow, generous empty margin around the subject, no scene clutter. Warm cozy
3D-cartoon illustration, soft painterly rendering, warm golden lighting, teal + violet + amber
accents — the same look as the girl-and-dragon magical-vet-clinic art. Aimed at an 11-year-old,
charming not babyish. Square 1:1. No text, no letters, no watermark, no border, no frame."

- pet: "A happy cartoon puppy dog sitting, looking at the viewer."
- mom: "A warm friendly cartoon mother — a woman smiling, head and shoulders."
- camp: "A cozy cartoon camping tent under a tree with a tiny campfire."
- fan: "A cartoon electric desk fan with spinning blades."
- dad: "A warm friendly cartoon father — a man smiling, head and shoulders."
- desk: "A cartoon wooden study desk with a lamp and a book on it."
- singer: "A cartoon singer holding a microphone and singing, mid-song."
- horse: "A friendly cartoon horse standing, in profile."
- zoo: "A cartoon zoo entrance archway with a giraffe and a lion peeking behind it."
- movie: "A cartoon film clapperboard and a bucket of popcorn."
- monkey: "A cheerful cartoon monkey sitting, holding a banana."
- steak: "A cartoon grilled steak on a plate with a sprig of garnish."

### Storage + pipeline (mirrors the delight-pass method, field-guide 10–13)

- Masters (full-res PNG) committed under `assets/placement/<lemma>.png` (12 files).
- Web derivatives at `public/assets/placement/<lemma>.webp`, produced by extending
  `scripts/optimize-assets.js` (or a sibling script) with a 256px width for the 12 tiles.
- Generation is ONE image at a time. Activate the ChatGPT Download control EXACTLY ONCE per
  image and poll `~/Downloads` via Bash — re-clicking caused the 89-duplicate incident.
- Validation MUST assert content-distinctness by md5 across all 12 masters plus the anchor —
  per-file format/size checks alone do not catch a duplicate grab.

### BLOCKER (why Phase 3 is not executing now)

The method the owner approved is "reuse the ONE dedicated ChatGPT chat" (visual-design.md §7,
`https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc`). On 2026-07-25 that chat will not
load: it returns "This content is unavailable or could not be found", and on retry stalls
indefinitely on a spinner with zero conversation turns rendered — while a NEW chat and the rest
of ChatGPT load fine and the account is logged in (Plus). The chat is months old and dense with
large images, which is the likely cause. The browser tooling has also been intermittently flaky
this session. Driving 12 sequential generations under these conditions is high-risk with a known
catastrophic failure mode, so the run STOPS here and asks the owner (see OPEN QUESTION 3) rather
than loop or silently switch chats.

Fallback available if approved: generate in a NEW chat, re-establishing style by uploading the
local anchor `assets/design-tests/dragon-clinic-test.png` (present, 2.0 MB) plus one or two of
the committed masters in `assets/delight/`. This deviates from "the ONE dedicated chat", so it
needs the owner's OK — hence the gate.

## Phase 4 — wire images into the placement UI  (skeleton)


11 unique concepts, taken from the emoji currently used as picture options:
`🐕 pet` · `🎬 movie` · `🐎 horse` · `👩 mom` · `🥩 steak` · `🌀 fan` · `🏕️ camp` · `🦁 zoo` ·
`👨 dad` · `🎤 singer` · `🧑‍💻 desk`. Generate one square illustration per concept in the frozen
style (`docs/visual-design.md` §6 FROZEN STYLE SUFFIX), masters committed under
`assets/placement/`, web derivatives at `public/assets/placement/<lemma>.webp` via the existing
`scripts/optimize-assets.js` pattern. Validation asserts 11 files exist, are square, are webp,
and are content-distinct by md5 (delight-pass field-guide lesson: per-file checks alone do not
catch duplicate grabs).

## Phase 4 — wire images into the placement UI  (skeleton)

Additive per PFA-2: a new emoji→image map, and `renderTask1Item` renders `<img>` with the
Hebrew word as `alt` when a mapping exists, falling back to the emoji otherwise. `data/` item
bank untouched, so every existing assertion stays green. Tap targets stay >= 48px; contrast gate
stays passing.

## Phase 5 — deploy and live verification  (skeleton)

Bump the sw `CACHE` version (`magic-vet-v3` → `magic-vet-v4`) plus its assertion string, deploy,
verify live, and confirm the learner profile was never contacted.
