CURRENT: **RUN COMPLETE (2026-07-28). PHASE 3 CLOSED — PHASE-3-ALL-CRITERIA-OK (1-11; 12-14
  N/A: N=0, no items, no public/ change, NO DEPLOY).** All three slices delivered. The weekly
  top-up rule is executable and tested (scripts/quiz-topup.mjs, ledger 303); proven against
  her real captured profile: TOPUP known=12 candidate=0 pool=12 dropped=0 covered=12
  missing=0 banned=0. Production unchanged at magic-vet-v17
  (dpl_88eKj1qha7SWcsuHwsNCmh7NHfvw).

PLAN: .oplan/word-g1/plan.md (phases 1-3 in full; "PHASE 3 IN FULL" at end, executed on its
  N=0 branch) · JOURNAL: journal.md (complete incl. PHASE 3 CLOSED) · BRIEFING: briefing.md ·
STATUS: STATUS.md · DESIGN: design.md (SIGNED) · FIELD GUIDE: field-guide/index.md (12
  lessons, 52/40 justified in the journal — lesson 4 grew the autocrlf trap)

BASE (phase 3): 5a90a7f · ACCEPTED: 3.1 — 07ea2b4 (audit mismatch #1: unrequested extras
  incl. fail-open bank fallback, reworked, re-audit match/high) · 3.2 — 231572f (retry 1:
  CRLF trap caught by byte check, redone byte-preserving) · 3.3 — capture OK (receipt in
  backup-receipt.txt) · 3.4 — N=0 (7736c96) · 3.5-3.12 SKIPPED per the frozen N=0 gate ·
  close: (this commit)

ROLLBACK LADDER (code only, newest first — urls exactly as `vercel inspect` reported them;
  UNCHANGED this phase, nothing was deployed):
  live v17 = dpl_88eKj1qha7SWcsuHwsNCmh7NHfvw (english-qh5ne6g96)
  v16 = dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc:
  `"$(npm prefix -g)/vercel" rollback https://english-g80h5gnd9-dkreinovs-projects.vercel.app --yes`
  v15 = dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn:
  `"$(npm prefix -g)/vercel" rollback https://english-2wkxdnp9g-dkreinovs-projects.vercel.app --yes`

STATE OF THE TREE: HEAD clean at the close commit · ledger 303/0 (also APP_CODE=dummy) ·
  contrast 52 · shell magic-vet-v17 (live AND worktree — no bump, public/ never moved) ·
  .data/profile.json absent · her profile captured at
  C:/Users/dkreinov/english-app-backups/profile-20260728-195804.json (sha256 in
  backup-receipt.txt) — currently the ONLY copy of her profile; D27 rider OPEN, default KEEP,
  run recommends KEEP.

FROZEN CONTRACTS IN FORCE (for any future run): signed design §10 · both transcripts (QZ-21 +
  g1) must diff EMPTY forever; expected files committed ONCE, never edited · QZ-22: next
  CACHE bump = v18 whenever public/ next moves · ledger flat test() 303 · contrast anchor 52 ·
  APP_CODE never in an orchestrator shell; the frozen subshell (.oplan/word-quiz/
  plan.md:1573-1586) is the only sanctioned live read · GET /api/profile creates one — never
  probe · B7 DELIVERED as: top-ups derive from known ∪ candidate via scripts/quiz-topup.mjs
  (on-manifest only, QZ-8 honored, every drop reported); off-list words remain EXPLICITLY
  DEFERRED, unowned, unscheduled · QZ-1/QZ-2/QZ-24 + D28 hint-form owner gate bind any future
  item generation.

OPEN QUESTIONS (owner, none blocking): D27 rider for profile-20260728-195804.json
  (delete/keep — default KEEP; run recommends KEEP) · off-list step: when + who ·
  weekly top-up: whose habit.
BLOCKED: no — the run is complete.
