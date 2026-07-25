CURRENT: RUN CLOSED — all 5 phases complete and live at https://english-app-three-tan.vercel.app
  (deployment english-4wpo2b8bf). Crash fixed, fairness fixed, 12 rich scenes shipped.
BASELINES: phase 1 = 04267f5 · phase 2 = 862279c · phase 3 = 33db1a6 · phase 4 = 3df6ca7
PLAN: .oplan/placement-fix-and-art/plan.md
ACCEPTED: 1.1 51854ec · 1.2 harness · 1.3 306f11f · 2.1 33db1a6 · 3 (12 masters) 3df6ca7 ·
  4.1 c417424 · 4.2 b1e253c · 4.3 ac95fd8 · 4.4 runtime proof · phase 5 deploy + live verify
FROZEN CONTRACTS IN FORCE:
  PFA-1 the current task2 text must be EXPLICIT state, never derived from answeredness ·
  PFA-2 the item-bank schema is test-frozen; image work must be ADDITIVE only (emoji field and
  options arrays keep their exact values) · PFA-3 the WCAG AA gate must keep exiting 0 ·
  inherited and still binding: docs/visual-design.md is the frozen visual contract (dark-warm
  palette, WDT-1 tokens); sw.js may change ONLY to bump the CACHE version with its test string.
OPEN QUESTIONS: none. All resolved: images approved via the FREE ChatGPT web route (owner policy:
  free web for anything not generated at app runtime — saved to memory); horse distractor swapped
  for camp; rich scenes rather than icon tiles, with tiles enlarged to suit.
GATES: phase 1 PASSED (7/7) · phase 2 PASSED · phase 3 PASSED (12 distinct square masters) ·
  phase 4 PASSED (5/5, incl. a live-DOM runtime proof) · phase 5 PASSED (live verification).
BLOCKED: no — run complete.
OWNER FYI (not defects): the "בואי נתחיל" button renders with a link underline (pre-existing,
  out of scope) · api/chapter.js depends on OpenAI, so their outages break chapter generation.
LESSON FOR NEXT RUN: after editing data/*.json, RESTART long-running dev servers — Node caches
  JSON imports, and a stale sandbox showed a horse where the tent already was on disk.
