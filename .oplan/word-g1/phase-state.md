CURRENT: **PHASE 1 COMPLETE (2026-07-28), PHASE-1-ALL-CRITERIA-OK (11/11).** The G1 candidate
  engine is LIVE at magic-vet-v16, dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc
  (english-app-three-tan.vercel.app), bytes md5-proven (sw.js, views/words.js), her profile
  read back intact (20 words, zero lost, zero unexplained changes, candidates=0 — G1 first
  runs at her next chapter generation). Next: PHASE 2 (slice b: candidates enter the quiz) —
  plan it first (fresh planner, files only), review, then execute.

PLAN: .oplan/word-g1/plan.md (phase 1 executed as amended; PHASE 2 SKELETON at its end)
JOURNAL: journal.md (complete incl. PHASE 1 CLOSED metrics) · BRIEFING: briefing.md ·
STATUS: STATUS.md · DESIGN: design.md (SIGNED) · FIELD GUIDE: field-guide/index.md
  (14 lessons, 76/40 justified in journal — re-cut at the phase-2 boundary)

BASE (phase 1): cab7130 · ACCEPTED: 1.1 — 29df011 (intervention #1: wrapper-text ruling,
  owner may overrule) · 1.2 — 6f152e3 · 1.3 — 4a1aa7e (audit caught a 1-line contract drift,
  fixed + re-audited match) · 1.4 — 0612df1 · 1.5 — 0c33f0b · 1.6 — 3967651 ·
  1.7 — 9bca240 (visual gate 5/5) · 1.8 — capture OK (receipt in backup-receipt.txt) ·
  1.9 — DEPLOY-V16-OK · 1.10 — READBACK OK (this close commit)

ROLLBACK LADDER (code only, newest first):
  `"$(npm prefix -g)/vercel" rollback https://english-2wkxdnp9g-dkreinovs-projects.vercel.app --yes`
  v15 = dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn (english-2wkxdnp9g — CORRECTED url; the inherited
  d0roovfpq url was v14's) · v16 live = dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc (english-g80h5gnd9)

STATE OF THE TREE: HEAD clean at the close commit · ledger 291/0 (also APP_CODE=dummy) ·
  contrast 52 · shell magic-vet-v16 · .data/profile.json absent · sandbox restored (12/12
  known) + server stopped · D25 backup KEPT at
  C:/Users/dkreinov/english-app-backups/profile-20260728-135019.json (sha256 in
  backup-receipt.txt).

FROZEN CONTRACTS IN FORCE: signed design §10 · QZ-12/QZ-17/QZ-18 still amended ONLY as the
  design specifies — phase 1 amended NONE of them (candidate branch, quota export, miss-line
  are ALL phase 2) · QZ-22 (CACHE bump per precached change; next bump = v17 in phase 2) ·
  ledger flat test() 291 · contrast anchor 52 · APP_CODE never in the orchestrator's shell ·
  never probe the live profile outside sanctioned reads · GET /api/profile creates one ·
  B4/B5-cap/B6(i,ii) are LIVE; B2, B5-clock-reset, B6(iii), B3 quota = phase 2; B7 = phase 3.

OPEN QUESTIONS: D27 rider — delete the phase-1 profile backup now that the close criteria
  passed, or keep it? OWNER; asked in the close report; backup KEPT until answered.
BLOCKED: no — phase 1 complete; phase 2 awaits a fresh session (context hygiene) or owner
  go-ahead to continue in this one.
