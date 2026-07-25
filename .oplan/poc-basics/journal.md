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
