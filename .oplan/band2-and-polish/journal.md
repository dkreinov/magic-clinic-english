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
