CURRENT: phase 1 "fix the basics" PLANNED IN FULL and REVIEWED (fresh planner + plan reviewer;
  reviewer verdict fix-first, all 3 findings fixed). Next step 1.1. NOTHING EXECUTED YET.
BASELINE: 89e6600 (157 tests, 0 fail; contrast gate 52 pairs ALL PASS; tree clean)
PLAN: .oplan/poc-basics/plan.md
BRIEF: .oplan/poc-basics/brief.md — the owner's 3 scoping answers + design decisions D1-D6.
  READ THIS BEFORE THE PLAN. D1-D6 are frozen and must not be re-opened.
DESIGN: .oplan/poc-basics/design.md (FROZEN product design)
PREDECESSOR: .oplan/band2-and-polish/ — closed and deployed 2026-07-25. Its journal holds the
  deploy recipe, the rollback procedure and the reasoning behind the current live build.
ACCEPTED: none yet.
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
DEPLOYMENT LEDGER: EMPTY for this run, deliberately. The previous run's live deployment was
  dpl_GqmhGP47ksHp7CbYEFRGVm3bA9E2 at commit 00a100c, but that is ANOTHER run's ledger. Phase 2
  MUST re-establish the rollback target with `vercel inspect` on the canonical URL BEFORE deploying
  (field-guide lesson 12) rather than inheriting that id.
OPEN QUESTIONS: none blocking. Both planner blockers are ANSWERED in plan.md's amendments section:
  (1) the item-bank review gates the CHILD SEEING the test, not the deploy — so Phase 2 ships and
  the owner signs the gate before handing her the entry code; (2) #/parent IS written into
  docs/owner-handoff.md, because a route nobody can find delivers nothing.
DEFERRED (surfaced, not dropped): a manual owner band-override (D5 — re-taking already recovers) ·
  harder placement items · the test count duplicated across README and owner-handoff ·
  bash.exe.stackdump tracked at the repo root · amending FROZEN design.md §2/§9 to record APP_CODE.
BLOCKED: no.
