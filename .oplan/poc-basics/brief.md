# Brief — run `poc-basics`

Written by the orchestrator BEFORE planning, so no decision lives only in a context window.
Base commit: `89e6600` (corrected from `e4c5885` — see plan.md). Predecessor run: `.oplan/band2-and-polish/` (closed, deployed).

## The owner's words

> "this and how to make this app growing with her, but first we are in poc for her to start using
> it, so fix the basics"

"this" = the placement fragility surfaced at the end of the previous run.

## The owner's answers to the three scoping questions (2026-07-25)

1. **What is in "the basics"?** — three of four offered, explicitly chosen:
   - the placement trap,
   - the entry-code first-run experience,
   - a way to re-take the placement test.
   (NOT chosen: "nothing else, just make it deployable".)
2. **The item-bank review gate** — "build me a review screen": a tool that plays each audio clip
   and shows each picture and its options in order, so the required review is a few minutes of
   tapping instead of a 30-minute manual chore opening mp3 files by hand.
3. **"Growing with her"** — "design it, build it next run": this run ships the basics; the growth
   model is written as a document the owner approves, and BUILDING it is a separate future run.

## What the orchestrator established from the code before planning (facts, not assumptions)

All verified directly in the repo during this session:

- **The band is never displayed anywhere in the UI.** `grep` over `public/views/*.js` and
  `public/app.js` finds no reference to the band or to `receptiveVocab`. The placement result
  screen says only "סיימת את המבחן!" and "עכשיו הסיפור יתאים בדיוק לך."
  **This is the core finding of the whole brief:** a wrong placement is not merely permanent, it is
  INVISIBLE. Nobody — not her, not the owner — can detect that it happened.
- **The band is written in exactly one place and never moves.** `api/placement.js:54` sets
  `p.skills.receptiveVocab = { state, score, band: bandForScore(r.score) }` on submit. Nothing else
  in `lib/` or `api/` ever assigns it. `design.md` §3 claims "continuous calibration is the real
  engine; the placement test is only the prior" — in the code that is only half true. Tapped words
  accumulate into the allowed set; the BAND is frozen at whatever the 12 pictures said.
- **The vocabulary band rests on 12 items only.** `buildAllowedSet` reads
  `skills.receptiveVocab.band`. Task 2 (the 6 comprehension questions) writes
  `skills.readingComprehension`, which `buildAllowedSet` never reads.
- **The threshold is a knife edge:** 10/12 = 0.833 → A2 (2,850 words); 9/12 = 0.750 → A1
  (1,257 words). Two slips — and six of the twelve are AUDIO items — cost 1,593 words.
- **Re-taking needs NO API change.** `api/placement.js` overwrites `skills.receptiveVocab`
  unconditionally on every `submit`. The only obstacle is client-side: `resumeStage()` in
  `public/views/placement.js` returns `"done"` whenever `placement.task1 && placement.task2`, and
  the done screen offers no way to start over.
- **The entry code is a raw `window.prompt("קוד כניסה")`** in `public/api.js`. No explanation of
  what the code is, no styled error when it is wrong, and exactly one retry (`allowRetry = false`
  on the second attempt) before a raw Hebrew error string surfaces. This is her first interaction
  with the app.
- **The item-bank review has never been done.** `docs/item-bank-review.md` is headed
  `STATUS: REQUIRED-BEFORE-CHILD-USE`; every checkbox is empty. `design.md` §4 and §8 make it
  mandatory before the child sees the test, and `.oplan/first-build/journal.md:624` closed that run
  with it as an explicit outstanding owner gate.
- **The core loop itself works.** `.oplan/first-build/journal.md:613-615` records production
  verification end-to-end: placement, story generation at ≥0.95 measured coverage, tap-to-translate,
  micro-checks, word bank, Blob persistence — then her profile was reset pristine for first use.
  So this run is NOT about broken machinery. It is about what stands between her and a good first
  session.
- **Assets that already exist:** 6 mp3s in `public/audio/`, 12 webps in `public/assets/placement/`.
  Onboarding (naming the heroine and the pet) already exists in `public/views/reader.js:303-362`.

## Design decisions the orchestrator has MADE (not deferred to execution)

- **D1 — the placement trap is fixed by making the verdict VISIBLE and CORRECTABLE, not by
  building a better estimator.** You cannot make a 12-item test precise; you make its verdict
  recoverable. A better exam would need new artwork, new audio, a frozen-test contract change, and
  a band above A2 to promote into — all of which the previous run already surfaced as Deferred and
  none of which helps her start using the app this week.
- **D2 — the band readout goes on an owner-only route `#/parent`, NOT in front of the child.**
  Telling an 11-year-old "you are A1" is meaningless at best and demotivating at worst. The route is
  deliberately absent from the tab bar; it is reachable by URL and already sits behind the app code.
  This is the smallest honest version of `design.md` §6 item 4b (parent view), which that document
  schedules as a later phase — so this is a down-payment on an approved idea, not new scope.
- **D3 — re-take is client-only.** No new API action, no change to `api/placement.js`. This avoids
  touching `tests/api-placement.test.js`, which freezes the 400-on-unknown-action behaviour.
- **D4 — the item-review tool does NOT ship to her app.** It is generated into `docs/` and opened
  locally as a file, referencing `../public/audio/...` and `../public/assets/placement/...` by
  relative path. Anything placed under `public/` would deploy to production.
- **D5 — a manual band override for the owner is OUT of scope**, and deliberately so. Re-taking the
  test already recovers from a wrong placement, and an override would need a new write surface on
  the profile API. Recorded as Deferred rather than silently dropped.
- **D6 — no change to `bandForScore`, to the thresholds, or to the item bank.** Moving the
  threshold relocates the knife edge instead of removing it, and changing items is the Deferred
  harder-placement-items work that needs new assets and an owner-approved frozen-test change.

## Phase shape

- **Phase 1 — the basics** (code + tests): the owner view, re-take, the entry-code screen, the
  item-review tool.
- **Phase 2 — deploy so she can start.** The previous run proved the recipe; field-guide lesson 12
  carries it.
- **Phase 3 — the growth design document** the owner approves, which becomes the next run.

## Standing constraints inherited and still binding

The learner's stored profile is never read or written by this run outside the app's own normal
operation on a LOCAL server with a scratch `DATA_DIR`; `GET /api/profile` CREATES a profile when
absent. `design.md` and `docs/visual-design.md` are FROZEN. Any change under `public/` ships with a
service-worker `CACHE` bump in the same phase. Images come from the free ChatGPT web route.
