# Plan — word-quiz-reskin run

Single phase. Drafted by a fresh planner (files only) 2026-07-28, reviewed by a fresh plan
reviewer, corrected by the orchestrator (counts clarified, frozen block quoted verbatim per
field-guide #9). Blockers ratified by the orchestrator: **B1 IN** (manifest colours move now),
**B2 OUT** (no `#app::before` paper grain — it would break `tests/entry-code.test.js`, which
forbids `#`/`background-image`/`color-mix` after the entry-gate marker), **B3** canonical URL is
`https://english-app-three-tan.vercel.app`, hard-stop if `vercel inspect` there does not report
outgoing `dpl_Geaj9sXRPP8KSt9uZTBMQnSDFCSr`.

## PHASE 1: Sunrise Parchment re-skin + the two code chores, shipped in one deploy

GOAL: Land chore PACKET 1 (withOpenGate in 6 test files) and PACKET 2 (rename renderChapter's
`stage` shadow), apply the owner-chosen D29 Sunrise Parchment skin (`:root` swap, pinned test
hexes in lockstep, light PWA chrome incl. manifest per B1), bump CACHE v13→v14 once covering all
precached changes (QZ-22), deploy per the frozen recipe, and put it in front of the owner.

### ACCEPTANCE CRITERIA (mechanical, re-runnable from a clean tree)

1. `npm test` → `# tests 282` / `# pass 282` / `# fail 0` — the ledger count must not move.
2. `APP_CODE=dummy npm test` → `# pass 282` / `# fail 0` (baseline at 3c2aefd: 234 pass / 48 fail,
   measured by the planner this session).
3. `node scripts/check-contrast.mjs | grep -c '^PASS'` = 52 AND the script exits 0.
   (Bare `grep -c PASS` returns 53 — never use it; field-guide #7.)
4. `grep -rn 'magic-vet-v13' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan .`
   → empty; `public/sw.js` line 1 = `const CACHE = "magic-vet-v14";`.
5. `awk '/^  function renderChapter\(\) \{/,/^  function draw\(\) \{/' public/views/reader.js |
   grep -n '\bstage\b'` → empty (returns exactly 4 lines at 3c2aefd — a live probe).
6. The 19 CHANGED `:root` declarations (17 colour tokens + `--radius` + `--shadow-soft`) are
   present verbatim in `public/styles.css` (step 1.3's frozen block), `--nav-height`/
   `--transition-fast` survive unchanged, and `tests/background.test.js` pins the 4 new hexes.
7. Phase's total code write set is exactly these 14 files, tree clean (all committed) at close
   [AMENDED: +tests/api-translate.test.js, see step 1.1]:
   tests/api-chapter.test.js tests/api-placement.test.js tests/api-profile-post.test.js
   tests/api-profile-quiz.test.js tests/api-translate.test.js tests/api.test.js
   tests/words-ui.test.js
   public/views/reader.js public/styles.css tests/background.test.js public/index.html
   public/manifest.webmanifest tests/shell.test.js public/sw.js
8. Live after deploy: `/sw.js` contains `magic-vet-v14`; live `/`, `/styles.css`, `/sw.js`
   md5-match the WORKTREE files; `/api/health` returns exactly
   `{"ok":true,"data":{"status":"up","version":1}}`; `/api/chapter` returns 401.
9. NON-MECHANICAL, stated as such (field-guide #1): the owner's own verbatim words after looking
   (step 1.7) — no gate in this repo can see "does the cream look flat".

### DEPENDS ON
- `.oplan/word-quiz-reskin/phase-state.md` — preconditions verified at 3c2aefd (282/0, contrast
  52, live magic-vet-v13 = dpl_Geaj9sXRPP8KSt9uZTBMQnSDFCSr, rollback command).
- `.oplan/word-quiz/night/visual-design-NOTES.md` §3 recipe steps 1/2/4 + OWNER DECISION D29.
- `.oplan/word-quiz/night/visual-design-OPTIONS.html:447-474` (`.pal-c`) — token source,
  re-verified by the orchestrator against the frozen block below.
- `.oplan/word-quiz/night/post-close-chores.md` PACKET 1 + PACKET 2 (all line numbers re-verified
  unchanged at 3c2aefd by the planner; PACKET 3 already done; PACKET 4 no work).
- `.oplan/word-audio/phase-state.md:55-66` — frozen deploy recipe; field-guide #10.

### SKELETON CHANGES (vs the staged RUN SCOPE)
1. `tests/shell.test.js` also needs edits (line 58 pins `magic-vet-v13`; lines 28-29 pin the
   manifest colours) — NOTES.md:127's "only test needing editing" claim is false once the CACHE
   bump and B1 are in scope.
2. `public/manifest.webmanifest` added to scope (B1, ratified IN).
3. Recipe step 3 paper grain OUT (B2) — would fail `tests/entry-code.test.js:30-43`.
4. Packet line numbers: ALL still correct at 3c2aefd (re-verified mechanically).
5. Order: chores BEFORE re-skin — PACKET 2 touches precached `reader.js`, so doing it first lets
   ONE v13→v14 bump cover reader.js + styles.css + index.html + manifest (QZ-22).
6. Two dark-tuned hardcoded shadows survive a `:root`-only swap (`styles.css:181` violet glow,
   `:324` nav `rgba(0,0,0,0.5)`) — deliberately NOT changed; owner-look items in 1.7.
7. Palette pre-proven: unmodified `check-contrast.mjs` vs this exact palette in a throwaway tree
   → 52 PASS / 0 FAIL / ALL PASS / exit 0; ratios reproduce the notes' table (ink/card 14.01,
   title/page 5.99, button 6.09, accent/card 5.92, border/card 4.67; tightest 3.94 border-on-amber-glow).

---

### STEP 1.1: PACKET 1 — withOpenGate in the six unprotected test files  [tier: WORKER]

goal: All six files that call a real API handler through a local `withTempDataDir` also delete
  `APP_CODE` for the duration, so `APP_CODE=dummy npm test` is 282/0 instead of 234/48.
files (modify only): tests/api-chapter.test.js, tests/api-placement.test.js,
  tests/api-profile-post.test.js, tests/api-profile-quiz.test.js, tests/api-translate.test.js,
  tests/api.test.js, tests/words-ui.test.js
  [AMENDED mid-step by the orchestrator, logged in journal: tests/api-translate.test.js added.
  It postdates the chore packet (arrived with phase 6's D28 hint pivot), calls translateHandler
  with no withTempDataDir at all, and owns the 6 residual APP_CODE failures the packet had
  misattributed to "cross-file interference". Its transform is at the TEST level: helper
  inserted verbatim after assertEnvelope's closing `}` (line 43); each of the file's 6 tests
  (the amendment's first wording said "7" — a counting error caught by the auditor) changes
  `test('<name>', async () => {` → `test('<name>', () => withOpenGate(async () => {` and its
  closing `});` → `}));` (tests at lines 45-60, 62-78, 80-89, 91-100, 102-110, 112-121); body
  indentation unchanged.]
commands: none — direct file edits. Fail-first REQUIRED before editing:
  `out=$(APP_CODE=dummy npm test 2>&1)` must contain `# fail 48`; paste the summary line; if not
  48, STOP and report.
validation: bash .oplan/word-quiz-reskin/validate/step-1.1.sh  (frozen; suite 282/0 plain AND
  under APP_CODE=dummy; changed-file set exactly the 6 files; prints CHORE-1-OK)
contracts: the helper VERBATIM (see post-close-chores.md PACKET 1 — reproduced in the packet):
  ```js
  function withOpenGate(fn) {
    const original = process.env.APP_CODE;
    delete process.env.APP_CODE;
    return Promise.resolve()
      .then(fn)
      .finally(() => {
        if (original !== undefined) process.env.APP_CODE = original;
      });
  }
  ```
  Insertion = immediately after the closing `}` of each file's local `withTempDataDir`, as the
  next top-level declaration: api-chapter after line 38 · api-placement after 28 ·
  api-profile-post after 24 · api-profile-quiz after 24 · api after 25 · words-ui after 32.
  Transform: `await withTempDataDir(async () => {` → `await withOpenGate(() => withTempDataDir(async () => {`
  and that call's closing `  });` → `  }));`. Body indentation unchanged.
  Call sites (start–end lines, re-verified at 3c2aefd):
  api-chapter 136-150, 154-172, 176-210, 214-237, 241-249, 253-262, 266-275 (7) ·
  api-placement 83-93, 97-122, 126-145, 149-167, 171-180, 184-193, 197-206, 210-219, 223-231,
  235-251 (10) · api-profile-post 64-76, 80-93, 97-110, 114-123, 127-135, 139-148, 152-161,
  165-173, 177-195, 199-208, 212-221, 225-249, 253-262, 266-274 (14) · api-profile-quiz 75-92,
  96-109, 113-126, 130-145, 149-189 (binds tmpDir), 193-206, 210-257 (binds tmpDir) (7) ·
  api 61-68, 72-82, 86-92 (3) · words-ui 106-114 (1). TOTAL 42.
  tmpDir-binding sites keep the parameter: `withOpenGate(() => withTempDataDir(async (tmpDir) => {`.
non-goals: tests/store.test.js (no handler call) · tests/quiz-experience.test.js,
  tests/quiz-ui.test.js, tests/profile-quiz-scenario.test.js (already correct — the pattern
  source) · anything under lib/, api/, public/ (lib/auth.js is frozen) · adding/removing/renaming
  tests (count stays 282) · refactoring withTempDataDir · exporting/hoisting the helper.
depends on: nothing (first step; clean tree at 3c2aefd).

### STEP 1.2: PACKET 2 — rename renderChapter's local `stage` shadow  [tier: WORKER]

goal: Inside renderChapter() the local variable is `chapterStage`; the view's outer `stage` is
  untouched.
files (modify only): public/views/reader.js
commands: none — direct file edits.
validation: bash .oplan/word-quiz-reskin/validate/step-1.2.sh  (suite 282/0; awk/grep probe over
  renderChapter()..draw() empty; changed set exactly reader.js; prints CHORE-2-OK)
contracts: exactly FOUR lines change, all inside renderChapter() (515-545, re-verified):
  521 `const stage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: lemmas.length });`
      → `const chapterStage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: lemmas.length });`
  522 `const quizHtml = stage === "quiz" ? ...` → `chapterStage === "quiz"`
  523 `const celebrateHtml = stage === "celebrate"` → `chapterStage === "celebrate"`
  526 `const continueHtml = stage === "celebrate"` → `chapterStage === "celebrate"`
  Returned strings ("quiz", "celebrate", ...) do not change.
non-goals: the outer `let stage` (line 322) and its other sites (339, 346, 350, 354, 357, 373,
  549-553, 581, 589) · draw() (547+) · bindEvents() (565+) · afterChapterStage /
  chapterQuizState · any test file — if validation fails because a test references the
  identifier, STOP and report, do not improvise.
depends on: 1.1 committed (the changed-set check demands a clean start).

### STEP 1.3: Sunrise Parchment `:root` swap + the four pinned hexes, in lockstep  [tier: WORKER]

goal: `public/styles.css`'s `:root` is the option-03 column; `tests/background.test.js` pins the
  four new paint hexes; the contrast gate still proves 52/52.
files (modify only): public/styles.css, tests/background.test.js
commands: none — direct file edits.
validation: bash .oplan/word-quiz-reskin/validate/step-1.3.sh  (all 21 :root lines verbatim —
  the 19 changed + the 2 unchanged; 17 old hexes absent from :root; contrast 52 + exit 0; suite
  282/0; changed set exactly the 2 files; prints RESKIN-TOKENS-OK)
contracts: replace `public/styles.css` lines 1-24 (the whole `:root { ... }` block) with EXACTLY
  this — 19 changed declarations (17 colours + --radius + --shadow-soft), 2 unchanged
  (--nav-height, --transition-fast), key order / blank line / two-space indent preserved:
  ```css
  :root {
    --color-primary: #7b3fb5;
    --color-teal: #086055;
    --color-accent: #8a5600;
    --color-bg: #fff4e2;
    --color-ink: #3a2412;
    --radius: 22px;

    --color-primary-ink: #fff6e8;
    --color-muted: #7a5a3c;
    --color-card: #fffaf0;
    --color-surface-2: #fdeed6;
    --color-border: #96682f;
    --color-nav: #fff8ec;
    --color-danger: #b3341c;
    --color-glow: #ffd98a;
    --color-bg-top: #ffe9c9;
    --color-bg-glow-violet: #f3e4fb;
    --color-bg-glow-teal: #dff4ee;
    --color-bg-glow-amber: #ffe4b5;
    --shadow-soft: 0 0 0 1px rgba(150, 104, 47, 0.16), 0 6px 18px rgba(120, 78, 30, 0.13);
    --nav-height: 68px;
    --transition-fast: 150ms ease;
  }
  ```
  (Source: OPTIONS.html:448-466 `.pal-c`, verified by the orchestrator. `--shadow-soft` there
  reads `rgba(150,104,47,.16), 0 6px 18px rgba(120,78,30,.13)` — the value above is IDENTICAL,
  whitespace/leading-zero normalized to this file's house style; copy the block above, not the
  HTML.)
  `tests/background.test.js` lines 14-17 become exactly:
  ```js
    assert.ok(css.includes('--color-bg-top: #ffe9c9;'));
    assert.ok(css.includes('--color-bg-glow-violet: #f3e4fb;'));
    assert.ok(css.includes('--color-bg-glow-teal: #dff4ee;'));
    assert.ok(css.includes('--color-bg-glow-amber: #ffe4b5;'));
  ```
  The gradient-composition assertion (lines 20-30, incl. `assert.ok(!normalized.includes('#'))`)
  is FROZEN — do not touch; `body`'s background-image references tokens by name and is unchanged.
non-goals: nothing outside the `:root` block moves · NO `#app::before` grain (B2; also breaks
  tests/entry-code.test.js) · body's background-image untouched · mask stops (lines 381-398)
  untouched · hardcoded glow :181 and nav shadow :324 untouched (owner-look items) · no
  color-mix() anywhere (fabricates a gate pass) · index.html / sw.js / manifest / other tests
  untouched · no test added or removed.
depends on: 1.2 committed. Content-independent of 1.1/1.2.

### STEP 1.4: light-mode PWA chrome (index.html metas + manifest colours)  [tier: WORKER]

goal: Browser/OS chrome matches a light app: color-scheme light, theme-color #fff8ec, manifest
  splash/theme colours track the new --color-bg / --color-nav.
files (modify only): public/index.html, public/manifest.webmanifest, tests/shell.test.js
commands: none — direct file edits.
validation: bash .oplan/word-quiz-reskin/validate/step-1.4.sh  (4 presence + 2 absence greps;
  suite 282/0; changed set exactly the 3 files; prints RESKIN-CHROME-OK)
contracts:
  public/index.html:7 `<meta name="theme-color" content="#2e1806" />` → `... content="#fff8ec" />`
  public/index.html:8 `<meta name="color-scheme" content="dark" />` → `... content="light" />`
  (4-space indent preserved; file is CRLF on disk — do NOT convert line endings, it breaks the
  deploy md5 check in 1.6.)
  public/manifest.webmanifest: `"background_color": "#241305",` → `"background_color": "#fff4e2",`
  and `"theme_color": "#2e1806",` → `"theme_color": "#fff8ec",` (B1, ratified IN).
  tests/shell.test.js:28-29 → `assert.strictEqual(manifest.background_color, '#fff4e2');` and
  `assert.strictEqual(manifest.theme_color, '#fff8ec');`
non-goals: public/icons/icon.svg and scripts/build-icons.js (the dark plate is an owner-look
  item, not a change) · tests/shell.test.js:58 (CACHE pin — that is 1.5) · no new tests (282) ·
  Rubik font links, manifest name/short_name/dir/lang/icons · styles.css.
depends on: 1.3 committed (manifest colours derive from 1.3's tokens).

### STEP 1.5: CACHE bump magic-vet-v13 → v14 — LAST code change  [tier: WORKER]

goal: SW cache name bumped exactly once, after every precached file this phase touches
  (/, /styles.css, /views/reader.js, /manifest.webmanifest), satisfying QZ-22.
files (modify only): public/sw.js, tests/shell.test.js
commands: none — direct file edits.
validation: bash .oplan/word-quiz-reskin/validate/step-1.5.sh  (sw.js line 1 = v14; repo-wide
  grep: no magic-vet-v13 outside .oplan; shell.test.js pins v14; suite 282/0; changed set exactly
  the 2 files; prints RESKIN-CACHE-OK)
contracts: public/sw.js:1 `const CACHE = "magic-vet-v13";` → `const CACHE = "magic-vet-v14";`
  tests/shell.test.js:58 `assert.ok(sw.includes('magic-vet-v13'));` → `...'magic-vet-v14'...`
  These are the only two occurrences outside .oplan/ (verified). .oplan/ records of v13-as-live
  are historical — never edit them.
non-goals: the PRECACHE array (byte-frozen, QZ-22 + shell.test.js:64-79; no new precached file
  this phase) · fetch/install/activate handlers · any other version value · .oplan/ records.
depends on: 1.3 and 1.4 committed — must be the last code change.

### STEP 1.6: deploy to production per the frozen recipe  [tier: ORCHESTRATOR]

goal: v14 Sunrise Parchment shell live on the canonical alias; outgoing deployment recorded as
  the rollback target BEFORE deploying; live bytes proven to match the worktree.
files: none in the repo. Scratch ONLY outside the repo at $HOME/wqr-deploy/ (Git Bash /tmp is
  not node's; never write scratch into the tree — field-guide #4).
commands (orchestrator's shell, in order):
  1. `"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app 2>&1 | tee $HOME/wqr-deploy/outgoing.txt`
     — HARD STOP if the id is not dpl_Geaj9sXRPP8KSt9uZTBMQnSDFCSr (B3). Record id+url in the
     journal BEFORE deploying.
  2. `"$(npm prefix -g)/vercel" deploy --prod --yes`
  3. curl (--ssl-no-revoke) live `/`, `/styles.css`, `/sw.js`, `/api/health` to FILES in
     $HOME/wqr-deploy; `/api/chapter` status code to a file. (cleanUrls 308s *.html — fetch the
     shell as `/`. Hash FILES, never $(curl ...) output.)
validation: bash .oplan/word-quiz-reskin/validate/step-1.6.sh  (re-fetches live files; md5 vs
  WORKTREE for /, /styles.css, /sw.js; live sw.js contains magic-vet-v14; health payload exact;
  /api/chapter 401; outgoing.txt non-empty; prints DEPLOY-OK)
contracts: vercel is off PATH (`"$(npm prefix -g)/vercel"`) · curl needs --ssl-no-revoke · md5 vs
  worktree, never a git blob (index.html CRLF on disk, LF in git) · rollback (code only):
  `"$(npm prefix -g)/vercel" rollback https://english-d0roovfpq-dkreinovs-projects.vercel.app --yes`
non-goals: NEVER request /api/profile (a GET creates one) · never `vercel env` · never a browser
  on production · never the real APP_CODE in this shell · no .data/ touches · no manual
  alias/promote · no deploy before inspect has recorded the outgoing id.
depends on: 1.1–1.5 committed and green (criteria 1-7).

### STEP 1.7: the owner looks (human gate)  [tier: ORCHESTRATOR]

goal: The owner sees Sunrise Parchment on her real device and says whether it stays; words
  recorded verbatim.
files: journal.md + phase-state.md (record only — no code).
commands: none. Tell the owner: open the app; if it still looks brown, force a reload (the old
  v13 service worker serves the previous shell until v14 activates).
validation: NOT mechanical, deliberately (field-guide #1). Passes when the owner's verbatim
  answer is in the journal. Ask specifically about the five known residues so a "yes" is
  informed: (1) bottom-nav shadow rgba(0,0,0,0.5) on a cream bar (styles.css:324);
  (2) artwork's bottom fade now bleeds into cream (one-number fix if disliked: mask stop
  74%→88%); (3) app icon keeps its dark #2e1806 plate; (4) does the cream look flat without the
  paper grain (B2 OUT); (5) softer card lift (--shadow-soft now low-alpha warm brown).
contracts: approval → record quote, close phase. "Looks wrong but works" → do NOT roll back;
  record the complaint, stop for a decision (each residue is a one-line follow-up needing its own
  v15 bump + deploy). "Broken / can't read it" → roll back immediately (command in 1.6), record.
  Never ask the owner for APP_CODE; never read her profile to "check" anything.
non-goals: fixing anything · re-skinning on a guess · opening production in a browser from here.
depends on: 1.6 (DEPLOY-OK).

### LATER PHASES: none — single phase.

### RISKS
- Token transposition passes the contrast gate — caught by 1.3's verbatim 21-line check + the
  4 pinned literals, which is why 1.3 is line-verbatim, not "gate passes".
- The gate is blind outside `:root` (nav shadow :324, glow :181, mask stops, raw hexes,
  color-mix) — enumerated as 1.7's human-gate questions.
- CRLF: an editor normalizing index.html in 1.4 breaks 1.6's md5 — noted so it isn't debugged
  from scratch.
- Stale SW: owner may see brown until v14 activates → 1.7's force-reload instruction.
- Alias moved → wrong rollback target — B3's hard stop on the expected dpl id.
- Ledger drift: any test-count change fails EVERY later validation — explicit non-goal in all
  worker steps.
- Uncommitted carry-over: each step's changed-set check enforces commit-between-steps.
- APP_CODE: only ever `APP_CODE=dummy` inside validation subshells. Never export the real one.
