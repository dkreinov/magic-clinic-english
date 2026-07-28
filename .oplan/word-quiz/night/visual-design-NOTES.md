# Visual design options — working notes

Companion to `visual-design-OPTIONS.html` (open that file in a browser; it is the deliverable).
**Proposal only. No application file was modified.** `git status` shows exactly these two new files.

---

## 1. What was consulted

**Craft bar**
- `C:\Users\dkreinov\.claude\commands\app-design.md` — the app-design guidance (it lives as a slash
  command, not `skills/app-design/SKILL.md`). Applied: commit to one tonal direction per option;
  one dominant colour + one sharp accent, not five equal pastels; no flat backgrounds (every option
  keeps a gradient-mesh atmosphere); one staggered load animation and then restraint; deliberate
  asymmetry in the options page layout.

**The app itself (read in full)**
- `public/styles.css` — the complete `:root` token set. This is the swap surface.
- `public/index.html` — `lang="he" dir="rtl"`, `theme-color`, `color-scheme`, the Rubik webfont link,
  the three-tab bottom nav SVGs (copied verbatim into the mockup).
- `public/views/home.js`, `reader.js`, `words.js` — layout, Hebrew copy, the `dir="ltr"` English story
  block, tapped-word highlight, question option pills, celebration image placement.
- `public/quiz.js` — quiz option pill styling.
- `scripts/check-contrast.mjs` — the 52-pair gate and its exact luminance math.
- `tests/background.test.js` — the frozen background paint tokens and gradient string.

**The artwork (viewed as images, not just filenames)**
- `public/assets/celebration.webp` — teal dragon, violet-lilac creature, amber confetti bokeh.
- `public/assets/chapter-night.webp` — indigo/violet night sky, cream moon, lantern amber, jade dragon.
- `public/assets/chapter-forest.webp` — deep pine and jade foliage, lantern amber, magenta/violet crystals.
- `public/assets/hero-clinic.webp` — golden sunset sky, warm wood, teal door, violet bellflowers.
- `public/assets/heroine.webp` — warm interior, teal apron, amber rim light.
- `public/icons/icon.svg` — `#2e1806` / `#fdf1d8` / `#f5c563` / `#4ecec0`.

Every palette below was sampled from those images. The recurring triad in the art is
**amber-gold + jade-teal + violet-orchid**, over a base that is indigo, pine, or sunset cream —
never the muddy `#241305` brown the UI currently uses. That gap is the whole diagnosis.

**External reading** (used only to sanity-check direction, not to pick hexes)
- [Designing apps for kids: a reading app user experience — Imaginary Cloud](https://www.imaginarycloud.com/blog/designing-apps-for-kids-a-reading-app-user-experience)
  — "use colour efficiently, fewer yet bright colours"; keep one main element and one main action per
  screen. Supports: bright accents, calm environment.
- [Designing for Kids: UX tips for children apps — Ungrammary](https://www.ungrammary.com/post/designing-for-kids-ux-design-tips-for-children-apps)
  — primary brights read as "too young" for older children; refine toward deeper, muted colour.
  Directly relevant: the user is 11, not 4.
- [Kids Color Palette Ideas — media.io](https://www.media.io/color-palette/kids-color-palette.html)
  — the 60/30/10 split (neutral field, dominant hue, accent) and "replace pure black text with deep
  navy / dark teal / slate". Options 03 and 04 use exactly that: ink is `#3a2412` cocoa and
  `#1e2445` navy, never `#000`.
- [Children mobile app education palette — ColorsWall](https://colorswall.com/palette/14961)
  — cited as a negative example: a widely circulated kids' palette that fails 6 contrast pairs.
  This is the failure mode the project's gate already prevents; noted to justify verifying rather
  than eyeballing.

Caveat: the kids'-UI sources are practitioner blog posts, not studies. They were used to confirm a
direction already implied by the artwork, not as evidence.

---

## 2. Constraints, and how each was honoured

**(1) The illustration style stays.**
No asset was opened for editing, regenerated, recoloured, or replaced. The mockups load the real
files by relative path (`../../../public/assets/hero-clinic.webp`,
`../../../public/assets/celebration.webp`) so what the owner sees is the actual art on the actual
proposed background. Only background, surface, accent, depth and texture change.

**(2) The 52-pair contrast gate.**
Not estimated — *computed*. The pair list and the luminance/mix math from
`scripts/check-contrast.mjs` were lifted verbatim into a scratch verifier and run against each
candidate palette. **All four options pass all 52 pairs.** Two early drafts of the light options
failed (deep teal and deep amber were too light against near-white surfaces, and the borders missed
the 3:1 non-text minimum); they were darkened until they passed rather than shipped as "close
enough". Headline ratios, all measured:

| pair (min) | current | 01 Twilight | 02 Grove | 03 Parchment | 04 Cloud |
|---|---|---|---|---|---|
| ink on card (4.5) | 13.80 | 14.25 | 12.41 | 14.01 | 14.83 |
| ink on page (4.5) | 16.02 | 15.99 | 15.31 | 13.39 | 13.44 |
| muted on card (4.5) | 8.50 | 8.65 | 7.49 | 6.02 | 5.87 |
| primary on card (4.5) | 6.82 | 8.03 | 6.88 | 6.27 | 7.00 |
| primary-ink on primary (4.5) | 7.62 | 8.88 | 8.20 | 6.09 | 6.76 |
| app title on page (3.0, large) | 7.92 | 9.01 | 8.49 | 5.99 | 6.34 |
| teal on card (4.5) | 8.03 | 9.33 | 8.41 | 7.17 | 6.81 |
| accent on card (4.5) | 9.60 | 10.38 | 9.07 | 5.92 | 5.98 |
| border on card (3.0) | 3.05 | 3.50 | 3.35 | 4.67 | 4.33 |

Tightest number in the whole set is `--color-border` on card in option 02 at **3.35** (min 3.0) —
flagged in the deliverable. The light options are the *most* comfortable on the non-text border
minimum (4.3–4.7 vs today's 3.05).

**(3) Expressible as a token swap.**
Each option is 16 colour tokens + `--color-glow` + `--shadow-soft` + `--radius`, all inside `:root`.
Per-option token tables with old → new values are rendered in the HTML. The decorative addition is
one rule per option (`#app::before`, a fixed non-interactive layer): a starfield, three fireflies, a
paper grain, or two cloud banks. It must go on a pseudo-element because `body`'s `background-image`
string is pinned byte-for-byte by `tests/background.test.js`.

**(4) Hebrew-first RTL, 11-year-old user.**
The mockups are real `dir="rtl" lang="he"` markup with the app's real Hebrew strings, real
right-aligned answer pills, and the `dir="ltr"` English story block nested inside — so RTL is
demonstrated, not asserted. Nothing about direction, alignment or the 48px tap targets changes.
The age drove the palettes away from primary brights and toward jewel/deep tones (see Ungrammary
above) — 11 is old enough to find kindergarten colours insulting.

**(5) No external fonts or CDNs in the mockup.**
The options page loads zero network resources. Display type is Georgia (ships with every OS), body is
the local UI stack, code is the local mono stack. The paper-grain texture is an inline
`data:image/svg+xml` `feTurbulence`, not a hosted image. Note: the *phone mockups* therefore render
in the local sans rather than Rubik — the real app keeps its Rubik link untouched, so shipped type
will be slightly different from (and slightly better than) the mockup.

---

## 3. The four options → implementation

Same recipe for all four. Steps 1–2 are the whole change; step 3 is optional; step 4 applies to the
light options only.

1. **`public/styles.css`, `:root`** — replace the 17 colour values plus `--radius` and
   `--shadow-soft` with the option's column. Nothing outside the `:root` block moves. The
   `background-image` declaration on `body` is not touched — it already references the four paint
   tokens by name.
2. **`tests/background.test.js`, lines 14–17** — this test pins the four paint tokens as string
   literals (`--color-bg-top: #361d08;` etc.). Update those four literals to the option's values.
   The assertion on the gradient composition string (line 27) stays exactly as it is, because the
   recipe does not change. This is the only test in the suite that needs editing; re-run
   `node scripts/check-contrast.mjs` (expect `ALL PASS`) and the test suite.
3. **Optional decoration** — add the option's single `#app::before` rule at the end of `styles.css`.
   Option 02's firefly drift must sit behind a `prefers-reduced-motion` guard (the file already uses
   that pattern in `reader.js`).
4. **Light options (03, 04) only, `public/index.html`** — `<meta name="color-scheme" content="dark">`
   → `light`, and `<meta name="theme-color" content="#2e1806">` → `#fff8ec` (03) or `#f7f9ff` (04),
   so the PWA chrome and the browser's form/scrollbar defaults match. `public/icons/icon.svg` has a
   `#2e1806` plate that will read as a dark badge on a light OS background — still legible, but worth
   a look before shipping either light option.

| # | Name | Feel | Base → | Dominant / accent |
|---|---|---|---|---|
| 01 | Twilight Terrace · מרפסת הכוכבים | The chapter-night rooftop as a room — indigo you can see into, lantern still lit | `#171033` | moonlit violet `#cba6ff` / lantern amber `#ffc65c` |
| 02 | Enchanted Grove · חורשת הקסם | The glowing forest path indoors — deep jade with orchid crystals | `#0d2119` | crystal orchid `#e2a0f7` / firefly gold `#ffcb63` |
| 03 | Sunrise Parchment · דף הזריחה | Stop imitating the night, become the book — warm paper, cocoa ink | `#fff4e2` | deep violet `#7b3fb5` / burnt amber `#8a5600` |
| 04 | Cloud & Crystal · ענן וקריסטל | Morning sky behind the clinic — cool, airy, the art is the only warm thing | `#eef2fb` | indigo `#5b3fc4` / deep cyan `#0a6468` |

The set is deliberately a 2×2 — dark/light × warm/cool — so the owner is choosing between real
alternatives rather than four shades of one idea. 01 is the cheapest and safest (same luminance
structure as today, so masks, shadows and spacing need no re-tuning). 03 is the largest change and
the loudest answer to "dull". 02 has the most personality. 04 is the calmest to read in.

---

## 4. Known trade-offs, stated rather than hidden

- **Light options and the image mask.** `.hero-banner / .chapter-banner / .celebrate-image` fade to
  transparent over the bottom 26%. On a dark page this reads as the art dissolving into night; on
  cream or sky it reads as a watercolour bleed. It looks good — but it is a genuine change in how the
  art meets the page, so the mockups render it honestly rather than hiding it. If disliked, pushing
  the mask stop from 74% to 88% is a one-number fix and touches no token.
- **Option 04's card is near-white** (`#fdfdff` on a `#eef2fb` page). The 1px ring inside
  `--shadow-soft` is doing the work of separating card from page; remove it and the cards vanish.
- **Option 02's violet background glow** (`#2b1f42`) sits at the top-left of the screen and is
  noticeably purple against the green field. That is intentional — it mirrors the crystals in
  `chapter-forest.webp` — but it is the one place where option 02 does not read as pure green.
- **The mockups are not the running app.** They reproduce the real markup, classes, tokens, images
  and background recipe, but they are a static page. The honest confirmation is to apply one option
  to `styles.css` on a branch and look at it on a phone.

## OWNER DECISION D29 (2026-07-28): Sunrise Parchment chosen.
To be built as its own small phase AFTER phase 6 closes (its boundary gate forbids code changes
now). Scope per the night analysis: :root token swaps + the four pinned background hexes in
tests/background.test.js + contrast 52/52 re-proof + CACHE bump v13->v14 + deploy + owner look.
