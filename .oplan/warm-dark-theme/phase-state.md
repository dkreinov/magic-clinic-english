CURRENT: phase 2 CLOSED (gate passed) — phase 3 "PWA chrome + service-worker cache", next step 3.1
BASELINE (phase 3): to be set at the phase-3 commit; phase 2 baseline was ee87ab8
PLAN: .oplan/warm-dark-theme/plan.md
ACCEPTED: 1.1 d6309ab · 1.2 8271d0e · 1.3 c26a050 · 1.4 preview · 2.1 7363faf · 2.2 ac9110d ·
  2.3 87331b3 · 2.4 harness measurement (no commit)
FROZEN CONTRACTS IN FORCE:
  WDT-1 palette tokens (17 values, art-derived) — now live in public/styles.css ·
  WDT-2 WCAG AA gate, enforced by scripts/check-contrast.mjs (28 pairs, ALL PASS, exit 0) ·
  WDT-5 tint recipe (every mix goes into --color-card; percentages frozen) ·
  WDT-3 CLOSED by owner at the phase-1 gate: manifest/theme colors MAY change to
  #241305 / #2e1806 and the two tests/shell.test.js assertions MAY be updated ·
  WDT-6 interactive controls must declare an explicit foreground (buttons do not inherit) ·
  WDT-4 RTL, class names, data-testid, PRECACHE list, all copy unchanged ·
  docs/visual-design.md §3 is the amended binding palette contract (cream recorded superseded) ·
  inherited: GC-D5 asset library frozen; sw.js may change ONLY to bump the CACHE version
  (with its test string).
PHASE 1 GATE: PASSED (7/7 criteria). PHASE 2 GATE: PASSED (9/9 criteria) — 146/146 tests,
  contrast gate ALL PASS, zero light-theme leftovers in any view, exactly 3 files changed,
  styling-only proof empty, nothing else moved, WDT5-OK, INK-OK, and a real-rendering harness
  measurement of 25 states (24 pass; the one exception is the disabled button at 4.26, which
  WCAG 1.4.3 exempts).
OPEN QUESTIONS: none. Both owner-gate questions were answered on 2026-07-24:
  palette APPROVED as shown; manifest/theme colors and their two test assertions APPROVED to
  change to #241305 / #2e1806.
  FYI (not blocking, not a color issue): the "בואי נתחיל" primary button is an <a>, so it renders
  with a text underline. This predates the re-theme; fixing it is outside "colors only" scope.
KNOWN, ACCEPTED, NOT A DEFECT: `.btn[disabled]` renders at 4.26:1 — below 4.5 but explicitly
  exempt under WCAG 1.4.3 (inactive components), and deliberately muted so it reads as disabled.
BLOCKED: no — executing phase 3 autonomously.
