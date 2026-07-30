CURRENT: phase 2 "the assets" CLOSED (2026-07-30). Nine owner-approved trophy images are
  committed as PNG masters and 640x640 webp derivatives; no app code, no test, no CSS, no CACHE
  bump, no deploy. NEXT: phase 3 "the screen" — NOT PLANNED YET (design §5 sketch only; a fresh
  planner details it on the owner's go-ahead).
PLAN: .oplan/word-trophies/plan.md (phases 1 and 2 closed in full; phases 3-4 still the design
  §5 sketch)
DESIGN: design.md (SIGNED 2026-07-29) · JOURNAL: journal.md (PHASE 2 CLOSED block has the
  rulings, the traps and every measurement) · BRIEFING: briefing.md · STATUS: STATUS.md ·
  FIELD GUIDE: field-guide/index.md (66 lines; phase-2 close added lesson 13, the art-chat
  driving recipe and its four silent no-op traps)
BASE (phase 1): 1a30012991130cf0032c1743d0448a4c509509ac
BASE (phase 2): fe1f78ab1d9e0b92d4d53208f117fa65f4c71c37
ACCEPTED (phase 1): 1.1 f5212c5 · 1.2 344f0de · 1.3 d848aa7 · 1.4 3d19efb · closed 4966d89
ACCEPTED (phase 2): 2.1+open 42cbcd5 · 2.2+2.3 67638bf · 2.4 f48e77e · 2.5 83e7587 · close <this>
STATE OF THE TREE: suite 328 reported / 323 flat / 0 fail (both modes) · contrast 52 ·
  CACHE magic-vet-v17 live AND worktree, public/sw.js md5 f16579d50af8b49a04e45a80975c6acf
  (NOT bumped in phase 2 — see the carried obligation below) · transcripts EMPTY ·
  no .data/profile.json · NO D25 capture exists (english-app-backups/ empty; phase 4 makes one)
PUBLIC/ PINS (both valid, they measure different things):
  · FULL recursive digest, the pin phase 3 inherits:  2371 644f333395566079ef6d0441438c7a4a
  · EXCLUSION digest (everything OUTSIDE public/assets/trophies/), valid forever, unchanged
    since the phase-1 close:                          2362 74e736d7d83b22a24945eae87cb9fe33

WHAT PHASE 2 SHIPPED (all nine owner-approved at the GC-D8 gate, 2026-07-30, verdicts and md5s
in journal.md):
  · assets/delight/trophies/<id>.png — nine masters, every one 1254x1254 square PNG, md5-distinct
    from each other, from the nine existing assets/delight/*.png and from the style anchor.
  · public/assets/trophies/<id>.webp — nine derivatives, every one 640x640, md5-distinct,
    byte-reproducible (the build script was run four times; identical bytes every time).
    Total 256146 bytes for all nine.
  · scripts/optimize-trophies.js — new, LF-only (CRLF=0 LF=39), sharp / width 640 / quality 72 /
    effort 4, a sibling of scripts/optimize-placement.js.
  · docs/visual-design.md — +86 lines, 0 deleted: nine inventory rows, the nine prompts verbatim,
    one pipeline bullet. §3 provably untouched.

FOR PHASE 3 TO CONSUME (carried obligations — none of these are optional):
  1. CACHE v17 -> v18 IS NOW MANDATORY IN PHASE 3, and it covers phase 2's public/ addition as
     well as phase 3's own (SK2-3, ratified by the owner at the phase-2 GO). No deploy happens
     before phase 4, so nothing is at risk in the meantime. tests/shell.test.js:58 pins the
     CACHE string — it moves in the same step (lesson 7).
  2. THE NINE FILENAMES ARE FROZEN. The eight trophy stems are the TROPHY_CATALOG ids in
     lib/profile.js EXACTLY, camelCase included: chapters, days, streak, known, quizRight,
     quizzer, curious, proven. Phase 3 builds the src as `/assets/trophies/${id}.webp`. The
     ninth is shelf-header. Do not rename anything.
  3. TROPHY ART IS NOT PRECACHED and must not be added to PRECACHE (design §2(iv), T6): artwork
     is runtime-fetched. The v18 bump is for the shell, not for these files.
  4. THE SHELF-HEADER IS SQUARE (1254x1254 master, 640x640 webp) and T4 never places it —
     RECORD GAP 1 is still open. Phase 3 must RULE on its role, position and framing, and the
     answer is CSS (object-fit / aspect-ratio), never a regeneration.
  5. NO ASSET TEST EXISTS. Nothing mechanical would notice if a trophy webp were deleted
     (SK2-7). Phase 3 introduces the references, so phase 3 adds the existence/distinctness test
     and moves the ledger ONCE for the whole screen.
  6. T10 (the docs/visual-design.md §3 palette truth-fix) IS UNASSIGNED BY DESIGN §5 and was
     handed to phase 3 (SK2-6), which is the phase that works the palette (T7). It was
     deliberately kept out of phase 2's diff and §3 is byte-identical to the phase-1 close.
  7. THE LEDGER AND THE ANCHOR DID NOT MOVE: phase 3 starts from 323 flat / 328 reported and
     contrast 52, exactly where phase 1 left them. T7's three tier tokens WILL move the 52
     anchor; every pin of that number moves in the same step (design T7, the word-g1 28->52
     precedent).
  8. RECORD GAP 1 (the chapter response carries no profile — the celebration source ruling) and
     risk 1 (progress comes from the LIVE metric, never a stored high-water mark, never shown as
     a loss) are still open and belong to phase 3.

FROZEN CONTRACTS IN FORCE: everything in .oplan/word-g1/phase-state.md:34-42 · signed design
  T1-T10 as amended by SK-1..SK-6, amendment #3, SK2-1..SK2-8 and P2-NOTE #1..#4 · the engine's
  frozen error strings · the never-regress law · workers never run git writes · the FROZEN STYLE
  SUFFIX (388 bytes, md5 51b97a774dc52aa272850bb686c22188, heading `### FROZEN STYLE SUFFIX` at
  docs/visual-design.md:197 — EXTRACTED by heading, never retyped; design's :190-195 line pin is
  stale) · the ONE art chat (docs/visual-design.md:266) · GC-D8: the owner gates every image and
  the verdict binds to an md5 · the .oplan awk filter is `awk '$NF !~ /^\.oplan\//'` (P2-NOTE #1:
  plan.md:989's copy has collapsed backslashes and is a SYNTAX ERROR — never copy that line).
OPEN QUESTIONS: phase-3 go-ahead — owner. Nothing else is blocked.
BLOCKED: no.
