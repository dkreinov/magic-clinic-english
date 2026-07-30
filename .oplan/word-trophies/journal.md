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

BROWSER-ROUTE SMOKE TEST (2026-07-29, orchestrator, pre-GO — owner asked for it)
Read-only: NO prompt sent, NO image generated, the one chat NOT polluted, repo untouched
(git status 0 changed files after the test).
  - The frozen chat URL (docs/visual-design.md:266) loads and is logged in (Plus). Tab title
    resolves to "Image Request Cartoon Style" — the name the doc records. Its last message
    visibly ends with the FROZEN STYLE SUFFIX text: confirmation by content, not just by URL.
  - Composer reachable: div#prompt-textarea, contenteditable=true — so step 2.2's mandated
    "read the composer back before sending" is mechanically possible.
  - CAPTURE PATH PROVEN END-TO-END against a known-good answer: in-page fetch of a chat image
    returned a real PNG (magic 89 50 4e 47, content-type image/png, 1938670 bytes, 1254x1254);
    ONE synthetic <a download> click landed a file whose md5 is cf091df541e3b15a49effcaf3680ae97
    — BYTE-IDENTICAL to the committed assets/delight/app-icon.png. The step-2.2 capture rule
    reproduces an existing committed master exactly. Test file deleted after verification.
  - CALIBRATION FACT for step 2.2's gate: this chat's images come out 1254x1254 SQUARE, so the
    frozen thresholds (square, width >= 1024) are calibrated to real output, not optimistically.
  - NEW TRAP (for the field guide at the phase-2 close): the Chrome extension REDACTS image
    src URLs and hex digests as "[BLOCKED: Cookie/query string data]" / "[BLOCKED: Base64
    encoded data]". This is NOT a failure — the fetch happens inside the page, so the URL never
    needs to be read out; and evidence must be shipped as byte COUNTS and shell-side md5, never
    as an in-page digest string. (Same family as lesson 8: the transport mangles the evidence.)
  - NOT tested: generation itself. Deliberate — the nine prompt files do not exist yet (step
    2.1) and a stray test prompt would pollute the one chat the whole art library's style
    consistency rests on. First real generation in 2.2 answers it; a bad result is a regenerate.

## PHASE 2 EXECUTION OPENED (2026-07-29)

OWNER GO given after the nine prompt bodies were read back to him in plain words (one line per
picture, before any generation). Mode: AUTONOMOUS WITHIN PHASE -- the orchestrator runs 2.1..2.6
without a per-step go-ahead, EXCEPT step 2.3 (GC-D8), where it stops and the owner judges every
image. SK2-3 RATIFIED by the same GO: no CACHE bump this phase; phase 3's single v17->v18 covers
this phase's public/ addition too.

$BASE (phase 2) = fe1f78ab1d9e0b92d4d53208f117fa65f4c71c37 (fe1f78a).

PRE-FLIGHT re-measured at the GO, all green: HEAD fe1f78a, tree clean; npm test 328 reported /
0 fail / plan 1..323; flat ledger 323; contrast 52 PASS; public/sw.js md5
f16579d50af8b49a04e45a80975c6acf with CACHE = "magic-vet-v17"; public/ exclusion digest
2362 74e736d7d83b22a24945eae87cb9fe33; both transcripts diff EMPTY; no .data/profile.json;
english-app-backups/ empty (no D25 capture -- correct until phase 4); assets/delight/trophies/
and public/assets/trophies/ both absent; FROZEN STYLE SUFFIX extracts to 388 bytes md5
51b97a774dc52aa272850bb686c22188 (heading now at line 197).

P2-NOTE #1 (orchestrator ruling, executor stop-rule honoured -- escalated, ruled, logged).
plan.md:989's cleanliness check reads awk '$NF !~ /^.oplan//' -- its backslashes had already
collapsed in transport when P2-AMENDMENT #1b was written, so the command is a SYNTAX ERROR:
  awk: cmd. line:2: $NF !~ /^.oplan//
                                     ^ unexpected newline or end of string  (rc=1)
Field-guide lesson 8 biting the fix that was meant to apply it. RULING: every phase-2 use of the
.oplan filter is the §VAL-P2:919 form awk '$NF !~ /^\.oplan\//' (verified rc=0 today; ran clean
30+ times in phase 1). No behaviour change was intended by #1b and none is made. Not a licence to
edit any other frozen command.

P2-NOTE #2 (strengthening, within the frozen spec). Step 2.1 freezes the nine bodies in plan.md
but its gate only checks shape (ASCII, opener, distinct, suffix bytes) -- a body that lost a word
in transport would pass. Measured today: all nine bodies in plan.md are pure printable ASCII
(0 non-ASCII bytes; lengths 437/398/396/442/410/451/393/399/557) and machine-extractable from
their frozen bullet lines. RULING: build-prompts.js EXTRACTS each body from plan.md by script and
the suffix from docs/visual-design.md by script -- neither is ever retyped, the same rule the
suffix already lives under. The frozen file format (BODY + one space + SUFFIX) is unchanged.

STEP 2.1 the nine prompt files (WORKER, dispatched with the packet + the gate as FILES)
Nine files at $HOME/trophies-art/prompts/<id>.txt, each = BODY + one 0x20 + SUFFIX, no trailing
newline. NOTHING written inside the repo (gate-verified). Per P2-NOTE #2 the worker's
build-prompts.js EXTRACTED the suffix from docs/visual-design.md (by heading) and the nine bodies
from plan.md (by bullet), hard-stopping unless md5/388 and 9 ids / pure ASCII / distinct / opener
/ the nine declared lengths all held. Nothing retyped.

  id            body  file  md5(file)
  chapters       437   826  0a1a2fe9d963e5b222ff137e07a92431
  days           398   787  8c42aec6c9cb2d83ae33c3c12bb07ea0
  streak         396   785  67d713794e03d096795feffbc6ad8ac8
  known          442   831  93a829a63a6913ab696a1b53648bf040
  quizRight      410   799  fba77e64ab72b1d663a5cfce2b066715
  quizzer        451   840  743e1a544cb818488a6621bd877f156b
  curious        393   782  ea5e159ae274e17b6fac96a15659986a
  proven         399   788  b8793616cd5e0743bc74c54b4cef2311
  shelf-header   557   946  bc597004defba3ad7ed61bdc32c077cd
  total 7384 bytes; every file = body + 1 + 388; every last byte is "." (od -c), no newline.

ORCHESTRATOR AUDIT (independent, not a re-run of the worker's script): a second extractor that
slices the plan bullets on their BACKTICK boundaries (rather than regex-capturing) rebuilt all
nine expected buffers from docs/visual-design.md + plan.md and compared them to disk with
Buffer.equals -- all nine byte-identical, all md5s reproduced independently, all distinct, no
trailing newline. Frozen gate re-run by the orchestrator: PROMPTS-OK + STEP-2.1-OK. Repo dirty
only in .oplan/word-trophies/journal.md (the orchestrator's own record). ACCEPTED.
  Rationale for auditing in-thread rather than dispatching a fresh auditor: this step's
  correctness is a byte comparison against frozen sources with no judgement content, and a second
  extraction route is stronger evidence than a second agent re-running the same gate.

CALIBRATION FOR STEP 2.2 (measured, worth knowing before the composer): the SUFFIX is 388 bytes
but 386 CHARACTERS -- it contains one em-dash ("11-year-old (em-dash) charming"). So a prompt file
is NOT pure ASCII overall; only the body is. The em-dash sits near the END of the paste, not the
start, which is the opposite end from delight-pass lesson 14's observed composer em-dash
prepending -- so a stray leading em-dash remains detectable by the mandated read-back
("must start with Square image (1:1):").

STEP 2.2 the nine masters (ORCHESTRATOR, browser, the ONE frozen chat)
Generated one at a time in https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc (title
resolved "Image Request Cartoon Style"; identity confirmed BY CONTENT, not just URL). Free web
route, Plus account, no paid API, no new chat. Every image came back 1254x1254 -- the calibration
figure the smoke test predicted. Generation crossed midnight: the run's date stays 2026-07-29
(doc headings are frozen to it); the assets landed 2026-07-29 23:10 .. 23:30 local.

TROPHY-ART-MD5 chapters bfd7c13132c4069f800b25a0256b38c5
TROPHY-ART-MD5 days 2a9c7fdd306238a72877470fb480d22d
TROPHY-ART-MD5 streak e20ca13d954263c37d3da74e8aae9982
TROPHY-ART-MD5 known b09436a6944048b3512ec5d797df0a4c
TROPHY-ART-MD5 quizRight 362bffc797c8db82d477506f5d274b7b
TROPHY-ART-MD5 quizzer 43424e7bcbda79e68d7d7d5971795149
TROPHY-ART-MD5 curious 915a14363023324e412e6836bbaf0e49
TROPHY-ART-MD5 proven 10b412511593d395105f12144bb5bca0
TROPHY-ART-MD5 shelf-header 5c5aa6d0e0a654723ce2a72a7aed7e25

FROZEN GATE (validate-2.2.sh = §VAL-P2 verbatim + the 2.2 tail, ONE script per P2-AMENDMENT #1a):
MASTERS-OK 9 square png, all >=1024, all byte-distinct; suite 328/0 plan 1..323 both modes; flat
323; contrast 52; public/ exclusion digest 2362 74e736d7d83b22a24945eae87cb9fe33; sw.js md5
unchanged; both transcripts EMPTY; no .data/profile.json; write set exactly the nine ?? masters.
Exit 0.

HOW THE PROMPT TEXT REACHED THE COMPOSER (stronger than the plan's mandated read-back).
The plan required reading the composer back and confirming it starts with "Square image (1:1):"
and ends with "no frame or border." -- an ENDS-ONLY check that a dropped middle word survives.
Route actually used, which removes the transport entirely: powershell Set-Clipboard reads the
prompt FILE and puts it on the system clipboard -> in-page navigator.clipboard.readText() ->
synthetic ClipboardEvent('paste') with a DataTransfer into div#prompt-textarea. The bytes never
pass through a tool-call JSON string at any point. Then the composer was verified BYTE-EXACTLY:
character count + two independent checksums (plain sum of charCodeAt, and a position-weighted
sum mod 1e9) computed shell-side from the file and recomputed in-page, and the send was gated on
all three matching. Every one of the nine matched first try:
  chapters 824/83821/37078072 · days 785/80297/33868991 · streak 783/79971/33714128
  known 829/84317/37465576 · quizRight 797/81695/34896325 · quizzer 838/84991/38225568
  curious 780/79976/33521572 · proven 786/80363/33974285 · shelf-header 944/94762/47760720
Checksums are DECIMAL on purpose: the extension redacts hex digests as "[BLOCKED: Base64 encoded
data]" (the smoke test's own trap), so hex would have been unreadable evidence.

CAPTURE: for each asset, C:/Users/dkreinov/Downloads/trophy-<id>.png was confirmed ABSENT, then
one in-page fetch of the image blob and EXACTLY ONE synthetic <a download> click, never re-clicked
and never the Download control. Page-side byte count was compared with the shell's wc -c on the
landed file for all nine -- identical every time -- and the staging directory was re-counted to 0
after every move. Magic bytes 137,80,78,71 (decimal, same redaction reason) on all nine.

TRAPS MET (for the field guide at the close):
  (a) SCREENSHOT SPACE != PAGE CSS PIXELS. getBoundingClientRect returns CSS px (viewport
      1745x777) but computer-tool coordinates are screenshot px (1568x699) -- factor 0.8985. The
      first click used raw CSS coords and silently hit nothing; the paste then "failed" for a
      reason that had nothing to do with the clipboard. Convert: screenshot = css * 1568/innerWidth.
  (b) SYNTHETIC ctrl+v CARRIES NO CLIPBOARD. The extension's key event does not give the page
      clipboard access; the composer stayed empty. navigator.clipboard.readText() inside the page
      works (needs document focus -- it throws NotAllowedError right after any shell command
      steals focus, so click the page first).
  (c) THE SEND CONTROL IS THE STOP CONTROL WHILE ANSWERING. Pressing Return while the previous
      turn still streamed did NOT send; the prompt sat in the composer and was silently carried
      forward. Detect by re-reading the composer AFTER sending, not before. A stuck "Stop
      answering" state cleared with a plain page reload, and ChatGPT restored the draft
      byte-exactly (re-verified by the same three checksums before sending).
  (d) naturalWidth DOES NOT DISTINGUISH A PREVIEW FROM A FINAL -- quizRight's "Preview" was
      already 1254x1254. Gate on the absence of the Preview label AND the stop button AND
      byte-stability of the fetched blob across ~7s, not on pixel size.

STEP 2.3 the owner gate (GC-D8) -- ORCHESTRATOR + OWNER
Artifacts built OUTSIDE the repo at $HOME/trophies-art/preview/: per-asset previews at 160px and
320px (the sizes T4's cards use) and one 960x960 3x3 contact sheet, grid order row1 chapters days
streak / row2 known quizRight quizzer / row3 curious proven shelf-header. The owner was shown the
contact sheet at card size, with the orchestrator's own three reservations stated BEFORE the
verdict rather than after: days does not show the prompt's three growth stages; quizRight crops
tight against a prompt that demands generous margin, with small low-contrast arrows; streak's flat
haze background reads apart from the other eight. The remaining six were called clean hits.
OWNER RULING (2026-07-30): approve all nine as generated, including the three flagged.

TROPHY-ART chapters: APPROVED
TROPHY-ART days: APPROVED
TROPHY-ART streak: APPROVED
TROPHY-ART known: APPROVED
TROPHY-ART quizRight: APPROVED
TROPHY-ART quizzer: APPROVED
TROPHY-ART curious: APPROVED
TROPHY-ART proven: APPROVED
TROPHY-ART shelf-header: APPROVED

STEP 2.4 the derivative script and the nine webps (WORKER, packet + gate delivered as FILES)
scripts/optimize-trophies.js was EXTRACTED from plan.md's step-2.4 frozen fence (never retyped,
same rule as P2-NOTE #2): 39 lines, 1131 bytes, 0 non-ASCII, written with fs.writeFileSync and
verified by a BINARY read-back (CRLF=0 LF=39) rather than grep/file/git diff (lesson 4).
node scripts/optimize-trophies.js wrote the nine webps. Frozen gate validate-2.4.sh (= §VAL-P2
verbatim + the 2.4 tail) exit 0: DERIVATIVES-OK 9 webp all 640x640 byte-distinct and
byte-reproducible across two further runs; ENDINGS CRLF=0 LF=39; suite 328/0 plan 1..323 both
modes; flat 323; contrast 52; public/ exclusion digest unchanged; sw.js md5 unchanged; both
transcripts EMPTY; write set exactly the ten new files.

  id            webp bytes  md5
  chapters           31694  b4c070d288c200c6f26a0c0c961b5b4c
  curious            39078  3f9935023eef9ef6deb14a75ea82bec5
  days               26524  66dfa4f1f6bf8679a47f48db108a595b
  known              30970  ecc46b410abbd807eaf5867ece787926
  proven             26210  70c7d7bf68646578cff41e1f9f910fc0
  quizRight          29008  2767b30ba681f4e89a04e9df597aeb93
  quizzer            32220  58012695cde0da036c4a7664b0fd43b4
  shelf-header       24318  97828550ac3d1e529d6e1ff1d30be2fb
  streak             16124  2f23cf2efda2c122c90631cca090eea9
  total 256146 bytes for the nine (masters were 17.0 MB; derivatives are 0.25 MB).

ORCHESTRATOR AUDIT (independent): a second extractor located the fence from the "STEP 2.4:"
heading (a different route than the worker's anchor) and rebuilt the expected buffer -- the file
on disk is byte-identical to the frozen plan source; endings re-measured CRLF=0 LF=39, 0 non-ASCII.
PLUS a check the frozen plan does NOT contain: each derivative was decoded and compared against
ITS OWN master at 64x64 -- mean absolute pixel difference 1.43..2.20 (pure webp quantisation).
This catches a mis-wired NAMES loop (e.g. nine derivatives all made from one master), which
md5-distinctness alone cannot see, because nine wrong-but-different files still pass distinctness.
ACCEPTED.

P2-NOTE #3 (gate-coverage observation, raised by the worker, no action). The 2.4 tail asserts
CRLF=0 via case "$ENDS" in *"CRLF=0 "*) but never asserts LF=39, so a truncated script with
CRLF=0 would pass that guard. Covered here by the worker's binary read-back and by the
orchestrator's byte-identity audit, both of which pin LF=39 exactly. Recorded rather than
silently patched (the gate is frozen); phase 3 may tighten it if it reuses this shape.

STEP 2.5 record the prompts, inventory and pipeline in docs/visual-design.md (WORKER)
Three additive inserts, spliced BY SCRIPT on bytes (no editor, LF only), anchored on unique
EXISTING LINE CONTENT rather than line numbers: edit 1 after the app-icon inventory row (resolved
195), edit 2 after the app-icon prompt's trailing paragraph (resolved 258), edit 3 as the last
bullet of §7 (resolved 284). 86 lines added, 0 deleted; 19825 -> 25999 bytes; LF 317 -> 403,
CRLF 0. The nine prompt bodies were NEVER retyped: the splice script read each
$HOME/trophies-art/prompts/<id>.txt and dropped the last 389 bytes (one space + the 388-byte
suffix), independently confirming the dropped tail md5s to 51b97a774dc52aa272850bb686c22188 on
all nine and that byte 389-from-end is 0x20. Re-wrapping splits only on pre-existing spaces, so
the whitespace-normalised text is character-identical.
Frozen gate validate-2.5.sh exit 0: DOC-OK 9 prompts recorded verbatim, 9 inventory rows,
pipeline note present; ENDINGS CRLF=0 LF=403; deletions 0; write set exactly " M
docs/visual-design.md"; and every §VAL-P2 invariant held (328/0 both modes, flat 323, contrast
52, exclusion digest, sw.js md5, transcripts EMPTY, no profile).

ORCHESTRATOR AUDIT (independent of the worker's own assertions): the HEAD version of the doc was
re-read via git show and EVERY one of its 318 lines was located in the new file IN ORDER and
byte-identical (0 lost, 0 reordered, 0 altered) -- a stronger statement than "deletions == 0",
which a rewrite-in-place could satisfy. Section 3 was extracted from both versions and compared
whole: byte-identical, so T10 was not smuggled in (SK2-6). The nine bodies were re-derived from
the prompt FILES and each found exactly once in the normalised doc, each with its
assets/delight/trophies/<id>.png row. Endings re-counted on bytes: CRLF=0 LF=403. ACCEPTED.

P2-NOTE #4 (packet defect, raised by the worker, orchestrator error). PACKET-2.5.md described the
§7 "Superseded capture method" bullet as "currently the last content of the file". It is not --
"## 8. Do and do-not rules" follows it. The placement INSTRUCTION ("append at the very end of
section 7, after the Superseded capture method bullet") was unambiguous and independently
anchored, so the worker executed it correctly and flagged the false aside instead of adapting
around it -- the stop-rule behaving exactly as intended, and §8 was not touched (audit confirms).
The error was the orchestrator's packet prose, not the plan.

PHASE 2 CLOSED (2026-07-30)

Every acceptance criterion re-run by the orchestrator on the COMMITTED tree (validate-2.6.sh =
§VAL-P2 verbatim + the frozen close tail with BASE=fe1f78ab substituted per P2-AMENDMENT #1c,
plus criteria 8 and 11 which the frozen tail does not cover). Exit 0. Measured, not asserted:
  suite 328 reported / 0 fail / plan 1..323 · identical under APP_CODE=dummy · flat ledger 323
  contrast 52 PASS · public/ EXCLUSION digest 2362 74e736d7d83b22a24945eae87cb9fe33 (identical
  to the phase-1 pin, so the invariant is real and not a tautology) · public/sw.js md5
  f16579d50af8b49a04e45a80975c6acf with CACHE = "magic-vet-v17" · both transcripts diff EMPTY ·
  no .data/profile.json · NEW FULL public/ PIN 2371 644f333395566079ef6d0441438c7a4a (2362 + 9,
  count asserted) · BINARY-OK all 18 committed binaries worktree bytes == git blob bytes (the
  autocrlf trap, SK2-5, which git diff cannot see) · write set vs BASE exactly the 20 expected
  paths, nothing deleted, tree clean · docs/visual-design.md deletions vs BASE = 0 · lib/ api/
  tests/ public/views/ public/*.js styles.css sw.js all untouched · optimize-trophies.js
  CRLF=0 LF=39.

Criteria 1-11 all satisfied. 1: nine 1254x1254 square PNG masters, md5-distinct from each other,
from the nine existing assets/delight/*.png and from the dragon-clinic anchor. 2: nine 640x640
webps, md5-distinct, byte-reproducible across four total runs of the script. 3: nine
TROPHY-ART APPROVED verdicts, each paired with a TROPHY-ART-MD5 line the gate re-checked against
the bytes on disk. 4-7 and 9-11 as measured above. 8: exactly nine masters, nine webps, one new
script, one modified doc.

WHAT WAS DECIDED, NOT GUESSED, DURING EXECUTION
  P2-NOTE #1 plan.md:989's .oplan awk filter is a syntax error (collapsed backslashes); every
    phase-2 use took the §VAL-P2:919 form instead. Escalated, ruled, logged -- not silently fixed.
  P2-NOTE #2 the nine prompt bodies are EXTRACTED from plan.md, never retyped, closing a hole in
    the frozen 2.1 gate (which only checked shape, so a dropped middle word would have passed).
  P2-NOTE #3 the frozen 2.4 gate asserts CRLF=0 but not LF=39; covered by binary read-backs.
  P2-NOTE #4 PACKET-2.5.md contained a false aside ("last content of the file"); the worker
    flagged it rather than adapting -- the stop-rule working. Orchestrator's error, not the plan's.
  OWNER RULINGS: GO autonomous-within-phase; SK2-3 ratified (no CACHE bump this phase); all nine
    images APPROVED as generated, including the three the orchestrator flagged.

THE THREE FLAGGED IMAGES, RECORDED SO PHASE 3 IS NOT SURPRISED. The orchestrator raised these
BEFORE the verdict and the owner approved them anyway: days does not show the prompt's three
growth stages (it is one finished flower); quizRight crops tighter than the prompt's "generous
empty margin on all four sides" and its arrows are small and low-contrast; streak's flat haze
background reads apart from the other eight, which sit in the wooden clinic world. None is a
defect against any frozen gate. If phase 3's card CSS crops hard, quizRight is the one most
likely to suffer -- it is the tightest of the nine.

EVIDENCE DISCIPLINE THAT PAID OFF. Nine prompts reached the composer byte-exactly on the first
try, verified by char count plus two independent checksums, with the text never passing through a
tool-call JSON string (clipboard -> in-page read -> synthetic paste). Every capture was one
synthetic <a download> click against a pre-verified-absent filename, with the page-side byte
count compared to the shell's wc -c on the landed file. Two audits found things no frozen gate
would have: that each webp matches ITS OWN master (a mis-wired NAMES loop passes md5-distinctness
because nine wrong files are still nine different files), and that all 318 original doc lines
survive IN ORDER byte-identical (a rewrite-in-place passes "deletions == 0").

FIELD GUIDE: lesson 13 added (the art-chat driving recipe and its four silent-no-op traps:
screenshot-vs-CSS coordinates, synthetic ctrl+v carrying no clipboard, send-is-stop-while-
streaming, and preview-vs-final being indistinguishable by pixel size). Guide is at 66 lines
against a 40-line budget; justified because each is a command or mechanism that does not compress
and each one silently produced a NO-OP rather than an error.

NOT DONE, DELIBERATELY: no deploy, no D25 capture, no CACHE bump, no test, no CSS, no app code,
no touch of her profile. The eight carried obligations for phase 3 are enumerated in
phase-state.md.

## PHASE 3 PLANNING (2026-07-30)

Owner asked for a fresh planner. Tree clean at 2ee5ca6 (then 86ae76e, see below).

ORCHESTRATOR ERROR, recorded rather than buried: the first planner was dispatched with the
read-only "Plan" agent type, which has NO Write tool. It could not write the draft file, returned
the whole plan as its reply instead, and the reply was TRUNCATED -- everything before step 3.2's
validation was lost. Nothing was damaged (the repo was untouched) but a full planning pass was
wasted. The surviving tail's measurable claims were distilled into
$HOME/trophies-art/PRIOR-PASS-FINDINGS.md, explicitly marked UNVERIFIED, and the briefing gained
an addendum: write the file INCREMENTALLY, never return the plan text. LESSON: match the agent
TYPE to the tools the job needs; a planner that must produce an artifact needs Write.

Second pass (general-purpose, Opus, read-only of the repo) produced the plan now spliced into
plan.md from the "# WORD-TROPHIES -- PHASE 3 IN FULL" header: 2154 lines, 7 steps, 18 new flat
tests (ledger 323/328 -> 341 flat / 346 reported), contrast anchor 52 -> 58, 15 files touched,
8 deleted lines. Zero raw Hebrew glyphs in the plan -- every Hebrew fact is carried as a DECIMAL
codepoint sum, because the planner REPRODUCED LESSON 8 LIVE while drafting (four \u05XX escapes
in a tool call arrived as raw glyphs).

SK3-1..SK3-11 adopted. The load-bearing ones:
  SK3-1 THE FIELD GUIDE IS WRONG. Lesson 4 says public/sw.js is LF; on disk it is CRLF=50 LF=0,
        and styles.css (501) and index.html (81) are CRLF too, while app.js and lib/*.js are LF.
        Both planning passes found this INDEPENDENTLY. Amend lesson 4 at the phase-3 close.
  SK3-2 api/chapter.js:66 returns { ok: true, data: { chapter } } -- NO profile. Phase-1 RECORD
        GAP 1 is therefore answered: the phone re-reads /api/profile at the earning moments; no
        server change, and T5's "the chapter response returns a profile" is simply false.
  SK3-5 anchor 58; hexes --color-bronze #a4622a, --color-silver #6f6a63, --color-gold #9a7200,
        ratios verified by running a byte-copy of the real gate out-of-repo; five pins of "52"
        enumerated plus eight decoys.
  SK3-6 public/ cannot import lib/ (zero hits) -> metrics duplicated into the view, gated by an
        agreement test over eight shared fixtures plus a copy-fidelity check.
  SK3-8 NO Hebrew string is authored; all ten are extracted, with decimal codepoint sums pinned.
  SK3-10 one overlay per pass, all earned tiers marked together, so the day-one backfill cannot
        parade eight overlays at her.

ORCHESTRATOR VERIFICATION before review (measured, not read): sw.js CRLF=50 LF=0 CONFIRMED, as
were styles.css/index.html CRLF and app.js/lib LF · api/chapter.js:66 response shape CONFIRMED
verbatim · zero public/->lib/ imports CONFIRMED · the five "52" pins CONFIRMED at quiz-ui:501,
reader-ui:105, words-ui:161, visual-design:135, README:45 · flat ledger 323 and contrast 52
CONFIRMED · STATUS.md and briefing.md READ: no phase-3 owner instruction beyond the record.
The planner also caught an ORCHESTRATOR RECORD ERROR from the phase-2 close -- phase-state.md:9
claimed a 66-line field guide when wc -l is 73. Corrected and committed at 86ae76e, together
with a flag on lesson 4's false endings claim. (git diff 2ee5ca6..86ae76e = phase-state.md only.)

PLAN REVIEW (Sonnet, fresh, read-only): VERDICT ship with fixes -- 0 blocking, 1 should-fix,
2 nits. It independently re-measured the public/ digest, all 20 files' endings byte counts, the
six contrast ratios (by hand AND by running a byte-copy of check-contrast.mjs), all ten Hebrew
extraction lengths and codepoint sums, the ledger and deletion arithmetic, the .oplan awk
filter's backslashes, the no-questions guard and the three celebration hook sites -- all matched.

P3-AMENDMENT #1 (orchestrator, post-review, MANDATORY). The reviewer's should-fix, verified here
independently and upgraded in severity: step 3.3's asset test used per-id fs.existsSync, and
existsSync is CASE-BLIND on this machine --
  fs.existsSync("public/assets/trophies/quizright.webp") === true  while the real file is
  quizRight.webp
whereas readdirSync returns the true spelling and is case-exact everywhere. This is not cosmetic:
VERCEL SERVES FROM A CASE-SENSITIVE LINUX FILESYSTEM, so a mis-cased derivative would pass every
local test and then 404 on her phone in phase 4 -- the exact bug the SK2-7 test exists to catch,
invisible to the test as drafted. The test now MUST deepStrictEqual readdirSync(...).sort()
against the nine exact filenames (subsuming the "exactly 9 files" assertion), with a new
fail-first M3.3e that renames a file to lowercase and confirms the deepStrictEqual fails WHILE
the old existsSync loop still passes -- proving the amendment is load-bearing.
Nits fixed: styles.css z-index:100 cited at :412, actually :413; and the plan header now records
that the tree moved 2ee5ca6 -> 86ae76e with a diff proving no measurement went stale.

tokens: planner(lost pass) ~unknown · planner=277977 · reviewer=188875.
AWAITING: owner go-ahead for phase-3 execution.

## D25 CAPTURE TAKEN EARLY (2026-07-30, owner-authorised)

The owner asked what she has already earned. That could not be answered from files -- no capture
had ever been taken -- so the owner authorised the read. Phase 4 needs this capture regardless;
it simply happened earlier.

METHOD: the FROZEN capture command from .oplan/word-quiz/plan.md:1573-1586, verbatim, no
improvisation. The subshell ( set -a; . ./.env; set +a; curl ... ) is the load-bearing part:
APP_CODE is sourced INSIDE the parentheses and dies with the subshell. The owner also supplied
the code in chat; it was NOT used and was never written to any file -- .env already held it, so
the secret never entered a command line. Post-assertions: APP_CODE unset before AND after
(isAuthorized is open only when it is UNSET, and a leak silently 401s the whole suite);
no .data/profile.json; repo clean.

RECEIPT (never contents):
  file   /c/Users/dkreinov/english-app-backups/profile-20260730-114016.json
  HTTP   200
  bytes  13295
  sha256 4e7fe8bca4ac6d577970b69bc047363603b78c6838efe83c9fce999ed080a597
  profile top-level keys: version, learner, skills, words, placement, story, meta
  trophies key present: NO (correct -- phase 1's engine is committed but NOT deployed;
  production still runs the pre-trophies code at CACHE v17)
DISCLOSED, as the frozen recipe states: this GET can rewrite her stored file into sorted-key
order -- byte-identical to what her own app does on every load.

WHAT LANDS ON THE FIRST AWARD PASS -- computed with the SHIPPED TROPHY_CATALOG imported from
lib/profile.js, never a re-implementation (lesson 2), and cross-checked by actually running
awardTrophies() over a copy (4 stamped, AGREES with the table):

  trophy     count  b/s/g      day one   next
  chapters   3      5/15/40    LOCKED    2 more to bronze
  days       3      3/10/30    bronze    7 more to silver
  streak     2      2/4/7      bronze    2 more to silver
  known      12     5/15/30    bronze    3 more to silver
  quizRight  3      10/40/100  LOCKED    7 more to bronze
  quizzer    5      20/60/150  LOCKED    15 more to bronze
  curious    28     25/75/200  bronze    47 more to silver
  proven     0      1/5/15     LOCKED    1 more to bronze

  TOTAL: 4 tiers, all BRONZE, across 4 of the 8 trophies. FOUR, not the "six or eight" the
  phase-3 planner estimated in SK3-10 and not the "~6" the orchestrator repeated to the owner as
  if measured. Both were guesses; this is the measurement. The orchestrator's overstatement was
  corrected to the owner in the same message that reported these numbers.

DESIGN T3'S HONESTY NOTES ARE NOW VERIFIED, not assumed: "she has 12 known today -> אוצרת מילים
bronze lands on the first award pass" is EXACTLY right (12), and "proven stays 0 until G1
nominates (candidates=0 today)" is EXACTLY right (0). design.md:98-100 stands as written.

CONSEQUENCE FOR SK3-10 (the day-one backfill rule): the problem it was designed against -- a
parade of six or eight overlays -- does not exist at this size. Four bronze panels is a different
question from eight, and it is the owner's call, now being put to him with the real numbers.
Whatever he rules, SK3-10's selection rule is a few lines inside one view function and changes
no storage and no engine behaviour.

ALSO WORTH PHASE 4'S ATTENTION: four trophies sit within a few actions of their next tier
(chapters 2, proven 1, streak 2, known 3). The read-back rule (T8) says a tier may APPEAR
between capture and read-back only with accompanying activity evidence -- with margins this thin,
that is likely to happen legitimately, and must not be mistaken for a bug.

## PHASE 3 GO (2026-07-30)

OWNER RULINGS AT THE GO:
  1. DAY-ONE CELEBRATIONS: "one per sitting until caught up." This OVERRULES SK3-10 as drafted,
     which showed one overlay and marked all uncelebrated tiers as seen in the same pass --
     discarding the backlog. Recorded as P3-AMENDMENT #2 and applied to plan.md in all THREE
     places that encoded the old rule: SK3-10's frozen selection rule, the frozen contract
     comment on maybeCelebrateTrophy, and step 3.4's test 14 (which now asserts the DRAIN:
     four tiers in, one key written per call, the fifth call returns null -- plus a new negative
     control that the written key always equals the returned selection).
     Note the honest provenance: SK3-10 was written to prevent a parade of "six or eight"
     overlays. That number was an ESTIMATE and it was wrong -- the capture measured FOUR. The
     defect it guarded against was smaller than assumed, and the cure (silently dropping three
     earned trophies) was worse than the disease at that size. Measurement changed the decision.
  2. EXECUTION MODE: autonomous across the whole phase, with the work pushed to SUBAGENTS as the
     oplan discipline intends, so this orchestrator thread stays context-light. Owner's words:
     "autonomous all, with subagents like /oplan intended, so this thread will not be too context
     window thin." Practical consequence: every WORKER-tier step is dispatched with a packet and
     a gate delivered as FILES; the orchestrator reads only the reports and runs the audits.

CONSEQUENCE FOR PHASE 4 (write into the close): after the deploy, her phone will show FOUR bronze
celebrations spread across four earning moments -- days, streak, known, curious -- not one, and
not all at once. The T8 read-back must expect trophies to appear legitimately between capture and
read-back anyway (four trophies sit 1-3 actions from their next tier).

$BASE (phase 3) = 802230f1b97aa2adbff154c3f8de7d7944af12f2 (the GO commit itself -- the last
commit before any phase-3 code lands; the close diffs against it).

STEP 3.1 the three tier tokens, six gate pairs, anchor 52 -> 58 (T7) — WORKER
Frozen blocks EXTRACTED from plan.md by the worker's script (the 7-line styles.css insert from
:2160-2166, the six PAIRS from :1686-1691), shape-asserted before use, applied byte-preservingly
via latin1 so no byte was transcoded. Every anchor required to occur EXACTLY ONCE.
  styles.css   CRLF 501 -> 508 (insert-only), the three tokens LAST in :root
  check-contrast.mjs  LF 184 -> 190 (insert-only), six new pairs
  four "52" pins moved: quiz-ui:501, reader-ui:105, words-ui:161, README:45
  tests/trophies-ui.test.js CREATED, LF, 0 non-ASCII, 2 FLAT tests
  ledger 323/328 -> 325 flat / 330 reported · contrast 52 -> 58 · deletions 4 (as budgeted)
Gate gate-3.1.sh (= §VAL-P3 extracted from the plan + the step tail extracted from the plan, by
build-gate.js — neither retyped) exit 0.

FAIL-FIRST, all four observed failing with their text recorded by the worker: M3.1a gold ->
#d4af37 gave "FAIL ratio= 1.84 ... gold trophy ring on raised surface" and 2 failing tests;
M3.1b deleting the silver pairs gave "expected exactly 58 PASS lines, got 56"; M3.1c moving
--color-bronze out of :root gave "ERROR: token --color-bronze is missing from :root"; M3.1d
reverting reader-ui:105 gave "58 !== 52". Every file restored and re-verified by md5.

WORKER FINDING (honest, and correct): M3.1b's "and on the missing label" clause is NOT observable
as the plan wrote it — the PASS-count assertion precedes the label loop and short-circuits it. The
worker did not reorder or weaken the frozen test; it measured the underlying condition directly
(grep 'silver trophy ring' = 0) and ran a SUPPLEMENTARY label-rename probe that holds the count at
58 so only the label assertion can fire, observing "contrast gate must still cover the pair
labelled ...". Recorded as a plan-quality note for phase 4/future runs, not a defect in the code.

ORCHESTRATOR AUDIT (independent): the three tokens are inside :root with the frozen hexes, each
hex occurring exactly once in the file. The six contrast ratios were RECOMPUTED FROM THE HEXES
with a hand-written WCAG relative-luminance implementation (not the repo's gate, not the worker's
numbers): bronze 4.63/4.22, silver 5.15/4.69, gold 4.22/3.84 against --color-card #fffaf0 and
--color-surface-2 #fdeed6 — all >= 3:1, tightest is gold on the raised surface at 3.84.
DECOY CHECK (the risk that a blind 52->58 sweep corrupted unrelated numbers): 520px still at
styles.css:47 and background.test.js:27, min-height: 52px still at styles.css:457, 0.7152 still
at check-contrast.mjs:146, and there is no 58px or 0.7158 anywhere. No stale "passLines.length,
52" remains in tests/. New test file re-measured: 2 flat tests, 0 non-ASCII bytes. ACCEPTED.

STEP 3.2 public/views/trophies.js — the screen module (T4) — WORKER
Created LF, 298 lines, 11452 bytes, md5 86a3f7196c5115bed6d1266a5fcbadc7. Exports the frozen
shape; NO ../lib/ import (SK3-6 mirror + agreement test); nothing touches document/localStorage
at module top level; uncelebrated/maybeCelebrateTrophy are stubs (3.4 fills them). Tests +7 flat
(9 total in the file), append-only, 0 deletions, 0 raw non-ASCII bytes.
Ledger 325/330 -> 332 flat / 337 reported · contrast 58 · public/ 2372 · gate-3.2.sh exit 0.
All TEN Hebrew strings EXTRACTED, every length and decimal codepoint sum matching its SK3-8 pin
with zero adjustments.

FAIL-FIRST, all five observed failing, each restored to md5 86a3f719...: M3.2a (days bronze
3->4) failed the catalogue-mirror deepStrictEqual; M3.2b (dropping lastSeen from the day union)
failed the agreement test ON FIXTURE (e) exactly as predicted -- "days -- view says 3, engine
says 4"; M3.2c (progress line non-empty at gold) failed the progress test; M3.2d (locked ->
a second asset) failed BOTH the locked-artwork test and the artwork-presence test; M3.2e (raw
hex in VIEW_STYLE) failed with "VIEW_STYLE must not contain a raw hex color".

ORCHESTRATOR AUDIT (independent, run from a FILE after an inline attempt had its backslashes
collapsed in transport -- lesson 8 biting the orchestrator live): the eight names were pulled out
of the SIGNED design.md table and out of the WRITTEN view separately and compared CODEPOINT BY
CODEPOINT -- all eight identical. That is the real proof of "never retyped": not that a script was
used, but that the bytes on screen equal the bytes signed. Also verified: no ../lib/ reference,
VIEW_STYLE 76 lines token-only (no raw hex, no color-mix(, no background-image), no separate
locked asset, no persistence token (highWater/bestEver/maxSeen/sessionStorage all absent), view
CRLF=0 LF=298, test file 9 flat tests and 0 raw non-ASCII. ACCEPTED.

P3-NOTE #1 (orchestrator RULING on a real plan tension the worker surfaced rather than buried).
Test 7 freezes the counted string `class="trophy-card"` WITH its closing quote = 8, while the
frozen CSS uses DESCENDANT selectors (.trophy-card--locked .trophy-art). The house BEM form
(class="trophy-card trophy-card--locked", cf. views/home.js:81) makes the counted string occur
ZERO times, so the two frozen things cannot both hold with the modifier on the <article>. The
worker put the modifier on a tier LAYER inside the card and flagged it.
RULED: ACCEPT as built. Reasons, measured not assumed — every modifier rule either lays out the
layer itself (flex) or targets the ART through a descendant selector; the card's own background,
radius, shadow and padding come from .trophy-card on the <article> and are untouched. T4 asks for
"the SAME artwork dimmed", and .trophy-card--locked .trophy-art { grayscale(1); opacity .45 }
dims exactly the artwork either way. So the two structures are FUNCTIONALLY IDENTICAL; only the
class name's placement is unconventional, and the code carries a comment saying why. The
alternative would weaken a frozen test to an open-ended `class="trophy-card` match for a purely
cosmetic gain, and would re-open a passing, mutation-tested implementation. Recommendation for
any future rework: prefer BEM-on-article and amend test 7's counted string in the same change.

P3-NOTE #2 (plan nit, no action): the step body says the extraction script prints TEN sums and
the COMMANDS comment at plan.md:2469 says ELEVEN. Ten is right (8 names + tab label + the
progress word), matching SK3-8's inventory. Recorded, not "fixed".

P3-NOTE #3 (FIELD GUIDE candidate, found the hard way): a text-scanning assertion over a style
block ALSO SEES COMMENTS. The worker's first build failed "VIEW_STYLE must not use color-mix()"
on an explanatory COMMENT that used no colour at all. No VIEW_STYLE comment may name a forbidden
construct. Same family as lesson 5's "color-mix fabricates a pass" -- the gate reads text, not CSS.

STEP 3.3 wiring: route, fourth tab, PRECACHE, CACHE v17 -> v18 (T4 + obligation 1) — WORKER
Every inserted line EXTRACTED from plan.md by line number and asserted before use; the Hebrew tab
label extracted from design.md:189. app.js LF 65 -> 67 (insert-only); index.html CRLF 81 -> 90
(insert-only, 9-line tab block); sw.js CRLF 50 -> 51 (CACHE line replaced + one PRECACHE entry);
shell.test.js LF 94 -> 96; trophies-ui.test.js LF 336 -> 448, +3 flat (12 total).
Deletions exactly 2 (the CACHE line in each of sw.js and shell.test.js), app.js/index.html/
trophies-ui insert-only. Ledger 332/337 -> 335 flat / 340 reported. gate-3.3.sh exit 0.
SK3-1 CONFIRMED AGAIN on disk: sw.js and index.html were CRLF before AND after.

P3-AMENDMENT #1 IMPLEMENTED AND PROVEN LOAD-BEARING — the single most valuable result of this
step. The worker mis-cased quizRight.webp -> quizright.webp (renameSync DOES change case on this
filesystem; the move-aside fallback was unnecessary) and measured:
  existsSync("quizRight.webp") = true   <- the case-blind per-id loop STILL PASSES
  and, run standalone against the mis-cased tree, ALL of the pre-amendment assertions
  (per-id existsSync loop + shelf-header + count-of-9) PASS COMPLETELY.
Only the amendment's assertion failed, at trophies-ui.test.js:421:
  not ok 12 - every trophy id has its own webp on disk ...
    + 'quizright.webp'  - 'quizRight.webp'
So the test AS ORIGINALLY DRAFTED could not see the bug it exists to catch, and would have shipped
a 404 on her phone from Vercel's case-sensitive Linux while every local test stayed green. The
reviewer called this "should-fix"; it was in truth the difference between a working screen and a
broken one.

FAIL-FIRST, all observed failing with text recorded: M3.3a v17 revert (plus a second part where
v17 is JOINED rather than removed, giving "the old cache name must be gone, not merely joined" --
the QZ-22 failure mode made mechanical); M3.3b reordering PRECACHE failed the deepStrictEqual on
ORDER not membership; M3.3c moving the tab before words failed "T4 pins DOM order"; the artwork-
in-PRECACHE mutation failed BOTH shell.test.js and test 12. All restored, md5-verified.

ORCHESTRATOR AUDIT (independent): PRECACHE has 15 entries with /views/trophies.js at index 12
IMMEDIATELY after /views/words.js at 11, every entry resolves to a real file on disk, and no
/assets/ entry exists; sw.js is at v18 with no surviving mention of v17; nav DOM order is
/reader /home /words /trophies with exactly four tabs, placement still tab-less and /parent still
absent; the tab label's codepoints were pulled from design.md and from index.html separately and
are IDENTICAL (1492,1490,1489,1497,1506,1497,1501,32,1513,1500,1497); app.js carries both the
import and the route; the amendment's readdirSync/deepStrictEqual and the exact camelCase filename
are present in the test; endings 51/90/67/96 all match their pins; 0 raw non-ASCII in the test
file. ACCEPTED.

P3-NOTE #4 (plan defect, no action needed, recorded): the plan defines M3.3e TWICE -- the
MANDATED FAIL-FIRST list at :2737 calls it "add trophy artwork to PRECACHE", while
P3-AMENDMENT #1 at :2709 adds a different M3.3e, "rename one derivative to lowercase". The worker
did not guess which to skip; it ran BOTH and reported both. Rename the amendment's to M3.3f if the
plan is ever amended again. My error when writing the amendment.

STEP 3.4 the celebration (T5), hooked at exactly three moments — WORKER
trophies.js LF 298 -> 439 (+141, 0 deletions): celebrationKey, readCelebrated, writeCelebrated,
collectUncelebrated, celebrateHtml, showCelebration, celebrateFirst, plus the overlay CSS inside
VIEW_STYLE (token-only, reduced-motion honoured). words.js CRLF 281 -> 289 (+9/-1), reader.js
CRLF 749 -> 767 (+19/-1) with celebrateFromServer() and the two guarded hooks; test file LF
448 -> 734, +5 flat (17 total). Ledger 335/340 -> 340 flat / 345 reported. gate-3.4.sh exit 0.
quiz.js md5 still 69b6d71117cf776715374abc6f0abb02 and quiz-core.js 9a2131be... — QZ-18 intact.

ORCHESTRATOR AUDIT — THE OWNER'S RULING MADE OBSERVABLE. Rather than trust the tests, the
orchestrator imported the REAL shipped module and drove it against the REAL day-one set from the
2026-07-30 capture (days, streak, known, curious, all bronze) with a fake localStorage:
  pass 1 showed days/bronze,   1 key written
  pass 2 showed streak/bronze, 1 key written
  pass 3 showed known/bronze,  1 key written
  pass 4 showed curious/bronze,1 key written
  pass 5 showed null,          0 keys written
  pass 6 showed null,          0 keys written
FOUR earned tiers produced FOUR celebrations across four earning moments, one per pass, in
catalogue order, then silence. That is exactly what the owner ruled and the opposite of what the
plan originally specified. Also verified: quiz.js/quiz-core.js md5s frozen; the only "new Audio("
occurrences are the PRE-EXISTING word-pronunciation feature in words.js:218 and reader.js:721,
confirmed by diffing against 48ee853 — the celebration path has zero. ACCEPTED.

FAIL-FIRST: M3.4a (dropping the total>0 guard) failed with "the words hook must skip the
no-questions path"; M3.4c (removing the try/catch) failed with "Got unwanted exception ... private
mode"; M3.4d (celebrating inside renderQuizDone) failed BOTH the QZ-18 md5 gate and "quiz.js must
never celebrate"; M3.4e (assigning the module-scope profile) failed on the helper-containment
assertion, with the plan's two named assertions confirmed failing by direct probe. All restored,
all md5-verified.

P3-NOTE #5 (ORCHESTRATOR ERROR in the amendment, caught by the worker). When applying
P3-AMENDMENT #2 I updated SK3-10, the function contract at :2816 and test 14 at :2971 — but NOT
the mutation list at :3018-3019. M3.4b still read "make maybeCelebrateTrophy mark only the tier it
showed", which under the amendment IS the shipped behaviour: applying it produced a BYTE-IDENTICAL
file and the suite stayed green. The worker reported this honestly as an observed NON-FAILURE
instead of manufacturing one — the stop-rule working exactly as intended. It then ran the INVERTED
mutation (mark ALL in one pass = SK3-10 as originally drafted) and observed
  not ok 14 ... "pass 1 must write exactly one key"  4 !== 1
which is STRONGER evidence than the stale mutation would have given: it proves the guard fires
against precisely the behaviour the owner overruled. Lesson for future amendments: an amendment
must sweep the step's MUTATION LIST too, not just its prose and its tests.

P3-NOTE #6 (accepted shape, recorded). Step 3.2 shipped uncelebrated/maybeCelebrateTrophy as live
stubs; step 3.4's gate requires trophies.js to be INSERT-ONLY (0 deletions). Giving the stubs new
bodies would delete lines, so the worker preserved the stub lines byte-identical and had them
delegate to the new implementations. The result is two slightly verbose passthroughs that are
functionally identical to a direct return. RULED: accept. The behaviour is right (proven by the
drain harness above), the gate was honoured rather than relaxed, an in-code note explains why, and
the alternative is a gate amendment plus re-opening a passing mutation-tested step for a purely
cosmetic gain. Root cause was a plan drafting artifact: "append-only" was written for 3.4 without
accounting for the stubs 3.2 was told to ship.

STEP 3.5 T10: the dated additive palette truth-fix in docs/visual-design.md — WORKER
Two additive inserts spliced by script on bytes: a dated CORRECTION 2026-07-30 block after §3's
heading recording that styles.css is the source of truth, that the live palette is Sunrise
Parchment (a LIGHT warm ground, not the warm-dark one the table below records), the full live
:root table, the three tier tokens with their WCAG 1.4.11 basis, and the background.test.js pin;
plus a second dated note recording the 58-pair gate. LF 403 -> 464, +61/-0. Test file +48/-0,
+1 flat (18 total). Ledger 340/345 -> 341 flat / 346 reported — the phase's final number.
gate-3.5.sh exit 0.

EVERY COLOUR VALUE WAS READ FROM public/styles.css BY THE SPLICE SCRIPT, never transcribed —
which is the whole point of a step whose subject is a document that stated untrue values. The
worker cross-checked the plan's seventeen quoted hexes against the live CSS first: all seventeen
matched.

WORKER FINDING (good, and inside scope): the plan's "at minimum" hex list was INCOMPLETE for the
test it mandates — :root also declares --color-primary-ink: #fff6e8, which the plan did not list,
and test 18 requires EVERY 6-digit-hex token to appear in the doc. Recording only the seventeen
would have failed the step's own gate. The worker recorded all 24 :root declarations. Also noted:
the plan cites styles.css:1-24 as the :root range; it is :1-31 today because step 3.1 added the
three tier tokens, and the inserted block cites the computed range rather than the stale one.

FAIL-FIRST: M3.5a (--color-card #fffaf0 -> #fffaf1 in the STYLESHEET) failed with
"docs/visual-design.md does not record the live value of --color-card (#fffaf1)" — i.e. the test
detects the doc drifting from the stylesheet, which is exactly T10's failure mode; M3.5b (removing
the date, all THREE occurrences, the strongest form) failed with "the correction must carry its
date"; M3.5c (deleting the proven.png inventory row) failed with "the trophy inventory row for
proven must survive". All restored, md5-verified.

ORCHESTRATOR AUDIT (independent): parsed the LIVE :root (24 declarations, 20 of them 6-digit hex)
and confirmed every live hex value now appears in the doc — so the document no longer contradicts
the stylesheet on a single token. All 404 original lines survive IN ORDER byte-identical (0 lost,
0 reordered), which is stronger than "deletions == 0". §6 and §7 — the sections phase 2 wrote —
extracted from both versions and compared whole: byte-identical. The FROZEN STYLE SUFFIX still
extracts to 388 bytes md5 51b97a774dc52aa272850bb686c22188. CRLF=0. ACCEPTED.

STEP 3.6 THE SELF-SERVED VISUAL GATE — HALTED ON A BLOCKING DEFECT, THEN RESUMED
Lesson 11 followed in order: port 3000 checked FIRST (free), a FABRICATED sandbox profile seeded
outside the repo (never hers) chosen so all four card states appear at once — streak GOLD,
known SILVER, days + quizRight BRONZE, chapters/quizzer/proven LOCKED — server run with
DATA_DIR pointed at the sandbox and APP_CODE unset, service worker unregistered and caches
cleared before looking.

WHAT THE SCREEN GOT RIGHT (measured from the DOM, not eyeballed): all eight cards render with
their artwork loaded at natural 640x640; rings resolve to the three frozen tokens
(bronze rgb(164,98,42), silver rgb(111,106,99), gold rgb(154,114,0)) and locked to
--color-border with filter grayscale(1) opacity 0.45 — four visually distinct states; progress
lines read "7 מתוך 10", "15 מתוך 30", "0 מתוך 5"; GOLD cards correctly show NO progress line
(SK3-4); the four nav tabs are /reader /home /words /trophies with the trophies tab last;
the shelf-header banner crops well (SK3-3 gate PASSES, no fallback needed); and quizRight — the
tightest-cropped of the nine, flagged at the phase-2 art gate — survives the circular mask with
its target centred and nothing important cut. At a 320px column nothing clips and nothing
overflows (verified after confirming there are NO width-based media queries anywhere in the
shipped CSS, so constraining the column is a faithful simulation, not a substitute).

*** THE DEFECT — found by the human gate, invisible to all 341 tests ***
On #/trophies the overlay computed position:fixed z-index:90 display:flex — correct.
On #/words the SAME overlay computed position:static z-index:auto display:block, no rule
matching .trophy-celebrate existed in document.styleSheets at all, and it rendered as a raw
640px image dumped inline at the bottom of the document flow.
ROOT CAUSE: the house view pattern emits <style>${VIEW_STYLE}</style> INSIDE the view's own
container.innerHTML (words.js:100, reader.js:246, placement.js:213, parent.js:53,
trophies.js:299), so that CSS exists only while that view is mounted. The celebration is
body-appended and fires ONLY from words.js and reader.js — i.e. only on routes where the
trophies view is NOT mounted. In production it would have been unstyled 100% of the time; the
one route whose CSS it needed is the one route it never fires on.
WHY NO TEST SAW IT: test 17 asserted the celebration CSS TEXT exists inside VIEW_STYLE. It did.
Nothing asserted the CSS was REACHABLE FROM THE DOCUMENT when the overlay appears. Field-guide
lesson 1 exactly: a format gate standing in for a content gate — and the reason lesson 1 also
says "if no gate can see the failure, add a human one".
Per the step's own non-goal ("a defect found by the gate is a NEW STEP with its own frozen
validation, not an in-place fix inside a gate") the gate was HALTED here.

STEP 3.6a the fix — WORKER, authored by the orchestrator with its own frozen gate
The ENTIRE VIEW_STYLE block moved from public/views/trophies.js into public/styles.css, inserted
before the entry-code marker: styles.css CRLF 508 -> 622, trophies.js LF 439 -> 323 (VIEW_STYLE
and the <style> emission both gone). Precedent: the app's only other body-level overlay, the
entry-code gate, already lives in styles.css. The rule text was EXTRACTED from the live
VIEW_STYLE and proven verbatim — md5 of the HEAD block unindented by two spaces equals md5 of
the block now in styles.css (117382f2e47f447fe3aebacca1171170) — so no rule text changed, no
contrast pair moved, and the 58 anchor held. Ledger 341/346 -> 342 flat / 347 reported.
gate-3.6a.sh exit 0.

M3.6a-0 IS THE POINT OF THE STEP: the new test was written FIRST and run against the UNFIXED
tree, where it failed with
  not ok 19 - the celebration is styled from the globally-linked stylesheet, not from a view that may not be mounted
    'public/styles.css must carry .trophy-celebrate -- the overlay fires on routes where the
     trophies view is not mounted'
so the new gate provably sees the shipping defect. M3.6a-1 (re-adding a <style> emission) failed
on assertion 2 as mandated.

ORCHESTRATOR RE-VERIFICATION IN THE BROWSER — the only proof that counts. Sandbox restarted, hard
reloaded (note: assigning location.href to the same URL with only a hash change does NOT reload
the document; a cachebust query was needed — worth remembering). On #/words, the route that was
broken: rule reachable TRUE, overlay position:fixed z-index:90 display:flex justify:center, art
168px border-radius 50% border rgb(164,98,42). ONE tap dismissed it. Firing repeatedly drained
streak/silver, streak/gold, known/bronze, known/silver, quizRight/bronze, curious/bronze,
curious/silver, curious/gold and then returned null forever; 10 keys, all unique, never a repeat.
The owner's one-per-sitting ruling holds in the real browser, on the real route, styled.

P3-NOTE #7 (gate weakness, RULED, recorded not silently patched). The worker reported that
M3.6a-2 (deleting the .trophy-celebrate rule) does NOT fail the new test's assertion 1, because
assertion 1 is a CONTAINMENT check and ".trophy-celebrate" is a strict prefix of
".trophy-celebrate-card", which survives. It did not silently strengthen frozen test text, and it
showed the obvious fix is not uniform: four of the nine selectors appear in a comma-separated
list and never occur followed by " {". RULED: accept for now — the deletion IS still caught, by
test 17, which failed exactly as mandated; and the new test's actual purpose (catch view-only
CSS) is proven by M3.6a-0. Remedy if hardened later: per-selector rule-shaped expectations
(".trophy-celebrate {" for the five standalone rules, ".trophy-card--locked {" for the list
terminator, ".trophy-card--bronze .trophy-art {" and siblings for the three rings).

P3-NOTE #8 (cosmetic, OWNER'S CALL, deliberately not acted on). The overlay has NO dimmed
backdrop — .trophy-celebrate is a transparent full-screen tap target, so the screen behind shows
through around the card. It is functionally correct and matches the signed T5 text ("artwork +
name + tier, one tap to dismiss"), but it reads as a floating card rather than a moment. Adding
a scrim is a one-line token-only change. Left for the owner because it is taste on his
daughter's screen, not a defect. Two stale comments also survived the verbatim move (a
"public/styles.css:413" self-reference and a "the style tag" mention in screenHtml) — one-line
corrections for a follow-up, left alone because "no rule text may change" was frozen.

PHASE 3 CLOSED (2026-07-30)

Every acceptance criterion re-run on the COMMITTED tree (gate-3.7.sh = §VAL-P3 verbatim + step
3.5's assertion set + the frozen close block with BASE substituted). EXIT 0. Measured:
  suite 347 reported / 0 fail / plan 1..342, identical under APP_CODE=dummy · flat ledger 342
  contrast 58 PASS · public/ full pin 2372 7de2fc8a4ff87f57f1fa46e2f38912c9 (2371 + the one new
  file public/views/trophies.js) · both transcripts diff EMPTY · no .data/profile.json ·
  15 files changed vs BASE, 8 deletions total, ZERO files deleted, lib/ api/ data/ untouched ·
  quiz.js 69b6d711... and quiz-core.js 9a2131be... unmoved (QZ-18) · endings all at their pins.

P3-AMENDMENT #3 (orchestrator, at the close): the phase ledger is 342 flat / 347 reported, not
the planned 341/346. Step 3.6a added exactly ONE flat test — the one that catches the defect the
visual gate found. Nothing else in the pin set moved: 15 files and 8 deletions are exactly as
planned, because git diff against BASE compares END STATES and trophies.js is a new file, so
3.6a's internal churn (VIEW_STYLE out of the view, into styles.css) nets to zero against BASE.

WHAT THIS PHASE SHIPPED
  · public/views/trophies.js (NEW, LF, 323 lines) — the screen: shelf-header banner, one card per
    trophy with artwork, the signed Hebrew name, a tier ring and a live progress line; locked
    trophies are the SAME artwork dimmed; plus the celebration selection/drain logic.
  · public/styles.css CRLF 501 -> 622 — three tier tokens in :root, and (from 3.6a) every trophy
    and celebration rule, so body-level UI is styled on every route.
  · scripts/check-contrast.mjs LF 184 -> 190 — six new non-text 3:1 pairs; anchor 52 -> 58.
  · public/app.js, public/index.html, public/sw.js — route, fourth tab, PRECACHE, CACHE v18.
  · public/views/words.js, public/views/reader.js — the three celebration hooks, each guarded.
  · tests/trophies-ui.test.js (NEW, 829 lines, 19 flat tests, ZERO raw non-ASCII bytes).
  · docs/visual-design.md +61/-0 — T10's dated palette correction.

THE PHASE'S REAL LESSON. 341 automated tests passed on a celebration that would have been
unstyled on every route it can actually fire on. The defect was invisible to every mechanical
gate because the gate checked that the CSS TEXT existed, not that it was REACHABLE when the
element appears. It took a human opening a browser. That is field-guide lesson 1 restated, and
it is now lesson 14. The corollary worth carrying: when a step's gate and a step's purpose can
be satisfied by different facts, the gate is measuring the wrong thing.

Also corrected at this close: field-guide lesson 4 asserted public/sw.js is LF. It is CRLF, and
so are styles.css and index.html. TWO INDEPENDENT PLANNERS caught this before any code moved —
the reason the phase edited five CRLF files without a single normalisation.

FOR PHASE 4 (ship) TO CONSUME
  1. NEW PINS, all measured at this close and all REPLACING the phase-2 values:
       public/ full digest   2372 7de2fc8a4ff87f57f1fa46e2f38912c9   (was 2371 644f3333...)
       public/sw.js md5      d76f781dc49c5f629aba0f2dfe3304b6        (was f16579d5..., v17)
       public/styles.css md5 c244d1aeb04b03b6f9781fc3be50c6c5
       public/index.html md5 9976fb94ccda6eb5aa86d90335103337
       public/app.js md5     bfa3a8837a2fcdcd1c85502e5f1a86fb
     The phase-1/2 EXCLUSION pin 2362 74e736d7... is now DEAD — five files inside its scope moved.
     Do not quote it again.
  2. CACHE = "magic-vet-v18" IS IN THE WORKTREE BUT NOT LIVE. Production still serves v17. The
     v18 bump covers phase 2's assets AND phase 3's shell. QZ-22's hazard becomes real only at
     the deploy, which is phase 4's.
  3. THE D25 CAPTURE OF 2026-07-30 WILL BE STALE. Re-capture immediately before deploying, with
     the frozen subshell recipe (proven twice now). Receipt of the existing one is in this journal.
  4. WHAT SHE WILL SEE ON DAY ONE, measured not guessed: FOUR bronze celebrations — days, streak,
     known, curious — delivered ONE PER EARNING MOMENT (the owner's P3-AMENDMENT #2 ruling),
     drained in catalogue order, never repeated. Verified end to end in the browser.
  5. T8 READ-BACK: four trophies sit 1-3 actions from their next tier (chapters 2, proven 1,
     streak 2, known 3), so tiers WILL legitimately appear between capture and read-back. That is
     expected; only a DISAPPEARING tier is a rollback trigger.
  6. docs/visual-design.md:189 still reads "over 52 pairs". That is DELIBERATE (SK3-9): the line
     is preserved as history and a dated correction recording 58 sits beside it. Do not "fix" it.
  7. Still open and unactioned: P3-NOTE #7 (the new test's assertion 1 is a containment check and
     cannot see a single deleted rule — test 17 covers it meanwhile) and P3-NOTE #8 (the overlay
     has no dimmed backdrop; the owner's call, one token-only line).
  8. Two requests from the learner are recorded in .oplan/REQUESTS-FROM-THE-LEARNER.md and are
     NOT part of this run: R1 read the word aloud on tap, R2 do not reload the story when nothing
     changed (probably a defect, not a feature).

NOT DONE, DELIBERATELY: no deploy, no fresh capture, no touch of her live profile, no server or
lib change of any kind.
