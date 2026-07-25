# Journal — run `poc-basics`

Append-only. Everything that happened.

## RUN OPENED 2026-07-25

Owner brief, verbatim: *"this and how to make this app growing with her, but first we are in poc
for her to start using it, so fix the basics"*. "this" = the placement fragility surfaced at the
close of the previous run (`.oplan/band2-and-polish/`, deployed and closed the same day).

WHY I ASKED BEFORE PLANNING. "Fix the basics" has at least three readings that produce materially
different work, so I put three scoped questions to the owner rather than guessing. Answers:
basics = the placement trap + the entry-code first-run experience + a way to re-take the test;
the item-bank gate gets a review TOOL built for the owner; growth is DESIGNED this run and BUILT
next. All three answers and my six design decisions (D1-D6) are in `brief.md`, written BEFORE any
planning so no decision lived only in a context window.

THE FINDING THAT REFRAMED THE WHOLE RUN. I went looking for what is broken and found something
better: nothing is broken. `.oplan/first-build/journal.md:613-615` records the core loop verified
end-to-end in production — placement, generation at >=0.95 coverage, tap-to-translate, micro-checks,
word bank, Blob persistence — with her profile then reset pristine. So this run is not repair work.
It is about what stands between her and a good FIRST SESSION.

And the placement trap is worse than "the band is a knife edge at 10/12". **The band is never
displayed anywhere in the UI** — `grep` over `public/views/*.js` and `public/app.js` finds no
reference to it at all. A wrong placement is not merely permanent, it is INVISIBLE: neither she
nor the owner can detect that it happened. That is what turned D1 from "build a better exam" into
"make the verdict visible and correctable". You cannot make a 12-item test precise; you make its
verdict recoverable. The better exam needs new artwork, new audio, a frozen-test contract change
and a band above A2 to promote into — all four already sit in the previous run's Deferred list, and
none of them helps her start this week.

## PHASE 1 — PLANNING

FRESH PLANNER (PLANNER tier, files only) drafted Phase 1 in full: 6 steps, 8 frozen contracts
(PB-1..PB-8), 9 acceptance criteria, a per-step test ledger, and skeletons for Phases 2 and 3.
tokens: unavailable (the harness reported no usage for that call). BLOCKERS: 2. RECORD GAPS: 5.
It verified its own load-bearing numbers live rather than asserting them — it re-derived
296/1257/2850 by calling `buildAllowedSet` with the real band files, confirmed all 12 item emojis
are distinct and every referenced asset exists on disk, and checked that `scripts/dev-server.js`
serves only `public/` (which is what makes D4 true by construction rather than by promise).

BOTH BLOCKERS ANSWERED BY THE ORCHESTRATOR (oplan §10 step 11), in writing, in plan.md:
1. *Does the item-bank review gate the deploy?* The planner correctly refused to invent this. The
   answer is that the two were never coupled: `design.md` §4 gates the CHILD SEEING the test, not
   the code being live, and the app sits behind `APP_CODE` — she cannot reach the placement test
   without a code the owner holds. So Phase 2 deploys without waiting, and the run closes by telling
   the owner the order: open the tool, sign the gate, THEN give her the code.
2. *Should `#/parent` be written into `docs/owner-handoff.md`?* Yes. A route nobody can find
   delivers nothing, the file carries no FROZEN header, and it is the document the owner opens.
   The planner flagged this as the one place it extended the brief's letter to serve its intent
   rather than burying it — the right instinct, and approved.

ALL FIVE RECORD GAPS REPAIRED BEFORE THE FIRST DISPATCH: the missing workspace files created (this
file, `phase-state.md`, `STATUS.md`); the brief's stale base commit corrected (`e4c5885` ->
`89e6600`); an empty deployment ledger opened in `phase-state.md` with the instruction that Phase 2
must re-establish the rollback target with `vercel inspect` rather than inherit the previous run's
id; the `sessionStorage`-unavailable behaviour decided in PB-3; and the stale-by-design emoji table
logged below.

RECORD GAP WORTH ITS OWN LINE: `docs/item-bank-review.md`'s 12-row table still describes the task-1
options as EMOJI, but the app has rendered illustrations (`public/assets/placement/*.webp`) since a
previous run. The document the owner is required to review has been describing something the child
never sees. Left standing deliberately — step 1.5's tool shows the real illustrations and supersedes
it — but recorded here so the next run knows the table is stale BY DESIGN, not by accident.

PLAN REVIEWER (CHECKER tier, fresh eyes, read-only) — VERDICT: fix-first. tokens: 116665.
IT CAUGHT A GATE THAT COULD NEVER PASS, which is exactly what this layer exists for. Acceptance
criterion 7 asserted `git diff --name-only 89e6600 -- public | grep -c ''` = **5**, while criterion
5's own path list contains **6** files under `public/` (`api.js`, `app.js`, `styles.css`, `sw.js`,
`views/parent.js`, `views/placement.js`). The phase could have executed perfectly and still failed
its own closing gate. Fixed to 6.
It also caught dead-wrong prose in a frozen criterion — criterion 5 said "these 13 paths" above a
16-path list — and, best of the three, that step 1.6's validation grepped only SOME lines of the
three multi-line Hebrew blocks it inserts. Field-guide lesson 6 requires a substring of EVERY new
line plus `wc -l`; without it a worker could subtly reword an ungrepped line and still go green.
Added 11 more per-line greps; step 1.6's gate now carries 28 content assertions.
Everything else it checked held: the 157->172 test ledger is internally consistent and matches each
step's enumerated `test()` calls (2+6+3+0+4+0=15); the 296/1257/2850 integers reproduce live; the
entry-gate singleton, the PB-3 sessionStorage flag and the PB-1 dynamic import all match the
current `app.js`/`api.js`/`placement.js` structure line-for-line; the per-step changed-path counts
are right; and the Hebrew feminine address is grammatically sound throughout.

A NOTE ON MY OWN TOOLING, since §12 asks where the machinery costs rather than pays: I burned three
attempts applying those fixes because Hebrew string anchors inside a bash heredoc kept failing to
match — bidi display reordering makes a copied Hebrew line look identical while differing in byte
order. The fix was to stop inlining the script and write it to the scratchpad as a file with
`\uXXXX` escapes. Worth recording as the general lesson: never anchor a patch on a bidi string you
copied out of terminal output.

STATUS.md OVERAGE, JUSTIFICATION PAID (§6's soft-cap price): 65/60 lines, measured with wc -l, not
  guessed — the phase-2 and phase-3 closes of the previous run both caught me writing a plausible
  number before running the command, so the number above is the command's output. The five lines
  over are the "two decisions I made that you should know about" section: both are places where I
  resolved something on the owner's behalf (the review does not gate the deploy; #/parent goes in
  the handoff doc), and a decision made FOR someone that they cannot see is worse than a long file.

## PHASE 1 — EXECUTION

STEP 1.1 placement.js honours a client-side re-take flag
  tier: WORKER (Sonnet)
  did: public/views/placement.js: added RETAKE_KEY const (edit1), consumeRetakeFlag() before
    resumeStage (edit2), retake consumed in render() and used in boot()'s stage assignment (edit3).
    tests/placement-ui.test.js: appended two new tests per edit4 spec, existing tests untouched.
  surprises: none
  deviations: none
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.1-OK, 159 pass / 0 fail)
  retries: 0
  escalations: 0
  tokens: worker=42766, checker=31020, orchestrator_delta=unavailable
  interventions: 0
  auditor: match, CONFIDENCE high (it noted it could not execute the frozen command itself — it is
    not supposed to; I ran it, in a clean tree, before dispatching the audit)
  commit: a098d3d
  accepted: 2026-07-25

STEP 1.2 the owner-only `#/parent` view and its route
  tier: WORKER (Sonnet)
  did: public/app.js — added OWNER_ROUTE const, updated currentRoute() and renderRoute() per the
    frozen edits (dynamic import of parent.js, setActiveTab moved above the view call).
    public/views/parent.js (NEW) — words.js-shaped view rendering the four PB-2 cards plus the
    footer note; only getJson imported. tests/parent-ui.test.js (NEW) — the six frozen tests.
  surprises: none reported
  deviations: none reported — but see the process finding below; one went unreported
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.2-OK, 165 pass / 0 fail,
    contrast gate 52 pairs ALL PASS)
  retries: 0
  escalations: 0
  tokens: worker=62312 (+58733 for the follow-up question), checker=50456 + 51192 (re-audit)
  interventions: 1 (bad-spec — MINE, see below)
  auditor: mismatch on the first pass, then match/high on the re-audit after I supplied the missing
    evidence. Neither pass was wrong: the first auditor could not see PB-2's frozen copy because my
    excerpt did not contain it, and it said so in CONFIDENCE: low rather than guessing.
  commit: 639479f
  accepted: 2026-07-25

  THE PROCESS FINDING, which matters more than the step. I built the worker's spec file by slicing
  plan.md lines 360-537 (step 1.2 only). That slice NAMES PB-1/PB-2/PB-2a/PB-3/PB-8 but does not
  QUOTE them — PB-2's frozen Hebrew copy lives at lines 175-277, outside the slice. So I dispatched
  a packet with a hole in it, which oplan §4.2 calls a bug in the run, and it was mine.
  The worker did not stop and ask. It grepped for "PB-1", found plan.md, read lines ~175-276 and
  copied the contract. The OUTPUT is exactly right — I verified the card-4 paragraph is
  byte-identical (148 chars) to plan.md's frozen text with a node string compare, not by eye. But
  the rule that should have fired did not: an unanswered question was resolved by a worker's
  resourcefulness instead of by me, and it was not even listed under DEVIATIONS. Had it wandered
  further into plan.md it could have implemented a later step's work from the same file.
  CORRECTION APPLIED for the rest of the phase: every worker spec file is now built as
  `frozen contracts block (plan.md 175-277) + the step`, so the packet is self-contained and there
  is nothing left to go looking for. Promote to the field guide at the phase boundary.
  WHY I DID NOT REVERT: oplan §10.8 says revert on a mismatch, but that rule exists for work that
  contradicts the spec. This work matches the true frozen contract; what was wrong was the evidence
  I gave the auditor. So I supplied the evidence and re-audited once, which is exactly §10.8's
  low-confidence remedy. Reverting correct, mechanically-verified work to re-run it against a
  better-worded packet would have burned a worker to change nothing on disk.
  ALSO VERIFIED BY ME, because no auditor could: the view's field reads match the real API.
  api/placement.js:57 stores `placement.task1 = {correct, total, score, answeredAt}` and sets
  `placement.completedAt`; lib/profile.js:33 makes `words` a plain object; public/api.js's
  handleResponse returns `payload.data`, so getJson("/api/profile") yields the profile itself, not
  the envelope. A wrong guess on any of those three would have shown the owner a screen of blanks
  and "טרם נעשתה" forever, with every test still green.
