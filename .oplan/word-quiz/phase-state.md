CURRENT: **PHASE 4 CLOSED 2026-07-27. ALL ELEVEN CRITERIA MET — the owner read the three-screen
  transcript and approved ("yes approve, go ahead"), with the unchecked things stated alongside.**
  Offered deploy-first explicitly, the owner did not take it; the plan's order stands.
  **D26 (owner, 2026-07-27): DEPLOY FIRST.** Phase 5 (G1) is DEFERRED to its own future run,
  gated on growth.md being amended per the brief and SIGNED — the fresh planner found it
  unsigned and G1 unimplemented (verified; see journal "PHASE 5 PLANNING", which also holds the
  conditional plan + 7 blockers for that future run).
  NEXT ACTION: **execute PHASE 6, starting at step 6.1.** Phase 6 is PLANNED IN FULL in plan.md
  (13 criteria incl. two human gates; 12 steps; D27 = backup dir + capture-only + delete-at-close
  rider; frozen capture command; review verdict ship after 6 findings fixed). ROLLBACK TARGET:
  `"$(npm prefix -g)/vercel" rollback https://english-d0roovfpq-dkreinovs-projects.vercel.app --yes`
  (id dpl_4b6XjMSa2HRUN4a2s48cdsT6u2Z1) — restores CODE ONLY.
  Six steps accepted: 4.1 1aabd37 · 4.2 2159560 (A7) · 4.3 70ac7c1 (A8) · 4.4 93847b8 ·
  4.5 e4147aa · 4.6 90112d1.
  Ledger 257 -> 264 -> 272 -> 274 -> 277 -> 277 -> **282**, `# fail 0`. Contrast 52 ALL PASS.
  Bank untouched (50 files / 71 items). Shell at magic-vet-v13, both quiz modules precached.
  `.data/profile.json` absent. Exactly the 11 expected files across `5db1d10..HEAD`, none
  deleted (criterion 6 under A9: `LC_ALL=C sort` — locale collation broke the frozen comparison
  with both sides EQUAL; instrument fixed, property untouched).
  QZ-21: transcript vs hand-derived expectation DIFF EMPTY, at 4.2 acceptance AND at the gate.
  8 mutations run (4.2, 4.6), all caught. The independent 4.6 agent found NO defect.
  THREE AMENDMENTS this phase, all logged in plan.md beside what they amend:
  **A7** (4.2) — options wrapper div + no-bind done screen: spec imprecision, accepted.
  **A8** (4.3) — the auditor caught a REAL byte-identity breach (whitespace line in renderList);
  rejected, fixed by same-line concatenation, re-audited match.
  **A9** (gate) — criterion 6 needs `LC_ALL=C sort`; bare sort collates by locale.
  KNOWN WART, recorded: renderChapter's local `stage` shadows the view's outer `stage`
  (reader.js). Harmless today; a future reader.js edit should rename one of them.

CARRY INTO PHASE 5/6 — what phase 4 learned that no phase-4 test can enforce:
  · **The quiz is INERT until the first top-up runs** — the bank holds only the 50 pilot words.
    The first top-up is a PHASE 6 criterion (run it before or with the deploy).
  · **No phase has rendered in a real browser.** The owner's first look at the deployed app is
    the run's only CSS/RTL check. Phase 6 must say so at its gate.
  · Phase 5 (candidate status) touches `WORD_STATUSES` and promotion — quiz-core's
    `pickQuizWords` filters on `status === 'known'` EXACTLY; a new `candidate` status is
    invisible to the quiz until phase 5 decides otherwise. That is currently CORRECT per D12
    (a candidate must pass a quiz to become known — phase 5 will need its own entry point).
  · `docs/growth.md`'s "nothing ever demotes" line is now FALSE in the code but the doc edit is
    deliberately deferred to phase 6 (QZ-13).

PLAN: .oplan/word-quiz/plan.md — read top to bottom; amendments live beside what they amend.
DESIGN: .oplan/word-quiz/design.md — FROZEN, D1-D25. Do not re-open.
FIELD GUIDE: .oplan/word-quiz/field-guide/index.md (10 lessons, 54/40, justified in the journal)
BRIEFING: .oplan/word-quiz/briefing.md — append-only, for the human.
PREDECESSOR: .oplan/word-audio/ — its journal holds the deploy recipe + rollback for phase 6.

ACCEPTED (all phases): 1.1 · 1.2 · 1.3 (phase 1, re-closed after audit; owner approved) ·
  3.1 18dbda1 · 3.2 b273c74 · 3.3 76eb416 · 3.4 f9760b2 · 3.5 521ae9b (phase 3, owner approved) ·
  4.1 1aabd37 · 4.2 2159560 · 4.3 70ac7c1 · 4.4 93847b8 · 4.5 e4147aa · 4.6 90112d1 (phase 4,
  criteria 1-10 green, owner gate pending).

FROZEN CONTRACTS IN FORCE: QZ-1..QZ-16 (phases 1-3, see plan.md) · QZ-17 (quiz-core six exports,
  frozen comparator) · QZ-18 (quiz.js text-node order + frozen Hebrew + session/binding/demoted;
  A7) · QZ-19 (phase-4 non-goals) · QZ-20 (ledger, now AT 282) · QZ-21 (the transcript pair in
  this workspace) · QZ-22 (CACHE magic-vet-v13 + the exact 14-entry PRECACHE).

THE THINGS MOST LIKELY TO BITE (unchanged, plus one):
  · Her profile is LIVE in Vercel Blob behind APP_CODE — never probe; temp DATA_DIR always.
  · isAuthorized is TRUE only when APP_CODE is UNSET — withOpenGate in every handler test.
  · Contrast anchor: `grep -c '^PASS'` = 52. · Ledger counts FLAT top-level test() only.
  · Frozen comparisons need `LC_ALL=C sort` (A9) and capture-and-case, never `| grep -q`.

OPEN QUESTIONS: none. BLOCKED: no.
