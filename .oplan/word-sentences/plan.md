# plan — word-sentences · PHASE 1 in full, phases 2–4 as honest skeletons

**Design:** `.oplan/word-sentences/design.md` · **Base commit:** `8d2a772`, tree clean
**Baseline ledger:** **551 tests / 551 pass / 0 fail** (measured 2026-08-11, bare `node --test`)
**Baseline bytes:** `public/quiz-core.js` md5 `04b61a2e7602e5cd8dc0dad3c7ad1e4a`, CR=263 LF=263 ·
`public/quiz.js` md5 `a5df4cfdb031b68a6aceaf8b8c2d9fe4`, CR=540 LF=540 ·
`public/quiz-strings.js` md5 `e50c944fa8ccb59c4894c7bcb8b63829`, CR=0 · `sw.js` CACHE `magic-vet-v25`

> **THIS PLAN IS NOT DISPATCHABLE UNTIL B-1 AND B-2 ARE ANSWERED** (`design.md` §9). Phase 1 is the
> only phase that is safe to run before those rulings, because every function it adds is needed by
> readings (b) *and* (c) of the request and by both generation routes. Steps 1.1–1.4 assume nothing
> the owner has not already implied. **Step 1.5 assumes reading (c) and must wait for B-1.**

---

## PHASE 1 — the engine (pure functions only), plus the two Hebrew strings

**Goal.** Every rule in design §4.2, §4.3 and WS-2/WS-3/WS-4/WS-6 exists as a pure, `rand`-threaded
function in `public/quiz-core.js`, each with tests that have been **seen to fail**. **She sees
nothing.** No view calls any of it; `public/quiz.js` is not opened; no chapter field is written.

**Why the engine alone is a phase.** Everything hard about a sentence question is a decision about
*correctness* — what counts as assembled, what counts as one slip, which sentence may be used at
all. All of it is expressible without a DOM, so all of it can be **executed** in tests rather than
read as source (field guide 15's third habit, and word-write's phase 1, which worked).

### Frozen contracts in force for this phase

- **WS-2** correctness is equality of `tokens.join(' ')` after `trim().toLowerCase()`, **never tile
  identity**.
- **WS-3** an incomplete assembly is a NO-OP — never graded, never posted, no retry consumed.
- **WS-4** one free retry on OSA distance **exactly 1** over the **token array**, using the
  **existing** `osaDistance` helper with **no change to any existing line**.
- **WS-6** a sentence entry that fails any rule of design §4.3 is **dropped**, never repaired.
- **WS-8** `public/quiz-core.js` is **CRLF**; the gate is `CR == LF` **and** `CR >= 263`, never a
  fixed count. `public/quiz-strings.js` is **LF**; its gate is `CR == 0`.
- **WK-1** (inherited, in force) a kind is never faked and a prompt is never blank. Here: no
  sentence available ⇒ no card, and the function returns `null` rather than an empty shell.
- **R-W-13** (inherited) an incomplete answer is the *absence* of an answer, not a wrong one.
- **D7 / R-W-6** no paid API, no runtime LLM, **no network of any kind in any code this phase adds**.
- **Untouched this phase:** `public/quiz.js`, `public/views/*`, `lib/story.js`, `api/*`,
  `public/sw.js`. All 551 existing tests keep passing, unmodified.

### Non-goals for every step in this phase

No DOM. No `fetch`. No changes to any view or any API handler. No change to the behaviour of any
existing export. No `CACHE` bump — but note **`quiz-core.js` and `quiz-strings.js` are both
PRECACHED (`sw.js:15,16`), so phase 3 owes the bump for this phase's bytes as well as its own**;
recorded below as carried obligation **S1-1**.

---

### Step 1.1 — the token contract

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/sentence-tokens.test.js` (new file)
- **Goal.** Two new exports, appended:
  - `tokenizeSentence(s)` → `String(s ?? '').trim().split(/\s+/).filter(t => t !== '')`. An empty
    or whitespace-only input returns `[]`. Never throws on `null`, `undefined` or a number.
  - `sameSentence(a, b)` → `true` iff both are token arrays (or strings) whose
    `tokens.join(' ').trim().toLowerCase()` are equal. `[]` is never equal to a non-empty side.
- **Why the JOINED STRING and not the tile array (WS-2).** Two identical tiles must not be a coin
  flip: measured, **4 of the 114 candidate sentences contain a repeated token** (design §2.3).
  Comparing joined strings makes those fair by construction rather than by review.
- **Why the same tokenizer the reader uses.** `reader.js:436` renders the chapter with
  `text.split(/(\s+)/)`, so a whitespace-delimited chunk *is* what she sees as a word, punctuation
  included. A cleverer tokenizer would produce tiles that do not match the text she read.
- **New file, deliberately** (field guide 27): a new test file cannot inherit module state another
  file has already stubbed.
- **Frozen validation command:**
  ```bash
  set -o pipefail
  node --test tests/sentence-tokens.test.js 2>&1 | tail -5
  CR=$(tr -dc '\r' < public/quiz-core.js | wc -c)
  LF=$(tr -dc '\n' < public/quiz-core.js | wc -c)
  [ "$CR" = "$LF" ] || { echo "FAIL: quiz-core.js MIXED endings, CR=$CR LF=$LF"; exit 1; }
  [ "$CR" -ge 263 ] || { echo "FAIL: quiz-core.js shrank, CR=$CR (<263)"; exit 1; }
  md5sum public/quiz.js | grep -q '^a5df4cfdb031b68a6aceaf8b8c2d9fe4' || { echo "FAIL: quiz.js was touched"; exit 1; }
  node --test 2>&1 | grep -E '^# (tests|pass|fail)'
  ```
  **Bare `node --test`, never `node --test tests/`** — the directory form is `MODULE_NOT_FOUND` on
  Node v22 and can never pass (contract GC-1; intervention I-1 of the last run).
  **PASS requires:** the new file green; `CR == LF` and `CR >= 263`; `quiz.js` md5 unchanged;
  whole suite `fail 0` and `tests` **≥ 551 + 8**.
- **Required assertions, each executed:** `null`/`undefined`/a number/`''`/`'   '` all give `[]`
  without throwing; leading, trailing and doubled internal whitespace all collapse identically;
  `sameSentence` is true for the same tokens in the same order with different capitalisation and
  different surrounding whitespace; **false** for the same multiset in a different order; **true**
  for two arrays that differ in tile identity but join to the same string (the repeated-token
  case, asserted by name); `[]` vs `['a']` is false; a string argument and its token array argument
  compare equal.
- **Fail-first, TWO controls** (each recorded in DEVIATIONS with the failing test name):
  1. a `sameSentence` that compares arrays element-wise by index **and** requires distinct tile
     objects ⇒ the repeated-token assertion FAILS;
  2. a `tokenizeSentence` that splits on `' '` instead of `/\s+/` ⇒ the doubled-whitespace
     assertion FAILS.
- **Budgets:** 2 retries, then escalate.

---

### Step 1.2 — grading an assembly (WS-3, WS-4)

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/sentence-grade.test.js` (new file)
- **Goal.** One new export, appended:
  - `gradeAssembly(placed, target, { isRetry = false } = {})` →
    `'incomplete' | 'correct' | 'near-miss' | 'wrong'`, in **this order of tests**:
    1. `placed` is not an array, or its length differs from `target`'s ⇒ **`'incomplete'`**.
    2. `sameSentence(placed, target)` ⇒ `'correct'`.
    3. `isRetry` ⇒ `'wrong'`.
    4. OSA distance over the **lower-cased token arrays** is exactly 1 ⇒ `'near-miss'`.
    5. otherwise `'wrong'`.
- **`osaDistance` IS NOT MODIFIED, AND THIS WAS PROVED BY EXECUTION, NOT BY READING.** The helper at
  `quiz-core.js:153-174` uses only `.length`, `[i]` and `===`, so it already works over arrays of
  strings. Run against token arrays on 2026-08-11: identical → **0**, one adjacent swap → **1**,
  one word moved to the end → **2**, two swaps → **4**. So WS-4 is implementable with **zero
  changes to any pre-existing line**, which is what keeps criterion 4 below green.
- **Why `'incomplete'` is its own verdict and not `'wrong'` (WS-3 / R-W-13).** R-W-13 ruled that an
  empty typed box is a no-op *because* grading it would score a mis-tap as a wrong answer, and a
  wrong answer costs a strike that pins a word to the front of every future quiz. The same
  reasoning applies to a half-built sentence, and the last run's own words apply verbatim: *"an
  empty box is not an answer. It is the absence of one."* Making it a distinct verdict — rather
  than letting the caller check the length — puts the rule in the tested engine instead of in a
  view where nothing can see it.
- **Frozen validation command:** as step 1.1, with `tests/sentence-grade.test.js` on the first line
  and `tests` **≥ 551 + 8 + 12**, plus this line inserted before the whole-suite run:
  ```bash
  node --test tests/typed-answer.test.js 2>&1 | grep -E '^# (pass|fail)'
  ```
  **That line is not decoration:** `typed-answer.test.js` is the 27-test file that owns
  `isNearMiss`/`gradeTyped`, the two callers of the helper this step reuses. If it is anything
  other than `fail 0`, the "no existing line changed" claim is false regardless of what the diff
  looks like.
- **Required assertions, each executed:** a perfect assembly is `'correct'` regardless of case; a
  short/long/non-array `placed` is `'incomplete'` for every `isRetry` value; **one adjacent swap
  is `'near-miss'`** (asserted by name, with a 4-token fixture); **one word moved from the front to
  the end is `'wrong'`, not `'near-miss'`** (measured distance 2 — this is the assertion that
  proves the rule is tight); two swaps are `'wrong'`; `isRetry: true` **never** returns
  `'near-miss'`, swept over every near-miss fixture in the file; a repeated-token target where the
  two identical tiles are exchanged is `'correct'`, never `'near-miss'`; `target` and `placed` are
  never mutated (compare against pre-copies).
- **Fail-first, THREE controls:**
  1. a `gradeAssembly` that returns `'wrong'` instead of `'incomplete'` ⇒ the mis-tap assertion FAILS;
  2. one that ignores `isRetry` ⇒ the retry sweep FAILS;
  3. one that calls OSA distance on the **joined strings** instead of the token arrays ⇒ the
     "one word moved to the end is wrong" assertion FAILS (character distance would call it near).
- **Budgets:** 2 retries, then escalate.

---

### Step 1.3 — which sentences may be used at all (WS-6, design §4.3)

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/sentence-usable.test.js` (new file)
- **Goal.** One new export, appended, modelled line-for-line on `isUsableItem`
  (`quiz-core.js:78-86`), which is the shipped precedent for "shape gate on untrusted content":
  - `isUsableSentence(x, chapterText)` → `true` iff **all** of:
    1. `x` is a non-array object with `en` and `he` both non-empty strings after `trim()`;
    2. `tokenizeSentence(x.en).length` is between **3 and 8** inclusive;
    3. `x.en.trim()` matches `/^[A-Za-z ]+[.?!]$/` — letters, spaces, and exactly one terminal mark;
    4. `x.he` contains at least one code point in **U+0590–U+05FF**;
    5. when `chapterText` is a non-empty string, `chapterText.includes(x.en.trim())` — **verbatim**.
- **Every one of those five numbers came from a measurement, and the step packet must quote them:**
  3–8 tokens covers **114** of her **258** chapter sentences with **≥2 in every one of 16
  chapters**; the punctuation filter removes the **40** comma sentences and **22** quoted ones,
  which is where alternative word orders live; the verbatim rule is the shipped `evidence`
  precedent (`story.js:160`), measured at **40/40** on her chapters; the Hebrew range is
  `HEBREW_RE` (`story.js:70`), already used to validate question prompts.
- **`chapterText` is optional on purpose.** The pure engine must be testable without a chapter, and
  the caller that *has* one must pass it. The test asserts both arms, and phase 3's call site is
  pinned to pass it.
- **HEBREW IN THE TEST FILE:** `\uXXXX` escapes only, never a raw glyph (field guide 8). Invented
  strings, never hers, and never a real translation of anything.
- **Frozen validation command:** as step 1.1, with `tests/sentence-usable.test.js` and
  `tests` **≥ 551 + 8 + 12 + 14**, plus:
  ```bash
  OUT=$(node --test tests/sentence-usable.test.js 2>&1)
  N=$(echo "$OUT" | sed -n 's/.*OBSERVED_CASES=\([0-9]*\).*/\1/p' | head -1)
  [ -n "$N" ] || { echo "FAIL: the sweep never printed OBSERVED_CASES"; exit 1; }
  [ "$N" -ge 40 ] || { echo "FAIL: sweep observed only $N cases, expected >=40"; exit 1; }
  ```
  **The counter is mechanically required, not requested in prose** (field guide 18 and the last
  run's I-2): a sweep that inspects nothing prints "0 violations", which is byte-identical to
  success, and an `OBSERVED_` gate satisfied by a hardcoded constant has already happened here once.
  The count must be **incremented inside the loop body**, and the step's DEVIATIONS must record the
  actual number printed.
- **Required assertions, each executed:** the rejection table, one case per rule and one just
  inside each boundary — 2 tokens rejected / 3 accepted / 8 accepted / 9 rejected; a comma, a
  double quote, an apostrophe, a digit and a semicolon each rejected on their own; a missing
  terminal mark rejected; two terminal marks rejected; `he` present but pure ASCII rejected; `he`
  missing rejected; `en` present in the chapter only as a substring of a longer word rejected
  (verbatim means verbatim); `null`, `[]`, `''` and a number all return `false` without throwing;
  and the sweep over ≥40 constructed cases printing `OBSERVED_CASES=<n>`.
- **Fail-first, TWO controls:**
  1. drop the verbatim check ⇒ the "sentence not in the chapter" assertion FAILS;
  2. widen the shape regex to allow `,` ⇒ the comma assertion FAILS.
- **Budgets:** 2 retries, then escalate.

---

### Step 1.4 — choosing the sentence and laying out the tiles

- **Tier:** WORKER
- **Files it may touch:** `public/quiz-core.js`, `tests/sentence-select.test.js` (new file)
- **Goal.** One new export, appended:
  - `selectSentence(chapter, words, rand = Math.random)` → `{ en, he, tokens, tiles }` or **`null`**.
    1. Collect `chapter.sentences` entries passing `isUsableSentence(x, chapter.text)`. None ⇒
       `null`.
    2. **Prefer** entries containing at least one token whose lower-cased, punctuation-stripped
       form is a key of `words`; if any exist, choose only among those. (Measured: **66 of 114**
       candidate sentences qualify; restricting to *known* words would leave **12** and starve it —
       so the preference is over **any** status, deliberately.)
    3. Choose one uniformly with `rand` from the preferred set (or from all usable entries if the
       preferred set is empty).
    4. `tokens = tokenizeSentence(en)`; `tiles` is a Fisher-Yates shuffle of `tokens` using the
       **exact loop idiom at `quiz-core.js:31-34`**.
    5. **`tiles` must not already spell the answer.** Re-shuffle up to 20 times while
       `sameSentence(tiles, tokens)`; if all 20 fail (possible only for a target whose tokens are
       all identical), return `null`.
- **Why rule 5 exists.** A shuffle that hands her the finished sentence is a question with no
  question in it. At 3 tokens it happens roughly 1 time in 6. This is cheap to prevent and
  impossible to notice in production.
- **Why `null` and not a fallback.** WK-1: *a kind is never faked and a prompt is never blank.*
  `null` is how the caller learns the card is not buildable, exactly as `pickItem` returns `null`.
- **Frozen validation command:** as step 1.1, with `tests/sentence-select.test.js` and
  `tests` **≥ 551 + 8 + 12 + 14 + 12**, plus an `OBSERVED_DRAWS` gate `>= 200` in the same form as
  step 1.3's.
- **Required assertions, each executed:** `null` for a chapter with no `sentences`, an empty array,
  an array of only-invalid entries, `null`, and a non-object; **over ≥200 seeded draws, `tiles`
  never spells the target and the multiset of `tiles` always equals the multiset of `tokens`**
  (printing `OBSERVED_DRAWS=<n>`); a fixture where exactly one of three usable entries contains one
  of her words is chosen **every time** over ≥200 seeds; when none contains one of her words all
  usable entries are still reachable (each appears at least once over the sweep); `chapter` and
  `words` are never mutated; `tokens.join(' ')` equals `en.trim()` collapsed on whitespace.
- **Fail-first, TWO controls:**
  1. remove the re-shuffle loop ⇒ the "tiles never spell the target" sweep FAILS;
  2. drop the her-words preference ⇒ the "chosen every time" assertion FAILS.
- **Budgets:** 2 retries, then escalate.

---

### Step 1.5 — mint the two Hebrew strings *(BLOCKED on B-1; do not dispatch before it is answered)*

- **Tier:** ORCHESTRATOR (with an OWNER gate inside it)
- **Files it may touch:** `.oplan/word-sentences/design.md` (append the fenced block only),
  `scripts/extract-quiz-strings.mjs`, `public/quiz-strings.js` (regenerated, never hand-edited),
  `tests/sentence-strings.test.js` (new file)
- **Goal.** `QUIZ_STRINGS` gains `sentence_prompt` and `sentence_reveal` (design §6), extracted by
  script from a **second** md5-pinned block, with the word-write block's pin untouched.
- **The procedure, frozen, because the record does not contain one (RECORD GAP G-A):**
  1. Decide the Hebrew wording for the two English meanings in design §6.
  2. **Write it to a file as `\uXXXX` escapes constructed from decimal code points in code.** No
     raw Hebrew glyph and no backslash crosses any tool-call or shell boundary (field guide 34 —
     `\uXXXX` in an agent packet *decodes* in transit, which has already happened here once).
  3. **Verify the WRITTEN BYTES:** dump the code points back out of the file, assert 0 raw glyphs
     in U+0590–U+05FF and 0 bytes ≥ 128 in the escaped source.
  4. **OWNER GATE — the only gate that can see this failure.** Render the two strings and have the
     owner read them, *before* the md5 is pinned. Nothing mechanical can tell that correct-looking
     Hebrew says the wrong thing to an eleven-year-old, and field guide 1 is explicit: if no gate
     can see the failure, add a human one. He reads Hebrew; this costs him ten seconds.
  5. Only then: append the ` ```hebrew-strings-2 ` block to design.md, compute md5 and byte length,
     write both into the extractor's second pin **and** into `phase-state.md` in the same step.
  6. Regenerate `public/quiz-strings.js` by running the extractor. **Never hand-edit it.**
- **The extractor change, scoped:** `scripts/extract-quiz-strings.mjs` reads a **second** source
  (`.oplan/word-sentences/design.md`, block `hebrew-strings-2`) with its **own** `EXPECT_MD5` /
  `EXPECT_LEN` / key list, and merges the two key sets in a fixed order. The word-write constants
  (`ad6885fa6c4cc47751051b8f3fb9c9ea`, 225) are **not touched**, so
  `tests/quiz-strings.test.js` — which pins exactly those — stays green untouched.
- **A measured note the packet must carry:** `tests/quiz-strings.test.js` iterates a hardcoded
  `EXPECTED_KEYS` list of five and asserts *"all five keys exist"*, not *"exactly five keys"*. Two
  new keys are therefore additive-safe. **But its code-point test permits only U+0590–U+05FF,
  space, `!` and `?` (codes 1424–1535, 32, 33, 63).** The new test file must declare its own
  permitted set, and if `sentence_reveal` needs a colon (58) that must be an explicit, written
  decision — preferring wording that needs no new punctuation at all.
- **Frozen validation command:**
  ```bash
  set -o pipefail
  node scripts/extract-quiz-strings.mjs
  git diff --name-only | LC_ALL=C sort | tr '\n' ' '
  CR=$(tr -dc '\r' < public/quiz-strings.js | wc -c)
  [ "$CR" = "0" ] || { echo "FAIL: quiz-strings.js must be LF (R-W-8), CR=$CR"; exit 1; }
  node -e 'const b=require("fs").readFileSync("public/quiz-strings.js");let n=0;for(const x of b)if(x>127)n++;if(n!==0){console.log("FAIL: non-ASCII bytes in quiz-strings.js:",n);process.exit(1)}console.log("ASCII OK")'
  node --test tests/quiz-strings.test.js 2>&1 | grep -E '^# (pass|fail)'
  node --test tests/sentence-strings.test.js 2>&1 | tail -5
  node --test 2>&1 | grep -E '^# (tests|pass|fail)'
  ```
  **PASS requires:** the changed-path list is exactly the four files above; `CR == 0`; zero
  non-ASCII bytes; **`tests/quiz-strings.test.js` `fail 0` with its own count unchanged** (the
  word-write pin still holding is the whole point); whole suite `fail 0`.
- **Required assertions in the new test file:** the two new keys exist, are non-empty after trim,
  and are **byte-identical to the design.md block re-parsed at test time** (the word-write oracle
  pattern — no expected literal anywhere in the test); the second block's md5 and byte length match
  their pins; every code point of both values is in the declared permitted set; `QUIZ_STRINGS` is
  still frozen; running the extractor twice produces a byte-identical file (idempotence).
- **Fail-first, TWO controls:** (1) change one character of the block in design.md ⇒ the extractor
  **refuses to write** and the digest assertion FAILS; (2) hand-edit one escape in
  `public/quiz-strings.js` ⇒ the byte-identity assertion FAILS. Both must be observed and recorded.
- **Budgets:** 1 retry, then escalate. This step touches a published file and a generated file; a
  second failure means stop and rule, never improvise.

---

### PHASE 1 ACCEPTANCE CRITERIA (written before any executor exists)

Each is a command with a pass/fail outcome. All are re-run by the ORCHESTRATOR at the gate.
**Every one of them is dry-run against the real tree before the first packet is dispatched** —
field guide 31: three frozen gates were themselves defective in one phase of the last run, and a
read-only reviewer cannot see an unrunnable command.

1. `node --test 2>&1 | grep -E '^# (pass|fail)'` ⇒ `fail 0`, and `pass` = **551 + the five new
   files' test counts**, with the exact ledger recorded in `phase-state.md`. **Bare `node --test`.**
2. `tr -dc '\r' < public/quiz-core.js | wc -c` **equals** `tr -dc '\n' < public/quiz-core.js | wc -c`
   and is **≥ 263**. NOT a fixed count: the file has 263 lines and CR=263, so every append raises
   both, and a pin on the number would fail every step (this exact mistake was made last run).
3. `md5sum public/quiz.js` ⇒ still `a5df4cfdb031b68a6aceaf8b8c2d9fe4`. Phase 1 does not open the
   screen.
4. **No pre-existing line of `public/quiz-core.js` is changed or removed**, measured with
   `.oplan/word-write/subsequence-check.mjs` (it exists and is reusable): 0 of the 263 original
   lines missing or modified, **and** all 14 pre-existing exports **plus the unexported
   `osaDistance`** compare identical as whole function bodies. `git diff --numstat` is **not**
   acceptable here — it reports a mid-file insertion and an end append identically (field guide 32,
   and criterion 6 of the last run's phase 1, which failed for exactly this reason).
5. `git diff 8d2a772 --name-only` lists **exactly**: `public/quiz-core.js`, the five new test files,
   `.oplan/word-sentences/design.md`, `scripts/extract-quiz-strings.mjs`, `public/quiz-strings.js`
   — and **no view, no `api/`, no `lib/`, not `public/quiz.js`, not `public/sw.js`**.
6. Every one of the five steps recorded a **fail-first observation** in `journal.md`, naming the
   failing test. A step whose test was never seen to fail is not accepted.
7. `grep -c 'fetch(' public/quiz-core.js` ⇒ **0**, and no new test opens a network connection.
   D7/R-W-6, mechanically.
8. `tests/quiz-strings.test.js` passes **unmodified**, proving the word-write Hebrew pin
   (`ad6885fa…` / 225) still holds after a second block was added beside it.

---

## PHASE 2 — the sentence material *(skeleton; planned in full at the phase-1 gate, and only after B-2 is ruled)*

**What we do.** `lib/story.js` learns the **optional** `chapter.sentences` field: the generator asks
for it (route A or B per B-2), `verifyChapter` validates each entry with the phase-1 rules and
**drops** the failures, and a malformed or absent field can never fail a chapter. `api/chapter.js`
stores whatever survives.

**Why.** Without material, phase 3 renders nothing. And this is the only phase that touches the
story path, which is her core experience — it is isolated deliberately so a regression there is one
revert, not an unpicking.

**Done when.** A stubbed transport returning good sentences yields them on the chapter; every
malformed shape from phase 1's rejection table is dropped with the chapter still `ok: true`; a
transport that omits the field entirely yields a chapter identical to today's; and the existing
`tests/story.test.js` and `tests/api-chapter.test.js` pass unmodified.

**The known risk to plan against:** changing the story prompt changes the story. If B-2 rules route
A, this phase needs a before/after comparison of at least one generated chapter against the current
prompt, judged by a human — no test can see "the story got worse".

## PHASE 3 — the screen *(skeleton)*

**What we do.** `renderQuizCard` gains the `sentence-build` branch (design §4.1); `startQuiz` gains
the `sentences` option and appends **one** card after the `count` word questions (WS-1); the tap /
place / return / check bindings join `bind()`; `reader.js:1052` passes the chapter's sentences and
**`words.js` is not changed at all**. `CACHE` bumps `magic-vet-v25` → `v26` **in the same commit**
as the first reachable change, with `tests/shell.test.js:64` moved in that commit and the
half-applied bump **seen to fail first**.

**Done when.** A sitting of five renders four unchanged word cards and one sentence card; a full
simulated sitting leaves the profile **byte-identical** (WS-5, asserted at the seam, not by reading
the source for the absence of a `post(`); an unbuildable chapter yields exactly today's sitting of
four; the `cloze-pick` card is re-frozen by string equality against its `8d2a772` render (**RECORD
GAP G-B: the old freeze at `.oplan/word-write/check-frozen-card.mjs` is wired into nothing and
cannot be leaned on**); and a self-served visual gate on **port 3800** (adding it to R-F6-2's spent
list in the same step) **operates the tiles at 390×844** — taps them, submits a wrong order, sees
the retry with her tiles kept, corrects it, sees the praise, and confirms the "almost" line is gone
once resolved. Field guide 35: a gate that does not press the button has not tested the button.

## PHASE 4 — ship it *(skeleton)*

**What we do.** Pre-flight (`vercel inspect` **first**, id AND url recorded exactly as reported, and
the R-W-7 check that the live `CACHE` differs from ours), one deploy with output to a **file**, md5
the **worktree** against live for every changed file, and an owner page saying in plain words what
she will see, what it does not do (§1: this is not composition), and that she must generate one new
chapter before the card can appear.

**Done when.** Every changed file is md5-identical live vs the tested tree, the rollback deployment
id is named, and the owner has seen the page.

---

## CARRIED OBLIGATIONS OPENED BY THIS PLAN

- **S1-1** `public/quiz-core.js` and `public/quiz-strings.js` are both **PRECACHED** (`sw.js:15,16`).
  Phase 1 changes both and does **not** bump `CACHE`, because phase 1 ships no behaviour she can
  reach. **Phase 3 owes the bump for phase 1's bytes as well as its own.** If this run is abandoned
  after phase 1, the bump is still owed — recorded so that is a decision and not an accident, on
  the W1-1 precedent.
- **S1-2** Step 1.5's owner gate is the **only** check that the Hebrew says what it means. If the
  owner is unavailable, the step **stops**; it does not pin an unread string into a published file
  and a child's screen.
- **S1-3** RECORD GAP G-A must be written into
  `.oplan/word-write/field-guide/index.md` as a lesson once step 1.5 has proved a procedure —
  "how Hebrew is minted" is currently nowhere, and the next run will invent it a third time.
