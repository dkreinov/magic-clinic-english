CURRENT: phase 1 COMPLETE and gate-passed — run PAUSED at the OWNER GATE, awaiting owner decisions
PLAN: .oplan/warm-dark-theme/plan.md
ACCEPTED: 1.1 d6309ab · 1.2 8271d0e · 1.3 c26a050 · 1.4 orchestrator preview (no commit)
FROZEN CONTRACTS IN FORCE:
  WDT-1 palette tokens (17 values, art-derived) — now live in public/styles.css ·
  WDT-2 WCAG AA gate, enforced by scripts/check-contrast.mjs (28 pairs, ALL PASS, exit 0) ·
  WDT-5 tint recipe (every mix goes into --color-card; percentages frozen) ·
  WDT-3 manifest colors #faf7f2/#7c3aed still test-frozen and UNTOUCHED ·
  WDT-4 RTL, class names, data-testid, PRECACHE list, all copy unchanged ·
  docs/visual-design.md §3 is the amended binding palette contract (cream recorded superseded) ·
  inherited: GC-D5 asset library frozen; sw.js may change ONLY to bump the CACHE version
  (with its test string).
PHASE 1 GATE: PASSED. All 7 acceptance criteria met — 146/146 tests, contrast gate ALL PASS,
  zero light-theme leftovers, exactly 3 files changed, styling-only diff proof empty, no other
  public/ or tests/ file touched, screenshot shows no cream surface.
OPEN QUESTIONS (both are blocking — the owner gate is the only planned pause in this run):
  1. May tests/shell.test.js's manifest background_color (#faf7f2) and theme_color (#7c3aed)
     assertions change to #241305 / #2e1806? This is a real contract change. — OWNER
  2. Approve the WDT-1 palette and the artwork-blend treatment (banner bottom-fade, spot art as
     a soft-edged circle)? — OWNER
  FYI (not blocking, not a color issue): the "בואי נתחיל" primary button is an <a>, so it renders
  with a text underline. This predates the re-theme; fixing it is outside "colors only" scope.
BLOCKED: no — waiting on the owner gate by design. Phases 2–4 are planned as skeletons and
  cannot start until question 2 is answered (question 1 blocks only Phase 3).
