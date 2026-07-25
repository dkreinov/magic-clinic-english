CURRENT: phase 1 "Band 2 vocabulary and a meaningful A2", next step 1.1
BASELINE (phase 1): bbdb60c
PLAN: .oplan/band2-and-polish/plan.md
ACCEPTED: (none yet)
FROZEN CONTRACTS IN FORCE:
  B2-1 Band 2 vocabulary comes from the official MoE PDF, extracted by a committed deterministic
  script — never LLM-invented · B2-2 the extractor must carry column geometry forward (the band 1
  algorithm yields 71 entries instead of ~2000) · B2-3 band2 is an OPTIONAL trailing parameter so
  every existing call and test keeps working · B2-4 preA1 = preBandI only, A1 = all Band 1,
  A2 = Band 1 + Band 2 ·
  inherited and binding: the learner's stored profile is never read or written; docs/visual-design.md
  is the frozen visual contract; the WCAG AA gate must keep exiting 0; any change under public/
  ships with the sw CACHE bump in the SAME phase.
OPEN QUESTIONS: none for phase 1.
DEFERRED (surfaced, needs owner approval when reached): harder placement items would change the
  frozen task2 counts in tests/placement-items.test.js and need new audio/artwork. After this run
  a strong reader still lands on A2 — but A2 will finally mean something.
BLOCKED: no
