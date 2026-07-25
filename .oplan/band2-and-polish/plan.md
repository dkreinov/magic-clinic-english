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

## Phase 2 — visual polish  (skeleton)

Owner-directed: more of the artwork's design in three places.
1. **Background** — an artwork-derived backdrop behind the app shell, subtle enough that body text
   keeps its WCAG AA margin (`scripts/check-contrast.mjs` must still exit 0).
2. **Install icon + splash** — replace the flat paw-print `public/icons/icon.svg` with generated
   artwork of the girl and dragon, sized/cropped for `purpose: "any maskable"` (OS crops to a
   circle/squircle, so the subject must sit inside a safe zone). Owner accepted the caveat that if
   the art does not read at 48px, the paw print stays. Requires PNG icons at 192/512 plus manifest
   entries. Generated via the FREE ChatGPT web route per standing owner policy.
3. **Loading animation** — replace the plain `.reader-spinner` ring with something themed.
Any change under `public/` requires the sw `CACHE` bump (`magic-vet-v6` → `v7`) with its test
string, in the same phase that ships it (field-guide lesson 9).

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
