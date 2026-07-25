CURRENT: phase 1 CLOSED (6/6 criteria) — PAUSED at the phase boundary, phase 2 not yet planned
BASELINES: phase 1 = bbdb60c · phase 2 = 679dcc9
PLAN: .oplan/band2-and-polish/plan.md
ACCEPTED: 1.1 c40eb7f · 1.2 a65067a · 1.3 47c6a56 · 1.4 679dcc9 · 1.5 runtime proof (no commit)
FROZEN CONTRACTS IN FORCE:
  B2-1 Band 2 vocabulary comes from the official MoE PDF via the committed deterministic script
  scripts/build_band2.py — never LLM-invented, never hand-edited ·
  B2-2 the extractor carries column geometry AND the section label forward; "BAND II CORE I" is a
  substring of "BAND II CORE II" so CORE II must be tested first ·
  B2-3 band2 is an OPTIONAL trailing parameter — buildAllowedSet(profile, band1) and
  generateChapter({profile, band1, chat}) must keep working unchanged ·
  B2-4 preA1 = preBandI only · A1 = all Band 1 · A2 = Band 1 + Band 2 (measured 296/1257/2850) ·
  inherited and binding: the learner's stored profile is never read or written (GET /api/profile
  CREATES one when absent — a read that writes) · docs/visual-design.md is the frozen visual
  contract · the WCAG AA gate (scripts/check-contrast.mjs) must keep exiting 0 · any change under
  public/ ships with the sw CACHE bump (magic-vet-v6 -> v7) in the SAME phase · images are
  generated via the FREE ChatGPT web route, never the paid API.
OPEN QUESTIONS: none blocking phase 2.
DEFERRED (needs owner approval when reached): harder placement items — every current question is
  elementary, so a strong reader just lands on A2. Requires new audio/artwork AND changes the
  frozen task2 counts in tests/placement-items.test.js.
NOT DEPLOYED: phase 1 is committed but not live; deployment is phase 3, after the visual work.
BLOCKED: no
