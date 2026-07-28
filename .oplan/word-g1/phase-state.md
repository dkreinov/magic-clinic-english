CURRENT: phase 2 "candidates enter the quiz (slice b)", CODE FROZEN at v17 (2.7 done — last
  code change). Next step: 2.8 (orchestrator sandbox visual gate). BASE (phase 2) = 558a5bc.
  Ledger 298. Interventions: 1 (2.2 bad-spec probe fixture, ruled + amended). QZ-25 in force;
  both transcripts green.
ACCEPTED (phase 2): 2.1 — dbe5a4f (transcript gate, proven RED pre-code) · 2.2 — 0621b1e
  (candidate branch; ledger 293) · 2.3 — d077dcc (quota export; ledger 294) · 2.4 — b83b538
  (soft line; ledger 295; audit mismatch ruled cosmetic — contract-quoted indent) · 2.5 —
  (this commit; ledger 297).

PLAN: .oplan/word-g1/plan.md — phase 1 executed record first, then "# PHASE 2 IN FULL"
  (steps 2.1-2.11, 12 acceptance criteria). JOURNAL: journal.md (through PHASE 2 PLANNING) ·
  BRIEFING: briefing.md · STATUS: STATUS.md · DESIGN: design.md (SIGNED) · FIELD GUIDE:
  field-guide/index.md (14 lessons; re-cut deferred to the phase-2 close)

ACCEPTED (phase 1, base cab7130): 1.1 — 29df011 · 1.2 — 6f152e3 · 1.3 — 4a1aa7e ·
  1.4 — 0612df1 · 1.5 — 0c33f0b · 1.6 — 3967651 · 1.7 — 9bca240 · 1.8 — b84002e ·
  1.9 — 70d0aa7 · 1.10 — d8dd9ec (close). Phase 2: none yet.

ROLLBACK LADDER (code only, newest first): live = magic-vet-v16,
  dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc (english-g80h5gnd9) — its rollback URL is taken from
  `vercel inspect` at step 2.10, NEVER constructed from the name (that bit phase 1 once) ·
  v15 = dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn
  (`"$(npm prefix -g)/vercel" rollback https://english-2wkxdnp9g-dkreinovs-projects.vercel.app --yes`).

STATE OF THE TREE: HEAD clean at the phase-2 plan commit · ledger 291/0 (also APP_CODE=dummy) ·
  contrast 52 · shell magic-vet-v16 live · .data/profile.json absent · NO profile backup exists
  anywhere (phase-1 capture deleted at the owner's instruction; the phase-2 D25 capture at 2.9
  precedes the deploy) · sandbox profile 12/12 known.

FROZEN CONTRACTS IN FORCE: signed design §10 · QZ-12/QZ-17/QZ-18 amended ONLY as the design
  licences: QZ-12 gains the candidate branch BEFORE the strike machinery ('known' rows
  byte-frozen), QZ-17 gains ONE new export (comparator untouched), QZ-18's node ORDER is
  unchanged — QZ-25 branches only the TEXT of the one quiz-demoted node (frozen at step 2.4) ·
  QZ-21 transcript must still diff EMPTY (criterion 5) and the new g1 transcript is hand-derived,
  committed ONCE, never edited (criterion 6) · QZ-22 (CACHE bump = v17 at 2.7, last code change) ·
  ledger flat test() 291 → 298 (exact per-file pins in the plan) · contrast anchor 52, no new
  CSS this phase · the four CRLF files stay CRLF · APP_CODE never in the orchestrator's shell ·
  never probe the live profile outside the sanctioned 2.9/2.11 reads · GET /api/profile creates
  one · B7 (items for candidates) = phase 3, NOT this phase.

OPEN QUESTIONS: none — the phase-2 D27 question (delete/keep the NEW capture) is asked at the
  phase close; default until answered: KEEP.
BLOCKED: no — executing autonomously (owner opt-in in the handoff).
