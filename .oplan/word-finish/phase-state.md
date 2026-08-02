CURRENT: phase 2 "audio" PLANNED and RULED. NEXT: execute steps 2.1 -> 2.7.
PLAN (phase 2): .oplan/word-finish/plan-phase2.md (2999 lines, 7 steps, planned by a fresh planner
  2026-08-02 and reviewed by the orchestrator; every gate in it was seen to fail before it was used)
PLAN (phase 1): .oplan/word-finish/plan.md
DESIGN: .oplan/word-finish/design.md · JOURNAL: journal.md · FIELD GUIDE: field-guide/index.md
  (192 lines, 23 lessons. 15 governs review, 16 measurement, 22 pin-vs-property.)
BASE (phase 1): e44cffa   ·   BASE (phase 2): 81fb743
  (phase-state previously said dcf66a3; MEASURED — the diff dcf66a3..81fb743 outside .oplan is
   EMPTY, so both are valid, but 81fb743 is the one every number in plan-phase2.md was taken at.)
ACCEPTED (phase 1): 1.1 544814b · 1.2 376a2d9 (+amendment 1bd2ca5) · 1.3 43a3811 · 1.4 870e9c7 ·
  1.5 visual gate self-served, PASSED · 1.6 close dcf66a3
STATE OF THE TREE: 369 reported / 364 flat / 0 fail · contrast 58 PASS · quiz bank 62 files/84 items
  · manifest 2254 == clips on disk 2254 · public/ 2372 files
  · LIVE magic-vet-v20 at dpl_6pFjJ8LrcyaFodRELCa46BzATUXy (a hypothesis phase 4 confirms)

FROZEN CONTRACTS IN FORCE:
  FC-1  public/quiz.js md5 69b6d71117cf776715374abc6f0abb02 and public/quiz-core.js md5
        9a2131be8b9d1b77c219f1e8c3482a71 (QZ-18 — NEVER touched, not even whitespace).
  FC-2  the audio VOICE, MODEL and INSTRUCTIONS in scripts/build-word-audio.js
        (gpt-4o-mini-tts / nova / the existing instructions string) — 2254 clips came from those.
  FC-3  the .oplan awk filter is  awk '$NF !~ /^\.oplan\//'  — TWO backslash bytes. A collapsed
        copy is a bash syntax error, which makes the whole gate exit 0 and pass everything.
  FC-4  CACHE magic-vet-v20 -> v21 happens EXACTLY ONCE, in phase 4 (F1-1). public/sw.js md5
        78fc3b0ac1d10de8a5baccb753eca33c.
  FC-5  the no-recording marker, FROZEN BY THE OWNER 2026-08-02 (design §8): `btn-say na` — a
        diagonal line drawn in CSS across the EXISTING speaker glyph — plus the English caption
        `coming soon`. Not a swapped emoji, not Hebrew. canSay gates the button's STATE, no longer
        its EXISTENCE. The exact CSS lives in design.md's two ```css blocks and is EXTRACTED BY
        SCRIPT, never retyped; md5 of that extraction is 6e43cb5e463520f5d277d7d02c5ff26c.
  FC-6  *** NEW 2026-08-02, LOAD-BEARING (design §12) *** BASE LEMMAS ONLY in
        data/story-words.json. An inflected surface form in the manifest stops migrateWordKeys
        (lib/profile.js:294, run on EVERY profile POST via api/profile.js:52) folding it into its
        lemma, which SPLITS a word she has already collected into two dictionary entries. This is
        what makes the disk-derived manifest safe; it is not luck.
  FC-7  no new Hebrew string anywhere, ever, without the owner's sign-off. Hebrew is MOVED by
        byte-slicing, never retyped (field guide 8).
  ENDINGS ARE RE-MEASURED PER PHASE, never quoted from an older document (field guide 16), and
  ONLY by counting bytes (tr -dc '\r' vs '\n'). NEVER with grep.

OPEN QUESTIONS: none. R4(ii) was ruled (design §10). B-F2-1 was ruled (design §12).

PHASE 2 RULINGS MADE 2026-08-02, BEFORE EXECUTION:
  · B-F2-1 RULED: THE GENERATION SET IS **TEN**, not 21/17/16 —
      after  deer  feet  glow  growl  harm  moon  nervous  scary  tight
    This REAFFIRMS ruling B2 (.oplan/word-polish/journal.md:41, owner-approved same day as B3).
    design.md §3 A, this file and the phase-2 brief had ALL lost it. Full reasoning and the two
    sweeps that prove it: design.md §12.
  · B-F2-2 DONE: design.md §3 A and §9 corrected in place; §9's "risk A resolved" was PARTLY FALSE
    — the manifest has a THIRD consumer (api/profile.js:6, a direct JSON import) that never calls
    getAllowedSet(). Grep the ARTIFACT, not the accessor.
  · design §3 A's listening gate is marked SUPERSEDED by §11. Two clauses of one document had
    disagreed since 2026-08-02.

CARRIED OBLIGATIONS (a later phase MUST honour these):
  F1-1  phase 4 bumps CACHE magic-vet-v20 -> v21 in public/sw.js:1 AND moves the pin in
        tests/shell.test.js IN THE SAME STEP, with a seam assertion. ENLARGED BY PHASE 2:
        phase 1 left 2 precached files changed and unbumped; phase 2 adds styles.css,
        views/reader.js and views/words.js, so phase 4 owes the bump for FOUR distinct files.
        Safe ONLY because neither phase deploys.
  F1-2  R4(ii) NOT DONE — nothing reads story.checkLog back, so her answers still do not survive a
        page reload. THE OWNER HAS RULED (design §10): wrong-then-right counts as FINISHED; a
        question is done if ANY logged attempt is correct; de-dup by questionId. Still needs a step.
  F1-3  latent: the log-check POST swallows failures and sets st.logged=true BEFORE the await.
  F1-4  the sandbox de-identification is machine-local; re-run the machine-wide identity sweep at
        phase 4 (a file outside the repo can never be gated by a repo check).
  F2-1  *** NEW *** `Ellie` and `Sparkle` — her heroine's and pet's names — will say `coming soon`
        indefinitely. They come from profile.learner and the audio manifest is derived from a
        profile with learner: {}, so no band-derived top-up can ever reach them. Two clips close it.
        Needs her live profile, so phase 4 or later. A real, small dishonesty, accepted knowingly.
  F2-2  *** NEW *** lib/quiz-item.js resolves tokens through resolveLemma against a set its CALLERS
        supply (scripts/build-item-bank.js, scripts/quiz-topup.mjs). After phase 2 the bands and the
        manifest are NO LONGER THE SAME LIST. Phase 3 must state which one it means.

BLOCKED: no.
