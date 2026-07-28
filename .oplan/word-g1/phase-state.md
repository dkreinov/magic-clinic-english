CURRENT: run seed — NOTHING BUILT YET. A fresh session opens this run: plan phase 1 first
  (fresh planner, files only), plan-review it, then execute. Everything below was decided by
  the OWNER in chat on 2026-07-28 (a /grill-me session) and is binding.

THE RUN: "word-g1" — G1, the candidate ("almost knows it") engine. AUTHORIZED: the owner
  signed the growth amendment on 2026-07-28 ("Q2. accept") — see the filled sign-off in
  .oplan/word-quiz/night/growth-amended-DRAFT.md §12. All seven proposals B1-B7 accepted AS
  WRITTEN, explicitly including: B2 one wrong answer demotes a candidate · B6 badge
  `כמעט יודעת`, softer miss-line `עוד לא — נמשיך ללמוד את המילה הזאת`, claim button stays
  visible on candidates · B4 merge precedence known > candidate > learning · B5 clock reset +
  2-nomination cap · B7 top-ups cover known ∪ candidate (off-list words = their own later step).

FIRST STEP OF THE RUN (from the draft's header): copy the signed draft's text over
  docs/growth.md as ONE edit (it currently reads STATUS: AWAITING-OWNER-SIGN-OFF), then build
  sections 5 and 8 in the order of section 9.

OWNER PROCESS REQUIREMENTS (2026-07-28, binding on how phases are cut):
  1. INCREMENTAL PRODUCTS: every step/slice ends in something visible, DEPLOYED — never one
     big deploy at the end. G1's natural slices: (a) engine + badge she can see, (b) candidates
     enter the quiz (B3 quota: max 1/session, new export, comparator untouched), (c) weekly
     top-ups cover candidates. Each slice = its own CACHE bump + deploy (QZ-22).
  2. Visual gates are SELF-SERVED by the orchestrator in the sandbox browser (field-guide
     lesson 12 of word-quiz-reskin; owner directive — do not ask the owner to eyeball).

THE ROADMAP AFTER THIS RUN (owner-ordered 2026-07-28, do not reorder without them):
  Run 2 = daily review / spaced repetition — COPY known methods (Leitner / SM-2, the Anki
    algorithm), do not invent; consumes G1's candidates.
  Run 3 = gamification = the MAGIC CLINIC (owner's idea, replaces trophies/streaks): learned
    words let her treat magical patients, integrated into the story world (the app IS מרפאת
    הקסמים — she is already the vet's helper). NO pressure mechanics (no streak guilt — reward
    patterns only; explicit owner word: "no preasure"). Needs its own design session first
    (visual options page like the re-skin's, mechanics, what a patient is). Content is
    SCRIPTED: pre-written at build time like quiz items (D23 pattern; the free web route per
    the owner's standing preference), NO runtime LLM.
  Parked: writing exercises (no grading design), voice recording (blocked on private storage),
    pronunciation scoring (riskiest, last). Parent view and G2 remain in the signed draft's
    §9 order relative to these; the owner has not re-prioritized them.
  Side chore for the owner themself: install the PWA on her phone (needed later for push).

SOURCES THE PLANNER MUST READ (in order):
  1. This file.
  2. .oplan/word-quiz/night/growth-amended-DRAFT.md — THE SPEC (signed): §5 the rule, §5.2
     lifecycle, §8 B2-B7 answers, §10 what must not change, §9 the order.
  3. .oplan/word-quiz/phase-state.md + its journal "PHASE 5 PLANNING" section (the 7 blockers'
     origin) and design.md D1-D29.
  4. .oplan/word-quiz-reskin/phase-state.md (current tree state, v15 live, rollback ladder) +
     its field-guide/index.md (12 lessons, binding).
  5. The code: lib/profile.js (WORD_STATUSES at :13 gains 'candidate'; migrateWordKeys :272;
     applyQuizAnswer :423/:461), api/chapter.js (:34/:56 the call site), public/quiz-core.js
     (:50 pickQuizWords — frozen comparator QZ-17), public/views/words.js (:117 statusBadge,
     :155 claim button), public/quiz.js (:171 demotion line, QZ-18 text-node order).

FROZEN CONTRACTS IN FORCE (inherited; see word-quiz-reskin/phase-state.md for the full list):
  QZ-22 (CACHE bump per precached change — shell is at magic-vet-v15) · the signed draft §10
  ("what must not change") · QZ-12/QZ-17/QZ-18 amended ONLY as the draft specifies · ledger
  282/0 flat top-level test() · contrast anchor 52 · APP_CODE never in the orchestrator's
  shell · never probe the live profile · GET /api/profile creates one (a read that writes) ·
  D25: capture her profile before any deploy that writes NEW FIELDS — G1 writes new fields
  (status 'candidate', nominations), so a sanctioned backup step is REQUIRED before the first
  deploy of slice (a). The owner's D27 rider (backups deleted at close) presumably applies
  again — confirm with the owner at the capture step.

TREE AT SEED TIME: HEAD 2cca28e clean · live dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn (magic-vet-v15,
  Sunrise Parchment + SW auto-reload) · tests 282/0 (also under APP_CODE=dummy) · contrast 52.

OPEN QUESTIONS: none for phase 1 — the signature answered them. (Run-3 design questions are
  deliberately open and belong to run 3's own grill.)
BLOCKED: no.
