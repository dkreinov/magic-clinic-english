# Journal — word-g1 (append-only)

## RUN OPENED (2026-07-28)

Seeded from .oplan/word-g1/phase-state.md (owner decisions of 2026-07-28, binding).
Workspace created: design.md = verbatim copy of the SIGNED growth-amended-DRAFT.md
(.oplan/word-quiz/night/growth-amended-DRAFT.md §12 signed "Q2. accept", B1-B7 accepted as
written). field-guide/index.md = inherited verbatim from word-quiz-reskin (12 lessons, binding;
64 lines — over the 40 budget, justification inherited from the reskin journal; re-curate at the
first phase boundary of THIS run).

Baseline re-verified by the orchestrator before any planning:
- git clean at 35d1ebe
- npm test: 282 tests / 282 pass / 0 fail
- APP_CODE=dummy npm test: 282 / 282 / 0
- node scripts/check-contrast.mjs | grep -c '^PASS' = 52
- live: magic-vet-v15, dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn

Next: fresh phase-1 planner (Opus, files only), then plan review, then execute.

## PHASE 1 PLANNING (2026-07-28)

Fresh planner (Opus, files only, read-only mandate) returned the full 10-step plan now in
plan.md: 11 acceptance criteria, steps 1.1-1.6 WORKER (growth.md copy, schema+B4, promoter+B5
cap, call site, badge+claim button, CACHE v16), 1.7-1.10 ORCHESTRATOR (sandbox visual gate,
D25 capture, deploy, read-back), phases 2-3 as skeletons. BLOCKERS: none. RECORD GAPS: 6, all
worked around in the plan itself (growth.md header wording, "appeared" = chapter.text only,
badge colour = --color-primary@18 reusing contrast row 19, B5 clock-reset deferred to phase 2
with the B2 branch, stale HEAD pointer in the seed, planner could not run the suite).

ORCHESTRATOR VERIFICATION of the planner's claims against the tree:
- CONFIRMED: contrast pair check-contrast.mjs:27 (primary on primary@18 mix) exists — anchor
  stays 52 with no gate edit. PRECACHE array matches byte-for-byte. sw.js:1 = v15. shell.test.js:58
  pins v15. story.js:134 normalisation as quoted. vocab exports tokenize/baseForms. words.js CRLF.
  backups dir exists and is empty. git diff 265dc86..HEAD -- public/ EMPTY. growth.md still
  AWAITING-OWNER-SIGN-OFF. api-chapter.test.js already imports every helper the 1.4 test needs.
- WRONG and AMENDED (plan amendment #1, before review): step 1.4 pinned api-chapter.test.js at
  11 flat tests pre-edit / 12 post; the true count is 8 / 9. Validation and note corrected in
  plan.md. The planner's own stop-rule ("if not 11, STOP") would have caught it at execution;
  caught at plan time instead.

PLAN REVIEW (Sonnet, fresh): VERDICT ship, findings none. It independently re-ran npm test
(282/0 twice), the contrast gate (52), verified every cited line number byte-for-byte, the
638-line growth.md arithmetic, the empty public/ diff since 265dc86, the untracked workspace
files, .env APP_CODE present, and the live deployment id dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn
matching step 1.9's hard stop.

tokens: planner=unavailable (output 68.8KB; harness gave no usage readout for the call) ·
reviewer=111105. Execution mode: AUTONOMOUS (owner opt-in in the handoff prompt) — briefing
printed, no go-ahead wait. The one owner question of the phase (D27 delete-at-close rider) is
asked at step 1.8 per the seed; if unanswered, the SAFE default is KEEP the backup and put the
deletion decision in the close report.

## INTERVENTION #1 — step 1.1 stopped-with-question (2026-07-28)

The executor (Sonnet) stopped correctly: the frozen contract said "copy source lines 9-643
verbatim" while the frozen validation forbids the string AWAITING-OWNER-SIGN-OFF — and source
line 643 contains it (the closing STATUS note describes the PRE-copy world: "…which still reads
AWAITING-OWNER-SIGN-OFF until then"). Planner and plan reviewer both missed it; the escalation
rule caught it at the cost of one round trip. Reason class: bad-spec (contradictory contract).

ORCHESTRATOR RULING (same category as Record Gap #1, the header): the source's closing 2-line
STATUS note (lines 642-643) is self-referential wrapper text, not signed content. The copy is
now lines 9-641 (through the "Signed: the owner…" line, every signed decision intact) plus a
frozen 1-line post-copy note. docs/growth.md = 637 lines. plan.md step 1.1 and acceptance
criterion 5 amended. One line for the owner to overrule, as with the header.

Worker left a clean tree (reverted before stopping). Re-dispatched to the same executor with
the amended contract. interventions=1 (bad-spec).

STEP 1.1 docs/growth.md becomes the signed document of record
  tier: WORKER (Sonnet)
  did: docs/growth.md rewritten programmatically: frozen 3-line SIGNED header +
       design.md lines 9-641 byte-for-byte + frozen 1-line closing STATUS note; 637 lines.
  surprises: source line 643 contained AWAITING-OWNER-SIGN-OFF (see INTERVENTION #1).
  deviations: none (amended contract followed verbatim)
  validation_first_try: no (first attempt hit the spec contradiction; passed first try after
    the ruling)
  retries: 2 (1 pre-question, 1 post-ruling)
  escalations: 0
  tokens: worker=35890+38564=74454, checker=58733, orchestrator_delta=unavailable
  interventions: 1 (bad-spec: contradictory frozen contract, ruled and amended)
  audit: match / high (byte-identical reconstruction, 41064 bytes)
  commit: (this commit)
  accepted: 2026-07-28
