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
