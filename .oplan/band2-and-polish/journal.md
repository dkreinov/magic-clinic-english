# Journal — run `band2-and-polish`

Append-only.

## 2026-07-25 — RUN OPENED

Base commit `bbdb60c`. Test baseline 146 pass / 0 fail.
Owner brief: fix the difficulty ceiling AND add more of the artwork's design to the background,
the install icon, and the loading animation. Owner said "she is not here" — a safe window to
change the live app, but explicitly NOT permission to touch her stored profile.

Owner decisions taken at the gate before planning:
  · scope = BOTH the difficulty fix and the visual polish
  · app icon = replace the flat paw print with the girl-and-dragon artwork, accepting the caveat
    that if it does not read at 48px the paw print stays.

## FEASIBILITY WORK DONE BEFORE PLANNING (this is why the plan is concrete)

1. **The defect is real and measured.** `bandForScore` yields preA1/A1/A2, but `buildAllowedSet`
   gates on `band === 'A1' || band === 'A2'` — so A1 and A2 unlock the identical Band 1 list.
   Acing the placement test changes nothing about the story.

2. **A real Band 2 source exists.** Probed the MoE curriculum URL pattern:
   `LexicalBand2.pdf` -> HTTP 200, 2,084,853 bytes (LexicalBandII/…2new/…_2 all 404).
   Downloaded to `data/raw/band2.pdf`. Confirmed via pymupdf: "LEXICAL BAND II — JUNIOR HIGH
   SCHOOL", 56 pages, same table shape as Band 1. Junior high is exactly the next level up from
   the elementary Band 1 — the right ceiling for an 11-year-old.
   Vocabulary for a child's schooling is NEVER LLM-invented; it comes from this official list.

3. **The existing extractor does NOT transfer.** Dry-ran `build_band1.py` against band2.pdf:
   **71 entries**, versus 1341 for band 1. Diagnosed: band 1 repeats the column header on every
   page; band 2 prints it only on pages 2 and 29, so 53 of 55 data pages were skipped.

4. **The fix was proven at plan time, not guessed.** Carrying the column geometry forward from
   the last header page yields **2016 entries / 1610 single-word**, alphabetical
   `a little bit` … `zone`, Rec 1095 / Prod 905, no malformed lemmas.

5. **The two tables identified.** Page 2 = "BAND II CORE I", page 29 = "BAND II CORE II". Both
   run A–Z, which is why the dry run looked like it restarted mid-list. Sections are therefore
   `bandIIcoreI` / `bandIIcoreII`. NOTE for the extractor: `"BAND II CORE I"` is a substring of
   `"BAND II CORE II"`, so CORE II must be tested first or every page mislabels.

6. **Signature compatibility checked.** `tests/story.test.js` and `tests/api-chapter.test.js`
   call `buildAllowedSet(profile, band1)` and `generateChapter({profile, band1, chat})` with
   those exact shapes, so band2 must be an OPTIONAL trailing parameter.

## PLAN REVIEW (fresh eyes, CHECKER tier, before any execution)

VERDICT: fix-first. Four findings, all accepted and fixed:

1. `[undecided] 1.1` — the section-label carry-forward had no concrete trigger; a worker would
   have had to invent the mechanism. **Fixed:** exact python snippet in the plan, including the
   substring-ordering trap (CORE II tested before CORE I).
2. `[validation] 1.2` — the frozen command contained a dead `node -e "…createRequire…" 2>/dev/null;`
   fragment whose trailing `;` DETACHED the real check from the `&&` chain. The reviewer simulated
   it: `STEP-1.2-OK` printed even when `npm test` failed. A gate that passes a broken build is
   worse than no gate. **Fixed:** dead fragment deleted, single unbroken `&&` chain.
3. `[acceptance] 3` — determinism was claimed but never actually checked. **Fixed:** step 1.1 now
   runs the builder TWICE and compares md5 hashes.
4. `[missing]` — no regression test guarded the generated `data/band2.json`, while band 1 has
   `tests/band1.test.js`. **Fixed:** added step 1.4 creating `tests/band2.test.js` (5 tests,
   mirroring band 1). Test total therefore rises 146 -> 151 by design; the invariant this run
   enforces is ZERO FAILURES, not a frozen count.

The reviewer also positively verified two things I would otherwise have had to trust: the local
`band` variable IS in scope at the proposed insertion point in `buildAllowedSet` (so the snippet
works as written and preA1 is genuinely unaffected), and step 1.3's "3 changed lines" count
reproduces exactly.

## ORCHESTRATOR SELF-CATCH (after the review, before dispatch)

My own fix for finding 3 introduced a fresh bug: it wrote a temp file with `cp … /tmp/…` and read
it back with `node readFileSync('/tmp/…')`. On this machine Git Bash's `/tmp` is NOT Node's
`/tmp` (node resolves `C:\tmp`), which I had already hit earlier today in another run. Replaced
the temp-file handoff with an md5 comparison done entirely in the shell. Promoted to field-guide
lesson 16 so it stops recurring.

FIELD GUIDE: 43/40 lines, justified — curation already evicted the two dark-theme tint lessons
(WDT-5 shipped and frozen) and merged the SW-cache and stale-JSON-server traps into one entry.
The remaining overage is the title and section headings, not content. Two lessons were ADDED this
run: the image-capture method (15) and the Git-Bash-vs-node `/tmp` trap (16).

## PHASE 1 — EXECUTION

STEP 1.1 extract data/band2.json
  tier: WORKER (Sonnet) · did: new scripts/build_band2.py — geometry + section carried forward,
    CORE II tested before CORE I, Band II metadata, section-first sort key. Output: 2016 entries
    (bandIIcoreI 1014 / bandIIcoreII 1002), 1610 single-word.
  surprises/deviations: none · first_try: yes · retries: 0 · escalations: 0
  tokens: worker=36751, checker=36319 · audit: match/high · commit: c40eb7f
  ORCHESTRATOR QUALITY CHECK beyond the frozen validation: md5 of two consecutive runs identical
  (4812e246…), so the build is deterministic. Then checked the DATA, not just its shape: no digits,
  no over-long lemmas, no empties. Three words looked like leaked table headers — `column`,
  `state`, `education` — and each turned out to be genuine vocabulary with a proper pos/meaning
  (`column` n "building"; `state` appears three times as distinct homonyms — v "say, express",
  n "condition", n/adj "country"; `education` n). The 7 exact duplicates are words the MoE lists
  in BOTH cores (duty, gather, come down…), harmless because the allowed set is a Set.
  This mattered: it is a child's curriculum, so "well-formed" is not the same as "correct".

STEP 1.2 make A2 unlock Band 2
  tier: WORKER (Sonnet) · did: buildAllowedSet gains `band2 = null`; new guarded block adds band2
    lemmas only when band === 'A2'; generateChapter passes it through.
  surprises/deviations: none · first_try: yes · retries: 0 · escalations: 0
  tokens: worker=33255, checker=29165 · audit: match/high (auditor confirmed `band` is in scope at
    the insertion point, the 2-arg call is still backward compatible, and preA1/A1 get nothing)
  commit: a65067a
  THE ACTUAL FIX, MEASURED: preA1 296 words · A1 1257 · A2 2850. Acing the test now gains 1593
  words (abroad, accept, achieve, adequate, admire, advantage…). Before this step A1 and A2 were
  both 1257 — identical — which was the whole defect.

STEP 1.3 pass Band 2 through the chapter endpoint
  tier: ORCHESTRATOR (deviation, logged) · A two-line mechanical edit — one import, one argument.
  I applied it directly rather than paying a worker round-trip for it. Still validated with the
  frozen command and still audited. Noting it because the discipline says workers do the typing,
  and quietly doing a step myself is exactly the kind of drift worth recording.
  first_try: yes · commit: 47c6a56

STEP 1.4 regression test for the Band 2 data
  tier: WORKER (Sonnet) · did: tests/band2.test.js, five tests mirroring band1.test.js.
  first_try: no · retries: 0 · escalations: 0 · INTERVENTION: 1 (bad-spec, mine)
  tokens: worker=38358, checker=33076 · audit: match/high · commit: 679dcc9
  THE ESCALATION RULE EARNED ITS KEEP AGAIN. The executor stopped rather than guessing, and it
  was right twice over: (a) my frozen validation compared `git diff HEAD --name-only` to exactly
  `tests/band2.test.js`, but steps 1.2 and 1.3 were still UNCOMMITTED, so the check could never
  pass; (b) it further pointed out that `git diff HEAD` never lists untracked files at all, so
  even on a clean tree the check was wrong for a NEW file. Fix: commit 1.2/1.3 first, and use
  `git status --porcelain` (which does see untracked files) instead of `git diff`. A weaker
  worker would have "helpfully" committed or reverted my in-flight work to make the gate go green.

STEP 1.5 orchestrator runtime proof (not dispatched)
  Built allowed sets from the real data files: preA1 296 / A1 1257 / A2 2850, 1593 words gained at
  A2, all sampled words genuinely junior-high level. No API call, no OpenAI spend, no profile
  contact.

PHASE 1 CLOSED — all 6 acceptance criteria pass
  151/151 tests (146 -> 151 by design, five new), band2.json 2016 entries across both cores and
  byte-identical across two builds, A2 exceeds A1 by 1593 words, exactly the six expected files
  changed, nothing under public/ so no sw bump needed.
  steps: 5 (4 dispatched, 1 orchestrator-run) · first-try passes: 3/4 dispatched
  escalations up the model ladder: 0 · interventions: 1 (my bad validation, caught by the worker)
  audits: 4/4 match, all CONFIDENCE high
  tokens: reviewer=77894, workers=108364, checkers=98560, PHASE TOTAL=284818
  field_guide: 43/40 (justified above) · orchestrator_context: unavailable
  NOT DEPLOYED YET — deployment is Phase 3, after the visual work.
