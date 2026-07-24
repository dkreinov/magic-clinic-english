# Phase 2 — detailed step specs

Part of the frozen plan for run `warm-dark-theme`. Referenced from `plan.md` § "Phase 2".
Drafted by a fresh next-phase planner from the written record only; reviewed and ruled on by the
orchestrator (see `plan.md` § "Orchestrator rulings"). Baseline commit: **`ee87ab8`**.
Test baseline: 146 pass / 0 fail. Contrast gate: `ALL PASS`, exit 0.

## Facts established at planning time (so no step has to rediscover them)

- **No test asserts any CSS string in these three files.** `tests/placement-ui.test.js`,
  `tests/reader-ui.test.js` and `tests/words-ui.test.js` assert only that `node --check` parses
  the file, that it exports a `render` function, a list of frozen Hebrew strings, and
  endpoint/action/`dir="ltr"` substrings. `tests/shell.test.js` freezes the six token names in
  `public/styles.css`, the two manifest colors, the `magic-vet-v2` string, and the PRECACHE list —
  none of which Phase 2 touches. Re-theming the three `VIEW_STYLE` blocks is therefore not a test
  break.
- **The complete set of light-theme declarations in the three files is 19 lines**, found with
  `grep -nEi 'white|black|transparent|#[0-9a-f]{3,8}|rgba?\(' public/views/{placement,reader,words}.js`.
  Every one is covered by a rule row below. `public/views/home.js` matches that regex zero times
  and is out of scope.
- **WDT-6 applies here:** `.placement-option-btn`, `.placement-question-option` and
  `.reader-question-option` declare no `color`, so Phase 2 ADDS `color: var(--color-ink);` to
  each. This is the one place Phase 2 adds declarations rather than replacing them.

## Phase-2 non-goals (apply to every step)

- No logic changes: no function body, event handler, endpoint, `data-action`, `data-testid`,
  `data-choice`, `data-q`, `data-word`, `dir`, class name, or Hebrew/English string may change.
- No changes outside the one file named in the step, and inside it, no change outside the
  `VIEW_STYLE` template literal.
- Do not reorder, rename, add or delete any selector. Do not reformat, re-indent or reflow.
  Every line not named in the step's rule table stays byte-identical.
- Do not change any non-color property (sizes, radii, padding, gaps, `min-height`, `font-size`,
  `font-weight`, `transition`, `animation`, `z-index`, `cursor`, `text-align`). Border *width*
  stays `2px`/`4px`; only the border *color* changes.
- Do not touch `tests/`, `scripts/`, `public/styles.css`, `public/views/home.js`,
  `public/index.html`, `public/manifest.webmanifest`, `public/sw.js`, `docs/`, `api/`, `lib/`,
  `data/`, `public/assets/`.
- Do not bump the service-worker `CACHE` version here. These three files are precached shell
  files (field-guide lesson 9), but the `magic-vet-v2` → `magic-vet-v3` bump plus its
  `tests/shell.test.js` assertion is **Phase 3's** job, and Phase 3 runs before any deploy.
- The CSS lives inside a JavaScript backtick template literal. Do not add `${...}`, do not escape
  anything, do not convert it to string concatenation.

---

## Step 2.1 — re-theme `public/views/placement.js`

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/views/placement.js` — and nothing else.

**Goal.** Inside the `VIEW_STYLE` template literal, replace the five light-theme rules below.
`color: white` becomes the on-primary ink token; the two `color-mix(..., white)` selection tints
become the frozen WDT-5 mix into `var(--color-card)` at 14%; the two `border: 2px solid
transparent` resting states get `var(--color-border)`; and the two option buttons gain an explicit
`color: var(--color-ink);` per WDT-6, because `<button>` does not inherit `color`.

**Rule table — the ONLY five rules that change. Replace each CURRENT block with its REPLACEMENT
block verbatim, preserving indentation (2 spaces before the selector, 4 before each declaration).**

**(1) `.placement-play-btn`** — only `color: white;` → `color: var(--color-primary-ink);`

CURRENT:
```
    background: var(--color-teal);
    color: white;
    font-size: 1.1rem;
```
REPLACEMENT:
```
    background: var(--color-teal);
    color: var(--color-primary-ink);
    font-size: 1.1rem;
```

**(2) `.placement-option-btn`** — border color changed, one new `color` line after `box-shadow`

CURRENT:
```
  .placement-option-btn {
    min-height: 76px;
    border-radius: var(--radius);
    border: 2px solid transparent;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    font-size: 2rem;
```
REPLACEMENT:
```
  .placement-option-btn {
    min-height: 76px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 2rem;
```

**(3) `.placement-option-btn.selected`**

CURRENT:
```
  .placement-option-btn.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 10%, white);
  }
```
REPLACEMENT:
```
  .placement-option-btn.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 14%, var(--color-card));
  }
```

**(4) `.placement-question-option`** — border color changed, one new `color` line after `box-shadow`

CURRENT:
```
  .placement-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid transparent;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    font-size: 0.98rem;
```
REPLACEMENT:
```
  .placement-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 0.98rem;
```

**(5) `.placement-question-option.selected`**

CURRENT:
```
  .placement-question-option.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 10%, white);
  }
```
REPLACEMENT:
```
  .placement-question-option.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 14%, var(--color-card));
  }
```

**Rules that must NOT change** (they already read from tokens): `.placement-progress`,
`.placement-instruction`, `.placement-play-btn:active`, `.placement-emoji-big`,
`.placement-option-grid`, `.placement-option-grid.words`, `.placement-option-btn:active`,
`.placement-option-btn.word` (keep its existing `color: var(--color-ink);` — now redundant, but
removing it is out of scope), `.placement-text-card`, `.placement-text-title`,
`.placement-text-body`, `.placement-question`, `.placement-question-prompt`,
`.placement-question-options`, `.placement-question-option:active`, `.placement-actions`,
`.placement-secondary-btn`.

**Frozen contracts this step needs.** WDT-5: *selected option (placement)* =
`color-mix(in srgb, var(--color-primary) 14%, var(--color-card))` — exactly 14%, not the old 10%.
WDT-6: add `color: var(--color-ink);` to the two option-button rules. WDT-2: the contrast gate
must exit 0 (pair 21 gates ink on `mix(--color-primary, 14)` at 10.70:1; pair 27 gates
`--color-border` on `--color-card` at 3.05:1). WDT-4: RTL, class names and `data-*` unchanged.

**Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -8 \
  && [ "$(node scripts/check-contrast.mjs | tail -1)" = 'ALL PASS' ] \
  && ! grep -nEi 'white|black|transparent|#[0-9a-f]{3,8}|rgba?\(' public/views/placement.js \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-primary) 14%, var(--color-card))' public/views/placement.js)" = "2" ] \
  && [ "$(grep -cF -- 'border: 2px solid var(--color-border);' public/views/placement.js)" = "2" ] \
  && [ "$(grep -cF -- 'color: var(--color-primary-ink);' public/views/placement.js)" = "1" ] \
  && [ "$(grep -cF -- 'color: var(--color-ink);' public/views/placement.js)" = "3" ] \
  && [ "$(git diff HEAD --name-only -- public tests scripts docs api lib data)" = "public/views/placement.js" ] \
  && [ -z "$(git diff HEAD -- public/views/placement.js | grep -E '^[+-]' | grep -v '^[+-][+-][+-]' | grep -viE '(color|background|border|shadow)' | grep -vE '^[+-][[:space:]]*[{}]?[[:space:]]*$')" ] \
  && echo STEP-2.1-OK
```
Pass = `# pass 146` / `# fail 0` in the tail AND final line `STEP-2.1-OK`.

---

## Step 2.2 — re-theme `public/views/reader.js`

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/views/reader.js` — and nothing else.

**Goal.** Inside the `VIEW_STYLE` template literal, replace the nine light-theme rules below.
Every `color-mix(..., white)` becomes the frozen WDT-5 mix into `var(--color-card)` at the frozen
percentage; the hard-coded `#dc2626` in three places becomes `var(--color-danger)`; the two
`border: 2px solid transparent` resting states get `var(--color-border)`;
`.reader-question-option`'s `background: var(--color-bg)` becomes `var(--color-surface-2)` so
answer options read as raised on the card instead of punching a hole through it, and it gains
`color: var(--color-ink);` per WDT-6; and the modal scrim deepens from 35% to 60% black.

**(1) tapped word highlight** — CURRENT:
```
    background: color-mix(in srgb, var(--color-accent) 25%, white);
```
REPLACEMENT:
```
    background: color-mix(in srgb, var(--color-accent) 28%, var(--color-card));
```

**(2) `.reader-onboard-input`** — only the border line changes. CURRENT:
```
    border: 2px solid transparent;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    padding: 0 16px;
```
REPLACEMENT:
```
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    padding: 0 16px;
```

**(3) `.reader-spinner`** — border WIDTH stays 4px; only the color changes, 20% → 25%. CURRENT:
```
    border: 4px solid color-mix(in srgb, var(--color-primary) 20%, white);
```
REPLACEMENT:
```
    border: 4px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-card));
```

**(4) `.reader-question-option`** — border color, background, and one new `color` line. CURRENT:
```
  .reader-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid transparent;
    background: var(--color-bg);
    box-shadow: var(--shadow-soft);
    font-size: 0.98rem;
```
REPLACEMENT:
```
  .reader-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-surface-2);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 0.98rem;
```

**(5) `.reader-question-option.correct`** — CURRENT:
```
    background: color-mix(in srgb, var(--color-teal) 12%, white);
```
REPLACEMENT:
```
    background: color-mix(in srgb, var(--color-teal) 16%, var(--color-card));
```

**(6) `.reader-question-option.wrong`** — CURRENT:
```
  .reader-question-option.wrong {
    border-color: #dc2626;
    background: color-mix(in srgb, #dc2626 10%, white);
  }
```
REPLACEMENT:
```
  .reader-question-option.wrong {
    border-color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 16%, var(--color-card));
  }
```

**(7) `.reader-question-feedback.bad`** — CURRENT:
```
  .reader-question-feedback.bad {
    color: #dc2626;
  }
```
REPLACEMENT:
```
  .reader-question-feedback.bad {
    color: var(--color-danger);
  }
```

**(8) `.reader-overlay`** — only the alpha changes; this scrim stays pure black (it is a modal
dim, not a WDT-5 tint), because a 35% dim is nearly invisible over the new dark page. CURRENT:
```
    background: rgba(0, 0, 0, 0.35);
```
REPLACEMENT:
```
    background: rgba(0, 0, 0, 0.6);
```

**(9) `.reader-popup::before`** (decorative grabber bar) — CURRENT:
```
    background: color-mix(in srgb, var(--color-muted) 40%, white);
```
REPLACEMENT:
```
    background: color-mix(in srgb, var(--color-muted) 45%, var(--color-card));
```

**Rules that must NOT change:** `.reader-card-title`, `.reader-chapter-label`, `.reader-text`,
`.reader-text .w`, `.reader-onboard-field`, `.reader-onboard-label`,
`.reader-onboard-input:focus`, `.reader-loading`, `@keyframes reader-spin`,
`.reader-question-card`, `.reader-question-prompt`, `.reader-question-options`,
`.reader-question-option:active`, `.reader-question-option[disabled]`,
`.reader-question-feedback`, `.reader-question-feedback.ok`, `.reader-popup` (both rules),
`.reader-popup-word`, `.reader-popup-he`, `.reader-popup-confirm`, `@keyframes reader-popup-in`.

**Frozen contracts this step needs.** WDT-5 rows, at exactly these percentages: correct option
`var(--color-teal) 16%` · wrong option `var(--color-danger) 16%` · tapped word
`var(--color-accent) 28%` · spinner track `var(--color-primary) 25%` · grabber bar
`var(--color-muted) 45%` · modal scrim `rgba(0, 0, 0, 0.6)`. WDT-6: add `color:
var(--color-ink);` to `.reader-question-option`. WDT-2: gate must exit 0 (pair 3 ink on
`--color-surface-2` 11.34:1; pair 22 ink on `mix(--color-teal, 16)` 10.36:1; pair 23 ink on
`mix(--color-danger, 16)` 10.08:1; pair 17 `--color-danger` on `--color-card` 7.05:1).
`#dc2626` is not a token and must not survive anywhere.

**Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -8 \
  && [ "$(node scripts/check-contrast.mjs | tail -1)" = 'ALL PASS' ] \
  && ! grep -nEi 'white|black|transparent|#[0-9a-f]{3,8}|0\.35' public/views/reader.js \
  && [ "$(grep -cF -- 'border: 2px solid var(--color-border);' public/views/reader.js)" = "2" ] \
  && [ "$(grep -cF -- 'background: var(--color-surface-2);' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color: var(--color-ink);' public/views/reader.js)" = "2" ] \
  && [ "$(grep -cF -- 'var(--color-danger)' public/views/reader.js)" = "3" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-accent) 28%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-primary) 25%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-teal) 16%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-danger) 16%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-muted) 45%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'background: rgba(0, 0, 0, 0.6);' public/views/reader.js)" = "1" ] \
  && [ "$(git diff HEAD --name-only -- public tests scripts docs api lib data)" = "public/views/reader.js" ] \
  && [ -z "$(git diff HEAD -- public/views/reader.js | grep -E '^[+-]' | grep -v '^[+-][+-][+-]' | grep -viE '(color|background|border|shadow)' | grep -vE '^[+-][[:space:]]*[{}]?[[:space:]]*$')" ] \
  && echo STEP-2.2-OK
```
Pass = `# pass 146` / `# fail 0` in the tail AND final line `STEP-2.2-OK`.
Note: the `var(--color-danger)` count is **3**, not 4 — `grep -F` counts matching LINES, and
`border-color: var(--color-danger);` also contains the substring `color: var(--color-danger);`.

---

## Step 2.3 — re-theme `public/views/words.js`

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/views/words.js` — and nothing else.

**Goal.** Inside the `VIEW_STYLE` template literal, replace the two status-badge rules. Both
badge backgrounds become the frozen WDT-5 mix into `var(--color-card)` at 18%, and the "learning"
badge's foreground — currently darkened toward `black`, a light-theme idiom — becomes plain
`var(--color-accent)`. Nothing else in the file changes.

**(1) `.word-badge.known`** — CURRENT:
```
  .word-badge.known {
    background: color-mix(in srgb, var(--color-teal) 15%, white);
    color: var(--color-teal);
  }
```
REPLACEMENT:
```
  .word-badge.known {
    background: color-mix(in srgb, var(--color-teal) 18%, var(--color-card));
    color: var(--color-teal);
  }
```

**(2) `.word-badge.learning`** — note the background goes 20% → **18%** (WDT-5 freezes 18%), and
the foreground `color-mix(..., black)` collapses to the plain token. CURRENT:
```
  .word-badge.learning {
    background: color-mix(in srgb, var(--color-accent) 20%, white);
    color: color-mix(in srgb, var(--color-accent) 70%, black);
  }
```
REPLACEMENT:
```
  .word-badge.learning {
    background: color-mix(in srgb, var(--color-accent) 18%, var(--color-card));
    color: var(--color-accent);
  }
```

**Rules that must NOT change:** `.words-count`, `.words-grid`, `.word-card`, `.word-card-text`,
`.word-card-lemma`, `.word-card-he`, `.word-badge` (the shared base rule).

**Frozen contracts this step needs.** WDT-5: known badge `var(--color-teal) 18%`, learning badge
`var(--color-accent) 18%`, both into `var(--color-card)`; the learning badge's foreground becomes
plain `var(--color-accent)`. WDT-2: gate must exit 0 (pair 25 teal on `mix(--color-teal, 18)`
5.73:1; pair 26 accent on `mix(--color-accent, 18)` 6.23:1). WDT-4: the Hebrew badge labels and
the class names `word-badge` / `known` / `learning` are frozen by `tests/words-ui.test.js`.

**Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -8 \
  && [ "$(node scripts/check-contrast.mjs | tail -1)" = 'ALL PASS' ] \
  && ! grep -nEi 'white|black|transparent|#[0-9a-f]{3,8}|rgba?\(' public/views/words.js \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-teal) 18%, var(--color-card))' public/views/words.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-accent) 18%, var(--color-card))' public/views/words.js)" = "1" ] \
  && [ "$(grep -cF -- 'color: var(--color-accent);' public/views/words.js)" = "1" ] \
  && [ "$(grep -cF -- 'color: var(--color-teal);' public/views/words.js)" = "1" ] \
  && [ "$(git diff HEAD --name-only -- public tests scripts docs api lib data)" = "public/views/words.js" ] \
  && [ -z "$(git diff HEAD -- public/views/words.js | grep -E '^[+-]' | grep -v '^[+-][+-][+-]' | grep -viE '(color|background|border|shadow)' | grep -vE '^[+-][[:space:]]*[{}]?[[:space:]]*$')" ] \
  && echo STEP-2.3-OK
```
Pass = `# pass 146` / `# fail 0` in the tail AND final line `STEP-2.3-OK`.

---

## Step 2.4 — orchestrator visual check (not dispatched to an executor)

Field-guide lesson 13 forbids driving the live app through placement or word-tapping: the learner
profile is real data, and the states this phase re-themes (selected option, correct/wrong option,
word popup, badges, spinner) are only reachable by POSTing to `/api/placement`, `/api/profile` or
`/api/chapter`. So the orchestrator does NOT exercise the app. Instead it builds a throwaway
static harness **in the scratchpad only** (no repo file, no API call): one HTML file that
`<link>`s `public/styles.css`, inlines the three `VIEW_STYLE` literals, and renders dead markup
for every themed state —

- placement: play button, emoji option grid, `.placement-option-btn.selected`,
  `.placement-question-option`, `.placement-question-option.selected`;
- reader: `.reader-onboard-input`, `.reader-spinner`, a plain / `.correct` / `.wrong` /
  `[disabled]` `.reader-question-option`, both `.reader-question-feedback` variants, a
  `.reader-text .w.tapped`, and the `.reader-overlay` + `.reader-popup` sheet;
- words: `.word-card` with a `.word-badge.known` and a `.word-badge.learning`.

Open at a phone viewport and confirm: no cream/white surface anywhere, every label legible (in
particular the option-button labels and the disabled answered options), and the
selected/correct/wrong states still visually distinct from each other and from the resting state.
If served over HTTP rather than `file://`, apply field-guide lesson 14 first.

---

## Phase 2 acceptance criteria (frozen before any execution)

1. `npm test` reports `# pass 146` / `# fail 0`.
2. `node scripts/check-contrast.mjs` exits 0 and its last line is `ALL PASS`.
3. Zero light-theme leftovers across all view stylesheets:
   `grep -nEi 'white|black|transparent|#[0-9a-f]{3,8}' public/views/*.js` finds nothing, and
   `grep -nF -- 'rgba(0, 0, 0, 0.35)' public/views/*.js` finds nothing.
4. Exactly three source files changed since baseline `ee87ab8`:
   `git diff --name-only ee87ab8 -- public tests scripts docs api lib data` prints exactly
   `public/views/placement.js`, `public/views/reader.js`, `public/views/words.js`.
5. Styling-only proof — this prints nothing:
   `git diff ee87ab8 -- public/views/placement.js public/views/reader.js public/views/words.js | grep -E '^[+-]' | grep -v '^[+-][+-][+-]' | grep -viE '(color|background|border|shadow)' | grep -vE '^[+-][[:space:]]*[{}]?[[:space:]]*$'`
6. Nothing outside the three files moved:
   `git diff ee87ab8 -- public/index.html public/app.js public/api.js public/views/home.js public/manifest.webmanifest public/sw.js public/styles.css tests/`
   is empty. In particular the sw `CACHE` string is still `magic-vet-v2` (Phase 3 bumps it).
7. Every WDT-5 percentage belonging to a view stylesheet appears verbatim with the exact expected
   multiplicity, and there are no EXTRA `color-mix` uses beyond the eight frozen ones — the
   `WDT5-OK` command below prints `WDT5-OK`.
8. Every option/answer control declares an explicit foreground (WDT-6) — the `INK-OK` command
   below prints `INK-OK`.
9. The step 2.4 harness shows no cream/white surface in any state of the three views, and all
   option-button labels (including `[disabled]` answered options) are legible.

```
# criterion 7
cd C:/Users/dkreinov/claude/english-app \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-primary) 14%, var(--color-card))' public/views/placement.js)" = "2" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-teal) 16%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-danger) 16%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-accent) 28%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-primary) 25%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-muted) 45%, var(--color-card))' public/views/reader.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-teal) 18%, var(--color-card))' public/views/words.js)" = "1" ] \
  && [ "$(grep -cF -- 'color-mix(in srgb, var(--color-accent) 18%, var(--color-card))' public/views/words.js)" = "1" ] \
  && [ "$(grep -c 'color-mix' public/views/placement.js public/views/reader.js public/views/words.js | tr '\n' ' ')" = "public/views/placement.js:2 public/views/reader.js:5 public/views/words.js:2 " ] \
  && echo WDT5-OK

# criterion 8
cd C:/Users/dkreinov/claude/english-app \
  && [ "$(grep -cF -- 'color: var(--color-ink);' public/views/placement.js)" = "3" ] \
  && [ "$(grep -cF -- 'color: var(--color-ink);' public/views/reader.js)" = "2" ] \
  && echo INK-OK
```

Each step is committed separately, message form `step 2.N: <what>`, after the usual
orchestrator re-validation and fresh-eyes audit.
