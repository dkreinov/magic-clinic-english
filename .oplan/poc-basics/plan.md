# Plan — run `poc-basics`

Base commit: `89e6600` (the commit that added `brief.md`; the brief's own header says `e4c5885`,
which was one commit earlier — **`89e6600` is the real planning baseline** and every delta assertion
below is written against it. Record-gap repair, logged.)
Test baseline: 157 pass / 0 fail. Contrast gate: 52 pairs, `ALL PASS`.

Owner brief: *"this and how to make this app growing with her, but first we are in poc for her to
start using it, so fix the basics"*. The owner's three scoping answers and the orchestrator's six
frozen design decisions (D1-D6) are in `.oplan/poc-basics/brief.md`, which is the authority this
plan serves. Phase 1 was drafted by a fresh PLANNER-tier planner from the record alone, then
reviewed by the orchestrator.

## Orchestrator amendments to the planner's draft

**BLOCKER 1 - ANSWERED: the item-bank review gates the CHILD, not the DEPLOY.**
The planner correctly refused to invent this. The answer is that the two were never actually
coupled: `design.md` §4 requires the bank to be "reviewed by the owner **before the child ever sees
it**" - a gate on her *seeing* the test, not on the code being live. And the app is behind
`APP_CODE`: she cannot reach the placement test without an entry code the owner holds. So Phase 2
deploys without waiting, and the run closes by telling the owner, in order: (1) open the tool step
1.5 builds, (2) sign the gate, (3) *then* give her the code. `docs/item-bank-review.md` keeps its
`STATUS: REQUIRED-BEFORE-CHILD-USE` header, which step 1.6 deliberately leaves standing - it is
still true, and it is the thing standing between the deploy and her first session.

**BLOCKER 2 - ANSWERED: yes, write `#/parent` into `docs/owner-handoff.md`.**
A route nobody can find delivers nothing, the file carries no FROZEN header, and it is the document
the owner actually opens. Same reasoning the previous run's step 3.1 used. The planner flagged this
as the one place it extended the brief's letter to serve its intent rather than burying it - that is
exactly the right instinct and the extension is approved.

**RECORD GAPS - all five repaired before the first dispatch:**
1. The workspace had no `journal.md` / `phase-state.md` / `STATUS.md`. Created before step 1.1.
2. The brief's base commit was stale (`e4c5885` vs HEAD `89e6600`). Corrected in this header and in
   `brief.md`.
3. No deployment ledger for THIS run. `phase-state.md` carries an empty ledger with the instruction
   that Phase 2 must re-establish the rollback target with `vercel inspect` rather than inherit the
   previous run's id.
4. `docs/item-bank-review.md`'s 12-row table still describes the task-1 options as **emoji**, but
   the app has rendered illustrations (`public/assets/placement/*.webp`) since a previous run. The
   document has been describing something the child never sees. Left standing by design - step 1.5's
   tool shows the real illustrations and supersedes it - and logged in the journal so the next run
   knows the table is stale deliberately, not accidentally.
5. Behaviour when `sessionStorage` is unavailable was decided in PB-3 (degrade to "no re-take",
   exactly as `public/api.js` already degrades on `localStorage` failure), not left for a worker.

---

PHASE 1: fix the basics
GOAL: The placement verdict is visible and correctable — an owner-only `#/parent` route shows her
band, both task scores, when the test was taken and her word-bank size, and carries a re-take button
that restarts the test client-side. Her first interaction with the app is a real Hebrew entry-code
screen instead of `window.prompt`, with a clear error and unlimited retry. The owner can complete the
`REQUIRED-BEFORE-CHILD-USE` item-bank gate by tapping through a generated `docs/item-bank-review.html`
that plays all 6 clips and shows all 12 pictures with their options. `npm test` goes 157 → 172 with
zero failures, `public/sw.js` ships one `CACHE` bump (`magic-vet-v7` → `magic-vet-v8`), and the
contrast gate still prints `ALL PASS` over exactly 52 pairs.

ACCEPTANCE CRITERIA: (frozen before execution)
1. `STEP-1.1-OK` … `STEP-1.6-OK` all print, each re-run by the orchestrator in a clean tree.
2. `npm test` prints `# fail 0` and `# pass 172` (157 + 2 + 6 + 3 + 4 = 172; see PB-7).
3. `node scripts/check-contrast.mjs` exits 0, last line `ALL PASS`, `grep -c '^PASS'` is **52** —
   this phase adds no `:root` token and paints no raw hex (PB-8).
4. `grep -qF -- 'const CACHE = "magic-vet-v8";' public/sw.js` passes;
   `grep -rq 'magic-vet-v7' public/ tests/` finds nothing;
   `git diff 89e6600 -- public/sw.js | grep -c '^[+-][^+-]'` is exactly `2` (PRECACHE untouched,
   which is what `docs/visual-design.md` §8 requires).
5. `git diff --name-only 89e6600 -- . ':!.oplan'` lists exactly these 16 paths:
   `README.md`, `docs/item-bank-review.html`, `docs/item-bank-review.md`, `docs/owner-handoff.md`,
   `public/api.js`, `public/app.js`, `public/styles.css`, `public/sw.js`, `public/views/parent.js`,
   `public/views/placement.js`, `scripts/build-item-review.js`, `tests/entry-code.test.js`,
   `tests/item-review.test.js`, `tests/parent-ui.test.js`, `tests/placement-ui.test.js`,
   `tests/shell.test.js` — sixteen paths. Count them mechanically; the union of the six steps' own file lists is the authority.
6. Nothing under `api/`, `lib/`, `data/`, `assets/` changed: `git diff --name-only 89e6600 -- api lib
   data assets` is empty. In particular `api/placement.js` is byte-unchanged (D3).
7. Nothing new is precached and nothing new ships to the phone by accident:
   `git diff --name-only 89e6600 -- public | grep -c ''` is `6`, and
   `docs/item-bank-review.html` is NOT under `public/` (D4).
8. The learner's profile was never contacted: `.data/profile.json` does not exist locally, no
   frozen command in this phase contains the string `/api/profile` as a network target, and no step
   runs a server. (`/api/profile` appears only inside *source* files the steps write.)
9. Running `node scripts/build-item-review.js` twice produces byte-identical
   `docs/item-bank-review.html` (checked inside step 1.5).

SKELETON FOR LATER PHASES:

**Phase 2 — deploy so she can start.** No new design. Correct any owner-facing doc that Phase 1
made false (Phase 1's step 1.6 already does the known ones, so Phase 2 should re-check rather than
assume), then run the recipe field-guide lesson 13 carries: record the outgoing production
deployment id + url + commit via `"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app`
**before** the deploy call (it is the only rollback target), deploy with
`"$(npm prefix -g)/vercel" deploy --prod --yes`, then verify live by md5 against the **worktree**
(never a git blob — `index.html` is CRLF on disk, LF in git) for `sw.js`, `styles.css`, `app.js`,
`api.js`, `views/parent.js`, `views/placement.js` and `manifest.webmanifest`; fetch the shell as `/`
(cleanUrls makes `/index.html` a 308); assert live `/sw.js` contains `magic-vet-v8`; assert
`GET /api/health` returns exactly `{"ok":true,"data":{"status":"up","version":1}}` and that
`POST /api/chapter {"action":"ping"}` with no code header returns **401** (the free reject-path probe
that proves the whole module graph loaded). `/api/profile` is never requested, no browser is opened
against production, no OpenAI credit is spent, and no `vercel env` command is run. Add a live probe
that `GET /item-bank-review.html` and `GET /docs/item-bank-review.html` both 404 — that is the
mechanical proof of D4. **Phase 2 must not be announced to the learner until the owner has signed
the item-bank gate (see BLOCKERS).**

**Phase 3 — the growth design document.** Zero code. One document, owner-approved, that becomes the
next run's brief: how the app grows with her. It must answer, from the evidence this codebase
already holds, the question the brief exposes — that `skills.receptiveVocab.band` is written in
exactly one place (`api/placement.js:54`) and never moves again, while `design.md` §3 claims
"continuous calibration is the real engine". So the doc's spine is: what promotes a band after the
placement test (tapped-word volume? micro-check accuracy over N chapters? a short periodic re-check?),
what happens above A2 when the MoE Band II list is exhausted, and which of `design.md` §6's parked
items (spaced repetition + push, writing, record-only speech, trophies, the full parent view) come in
which order. Ship it as `docs/growth.md` in the same non-frozen register as `docs/owner-handoff.md`,
with an explicit owner sign-off line, and change no code.

WHAT I RAN TO LEARN THE FACTS:
- `npm test 2>&1 | tail -12` → **157 pass / 0 fail**, the baseline every step total is built from.
  Re-checked `ls -la .data` and `git status --porcelain` immediately after: `.data/` still empty,
  tree still clean — so the suite writes nothing (field-guide lesson 7 satisfied).
- `git log --oneline -6` / `git rev-parse HEAD` → HEAD is **89e6600** ("oplan: open run poc-basics"),
  one commit past the brief's stated base `e4c5885`. Planning baseline = `89e6600`, tree clean.
- Read `public/api.js` (76 lines) → confirmed `window.prompt("קוד כניסה")` at line 12, and that the
  retry budget is exactly one (`allowRetry = false` on the recursive call, line 53).
- Read `public/app.js` (48 lines) → `ROUTES` is a 4-entry map, `currentRoute()` falls back to
  `/home` for any unknown hash, `renderRoute()` is synchronous. No test asserts its contents.
- Read `public/sw.js` → `CACHE = "magic-vet-v7"`, a 10-entry `PRECACHE`, and a fetch handler that
  does `caches.match(...) || fetch(...)` with **no runtime caching**. This is why the parent view is
  a *dynamic* import: a static import of a non-precached module would make `app.js` fail to load
  offline, and adding to `PRECACHE` is forbidden (see next).
- `sed -n '$(grep -n "^## 8" …)'` over `docs/visual-design.md` → §8 DON'T: "Touch `public/sw.js` or
  its PRECACHE list… The single sanctioned exception is the `CACHE` version string constant, which
  MUST be bumped in the same phase as any change to a precached file." Confirms PB-5 and kills the
  "just add `/views/parent.js` to PRECACHE" option.
- `grep -rn "magic-vet" .` (excluding `.oplan/`, `.git/`) → exactly two hits: `public/sw.js:1` and
  `tests/shell.test.js:58`. So the bump is a 2-file, 2-line change and the negative grep is safe.
- Read `tests/shell.test.js`, `tests/placement-ui.test.js`, `tests/words-ui.test.js`,
  `tests/smoke.test.js`, `tests/api-placement.test.js` → the exact-shape assertions this phase must
  not break: `manifest.icons[0].src === '/icons/icon.svg'`, the `deepStrictEqual` PRECACHE array,
  `sw.includes('magic-vet-v7')` (the one line step 1.4 changes), 15 frozen Hebrew strings in
  `placement.js`, and `api-placement.test.js`'s `unknown action → 400` (which D3 exists to avoid
  touching). `shell.test.js` also runs `node --check` over **every** `.js` under `public/`, so
  `public/views/parent.js` is covered by an existing test the moment it exists.
- `grep -rn "app\.js\|api\.js" tests/` → nothing asserts the *contents* of `public/app.js` or
  `public/api.js`. Both are free to change shape; only `node --check` must keep passing.
- Read `scripts/check-contrast.mjs` → the 52 `PAIRS`. Every pair this phase needs already exists:
  ink/muted/primary/teal/danger/border on `--color-card`, ink on `--color-surface-2`, and everything
  on `--color-bg`. So no new pair, no gate edit, 52 stays 52.
- Read `public/styles.css` (406 lines) → the 19 `:root` tokens, section-comment style
  (`/* ---------- Header ---------- */`), and the file ends at `.spot-image--sm`. `grep -rn z-index
  public/` → max is `50` (reader), nav is `10`; the entry gate takes `100`.
- Read `tests/background.test.js` → it extracts the **first** `background-image:` in `styles.css`
  and asserts the captured value contains no `#`. Appending the entry-gate block at EOF cannot move
  that match; the block must nonetheless declare no `background-image` (non-goal in step 1.3).
- `node -e` over `data/placement-items.json` → 12 task1 items (6 `audio-to-picture`, 6
  `picture-to-word`), 2 task2 texts, 6 questions; `audio` is stored as `"audio/word-<lemma>.mp3"`
  (no leading slash); `meta.generator` is `scripts/build-item-bank.js`.
- A dedicated `node -e` that built an emoji→lemma map from the bank → **all 12 item emojis are
  distinct, every emoji that appears as an option is one of those 12, and every
  `public/assets/placement/<lemma>.webp` and `public/<item.audio>` exists on disk.** This is the
  fact that lets the review generator derive every picture path from the bank alone, with no copy of
  `OPT_ART` and no drift risk. (The 12 "unmapped options" it printed are the English words used by
  the `picture-to-word` items — expected, not a defect.)
- `node --input-type=module -e` calling `buildAllowedSet` with the real `band1.json` + `band2.json`
  → **preA1 = 296, A1 = 1257, A2 = 2850**. These reproduce the brief's numbers exactly and are the
  three integers frozen into the parent view's copy (and re-derived by a test, PB-2).
- Read `docs/item-bank-review.md` (89 lines), `docs/owner-handoff.md` (115 lines), `README.md`
  (108 lines); `git grep -n "157" -- . ':!.oplan'` → exactly two text occurrences: `README.md:60`
  and `docs/owner-handoff.md:75`. Those are step 1.6's only count edits.
- `cat vercel.json package.json` → `{"cleanUrls": true}`, `"test": "node --test"`, no build step;
  `grep -n "PUBLIC_DIR" scripts/dev-server.js` → the dev server serves **only** `public/`. So
  `docs/item-bank-review.html` is unreachable both locally and in production — D4 holds by
  construction, not by promise.

FROZEN CONTRACTS FOR THIS PHASE:

**PB-1 — the owner route.** Hash route is exactly `#/parent`; the view is `public/views/parent.js`,
exporting `export async function render(container, ctx)` like every other view. It is loaded by a
**dynamic** `import("./views/parent.js")` inside `renderRoute()`, NOT by a top-level import, because
`public/sw.js`'s `PRECACHE` is frozen by `docs/visual-design.md` §8 and a static import of a
non-precached module would break the whole app offline. It appears in **no** `<a>` in
`public/index.html` and in **no** nav tab (D2).

**PB-2 — the parent view's frozen copy** (Hebrew, addressed to the owner, feminine, matching
`docs/owner-handoff.md`'s voice — `פתחי` / `בחרי` / `שימי`):
- header: greeting `תצוגת הורים`, title `מה האפליקציה יודעת עליה`
- loading body: `טוען...` · error body: `משהו השתבש, נסי שוב.`
- card 1 title `רמת אוצר המילים`; the big value is the raw band string `preA1` / `A1` / `A2`, or
  `טרם נקבעה` when `skills.receptiveVocab.band` is null/absent. The subtitle under it is exactly one
  of these four, verbatim (the three integers are re-derived by a test — see PB-2a):
  - `preA1 — הסיפורים נבנים מ-296 מילים.`
  - `A1 — הסיפורים נבנים מ-1257 מילים.`
  - `A2 — הסיפורים נבנים מ-2850 מילים.`
  - `היא עוד לא עשתה את מבחן המיון.`
- card 2 title `מבחן המיון`, three rows, label → value:
  `משימה 1 — מילים ותמונות` → `${correct} מתוך ${total}` from `placement.task1`, else `טרם נעשתה`
  `משימה 2 — הבנת הנקרא` → `${correct} מתוך ${total}` from `placement.task2`, else `טרם נעשתה`
  `נעשה בתאריך` → `DD.MM.YYYY` from `placement.completedAt`, else `placement.task1.answeredAt`,
  else the single character `—`
- card 3 title `אוצר המילים שלה`, one row: label `מילים באוסף` → `${Object.keys(profile.words).length}`
- card 4 title `התוצאה לא נראית נכונה?`, subtitle
  `הרמה נקבעת לפי 12 שאלות בלבד, ושש מהן שאלות שמיעה — שתי טעויות יכולות להוריד אותה רמה שלמה. אפשר לעשות את המבחן מחדש, והתוצאה החדשה תחליף את הקודמת.`
  and one `<button class="btn btn-primary" type="button" data-action="retake">מבחן מיון מחדש</button>`
- footer note (class `parent-note`):
  `תצוגה זו נועדה להורה בלבד ואינה מופיעה בתפריט של האפליקציה.`
- date helper is frozen: `new Date(iso)`, `Number.isNaN(d.getTime())` → `—`, otherwise
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` with 2-digit zero padding.
- **No `dir` attribute anywhere in this view.** Values are pure digits + dots, or pure Hebrew, or
  the pure-Latin band names — all of which render correctly inside the page's RTL context. `10 / 12`
  with a spaced slash is exactly the bidi hazard `${correct} מתוך ${total}` avoids.

**PB-2a — the numbers must stay true.** `tests/parent-ui.test.js` imports `buildAllowedSet` from
`lib/story.js` with the real `data/band1.json` + `data/band2.json`, computes the three set sizes, and
asserts `public/views/parent.js` contains ``הסיפורים נבנים מ-${size} מילים.`` for each band. A
fluent, false sentence in a view is exactly what the previous run's auditor caught in a frozen doc;
this test makes it mechanical.

**PB-3 — re-take is a client-side flag, and lives ONLY on the owner view.** Key
`sessionStorage["retakePlacement"] = "1"`, written by the parent view's `retake` button immediately
before `location.hash = "#/placement"`, and consumed **exactly once per `render()` call** by
`public/views/placement.js`. `sessionStorage` (not `localStorage`) so a stale flag cannot fire days
later; every access is wrapped in `try/catch` like `public/api.js`'s existing `storedCode()`, so
private mode degrades to "no re-take" rather than a crash. **No API action is added and
`api/placement.js` is not touched** (D3) — `POST /api/placement {action:"submit"}` already overwrites
`skills.receptiveVocab` unconditionally, so re-submitting task 1 alone is a complete recovery.
*Decision I am making and recording because the brief does not place the control:* the re-take button
exists on `#/parent` and **nowhere else** — putting "redo the test" in front of an 11-year-old is the
same category of mistake D2 rejects for the band readout. No confirmation dialog: navigating to the
placement intro overwrites nothing until task 1 is actually re-submitted, so a confirm step would buy
no protection and cost a screen.

**PB-4 — the entry-code screen.** It lives in `public/api.js` (not a new module — a new module would
have to join the frozen `PRECACHE`), renders into `document.body`, and is styled by a block appended
to `public/styles.css`. Class names: `entry-gate` (fixed, `inset: 0`, `z-index: 100`, background
`var(--color-bg)`), `entry-gate-card`, `entry-gate-title`, `entry-gate-text`, `entry-gate-input`,
`entry-gate-error`. Frozen Hebrew, verbatim:
- title `כניסה למרפאת הקסמים`
- explanation `כדי לפתוח את האפליקציה צריך קוד כניסה קצר. הקוד נמצא אצל ההורים שלך — מקלידים אותו פעם אחת, והאפליקציה זוכרת אותו.`
- input placeholder `קוד כניסה` (the string the old `window.prompt` used, kept)
- submit button label `כניסה`
- error `הקוד לא נכון. נסי שוב.`
Behaviour, frozen: the gate is a **singleton** — a module-level `entryGate` promise, so the two
parallel 401s that `Promise.all([getJson("/api/placement"), getJson("/api/profile")])` in
`public/views/placement.js` produces open **one** screen, not two. Submitting an empty/whitespace
value does nothing and leaves the screen up. A non-empty value is trimmed, written to
`localStorage["appCode"]` (same key, same `try/catch`), the overlay is removed, the promise resolves,
and every waiting request retries. **Retry is unlimited** and the error line is shown on every
attempt after the first — the current one-shot `allowRetry` budget is deleted. Each retry needs a
human tap, so this cannot become a hot loop.

**PB-5 — one cache bump.** `public/sw.js` line 1 becomes `const CACHE = "magic-vet-v8";` and
`tests/shell.test.js` line 58 becomes `assert.ok(sw.includes('magic-vet-v8'));`. Exactly two changed
lines in each file. `PRECACHE` and its `deepStrictEqual` assertion stay byte-identical. This is the
single bump for the whole phase; no step may bump to `v9`.

**PB-6 — the item-review tool.** `scripts/build-item-review.js` (committed, deterministic, ESM, run
with `node scripts/build-item-review.js`) reads `data/placement-items.json` and writes
`docs/item-bank-review.html` (committed). The HTML is **one self-contained file**: inline `<style>`,
one plain inline `<script>` (**never** `type="module"` — file:// blocks module scripts), no external
fonts, no CDN, no `fetch`. Every asset is referenced relative to `docs/`: pictures as
`../public/assets/placement/<lemma>.webp`, audio as `../public/` + the item's `audio` field. The
emoji→lemma map is derived from the bank at generation time (each item's own `emoji` ↔ `lemma`),
never copied from `public/views/placement.js`. **The output contains no timestamp and no random
value** — two runs must be byte-identical. It never ships under `public/`: `scripts/dev-server.js`
serves only `public/` and Vercel's zero-config output is `public/`, and the file *contains the
correct answers*, which is the second and stronger reason (D4).

**PB-7 — the test ledger.** 157 today. Step 1.1 +2 → 159. Step 1.2 +6 → 165. Step 1.3 +3 → 168.
Step 1.4 +0 → 168. Step 1.5 +4 → 172. Step 1.6 +0 → 172. Every step's validation asserts its own
running total with `grep -qx '# pass <n>'`, so an accidentally-added or accidentally-dropped test
fails the gate that introduced it.

**PB-8 — no new colour.** This phase adds no `:root` token and paints no raw hex anywhere under
`public/`. Every colour it uses is an existing token in a pair `scripts/check-contrast.mjs` already
measures (ink/muted/primary/teal/danger/border on `--color-card`, ink on `--color-surface-2`,
everything on `--color-bg`). The gate stays at 52 pairs and is not edited. `color-mix()` is not used
by any new rule (field-guide lesson 8: it resolves as `color(srgb …)` and is invisible to `rgb()`
regexes).

---

STEP 1.1: placement.js honours a client-side re-take flag
  goal: `public/views/placement.js` restarts at the intro screen when
    `sessionStorage["retakePlacement"] === "1"`, consuming the flag once per `render()` call, and
    still resumes normally (`intro` / `task2` / `done`) when the flag is absent. No API change, no
    new or changed user-visible string.
  files: `public/views/placement.js`, `tests/placement-ui.test.js` — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const RETAKE_KEY = "retakePlacement";' public/views/placement.js \
  && grep -qF -- 'function consumeRetakeFlag()' public/views/placement.js \
  && grep -qF -- 'sessionStorage.getItem(RETAKE_KEY) === "1"' public/views/placement.js \
  && grep -qF -- 'sessionStorage.removeItem(RETAKE_KEY);' public/views/placement.js \
  && grep -qF -- 'const retake = consumeRetakeFlag();' public/views/placement.js \
  && grep -qF -- 'stage = retake ? "intro" : resumeStage(profile);' public/views/placement.js \
  && grep -qF -- 'function resumeStage(profile) {' public/views/placement.js \
  && ! grep -qF -- '"retake"' public/views/placement.js \
  && ! grep -qF -- '"reset"' public/views/placement.js \
  && [ "$(grep -c 'action: "submit"' public/views/placement.js)" = "2" ] \
  && node --check public/views/placement.js \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 159' \
  && node scripts/check-contrast.mjs > /dev/null \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "2" ] \
  && echo STEP-1.1-OK
```
  contracts:
    - PB-3.
    - **Edit 1** — immediately after the existing `import { getJson, postJson } from "../api.js";`
      line, add exactly:
```js

const RETAKE_KEY = "retakePlacement";
```
    - **Edit 2** — immediately BEFORE the existing `function resumeStage(profile) {`, add exactly:
```js
function consumeRetakeFlag() {
  try {
    if (sessionStorage.getItem(RETAKE_KEY) === "1") {
      sessionStorage.removeItem(RETAKE_KEY);
      return true;
    }
  } catch {
    /* private mode — no re-take flag */
  }
  return false;
}

```
    - **Edit 3** — `resumeStage` itself is NOT modified. Inside `export async function render(...)`,
      immediately after the existing line `const answers = { task1: [], task2: {} };`, add:
```js
  const retake = consumeRetakeFlag();
```
      and inside `boot()`, the existing line `stage = resumeStage(profile);` becomes exactly:
```js
      stage = retake ? "intro" : resumeStage(profile);
```
      (Consuming in `render()` scope rather than inside `resumeStage` is deliberate: the error
      screen's `נסי שוב` button calls `boot()` again, and the re-take must survive that retry.)
    - **Edit 4** — append exactly **two** tests to the END of `tests/placement-ui.test.js`, same
      style as the existing ones (they already have `src`/`viewPath` in scope patterns to copy):
      1. `'placement.js restarts at the intro when the re-take flag is set'` — reads the source and
         asserts it contains, each as a separate `assert.ok(src.includes(...))`:
         `const RETAKE_KEY = "retakePlacement";`, `sessionStorage.getItem(RETAKE_KEY) === "1"`,
         `sessionStorage.removeItem(RETAKE_KEY);`, `const retake = consumeRetakeFlag();`, and
         `stage = retake ? "intro" : resumeStage(profile);`.
      2. `'placement.js adds no new API action for the re-take'` — asserts the source contains
         `"submit"` and asserts `!src.includes('"retake"')` and `!src.includes('"reset"')`.
  non-goals: do not add a re-take button, link or any other UI to this view — the control lives on
    `#/parent` (PB-3) and step 1.2 owns it; do not change or remove ANY of the 15 Hebrew strings
    `tests/placement-ui.test.js` freezes; do not touch `api/placement.js`, `lib/placement.js` or
    `tests/api-placement.test.js` (D3); do not modify `resumeStage`'s body; do not use
    `localStorage` for the flag; do not add a "start over" affordance to `renderDone()`; do not touch
    `public/sw.js` (step 1.4 owns the bump); do not reformat the file.
  tier: WORKER
  depends on: nothing (baseline `89e6600`, clean tree)

STEP 1.2: the owner-only `#/parent` view and its route
  goal: `#/parent` renders a read-only owner screen showing her vocabulary band and what it unlocks,
    both placement task scores, the date the placement was taken, and her word-bank count — plus the
    re-take button that sets the PB-3 flag. The route is absent from the tab bar and from every link
    in `public/index.html`, and the view is loaded lazily so `PRECACHE` need not change.
  files: `public/views/parent.js` (NEW), `public/app.js`, `tests/parent-ui.test.js` (NEW) — and
    nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const OWNER_ROUTE = "/parent";' public/app.js \
  && grep -qF -- 'if (hash === OWNER_ROUTE) return OWNER_ROUTE;' public/app.js \
  && grep -qF -- 'import("./views/parent.js")' public/app.js \
  && grep -qF -- 'לא הצלחתי לטעון את תצוגת ההורים. צריך חיבור לאינטרנט.' public/app.js \
  && ! grep -qF -- 'href="#/parent"' public/index.html \
  && ! grep -qF -- 'data-route="/parent"' public/index.html \
  && grep -qF -- 'export async function render(container, ctx)' public/views/parent.js \
  && grep -qF -- 'מה האפליקציה יודעת עליה' public/views/parent.js \
  && grep -qF -- 'תצוגת הורים' public/views/parent.js \
  && grep -qF -- 'רמת אוצר המילים' public/views/parent.js \
  && grep -qF -- 'A2 — הסיפורים נבנים מ-2850 מילים.' public/views/parent.js \
  && grep -qF -- 'A1 — הסיפורים נבנים מ-1257 מילים.' public/views/parent.js \
  && grep -qF -- 'preA1 — הסיפורים נבנים מ-296 מילים.' public/views/parent.js \
  && grep -qF -- 'משימה 1 — מילים ותמונות' public/views/parent.js \
  && grep -qF -- 'משימה 2 — הבנת הנקרא' public/views/parent.js \
  && grep -qF -- 'נעשה בתאריך' public/views/parent.js \
  && grep -qF -- 'אוצר המילים שלה' public/views/parent.js \
  && grep -qF -- 'מבחן מיון מחדש' public/views/parent.js \
  && grep -qF -- 'תצוגה זו נועדה להורה בלבד ואינה מופיעה בתפריט של האפליקציה.' public/views/parent.js \
  && grep -qF -- 'sessionStorage.setItem(RETAKE_KEY, "1");' public/views/parent.js \
  && grep -qF -- 'location.hash = "#/placement";' public/views/parent.js \
  && ! grep -qF -- 'postJson' public/views/parent.js \
  && ! grep -qF -- 'color-mix' public/views/parent.js \
  && ! grep -q '#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]' public/views/parent.js \
  && node --check public/views/parent.js \
  && node --check public/app.js \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 165' \
  && C="$(node scripts/check-contrast.mjs)" \
  && printf '%s\n' "$C" | tail -1 | grep -qx 'ALL PASS' \
  && [ "$(printf '%s\n' "$C" | grep -c '^PASS')" = "52" ] \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "3" ] \
  && echo STEP-1.2-OK
```
  contracts:
    - PB-1, PB-2, PB-2a, PB-3, PB-8.
    - **`public/app.js`, edit 1** — after the existing `const ROUTES = { … };` block and before
      `const DEFAULT_ROUTE = "/home";`, insert exactly:
```js
const OWNER_ROUTE = "/parent";
```
    - **`public/app.js`, edit 2** — `currentRoute()` becomes exactly:
```js
function currentRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === OWNER_ROUTE) return OWNER_ROUTE;
  return ROUTES[hash] ? hash : DEFAULT_ROUTE;
}
```
    - **`public/app.js`, edit 3** — `renderRoute()` becomes exactly:
```js
function renderRoute() {
  const route = currentRoute();
  const app = document.getElementById("app");
  app.innerHTML = "";
  setActiveTab(route);
  if (route === OWNER_ROUTE) {
    import("./views/parent.js")
      .then((mod) => mod.render(app, {}))
      .catch(() => {
        app.textContent = "לא הצלחתי לטעון את תצוגת ההורים. צריך חיבור לאינטרנט.";
      });
    return;
  }
  const view = ROUTES[route];
  view(app, {});
}
```
      (`setActiveTab` moves above the view call; it only touches `.nav-tab` elements, which live in
      `index.html` outside `#app`, so the order is behaviourally identical. On `/parent` it simply
      clears every tab's active state, which is the desired result.)
    - **`public/views/parent.js`** — structured exactly like `public/views/words.js`: a
      `const VIEW_STYLE = \`…\`` template, a `header(subtitle, title)` helper producing
      `<header class="app-header"><p class="greeting">…</p><h1 class="app-title">…</h1></header>`, a
      `styleTag()` helper, and `export async function render(container, ctx)` that paints
      `${styleTag()}${header("תצוגת הורים", "מה האפליקציה יודעת עליה")}<p class="card-subtitle">טוען...</p>`,
      then `await getJson("/api/profile")` (import `{ getJson }` from `"../api.js"` — **only**
      `getJson`), and on `catch` paints the same header plus
      `<p class="card-subtitle">משהו השתבש, נסי שוב.</p>`. On success it paints the four `.card`
      blocks and the footer note of PB-2, in that order, then binds one listener on
      `[data-action="retake"]` whose handler is exactly:
```js
      try {
        sessionStorage.setItem(RETAKE_KEY, "1");
      } catch {
        /* private mode — the re-take flag just will not persist */
      }
      location.hash = "#/placement";
```
      with `const RETAKE_KEY = "retakePlacement";` at module scope.
    - **`VIEW_STYLE` is exactly these five rules** (every colour a token, no `color-mix`, no hex,
      no `background-image`):
```css
  .parent-band {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-teal);
    margin-bottom: 6px;
  }

  .parent-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
  }

  .parent-row + .parent-row {
    border-top: 1px solid var(--color-border);
  }

  .parent-label {
    color: var(--color-muted);
    font-size: 0.95rem;
  }

  .parent-value {
    font-weight: 700;
    font-size: 1.05rem;
  }

  .parent-note {
    color: var(--color-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }
```
    - **`tests/parent-ui.test.js` (NEW)** — `node:test` + `node:assert`, header block copied from
      `tests/words-ui.test.js` (`__dirname`, `root`, `viewPath`), exactly **six** tests:
      1. `'parent.js passes node --check'` — `spawnSync(process.execPath, ['--check', viewPath])`,
         `status === 0`.
      2. `'parent.js exports render(container, ctx)'` — `assert.match(src, /export\s+(async\s+)?function\s+render/)`.
      3. `'parent.js contains all frozen Hebrew strings'` — the frozen list:
         `תצוגת הורים`, `מה האפליקציה יודעת עליה`, `רמת אוצר המילים`, `טרם נקבעה`,
         `היא עוד לא עשתה את מבחן המיון.`, `מבחן המיון`, `משימה 1 — מילים ותמונות`,
         `משימה 2 — הבנת הנקרא`, `טרם נעשתה`, `נעשה בתאריך`, `אוצר המילים שלה`, `מילים באוסף`,
         `התוצאה לא נראית נכונה?`, `מבחן מיון מחדש`,
         `תצוגה זו נועדה להורה בלבד ואינה מופיעה בתפריט של האפליקציה.`, `משהו השתבש, נסי שוב.`,
         `טוען...`.
      4. `'parent.js is read-only and reads the profile fields it promises'` — asserts the source
         contains `/api/profile`, `skills`, `receptiveVocab`, `placement`, `task1`, `task2`, `words`;
         and asserts `!src.includes('postJson')` and `!src.includes('/api/placement')`.
      5. `'the vocabulary sizes parent.js states match buildAllowedSet'` — imports
         `{ buildAllowedSet }` from `../lib/story.js`, parses `data/band1.json` and `data/band2.json`
         with `readFileSync`, builds `{ skills: { receptiveVocab: { band } }, words: {}, learner: {} }`
         for each of `preA1` / `A1` / `A2`, and for each asserts
         ``src.includes(`הסיפורים נבנים מ-${set.size} מילים.`)``.
      6. `'#/parent is routed lazily and is not in the tab bar'` — reads `public/app.js` and
         `public/index.html`; asserts app.js contains `const OWNER_ROUTE = "/parent";` and
         `import("./views/parent.js")`; asserts app.js does NOT contain
         `from "./views/parent.js"` (i.e. no static import); asserts index.html does NOT contain
         `#/parent`.
  non-goals: do not add `/views/parent.js` to `PRECACHE` or touch `public/sw.js` (step 1.4 owns the
    only sw change); do not add a nav tab, a link, or any pointer to `#/parent` anywhere in
    `public/` (D2 — the documentation pointer is step 1.6's job, in `docs/`); do not add a manual
    band override or any control that writes to the profile (D5); do not add a new `:root` token,
    a hex literal, `color-mix`, or a new image (PB-8); do not touch `public/styles.css` (step 1.3
    owns it) or `public/views/placement.js` (step 1.1 owns it); do not add HTML-escaping helpers —
    this view renders only integers, dates and frozen literals; do not show `readingComprehension`'s
    band (only its task-2 score is in scope); do not add a confirmation dialog to the re-take button;
    do not use `window.confirm` or `window.alert`.
  tier: WORKER
  depends on: step 1.1 COMMITTED (the `# pass 165` total and the 3-changed-path count both assume
    step 1.1's two files are already in the tree and clean; and the re-take button is inert until
    1.1's consumer exists).

STEP 1.3: a real entry-code first-run screen, replacing `window.prompt`
  goal: a 401 from any endpoint puts a styled Hebrew screen in front of the learner explaining what
    the code is; a wrong code shows a clear error and she can try again as many times as she needs;
    two parallel 401s open one screen, not two; `window.prompt` is gone from the codebase.
  files: `public/api.js`, `public/styles.css`, `tests/entry-code.test.js` (NEW) — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && ! grep -qF -- 'window.prompt' public/api.js \
  && grep -qF -- 'כניסה למרפאת הקסמים' public/api.js \
  && grep -qF -- 'כדי לפתוח את האפליקציה צריך קוד כניסה קצר. הקוד נמצא אצל ההורים שלך — מקלידים אותו פעם אחת, והאפליקציה זוכרת אותו.' public/api.js \
  && grep -qF -- 'הקוד לא נכון. נסי שוב.' public/api.js \
  && grep -qF -- 'const CODE_KEY = "appCode";' public/api.js \
  && grep -qF -- 'localStorage.setItem(CODE_KEY, code);' public/api.js \
  && grep -qF -- 'let entryGate = null;' public/api.js \
  && grep -qF -- 'if (entryGate) return entryGate;' public/api.js \
  && grep -qF -- 'class="entry-gate-card"' public/api.js \
  && grep -qF -- 'await askForCode(retried);' public/api.js \
  && grep -qF -- 'return request(path, init, true);' public/api.js \
  && ! grep -qF -- 'allowRetry' public/api.js \
  && node --check public/api.js \
  && grep -qF -- '/* ---------- Entry code gate ---------- */' public/styles.css \
  && grep -qF -- '.entry-gate {' public/styles.css \
  && grep -qF -- '.entry-gate-card {' public/styles.css \
  && grep -qF -- '.entry-gate-input {' public/styles.css \
  && grep -qF -- '.entry-gate-error {' public/styles.css \
  && [ "$(grep -c 'z-index: 100;' public/styles.css)" = "1" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 168' \
  && C="$(node scripts/check-contrast.mjs)" \
  && printf '%s\n' "$C" | tail -1 | grep -qx 'ALL PASS' \
  && [ "$(printf '%s\n' "$C" | grep -c '^PASS')" = "52" ] \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "3" ] \
  && echo STEP-1.3-OK
```
  contracts:
    - PB-4, PB-8.
    - **`public/api.js`** — `CODE_KEY`, `storedCode()`, `handleResponse()`, `getJson()` and
      `postJson()` are unchanged. `askForCode()` is replaced wholesale and `request()` gets a new
      third parameter. The replacement is exactly:
```js
const ENTRY_TITLE = "כניסה למרפאת הקסמים";
const ENTRY_TEXT =
  "כדי לפתוח את האפליקציה צריך קוד כניסה קצר. הקוד נמצא אצל ההורים שלך — מקלידים אותו פעם אחת, והאפליקציה זוכרת אותו.";
const ENTRY_PLACEHOLDER = "קוד כניסה";
const ENTRY_SUBMIT = "כניסה";
const ENTRY_ERROR = "הקוד לא נכון. נסי שוב.";

let entryGate = null;

function askForCode(showError) {
  if (entryGate) return entryGate;

  entryGate = new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "entry-gate";
    overlay.innerHTML = `
      <form class="entry-gate-card">
        <h1 class="entry-gate-title">${ENTRY_TITLE}</h1>
        <p class="entry-gate-text">${ENTRY_TEXT}</p>
        <input
          class="entry-gate-input"
          type="text"
          dir="ltr"
          placeholder="${ENTRY_PLACEHOLDER}"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
        <p class="entry-gate-error" role="alert">${showError ? ENTRY_ERROR : ""}</p>
        <button class="btn btn-primary" type="submit">${ENTRY_SUBMIT}</button>
      </form>
    `;
    document.body.appendChild(overlay);

    const form = overlay.querySelector("form");
    const input = overlay.querySelector(".entry-gate-input");
    input.focus();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = input.value.trim();
      if (!code) return;
      try {
        localStorage.setItem(CODE_KEY, code);
      } catch {
        /* private mode — the code just will not persist */
      }
      overlay.remove();
      entryGate = null;
      resolve(code);
    });
  });

  return entryGate;
}

async function request(path, init, retried = false) {
  let response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { ...init.headers, "x-app-code": storedCode() },
    });
  } catch {
    throw new Error("שגיאת רשת");
  }

  if (response.status === 401) {
    await askForCode(retried);
    return request(path, init, true);
  }

  return handleResponse(response);
}
```
    - **`public/styles.css`** — append at the very END of the file, after `.spot-image--sm`, exactly:
```css

/* ---------- Entry code gate ---------- */

.entry-gate {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background-color: var(--color-bg);
}

.entry-gate-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 20px;
  border-radius: var(--radius);
  background: var(--color-card);
  box-shadow: var(--shadow-soft);
}

.entry-gate-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-primary);
}

.entry-gate-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.entry-gate-input {
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  min-height: 52px;
  padding: 0 14px;
  border-radius: var(--radius);
  border: 2px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-ink);
}

.entry-gate-error {
  min-height: 1.2em;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-danger);
}
```
    - **`tests/entry-code.test.js` (NEW)** — `node:test` + `node:assert`, header block in the style
      of `tests/shell.test.js` (`__dirname`, `root`, `publicDir`), exactly **three** tests:
      1. `'api.js passes node --check'`.
      2. `'api.js replaces window.prompt with the entry-code screen'` — asserts
         `!src.includes('window.prompt')` and `!src.includes('allowRetry')`, and asserts the source
         contains each of `כניסה למרפאת הקסמים`, `הקוד לא נכון. נסי שוב.`, `קוד כניסה`, `כניסה`,
         `entry-gate`, `let entryGate = null;`, `if (entryGate) return entryGate;`.
      3. `'the entry-gate styles are token-only and sit at the end of styles.css'` — reads
         `public/styles.css`, finds `const MARKER = '/* ---------- Entry code gate ---------- */'`,
         asserts `css.indexOf(MARKER) !== -1`, slices `const block = css.slice(css.indexOf(MARKER))`,
         asserts `!block.includes('#')` (the PB-8 / VP-1 guard), asserts
         `!block.includes('background-image')` and `!block.includes('color-mix')`, and asserts the
         block contains `.entry-gate {`, `.entry-gate-card {`, `.entry-gate-input {`,
         `.entry-gate-error {` and `z-index: 100;`.
  non-goals: do not create a new module under `public/` (it would have to join the frozen
    `PRECACHE`); do not change `CODE_KEY`, `storedCode`, `handleResponse`, `getJson` or `postJson`;
    do not change the `שגיאת רשת` / `תגובה לא תקינה מהשרת` / `שגיאה בבקשה לשרת` strings; do not add
    a "forget the code" or "change code" control; do not use `type="password"` (she has to see what
    she typed); do not add an `:root` token, a hex literal, `color-mix`, `background-image` or a new
    `z-index` value anywhere; do not insert the CSS block anywhere except the end of the file; do not
    touch `public/sw.js` (step 1.4), `public/app.js` or `public/views/*`.
  tier: WORKER
  depends on: step 1.2 COMMITTED (the `# pass 168` total and the 3-changed-path count assume it).

STEP 1.4: the service-worker cache bump (the one and only bump this phase)
  goal: returning devices fetch the new shell. `CACHE` goes `magic-vet-v7` → `magic-vet-v8` and
    `tests/shell.test.js` asserts the new string. Exactly two changed lines in each file; `PRECACHE`
    byte-identical.
  files: `public/sw.js`, `tests/shell.test.js` — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const CACHE = "magic-vet-v8";' public/sw.js \
  && grep -qF -- "assert.ok(sw.includes('magic-vet-v8'));" tests/shell.test.js \
  && ! grep -rq 'magic-vet-v7' public/ tests/ \
  && [ "$(git diff 89e6600 -- public/sw.js | grep -c '^[+-][^+-]')" = "2" ] \
  && [ "$(git diff 89e6600 -- tests/shell.test.js | grep -c '^[+-][^+-]')" = "2" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 168' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "2" ] \
  && echo STEP-1.4-OK
```
  contracts: PB-5. `public/sw.js` line 1 becomes `const CACHE = "magic-vet-v8";`.
    `tests/shell.test.js` line 58 becomes `assert.ok(sw.includes('magic-vet-v8'));`. The `PRECACHE`
    array in `public/sw.js` (lines 2–13) and its `deepStrictEqual` assertion in
    `tests/shell.test.js` (lines 60–75) are byte-identical afterwards — that is what the two
    "exactly 2 changed lines" assertions prove.
  non-goals: do not add `/views/parent.js` — or anything else — to `PRECACHE`; do not change the
    install / activate / fetch handlers; do not add any other assertion to `tests/shell.test.js`
    (the new-file assertions live in their own test files precisely so no two steps write this
    file); do not bump to `v9` later in this phase; do not touch `public/manifest.webmanifest` or
    `public/index.html`.
  tier: WORKER
  depends on: steps 1.1, 1.2 and 1.3 all COMMITTED — every `public/` change in this phase must be in
    the tree before the single bump lands. No later step may touch `public/`.

STEP 1.5: the item-bank review tool, generated into `docs/`
  goal: `node scripts/build-item-review.js` deterministically writes `docs/item-bank-review.html`, a
    single self-contained page the owner opens by double-clicking. It plays each of the 6 mp3 clips
    inline, shows all 12 illustrations with their four options and the marked correct answer, prints
    both task-2 texts with all 6 questions and their options, carries a checkbox per item and a
    "checked N of 18" counter, and references every asset as `../public/...`. It never ships under
    `public/`.
  files: `scripts/build-item-review.js` (NEW), `docs/item-bank-review.html` (NEW),
    `tests/item-review.test.js` (NEW) — and nothing else.
  commands: `node scripts/build-item-review.js`
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && node scripts/build-item-review.js \
  && H1="$(md5sum docs/item-bank-review.html | cut -d' ' -f1)" \
  && node scripts/build-item-review.js \
  && H2="$(md5sum docs/item-bank-review.html | cut -d' ' -f1)" \
  && [ "$H1" = "$H2" ] \
  && ! test -e public/item-bank-review.html \
  && grep -qF -- '<!doctype html>' docs/item-bank-review.html \
  && grep -qF -- 'lang="he"' docs/item-bank-review.html \
  && grep -qF -- 'dir="rtl"' docs/item-bank-review.html \
  && ! grep -qF -- 'type="module"' docs/item-bank-review.html \
  && ! grep -qF -- 'http://' docs/item-bank-review.html \
  && ! grep -qF -- 'https://' docs/item-bank-review.html \
  && [ "$(grep -o '<audio' docs/item-bank-review.html | grep -c '')" = "6" ] \
  && [ "$(grep -o '<img' docs/item-bank-review.html | grep -c '')" = "30" ] \
  && [ "$(grep -o 'class="opt correct"' docs/item-bank-review.html | grep -c '')" = "18" ] \
  && [ "$(grep -o 'type="checkbox"' docs/item-bank-review.html | grep -c '')" = "18" ] \
  && grep -qF -- 'מתוך 18' docs/item-bank-review.html \
  && grep -qF -- 'id="review-done"' docs/item-bank-review.html \
  && grep -qF -- '../public/audio/word-pet.mp3' docs/item-bank-review.html \
  && grep -qF -- '../public/assets/placement/steak.webp' docs/item-bank-review.html \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 172' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "3" ] \
  && [ "$(git status --porcelain -- public | grep -c '')" = "0" ] \
  && echo STEP-1.5-OK
```
  contracts:
    - PB-6.
    - **`scripts/build-item-review.js`** — ESM, styled after `scripts/build-icons.js` /
      `scripts/optimize-assets.js`: `__dirname` via `fileURLToPath`, a `main()`, and
      `.catch(err => { console.error(err); process.exit(1); })`. It reads
      `data/placement-items.json` with `readFileSync` + `JSON.parse` (not a JSON import), writes
      `docs/item-bank-review.html` with `writeFileSync`, and logs `wrote docs/item-bank-review.html`.
      It contains an `esc()` helper applying `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`,
      `"` → `&quot;` to every value taken from the bank.
    - **Asset derivation (frozen).** Build `const byEmoji = new Map(bank.task1.map(i => [i.emoji,
      i]))` — verified at plan time to be a total, injective 12-entry map covering every emoji that
      appears as an option. A picture for lemma `L` is `../public/assets/placement/${L}.webp`; an
      audio clip is `../public/${item.audio}` (the bank stores `audio` without a leading slash). Do
      NOT copy `OPT_ART` out of `public/views/placement.js`.
    - **Page structure (frozen).** `<!doctype html>`, `<html lang="he" dir="rtl">`,
      `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      `<title>סקירת מאגר השאלות — מבחן המיון</title>`, one inline `<style>`, one plain inline
      `<script>` (never `type="module"`). Body:
      - `<h1>סקירת מאגר השאלות</h1>`
      - an intro paragraph, verbatim:
        `עברי על כל השאלות: השמיעי כל הקלטה, הביטי בכל תמונה, ובדקי שהתשובה המסומנת ב-✓ היא באמת הנכונה ושאין אפשרות שנייה שיכולה להיות נכונה. סמני כל שאלה שבדקת.`
      - a progress line, verbatim: `נבדקו <span id="review-done">0</span> מתוך 18`
      - `<h2>משימה 1 — מילים ותמונות (12)</h2>` then the 12 items **in bank order**, each an
        `<article class="item" id="<item id>">` containing `<h3><item id> · <lemma> · <he></h3>`,
        a `<p class="kind">` reading `שומעת מילה, בוחרת תמונה` for `audio-to-picture` or
        `רואה תמונה, בוחרת מילה` for `picture-to-word`, then:
        - `audio-to-picture`: `<audio controls preload="none" src="../public/…mp3"></audio>` and a
          `<div class="opts">` of four `<figure>`s in the bank's option order, each with one `<img>`
          (`alt` = that emoji's Hebrew `he`) and a `<figcaption>` holding the option's lemma; the
          option at `correctIndex` has `class="opt correct"` and its caption ends with ` ✓`, the
          other three have `class="opt"`.
        - `picture-to-word`: one `<img class="prompt" …>` for the item's own lemma, then a
          `<div class="opts words">` of four `<span>`s in the bank's option order; the one at
          `correctIndex` has `class="opt correct"` and text `<word> ✓`, the others `class="opt"`.
        - for `t1-04` and `t1-06` only, a `<p class="warn">` immediately after the `<h3>`:
          `t1-04`: `נקודה חלשה ידועה: התמונה עלולה להיקרא כ"סופה" ולא כ"מאוורר". ודאי שהיא מזהה אותה נכון.`
          `t1-06`: `נקודה חלשה ידועה: התמונה נקראת בעיקר כ"אדם מול מחשב", והתרגום "שולחן" עמום.`
        - closing each item: `<label class="check"><input type="checkbox" /> בדקתי</label>`
      - `<h2>משימה 2 — הבנת הנקרא (2 טקסטים, 6 שאלות)</h2>` then the 2 texts in bank order, each an
        `<article class="text" id="<text id>">` with `<h3><text id> · <title></h3>`, the English
        passage in `<p class="english" dir="ltr">`, then its 3 questions, each a
        `<div class="question" id="<question id>">` with `<p class="prompt">`, a `<ul class="opts">`
        of four `<li>`s in bank order (`class="opt correct"` + trailing ` ✓` at `correctIndex`,
        `class="opt"` otherwise), and the same `<label class="check">…בדקתי</label>`.
      - a closing paragraph, verbatim:
        `סיימת? רשמי את האישור בסעיף 6 של docs/item-bank-review.md. הוראות לתיקון פריט נמצאות בסעיף 5 של אותו מסמך.`
      - the inline script, whose entire job is: on `change` of any checkbox, set
        `document.getElementById("review-done").textContent` to the number of checked checkboxes.
    - **Determinism:** no `Date`, no `Math.random`, no `process.env`, no directory listing — the
      output is a pure function of `data/placement-items.json` and the frozen literals above.
    - **`tests/item-review.test.js` (NEW)** — `node:test` + `node:assert`, exactly **four** tests:
      1. `'the review page is a single self-contained rtl html file'` — exists; contains
         `<!doctype html>`, `lang="he"`, `dir="rtl"`; does not contain `type="module"`, `http://`,
         `https://`, `fetch(` or `localStorage`.
      2. `'the review page covers every item, text and question in the bank'` — for every
         `bank.task1[].id`, every `bank.task2[].id` and every question `id`, assert the html contains
         `id="<id>"`; assert exactly 6 `<audio`, exactly 30 `<img`, exactly 18 `type="checkbox"`, and
         that the html contains `מתוך 18`.
      3. `'every asset the review page references exists on disk'` — collect all
         `src="../public/…"` values with a global regex, resolve each against
         `path.join(root, 'docs')`, assert `existsSync` for every one, and assert the **distinct**
         set has exactly 18 members (12 `.webp` + 6 `.mp3`).
      4. `'the review page marks exactly one correct answer per item and question'` — assert exactly
         18 occurrences of `class="opt correct"` (12 task-1 items + 6 task-2 questions), and assert
         every item's `he` string and every question's `prompt` string appears in the html.
  non-goals: do not write anything under `public/` — the page holds the correct answers and must
    never be web-reachable (D4); do not persist the checkboxes (localStorage on `file://` is not
    something this POC will rely on) — the review is one sitting; do not add a sign-off form, a
    print stylesheet, or an "export" button; do not edit `docs/item-bank-review.md` (step 1.6 owns
    it); do not edit `data/placement-items.json` or any mp3/webp (D6 — the item bank is frozen); do
    not add a dependency; do not use `sharp`; do not embed images as data URIs; do not copy `OPT_ART`
    from `public/views/placement.js`; do not hand-edit the generated HTML.
  tier: WORKER
  depends on: step 1.4 COMMITTED (the `# pass 172` total). It touches nothing under `public/`, which
    its own `git status --porcelain -- public` = 0 assertion proves.

STEP 1.6: point the owner-facing docs at the new tool, the new route, and the real test count
  goal: the three documents the owner actually reads state what is true after this phase — the
    review is a few minutes in a browser rather than 30 minutes of opening mp3s, `#/parent` exists
    and how to reach it, and the suite is 172 tests.
  files: `README.md`, `docs/owner-handoff.md`, `docs/item-bank-review.md` — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- '# 172 tests, node:test, no framework' README.md \
  && ! grep -qF -- '# 157 tests' README.md \
  && [ "$(wc -l < README.md)" = "108" ] \
  && grep -qF -- '172 בדיקות' docs/owner-handoff.md \
  && ! grep -qF -- '157 בדיקות' docs/owner-handoff.md \
  && grep -qF -- '## 2א. תצוגת הורים / Parent view' docs/owner-handoff.md \
  && grep -qF -- 'יש מסך שמיועד לך בלבד, ואינו מופיע בתפריט של האפליקציה. כדי להגיע אליו הוסיפי' docs/owner-handoff.md \
  && grep -qF -- 'https://english-app-three-tan.vercel.app/#/parent' docs/owner-handoff.md \
  && grep -qF -- 'המסך מציג את רמת אוצר המילים שנקבעה לה, את התוצאות של שתי משימות המיון, מתי' docs/owner-handoff.md \
  && grep -qF -- 'שגויה, יש במסך כפתור **מבחן מיון מחדש** שמתחיל את המבחן מההתחלה, והתוצאה' docs/owner-handoff.md \
  && grep -qF -- 'בדפדפן (לחיצה כפולה על הקובץ) — הוא מנגן כל הקלטה ומציג כל תמונה ואת כל' docs/owner-handoff.md \
  && ! grep -qF -- '(כ-30 דקות)' docs/owner-handoff.md \
  && [ "$(wc -l < docs/owner-handoff.md)" = "130" ] \
  && grep -qF -- '> **הדרך המהירה:** פתחי את `docs/item-bank-review.html` בדפדפן (לחיצה כפולה על' docs/item-bank-review.md \
  && grep -qF -- '> הוא מכיל את התשובות הנכונות ולכן חייב להישאר מחוץ ל-`public/`.' docs/item-bank-review.md \
  && grep -qF -- 'עם הכלי שלמעלה זה אמור לקחת כמה דקות.' docs/item-bank-review.md \
  && ! grep -qF -- 'זה אמור לקחת כ-30 דקות.' docs/item-bank-review.md \
  && grep -qF -- 'STATUS: REQUIRED-BEFORE-CHILD-USE' docs/item-bank-review.md \
  && grep -qF -- '## 6. Sign-off (אישור)' docs/item-bank-review.md \
  && [ "$(wc -l < docs/item-bank-review.md)" = "96" ] \
  && grep -qF -- '`#/parent` לכתובת של האפליקציה:' docs/owner-handoff.md \
  && grep -qF -- 'המבחן נעשה, וכמה מילים יש באוסף שלה.' docs/owner-handoff.md \
  && grep -qF -- 'שאלות שמיעה' docs/owner-handoff.md \
  && grep -qF -- 'החדשה מחליפה את הקודמת.' docs/owner-handoff.md \
  && grep -qF -- '**חובה** לעבור על כל שאלות המבחן' docs/owner-handoff.md \
  && grep -qF -- '(placement test) בפעם הראשונה.' docs/owner-handoff.md \
  && grep -qF -- 'האפשרויות, כך שהסקירה היא כמה דקות' docs/owner-handoff.md \
  && grep -qF -- 'את האישור עצמו רושמים בסוף' docs/owner-handoff.md \
  && grep -qF -- '> הקובץ). הכלי מנגן כל הקלטה' docs/item-bank-review.md \
  && grep -qF -- '> שבו רושמים את האישור' docs/item-bank-review.md \
  && grep -qF -- '> הכלי נוצר על ידי `node scripts/build-item-review.js`' docs/item-bank-review.md \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 172' \
  && [ "$(git status --porcelain -- docs | grep -c '')" = "2" ] \
  && [ "$(git status --porcelain -- README.md | grep -c '')" = "1" ] \
  && [ "$(git status --porcelain -- public scripts tests lib api data assets | grep -c '')" = "0" ] \
  && echo STEP-1.6-OK
```
  contracts (exact strings; every "before" anchor verified present and every "after" anchor verified
  absent at plan time):
    - **`README.md:60`** — `npm test         # 157 tests, node:test, no framework` becomes
      `npm test         # 172 tests, node:test, no framework`. Leading spaces unchanged. This is the
      file's ONLY edit; it stays at 108 lines.
    - **`docs/owner-handoff.md:75`** — `157 בדיקות` becomes `172 בדיקות`; the rest of the line is
      untouched.
    - **`docs/owner-handoff.md`, lines 29–31** — the three-line paragraph beginning
      `**חובה** לעבור על` is replaced, in full, by exactly these FIVE lines:
```
**חובה** לעבור על כל שאלות המבחן **לפני** שהילדה עושה את מבחן המיון
(placement test) בפעם הראשונה. פתחי את הקובץ `docs/item-bank-review.html`
בדפדפן (לחיצה כפולה על הקובץ) — הוא מנגן כל הקלטה ומציג כל תמונה ואת כל
האפשרויות, כך שהסקירה היא כמה דקות של לחיצות במקום פתיחת קבצי mp3 ידנית.
את האישור עצמו רושמים בסוף `docs/item-bank-review.md` (סעיף 6).
```
    - **`docs/owner-handoff.md`** — insert immediately BEFORE the line
      `## 3. מה לצפות בשבועות הראשונים / First weeks — what to watch` exactly these THIRTEEN lines
      (the last one is blank):
```
## 2א. תצוגת הורים / Parent view

יש מסך שמיועד לך בלבד, ואינו מופיע בתפריט של האפליקציה. כדי להגיע אליו הוסיפי
`#/parent` לכתובת של האפליקציה:

`https://english-app-three-tan.vercel.app/#/parent`

המסך מציג את רמת אוצר המילים שנקבעה לה, את התוצאות של שתי משימות המיון, מתי
המבחן נעשה, וכמה מילים יש באוסף שלה. הרמה נקבעת לפי 12 שאלות בלבד — שש מהן
שאלות שמיעה — ולכן שתי טעויות יכולות להוריד אותה רמה שלמה. אם התוצאה נראית לך
שגויה, יש במסך כפתור **מבחן מיון מחדש** שמתחיל את המבחן מההתחלה, והתוצאה
החדשה מחליפה את הקודמת.

```
      Net: 115 → 130 lines (+2 from the paragraph, +13 from the new section). The `wc -l` assertion
      is the guard against a silent re-wrap that satisfies every content grep.
    - **`docs/item-bank-review.md`** — insert immediately AFTER the blank line that follows
      `**STATUS: REQUIRED-BEFORE-CHILD-USE**` (i.e. before `## 1. What this is (מה זה)`) exactly
      these SEVEN lines (the last one is blank):
```
> **הדרך המהירה:** פתחי את `docs/item-bank-review.html` בדפדפן (לחיצה כפולה על
> הקובץ). הכלי מנגן כל הקלטה ומציג כל תמונה ואת כל האפשרויות, עם תיבת סימון לכל
> שאלה — כמה דקות של לחיצות במקום פתיחת קבצי mp3 ידנית. המסמך הזה נשאר המקום
> שבו רושמים את האישור (סעיף 6) ואת הוראות התיקון (סעיף 5).
> הכלי נוצר על ידי `node scripts/build-item-review.js` ואינו נשלח לאפליקציה —
> הוא מכיל את התשובות הנכונות ולכן חייב להישאר מחוץ ל-`public/`.

```
      and, on the existing single line 7 of §1, replace the trailing sentence
      `זה אמור לקחת כ-30 דקות.` with `עם הכלי שלמעלה זה אמור לקחת כמה דקות.` — the rest of that line
      is untouched and the line count does not change. Net: 89 → 96 lines.
    - Copy every Hebrew block above **byte-for-byte**. Do not retype, reflow, re-wrap or "fix" it.
      The feminine address (`פתחי`, `הוסיפי`, `שימי`) matches both documents' existing voice.
  non-goals: do not touch `design.md` or `docs/visual-design.md` (both FROZEN — this step edits only
    documents that carry no owner-approval header, exactly as the previous run's step 3.1
    established); do not change `docs/item-bank-review.md`'s §5 fix instructions, its §6 sign-off, or
    its per-item tables (the HTML tool does not replace the sign-off); do not remove or soften the
    `STATUS: REQUIRED-BEFORE-CHILD-USE` line — the gate is still open; do not renumber
    `docs/owner-handoff.md`'s sections 3–7; do not touch the production URL, the costs section, the
    privacy section, or the README's prose, structure, status line or repository-layout block; do not
    add a changelog; do not touch `.oplan/`.
  tier: WORKER
  depends on: step 1.5 COMMITTED (the `# pass 172` total is final only after 1.5, and the sentence
    "open `docs/item-bank-review.html`" is only true after 1.5 committed it).

RISKS:
- **A worker "improves" a frozen Hebrew string.** `tests/placement-ui.test.js` freezes 15 of them
  and would fail loudly; the new strings in `parent.js` and `api.js` are frozen by the new test
  files instead. The residual risk is in `docs/` (step 1.6), where greps prove presence but never
  truth or grammar — which is why that step carries `wc -l` guards on both Hebrew files and why the
  auditor should be asked explicitly to check the Hebrew grammar and the feminine voice, as it was
  on the previous run's steps 2.4, 2.7 and 3.1.
- **The three vocabulary integers (296 / 1257 / 2850) go stale.** They are true today and D6 freezes
  the band data, but nothing else stops a future run from changing `buildAllowedSet`. PB-2a's test
  turns that into a red suite instead of a lie on the owner's screen.
- **The dynamic import fails offline** and `#/parent` shows one Hebrew line instead of the view. This
  is the accepted price of not touching `PRECACHE` (`docs/visual-design.md` §8). It would be noticed
  by the owner as "the parent page says it needs internet", which is exactly what it says.
- **The entry gate could loop.** If production ever answers 401 for a reason other than a wrong code,
  the screen returns after every attempt. Each attempt requires a human tap, so it degrades to
  "she cannot get in and the error says the code is wrong" rather than a spinning browser. Noticed
  immediately, by a human, on the first attempt.
- **Two parallel 401s.** `public/views/placement.js` fires `getJson("/api/placement")` and
  `getJson("/api/profile")` inside one `Promise.all`. Without the PB-4 singleton this ships two
  stacked overlays on the child's very first screen. The `let entryGate = null;` /
  `if (entryGate) return entryGate;` pair is load-bearing and both are grepped in step 1.3's gate.
- **`grep` for `parent` in CSS matches `transparent`.** Found the hard way while planning. Every
  validation grep in this plan uses a specific token (`.parent-row`, `"/parent"`, `#/parent`) rather
  than the bare word.
- **An uncommitted predecessor breaks the next gate.** Every step counts changed paths with
  `git status --porcelain`, so the orchestrator must commit each step before dispatching the next.
  This is a procedure rule, not a worker's problem — it is what bit step 1.4 of the previous run's
  Phase 1.
- **Steps that create files need `git add -N` before auditing.** `git status --porcelain` lists them
  as `??` so the counts hold either way, but `git diff` against them is empty until they are
  intent-to-add. No validation in this plan runs `git diff` against a new file.
- **`npm test` must be run as `npm test`** (field-guide lesson 3 — it runs under cmd.exe, not Git
  Bash). Every gate here does. Verified at plan time: the suite writes nothing — `.data/` was still
  empty and the tree still clean immediately after a full run.

BLOCKERS:
1. **The `REQUIRED-BEFORE-CHILD-USE` item-bank gate is an OWNER action, and nothing in the record
   says when it happens relative to the deploy.** Expected in `.oplan/poc-basics/brief.md` (which
   commissions the *tool* under scoping answer 2 and D4, but never says who runs it or when) and in
   `design.md` §4/§8 (which say only "reviewed by the owner before the child ever sees it").
   Phase 1 delivers the tool; it cannot deliver the sign-off. So the run needs an owner decision:
   does Phase 2 deploy before the review (the app is live but the owner has not signed), or is the
   review a gate on Phase 2? I am not inventing an answer. What I can say mechanically: deploying
   does not put the test in front of the child by itself — she has to open the app — so the two are
   separable, but `docs/item-bank-review.md` still says `STATUS: REQUIRED-BEFORE-CHILD-USE` and step
   1.6 deliberately leaves that line standing.
2. **Nothing in the record says whether the owner wants the `#/parent` URL written into
   `docs/owner-handoff.md`.** Expected in `.oplan/poc-basics/brief.md` under D2, which says the route
   is "reachable by URL" but not where that URL is written down. I have planned step 1.6 to write it
   there, because a route nobody can find delivers nothing and `docs/owner-handoff.md` carries no
   FROZEN header (the same reasoning the previous run's step 3.1 used). Flagging it rather than
   burying it: this is the one place in the phase where I extended the brief's letter to serve its
   intent, and it is one grep-able line to undo.

RECORD GAPS:
- **`.oplan/poc-basics/` contains only `brief.md`, `design.md` and `field-guide/index.md`.** There is
  no `journal.md`, no `phase-state.md` and no `STATUS.md`, which oplan §5 expects a run to carry.
  Worked around by writing every load-bearing fact into this plan's FROZEN CONTRACTS section rather
  than assuming a journal will hold it; the orchestrator should open the journal before dispatching
  step 1.1.
- **The brief's base commit is `e4c5885`, but HEAD is `89e6600`** (the commit that added the brief
  itself). Every delta assertion in this plan is written against `89e6600`, which is the actual tree
  state, and I have said so explicitly rather than silently substituting it.
- **No record of the current production deployment id/url for this run.** The previous run's journal
  records `dpl_GqmhGP47ksHp7CbYEFRGVm3bA9E2` / `https://english-msi6365hc-dkreinovs-projects.vercel.app`
  as what went live at commit `00a100c`, but that is a different run's ledger and this workspace has
  no deployment ledger of its own. Phase 2 must re-establish the rollback target with
  `vercel inspect` **before** deploying (DP-4 / field-guide lesson 13) rather than inheriting that
  number. Not needed by Phase 1; recorded so Phase 2 does not inherit a stale id.
- **`docs/item-bank-review.md` still describes the task-1 options as emoji** (`🐕`, `🌀`, `🧑‍💻`),
  but `README.md` records that they were replaced by illustrations, and `public/views/placement.js`
  renders `public/assets/placement/*.webp`. The document has been describing something the child
  never sees. Step 1.5's HTML tool shows the real illustrations, and step 1.6's two weak-spot
  warnings are re-worded to talk about *the picture* rather than *the emoji* — but the `.md`'s own
  12-row emoji table is deliberately left alone (rewriting it is not in scope and would fight the
  new tool for the same job). Worth a line in the journal so the next run knows the table is stale
  by design, not by accident.
- **Nothing states what the app should do if `sessionStorage` is unavailable.** I decided it
  (PB-3: degrade to "no re-take", exactly as `public/api.js` already degrades on `localStorage`
  failure) rather than leave it for a worker to hit.

---

# PHASE 2 — deploy so she can start

Drafted by a fresh PLANNER-tier planner from the written record alone (it was forbidden to run any
`vercel` command, since recording the rollback target is itself a step of the phase), then reviewed
and amended by the orchestrator. The Phase 2 SKELETON above is **superseded by this section**.

## Orchestrator amendments to the planner's draft

**BLOCKER 1 — ANSWERED: fix the stale emoji bullets, and fix them BEFORE the deploy.**
The planner found that `docs/owner-handoff.md:35-40` still tells the owner to watch
``t1-06 desk → 🧑‍💻`` and ``t1-04 fan → 🌀`` — options the child has not seen since illustrations
replaced the emoji in a previous run. Verified by me, and it is worse than stale: step 1.6 rewrote
the paragraph three lines above it to send the owner to `docs/item-bank-review.html`, whose frozen
warnings say `נקודה חלשה ידועה: התמונה…` ("the picture"). The section now contradicts the tool it
points at, in the one document the owner opens to perform the gate that stands between this deploy
and her daughter's first session. `plan.md:1077` *asserts* the re-wording happened; no step contract
carried it and no gate checked it. That is a defect in MY Phase 1 planning, not the worker's.

It is in scope by the skeleton's own words ("Correct any owner-facing doc that Phase 1 made false…
re-check rather than assume"), so it becomes **step 2.1**, before the deploy. The planner correctly
refused to invent the Hebrew; composing it is the orchestrator's job (hard rule 2), and I have.
The replacement reuses the two warning sentences that already exist **verbatim in the generated
tool**, so the two documents cannot disagree — and step 2.1's gate proves that derivation
mechanically rather than trusting my eye.

**RECORD GAP REPAIRED — the deploy recipe is field-guide lesson 13, not 12.** `plan.md:89`,
`plan.md:1072`, `phase-state.md:62` and `brief.md:93` all cite "lesson 12"; in the current 44-line
guide lesson 12 is the under-scoped-packet lesson and **13** is the deploy recipe. All four
citations corrected. A stale pointer in the record is exactly the bug class this machinery exists to
kill, and it is a number, not a decision — correcting it re-opens nothing.

**RECORD GAPS ACKNOWLEDGED AND DEFERRED, NOT FIXED** (each is real; none is this phase's job, and a
deploy phase is the wrong place to widen scope): `README.md:108` says "Live and in daily use by its
one intended user", which has been false for this whole run's premise and becomes true only after the
owner completes step 2.9's two actions; `README.md`'s repository-layout block no longer mentions
`scripts/build-item-review.js`. Both were explicitly excluded by step 1.6's non-goals, so both are
deliberate omissions rather than oversights. Added to DEFERRED in `phase-state.md`.

**AMENDMENT B — every step of this phase is ORCHESTRATOR-RUN, and step 2.1 is audited.**
I re-derived this rather than inheriting the predecessor's amendment A. Steps 2.2-2.9 create or
modify no repo file: a worker would return an empty diff with nothing for an auditor to read, I
re-run every frozen gate myself for acceptance regardless, and 2.4/2.5 hand a live production target
and an irreversible call to a cheap model in a clean context for zero added verification. Step 2.1
*does* produce a diff — but it is a 6-line splice from a file I prepared, so dispatching a worker to
run `sed` would be ceremony. What genuinely pays there is the **auditor**, which caught a fluent
false sentence in an owner-facing document on the previous run and verified Hebrew grammar and
feminine voice in step 1.6. So 2.1 is orchestrator-run and **audited**: I keep the layer that catches
things and drop the layer that would only retype. Logged, per §12, because a departure nobody can see
is how procedures rot.

GOAL: `https://english-app-three-tan.vercel.app` serves the Phase-1 build (`magic-vet-v8`, the
`#/parent` view, the entry-code screen, the re-take flag), proven file-by-file against the worktree
rather than assumed; the rollback target is written down BEFORE the deploy call and is the only way
back; and `docs/item-bank-review.html`, which contains the correct answers, is proven by live 404 to
be unreachable from the internet. The learner's profile is never contacted, no browser is opened
against production, and no OpenAI credit is spent. The owner is handed, in order, the two actions
that remain hers: sign the item-bank gate, then give the child the entry code.

ACCEPTANCE CRITERIA: (frozen before execution)
1. `STEP-2.1-OK` … `STEP-2.9-OK` all print. 2.4 is a BEFORE-state gate and is accepted at the step —
   it cannot be re-run after 2.5 by construction (see the step); every other gate is re-runnable and
   is re-run by me at the close.
2. `npm test` prints `# pass 172` / `# fail 0`; `node scripts/check-contrast.mjs` exits 0, last line
   `ALL PASS`, `grep -c '^PASS'` = 52.
3. `git status --porcelain -- . ':!.oplan'` is empty, and
   `git diff --name-only 89e6600..HEAD -- . ':!.oplan'` is EXACTLY the same 16 paths Phase 1 froze —
   this phase adds no repo path and removes none (step 2.1 edits a file already in the list).
4. Seven live files md5-identical to the **worktree**: `sw.js`, `styles.css`, `app.js`, `api.js`,
   `views/parent.js`, `views/placement.js`, `manifest.webmanifest`; live `/sw.js` contains
   `const CACHE = "magic-vet-v8";`; `/` answers 200 and `/index.html` answers 308.
5. `GET /api/health` returns exactly `{"ok":true,"data":{"status":"up","version":1}}`;
   `POST /api/chapter {"action":"ping"}` with no code header returns **401** with `"ok":false`;
   `GET /api/placement` returns 401.
6. D4 proven live: `/item-bank-review.html`, `/item-bank-review`, `/docs/item-bank-review.html`,
   `/docs/item-bank-review`, `/docs/item-bank-review.md` and `/data/placement-items.json` ALL 404.
7. The profile was never contacted: the string `/api/profile` appears in ZERO of this phase's fenced
   command blocks (grep the fenced blocks only, and **with the leading slash** — that slash is
   load-bearing; without it `api/profile.js` as a git pathspec fabricates a false alarm, as it did on
   the previous run); `.data/profile.json` does not exist; `git diff --name-only 89e6600..HEAD --
   api lib data assets` is empty.
8. No `vercel env` command and no `{"action":"generate"}` body appears in any fenced command block of
   this phase (`grep -c` = 0 for both), and no browser tool was invoked against production.
9. `phase-state.md` carries a DEPLOYMENT LEDGER with the outgoing id + url + what it served + the
   incoming commit, recorded before the deploy, AND the incoming id + url + alias + commit;
   `STATUS.md` no longer contains `needs your go-ahead` or `Nothing is live yet`, and states the two
   remaining owner actions in order.

DEPENDS ON: the 16-path change set at HEAD `053da30` (journal.md:286, re-measured by me and by the
planner); `magic-vet-v8` already landed as PB-5's single bump — no step here may bump to v9; 172
tests / 0 fail; `docs/item-bank-review.html` at md5 `a1bda284e0650be197eda983eef05310`, byte-identical
to what the committed generator writes; and the owner's go-ahead, recorded in `phase-state.md`.

SKELETON CHANGES:
1. The skeleton's "re-check the owner-facing docs" produced a real finding, not a no-op — it is now
   step 2.1 (see BLOCKER 1) plus the re-check in 2.2.
2. The skeleton's single "record the rollback target, then deploy" becomes **two** steps (2.4, 2.5).
   One step cannot prove its own internal ordering, and a half-failure inside it could deploy with no
   recorded way back. This is a deliberate strengthening of the predecessor's step 3.3.
3. The D4 probe is its own step (2.8) and also probes the **extensionless** forms, which the skeleton
   does not name: with `cleanUrls: true` a bare `.html` probe is not by itself a complete proof.

---

STEP 2.1: the owner-handoff's two weak-item bullets describe the picture, not a retired emoji
  goal: `docs/owner-handoff.md` §2 stops telling the owner to watch two emoji the child never sees,
    and says what the review tool she is being sent to actually shows — using the tool's own warning
    sentences, so the two documents cannot disagree. The file stays 130 lines, so every other frozen
    assertion in the record survives untouched.
  files: `docs/owner-handoff.md` — and nothing else.
  commands: a 6-for-6 line splice of lines 35-40 from a prepared file in the scratchpad
    (NEVER the repo root — field-guide lesson 1).
  validation: (pure ASCII; both Hebrew sentences are DERIVED AT RUNTIME from the generated tool,
    so no Hebrew literal appears anywhere in this command — field-guide lesson 11)
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && [ "$(wc -l < docs/owner-handoff.md)" = "130" ] \
  && [ "$(sed -n '35,40p' docs/owner-handoff.md | md5sum | cut -d' ' -f1)" = "9fb11afabed401f82356b35b0004f01f" ] \
  && ! LC_ALL=C grep -q $'\xf0\x9f' docs/owner-handoff.md \
  && grep -qF -- '- **`t1-06` desk** —' docs/owner-handoff.md \
  && grep -qF -- '- **`t1-04` fan** —' docs/owner-handoff.md \
  && W1="$(grep -o 'class="warn">[^<]*' docs/item-bank-review.html | sed -n '1s/^class="warn">[^:]*: //p')" \
  && W2="$(grep -o 'class="warn">[^<]*' docs/item-bank-review.html | sed -n '2s/^class="warn">[^:]*: //p')" \
  && [ -n "$W1" ] && [ -n "$W2" ] \
  && grep -qF -- "${W1%%. *}." docs/owner-handoff.md \
  && grep -qF -- "$W2" docs/owner-handoff.md \
  && grep -qF -- 'docs/item-bank-review.html' docs/owner-handoff.md \
  && grep -qF -- 'docs/item-bank-review.md' docs/owner-handoff.md \
  && [ "$(git status --porcelain -- . ':!.oplan' | grep -c '')" = "1" ] \
  && [ "$(git status --porcelain -- docs/owner-handoff.md | grep -c '')" = "1" ] \
  && echo STEP-2.1-OK
```
  contracts:
    - **The frozen replacement for lines 35-40** (exactly six lines, md5
      `9fb11afabed401f82356b35b0004f01f`):
```
שימי לב במיוחד לשני פריטים חלשים שזוהו מראש. הכלי מסמן את שניהם בכיתוב
**נקודה חלשה ידועה** ליד התמונה עצמה:

- **`t1-06` desk** — התמונה נקראת בעיקר כ"אדם מול מחשב", והתרגום "שולחן" עמום.
- **`t1-04` fan** — התמונה עלולה להיקרא כ"סופה" ולא כ"מאוורר". ודאי מול הבת
  שלך שהיא אכן מזהה אותה נכון.
```
    - **Derivation, not invention.** The `t1-06` sentence is the tool's second `<p class="warn">`
      verbatim; the `t1-04` bullet's first sentence is the tool's first `<p class="warn">` first
      sentence verbatim. Both were confirmed byte-identical against `docs/item-bank-review.html`
      BEFORE this plan was written, with `grep -qF` and the file as the source — never retyped from
      terminal output. The gate above re-proves it at acceptance time.
    - `ודאי` (single vav) matches the tool's spelling; the retired bullet used `וודאי`. Feminine
      imperative throughout (`שימי`, `ודאי`), matching both documents' existing voice.
    - The two retired emoji are the ONLY 4-byte (`F0 9F…`) sequences in the file — measured, which is
      what makes the `LC_ALL=C grep` a precise gate rather than a guess. The 12-row emoji table in
      `docs/item-bank-review.md` is deliberately NOT touched (it is stale by design, plan.md:1074).
  non-goals: do not renumber or restructure §2; do not touch the paragraph above (step 1.6's frozen
    five lines) or the `הוראות תיקון` line below; do not touch `docs/item-bank-review.md`, its emoji
    table, its `STATUS: REQUIRED-BEFORE-CHILD-USE` header or its §6 sign-off; do not touch `README.md`
    (its two stale lines are DEFERRED above, not this step's job); do not touch `design.md` or
    `docs/visual-design.md` (FROZEN); do not change the file's line count; do not deploy; do not
    regenerate the HTML tool.
  tier: ORCHESTRATOR-RUN, then AUDITED (amendment B) — the splice is mechanical, the Hebrew is not.
  depends on: nothing (HEAD `053da30`).

STEP 2.2: re-check that the owner-facing docs describe the code that is about to ship
  goal: every mechanically-checkable claim the three owner-facing documents make about this build is
    true of the tree about to be uploaded — the parent route exists in the code, the entry-code screen
    replaced `window.prompt`, the review tool they point at is exactly what the committed generator
    produces, and the item-bank gate is still open.
  files: `docs/item-bank-review.html` — rewritten byte-identically by the generator; the gate proves
    the tree stays clean. This step EDITS no document: if an assertion fails, STOP and report.
  commands: `node scripts/build-item-review.js`
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- '# 172 tests, node:test, no framework' README.md \
  && [ "$(grep -c '172' README.md)" = "1" ] \
  && [ "$(wc -l < README.md)" = "108" ] \
  && [ "$(grep -c '172' docs/owner-handoff.md)" = "1" ] \
  && [ "$(wc -l < docs/owner-handoff.md)" = "130" ] \
  && [ "$(wc -l < docs/item-bank-review.md)" = "96" ] \
  && grep -qF -- 'https://english-app-three-tan.vercel.app/#/parent' docs/owner-handoff.md \
  && grep -qF -- 'const OWNER_ROUTE = "/parent";' public/app.js \
  && grep -qF -- 'import("./views/parent.js")' public/app.js \
  && ! grep -qF -- '#/parent' public/index.html \
  && grep -qF -- 'scripts/build-item-review.js' docs/item-bank-review.md \
  && grep -qF -- 'STATUS: REQUIRED-BEFORE-CHILD-USE' docs/item-bank-review.md \
  && ! grep -qF -- 'window.prompt' public/api.js \
  && grep -qF -- 'localStorage.setItem(CODE_KEY, code);' public/api.js \
  && node scripts/build-item-review.js > /dev/null \
  && [ "$(md5sum docs/item-bank-review.html | cut -d' ' -f1)" = "a1bda284e0650be197eda983eef05310" ] \
  && [ "$(git status --porcelain -- . ':!.oplan' | grep -c '')" = "0" ] \
  && echo STEP-2.2-OK
```
  contracts: the three owner-facing documents are `README.md`, `docs/owner-handoff.md`,
    `docs/item-bank-review.md`; `design.md` and `docs/visual-design.md` are FROZEN and out of scope.
    Frozen line counts 108 / 130 / 96. Frozen tool md5 `a1bda284e0650be197eda983eef05310`.
    Regenerating must leave the tree clean — that is the proof the committed HTML is exactly what the
    committed generator writes. Count checks are `grep -c` equalities, never `! grep -q '<number>'`
    (field-guide lesson 6).
  non-goals: do not edit any document; do not hand-edit the generated HTML; do not run `npm test`
    (2.3 owns it); do not deploy; do not curl anything.
  tier: ORCHESTRATOR-RUN — creates no file, produces no diff.
  depends on: 2.1 accepted and COMMITTED.

STEP 2.3: pre-deploy gate — the tree is green and is EXACTLY the intended change set
  goal: prove, immediately before the irreversible call, that what will be uploaded is the Phase-1
    change set and nothing else, that it is fully green, that the single cache bump is in place, and
    that nothing under `api/ lib/ data/ assets/` moved (D3 and the profile-storage path).
  files: none — this step creates and modifies no file.
  commands: `npm test`, `node scripts/check-contrast.mjs` (both read-only; the suite writes nothing,
    verified in Phase 1).
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 172' \
  && C="$(node scripts/check-contrast.mjs)" \
  && printf '%s\n' "$C" | tail -1 | grep -qx 'ALL PASS' \
  && [ "$(printf '%s\n' "$C" | grep -c '^PASS')" = "52" ] \
  && [ "$(git status --porcelain -- . ':!.oplan' | grep -c '')" = "0" ] \
  && [ "$(git diff --name-only 89e6600..HEAD -- . ':!.oplan' | tr '\n' ' ')" = "README.md docs/item-bank-review.html docs/item-bank-review.md docs/owner-handoff.md public/api.js public/app.js public/styles.css public/sw.js public/views/parent.js public/views/placement.js scripts/build-item-review.js tests/entry-code.test.js tests/item-review.test.js tests/parent-ui.test.js tests/placement-ui.test.js tests/shell.test.js " ] \
  && [ "$(git diff --name-only 89e6600..HEAD -- api lib data assets | grep -c '')" = "0" ] \
  && [ "$(git diff --name-only 89e6600..HEAD -- public | grep -c '')" = "6" ] \
  && grep -qF -- 'const CACHE = "magic-vet-v8";' public/sw.js \
  && ! grep -rq 'magic-vet-v7' public/ tests/ \
  && [ ! -e public/item-bank-review.html ] \
  && [ ! -e .data/profile.json ] \
  && echo STEP-2.3-OK
```
  contracts: the 16-path delta string is git's own output order, measured against `89e6600..HEAD`.
    The `':!.oplan'` exclusion is load-bearing — my own checkpoints land between these steps and must
    not break a deploy gate (this is a deliberate difference from Phase 1's gates, which counted
    uncommitted paths and therefore required a commit between every step). Baseline is `89e6600`, not
    the brief's stale `e4c5885`. `magic-vet-v8` is terminal for this phase.
  non-goals: do not run `npm ci` or `npm install` — Vercel installs during its own build, and
    rebuilding `node_modules` here (sharp, behind corporate TLS) can only turn a green tree red; do
    not deploy; do not start a server; do not create, stage, delete or commit any file; do not touch
    `.data/` even to create it; do not read `.env`; do not curl anything.
  tier: ORCHESTRATOR-RUN — zero files; the deliverable IS the exit code.
  depends on: 2.2 green.

STEP 2.4: record the rollback target BEFORE the deploy call
  goal: the outgoing production deployment's id, url, what it serves and the commit this deploy ships
    are written into the record — the only way back — and it is proven that production does not
    already serve `magic-vet-v8`.
  files: `.oplan/poc-basics/phase-state.md`, `.oplan/poc-basics/journal.md`. Raw `vercel inspect`
    output goes to the scratchpad, NEVER the repo root (field-guide lesson 1 — the predecessor dirtied
    its own gate with a `p3.tmp` in the root).
  commands:
    1. `"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app > "$SCRATCH/inspect-outgoing.txt" 2>&1`
       (vercel writes to stderr; capture all of it).
    2. read what production serves now, and `git rev-parse HEAD`.
    3. write the frozen ledger block below into `phase-state.md` (replacing the
       `DEPLOYMENT LEDGER: EMPTY for this run` paragraph) and append it to `journal.md`.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && U=https://english-app-three-tan.vercel.app \
  && P=.oplan/poc-basics/phase-state.md \
  && S="$(curl --ssl-no-revoke -sf "$U/sw.js" | sed -n 's/^const CACHE = "\(.*\)";$/\1/p')" \
  && [ -n "$S" ] \
  && [ "$S" != "magic-vet-v8" ] \
  && grep -qF -- 'ROLLBACK TARGET (recorded BEFORE the deploy call' "$P" \
  && grep -qE -- '^ *outgoing id = dpl_[A-Za-z0-9]{16,}$' "$P" \
  && grep -qE -- '^ *outgoing url = https://[a-z0-9-]+\.vercel\.app$' "$P" \
  && grep -qF -- "outgoing serves = $S" "$P" \
  && grep -qE -- '^ *outgoing created = .+$' "$P" \
  && grep -qE -- '^ *incoming commit = [0-9a-f]{40}$' "$P" \
  && grep -qF -- 'rollback command = ' "$P" \
  && [ "$(git rev-parse HEAD)" = "$(sed -n 's/^ *incoming commit = \([0-9a-f]\{40\}\)$/\1/p' "$P" | head -1)" ] \
  && ID="$(sed -n 's/^ *outgoing id = \(dpl_[A-Za-z0-9]*\)$/\1/p' "$P" | head -1)" \
  && grep -qF -- "$ID" .oplan/poc-basics/journal.md \
  && echo STEP-2.4-OK
```
  contracts:
    - Canonical URL is `https://english-app-three-tan.vercel.app` (DP-1). Deployment-specific
      `*-dkreinovs-projects.vercel.app` urls sit behind a Vercel login and are never shared.
    - **The frozen ledger block** — these key names, one space either side of `=`, four-space indent:
```
  ROLLBACK TARGET (recorded BEFORE the deploy call — field-guide lesson 13 / DP-4)
    outgoing id = dpl_<from vercel inspect>
    outgoing url = https://<from vercel inspect>.vercel.app
    outgoing serves = magic-vet-v<what production answers right now>
    outgoing created = <the created line from vercel inspect, verbatim>
    incoming commit = <the 40-char sha of HEAD at this moment>
    rollback command = "$(npm prefix -g)/vercel" rollback <outgoing url> --yes
```
    - **The recorded value wins** over anything predicted (DP-4). `phase-state.md` deliberately opened
      this run with an EMPTY ledger and forbids inheriting the predecessor's
      `dpl_GqmhGP47ksHp7CbYEFRGVm3bA9E2`. If the inspect returns that id, that is a fact to record,
      not a value to assume.
    - `[ "$S" != "magic-vet-v8" ]` is a PREMISE check: if production already serves v8 then a deploy
      has already happened and the phase must stop and re-establish what is live before touching
      anything. `public/sw.js` is LF on disk (measured), so the `sed` anchor holds.
  non-goals: do not run `vercel deploy` in this step; no `vercel env`, `link`, `project`, `alias` or
    `rollback`; do not request any `/api/*` path; do not write inspect output anywhere inside the
    repo; do not edit any repo file outside `.oplan/`.
  tier: ORCHESTRATOR-RUN — writes my own record and runs a credentialed CLI against production.
  **RE-RUNNABILITY:** a BEFORE-state gate. Its `!= magic-vet-v8` assertion is false by construction
    once 2.5 has run, so it is accepted at the step and NOT re-run at the phase close — the same
    design Phase 1 used and logged for its changed-path gates. Acceptance criterion 1 records this.
  depends on: 2.3 green.

STEP 2.5: the production deploy (IRREVERSIBLE, RUNS ONCE)
  goal: the canonical alias serves the Phase-1 build.
  files: `.oplan/poc-basics/journal.md` (incoming id/url/commit appended immediately after the call).
    CLI output to the scratchpad, never the repo root.
  commands, in this exact order, from the repo root:
    1. `"$(npm prefix -g)/vercel" deploy --prod --yes`
    2. record the `Production:` url the CLI prints, then `vercel inspect` it and append
       `incoming id` / `incoming url` / `incoming commit` / `deployed at` to the journal.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && U=https://english-app-three-tan.vercel.app \
  && [ "$(curl --ssl-no-revoke -s -o /dev/null -w '%{http_code}' "$U/")" = "200" ] \
  && curl --ssl-no-revoke -sf "$U/sw.js" | grep -qF -- 'const CACHE = "magic-vet-v8";' \
  && echo STEP-2.5-OK
```
  contracts:
    - The command is exactly `"$(npm prefix -g)/vercel" deploy --prod --yes` (field-guide lesson 13;
      npm's global bin is off PATH on this machine, lesson 1).
    - `vercel deploy` uploads the **working tree**, not a commit. That is why 2.3 asserts the tree is
      clean outside `.oplan/`, and why every md5 comparison later is against the worktree (DP-2).
    - Deploy only from the tree 2.3 gated, at the commit 2.4 recorded. If an `.oplan/` checkpoint
      commit lands between 2.4 and 2.5, re-record `incoming commit` first — the ledger must name the
      sha that actually shipped.
  **UN-RE-RUNNABLE. If it half-fails:**
    - CLI error / build failure → the alias does not move → the gate fails on the `v8` grep. Do NOT
      re-run the deploy blindly: read the captured output, fix the cause, deploy again as a conscious
      decision, and log both attempts.
    - Deploy succeeds but a LATER step (2.6/2.7/2.8) fails → roll back with the recorded target:
      `"$(npm prefix -g)/vercel" rollback <outgoing url> --yes`, then re-run this gate and expect the
      OLD cache string. The 2.4 record is the only input to that command.
    - The gate itself is pure `curl` and is safely re-runnable at the phase close.
  non-goals: no `vercel env` of any kind — `APP_CODE`, `OPENAI_API_KEY` and `BLOB_READ_WRITE_TOKEN`
    are neither read, written nor echoed; no `vercel.json` edit, no `.vercelignore`, no `link` /
    `project` / `alias` / domain change, no preview deploy, no `git push`; no browser opened against
    production; no `/api/*` request here (2.7 owns it); do not add `-L` or `--compressed` to any curl.
  tier: ORCHESTRATOR-RUN — an irreversible, outward-facing call that re-points the app the child uses.
  depends on: 2.4 green (the rollback target must exist on disk before this runs).

STEP 2.6: verify the live shell byte-for-byte against the worktree
  goal: every static file the browser consumes on production is byte-identical to the repo's, the new
    `views/parent.js` really shipped, and the shell is served at `/` as cleanUrls requires.
  files: none.
  commands: none beyond the frozen validation.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && U=https://english-app-three-tan.vercel.app \
  && for f in sw.js styles.css app.js api.js views/parent.js views/placement.js manifest.webmanifest; do \
       L="$(curl --ssl-no-revoke -sf "$U/$f" | md5sum | cut -d' ' -f1)"; \
       R="$(md5sum "public/$f" | cut -d' ' -f1)"; \
       [ "$L" = "$R" ] || { echo "MISMATCH $f live=$L local=$R"; exit 1; }; \
     done \
  && curl --ssl-no-revoke -sf "$U/sw.js" | grep -qF -- 'const CACHE = "magic-vet-v8";' \
  && [ "$(curl --ssl-no-revoke -s -o /dev/null -w '%{http_code}' "$U/index.html")" = "308" ] \
  && [ "$(curl --ssl-no-revoke -s -o /dev/null -w '%{http_code}' "$U/")" = "200" ] \
  && curl --ssl-no-revoke -sf "$U/" | grep -qF -- '<link rel="apple-touch-icon" href="/icons/icon-192.png" />' \
  && echo STEP-2.6-OK
```
  contracts:
    - DP-2: live bytes are compared to the WORKTREE, never to a `git show` blob — `public/index.html`
      is CRLF on disk and LF in git, so a blob comparison fails on a perfectly correct deploy. A false
      alarm mid-deploy is the worst possible false alarm.
    - DP-3: the shell is fetched as `/`; `/index.html` answers 308 under `{"cleanUrls": true}` and is
      asserted explicitly, so a cleanUrls change fails loudly instead of silently.
    - `index.html` is checked by content anchor, not md5 — it is the one file whose line endings
      differ between representations.
    - The seven md5'd files are the six `public/` files this phase ships plus `manifest.webmanifest`.
  non-goals: never request `/api/profile` (DP-5, field-guide lesson 7 — that GET CREATES a profile);
    no `/api/*` request at all here (2.7 owns it); do not open a browser; do not add `--compressed`
    or `-L` to any curl — both change the bytes or follow the 308 and make the md5 meaningless; on a
    mismatch STOP and report the exact printed line rather than retrying with different flags.
  tier: ORCHESTRATOR-RUN — zero files; live production target.
  depends on: 2.5 green. Independent of 2.7 and 2.8.

STEP 2.7: verify the live API surface and that the entry-code gate is still closed
  goal: the serverless functions are up, the `APP_CODE` gate rejects, and `api/chapter`'s whole
    module graph loads in production — at zero OpenAI cost and with zero profile contact.
  files: none.
  commands: none beyond the frozen validation.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && U=https://english-app-three-tan.vercel.app \
  && H="$(curl --ssl-no-revoke -sf "$U/api/health")" \
  && [ "$H" = '{"ok":true,"data":{"status":"up","version":1}}' ] \
  && B="$(curl --ssl-no-revoke -s -X POST -H 'content-type: application/json' -d '{"action":"ping"}' -w '\n%{http_code}' "$U/api/chapter")" \
  && [ "$(printf '%s\n' "$B" | tail -1)" = "401" ] \
  && printf '%s\n' "$B" | grep -qF -- '"ok":false' \
  && [ "$(curl --ssl-no-revoke -s -o /dev/null -w '%{http_code}' "$U/api/placement")" = "401" ] \
  && echo STEP-2.7-OK
```
  contracts:
    - `GET /api/health` is ungated by design and must return that payload exactly.
    - The `{"action":"ping"}` probe is free and profile-free in BOTH branches: with `APP_CODE` set the
      handler answers 401 before any `loadProfile()`; with it unset the request falls through to
      `action !== 'generate'` → 400, also before any `loadProfile()` and before any `chat()`.
      Asserting **401** and not "401 or 400" is deliberate — a 400 would mean THE PRODUCTION GATE IS
      OPEN, which is a finding, not a pass. Accepting both would hide it.
    - A 5xx would mean a module in the `api/chapter` graph failed to bundle. This reject-path probe is
      the only live proof the function graph loaded, and it costs nothing (field-guide lesson 13).
  non-goals: DP-5 — no request to `/api/profile`, ever, GET or POST, with or without a header; do not
    send an `x-app-code` header; do not read `.env` or echo any secret; **do not POST
    `{"action":"generate"}` to `/api/chapter` under any circumstances** — that spends OpenAI credit
    and writes her profile; do not POST to `/api/placement` or `/api/translate`; do not retry a
    failing assertion with a different body; do not "warm up" the function with extra calls.
  tier: ORCHESTRATOR-RUN — zero files; live production target.
  depends on: 2.5 green. Independent of 2.6 and 2.8.

STEP 2.8: prove D4 live — the answers are not on the internet
  goal: the item-review tool and the item bank are unreachable from production, mechanically, in every
    form the routing could expose them.
  files: none.
  commands: none beyond the frozen validation.
  validation:
**AMENDED DURING EXECUTION — the original gate's premise was factually wrong. Logged in journal.md.**
The original asserted a bare 404 on all six paths and reasoned that "a 308 would mean the file is
being served". It is not: `cleanUrls: true` 308-redirects EVERY `*.html` request unconditionally,
proven by a control (`/definitely-not-a-real-file-xyz.html` also 308s). The replacement below is
strictly STRONGER — it follows every redirect to its terminus and adds a content-leak check — which
is the only condition under which rewriting a frozen gate after a failure is legitimate.
```
TMP=<scratchpad>; cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && U=https://english-app-three-tan.vercel.app \
  && CTL="$(curl --ssl-no-revoke -s -o /dev/null -w '%{http_code}' "$U/definitely-not-a-real-file-xyz.html")" \
  && [ "$CTL" = "308" ] \
  && for p in /item-bank-review.html /item-bank-review /docs/item-bank-review.html /docs/item-bank-review /docs/item-bank-review.md /data/placement-items.json; do \
       F="$(curl --ssl-no-revoke -s -L -o "$TMP/probe-body.txt" -w '%{http_code}' "$U$p")"; \
       if [ "$F" != "404" ]; then echo "REACHABLE $p -> $F"; exit 1; fi; \
       if grep -qF -- 'opt correct' "$TMP/probe-body.txt"; then echo "ANSWERS LEAKED at $p"; exit 1; fi; \
       if grep -qF -- 'correctIndex' "$TMP/probe-body.txt"; then echo "BANK LEAKED at $p"; exit 1; fi; \
     done \
  && echo STEP-2.8-OK
```
  contracts:
    - D4 holds by construction — Vercel's zero-config output is `public/` and `scripts/dev-server.js`
      serves only `public/` — but "by construction" is a claim, and this step is the measurement.
      `docs/item-bank-review.html` contains the correct answers to the placement test.
    - **A status code is only evidence next to a control.** The gate asserts that a KNOWN-ABSENT
      `.html` path also 308s; that is what proves the 308 on the real path means nothing. Without the
      control, 308 is unreadable — it is equally consistent with "served" and "absent".
    - The terminus, not the first hop, is what "unreachable" means; and content is checked as well as
      status, so a future config change that actually served the file is caught even if it 404s oddly.
    - `/data/placement-items.json` is the same secret by another route; the predecessor proved the
      equivalent for `/data/band2.json`.
  non-goals: no `/api/*` request here; never `/api/profile`; do not follow redirects (`-L` would turn
    a 308 into a 200 and hide the finding); do not "confirm" a 404 by opening a browser; on any
    non-404 STOP — treat it as a rollback candidate, not a curiosity.
  tier: ORCHESTRATOR-RUN — zero files; live production target.
  depends on: 2.5 green. Independent of 2.6 and 2.7.

STEP 2.9: close the phase in the record and hand the owner the two actions that are hers
  goal: the deployment ledger is complete (outgoing AND incoming), the journal carries the phase
    record and metrics, and `STATUS.md` tells the owner — in order — to open the review tool, sign the
    gate, then give the child the entry code, with no stale line left standing.
  files: `.oplan/poc-basics/phase-state.md`, `.oplan/poc-basics/journal.md`,
    `.oplan/poc-basics/STATUS.md`. No repo file outside `.oplan/`.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && P=.oplan/poc-basics/phase-state.md \
  && S=.oplan/poc-basics/STATUS.md \
  && grep -qE -- '^ *incoming id = dpl_[A-Za-z0-9]{16,}$' "$P" \
  && grep -qE -- '^ *incoming url = https://[a-z0-9-]+\.vercel\.app$' "$P" \
  && grep -qF -- 'incoming alias = https://english-app-three-tan.vercel.app' "$P" \
  && grep -qE -- '^ *incoming commit = [0-9a-f]{40}$' "$P" \
  && grep -qE -- '^ *outgoing id = dpl_[A-Za-z0-9]{16,}$' "$P" \
  && ! grep -qF -- 'DEPLOYMENT LEDGER: EMPTY for this run' "$P" \
  && grep -qF -- 'PHASE 2 CLOSED' .oplan/poc-basics/journal.md \
  && grep -qF -- 'STEP-2.8-OK' .oplan/poc-basics/journal.md \
  && grep -qF -- '1. **Open the review tool and sign the gate**' "$S" \
  && grep -qF -- '2. **Then give her the entry code**' "$S" \
  && grep -qF -- 'https://english-app-three-tan.vercel.app' "$S" \
  && ! grep -qF -- 'needs your go-ahead' "$S" \
  && ! grep -qF -- 'Nothing is live yet' "$S" \
  && [ "$(wc -l < "$S")" -le 60 ] \
  && [ "$(git status --porcelain -- . ':!.oplan' | grep -c '')" = "0" ] \
  && echo STEP-2.9-OK
```
  contracts:
    - **The frozen incoming ledger block**, appended under the rollback target, same key style:
```
  DEPLOYED (poc-basics, phase 2)
    incoming id = dpl_<from vercel inspect on the new deployment>
    incoming url = https://<deployment-specific>.vercel.app
    incoming alias = https://english-app-three-tan.vercel.app
    incoming commit = <40-char sha the tree shipped at>
    deployed at = <the created line from vercel inspect, verbatim>
```
    - **`STATUS.md` must carry these two lines verbatim** under "What I need from you":
```
1. **Open the review tool and sign the gate** — double-click `docs/item-bank-review.html`, then record the sign-off in `docs/item-bank-review.md` section 6.
2. **Then give her the entry code** — the app sits behind the code you hold, so deploying does not put the test in front of her; only handing over the code does.
```
      This is the go-ahead's stated scope: the deploy was authorised; these two actions were not
      delegated and remain the owner's.
    - `STATUS.md` is REWRITTEN in full, not patched — a stale line in STATUS is worse than no STATUS,
      because the owner trusts it. The two negative greps are the staleness gate, and the `<= 60`
      line check is oplan §5's budget, MEASURED not guessed (the predecessor wrote a guessed figure
      into its own journal twice; the only thing that has ever caught it is running `wc -l`).
    - The journal entry records the outgoing and incoming ids, which gates passed first try, the
      auditor's verdict on 2.1, and every deviation from this plan.
  non-goals: do not touch any repo file outside `.oplan/`; do not open Phase 3 planning here; do not
    close the RUN — Phase 3 (the growth design document) is still outstanding; do not deploy again;
    do not run any `vercel` command; do not perform the owner's two actions for her.
  tier: ORCHESTRATOR-RUN — phase metrics, the owner-facing narrative and §12's honesty clause are
    judgement, and no worker has the context.
  depends on: 2.6, 2.7 and 2.8 all green.

RISKS:
- **The deploy succeeds and a verification step fails.** The app is live and possibly wrong. Noticed
  by 2.6/2.7/2.8 within seconds. The response is the recorded rollback, not a second deploy. This is
  the entire reason 2.4 exists as its own step.
- **A live md5 mismatch that is a false alarm.** Compare only to the worktree (DP-2), never add `-L`
  or `--compressed`. Noticed as a `MISMATCH <file>` line; the rule is STOP and report the exact line,
  never retry with different flags until it goes green.
- **The entry-code gate silently disappears in production** — then `/api/chapter` answers 400 instead
  of 401 and her data is open to anyone with the URL. Caught only because 2.7 asserts 401 narrowly.
- **`/api/profile` gets requested by reflex.** It CREATES a profile when absent — a read that writes.
  Mitigated by planning: the string appears in ZERO fenced commands here. Note the predecessor's trap
  — grep with the LEADING SLASH, or `api/profile.js` as a pathspec fabricates a false alarm.
- **Someone opens a browser on production "just to look".** Every view fetches the profile on load,
  so one page load writes her live data. There is no browser step in this phase and no browser tool
  may be pointed at the canonical URL. The only visual confirmation permitted is the owner's own, on
  her own device, after she has the code.
- **An `.oplan/` checkpoint commit lands between 2.4 and 2.5**, making the recorded `incoming commit`
  stale by one. Harmless to the shipped bytes (the tree is identical outside `.oplan/`) but it makes
  the ledger subtly wrong. 2.4 asserts the recorded sha equals HEAD at record time; 2.5's contract
  says re-record if a commit intervenes.
- **The deploy uploads the whole repo**, including `.oplan/` and the tracked `bash.exe.stackdump`,
  because there is no `.vercelignore` and Vercel falls back to `.gitignore`. Nothing outside `public/`
  is served — which is exactly what 2.8 measures. The stackdump is already DEFERRED; this phase
  changes no deploy configuration.
- **My own Hebrew in step 2.1 could be wrong** in a way no grep can see. Mitigated three ways: both
  sentences are DERIVED from the tool's own bytes and re-proved by the gate at acceptance; the file
  stays 130 lines so nothing else moves; and the auditor is asked explicitly to read the Hebrew as
  Hebrew and rule on grammar, feminine voice and consistency with the tool — the same request that
  earned its keep on step 1.6.
