# Journal — run `warm-dark-theme`

Append-only.

## 2026-07-24 — RUN OPENED

Base commit `563dd41`. Test baseline verified before any change: **146 pass / 0 fail**.
Owner brief: re-theme the entire app to the artwork's palette; colors/surfaces/styling only;
146 tests stay green; WCAG AA is a hard gate; Hebrew RTL unchanged; bump the sw cache version;
owner gate after the palette is applied to ONE screen. Execution mode: autonomous except that
gate.

## PALETTE DERIVATION (evidence for contract WDT-1)

Method: all 8 `public/assets/*.webp` decoded with `sharp` (imported by absolute file URL — see
field-guide 11), resized to a common grid, and analysed three ways: (a) 5-bit-per-channel
quantised bucket populations, (b) per-asset brightest-0.5% and darkest-2% luminance bands,
(c) HSL band means over saturated pixels. Raw output is reproduced below.

**Per-asset edge color and top buckets:**

```
celebration.webp     edge=#8d4926  top: #fcb748 1.9% | #582618 1.8% | #783507 1.7%
chapter-clinic.webp  edge=#542a1b  top: #381503 7.5% | #471b03 6.4% | #582506 5.8%
chapter-forest.webp  edge=#2f2210  top: #181606 8.1% | #271805 7.5% | #382706 4.4%
chapter-night.webp   edge=#24152d  top: #150d47 4.9% | #261768 4.4% | #0d0935 3.7%
hero-clinic.webp     edge=#705236  top: #361904 3.5% | #281705 3.3% | #482605 3.1%
heroine.webp         edge=#6d381a  top: #471703 4.8% | #672807 3.9% | #873708 2.8%
placement-friend.webp edge=#803e25 top: #682805 2.7% | #592407 2.0% | #974816 1.7%
words-treasure.webp  edge=#783f17  top: #582605 5.8% | #471c04 4.5% | #662905 3.6%
```

**Global top buckets across all 8 assets:** `#381704` 3.07%, `#582606` 2.91%, `#471a04` 2.87%,
`#672906` 2.40%, `#281605` 1.94%, `#482507` 1.76%, `#783608` 1.70%, `#181606` 1.47%,
`#873908` 1.24%, `#180a04` 1.18%.

**Luminance extremes per asset:** brightest 0.5% ("glow") ranges `#e2f1ec`–`#fef3a1`, clustering
on `#fde3a2` / `#fcefd0` / `#fdf8d9`; darkest 2% ranges `#0a0903`–`#2e1207`.

**Saturated-hue band means:** amber `#da903a` (n=45924), gold highlight `#eec65a` (n=6440),
teal `#2db1a2` (n=2534), violet `#7d35b5` (n=8063), pink `#bb5e99` (n=5012),
warm-red/terracotta `#b05525` (n=29917), soft warm tan `#c0a57b` (n=216),
mid warm surface `#6c340c` (n=50906).

**Conclusion.** The art's field is deep warm brown, not cream — which is exactly why the images
read as dark boxes on the current `#faf7f2` page. Surfaces were taken from the dominant brown
buckets verbatim; foreground colors were taken from the saturated-band means and lightened along
their own hue only where AA required it (violet `#7d35b5`→`#c39bf0`, teal `#2db1a2`→`#4ecec0`,
gold `#eec65a`→`#f5c563`, terracotta `#b05525`→`#ef9a7d`, tan `#c0a57b`→`#d9bc92`, mid-surface
`#6c340c`→`#a35d22` for the 3:1 non-text border gate). Every one of the 28 gated pairs was
verified numerically BEFORE the palette was frozen — lowest margin is pair 19 (card icon on its
own plate) at 4.86:1 against a 4.5 minimum; page body text sits at 16.02:1.

## PLAN REVIEW (fresh eyes, CHECKER tier, before any execution)

VERDICT: **fix-first**. Five findings, all accepted and fixed in plan v2:

1. `[undecided] 1.2` — the contrast gate's PAIRS table referenced tints that live in Phase 2's
   view stylesheets, whose percentages the plan never fixed. **Fix:** added contract WDT-5,
   freezing every tint percentage in the app up front, so Phase 2 has nothing left to decide.
2. `[undecided] 1.3` — the SAMPLING EVIDENCE block gave no provenance for `--color-danger`,
   `--color-border`, `--color-muted`, `--color-ink`, `--color-primary-ink`, yet the step demanded
   a cited source for every token. **Fix:** ran two more sampling passes (terracotta, warm tan,
   mid warm surface bands) and rewrote the evidence as a per-token table covering all 17 tokens.
3. `[undecided] 1.3` — "replace the existing token table" was ambiguous: §3 has TWO tables.
   **Fix:** the step now says delete BOTH and emit one 17-row table, with a validation grep
   asserting `Additive tokens` is gone.
4. `[validation] 1.1, 1.3` — `npm test 2>&1 | tail -N && ...` reports `tail`'s exit code, so a
   test failure would have produced a false PASS. **Fix:** `set -o pipefail` on both, and
   promoted to field-guide lesson 10.
5. `[validation] 1.1 + acceptance 3` — the leftover-color regex missed bare `color: white;`.
   **Fix:** regex widened to any occurrence of `white`, plus the superseded hexes; the target is
   now "the string `white` does not appear in styles.css at all".

The reviewer separately confirmed that every "current declaration" cell in the step 1.1 rule
table matches `public/styles.css` verbatim and that no hard-coded light color in the file is
left uncovered.

---

## PHASE 1 — EXECUTION

STEP 1.1 re-theme public/styles.css to the WDT-1 tokens
  tier: WORKER (Sonnet)
  did: replaced :root token block; re-themed body gradient, .card-icon, .card--locked .card-icon,
       .btn-primary:hover shadow, .btn[disabled] bg/color, .intro-step-number color, .illustration
       gradient + pseudo-elements, .bottom-nav bg/shadow (table A); applied box-shadow:none +
       mask-image to .hero-banner/.chapter-banner/.celebrate-image and .spot-image
       (+ border-radius:50%) (table B).
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=34759, checker=28075, orchestrator_delta=unavailable
  interventions: 0
  audit: match / CONFIDENCE high / findings none
  commit: d6309ab
  accepted: 2026-07-24

STEP 1.2 add the mechanical contrast gate scripts/check-contrast.mjs
  tier: WORKER (Sonnet)
  did: new zero-dependency ESM script; parses :root from public/styles.css into a live token map,
       resolves the frozen color-mix tints, computes WCAG 2.1 ratios, prints 28 PASS/FAIL lines,
       exits 0 on ALL PASS and 1 on failure.
  surprises: none
  deviations: none (auditor noted one benign extra: it also errors if the :root block is missing)
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=31793, checker=31127, orchestrator_delta=unavailable
  interventions: 0
  audit: match / CONFIDENCE high
  ORCHESTRATOR TAMPER TEST (beyond the frozen validation): temporarily set --color-ink to
  #4a3a20 in styles.css; the gate reported 7 FAILURES and exited 1, then ALL PASS after restore,
  with styles.css byte-identical to the commit afterwards. The gate is real, not decorative.
  All 28 ratios also matched an independent computation done before the palette was frozen.
  commit: 8271d0e
  accepted: 2026-07-24

STEP 1.3 amend docs/visual-design.md with the new frozen palette
  tier: WORKER (Sonnet)
  did: §3 heading marked AMENDED 2026-07-24; amendment paragraph added; both old tables deleted
       and replaced with one 17-token table carrying per-token sampling provenance; added
       "Superseded (light-cream era, pre-2026-07-24)" table of the 9 old values; GC-D1 rule
       amended; "Accessibility gate" subsection added; §8 DON'T bullet swapped.
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=38330, checker=32607, orchestrator_delta=unavailable
  interventions: 0
  audit: match / CONFIDENCE high / findings none
  commit: c26a050
  accepted: 2026-07-24

STEP 1.4 orchestrator preview (not dispatched)
  Local dev server on :3000 (already running, serving from disk). Loaded #/home in Chrome.
  TRAP HIT AND RECORDED: the first two loads showed the OLD cream tokens
  (--color-bg=#faf7f2) even though the server was serving the new file — a service worker from a
  previous session was serving cache `magic-vet-v2`. Unregistering the SW alone was not enough;
  the HTTP disk cache still held the old styles.css. Only ctrl+shift+R produced the true state.
  Promoted to field-guide lesson 14. Verified after hard reload: --color-bg=#241305,
  --color-card=#3a1d08, --color-nav=#2e1806, body rgb(36,19,5), nav rgb(46,24,6),
  card rgb(58,29,8), .spot-image border-radius 50%, .hero-banner mask-image active.
  Screenshots taken of the top and bottom of #/home. No API call was made and the learner
  profile was never touched (the home view is static markup).

PHASE 1 CLOSED
  steps: 3 (+1 orchestrator step), first-try passes: 3/3
  escalations: 0 (no step needed a rung up the ladder)
  interventions: 0 (no executor stopped with a question)
  audits: 3/3 match, all CONFIDENCE high
  cost: worker=104882 subagent tokens, checker=158233 subagent tokens (incl. the 66424-token
        plan review), total=263115; dollar cost unavailable (harness does not report it here)
  orchestrator_context: unavailable (no /context readout accessible from inside the run)
  field_guide: 34/40 lines (within budget)
  acceptance criteria: all 7 pass — 146/146 tests, contrast gate ALL PASS exit 0, zero
    light-theme leftovers in styles.css, exactly 3 files changed, styling-only diff proof empty,
    no other public/ or tests/ file touched, screenshot shows no cream surface.
  NOTE: the plan review cost more tokens than any executor. It also caught five real defects
  before any code was written, two of which (the pipefail exit-code masking and the `color: white`
  regex hole) would have let a broken step report a false PASS. That is the machinery earning
  its keep, and it is the number to watch across the rest of the run.

## OWNER GATE — PASSED (2026-07-24)

Owner was shown the WDT-1 palette, the two home-screen screenshots, the contrast results, and
both open questions.

DECISION 1 — palette: **APPROVE AS SHOWN.** The WDT-1 values and the artwork-blend treatment
(banner bottom-fade, spot art as a soft-edged circle) are approved. Phases 2–4 proceed.

DECISION 2 — PWA chrome (resolves WDT-3 / OPEN QUESTION 1): **change both, update the test.**
Owner explicitly authorised editing the two frozen assertions in tests/shell.test.js:
  public/manifest.webmanifest  background_color #faf7f2 -> #241305
                               theme_color      #7c3aed -> #2e1806
  public/index.html            <meta name="theme-color"> #7c3aed -> #2e1806
  tests/shell.test.js:28-29    both assertions updated to the new values
This is the ONLY authorised change to a test's color assertion in this run. WDT-3 is now closed.

FYI item (raised, not a question): the primary button renders with a text underline because it
is an <a class="btn btn-primary">. Predates this run, not a color defect, left alone.

Execution resumes in autonomous mode. Remaining pauses: none planned.

## PHASE 2 — PLANNING (fresh next-phase planner, PLANNER tier, files only)

The fresh planner read the record and the code and returned a full plan plus 1 BLOCKER and
4 RECORD GAPS. Its most valuable output was RECORD GAP 2, which is a real defect nothing else in
this run would have caught:

**`<button>` does not inherit `color`.** `.placement-option-btn`, `.placement-question-option`
and `.reader-question-option` declare no `color`, so the UA stylesheet supplies `buttontext`.
In the cream theme that rendered black-on-white and looked fine. After the re-theme it would have
rendered black on deep brown at roughly 1.9:1 — a hard WDT-2 failure. The token-level contrast
gate is STRUCTURALLY BLIND to it, because the offending foreground exists in no file: it comes
from the browser. Corroborated by the fact that `public/styles.css` already carries
`button { font-family: inherit; }` — someone hit the identical non-inheritance with fonts and
fixed only that one. Promoted to contract WDT-6; Phase 2 adds the three missing declarations.
This is the single strongest argument in this run for the fresh-planner step: the orchestrator
wrote the Phase 2 skeleton and did not see it.

ORCHESTRATOR RULINGS (full text in plan.md):
- BLOCKER 1 (`--color-border` 2.51:1 against `--color-surface-2`): accepted as planned. WCAG
  1.4.11 tests the control against its ADJACENT background — the card — where the border clears
  3.05:1. It is also a strict improvement: the same control in the cream theme had a boundary
  contrast of 1.04:1 (cream fill on a white card). Raising the token far enough to clear 3:1
  against the option's own fill too would need luminance ~0.20 (about `#b58a5a`), a loud outline
  on every answer button, and would reopen an owner-approved, doc-frozen token.
- RECORD GAP 1 (scrim opacity never frozen): adopted `rgba(0, 0, 0, 0.6)`, added to WDT-5.
- RECORD GAP 3 (`color-scheme: dark`): deferred to Phase 3, whose write set includes index.html.
- RECORD GAP 4 (no per-phase baseline commit): fixed, `phase-state.md` now carries `BASELINE:`.

## PHASE 2 — EXECUTION

STEP 2.1 re-theme public/views/placement.js
  tier: WORKER (Sonnet) · did: 5 rule swaps — play-btn ink, two option borders + two added
  `color: var(--color-ink)` (WDT-6), two selection tints 10%/white -> 14%/card.
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=33941, checker=24547 · interventions: 0 · audit: match/high
  commit: 7363faf · accepted: 2026-07-24

STEP 2.2 re-theme public/views/reader.js
  tier: WORKER (Sonnet) · did: 9 rule swaps — tapped-word 28%, input border, spinner track 25%,
  question-option border + surface-2 fill + added ink color, correct 16%, wrong (both #dc2626
  -> --color-danger) 16%, feedback.bad -> --color-danger, scrim 0.35 -> 0.6, grabber 45%.
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=37783, checker=25581 · interventions: 0 · audit: match/high
  commit: ac9110d · accepted: 2026-07-24

STEP 2.3 re-theme public/views/words.js
  tier: WORKER (Sonnet) · did: both badge backgrounds -> 18% into --color-card; learning badge
  foreground `color-mix(--color-accent 70%, black)` collapsed to plain var(--color-accent).
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=27093, checker=22513 · interventions: 0 · audit: match/high
  commit: 87331b3 · accepted: 2026-07-24

STEP 2.4 orchestrator visual check (not dispatched)
  Chrome's screenshot transport failed repeatedly this session (CDP `Page.captureScreenshot`
  deserialize error), so instead of eyeballing, the harness was verified MECHANICALLY, which is
  stronger evidence. A throwaway static harness (scratchpad only, no repo file, no API call, no
  profile contact) inlines styles.css + all three VIEW_STYLE blocks and renders 25 themed states;
  a script then walks each element, resolves its EFFECTIVE background through the ancestor chain
  with alpha compositing, and computes the real rendered WCAG ratio.
  RESULT: 24/25 pass, worst non-disabled = 5.75 ("known" word badge). The single sub-4.5 item is
  `.btn[disabled]` at 4.26 — WCAG 1.4.3 explicitly exempts inactive components, and the muting is
  deliberate so the control reads as unavailable. Accepted; logged as a known, exempt item.
  TRAP FOUND IN THE MEASUREMENT ITSELF: Chrome returns `color-mix` results as
  `color(srgb 0.30 0.18 0.15)` floats, not `rgb()`. The first measurement pass parsed those with
  an `rgb()` regex and silently reported `rgb(0,0,0)` backgrounds — i.e. it FABRICATED passing
  numbers for exactly the six tinted states most in need of checking. Caught by noticing six
  identical `bg=rgb(0,0,0)` rows. Promoted to field-guide lesson 15.
  CROSS-CHECK (unplanned, valuable): Chrome's own composited color-mix values match
  scripts/check-contrast.mjs's arithmetic to 2 decimals — e.g. selected option renders
  `color(srgb 0.302667 0.182902 0.158745)` where the script predicts (77.18, 46.64, 40.48)/255 =
  (0.30266, 0.18290, 0.15874). The gate is faithful to what actually renders, not just
  self-consistent.

PHASE 2 CLOSED
  steps: 3 (+1 orchestrator step), first-try passes: 3/3
  escalations: 0 · interventions: 0 · audits: 3/3 match, all CONFIDENCE high
  cost: planner=121483, worker=98817, checker=72641, phase total=292941 subagent tokens;
        run-to-date total=556056; dollar cost unavailable (harness does not report it here)
  orchestrator_context: unavailable
  field_guide: 40/40 lines (within budget). Curation: added lessons 14 (Chrome returns color-mix as
    `color(srgb ...)`) and 15 (buttons do not inherit `color`); EVICTED the `sharp`
    absolute-import lesson, whose only use (palette derivation) is finished and will not recur.
    That trade is exactly what the cap is for: the two new lessons each describe a defect that
    silently fabricated or hid a failure, which is worth more than a one-off import path.
  acceptance criteria: all 9 pass — 146/146 tests, contrast gate ALL PASS, zero light-theme
    leftovers in any view, exactly 3 files changed, styling-only proof empty, nothing else moved,
    WDT5-OK, INK-OK, and the harness measurement above.

## PHASE 3 — EXECUTION

STEP 3.1 PWA chrome colors, app icon, color-scheme meta, sw cache bump
  tier: WORKER (Sonnet) · dispatches: 3 (two stopped-with-question, third accepted)
  INTERVENTION 1 — my spec bug, correctly caught. The frozen validation contained
  `! grep -rqE '#faf7f2|#7c3aed' public/ tests/`, which sweeps ALL of public/ — wider than the
  step's four-file write set — and hit `public/icons/icon.svg`. The executor refused to edit a
  file outside its boundary and asked instead of guessing. The finding was REAL and in scope: the
  launcher icon was still built entirely from the four superseded values (#7c3aed plate,
  #faf7f2 pads, #f59e0b centre, #0d9488 sparkle) — the single most visible surface of the app,
  sitting on the phone's home screen. RULING: added icon.svg to the write set with a strict
  one-old-token-to-one-new-token substitution (plate -> #2e1806 so the icon matches the browser
  bar exactly; pads -> #fdf1d8; centre -> #f5c563; sparkle -> #4ecec0), geometry untouched
  because the icon is `purpose: "any maskable"` and the OS crops it. Plan amended, step files
  reverted to 814473a, re-dispatched.
  INTERVENTION 2 — my arithmetic bug, also correctly caught. The amended validation asserted
  `grep -cE 'ellipse|rect|path' icon.svg` = 7; the file actually has 8 (1 rect + 6 ellipse +
  1 path). The executor verified the count was 8 both BEFORE and AFTER its edit, refused to
  change geometry to satisfy a bad constant, and asked. Constant corrected to 8.
  Because the second stop was purely my erroneous constant and the executor's six edits were
  already complete and correct, the orchestrator did NOT burn a third identical dispatch: it
  corrected the constant, re-ran the full corrected validation itself in a clean state, and sent
  the diff to a fresh auditor. Both halves of the gate (independent re-validation + fresh eyes)
  stayed intact.
  surprises: the app icon was carrying the entire old palette and nothing in the plan had
    accounted for it · deviations: none by the executor
  validation_first_try: no · retries: 0 · escalations: 0 · interventions: 2 (both bad-spec, mine)
  tokens: worker=73634 (across both dispatches), checker=25273
  audit: match / CONFIDENCE high — explicitly confirmed icon.svg is colour-only (viewBox, all
    cx/cy/rx/ry, path `d`, element count and order untouched) and that tests/shell.test.js has
    EXACTLY the three authorised assertion changes with PRECACHE deepStrictEqual intact.
  commit: bd9ccdb · accepted: 2026-07-24

PHASE 3 CLOSED
  steps: 1 · first-try passes: 0/1 (both failures were orchestrator spec defects, not worker error)
  escalations: 0 · interventions: 2 · audits: 1/1 match
  cost: worker=73634, checker=25273, phase total=98907 subagent tokens
  gate: 146/146 tests, contrast ALL PASS, sw.js diff is exactly one line (CACHE), shell.test.js
    diff is exactly the three authorised assertions, and a full-repo sweep for every superseded
    value (#faf7f2 #7c3aed #f59e0b #0d9488 #1f2937 #6b7280 #dc2626 #e5e7eb #fdfbf7) across
    public/ tests/ scripts/ returns NOTHING.

## PHASE 4 — DEPLOY AND LIVE VERIFICATION

Planned by the orchestrator rather than a fresh next-phase planner (logged deviation): this phase
has no code to specify, only commands to run and evidence to gather. The part of the discipline
that matters — writing the acceptance criteria BEFORE doing any of it — was kept: all 11 criteria
were committed in plan.md before `vercel --prod` ran.

Deployed: dpl_Eia3YKRS7FxVdfbPg3r4piqhhBYr, readyState READY, target production.
Canonical production URL: https://english-app-three-tan.vercel.app

RESULTS — all 11 criteria pass:
  1. deploy READY.
  2. live /styles.css has `--color-bg: #241305`, and no `white`/#faf7f2/#7c3aed/#1f2937/#6b7280.
  3. live /sw.js has magic-vet-v3, not magic-vet-v2.
  4. live manifest: background_color #241305, theme_color #2e1806.
  5. live /icons/icon.svg has #2e1806, no #7c3aed/#faf7f2.
  6. live index.html has both the theme-color and the new color-scheme meta.
  7. live placement/reader/words .js: no white, no black, no #dc2626.
  8. real browser on production after SW unregister + cache clear + hard reload:
     tokens bg #241305 / card #3a1d08 / nav #2e1806 / ink #fdf1d8; body rgb(36,19,5);
     nav rgb(46,24,6); card rgb(58,29,8); .spot-image border-radius 50%; hero mask active.
     NOTE: `caches.keys()` on the live origin returned BOTH `magic-vet-v2` AND `magic-vet-v3` —
     direct proof the cache bump worked: the new SW installed its own cache alongside the stale
     one instead of silently serving the old shell forever. That is the exact failure the last
     run hit, and the reason for field-guide lesson 9.
  9. measured rendered contrast on the LIVE home screen: 8/8 pass (greeting 9.88, app title 7.92
     against a 3.0 large-text minimum, card title 13.80, card subtitle 8.50, lock note 8.50,
     primary button 7.62, active nav 7.42, inactive nav 9.25).
 10. profile safety: `git diff 563dd41..HEAD -- api/ lib/ data/` is EMPTY, and no API call was
     made at any point during verification. Verification touched only #/home (static markup, no
     fetch) and an offline scratchpad harness. `GET /api/profile` was deliberately avoided
     because it calls saveProfile() on a null profile — a read that writes.
 11. 146/146 tests green and the contrast gate exits 0 at the deployed commit.

RUN CLOSED
  files changed in the entire run (11): docs/visual-design.md · public/icons/icon.svg ·
  public/index.html · public/manifest.webmanifest · public/styles.css · public/sw.js ·
  public/views/placement.js · public/views/reader.js · public/views/words.js ·
  scripts/check-contrast.mjs · tests/shell.test.js
  steps accepted: 7 · first-try validation passes: 6/7
  escalations up the model ladder: 0 (no step ever needed a stronger model)
  interventions: 2 — BOTH were orchestrator spec defects, neither was a worker mistake
  audits: 7/7 match, all CONFIDENCE high
  total subagent tokens: 654963 (planner 121483 + reviewer/auditors 256387 + workers 277333);
    dollar cost unavailable — the harness does not expose a per-subagent cost readout here.
  orchestrator_context: unavailable (no /context readout accessible from inside the run)
  field_guide: 40/40

  HONESTY CLAUSE — did the machinery earn its keep? Yes, and the evidence is specific:
  · The plan reviewer (66k tokens, before any code was written) caught 5 defects, two of which
    would have let a broken step report a false PASS: `npm test | tail` masking npm's exit code,
    and a leftover-colour regex blind to bare `color: white;`.
  · The fresh Phase-2 planner caught that `<button>` does not inherit `color` — three answer
    buttons would have shipped as black-on-dark-brown at ~1.9:1, on the controls the child taps
    to answer. The contrast gate was structurally incapable of seeing it, because the offending
    colour comes from the browser and exists in no file.
  · The executor escalation rule fired twice, both times on MY bad specs, and both times the
    cheap model stopped and asked instead of quietly editing outside its boundary or bending
    geometry to satisfy a wrong constant. One of those stops surfaced the entirely unplanned
    fact that the app icon still carried the whole old palette.
  · The orchestrator's own tamper test proved the accessibility gate actually fails when the
    palette is broken, and Chrome's rendered color-mix values matched the gate's arithmetic to
    two decimals — so the gate is faithful to what ships, not merely self-consistent.
  Counted honestly, three of the four highest-value findings in this run came from an agent
  OTHER than the one doing the work.
