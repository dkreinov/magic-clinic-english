CURRENT: phase 1 "G1 candidate engine — status, promoter, badge, deployed", next step 1.7 (ORCHESTRATOR: sandbox visual gate)
PLAN: .oplan/word-g1/plan.md (phase 1 in full, reviewed: ship/0 findings; phases 2-3 skeletons)
JOURNAL: journal.md · BRIEFING: briefing.md · STATUS: STATUS.md · DESIGN: design.md (SIGNED,
  byte-copy of .oplan/word-quiz/night/growth-amended-DRAFT.md) · FIELD GUIDE:
  field-guide/index.md (12 lessons, inherited from word-quiz-reskin, binding)

BASE: cab71306532413363ac5e6998d21beb44043613f (workspace committed; every changed-set check
  in plan.md runs against this, .oplan/** excluded)

ACCEPTED: 1.1 — 29df011 (growth.md signed, 637 lines; intervention #1: source tail 642-643
  replaced by frozen post-copy note — plan.md amended, owner may overrule)

FROZEN CONTRACTS IN FORCE: the signed design §10 · QZ-12/QZ-17/QZ-18 amended ONLY as the design
  specifies (none amended in phase 1) · QZ-22 CACHE bump per precached change (v15 → v16 at 1.6)
  · ledger flat top-level test() only, 282 → 291 · contrast anchor `grep -c '^PASS'` = 52 (no
  gate edit — the badge reuses check-contrast.mjs:27) · APP_CODE never in the orchestrator's
  shell (frozen subshell in plan.md steps 1.8/1.10) · never probe the live profile outside the
  two sanctioned reads · GET /api/profile creates one (a read that writes) · D25 capture before
  the deploy · deploy recipe .oplan/word-audio/phase-state.md:55-66 · rollback (code only):
  `"$(npm prefix -g)/vercel" rollback https://english-d0roovfpq-dkreinovs-projects.vercel.app
  --yes` (target v15 dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn) · public/views/words.js stays CRLF on
  disk · md5 checks against the WORKTREE, never git blobs.

OPEN QUESTIONS: D27 rider — are the phase's profile backups deleted at close? OWNER; asked at
  step 1.8; until answered the backup is KEPT (safe direction).
BLOCKED: no.
