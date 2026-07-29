# Journal — word-trophies (append-only)

## RUN OPENED (2026-07-29)

Owner picked trophies/achievements as the next run (design.md §9 item 7 of word-g1's signed
design), explicitly jumping the signed order past the parent view (deferred by the owner on
2026-07-28 in favor of an on-demand report — see the grill record below), G2 (blocked behind
visibility), W3, and daily review. The deviation is deliberate and owner-ordered.

GRILL (2026-07-28/29, /grill-me): decisions locked before this run opened:
- Reward focus: BOTH families, tiered — showing-up (days active, chapters) AND learning
  (words known, quiz wins, confirmed nominations).
- Surface: a DEDICATED trophies screen in the nav + in-the-moment celebration on earn.
  Owner chose the biggest option knowing nav/shell tests move.
- State: STORED IN HER PROFILE, server-side — awarded at the moments the server already
  holds and saves the profile (the G1 promoter precedent). A profile-schema change: the
  most-guarded surface in the project. Chosen informed.
- Catalogue: ~8 trophies, bronze/silver/gold thresholds; every Hebrew name and threshold
  gets explicit owner approval before deploy (D28-style gate).
- Trophies NEVER regress; nothing is ever shown negatively (no broken-streak shaming).
- Thresholds are chosen WITHOUT usage data (the parent report is v0/on-demand only) — the
  design must say so and expect tuning.
- A profile-writing run ⇒ full safety ritual: fresh D25 capture before any deploy;
  read-back rules extend to the new trophy fields.

Also standing from the same conversation (affects this run's context, recorded so no
future agent trips on it): the owner's on-demand parent REPORT decision — keep dated
profile snapshots in C:/Users/dkreinov/english-app-backups/ from now on (reverses the
delete-by-default habit; the phase-3 D27 delete was executed BEFORE this decision, so the
folder is currently empty); report = v0 by hand on request, v1 script only after the
format survives 2-3 real reports. And: her phone was found serving the STALE pre-parchment
dark theme (fix = close/reopen or reinstall; her data is server-side and safe).

Field guide seeded from word-g1 (12 lessons incl. the autocrlf trap).
Baseline at open: word-g1 closed at 1027764 · suite 303/0 · contrast 52 · live magic-vet-v17
(dpl_88eKj1qha7SWcsuHwsNCmh7NHfvw) · NO captured copy of her profile exists.

NEXT: design.md drafted by the orchestrator from the grill + codebase facts; OWNER SIGNS
before phase-1 planning.

OWNER DIRECTIVE (2026-07-29, mid-open): trophies must ship with ARTWORK in the same
style as the app's existing images — real image assets, created for this run. Generation
follows the standing owner preference: build-time assets via the free ChatGPT web route,
never the paid API. The design must specify the asset pipeline (prompts, sizes, format,
precache implications) as a first-class deliverable.

## DESIGN SIGNED (2026-07-29)

Hebrew audit (owner-requested) ran before signature, grounded against the live app strings
(the app says TIRGUL everywhere, never HIDON; badge ladder lomedet -> kim'at yoda'at ->
yoda'at). Outcome: 3 renames adopted — chapters = HARPATKANIT (she launches/reads adventures,
does not tell them), quizRight = ALUFAT HA-TIRGUL (register consistency with the app's own
word), proven = BE'EMET YODA'AT (echoes the badge ladder; MOKHIHA rejected as ambiguous —
everyday sense "rebukes"); tab label = HA-GVI'IM SHELI (pattern-matches HA-MILIM SHELI).
5 names kept as proposed. Owner also asked "better in English?" — ruled NO (reward must land
in her strongest language; off-band unglossed English violates the app's own vocabulary
discipline; bidi risk), recorded in design §7.

Owner signed all §8 rows 2026-07-29 ("ok go") with the audit edits. Design STATUS: SIGNED.
NEXT: phase 1 (the engine) — fresh planner (Opus, files only), review, briefing, go-ahead.

## PHASE 1 PLANNING (2026-07-29)

Fresh planner (Opus, files only, read-only-of-the-repo; measured its claims in an isolated
scratch prototype) returned the 5-step phase-1 plan now in plan.md: 13 acceptance criteria,
a shared VAL-COMMON validation preamble (suite plain+gated, flat ledger, contrast 52, a
public/ byte DIGEST pin 2362/74e736d7..., both transcripts, per-file CRLF/LF byte pins, raw
non-ASCII gate on the new test file), SK-1..SK-6 skeleton refinements — notably SK-1: T2's
literal "after promoteToCandidate" position is WRONG (measured: awarding pre-push misses the
new chapter; frozen to immediately-before-saveProfile, post-push) and SK-3: the Hebrew names
stay OUT of lib (view-layer data, phase 3, extracted never retyped). Ledger plan:
298 -> 301 -> 311 -> 318 -> 323 flat (306/316/323/328 reported). BLOCKERS: none.
RECORD GAPS: 7 (biggest for later phases: api/chapter.js returns NO profile, so T5's
celebration-from-chapter-response needs a phase-3 ruling).

ORCHESTRATOR VERIFICATION: digest, endings (142/64/137/558), every quoted anchor, harness
files, GOOD_TEXT:91, bytes-unchanged GET test — ALL CONFIRMED. AMENDMENT #1 (pre-review):
(a) 1.4/criterion-11 ending pins 143->146, 65->67 — the frozen edits insert COMMENTED blocks
and the planner pinned bare 1-line inserts; a correct implementation would have failed the
frozen gate (bad-spec, caught at plan time, word-g1's 2.3 class); (b) transcript scratch out
of the repo; (c) PORC .oplan filter (whose backslash promptly collapsed in transit and was
re-fixed — lesson 8, costume N+1).

PLAN REVIEW (Sonnet, fresh): VERDICT fix-first — 4 findings, all validation-class, zero
undecided: steps 1.2/1.3/1.4 ended in git commit with no git add (verified failing in a
scratch repo), and VAL-COMMON's DELS gate was narrower than criterion 10. AMENDMENT #2:
step COMMANDS lose git entirely (commits are the orchestrator's at acceptance, house
practice), DELS widened. Re-review not required: both fixes are the reviewer's own
prescriptions applied verbatim.

tokens: planner=193144 · reviewer=124760. Execution mode: NOT YET DECLARED — asked in the
briefing (word-g1 ran autonomous by explicit owner opt-in; this run has none yet).
$BASE (phase 1) = recorded at go-ahead, immediately before step 1.1.

## PHASE 1 EXECUTION OPENED (2026-07-29)

GO received (owner continuation prompt, fresh orchestrator session — Fable). Execution mode:
AUTONOMOUS WITHIN PHASE 1 (the owner delegated the call in the continuation prompt; ruled by
the orchestrator), with the standard pause at the phase-1 close — phase 2 needs a fresh
planner and the owner's per-asset art gate regardless, and the skill forbids self-initiated
continuous mode across phases.

Baseline re-verified in this session before any dispatch: tree clean at 1a30012 · npm test
303 pass / 0 fail · contrast grep -c '^PASS' = 52 · live /sw.js on the canonical alias
(english-app-three-tan.vercel.app) opens with CACHE = "magic-vet-v17" · .data/profile.json
absent · C:/Users/dkreinov/english-app-backups/ empty (no D25 capture exists — correct; one
is made only in phase 4, before deploy).

FROZEN CONTRACTS RE-ACKNOWLEDGED (phase-state.md list, in force verbatim): word-g1
phase-state:34-42 (transcripts diff empty forever · QZ-22 next bump v18 · contrast anchor 52
· APP_CODE subshell rules · never probe the live profile) · signed design T1-T10 · plan pins
(ledger 298->301->311->318->323 flat, public/ digest 2362 74e736d7d83b22a24945eae87cb9fe33
byte-frozen all phase, per-file CRLF/LF pins, frozen error strings, mandated fail-first per
step, workers never run git writes — commits are the orchestrator's at acceptance).

$BASE (phase 1) = 1a30012991130cf0032c1743d0448a4c509509ac

STEP 1.1 the schema (T1)
  tier: WORKER (Sonnet)
  did: lib/profile.js — added export const TROPHY_TIERS after WORD_SOURCES; added trophies: {}
    to defaultProfile between story/meta; added trophies validation block (4 frozen error
    strings) before the meta block. tests/profile.test.js — inserted trophies: {} into the
    schema-v1 pin. tests/trophies.test.js — created, 3 flat tests as specified.
  surprises: none of substance (worker noted the orchestrator's own journal.md edit in
    porcelain; the frozen .oplan filter excluded it as designed).
  deviations: worker used python io.open(newline='') for all mutations instead of the Edit
    tool, per the mandated byte-preserving rule — no content deviation.
  fail-first observed (full evidence was in HOME/trophies-val/step-1.1-failfirst.txt):
    M1.1a -> "not ok 1 - defaultProfile produces the expected schema-v1 shape" AND
             "not ok 12 - defaultProfile carries an empty trophies map"; restored, all pass.
    M1.1b -> "not ok 3 - validateProfile rejects a non-object trophies, a non-object trophy
             entry, an unknown tier key, and an unparseable award timestamp"; restored, pass.
    M1.1c -> "not ok 2 - validateProfile accepts an absent trophies key, an empty map,
             unknown trophy ids, and all three tier keys"; restored, pass.
  validation_first_try: yes (orchestrator re-ran the frozen block from its own copy: RC=0;
    306/0 plain and gated, plan 1..301, flat 301, contrast 52, digest unchanged, transcripts
    empty, endings lib 0/590 · api/profile 0/142 · api/chapter 64/0 · profile.test 0/138 ·
    trophies.test 0/52, DELS 0, PORC exact)
  retries: 0
  escalations: 0
  tokens: worker=64238, checker=31086, orchestrator_delta=unavailable
  interventions: 0
  auditor: match, confidence high, findings none
  commit: f5212c5
  accepted: 2026-07-29T13:04:10Z

STEP 1.2 the catalogue and its metrics (T3)
  tier: WORKER (Sonnet)
  did: appended frozen trophies block (trophyDay/wordEntries/chapterList/activeDays/
    longestStreak/countNum/TROPHY_CATALOG) at EOF of lib/profile.js; added a NEW import line
    for TROPHY_CATALOG/TROPHY_TIERS in tests/trophies.test.js (original import untouched,
    addition-only diff) plus the 10 flat metric tests. Diff +94/-0 and +163/-0.
  surprises: first attempt edited the existing import line in place and tripped the frozen
    DELS==0 gate (git counts a changed line as delete+add); fixed by adding a separate
    import line — the deletion budget effectively mandates addition-only diffs.
  deviations: none (the separate import line is within the packet's "or add to it" option).
  fail-first observed (evidence file HOME/trophies-val/step-1.2-failfirst.txt):
    M1.2a -> "not ok 4 - TROPHY_CATALOG and TROPHY_TIERS are exactly the signed catalogue"
    M1.2b -> "not ok 11 - the days metric..." AND "not ok 12 - the streak metric..."
             (test 13 also failed as an unmandated side effect — consistent: it relies on
             lastSeen feeding activeDays)
    M1.2c -> "not ok 12 - the streak metric..."
    M1.2d -> "not ok 13 - a value that is not a well-formed ISO date..."
    all restored; lib/profile.js byte count stable at CRLF=0 LF=684 throughout.
  validation_first_try: no (worker retried once — the import-line DELS trip above; the
    orchestrator's own clean re-run passed first try: RC=0, 316/0 plain+gated, plan 1..311,
    flat 311, contrast 52, digest unchanged, transcripts empty, endings lib 0/684 ·
    api/profile 0/142 · api/chapter 64/0 · profile.test 0/138 · trophies.test 0/215,
    DELS 0, PORC exact two-file set)
  retries: 1
  escalations: 0
  tokens: worker=72635, checker=38756, orchestrator_delta=unavailable
  interventions: 0
  report-format note: worker prefixed one line before STATUS (logged per §9; first offence,
    not re-dispatched)
  auditor: match, confidence high, findings none
  commit: 344f0de
  accepted: 2026-07-29T13:30:34Z

(run interlude 2026-07-29 ~13:30-13:50: owner ran /doctor between 1.2 and 1.3 — Claude Code
health check; changes touched only ~/.claude user config (skill overrides, plugin disables,
auto permission mode), NOTHING in this repo or run. Recorded so the timestamps make sense.)

STEP 1.3 awardTrophies (T2)
  tier: WORKER (Sonnet)
  did: appended the frozen awardTrophies function verbatim at EOF of lib/profile.js (after
    TROPHY_CATALOG); tests/trophies.test.js gained one NEW import line (awardTrophies) plus
    7 flat tests (13 -> 20). Diff +35/-0 and +101/-0, addition-only.
  surprises: fail-first mutations B and D each also broke one adjacent test beyond the one
    mandated (documented as expected side effects: fixture 4's gold sits exactly at 30, and
    deleting state breaks idempotence/rewrite tests too). Consistent, not contradictions.
  deviations: none.
  fail-first observed (evidence file HOME/trophies-val/step-1.3-failfirst.txt):
    M1.3a -> "not ok 288" (idempotent) AND "not ok 290" (never rewrites) — both, as mandated
    M1.3b -> "not ok 287" (exact-threshold) as mandated; 290 also failed (side effect above)
    M1.3c -> "not ok 291" (unknown-id/non-object untouched) as mandated
    M1.3d -> "not ok 289" (never regresses) as mandated; 288/290 also failed (side effects)
    all restored; lib/profile.js stable at 26022 bytes CRLF=0 LF=719 after each restore.
  validation_first_try: yes (worker first try; orchestrator clean re-run RC=0: 323/0 plain
    and gated, plan 1..318, flat 318, contrast 52, digest unchanged, transcripts empty,
    endings lib 0/719 · api/profile 0/142 · api/chapter 64/0 · profile.test 0/138 ·
    trophies.test 0/316, DELS 0, PORC exact two-file set)
  retries: 0
  escalations: 0
  tokens: worker=77287, checker=33820, orchestrator_delta=unavailable
  interventions: 0
  auditor: match, confidence high, findings none
  commit: d848aa7
  accepted: 2026-07-29T13:53:02Z

INTERVENTION (step 1.4, 2026-07-29, reason: bad-spec — the third of this project's line):
worker stopped-with-question per the stop-rule instead of running mutation M1.4b as frozen.
Finding, verified by the orchestrator against api/profile.js's GET flow: (a) M1.4b's
companion clause (api-profile-quiz bytes-unchanged test "must fail too") is mechanically
impossible — GET's two save decisions both precede the frozen insertion point, so no second
disk write can ever occur; (b) test 3's literal fixture was a NO-OP DETECTOR (known.bronze
already awarded, nothing else near threshold) — the mutation would award nothing and test 3
could not fail either. RULING: plan AMENDMENT #3 — test 3's seed gains 3 dated pre-NOW
chapters (earned-but-unawarded days/streak tiers); M1.4b's detector is test 3's RESPONSE
assertion; companion clause dropped; byte assertion stays (it guards the migrateWordKeys
resort trap). Worker's already-observed M1.4b failure under the strengthened fixture counts.
Worker continued (same context) to M1.4c/M1.4d + the frozen validation, which is unchanged.

STEP 1.4 the two call sites (T2 wiring)
  tier: WORKER (Sonnet)
  did: api/profile.js — import +awardTrophies, awardTrophies(p) inserted immediately before
    the single saveProfile in the POST tail (CRLF=0 LF=146). api/chapter.js — import
    +awardTrophies, awardTrophies(p) after chapters.push, before saveProfile, CRLF preserved
    (CRLF=67 LF=0). tests/trophies.test.js — +5 flat tests (20 -> 25) incl. the harness
    copies, the chapter transport fixture (Hebrew as escape text only), and the source-
    needle wiring test. api/placement.js byte-identical to HEAD after M1.4d's restore.
  surprises: none beyond the intervention above (worker's discovery, pre-ruling).
  deviations: test 3's fixture strengthening — ratified as plan amendment #3.
  fail-first observed (evidence file HOME/trophies-val/step-1.4-failfirst.txt):
    M1.4a (award pre-push) -> tests 24+25 failed (chapters trophy missing / order needle)
    M1.4b (award in GET)   -> test 23 failed on the strengthened fixture (extra days/streak
                              tiers appeared in the response); companion clause dropped (#3)
    M1.4c (award after save) -> test 21 failed (on-disk trophies {} vs expected bronze)
    M1.4d (award in placement) -> test 25 failed (1 !== 0 call-site count); placement
                              restored byte-exact (git diff --numstat empty)
  validation_first_try: yes post-ruling (the stop itself was a plan defect, not worker
    error; orchestrator clean re-run RC=0: 328/0 both modes, plan 1..323, flat 323,
    contrast 52, digest unchanged, transcripts empty, endings api/profile 0/146 ·
    api/chapter 67/0 · lib 0/719 · profile.test 0/138 · trophies.test 0/586, lib/tests
    DELS 0, APIDEL exactly 2, placement untouched, PORC exact three-file set)
  retries: 0
  escalations: 0
  tokens: worker=147450+159582 (two segments around the stop), checker=37473+39123 (two
    verdicts) + 28917 (independent byte-verifier), orchestrator_delta=unavailable
  interventions: 1 (bad-spec — amendment #3, logged above)
  audit trail: first verdict MISMATCH was a FALSE POSITIVE — the orchestrator's packet is a
    JSON string and JSON decodes backslash-u sequences, so the file's escape TEXT reached
    the auditor as rendered Hebrew glyphs (lesson 8, new costume: JSON transport). On
    corrected evidence: match, confidence low (attested-not-verified). Per §10 a second
    lens was dispatched — an independent tool-equipped verifier measured the bytes itself:
    0 bytes >127, Hebrew as escape text on Q/OPTS/GLOSS, CRLF=0 LF=586, nested 0. Accepted
    on the combined verdict: auditor line-by-line match on everything else + independent
    byte confirmation of the one attested item.
  commit: 3d19efb
  accepted: 2026-07-29T14:42:36Z

PHASE 1 CLOSED (2026-07-29)
  steps: 4 executed + this close, first-try passes: 3/4 (1.2 retried once internally on the
    DELS gate; 1.4's stop was a plan defect, not a worker failure)
  escalations: 0
  interventions: 1 (step 1.4, bad-spec -> plan amendment #3)
  cost: tokens (harness usage readouts) worker=521192, checker=209175, subagent total=730367;
    dollar figures unavailable; orchestrator_context: unavailable this session
  field_guide: 53/40 lines pre-close (inherited word-g1 guide; overflow justification
    logged at word-g1); grew this close by the two RECORD-GAP amendments — see below
  ALL 13 ACCEPTANCE CRITERIA RE-VERIFIED ON THE COMMITTED TREE:
    1-2. npm test 328 reported / 0 fail / plan 1..323, identical under APP_CODE=dummy
    3. flat ledger 323 (298 + 25 new)
    4. contrast 52 exactly
    5. public/ digest 2362 74e736d7d83b22a24945eae87cb9fe33 unchanged; no public/ writes
    6-7. QZ-21 and G1 transcripts diff EMPTY
    8. .data/profile.json absent
    9. write set vs BASE 1a30012 exactly: api/chapter.js, api/profile.js, lib/profile.js,
       tests/profile.test.js (+ new tests/trophies.test.js); porcelain clean
    10. zero files deleted; deleted-line budget exactly 2 (the two import lines);
        lib+tests deletions 0
    11. endings: lib 0/719 · api/profile 0/146 · api/chapter 67/0 · profile.test 0/138 ·
        trophies.test 0/586
    12. trophies.test.js 0 raw non-ASCII, 0 nested constructs
    13. awardTrophies( exactly 1 in api/profile.js, 1 in api/chapter.js, 0 in placement,
        0 under public/
    (Note: the step-1.4 script's HEAD-relative APIDEL/PORC clauses read 0/clean on the
    committed tree — expected commit artifacts, criterion 9's own wording anticipates this;
    the phase-level measurement vs BASE is what is recorded above.)
  FOR PHASE 2/3 TO CONSUME: final ledger 323 flat / 328 reported · contrast anchor still 52
    · CACHE still magic-vet-v17, QZ-22's next bump still v18, UNUSED (public/ untouched all
    phase) · public/ digest unchanged · NO D25 capture exists and none was made (phase 4
    makes one before deploy) · awardTrophies will award on the FIRST real POST after deploy
    (the free backfill, T9): on her profile as last measured (12 known, 0 candidates)
    'known' bronze lands immediately and 'proven' stays locked, exactly as T3's honesty
    note says — an expectation, unverified until phase 4's read-back · SK-1..SK-6 plus
    amendment #3 stand as amendments to the signed design · phase-3 handoff: RECORD GAP 1
    (chapter response carries no profile — celebration source needs a ruling), risk 1
    (days/streak metrics non-monotonic — render progress from the metric, never a stored
    high-water mark, never as a loss).
  LESSONS PROMOTED (plan RECORD GAPS 5 and 6, now amended into the field guide):
    lesson 4 widened — git-mediated copies (archive/stash/clone/worktree) re-apply
    autocrlf and silently flip every ending; byte checks in such a copy are meaningless.
    lesson 8 widened — escape collapse is ANY backslash through ANY transport: bash -e,
    quoted heredocs, and now JSON agent packets (a backslash-u escape in a JSON string
    DECODES to the raw glyph in transit — it produced this phase's audit false positive).
  tokens at boundary: orchestrator context size unavailable (harness readout not exposed
    mid-session); subagent totals above.

## PHASE 2 PLANNING (2026-07-29)

Resumed in a fresh orchestrator session (Fable) from phase-state.md per the handoff prompt.
Pre-flight re-verified before anything else: tree clean at 4966d89 · npm test 328/0, plan
1..323 · contrast 52 · live sw.js CACHE magic-vet-v17 · english-app-backups/ empty (no D25
capture — correct until phase 4) · no .data/profile.json. Frozen contracts re-acknowledged
(phase-state list, verbatim).

RECORD CORRECTION: design T6 cites docs/visual-design.md:190-195 for the FROZEN STYLE
SUFFIX; the heading actually sits at :197, blockquote :201-205, and the doc has NOT changed
since before the design was signed — the pin was simply off at signing. No doc edit; the
plan extracts by heading and pins the bytes (388, md5 51b97a774dc52aa272850bb686c22188).

Fresh planner (Opus, files only) returned the 6-step phase-2 plan now in plan.md: 11
acceptance criteria, §VAL-P2 preamble, SK2-1..SK2-8, the 9 frozen prompt bodies, the frozen
optimize-trophies.js source. BLOCKERS: none. RECORD GAPS: 8. Rulings adopted:
  SK2-1 new sibling script; scripts/optimize-assets.js is never run or edited (it would
        rewrite the eight frozen webps);
  SK2-3 NO CACHE bump this phase — phase 3's single v17->v18 covers both additions; no
        deploy happens before phase 4; explicit fallback written if overruled at GO;
  SK2-4 public/ gate becomes an EXCLUSION digest (== the phase-1 pin, measured); full
        digest re-pinned at the close (2371 files expected);
  SK2-6 T10 (visual-design §3 truth-fix) handed to phase 3;
  SK2-7 no new test this phase; ledger stays 323/328; phase 3 adds the asset test;
  SK2-8 trophy images are objects, no people, no metal cups/medals (CSS draws the tier).

ORCHESTRATOR VERIFICATION: suffix 388 bytes md5 51b97a... CONFIRMED by independent
extraction · sw.js md5 f16579d50af8b49a04e45a80975c6acf CONFIRMED · chat URL at
docs/visual-design.md:266 CONFIRMED · exclusion digest == phase-1 pin CONFIRMED ·
optimize-placement.js precedent matches the frozen 2.4 source line-for-line · sharp probe
OK · no .gitattributes · doc CRLF=0 LF=317 · briefing.md + STATUS.md read: no phase-2
owner instruction beyond the record (closes planner RECORD GAP 8).

P2-AMENDMENT #1 (orchestrator, pre-review): (a) the draft invoked §VAL-P2 as a CHILD bash
then used its fail/$PORC/$RC in the tails — undefined there, every tail would exit 0
unconditionally (the silent-pass class); each step validation is ONE script = §VAL-P2
verbatim + the tail. (b) step 2.1's cleanliness check gains the .oplan/ filter. (c) step
2.6 opens with BASE=<recorded at go-ahead>.

PLAN REVIEW (Sonnet, fresh): VERDICT ship, findings NONE — and it independently re-measured
every pin (suite, contrast, sw.js md5, exclusion digest, suffix bytes, the 9+8 asset
counts, prompt-body ASCII purity, and that "delight-pass lesson 14" cites that run's own
guide, not this run's).

tokens: planner=169339 · reviewer=95583. AWAITING: owner GO for phase-2 execution — the GO
also ratifies (or overrules, fallback in SK2-3) the no-CACHE-bump decision. $BASE (phase 2)
recorded at go-ahead.
