CURRENT: phase 4 "the quiz surface", next step 4.5 (the shell bump, sw.js v13 + PRECACHE).
  4.4 ACCEPTED at 93847b8 (STEP-4.4-OK re-run by the orchestrator; 277 pass / 0 fail; audit
  match; NOTE: renderChapter's local `stage` shadows the view's outer `stage` — harmless today,
  recorded in the journal).
  4.3 ACCEPTED at 70ac7c1 (STEP-4.3-OK re-run by the orchestrator; 274 pass / 0 fail; first
  submission REJECTED by audit for a byte-identity breach, fixed and re-audited match — A8).
  4.1 ACCEPTED at 1aabd37 (STEP-4.1-OK re-run by the orchestrator; 264 pass / 0 fail; audit
  match — its low confidence was execution-only, covered by the orchestrator's own clean-state
  run and plan-time read of light.json).
  4.2 ACCEPTED at 2159560 (STEP-4.2-OK re-run by the orchestrator; 272 pass / 0 fail; carries
  AMENDMENT A7 — the options wrapper div and the no-bind done screen, auditor findings accepted
  as spec imprecision, logged beside QZ-18). **QZ-21 ALREADY DIFFS EMPTY** against the
  hand-derived expectation — re-run it at the phase gate: `node .oplan/word-quiz/quiz-transcript.mjs`
  diffed against `quiz-transcript-expected.txt`.
  Phase 4 is PLANNED IN FULL in plan.md (`## PHASE 4 — the quiz surface`): 11 acceptance criteria,
  contracts QZ-17..QZ-22, six steps 4.1-4.6, five ratified decisions (a)-(e). A fresh planner
  drafted it from files alone; the plan reviewer found ONE real defect (the after-chapter quiz
  state was never reset, so chapter 2+ would silently never quiz) — fixed by chapter-keyed
  `quizState` + `chapterQuizState`; round 2 verdict: ship. See journal "PHASE 4 PLANNING".
  **QZ-21's transcript files are ALREADY WRITTEN by the orchestrator** (quiz-transcript.mjs +
  quiz-transcript-expected.txt, hand-derived), as required BEFORE step 4.2 is dispatched.
  Phases 1 and 3 are CLOSED with owner approval (phase 1 was re-opened by audit once and re-closed
  — full story in the journal). PHASE 2 IS NOT A PHASE (D23): the bank grows by a WEEKLY top-up
  operation; the FIRST top-up is now a phase-6 criterion, or phase 4 ships green but inert.

PLAN: .oplan/word-quiz/plan.md — read it top to bottom; amendments are logged beside what they amend.
DESIGN: .oplan/word-quiz/design.md — FROZEN. D1-D25. Do not re-open any of them.
FIELD GUIDE: .oplan/word-quiz/field-guide/index.md (10 lessons, 50/40, justified in the journal)
BRIEFING: .oplan/word-quiz/briefing.md — the run's story for the human, plain words, append-only.
PREDECESSOR: .oplan/word-audio/ — closed, deployed; its journal holds the deploy recipe + rollback.

BASE for phase 4: commit 5db1d10 · 257 tests / 0 fail · contrast 52 ALL PASS · bank 50 files /
  71 items · LIVE at magic-vet-v12. Ledger target after 4.6: **282** (QZ-20).

ACCEPTED (all phases):
  1.1 — lib/quiz-item.js (amendment A1: rule 10 compares resolved lemmas)
  1.2 — scripts/check-quiz-bank.mjs (A2: sampler stride `Math.floor(i*total/n)`)
  1.3 — public/quiz/ ×50 (A3-numerals: cardinal/number/ordinal fold to `num`)
  3.1 18dbda1 (A3: strikes/quizRight/quizWrong = `Number.isInteger && >= 0`, no upper bound)
  3.2 b273c74 (A4: on a merge the later-`lastQuizAt` side's `lastStrikeSession` wins even when
      ABSENT; compute BEFORE overwriting `existing.lastQuizAt`. One QZ-14 branch knowingly untested
      — journal, step 3.2)
  3.3 76eb416 · 3.4 f9760b2 · 3.5 521ae9b (verified against `git log`, not memory)

FROZEN CONTRACTS IN FORCE:
  QZ-1 (item file, 13 rules) · QZ-2 (generation rules + pin test) · QZ-3 (gate CLI) · QZ-4/QZ-13/
  QZ-19 (per-phase non-goals) · QZ-5 (pilot 50) · QZ-6/QZ-15/QZ-20 (ledger: now 257 -> 282) ·
  QZ-7 (PRECACHE first-party JS only, contrast 52, profile never probed) · QZ-8 (37 excluded
  words) · QZ-9 (six optional word keys, NO BACKFILL EVER) · QZ-10 (quiz-answer action, direct
  key lookup, no resolveLemma, sessionId fails CLOSED) · QZ-11 (session = client-minted opaque
  string; PHASE 4 MUST MINT A FRESH ONE PER SITTING — criterion 3) · QZ-12 (strike table, row 3 is
  `>= 3`) · QZ-14 (merge rules + A4) · QZ-16 (phase-3 transcript, discharged) · QZ-17 (quiz-core
  six exports + frozen comparator) · QZ-18 (quiz.js: text-node order, frozen Hebrew strings,
  session/binding/demoted all frozen) · QZ-21 (phase-4 transcript, orchestrator-written, diff must
  be empty) · QZ-22 (CACHE v13 + exact 14-entry PRECACHE).

THE THINGS MOST LIKELY TO BITE (phase 4 edition):
  · Her profile is LIVE in Vercel Blob behind APP_CODE — unreadable from here, NEVER probe it.
    `GET /api/profile` CREATES a file when absent: temp `DATA_DIR` always; `.data/` must stay empty.
  · `isAuthorized` returns TRUE only when APP_CODE is UNSET — test harnesses must delete it
    (`withOpenGate`), or they 401 on a machine that exports it. 7 of 10 harness copies don't.
  · The contrast gate sees only `:root` tokens; raw hex is invisible, `color-mix()` fabricates a
    pass; the anchor is `grep -c '^PASS'` = 52 (bare `grep -c PASS` = 53).
  · `npm test` ledger counts only FLAT top-level `test()` calls.
  · Validation chains: capture output to a variable and `case`-match; `| grep -q` under pipefail
    SIGPIPEs the producer.

OPEN QUESTIONS: none. BLOCKED: no.
