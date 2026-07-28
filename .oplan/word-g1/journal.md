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

STEP 1.2 candidate legal; B4 merge precedence; nominations field
  tier: WORKER (Sonnet)
  did: lib/profile.js: WORD_STATUSES + candidate; STATUS_RANK; nominations validator;
       rank-based status merge; nominations max-merge. tests/profile-candidate-schema.test.js:
       3 flat tests (schema, rank+max+idempotence, pre-G1 guard).
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=56645, checker=35736, orchestrator_delta=unavailable
  interventions: 0
  fail-first: mutation (d) known-wins -> test 2 FAILED; mutation (e) Math.min -> test 2 FAILED;
    both reverted byte-identically (worker pasted both failing lines)
  audit: match / high
  commit: (this commit)
  accepted: 2026-07-28

STEP 1.3 promoteToCandidate — the G1 rule with the B5 cap
  tier: WORKER (Sonnet)
  did: lib/profile.js: vocab import + frozen promoteToCandidate block appended (two constants
       exported). tests/profile-promote-candidate.test.js: 4 flat pure tests (threshold+negative,
       inflection+clock, known/candidate untouched + knownLemmaSet gate, cap+idempotence).
  surprises: worker fixture bug on first inflection test (quiet=1, fixed); worker wiped its own
    uncommitted edits with `git checkout --` mid-mutation-testing and rewrote from its backup.
  deviations: none claimed — but the rewrite left ONE contract drift: raw curly quotes in the
    regex class instead of the frozen ‘’ escapes. AUDIT CAUGHT IT (mismatch #1).
    Orchestrator applied the one-character-class fix directly (scripted, counted exactly 1
    occurrence), re-ran the full frozen validation + a live curly-apostrophe probe
    (CURLY-NORMALISATION-OK), and the re-audit returned match/high (codepoint dump: no
    non-ASCII left in the appended block).
  validation_first_try: no (worker retried once on its fixture; orchestrator validation passed
    both runs)
  retries: 1 (worker) + 1 fix cycle (orchestrator, post-audit)
  escalations: 0
  tokens: worker=118235, checker=40516+45639, orchestrator_delta=unavailable
  interventions: 0 (the fix followed a first-mismatch audit verdict, logged here)
  audit: mismatch (curly-quote drift) -> fixed -> match / high
  commit: (this commit)
  accepted: 2026-07-28

STEP 1.4 api/chapter.js call site
  tier: WORKER (Sonnet)
  did: api/chapter.js: import + frozen 4-line comment + promoteToCandidate(p) before
       generateChapter. tests/api-chapter.test.js: ONE appended end-to-end test
       (learning->candidate persisted through the handler; ledger 290).
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=42646, checker=46873, orchestrator_delta=unavailable
  interventions: 0
  fail-first: call commented out -> sole failure "not ok 9 - POST generate promotes a quiet
    learning word to candidate and saves it"; restored byte-identically
  audit: match / high
  commit: (this commit)
  accepted: 2026-07-28

STEP 1.5 the third badge + surviving claim button (B6 i/ii)
  tier: WORKER (Sonnet)
  did: public/views/words.js: statusBadge candidate branch (badge text from design.md, CRLF
       preserved); knowHtml condition gains candidate; VIEW_STYLE .word-badge.candidate rule
       (primary@18 over card — already gate row "card icon on its plate", anchor stays 52).
       tests/words-ui.test.js: one appended test, Hebrew as \u escapes (ledger 291).
  surprises: bash -e collapsed \u escapes into raw Hebrew on the worker's first write; it
    caught this by codepoint inspection and switched to a script file (field-guide-8-shaped
    trap in a new costume — promoted candidate for the field guide).
  deviations: none (edits via node scripts to guarantee CRLF + literal escapes)
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=73944, checker=35911, orchestrator_delta=unavailable
  interventions: 0
  fail-first: (i) badge branch deleted -> only the new test failed; (ii) condition narrowed
    back to learning-only -> only the new test failed; both restored byte-identically
  audit: match / high (CRLF + \u escapes confirmed at byte level)
  commit: (this commit)
  accepted: 2026-07-28

STEP 1.6 CACHE bump v15 -> v16
  tier: WORKER (Sonnet)
  did: public/sw.js:1 CACHE = magic-vet-v16; tests/shell.test.js:58 pin moved in lockstep.
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=31201, checker=25166, orchestrator_delta=unavailable
  interventions: 0
  audit: match / high
  commit: (this commit)
  accepted: 2026-07-28
