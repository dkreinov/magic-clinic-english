CURRENT: **THE RUN IS COMPLETE (2026-07-28). ALL PHASES CLOSED.** Phase 1 (item format + pilot,
  re-closed after audit, owner approved) · phase 2 cancelled as a phase (D23 — weekly top-up
  operation) · phase 3 (strikes/demotion, owner approved the QZ-16 transcript) · phase 4 (the
  quiz surface, owner approved the QZ-21 screens) · phase 5 DEFERRED by D26 (G1 awaits the
  amended growth doc's signature; the conditional plan + 7 blockers live in the journal) ·
  phase 6 (backup → first top-up → the D28 hint pivot mid-phase → deploy → her data proven
  intact → gate B passed: "I see it now, work well") — PHASE-6-ALL-CRITERIA-OK.
  **THE QUIZ IS LIVE** at deployment dpl_Geaj9sXRPP8KSt9uZTBMQnSDFCSr (magic-vet-v13).
  Rollback (code only): `"$(npm prefix -g)/vercel" rollback
  https://english-d0roovfpq-dkreinovs-projects.vercel.app --yes`.
  **D27 EXECUTED: both profile backups DELETED at the close** (owner's rider). No captured copy
  of her profile exists; the live copy was read back intact (20 words, zero loss) first.

NEXT WORK, staged and owner-decided, none dispatched:
  · **D29: Sunrise Parchment re-skin** (owner chose 2026-07-28) — scope in
    night/visual-design-NOTES.md: :root token swaps, 4 pinned hexes in tests/background.test.js,
    contrast 52/52 re-proof, CACHE v13→v14, deploy, owner look.
  · **4 chore packets** in night/post-close-chores.md (APP_CODE harness fix — 48/282 failures
    measured under an exported code; reader.js stage-shadow rename; pointer fixes now partly
    done; dispositions for the rest).
  · Awaiting owner decisions, drafts ready in night/: the signable growth rewrite (G1),
    second-profile design, parent-view design.
  · The weekly top-up operation (plan.md PHASE 2): words she claims → items → gate → owner →
    deploy. First one due when new claims appear.

PLAN: .oplan/word-quiz/plan.md · DESIGN: design.md (D1-D29) · JOURNAL: journal.md (complete
  history incl. the night shift) · BRIEFING: briefing.md (the story, plain words) ·
  FIELD GUIDE: field-guide/index.md (54/40, justified; recipe pointer fixed) ·
  PREDECESSOR: .oplan/word-audio/ — deploy recipe + rollback at its phase-state.md:55-66.

STATE OF THE TREE: ledger 282/0 · bank 62 files / 84 items (covers every word she has claimed,
  37 exclusions honored) · contrast 52 · shell v13 with both quiz modules precached ·
  `.data/profile.json` absent · owner sandbox at C:/Users/dkreinov/english-app-sandbox (seeded
  profile + 1 chapter; server currently stopped — restart:
  `DATA_DIR='C:\Users\dkreinov\english-app-sandbox' npm run dev`).

FROZEN CONTRACTS IN FORCE: QZ-1..QZ-22 as amended (A1-A9, QZ-23 hint card, QZ-24 sentence-only
  bar) — see plan.md, amendments beside what they amend. Key operational ones for future work:
  QZ-8 (37 excluded words, never quizzed) · the top-up operation's contracts (QZ-1/2 + pin test
  + QZ-24) · QZ-22 (PRECACHE exact; any precached change needs a CACHE bump same phase).

THE THINGS MOST LIKELY TO BITE (for the next run):
  · Her profile is LIVE in Vercel Blob behind APP_CODE — never probe outside a sanctioned,
    subshell-isolated read; APP_CODE must never enter the orchestrator's shell.
  · isAuthorized is TRUE only when APP_CODE is UNSET — 6 test files still lack withOpenGate
    (packet 1 fixes it).
  · Contrast anchor `grep -c '^PASS'` = 52 · ledger counts FLAT top-level test() only ·
    `LC_ALL=C sort` in frozen comparisons · hash FILES, never `$(curl ...)` output ·
    tests/background.test.js pins 4 background hexes (the D29 re-skin must move them in lockstep).

OPEN QUESTIONS: none for this run. BLOCKED: no — complete.
