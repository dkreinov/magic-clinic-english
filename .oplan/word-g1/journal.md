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

STEP 1.7 sandbox visual gate (ORCHESTRATOR, self-served per owner directive / field guide 12)
  did: sandbox profile backed up to ~/g1-scratch/sandbox-profile.bak; fixture camp=candidate
    (nominations 1) + desk=learning; dev server on the sandbox DATA_DIR; fresh Playwright
    browser (its chromium profile was recreated after killing 10 orphan chrome processes that
    held it locked — the two launch failures were a locked profile, not the app); page
    http://localhost:3000/#/words; screenshot saved: ~/g1-scratch/step17-badge-audit.png.
  VERDICTS (all recorded from the screenshot + accessibility tree):
    (1) PASS — "כמעט יודעת" renders on one line inside its pill, legible, no overflow.
    (2) PASS — purple candidate badge clearly distinct from teal יודעת and amber לומדת.
    (3) PASS — RTL row correct: LTR lemma right, badge left, speaker + claim button between,
        no collisions (camp row shows all four elements cleanly).
    (4) PASS — the claim button on the candidate row (camp) is visibly identical to the one on
        the learning row (desk).
    (5) PASS — every other row/element matches the live v15 look (Sunrise Parchment cards,
        launcher, nav unchanged).
  taste items for the owner (non-blocking, from the plan's record-gap 3): the badge colour
    (purple, --color-primary@18) was chosen by the plan, not the owner — named in the
    post-deploy report.
  sandbox profile RESTORED byte-from-backup (12/12 known again); server stopped; repo clean.
  tokens: orchestrator-only step. STEP-1.7-RECORDED.

STEP 1.8 D25 capture (ORCHESTRATOR)
  did: frozen subshell GET -> 200; BACKUP OK bytes=7525 words=20 known=12 candidate=0;
    APP_CODE leak post-assert passed; sha256 + path in backup-receipt.txt; repo clean;
    .data/profile.json absent. BK=/c/Users/dkreinov/english-app-backups/profile-20260728-135019.json
  D27 rider: owner NOT yet asked mid-run (autonomous mode; deletion is a close-time action) —
    the question goes in the phase-close report; default until answered: KEEP the backup.
  STEP-1.8-OK.

STEP 1.9 deploy v16 (ORCHESTRATOR)
  did: vercel inspect BEFORE deploy: live id = dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn (hard stop
    passed), its true deployment url = english-2wkxdnp9g-dkreinovs-projects.vercel.app —
    recorded in ~/g1-deploy/outgoing.txt; this CORRECTS the inherited rollback line, which
    pointed at english-d0roovfpq (v14's url). Deploy: TWO invocations both completed (the
    first call's output was truncated by tail, misread as guidance; both built identical
    HEAD bytes) — live is the newest: dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc
    (english-g80h5gnd9), aliased to english-app-three-tan.vercel.app.
  validation: DEPLOY-V16-OK — public/ enumeration since 265dc86 exactly sw.js+views/words.js;
    both md5 live==worktree; live sw v16, no v15; health byte-exact; /api/chapter 401.
  ROLLBACK (code only, corrected):
    "$(npm prefix -g)/vercel" rollback https://english-2wkxdnp9g-dkreinovs-projects.vercel.app --yes

STEP 1.10 read-back (ORCHESTRATOR)
  did: frozen subshell GET -> 200; READBACK OK words=20 candidates=0; zero keys lost; status
    changes: none; APP_CODE leak post-assert passed. STEP-1.10-OK.
  note: candidates=0 is the measured, expected outcome — G1 runs at the NEXT chapter
    generation; nothing has generated a chapter since the deploy.

PHASE 1 CLOSED (2026-07-28) — PHASE-1-ALL-CRITERIA-OK (11/11, re-run from clean tree)
  steps: 10 (6 WORKER + 4 ORCHESTRATOR), worker first-try validation: 4/6 (1.1 intervention,
    1.3 audit-mismatch fix cycle)
  escalations: 0
  interventions: 1 (1.1, bad-spec: contradictory frozen contract; ruled + plan amended)
  audit results: 6/6 match (1.3 on second pass after a one-line contract-drift fix)
  cost: worker=397125 tok, checker=288574 tok, planner=111105 tok (plan reviewer; phase-1
    planner usage unavailable) — grand known 796,804 tokens (computed by python, journal rule).
    Dollar figures: unavailable (no per-model pricing readout in this harness session).
  orchestrator_context: unavailable (no programmatic /context readout; session spans planning
    through close in one window)
  field_guide: 76/40 lines — over budget, justified: lessons 13 (shells eat escapes — bit TWICE
    today in two different costumes) and 14 (signed-document wrapper text — survived two review
    layers) both change future agent behaviour; re-curation deferred to the phase-2 boundary
    where the guide is re-cut for quiz-side work.
  D27 rider: owner question OPEN (asked in the phase-close report; backup KEPT until answered).

D27 RIDER ANSWERED (owner, 2026-07-28, in chat at the phase-1 close): "Delete it now (as last
run)". Executed strictly AFTER the read-back and the 11/11 criteria re-run: the phase-1 capture
profile-20260728-135019.json is DELETED; the backups folder is empty again. Stated plainly, as
the rider requires: NO captured copy of her profile now exists — the safety net for the phase-1
deploy has ended; phase 2's own D25 capture will precede its first profile-writing deploy.
backup-receipt.txt keeps only the sha256 + counts (never contents), retained as the record.

## PHASE 2 PLANNING (2026-07-28)

Fresh session (phase-boundary /clear per the handoff). Baseline re-verified by the orchestrator
before planning: git clean at 558a5bc · npm test 291/0 · contrast grep -c '^PASS' = 52 · live
/sw.js line 1 = magic-vet-v16. Frozen contracts re-acknowledged. D27 rider: already answered
and executed at the phase-1 close (nothing pending).

Fresh planner (Opus, files only, read-only mandate) returned the full 11-step phase-2 plan now
in plan.md ("PHASE 2 IN FULL"): 12 acceptance criteria; 2.1 ORCHESTRATOR (hand-derived
transcript gate written BEFORE the code, proven able to fail), 2.2-2.7 WORKER (candidate branch
in applyQuizAnswer + B5 clock reset, pickCandidateWords shadow-projection quota, QZ-25 soft
line, call-site merge in both views, adversarial episode 6, CACHE v17), 2.8-2.11 ORCHESTRATOR
(sandbox visual gate, D25 capture, deploy, read-back). BLOCKERS: none. RECORD GAPS: 7, all
frozen in the plan with reasons (candidate slot FIRST; a correct answer mirrors markWordKnown's
three deletes and leaves lastSeen alone; needsReview untouched on wrong; D27 rider = KEEP until
the owner answers at close; rollback url only ever from vercel inspect; soft line reuses
.quiz-demoted with no new CSS; ledger re-derived 286 flat + 5 subtests = 291).

ORCHESTRATOR VERIFICATION of the planner's claims against the tree:
- CONFIRMED: per-file flat counts 10/7/8/11/11/5; 286+5=291; QZ-21 transcript diffs EMPTY
  today; public/ byte-unchanged 70d0aa7..558a5bc; quiz-core 'known' comparisons = 2 and the
  pickQuizWords signature frozen; 4 CRLF files + sw.js LF; growth.md:486 = design.md:491 = the
  soft line (em dash U+2014); §10 amendment licence quoted correctly; quiz-experience harness
  helpers exist as named (makeContainer IS the mock 2.4's probe copies); baseForms identity for
  lantern/pebble/kettle; sandbox profile 12/12 known, 1 chapter, all 12 with bank items;
  light.json items[1] is the QZ-21 lamp item; the expected-file bodies quoted in 2.1 match
  QZ-21 screens 1 and 4 except the demotion line; bind() survives the stub container; the
  demoted chain evaluates true against 2.4's stub post; markWordKnown deletes exactly the three
  keys 2.2's correct-branch mirrors.
- WRONG and AMENDED (plan amendment #1, before review): step 2.3's validation pinned
  `grep -cF "status === 'known'"` at 3 post-edit, but the frozen contract's shadow ASSIGNS
  `status: 'known'` and never COMPARES it — the count stays 2 and the validation would have
  failed a correct implementation (intervention-#1's bad-spec class, caught at plan time this
  time). Fixed in plan.md with an inline note.

PLAN REVIEW (Sonnet, fresh): VERDICT ship, findings none. It independently verified every cited
line number, both transcript claims, the 291→298 ledger arithmetic, the contrast count, and the
fixture ordering math.

tokens: planner=237863 · reviewer=119691. Execution mode: AUTONOMOUS (owner opt-in in the
handoff prompt) — briefing printed, no go-ahead wait. The one owner question of the phase (the
D27 delete rider for the NEW capture) is asked in the phase-close report; default until
answered: KEEP (record gap 4).

$BASE (phase 2) = 558a5bc (recorded before step 2.1; every plan-time commit is .oplan-only).

STEP 2.1 the hand-derived candidate transcript, written BEFORE the code (ORCHESTRATOR)
  did: g1-transcript.mjs + g1-transcript-expected.txt written by a build script from the plan's
    frozen blocks (never a heredoc — field guide 13); every line cross-proven against its
    SOURCE: screen bodies byte-equal QZ-21 expected screens 1/4, the soft line extracted from
    docs/growth.md:486 (34 codepoints, U+2014 confirmed), the hard line from public/quiz.js:171;
    the mjs embeds NO raw Hebrew demotion line. validate-2.1.sh..validate-2.7.sh extracted
    verbatim from plan.md as files.
  surprises: the plan's prose says the expected file is "EXACTLY these 55 lines" — the frozen
    block itself is 59 lines. No frozen validation pins that number; recorded as a planner
    prose slip, not an amendment. The quoted block is the contract and is what was written.
  validation: bash .oplan/word-g1/validate-2.1.sh → EXPECTED-SHAPE-OK · GATE-CAN-FAIL-OK
    (the gate is RED against today's code, as required) · STEP-2.1-OK
  tokens: orchestrator-only step.
  commit: (this commit)
  accepted: 2026-07-28

## INTERVENTION #1 (phase 2) — step 2.2 stopped-with-question (2026-07-28)

The executor (Sonnet) implemented the frozen branch verbatim, then stopped correctly: the
frozen validation's live probe built its fixture as a bare `{ words: {...} }` object, which
`validateProfile` rejects for six missing top-level keys NO MATTER what applyQuizAnswer does —
the probe could never pass any implementation. Orchestrator verified: bare fixture → ok:false
(version/learner/skills missing...); defaultProfile()-based → ok:true. Reason class: bad-spec
(a frozen validation contradicting reality). Planner AND both verification layers missed it;
the executor's stop-rule caught it — the third bad-spec catch of the run, third different
layer. RULING: mk() rebuilt on m.defaultProfile() in plan.md + validate-2.2.sh (inline AMENDED
note). Re-dispatched to the same executor. interventions=1 (phase 2).

STEP 2.2 B2 + B5's clock reset — the candidate branch in applyQuizAnswer
  tier: WORKER (Sonnet)
  did: lib/profile.js: frozen candidate branch inserted verbatim BEFORE the strike machinery.
       tests/profile-quiz-answer.test.js: knownLemmaSet import + 2 flat tests (wrong path with
       known-word negative control; right path with learning-word negative control), fixtures
       on defaultProfile(). Ledger 293.
  surprises: FAIL-FIRST mutation (iii) (branch moved below the correct-block) broke test 12,
    not test 11 as the packet predicted — sound mechanical reason (the wrong path still reaches
    the branch); placement still proven to matter. Flagged, not silently reconciled.
  deviations: none
  validation_first_try: no (first attempt hit the bad-spec probe fixture — INTERVENTION #1;
    passed first try after the ruling)
  retries: 1 (pre-question) + 0 (post-ruling)
  escalations: 0
  tokens: worker=59266+77542=136808, checker=40274, orchestrator_delta=unavailable
  interventions: 1 (bad-spec: frozen probe fixture could never validate; ruled and amended)
  fail-first: (i) lastSeen-reset deleted -> not ok 11; (ii) condition widened to !== 'known' ->
    not ok 12 (+expected collateral 1,3); (iii) branch below correct-block -> not ok 12
  audit: match / high (whitespace nit = diff-alignment illusion; bytes as contracted)
  commit: 0621b1e
  accepted: 2026-07-28

STEP 2.3 B3's quota — pickCandidateWords in public/quiz-core.js
  tier: WORKER (Sonnet)
  did: public/quiz-core.js: frozen pickCandidateWords appended verbatim (shadow projection
       through the untouched QZ-17 comparator), CRLF preserved. tests/quiz-core.test.js: import
       extended + 1 flat test (quota, ranking, negative control, purity). Ledger 294.
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=51536, checker=31666, orchestrator_delta=unavailable
  interventions: 0
  fail-first: (i) shadow keeps entry.status -> not ok 8 (expected ['aaa'] got []);
    (ii) default limit 20 -> not ok 8 (got all four); both reverted byte-identically
  audit: match / high
  commit: (this commit)
  accepted: 2026-07-28
