# plan — word-write · PHASE 1 in full, phases 2–3 as skeletons

**Design:** `.oplan/word-write/design.md` (frozen) · **Base commit:** `baea2b8`, tree clean
**Baseline ledger:** 433 reported / 428 flat / 0 fail · contrast gate PASS

---

## PHASE 1 — the engine (pure functions only)

**Goal.** Every rule in design §3–§5 exists as a pure, `rand`-threaded function in
`public/quiz-core.js`, with tests that have each been SEEN TO FAIL. **She sees nothing yet** —
no view calls any of it. This phase ships no behaviour change whatsoever.

**Why the engine alone is a phase.** Everything hard about R5 is a decision about correctness
(what counts as a near-miss, which option may be offered, which kind is buildable). All of it is
expressible without a DOM, so all of it can be *executed* in tests rather than read as source —
field guide 15's third habit. Phase 2 then has nothing left to invent.

### Frozen contracts in force for this phase

- **WK-1** kind rotation is a preference; walk from the position, wrap, take the first buildable.
- **WK-2** `he-pick` options come from her own words, excluding same-`he` collisions; fewer than
  3 survivors ⇒ not buildable.
- **WK-4** a near-miss retry is ONE question — exactly one `quiz-answer` per question.
- **WK-5** the ranked list is REORDERED, never truncated.
- **R-W-4** FC-1's byte freeze is lifted. `public/quiz.js` is **still not touched in phase 1** —
  only `quiz-core.js`.
- **D7 / R-W-6** no paid API, no runtime LLM, no network in any of this code.
- **Line endings:** `public/quiz-core.js` is **CRLF** (99 CR bytes). Every edit preserves it.
  Verify with `tr -dc '\r' < f | wc -c`, NEVER with grep (field guide 16).
- **Untouched:** `public/quiz.js`, every view, every existing export's behaviour. All 428 existing
  flat tests keep passing, unmodified.

### Non-goals for every step in this phase

No DOM. No `fetch`. No changes to `public/quiz.js` or any view. No changes to the existing
exports' behaviour. No new Hebrew (that is phase 2). No `CACHE` bump (nothing precached changes
behaviour she can reach — but note `quiz-core.js` IS precached, so **phase 2 owes the bump for
this phase's bytes too**; recorded as obligation W1-1).

---

### Step 1.1 — grading a typed answer

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/typed-answer.test.js` (new file)
- **Goal.** Three new exports, appended to `quiz-core.js`, changing nothing above them:
  - `normalizeTyped(s)` → `String(s ?? '').trim().toLowerCase()`
  - `isNearMiss(typed, answer)` → `true` iff the normalized forms are **not equal** and differ by
    exactly ONE of: insertion, deletion, substitution, **or transposition of two adjacent
    characters** (Damerau-Levenshtein distance exactly 1). Empty typed input is never a near-miss.
  - `gradeTyped(typed, answer, { isRetry = false } = {})` → `'correct'` | `'near-miss'` | `'wrong'`.
    Exact normalized match ⇒ `'correct'`. Else if `isRetry` is true ⇒ `'wrong'`. Else if
    `isNearMiss` ⇒ `'near-miss'`. Else `'wrong'`.
- **The transposition case is the point of this step.** `lgiht` vs `light` is plain-Levenshtein
  distance 2. A correct-looking implementation that omits transposition passes every other test
  in this list and fails the single most common slip a child makes. The test file MUST contain
  that exact pair.
- **New file, deliberately** (field guide 27): these tests stub nothing, but a new file is free
  and keeps them out of reach of any module state an existing file has already set.
- **Frozen validation command:**
  ```bash
  set -o pipefail
  node --test tests/typed-answer.test.js 2>&1 | tail -5
  CR=$(tr -dc '\r' < public/quiz-core.js | wc -c)
  LF=$(tr -dc '\n' < public/quiz-core.js | wc -c)
  [ "$CR" = "$LF" ] || { echo "FAIL: quiz-core.js MIXED endings, CR=$CR LF=$LF"; exit 1; }
  [ "$CR" -ge 99 ] || { echo "FAIL: quiz-core.js shrank, CR=$CR (<99)"; exit 1; }
  node --test tests/ 2>&1 | grep -E '^# (tests|pass|fail)'
  ```
  PASS requires: the new file green; CR count exactly 99; whole suite `fail 0` and
  `tests` ≥ 433 + the new count.
- **Required assertions, each executed** (added at the plan-review gate — this step was the only
  one of the four without an enumerated list, and its untested branches are exactly the ones
  WK-4's retry depends on):
  - `normalizeTyped`: trims both ends, lowercases, and maps `null`/`undefined`/a number to a
    string without throwing.
  - **exact match** returns `'correct'` for: identical input; different case; leading and
    trailing whitespace; all three combined.
  - **transposition**: `isNearMiss('lgiht','light')` is `true`. This exact pair, by name.
  - **one substitution**, **one insertion**, **one deletion** each return `'near-miss'`.
  - **distance 2** (two substitutions) returns `'wrong'`, NOT `'near-miss'`.
  - **empty string** and **whitespace only** return `'wrong'`, never `'near-miss'`, for any answer.
  - **equal strings are never a near-miss**: `isNearMiss(x, x)` is `false`.
  - **`isRetry: true` NEVER returns `'near-miss'`** — swept over every near-miss fixture above,
    asserting each returns `'wrong'`. This is the branch WK-4 rests on: if a retry could return
    `'near-miss'`, phase 2 would loop and could post twice, or never.
  - **symmetry**: `isNearMiss(a,b) === isNearMiss(b,a)` over every fixture pair.
- **Fail-first requirement, THREE controls (each recorded in DEVIATIONS with the failing test
  name):** a test never seen to fail is not evidence (field guide 2).
  1. An `isNearMiss` that omits the transposition branch ⇒ the `lgiht`/`light` assertion FAILS.
  2. A `gradeTyped` that ignores `isRetry` ⇒ the retry sweep FAILS.
  3. An `isNearMiss` that returns `true` for distance 2 ⇒ the distance-2 assertion FAILS.
- **Budgets:** 2 retries, then escalate.

### Step 1.2 — reorder the ranked pool (R3a / WK-5)

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/quiz-sampling.test.js` (new file)
- **Goal.** One new export, appended:
  - `sampleRanked(ranked, count, rand = Math.random)` → a NEW array, same length and same
    membership as `ranked`. Let `slice = Math.min(8, ranked.length)`. Fisher-Yates the first
    `slice` entries (the exact loop already at `quiz-core.js:26-29`), leave the remainder in
    place. Non-array or empty input returns `[]`. `ranked` is never mutated.
- **`pickQuizWords` is NOT modified.** Its ranking and all its existing tests stay byte-untouched;
  the reorder is a separate function applied by the caller in phase 2. This keeps the ranking
  auditable on its own and keeps every existing test honest.
- **Frozen validation command:**
  ```bash
  set -o pipefail
  node --test tests/quiz-sampling.test.js 2>&1 | tail -5
  CR=$(tr -dc '\r' < public/quiz-core.js | wc -c)
  LF=$(tr -dc '\n' < public/quiz-core.js | wc -c)
  [ "$CR" = "$LF" ] || { echo "FAIL: quiz-core.js MIXED endings, CR=$CR LF=$LF"; exit 1; }
  [ "$CR" -ge 99 ] || { echo "FAIL: quiz-core.js shrank, CR=$CR (<99)"; exit 1; }
  node --test tests/ 2>&1 | grep -E '^# (tests|pass|fail)'
  ```
- **Required assertions, each executed:** membership is preserved (sorted equality against the
  input); the input array is unmutated (compare a pre-copy); with 20 ranked entries and a seeded
  `rand`, the first 4 are all drawn from the top 8; over a sweep of seeds, a rank-1 entry appears
  in the first 4 **sometimes and not always** — the whole point of the change, and it must be
  asserted as a range, not a single seed; `length < 8` still returns a full permutation;
  `[]` and non-array return `[]`.
- **Fail-first:** run against a `sampleRanked` that returns `ranked` unchanged and record that the
  "not always first" assertion FAILS.
- **Budgets:** 2 retries, then escalate.

### Step 1.3 — `he-pick` options without the sameness trap (WK-2)

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/he-options.test.js` (new file)
- **Goal.** One new export, appended:
  - `selectHeOptions(answerLemma, words, rand = Math.random, count = 4)` → a shuffled array of
    `count` English lemma strings **including `answerLemma`**, or `null` if it cannot be built.
    `words` is `profile.words`. Rules, in order:
    1. `answerLemma` must be a key of `words` and its `he` must be a non-empty string after
       `trim()`. Otherwise return `null`.
    2. Candidate distractors = every OTHER key of `words` whose own `he` is a non-empty string
       after `trim()` **and is not equal to the answer's `he`** after `trim()`. Equality is exact
       string equality on the trimmed values — no normalisation beyond `trim()`, because Hebrew
       has no case and any cleverer comparison is an invented rule nobody signed off.
    3. If fewer than `count - 1` candidates survive, return `null`.
    4. Fisher-Yates the candidates with `rand`, take `count - 1`, add `answerLemma`, Fisher-Yates
       the result, return it.
- **Why exclusion and not just "different word":** two different English words can be the same
  Hebrew word. Offering both marks her wrong for a right answer — the `light`/`computer` defect
  of the word-finish run, rebuilt in a new place. This is the one rule in the run that removes a
  defect class by construction instead of reviewing for it.
- **Frozen validation command:**
  ```bash
  set -o pipefail
  OUT=$(node --test tests/he-options.test.js 2>&1)
  echo "$OUT" | tail -5
  N=$(echo "$OUT" | sed -n 's/.*OBSERVED_DRAWS=\([0-9]*\).*/\1/p' | head -1)
  [ -n "$N" ] || { echo "FAIL: the sweep never printed OBSERVED_DRAWS"; exit 1; }
  [ "$N" -ge 200 ] || { echo "FAIL: sweep observed only $N draws, expected >=200"; exit 1; }
  CR=$(tr -dc '\r' < public/quiz-core.js | wc -c)
  LF=$(tr -dc '\n' < public/quiz-core.js | wc -c)
  [ "$CR" = "$LF" ] || { echo "FAIL: quiz-core.js MIXED endings, CR=$CR LF=$LF"; exit 1; }
  [ "$CR" -ge 99 ] || { echo "FAIL: quiz-core.js shrank, CR=$CR (<99)"; exit 1; }
  node --test tests/ 2>&1 | grep -E '^# (tests|pass|fail)'
  ```
  **The `OBSERVED_DRAWS` parse is not decoration.** Field guide 18: a sweep that inspects nothing
  reports "0 violations", which is byte-identical to success. The count is now MECHANICALLY
  required, not requested in prose — the plan reviewer's finding was that a worker could simply
  not print it and nothing would notice.
- **Required assertions, each executed:** a fixture where two keys share one `he` value NEVER
  yields both — swept over ≥200 seeds, asserting 0 violations AND printing
  `OBSERVED_DRAWS=<n>` where `n` counts the draws actually performed; the answer is
  present in every returned array; `null` when the answer has no `he`; `null` when the answer is
  absent from `words`; `null` when too few candidates survive the exclusion; output length is
  exactly `count`; no duplicates; `words` is never mutated.
- **HEBREW IN THE TEST FILE:** the fixtures use `\uXXXX` escapes ONLY, never a raw glyph
  (field guide 8). Two distinct Hebrew values and one deliberate collision are enough; they are
  invented strings, not hers.
- **Fail-first:** run against a version that omits the `he`-equality exclusion and record that the
  collision sweep FAILS.
- **Budgets:** 2 retries, then escalate.

### Step 1.4 — which kind to ask (WK-1)

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/question-kind.test.js` (new file)
- **Goal.** Two new exports, appended:
  - `QUESTION_KINDS` — the frozen array
    `['cloze-pick', 'he-pick', 'he-type', 'listen-type']`, in that order.
  - `chooseKind(position, avail)` where `avail` is
    `{ clozePick: bool, hePick: bool, heType: bool, listenType: bool }` → the kind string, or
    `null` if none is available. Start at `QUESTION_KINDS[position % 4]` (a negative or
    non-integer `position` is treated as 0), walk forward with wraparound over all four, and
    return the FIRST whose flag is true.
- **`chooseKind` decides nothing about buildability itself** — the caller measures availability
  and passes flags. A pure function that reaches out to a manifest or a profile is a function
  that cannot be tested at its seam.
- **Frozen validation command:**
  ```bash
  set -o pipefail
  node --test tests/question-kind.test.js 2>&1 | tail -5
  CR=$(tr -dc '\r' < public/quiz-core.js | wc -c)
  LF=$(tr -dc '\n' < public/quiz-core.js | wc -c)
  [ "$CR" = "$LF" ] || { echo "FAIL: quiz-core.js MIXED endings, CR=$CR LF=$LF"; exit 1; }
  [ "$CR" -ge 99 ] || { echo "FAIL: quiz-core.js shrank, CR=$CR (<99)"; exit 1; }
  node --test tests/ 2>&1 | grep -E '^# (tests|pass|fail)'
  ```
- **Required assertions, each executed:** with all four available, positions 0..3 yield the four
  kinds **each exactly once** (this is design criterion 1, asserted directly); positions 4..7
  repeat that; every single-kind-unavailable case falls through to the next in order; the
  all-false case returns `null`; a wrap from position 3 reaches `cloze-pick`; `position` of `-1`,
  `1.5` and `undefined` are all treated as 0 and return a valid kind rather than throwing.
- **Fail-first:** run against a `chooseKind` that does not wrap (returns `null` at the end of the
  array) and record that the wrap assertion FAILS.
- **Budgets:** 2 retries, then escalate.

---

### PHASE 1 ACCEPTANCE CRITERIA (written before any executor exists)

Each is a command with a pass/fail outcome. All are re-run by the ORCHESTRATOR at the gate.

1. `node --test tests/ 2>&1 | grep -E '^# (pass|fail)'` ⇒ `fail 0`, and `pass` ≥ 433 + the four
   new files' test counts, with the exact ledger recorded in `phase-state.md`.
2. `tr -dc '\r' < public/quiz-core.js | wc -c` **equals** `tr -dc '\n' < public/quiz-core.js | wc -c`
   and is `>= 99`. **NOT a fixed count.** The file is 99 lines with CR=99 and LF=99 today, so every
   append raises both; a pin on `99` would have failed all four steps. The property is "no LF-only
   line was introduced into a CRLF file", which is `CR == LF` (field guide 16 — and field guide 9:
   a frozen validation can itself be the bug).
3. `git diff baea2b8 --name-only -- public/ tests/` lists **exactly** `public/quiz-core.js` and
   the four new test files — no view, and **not `public/quiz.js`**.
4. `md5sum public/quiz.js` ⇒ still `69b6d71117cf776715374abc6f0abb02` (FC-1's freeze is lifted but
   phase 1 does not spend it).
5. Every one of the four steps recorded a fail-first observation in `journal.md`. A step whose
   test was never seen to fail is not accepted.
6. `git diff baea2b8 -- public/quiz-core.js` shows **only appended lines** — the existing exports
   are byte-unchanged. Verified by extracting the first 99 lines of the new file and byte-
   comparing them against the same range at `baea2b8`.
7. Nothing under `public/views/` or `public/quiz.js` is imported by the new tests, and no test
   opens a network connection.

---

## PHASE 2 — the screen (skeleton; planned in full at the phase-1 gate)

**What we do.** `public/quiz.js` learns to render the four kinds: the typed input with the frozen
WK-3 attribute set, the near-miss retry state that keeps her text, and the Hebrew prompt. The five
Hebrew strings are EXTRACTED BY SCRIPT from design §6's md5-pinned block, never retyped. Both
call sites (`reader.js`, `words.js`) pass the profile words the new kinds need. `CACHE` bumps
`magic-vet-v24` → `v25` in the same commit as the first precached change, with the pin at
`tests/shell.test.js:64` moved in that same commit and the half-applied bump seen to fail first.

**Why.** Phase 1 is unreachable by her until this exists. This is the phase where she gets R5.

**Done when.** A sitting of four asks each kind exactly once; a typed right answer posts exactly
the same `quiz-answer` a tapped one does (asserted at the SEAM, not in the parts); the near-miss
retry posts exactly once; and a self-served visual gate on **port 3500** (R-F6-2 — the step adds
it to the spent list) shows all four cards at a phone width.

**The known risk to plan against:** a UI feature audited in node is audited at the wrong layer
(field guide 15). The visual gate is not optional here and it is not a screenshot for the record —
it is the only place the composite of input + keyboard attributes + RTL prompt beside an LTR field
can be seen at all.

## PHASE 3 — ship it (skeleton)

**What we do.** Pre-flight (`vercel inspect` first, id AND url recorded exactly as reported),
one deploy with output to a file, md5 the worktree against live for every changed file, and an
owner review page stating the residual of design §4.1 in plain words.

**Why.** "The work was done and she never saw it" is this project's documented failure mode and a
phase boundary is where it hides (F3-1).

**Done when.** Every changed file is md5-identical live vs the tested tree, the rollback target is
named, and the owner has seen the page.

---

## CARRIED OBLIGATIONS OPENED BY THIS PLAN

- **W1-1** `public/quiz-core.js` is PRECACHED (`sw.js:16`). Phase 1 changes it and does NOT bump
  `CACHE`, because phase 1 ships no reachable behaviour. **Phase 2 owes the bump for phase 1's
  bytes as well as its own.** If this run were ever abandoned after phase 1, the bump would still
  be owed — recorded so that is a decision and not an accident.
- **W1-2** Design §4.1's residual: the phone keyboard cannot be driven from here. Must appear on
  the owner's page at phase 3 in plain words, not buried.
