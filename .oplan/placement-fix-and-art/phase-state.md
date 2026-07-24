CURRENT: phase 1 CLOSED AND SHIPPED (7/7 criteria) — PAUSED at the owner gate before phase 2
BASELINE (phase 1): 04267f5
PLAN: .oplan/placement-fix-and-art/plan.md
ACCEPTED: 1.1 51854ec · 1.2 harness proof (no commit) · 1.3 306f11f · deployed dpl english-19wjsaomy
FROZEN CONTRACTS IN FORCE:
  PFA-1 the current task2 text must be EXPLICIT state, never derived from answeredness ·
  PFA-2 the item-bank schema is test-frozen; image work must be ADDITIVE only (emoji field and
  options arrays keep their exact values) · PFA-3 the WCAG AA gate must keep exiting 0 ·
  inherited and still binding: docs/visual-design.md is the frozen visual contract (dark-warm
  palette, WDT-1 tokens); sw.js may change ONLY to bump the CACHE version with its test string.
OPEN QUESTIONS:
  1. Image generation spends the owner's OpenAI credit — approve scope/method? — OWNER (gated
     after phase 1 ships; does not block phase 1)
  2. Item t1-01 "pet" lists 🐎 horse as a distractor, but a horse IS a pet — fix the item?
     This is a content change. — OWNER (does not block phase 1)
BLOCKED: no — paused by design at the owner gate. Phase 2 spends the owner's OpenAI credit.
SCOPE CORRECTION since the plan was written: 12 unique concepts need artwork, not 11 — items
  t1-07..t1-12 are `picture-to-word`, where the emoji is the PROMPT and there is no audio, so
  🐒 monkey (prompt-only) joins the 11 option emoji.
