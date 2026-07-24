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

## 3. Color palette (tokens to artwork)

Source: `public/styles.css` `:root` block, cross-checked against plan.md contract GC-D1.

| Token | Value | Role | How it reads in the artwork |
|---|---|---|---|
| `--color-primary` | `#7c3aed` | Primary violet; also the PWA theme color (`<meta name="theme-color">` in `public/index.html`) | The clinic's magic-accent violet — potion glows, sparkles, primary UI chrome matching the artwork's violet accents |
| `--color-teal` | `#0d9488` | Teal accent | The baby dragon's signature color and the clinic's foliage/vine teal |
| `--color-accent` | `#f59e0b` | Amber accent | Golden-hour lantern light, warm highlights, treasure/reward glow |
| `--color-bg` | `#faf7f2` | Warm cream background | The warm cream that the whole cartoon palette sits on |
| `--color-ink` | `#1f2937` | Body/ink text color | Dark neutral ink, unrelated to artwork hue but keeps text readable against the warm palette |
| `--radius` | `16px` | Corner radius for cards/buttons/inputs | Soft, rounded, cozy shapes to match the illustration's soft-painterly rendering |

Additive tokens (also defined in `:root`, not part of the GC-D1-frozen five but part of the
same system):

| Token | Value |
|---|---|
| `--color-primary-ink` | `#ffffff` |
| `--color-muted` | `#6b7280` |
| `--color-card` | `#ffffff` |
| `--shadow-soft` | `0 2px 8px rgba(0, 0, 0, 0.08)` |
| `--nav-height` | `68px` |
| `--transition-fast` | `150ms ease` |

**GC-D1 rule:** the six token names `--color-primary --color-teal --color-accent --color-bg
--color-ink --radius` must stay defined in `public/styles.css` (frozen by `shell.test.js`);
the values `#7c3aed` (primary/theme) and `#faf7f2` (bg) are additionally frozen by the
manifest test. Test-frozen names and values may not change. NEW tokens may be added.

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
- Change the test-frozen token values.
- Pitch anything younger than 11 — the direction must stay charming and adventurous, never
  babyish.
