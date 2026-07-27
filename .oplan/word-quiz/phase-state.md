CURRENT: **PHASE 1 CLOSED 2026-07-27 (second attempt), owner approved. All 9 criteria met.**
  Gate green: 50 files, 71 items, 18 multi-sense. 225 tests / 0 fail. Contrast 52 ALL PASS.
  **PHASE 2 IS CANCELLED AS A PHASE (D23, owner 2026-07-27, reverses D8).** The bank starts at the
  50 pilot words and grows on demand — see plan.md "PHASE 2 — CANCELLED AS A PHASE". Building all
  2217 up front was measured at ~55M tokens / ~45 agent-hours against a top-up cost of ~9k tokens
  and ~70 s per word. Top-ups run WEEKLY, not daily.

CURRENT: **PHASE 3 CLOSED 2026-07-27. ALL NINE CRITERIA MET — the owner read the QZ-16 transcript
  and approved (criterion 9).** The policy is frozen as built: three strikes, at most ONE strike per
  sitting, a right answer wipes the slate completely.
  NEXT ACTION: **plan PHASE 4 (the quiz surface) with a fresh planner, review that plan, then
  execute.** Phase 4 is a skeleton only in plan.md; it has not been planned in full.
  Five steps accepted: 3.1 18dbda1 · 3.2 b273c74 · 3.3 76eb416 · 3.4 f9760b2 · 3.5 521ae9b.
  Ledger 225 -> 231 -> 241 -> 245 -> 252 -> **257**, `# fail 0`. Contrast 52 ALL PASS.
  `.data/profile.json` absent. Exactly the 7 expected files changed across `d9e0b9b..HEAD`, none
  deleted. 5/5 auditor verdicts `match`, all high confidence. 13 mutations run across 3.2-3.5, all
  13 caught, 0 NOT-CAUGHT. **The independent step-3.5 agent found NO defect.**
  QZ-16 DISCHARGED: `transcript.mjs` + `transcript-expected.txt` were written by the orchestrator at
  dd96168, BEFORE 3.4 was dispatched, with the expected output derived BY HAND from QZ-12's table.
  Run against the finished handler the diff is EMPTY — two independent derivations agreeing.
  Re-check criteria 3/4/5 any time: `node .oplan/word-quiz/phase-3-gate.mjs`.

  THREE AMENDMENTS, all mine, each logged in plan.md beside the thing it amends:
  **A3** (3.1) — `strikes`/`quizRight`/`quizWrong` validate as `Number.isInteger(v) && v >= 0`.
  "Range-lenient" means no UPPER and no POLICY bound, so `99` is valid and `-1` is not. As frozen,
  the step's non-goal contradicted the step's own assertion list.
  **A4** (3.2) — on a merge, the `lastStrikeSession` of the side with the later `lastQuizAt` wins
  EVEN WHEN ABSENT, because a pass is what deletes it. Ordering trap, pinned by a mutation-proved
  test: compute that decision BEFORE overwriting `existing.lastQuizAt`.
  **A5** (gate) — criterion 6 moved from the working tree to the commit range `d9e0b9b..HEAD`,
  because oplan commits each step on acceptance so the frozen form compared an EMPTY set. Strictly
  stronger: the range form sees an edit made and reverted across steps, the tree form could not.

  ONE CLAIM THAT MUST BE STATED NARROWLY: phase 3 proved that an **already-normalised** old-shape
  profile is not rewritten by a GET. NOT that her file is never rewritten on load — `migrateWordKeys`
  SORTS word keys, so an unsorted profile IS rewritten (I verified this myself with a probe). Her
  real file has been sorted since the first GET after that code shipped, so the narrow claim does
  cover her — but say the narrow one.

  CARRY INTO PHASE 4 — what phase 3 learned that no phase-3 test can enforce:
  · **QZ-11 pushes a criterion into phase 4 IN ADVANCE: the client must mint a genuinely NEW
    `sessionId` per sitting.** A constant id makes every word un-strikeable and the correction loop
    silently never fires. No phase-3 test can see this. It is phase 4's to prove.
  · A word with `strikes > 0` must be prioritised for re-asking, and so must one with `needsReview` —
    otherwise a word at 1 or 2 strikes has no ordering key and its third strike never arrives.
  · Phase 4 must TOLERATE A MISSING quiz item and skip it silently (D23) — she will claim a word
    days before its item exists.
  · The demotion must be VISIBLE to her (D1). Phase 3 built the mechanism, not the telling.
  · Of the 8 test files that copy-paste `withTempDataDir`, only `profile-quiz-scenario.test.js`
    deletes `APP_CODE`; the other 7 401 on a machine that exports it. Pre-existing, not phase 3's.

  ---- how phase 3 was planned, kept for the record ----
  It is planned in full in plan.md
  (`## PHASE 3 — the profile side`): 9 acceptance criteria, contracts QZ-9..QZ-16, five steps, and
  the frozen per-step assertion lists. A fresh planner drafted it from files alone; a plan reviewer
  attacked it TWICE, finding 23 defects (12 `undecided`), all fixed — see journal "PHASE 3 PLAN
  REVIEW". Blockers 2/3/4/5/7 decided by the orchestrator, 1 and 6 by the owner (D24, D25).
  **BEFORE step 3.4 the orchestrator must write `.oplan/word-quiz/transcript.mjs` AND
  `transcript-expected.txt` itself** (QZ-16) — the owner's gate must not rest on a command the
  implementer wrote.
  Chores: criterion-9-sample.txt should be regenerated whenever the bank changes. (The field-guide
  overrun is now 50/40, re-curated at the phase-3 boundary and justified in the journal.)

  ---- history of the first, VOIDED closure, kept deliberately ----
  **PHASE 1 WAS RE-OPENED BY AUDIT ONCE, 2026-07-27.**
  It was declared closed and the owner approved criterion 9 — but the owner approved on my written
  assurance that "no distractor fits its blank", and an independent content audit then found one
  CERTAIN leak and four PROBABLE ones. **The approval rests on a false premise, so it does not
  count.** Phase 2 must NOT be dispatched until the leaks are fixed and the owner re-approves.
  An adversarial audit of the gate separately found 5 HIGH-severity holes that let bad items through
  (see journal "AUDIT"). The 71 shipped items do not exploit them; phase 2's generator would.
  The owner then chose "stop and rethink the format" over patching, and after the investigation
  took **D22: the item shows the MEANING (the `sense` gloss) as well as the sentence.** That kills
  13 of the 15 flagged leaks outright and makes `sense` learner-facing, which adds QZ-1 rule 11.

  STATUS 2026-07-27: **R1, R2, R3, R4 ALL DONE AND VERIFIED. R5 is the only thing outstanding and
  it is the owner's re-approval.** Gate green (50 files, 71 items), 225 tests / 0 fail, contrast 52
  ALL PASS, tree clean. Rules 11, 12, 13 added; rules 4 and 9 hardened; all 8 audit attack fixtures
  now blocked and a valid control still passes; both test gaps closed and verified BY MUTATION.
  NOTE: the field guide is now 54 lines against a 40-line budget — trim before phase 2.

  PHASE 1 RE-CLOSURE WORK, in order:
    R1. Gate holes — add rule 12 (`allowed.has(answer)`, closes 3 of the 5) and harden rule 4 to
        reject on residue (closes the other 2). tests/ must gain a case per hole.
    R2. Test gaps — a test that runs the gate against the REAL bank (today `npm test` is green with
        `public/quiz/` deleted, verified), and a NON-VACUOUS guard test (today it asserts on `gave`,
        which has no band entry, so it passes with or without the guard; use one of the 13 words the
        guard actually governs: all each than become repeat video worst writing zone).
        Also cover the 3 other surviving mutants: stray underscores, MAX_SENSE, extra keys.
    R3. Rule 11 in code + gate + tests; then fix the 8 failing glosses
        (`everyone teeth outdoor rules brightness sensible relax`) and `itself[0]`'s WRONG gloss.
    R4. Fix the 2 leaks D22 does not cover: `boy[0]`/`uncle`, `fair[1]`/`party`+`picnic`.
    R5. Re-run criterion 9 at **`--sample 71`** (not 50 — `--sample 50` showed only 40 of 50 words).
  Only then may phase 2 be planned. The QZ-6 ledger will move past 218; re-freeze it when R1-R3 land.
PLAN: .oplan/word-quiz/plan.md — fixed in place through THREE review rounds, so there is no
  amendments appendix to read separately. Read it top to bottom.
DESIGN: .oplan/word-quiz/design.md — FROZEN. 14 owner decisions (D1-D14) from a grill-me pass plus
  5 orchestrator decisions (D15-D19). Do not re-open any of them.
FIELD GUIDE: .oplan/word-quiz/field-guide/index.md (10 lessons, 50/40, re-curated at the phase-3 -> phase-4 boundary; 12 lessons merged into 10)
PREDECESSOR: .oplan/word-audio/ — closed and deployed. Its journal holds the deploy recipe, the
  rollback procedure, and the two gate failures this run must not repeat.

BASE: commit ceca519 · 208 tests / 0 fail · contrast 52 ALL PASS · LIVE at magic-vet-v12.

ACCEPTED: 1.1 (lib/quiz-item.js + tests/quiz-item.test.js; STEP-1.1-OK re-run by the orchestrator in
  a clean tree; 214 pass / 0 fail). Carries AMENDMENT A1: rule 10 now compares RESOLVED LEMMAS, not
  surface forms — as frozen it let an inflection give the answer away. See journal "Execution —
  phase 1". QZ-2 also gained two constraints the 1.3 packets must quote: the blank is never the
  first word, and rule 7 is direct manifest membership while rule 4 de-inflects.
  · 1.2 (scripts/check-quiz-bank.mjs + tests/quiz-bank.test.js; STEP-1.2-OK re-run by the
  orchestrator; 218 pass / 0 fail; empty-bank case green with public/quiz/ still absent). Carries
  AMENDMENT A2: the sampler stride is frozen as `Math.floor(i * total / n)`. As first written it
  ended short of the bank's tail and `--sample 50` over 80 items showed the alphabetically-first
  63% — it would have fed criterion 9's HUMAN gate a front-loaded sample presented as a whole-bank
  one. See journal "Execution — phase 1".
  · **3.1** (lib/profile.js + tests/profile-quiz-schema.test.js; STEP-3.1-OK re-run by the
  orchestrator in a clean tree; 231 pass / 0 fail; audit `match`/high). Carries AMENDMENT A3, above.
  NOTE for any later step that leans on 3.1's tests: only FOUR of its six were ever seen to fail.
  Tests 1 and 2 ("an old-shape profile validates", "six legal values validate") pass against the
  UNMODIFIED validator too, because it already ignored unknown keys — they guard against a future
  OVER-strict validator and can never produce fail-first evidence. That is not a defect, but it
  means 3.1's real regression coverage is the four type-strictness tests.
  · **3.4** (api/profile.js + tests/api-profile-quiz.test.js; STEP-3.4-OK re-run by the
  orchestrator; 252 pass / 0 fail; `.data/profile.json` absent; audit `match`/high). Mutations
  proved the two failures that matter: a session-id that fails OPEN is caught by test 3, and a
  write on a 400 path is caught by test 5's byte-identity.
  **RECORD THIS, it bounds a claim:** `migrateWordKeys` sorts word keys, so a GET REWRITES a stored
  profile whose keys are not already alphabetical — pre-existing behaviour, verified by me with a
  probe. Test 7 therefore proves "an ALREADY-NORMALISED old-shape profile is not rewritten on load",
  not the broader "her file is never rewritten". Her real file has been sorted since the first GET
  after that code shipped, so the narrow claim covers her — but say the narrow one.
  · **3.3** (lib/profile.js + tests/profile-quiz-retap.test.js; STEP-3.3-OK re-run by the
  orchestrator; 245 pass / 0 fail; audit `match`/high). Three lines of implementation. The mutation
  that matters was proved: making a tap ALSO increment `strikes` is caught by tests 1 and 4.
  · **3.2** (lib/profile.js + tests/profile-quiz-answer.test.js; STEP-3.2-OK re-run by the
  orchestrator in a clean tree; 241 pass / 0 fail; audit `match`/high). Carries AMENDMENT A4 (see
  plan.md beside QZ-14): on a merge, the `lastStrikeSession` of the side with the later `lastQuizAt`
  wins EVEN WHEN ABSENT, because a pass is what deletes it. Its ordering trap — the decision must be
  computed BEFORE `existing.lastQuizAt` is overwritten — is pinned by a mutation-verified test.
  Fail-first for this step was WEAK (module-load failure, no test actually ran); the evidence that
  counts is the three mutations, all of which failed the right tests. One branch of QZ-14 is
  knowingly untested — see the journal entry.

CARRY INTO PHASE 2 — the four things phase 1 learned that no gate can enforce:
  · D21 (owner): distractors are SAME-CLASS, so the item tests meaning and not word class.
  · THE PIN TEST: `and`/`but` pin NOTHING. Only `so`, `so that`, `so ... that`, `because`,
    `... enough to`, purpose infinitives and verb/argument selection constrain the blank. SIX of the
    first 23 D21 items pinned with a coordinator: four leaked outright (`run[1] play[0] play[1]
    right[1]`) and two were weak (`kind[0] well[1]`). This is NOT a ban on the words — 11 of the
    final 71 items contain an `and`/`but` and are fine, because something else is doing the
    pinning. The rule is that a coordinator may never be the ONLY pin.
  · AMBIGUITY IS THE FAILURE, not difficulty. `count` in "___ four and five, the answer is nine"
    and `because` in "played the piano ___ I was seven" were both rejected for having a readable
    second meaning, not for fitting outright.
  · SHIP FEWER ITEMS RATHER THAN A LEAKY ONE. Two senses were abandoned on this ground and that was
    the right call.
  Also inherited: rule 10 is blind to irregular forms that are themselves manifest words (29 lemmas
  / 42 forms, listed in QZ-2) and `became`/`tying` fail rule 4 as ordinary sentence words.

WHERE HER PROFILE ACTUALLY LIVES (record gap found by the phase-3 planner, patched here): in
  production it is in **Vercel Blob**, behind `BLOB_READ_WRITE_TOKEN` (see `lib/store.js`), gated by
  `APP_CODE`. **It cannot be read from this repo and must never be probed** (field guide 11). `.data/`
  is the LOCAL dir only and is empty. Consequence for any phase that touches the profile: backward
  compatibility can only ever be proved against a RECONSTRUCTED fixture, never against her real data,
  so a post-deploy `GET` belongs in phase 6's criteria. Also note `lib/auth.js:isAuthorized` returns
  TRUE when `APP_CODE` is unset — verified — so frozen commands must `delete process.env.APP_CODE`
  or they 401 on a developer machine that has it exported.

FROZEN CONTRACTS IN FORCE: QZ-1 (the item file, **thirteen** rules — 1/2/9 FILE-level, 3-8/10-13
  ITEM-level; the phase-1 summary said "ten", which was true only before the audit added 11/12/13)
  · QZ-2 (the generation rules, including the vocabulary warning and the duty to self-run the gate)
  · QZ-3 (the gate's frozen CLI: `[--dir <path>] [--sample <N>]`, item-level sampling, rule-4 errors
    name the offending tokens) · QZ-4 (phase-1 non-goals: no UI, no api/, no lib/profile.js, no
    sw.js, no cache bump, no deploy, no paid API, no runtime LLM) · QZ-5 (the 50 frozen pilot words
    and the frozen 5-batch composition) · QZ-6 (ledger 208 -> 214 -> 218) · QZ-7 (inherited: PRECACHE
    admits first-party JS only, contrast stays at 52, profile never contacted).

THE THREE THINGS MOST LIKELY TO BITE:
  · QZ-1 rule 4 — the allowed vocabulary is NOT ordinary English. MEASURED: `after`, `children`,
    `men`, `women`, `feet` are ABSENT while `before`, `went`, `gone` are present. Workers must check
    every word against public/audio/words/index.json and run the gate themselves.
  · QZ-1 rule 8 — pos is a SET unioned across BOTH bands, matched by intersection. 393 manifest
    lemmas have >1 band entry and 336 have a pos union larger than 1. The `entry.pos == null` guard
    is load-bearing: `String(null)` is the truthy string "null".
  · A green gate is NOT acceptance. Criterion 9 is a HUMAN gate — the gate checks form, the owner
    checks meaning. This project has shipped two defects that passed a mechanically-green gate.

OPEN QUESTIONS: none. All 13 grill questions were answered by the owner; the 5 the grill left open
  were decided by the orchestrator at plan time as D15-D19 and written into design.md.
  NO sensitive-word escalation is expected any more: QZ-8 (owner, D20) removes 37 words from the
  quiz entirely and the pilot list no longer contains any of them. QZ-2's stop-and-ask rule stays as
  a backstop. NOTE the exclusion is QUIZ-ONLY — those words are still in buildAllowedSet and the
  story may still use them; that is flagged in design.md D20 and NOT decided.

BLOCKED: no
