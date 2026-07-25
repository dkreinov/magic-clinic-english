CURRENT: phase 2 — next and last step 2.7 (manifest, iOS link, icons test, docs §6)
BASELINES: phase 1 = bbdb60c · phase 2 = 679dcc9 (test baseline 151 pass / gate 28 pairs ALL PASS)
PLAN: .oplan/band2-and-polish/plan.md
DESIGN: .oplan/band2-and-polish/design.md (copied in 2026-07-25 — oplan §5 had been unmet)
ACCEPTED: 1.1 c40eb7f · 1.2 a65067a · 1.3 47c6a56 · 1.4 679dcc9 · 1.5 runtime proof (no commit)
  · 2.1 d4409a6 (gate now 52 pairs, 154 tests) · 2.2 0560910 · 2.3 1c58dfb · 2.4 c328d82 · 2.5 984b6f7 · 2.6 fce1e8f
FROZEN CONTRACTS IN FORCE:
  B2-1 Band 2 vocabulary comes from the official MoE PDF via the committed deterministic script
  scripts/build_band2.py — never LLM-invented, never hand-edited ·
  B2-2 the extractor carries column geometry AND the section label forward; "BAND II CORE I" is a
  substring of "BAND II CORE II" so CORE II must be tested first ·
  B2-3 band2 is an OPTIONAL trailing parameter — buildAllowedSet(profile, band1) and
  generateChapter({profile, band1, chat}) must keep working unchanged ·
  B2-4 preA1 = preBandI only · A1 = all Band 1 · A2 = Band 1 + Band 2 (measured 296/1257/2850) ·
  VP-1 every colour painted in the body background must be a :root token and must carry its own six
  pairs in scripts/check-contrast.mjs — a raw hex there is invisible to the gate ·
  VP-2 the four new tokens: --color-bg-top #361d08 · --color-bg-glow-violet #321f1a ·
  --color-bg-glow-teal #282416 · --color-bg-glow-amber #331f0c (14 existing values untouched) ·
  VP-3 measured border floors 3.10 / 3.08 / 3.06 / 3.09, all >= 3:1; reproduced by the orchestrator ·
  VP-4 the sw CACHE version string is the SINGLE sanctioned exception to GC-D2 "sw.js is
  untouchable"; PRECACHE stays byte-identical ·
  VP-5 exactly ONE cache bump this phase: magic-vet-v6 -> v7 (step 2.3), covering every public/
  change including step 2.7's ·
  VP-6 the app icon is CONDITIONAL: steps 2.6/2.7 run only on a recorded ICON-ART: APPROVED ·
  inherited and binding: the learner's stored profile is never read or written (GET /api/profile
  CREATES one when absent — a read that writes) · docs/visual-design.md is the frozen visual
  contract · the WCAG AA gate (scripts/check-contrast.mjs) must keep exiting 0 · any change under
  public/ ships with the sw CACHE bump in the SAME phase · images are generated via the FREE
  ChatGPT web route, never the paid API · public/icons/icon.svg CANNOT be replaced — it is frozen
  by tests/shell.test.js:30 and by the PRECACHE deepStrictEqual; the artwork is APPENDED as PNGs.
OPEN QUESTIONS: none blocking. Both planner blockers answered in plan.md ("Blockers — both
  ANSWERED"): (1) amending docs/visual-design.md is approved because it records owner-commissioned
  work and corrects statements already false; (2) the icon's GC-D8 owner gate is honoured by making
  steps 2.6/2.7 conditional.
OWNER-FACING NOTES (for Phase 3 STATUS, not blockers):
  · The shipped background contained a WCAG 1.4.11 failure BEFORE this run: --color-border on the
    painted top wash #3d2109 measured 2.92:1 against a binding 3:1. Step 2.1 fixes it.
  · Nothing in the record says whether the PWA is currently installed on the learner's device, so
    it is unknown whether a new icon appears without removing and re-adding the app.
DEFERRED (needs owner approval when reached): harder placement items — every current question is
  elementary, so a strong reader just lands on A2. Requires new audio/artwork AND changes the
  frozen task2 counts in tests/placement-items.test.js.
NOT DEPLOYED: phases 1-2 are committed but not live; deployment is phase 3.
BLOCKED: no — GC-D8 gate ANSWERED "ICON-ART: APPROVED" 2026-07-25. Steps 2.6/2.7 (derive
  the PNGs, wire the manifest) are the only work left in phase 2 and both are conditional on
  ICON-ART: APPROVED. On rejection the phase closes green with the paw print, per VP-6.
