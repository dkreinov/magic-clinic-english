# WORD-POLISH — PHASE 1 "the three code changes" IN FULL (draft)

Planned 2026-08-01 by a fresh planner (Opus), **read-only of the repository and of production**.
Nothing in the repository was changed by this pass. No authenticated request of any kind was made.
`/api/profile` was never requested, in any form, by this planner. The only profile data this plan
touched is the **already-captured, on-disk** read-back
`C:/Users/dkreinov/trophies-deploy/readback-2.json` (written by word-trophies phase 4), read
locally with `fs.readFileSync`.

---

## WHAT THIS PLANNER MEASURED TODAY (nothing below is quoted from the record without re-measuring)

Run 2026-08-01 against the clean worktree at `2fd6e82`
(`git status --porcelain -uall | awk '$NF !~ /^\.oplan\//'` = **0 lines**).

| measured | command / method | result |
|---|---|---|
| suite, plain | `npm test` | `# tests 349`, `# fail 0`, plan `1..344` |
| suite, gated | `APP_CODE=dummy npm test` | `# tests 349`, `# fail 0` |
| flat ledger | `grep -h -c '^test(' tests/*.js \| awk '{s+=$1} END{print s+0}'` | **344** (349 − 344 = **5** subtests in `tests/dev-server.test.js`, measured not assumed) |
| contrast anchor | `node scripts/check-contrast.mjs \| grep -c '^PASS'` | **58**, and it prints `ALL PASS` |
| `public/` file count | the frozen walker (§VAL-P1) | **2372** |
| `public/` digest outside the 3 touchable paths | the frozen walker (§VAL-P1) | **`2369 839de1b098be5014a4488ba79064a1ab`** |
| `public/quiz.js` md5 | `md5sum` | `69b6d71117cf776715374abc6f0abb02` (QZ-18 frozen) |
| `public/quiz-core.js` md5 | `md5sum` | `9a2131be8b9d1b77c219f1e8c3482a71` (frozen) |
| `public/sw.js` md5 | `md5sum` | `d76f781dc49c5f629aba0f2dfe3304b6`, `CACHE = "magic-vet-v18"` at `sw.js:1` |
| `public/audio/words/index.json` md5 | `md5sum` | `8735a3c499508b04415046e2be4ad159`, **2254** entries, a flat array of strings, 19942 bytes |
| clips on disk | `readdirSync('public/audio/words')` | **2255** entries = **2254** `.aac` files + `index.json` |
| manifest ⟷ clips | set difference, both directions | **0 manifest entries without a clip; 0 clips outside the manifest.** The two sets are IDENTICAL |
| quiz item bank | `ls public/quiz` | **62** JSON files, **514** distinct option strings |
| quiz options without a clip | every `answer` + `distractor` in all 62 files vs the manifest | **0** — `public/quiz.js:131` has no dead speaker buttons either |
| both transcripts | `quiz-transcript.mjs`, `g1-transcript.mjs` diffed against their expected files | both **EMPTY** |
| `.data/profile.json` | `test -e` | **absent** |
| line endings of every file this phase touches or must not touch | an `rb` byte counter (never `grep`/`file`/`git diff`) | the table in **SK1-1** |
| the shelf artwork | `sharp().metadata()` + four extracted crops rendered and **looked at** | 640×640 webp, 24318 bytes; findings in **SK1-2** |
| her real chapters and glossary | `readback-2.json`, read locally | **6 chapters, 50 glossary entries, 36 distinct words** |
| §VAL-P1 | dry-run today against the clean tree | **exit 0**, `TOTAL=349 PLAN=344 FAILED=0 GTOTAL=349 GFAILED=0 FLAT=344 PASSES=58 PUBN=2372`, `PORC=[]` |

**No raw Hebrew glyph appears anywhere in this plan.** No new Hebrew string is authored by this
phase; the one Hebrew string the speaker button needs already exists at `public/views/reader.js:532`
and is not touched.

---

## THE THREE FINDINGS THAT RESHAPE THIS PHASE — read these before the steps

The design (`.oplan/word-polish/design.md`) was written from the record. Three of its load-bearing
premises are **false on disk today**, and two of them would have let this phase ship a green suite
and change nothing the child experiences — field-guide lesson 15, exactly.

### FINDING 1 (T2) — chapter-first quiz words change NOTHING today. Measured, not argued.

The end-of-chapter quiz asks a word only if `public/quiz/<lemma>.json` exists: `public/quiz.js:145`
fetches it and `:236` skips the word when it does not load. **That bank holds 62 lemmas.** Her six
chapters' glossaries hold 36 distinct words. The intersection is **exactly one word, `light`** — and
`light` is not a key in her `profile.words`, so `api/profile.js:130` would answer its
`quiz-answer` POST with `400 'unknown word'`, which `public/quiz.js:304` swallows: she would see a
question that scores nothing, awards no `quizRight` progress and never records `lastQuizAt`.

Driving the **shipped** `pickQuizWords` / `pickCandidateWords` and the shipped bank against her real
captured profile:

```
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]

[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]

[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
```

Per chapter, the glossary words that are even *recordable* (i.e. keys in `profile.words`) are
`ch4: figure afraid forest` · `ch5: creature bright afraid moon` · `ch6: shadow` — and **0 of them
have a bank item.** T2 as designed is a no-op for the learner, today and for as long as the bank
covers only her known-word path.

**What actually causes D2 ("the same exact questions"), proven from source:** `reader.js:344`
computes `lemmas` **once, inside `boot()`**. `runGenerate()` (`:374-390`) pushes a new chapter and
never recomputes it; `celebrateFromServer()` (`:397-405`) deliberately reads the fresh profile into
a **local** so the module-scope `profile` — and therefore `lemmas` — is frozen for the whole
sitting. So every chapter she finishes in one sitting is handed the identical array in the identical
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
and again, by construction.

**The ruling this plan makes** (the design explicitly delegates "what happens when the chapter
yields zero usable words" to the planner): the chapter-first list is built as designed **and** a
lemma already asked earlier in this sitting is moved to the **tail** of the top-up, not dropped.
Simulated on her real profile with the shipped selector and the shipped bank:

```
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
```

That is the only version of T2 that changes what she sees. See **SK1-3** and **BLOCKER B1**.

### FINDING 2 (T3a) — `canSay` is ALREADY honest. The design's premise is false.

Design §2 says `reader.js:674`'s `canSay: lemma !== null` "never checks that a clip exists."
It does, transitively, and the chain is airtight:

- `public/words-index.js:17` — `getAllowedSet()` **fetches `/audio/words/index.json`**, i.e. the
  audio manifest itself, and returns it as a `Set`. It is not a different list; it is *that* list.
- `reader.js:335` awaits it into `allowedWords`; `reader.js:670` calls
  `resolveLemma(dataWord, allowedWords)`, and `public/lemma.js` returns `null` unless the candidate
  it found **is a member of that set** (`lemma.js:1-18`, the exact-match-first rule).
- The manifest and the clip directory are **byte-identical sets**: 2254 entries, 2254 `.aac` files,
  measured today with zero difference in either direction.

Therefore `lemma !== null` ⟺ the lemma is in the manifest ⟺ `/audio/words/<lemma>.aac` exists.
Driving the shipped `resolveLemma` over all 36 of her glossary words: **36/36 honest, 0 lies.**
`after`, `deer`, `feet`, `glow(ing/s)`, `growls`, `harm`, `moon`, `nervous`, `scary`, `tightly`,
`wings`→`wing`, `softly`→`soft`, `suddenly`→`sudden`, `closer`→`close` all resolve exactly as an
honest button requires. `deep breath` normalises to `deepbreath`, resolves to `null`, no button.

The same holds for `public/views/words.js:159-162` (which already does the check explicitly) and,
measured, for `public/quiz.js:131` (0 of 514 option strings lack a clip).

**So the T3(a) code change the design asks for cannot be written — there is nothing to add.** What
is genuinely missing is the **gate**: the invariant "the allowed set IS the audio manifest, and every
manifest entry has a clip" is nowhere asserted, so the day someone appends a word to `index.json`
without generating its clip — which is **exactly what phase 2 is about to do** — `canSay` starts
lying and 349 tests stay green. Step 1.2 makes T3(a) that gate. See **SK1-4**.

### FINDING 3 (T1) — the fade really does erase the shelf, and the numbers say by how much.

`.hero-banner` shares `public/styles.css:379-391` with `.chapter-banner` and `.celebrate-image`:
`aspect-ratio: 3 / 2`, `object-fit: cover`, and
`mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%)`.

The source is 640×640. `cover` into a 3/2 box scales to width and shows source rows **107–533**.
The mask starts fading at 74% of the box height = **source row 423** and reaches full transparency
at row 533. Measured against the artwork: the shelf plank's front edge occupies rows **≈425–470**
and the string of lights rows **≈465–500**. So the fade begins one row into the shelf edge:

- the plank's front edge renders at **≈57% opacity**,
- the string of lights at **≈49% opacity**,
- everything below row 533 is gone entirely.

Both of the two features that identify the picture *as a shelf* sit inside the fade band. The crop
itself is fine — **only the mask is wrong.** See **SK1-2** for the ruling.

---

# PHASE 1: the three code changes

**GOAL:** `public/styles.css` gains one new class, `.shelf-banner`, inside the trophies section —
same box as `.hero-banner`, no bottom mask — and `public/views/trophies.js` uses it for the shelf
header instead of `.hero-banner`; `public/views/reader.js` gains one exported pure function,
`chapterQuizLemmas`, plus a per-chapter memo and a per-sitting asked-set, so the end-of-chapter quiz
draws from that chapter's glossary first and never asks the same four words twice in one sitting;
and `tests/reader-ui.test.js` gains the gate that makes `canSay`'s honesty an asserted invariant
instead of an accident. **No `CACHE` bump, no `sw.js` change, no deploy, no D25 capture, no touch of
her live profile, and no server change of any kind** (`lib/`, `api/`, `data/`, `scripts/` are
byte-untouched all phase). `public/quiz.js` and `public/quiz-core.js` are QZ-18 frozen and do not
move by one byte. No file is created or deleted anywhere in the repository.

---

## ACCEPTANCE CRITERIA (mechanical — all re-run at the phase close, step 1.5)

1. `npm test` exits 0 and prints `# tests 358`, `# fail 0`, and a top-level plan of `1..353`.
2. `APP_CODE=dummy npm test` exits 0 and prints the identical `# tests 358` / `# fail 0`.
3. Flat ledger: `grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}'` = **353**
   (344 measured today + 9 new: 2 in step 1.1, 3 in step 1.2, 4 in step 1.3).
   353 flat + **5** subtests in `tests/dev-server.test.js` = 358 reported. The 5 is measured:
   349 − 344 = 5 today.
4. `node scripts/check-contrast.mjs` exits 0, prints `ALL PASS`, and `grep -c '^PASS'` over its
   output = **58** — **the anchor does NOT move this phase.** No new colour token is added and no
   new contrast pair is added; `.shelf-banner` declares no colour at all.
5. `public/` file count is still exactly **2372**, and the digest of `public/` **outside** the three
   touchable paths is still `2369 839de1b098be5014a4488ba79064a1ab`. **No path under `public/` is
   created or deleted.**
6. `node .oplan/word-quiz/quiz-transcript.mjs` diffed against
   `.oplan/word-quiz/quiz-transcript-expected.txt` is EMPTY.
7. `node .oplan/word-g1/g1-transcript.mjs` diffed against
   `.oplan/word-g1/g1-transcript-expected.txt` is EMPTY.
8. `.data/profile.json` is absent (`test -e` false).
9. Write set vs the phase base is exactly these **5** paths and nothing else:
   ```
    M public/styles.css
    M public/views/reader.js
    M public/views/trophies.js
    M tests/reader-ui.test.js
    M tests/trophies-ui.test.js
   ```
   (0 created + 5 modified. `.oplan/` is the orchestrator record and is filtered out of every
   executor write set.)
10. **Zero files deleted** (`git diff --diff-filter=D --name-only <BASE>` empty) and the total
    deleted-line budget across the whole phase is exactly **5**, distributed as:
    `public/views/trophies.js` **1** (the class swap) · `public/views/reader.js` **4** (four
    one-for-one line replacements: one in step 1.2, three in step 1.3). **Arithmetic check:
    1 + 4 = 5, and the per-step budgets below are 1 (step 1.1) + 1 (1.2) + 3 (1.3) + 0 (1.4) +
    0 (1.5) = 5.** `public/styles.css`,
    `tests/reader-ui.test.js` and `tests/trophies-ui.test.js` all have a deletion budget of **0** —
    they are insert-only / append-only.
11. Line endings unchanged in KIND for every touched file, byte-counted with an `rb` counter, never
    `grep`/`file`/`git diff`. The kinds are the SK1-1 table. Exact counts are pinned where they were
    derived by counting a block quoted in this plan (`public/styles.css` **CRLF=729 LF=0**,
    `public/views/trophies.js` **LF=368 CRLF=0**, `public/views/reader.js` **CRLF=845 LF=0**), and
    only the KIND is pinned for the two appended test files, whose bodies an executor writes.
12. `tests/reader-ui.test.js` still carries exactly **355** raw non-ASCII bytes — the frozen Hebrew
    aria-label assertion at `:86` and nothing else — and `tests/trophies-ui.test.js` still carries
    **0**. No new Hebrew string enters the repository this phase, in any file.
13. `public/quiz.js` md5 is still `69b6d71117cf776715374abc6f0abb02` and `public/quiz-core.js` md5 is
    still `9a2131be8b9d1b77c219f1e8c3482a71`. `public/sw.js` md5 is still
    `d76f781dc49c5f629aba0f2dfe3304b6` (**no `CACHE` bump this phase**) and
    `public/audio/words/index.json` md5 is still `8735a3c499508b04415046e2be4ad159`
    (**phase 2 owns the clips**).
14. `lib/`, `api/`, `data/` and `scripts/` are byte-untouched:
    `git diff --name-only <BASE> -- lib api data scripts` is empty. `awardTrophies(` still appears
    **zero** times anywhere under `public/`.
15. `.hero-banner` is byte-unchanged: `public/styles.css` still contains the exact five-line
    `.hero-banner,` / `.chapter-banner,` / `.celebrate-image {` group and its
    `mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);`, and still
    contains `.hero-banner { margin-bottom: 16px; }`. The string `class="hero-banner"` appears
    **exactly twice** under `public/` after the phase — `public/views/home.js:54` and
    `public/views/reader.js:444`, both `src="/assets/hero-clinic.webp"`, both untouched (it appears
    **three** times today) — and **zero** times in `public/views/trophies.js`. Measured today:
    `grep -rn 'hero-banner' public/` returns exactly 5 lines — `styles.css:379`, `styles.css:392`,
    `views/home.js:54`, `views/reader.js:444`, `views/trophies.js:185`.
16. The composite — the real artwork under the real new CSS on a real screen — has been **looked at
    by a human** (step 1.4) and recorded. No assertion in this plan claims to cover it.

---

## DEPENDS ON (every row verified on disk today, tree clean at `2fd6e82`)

| thing | file:line | verified |
|---|---|---|
| the design, all four items and the non-goals | `.oplan/word-polish/design.md:1-103` | read in full |
| field guide, all 15 lessons | `.oplan/word-polish/field-guide/index.md` (`wc -l` = **133**) | read in full, 15 twice |
| the house plan SHAPE this plan matches | `.oplan/word-trophies/plan.md:1330-1500` (phase 3 header/AC/depends), `:1929-2043` (§VAL-P3), `:2133-2323` (a full step) | read |
| `.hero-banner` / `.chapter-banner` / `.celebrate-image` shared rule + the mask | `public/styles.css:379-391`, margins at `:392-394` | read |
| the trophies CSS section markers `trophyCss()` slices between | `tests/trophies-ui.test.js:71-72`, helper at `:74-81`; the markers are at `public/styles.css:415` and `:614` | read |
| the trophy section may contain **no** `#`, no `color-mix(`, no `background-image` | `tests/trophies-ui.test.js:331-333` | read |
| the shelf header's markup and its class today | `public/views/trophies.js:185` — `<img class="hero-banner" src="/assets/trophies/shelf-header.webp" alt="" />` | read |
| `trophies.js` emits **no** `<style>` tag at all — its CSS is global (lesson 14's fix) | `public/views/trophies.js` grep for `<style>` = 0 hits; `render()` at `:360-368` sets `container.innerHTML = screenHtml(profile)` | grepped + read |
| the banner is asserted present, once, before the first card | `tests/trophies-ui.test.js:259-284` | read |
| the img-source allow-list that a new class does NOT affect | `tests/trophies-ui.test.js:306-313` (matches `src="…"`, not classes) | read |
| `lemmas` built once in `boot()` | `public/views/reader.js:342-344` | read |
| the frozen source-needle pin on that exact line | `tests/reader-ui.test.js:210` — `'lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));'` | read |
| `lemmaCount` feeding the decision table | `public/views/reader.js:546`, table at `:295-300` | read |
| the quiz slot and the `startQuiz` call | `public/views/reader.js:745-763` | read |
| `startQuiz` takes the first `count` lemmas that LOAD, in order, and returns the session | `public/quiz.js:219-252`, `:233-245`, `:249`, `:345` | read |
| a bank item is fetched from `/quiz/<lemma>.json` and a miss returns `null` | `public/quiz.js:142-158` | read |
| the bank holds 62 lemmas | `ls public/quiz` | counted |
| a `quiz-answer` for a lemma not in `profile.words` is rejected `400 'unknown word'` | `api/profile.js:129-133`; `lib/profile.js:483-486` throws the same | read |
| `quiz.js` swallows that rejection, so the failure is invisible | `public/quiz.js:301-306` (`catch { resp = null; }`) | read |
| `chapterQuizState` is deepStrictEqual-pinned as exactly `{ started, done }` — **a third key would break it** | `tests/reader-ui.test.js:189-201`; the literal is `public/views/reader.js:305` | read |
| `canSay` and the speaker button | `public/views/reader.js:674`, `:532`, handler `:715-728` | read |
| `getAllowedSet()` fetches the audio manifest itself | `public/words-index.js:14-25`, the fetch at `:17` | read |
| `resolveLemma` returns only members of the set it is given | `public/lemma.js:1-64` | read |
| `api/profile.js` builds `ALLOWED_WORDS` from the same manifest | `api/profile.js:6`, `:12` | read |
| `words.js` already does the explicit clip check | `public/views/words.js:156-162` | read |
| the Fisher-Yates precedent this plan copies | `public/quiz-core.js:26-29` | read |
| the `PRECACHE` deepStrictEqual pin and the `CACHE` string pin that must **not** move this phase | `tests/shell.test.js:55-87` | read |
| the `node --check` sweep that auto-covers `public/**/*.js` | `tests/shell.test.js:33-54` | read |
| `tests/entry-code.test.js` guards only from `public/styles.css:614` onward | `tests/entry-code.test.js:30-43` | read |
| the `background-image` FIRST-match regex, which still matches `public/styles.css:39` | `tests/background.test.js:21-31` | read |
| her real chapters, glossary and words | `C:/Users/dkreinov/trophies-deploy/readback-2.json` (on disk, written by word-trophies phase 4) | read locally, never re-fetched |
| the sandbox visual-gate recipe (dev server, profile backup, port-3000 check) | `.oplan/word-trophies/plan.md:3197-3244` (step 3.6) | read |

**Baseline measured, not trusted:** tree clean at `2fd6e82`; `npm test` → 349 reported / 0 fail /
plan `1..344`; flat 344; contrast 58; `public/` 2372 files; both transcripts EMPTY; no
`.data/profile.json`.

**Nothing in phase 1 is already done:** `public/styles.css` contains no `shelf-banner`;
`public/views/trophies.js:185` still says `class="hero-banner"`; `public/views/reader.js` contains
no `chapterQuizLemmas`; nothing anywhere asserts the manifest/clip correspondence.

---

## SKELETON CHANGES — where reality differs from the design, decided here, with citations

### SK1-1 — LINE ENDINGS, MEASURED TODAY WITH AN `rb` BYTE COUNTER

Never `grep`, never `file`, never `git diff` (field-guide lesson 4: `core.autocrlf=true` means the
blob is LF and the worktree is CRLF, and `git diff` normalises the damage away).

| file | CRLF | bare LF | bytes | role this phase |
|---|---|---|---|---|
| `public/views/reader.js` | **767** | 0 | 23874 | **CRLF — MODIFIED (step 1.3)** |
| `public/styles.css` | **707** | 0 | 16772 | **CRLF — MODIFIED (step 1.1)** |
| `public/views/trophies.js` | 0 | **368** | 16332 | **LF — MODIFIED (step 1.1)** |
| `tests/reader-ui.test.js` | 0 | **224** | 8860 | **LF — APPENDED (steps 1.2, 1.3)** |
| `tests/trophies-ui.test.js` | 0 | **982** | 51573 | **LF — APPENDED (step 1.1)** |
| `public/sw.js` | 51 | 0 | 1136 | CRLF — **must not move** (no `CACHE` bump) |
| `public/quiz.js` | 346 | 0 | 9136 | CRLF — QZ-18 frozen |
| `public/quiz-core.js` | 99 | 0 | 4197 | CRLF — frozen |
| `public/index.html` | 90 | 0 | 3737 | CRLF — must not move |
| `public/app.js` | 0 | 67 | 1894 | LF — must not move |
| `public/views/words.js` | 289 | 0 | 9072 | CRLF — must not move |
| `tests/shell.test.js` | 0 | 96 | 3604 | LF — must not move |
| `tests/quiz-ui.test.js` | 0 | 584 | 19068 | LF — must not move |
| `tests/words-ui.test.js` | 0 | 272 | 11583 | LF — must not move |

The brief's pins agree with every measurement. Two record nits: `.oplan/word-trophies/plan.md:1524`
records `tests/shell.test.js` at **LF=94** and it is **96** today; `:1516` records
`public/index.html` at **CRLF=81** and it is **90**. Both are stale pins from a phase that then
edited those files. Logged in RECORD GAPS.

**Frozen ruling.** Of the five files this phase edits, **two are CRLF** (`public/views/reader.js`,
`public/styles.css`) and **three are LF** (`public/views/trophies.js` and the two test files). Both
CRLF files must be edited CRLF-preservingly (python `newline=''`, or an equivalent that writes bytes)
and every step's validation byte-counts them.

### SK1-2 — T1: THE NEW CLASS IS `.shelf-banner`, THE CROP DOES NOT MOVE, ONLY THE MASK IS DROPPED

**The artwork was looked at**, not reasoned about: `public/assets/trophies/shelf-header.webp`,
640x640, 24318 bytes, decoded with `sharp` and rendered four ways in a scratch directory outside the
repo. What is in it: a wooden shelf plank running the full width, with a lantern, an amethyst
crystal, a tied scroll, a potted seedling and a sleeping blue dragon standing **on** it; a string of
warm bulb lights hanging from the plank's front edge; an apothecary interior, blurred, behind.

| feature | source rows (of 640) |
|---|---|
| the objects on the shelf | approx. 300-455 |
| **the shelf plank's front edge** | **approx. 425-470** |
| **the string of lights** | **approx. 465-500** |
| dark foreground clutter | 510-640 |

`object-fit: cover` into a `3 / 2` box shows **rows 107-533**. That window already contains both
load-bearing features, with about 33 rows of dark below the lights for the shelf to sit on. **So the
crop is not the problem and must not change** — changing it is the risk, not the fix:

- `16 / 9` (rows 140-500) cuts the bulbs off at the bottom edge — rejected.
- `object-position: 50% 65%` (rows 139-565) buys nothing but dark foreground and clips the lantern —
  rejected.
- `3 / 2` centred, **no mask** — accepted. Rendered and looked at: shelf, front edge and the full
  light string all present and legible.

**FROZEN RULING.** New class name: **`.shelf-banner`**. It goes in `public/styles.css`, **not** in a
view — `public/views/trophies.js` emits no `<style>` tag at all and every trophy rule already lives
in the global sheet (field-guide lesson 14, and its fix). It goes **immediately after** the marker
`/* ---------- Trophies screen and celebration ---------- */` (`public/styles.css:415`) so that
`tests/trophies-ui.test.js`'s `trophyCss()` helper (`:74-81`) slices it in and the section-wide bans
apply to it for free.

**Three constraints an executor will trip on if they are not stated:**
1. `tests/trophies-ui.test.js:331` asserts the trophy section contains **no hash character** — so the
   rule *and its comment* may not contain one. The quoted block in step 1.1 has zero.
2. `:332` and `:333` ban `color-mix(` and `background-image` in the same section. The block has
   neither.
3. `tests/background.test.js:21-31` takes the **first** `background-image:` in `styles.css`
   (`:39`) — unaffected, because this block adds none.

`.hero-banner` is not touched, and `public/views/home.js:54` and `public/views/reader.js:444` keep
using it, mask and all. Only `public/views/trophies.js:185` changes class.

### SK1-3 — T2: WHAT THE LIST IS, HOW IT VARIES, AND WHAT HAPPENS WHEN THE CHAPTER YIELDS NOTHING

The design delegates three sub-decisions to the planner. All three are ruled here.

**(a) The expression.** A new exported pure function `chapterQuizLemmas(chapter, words, pool, asked,
rand)` in `public/views/reader.js`, quoted verbatim in step 1.3. It reads `chapter.glossary` (entries
are `{ word, he }` — the key is **`word`**), lower-cases and trims, and **drops**:
- anything containing a space (`"deep breath"` can never be a lemma file — design §2);
- anything that is **not already a key in `profile.words`**. This filter is not decoration: a
  `quiz-answer` for a lemma the profile does not know is rejected `400 'unknown word'`
  (`api/profile.js:129-133`), and `public/quiz.js:301-306` catches that and carries on — so without
  the filter the quiz would show a question that scores nothing, moves no trophy and writes no
  `lastQuizAt`, while every test still passed. Field-guide 15(b), a seam between two correct parts,
  closed at write time.

**(b) How the order varies.** The chapter's surviving words are shuffled with the **exact
Fisher-Yates loop from `public/quiz-core.js:26-29`** (copied, not invented, so this codebase keeps
one shuffle idiom), seeded by an injectable `rand` defaulting to `Math.random`. Verified by running
the quoted function: over 200 shuffles of a 3-word glossary all **6** permutations occur;
`rand = () => 0` gives `b, c, a` and `rand = () => 0.999` gives `a, b, c`, so a test can pin both
ends deterministically without flake.

**(c) The top-up, and the zero-usable-words case — the ruling that actually fixes D2.** The global
pool (`lemmas`, unchanged at `:344`) is appended after the chapter's words, de-duplicated. Within it,
a lemma **already asked earlier in this sitting** is moved to the **tail** rather than dropped, so
the quiz can always still reach four and she is never blocked from continuing the story. Driving the
shipped `pickQuizWords`, the shipped bank and this exact function over her real six chapters:

```
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
```

**She has exactly 12 quizzable words** (16 in the pool; `does`, `loud`, `shadow` and `show` have no
bank item, so `quiz.js:236` skips them). 12 / 4 = **3 distinct question sets, which then cycle** —
against **1 set, forever**, today. The chapter-first half contributes nothing to those rows and is
expected not to: see FINDING 1 and BLOCKER B1. `lemmas` at `:344` is deliberately left
byte-identical, which also keeps the frozen source-needle pin at `tests/reader-ui.test.js:210`
intact.

**(d) The seam.** The list is computed **once per chapter** into a memo (`quizLemmasByChapter`) and
both consumers read the same array object: `afterChapterStage`'s `lemmaCount` (`:546`) and
`startQuiz`'s `lemmas` (`:752`). They cannot disagree about how many questions there are. The memo is
a **separate** object from `chapterQuizState`, which is `deepStrictEqual`-pinned as exactly
`{ started, done }` (`tests/reader-ui.test.js:189-201`) — a third key there would break that pin.

**(e) Who says which four were asked.** `public/quiz.js`, not `reader.js`: it decides which of the
list actually loaded, and `session.questions[].lemma` is the only place that knowledge exists.
`startQuiz` is `async` and already returns that session (`quiz.js:345`), so step 1.3 captures the
returned promise and records the lemmas **at start**, not in `onDone` — the next chapter's list is
memoised before `onDone` fires. A rejection handler is attached so nothing becomes an unhandled
rejection.

**NOT DONE, and why:** `public/quiz.js` and `public/quiz-core.js` are not touched by one byte; no
bank item is created (that is content, not code, and it is not this phase's); nothing re-fetches the
profile mid-sitting (`celebrateFromServer`'s local-only read at `:397-405` is a deliberate frozen
decision and this plan does not disturb it).

### SK1-4 — T3(a): THERE IS NOTHING TO ADD. THE CHANGE IS A GATE — AND IT IS THE GATE PHASE 2 NEEDS

FINDING 2 above proves `canSay` is already honest: 36/36 on her real glossary, 0 lies, and 0 of the
514 quiz option strings lack a clip either. Writing a second manifest lookup into `reader.js:674`
would add a check that can only ever agree with the one already there, and would need the manifest
delivered to the browser a second way. **This plan does not do that.**

**How the browser gets the list — answered concretely, because the brief demands it: it already has
it.** `public/words-index.js:17` fetches `/audio/words/index.json` — the very file
`api/profile.js:6` imports server-side with an import attribute — and `getAllowedSet()` caches it in
a module-level `Set` for the life of the page. `reader.js:335` already awaits it. **There is no size
cost to add**: the 19942-byte manifest is already on the wire on every reader page-load today, and it
is deliberately **not** in `PRECACHE` (`public/sw.js:2-17`), so it is served-and-cached by the
runtime `caches.match` handler at `sw.js:39-47` rather than shipped up front. Nothing new is
downloaded, no second copy of the list exists, no new failure mode is introduced.

Four alternatives were considered and all rejected for the same reason — each creates a **second
source** for a value the child sees, the exact shape field-guide 15(b) warns about:

| option | why rejected |
|---|---|
| a second, smaller "has-clip" manifest | two lists that can drift; a word in one and not the other is invisible to every test |
| inline the 2254 words into `reader.js` | 20 KB into a precached file, and a copy that goes stale the moment phase 2 adds a clip |
| generate a `public/audio/words/manifest.js` ESM module | adds a file under `public/` (breaking the 2372 count and `$PUBX`), and still a second copy |
| `HEAD /audio/words/<w>.aac` per tap | a network round-trip before the popup can render; fails open offline, which is when she is most likely reading |

**What is genuinely missing is the assertion.** The chain `canSay implies the clip exists` holds only
because three separate facts happen to line up, and **none of them is asserted anywhere**:
1. `getAllowedSet()` fetches the audio manifest and not some other list;
2. `resolveLemma` returns only members of the set it was given;
3. every manifest entry has an `.aac` file on disk, and vice versa.

Fact 3 is the one **phase 2 is about to change**: `scripts/build-word-audio.js` generates clips, and
the manifest is what `canSay` trusts. If the manifest is extended before the clips land — or if one
of the 17 generations fails quietly — `canSay` starts lying and 358 tests stay green. Step 1.2 turns
all three facts into assertions. That is T3(a), and it is worth more than the code change the design
asked for.

### SK1-5 — NO `CACHE` BUMP THIS PHASE, WHICH IS A DELIBERATE DEVIATION FROM QZ-22

QZ-22 says "any precached-file change ships a `CACHE` bump the same phase". This phase changes three
precached files (`/styles.css`, `/views/reader.js`, `/views/trophies.js`) and **does not bump**, on
the brief's explicit ruling: the bump is spent once, in the ship phase, after phase 2's audio.

This is safe **only because phase 1 does not deploy.** Nothing reaches a phone, so no phone can serve
a stale mixture. The obligation is carried, not discharged:

> **CARRIED OBLIGATION P1-1 — the ship phase MUST bump `CACHE` `magic-vet-v18` to `magic-vet-v19` in
> `public/sw.js:1` and move the pin at `tests/shell.test.js:57-58` in the same step. Three precached
> files changed in phase 1 and are unbumped. Phase 1 must not close without this written into
> `.oplan/word-polish/phase-state.md`.**

§VAL-P1 pins `public/sw.js`'s md5 at `d76f781dc49c5f629aba0f2dfe3304b6` for the whole phase, so an
executor who "helpfully" bumps it fails the gate loudly.

### SK1-6 — THE THREE QUESTIONS THAT CAUGHT LAST RUN'S ESCAPES

**(i) Runtime reachability — for each artifact, where does it exist and can everything reach it?**

| artifact | exists at runtime as | who needs it | reachable at the moment needed? |
|---|---|---|---|
| `.shelf-banner` | a rule in `public/styles.css`, which `public/index.html` links globally | the `<img class="shelf-banner">` that `trophies.js:185` writes into `container.innerHTML` | **YES** — the sheet is document-level and `trophies.js` emits no `<style>` of its own. This is exactly the lesson-14 failure re-checked, in the safe direction. Step 1.1 asserts the rule is in `styles.css` **and** that `trophies.js` still contains no `<style>` |
| `chapterQuizLemmas` | a named export of `public/views/reader.js` (native ESM, no bundler) | `reader.js` itself; `tests/reader-ui.test.js` by direct import | **YES** — module-scope pure function, no DOM, no fetch, imports cleanly in node (the `sentenceFor` / `afterChapterStage` precedent, `tests/reader-ui.test.js:7`) |
| `quizLemmasByChapter`, `askedThisSitting` | closures inside `render()`, one set per mount | `quizLemmasFor`, and the `startQuiz` callback | **YES — and their lifetime is exactly right.** They live as long as the reader view is mounted, i.e. one sitting, which is precisely the scope "not the same four twice in a sitting" needs. Navigating away and back re-mounts, re-reads the profile and resets them, which is correct |
| the audio manifest | `/audio/words/index.json`, fetched by `words-index.js:17`, cached in a module `Set` | `resolveLemma` at `reader.js:670`, immediately before `canSay` is computed at `:674` | **YES** — `boot()` `await`s `getAllowedSet()` at `:335` *before* the first `draw()`, and word taps are only bound inside `draw()`. There is no window in which a tap can outrun the manifest |
| the manifest-to-clip correspondence | 2254 files on disk under `public/audio/words/` | the gate in step 1.2 (node, `fs`); the browser (`new Audio(...)`) | **YES for the gate**, which runs against the same directory the deploy uploads. For the browser the file is fetched at press time and a 404 is swallowed by `reader.js:723` — the gate is what makes the 404 impossible |

**(ii) Contradictory sources — every value shown to the child, and its source.**

| shown to her | source | can a second source disagree? |
|---|---|---|
| the speaker button's *presence* | `activePopup.canSay`, from `resolveLemma(dataWord, allowedWords)` (`:670`, `:674`) | **No.** The URL the button plays is built from `activePopup.lemma` (`:532` to `:718` to `:721`), which is the **same** `lemma` value `canSay` was derived from at `:672`. One value, two uses — not two values |
| the clip that plays | `/audio/words/<lemma>.aac` | **No**, given step 1.2's gate: the lemma is a manifest member and the manifest is proven equal to the clip set |
| "question N of 4" (`quiz.js:191`) | `session.questions.length` | **No.** After this phase `afterChapterStage`'s `lemmaCount` and `startQuiz`'s `lemmas` are literally the same array object (SK1-3(d)); the memo is what keeps it that way instead of computing twice |
| whether the quiz runs at all | `afterChapterStage({ ..., lemmaCount })` | **No** — same array object, same length |
| the Hebrew translation in the popup | `findInGlossary` (`:309-319`), falling back to `POST /api/translate` | unchanged this phase |
| the shelf artwork | `/assets/trophies/shelf-header.webp` | not touched; its md5 is inside `$PUBX` |

**(iii) Ungated composites — approved asset meets approved styling.** Exactly one exists this phase,
and it gets a human, not an assertion:

> **`public/assets/trophies/shelf-header.webp` (approved in word-trophies phase 2) rendered under
> `.shelf-banner` (approved here) on the real `/trophies` screen, at the real device width, above
> the eight approved cards and the approved title.** Nothing in this plan asserts that it looks
> right. **Step 1.4 is a human looking at it in the sandbox browser**, and it is a blocking gate.

The reader popup and the quiz screen carry no new composite this phase: no asset and no styling of
theirs is touched.

---

## §VAL-P1 — the frozen validation preamble

**Deliver this to any executor as a FILE, never inline in a JSON packet** — its backslashes have
collapsed in transit twice in this project. **Every step's validation is ONE script = §VAL-P1
verbatim + that step's tail, in the SAME file** (a child `bash` cannot supply `fail` / `$PORC` /
`$RC` to a tail). The `sed` and `awk` lines are copied byte-for-byte from
`.oplan/word-trophies/plan.md` §VAL-P3 (`:1944-2026`), which ran clean 30+ times across four phases.
**The `.oplan` filter is `awk '$NF !~ /^\.oplan\//'` — four characters of backslash.
`.oplan/word-trophies/plan.md:989` carries a collapsed-backslash copy that is a bash SYNTAX ERROR
(P2-NOTE #1): never copy that line, copy the one below.**

Unlike §VAL-P3, this preamble **hard-codes** the contrast anchor (58) and `PUBN` (2372), because
neither moves at any point in this phase. The suite totals DO move, so they stay in variables and are
asserted in each step's tail.

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- suite (plain) ---
OUT="$(npm test 2>&1)"; STAT=$?
case "$STAT" in 0) ;; *) fail "npm test exited $STAT";; esac
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
FAILED="$(printf '%s\n' "$OUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
PLAN="$(printf '%s\n' "$OUT" | sed -n 's/^1\.\.\([0-9][0-9]*\).*$/\1/p')"

# --- suite (gated) ---
GOUT="$(APP_CODE=dummy npm test 2>&1)"; GSTAT=$?
case "$GSTAT" in 0) ;; *) fail "APP_CODE=dummy npm test exited $GSTAT";; esac
GTOTAL="$(printf '%s\n' "$GOUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
GFAILED="$(printf '%s\n' "$GOUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"

# --- flat ledger ---
FLAT="$(grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}')"

# --- contrast gate: the anchor does NOT move this phase ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$PASSES" in 58) ;; *) fail "contrast anchor must stay 58 all phase, got '$PASSES'";; esac
case "$CON" in *"ALL PASS"*) ;; *) fail "check-contrast did not print ALL PASS";; esac

# --- public/ OUTSIDE the three paths phase 1 may touch is byte-frozen (no backslashes: lesson 8) ---
PUBX="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const SKIP=new Set(["public/views/reader.js","public/styles.css","public/views/trophies.js"]);const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");const s=fs.statSync(f);if(s.isDirectory())walk(f);else if(!SKIP.has(p))out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUBX" in "2369 839de1b098be5014a4488ba79064a1ab") ;; *) fail "public/ moved outside the three touchable paths: expected '2369 839de1b098be5014a4488ba79064a1ab', got '$PUBX'";; esac

# --- public/ file count: NOTHING is created or deleted under public/ this phase ---
PUBN="$(node -e 'const fs=require("fs"),path=require("path");let n=0;(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);if(fs.statSync(f).isDirectory())walk(f);else n++;}})("public");console.log(n);')"
case "$PUBN" in 2372) ;; *) fail "public/ file count must stay 2372 all phase, got '$PUBN'";; esac

# --- the QZ-18 frozen quiz files must not move by one byte, all phase ---
QMD5="$(md5sum public/quiz.js | cut -d' ' -f1)"
case "$QMD5" in 69b6d71117cf776715374abc6f0abb02) ;; *) fail "public/quiz.js moved: $QMD5 (QZ-18 frozen)";; esac
QCMD5="$(md5sum public/quiz-core.js | cut -d' ' -f1)"
case "$QCMD5" in 9a2131be8b9d1b77c219f1e8c3482a71) ;; *) fail "public/quiz-core.js moved: $QCMD5 (frozen)";; esac

# --- the service worker does NOT move this phase: the CACHE bump is spent once, in the ship phase ---
SWMD5="$(md5sum public/sw.js | cut -d' ' -f1)"
case "$SWMD5" in d76f781dc49c5f629aba0f2dfe3304b6) ;; *) fail "public/sw.js moved: $SWMD5 -- no CACHE bump in phase 1";; esac

# --- the server does not move this phase ---
SRV="$(git diff --name-only HEAD -- lib api data scripts)"
case "$SRV" in "") ;; *) fail "lib/ api/ data/ or scripts/ changed, which phase 1 must never do: $SRV";; esac

# --- the audio manifest is the source of truth for canSay and must not move: phase 2 owns the clips ---
MANMD5="$(md5sum public/audio/words/index.json | cut -d' ' -f1)"
case "$MANMD5" in 8735a3c499508b04415046e2be4ad159) ;; *) fail "the audio manifest moved: $MANMD5 -- phase 2 owns the clips, not phase 1";; esac

# --- awardTrophies stays server-side only ---
CLIENTAWARD="$(grep -rl 'awardTrophies' public/ | wc -l | tr -d ' ')"
case "$CLIENTAWARD" in 0) ;; *) fail "awardTrophies appears under public/ -- awarding is server-side only";; esac

# --- both transcripts must diff EMPTY ---
VD="$HOME/polish-val"; mkdir -p "$VD"
node .oplan/word-quiz/quiz-transcript.mjs > "$VD/qz.out" 2>&1 || fail "quiz-transcript.mjs exited non-zero"
QZ="$(diff "$VD/qz.out" .oplan/word-quiz/quiz-transcript-expected.txt)"
case "$QZ" in "") ;; *) fail "QZ-21 transcript moved";; esac
node .oplan/word-g1/g1-transcript.mjs > "$VD/g1.out" 2>&1 || fail "g1-transcript.mjs exited non-zero"
G1="$(diff "$VD/g1.out" .oplan/word-g1/g1-transcript-expected.txt)"
case "$G1" in "") ;; *) fail "G1 transcript moved";; esac
rm -f "$VD/qz.out" "$VD/g1.out"

# --- her profile must never appear locally ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists -- a local write leaked"; fi

# --- line endings are LAW and git normalises them away (field guide lesson 4) ---
ENDS="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){if(!fs.existsSync(f)){out.push(f+" MISSING");continue;}const b=fs.readFileSync(f);let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}out.push(f+" CRLF="+c+" LF="+l);}console.log(out.join("; "));' public/views/reader.js public/styles.css public/views/trophies.js public/sw.js public/quiz.js public/quiz-core.js public/index.html public/app.js public/views/words.js tests/reader-ui.test.js tests/trophies-ui.test.js tests/shell.test.js tests/quiz-ui.test.js tests/words-ui.test.js)"
echo "ENDINGS: $ENDS"
case "$ENDS" in *"public/quiz.js CRLF=346 LF=0"*)      ;; *) fail "public/quiz.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/quiz-core.js CRLF=99 LF=0"*)  ;; *) fail "public/quiz-core.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/sw.js CRLF=51 LF=0"*)         ;; *) fail "public/sw.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=90 LF=0"*)    ;; *) fail "public/index.html must be untouched: $ENDS";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=67"*)        ;; *) fail "public/app.js must be untouched: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=289 LF=0"*) ;; *) fail "public/views/words.js must be untouched: $ENDS";; esac
case "$ENDS" in *"tests/shell.test.js CRLF=0 LF=96"*)  ;; *) fail "tests/shell.test.js must be untouched: $ENDS";; esac
case "$ENDS" in *"tests/quiz-ui.test.js CRLF=0 LF=584"*) ;; *) fail "tests/quiz-ui.test.js must be untouched: $ENDS";; esac
case "$ENDS" in *"tests/words-ui.test.js CRLF=0 LF=272"*) ;; *) fail "tests/words-ui.test.js must be untouched: $ENDS";; esac

# --- no NEW Hebrew may enter the repository: the two edited test files are byte-pinned ---
NAR="$(node -e 'const b=require("fs").readFileSync("tests/reader-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(n);')"
case "$NAR" in 355) ;; *) fail "tests/reader-ui.test.js raw non-ASCII moved from 355 to $NAR -- no new Hebrew is allowed this phase";; esac
NAT="$(node -e 'const b=require("fs").readFileSync("tests/trophies-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(n);')"
case "$NAT" in 0) ;; *) fail "tests/trophies-ui.test.js has $NAT raw non-ASCII bytes -- Hebrew must be backslash-u escapes";; esac
NEST="$(grep -h -c 'describe(' tests/reader-ui.test.js tests/trophies-ui.test.js | awk '{s+=$1} END{print s+0}')"
case "$NEST" in 0) ;; *) fail "$NEST describe() blocks appeared -- flat top-level test() only";; esac

# --- nothing deleted, ever ---
GONE="$(git diff --diff-filter=D --name-only HEAD)"
case "$GONE" in "") ;; *) fail "files were deleted: $GONE";; esac

PORC="$(git status --porcelain -uall | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"   # .oplan is the orchestrator record, never the executor write set
```

Per-step blocks continue from here with their own `case` assertions on `$TOTAL`, `$FAILED`, `$PLAN`,
`$GTOTAL`, `$GFAILED`, `$FLAT`, `$ENDS`, `$PORC`, then `exit $RC`.

**Note on `$PUBX`:** measured today at `2369 839de1b098be5014a4488ba79064a1ab` — 2372 files minus the
three touchable paths. It is a REAL invariant (2369 = 2372 − 3), not a tautology: it covers all
**2254 audio clips and the manifest**, all 62 quiz bank items, the nine trophy webps, `sw.js`,
`index.html`, `app.js`, `api.js`, `lemma.js`, `words-index.js`, `quiz.js`, `quiz-core.js`, every
other view, `manifest.webmanifest` and every icon.

**This preamble was DRY-RUN today** against the clean tree at `2fd6e82`: it exits **0** and reports
`TOTAL=349 PLAN=344 FAILED=0 GTOTAL=349 GFAILED=0 FLAT=344 PASSES=58 PUBN=2372`, `PORC=[]`, and the
full ENDINGS line. **It was also seen to FAIL** (lesson 9: a frozen validation can itself be the
bug): a copy with three expectations mutated (`$PUBX`, `$SWMD5`, `$NAR`) printed exactly those three
`FAIL:` lines and exited **1**.

---

## FROZEN CONTRACTS — quoted, in force for every step of this phase

From `.oplan/word-g1/phase-state.md:34-42`:
> "both transcripts (QZ-21 + g1) must diff EMPTY forever; expected files committed ONCE, never
> edited · QZ-22: next CACHE bump = v18 whenever public/ next moves · … contrast anchor 52 ·
> APP_CODE never in an orchestrator shell; the frozen subshell (.oplan/word-quiz/
> plan.md:1573-1586) is the only sanctioned live read · GET /api/profile creates one — never probe"

(The QZ-22 clause reads v18 in that document because it was written before v18 shipped. v18 **is**
live today, `public/sw.js:1`; the next bump is **v19**, and SK1-5 defers it to the ship phase and
carries it as obligation **P1-1**. The contrast anchor moved 52 → **58** in word-trophies phase 3
and is 58 today, measured.)

From `.oplan/word-polish/design.md:61-65` (T2):
> "`public/quiz.js` and `public/quiz-core.js` are QZ-18 frozen and md5-pinned — **do not touch
> them.** This is achievable without them: `reader.js` alone decides what `lemmas` array it hands to
> `startQuiz`, so the change is to that array. … Ordering within the chapter's words must not be a
> fixed alphabetical or glossary order"

From `.oplan/word-polish/design.md:48-53` (T1):
> "`.hero-banner` must NOT change: `.chapter-banner` and `.celebrate-image` want its bottom fade. Add
> a new class used only by the trophies screen, with **no bottom mask** … Keep the same width, radius
> and shadow treatment as the other banners … the composite is judged by eye at the visual gate, not
> by a CSS assertion"

From `.oplan/word-polish/design.md:91-95` (non-goals):
> "No change to `public/quiz.js` or `public/quiz-core.js`. No change to `.hero-banner`,
> `.chapter-banner` or `.celebrate-image`. No new Hebrew string (the speaker button's label already
> exists). … No deploy until the visual gate and the audio gate have passed."

The three strings a step may need and must never retype — quoted from their source files:
- `public/views/trophies.js:185`, verbatim, 4 leading spaces:
  `    <img class="hero-banner" src="/assets/trophies/shelf-header.webp" alt="" />`
- `public/styles.css:415`, verbatim, no leading space:
  `/* ---------- Trophies screen and celebration ---------- */`
- `public/views/reader.js:344`, verbatim, 6 leading spaces, **must survive this phase byte-identical**
  because `tests/reader-ui.test.js:210` pins it:
  `      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));`

**Tooling warning, measured today:** `sed -n '415p' public/styles.css | cat -A` prints `$`, not
`^M$`, on this machine — Git Bash's `sed` is reading the CRLF file in text mode. **Do not use `sed`,
`awk` or any line-oriented tool to EDIT either CRLF file.** Edit them with a byte-preserving writer
(python `io.open(..., newline='')`) and verify with the `rb` counter in §VAL-P1. The anchors above
were read with `fs.readFileSync` + an explicit `\r\n` split, which is why they are trustworthy.

---

# STEP 1.1 — T1: `.shelf-banner`, and the trophies screen uses it

**GOAL:** `public/styles.css` gains exactly one new rule, `.shelf-banner`, inside the trophies
section; `public/views/trophies.js` uses it for the shelf header instead of `.hero-banner`;
`tests/trophies-ui.test.js` gains the two tests that make both real. `.hero-banner` does not move by
one byte. No JS behaviour changes, no colour token, no contrast pair, no `CACHE` bump.

**TIER:** WORKER. **DEPENDS ON:** nothing (phase base = the `$BASE` the orchestrator records at
go-ahead).

**FILES (exhaustive), with measured endings:**
- `public/styles.css` — MODIFY (**CRLF**, 707/0 today). One insert, **22 lines**, **0 deletions**.
- `public/views/trophies.js` — MODIFY (**LF**, 0/368). One line replaced. **1 deletion**, 1 insert,
  net 0 lines.
- `tests/trophies-ui.test.js` — MODIFY (**LF**, 0/982). Append only, **0 deletions**. 2 flat tests.

**Edit 1 — `public/styles.css`, insert immediately AFTER line 415.** Anchor, quoted exactly
(`:414-417`, where `:414` and `:416` are empty lines):

```css

/* ---------- Trophies screen and celebration ---------- */

.trophies-grid {
```

becomes

```css

/* ---------- Trophies screen and celebration ---------- */

/* T1 (word-polish). The trophies screen's own banner: the same box, radius and
   shadow treatment as .hero-banner, and NO bottom mask. .hero-banner's
   linear-gradient fades its bottom 26 percent out, which on this 640x640 source
   renders the shelf's front edge at about 57 percent opacity and the string of
   lights at about 49 percent -- the two features that make the picture read AS
   a shelf (field guide 15c: the image was gated, the CSS was gated, the
   composite was gated by nobody). .hero-banner itself must not move:
   .chapter-banner and .celebrate-image want that fade. The CROP is deliberately
   identical to .hero-banner's -- aspect-ratio 3/2, object-fit cover, default
   object-position 50% 50% -- which shows source rows 107-533 and so contains
   the shelf edge (rows 425-470) and the whole light string (rows 465-500).
   Only the mask is dropped. */
.shelf-banner {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: none;
  margin-bottom: 16px;
}

.trophies-grid {
```

**That inserted block is exactly 22 lines** (1 blank + 12 comment + 9 rule): 707 + 22 = **CRLF=729**,
LF=0. It contains **zero** `#` characters, **zero** `color-mix(`, **zero** `background-image` — all
three are banned in this section by `tests/trophies-ui.test.js:331-333`, verified by a byte scan of
the block today. It declares **no colour**, so `scripts/check-contrast.mjs` is untouched and the
anchor stays 58.

**Edit 2 — `public/views/trophies.js:185`.** Replace, quoted exactly (4 leading spaces):
```js
    <img class="hero-banner" src="/assets/trophies/shelf-header.webp" alt="" />
```
with
```js
    <img class="shelf-banner" src="/assets/trophies/shelf-header.webp" alt="" />
```
Nothing else in the file changes; the `src`, the `alt=""`, the position before the header and the
indentation are all byte-identical, so `tests/trophies-ui.test.js:259-284` and the img-source
allow-list at `:306-313` keep passing untouched.

**Edit 3 — APPEND to `tests/trophies-ui.test.js`** exactly these **2** flat tests, names FROZEN, no
`describe(`, no raw non-ASCII byte:

1. `'the shelf banner has its own class, no bottom mask, and .hero-banner is byte-unchanged'` —
   read `public/styles.css`; via the existing `trophyCss()` helper assert the sliced section contains
   `.shelf-banner {`; extract that rule (`style.slice(at, style.indexOf('}', at))`) and assert it
   contains **all** of `display: block;`, `width: 100%;`, `aspect-ratio: 3 / 2;`,
   `object-fit: cover;`, `border-radius: var(--radius);`, `box-shadow: none;`,
   `margin-bottom: 16px;` and **none** of `mask-image`, `-webkit-mask-image`, `linear-gradient`,
   `object-position`. Then, on the WHOLE file: assert
   `.hero-banner,\n.chapter-banner,\n.celebrate-image {` still appears exactly once, that
   `mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);` still appears
   exactly **twice** (the `-webkit-` line and the plain one — counted today), and that
   `.hero-banner { margin-bottom: 16px; }` still appears exactly once. Finally assert
   `css.split('.shelf-banner').length - 1 === 1` — one definition, no second one.
2. `'the trophies screen uses .shelf-banner, emits no style tag of its own, and .hero-banner is gone from it'` —
   `const { screenHtml } = await import('../public/views/trophies.js')`; **call it** on the existing
   `t32Profile({}, [])` fixture and assert the returned HTML contains
   `<img class="shelf-banner" src="/assets/trophies/shelf-header.webp" alt="" />` exactly once and
   `hero-banner` **zero** times; assert the banner still precedes the first `class="trophy-card"`.
   Then read `public/views/trophies.js` as text and assert it contains **no** `<style>` — the
   lesson-14 guard: this screen's CSS must stay in the globally-linked sheet, because that is the
   only place from which it can reach an element the view writes into `container.innerHTML`.

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/views/trophies.js
node scripts/check-contrast.mjs | grep -c '^PASS'   # must still print 58
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 1.1: T1 -- .shelf-banner, no bottom mask; the
# trophies screen stops borrowing .hero-banner; ledger 346 flat / 351 reported"
```

**MANDATED FAIL-FIRST (run BEFORE the commit; restore after each; record each observed failure line
verbatim — a mutation that does not fail is a STOP):**
- **M1.1a** — add `  mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);`
  inside the `.shelf-banner` rule. Test 1 must fail on **`the shelf banner must carry no bottom
  mask`**, and `tests/trophies-ui.test.js`'s existing no-hash assertion at `:331` must ALSO fail with
  `the trophy rules must not contain a raw hex color`. Restore; both pass. *(This is the cry-wolf
  control for the whole of T1: it proves the mask ban can fail.)*
- **M1.1b** — revert `public/views/trophies.js:185` to `class="hero-banner"`. Test 2 must fail on
  **`expected the shelf-header to use .shelf-banner`**. Restore. *(Proves the CSS and the markup are
  wired to each other and not merely both present — field-guide 15a.)*
- **M1.1c** — move the `.shelf-banner` block from before `.trophies-grid` to AFTER the
  `/* ---------- Entry code gate ---------- */` marker at `public/styles.css:614`. Test 1 must fail
  because `trophyCss()` no longer contains it, and `tests/entry-code.test.js:30-43` must ALSO fail.
  Restore. *(Proves the rule is where the plan says it is, not merely somewhere in the file.)*
- **M1.1d** — add `aspect-ratio: 16 / 9;` in place of `3 / 2`. Test 1 must fail on the missing
  `aspect-ratio: 3 / 2;`. Restore. *(Proves the crop is pinned, since the crop is the one thing
  SK1-2 rules must NOT move.)*

**FROZEN VALIDATION:** §VAL-P1 verbatim, then, in the SAME file:
```bash
case "$TOTAL"   in 351) ;; *) fail "expected 351 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 346) ;; *) fail "expected top-level plan 1..346, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 351) ;; *) fail "APP_CODE=dummy: expected 351, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 346) ;; *) fail "expected 346 flat tests, got '$FLAT'";; esac
case "$ENDS" in *"public/styles.css CRLF=729 LF=0"*) ;; *) fail "styles.css must stay CRLF-only and gain exactly 22 lines: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=368"*) ;; *) fail "trophies.js must stay LF-only at 368 lines: $ENDS";; esac
case "$ENDS" in *"tests/trophies-ui.test.js CRLF=0 "*) ;; *) fail "tests/trophies-ui.test.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=767 LF=0"*) ;; *) fail "reader.js must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- public/views/trophies.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 1) ;; *) fail "this step's deletion budget is exactly 1 (the class swap), got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- public/styles.css tests/trophies-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "styles.css and trophies-ui.test.js must be insert-only, got $ZERODEL deletions";; esac
HERO="$(grep -rc 'class="hero-banner"' public/views/home.js public/views/reader.js public/views/trophies.js | tr '\n' ' ')"
case "$HERO" in "public/views/home.js:1 public/views/reader.js:1 public/views/trophies.js:0 ") ;; *) fail "hero-banner usage wrong, expected home 1 / reader 1 / trophies 0, got: $HERO";; esac
SHELFDEF="$(grep -c '\.shelf-banner' public/styles.css)"
case "$SHELFDEF" in 1) ;; *) fail "expected exactly one .shelf-banner definition in styles.css, got '$SHELFDEF'";; esac
MASKCOUNT="$(grep -c 'mask-image: linear-gradient(to bottom' public/styles.css)"
case "$MASKCOUNT" in 2) ;; *) fail "the .hero-banner mask must stay exactly as it is (2 lines), got '$MASKCOUNT'";; esac
EXPECT=' M public/styles.css
 M public/views/trophies.js
 M tests/trophies-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(Run the block BEFORE the orchestrator's commit; `$PORC` is the pre-commit expectation. The
`styles.css CRLF=729` pin is **computable** — 707 + 22, counted line by line off the block quoted
above. **Every line-count pin in this plan was derived by counting the lines of the block quoted
immediately above it; if an executor's byte counter disagrees, that is a STOP, not a fix.**)

**NON-GOALS:** no change to `.hero-banner`, `.chapter-banner` or `.celebrate-image`; no
`object-position`; no new colour, token or contrast pair; no `<style>` tag in any view; no touch of
`public/views/reader.js`, `public/sw.js` or any test file other than
`tests/trophies-ui.test.js`; **no claim that the screen looks right** — that is step 1.4's, and only
a human's.

---

# STEP 1.2 — T3(a): the gate that makes `canSay`'s honesty an assertion instead of an accident

**GOAL:** the three facts that make `canSay` truthful become three tests, and one function stops
being private so the test can execute the shipped code instead of re-implementing it. **No new
manifest lookup is added to `reader.js`** — SK1-4 proves there is nothing to add.

**TIER:** WORKER. **DEPENDS ON:** nothing (independent of steps 1.1 and 1.3; the orchestrator may
run it in any order relative to 1.1, but the ledger numbers below assume 1.1 landed first).

**FILES (exhaustive), with measured endings:**
- `public/views/reader.js` — MODIFY (**CRLF**, 767/0). One word added to one line. **1 deletion**,
  1 insert, net 0 lines — still **CRLF=767**.
- `tests/reader-ui.test.js` — MODIFY (**LF**, 0/224). Append only, **0 deletions**. 3 flat tests.

**Edit 1 — `public/views/reader.js:257`.** Replace, quoted exactly:
```js
function normalizeWord(raw) {
```
with
```js
export function normalizeWord(raw) {
```
Rationale, and it is field-guide lesson 2, not tidiness: the gate below must decide the affordance
**the way the shipped code decides it**. A test that re-implements
`raw.toLowerCase().replace(/[^a-z]/g, "")` would verify the manifest against the test's own copy of
the normaliser and would fail OPEN the day the normaliser changed. `normalizeWord` is already pure,
has no dependencies and is already at module scope; exporting it changes no behaviour and adds no
line.

**Edit 2 — APPEND to `tests/reader-ui.test.js`** exactly these **3** flat tests, names FROZEN, no
`describe(`, and **no new non-ASCII byte** (the file's 355 raw non-ASCII bytes are the existing
frozen Hebrew assertion at `:86` and must stay at exactly 355):

1. `'every word in the audio manifest has a clip on disk, and every clip is in the manifest'` —
   `JSON.parse(readFileSync('public/audio/words/index.json'))`; assert it is an Array and
   `length === 2254`; `readdirSync('public/audio/words')` and assert `length === 2255`
   (2254 clips + `index.json`); build `clips = new Set(files.filter(f => f.endsWith('.aac')).map(f => f.slice(0, -4)))`
   and assert `clips.size === 2254`; then compute BOTH differences and assert both are empty,
   **naming the offenders in the message**:
   `manifest entries with no clip: <list>` and `clips missing from the manifest: <list>`.
   *This is the invariant phase 2 is about to stress; it must name what broke, not just that
   something did.*
2. `'resolveLemma only ever returns a word that has a clip, so a speaker button cannot be dead'` —
   import `resolveLemma` from `../public/lemma.js` and `normalizeWord` from
   `../public/views/reader.js`; build `allowed = new Set(manifest)` and `clips` as above. Drive
   **every** manifest entry plus a generated inflection sweep (for each entry, also try `+ 's'`,
   `+ 'ed'`, `+ 'ing'`, `+ 'es'`) plus this fixed list of words that must resolve to nothing —
   `['deepbreath', 'growls', 'glows', 'nervous', 'scary', 'harm', 'deer', 'feet', 'moon', 'tightly', 'zzzz', '']` —
   and for **every** input assert
   `lemma === null || clips.has(lemma)`, i.e. **the exact predicate `reader.js:674` uses to decide
   whether to draw the button implies the file the button would play exists.** Assert the sweep
   actually exercised more than 2254 inputs and that at least one input returned `null` (the
   negative control: a sweep in which nothing ever returns null would pass vacuously).
3. `'the browser and the server read the SAME word list, and the button plays the value it was drawn from'` —
   read `public/words-index.js` and assert it contains `fetch('/audio/words/index.json')`; read
   `api/profile.js` and assert it contains `'../public/audio/words/index.json'`; assert both paths
   resolve to the same existing file and that `JSON.parse` of it gives the same 2254-length array —
   so the browser's `allowedWords` and the server's `ALLOWED_WORDS` are the same bytes, and
   `resolveLemma` cannot mean two different things on the two sides. Then read
   `public/views/reader.js` and assert it contains **all three** of `canSay: lemma !== null,`,
   `lemma: lemma || dataWord,` and `data-say="${escapeHtml(activePopup.lemma)}"`, and contains
   **neither** `data-say="${escapeHtml(activePopup.surface)}"` **nor**
   `data-say="${escapeHtml(dataWord)}"` — the seam assertion: the button is drawn from the same
   `lemma` binding the clip URL is built from.
   **Stated plainly, as lesson 15 requires: the last four assertions are source needles and they
   fail OPEN.** They are guards, not gates. What actually proves the affordance is test 2, which
   executes the shipped predicate, and step 1.4, where a human taps a word and hears it.

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/views/reader.js
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 1.2: T3(a) -- canSay's honesty is now an asserted
# invariant (manifest == clips, resolveLemma closed over the manifest, one shared word list);
# ledger 349 flat / 354 reported"
```

**MANDATED FAIL-FIRST (run BEFORE the commit; restore after each; record each observed failure line
verbatim — a mutation that does not fail is a STOP). Note that two of these mutate files that the
phase otherwise freezes; they are performed and reverted INSIDE the step, and §VAL-P1 is what proves
the revert was byte-exact:**
- **M1.2a** — append `"zzzznotaword"` to `public/audio/words/index.json`. Test 1 must fail with
  `manifest entries with no clip: zzzznotaword`. **Restore, then re-run §VAL-P1 and confirm
  `MANMD5 = 8735a3c499508b04415046e2be4ad159`.** *(This is the exact failure phase 2 can cause, so it
  is the one mutation this phase most needs to have seen fail.)*
- **M1.2b** — rename `public/audio/words/cat.aac` to `public/audio/words/cat.aac.bak`. Test 1 must
  fail with `manifest entries with no clip: cat` **and** the directory-count assertion must fail
  (2255 → 2255, but `clips.size` 2253). Restore by renaming back; confirm `$PUBX` is unchanged.
- **M1.2c** — in `public/lemma.js`, make the de-inflection return its candidate without checking set
  membership. Test 2 must fail with `resolveLemma returned "<word>" which has no clip`. Restore.
  *(Cry-wolf control: it proves test 2 can fail, i.e. that the 2254+ inputs are not all trivially
  null-or-present.)*
- **M1.2d** — change `public/words-index.js:17` to `fetch('/audio/words/index2.json')`. Test 3 must
  fail on the missing needle. Restore. *(A guard, not a gate — recorded as a guard.)*

**FROZEN VALIDATION:** §VAL-P1 verbatim, then, in the SAME file:
```bash
case "$TOTAL"   in 354) ;; *) fail "expected 354 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 349) ;; *) fail "expected top-level plan 1..349, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 354) ;; *) fail "APP_CODE=dummy: expected 354, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 349) ;; *) fail "expected 349 flat tests, got '$FLAT'";; esac
case "$ENDS" in *"public/views/reader.js CRLF=767 LF=0"*) ;; *) fail "reader.js must stay CRLF-only at 767 lines this step: $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 "*) ;; *) fail "tests/reader-ui.test.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=729 LF=0"*) ;; *) fail "styles.css must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=368"*) ;; *) fail "trophies.js must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- public/views/reader.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 1) ;; *) fail "this step's deletion budget is exactly 1 (the export keyword), got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- tests/reader-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "tests/reader-ui.test.js must be append-only, got $ZERODEL deletions";; esac
NORM="$(grep -c '^export function normalizeWord(raw) {' public/views/reader.js)"
case "$NORM" in 1) ;; *) fail "expected exactly one exported normalizeWord, got '$NORM'";; esac
PIN344="$(grep -c 'lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));' public/views/reader.js)"
case "$PIN344" in 1) ;; *) fail "the frozen line reader.js:344 must survive byte-identical, got '$PIN344'";; esac
CLIPS="$(node -e 'const fs=require("fs");const m=JSON.parse(fs.readFileSync("public/audio/words/index.json","utf8"));const f=fs.readdirSync("public/audio/words");const a=new Set(f.filter(x=>x.endsWith(".aac")).map(x=>x.slice(0,-4)));const miss=m.filter(w=>!a.has(w));const orph=[...a].filter(w=>!m.includes(w));console.log(m.length+" "+a.size+" "+miss.length+" "+orph.length);')"
case "$CLIPS" in "2254 2254 0 0") ;; *) fail "manifest/clip correspondence broken, expected '2254 2254 0 0', got '$CLIPS'";; esac
# P1-AMENDMENT #1 (orchestrator, 2026-08-01, after the worker STOPPED on it -- correctly).
# The block below was written for a tree where step 1.1 is still UNCOMMITTED. This run commits
# every step at acceptance (the house discipline), so by the time 1.2 runs, 1.1's three files are
# CLEAN and can never appear in git status. The plan's own note at :939-943 claims the opposite
# and is wrong. The measured write set for 1.2 is the TWO files below, and it is correct.
EXPECT=' M public/views/reader.js
 M tests/reader-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(The `$PORC` block assumes step 1.1 has already been committed into the phase base — if the
orchestrator runs 1.2 first, it drops the two step-1.1 lines. `LC_ALL=C sort` puts
` M public/styles.css` before ` M public/views/reader.js`; **the block above is written in
`LC_ALL=C` sorted order and was checked against a `printf | LC_ALL=C sort` today.**)

**NON-GOALS:** no new manifest lookup in `reader.js`; no change to `canSay`, to
`public/words-index.js`, to `public/lemma.js` or to `api/profile.js`; no new clip and no manifest
edit — **phase 2 owns the audio and §VAL-P1 pins the manifest's md5 so this step cannot touch it**;
no change to `public/quiz.js`'s speaker buttons (measured clean: 0 of 514 option strings lack a
clip).

---

# STEP 1.3 — T2: the chapter's own words first, and never the same four twice in a sitting

**GOAL:** `public/views/reader.js` gains one exported pure function and two closures, and three
existing lines are re-pointed at them. `public/quiz.js` and `public/quiz-core.js` are not touched.
`reader.js:344` survives byte-identical.

**TIER:** WORKER (the four inserts are quoted verbatim below and are not to be paraphrased).
**DEPENDS ON:** step 1.2 (both edit `public/views/reader.js`; running them concurrently would
conflict).

**FILES (exhaustive), with measured endings:**
- `public/views/reader.js` — MODIFY (**CRLF**, 767/0 at the phase base, still 767 after step 1.2).
  Four inserts totalling **78 lines** and three one-for-one line replacements. **3 deletions.**
  767 + 78 = **CRLF=845**, LF=0.
- `tests/reader-ui.test.js` — MODIFY (**LF**). Append only, **0 deletions**. 4 flat tests.

**Insert A — `public/views/reader.js`, immediately BEFORE line 309
(`function findInGlossary(chapter, dataWord) {`), i.e. after the blank line 308.** Exactly **46
lines** (45 content + 1 trailing blank line separating it from `findInGlossary`):

```js
// T2 (word-polish). The end-of-chapter quiz asks about THIS chapter's words
// first. Four things are frozen here, because each is a place the quiz can
// silently do nothing at all:
//  * the key is `word`, not `lemma` -- a glossary entry is { word, he }.
//  * a word containing a space ("deep breath") can never be a lemma file.
//  * a glossary word is DROPPED unless it is already a key in profile.words:
//    api/profile.js:130 answers a quiz-answer for an unknown word with
//    400 'unknown word' and public/quiz.js:304 swallows that, so an
//    unrecordable word buys a question that scores nothing, awards no
//    quizRight progress and never records lastQuizAt.
//  * the chapter's words are SHUFFLED with the Fisher-Yates from
//    quiz-core.js:26-29, so re-opening a chapter does not always ask the
//    same first four.
// The global pool is appended, de-duplicated. A lemma already asked earlier in
// this sitting goes to the TAIL rather than being dropped, so the quiz can
// always still reach four. Pure: no DOM, no fetch, no clock.
export function chapterQuizLemmas(chapter, words, pool, asked, rand = Math.random) {
  const known = words && typeof words === "object" ? words : {};
  const seen = new Set();
  const first = [];
  const glossary = chapter && Array.isArray(chapter.glossary) ? chapter.glossary : [];
  for (const g of glossary) {
    if (!g || typeof g.word !== "string") continue;
    const k = g.word.trim().toLowerCase();
    if (k === "" || k.includes(" ")) continue;
    if (!Object.prototype.hasOwnProperty.call(known, k)) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    first.push(k);
  }
  for (let i = first.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [first[i], first[j]] = [first[j], first[i]];
  }
  const already = asked instanceof Set ? asked : new Set();
  const fresh = [];
  const repeat = [];
  for (const k of Array.isArray(pool) ? pool : []) {
    if (typeof k !== "string" || seen.has(k)) continue;
    seen.add(k);
    if (already.has(k)) repeat.push(k);
    else fresh.push(k);
  }
  return first.concat(fresh, repeat);
}

```

**Insert B — immediately AFTER line 330 (`  let candidateSet = new Set();`), inside `render()`.**
Exactly **10 lines**:

```js
  // T2. One quiz list per chapter, computed ONCE and memoised, so the count
  // afterChapterStage sees and the array startQuiz receives are the SAME array
  // object and cannot disagree (field guide 15b: bugs live in the seam).
  // askedThisSitting is what actually fixes D2: `lemmas` below is built once in
  // boot() and never rebuilt -- runGenerate pushes a chapter without touching it
  // and celebrateFromServer deliberately reads into a local -- so without this,
  // every chapter in one sitting is handed the identical order and quiz.js
  // takes the identical first four.
  const quizLemmasByChapter = {};
  const askedThisSitting = new Set();
```

**Insert C — immediately AFTER line 372 (the `  }` that closes `latestChapter`), before the blank
line 373.** Exactly **12 lines** (1 leading blank + 11):

```js

  function quizLemmasFor(chapter) {
    if (!quizLemmasByChapter[chapter.n]) {
      quizLemmasByChapter[chapter.n] = chapterQuizLemmas(
        chapter,
        profile && profile.words,
        lemmas,
        askedThisSitting
      );
    }
    return quizLemmasByChapter[chapter.n];
  }
```

**Replacement 1 — `public/views/reader.js:546`.** Replace, quoted exactly (4 leading spaces):
```js
    const chapterStage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: lemmas.length });
```
with
```js
    const chapterStage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: quizLemmasFor(chapter).length });
```

**Replacement 2 — `public/views/reader.js:751`.** Replace, quoted exactly (8 leading spaces):
```js
        startQuiz(slot, {
```
with
```js
        const started = startQuiz(slot, {
```

**Replacement 3 — `public/views/reader.js:752`.** Replace, quoted exactly (10 leading spaces):
```js
          lemmas,
```
with
```js
          lemmas: quizLemmasFor(chapter),
```

**Insert D — immediately AFTER line 761 (`        });`, the close of the `startQuiz` call), before
line 762 (`      }`).** Exactly **10 lines**:

```js
        // T2. quiz.js -- not this file -- decides which four of the list it
        // could actually load, and session.questions is where it says so. That
        // knowledge exists nowhere else, so it is recorded here, at the start,
        // not in onDone: the next chapter's list is built before onDone fires.
        started.then(
          (session) => {
            for (const q of session.questions) askedThisSitting.add(q.lemma);
          },
          () => {}
        );
```

**Arithmetic: 46 + 10 + 12 + 10 = 78 inserted lines; 3 replacements are 1-for-1. 767 + 78 = 845.**
The four blocks were written to files and counted with `awk 'END{print NR}'` today; Insert A was
`node --check`ed as a standalone module and **executed** against her real captured profile (see
below). All four blocks contain **zero** non-ASCII bytes.

**Line numbers after earlier inserts:** an executor applying A, B, C, D in that order must apply
each to the file as it then stands. Anchor by the QUOTED TEXT, never by the number: the four anchors
`function findInGlossary(chapter, dataWord) {`, `  let candidateSet = new Set();`, the `latestChapter`
closing brace, and the `        });` that closes the `startQuiz(` call are each unique in the file
(verified: `startQuiz(` appears exactly once, `candidateSet = new Set();` exactly once,
`function findInGlossary` exactly once).

**Edit 5 — APPEND to `tests/reader-ui.test.js`** exactly these **4** flat tests, names FROZEN, no
`describe(`, no new non-ASCII byte:

1. `'chapterQuizLemmas puts the chapter glossary first and drops what the server could not record'` —
   import `chapterQuizLemmas` from `../public/views/reader.js`. Call it with
   `chapter = { n: 1, glossary: [{ word: 'shadow' }, { word: 'deep breath' }, { word: 'Moon' }, { word: 'nowhere' }, { word: 'shadow' }] }`,
   `words = { shadow: {}, moon: {}, 'deep breath': {}, zoo: {} }`, `pool = ['zoo', 'dark']`,
   `asked = new Set()`, `rand = () => 0.999` (identity shuffle). Assert the result is
   **exactly** `['shadow', 'moon', 'zoo', 'dark']` with `deepStrictEqual`:
   `'deep breath'` is dropped for its space **even though it is a key in `words`**; `'nowhere'` is
   dropped because it is not a key; `'Moon'` is lower-cased; the duplicate `'shadow'` appears once;
   `'zoo'` is not repeated by the top-up. **Derived by hand from the contract before the code
   existed** (field-guide lesson 2).
2. `'chapterQuizLemmas varies the order of the chapter words but never loses one'` — with a 3-word
   glossary all present in `words`: assert `rand = () => 0` gives `['b', 'c', 'a']` and
   `rand = () => 0.999` gives `['a', 'b', 'c']` (both computed by hand off the quoted Fisher-Yates
   and confirmed by executing the block today); then run **200** default-`Math.random` calls, collect
   `join(',')` into a Set, and assert the Set has **more than one** member (order really varies) and
   that **every** result is a permutation of the same three words (nothing is ever lost or
   duplicated). *Negative control included: a shuffle that returned a constant order would fail the
   first assertion, and one that dropped a word would fail the second.*
3. `'a lemma already asked in this sitting goes to the tail, and the list still reaches four'` —
   `pool = ['a','b','c','d','e','f']`, `asked = new Set(['a','b'])`, empty glossary. Assert the
   result is exactly `['c','d','e','f','a','b']`: nothing is dropped, so a sitting can always still
   fill four questions, and the two already-asked words are last.
4. `'a second chapter in the same sitting is not asked the same four words'` — **drive the SHIPPED
   `startQuiz`**, imported from `../public/quiz.js`, twice, with a stub `load` that returns a usable
   item for a fixed set of lemmas and `null` for the rest, a stub `post`, a `rand` of `() => 0`, and
   a fake `container` object exposing `innerHTML` and `querySelectorAll: () => []`. Between the two
   calls, feed the first session's `questions.map(q => q.lemma)` into the `asked` Set exactly as
   Insert D does, and rebuild the list with `chapterQuizLemmas`. Assert the two sessions'
   lemma lists are **disjoint**. Then assert the **control**: with `asked` left empty, the two
   sessions are **identical** — which is what the app does today, and is the defect. *A test whose
   negative control is not also asserted cannot tell "fixed" from "never broken".*

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/views/reader.js
npm test
APP_CODE=dummy npm test
md5sum public/quiz.js public/quiz-core.js   # must be 69b6d711... and 9a2131be...
# COMMIT (orchestrator, at acceptance): "step 1.3: T2 -- chapter-glossary-first quiz list, one
# memoised list per chapter, no repeat within a sitting; quiz.js untouched; ledger 353 flat /
# 358 reported"
```

**MANDATED FAIL-FIRST (run BEFORE the commit; restore after each; record each observed failure line
verbatim — a mutation that does not fail is a STOP):**
- **M1.3a** — delete the line `if (!Object.prototype.hasOwnProperty.call(known, k)) continue;` from
  Insert A. Test 1 must fail: the result becomes `['shadow','moon','nowhere','zoo','dark']`, and the
  `deepStrictEqual` must name `nowhere`. Restore. *(This is the cry-wolf control for the one filter
  whose absence would be invisible in production — the 400 is swallowed.)*
- **M1.3b** — change `if (k === "" || k.includes(" ")) continue;` to `if (k === "") continue;`.
  Test 1 must fail with `'deep breath'` present. Restore.
- **M1.3c** — replace the Fisher-Yates loop with nothing (leave glossary order). Test 2 must fail on
  the `rand = () => 0` expectation `['b','c','a']` **and** on the 200-shuffle variation assertion.
  Restore.
- **M1.3d** — in Insert D, delete the `askedThisSitting.add(q.lemma)` line. Test 4 must fail on
  disjointness. Restore. *(Proves the fix for D2 is wired, not merely written.)*
- **M1.3e** — change Replacement 1 back to `lemmaCount: lemmas.length`. **State plainly what catches
  it.** Expected: **no test in the suite fails** — both arrays have the same length in every fixture,
  so `npm test` stays green. The step's own validation tail *does* catch it (`$STALE` and
  `$NEWCOUNT`), but that is a **guard on the source text, not a gate on behaviour**, and it is
  recorded as a guard. The reason the seam is actually safe is structural, not asserted:
  `quizLemmasFor` is the only producer of the array `startQuiz` receives, and it is memoised, so the
  count and the quiz read the same object unless a future edit gives them different sources. Restore,
  and log the observation verbatim in the step record — this is exactly the "green suite, broken
  screen" shape lesson 15 asks to be named rather than hidden.

**FROZEN VALIDATION:** §VAL-P1 verbatim, then, in the SAME file:
```bash
case "$TOTAL"   in 358) ;; *) fail "expected 358 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 353) ;; *) fail "expected top-level plan 1..353, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 358) ;; *) fail "APP_CODE=dummy: expected 358, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 353) ;; *) fail "expected 353 flat tests, got '$FLAT'";; esac
case "$ENDS" in *"public/views/reader.js CRLF=845 LF=0"*) ;; *) fail "reader.js must stay CRLF-only and gain exactly 78 lines (767+78): $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 "*) ;; *) fail "tests/reader-ui.test.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=729 LF=0"*) ;; *) fail "styles.css must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=368"*) ;; *) fail "trophies.js must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- public/views/reader.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 4) ;; *) fail "reader.js deletions across steps 1.2+1.3 must total exactly 4, got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- tests/reader-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "tests/reader-ui.test.js must be append-only, got $ZERODEL deletions";; esac
PIN344="$(grep -c 'lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));' public/views/reader.js)"
case "$PIN344" in 1) ;; *) fail "the frozen line reader.js:344 must survive byte-identical, got '$PIN344'";; esac
STALE="$(grep -c 'lemmaCount: lemmas.length' public/views/reader.js)"
case "$STALE" in 0) ;; *) fail "the old lemmaCount source survives -- Replacement 1 was not applied";; esac
NEWCOUNT="$(grep -c 'lemmaCount: quizLemmasFor(chapter).length' public/views/reader.js)"
case "$NEWCOUNT" in 1) ;; *) fail "expected exactly one quizLemmasFor-based lemmaCount, got '$NEWCOUNT'";; esac
STARTQ="$(grep -c 'const started = startQuiz(slot, {' public/views/reader.js)"
case "$STARTQ" in 1) ;; *) fail "expected exactly one captured startQuiz call, got '$STARTQ'";; esac
LEMPASS="$(grep -c 'lemmas: quizLemmasFor(chapter),' public/views/reader.js)"
case "$LEMPASS" in 1) ;; *) fail "startQuiz must receive the per-chapter list, got '$LEMPASS'";; esac
BAREL="$(grep -c '^          lemmas,$' public/views/reader.js)"
case "$BAREL" in 0) ;; *) fail "the bare 'lemmas,' argument survives -- Replacement 3 was not applied";; esac
MEMO="$(grep -c 'quizLemmasByChapter\[chapter.n\]' public/views/reader.js)"
case "$MEMO" in 3) ;; *) fail "the per-chapter memo must be read/written exactly 3 times, got '$MEMO'";; esac
NOSTATE="$(grep -c 'started: false, done: false' public/views/reader.js)"
case "$NOSTATE" in 1) ;; *) fail "chapterQuizState must stay exactly { started, done } -- its deepStrictEqual pin is tests/reader-ui.test.js:189-201";; esac
# P1-AMENDMENT #1 applied to step 1.3 as well (orchestrator, 2026-08-01, pre-emptively -- the
# worker hit the identical stale block in 1.2). Steps 1.1 and 1.2 are COMMITTED by the time 1.3
# runs, so their files are clean. Step 1.3's own file list is exactly these two.
EXPECT=' M public/views/reader.js
 M tests/reader-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** `public/quiz.js` and `public/quiz-core.js` are not touched by one byte; no new
`/quiz/*.json` bank item is created (that is content, and FINDING 1 says why it matters, but it is
not this phase's); `reader.js:344` is not edited; `chapterQuizState` gains no third key;
`celebrateFromServer` is not made to reassign `profile`; no Hebrew; no `CACHE` bump; no deploy.

---

# STEP 1.4 — the self-served sandbox visual gate (the composite nobody else can gate)

**GOAL:** a human opens the app in the sandbox browser and **looks**, then **listens**. This is the
only gate in the phase that can see the two things no assertion can: whether the shelf reads as a
shelf, and whether a speaker button that is drawn actually makes a sound. Field-guide 15c and 15's
"audit at the layer the feature lives in": steps 1.1–1.3 are audited in node, where there is no CSS
and no audio.

**TIER:** ORCHESTRATOR (self-served; field-guide lesson 11 is an owner directive — the orchestrator
does this itself and does **not** ask Dennis to look). **DEPENDS ON:** steps 1.1, 1.2 and 1.3, all
accepted.

**FILES:** none. This step writes **nothing** into the repository. Its output is the record.

**PRE-FLIGHT, in this order, none optional (lesson 11, and lesson 3):**
1. **Check port 3000 for a stale server first** — one has squatted before with the wrong `DATA_DIR`
   and answered a probe. `netstat -ano | grep ':3000'`; kill anything found and record the PID.
2. The sandbox profile is `C:/Users/dkreinov/english-app-sandbox/profile.json`. Back it up
   byte-for-byte first and record the md5 of both copies. **Her real profile is never used, never
   read and never written by this step.** `APP_CODE` is never set in the orchestrator shell.
3. Start the server with `DATA_DIR` pointed at the sandbox directory: `npm run dev`. Confirm with a
   `curl --ssl-no-revoke http://localhost:3000/styles.css` that the server serving the page is the
   one just started from this worktree, and that its bytes md5-match `public/styles.css`.
4. **Hard-reload past the stale localhost service worker** before believing anything on screen —
   `magic-vet-v18` is precaching `/styles.css` and `/views/trophies.js` and this phase did **not**
   bump the cache (SK1-5), so a soft reload will show the OLD stylesheet. This is the single most
   likely way this gate lies. Verify in DevTools that the stylesheet actually fetched carries
   `.shelf-banner`.

**THE SEVEN THINGS TO LOOK AT, each recorded with a screenshot into
`C:/Users/dkreinov/trophies-art/polish-p1/`:**
1. `/trophies` at 390px wide (a phone). **Does the top picture read as a SHELF?** The wooden plank,
   its front edge and the string of lights must all be visibly present and must not dissolve into
   the page. This is the whole of T1 and no assertion covers it.
2. The same screen at 320px (the narrowest phone) and at 480px. The banner is `width: 100%` with a
   fixed 3/2 ratio, so the crop is scale-invariant — but the *shadowless, maskless* bottom edge
   against the page background is not, and it is the thing that changed.
3. `/trophies` immediately below the banner: the title and the first row of cards must not look
   crowded now that the fade no longer provides visual separation. If they do, that is a
   `margin-bottom` decision to escalate, **not** to fix silently.
4. `/` (home) and the reader's start-story screen: `.hero-banner` is still faded there. Confirm by
   eye that those two screens are **unchanged**, which is the design's explicit non-goal.
5. In the reader, tap a word that HAS a clip (`shadow`, `forest`, `voice`) — the speaker button must
   appear and **must actually make a sound**. Turn the volume up; a swallowed 404 is silent and looks
   identical to a working button that is muted.
6. Tap a word that has NO clip (`nervous`, `moon`, `growls`) — there must be **no speaker button at
   all**, and the save button must still work.
7. Finish a chapter's questions to reach the quiz, note the four words asked, then generate the next
   chapter **in the same sitting** and reach its quiz. **The four words must be different.** This is
   T2's only real gate: it is the exact thing the learner reported, observed end to end.

**AFTERWARDS:** stop the server, restore the sandbox profile byte-from-backup, and confirm the md5
matches the pre-flight value **before** the step is recorded (lesson 11). Confirm
`.data/profile.json` is still absent and `git status --porcelain -uall` outside `.oplan/` is empty.

**FROZEN VALIDATION:** §VAL-P1 verbatim, then, in the SAME file:
```bash
case "$TOTAL"   in 358) ;; *) fail "expected 358 reported tests, got '$TOTAL'";; esac
case "$FLAT"    in 353) ;; *) fail "expected 353 flat tests, got '$FLAT'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$PORC" in "") ;; *) fail "the visual gate must write NOTHING into the repo. got:
$PORC";; esac
SANDBOX="$(md5sum C:/Users/dkreinov/english-app-sandbox/profile.json | cut -d' ' -f1)"
echo "SANDBOX PROFILE md5 = $SANDBOX   (must equal the pre-flight backup's md5, recorded in the step record)"
PORT="$(netstat -ano | grep -c ':3000 ' || true)"
case "$PORT" in 0) ;; *) fail "a server is still listening on port 3000 -- stop it before recording this step";; esac
exit $RC
```
(`$PORC` is empty here, not a write set: this step is the only one in the phase that must leave the
tree byte-identical to the step-1.3 commit.)

**THE STOP RULE:** if item 1 or item 7 does not hold, **STOP and escalate.** Do not adjust the CSS
or the selector inside this step — a visual gate that fixes what it finds has stopped being a gate.

**NON-GOALS:** never production, never the real profile, no deploy, no `curl` at the live host, no
`GET /api/profile` against anything but the local sandbox server.

---

# STEP 1.5 — phase close

**GOAL:** re-run every acceptance criterion on the finished result, record what moved and what did
not, write the carried obligations into `.oplan/word-polish/phase-state.md`, and hand phase 2 a
written statement of exactly what it inherits.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** steps 1.1–1.4, all accepted.

**FILES:** `.oplan/word-polish/phase-state.md`, `.oplan/word-polish/journal.md`,
`.oplan/word-polish/field-guide/index.md` (all under `.oplan/`, all filtered out of every executor
write set; **no repository file is touched**).

**WHAT THE CLOSE MUST RECORD, and it is not optional:**
1. All 16 acceptance criteria, re-run, each with its observed value.
2. The new pins: `public/styles.css` CRLF=729, `public/views/reader.js` CRLF=845,
   `public/views/trophies.js` LF=368, the new `public/` full digest (it necessarily moves — three
   files changed), and the unchanged `$PUBX` `2369 839de1b098be5014a4488ba79064a1ab`.
3. **CARRIED OBLIGATION P1-1** verbatim (SK1-5): the ship phase owes `CACHE`
   `magic-vet-v18` → `magic-vet-v19` and the `tests/shell.test.js:57-58` pin, because three
   precached files moved unbumped.
4. **CARRIED OBLIGATION P1-2 — for phase 2:** the manifest⟷clip correspondence is now gated by
   `tests/reader-ui.test.js` and pinned in §VAL-P1 at `2254 2254 0 0` and md5
   `8735a3c499508b04415046e2be4ad159`. **Phase 2 moves both numbers together or the gate fires.**
   Generating the 10 clips of BLOCKER B2 means the manifest goes to 2264 and the clip count to 2264,
   and the test's literals plus §VAL-P1's `$CLIPS` / `$MANMD5` / `$PUBX` / `$PUBN` pins must all move
   in the same step. **This, together with B2's ten-word list, is the phase's most valuable output
   and it must be written down, not remembered.**
5. **BLOCKER B1, still open** (below) — T2's chapter-first half is inert until the quiz bank covers
   story words. The close must state whether the owner has ruled.
6. Field-guide amendments to propose (additive only): lesson 4's ending table is stale for
   `tests/shell.test.js` and `public/index.html`; and a new lesson candidate —
   **"before implementing a design's premise, MEASURE the premise: two of word-polish's three
   premises were false on disk, and one of them (T2) would have shipped a change the child could
   not perceive."**
7. The exact list of what a human saw in step 1.4, with the screenshots' paths.

**FROZEN VALIDATION:** §VAL-P1 verbatim, then the full step-1.3 tail (358/353/0), plus:
```bash
case "$PORC" in "") ;; *) fail "the close must write nothing outside .oplan/. got:
$PORC";; esac
FULLPUB="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");const s=fs.statSync(f);if(s.isDirectory())walk(f);else out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
echo "NEW public/ FULL DIGEST (record this as the phase-close pin): $FULLPUB"
exit $RC
```

**NON-GOALS:** no deploy, no `CACHE` bump, no capture, no clip generation, no repository file
touched.

---

## RISKS

1. **T2's chapter-first half is inert and the phase could close believing it shipped a fix.** The
   mitigation is that this plan states it in FINDING 1 with numbers, and that step 1.4 item 7 gates
   the thing the learner actually reported (different questions on the next chapter) rather than the
   thing the design described. **The chapter-first code is still worth landing** — it is correct, it
   is what the owner ruled, and it becomes live the moment the bank covers a story word — but nobody
   may claim it changed her experience.
2. **The visual gate can lie through the service worker.** `magic-vet-v18` precaches `/styles.css`
   and `/views/trophies.js`, and this phase deliberately does not bump the cache (SK1-5). A soft
   reload in the sandbox will show the OLD stylesheet and the OLD trophies view, and the shelf will
   look exactly as broken as before. Step 1.4's pre-flight item 4 makes the hard reload and the
   DevTools confirmation mandatory. **This is the single most likely way this phase produces a false
   negative.**
3. **`sed` on this machine reads the two CRLF files in text mode** (measured: `sed -n '415p'
   public/styles.css | cat -A` prints `$`, not `^M$`). Any executor who reaches for `sed`, `awk` or
   a naive `readFileSync/split/join` will silently normalise `public/styles.css` or
   `public/views/reader.js` to LF, `git diff` will show nothing, and the ship phase's md5 proof will
   become a whole-file hunt. §VAL-P1's `rb` counter is the only thing that catches it, and it is in
   every step.
4. **Three precached files change with no `CACHE` bump.** Safe only because phase 1 does not deploy.
   If anything at all is deployed before the ship phase bumps to v19, phones will serve a mixture of
   old and new. Obligation P1-1 exists for this reason and §VAL-P1 pins `sw.js`'s md5 so the bump
   cannot be spent early either.
5. **The quiz change is the one that can break her reading flow.** If a chapter yields too few words
   the quiz must still work; if it yields none, `afterChapterStage` must still return `celebrate` and
   the QZ-18 no-questions path (`quiz.js:247-250`, `onDone({right:0,total:0})` with **no** done
   screen) must still fire without celebrating. The SK1-3(c) tail rule guarantees the list is never
   shorter than the pool, so this phase can only ever make the list **longer**, never shorter — the
   failure mode is structurally excluded rather than merely tested.
6. **A future `await` on `started` would change the quiz's timing.** Insert D deliberately uses
   `.then(..., () => {})` and not `await`: `bindEvents()` is synchronous and awaiting inside it would
   reorder the draw. Anyone "tidying" this to `await` is changing behaviour.
7. **The `.shelf-banner` bottom edge is now a hard edge against the page.** Removing the fade is the
   point, but it may read as abrupt where the faded version read as soft. Step 1.4 item 3 looks at
   exactly this, and the stop rule says escalate rather than adjust.

---

## BLOCKERS — owner rulings needed

**B1 (blocks nothing in phase 1, blocks the *claim* phase 1 makes) — T2 as signed cannot change what
she is asked.** Measured: her six chapters contribute 36 distinct glossary words; the quiz item bank
holds 62 lemmas; the intersection is one word (`light`), which is not in her profile and whose
answer the server would reject `400 'unknown word'`. The plan therefore ships **chapter-first plus a
no-repeat-within-a-sitting rule**, and the second half is what fixes the reported defect (3 distinct
question sets instead of 1). **The owner should rule on which of these he wants recorded as "D2
fixed":**
- (a) ship both, call D2 fixed by the no-repeat rule, and open a separate run to grow the quiz bank
  to cover story words — **this plan's recommendation**;
- (b) ship both and additionally generate bank items for the 36 glossary words in this run — that is
  content generation, needs the free-web route, and does not belong in a code phase;
- (c) ship chapter-first only, and accept that nothing she sees changes.

**B2 (blocks phase 2, raised here because phase 1 is what discovers it) — four of the 17 "missing"
words are inflections whose lemma already has a clip, and adding them changes how her vocabulary is
keyed.** `resolveLemma` tries an **exact match first** (`public/lemma.js:6-9`). Today
`closer`→`close`, `softly`→`soft`, `suddenly`→`sudden` and `wings`→`wing` all resolve to a lemma that
already has a clip, so those four words already speak. If phase 2 generates `closer.aac`,
`softly.aac`, `suddenly.aac`, `wings.aac` and adds them to the manifest, then `resolveLemma("wings")`
starts returning `"wings"`, and `migrateWordKeys` (`lib/profile.js`, `resolveLemma(key, allowedSet)
|| key`) **stops folding `wings` into `wing`** — her vocabulary silently splits into two entries for
one word, on the server, in her real profile.

Worse, the design's list is also redundant in the other direction: `resolveLemma` de-inflects, so one
BASE word covers several surface forms. Driving the shipped `lemmaCandidates` / `resolveLemma` over
all 17 today:

| design's word | what it needs | why |
|---|---|---|
| `closer`, `softly`, `suddenly`, `wings` | **nothing** | already resolve to `close`, `soft`, `sudden`, `wing`, which already have clips. Generating these four is the vocabulary-splitting bug above |
| `glow`, `glowing`, `glows` | **`glow`** only | `lemmaCandidates` gives `glow` for all three |
| `growls` | **`growl`** | same shape as `wings`→`wing` today |
| `tightly` | **`tight`** | same shape as `softly`→`soft` today |
| `deep breath` | **nothing** | contains a space, can never be a lemma file |
| `after deer feet harm moon nervous scary` | themselves | no candidate of any of them is in the manifest |

**So phase 2's list is 10 words, not 17:**
`after · deer · feet · glow · growl · harm · moon · nervous · scary · tight`.
That covers **all 16** non-space glossary words that are silent today, splits no profile key, and is
41% of the generation the design assumed. **Owner ruling required before any generation.**

**B3 (already in the design, restated because it is still open) — clip generation uses a PAID API**
against the standing free-web-route preference. Phase 2, not phase 1. Phase 1 generates nothing and
§VAL-P1 pins the manifest's md5 so it cannot.

---

## RECORD GAPS

1. **`.oplan/word-trophies/plan.md:1524` pins `tests/shell.test.js` at LF=94; it is LF=96 today.**
   `:1516` pins `public/index.html` at CRLF=81; it is CRLF=90. Both are stale post-edit pins from
   phases that then edited those files. Harmless, but they are exactly the kind of remembered number
   lesson 4 says never to trust. Correct at the close.
2. **The design says "her five chapters"; there are six** (`readback-2.json`, chapters 1–6), with 50
   glossary entries and 36 distinct words. The design's derived numbers (50 entries, 17 words with no
   clip, `deep breath` has a space) are all **correct**; only the chapter count is off by one.
3. **The design's "29 have a clip" counts glossary ENTRIES, not distinct words.** By distinct word it
   is 19 of 36. Both are true of different things; the plan uses distinct words throughout and says
   so.
4. **Nothing in the record explains why the quiz item bank is 62 lemmas** or who decides when it
   grows. `scripts/build-item-bank.js`, `scripts/check-quiz-bank.mjs` and `scripts/quiz-topup.mjs`
   exist and were **not** read by this planner (they are out of phase-1 scope, and `scripts/` is
   frozen by §VAL-P1). Whoever takes B1(a) must start there.
5. **No record states the invariant "the allowed-word set IS the audio manifest".** It is the single
   fact `canSay` rests on and it was nowhere written down. Step 1.2 makes it an assertion; the close
   should also write it into `phase-state.md` in words.

---

## WHAT THIS PLANNER COULD NOT MEASURE, STATED PLAINLY

1. **Whether the new banner looks right.** Four crops were rendered and looked at as flat PNGs in
   isolation. Nobody has seen `.shelf-banner` in a browser, on the real page, above the real cards,
   at a real device width. **Step 1.4 exists because this is unmeasurable from here**, and no
   assertion in this plan claims otherwise.
2. **Whether a speaker button makes a sound.** Every check available to me proves the FILE exists and
   the URL is right. Nothing in node can prove the browser decodes and plays a 2018-era AAC on her
   device. Step 1.4 item 5 is a human with the volume up.
3. **What her profile looks like today.** The most recent on-disk capture is
   `trophies-deploy/readback-2.json` from word-trophies phase 4 (2026-07-31). Her live profile has
   moved since — the `lastQuizAt` values in it already run to `2026-07-31T13:23`. **I did not and
   will not read `/api/profile`** (field-guide lesson 3: a GET creates one). Every T2 number in this
   plan is therefore "as of that capture"; the *mechanism* does not depend on it, but the specific
   words in the tables might have shifted by one or two.
4. **Whether 200 shuffles is enough for test 2's variation assertion to be non-flaky.** It is: the
   probability that 200 independent uniform shuffles of 3 items all produce the same permutation is
   `(1/6)^199`. Measured today: 200 shuffles produced all **6** permutations.
5. **Whether the quiz bank will ever cover story words.** Out of scope, and B1 asks the owner.

---

## PLAIN PLAN

*(One line per step, for the owner, no jargon — each says WHY.)*

- **Step 1.1** — Give the trophy shelf picture its own styling instead of borrowing the styling the
  other pictures use, and take away the fade that makes its bottom quarter disappear into the page.
  *Why: the fade starts one pixel into the shelf's front edge and wipes out both the edge and the
  string of fairy lights hanging off it — the two things that make the picture look like a shelf at
  all. Measured: the shelf edge is showing at about half strength and the lights at about half
  strength. The picture itself is fine and the framing is fine; only the fade is wrong, so only the
  fade is removed.*
- **Step 1.2** — Add the checks that prove every word the app offers to read aloud really has a
  recording, and that the app and the server are reading the very same list of words. *Why: I
  expected to find a bug here and there isn't one — the speaker button is already honest, all 36
  words in her chapters included. But nothing anywhere checks it, and the very next piece of work is
  recording new words. The day a word gets added to the list without its recording, the button goes
  silent and every test still passes. These checks are what stop that. This step also found that the
  recording job is smaller and more delicate than we thought — ten words, not seventeen, and four of
  the seventeen would actively cause a bug if we recorded them.*
- **Step 1.3** — Make the end-of-chapter questions come from the chapter she just read, and — more
  importantly — stop the app asking her the same four words at the end of every chapter in one
  sitting. *Why: this is the one she actually complained about, and the cause turned out to be
  simple: the app picks the word list once when it opens and never picks again, so chapter after
  chapter it hands the quiz the identical list. With this change she works through all twelve of her
  quizzable words before any of them comes back. Honest warning: the "words from this chapter" half
  will not change anything she sees yet — there are no practice questions written for story words
  like "moon" or "deer" — and that needs a separate decision from you.*
- **Step 1.4** — Actually open the app in a test browser and look at the shelf on a phone-sized
  screen, tap a word and listen to it, and finish two chapters in a row to check the questions really
  are different — using a pretend profile, never yours. *Why: no automatic check can tell whether a
  picture reads as a shelf or whether a speaker button makes a sound. The last run shipped three
  broken screens past 349 passing tests and a human found all three. Somebody has to look.*
- **Step 1.5** — Re-run every check on the finished result and write down, for the next piece of
  work, exactly what it inherits: that the app's cache version still has to be bumped before
  anything ships, and that adding recordings means moving four different numbers in the same breath
  or the new checks will fire. *Why: the most valuable thing this run produces is not the three
  changes — it is a written statement of what the audio work is about to walk into.*

**DONE WHEN:** the trophy shelf reads as a shelf on a phone with its front edge and its lights
intact, and the home and story pictures are untouched; the end-of-chapter quiz draws on the chapter's
own words first and never repeats a word within one sitting, so a second chapter asks four different
questions; every word offered with a speaker button provably has a recording, checked by a test that
was watched failing; the whole suite passes at **353 tests** (358 counting sub-tests) both with and
without the app code set; the colour checker still passes exactly **58** pairs; the practice engine,
the service worker, the audio recordings and the whole server have not moved by a single byte;
exactly **5** files changed with exactly **5** deleted lines in the whole phase; a human has looked
at the screen, listened to a word and read two chapters in a row; and nothing was deployed, no
capture was taken, and your real profile was never touched.
