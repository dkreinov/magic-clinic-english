# Visual Design — English Learning App

> **Status: FROZEN** (2026-07-24). This document is the single source of truth for the app's
> visual system, produced from the delight-pass run's design record. Every agent/session
> working on this project must follow it. Changes require explicit owner approval — do not
> "improve" the visual system silently.

## 1. Status and scope

This document is the "linked design doc" that `design.md` §7 provides for: the visual
direction chosen during the delight-pass run is codified here with a fixed asset set and
style rules, and once frozen, every agent in every session follows it. The 8-asset set
described in §6 below is frozen and owner-approved — the run's journal records
`OWNER GATE PASSED (GC-D8)`: "Owner reviewed all 8 assets: APPROVE ALL, no redos, no notes.
Asset set is FROZEN as the app's visual library."

## 2. Visual direction

Warm, cozy, Pixar-like cartoon illustration — a wood-and-magic magical-veterinary-clinic
world, rendered with soft painterly 3D-cartoon look and warm golden lighting. The palette is
violet, teal, and amber accents on a warm cream background. The style anchor image is
`assets/design-tests/dragon-clinic-test.png`, viewed and described in the run's journal as
"warm Pixar-like cartoon, girl apprentice + teal dragon, wood/potions/vines world,
violet-teal-amber on cream" — judged sufficient to answer all style decisions without
inventing anything.

The recurring cast, established by the anchor image and carried through the asset set:
- a brown-haired girl vet apprentice (messy bun, teal apron with a paw-print patch, leather
  tool belt)
- a small teal baby dragon
- a fluffy lavender-purple magical creature

The audience is an 11-year-old: the tone must be charming and adventurous — **never babyish,
never pitched younger than 11**.

## 3. Color palette (tokens to artwork) — AMENDED 2026-07-24

**Amendment (warm-dark re-theme, 2026-07-24):** the app moved off the light cream surface
onto the artwork's own deep warm palette, so the illustrations bleed into the page instead of
sitting as dark boxes on a pale ground. Every value below was sampled from
`public/assets/*.webp` (or lightened along a sampled hue to clear the accessibility gate). All
8 `public/assets/*.webp` were decoded, resized to a common grid, and analysed by quantised
color-bucket population, per-asset brightest-0.5% / darkest-2% luminance bands, and HSL band
means over saturated pixels; percentages below are share of all sampled pixels.

Source: `public/styles.css` `:root` block, cross-checked against plan.md contract GC-D1.

| Token | Value | Role | Sampled from |
|---|---|---|---|
| `--color-primary` | `#c39bf0` | Primary violet accent — buttons, links, primary UI chrome | mean saturated violet `#7d35b5`, lightened along its own hue to clear AA on the new surfaces |
| `--color-teal` | `#4ecec0` | Teal accent — the baby dragon's signature color, secondary UI accents | mean saturated teal `#2db1a2`, lightened along its own hue to clear AA on the new surfaces |
| `--color-accent` | `#f5c563` | Amber accent — golden highlights, treasure/reward glow, callouts | mean saturated gold highlight `#eec65a` (mean saturated amber overall is `#da903a`), lightened to clear AA on the new surfaces |
| `--color-bg` | `#241305` | Page background — the deep warm ground the artwork now sits on | between the darkest-2%-of-pixels band (`#0a0903`–`#2e1207` across the 8 assets) and the `#281605` bucket (1.94%) |
| `--color-ink` | `#fdf1d8` | Body/ink text color — primary readable text on the dark ground | the brightest-0.5% "glow" means, `#fcefd0` (heroine) and `#fdf8d9` (words-treasure) |
| `--radius` | `16px` | Corner radius for cards/buttons/inputs | not a color — carried over unchanged from the light-cream era |
| `--color-primary-ink` | `#2a1606` | Text/icon color used on top of `--color-primary`-colored surfaces (e.g. filled buttons) | the darkest-2% band of the square assets (`#240e0d`, `#2e1207`) |
| `--color-muted` | `#d9bc92` | Muted/secondary text color | mean of the art's soft warm tan pixels `#c0a57b`, lightened along its own hue to clear AA on the card surface |
| `--color-card` | `#3a1d08` | Card surface background | the single most populous color bucket across all 8 assets, `#381704` (3.07%) |
| `--color-surface-2` | `#4d2a0e` | Secondary surface — raised/alternate panels distinct from cards | the `#482507` bucket (1.76%) |
| `--color-border` | `#a35d22` | Border color for cards, inputs, dividers | mean of the art's mid warm surface band `#6c340c`, lightened along its own hue to clear the 3:1 non-text gate |
| `--color-nav` | `#2e1806` | Bottom nav background | midpoint of the two dominant field buckets `#281605` and `#381704` |
| `--color-danger` | `#ef9a7d` | Danger/error state color | mean saturated warm-red/terracotta `#b05525`, lightened along its own hue to clear AA and stay distinct from the amber accent |
| `--color-glow` | `#fde3a2` | Glow/highlight color for sparkle and celebratory effects | the brightest-0.5% glow of `celebration.webp`; range across assets is `#fde3a2`–`#fef3a1` |
| `--shadow-soft` | `0 0 0 1px rgba(253, 227, 162, 0.10), 0 4px 14px rgba(0, 0, 0, 0.45)` | Elevation shadow for cards/raised elements | rebuilt for a dark ground: a 10%-opacity glow-colored (`#fde3a2`) 1px ring plus a deeper black drop shadow, because the old light-theme shadow is invisible on a dark surface |
| `--nav-height` | `68px` | Bottom nav height | not a color — carried over unchanged from the light-cream era |
| `--transition-fast` | `150ms ease` | Fast UI transition timing | not a color — carried over unchanged from the light-cream era |

### Superseded (light-cream era, pre-2026-07-24)

These values are SUPERSEDED and must not be reintroduced.

| Token | Old value |
|---|---|
| `--color-primary` | `#7c3aed` |
| `--color-teal` | `#0d9488` |
| `--color-accent` | `#f59e0b` |
| `--color-bg` | `#faf7f2` |
| `--color-ink` | `#1f2937` |
| `--color-primary-ink` | `#ffffff` |
| `--color-muted` | `#6b7280` |
| `--color-card` | `#ffffff` |
| `--shadow-soft` | `0 2px 8px rgba(0, 0, 0, 0.08)` |

**GC-D1 rule (amended):** the six token names `--color-primary --color-teal --color-accent
--color-bg --color-ink --radius` must stay defined in `public/styles.css` (frozen by
`shell.test.js`). `#7c3aed` and `#faf7f2` are no longer CSS values — they survive only as the
PWA splash/chrome colors in `public/manifest.webmanifest`, which `tests/shell.test.js`
asserts. NEW tokens may be added.

### Accessibility gate

The app is used by an 11-year-old, so every text/background pair must meet WCAG AA — at
least 4.5:1 for body text, at least 3:1 for large text (>= 1.5rem, or >= 1.2rem bold) — and
non-text control borders must meet 3:1 per WCAG 1.4.11. `node scripts/check-contrast.mjs`
enforces this mechanically over 28 pairs, reads its token values live from `public/styles.css`,
and must exit 0.

## 4. Typography

Source: `public/index.html` (Google Fonts link) + `public/styles.css`.

Font: **Rubik**, weights 400/500/700, loaded via
`https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap`. Fallback
stack: `"Rubik", system-ui, -apple-system, "Segoe UI", sans-serif`.

Observed type scale:

| Element | Size / weight |
|---|---|
| app-title | 1.6rem / 700 |
| card-title | 1.15rem / 700 |
| empty-state-title | 1.2rem / 700 |
| body | ~1rem |
| card-subtitle | 0.95rem / 400 |
| greeting | 1rem / 500 |
| nav-tab | 0.75rem / 500 |
| intro-note | 0.85rem |

## 5. Spacing, radius, and shadow

Source: `public/styles.css`.

- Radius: `--radius: 16px`, applied to cards, buttons, and inputs.
- Card padding: `20px`.
- Elevation: `--shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.08)`.
- App container: `#app` has `max-width: 480px` with `padding: 20px 16px calc(var(--nav-height)
  + 32px)`.
- Bottom nav: `68px` tall (`--nav-height: 68px`).
- Motion: `--transition-fast: 150ms ease`, with `:active` press feedback scaling elements down
  (`.card:active { transform: scale(0.98); }`, `.btn:active { transform: scale(0.97); }`).

## 6. Asset library

### Storage

Per GC-D4: masters (full-res PNG, committed) live in `assets/delight/`. Web-optimized
derivatives are generated later (a later phase) as `public/assets/*.webp`.

### Inventory

| File (`assets/delight/<name>.png`) | Aspect | Dimensions | Used for |
|---|---|---|---|
| `hero-clinic.png` | landscape | 1536×1024 | home header hero; reader "start story" |
| `chapter-clinic.png` | landscape | 1536×1024 | chapter banner (n % 3 === 1) |
| `chapter-forest.png` | landscape | 1536×1024 | chapter banner (n % 3 === 2) |
| `chapter-night.png` | landscape | 1536×1024 | chapter banner (n % 3 === 0) |
| `celebration.png` | landscape | 1536×1024 | placement done screens; chapter all-questions-correct |
| `heroine.png` | square | 1254×1254 | home welcome / onboarding |
| `placement-friend.png` | square | 1254×1254 | placement intro |
| `words-treasure.png` | square | 1254×1254 | words empty state + collection header |

### FROZEN STYLE SUFFIX

Appended verbatim to every image generation prompt (from plan.md):

> Warm cozy cartoon illustration in exactly the same style, palette and rendering as the
> earlier girl-and-dragon clinic image in this chat: soft painterly 3D-cartoon look, warm
> golden lighting, wood-and-magic fantasy world, teal + violet + amber accents on warm cream.
> Aimed at an 11-year-old — charming and adventurous, not babyish. No text, no letters, no
> watermark, no frame or border.

Style anchor for all generations: `assets/design-tests/dragon-clinic-test.png`.

### Per-asset generation prompts (verbatim, transcribed from plan.md STEP 1.1 / STEP 1.2)

Each prompt below is sent with the FROZEN STYLE SUFFIX appended.

- **hero-clinic**: "Wide landscape image (3:2): the exterior of a cozy crooked magical
  veterinary clinic cottage at golden hour — round door, glowing windows, a wooden sign with a
  paw print and a sparkle (no letters), overgrown herb garden with glowing potion flowers, two
  tiny dragons flying above the chimney." + SUFFIX

- **chapter-clinic**: "Wide landscape image (3:2): interior of the magical veterinary clinic in
  warm morning light — wooden exam table, shelves of glowing potion bottles, round vine-framed
  window, a small fluffy purple creature asleep in a basket, sparkles in the air, no people." +
  SUFFIX

- **chapter-forest**: "Wide landscape image (3:2): an enchanted forest path with giant
  teal-green leaves, floating glowing spores, a wooden walkway with lanterns, small glowing
  magical creatures peeking from the bushes, no people." + SUFFIX

- **chapter-night**: "Wide landscape image (3:2): the magical vet clinic rooftop at night under
  a huge starry sky and crescent moon — telescope, string of lantern lights, a small teal baby
  dragon silhouette watching the stars, purple night tones with warm amber lantern glow, no
  people." + SUFFIX

- **heroine**: "Square image (1:1): the same brown-haired girl vet apprentice from the earlier
  clinic image in this chat — messy bun, teal apron with paw-print patch, leather tool belt —
  waist-up, warmly smiling at the viewer while the same small teal baby dragon sits on her
  shoulder, soft glowing warm background." + SUFFIX

- **placement-friend**: "Square image (1:1): a cute round fluffy lavender-purple magical
  creature with big amber eyes wearing a slightly-too-big stethoscope, sitting upright and
  looking curious and encouraging, soft warm background with gentle sparkles." + SUFFIX

- **celebration**: "Wide landscape image (3:2): the small teal baby dragon and the fluffy
  purple creature from this chat jumping with joy amid golden confetti, sparkles and tiny
  stars, warm glowing celebratory background." + SUFFIX

- **words-treasure**: "Square image (1:1): an open rounded glass jar on a wooden table
  overflowing with glowing gem-like crystals in violet, teal and amber, sparkles rising from it
  like a treasure reward in a game, cozy warm background." + SUFFIX

## 7. Generation pipeline

Source: `design.md` §7, plan.md GC-D7, and field-guide lessons 10–13
(`.oplan/delight-pass/field-guide/index.md`).

- All image generation happens in **ONE dedicated ChatGPT chat**:
  `https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc` ("Image Request Cartoon
  Style") — never a new chat.
- Images are generated **one at a time**; ChatGPT serializes generations within a chat.
- Downloads land in `C:\Users\dkreinov\Downloads` as `ChatGPT Image <date>.png`. Find the
  newest with `ls -t`, then move+rename it into `assets/delight/<name>.png`.
- **Activate the Download control exactly ONCE, then wait via shell (Bash) polling only** —
  do not re-click while waiting. Re-clicking while waiting caused an 89-duplicate-file burst
  on 2026-07-24 (all identical copies of `hero-clinic.png` bytes piling up in `~/Downloads`).
- Any validation over generated assets must assert **content distinctness** (md5 hash across
  all assets plus the anchor image), not just per-file format/aspect checks — a polluted
  Downloads directory can make the "newest file" heuristic deliver duplicate bytes under a
  different filename, which per-file checks alone would not catch.
- Web-optimized derivatives (`public/assets/*.webp`) are produced later, by a script, from the
  committed masters in `assets/delight/`.

## 8. Do and do-not rules

Source: plan.md GC-D1/GC-D2/GC-D5/GC-D6/GC-D8 + design.md §7.

**DO:**
- Reuse the fixed asset library (§6) for all artwork — consistency comes from a defined asset
  library, not from a "vibe".
- Owner-gate every new asset before integration (GC-D8).
- Keep the palette token names and test-frozen values unchanged (GC-D1).
- Append the FROZEN STYLE SUFFIX (§6) to every generation prompt.

**DON'T:**
- Generate character/scene art live at runtime — AI image generators cannot redraw the same
  character reliably, which is why the app relies on a fixed, pre-generated asset library
  instead.
- Touch `public/sw.js` or its PRECACHE list; it is untouchable and frozen by a test (GC-D2).
- Reintroduce the superseded light-cream values (§3), or ship a text/background pair that fails the §3 accessibility gate.
- Pitch anything younger than 11 — the direction must stay charming and adventurous, never
  babyish.
