# Post-close chores — ready-to-dispatch packets

Written while phase 3's file-boundary gate still forbids code changes. Nothing here has been
applied. Each packet below is copy-paste-ready for a worker dispatch once the gate lifts. All
line numbers and command output were verified against the tree at commit `5db1d10` (2026-07-27);
re-verify line numbers if the file has moved before dispatching.

---

## PACKET 1 — `withOpenGate` consistency across the APP_CODE test harness

### Goal

`lib/auth.js:14-15` opens the auth gate only when `process.env.APP_CODE` is unset/empty. Ten test
files copy-paste a local `withTempDataDir` helper; three of them (`tests/quiz-experience.test.js`,
`tests/quiz-ui.test.js`, `tests/profile-quiz-scenario.test.js`) also wrap every call in a
`withOpenGate` helper that deletes `APP_CODE` for the duration of the call and restores it after.
The other six do not, and they all import a real API handler (`profileHandler`, `chapterHandler`,
`placementHandler`, or `healthHandler`) that runs `isAuthorized(req)`. On any machine that exports
`APP_CODE` (e.g. a deploy/CI shell, or a dev machine configured for the live gate), these six
files 401 instead of testing the handler behaviour they claim to test. `tests/store.test.js` is
NOT affected — it only calls `lib/store.js` functions directly and never goes through a handler,
so it needs no change.

This was recorded as a known, unfixed wart at `.oplan/word-quiz/journal.md:862-865`
("Pre-existing, not introduced here, out of scope to fix now, and written into the field guide so
phase 4 does not rediscover it the hard way.") It was not rediscovered by phase 4 only because
phase 4 added its own three already-protected files rather than touching these six.

Add the same `withOpenGate` helper (verbatim, already proven in three files) to the six
unprotected files, and wrap every `withTempDataDir` call site in it, exactly as
`tests/quiz-experience.test.js` already does.

### The verbatim helper to insert (copy exactly, do not rephrase)

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

Insert it immediately after the closing `}` of each file's local `withTempDataDir` function (i.e.
as the next top-level declaration), matching the order already used in
`tests/quiz-experience.test.js:23-47` (`withTempDataDir` then `withOpenGate`).

### The transform for every call site

Change:
```js
  await withTempDataDir(async () => {
    ...
  });
```
to:
```js
  await withOpenGate(() => withTempDataDir(async () => {
    ...
  }));
```
(For the two call sites that bind a parameter — `withTempDataDir(async (tmpDir) => {` — keep the
parameter: `withOpenGate(() => withTempDataDir(async (tmpDir) => {`.) Only the outermost
`withTempDataDir(...)` call in each test gets wrapped; do not touch anything else.

### Exhaustive file list — insertion point + every call site (start line / end line of the
`});` that must become `}));`)

**`tests/api-chapter.test.js`** — insert helper after line 38 (end of `withTempDataDir`, defined
line 23-38). Wrap call sites: 136-150, 154-172, 176-210, 214-237, 241-249, 253-262, 266-275.
(7 call sites.)

**`tests/api-placement.test.js`** — insert helper after line 28 (`withTempDataDir` defined
13-28). Wrap call sites: 83-93, 97-122, 126-145, 149-167, 171-180, 184-193, 197-206, 210-219,
223-231, 235-251. (10 call sites.)

**`tests/api-profile-post.test.js`** — insert helper after line 24 (`withTempDataDir` defined
9-24). Wrap call sites: 64-76, 80-93, 97-110, 114-123, 127-135, 139-148, 152-161, 165-173,
177-195, 199-208, 212-221, 225-249, 253-262, 266-274. (14 call sites.)

**`tests/api-profile-quiz.test.js`** — insert helper after line 24 (`withTempDataDir` defined
9-24). Wrap call sites: 75-92, 96-109, 113-126, 130-145, 149-189 (this one binds `tmpDir`),
193-206, 210-257 (this one binds `tmpDir`). (7 call sites.)

**`tests/api.test.js`** — insert helper after line 25 (`withTempDataDir` defined 10-25). Wrap call
sites: 61-68, 72-82, 86-92. (3 call sites.)

**`tests/words-ui.test.js`** — insert helper after line 32 (`withTempDataDir` defined 17-32). Wrap
call site: 106-114. (1 call site.)

Total: 6 files, 42 call sites, 6 helper insertions. `tests/store.test.js` is explicitly OUT of
this list — do not touch it (see Non-goals).

### Non-goals

- Do not touch `tests/store.test.js` (no handler call, gate-irrelevant).
- Do not touch `tests/quiz-experience.test.js`, `tests/quiz-ui.test.js`,
  `tests/profile-quiz-scenario.test.js` — already correct, already the source of the pattern.
- Do not touch any file under `lib/`, `api/`, or `public/` — this is a test-harness-only fix.
  `lib/auth.js`'s gate behaviour is correct and frozen; do not change it.
- Do not change the NUMBER of tests. The suite must still report `# tests 282`.
- Do not rename or refactor `withTempDataDir` itself.

### Frozen validation (capture-and-case, run from repo root)

Step 1 — fail-first evidence (run BEFORE making any edit, to prove the bug is real):
```bash
out=$(APP_CODE=dummy npm test 2>&1)
case "$out" in
  *'# fail 48'*) echo "fail-first confirmed: 48 tests 401 under APP_CODE=dummy" ;;
  *) echo "UNEXPECTED: fail-first evidence does not match recorded baseline (# fail 48)"; printf '%s\n' "$out" | tail -20; exit 1 ;;
esac
```
(Verified on this tree just now: plain `npm test` gives `# tests 282 / # pass 282 / # fail 0`;
`APP_CODE=dummy npm test` gives `# tests 282 / # pass 234 / # fail 48`. Per-file breakdown when
run in isolation — `api-chapter.test.js` 7/8 fail, `api-placement.test.js` 10/10,
`api-profile-post.test.js` 14/14, `api-profile-quiz.test.js` 7/7, `api.test.js` 3/5,
`words-ui.test.js` 1/10 — sums to 42; the full-suite run reports 48, six more, evidence of
cross-file interference from the same unguarded env mutation. The full-suite number, 48, is the
one this gate checks — do not substitute the per-file sum.)

Step 2 — after the edit, both of these must pass:
```bash
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: plain run not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: plain run has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac

out2=$(APP_CODE=dummy npm test 2>&1)
case "$out2" in *'# pass 282'*) ;; *) echo "FAIL: APP_CODE=dummy run not 282 pass"; printf '%s\n' "$out2" | tail -20; exit 1 ;; esac
case "$out2" in *'# fail 0'*)   ;; *) echo "FAIL: APP_CODE=dummy run has failures"; printf '%s\n' "$out2" | tail -20; exit 1 ;; esac

echo CHORE-1-OK
```

### Report format

State: (a) the fail-first output from Step 1 (paste the `# tests/# pass/# fail` line), (b) both
Step-2 command outputs, (c) `git status --porcelain -- . ':(exclude).oplan'` to prove only the 6
listed test files changed, (d) confirmation the suite count is still 282, (e) anything read
outside this packet.

---

## PACKET 2 — rename the local `stage` shadow in `reader.js`'s `renderChapter()`

### Goal

`public/views/reader.js:322` declares `let stage = "loading";` as a closure variable inside the
outer `render(container, ctx)` function. `renderChapter()` (defined at line 515, closes at line
545) declares its own `const stage` at line 521, shadowing the outer one for the rest of that
function body. This was flagged by the worker who introduced it and recorded as a known wart —
`.oplan/word-quiz/phase-state.md:34-35`: "KNOWN WART, recorded: renderChapter's local `stage`
shadows the view's outer `stage` (reader.js). Harmless today; a future reader.js edit should
rename one of them." — and again in `.oplan/word-quiz/journal.md:1135-1139`. It is harmless only
because `renderChapter()` currently runs exclusively while the outer `stage === "chapter"`; any
future edit that assigns the outer `stage` from inside `renderChapter()` would silently write to
the local shadow instead. Rename the LOCAL one to `chapterStage` — do not touch the outer `stage`
or any of its other assignment/read sites (lines 322, 339, 346, 350, 354, 357, 373, 549-589, all
of which belong to `render()`'s other inner functions, not to `renderChapter()`).

### Exact lines to change (all four are inside `renderChapter()`, lines 515-545)

`public/views/reader.js:521`
```js
    const stage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: lemmas.length });
```
→
```js
    const chapterStage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: lemmas.length });
```

`public/views/reader.js:522`
```js
    const quizHtml = stage === "quiz" ? `<div class="reader-quiz-slot"></div>` : "";
```
→
```js
    const quizHtml = chapterStage === "quiz" ? `<div class="reader-quiz-slot"></div>` : "";
```

`public/views/reader.js:523`
```js
    const celebrateHtml = stage === "celebrate"
```
→
```js
    const celebrateHtml = chapterStage === "celebrate"
```

`public/views/reader.js:526`
```js
    const continueHtml = stage === "celebrate"
```
→
```js
    const continueHtml = chapterStage === "celebrate"
```

That is the complete set — there is no other bare `stage` reference between line 515 and line 545.

### Non-goals

- Do not rename the outer `let stage` (line 322) or any of its 8 other read/write sites.
- Do not touch `draw()` (547-563) or `bindEvents()` (565+) — they correctly reference the outer
  `stage` and must keep doing so.
- Do not touch `afterChapterStage` or `chapterQuizState` (imported/defined elsewhere) — only the
  local variable name changes, not the function's behaviour or its return values ("quiz",
  "celebrate", etc. stay the same strings).
- Do not change test files as part of this packet — no test asserts on the variable name, only on
  rendered HTML, so none should need editing. If validation fails because a test DOES reference the
  identifier, stop and report rather than improvising a fix.

### Frozen validation (capture-and-case, run from repo root)

```bash
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac

# Proves no bare `stage` reference inside renderChapter() refers to the local shadow any more --
# only `chapterStage` (a distinct identifier; \bstage\b will not match inside it) may appear
# between the function's opening line and the next function (`draw`).
leftover=$(awk '/^  function renderChapter\(\) \{/,/^  function draw\(\) \{/' public/views/reader.js | grep -n '\bstage\b')
if [ -n "$leftover" ]; then
  echo "FAIL: bare 'stage' still present inside renderChapter():"
  echo "$leftover"
  exit 1
fi

changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/views/reader.js " ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }

echo CHORE-2-OK
```
(Verified now, before any edit: the `awk`+`grep` above currently returns exactly 4 lines — the
ones being renamed — confirming the probe finds real matches, not a vacuous pass.)

### Report format

State: (a) the `npm test` pass/fail line, (b) the `leftover` grep output (must be empty), (c) the
`git status --porcelain` line, (d) confirm the outer `stage` in `render()` was not touched (paste
`grep -n "stage" public/views/reader.js` output for lines outside 515-545), (e) anything read
outside this packet.

---

## PACKET 3 — fix the broken deploy-recipe citations

### Goal

The PHASE 2 deploy recipe lives at `.oplan/word-audio/phase-state.md:55-66` (heading "PHASE 2
RECIPE (from the predecessor journals, all still binding):", the `vercel inspect` /
`vercel deploy --prod --yes` / md5-vs-worktree / SW-cache / 401-probe / deploy-size procedure).
Three documents in `.oplan/word-quiz/` instead point readers at `.oplan/word-audio/journal.md`
(or "its journal") for that recipe. `.oplan/word-audio/journal.md` does exist, but it does not
hold the deploy recipe — it holds the truncated-clip defect, the cost overrun, and which frozen
numbers moved (see `.oplan/word-audio/phase-state.md:30-31`, which correctly points to the
journal for THOSE topics only). Anyone following the broken pointers at deploy time lands in the
wrong document. `.oplan/word-quiz/plan.md:1442` already independently flagged this exact defect
("the broken deploy-recipe citation... the recipe lives in
`.oplan/word-audio/phase-state.md:55-66`, NOT that run's journal") but the two citations below it,
and the one in `field-guide/index.md`, were never actually corrected. These are `.oplan/` files,
so they may be edited before the phase gate lifts, but they are packaged here for the close step
per the orchestrator's instruction.

### Exact pointers and corrections (three files, one line each)

**`.oplan/word-quiz/field-guide/index.md:54`**
Current:
```
    outgoing id+url — the only rollback target. Full recipe and rollback: the word-audio journal.
```
Corrected:
```
    outgoing id+url — the only rollback target. Full recipe and rollback:
    .oplan/word-audio/phase-state.md:55-66 (PHASE 2 RECIPE).
```
(Keep within the field guide's existing line-budget style; a two-line wrap is fine since the
current entry is already numbered item 10 in a list — match surrounding indentation.)

**`.oplan/word-quiz/plan.md:1731`**
Current:
```
The recipe in `.oplan/word-audio/journal.md`: record the outgoing deployment via `vercel inspect`
```
Corrected:
```
The recipe in `.oplan/word-audio/phase-state.md:55-66`: record the outgoing deployment via `vercel inspect`
```

**`.oplan/word-quiz/phase-state.md:53`**
Current:
```
PREDECESSOR: .oplan/word-audio/ — its journal holds the deploy recipe + rollback for phase 6.
```
Corrected:
```
PREDECESSOR: .oplan/word-audio/ — its phase-state.md:55-66 holds the deploy recipe + rollback for phase 6.
```

### Non-goals

- Do not touch `.oplan/word-audio/phase-state.md:30` ("JOURNAL: ... read it before phase 2. It
  records the truncated-clip defect...") — that pointer is correct as written; the journal really
  does hold those facts, just not the deploy recipe.
- Do not touch `.oplan/word-quiz/journal.md:70` or `:902` — both are historical narration of past
  events (the age correction, the field-guide eviction that created the broken pointer), not live
  pointers a reader would follow at deploy time. Correcting history would misrepresent what
  actually happened.
- Do not touch `.oplan/word-quiz/plan.md:1442` — it already states the correct location and is
  itself the record of this defect; it is not broken.
- Do not touch any file under `.oplan/word-audio/`.
- No code files are in scope for this packet at all.

### Frozen validation (capture-and-case, run from repo root)

```bash
# 1. the three known-bad phrasings must be GONE
if grep -n "the word-audio journal\." .oplan/word-quiz/field-guide/index.md; then
  echo "FAIL: field-guide/index.md still cites the word-audio journal"; exit 1
fi
if grep -n '`.oplan/word-audio/journal.md`: record the outgoing deployment' .oplan/word-quiz/plan.md; then
  echo "FAIL: plan.md:1731 still cites word-audio/journal.md"; exit 1
fi
if grep -n 'its journal holds the deploy recipe' .oplan/word-quiz/phase-state.md; then
  echo "FAIL: phase-state.md:53 still cites the journal"; exit 1
fi

# 2. the corrected pointer must be PRESENT in all three
for f in .oplan/word-quiz/field-guide/index.md .oplan/word-quiz/plan.md .oplan/word-quiz/phase-state.md; do
  grep -qF 'phase-state.md:55-66' "$f" || { echo "FAIL: $f missing corrected pointer"; exit 1; }
done

out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac

echo CHORE-3-OK
```

### Report format

State: (a) the three `grep -n` proofs-of-absence (each must print nothing / exit the `if` false),
(b) the three `grep -qF` proofs-of-presence, (c) `npm test` pass/fail line, (d)
`git status --porcelain -- . ':(exclude).oplan'` output — note `.oplan/` is excluded from that
filter, so this should print NOTHING for this packet, confirming no code moved.

---

## PACKET 4 — sweep results: other recorded-but-unfixed warts

Searched `.oplan/word-quiz/journal.md` and `.oplan/word-quiz/phase-state.md` for "pre-existing",
"wart", and "out of scope" (case-insensitive). Every hit, with disposition:

| Location | What it records | Disposition |
|---|---|---|
| `journal.md:862-865` | The APP_CODE/`withOpenGate` harness gap (7 of 8 files, at the time, would 401 under an exported `APP_CODE`) | **packet-worthy — this is PACKET 1 above** |
| `phase-state.md:34-35` | `renderChapter`'s local `stage` shadows the outer `stage` | **packet-worthy — this is PACKET 2 above** |
| `journal.md:769-776` | `migrateWordKeys` sorts profile keys on every load and always has (pre-existing); test 7 only proves an already-sorted old-shape profile survives a GET byte-identical, not that no profile is ever rewritten | **ignore** — not a code defect, a scope note about what the closure summary may honestly claim. The narrower claim is already the one on record (journal.md:774-776); nothing to fix in code. |
| `journal.md:70` | The learner's age (9→11) was corrected in five documents including one line of `word-audio/journal.md` | **ignore** — historical narration of a correction already made; not a live pointer or open defect. |
| `journal.md:902` | Field-guide eviction note: "the deploy recipe became a two-line pointer to the word-audio journal" | **ignore for code; the pointer it describes is fixed by PACKET 3.** This line itself is historical narration, not a live pointer — do not edit it. |
| `plan.md:1442` | Names the broken deploy-recipe citation and its correct target | **subsumed by PACKET 3** (this is the record that the pointers at field-guide/index.md:54, plan.md:1731, and phase-state.md:53 needed fixing; it is itself accurate and untouched). |

Two more matches on "deferred" (not one of the three searched terms, but adjacent — noted for
completeness, not part of the requested sweep vocabulary):

| Location | What it records | Disposition |
|---|---|---|
| `phase-state.md:4` | D26 (owner decision): phase 5 (G1/candidate status) is deferred to its own future run | **ignore** — an owner-approved scope decision, not a code wart. Not packet-worthy; would need a fresh planning run, not a chore. |
| `phase-state.md:47` | QZ-13's `growth.md` "nothing ever demotes" line is deliberately deferred to phase 6 | **needs owner** only in the sense that phase 6 already carries it as a stated chore (`plan.md:1724-1726`, "Chores at deploy time"); it is not orphaned, just not yet executed. No new packet needed — it already has a home in phase 6's own plan. |

No other "pre-existing" / "wart" / "out of scope" hits exist in either file beyond the ones
tabulated above.
