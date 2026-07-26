CURRENT: phase 1 "the gated parent door", next step 1.1
PLAN: .oplan/parent-access/plan.md
BASELINE: 8644ac1 (172 tests, 0 fail; contrast gate 52 pairs ALL PASS; tree clean)
LIVE RIGHT NOW: magic-vet-v8, deployment dpl_6tEUHF6T7f5pxVFwfgFxepFdtR1V at commit 9b00d09,
  aliased to https://english-app-three-tan.vercel.app. This phase bumps to v9 and Phase 2 deploys.
PREDECESSOR: .oplan/poc-basics/ — CLOSED. Its journal holds the deploy recipe, the rollback
  procedure, the item-bank gate (SIGNED OFF 26.07.2026) and the growth design.

OWNER DECISIONS THIS RUN (asked and answered before planning — do not re-ask):
  · OD-1 the parent screen is opened by a HIDDEN GESTURE: ~1.5s long-press on the home title.
    Chosen over a visible link and over a nav tab.
  · OD-2 the password IS the existing entry code (localStorage["appCode"]). No second secret.
    The owner explicitly accepts that the daughter knows it.
  · OD-3 it asks EVERY time the parent screen is opened. No session memory.

FROZEN CONTRACTS IN FORCE:
  PA-1 the lock gates the VIEW (top of parent.js render()), not the door — a typed URL is gated too,
  and no API call happens before it resolves · PA-2 compares the trimmed input to
  localStorage["appCode"] with ===, FAILS CLOSED when unset/unavailable, unlimited retries ·
  PA-3 asked on every render(); no unlocked flag survives navigation · PA-4 the gesture is
  pointerdown + 1500ms, cancelled by pointerup/cancel/leave or >10px move, contextmenu suppressed,
  and is INVISIBLE — no <a>, label, tab, title attr or cursor change · PA-5 ZERO new CSS:
  public/styles.css is NOT touched and the lock reuses entry-gate-* + btn classes; contrast gate
  stays at exactly 52 pairs · PA-6 the frozen Hebrew for the lock (see plan.md) · PA-7 exactly ONE
  cache bump magic-vet-v8 -> v9, PRECACHE byte-identical and /views/parent.js is NOT added to it ·
  PA-8 the test ledger 172 -> 176 -> 179 -> 179 -> 179.
  INHERITED AND BINDING: design.md and docs/visual-design.md are FROZEN (§8 keeps PRECACHE
  untouchable) · the WCAG AA contrast gate must keep exiting 0 · any change under public/ ships with
  the sw CACHE bump in the SAME phase · the learner's profile is never contacted (GET /api/profile
  CREATES one — a read that writes) · never open a browser on production · never run `vercel env` ·
  public/icons/icon.svg cannot be replaced · docs/item-bank-review.md is SIGNED OFF — leave it alone.

HOW D2 IS AFFECTED: relaxed deliberately by the owner. brief.md D2 froze #/parent as URL-only, but
  its stated REASON was not putting the band in front of the child, not secrecy. OD-1 keeps that
  reason intact (the door is invisible) and OD-2 sets the secrecy bar at "not the child". Only D2's
  URL-only MECHANISM is superseded. Recorded in plan.md, not buried.

ACCEPTED: (none yet)
OPEN QUESTIONS: none. The three that existed (entry point, which password, how often to ask) were
  put to the owner and answered as OD-1/OD-2/OD-3 above.
BLOCKED: no

DEPLOYMENT LEDGER (this run). Re-established by `vercel inspect`, NOT inherited:
  ROLLBACK TARGET (recorded BEFORE the deploy call — field-guide lesson 13 / DP-4)
    outgoing id = dpl_6tEUHF6T7f5pxVFwfgFxepFdtR1V
    outgoing url = https://english-18gugvohx-dkreinovs-projects.vercel.app
    outgoing serves = magic-vet-v8
    outgoing created = Sun Jul 26 2026 09:46:36 GMT+0300 (55m before this deploy)
    incoming commit = c7feba2d41c9d40c909efff44b2aa91af477866e
    rollback command = "$(npm prefix -g)/vercel" rollback https://english-18gugvohx-dkreinovs-projects.vercel.app --yes
  Live /sw.js answered magic-vet-v8 before the deploy, so the premise check (production is not
  already serving v9) passed.
  DEPLOYED (parent-access, phase 2)
    incoming id = dpl_8UrYSgy7HBssw8AmxNh35Qg8fNUM
    incoming url = https://english-2suyim007-dkreinovs-projects.vercel.app
    incoming alias = https://english-app-three-tan.vercel.app
    incoming commit = c7feba2d41c9d40c909efff44b2aa91af477866e
    serves = magic-vet-v9
RUN COMPLETE: phase 1 CLOSED (4/4 steps, 9/9 criteria), phase 2 CLOSED (deployed and verified).
