CURRENT: phase 2 "Word data & profile engine", next step 2.3
PLAN: .oplan/first-build/plan.md
ACCEPTED: 2.1 — fc1f0a6 · 2.2 — 204213b · 1.1 — 7983095 · 1.2 — 2012689 · 1.3 — 12dce41 · 1.4 — 16c1866 · 1.5 — 699ff2c
FROZEN CONTRACTS IN FORCE: GC-1..GC-8 (see plan.md; GC-1 tests = bare `node --test`) ·
Phase 2 adds: band1.json entry schema {lemma,pos,meaning,reg,section,single} · lib/vocab.js
API (tokenize/baseForms/knownLemmaSet/coverage; known-status-only counting) · profile mutators
applyWordTap/markWordKnown (additive; mark-known requires explicit source) · POST /api/profile
actions "word-tap"/"mark-known" (GC-4 envelope, 400 on bad input)
OPEN QUESTIONS: none
BLOCKED: no
