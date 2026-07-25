CURRENT: phase 2 "deploy so she can start" CLOSED — 9/9 steps accepted. THE APP IS LIVE at
  https://english-app-three-tan.vercel.app serving magic-vet-v8, verified byte-for-byte.
  Next: PHASE 3 (the growth design document — zero code). Phase 1 CLOSED before it, 6/6 steps.
  TWO OWNER ACTIONS ARE OUTSTANDING and are NOT the run's to do: (1) open
  docs/item-bank-review.html and sign the gate in docs/item-bank-review.md §6, (2) THEN give the
  child the entry code. The app is behind APP_CODE, so until (2) the deploy has changed nothing
  for her. docs/item-bank-review.md still says STATUS: REQUIRED-BEFORE-CHILD-USE, correctly.
GO-AHEAD GIVEN: 2026-07-25, by the owner, in the resume prompt that opened this session ("Resume at:
  Phase 2 — deploy", execution mode autonomous). This is the authorisation STATUS.md's "What I need
  from you" item 1 was waiting for, and it is the ONLY authorisation to publish to the internet in
  this run. Recorded here because it arrived in chat and would otherwise die with the session.
  Its scope is the deploy as the Phase 2 skeleton describes it — not the two owner actions that
  follow it (sign the item-bank gate, then hand over the entry code), which remain the owner's.
CONTINUOUS MODE: opted in by the owner, 2026-07-25, mid-run and explicitly ("I'm going to sleep now,
  you can use oplan to create next phases if needed but I want a working app in the morning").
  oplan §11 makes multi-phase continuous mode a human-only opt-in; this is it. So Phase 2 does NOT
  pause at its boundary — plan Phase 3 with a fresh planner, review it, and keep going. What this
  costs is MY context hygiene, not planning freshness. The deliverable the owner named is a WORKING
  APP, which is Phase 2's deploy; Phase 3 is a zero-code document and must never be allowed to delay
  or destabilise the deploy. The two owner actions are still hers and are NOT delegated by this.
BASELINE: 89e6600 (157 tests, 0 fail; contrast gate 52 pairs ALL PASS; tree clean)
NOW: 172 tests, 0 fail; contrast gate 52 pairs ALL PASS; tree clean; LIVE at magic-vet-v8.
  public/ IS SEALED for this run: all six public/ files changed and the single sanctioned cache bump
  (magic-vet-v8) landed on top of them. No step may bump to v9. Phase 3 is a DOCUMENT and must not
  touch public/ at all — anything under public/ would require a v9 bump and a re-deploy, which the
  owner has not authorised and which Phase 3's own non-goals forbid.
DISPATCH RULE (learned in step 1.2, binding for the rest of the run): a worker's spec file is built
  as `plan.md lines 175-277 (the frozen contracts) + the step`. Slicing the step alone leaves it
  NAMING contracts it does not QUOTE, and the worker goes and reads plan.md instead of stopping.
PLAN: .oplan/poc-basics/plan.md
BRIEF: .oplan/poc-basics/brief.md — the owner's 3 scoping answers + design decisions D1-D6.
  READ THIS BEFORE THE PLAN. D1-D6 are frozen and must not be re-opened.
DESIGN: .oplan/poc-basics/design.md (FROZEN product design)
PREDECESSOR: .oplan/band2-and-polish/ — closed and deployed 2026-07-25. Its journal holds the
  deploy recipe, the rollback procedure and the reasoning behind the current live build.
ACCEPTED: step 1.1 — a098d3d (validation first try, auditor match/high, 0 interventions)
  step 1.2 — 639479f (validation first try; auditor mismatch then match/high after I supplied
  PB-2, which my first auditor packet had omitted; 1 intervention, mine)
  step 1.3 — 5f89bf3 (validation first try, auditor match/high, 0 interventions)
  step 1.4 — 52dc502 (validation first try, auditor match/high, 0 interventions)
  step 1.5 — b7e9077 (1 retry; auditor mismatch -> 3 real contract deviations fixed by a
  corrective packet -> match/high; HTML md5 unchanged across the fix)
  step 1.6 — 7e03fef (validation first try; auditor match/high, and it read the Hebrew as Hebrew
  and passed the grammar + feminine-voice check the plan named as this step's residual risk)
  PHASE 2: step 2.1 — 036e322 (orchestrator-run splice, auditor match/high, derivation re-verified
  by the auditor against the tool's own bytes) · steps 2.2, 2.3, 2.4 — all first try, zero files ·
  step 2.5 THE DEPLOY — dpl_C6BiC8gVhuWEtQFPoW4XTsz94Edi at commit 9b00d09 · steps 2.6, 2.7 first
  try · step 2.8 — the ONE real event: the frozen gate FAILED and the GATE was wrong, not the
  deploy (cleanUrls 308s every *.html; proven with a known-absent control). Amended STRONGER —
  follows redirects to the terminus and greps bodies for the answers. Full account in journal.md.
FROZEN CONTRACTS IN FORCE:
  PB-1 the owner route is exactly `#/parent`; view is public/views/parent.js, loaded by a DYNAMIC
  import inside renderRoute() — NOT a static import, because sw.js PRECACHE is frozen and a static
  import of a non-precached module breaks the app offline. In no nav tab and no <a> in index.html ·
  PB-2 the parent view's frozen Hebrew copy (see plan.md) · PB-2a a test re-derives 296/1257/2850
  from buildAllowedSet so the numbers on the owner's screen cannot silently go stale ·
  PB-3 re-take is a client-side sessionStorage["retakePlacement"] flag, consumed once per render();
  NO API action is added and api/placement.js is NOT touched; the control lives on #/parent and
  nowhere else ·
  PB-4 the entry-code screen lives in public/api.js (a new module would have to join the frozen
  PRECACHE), is a SINGLETON promise so two parallel 401s open ONE screen, and has unlimited retry ·
  PB-5 exactly ONE cache bump this phase: magic-vet-v7 -> v8; PRECACHE stays byte-identical ·
  PB-6 the item-review tool is generated into docs/, never under public/ — it contains the correct
  answers, and dev-server + Vercel both serve only public/, so this holds by construction ·
  PB-7 the test ledger: 157 -> 159 -> 165 -> 168 -> 168 -> 172 -> 172; every step asserts its own
  running total, so an added or dropped test fails the gate that introduced it ·
  PB-8 no new :root token, no raw hex, no color-mix() — the contrast gate stays at 52 pairs ·
  inherited and binding: the learner's stored profile is never read or written outside the app's
  own normal operation on a LOCAL server with a scratch DATA_DIR (GET /api/profile CREATES one when
  absent — a read that writes) · design.md and docs/visual-design.md are FROZEN · the WCAG AA gate
  must keep exiting 0 · any change under public/ ships with the sw CACHE bump in the SAME phase ·
  images come from the FREE ChatGPT web route · public/icons/icon.svg cannot be replaced.
OWNER DECISIONS ALREADY RECORDED (do not re-ask):
  · basics = placement trap + entry-code UX + re-take. NOT "just make it deployable".
  · the item-bank gate gets a review TOOL built (chosen over reviewing the markdown by hand).
  · growth is DESIGNED this run (Phase 3, a document) and BUILT next run.
  · the PWA is NOT installed on her phone (answered 2026-07-25) — no icon-refresh caveat applies.
DEPLOYMENT LEDGER (this run). Re-established by `vercel inspect` on the canonical URL, NOT inherited:
  ROLLBACK TARGET (recorded BEFORE the deploy call — field-guide lesson 13 / DP-4)
    outgoing id = dpl_GqmhGP47ksHp7CbYEFRGVm3bA9E2
    outgoing url = https://english-msi6365hc-dkreinovs-projects.vercel.app
    outgoing serves = magic-vet-v7
    outgoing created = Sat Jul 25 2026 19:07:22 GMT+0300 (4h before this deploy)
    incoming commit = 9b00d09b3039a4ac1d23baf135d75b8059191594
    rollback command = "$(npm prefix -g)/vercel" rollback https://english-msi6365hc-dkreinovs-projects.vercel.app --yes
  NOTE: this id equals the PREDECESSOR run's deployment. That is a MEASURED fact, not an inherited
  one — DP-4 says the recorded value wins, and it happened to agree, which means nothing deployed
  between the two runs. The `created` line drops the CLI's localized Hebrew timezone name (display
  noise, and embedding bidi text in the record invites field-guide lesson 11); the instant is exact.
  Live `/sw.js` answered `magic-vet-v7` before the deploy, so the premise check (production is not
  already serving v8) passed.
  DEPLOYED (poc-basics, phase 2)
    incoming id = dpl_C6BiC8gVhuWEtQFPoW4XTsz94Edi
    incoming url = https://english-g3lubgmk0-dkreinovs-projects.vercel.app
    incoming alias = https://english-app-three-tan.vercel.app
    incoming commit = 9b00d09b3039a4ac1d23baf135d75b8059191594
    deployed at = Sat Jul 25 2026 23:25:28 GMT+0300
OPEN QUESTIONS: none blocking. Both planner blockers are ANSWERED in plan.md's amendments section:
  (1) the item-bank review gates the CHILD SEEING the test, not the deploy — so Phase 2 ships and
  the owner signs the gate before handing her the entry code; (2) #/parent IS written into
  docs/owner-handoff.md, because a route nobody can find delivers nothing.
DEFERRED (surfaced, not dropped): a manual owner band-override (D5 — re-taking already recovers) ·
  harder placement items · the test count duplicated across README and owner-handoff ·
  bash.exe.stackdump tracked at the repo root · amending FROZEN design.md §2/§9 to record APP_CODE ·
  README.md:108 says "Live and in daily use by its one intended user", which is not true until the
  owner hands over the entry code (step 1.6's non-goals excluded README prose, so this is deliberate,
  not an oversight) · README.md's repository-layout block does not mention scripts/build-item-review.js
  · docs/item-bank-review.md's 12-row table still describes the options as EMOJI (stale BY DESIGN —
  the HTML tool supersedes it; owner-handoff's two weak-item bullets were fixed in step 2.1).
PHASE 2 IS DONE — its recipe is now HISTORY and lives in journal.md, not here.
PHASE 3 MUST DO FIRST (from plan.md's skeleton, do not re-derive): Phase 3 is ONE DOCUMENT,
  `docs/growth.md`, and ZERO CODE. Its spine is the contradiction the brief exposed:
  `skills.receptiveVocab.band` is written in exactly ONE place (`api/placement.js:54`) and never
  moves again, while design.md §3 claims "continuous calibration is the real engine". So the doc must
  answer: what PROMOTES a band after the placement test (tapped-word volume? micro-check accuracy
  over N chapters? a periodic re-check?), what happens above A2 when the MoE Band II list is
  exhausted, and in which ORDER design.md §6's parked items land (spaced repetition + push, writing,
  record-only speech, trophies, the full parent view). Ship it in the same non-frozen register as
  docs/owner-handoff.md with an explicit owner sign-off line. It CHANGES NO CODE: no public/, no
  api/, no tests, no cache bump, no re-deploy. It is the next run's brief, not this run's build.
  The app is already live and working — Phase 3 must never put that at risk.
BLOCKED: no. The run's remaining work is Phase 3 (a document). The only things outstanding that this
  run cannot do are the OWNER'S two actions, recorded under CURRENT — they are hers by design.
