CURRENT: **THE RUN IS COMPLETE (2026-07-28).** Phase 1 closed, all 9 criteria met (C9 via the
  owner's verbatim words + the audit the owner delegated to the orchestrator). The app is LIVE
  in Sunrise Parchment at dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn (magic-vet-v15,
  english-app-three-tan.vercel.app) with SELF-UPDATE: app.js reloads the page once on SW
  controllerchange; sw.js already had skipWaiting+clients.claim. Live bytes md5-proven against
  the worktree (/, /styles.css, /sw.js, /app.js), health exact, /api/chapter 401.

ROLLBACK LADDER (code only, newest first), command:
  `"$(npm prefix -g)/vercel" rollback https://english-d0roovfpq-dkreinovs-projects.vercel.app --yes`
  v14 = dpl_FMjbqEfc6HismJpjezr6ynKgWKNf (Sunrise Parchment, no auto-reload)
  v13 = dpl_Geaj9sXRPP8KSt9uZTBMQnSDFCSr (the old dark theme)

ACCEPTED: 1.1 — 1a916f3 (withOpenGate ×7 files; packet was stale, api-translate added by
  intervention) · 1.2 — 9f03b97 (chapterStage rename) · 1.3 — c15b6cf (:root swap + 4 pins) ·
  1.4 — 76c2bc2 (light PWA chrome + manifest) · 1.5 — 674c7ad (CACHE v14) · 1.6 — deploy v14,
  DEPLOY-OK · 1.7 — owner: "I've opened and refreshed the app and it is now ligt." + delegated
  visual audit (4 KEEP, 1 FIX) · 1.8 — 265dc86 (auto-reload + warm nav shadow + CACHE v15),
  deployed, DEPLOY-V15-OK, sandbox-proven no reload loop.

PLAN: plan.md (incl. the step-1.8 addendum) · JOURNAL: journal.md (complete, incl. the phase
  metrics block) · BRIEFING: briefing.md · FIELD GUIDE: field-guide/index.md (59/40, justified
  in the journal; lesson 11 = packet FILE-COVERAGE staleness).
PREDECESSOR RECORD: .oplan/word-quiz/ · deploy recipe: .oplan/word-audio/phase-state.md:55-66.

STATE OF THE TREE: HEAD 9cd18b2 clean · ledger 282/0 (also under APP_CODE=dummy — the harness
  gap is CLOSED, all 8 handler-test files gated) · contrast 52 · shell magic-vet-v15 ·
  `.data/profile.json` absent · sandbox server STOPPED (restart:
  `DATA_DIR='C:\Users\dkreinov\english-app-sandbox' npm run dev`).

FROZEN CONTRACTS IN FORCE: QZ-1..QZ-24 as amended (word-quiz plan.md) · QZ-22 PRECACHE exact +
  CACHE bump same phase (honored twice: v14, v15) · background.test.js pins the 4 SUNRISE hexes
  now (#ffe9c9/#f3e4fb/#dff4ee/#ffe4b5) · shell.test.js pins v15 + manifest #fff4e2/#fff8ec ·
  contrast anchor `grep -c '^PASS'` = 52 · APP_CODE never in the orchestrator's shell ·
  never probe the live profile · never `GET /api/profile` (a read that writes).

THINGS MOST LIKELY TO BITE NEXT RUN:
  · The learner's phone still holds the pre-v15 shell: her FIRST open may show the old skin
    once (no listener in the cached page); every open after that self-updates. Do not misread
    that first open as a failed deploy.
  · validate/step-1.6.sh pins v14 — stale for any future deploy; write a fresh check per
    deploy (the v15 one is inline in journal.md).
  · Two cosmetic KEEPs are recorded owner-accepted-by-delegation, not owner-seen: icon dark
    plate, artwork fade. If she dislikes either, the fixes are scoped in the word-quiz night
    notes (mask 74%→88%; icon = asset regen, bigger).

OPEN QUESTIONS: none. BLOCKED: no — complete.
