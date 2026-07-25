# Plan — run `band2-and-polish`

Base commit: `bbdb60c`. Test baseline: 146 pass / 0 fail.
Owner brief: fix the difficulty ceiling (the placement test is too easy and acing it changes
nothing), and add more of the artwork's design to the background, the install icon, and the
loading animation. Owner confirmed both scopes and chose artwork for the app icon.

**Timing note:** the owner said "she is not here" — this is a safe window to change the live app.
It does NOT authorise touching her stored profile, which stays off-limits as in every previous run.

## The problem being fixed (measured, not assumed)

`lib/placement.js` maps score to a band: `preA1` (<0.5), `A1` (<0.8), `A2` (>=0.8). But
`buildAllowedSet` in `lib/story.js` reads:

```js
const includeAllSections = band === 'A1' || band === 'A2';
```

so **A1 and A2 unlock exactly the same vocabulary** — the whole of Band 1. Scoring 100% and
scoring 60% produce identical stories. The ceiling is the Israeli MoE *elementary* list (1341
entries), and there is nothing above it in the project.

## Non-goals (run-wide)

- **The learner's stored profile is never read or written by this run.** No API calls to
  production. Verification uses local servers with `DATA_DIR` pointed at scratch directories.
- No change to how scores map to bands (`bandForScore` stays as-is) — this run changes what a
  band UNLOCKS, not how it is earned.
- No new placement items in this run (see "Deferred" below).
- No copy changes except where a new UI element requires new text, which must be Hebrew.
- No dependency additions. `sharp` and `pymupdf` are already present.

## Frozen contracts

### B2-1 — the Band 2 source is the official MoE list, extracted deterministically

`data/raw/band2.pdf` (2,084,853 bytes) was downloaded from
`https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/CurriculumFilesAugust21/LexicalBand2.pdf`
— the same MoE curriculum series as the existing Band 1 file. It is titled
**"LEXICAL BAND II — JUNIOR HIGH SCHOOL"**, 56 pages, and contains two tables:
**BAND II CORE I** (from page 2) and **BAND II CORE II** (from page 29).

Vocabulary for a child's schooling is never invented or LLM-generated. It is extracted from this
PDF by a committed, deterministic script, exactly as Band 1 was.

### B2-2 — the extraction algorithm (verified by dry run at plan time)

`scripts/build_band1.py` does NOT work unmodified on this PDF: it requires a column header on
every page, and Band 2 prints the header only twice (pages 2 and 29). Run unmodified it yields
**71 entries instead of ~2000**.

The fix, dry-run at plan time and confirmed: **carry the column geometry forward** from the most
recent header page. With that single change the extraction yields **2016 entries / 1610
single-word**, alphabetical `a little bit` … `zone`, with a sane `Rec` 1095 / `Prod` 905 split.

### B2-3 — backward-compatible signatures

`buildAllowedSet(profile, band1)` and `generateChapter({ profile, band1, chat })` are called with
those exact shapes by existing tests (`tests/story.test.js`, `tests/api-chapter.test.js`). Band 2
is added as an OPTIONAL trailing parameter so every existing call keeps working and all 146 tests
stay green. A missing `band2` means "no Band 2 words", never a crash.

### B2-4 — what each band unlocks (the actual fix)

| Band | Unlocks |
|---|---|
| `preA1` | Band 1 `preBandI` section only (unchanged) |
| `A1` | all of Band 1 (unchanged) |
| `A2` | all of Band 1 **plus all of Band 2** (new) |

Plus, at every band and unchanged: the learner's own tapped/known words, the core function words,
the story lexicon, and her heroine/pet names.

## Phase 1 — Band 2 vocabulary and a meaningful A2

### Step 1.1 — extract `data/band2.json`

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `scripts/build_band2.py` (NEW) and `data/band2.json` (NEW, its output).
- **Goal:** copy `scripts/build_band1.py` and change exactly these things:
  1. `SRC = "data/raw/band2.pdf"`, `DST = "data/band2.json"`.
  2. **Section label, carried forward.** Band 1 decided the section per page from the page text.
     Band 2 has two tables — `BAND II CORE I` (from page 2) and `BAND II CORE II` (from page 29) —
     and the title appears ONLY on the page where each table starts. So keep a `section` variable
     across pages, updated per page like this, **checking CORE II first because the string
     `"BAND II CORE I"` is a prefix of `"BAND II CORE II"` and would otherwise match both**:
```python
        if "BAND II CORE II" in text:
            section = "bandIIcoreII"
        elif "BAND II CORE I" in text:
            section = "bandIIcoreI"
        # otherwise: leave `section` at its carried-forward value
```
     Initialise `section = None` before the page loop and `continue` while it is still `None`.
  3. **Carry the column geometry forward** (contract B2-2). Band 1 required a header row on every
     page and `continue`d when absent; Band 2 prints the header only twice, so that yields 71
     entries instead of ~2000. Instead: when a header row IS found, recompute and remember
     `entry_left`, `second_left`, `reg_left`, `meaning_left` and `header_y` exactly as band 1
     does. When a header row is NOT found, reuse the remembered values but set `header_y = -1`
     so the whole page counts as data rows. `continue` while nothing has been remembered yet.
  4. `meta.source` = `"Israel MoE — Lexical Band II (Junior High School)"`, `meta.sourceUrl` =
     `"https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/CurriculumFilesAugust21/LexicalBand2.pdf"`,
     `extractedWith` = `"pymupdf"`, plus `entryCount` and `singleWordCount` computed exactly as
     band 1 does.
  5. Sort key: same shape as band 1, with the section term first:
     `(e["section"] == "bandIIcoreII", e["lemma"], e["pos"] or "", e["meaning"] or "")`.
  Keep everything else byte-identical to `build_band1.py`: the `y > 90` filter, the row grouping
  by `round(w[1])`, the entry/pos/meaning/reg column slicing, both `continue` guards, the lemma
  lowercasing, the `single` regex, and the JSON output shape `{"meta": ..., "entries": [...]}`.
- **Non-goals:** do not modify `scripts/build_band1.py`, `data/band1.json`, `lib/`, `api/`, or any
  test. Do not hand-edit `data/band2.json` — it must be the script's output, reproducibly.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && python scripts/build_band2.py \
  && H1=$(md5sum data/band2.json | cut -d' ' -f1) \
  && python scripts/build_band2.py \
  && H2=$(md5sum data/band2.json | cut -d' ' -f1) \
  && [ "$H1" = "$H2" ] \
  && node -e "
const fs=require('fs');
const b=fs.readFileSync('./data/band2.json','utf8');
const j=JSON.parse(b);
if(!j.meta||!Array.isArray(j.entries)) throw new Error('bad shape');
if(j.entries.length<1900||j.entries.length>2200) throw new Error('entryCount out of range: '+j.entries.length);
if(j.meta.entryCount!==j.entries.length) throw new Error('meta.entryCount mismatch');
const secs=new Set(j.entries.map(e=>e.section));
if(secs.size!==2||!secs.has('bandIIcoreI')||!secs.has('bandIIcoreII')) throw new Error('sections wrong: '+[...secs]);
for(const sec of ['bandIIcoreI','bandIIcoreII']) if(j.entries.filter(e=>e.section===sec).length<100) throw new Error('section too small: '+sec);
const bad=j.entries.filter(e=>typeof e.lemma!=='string'||!e.lemma.trim()||e.lemma!==e.lemma.toLowerCase()||e.lemma!==e.lemma.trim());
if(bad.length) throw new Error('bad lemmas: '+bad.slice(0,3).map(e=>JSON.stringify(e.lemma)));
const single=j.entries.filter(e=>e.single);
if(j.meta.singleWordCount!==single.length) throw new Error('meta.singleWordCount mismatch');
if(single.length<1400) throw new Error('too few single words: '+single.length);
const set=new Set(single.map(e=>e.lemma));
for(const w of ['abroad','accept','accident','wrong','zone']) if(!set.has(w)) throw new Error('expected lemma missing: '+w);
console.log('BAND2-OK entries='+j.entries.length+' single='+single.length+' deterministic=yes');" \
  && npm test 2>&1 | tail -4 \
  && echo STEP-1.1-OK
```
  Pass = `BAND2-OK … deterministic=yes`, then `# fail 0`, then `STEP-1.1-OK`.
  (`set -o pipefail` makes the npm test exit code real. The script runs TWICE and the two md5
  hashes are compared — that proves determinism. Hashes are used rather than a temp file because
  Git Bash's `/tmp` is NOT Node's `/tmp` on this machine; see field-guide lesson 16.)

### Step 1.2 — make A2 unlock Band 2

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `lib/story.js` — and nothing else.
- **Goal:** two edits, both backward compatible (contract B2-3).
  1. `export function buildAllowedSet(profile, band1)` becomes
     `export function buildAllowedSet(profile, band1, band2 = null)`. Immediately AFTER the
     existing `for (const e of band1.entries) { ... }` loop and BEFORE the `CORE_FUNCTION_WORDS`
     loop, insert:
```js
  if (band2 && Array.isArray(band2.entries) && band === 'A2') {
    for (const e of band2.entries) {
      allowed.add(String(e.lemma).toLowerCase());
    }
  }
```
     The local `const band = ...` is already declared above the band 1 loop and is in scope here —
     confirmed at plan time by a fresh reviewer. Do not redeclare it, and do not touch the
     existing band 1 loop or `includeAllSections`.
  2. `generateChapter({ profile, band1, chat, now = ..., maxAttempts = 3 })` gains `band2 = null`
     in its destructured parameters, and its `buildAllowedSet(profile, band1)` call becomes
     `buildAllowedSet(profile, band1, band2)`.
- **Non-goals:** do not change `bandForScore`, `verifyChapter`, `minRatio`, the prompt text, the
  retry loop, `CORE_FUNCTION_WORDS`, `STORY_LEXICON`, or any other file. No test changes.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -4 \
  && node --input-type=module -e "
import { buildAllowedSet } from './lib/story.js';
import { readFileSync } from 'node:fs';
const band1=JSON.parse(readFileSync('./data/band1.json','utf8'));
const band2=JSON.parse(readFileSync('./data/band2.json','utf8'));
const mk=b=>({ skills:{ receptiveVocab:{ band:b } }, words:[], learner:{} });
const pre=buildAllowedSet(mk('preA1'),band1,band2);
const a1=buildAllowedSet(mk('A1'),band1,band2);
const a2=buildAllowedSet(mk('A2'),band1,band2);
const legacy=buildAllowedSet(mk('A2'),band1);
if(!(a2.size>a1.size)) throw new Error('A2 did not unlock more than A1');
if((a2.size-a1.size)<1200) throw new Error('A2 gained only '+(a2.size-a1.size)+' words');
if(!(a1.size>pre.size)) throw new Error('A1 no longer beats preA1');
if(!a2.has('abroad')) throw new Error('A2 missing a band2 word');
if(a1.has('abroad')) throw new Error('A1 leaked a band2 word');
if(pre.has('abroad')) throw new Error('preA1 leaked a band2 word');
if(legacy.size!==a1.size) throw new Error('2-arg call changed behaviour');
console.log('UNLOCK-OK preA1='+pre.size+' A1='+a1.size+' A2='+a2.size+' (A2 adds '+(a2.size-a1.size)+')');" \
  && echo STEP-1.2-OK
```
  Pass = `# fail 0`, then `UNLOCK-OK …`, then `STEP-1.2-OK`. Every clause is joined by `&&`, so a
  failure anywhere stops the chain — there is no `;` and no discarded fragment.

### Step 1.3 — pass Band 2 through the chapter endpoint

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `api/chapter.js` — and nothing else.
- **Goal:** two edits. Add `import band2 from '../data/band2.json' with { type: 'json' };`
  immediately after the existing `band1` import, and change the single call
  `generateChapter({ profile: p, band1, chat: chatJSON })` to
  `generateChapter({ profile: p, band1, band2, chat: chatJSON })`.
- **Non-goals:** no other change to this file; nothing else in `api/`, `lib/`, `data/`, `public/`
  or `tests/`.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && npm test 2>&1 | tail -4 \
  && grep -qF -- "import band2 from '../data/band2.json' with { type: 'json' };" api/chapter.js \
  && grep -qF -- 'generateChapter({ profile: p, band1, band2, chat: chatJSON })' api/chapter.js \
  && [ "$(git diff HEAD -- api/chapter.js | grep -c '^[+-][^+-]')" = "3" ] \
  && echo STEP-1.3-OK
```
  Pass = `# fail 0` and `STEP-1.3-OK`. (3 changed lines = one added import, one removed call line,
  one added call line — verified against the real file at plan time.)

### Step 1.4 — regression test for the Band 2 data

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `tests/band2.test.js` (NEW) — and nothing else.
- **Why:** `data/band2.json` is generated data that nothing in `npm test` currently protects.
  `tests/band1.test.js` guards Band 1 the same way; without a sibling, a future bad regeneration
  ships silently.
- **Goal:** mirror `tests/band1.test.js` in structure and style (same imports, same
  `__dirname`/`dataPath` derivation, a `loadBand2()` helper) with these five tests:
  1. `data/band2.json` parses; `meta.entryCount === entries.length`; `entryCount` within
     `[1900, 2200]`; `meta.singleWordCount` equals the count of `single` entries and is `>= 1400`.
  2. Every entry passes the schema: `lemma` a non-empty lowercase trimmed string; `pos` string or
     null; `meaning` string or null; `reg` one of `'Prod' | 'Rec' | null`; `section` one of
     `'bandIIcoreI' | 'bandIIcoreII'`; `single` a boolean equal to `/^[a-z]+$/.test(lemma)`.
  3. Both sections are present and each has at least 100 entries.
  4. These single-word lemmas exist: `abroad`, `accept`, `accident`, `wrong`, `zone`.
  5. At least one multi-word entry (`single === false`) exists.
- **Non-goals:** do not modify `tests/band1.test.js` or any other test, and do not touch
  `data/band2.json`, `lib/`, `api/`, or `scripts/`. Do not assert which section a given lemma is
  in — both cores run A–Z, so that is not stable.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && node --test tests/band2.test.js 2>&1 | tail -5 \
  && npm test 2>&1 | tail -5 \
  && [ "$(git diff HEAD --name-only -- . ':!.oplan')" = "tests/band2.test.js" ] \
  && echo STEP-1.4-OK
```
  Pass = the band2 file alone reports `# fail 0`, the whole suite reports `# fail 0` (the total
  rises from 146 to 151 — five new tests, which is the point of this step), only that one file
  changed, and the final line is `STEP-1.4-OK`.

### Step 1.5 — orchestrator end-to-end proof (not dispatched)

The greps prove shape, not behaviour. The orchestrator builds allowed sets for all three bands
from the real data files, reports their sizes, and confirms a Band-2-only word is reachable at A2
and absent at A1 and preA1. Local only; no API call, no profile contact, no OpenAI spend.

### Phase 1 acceptance criteria (frozen before execution)

1. `npm test` reports **0 failures**, with the total risen from 146 to 151 (step 1.4 adds five).
2. `STEP-1.1-OK` … `STEP-1.4-OK` all print.
3. `data/band2.json` holds 1900–2200 entries across exactly `bandIIcoreI` and `bandIIcoreII`, and
   running `scripts/build_band2.py` twice produces byte-identical output (checked inside 1.1).
4. A2's allowed set exceeds A1's by at least 1200 words; A1's and preA1's sets are unchanged from
   before this run (the legacy 2-argument call must return the same size as A1).
5. `git diff --name-only bbdb60c -- . ':!.oplan'` lists exactly: `data/band2.json`,
   `data/raw/band2.pdf`, `scripts/build_band2.py`, `lib/story.js`, `api/chapter.js`,
   `tests/band2.test.js`.
6. Nothing under `public/` changed, so no service-worker bump is required in this phase.

---

## Phase 2 — visual polish  (PLANNED IN FULL 2026-07-25)

Planned by a fresh PLANNER-tier planner from the written record alone, then reviewed by the
orchestrator. Baseline commit `679dcc9`; test baseline 151 pass / 0 fail; contrast gate 28 pairs,
`ALL PASS`.

**Goal.** The page background becomes a four-layer artwork-palette composition (warm top wash +
violet/teal/amber glows) in which every painted colour is a `:root` token measured by the contrast
gate. The reader's plain grey ring becomes a spinning violet→teal→amber magic ring with a floating
creature above it. The PWA install icon becomes generated girl-and-dragon artwork **if and only if**
the owner approves it; otherwise the paw print stays, as the owner pre-accepted. `public/` ships
with `CACHE = magic-vet-v7`, `npm test` stays at 0 failures, and `scripts/check-contrast.mjs`
still exits 0 — now over 52 pairs instead of 28, and wired into `npm test` so it can never
regress silently again.

### How reality differs from the skeleton (verified, not assumed)

1. **`public/icons/icon.svg` CANNOT be replaced, as the skeleton assumed.**
   `tests/shell.test.js:30` freezes `manifest.icons[0].src === '/icons/icon.svg'`, and its
   `deepStrictEqual` PRECACHE list (lines 64–75) includes `/icons/icon.svg`, which
   `docs/visual-design.md` §8 (GC-D2) declares untouchable. So the SVG **stays** as the precached
   `"any"` fallback at index 0, its `purpose` narrows from `"any maskable"` to `"any"`, and the
   generated artwork ships as **appended** PNG entries that own the maskable/home-screen slot.
   Same user-visible result, no frozen test broken. (The skeleton was drafted without applying
   field-guide lesson 7, which exists precisely to prevent this.)
2. **The background change must fix a pre-existing WCAG failure, or it cannot be made at all.**
   `body` currently paints `linear-gradient(180deg, #3d2109 0%, var(--color-bg) 340px)` — a RAW
   LITERAL the gate cannot see, because `parseTokens` only reads `:root` hexes. Measured by the
   orchestrator with the gate's own formula: `--color-border` `#a35d22` on `#3d2109` = **2.92:1**,
   below the 3:1 WCAG 1.4.11 floor that `docs/visual-design.md` §3 declares binding. Bordered
   controls (`.placement-option-btn`, `.placement-question-option`) sit directly on that wash.
   Painting glows on top would push it to ~2.1:1 invisibly. So Phase 2 promotes every painted
   colour to a token, darkens the top stop to `#361d08` (3.10:1 — a ~20% luminance drop,
   imperceptible) and caps every glow so all four layers clear 3:1 for borders and 4.5:1 for text.
3. **The gate joins `npm test`.** `scripts/check-contrast.mjs` is currently run by nobody
   automatically (referenced only in docs and plans), so between runs a token change could regress
   AA silently. One assertion in the new test file closes that hole in the same phase that widens
   the gate's job.
4. **The loading animation gets real artwork, not just a recolour** — the brief is "more of the
   artwork's design", so an existing frozen asset (`placement-friend.webp`) floats above the ring.
   No new asset, no owner gate.
5. **Documentation steps added** (`docs/visual-design.md`, `README.md`): the background composition
   is documented in no frozen doc today, the doc and README both claim "28 pairs", §7 records a
   capture method that field-guide lesson 15 supersedes, and §8 contradicts the required sw bump.
6. **"Splash" needs no work of its own** — Android builds the splash from `background_color` plus
   the largest icon, so the 512 PNG improves it automatically.

### Frozen contracts for this phase

- **VP-1 — every colour painted in the `body` background must be a `:root` token** (or
  `--color-bg`, or `transparent`), and must carry its own six contrast pairs in
  `scripts/check-contrast.mjs`. A raw hex in a background is the exact defect class of field-guide
  lessons 13/14: the gate reports `ALL PASS` while the real pixels fail.
- **VP-2 — the four new tokens and their frozen values:**
  `--color-bg-top: #361d08` (top warm wash, first 340px) ·
  `--color-bg-glow-violet: #321f1a` (upper-left) ·
  `--color-bg-glow-teal: #282416` (upper-right) ·
  `--color-bg-glow-amber: #331f0c` (lower lantern light).
  The 14 existing token values are untouched; §3 explicitly permits NEW tokens.
- **VP-3 — measured contrast floors (reproduced by the orchestrator, not taken on trust).** Any
  deviation from these numbers means a typo, not a design problem:
  | layer | ink | muted | primary | teal | danger | border (min 3) |
  |---|---|---|---|---|---|---|
  | `#361d08` top | 14.03 | 8.65 | 6.94 | 8.17 | 7.18 | **3.10** |
  | `#321f1a` violet | 13.92 | 8.58 | 6.88 | 8.10 | 7.12 | **3.08** |
  | `#282416` teal | 13.85 | 8.54 | 6.84 | 8.06 | 7.08 | **3.06** |
  | `#331f0c` amber | 13.97 | 8.61 | 6.91 | 8.13 | 7.14 | **3.09** |
  Why checking four layer colours is sufficient: gradients interpolate per-channel, so every
  composited pixel is a convex combination of the layer colours, and relative luminance is convex
  in each channel — no composite pixel is lighter than the lightest layer.
- **VP-4 — `CACHE` is the single sanctioned exception to GC-D2.** `docs/visual-design.md` §8 says
  `public/sw.js` is untouchable; field-guide lesson 9 and `phase-state.md` require the CACHE bump
  in the same phase as any `public/` change. Resolution frozen here: **the `CACHE` string constant
  may be bumped; everything else in `sw.js`, above all the `PRECACHE` array, stays byte-identical.**
  Step 2.4 writes this carve-out into §8 so the contradiction is resolved in the record, not just
  in this plan.
- **VP-5 — ONE bump per phase.** `magic-vet-v6` → `v7` happens exactly once (step 2.3) and covers
  every `public/` change made in Phase 2, including step 2.7's. No step may bump to `v8`.
- **VP-6 — the icon is conditional.** Steps 2.6 and 2.7 run only if step 2.5 records
  `ICON-ART: APPROVED` in the journal. On `ICON-ART: REJECTED — paw print stays`, the phase closes
  green with the paw print intact. This is the caveat the owner pre-accepted (journal lines 12–15).

### Orchestrator notes (not part of any packet)

- **Commit every step before dispatching the next.** Each step's validation counts changed paths
  with `git status --porcelain`, so an uncommitted predecessor makes the next gate unpassable.
  This is exactly what bit step 1.4 in Phase 1; it is a procedure rule, not a worker's problem.
- The `git status --porcelain -- public scripts tests docs lib api data` pathspec deliberately
  excludes `.oplan/` and `README.md`, so the orchestrator's own workspace writes never show up in
  a worker's gate.

### Phase 2 acceptance criteria (frozen before execution)

1. `npm test` reports `# fail 0` and `# pass 154` (151 + 3 from `tests/background.test.js`), or
   `# pass 157` if the icon steps ran (+3 from `tests/icons.test.js`).
2. `node scripts/check-contrast.mjs` exits 0, its last line is `ALL PASS`, and
   `grep -c '^PASS'` is **52**.
3. `grep -qF -- 'const CACHE = "magic-vet-v7";' public/sw.js` passes, `grep -rq 'magic-vet-v6'`
   over `public/ tests/` finds nothing, and `git diff 679dcc9 -- public/sw.js` shows exactly 2
   changed lines (one `-`, one `+`) — proving `PRECACHE` was not touched.
4. `STEP-2.1-OK` … `STEP-2.4-OK` all printed; plus `STEP-2.6-OK`, `STEP-2.7-OK` if the art landed.
5. `git diff --name-only 679dcc9 -- . ':!.oplan'` lists exactly: `public/styles.css`,
   `scripts/check-contrast.mjs`, `tests/background.test.js`, `public/views/reader.js`,
   `public/sw.js`, `tests/shell.test.js`, `docs/visual-design.md`, `README.md` — plus, only if the
   art landed: `assets/delight/app-icon.png`, `scripts/build-icons.js`,
   `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`,
   `public/manifest.webmanifest`, `public/index.html`, `tests/icons.test.js`.
6. `public/icons/icon.svg` is byte-unchanged from `679dcc9` and still in `PRECACHE`.
7. Nothing under `data/`, `lib/`, `api/` changed. The learner's profile was never contacted: the
   only server run in this phase is local, on `PORT=4173`, with `DATA_DIR` in the scratchpad
   (field-guide 11).

### Step 2.1 — artwork-derived page background, provably AA-safe

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/styles.css`, `scripts/check-contrast.mjs`,
  `tests/background.test.js` (NEW). Nothing else.
- **Commands:** none — direct file edits.
- **Goal:** `body` paints a four-layer artwork composition; every painted colour is a `:root`
  token; the gate covers all four layers with the same six pairs it already applies to
  `--color-bg` (52 total) and exits 0; a new test freezes the composition and runs the gate.
- **Edit 1 — `public/styles.css` `:root`.** Insert these four declarations immediately after the
  existing `--color-glow: #fde3a2;` line, in this order and with these exact values (VP-2):
```css
  --color-bg-top: #361d08;
  --color-bg-glow-violet: #321f1a;
  --color-bg-glow-teal: #282416;
  --color-bg-glow-amber: #331f0c;
```
- **Edit 2 — the `body` rule becomes exactly this** (it currently has `background:`,
  `background-color:` and `background-attachment:`; the `background:` shorthand and its raw
  `#3d2109` disappear). Each gradient layer goes on its own line:
```css
body {
  font-family: "Rubik", system-ui, -apple-system, "Segoe UI", sans-serif;
  background-color: var(--color-bg);
  background-image:
    radial-gradient(circle 520px at 8% 2%, var(--color-bg-glow-violet) 0%, transparent 70%),
    radial-gradient(circle 420px at 96% 12%, var(--color-bg-glow-teal) 0%, transparent 70%),
    radial-gradient(circle 640px at 50% 104%, var(--color-bg-glow-amber) 0%, transparent 72%),
    linear-gradient(180deg, var(--color-bg-top) 0%, var(--color-bg) 340px);
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: var(--color-ink);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
```
- **Edit 3 — `scripts/check-contrast.mjs`.** Append 24 entries to the END of the `PAIRS` array and
  change nothing else in the file (no function is modified). For each of the four new tokens, in
  the order `--color-bg-top`, `--color-bg-glow-violet`, `--color-bg-glow-teal`,
  `--color-bg-glow-amber`, replicate the six pairs the array already has against `--color-bg`,
  with the SAME `min` values and the existing label plus a layer suffix — suffixes are
  `(top wash)`, `(violet glow)`, `(teal glow)`, `(amber glow)`:
  `--color-ink` min 4.5 `"body text on page <suffix>"` ·
  `--color-muted` min 4.5 `"muted text on page <suffix>"` ·
  `--color-primary` min 3 `"app title on page, large text <suffix>"` ·
  `--color-teal` min 4.5 `"teal text on page <suffix>"` ·
  `--color-danger` min 4.5 `"error text on page <suffix>"` ·
  `--color-border` min 3 `"control border on page, WCAG 1.4.11 <suffix>"`.
  All 24 pass — see the VP-3 table.
- **Edit 4 — `tests/background.test.js` (NEW).** `node:test` + `node:assert`, same header style as
  `tests/shell.test.js` (`__dirname`, `root`, `publicDir` derived the same way), exactly **three**
  tests:
  1. `'styles.css defines the four background paint tokens with their frozen values'` — asserts
     each of the four `--token: #hex;` strings from Edit 1 is present in `public/styles.css`.
  2. `'body background-image is composed only of the frozen background paint layers'` — extract
     the value with `css.match(/background-image:\s*([^;]*);/)` — **this is the required
     extraction; do NOT try to parse the `body { … }` rule, because `html,\nbody { … }` appears
     first in the file and a naive rule regex matches that one instead.** `background-image`
     appears exactly ZERO times in the file today, so after Edit 2 the match is unique. Collapse
     all whitespace runs in the captured value to a single space, trim it, and
     `assert.strictEqual` it to:
     `radial-gradient(circle 520px at 8% 2%, var(--color-bg-glow-violet) 0%, transparent 70%), radial-gradient(circle 420px at 96% 12%, var(--color-bg-glow-teal) 0%, transparent 70%), radial-gradient(circle 640px at 50% 104%, var(--color-bg-glow-amber) 0%, transparent 72%), linear-gradient(180deg, var(--color-bg-top) 0%, var(--color-bg) 340px)`
     then assert the captured value contains no `#` character (that is the VP-1 guard).
  3. `'scripts/check-contrast.mjs exits 0'` — `spawnSync(process.execPath, [path.join(root,
     'scripts', 'check-contrast.mjs')])`, assert `status === 0`.
- **Non-goals:** do not change any of the 14 existing token VALUES or names; do not touch
  `--color-card` / `--color-surface-2` / `--color-nav`; do not add a background image file or touch
  `public/assets/`; do not modify `resolveMix` / `parseTokens` / `contrastRatio` / `main`; do not
  touch `public/sw.js` (step 2.3 owns the bump), `tests/shell.test.js`, any view, `README.md` or
  `docs/`; do not add a `prefers-color-scheme` block; do not add sparkles, noise textures, or a
  fifth layer; do not "improve" the four hex values — they are pinned by the VP-3 measurements.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- '--color-bg-top: #361d08;' public/styles.css \
  && grep -qF -- '--color-bg-glow-violet: #321f1a;' public/styles.css \
  && grep -qF -- '--color-bg-glow-teal: #282416;' public/styles.css \
  && grep -qF -- '--color-bg-glow-amber: #331f0c;' public/styles.css \
  && ! grep -q '#3d2109' public/styles.css \
  && grep -qF -- 'radial-gradient(circle 520px at 8% 2%, var(--color-bg-glow-violet) 0%, transparent 70%),' public/styles.css \
  && grep -qF -- 'radial-gradient(circle 420px at 96% 12%, var(--color-bg-glow-teal) 0%, transparent 70%),' public/styles.css \
  && grep -qF -- 'radial-gradient(circle 640px at 50% 104%, var(--color-bg-glow-amber) 0%, transparent 72%),' public/styles.css \
  && grep -qF -- 'linear-gradient(180deg, var(--color-bg-top) 0%, var(--color-bg) 340px);' public/styles.css \
  && C="$(node scripts/check-contrast.mjs)" \
  && printf '%s\n' "$C" | tail -1 | grep -qx 'ALL PASS' \
  && [ "$(printf '%s\n' "$C" | grep -c '^PASS')" = "52" ] \
  && [ "$(printf '%s\n' "$C" | grep -c '(#361d08)')" = "6" ] \
  && [ "$(printf '%s\n' "$C" | grep -c '(#321f1a)')" = "6" ] \
  && [ "$(printf '%s\n' "$C" | grep -c '(#282416)')" = "6" ] \
  && [ "$(printf '%s\n' "$C" | grep -c '(#331f0c)')" = "6" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 154' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "3" ] \
  && echo STEP-2.1-OK
```
- **Depends on:** nothing (baseline `679dcc9`).

### Step 2.2 — themed loading state in the reader

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/views/reader.js` — and nothing else.
- **Commands:** none — direct file edits.
- **Goal:** the "הקסם קורה..." wait screen shows a floating creature above a spinning
  violet→teal→amber magic ring instead of a grey ring, with motion damped under
  `prefers-reduced-motion`.
- **Edit 1 — inside `VIEW_STYLE`, replace the WHOLE `.reader-spinner { … }` block** (it currently
  sets `width/height/border-radius/border/border-top-color/animation`) with exactly:
```css
  .reader-spinner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--color-primary),
      var(--color-teal),
      var(--color-accent),
      var(--color-primary)
    );
    -webkit-mask-image: radial-gradient(circle, transparent 56%, #000 60%);
    mask-image: radial-gradient(circle, transparent 56%, #000 60%);
    animation: reader-spin 1.4s linear infinite;
  }
```
  `border-radius: 50%` is load-bearing: the mask's opaque region extends past the inscribed
  circle, so the radius is what clips the conic square's corners. Do not remove it. Ring thickness
  lands at ~4px plus a soft feather, matching the ring it replaces.
- **Edit 2 — keep the existing `@keyframes reader-spin` block exactly as it is** (it is reused,
  not duplicated) and immediately AFTER it add:
```css
  .reader-loading-art {
    animation: reader-float 3.2s ease-in-out infinite;
  }

  @keyframes reader-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .reader-spinner { animation-duration: 3.2s; }
    .reader-loading-art { animation: none; }
  }
```
- **Edit 3 — in `renderGenerating()`, the `.reader-loading` div becomes exactly:**
```html
      <div class="reader-loading">
        <img class="spot-image spot-image--sm reader-loading-art" src="/assets/placement-friend.webp" alt="" />
        <div class="reader-spinner" aria-hidden="true"></div>
        <p>הקסם קורה... רגע אחד</p>
      </div>
```
  `public/assets/placement-friend.webp` already exists (35142 bytes) and is already used by the
  placement view. `.spot-image` and `.spot-image--sm` already exist in `public/styles.css`
  (lines 380 and 393) — verified at plan time, which is why this step needs no CSS there.
- **Non-goals:** no new or changed Hebrew string — `הקסם קורה... רגע אחד` must survive verbatim,
  as must every other frozen string in `tests/reader-ui.test.js`; no change to any other rule in
  `VIEW_STYLE`; no change to `public/styles.css` (so `.spot-image*` stay as they are); no new
  asset; do not add `placement-friend.webp` to `PRECACHE`; no change to the placement view's
  loading UI; do not touch `public/sw.js`.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'animation: reader-spin 1.4s linear infinite;' public/views/reader.js \
  && grep -qF -- 'conic-gradient(' public/views/reader.js \
  && [ "$(grep -c 'mask-image: radial-gradient(circle, transparent 56%, #000 60%);' public/views/reader.js)" = "2" ] \
  && grep -qF -- '@keyframes reader-float' public/views/reader.js \
  && grep -qF -- 'animation: reader-float 3.2s ease-in-out infinite;' public/views/reader.js \
  && grep -qF -- '@media (prefers-reduced-motion: reduce)' public/views/reader.js \
  && grep -qF -- '<img class="spot-image spot-image--sm reader-loading-art" src="/assets/placement-friend.webp" alt="" />' public/views/reader.js \
  && ! grep -q 'border-top-color' public/views/reader.js \
  && [ "$(grep -c '@keyframes reader-spin' public/views/reader.js)" = "1" ] \
  && node --check public/views/reader.js \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 154' \
  && node scripts/check-contrast.mjs > /dev/null \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "1" ] \
  && echo STEP-2.2-OK
```
- **Depends on:** step 2.1 COMMITTED (its `# pass 154` and its 1-changed-path count both assume
  `tests/background.test.js` is already in the tree and everything else is clean).

### Step 2.3 — the service-worker cache bump (the one and only bump this phase)

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/sw.js`, `tests/shell.test.js` — and nothing else.
- **Commands:** none — direct file edits.
- **Goal:** returning devices fetch the new shell. `CACHE` goes `magic-vet-v6` → `magic-vet-v7`
  and `tests/shell.test.js` asserts the new string. Exactly two changed lines in each file (one
  `-`, one `+`).
- **Contracts:** VP-4 and VP-5 apply. `public/sw.js` line 1 becomes
  `const CACHE = "magic-vet-v7";`. In `tests/shell.test.js`, the single line
  `assert.ok(sw.includes('magic-vet-v6'));` (line 58) becomes
  `assert.ok(sw.includes('magic-vet-v7'));`. The `PRECACHE` array and its `deepStrictEqual`
  assertion (lines 60–75), including `/icons/icon.svg`, are byte-identical afterwards.
- **Non-goals:** do not add anything to `PRECACHE` (not the icon PNGs, not `public/assets/*.webp`);
  do not change the install / activate / fetch handlers; do not add any other assertion to
  `tests/shell.test.js` — the icon assertions live in `tests/icons.test.js` (step 2.7) precisely so
  no two steps write this file; do not bump to `v8` later in this phase.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const CACHE = "magic-vet-v7";' public/sw.js \
  && grep -qF -- "assert.ok(sw.includes('magic-vet-v7'));" tests/shell.test.js \
  && ! grep -rq 'magic-vet-v6' public/ tests/ \
  && [ "$(git diff 679dcc9 -- public/sw.js | grep -c '^[+-][^+-]')" = "2" ] \
  && [ "$(git diff 679dcc9 -- tests/shell.test.js | grep -c '^[+-][^+-]')" = "2" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 154' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "2" ] \
  && echo STEP-2.3-OK
```
- **Depends on:** steps 2.1 and 2.2 committed, so `public/` is final for the CSS work before the
  bump lands. Steps 2.6/2.7 come after and must NOT re-bump.

### Step 2.4 — amend the frozen visual contract and the README

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `docs/visual-design.md`, `README.md` — and nothing else.
- **Commands:** none — direct file edits.
- **Goal:** the frozen visual contract describes the background composition, the four new tokens,
  the 52-pair gate, the new motion rules, the superseding capture method and the `CACHE` carve-out;
  `README.md`'s pair count matches reality.
- **Edit 1 — §3, immediately BEFORE the `### Superseded (light-cream era, pre-2026-07-24)` heading**
  (line 68), add a subsection headed exactly
  `### Amendment 2026-07-25 — page background composition (visual-polish run)` containing:
  the four new tokens with values `#361d08` / `#321f1a` / `#282416` / `#331f0c` and their roles
  (top warm wash over the first 340px / upper-left violet light / upper-right teal light / lower
  amber lantern light); their measured `--color-border` floors 3.10 / 3.08 / 3.06 / 3.09; the
  statement that the previous raw literal top stop `#3d2109` put `--color-border` at **2.92:1**,
  below the 3:1 WCAG 1.4.11 minimum this section declares binding, and was invisible to the gate
  because it was a literal and not a token; the VP-1 rule that any colour painted in the `body`
  background must be one of these tokens (or `--color-bg`, or `transparent`) and must carry its own
  six pairs in `scripts/check-contrast.mjs`; the convexity argument (per-channel convex
  combination + luminance convex per channel ⇒ no composite pixel is lighter than the lightest
  layer, so checking the four layer colours is sufficient); and that `tests/background.test.js`
  now asserts both the exact composition and that the gate exits 0.
- **Edit 2 — §3 "Accessibility gate"** (line 93): `28 pairs` → `52 pairs`.
- **Edit 3 — §5, the Motion bullet:** add that the loading state uses
  `reader-spin 1.4s linear infinite` on a conic-gradient magic ring and
  `reader-float 3.2s ease-in-out infinite` on the `placement-friend` spot image, both damped under
  `@media (prefers-reduced-motion: reduce)`.
- **Edit 4 — §7, add one bullet:** capture is by the field-guide lesson 15 method (fetch the blob
  in-page, click ONE synthetic `<a download="name.png">`), which **supersedes** the
  "Download button → newest file in `~/Downloads`" instruction in this section and in
  `design.md` §7; that heuristic is what produced the 89-duplicate burst already recorded in §7.
  Write the words `field-guide lesson 15` verbatim.
- **Edit 5 — §8, the DON'T bullet reading "Touch `public/sw.js` or its PRECACHE list; it is
  untouchable and frozen by a test (GC-D2)"**: keep the rule and add the VP-4 carve-out — the
  `CACHE` version string is the single sanctioned exception and MUST be bumped in the same phase as
  any change to a precached file (field-guide lesson 9); everything else in `sw.js`, above all the
  `PRECACHE` array, stays frozen.
- **Edit 6 — `README.md` line 45:** `checks 28` → `checks 52`.
- **Non-goals:** do not change §1, §2, §4, §6 or the rest of §8; do not touch the FROZEN STYLE
  SUFFIX; do not add the app-icon inventory row (step 2.7 owns it); do not restate token values
  that did not change; do not edit `design.md` or `.oplan/`; do not touch any file under `public/`,
  `tests/` or `scripts/`.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- '### Amendment 2026-07-25 — page background composition (visual-polish run)' docs/visual-design.md \
  && grep -qF -- '--color-bg-top' docs/visual-design.md \
  && grep -qF -- '--color-bg-glow-violet' docs/visual-design.md \
  && grep -qF -- '--color-bg-glow-teal' docs/visual-design.md \
  && grep -qF -- '--color-bg-glow-amber' docs/visual-design.md \
  && grep -qF -- '2.92' docs/visual-design.md \
  && grep -qF -- 'reader-float 3.2s ease-in-out infinite' docs/visual-design.md \
  && grep -qF -- 'prefers-reduced-motion' docs/visual-design.md \
  && grep -qF -- 'tests/background.test.js' docs/visual-design.md \
  && grep -qF -- 'field-guide lesson 15' docs/visual-design.md \
  && grep -qF -- '52 pairs' docs/visual-design.md \
  && ! grep -q '28 pairs' docs/visual-design.md \
  && grep -qF -- 'checks 52' README.md \
  && ! grep -q 'checks 28' README.md \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 154' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "1" ] \
  && [ "$(git status --porcelain -- README.md | grep -c '')" = "1" ] \
  && echo STEP-2.4-OK
```
- **Depends on:** steps 2.1–2.3 committed (it documents what they shipped), and BLOCKER 1 answered
  (see below — it is answered YES in this plan).

### Step 2.5 — generate the app-icon artwork + owner gate  (ORCHESTRATOR-RUN, NOT DISPATCHED)

- **Why not dispatchable:** the image must come from the FREE ChatGPT web route driven by a browser
  (field-guide lesson 15, standing owner policy). A cheap worker subagent cannot drive that browser,
  and GC-D8 requires an owner review of every new asset before integration — a live gate, not a
  file operation.
- **Files:** `assets/delight/app-icon.png` (NEW). Nothing else. Previews go to the scratchpad,
  never the repo.
- **Procedure:**
  1. Use the ONE dedicated chat from `docs/visual-design.md` §7 / `design.md` §7:
     `https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc`. One generation at a time.
  2. Prompt (frozen), with the FROZEN STYLE SUFFIX from §6 appended verbatim:
     *"Square image (1:1) designed as a mobile app icon: a tight centered head-and-shoulders
     portrait of the same brown-haired girl vet apprentice from this chat (messy bun, teal apron
     with paw-print patch) cheek to cheek with the same small teal baby dragon, the pair filling
     only the middle of the frame with generous empty margin on all four sides, simple deep
     warm-brown background with a soft golden glow behind them, no props and no clutter, bold
     clear shapes that stay readable when shrunk very small."*
  3. Capture per field-guide lesson 15: fetch the blob in-page, click ONE synthetic
     `<a download="app-icon.png">`. Do not re-click; poll from the shell. Never use the
     "newest file in `~/Downloads`" heuristic.
  4. Move to `assets/delight/app-icon.png` (§6 storage rule: masters live in `assets/delight/`).
  5. Mechanical checks before the owner sees it: `md5sum` differs from all 8 existing masters AND
     from `assets/design-tests/dragon-clinic-test.png` (§7 distinctness rule); `sharp` metadata
     reports `format=png`, square, width ≥ 1024.
  6. Render 48px, 96px and 192px previews into the scratchpad, look at them, and put them in front
     of the owner.
  7. **OWNER GATE (GC-D8).** Record in the journal exactly one of:
     `ICON-ART: APPROVED` or `ICON-ART: REJECTED — paw print stays`.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && node --input-type=module -e "
import sharp from 'sharp'; import { createHash } from 'node:crypto'; import { readFileSync, readdirSync } from 'node:fs';
const m = await sharp('assets/delight/app-icon.png').metadata();
if (m.format !== 'png') throw new Error('not png: ' + m.format);
if (m.width !== m.height) throw new Error('not square: ' + m.width + 'x' + m.height);
if (m.width < 1024) throw new Error('too small: ' + m.width);
const h = p => createHash('md5').update(readFileSync(p)).digest('hex');
const mine = h('assets/delight/app-icon.png');
const others = readdirSync('assets/delight').filter(f => f !== 'app-icon.png').map(f => 'assets/delight/' + f).concat(['assets/design-tests/dragon-clinic-test.png']);
for (const o of others) if (h(o) === mine) throw new Error('duplicate bytes of ' + o);
console.log('ICON-MASTER-OK ' + m.width + 'x' + m.height + ' md5=' + mine);" \
  && [ "$(git status --porcelain -- assets | grep -c '')" = "1" ] \
  && echo STEP-2.5-OK
```
  Pass = `ICON-MASTER-OK …`, `STEP-2.5-OK`, and an owner verdict line in the journal.
  **`STEP-2.5-OK` alone does not authorise 2.6/2.7 — only `ICON-ART: APPROVED` does (VP-6).**
- **Non-goals:** do not regenerate or touch any of the 8 existing masters; do not run
  `scripts/optimize-assets.js` (it would rewrite all 8 `public/assets/*.webp`); do not add
  `app-icon` to its `WIDTHS`; do not write anything under `public/`; do not touch `docs/`; do not
  open a second chat; no image generation through the paid API.
- **Depends on:** nothing in 2.1–2.4.

### Step 2.6 — derive the icon PNGs from the master  (CONDITIONAL on `ICON-ART: APPROVED`)

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `scripts/build-icons.js` (NEW), `public/icons/icon-192.png` (NEW),
  `public/icons/icon-512.png` (NEW), `public/icons/icon-maskable-512.png` (NEW). Nothing else.
- **Commands:** `node scripts/build-icons.js`
- **Goal:** a committed, deterministic script turns the master into the three PNGs the manifest
  will reference.
- **Contracts:** `scripts/build-icons.js` mirrors `scripts/optimize-assets.js` in style (ESM,
  `import sharp from "sharp"`, `__dirname` via `fileURLToPath`, a `main()` with
  `.catch(err => { console.error(err); process.exit(1); })`), reads `assets/delight/app-icon.png`,
  writes into `public/icons/`, and logs `wrote <path>` per file. Exactly three outputs:
  - `icon-192.png` — `.resize(192, 192, { fit: "cover" }).png({ compressionLevel: 9 })`
  - `icon-512.png` — `.resize(512, 512, { fit: "cover" }).png({ compressionLevel: 9 })`
  - `icon-maskable-512.png` — `.resize(410, 410, { fit: "cover" }).extend({ top: 51, bottom: 51,
    left: 51, right: 51, background: "#2e1806" }).png({ compressionLevel: 9 })` → 512×512
    (`410 + 51 + 51 = 512`) with the subject inside the central 80% safe zone, padded in the theme
    colour `#2e1806` = `rgb(46, 24, 6)`.
  `sharp` is already a devDependency (`^0.35.3`); no dependency additions.
- **Non-goals:** do not modify or delete `public/icons/icon.svg`; do not touch
  `public/manifest.webmanifest`, `public/index.html`, `public/sw.js`, `tests/` or `docs/` (step 2.7
  owns those); do not add the PNGs to `PRECACHE`; do not touch `scripts/optimize-assets.js`; do not
  generate a `.webp` icon (Android needs PNG); do not hand-edit any PNG. If the two md5 sets differ,
  STOP and report — do not attempt to force determinism.
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && node scripts/build-icons.js \
  && H1="$(md5sum public/icons/icon-192.png public/icons/icon-512.png public/icons/icon-maskable-512.png | cut -d' ' -f1 | tr '\n' ' ')" \
  && node scripts/build-icons.js \
  && H2="$(md5sum public/icons/icon-192.png public/icons/icon-512.png public/icons/icon-maskable-512.png | cut -d' ' -f1 | tr '\n' ' ')" \
  && [ "$H1" = "$H2" ] \
  && node --input-type=module -e "
import sharp from 'sharp';
const want = { 'public/icons/icon-192.png': 192, 'public/icons/icon-512.png': 512, 'public/icons/icon-maskable-512.png': 512 };
for (const [p, n] of Object.entries(want)) {
  const m = await sharp(p).metadata();
  if (m.format !== 'png' || m.width !== n || m.height !== n) throw new Error(p + ' is ' + m.format + ' ' + m.width + 'x' + m.height);
}
const crop = await sharp('public/icons/icon-maskable-512.png').extract({ left: 4, top: 4, width: 8, height: 8 }).png().toBuffer();
const c = await sharp(crop).stats();
const [r, g, b] = c.channels.map(ch => Math.round(ch.mean));
if (r !== 46 || g !== 24 || b !== 6) throw new Error('maskable padding is rgb(' + r + ',' + g + ',' + b + '), expected rgb(46,24,6)');
console.log('ICONS-OK deterministic=yes');" \
  && [ "$(md5sum public/icons/icon.svg | cut -d' ' -f1)" = "$(git show 679dcc9:public/icons/icon.svg | md5sum | cut -d' ' -f1)" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 154' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "4" ] \
  && echo STEP-2.6-OK
```
- **Depends on:** step 2.5 with `ICON-ART: APPROVED`.

### Step 2.7 — ship the icon in the manifest, iOS link, tests and docs  (CONDITIONAL on 2.6)

- **Tier:** WORKER (Sonnet) · **Retry budget:** 2
- **Files it may touch:** `public/manifest.webmanifest`, `public/index.html`,
  `tests/icons.test.js` (NEW), `docs/visual-design.md`. Nothing else.
- **Commands:** none — direct file edits.
- **Goal:** the OS picks the generated artwork for the home screen and the Android splash; the SVG
  paw print survives as the `"any"` fallback at `icons[0]`; a new test file freezes the icon set.
- **Contracts:**
  - `public/manifest.webmanifest` `icons` becomes exactly these four entries, in this order:
    `{"src":"/icons/icon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"}`,
    `{"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"}`,
    `{"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"}`,
    `{"src":"/icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}`.
    `icons[0].src` stays `/icons/icon.svg` so `tests/shell.test.js:30` keeps passing; its `purpose`
    narrows from `"any maskable"` to `"any"` so the maskable slot is unambiguously owned by the PNG
    and the artwork actually reaches the home screen. `name`, `short_name`, `start_url`, `display`,
    `dir`, `lang`, `background_color`, `theme_color` are untouched.
  - `public/index.html` line 11: the `apple-touch-icon` href changes from `/icons/icon.svg` to
    `/icons/icon-192.png` (iOS ignores the manifest and does not accept SVG for the home screen).
    The `rel="icon"` SVG link stays. Nothing else on the page changes.
  - `tests/icons.test.js` (NEW) — `node:test` + `node:assert`, header style of
    `tests/shell.test.js`, exactly **three** tests:
    1. `'every manifest icon file exists and has its declared pixel size'` — for each `icons[]`
       entry the file exists under `public/`; for the three PNGs read width/height from the PNG
       IHDR header (bytes 16–20 and 20–24, big-endian `readUInt32BE`, no `sharp` import) and assert
       192×192, 512×512, 512×512.
    2. `'manifest icons list the svg fallback plus the three generated pngs, in order'` —
       `assert.deepStrictEqual(manifest.icons, [...])` against the four-entry array above.
    3. `'index.html points apple-touch-icon at the png'` — asserts
       `<link rel="apple-touch-icon" href="/icons/icon-192.png" />` is present and the substring
       `apple-touch-icon" href="/icons/icon.svg` is absent.
  - `docs/visual-design.md` §6: add ONE inventory row — `app-icon.png` | square | 1254×1254 |
    (ORCHESTRATOR AMENDMENT 2026-07-25: the plan predicted 1024×1024 before the art existed; the
    actual generation is 1254×1254, which happens to match the three existing square masters. The
    frozen validation only ever required `width >= 1024`, so it passed — but the doc row must state
    the real dimensions, not the predicted ones.) |
    "PWA install icon + Android splash; derived to `public/icons/icon-192.png`, `icon-512.png`,
    `icon-maskable-512.png` by `scripts/build-icons.js`" — add the step-2.5 prompt verbatim to the
    per-asset prompt list, and record the owner gate (`ICON-ART: APPROVED`) plus the fact that the
    maskable variant pads the artwork to the central 80% on `#2e1806`.
    **SPEC CORRECTION (orchestrator, after the 2.7 audit found a real mismatch):** "the same format
    the existing prompts use" was too vague. Stated explicitly: all 8 pre-existing entries close with
    a literal ` + SUFFIX` after the quoted prompt, because the FROZEN STYLE SUFFIX is appended to
    every generation. The new entry MUST end `…shrunk very small." + SUFFIX`. Dropping that marker
    implies the icon was generated WITHOUT the frozen style suffix — false, and misleading to whoever
    regenerates it next.
- **Non-goals:** do not touch `public/sw.js` — `v7` from step 2.3 already covers `index.html` and
  `manifest.webmanifest` (VP-5); do not add anything to `PRECACHE`; do not edit
  `tests/shell.test.js` (step 2.3 owns that file — this is why the icon assertions live in their
  own file); do not delete `public/icons/icon.svg`; do not add `screenshots`, `shortcuts` or any
  other manifest field; do not change §3/§5/§7 of the doc (step 2.4 owns those).
- **Validation (frozen):**
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && node -e "
const m = JSON.parse(require('fs').readFileSync('public/manifest.webmanifest','utf8'));
const want = [
  { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
];
if (JSON.stringify(m.icons) !== JSON.stringify(want)) throw new Error('icons mismatch: ' + JSON.stringify(m.icons));
if (m.background_color !== '#241305' || m.theme_color !== '#2e1806') throw new Error('colors changed');
console.log('MANIFEST-ICONS-OK');" \
  && grep -qF -- '<link rel="apple-touch-icon" href="/icons/icon-192.png" />' public/index.html \
  && grep -qF -- '<link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />' public/index.html \
  && grep -qF -- 'app-icon.png' docs/visual-design.md \
  && grep -qF -- 'const CACHE = "magic-vet-v7";' public/sw.js \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 157' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "4" ] \
  && echo STEP-2.7-OK
```
- **Depends on:** step 2.6, step 2.3 committed (`v7` present), and step 2.4 committed (both write
  `docs/visual-design.md`; 2.4 first, then 2.7 appends to §6 only). **The orchestrator must not
  reorder 2.4 and 2.7.**

### Step 2.8 — runtime proof in a real browser  (ORCHESTRATOR-RUN, NOT DISPATCHED)

- **Why not dispatchable:** browser driving plus the field-guide-12 cache dance, aimed at a LOCAL
  server with a scratch `DATA_DIR`, never production.
- **Goal:** the background and the loading animation are confirmed from the DOM, not from a
  hopeful screenshot.
- **Procedure:** start `DATA_DIR=<scratchpad>/data PORT=4173 npm run dev`; open
  `http://localhost:4173/`; unregister the service worker and `caches.delete(...)` every key, then
  ctrl+shift+R (field-guide 12); assert from the DOM that
  `getComputedStyle(document.body).backgroundImage` contains `rgb(50, 31, 26)`, `rgb(40, 36, 22)`,
  `rgb(51, 31, 12)` and `rgb(54, 29, 8)` — the resolved `#321f1a` / `#282416` / `#331f0c` /
  `#361d08`. Plain hex tokens resolve to `rgb(...)`, so field-guide lesson 14's `color(srgb …)`
  trap does not apply here. Then navigate to `#/reader` and, **without generating a chapter**,
  inject the `.reader-loading` markup into `#app` via page JS to confirm the ring and the floating
  creature render; screenshot home and the injected loading state. Stop the server.
- **Contracts:** `DATA_DIR` must point at the scratchpad, because `GET /api/profile` CREATES a
  profile when none exists (field-guide 11); no `POST /api/chapter` — a real generation costs an
  OpenAI call and writes a profile; no request to the deployed app.
- **Non-goals:** no deployment (Phase 3); no repo file written; no `.data/` access.
- **Depends on:** 2.1 and 2.2 committed; run after 2.7 (or after 2.4 if the icon is rejected) so
  one pass covers everything.

### Risks

- **The glows may read as "nothing changed" on a bright screen.** They are capped by the
  `--color-border` 3:1 floor, which limits each tint to roughly a 9% mix. Noticed at step 2.8's
  screenshot and by the owner. If the owner wants bolder, the only honest routes are lightening
  `--color-border` (a test-frozen token value) or accepting a WCAG 1.4.11 regression — both owner
  decisions, both outside this plan. A worker must not "improve" the values.
- **`conic-gradient` + `mask-image` on an old Android WebView.** Failure mode is benign: a filled
  multicolour disc instead of a ring, never a broken layout. Visible in 2.8.
- **`background-attachment: fixed` on iOS Safari** is already how the app ships, so the glows
  inherit whatever behaviour the current wash has. No new exposure; a mismatch would show as glows
  scrolling with content — cosmetic.
- **A future fifth background layer with a raw hex would silently defeat the gate** — the exact
  class of bug in field-guide lessons 13/14. `tests/background.test.js` test 2 (exact-string
  composition, no `#` permitted) plus test 3 (the gate runs inside `npm test`) make it loud.
- **The installed icon may not change on the learner's device.** Android often refreshes a manifest
  icon only on re-install. Nothing in the record says whether the PWA is currently installed — see
  the record gaps. To be stated plainly to the owner rather than discovered.
- **Two steps write `docs/visual-design.md` (2.4, then 2.7).** Out of order, the doc edits collide.
  The dependency line is the guard.

### Blockers — both ANSWERED by the orchestrator (oplan §10 step 11)

**BLOCKER 1 — owner approval to amend `docs/visual-design.md`.** Its header says changes require
explicit owner approval and forbid silently "improving" the visual system. The journal records
owner approval of the three visual CHANGES but nothing about editing the frozen document itself.
**ANSWER: proceed.** That rule exists to prevent silent, unapproved drift; step 2.4 does the
opposite — it records changes the owner explicitly commissioned and corrects two statements that
are already factually false (the "28 pairs" count, and a capture method §7 itself documents as
having caused an 89-duplicate burst). Leaving the doc unamended would leave the frozen contract
lying about the code, which is the failure this rule is meant to prevent. On the one substantive
value change: `#3d2109` → `#361d08` is not a new design choice, because the current value
**violates §3's own binding 3:1 border rule at 2.92:1** — the change enforces the frozen contract
rather than altering it. It is one commit, fully reversible, and it goes into STATUS.md where the
owner will see it.

**BLOCKER 2 — the GC-D8 owner gate for a ninth asset cannot be decided from files.** §6 freezes an
8-asset inventory and §8 requires owner-gating every new asset before integration. The owner
pre-accepted the CAVEAT ("if it does not read at 48px the paw print stays") but the gate itself
needs the owner. **ANSWER: split the phase.** Steps 2.1–2.4 and 2.8 need no owner and run now;
step 2.5 generates the art and puts 48/96/192px previews in front of the owner; steps 2.6–2.7
integrate it ONLY on `ICON-ART: APPROVED` (VP-6). If the owner is unreachable in this window the
phase closes green with the paw print intact — exactly the pre-accepted caveat. The acceptance
criteria above are written to pass either way, which is why criterion 1 has two legal totals.

### Record gaps found by the fresh planner, and how each was repaired

| Gap | Repair |
|---|---|
| `design.md` exists on disk (9304 bytes) but was never copied into the workspace, and the orchestrator's own planner packet wrongly said "not present". | **Copied to `.oplan/band2-and-polish/design.md`.** oplan §5 requires it; the run had been violating that since it opened. |
| The page background is documented in no frozen doc — `#3d2109` lived only in a previous run's `plan.md`. | Step 2.4 Edit 1. |
| An unrecorded WCAG 1.4.11 shortfall: `--color-border` on the painted wash is 2.92:1, under the binding 3:1, invisible to the gate because the value was a literal. | Step 2.1 fixes it; step 2.4 Edit 1 records it; VP-1 prevents recurrence. |
| Two contradictory image-capture procedures (`docs` §7 and `design.md` §7 vs field-guide 15). | Step 2.4 Edit 4 — field-guide 15 wins. |
| Two contradictory service-worker rules (GC-D2 "untouchable" vs the mandatory CACHE bump). | VP-4, written into §8 by step 2.4 Edit 5. |
| `README.md` duplicates the gate's pair count with no cross-reference, so the two drift. | Step 2.4 Edit 6 updates both. |
| No record of whether the PWA is currently installed on the learner's device, so nothing predicts whether the new icon appears without a re-install. | Unknowable from files — logged as an owner-facing note in `phase-state.md` for Phase 3. |
| `scripts/check-contrast.mjs` was never wired into `npm test`. | Step 2.1's third test; promote to the field guide at the phase close. |
| The Phase 2 skeleton assumed `icon.svg` could be replaced, which the frozen tests forbid. | Recorded under "How reality differs from the skeleton"; the skeleton was drafted without applying field-guide lesson 7. |

## Phase 3 — deploy and verify  (skeleton)

Deploy to Vercel, verify live by read-only GETs, and confirm the learner profile was never
contacted. A real chapter generation at A2 costs an OpenAI call and writes a profile — so it is
tested against a LOCAL server with a scratch `DATA_DIR`, never production.

## Deferred (surfaced, not silently dropped)

**Harder placement items.** The test still cannot discriminate above A2: all 12 vocabulary items
and both reading passages are elementary. Adding harder items would change
`meta.task2TextCount`/`task2QuestionCount` and the `task2 must have exactly 2 items` assertion in
`tests/placement-items.test.js` — a frozen-test contract change needing owner approval, plus new
audio and/or artwork. Not in this run. Consequence to state plainly: after this run a strong
reader still lands on A2, but A2 now actually means something.
