CURRENT: phase 3 "weekly top-ups cover candidates (slice c, B7)", next step 3.1. Plan reviewed
  (ship) + amendment #1 (3.7 disposition granularity) applied; blocker 1 ruled (N=0 still
  delivers B7). Execution mode: AUTONOMOUS.

PLAN: .oplan/word-g1/plan.md ("PHASE 3 IN FULL", end of file — supersedes the skeleton)
JOURNAL: journal.md (PHASE 3 PLANNING appended) · BRIEFING: briefing.md · STATUS: STATUS.md ·
DESIGN: design.md (SIGNED) · FIELD GUIDE: field-guide/index.md (12 lessons)

BASE (phase 3): 5a90a7f (the planning commit).
ACCEPTED: 3.1 — 07ea2b4 (quiz-topup.mjs + 5 flat tests, ledger 303; audit mismatch #1 —
  unrequested defensive extras — reworked to the bare contract, re-audit match/high) ·
  3.2 — 231572f (growth.md 4-line dated correction, 641 lines; retry 1: attempt #1 CRLF'd
  the whole file on disk — caught by the orchestrator's byte check, redone byte-preserving)

Phase-2 record: BASE 558a5bc · 2.1 dbe5a4f · 2.2 0621b1e · 2.3 d077dcc · 2.4 b83b538 ·
  2.5 ef7396c · 2.6 175de68 · 2.7 e786273 · 2.8 6094724 · 2.9-2.11 in journal · close 4f12820.

ROLLBACK LADDER (code only, newest first — urls exactly as `vercel inspect` reported them):
  live v17 = dpl_88eKj1qha7SWcsuHwsNCmh7NHfvw (english-qh5ne6g96) — phase-3 outgoing; its
  inspect-reported url is recorded at step 3.11 BEFORE any deploy.
  v16 = dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc:
  `"$(npm prefix -g)/vercel" rollback https://english-g80h5gnd9-dkreinovs-projects.vercel.app --yes`
  v15 = dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn:
  `"$(npm prefix -g)/vercel" rollback https://english-2wkxdnp9g-dkreinovs-projects.vercel.app --yes`

STATE OF THE TREE: clean at the planning commit · ledger 298/0 (also APP_CODE=dummy) ·
  contrast 52 · shell magic-vet-v17 live · .data/profile.json absent · NO captured copy of her
  profile exists — phase 3's step 3.3 (D25) takes one before anything else touches production.

FROZEN CONTRACTS IN FORCE: signed design §10 · QZ-12/QZ-17/QZ-18/QZ-23/QZ-25 as amended and
  frozen at the phase-2 close · both transcripts (QZ-21 + g1) must diff EMPTY forever; expected
  files committed ONCE, never edited · QZ-22 read per signed §10: ANY public/ change ⇒ CACHE
  v18 same phase; no public/ change ⇒ NO deploy · ledger flat test() only, 298 → 303 (five new
  flat tests, all in tests/quiz-topup.test.js) · contrast anchor 52 · APP_CODE never in the
  orchestrator's shell; the frozen subshell (.oplan/word-quiz/plan.md:1573-1586) is the ONLY
  sanctioned live read (steps 3.3 and 3.12) · GET /api/profile creates one — never probe ·
  B7's rider: on-manifest words only, off-list words deferred, every dropped word REPORTED ·
  QZ-1 rules 1-13 + QZ-2 + QZ-24 sentence-only bar for any new item · D28 hint-form owner gate
  before any item deploys · $BK survives until the close criteria re-run; D27 delete only after,
  only on the owner's answer for THIS capture.

OPEN QUESTIONS: none blocking. At the close: D27 rider (phase-3 capture), off-list step
  scheduling, weekly top-up ownership.
BLOCKED: no.
