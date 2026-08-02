CURRENT: phase 1 CLOSED (gate PHASE-1-CLOSE-OK, exit 0). NEXT: phase 2 "audio" — NOT YET PLANNED.
  A fresh planner must plan it before any step runs.
PLAN: .oplan/word-finish/plan.md (phase 1 in full; phases 2-4 skeletons in design.md §4)
DESIGN: .oplan/word-finish/design.md · JOURNAL: journal.md · FIELD GUIDE: field-guide/index.md
  (192 lines, 23 lessons; 16-23 were all learned in this run. 15 governs review, 16 measurement.)
BASE (phase 1): e44cffa   ·   BASE (phase 2): dcf66a3
ACCEPTED (phase 1): 1.1 544814b · 1.2 376a2d9 (+amendment 1bd2ca5) · 1.3 43a3811 · 1.4 870e9c7 ·
  1.5 visual gate self-served, PASSED · 1.6 close dcf66a3
STATE OF THE TREE: 369 reported / 364 flat / 0 fail · contrast 58 PASS · quiz bank 62 files/84 items
  · LIVE magic-vet-v20 at dpl_6pFjJ8LrcyaFodRELCa46BzATUXy
FROZEN CONTRACTS IN FORCE: public/quiz.js md5 69b6d71117cf776715374abc6f0abb02 and
  public/quiz-core.js md5 9a2131be8b9d1b77c219f1e8c3482a71 (QZ-18 — NEVER touched) · the audio
  VOICE and MODEL in scripts/build-word-audio.js (gpt-4o-mini-tts / nova) — 2254 clips came from
  that voice · the quiz item shape enforced by isUsableItem · the .oplan awk filter is
  awk '$NF !~ /^\.oplan\//' · CACHE v20->v21 happens EXACTLY ONCE, in phase 4.
  ENDINGS ARE RE-MEASURED PER PHASE, never quoted from an older document (field guide 16).
  FROZEN BY THE OWNER 2026-08-02 (design §8): the no-recording marker is `btn-say na` — a diagonal
  line drawn in CSS across the existing speaker glyph — plus the English caption `coming soon`.
  Not a swapped emoji, not Hebrew. canSay gates the button's STATE, no longer its EXISTENCE.
OPEN QUESTIONS: R4(ii) needs an owner ruling before step 1b — if she answers a question WRONG and
  then RIGHT, is that question finished? Orchestrator's recommendation: YES (the alternative leaves
  her stuck on a question she cannot clear). NOT yet confirmed by the owner.
D27: answered and now COMPLETE — 15 files deleted in two passes (10 + 5). Two dev fixtures remain
  and are step 1.1's job: english-app-sandbox/profile.json and trophies-val/sandbox/profile.json.
BLOCKED: no.

CARRIED OBLIGATIONS (a later phase MUST honour these — see journal 2026-08-02 phase close):
  F1-1  phase 4 bumps CACHE magic-vet-v20 -> v21 in public/sw.js:1 AND moves the pin in
        tests/shell.test.js IN THE SAME STEP, with a seam assertion. Two precached files are
        already changed and unbumped.
  F1-2  R4(ii) NOT DONE — nothing reads story.checkLog back, so her answers still do not survive a
        page reload. Needs the owner's ruling (first-attempt vs best-attempt) + a de-dup rule.
  F1-3  latent: the log-check POST swallows failures and sets st.logged=true BEFORE the await.
  F1-4  the sandbox de-identification is machine-local; re-run the machine-wide identity sweep at
        phase 4 (a file outside the repo can never be gated by a repo check).

PHASE 2 MUST START FROM (all measured, do not re-derive):
  · design.md §3 A (the manifest bound), §7 AMENDMENT #1 (R7), §8 AMENDMENT #2 (the FROZEN
    `btn-say na` + English `coming soon` marker), §9 (RISK A RESOLVED — both getAllowedSet
    consumers are audio-only, so the disk-derived manifest is safe).
  · scripts/build-word-audio.js:102 deriveWordList() + :95 writeManifest() overwrite the manifest
    from the BANDS. 17 story words are outside the bands; 0 of them have clips today.
  · PAID API, owner-authorised 2026-08-01. Owner MUST hear a sample before the batch is accepted.
  · canSay moves from gating the button's EXISTENCE to gating its STATE.
