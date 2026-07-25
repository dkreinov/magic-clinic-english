CURRENT: phase 1 SHIPPED+LIVE · phase 2 (content fix) DONE in repo · phase 3 (images) BLOCKED,
  run PAUSED for owner decision on the generation method
BASELINE (phase 1): 04267f5
PLAN: .oplan/placement-fix-and-art/plan.md
ACCEPTED: 1.1 51854ec · 1.2 harness proof · 1.3 306f11f (deployed english-19wjsaomy, LIVE) ·
  2.1 33db1a6 (content fix, in repo, deploys with phase 4)
FROZEN CONTRACTS IN FORCE:
  PFA-1 the current task2 text must be EXPLICIT state, never derived from answeredness ·
  PFA-2 the item-bank schema is test-frozen; image work must be ADDITIVE only (emoji field and
  options arrays keep their exact values) · PFA-3 the WCAG AA gate must keep exiting 0 ·
  inherited and still binding: docs/visual-design.md is the frozen visual contract (dark-warm
  palette, WDT-1 tokens); sw.js may change ONLY to bump the CACHE version with its test string.
OPEN QUESTIONS:
  1. RESOLVED: images approved via the ChatGPT dedicated-chat pipeline.
  2. RESOLVED: swap horse distractor for camp — done (2.1).
  3. NEW / BLOCKING: the dedicated ChatGPT chat won't load ("content unavailable" then stalls),
     though ChatGPT itself is up and logged in. How to proceed with the 12 icons? — OWNER
     Options: (a) retry the dedicated chat later / from a fresh session with a stable browser;
     (b) generate in a NEW chat, re-uploading the local anchor image (deviates from "the ONE
     chat" the owner named, so it needs an OK); (c) reconsider the scripted OpenAI-API method,
     which is not browser-dependent. Everything else for phase 3 is frozen and ready.
BLOCKED: YES — phase 3 image generation cannot start until OPEN QUESTION 3 is answered. Phases
  1–2 are complete; the urgent bug is fixed and live. (Prior note retained:) Phase 3 spends the owner's OpenAI credit.
SCOPE CORRECTION since the plan was written: 12 unique concepts need artwork, not 11 — items
  t1-07..t1-12 are `picture-to-word`, where the emoji is the PROMPT and there is no audio, so
  🐒 monkey (prompt-only) joins the 11 option emoji.
