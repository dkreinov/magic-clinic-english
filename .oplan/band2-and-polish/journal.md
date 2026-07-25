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

## 2026-07-25 — PHASE 2 PLANNED (fresh planner, then orchestrator review)

Resumed in a fresh session from files alone. The resume worked: phase-state -> plan -> journal ->
field guide was enough to pick the run up with nothing lost, which is the first real evidence the
file discipline survives a `/clear`.

FRESH PLANNER (PLANNER tier, files only, no context spoon-fed). It returned a complete 8-step plan
and, more valuably, nine RECORD GAPS. Two are worth naming here because they are defects in the
RUN, not in the plan:

  · `design.md` exists on disk and had never been copied into the workspace, which oplan §5
    requires. My own planner packet even asserted "not present for this run" — the planner checked
    the disk instead of believing me, and was right. COPIED IN. The run had been violating its own
    file discipline since it opened, and only a fresh agent reading the record could see it.
  · A REAL, PRE-EXISTING WCAG FAILURE nobody had recorded. `body` paints
    `linear-gradient(180deg, #3d2109 0%, ...)` — a RAW LITERAL, so `check-contrast.mjs` (which only
    parses `:root` hexes) never measured it. `--color-border` #a35d22 on #3d2109 = 2.92:1 against
    the 3:1 that docs/visual-design.md §3 declares binding, and bordered controls sit directly on
    that wash. The gate has been printing ALL PASS over a surface that fails. This is field-guide
    lessons 13/14 all over again: the gate cannot see what is not a token.

ORCHESTRATOR REVIEW — I did not take the numbers on trust. Re-derived every proposed contrast value
with the gate's own formula: all 24 new pairs reproduce EXACTLY as planned (border floors
3.10/3.08/3.06/3.09), and the 2.92:1 pre-existing failure reproduces too. Also independently
verified: tests/shell.test.js:30 freezes manifest.icons[0].src and the PRECACHE deepStrictEqual
includes /icons/icon.svg (so the skeleton's "replace icon.svg" is impossible — the plan appends
PNGs instead); NO test touches .reader-loading/.reader-spinner (safe to restructure); .spot-image
and .spot-image--sm already exist in styles.css (so step 2.2 needs no CSS there); sharp ^0.35.3
present; `node -e` + require works despite "type": "module"; 410+51+51 = 512 and #2e1806 =
rgb(46,24,6) for the maskable padding check.

FIVE FIXES I made to the planner's plan before freezing it:
  1. [validation] step 2.7 used `grep -qF -- '<link rel=\"...\" />'` — backslash-escaped quotes
     INSIDE single quotes, so the pattern contained literal backslashes and the gate could never
     pass. Same bug in its `'const CACHE = \"magic-vet-v7\";'`. Un-escaped both.
  2. [validation] step 2.4 had `! grep -q '28' README.md` — forbidding the digit pair "28" anywhere
     in the README forever. It happens to pass today (one match) but a worker could satisfy it by
     deleting unrelated text. Tightened to `checks 28` / `checks 52`.
  3. [validation] step 2.1's test 2 said "extract the `body { … }` rule" — a trap, because
     `html,\nbody { … }` appears FIRST in styles.css and a naive rule regex matches that one.
     Verified `background-image` appears ZERO times today, so I froze the extraction as
     `/background-image:\s*([^;]*);/`, which is unique after the edit.
  4. [missing] the planner's own record gap "two contradictory sw rules" named §8, but its step 2.4
     only amended §3/§5/§7. Added Edit 5: write the VP-4 carve-out into §8 itself, so the
     contradiction is resolved in the record and not merely in this plan.
  5. [order] made "commit every step before dispatching the next" an explicit orchestrator note.
     Every step's gate counts changed paths with `git status --porcelain`, so an uncommitted
     predecessor makes the next gate unpassable — exactly what bit step 1.4 in phase 1.

BLOCKERS — both answered in writing (plan.md), neither deferred to a worker:
  1. Approval to amend the frozen docs/visual-design.md: PROCEED. The header rule exists to stop
     silent unapproved drift; step 2.4 does the opposite, and the doc is ALREADY factually wrong
     (28 pairs, and a capture method §7 itself records as having caused an 89-duplicate burst). The
     one substantive value change (#3d2109 -> #361d08) enforces §3's own binding 3:1 rule rather
     than altering the design.
  2. The GC-D8 owner gate for a 9th asset: honoured, not bypassed. Steps 2.1-2.4 + 2.8 need no
     owner and run now; 2.5 generates the art and shows 48/96/192px previews; 2.6/2.7 integrate it
     ONLY on a recorded `ICON-ART: APPROVED`. If the owner is unreachable, the phase closes green
     with the paw print — the caveat the owner pre-accepted. Acceptance criterion 1 therefore has
     two legal test totals (154 without the icon, 157 with it).

## PHASE 2 — EXECUTION

STEP 2.1 artwork-derived page background, provably AA-safe
  tier: WORKER (Sonnet) · did: styles.css — 4 new :root tokens after --color-glow, body's
    `background:` shorthand (with its raw #3d2109) replaced by background-color +
    background-image with 3 radial glows over the token-based top wash + background-repeat.
    check-contrast.mjs — 24 appended PAIRS entries (6 per new token), no function touched.
    tests/background.test.js (NEW) — 3 tests: token freeze, composition freeze (and no `#`
    permitted in the background value), and the gate exits 0.
  surprises: none · deviations: none · first_try: yes · retries: 0 · escalations: 0
  tokens: worker=43552, checker=37492+37817 (two passes) · commit: d4409a6
  audit: match — but CONFIDENCE: low on the first pass. Per §10.8 I supplied exactly what it said
    it lacked (shell.test.js's header, and the verbatim validation output) and re-audited ONCE.
    Second pass: match/high. Its reasoning on the one thing it flagged was better than mine would
    have been: background.test.js imports only `readFileSync` where shell.test.js imports four fs
    names, and it ruled that pulling in three UNUSED names to look more similar would itself have
    been an unrequested addition. Correct call.
  ORCHESTRATOR QUALITY CHECK beyond the frozen validation. The gate measures the four LAYER colours
  and the plan argues by convexity that this bounds every composited pixel. An argument is not a
  measurement, so I brute-forced it: 14,641 real composites (the base gradient at every stop, then
  all three glows at every alpha 0..1 by 0.1) — worst --color-border contrast 3.0618, worst
  --color-ink 13.8464. Both clear their minima, and the worst case lands EXACTLY on #282416, one of
  the four layers the gate checks. So the 52 pairs are not merely sufficient, they are the tight
  bound. Layer luminances confirm why: the teal glow is the lightest of the five paints.
  WHAT THIS STEP ACTUALLY FIXED, beyond the visual brief: the shipped app had --color-border at
  2.92:1 on the painted wash, under the binding 3:1 of WCAG 1.4.11, and the gate could not see it
  because the colour was a literal instead of a token. It is now 3.10:1 and permanently measured.

STEP 2.2 themed loading state in the reader
  tier: WORKER (Sonnet) · did: public/views/reader.js — .reader-spinner rule replaced (44px border
    ring -> 56px conic-gradient primary/teal/accent ring cut out by a radial mask, 0.9s -> 1.4s);
    .reader-loading-art float animation + @keyframes reader-float + a prefers-reduced-motion block
    added after the reused @keyframes reader-spin; renderGenerating() gained the decorative
    placement-friend.webp img.
  surprises: none · deviations: none · first_try: yes · retries: 0 · escalations: 0
  tokens: worker=42153, checker=30085 · audit: match/high · commit: 0560910
  ORCHESTRATOR QUALITY CHECK beyond the frozen validation. The gate can prove the CSS text is
  present but not that the user sees anything: a mask whose opaque zone starts outside the clipped
  circle renders an INVISIBLE spinner, and every test would still pass. So I computed the geometry.
  For a 56px box, a `circle` radial-gradient defaults to farthest-corner = hypot(28,28) = 39.60px,
  so `transparent 56%` ends at 22.17px and `#000 60%` becomes fully opaque at 23.76px, while
  border-radius clips at 28px. Result: a real 4.24px opaque ring plus a 1.58px feather — matching
  the 4px border ring it replaces. Had the stops been percentages of the RADIUS rather than the
  farthest corner, the ring would have been ~1px; worth recording because that is the trap.
  Also confirmed the frozen Hebrew string appears in the diff only as unchanged CONTEXT, not as a
  +/- line, so it is byte-identical rather than merely re-typed correctly.
