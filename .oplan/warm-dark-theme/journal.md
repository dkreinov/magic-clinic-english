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
