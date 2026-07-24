# Plan — run `warm-dark-theme`

Base commit: `563dd41` (delight-pass RUN CLOSED). Test baseline: 146 pass / 0 fail.
Owner brief: re-theme the ENTIRE app to the deep warm palette of the generated artwork so the
app and its images read as one world. Colors/surfaces/styling ONLY.

Revision: v2 — incorporates all findings from the fresh plan review (2026-07-24).

## Goal

Today the UI sits on cream `#faf7f2` while every `public/assets/*.webp` has a deep warm/golden
background baked in, so each illustration reads as a dark box on a pale page. Move the WHOLE APP
onto the art's palette (do not touch the images), so the artwork bleeds into the page.

## Non-goals (run-wide)

- NO logic changes. No changes to any function body, event handler, route, fetch, or data shape.
- NO copy/text changes. Every Hebrew and English string stays byte-identical.
- No new dependencies. No refactoring. No file moves. No image regeneration or editing.
- No changes to `public/assets/*`, `assets/*`, `api/*`, `lib/*`, `data/*`, `public/app.js`,
  `public/views/home.js`, or `scripts/*` (except the ONE new file created in step 1.2).
- No changes to `tests/*` except the single sw-cache-version string in Phase 3 (pre-authorised by
  delight-pass field-guide lesson 16 + GC-D2-as-amended and by the owner's explicit instruction
  to bump the SW cache version), and the two manifest color assertions ONLY if the owner approves
  OPEN QUESTION 1 at the gate.

## Frozen contracts

### WDT-1 — the palette tokens (art-derived; this is the new frozen contract)

Every value below is either sampled from `public/assets/*.webp` or a hue-preserving lightening of
a sampled value (method + evidence in `journal.md` "PALETTE DERIVATION" and in the SAMPLING
EVIDENCE block of step 1.3). `:root` in `public/styles.css` must define exactly:

```css
:root {
  --color-primary: #c39bf0;
  --color-teal: #4ecec0;
  --color-accent: #f5c563;
  --color-bg: #241305;
  --color-ink: #fdf1d8;
  --radius: 16px;

  --color-primary-ink: #2a1606;
  --color-muted: #d9bc92;
  --color-card: #3a1d08;
  --color-surface-2: #4d2a0e;
  --color-border: #a35d22;
  --color-nav: #2e1806;
  --color-danger: #ef9a7d;
  --color-glow: #fde3a2;
  --shadow-soft: 0 0 0 1px rgba(253, 227, 162, 0.10), 0 4px 14px rgba(0, 0, 0, 0.45);
  --nav-height: 68px;
  --transition-fast: 150ms ease;
}
```

The six names `--color-primary --color-teal --color-accent --color-bg --color-ink --radius`
must stay defined (frozen by `tests/shell.test.js`). Token NAMES already in use
(`--color-primary-ink --color-muted --color-card --shadow-soft --nav-height
--transition-fast`) must keep their names — the view stylesheets reference them.

### WDT-2 — accessibility gate

Every text/background pair must meet WCAG AA: >= 4.5:1 for body text, >= 3:1 for large text
(>= 1.5rem, or >= 1.2rem bold). Non-text UI boundaries (borders that identify a control) must
meet 3:1 per WCAG 1.4.11. Enforced mechanically by `node scripts/check-contrast.mjs`, which must
exit 0. This is a HARD gate on every phase.

### WDT-5 — tint recipe (frozen NOW so Phase 2 has nothing left to decide)

Every translucent tint in the app is a `color-mix` into `var(--color-card)` — never into `white`
and never into `black`. The percentages are frozen here and the contrast gate in step 1.2 checks
them:

| Where | Expression |
|---|---|
| card icon plate (`.card-icon`) | `color-mix(in srgb, var(--color-primary) 18%, var(--color-card))` |
| locked card icon plate | `color-mix(in srgb, var(--color-muted) 15%, var(--color-card))` |
| selected option (placement) | `color-mix(in srgb, var(--color-primary) 14%, var(--color-card))` |
| correct option (reader) | `color-mix(in srgb, var(--color-teal) 16%, var(--color-card))` |
| wrong option (reader) | `color-mix(in srgb, var(--color-danger) 16%, var(--color-card))` |
| tapped word highlight (reader) | `color-mix(in srgb, var(--color-accent) 28%, var(--color-card))` |
| "known" word badge background | `color-mix(in srgb, var(--color-teal) 18%, var(--color-card))` |
| "learning" word badge background | `color-mix(in srgb, var(--color-accent) 18%, var(--color-card))` |
| reader spinner track | `color-mix(in srgb, var(--color-primary) 25%, var(--color-card))` |
| reader popup grabber bar (decorative) | `color-mix(in srgb, var(--color-muted) 45%, var(--color-card))` |
| decorative glow blobs (`.illustration::before/::after`) | `color-mix(in srgb, var(--color-glow) 18%, transparent)` / `... 12%, transparent)` |

The "learning" badge's foreground, currently `color-mix(in srgb, var(--color-accent) 70%, black)`,
becomes plain `var(--color-accent)` — darkening toward black is a light-theme idiom.

### WDT-3 — test-frozen values (owner decision required, see OPEN QUESTION 1)

`tests/shell.test.js:28-29` asserts `manifest.background_color === '#faf7f2'` and
`manifest.theme_color === '#7c3aed'`. Those are the PWA splash/chrome colors and are cream and
old-violet. They are NOT touched before the owner gate. Phase 3 handles them.

### WDT-4 — untouched behaviour

Hebrew RTL layout, `dir="rtl"`, `lang="he"`, the PRECACHE list in `public/sw.js`, all routes, all
`data-testid` attributes, and all class names stay exactly as they are. Class names are asserted
by the view tests; renaming one is a test break.

---

## Phase 1 — palette, frozen doc, and the shell preview  → OWNER GATE

Phase 1 delivers the palette applied to the app SHELL (`public/styles.css`), which is everything
the HOME screen renders. That is the preview the owner approves before the per-view stylesheets
are touched in Phase 2.

### Step 1.1 — re-theme `public/styles.css` to the WDT-1 tokens

- **Tier:** WORKER (Sonnet)
- **Files it may touch:** `public/styles.css` — and nothing else.
- **Goal:** replace the `:root` block with WDT-1 verbatim, then rewrite every hard-coded
  light-theme color in the rest of the file per the rule tables below. Structure, selectors,
  property order, spacing, radii, sizes, animations and comments stay as they are — only color,
  background, shadow, border and mask declarations change.

**Rule table A — every hard-coded light color in the file. Apply exactly these:**

| Current declaration (exists verbatim in the file) | Replace with |
|---|---|
| the whole `:root { ... }` block, lines 1–15 | the WDT-1 block verbatim |
| `background: linear-gradient(180deg, #fdfbf7 0%, var(--color-bg) 240px);` (in `body`) | `background: linear-gradient(180deg, #3d2109 0%, var(--color-bg) 340px);` |
| `background: color-mix(in srgb, var(--color-primary) 12%, white);` (in `.card-icon`) | `background: color-mix(in srgb, var(--color-primary) 18%, var(--color-card));` |
| `background: color-mix(in srgb, var(--color-muted) 15%, white);` (in `.card--locked .card-icon`) | `background: color-mix(in srgb, var(--color-muted) 15%, var(--color-card));` |
| `box-shadow: 0 4px 12px rgba(124, 58, 237, 0.28);` (in `.btn-primary:hover`) | `box-shadow: 0 4px 16px rgba(195, 155, 240, 0.30);` |
| `background: #e5e7eb;` (in `.btn[disabled]`) | `background: var(--color-surface-2);` |
| `color: var(--color-muted);` (in `.btn[disabled]`, the line right after the one above) | `color: color-mix(in srgb, var(--color-muted) 70%, var(--color-surface-2));` |
| `color: white;` (in `.intro-step-number`) | `color: var(--color-primary-ink);` |
| the two-line `background: linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 20%, white), color-mix(in srgb, var(--color-accent) 25%, white));` (in `.illustration`) | `background: linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 28%, var(--color-card)), color-mix(in srgb, var(--color-accent) 32%, var(--color-card)));` (keep it multi-line if it was multi-line) |
| `background: rgba(255, 255, 255, 0.5);` (in the shared `.illustration::before, .illustration::after` rule) | `background: color-mix(in srgb, var(--color-glow) 18%, transparent);` |
| `background: rgba(255, 255, 255, 0.35);` (in `.illustration::after`) | `background: color-mix(in srgb, var(--color-glow) 12%, transparent);` |
| `background: white;` (in `.bottom-nav`) | `background: var(--color-nav);` |
| `box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);` (in `.bottom-nav`) | `box-shadow: 0 -1px 0 rgba(253, 227, 162, 0.10), 0 -2px 14px rgba(0, 0, 0, 0.5);` |

`.card`, `.intro-step`, and every other rule already reads its colors from tokens
(`var(--color-card)`, `var(--shadow-soft)`, `var(--color-muted)`, …) — those need NO edit; the
new tokens re-theme them automatically, and the faint warm rim on cards comes from the ring
inside the new `--shadow-soft`.

**Rule table B — artwork blend (the "images stop sitting in boxes" requirement):**

| Selector | Change |
|---|---|
| `.hero-banner, .chapter-banner, .celebrate-image` (one shared rule) | replace `box-shadow: var(--shadow-soft);` with `box-shadow: none;`, then append these two declarations to the same rule: `-webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);` and `mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);` |
| `.spot-image` | replace `box-shadow: var(--shadow-soft);` with `box-shadow: none;`, change `border-radius: var(--radius);` to `border-radius: 50%;`, then append `-webkit-mask-image: radial-gradient(circle at 50% 50%, #000 60%, transparent 100%);` and `mask-image: radial-gradient(circle at 50% 50%, #000 60%, transparent 100%);` |

**Boundary / non-goals for this step:** do not add, remove, rename or reorder any selector. Do
not change any non-color property except the two `border-radius`/`box-shadow`/`mask-image`
changes named in table B. Do not touch any other file. Do not touch tests. If a declaration is
not named in the tables above and contains no hard-coded light color, leave it alone. When you
are done, the string `white` must not appear anywhere in `public/styles.css`.

- **Validation (frozen):**
  ```
  cd C:/Users/dkreinov/claude/english-app && set -o pipefail && npm test 2>&1 | tail -8 \
    && ! grep -niE '(white|#fff\b|#ffffff|#e5e7eb|#fdfbf7|#faf7f2|#7c3aed|#1f2937|#6b7280)' public/styles.css \
    && grep -qF -- '--color-surface-2: #4d2a0e' public/styles.css \
    && grep -qF -- 'mask-image: radial-gradient' public/styles.css \
    && echo STEP-1.1-OK
  ```
  Pass = the tail shows `# pass 146` / `# fail 0`, and the final line is `STEP-1.1-OK`.
  (`set -o pipefail` makes a test failure break the `&&` chain; the leading `!` on the grep turns
  "no light-theme leftovers found" into success.)
- **Budget:** 2 retries.

### Step 1.2 — add the mechanical contrast gate `scripts/check-contrast.mjs`

- **Tier:** WORKER (Sonnet)
- **Files it may touch:** `scripts/check-contrast.mjs` (NEW) — and nothing else.
- **Goal:** a zero-dependency Node ESM script (`node:fs` only) that:
  1. reads `public/styles.css`, extracts the `:root { ... }` block, and parses it into a map of
     token name → hex value. Values must come from the FILE — never hard-code a hex in the
     script, so the gate keeps working when the palette moves.
  2. supports one derived form, written in the PAIRS table below as `mix(TOKEN, N)`, meaning
     `color-mix(in srgb, var(--TOKEN) N%, var(--color-card))` — i.e. sRGB linear interpolation
     `N%` of TOKEN into `--color-card`.
  3. computes WCAG 2.1 contrast: relative luminance with the sRGB transfer function
     (`c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`, weights 0.2126/0.7152/0.0722), ratio
     `(Lmax + 0.05) / (Lmin + 0.05)`.
  4. prints exactly one line per pair: `PASS`/`FAIL`, the ratio to 2 decimals, the minimum, and
     the label.
  5. prints `ALL PASS` as its last line and exits 0 when every pair passes; otherwise prints
     `<N> FAILURES` as its last line and exits 1.

  **PAIRS table — check exactly these 28 pairs, in this order.** `mix(X, N)` is defined in (2).

  | # | foreground | background | min | label |
  |---|---|---|---|---|
  | 1 | `--color-ink` | `--color-bg` | 4.5 | body text on page |
  | 2 | `--color-ink` | `--color-card` | 4.5 | body text on card |
  | 3 | `--color-ink` | `--color-surface-2` | 4.5 | body text on raised surface |
  | 4 | `--color-muted` | `--color-bg` | 4.5 | muted text on page |
  | 5 | `--color-muted` | `--color-card` | 4.5 | muted text on card |
  | 6 | `--color-muted` | `--color-nav` | 4.5 | nav label on nav bar |
  | 7 | `--color-muted` | `--color-surface-2` | 4.5 | muted text on raised surface |
  | 8 | `--color-primary` | `--color-bg` | 3 | app title 1.6rem/700 on page (large text) |
  | 9 | `--color-primary` | `--color-nav` | 4.5 | active nav tab label on nav bar |
  | 10 | `--color-primary` | `--color-card` | 4.5 | primary text/icon on card |
  | 11 | `--color-primary-ink` | `--color-primary` | 4.5 | primary button label |
  | 12 | `--color-teal` | `--color-card` | 4.5 | teal text on card |
  | 13 | `--color-teal` | `--color-bg` | 4.5 | teal text on page |
  | 14 | `--color-primary-ink` | `--color-teal` | 4.5 | play-button label |
  | 15 | `--color-accent` | `--color-card` | 4.5 | amber text on card |
  | 16 | `--color-primary-ink` | `--color-accent` | 4.5 | amber badge label |
  | 17 | `--color-danger` | `--color-card` | 4.5 | error text on card |
  | 18 | `--color-danger` | `--color-bg` | 4.5 | error text on page |
  | 19 | `--color-primary` | `mix(--color-primary, 18)` | 4.5 | card icon on its plate |
  | 20 | `--color-muted` | `mix(--color-muted, 15)` | 4.5 | locked card icon on its plate |
  | 21 | `--color-ink` | `mix(--color-primary, 14)` | 4.5 | label on selected option |
  | 22 | `--color-ink` | `mix(--color-teal, 16)` | 4.5 | label on correct option |
  | 23 | `--color-ink` | `mix(--color-danger, 16)` | 4.5 | label on wrong option |
  | 24 | `--color-ink` | `mix(--color-accent, 28)` | 4.5 | tapped word highlight |
  | 25 | `--color-teal` | `mix(--color-teal, 18)` | 4.5 | "known" word badge |
  | 26 | `--color-accent` | `mix(--color-accent, 18)` | 4.5 | "learning" word badge |
  | 27 | `--color-border` | `--color-card` | 3 | control border on card (WCAG 1.4.11) |
  | 28 | `--color-border` | `--color-bg` | 3 | control border on page (WCAG 1.4.11) |

  Pairs 19–26 describe tints that Phase 2 will introduce into the view stylesheets; their
  percentages are frozen in contract WDT-5 above, so the gate is written once and holds for the
  whole run. The gate reads only `public/styles.css`, so it is runnable the moment step 1.1 is in.
- **Boundary / non-goals:** do NOT modify `public/styles.css` — if a pair fails, STOP and report
  which pair and what ratio. Do not add dependencies. Do not add a test file. Do not touch any
  other file.
- **Validation (frozen):**
  ```
  cd C:/Users/dkreinov/claude/english-app && node scripts/check-contrast.mjs; echo "EXIT=$?"
  ```
  Pass = at least 28 `PASS` lines, no `FAIL` line, the last output line before `EXIT=` is
  `ALL PASS`, and `EXIT=0`.
- **Budget:** 2 retries.

### Step 1.3 — amend `docs/visual-design.md` with the new frozen palette

- **Tier:** WORKER (Sonnet)
- **Files it may touch:** `docs/visual-design.md` — and nothing else.
- **Goal:** amend §3 so the dark-warm palette is the frozen contract and the cream values are
  recorded as superseded. Specifically, and only:

  1. Change the §3 heading line to `## 3. Color palette (tokens to artwork) — AMENDED 2026-07-24`.
  2. Directly under the heading, add a paragraph beginning
     `**Amendment (warm-dark re-theme, 2026-07-24):**` stating that the app moved off the light
     cream surface onto the artwork's own deep warm palette so the illustrations bleed into the
     page instead of sitting as dark boxes on a pale ground, and that every value below was
     sampled from `public/assets/*.webp` (or lightened along a sampled hue to clear the
     accessibility gate).
  3. **Delete BOTH existing tables in §3** — the six-row main table AND the "Additive tokens"
     table with its introductory sentence — and replace them with ONE table of all 17 WDT-1
     tokens in the order they appear in the WDT-1 block, with columns
     `Token | Value | Role | Sampled from`. Every row's `Sampled from` cell must come from the
     SAMPLING EVIDENCE block below; do not invent provenance for any token.
  4. Add a `### Superseded (light-cream era, pre-2026-07-24)` subsection introduced by the
     sentence `These values are SUPERSEDED and must not be reintroduced.` followed by a
     `Token | Old value` table listing: `--color-primary #7c3aed`, `--color-teal #0d9488`,
     `--color-accent #f59e0b`, `--color-bg #faf7f2`, `--color-ink #1f2937`,
     `--color-primary-ink #ffffff`, `--color-muted #6b7280`, `--color-card #ffffff`,
     `--shadow-soft 0 2px 8px rgba(0, 0, 0, 0.08)`.
  5. Replace the `**GC-D1 rule:**` paragraph with a `**GC-D1 rule (amended):**` paragraph that
     keeps the "the six token names must stay defined in `public/styles.css`" requirement, and
     states that `#7c3aed` and `#faf7f2` are no longer CSS values — they survive only as the PWA
     splash/chrome colors in `public/manifest.webmanifest`, which `tests/shell.test.js` asserts.
  6. Add a `### Accessibility gate` subsection at the end of §3 stating the WDT-2 rule verbatim
     (AA: >= 4.5:1 body text, >= 3:1 large text, >= 3:1 non-text control borders) and that
     `node scripts/check-contrast.mjs` enforces it mechanically and must exit 0.
  7. In §8 under **DON'T:**, replace the bullet `- Change the test-frozen token values.` with
     `- Reintroduce the superseded light-cream values (§3), or ship a text/background pair that
       fails the §3 accessibility gate.`

  **SAMPLING EVIDENCE — the only provenance you may cite. Method: all 8 `public/assets/*.webp`
  resized to a common grid and quantised; percentages are share of all sampled pixels.**

  | Token | Value | Evidence |
  |---|---|---|
  | `--color-bg` | `#241305` | between the darkest-2%-of-pixels band (`#0a0903`–`#2e1207` across the 8 assets) and the `#281605` bucket (1.94%) |
  | `--color-card` | `#3a1d08` | the single most populous color bucket across all 8 assets, `#381704` (3.07%) |
  | `--color-nav` | `#2e1806` | midpoint of the two dominant field buckets `#281605` and `#381704` |
  | `--color-surface-2` | `#4d2a0e` | the `#482507` bucket (1.76%) |
  | `--color-border` | `#a35d22` | mean of the art's mid warm surface band `#6c340c`, lightened along its own hue to clear the 3:1 non-text gate |
  | `--color-ink` | `#fdf1d8` | the brightest-0.5% "glow" means, `#fcefd0` (heroine) and `#fdf8d9` (words-treasure) |
  | `--color-glow` | `#fde3a2` | the brightest-0.5% glow of `celebration.webp`; the range across assets is `#fde3a2`–`#fef3a1` |
  | `--color-muted` | `#d9bc92` | mean of the art's soft warm tan pixels `#c0a57b`, lightened along its own hue to clear AA on the card surface |
  | `--color-primary-ink` | `#2a1606` | the darkest-2% band of the square assets (`#240e0d`, `#2e1207`) |
  | `--color-accent` | `#f5c563` | mean saturated gold highlight `#eec65a` (mean saturated amber overall is `#da903a`), lightened to clear AA on the new surfaces |
  | `--color-teal` | `#4ecec0` | mean saturated teal `#2db1a2`, lightened along its own hue to clear AA on the new surfaces |
  | `--color-primary` | `#c39bf0` | mean saturated violet `#7d35b5`, lightened along its own hue to clear AA on the new surfaces |
  | `--color-danger` | `#ef9a7d` | mean saturated warm-red/terracotta `#b05525`, lightened along its own hue to clear AA and stay distinct from the amber accent |
  | `--radius`, `--nav-height`, `--transition-fast` | unchanged | not colors — carried over unchanged from the light-cream era |
  | `--shadow-soft` | see WDT-1 | rebuilt for a dark ground: a 10%-opacity glow-colored 1px ring (`#fde3a2`) plus a deeper black drop shadow, because the old light-theme shadow is invisible on a dark surface |

- **Boundary / non-goals:** do not edit §1, §2, §4, §5, §6, §7, or the §8 **DO:** list. Do not
  change the FROZEN STYLE SUFFIX, the asset inventory, or any generation prompt. Do not change
  the document's `Status: FROZEN` header. No other file.
- **Validation (frozen):**
  ```
  cd C:/Users/dkreinov/claude/english-app && set -o pipefail && npm test 2>&1 | tail -4 \
    && grep -qF -- '#c39bf0' docs/visual-design.md \
    && grep -qF -- '#241305' docs/visual-design.md \
    && grep -qF -- '#fdf1d8' docs/visual-design.md \
    && grep -qF -- '#a35d22' docs/visual-design.md \
    && grep -qF -- 'SUPERSEDED' docs/visual-design.md \
    && grep -qF -- 'check-contrast.mjs' docs/visual-design.md \
    && grep -qF -- 'AMENDED 2026-07-24' docs/visual-design.md \
    && grep -qF -- 'FROZEN STYLE SUFFIX' docs/visual-design.md \
    && grep -qF -- 'hero-clinic.png' docs/visual-design.md \
    && ! grep -qF -- 'Additive tokens' docs/visual-design.md \
    && echo STEP-1.3-OK
  ```
  Pass = `# fail 0` in the tail and the final line is `STEP-1.3-OK`.
- **Budget:** 2 retries.

### Step 1.4 — orchestrator preview (not dispatched to an executor)

The orchestrator serves `public/` locally, loads `#/home` in Chrome at a 390×844 phone viewport,
screenshots it, and confirms no cream surface is visible and the hero art blends into the page.
This never touches production and never touches the learner profile (the home view is static
markup — it makes no API call).

### Phase 1 acceptance criteria (frozen before any execution)

1. `npm test` reports `# pass 146` / `# fail 0`.
2. `node scripts/check-contrast.mjs` exits 0 and its last line is `ALL PASS`.
3. `grep -niE '(white|#fff\b|#ffffff|#e5e7eb|#fdfbf7|#faf7f2|#7c3aed|#1f2937|#6b7280)'
   public/styles.css` finds nothing.
4. `git diff --name-only 563dd41` lists exactly `public/styles.css`,
   `scripts/check-contrast.mjs`, `docs/visual-design.md`, and files under `.oplan/warm-dark-theme/`.
5. Styling-only proof: every added/removed line in `git diff 563dd41 -- public/styles.css`
   either contains one of `color`, `background`, `shadow`, `border`, `mask`, `--` or is blank /
   a lone brace. Command:
   `git diff 563dd41 -- public/styles.css | grep -E '^[+-]' | grep -v '^[+-][+-][+-]' | grep -viE '(color|background|shadow|border|mask|--)' | grep -vE '^[+-]\s*[{}]?\s*$'`
   must print nothing.
6. `git diff 563dd41 -- public/index.html public/app.js public/views/ public/manifest.webmanifest
   public/sw.js tests/` is empty — nothing outside the three planned files moved.
7. A screenshot of `#/home` at 390×844 shows a deep warm background, the hero art blending into
   the page, and no cream/white panel anywhere.

**Then: OWNER GATE. Stop, show the palette + screenshot, and ask the two open questions below.**

---

## OPEN QUESTIONS FOR THE OWNER (raised at the Phase 1 gate)

1. **Test-frozen manifest colors (WDT-3).** `tests/shell.test.js:28-29` asserts
   `background_color === '#faf7f2'` and `theme_color === '#7c3aed'`. `background_color` is what
   Android/iOS paints behind the app while it launches — leaving it cream means a white flash
   before the dark app appears. Changing it is a real contract change and needs an explicit OK,
   per the brief. Recommendation: `background_color` → `#241305`, `theme_color` → `#2e1806`, with
   the two assertions updated to match.
2. **Palette approval** — the WDT-1 values, and the artwork-blend treatment (banners fade out at
   the bottom, square spot art becomes a soft-edged circle).

---

## Phase 2 — the three per-view stylesheets  (skeleton)

Re-theme the `VIEW_STYLE` template literal in `public/views/placement.js`,
`public/views/reader.js`, `public/views/words.js` — one step per file, per contract WDT-5:
`color-mix(..., white)` → the WDT-5 mixes; `color: white` → `var(--color-primary-ink)`;
`#dc2626` → `var(--color-danger)`; `color-mix(..., black)` on the learning badge →
`var(--color-accent)`; `background: rgba(0, 0, 0, 0.35)` overlay deepened; `border: 2px solid
transparent` resting borders given `var(--color-border)`; `.reader-question-option`'s
`background: var(--color-bg)` → `var(--color-surface-2)` so options read as raised on a card.
Same validation shape: `npm test` (146) + the contrast gate + a grep proving no `white`/`black`
mix and no `#dc2626` remain in the three files.

## Phase 3 — PWA chrome + service-worker cache  (skeleton)

`public/index.html` `<meta name="theme-color">`; `public/manifest.webmanifest` and its two
assertions in `tests/shell.test.js` (ONLY if the owner approved question 1); the `CACHE` version
bump in `public/sw.js` (`magic-vet-v2` → `magic-vet-v3`) plus its assertion string in
`tests/shell.test.js`. The PRECACHE list stays frozen.

## Phase 4 — deploy and live verification  (skeleton)

Deploy to the existing Vercel project, hard-reload the live URL, screenshot home / placement
intro / words on a phone viewport, confirm the SW served the new shell (cache name `magic-vet-v3`),
and confirm by READ-ONLY inspection that the learner profile is untouched (placement not started,
word bank empty).
