CURRENT: **PHASE 1 CLOSED 2026-07-27 — all 9 criteria met, criterion 9 approved by the owner, who
  opened phase 2.** Phase 2 is NOT YET PLANNED: plan.md holds only a skeleton for it, and this
  project's rule is that a step containing an open question must never be dispatched. Phase 2 needs
  its own frozen acceptance criteria, a batching strategy, and a decision on scale BEFORE any
  worker runs. Next action: plan phase 2, do not dispatch it.
PLAN: .oplan/word-quiz/plan.md — fixed in place through THREE review rounds, so there is no
  amendments appendix to read separately. Read it top to bottom.
DESIGN: .oplan/word-quiz/design.md — FROZEN. 14 owner decisions (D1-D14) from a grill-me pass plus
  5 orchestrator decisions (D15-D19). Do not re-open any of them.
FIELD GUIDE: .oplan/word-quiz/field-guide/index.md (13 lessons, re-curated from word-audio)
PREDECESSOR: .oplan/word-audio/ — closed and deployed. Its journal holds the deploy recipe, the
  rollback procedure, and the two gate failures this run must not repeat.

BASE: commit ceca519 · 208 tests / 0 fail · contrast 52 ALL PASS · LIVE at magic-vet-v12.

ACCEPTED: 1.1 (lib/quiz-item.js + tests/quiz-item.test.js; STEP-1.1-OK re-run by the orchestrator in
  a clean tree; 214 pass / 0 fail). Carries AMENDMENT A1: rule 10 now compares RESOLVED LEMMAS, not
  surface forms — as frozen it let an inflection give the answer away. See journal "Execution —
  phase 1". QZ-2 also gained two constraints the 1.3 packets must quote: the blank is never the
  first word, and rule 7 is direct manifest membership while rule 4 de-inflects.
  · 1.2 (scripts/check-quiz-bank.mjs + tests/quiz-bank.test.js; STEP-1.2-OK re-run by the
  orchestrator; 218 pass / 0 fail; empty-bank case green with public/quiz/ still absent). Carries
  AMENDMENT A2: the sampler stride is frozen as `Math.floor(i * total / n)`. As first written it
  ended short of the bank's tail and `--sample 50` over 80 items showed the alphabetically-first
  63% — it would have fed criterion 9's HUMAN gate a front-loaded sample presented as a whole-bank
  one. See journal "Execution — phase 1".

CARRY INTO PHASE 2 — the four things phase 1 learned that no gate can enforce:
  · D21 (owner): distractors are SAME-CLASS, so the item tests meaning and not word class.
  · THE PIN TEST: `and`/`but` pin NOTHING. Only `so`, `so that`, `so ... that`, `because`,
    `... enough to`, purpose infinitives and verb/argument selection constrain the blank. SIX of the
    first 23 D21 items pinned with a coordinator: four leaked outright (`run[1] play[0] play[1]
    right[1]`) and two were weak (`kind[0] well[1]`). This is NOT a ban on the words — 11 of the
    final 71 items contain an `and`/`but` and are fine, because something else is doing the
    pinning. The rule is that a coordinator may never be the ONLY pin.
  · AMBIGUITY IS THE FAILURE, not difficulty. `count` in "___ four and five, the answer is nine"
    and `because` in "played the piano ___ I was seven" were both rejected for having a readable
    second meaning, not for fitting outright.
  · SHIP FEWER ITEMS RATHER THAN A LEAKY ONE. Two senses were abandoned on this ground and that was
    the right call.
  Also inherited: rule 10 is blind to irregular forms that are themselves manifest words (29 lemmas
  / 42 forms, listed in QZ-2) and `became`/`tying` fail rule 4 as ordinary sentence words.

FROZEN CONTRACTS IN FORCE: QZ-1 (the item file, ten rules — 1/2/9 FILE-level, 3-8/10 ITEM-level)
  · QZ-2 (the generation rules, including the vocabulary warning and the duty to self-run the gate)
  · QZ-3 (the gate's frozen CLI: `[--dir <path>] [--sample <N>]`, item-level sampling, rule-4 errors
    name the offending tokens) · QZ-4 (phase-1 non-goals: no UI, no api/, no lib/profile.js, no
    sw.js, no cache bump, no deploy, no paid API, no runtime LLM) · QZ-5 (the 50 frozen pilot words
    and the frozen 5-batch composition) · QZ-6 (ledger 208 -> 214 -> 218) · QZ-7 (inherited: PRECACHE
    admits first-party JS only, contrast stays at 52, profile never contacted).

THE THREE THINGS MOST LIKELY TO BITE:
  · QZ-1 rule 4 — the allowed vocabulary is NOT ordinary English. MEASURED: `after`, `children`,
    `men`, `women`, `feet` are ABSENT while `before`, `went`, `gone` are present. Workers must check
    every word against public/audio/words/index.json and run the gate themselves.
  · QZ-1 rule 8 — pos is a SET unioned across BOTH bands, matched by intersection. 393 manifest
    lemmas have >1 band entry and 336 have a pos union larger than 1. The `entry.pos == null` guard
    is load-bearing: `String(null)` is the truthy string "null".
  · A green gate is NOT acceptance. Criterion 9 is a HUMAN gate — the gate checks form, the owner
    checks meaning. This project has shipped two defects that passed a mechanically-green gate.

OPEN QUESTIONS: none. All 13 grill questions were answered by the owner; the 5 the grill left open
  were decided by the orchestrator at plan time as D15-D19 and written into design.md.
  NO sensitive-word escalation is expected any more: QZ-8 (owner, D20) removes 37 words from the
  quiz entirely and the pilot list no longer contains any of them. QZ-2's stop-and-ask rule stays as
  a backstop. NOTE the exclusion is QUIZ-ONLY — those words are still in buildAllowedSet and the
  story may still use them; that is flagged in design.md D20 and NOT decided.

BLOCKED: no
