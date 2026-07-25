CURRENT: phase 3 "deploy and verify". Step 3.1 ACCEPTED. Next: step 3.2 (pre-deploy gate,
  orchestrator-run), then 3.3 THE DEPLOY.
BASELINES: phase 1 = bbdb60c · phase 2 = 679dcc9 · phase 3 = bc2f5eb (157 tests, gate 52 pairs)
PLAN: .oplan/band2-and-polish/plan.md
DESIGN: .oplan/band2-and-polish/design.md (copied in 2026-07-25 — oplan §5 had been unmet)
ACCEPTED: 1.1 c40eb7f · 1.2 a65067a · 1.3 47c6a56 · 1.4 679dcc9 · 1.5 runtime proof (no commit)
  · 2.1 d4409a6 (gate now 52 pairs, 154 tests) · 2.2 0560910 · 2.3 1c58dfb · 2.4 c328d82 · 2.5 984b6f7 · 2.6 fce1e8f · 2.7 e51394e
  · 3.1 537bbf1 (owner-facing docs corrected; audit match/high)
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
  VP-5 exactly ONE cache bump in phase 2: magic-vet-v6 -> v7 (step 2.3), covering every public/
  change including step 2.7's ·
  VP-6 the app icon was CONDITIONAL: steps 2.6/2.7 ran on the recorded ICON-ART: APPROVED ·
  DP-1 the canonical production URL is https://english-app-three-tan.vercel.app — deployment-
  specific *-dkreinovs-projects.vercel.app URLs sit behind a Vercel login and are never the
  verification target ·
  DP-2 live bytes are compared to the WORKTREE file, NEVER to a `git show` blob — vercel uploads
  the working tree and public/index.html is CRLF on disk, LF in git (3064 vs 2983 bytes) ·
  DP-3 the page shell is fetched as `/`, never `/index.html` — vercel.json sets cleanUrls, so
  /index.html answers 308 ·
  DP-4 the rollback target is recorded BEFORE the deploy call, and the recorded value wins over
  any value predicted at plan time ·
  DP-5 /api/profile is NEVER requested in phase 3, by any step, with or without a header, GET or
  POST. Mechanically checked at the phase gate ·
  APP-CODE (record-gap repair, 2026-07-25): the live API is gated by a shared entry code read from
  the APP_CODE env var, set in Vercel Production by commit ef140ce — which was made OUTSIDE any
  oplan run and is what production serves today. Every /api/* except /api/health answers 401
  without the header. NO `vercel env` command may be run; no env value is read or echoed. This gate
  is absent from design.md §2/§9, which is FROZEN — amending it needs an owner gate in a FUTURE run ·
  inherited and binding: the learner's stored profile is never read or written (GET /api/profile
  CREATES one when absent — a read that writes) · docs/visual-design.md is the frozen visual
  contract · the WCAG AA gate (scripts/check-contrast.mjs) must keep exiting 0 · any change under
  public/ ships with the sw CACHE bump in the SAME phase · images are generated via the FREE
  ChatGPT web route, never the paid API · public/icons/icon.svg CANNOT be replaced — it is frozen
  by tests/shell.test.js:30 and by the PRECACHE deepStrictEqual; the artwork is APPENDED as PNGs.
DEPLOYMENT LEDGER (record-gap repair 3 — no prior run recorded which commit a deployment carries):
  outgoing (pre-phase-3) = dpl_J7zsYaqEQ4AwY4HU7qbnLqW7QCQd ·
    https://english-puiu1tyb9-dkreinovs-projects.vercel.app · commit ef140ce (INFERRED by timestamp
    correlation, not recorded anywhere — re-verify at step 3.3 before trusting it) · serves
    magic-vet-v6 · this is the ROLLBACK TARGET.
  incoming = <filled by step 3.3, with its commit sha>
OPEN QUESTIONS: none blocking. Phase 3's planner returned BLOCKERS: none; all 8 of its record gaps
  are repaired or explicitly deferred in plan.md's phase-3 repair table.
OWNER-FACING NOTES (for the phase 3 STATUS rewrite, not blockers):
  · The shipped background contained a WCAG 1.4.11 failure BEFORE this run: --color-border on the
    painted top wash #3d2109 measured 2.92:1 against a binding 3:1. Step 2.1 fixed it (3.10:1).
  · Nothing in the record says whether the PWA is currently installed on the learner's device, so
    it is unknown whether the new icon appears without removing and re-adding the app. Step 3.1
    writes this caveat into docs/owner-handoff.md so the owner is told, not surprised.
  · HER CURRENT BAND IS UNKNOWN AND UNKNOWABLE under the profile prohibition. If she is at A1,
    Band 2 changes nothing for her until she re-places. No file records her placement outcome.
  · A2 chapters now carry a much larger prompt: the allowed list is pasted whole into the user
    message, 9,101 chars at A1 -> 23,664 at A2 (~+3.6k input tokens per attempt, up to 3 attempts).
    Under a cent per chapter on gpt-4.1-mini, invisible against the $5-10/month ceiling, but it is
    a real and previously unrecorded cost change.
DEFERRED (needs owner approval when reached): harder placement items · the test count duplicated
  across README.md and docs/owner-handoff.md with no cross-reference · the tracked
  bash.exe.stackdump at the repo root · amending FROZEN design.md §2/§9 to record the APP_CODE gate.
  All four are written up in plan.md's "Deferred" section.
NOT DEPLOYED YET: phases 1-2 are committed but not live. Production still serves magic-vet-v6 and
  the single-SVG manifest. Step 3.3 is the deploy.
BLOCKED: no.
