CURRENT: phase 3 "the screen" CLOSED (2026-07-30). The trophies screen, the fourth nav tab, the
  earn-moment celebration, the three tier tokens and CACHE v18 are all committed and gated.
  NOTHING IS DEPLOYED — production still serves v17 and has never seen any of this.
  NEXT: phase 4 "ship" — NOT PLANNED YET (design §5 sketch only; a fresh planner details it on
  the owner's go-ahead).
PLAN: .oplan/word-trophies/plan.md (phases 1, 2 and 3 in full; phase 4 still the design §5 sketch)
DESIGN: design.md (SIGNED 2026-07-29) · JOURNAL: journal.md (PHASE 3 CLOSED block has the pins,
  the rulings and the defect story) · BRIEFING: briefing.md · STATUS: STATUS.md ·
  FIELD GUIDE: field-guide/index.md (89 lines; phase-3 close CORRECTED lesson 4's false
  "sw.js is LF" claim and added lesson 14, view-scoped CSS cannot style a body-level element)
LEARNER REQUESTS: .oplan/REQUESTS-FROM-THE-LEARNER.md — R1 read the word aloud on tap, R2 do not
  reload the story when nothing changed. Neither is part of this run.
BASE (phase 1): 1a30012991130cf0032c1743d0448a4c509509ac
BASE (phase 2): fe1f78ab1d9e0b92d4d53208f117fa65f4c71c37
BASE (phase 3): 802230f1b97aa2adbff154c3f8de7d7944af12f2
ACCEPTED (phase 1): 1.1 f5212c5 · 1.2 344f0de · 1.3 d848aa7 · 1.4 3d19efb · closed 4966d89
ACCEPTED (phase 2): 2.1+open 42cbcd5 · 2.2+2.3 67638bf · 2.4 f48e77e · 2.5 83e7587 · closed 2ee5ca6
ACCEPTED (phase 3): 3.1 dee596d · 3.2 d8ee456 · 3.3 48ee853 · 3.4 4acc8a2 · 3.5 915c107 ·
  3.6a e6e02bf · closed <this>

STATE OF THE TREE (all measured at the phase-3 close):
  suite 347 reported / 342 flat / 0 fail, identical under APP_CODE=dummy · contrast anchor 58
  both transcripts diff EMPTY · no .data/profile.json · lib/ api/ data/ untouched all phase
  public/quiz.js 69b6d71117cf776715374abc6f0abb02 · public/quiz-core.js 9a2131be8b9d1b77c219f1e8c3482a71 (QZ-18)

PINS PHASE 4 MUST QUOTE (re-measured 2026-07-30 AFTER steps 3.8 and 3.9 -- these SUPERSEDE the
values written at the phase-3 close, which moved when the celebration was rebuilt):
  public/ full digest    2372 25db383385172d14d512e8f3695bdd33   (was 2372 7de2fc8a... at the close)
  public/sw.js           d76f781dc49c5f629aba0f2dfe3304b6   CACHE = "magic-vet-v18"   (unchanged)
  public/styles.css      21386f241459f7cc8ca353e9571c0490   (was c244d1ae... at the close)
  public/views/trophies.js 3e45fe68b6a1e03b3072a63121c98a24 (was 13f3bbd6... at the close)
  public/index.html      9976fb94ccda6eb5aa86d90335103337   (unchanged)
  public/app.js          bfa3a8837a2fcdcd1c85502e5f1a86fb   (unchanged)
  LEDGER 344 flat / 349 reported · CONTRAST 58
  DEAD: the phase-1/2 EXCLUSION pin 2362 74e736d7... -- never quote it again.

LIVE PRODUCTION RIGHT NOW (verified read-only 2026-07-30, no auth, no /api/profile):
  https://english-app-three-tan.vercel.app/sw.js  ->  const CACHE = "magic-vet-v17"
  /assets/trophies/days.webp -> 404
  i.e. NOTHING from this entire run has ever shipped. Phase 4 is the first deploy.

ACCEPTED (post-close, owner-directed): 3.8 d53e7f2 (celebration = floating medallion, design A1;
  P3-NOTE #7 hardening) · 3.9 0115260 (earned sound via Web Audio, design A2; desktop ray cap;
  the no-sound test rewritten per A3). Design amended additively at 1473b4c (design.md §9).

D25 CAPTURE: one exists, taken early on the owner's authorisation —
  english-app-backups/profile-20260730-114016.json, 13295 bytes,
  sha256 4e7fe8bca4ac6d577970b69bc047363603b78c6838efe83c9fce999ed080a597.
  IT WILL BE STALE BY THE DEPLOY. Phase 4 re-captures with the frozen subshell recipe
  (.oplan/word-quiz/plan.md:1573-1586), which has now run clean twice.

FOR PHASE 4 TO CONSUME (carried obligations):
  1. v18 IS IN THE WORKTREE, NOT LIVE. Production serves v17. The single bump covers phase 2's
     assets and phase 3's shell. QZ-22's "returning devices serve the old shell forever" hazard
     becomes real only at the deploy — which is phase 4's, and it is the first deploy of this run.
  2. WHAT SHE SEES ON DAY ONE, MEASURED (not estimated): FOUR bronze celebrations — days, streak,
     known, curious — one per earning moment, in catalogue order, never repeated. This is the
     owner's P3-AMENDMENT #2 ruling and it was verified end to end in a real browser.
  3. T8 READ-BACK RULE, sharpened: four trophies sit 1-3 actions from their next tier (chapters
     2, proven 1, streak 2, known 3). Tiers WILL legitimately APPEAR between capture and
     read-back, with activity evidence. Only a DISAPPEARING tier or a lost tier is a rollback.
  4. THE ART IS RUNTIME-FETCHED AND NOT PRECACHED, by design. Nine webps under
     public/assets/trophies/ are served but never in PRECACHE. A test now asserts this, and
     asserts the nine filenames CASE-EXACTLY (Vercel is case-sensitive; existsSync here is not).
  5. docs/visual-design.md:189 still says "over 52 pairs" ON PURPOSE (SK3-9) — history preserved
     with a dated correction beside it recording 58. Do not "fix" it.
  6. STILL OPEN, both the owner's call, neither blocking: P3-NOTE #7 (the 3.6a test's assertion 1
     is a containment check, so it cannot see a single deleted rule — test 17 covers that
     meanwhile; the remedy is written out in the journal) and P3-NOTE #8 (the celebration overlay
     has no dimmed backdrop — it reads as a floating card; a one-line token-only change).

FROZEN CONTRACTS IN FORCE: everything in .oplan/word-g1/phase-state.md:34-42 · signed design
  T1-T10 as amended by SK-1..SK-6, amendment #3, SK2-1..SK2-8, SK3-1..SK3-11, P2-NOTE #1..#4 and
  P3-AMENDMENT #1..#3 · the never-regress law · workers never run git writes · the FROZEN STYLE
  SUFFIX (388 bytes, md5 51b97a774dc52aa272850bb686c22188) · the ONE art chat · GC-D8 · the
  .oplan awk filter is awk '$NF !~ /^\.oplan\//' (plan.md:989's copy is a SYNTAX ERROR) ·
  MEASURE line endings, never remember them (lesson 4 was wrong and cost nothing only because
  two planners re-measured).
OPEN QUESTIONS: phase-4 go-ahead — owner.
BLOCKED: no.
