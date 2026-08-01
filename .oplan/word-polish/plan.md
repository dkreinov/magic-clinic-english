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


# PLAN — word-polish PHASE 3 "ship" (draft)

Planned 2026-08-01 by a fresh planner (files only, read-only mandate — this planner changed nothing
in the repository, ran no `vercel` command, made no request to production, and never opened `.env`).

Repo `C:/Users/dkreinov/claude/english-app`, clean at `ae349c6`. Workspace `.oplan/word-polish/`.
Owner's standing instruction today: **"always think easy and robust."** Every decision below names
which of the two it serves, and says so out loud where they pull apart.

**THE ONE SENTENCE:** phase 1 changed three shipped files and they are still only on this machine;
this phase bumps the service-worker cache so returning devices actually pick them up, deploys once
with the ritual that was proven in production on 2026-07-30, and proves — by bytes, by
reachability, and by reading her profile back — that nothing was lost.

---

## WHAT THIS PLANNER MEASURED TODAY (nothing below is inherited or remembered)

Every number in this plan came out of one of these commands, run today against the clean tree at
`ae349c6`:

| measured | command | result |
|---|---|---|
| suite, plain | `npm test` | `1..353`, `# tests 358`, `# pass 358`, `# fail 0`, exit 0 |
| suite, gated | `APP_CODE=dummy npm test` | `1..353`, `# tests 358`, `# fail 0`, exit 0 |
| flat ledger | `grep -h -c '^test(' tests/*.js \| awk '{s+=$1} END{print s+0}'` | **353** |
| contrast | `node scripts/check-contrast.mjs` | `ALL PASS`, `grep -c '^PASS'` = **58** |
| quiz bank | `node scripts/check-quiz-bank.mjs` | `QUIZ BANK OK: 62 files, 84 items` |
| npm scripts | `node -e 'console.log(JSON.stringify(require("./package.json").scripts))'` | `{"test":"node --test","dev":"node scripts/dev-server.js"}` — **there is no `contrast` script** |
| `public/` digest | the walk-and-md5 one-liner in §VAL-P3 | `2372 d5f035bc48093f320b44099e879e1610` |
| `public/` minus `sw.js` | same walk with `public/sw.js` skipped | `2371 d82e7f9761991b66cbf5139422f6acba` |
| endings + bytes + md5 | a byte-scanning `node -e` over 12 files, and independently `tr -dc '\r' \| wc -c` | table below |
| the shipped payload | `git diff --name-only --diff-filter=ACMR a40cdb2..HEAD -- public/ \| LC_ALL=C sort` | `public/styles.css`, `public/views/reader.js`, `public/views/trophies.js` |
| the phase-1 write set | `git diff --name-only 1e470bd HEAD \| awk '$NF !~ /^\.oplan\//' \| LC_ALL=C sort` | 5 paths (below) |
| transcripts | both `.mjs` transcripts vs their expected files | both diff EMPTY |
| audio manifest | `JSON.parse(public/audio/words/index.json)` | array, **2254** entries, md5 `8735a3c499508b04415046e2be4ad159` |
| manifest honesty | every entry checked for its `.aac` on disk | **0 entries have no clip** |
| `readback.js` | read in full at `C:/Users/dkreinov/trophies-deploy/readback.js` | **IS the repaired version** — see SK-P3-4 |
| previous captures | `ls /c/Users/dkreinov/english-app-backups/` | `profile-20260730-114016.json`, `profile-20260730-201842.json` — **both still present** |
| previous work dir | `ls $HOME/trophies-deploy/` | 21 artifacts from the PREVIOUS run, incl. `capture-path.txt` naming `profile-20260730-201842.json` |

**NOT measured, and therefore never asserted as fact anywhere in this plan:** anything about
production. This planner was forbidden to `curl` the live site or run `vercel`, so every live value
(the outgoing deployment id, the live `sw.js`, the live md5s, the HTTP headers on `/sw.js`) is
written as a *thing the executor must measure*, never as a thing already known. The one live value
this plan quotes — `dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB` — is quoted **from the record**
(`.oplan/word-polish/phase-state.md:9`, corroborated by `$HOME/trophies-deploy/incoming.txt`) and
step 3.2 treats it as a **hypothesis to confirm**, exactly as word-trophies step 4.1 did.

---

## ⚠ BLOCKING RECORD ERROR — THE BRIEFING'S "ENDINGS CORRECTION" IS ITSELF WRONG

`BRIEFING-POLISH-P3.md:81-85` says:

> "**ENDINGS CORRECTION — the phase-1 brief was WRONG and you must not inherit its error.** It
> stated `trophies.js LF=368` and `tests/*.js LF`. Measured today on disk: **every one of these five
> files is CRLF** …"

**That correction is false for two of the five files.** Measured today, twice, by two independent
methods (a byte scan in `node`, and `tr -dc '\r' | wc -c` in the shell):

| file | CR bytes | LF bytes | verdict | bytes | md5 |
|---|---|---|---|---|---|
| `public/styles.css` | 729 | 729 | **CRLF** ✓ briefing right | 17846 | `b6aa9c229ca269f39f468c60f50c45b4` |
| `public/views/reader.js` | 845 | 845 | **CRLF** ✓ briefing right | 27597 | `b5b37fc370436f4c6ad62244cc298bde` |
| `public/sw.js` | 51 | 51 | **CRLF** ✓ briefing right | 1136 | `d76f781dc49c5f629aba0f2dfe3304b6` |
| `public/views/trophies.js` | **0** | 368 | **LF** ✗ **briefing WRONG** | 16333 | `1c601eb05071edf7413d0d738067d1ea` |
| `tests/shell.test.js` | **0** | 96 | **LF** ✗ **briefing WRONG** | 3604 | `cbb33bfeb08574024c374a6288fbfed8` |

Three independent corroborations that the *original* record was right and the briefing's correction
is the error:

1. `.oplan/word-polish/design.md:40-41` — *"`reader.js` CRLF, `styles.css` CRLF, `sw.js` CRLF,
   `trophies.js` LF, `tests/*.js` LF."*
2. `.oplan/word-polish/phase-state.md:13` — *"endings on disk: reader.js CRLF, styles.css CRLF,
   sw.js CRLF, trophies.js LF, tests LF."*
3. **The strongest one:** `C:/Users/dkreinov/trophies-art/VAL-P1.sh:82` — the gate that actually
   RAN, five times, through all of phase 1 — carries
   `case "$ENDS" in *"tests/shell.test.js CRLF=0 LF=96"*)` . A gate that ran clean five times cannot
   have been asserting an ending the file does not have. Word-trophies `§VAL-P4` likewise pins
   `public/views/trophies.js CRLF=0 LF=368` (`.oplan/word-trophies/plan.md:4155`).

The briefing's own byte counts also disprove its own claim: `trophies.js` is 368 lines at 16333
bytes. If those 368 line breaks were CRLF the file would be 16701 bytes.

**WHY THIS IS BLOCKING AND NOT A NIT.** `tests/shell.test.js` is one of the two files this phase
edits, and it is **LF in a repository with `core.autocrlf=true` and no `.gitattributes`**
(both measured today). Field-guide lesson 4: *"an Edit-tool insert CRLF'd a whole LF file, and
`git diff` normalises so the damage is INVISIBLE to any git-based gate."* A plan written on the
briefing's belief would have pinned `tests/shell.test.js CRLF=96 LF=0` — a gate that **can only be
satisfied by corrupting the file**, and that would then have passed while the deploy shipped from a
tree whose test file had silently flipped. Step 3.1 below therefore edits `sw.js` and
`shell.test.js` by **two different byte-preserving mechanisms** and pins both endings explicitly.

Nothing else in the briefing was found wrong. The rest of its measured values reproduced exactly.

---

## GOAL, AND EXACTLY WHAT MOVES

**GOAL** (design §T4): *"All three changes ship together. `CACHE` `magic-vet-v18` →
`magic-vet-v19`, and `tests/shell.test.js`'s pin moves in the same step. The ship phase repeats the
proven ritual: fresh D25 capture, one deploy to a file, md5 live-vs-worktree over the changed
payload, PRECACHE and asset reachability, and a read-back that must show nothing lost."*

**THE ONLY REPOSITORY WRITE OUTSIDE `.oplan/` IN THIS ENTIRE PHASE IS STEP 3.1.** Two files, one
commit. From step 3.2 to the close, the tree is frozen and `§VAL-P3` enforces that mechanically at
every step. If a defect is found after 3.1, the fix is a NEW gated step on a NEW plan, never an
in-place edit inside a deploy phase (the word-trophies precedent, `journal.md:1298-1308`).

**Phase-1's payload, already committed and waiting (measured, `a40cdb2..HEAD -- public/`):**

| path | endings | lines | bytes | md5 | in PRECACHE? |
|---|---|---|---|---|---|
| `public/styles.css` | CRLF | 729 | 17846 | `b6aa9c229ca269f39f468c60f50c45b4` | **yes** (`/styles.css`) |
| `public/views/reader.js` | CRLF | 845 | 27597 | `b5b37fc370436f4c6ad62244cc298bde` | **yes** (`/views/reader.js`) |
| `public/views/trophies.js` | **LF** | 368 | 16333 | `1c601eb05071edf7413d0d738067d1ea` | **yes** (`/views/trophies.js`) |

All three are in `PRECACHE` (verified against `public/sw.js:2-18`). That is what makes the bump
mandatory under QZ-22, and it is not a formality: a returning device holds the whole `magic-vet-v18`
cache and `sw.js:49` serves `caches.match(request)` **before** the network, so without a new cache
name she would go on being served the three OLD files indefinitely.

**What step 3.1 adds to the payload:**

| path | endings | lines | bytes | md5 BEFORE | md5 AFTER (computed in memory today, not written) |
|---|---|---|---|---|---|
| `public/sw.js` | CRLF | 51 | 1136 → 1136 | `d76f781dc49c5f629aba0f2dfe3304b6` | `6d836788d379e7872ce730cfec5db51a` |
| `tests/shell.test.js` | **LF** | 96 | 3604 → 3604 | `cbb33bfeb08574024c374a6288fbfed8` | `ca6c242a97ba1904994d491b5a04aaf8` |

Both edits are pure single-character substitutions (`v18`→`v19`, `v17`→`v18`), so **the byte count
must not change**: 1136 and 3604 before and after. That is the cheapest possible corruption
detector and both gates assert it.

**Test files are NOT deployed.** `tests/reader-ui.test.js` and `tests/trophies-ui.test.js` changed
in phase 1 and `tests/shell.test.js` changes here; none of them may ever appear in a live-vs-worktree
comparison. The mechanism that guarantees this is structural, not vigilance — see SK-P3-3.

---

## ACCEPTANCE CRITERIA (mechanical — all re-run at the phase close, step 3.9)

1. `STEP-3.1-OK` … `STEP-3.9-OK` all print (3.7 is a human gate and prints nothing).
2. **The repository moved exactly once, by exactly two files.**
   `git diff --name-only 1e470bd HEAD | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort` equals, from step
   3.1 onward and at the close, exactly these seven lines and no others:
   ```
   public/styles.css
   public/sw.js
   public/views/reader.js
   public/views/trophies.js
   tests/reader-ui.test.js
   tests/shell.test.js
   tests/trophies-ui.test.js
   ```
   (the first five are phase 1's, already committed; `public/sw.js` and `tests/shell.test.js` are
   this phase's). Nothing is ever deleted. The tree is clean outside `.oplan/` at every step.
   **This clause lives inside `§VAL-P3` itself**, so "at every step" is literally true rather than a
   claim only the close checks.
3. `npm test` → `# tests 358`, `# fail 0`, plan `1..353`; identical under `APP_CODE=dummy`; flat
   ledger **353**; `node scripts/check-contrast.mjs` prints `ALL PASS` with `grep -c '^PASS'` =
   **58**. **Unchanged all phase — this phase adds no test and no colour token.** (There is no
   `npm run contrast`; a gate that calls it exits non-zero for the wrong reason.)
4. Both transcripts diff EMPTY; `.data/profile.json` absent; **no `profile-*.json` anywhere inside
   the repository** at any point.
5. `public/` file count is **2372** all phase; `public/` minus `sw.js` is byte-frozen at
   `2371 d82e7f9761991b66cbf5139422f6acba` all phase; `public/sw.js` is in exactly one of its two
   known states and in the POST state from 3.1 onward.
6. **QZ-18 re-pinned:** `public/quiz.js` md5 `69b6d71117cf776715374abc6f0abb02`, `public/quiz-core.js`
   md5 `9a2131be8b9d1b77c219f1e8c3482a71`, untouched at every step.
7. **The audio manifest never moves:** `public/audio/words/index.json` md5
   `8735a3c499508b04415046e2be4ad159`, 2254 entries. **No audio is generated in this phase.**
8. **The outgoing deployment was frozen BEFORE the deploy**: `vercel inspect` ran first, output to a
   FILE, and its id + url were copied verbatim into `.oplan/word-polish/phase-state.md` **and
   committed** before step 3.4.
9. **The D25 capture exists and is proven, taken AFTER 3.2 and BEFORE the deploy**, with the frozen
   subshell verbatim: HTTP 200, ≥200 bytes, parseable, non-empty `words` map,
   `validateProfile(prof).ok`, prints `BACKUP OK bytes=… words=… known=… candidate=…`; receipt
   (path + bytes + sha256 + counts) appended to `.oplan/word-polish/backup-receipt.txt`;
   **contents never recorded**; the `APP_CODE` post-assertion passed; the capture is **less than
   3600 s old at the moment of the deploy**.
10. **The deploy ran exactly ONCE**, `--prod --yes`, output to a FILE.
    `grep -o 'dpl_[A-Za-z0-9]*' deploy.log | LC_ALL=C sort -u | wc -l` = **1**, and `vercel inspect`
    on the alias afterwards reports that same id, and it is **not** the outgoing id.
11. **THE MD5 PROOF.** For every one of the **4** enumerated payload paths under `public/`, live
    bytes md5 == **worktree** bytes md5 (never a git blob, never `git show HEAD:`). Enumerated by
    `git diff --name-only --diff-filter=ACMR "$OC"..HEAD -- public/ | LC_ALL=C sort`, and that
    enumeration is additionally asserted equal to the frozen four-path literal. The shell would be
    fetched as `/`, not `/index.html` (`cleanUrls` 308s) — it does not appear this time because
    `index.html` did not change.
12. **THE CACHE BUMP IS PROVEN.** Live `/sw.js` md5 == worktree `6d836788d379e7872ce730cfec5db51a`,
    contains `magic-vet-v19` exactly once, and does **not** contain `magic-vet-v18`.
13. **THE PRECACHE IS INSTALLABLE.** All **15** `PRECACHE` URLs — **derived from the `sw.js`
    production actually serves**, not hard-coded — return 200. `public/sw.js:24` is
    `cache.addAll(PRECACHE)`, which rejects as a whole if any one URL fails, leaving every returning
    device on the v18 shell **forever**.
14. **THE SPEAKER BUTTON'S SOURCE OF TRUTH IS REACHABLE.** `/audio/words/index.json` returns 200
    with md5 == worktree `8735a3c499508b04415046e2be4ad159`, and the three frozen sample clips
    `/audio/words/a.aac`, `/audio/words/kitchen.aac`, `/audio/words/zoo.aac` return 200 with md5 ==
    worktree. See SK-P3-6 — this is the criterion that answers review question 1 for the one
    artifact that is fetched at runtime and is in nobody's precache list.
15. **THE TROPHY ART STILL ANSWERS.** All nine `/assets/trophies/<id>.webp` return 200 with
    `content-type: image/webp` and md5 == worktree, fetched with the exact camelCase filenames
    (`quizRight.webp`). None of them is in `PRECACHE`; that is by design (T6) and must not be
    "fixed".
16. **The function bundle loaded**: `/api/health` returns exactly
    `{"ok":true,"data":{"status":"up","version":1}}` and unauthenticated `/api/chapter` returns
    **401**. **`/api/profile` is never requested unauthenticated.** A negative control
    (`/assets/trophies/zzznotatrophy.webp`) still 404s.
17. **READ-BACK R1 (immediately post-deploy)**, via the frozen subshell, with the two compared files
    bound to distinct explicit paths, and only after the comparator's 8-case self-test has written
    `SELFTEST 8/8 AS REQUIRED` **in this phase's own directory**: 200; `validateProfile(live).ok`;
    live word-key count ≥ the capture's; the set difference `capture \ live` is EMPTY; every status
    change carries activity evidence; every trophy tier present in the capture is still present
    live with a **byte-identical timestamp**.
18. **READ-BACK R2 (after her first real session)**: the same assertions, plus every tier that
    appeared carries activity evidence, plus the shipped engine re-run over R2 agrees that nothing
    is stamped which it would not award. A DISAPPEARING tier, a changed timestamp, or a lost word
    key at either read-back → **STOP, roll back, owner**.
19. **HUMAN GATE (step 3.7)**: the owner opened the app on a real device against the written
    checklist and said yes. No agent in this run may open a browser on production (lesson 11).
20. **Exactly THREE authenticated requests to `/api/profile` happen in the whole phase** — C2, R1,
    R2 — each a deliberate, counted GET. `APP_CODE` is asserted unset before and after each one, and
    appears nowhere in any file, log, receipt or record.
21. The rollback command is in `.oplan/word-polish/phase-state.md` verbatim before the deploy and
    re-confirmed after, with the new deployment recorded at the top of the rollback ladder at the
    close.
22. **D27 rider re-asked, not assumed:** the owner is asked whether the capture files are deleted at
    the close. Two older captures already sit in `/c/Users/dkreinov/english-app-backups/`; deletion,
    if ruled, happens strictly AFTER R2 and the criteria re-run.

---

## DEPENDS ON (every row read or measured today)

| thing | where | verified |
|---|---|---|
| design §T4, and §T3(b) which is **NOT in this phase** | `.oplan/word-polish/design.md:84-88`, `:70-83` | read in full |
| the phase-2 STOP and why no audio is generated | commit `ae349c6` message; briefing §"WHAT CHANGED" | read; re-measured (manifest still 2254, md5 unchanged) |
| field guide, all 15 lessons | `.oplan/word-polish/field-guide/index.md` (`wc -l` = **133**, matching `phase-state.md:5`) | read in full |
| **lesson 4 (endings are law; `git show HEAD:` is the LF blob)** | `field-guide/index.md:17-31` | quoted below; **it is what caught the briefing's error** |
| **lesson 10 (DEPLOY)** | `field-guide/index.md:52-55` | quoted verbatim below |
| **lesson 3 (the profile is live; a GET CREATES one)** | `field-guide/index.md:11-16` | quoted verbatim below |
| lesson 11 (visual gates are sandbox-only, NEVER production) | `field-guide/index.md:56-59` | quoted verbatim below |
| lesson 14 (view-scoped CSS cannot style a body-level element) | `field-guide/index.md:78-89` | read; discharged in SK-P3-7 |
| lesson 15 (the three ways a green suite ships a broken screen) | `field-guide/index.md:90-133` | read in full; it is why 3.7 exists and why SK-P3-6 exists |
| **the template: word-trophies PHASE 4 in full** | `.oplan/word-trophies/plan.md:3638-5396` | read in full — criteria, SK4-1…SK4-11, §VAL-P4, steps 4.1-4.8, the 22-row stopping table |
| the ritual scripts **as executed** | `$HOME/trophies-art/step-4.2.sh`, `step-4.4.sh`, `step-4.7.sh` | read in full; adapted, not rewritten |
| the read-back comparator | `$HOME/trophies-deploy/readback.js` (3660 bytes) | read in full; **repaired version confirmed** (SK-P3-4) |
| the previous run's artifacts, which must NOT be reused as evidence | `$HOME/trophies-deploy/` — `capture-path.txt`, `precache-urls.txt`, `selftest/`, `readback-{1,2}.{json,log}`, `deploy.log`, `outgoing.txt`, `incoming.txt` | listed and read; SK-P3-5 forces new paths |
| **the run's own preamble, which this one adapts** | `$HOME/trophies-art/VAL-P1.sh` (99 lines, ran clean 5x) | read in full |
| `public/sw.js` (51 lines) and `tests/shell.test.js` (96 lines) | the repo | read in full |
| the service-worker update path | `public/sw.js:20-51`, `public/app.js:57-67` | read in full; SK-P3-8 |
| the speaker button's runtime source of truth | `public/words-index.js` (26 lines), `public/views/reader.js:3,:391,:738,:742,:600,:789` | read in full; SK-P3-6 |
| `.shelf-banner` lives in the globally-linked sheet | `public/styles.css:429`, used at `public/views/trophies.js:185`; `grep VIEW_STYLE public/views/trophies.js` gives **no match** | measured; lesson 14 discharged |
| `.btn-say` lives in the globally-linked sheet | `public/styles.css:693`, `:708` | measured |
| the outgoing deployment, per the record | `.oplan/word-polish/phase-state.md:9`; `$HOME/trophies-deploy/incoming.txt` | read; **treated as a hypothesis for 3.2 to confirm** |
| the frozen CAPTURE COMMAND | `.oplan/word-quiz/plan.md:1573-1586`, as executed in `step-4.2.sh:13-26` | read; quoted verbatim below, unchanged |
| the frozen DEPLOY RECIPE | `.oplan/word-audio/phase-state.md:55-66` | read via the word-trophies quotation at `plan.md:4214-4223`; the version value re-stated for this run |
| the rollback ladder form | `.oplan/word-g1/phase-state.md:19-25`, via `plan.md:3945-3986` | read; SK-P3-9 rules the target |

**Nothing in phase 3 is already done:** `public/sw.js:1` still says `magic-vet-v18`,
`tests/shell.test.js:58-59` still pin v18-present/v17-absent, no fresh capture exists,
`.oplan/word-polish/phase-state.md` carries no rollback line, and
`.oplan/word-polish/backup-receipt.txt` does not exist.

---

## SKELETON DECISIONS — where the record is silent, decided HERE, not left to an executor

### SK-P3-1 — ORDERING: the bump commits FIRST, before the capture. Why.

**The question the briefing asks:** *"does the bump commit before or after the capture?"*

**RULED: BUMP (3.1) then PRE-FLIGHT (3.2) then CAPTURE (3.3) then DEPLOY (3.4).** Three reasons, in
order of weight:

1. **The capture has a freshness rule and the bump has an unbounded duration.** The inherited rule
   (word-trophies 4.2, from `.oplan/word-g1/plan.md:868-870`) is: if more than an hour passes
   between the capture and the deploy, **re-capture**. Step 3.1 runs the full suite twice inside
   `§VAL-P3`, plus a fail-first mutation, plus an audit, and it can escalate to the owner. Putting
   it after a capture means either racing a clock or spending a second authenticated GET on her live
   profile for no reason. **Every GET is a counted act** (criterion 20); a plan that makes one of
   them likely-wasted is not robust.
2. **A capture must photograph the moment before an irreversible act, and the bump is reversible.**
   Everything in 3.1 is `git`-recoverable. The capture exists to bound the risk of the *deploy*, so
   it belongs as close to the deploy as possible and after every reversible thing is already done.
   Capturing first would put a `git reset` between the photograph and the event it is meant to bound.
3. **It makes the frozen-tree claim simple, which is the "easy" half.** From 3.2 onward the tree
   never moves, so `§VAL-P3` can hard-code one write-set literal for every remaining step, and the
   phase inherits word-trophies phase 4's strongest structural property — *"changes no file in the
   repository except `.oplan/` records"* — verbatim, just shifted by one step.

**The cost, stated:** between the 3.1 commit and the 3.4 deploy the repository is in a state
(`v19` in `sw.js`) that production is not. That is harmless (nobody serves from this machine) and it
is exactly the state word-trophies was in for the whole of its phase 4.

### SK-P3-2 — THE TWO EDITS OF STEP 3.1, AND WHY THE APPLY SCRIPT IS BINARY

`public/sw.js` is **CRLF** and `tests/shell.test.js` is **LF** (measured; see the blocking-error
section). Field-guide lesson 4: *"edit LF files byte-preservingly (python `newline=''`) and verify
endings with an `rb` byte count, never grep/`file`."*

**RULED — one apply script, run once, written to a FILE outside the repo
(`$HOME/polish-art/apply-3.1.js`), doing both edits in binary and asserting its own work:**

* it reads each file as a **Buffer**, converts with `toString("binary")`, substitutes, and writes
  back with `Buffer.from(s, "binary")` — no encoding round trip, no line-ending normalisation, and
  no editor in the loop, so the CRLF file and the LF file are both safe under one mechanism;
* `public/sw.js`: the single occurrence of `magic-vet-v18` becomes `magic-vet-v19`. Measured today:
  that string occurs **exactly once** in that file;
* `tests/shell.test.js`: `magic-vet-v18` becomes `magic-vet-v19` **and** `magic-vet-v17` becomes
  `magic-vet-v18`. Measured today: each occurs **exactly once**, at lines 58 and 59. Both
  substitutions are computed against the ORIGINAL string and applied in one pass, never chained —
  a chained `replace` would rewrite the freshly written `v18` a second time and leave the file
  pinning `v19` twice with nothing forbidden;
* it **asserts each source string occurs exactly once before replacing** and aborts if not;
* it re-reads both files and prints bytes, CR count, LF count and md5, and **exits non-zero** unless
  they are exactly `1136 / CR=51 / LF=51 / 6d836788d379e7872ce730cfec5db51a` and
  `3604 / CR=0 / LF=96 / ca6c242a97ba1904994d491b5a04aaf8`. (Both targets were computed today, in
  memory, from the real files; nothing was written.)

**`tests/trophies-ui.test.js:349-351` also contains the string `magic-vet-v18`** — in a comment
describing what step 3.3 of the PREVIOUS run did. Measured today. **It must NOT be touched:** it is
a historical note, not a pin. Consequence, and this is the trap worth naming: **a gate of the form
"no file under `tests/` may contain `magic-vet-v18`" would be WRONG and would fire on a correct
tree.** The gate is instead an md5 pin on `tests/trophies-ui.test.js`
(`d0ca049b9dfab39d0f61c787f5be313b`, measured today), which says the same thing with no false
positive.

### SK-P3-3 — WHAT "THE CHANGED PAYLOAD" MEANS FOR MD5, AND HOW TESTS ARE EXCLUDED

**The briefing asks:** *"Exactly which URLs are fetched live and compared against which worktree
files — and how test files are excluded."*

**RULED. The enumeration is `-- public/`-scoped, so test files are excluded STRUCTURALLY, not by
vigilance and not by a filter someone could forget:**

```
git diff --name-only --diff-filter=ACMR "$OC"..HEAD -- public/ | LC_ALL=C sort
```

`tests/` is not under `public/`, so no test file can ever enter this list. That is the whole
mechanism. **And because "structural" is exactly the kind of claim that fails open**, the step
additionally asserts the enumeration equals this frozen literal, byte for byte:

```
public/styles.css
public/sw.js
public/views/reader.js
public/views/trophies.js
```

so a wrong `$OC`, a dropped `--diff-filter=ACMR`, or a stray file cannot silently change what gets
proved. Four paths, four URLs, four comparisons:

| worktree file | URL fetched live | worktree md5 that must match |
|---|---|---|
| `public/styles.css` | `/styles.css` | `b6aa9c229ca269f39f468c60f50c45b4` |
| `public/sw.js` | `/sw.js` | `6d836788d379e7872ce730cfec5db51a` |
| `public/views/reader.js` | `/views/reader.js` | `b5b37fc370436f4c6ad62244cc298bde` |
| `public/views/trophies.js` | `/views/trophies.js` | `1c601eb05071edf7413d0d738067d1ea` |

`--diff-filter=ACMR` is kept from the template even though all four are `M` this time: it costs
nothing, and its absence is a known way to skip an ADDED file (word-quiz plan finding 3).

**`$OC`, the enumeration base.** The live deployment was created 2026-07-30 20:21
(`$HOME/trophies-deploy/incoming.txt`); `HEAD` at that moment was `a40cdb2` (committed 20:17; the
next commit is `869a78d` at 20:28). Measured today: `a40cdb2..HEAD -- public/` and
`678dbc8..HEAD -- public/` give the **same** three paths, because `a40cdb2` touches only `.oplan/`.
So `OC=a40cdb2` is correct and `OC=678dbc8` would also be correct; the step freezes `OC=a40cdb2`.

**P3-AMENDMENT #2 (orchestrator, 2026-08-01, from the plan reviewer's MEDIUM finding).** This
paragraph previously claimed the step "lets `vercel inspect` override it only if inspect actually
prints a commit". **No such override exists in the frozen script** — line ~1487 hardcodes
`OC="a40cdb2"` unconditionally, and nothing reads `incoming.txt`/`outgoing.txt` for a commit. The
prose was aspirational; the script is what runs. **The hardcode is kept, not the prose** — a frozen
constant that a loud assertion checks is easier and more robust than a conditional override with a
branch nobody has seen fail. The claim is withdrawn: `$OC` is a frozen literal, full stop, and the
4-path enumeration assertion below is what makes a wrong `$OC` fail loudly instead of proving less.

**`OC` is assigned to a
visible shell variable, never written as an angle-bracket placeholder** — bash would read the
brackets as redirections, create a junk file and enumerate nothing (`plan.md:4571-4573`).
`git cat-file -e "$OC^{commit}"` guards a typo. And the frozen-literal assertion above means that
even if `$OC` were wrong, the step fails loudly instead of proving less.

**md5 is taken against the WORKTREE file, never `git show HEAD:<file>`** (lesson 4 — the blob is
LF-normalised, so for `styles.css`, `reader.js` and `sw.js` the blob differs from disk by hundreds
of bytes and every such comparison is meaningless). `index.html` does not appear this time because
it did not change; the `cleanUrls` `/index.html` to `/` rewrite is therefore not exercised, and the
step keeps the `case` clause anyway so a future payload cannot lose it.

### SK-P3-4 — THE COMPARATOR: it IS the repaired version. Proved, not assumed.

**The briefing asks:** *"Read `trophies-deploy/readback.js` and state whether it is the REPAIRED
version."*

**IT IS.** Read in full today. Lines 10-12 carry the repair:

```javascript
if (fs.realpathSync(A) === fs.realpathSync(B)) {
  fail("SAME FILE TWICE: '" + A + "' and '" + B + "' resolve to one path -- a file compared with itself can never fail (P4-AMENDMENT #1)");
}
```

That is the P4-AMENDMENT #1 clause, the fix for the defect where the whole read-back gate compared
her capture with itself and printed `READBACK OK` for any input. Corroborations measured today:

* it also carries the SK4-1 trophy block (lines 32-40: `trophy LOST`, `tier LOST`, `tier RESTAMPED`)
  and the SK4-2 evidence block with the `meta.updatedAt` WARNING (lines 41-63) — i.e. the full
  post-amendment feature set, not a stub;
* it uses `pathToFileURL(REPO + "/lib/profile.js")`, the fix for running as CommonJS from outside
  the repo;
* `md5 d3f76f2cf0b187791cb5d1d0fe59aa28`, **byte-identical** to
  `$HOME/trophies-art/extracted-readback.js` (`cmp` clean), which is the copy that was extracted
  back out of the plan file and run — so the file on disk is the file the record signed off.

**RULED, and this is the "robust" half:** *"it is the repaired version"* is a claim about a file,
and this run does not ship claims about files. **Step 3.6 re-runs the 8-case self-test, in this
phase's own directory, against today's `lib/profile.js`, and refuses to touch her data until
`SELFTEST 8/8 AS REQUIRED` has been written by THIS run.** The previous run's
`$HOME/trophies-deploy/selftest/result.txt` is from 2026-07-30 and is **not** accepted as evidence.

The self-test harness is reused unchanged: `make-fixtures.js`
(md5 `7b16fa18c614d33b3178d560b0b86112`) and `run-selftest.sh`
(md5 `f6076457e566f7091a437f13fc1e4d14`), both copied into the new directory and `cmp`-verified
against their originals before use. Note `run-selftest.sh:7` invokes `"$D/../make-fixtures.js"`, so
the fixture builder must sit one level above the selftest directory — the new layout below honours
that.

### SK-P3-5 — NEW PATHS, AND THE PROOF THAT THEY ARE NEW

**The briefing requires:** *"New captures must go to NEW paths, and your plan must assert the new
paths differ from the old."*

**RULED — this phase gets its own working directory and never writes into the previous run's.**

| role | THIS phase | the PREVIOUS run (must never be written, read only as reference) |
|---|---|---|
| work dir | `$HOME/polish-deploy/` | `$HOME/trophies-deploy/` |
| scratch/apply scripts | `$HOME/polish-art/` | `$HOME/trophies-art/` |
| capture C2 | `/c/Users/dkreinov/english-app-backups/profile-<ts>.json`, path written to `$HOME/polish-deploy/capture-path.txt` | `profile-20260730-201842.json` (and an older `profile-20260730-114016.json`) — **both still on disk today** |
| read-back R1 | `$HOME/polish-deploy/readback-1.json` | `$HOME/trophies-deploy/readback-1.json` |
| read-back R2 | `$HOME/polish-deploy/readback-2.json` | `$HOME/trophies-deploy/readback-2.json` |
| deploy log | `$HOME/polish-deploy/deploy.log` | `$HOME/trophies-deploy/deploy.log` |
| inspect out/in | `$HOME/polish-deploy/outgoing.txt`, `incoming.txt` | same names under `trophies-deploy/` |
| precache list | `$HOME/polish-deploy/precache-urls.txt` | same name under `trophies-deploy/` |
| selftest | `$HOME/polish-deploy/selftest/` | `$HOME/trophies-deploy/selftest/` |

**The assertions that make this mechanical**, carried in `§VAL-P3` so they hold at every step:

1. `case "$HOME/polish-deploy" in *trophies-deploy*) fail ...` — the new dir is not the old one.
2. Step 3.3 asserts the capture path is **not** `/c/Users/dkreinov/english-app-backups/profile-20260730-201842.json`
   and **not** `/c/Users/dkreinov/english-app-backups/profile-20260730-114016.json`, and that it does
   **not** equal the content of `$HOME/trophies-deploy/capture-path.txt`.
3. Step 3.3 asserts the capture file's mtime is **less than 3600 s old**, so a stale file cannot be
   silently adopted even if its name looked new.
4. Steps 3.6 and 3.8 assert `C2`, `R1` and `R2` are three pairwise-distinct paths **before** any
   comparison runs (the `step-4.7.sh:11-13` clauses, kept verbatim), and the comparator itself
   refuses `realpath(A) == realpath(B)`. Two independent layers, because this is the exact defect
   class that shipped last time.
5. Every artifact the gates read is under `$HOME/polish-deploy/`. **No gate in this phase reads a
   file under `$HOME/trophies-deploy/`**, so no stale success can be mistaken for a fresh one.

**Why a new directory rather than new filenames in the old one (easy vs robust):** new filenames
would be "easier" by one `mkdir`, but every gate would then have to distinguish `readback-1.json`
from `readback-3.json` by name, and a mistyped digit would read last run's proof. A separate
directory makes the whole class impossible. Robust wins; the cost is one line.

### SK-P3-6 — RUNTIME REACHABILITY OF THE SPEAKER BUTTON'S SOURCE OF TRUTH (review question 1)

**Traced today, in full, because this is the artifact whose runtime path nobody has gated.**

`public/views/reader.js:3` imports `getAllowedSet` from `../words-index.js`. At `:391`, inside
`boot()`, it does `allowedWords = await getAllowedSet()`. `public/words-index.js:17` is
`await fetch('/audio/words/index.json')` — **a network fetch, in the browser, at runtime.** At
`:738` the tap handler does `const lemma = resolveLemma(dataWord, allowedWords)`, at `:742`
`canSay: lemma !== null`, at `:600` the button is rendered only when `canSay`, and at `:789` the
player builds `/audio/words/${encodeURIComponent(lemma)}.aac` **from that same `lemma`**.

So the chain is: manifest over HTTP → a `Set` → `resolveLemma` → `canSay` → the button → the URL.

**Where does it exist at runtime, and can everyone reach it when they need it?**

* `/audio/words/index.json` exists as a static file under `public/` and is served by Vercel. It is
  **NOT in `PRECACHE`** (verified against the 15-entry list in `public/sw.js:2-18`). The service
  worker's fetch handler (`sw.js:48-50`) is `caches.match(request).then(cached || fetch)`, and only
  precached entries are ever in the cache, so this request **always goes to the network**.
* **Consequence, stated plainly and NOT hidden:** offline, or on a flaky connection, `getAllowedSet`
  throws, `words-index.js:22` sets `cached = new Set()`, `resolveLemma` returns `null` for
  everything, `canSay` is false for every word, and **no speaker button appears anywhere**. That is
  the documented, deliberate design (`words-index.js:7-10`: *"Failure is never fatal … A dictionary
  that loads without audio beats one that does not load"*), and it is a *degradation*, not a defect.
  It is also **not new** in this phase and this phase must not "fix" it.
* **What this phase DOES owe:** proof that the file answers in production at all. Nothing in the
  previous deploy's evidence covers it — `deploy-verify.txt` probed the 15 precache URLs, the nine
  webps, `/api/health` and `/api/chapter`, and never touched the manifest. **A 404 there would make
  every speaker button in the app disappear, silently, with a green test suite.** That is criterion
  14, and step 3.5 fetches:
  * `/audio/words/index.json` → 200, md5 == worktree `8735a3c499508b04415046e2be4ad159`;
  * three frozen sample clips, chosen today as manifest indices 0, 1127 and 2253 (first, middle,
    last) and verified to exist on disk: **`/audio/words/a.aac`** (md5
    `a85f523c231a7d39a01c7c4d1f189906`), **`/audio/words/kitchen.aac`** (md5
    `061f4c1ea845148f7331ed9c348f25b6`), **`/audio/words/zoo.aac`** (md5
    `7ead5fb8a25942605a72e1c65f9ec5d7`) → each 200 with md5 == worktree.

  This is the frozen deploy recipe's own *"spot-check several `/audio/words/<lemma>.aac`"*
  (`.oplan/word-audio/phase-state.md`), made specific and deterministic instead of left to
  improvisation.

**The other three artifacts, for completeness:** `/styles.css`, `/views/reader.js` and
`/views/trophies.js` are all three in `PRECACHE`, so after the v19 worker installs they exist in the
device's cache and are reachable with no network at the moment the router mounts a view. The nine
trophy webps are runtime-fetched and deliberately not precached (T6); criterion 15 probes them.

### SK-P3-7 — CONTRADICTORY SOURCES (review question 2)

*"For each value shown to the child, name its source; where two shown values have different sources,
prove they cannot disagree."*

| shown to her | its source | the value it could contradict | why they cannot disagree |
|---|---|---|---|
| the speaker button appearing | `canSay = (resolveLemma(dataWord, allowedWords) !== null)`, `reader.js:738,742` | the clip URL actually fetched, `reader.js:789` | **They are the same variable.** `:789` builds the URL from the identical `lemma` binding that made `canSay` true. There is no second computation to drift. Phase 1 step 1.2 asserted exactly this over 11282 inputs. |
| the speaker button appearing | the audio manifest, over HTTP | whether the `.aac` file exists | Measured today: **every one of the 2254 manifest entries has its `.aac` on disk** (0 exceptions). The manifest is generated from the same derivation that writes the clips (`scripts/build-word-audio.js`). The residual seam is *delivery*, not *content* — and that is precisely what criterion 14's four probes close. |
| the Hebrew gloss in the popup | `findInGlossary(chapter, dataWord)` on the chapter's own `glossary`, else `POST /api/translate` | the word she tapped | Keyed on the printed surface form, and `:735-737`'s comment records the split deliberately: `surface` for the glossary/sentence search, `lemma` for speaking and saving. Unchanged this phase. |
| the four quiz questions | `lemmas` — one array, built once in `boot()` and memoised in `quizLemmasByChapter` | the count shown by `afterChapterStage` | `reader.js:378-382` (the phase-1 comment) states the rule and the code implements it: *"computed ONCE and memoised, so the count afterChapterStage sees and the array startQuiz receives are the SAME array object and cannot disagree (field guide 15b)."* Already gated by phase 1's tests; **re-run unchanged by `§VAL-P3` at every step**, which is this phase's whole contribution to it. |
| a trophy card's ring vs its progress number | stored `trophies` vs a live `metric(profile)` | each other | This is the word-trophies 15(b) defect, fixed in the previous run. **Phase 3 changes neither.** `public/views/trophies.js` md5 is pinned and its bytes are proved live-vs-worktree. |

**Nothing in this phase creates a new pair of sources.** The bump changes one string in a file no
user ever reads. That is the honest answer to question 2 and it is worth saying out loud: the risk
surface of THIS phase is delivery, not computation.

### SK-P3-8 — HOW THE NEW SERVICE WORKER ACTUALLY REACHES HER DEVICE (and when she sees it)

**The briefing insists this be answered plainly. Here it is, traced from the code, today.**

`/sw.js` is **not** in its own `PRECACHE` list (measured). The sequence on her phone, after the
deploy:

1. She opens the app. The **old v18 worker is already in control** and `sw.js:49`
   `caches.match(request)` serves the shell, `styles.css`, `reader.js` and `trophies.js` from the
   `magic-vet-v18` cache. **Her first paint of that visit is still the OLD app.**
2. `public/app.js:58-60` — on `load`, `navigator.serviceWorker.register("/sw.js")` runs. The browser
   fetches `/sw.js` itself (worker-script requests do not go through the worker's fetch handler) and
   byte-compares it with the installed script.
3. It differs (`v19`), so the new worker **installs**: `sw.js:20-27` opens the `magic-vet-v19` cache,
   `cache.addAll(PRECACHE)`, then `self.skipWaiting()`.
4. **`activate`** (`sw.js:29-38`) deletes every cache key that is not `magic-vet-v19` — the old v18
   cache goes — then `self.clients.claim()`.
5. Claiming fires `controllerchange`, and `public/app.js:62-66` reloads the page **once**
   (`refreshing` guards against a loop).
6. The reload is served by the v19 worker from the v19 cache. **Now she sees the new app.**

**So the honest answer: not instantly. She gets it on the NEXT visit after the deploy, and within
that visit only after one automatic reload — the first paint of that visit is still the old app.**
The owner should expect a brief flash-and-reload, not an immediate change, and should not conclude
from an unchanged first screen that the deploy failed.

**Three things that can defer it further, stated rather than glossed:**

* **If `cache.addAll` rejects** because any single one of the 15 URLs fails, the new worker never
  installs, step 4 never happens, and **she stays on v18 indefinitely** — silently. This is why the
  15/15 sweep (criterion 13) is the highest-value gate in the phase, and why a confirmed-dead
  PRECACHE URL is one of only two pre-authorised automatic rollbacks.
* **The browser's HTTP cache on `/sw.js`.** **NOT MEASURED — this planner may not curl production**,
  so the response headers Vercel serves for `/sw.js` are unknown to this plan. The spec caps
  service-worker script freshness at 24 hours regardless of headers, and current Chrome and Safari
  bypass the HTTP cache for the worker script by default, so the realistic worst case is *one
  further visit, or up to 24 hours*. Step 3.5 **records** the `cache-control` header it observes on
  `/sw.js` as evidence for the record; it does not gate on it, because no threshold has ever been
  agreed and inventing one at ship time is how a good deploy gets rolled back.
* **A device that never revisits never updates.** Nothing can fix that from here.

**What the owner must do to see it NOW (step 3.7's first instruction):** fully close the installed
app and every tab, then reopen; if the screen still looks old, close and reopen once more (the first
open installs, the second is served by v19). A hard reload does the same on desktop.

### SK-P3-9 — THE ROLLBACK: exact command, exact target, who decides

**The briefing requires a written rollback naming `dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB`.**

**RULED:**

* **The rollback target is the outgoing deployment as `vercel inspect` reports it in step 3.2, and
  nothing else.** The record's value is a *hypothesis to confirm*: `.oplan/word-polish/phase-state.md:9`
  and `$HOME/trophies-deploy/incoming.txt` both say the live deployment is
  **`dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB`** at url
  **`https://english-1jnh1sn5e-dkreinovs-projects.vercel.app`**. If step 3.2's inspect reports any
  other id, **STOP** — something deployed outside this run's knowledge and the whole baseline must
  be re-established before anything ships.
* **The command, frozen. The url is pasted in from `outgoing.txt`, never hand-built** (lesson 10:
  *"a hand-constructed url once pointed at the WRONG deployment"*), and the recorded line must carry
  the literal url — an angle-bracket placeholder left in place would be read by bash as a redirect
  and would roll back nothing:

  ```bash
  "$(npm prefix -g)/vercel" rollback https://english-1jnh1sn5e-dkreinovs-projects.vercel.app --yes
  ```

  That literal is written here from `incoming.txt`, and step 3.2 **re-derives it from its own fresh
  `outgoing.txt` and must produce the same string**. If the two disagree, the fresh one wins and the
  step STOPS for a ruling.
* **Written into `.oplan/word-polish/phase-state.md` AND COMMITTED in step 3.2, before the deploy** —
  not composed under pressure afterwards.
* **WHO DECIDES: the owner.** The orchestrator STOPS and reports; it does not roll back on its own
  initiative. **Exactly two pre-authorised exceptions**, both requiring a
  **three-attempt confirmation ≥10 s apart** before firing (P4-AMENDMENT #3 — one `curl` over a
  corporate TLS proxy against a CDN seconds after a deploy is not evidence):
  1. a `PRECACHE` URL confirmed non-200 three times;
  2. `/` confirmed not serving three times.
  Anything that recovers on retry is **recorded and reported, never rolled back on**.
* **What rollback does and does not do, plainly (D27, owner-accepted): `vercel rollback` restores
  CODE ONLY. There is no restore path for her profile. The capture is a photograph, not a spare.**

### SK-P3-10 — FAIL-FIRST WHERE POSSIBLE; GUARDS NAMED AS GUARDS WHERE NOT

Field-guide lesson 2 and lesson 15's *"distinguish GATES that were seen to fail from GUARDS that
cannot be tested"*.

**GATES that will be SEEN to fail, with the mutation written into the step:**

* **step 3.1's test move.** Before the edit, `tests/shell.test.js:58-59` pin `v18` present / `v17`
  absent, and `public/sw.js:1` says `v18` — so the suite is green. The step's fail-first is
  explicit and cheap: run the apply script on `public/sw.js` ONLY, run `npm test`, and **watch
  `tests/shell.test.js` fail** (`assert.ok(sw.includes('magic-vet-v18'))` on a file that now says
  v19). Then apply the test edit and watch it go green. **That is a real watched failure of the
  exact assertion the step exists to move**, obtained with no fixture and no throwaway file. The
  step's script performs both halves in order and records both outputs.
* **step 3.1's second mutation, the one that matters more:** apply ONLY the `v17`→`v18` half of the
  test edit (leaving line 58 pinning `v18` while `sw.js` says `v19`) and confirm the suite still
  fails — this proves the gate is not satisfied by half the edit.
* **the comparator's 8-case self-test** (step 3.6-A), re-run in this phase's directory: five watched
  failures (key loss, status-without-evidence, trophy loss, tier restamp, evidence-free appearance),
  one self-comparison refusal, and two positive controls. It must print `SELFTEST 8/8 AS REQUIRED`
  before her data is touched.
* **`§VAL-P3`'s `APP_CODE` guard** and **its stray-`profile-*.json` guard**: both demonstrated
  firing in the previous run and re-demonstrable here in a throwaway shell and a scratch directory,
  without touching anything.

**GUARDS, not gates — their failure has never been observed and cannot be staged here:**

* the md5 / PRECACHE / webp / manifest probes **before the deploy has happened**. Unlike
  word-trophies phase 4 — where `/views/trophies.js` 404'd and all nine webps 404'd, so the checks
  were demonstrably false on the day — **this deploy adds no new URL**. Every URL these checks probe
  already answers today. **So the reachability sweep is a GUARD in this phase, not a gate**, and the
  plan says so rather than borrowing the previous run's fail-first evidence. The ONE exception is
  genuinely fail-first: **live `/sw.js` will contain `magic-vet-v18` and not `v19` before the
  deploy**, so criterion 12 is demonstrably false at step 3.2 and must become true at step 3.5.
  Step 3.2's baseline records exactly that, which converts criterion 12 into a watched transition.
* the deploy's own success or failure. Production cannot be mutated to watch a check fail.
* the comparator against **her real data**. The script is proven; the data path is not, and cannot
  be without damaging a profile to watch the alarm work.
* everything about her actual experience. Only the owner at 3.7 can see it.

### SK-P3-11 — THE MISSING AUDIO: what this deploy does and does not fix

Design §T3(b) said the 17 missing clips get generated before the ship. **They were not, and they are
not generated here.** Phase 2 stopped at `ae349c6`: the missing words are outside the band-derived
audio vocabulary and `scripts/build-word-audio.js` rewrites `public/audio/words/index.json` from that
derivation on every run, so generating them naively would rewrite the manifest. Verified today: the
manifest is **2254 entries, md5 `8735a3c499508b04415046e2be4ad159`, unchanged**, and none of the
missing clips exists.

**Consequence after this deploy, stated so nobody can read the plan as claiming otherwise:** for
those ~17 story words the speaker button is **ABSENT rather than dead**. That is exactly the
behaviour T3(a) was built for and it is a strict improvement — she never presses a button that does
nothing — but **the child still cannot hear those words.** That work is a separate future run.

`§VAL-P3` pins the manifest md5 at every step precisely so that no step of this phase can quietly
change it.

### SK-P3-12 — UNGATED COMPOSITES: where an approved asset meets approved styling (review question 3)

*"Name every place an approved asset meets approved styling — those get a human look, not an
assertion."* Lesson 15(c) is the defect this whole run exists to fix, so this list is not optional.

| composite | the asset | the styling | who looks |
|---|---|---|---|
| **the trophies shelf banner** | `/assets/trophies/shelf-header.webp` (runtime fetch, `trophies.js:185`) | `.shelf-banner`, `public/styles.css:429` — the new class phase 1 added, with **no bottom fade** | **the owner, step 3.7, item 2.** This is D1 itself. No CSS assertion can see whether the shelf reads as a shelf. |
| the speaker button in the word popup | the 🔊 glyph rendered by the device font | `.btn-say`, `public/styles.css:693,708` | **the owner, step 3.7, item 4** — it is a new affordance on her tap popup and nobody has seen it on a phone |
| the eight trophy cards | the nine webps | `public/styles.css` card rules | the owner, step 3.7, item 5 (a broken-image sweep) — unchanged this phase, but the v19 cache is new, so it gets one glance |
| the chapter-end quiz | no asset | existing quiz styling | **not visible at 3.7** — it needs a real chapter-end, which is a WRITE. Deferred to her own use and reported at R2. Said plainly rather than pretended. |

**Both style rules were verified today to live in the globally-linked `public/styles.css`, not in a
view's `VIEW_STYLE` string** (`grep VIEW_STYLE public/views/trophies.js` gives no match;
`.btn-say` is at `styles.css:693`). That discharges field-guide lesson 14 for both.

---

### SK-P3-13 — APPEND-ONLY WRITES MUST ASSERT UNIQUENESS, NOT PRESENCE
**P3-AMENDMENT #3 (orchestrator, 2026-08-01, from the plan reviewer's second MEDIUM finding).**

Step 3.1's apply script asserts an exact occurrence count before every substitution. The plan's
*append* sites do not: step 3.2's ROLLBACK block appended to `phase-state.md`, and the
`backup-receipt.txt` appends in 3.3, 3.6 and 3.8. §VAL-P3 checks these with `grep -q`, which asks
**"is it present?"** — a question that stays true after a double-append. If 3.2 is interrupted
after the append but before the commit and is then re-run, the block silently lands twice and every
gate stays green. That is the same shape as the bug that produced field-guide lesson 16: a check
that cannot fail on the thing it is supposed to catch.

**THE RULE, applied to every append site in this phase:** after appending, assert the count is
**exactly 1** (for the ROLLBACK block) or **exactly N** where N is the number of appends the phase
has made so far (for the receipt). Presence is never sufficient.

**FROZEN FORM — the ROLLBACK block (step 3.2), run after the append, before the commit:**
```bash
N=$(grep -c '^ROLLBACK:' .oplan/word-polish/phase-state.md)
echo "ROLLBACK block occurrences: $N"
[ "$N" -eq 1 ] || { echo "FAIL: expected exactly 1 ROLLBACK line, found $N -- a re-run double-appended; remove the duplicate by hand, do not append again"; exit 1; }
```

**FROZEN FORM — the receipt (steps 3.3, 3.6, 3.8).** Each of those three steps appends exactly one
line, so the expected count is known in advance and is passed in as `$WANT` (3.3 → 1, 3.6 → 2,
3.8 → 3):
```bash
R=.oplan/word-polish/backup-receipt.txt
N=$(grep -c '^[a-z]' "$R")
echo "receipt lines: $N (want $WANT)"
[ "$N" -eq "$WANT" ] || { echo "FAIL: receipt has $N lines, expected $WANT -- a step was run twice or skipped"; exit 1; }
```

**Idempotence, stated plainly rather than assumed:** step 3.1 is idempotent (its apply script
refuses a double-apply, proven today). Steps 3.2, 3.3, 3.6 and 3.8 are **NOT** idempotent — each
appends. With the assertions above they are *self-detecting*: a second run fails loudly instead of
corrupting the record. Step 3.4 is emphatically not idempotent and must never be re-run; that is
already covered by its own "do NOT re-run the deploy" guards.

---

## §VAL-P3 — THE FROZEN VALIDATION PREAMBLE

**Deliver this to any executor as a FILE, never inline in a JSON packet** — backslashes collapsed in
transit twice in this project's history. **Every step's validation is ONE script = §VAL-P3 verbatim
+ that step's tail, in the SAME file.** A child `bash` cannot supply `fail` / `$RC` / `$PORC` /
`$SWSTATE` to a tail, so a tail invoked as a separate process exits 0 unconditionally — the
silent-pass class (P2-AMENDMENT #1a).

**THE `.oplan` FILTER IS `awk '$NF !~ /^\.oplan\//'` — TWO BACKSLASHES, at `\.` and at `\/`.**
(The word-trophies plan calls this "four characters of backslash" at `plan.md:4055`; counted today,
the correct filter contains exactly **two** backslash bytes. Count them, do not trust either number.)
`.oplan/word-trophies/plan.md:989` carries a collapsed-backslash copy that is a bash **syntax
error** and makes every gate exit 0. Never copy that line. The copy below is the one that ran.

It hard-codes every number, because this phase moves none of them: the suite, the ledger, the
contrast anchor, the `public/` digest and every file's endings are frozen for the whole phase. The
one thing that legitimately has two values — the CACHE bump — is modelled as an explicit **two-state
machine with a seam assertion**, rather than as a pin that would have to be edited mid-phase.

Note: it is named `§VAL-P3` for *this* run's phase 3. `.oplan/word-trophies/plan.md:1929` also has a
`§VAL-P3`, for the previous run's phase 3. They are different scripts; do not cross them.

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- APP_CODE must NOT exist in this shell (lesson 3: a leak silently 401s the whole suite) ---
if [ -n "${APP_CODE:-}" ]; then fail "APP_CODE is set in this shell -- it may only ever live inside the frozen capture subshell"; fi

# --- this phase writes to polish-deploy, NEVER to the previous run's trophies-deploy ---
WD="$HOME/polish-deploy"
case "$WD" in *trophies-deploy*) fail "the work dir resolves into the PREVIOUS run's directory: $WD";; esac

# --- suite (plain) ---
OUT="$(npm test 2>&1)"; STAT=$?
case "$STAT" in 0) ;; *) fail "npm test exited $STAT";; esac
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
FAILED="$(printf '%s\n' "$OUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
PLAN="$(printf '%s\n' "$OUT" | sed -n 's/^1\.\.\([0-9][0-9]*\).*$/\1/p')"
case "$TOTAL" in 358) ;; *) fail "suite reported $TOTAL, expected 358";; esac
case "$FAILED" in 0) ;; *) fail "suite had $FAILED failures";; esac
case "$PLAN" in 353) ;; *) fail "top-level plan is 1..$PLAN, expected 1..353";; esac

# --- suite (gated) ---
GOUT="$(APP_CODE=dummy npm test 2>&1)"; GSTAT=$?
case "$GSTAT" in 0) ;; *) fail "APP_CODE=dummy npm test exited $GSTAT";; esac
GTOTAL="$(printf '%s\n' "$GOUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
GFAILED="$(printf '%s\n' "$GOUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
case "$GTOTAL" in 358) ;; *) fail "gated suite reported $GTOTAL, expected 358";; esac
case "$GFAILED" in 0) ;; *) fail "gated suite had $GFAILED failures";; esac

# --- flat ledger: this phase adds NO test ---
FLAT="$(grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}')"
case "$FLAT" in 353) ;; *) fail "flat ledger is $FLAT, expected 353 (phase 3 adds no test)";; esac

# --- contrast: there is NO 'npm run contrast'; the gate is the script itself ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$PASSES" in 58) ;; *) fail "contrast anchor is $PASSES, expected 58";; esac
case "$CON" in *"ALL PASS"*) ;; *) fail "check-contrast did not print ALL PASS";; esac

# --- public/ file count: nothing is created or deleted under public/ this phase ---
PUBN="$(node -e 'const fs=require("fs"),path=require("path");let n=0;(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);if(fs.statSync(f).isDirectory())walk(f);else n++;}})("public");console.log(String(n));')"
case "$PUBN" in 2372) ;; *) fail "public/ file count must stay 2372 all phase, got '$PUBN'";; esac

# --- public/ EXCEPT sw.js is byte-frozen all phase (sw.js is the only public file phase 3 moves) ---
PUBX="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const SKIP=new Set(["public/sw.js"]);const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");if(fs.statSync(f).isDirectory())walk(f);else if(!SKIP.has(p))out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUBX" in "2371 d82e7f9761991b66cbf5139422f6acba") ;; *) fail "public/ moved outside sw.js: expected '2371 d82e7f9761991b66cbf5139422f6acba', got '$PUBX'";; esac

# --- the CACHE bump is a TWO-STATE thing, and the two files must be in the SAME state ---
SWMD5="$(md5sum public/sw.js | cut -d' ' -f1)"
case "$SWMD5" in
  d76f781dc49c5f629aba0f2dfe3304b6) SWSTATE=PRE ;;
  6d836788d379e7872ce730cfec5db51a) SWSTATE=POST ;;
  *) SWSTATE=UNKNOWN; fail "public/sw.js is in neither known state: $SWMD5";;
esac
STMD5="$(md5sum tests/shell.test.js | cut -d' ' -f1)"
case "$STMD5" in
  cbb33bfeb08574024c374a6288fbfed8) STSTATE=PRE ;;
  ca6c242a97ba1904994d491b5a04aaf8) STSTATE=POST ;;
  *) STSTATE=UNKNOWN; fail "tests/shell.test.js is in neither known state: $STMD5";;
esac
# ASSERT THE SEAM (field guide 15b): a half-applied bump is the one failure a per-file pin misses
case "$SWSTATE:$STSTATE" in
  PRE:PRE|POST:POST) ;;
  *) fail "HALF-APPLIED BUMP: sw.js is $SWSTATE but tests/shell.test.js is $STSTATE -- the worker and its pin must move together";;
esac

# --- the shipped payload phase 1 produced must not move by one byte ---
CSSMD5="$(md5sum public/styles.css | cut -d' ' -f1)"
case "$CSSMD5" in b6aa9c229ca269f39f468c60f50c45b4) ;; *) fail "public/styles.css moved: $CSSMD5";; esac
RDMD5="$(md5sum public/views/reader.js | cut -d' ' -f1)"
case "$RDMD5" in b5b37fc370436f4c6ad62244cc298bde) ;; *) fail "public/views/reader.js moved: $RDMD5";; esac
TRMD5="$(md5sum public/views/trophies.js | cut -d' ' -f1)"
case "$TRMD5" in 1c601eb05071edf7413d0d738067d1ea) ;; *) fail "public/views/trophies.js moved: $TRMD5";; esac

# --- QZ-18 frozen, re-pinned by this phase ---
QMD5="$(md5sum public/quiz.js | cut -d' ' -f1)"
case "$QMD5" in 69b6d71117cf776715374abc6f0abb02) ;; *) fail "public/quiz.js moved: $QMD5 (QZ-18 frozen)";; esac
QCMD5="$(md5sum public/quiz-core.js | cut -d' ' -f1)"
case "$QCMD5" in 9a2131be8b9d1b77c219f1e8c3482a71) ;; *) fail "public/quiz-core.js moved: $QCMD5 (QZ-18 frozen)";; esac

# --- the audio manifest is the speaker button's source of truth and NO audio is generated here ---
MANMD5="$(md5sum public/audio/words/index.json | cut -d' ' -f1)"
case "$MANMD5" in 8735a3c499508b04415046e2be4ad159) ;; *) fail "the audio manifest moved: $MANMD5 -- phase 3 generates no audio";; esac

# --- the two phase-1 test files must not move. This also protects the magic-vet-v18 COMMENT at
# --- tests/trophies-ui.test.js:351, which is a historical note and must NOT be rewritten (SK-P3-2)
RTMD5="$(md5sum tests/reader-ui.test.js | cut -d' ' -f1)"
case "$RTMD5" in 39aa0d69a5d93e6067ff404c546d94a8) ;; *) fail "tests/reader-ui.test.js moved: $RTMD5";; esac
TTMD5="$(md5sum tests/trophies-ui.test.js | cut -d' ' -f1)"
case "$TTMD5" in d0ca049b9dfab39d0f61c787f5be313b) ;; *) fail "tests/trophies-ui.test.js moved: $TTMD5";; esac

# --- the server the deploy carries must not move during the phase ---
SRV="$(git diff --name-only HEAD -- lib api data scripts)"
case "$SRV" in "") ;; *) fail "lib/ api/ data/ or scripts/ changed, which phase 3 must never do: $SRV";; esac

# --- awarding stays server-side only ---
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

# --- NOT ONE BYTE OF HER PROFILE MAY EXIST INSIDE THE REPOSITORY ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists -- a local write leaked"; fi
STRAY="$(find . -path ./node_modules -prune -o -name 'profile-*.json' -print | head -5)"
case "$STRAY" in "") ;; *) fail "a capture file is inside the repo: $STRAY";; esac

# --- line endings are LAW and git normalises them away (field guide lesson 4) ---
ENDS="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){if(!fs.existsSync(f)){out.push(f+" MISSING");continue;}const b=fs.readFileSync(f);let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}out.push(f+" CRLF="+c+" LF="+l);}console.log(out.join("; "));' public/sw.js public/styles.css public/index.html public/app.js public/views/words.js public/views/reader.js public/views/trophies.js public/quiz.js public/quiz-core.js tests/shell.test.js tests/reader-ui.test.js tests/trophies-ui.test.js)"
echo "ENDINGS: $ENDS"
case "$ENDS" in *"public/sw.js CRLF=51 LF=0"*)               ;; *) fail "public/sw.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=729 LF=0"*)         ;; *) fail "public/styles.css endings moved: $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=90 LF=0"*)          ;; *) fail "public/index.html endings moved: $ENDS";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=67"*)              ;; *) fail "public/app.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=289 LF=0"*)     ;; *) fail "public/views/words.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=845 LF=0"*)    ;; *) fail "public/views/reader.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=368"*)  ;; *) fail "public/views/trophies.js endings moved (it is LF, not CRLF): $ENDS";; esac
case "$ENDS" in *"public/quiz.js CRLF=346 LF=0"*)            ;; *) fail "public/quiz.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/quiz-core.js CRLF=99 LF=0"*)        ;; *) fail "public/quiz-core.js endings moved: $ENDS";; esac
case "$ENDS" in *"tests/shell.test.js CRLF=0 LF=96"*)        ;; *) fail "tests/shell.test.js endings moved (it is LF, not CRLF): $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 LF=492"*)   ;; *) fail "tests/reader-ui.test.js endings moved: $ENDS";; esac
case "$ENDS" in *"tests/trophies-ui.test.js CRLF=0 LF=1067"*) ;; *) fail "tests/trophies-ui.test.js endings moved: $ENDS";; esac

# --- nothing deleted, ever ---
GONE="$(git diff --diff-filter=D --name-only HEAD)"
case "$GONE" in "") ;; *) fail "files were deleted in the worktree: $GONE";; esac
GONEB="$(git diff --diff-filter=D --name-only 1e470bd HEAD)"
case "$GONEB" in "") ;; *) fail "files were deleted since the run base: $GONEB";; esac

# --- the phase write set vs the run BASE, at EVERY step: it may only ever be one of two literals ---
WROTESET="$(git diff --name-only 1e470bd HEAD | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort | tr '\n' ' ')"
case "$WROTESET" in
  "public/styles.css public/views/reader.js public/views/trophies.js tests/reader-ui.test.js tests/trophies-ui.test.js ") WROTE=PRE ;;
  "public/styles.css public/sw.js public/views/reader.js public/views/trophies.js tests/reader-ui.test.js tests/shell.test.js tests/trophies-ui.test.js ") WROTE=POST ;;
  *) WROTE=UNKNOWN; fail "the write set since 1e470bd is neither the PRE nor the POST literal: [$WROTESET]";;
esac

# --- computed here, ASSERTED in each step's tail (a step that is mid-edit is legitimately dirty) ---
PORC="$(git status --porcelain -uall | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"   # .oplan is the orchestrator record, never the executor write set

echo "VAL-P3: TOTAL=$TOTAL PLAN=$PLAN FLAT=$FLAT PASSES=$PASSES GTOTAL=$GTOTAL PUBN=$PUBN PUBX='$PUBX' SW=$SWSTATE ST=$STSTATE WROTE=$WROTE"
```

Per-step tails continue from here with their own assertions and end with `exit $RC`.

### THIS PREAMBLE WAS RUN TODAY, FROM THE FORM WRITTEN ABOVE — 151 lines, exit 0

Not described, not hand-simulated. **And not merely "a copy of it was run": the block above was
extracted back OUT of this plan file by `awk`, diffed byte-for-byte against the copy that had been
run (identical), and executed again from that extraction** against the clean tree at `ae349c6`, exit
0. That closes the phase-2 failure mode where the plan's copy of a frozen script differed from the
copy that worked (P2-NOTE #1's collapsed backslash). **Its complete stdout, copied from the run:**

```
ENDINGS: public/sw.js CRLF=51 LF=0; public/styles.css CRLF=729 LF=0; public/index.html CRLF=90 LF=0; public/app.js CRLF=0 LF=67; public/views/words.js CRLF=289 LF=0; public/views/reader.js CRLF=845 LF=0; public/views/trophies.js CRLF=0 LF=368; public/quiz.js CRLF=346 LF=0; public/quiz-core.js CRLF=99 LF=0; tests/shell.test.js CRLF=0 LF=96; tests/reader-ui.test.js CRLF=0 LF=492; tests/trophies-ui.test.js CRLF=0 LF=1067
VAL-P3: TOTAL=358 PLAN=353 FLAT=353 PASSES=58 GTOTAL=358 PUBN=2372 PUBX='2371 d82e7f9761991b66cbf5139422f6acba' SW=PRE ST=PRE WROTE=PRE
```

Two lines and nothing else on a clean pass; a failure adds `FAIL:` lines. **`SW=PRE ST=PRE
WROTE=PRE` is the correct reading before step 3.1**; from 3.1 onward it must read
`SW=POST ST=POST WROTE=POST`, and each step's tail pins which.

**THE FIRST RUN FOUND A REAL BUG IN THIS PREAMBLE, WHICH IS WHY IT WAS RUN.** The `public/` file
count used `console.log(n)` on a **number**, and node colourises numbers through `util.inspect`
whenever it thinks stdout is a terminal. The observed output was:

```
FAIL: public/ file count must stay 2372 all phase, got '<ESC>[33m2372<ESC>[39m'
```

— a gate that fails on a perfectly correct tree, for a reason that depends on the executor's
terminal. **`$HOME/trophies-art/VAL-P1.sh:35-36` carries the identical defect** and got away with it
only because phase 1's executor happened not to have a TTY there. The fix in the block above is
`console.log(String(n))`, and the second run was clean. This is field-guide lesson 9 (*"a frozen
VALIDATION can itself be the bug"*) landing again, caught only because the script was executed
rather than read.

### CLAUSES SEEN TO FAIL TODAY (fail-first evidence for the preamble itself)

| clause | how it was made to fire | observed |
|---|---|---|
| the `APP_CODE` guard | the written lines 1-12 run in a throwaway shell with `APP_CODE=notarealcode` | `FAIL: APP_CODE is set in this shell -- it may only ever live inside the frozen capture subshell`, RC=1; with it unset, RC=0 |
| the stray-capture guard | the written clause run against a scratch directory containing `profile-20260801-000000.json` | `FAIL: a capture file is inside the repo: ./profile-20260801-000000.json`, RC=1; the same clause against the real repo, RC=0 |
| the `public/` file-count clause | the pre-fix run above | fired on a correct tree — which is how the colour bug was found |

**The `HALF-APPLIED BUMP` seam clause has NOT been seen to fail, because making it fire requires
editing the repository and this planner may not.** It does not stay a guard: **step 3.1 makes it
fire for free.** That step's fail-first mutation applies the `sw.js` edit ONLY, and §VAL-P3 run in
that state must print
`FAIL: HALF-APPLIED BUMP: sw.js is POST but tests/shell.test.js is PRE -- the worker and its pin
must move together`. Step 3.1 records that line as evidence. This is the lesson-15 habit applied at
write time: *what would make this assertion pass while the feature is broken?* — a per-file md5 pin
on each of the two files passes happily when only one of them has moved, which is exactly the state
that ships a service worker whose test no longer guards it.

---

## FROZEN CONTRACTS — quoted, in force for every step

**Field guide lesson 10 (DEPLOY)** — `field-guide/index.md:52-55`:
> "DEPLOY: `vercel inspect` FIRST and record the id AND the url exactly as inspect reports it (a
> hand-constructed url once pointed at the WRONG deployment); deploy ONCE with output to a FILE
> (truncated output once caused a double deploy); md5 the WORKTREE vs live, never a git blob;
> recipe: `.oplan/word-audio/phase-state.md:55-66`."

**Field guide lesson 3 (the profile is live)** — `field-guide/index.md:11-16`:
> "THE PROFILE IS LIVE (Vercel Blob behind `APP_CODE`). NEVER probe it. `GET /api/profile` CREATES
> one — a read that writes … `isAuthorized` is open only when `APP_CODE` is UNSET; the frozen
> subshell capture (`.oplan/word-quiz/plan.md:1573-1586`) is the ONLY sanctioned live read — its
> post-assert proves no leak, and a leak silently 401s the whole suite."

**Field guide lesson 4 (endings)** — `field-guide/index.md:17-31`, the clause this phase turns on:
> "FILE line endings are law (MEASURE, never remember: the WORKTREE is law and `git diff`
> normalises it away) … core.autocrlf=true makes DISK endings unstable … an Edit-tool insert CRLF'd
> a whole LF file, and `git diff` normalises so the damage is INVISIBLE to any git-based gate — edit
> LF files byte-preservingly (python `newline=''`) and verify endings with an `rb` byte count, never
> grep/`file`."

**Field guide lesson 11** — `field-guide/index.md:56-59`:
> "VISUAL GATES ARE SELF-SERVED (owner directive): sandbox browser only, NEVER production."

**THE FROZEN DEPLOY RECIPE** — `.oplan/word-audio/phase-state.md:55-66`, binding:
> "· `vercel inspect <canonical-url>` FIRST and record id+url+commit — the only rollback target.
> · `"$(npm prefix -g)/vercel" deploy --prod --yes` (npm global bin is off PATH).
> · Verify live files by md5 against the WORKTREE, never a git blob (index.html is CRLF on disk, LF
> in git). `cleanUrls` 308s every *.html, so fetch the shell as `/`.
> · live /sw.js must contain magic-vet-v11 · spot-check several /audio/words/<lemma>.aac …
> · /api/health exact payload · /api/chapter -> 401 (proves the function and its bundled JSON
> loaded, free). · curl needs --ssl-no-revoke on this machine. · WATCH THE DEPLOY SIZE …
> · NEVER request /api/profile (a GET CREATES one), never open a browser on production, never run
> `vercel env`."

**THE TWO VALUES THAT MUST BE RE-STATED FOR THIS RUN:**
1. that recipe says *"live /sw.js must contain magic-vet-v11"* because it was written for the
   word-audio run. **For THIS phase the value is `magic-vet-v19`, and `magic-vet-v18` must be
   ABSENT.** Production serves v18 today (per the record; step 3.2 measures it), the worktree
   carries v18 until step 3.1 and v19 after it. **QZ-22's next bump after this one is v20**, and the
   next phase that moves a precached file owes it.
2. *"spot-check several /audio/words/<lemma>.aac"* is made specific by SK-P3-6: `a`, `kitchen`,
   `zoo`, plus the manifest itself. Improvisation at run time is what "spot-check several" invites
   and what this plan removes.

**THE FROZEN CAPTURE COMMAND** — `.oplan/word-quiz/plan.md:1573-1586`, as executed in
`step-4.2.sh:13-26`, verbatim, **no improvisation at run time** (it has now run clean four times):

```bash
set -o pipefail
mkdir -p /c/Users/dkreinov/english-app-backups   # Git-Bash path form -- a Windows-style path here creates a stray repo file (field guide 4)
BK="/c/Users/dkreinov/english-app-backups/profile-$(date +%Y%m%d-%H%M%S).json"
code=$( ( set -a; . ./.env; set +a
          curl -s --ssl-no-revoke -H "x-app-code: $APP_CODE" \
               -o "$BK" -w '%{http_code}' \
               https://english-app-three-tan.vercel.app/api/profile ) )
case "$code" in 200) ;; 401) echo "FAIL: 401 - local .env APP_CODE != production (B2: stop, owner supplies it out of band)"; exit 1;;
                *) echo "FAIL: GET -> $code"; exit 1;; esac
[ -z "${APP_CODE:-}" ] || { echo "FAIL: APP_CODE leaked into this shell"; exit 1; }
```

> "The subshell `( set -a; . ./.env; set +a; curl ... )` is the load-bearing part: `.env` is sourced
> INSIDE the parentheses so `APP_CODE` dies with the subshell … `$APP_CODE` is never echoed, never
> logged. … Stated openly: this GET can rewrite her stored file into sorted-key order —
> byte-identical to what her own app does on every load."

**IT MUST RUN DIRECTLY, NEVER ON THE LEFT OF A PIPE** (P4-AMENDMENT #6): anything left of `|` runs
in a subshell, so its `401) … exit 1` would exit only that subshell and the step would sail past a
401, and `$BK` would die before `cp` could use it.

**`APP_CODE` RULES, ABSOLUTE:** never echoed, never logged, never written to any file, never
exported into a shell, never passed on a command line, never `vercel env`. §VAL-P3's first clause
asserts it is unset before every step; every step that uses it asserts it is unset again after.
**`.env` is never read by anything in this plan except that subshell.**

**THE THREE AUTHENTICATED REQUESTS, AND NOTHING ELSE (criterion 20).** `GET /api/profile` CREATES a
profile and writes it; it is never casual. This phase makes exactly three:

| # | step | file it writes to | why it is necessary |
|---|---|---|---|
| 1 | 3.3 | `/c/Users/dkreinov/english-app-backups/profile-<ts>.json` (C2) | T8 forbids deploying without a fresh capture. There is no other way to have one. |
| 2 | 3.6 | `$HOME/polish-deploy/readback-1.json` (R1) | the only way to prove the deploy cost her nothing |
| 3 | 3.8 | `$HOME/polish-deploy/readback-2.json` (R2) | the only way to prove the server half still awards correctly after the deploy |

**No fourth request for any reason** — not "just to check", not a retry loop, not a 401 control
(`/api/chapter` serves that purpose unauthenticated). If a step needs a value it did not capture, it
STOPS and the owner rules.

**Executor stop-rule (lesson 9):** never silently "fix" a frozen command, a pinned number, a url or
a string. If a gate contradicts reality, STOP, report, wait for a ruling. In this phase the
stop-rule is worth more than in any other: two things here are irreversible — **a bad deploy she
opens, and any write to her live profile.**

**Commits are the ORCHESTRATOR's.** No step's commands contain `git add` / `git commit`. There are
exactly three commits in this phase: step 3.1's code commit, step 3.2's rollback-record commit, and
step 3.9's close commit. Their messages are written into the steps below.

---

# STEP 3.1 — THE CACHE BUMP: `magic-vet-v18` → `magic-vet-v19`, and its pin, in one step

**GOAL:** make the three files phase 1 changed actually reach her device. They are all three in
`PRECACHE`, and `sw.js:49` serves `caches.match(request)` **before** the network, so without a new
cache name a returning device would go on being served the OLD files indefinitely (QZ-22).

**TIER:** WORKER (a mechanical two-string edit) with ORCHESTRATOR acceptance.
**DEPENDS ON:** the owner's phase-3 go-ahead; tree clean at `ae349c6`.

**FILES (exhaustive):** `public/sw.js` (line 1), `tests/shell.test.js` (lines 58-59). Nothing else,
in the repository or out of it. This is **the only step in the phase that writes to the repository
outside `.oplan/`.**

**THE EXACT BEFORE AND AFTER, quoted rather than named:**

`public/sw.js:1`
```
const CACHE = "magic-vet-v18";        ->        const CACHE = "magic-vet-v19";
```

`tests/shell.test.js:58-59`
```
  assert.ok(sw.includes('magic-vet-v18'));
  assert.ok(!sw.includes('magic-vet-v17'), 'the old cache name must be gone, not merely joined');
```
becomes
```
  assert.ok(sw.includes('magic-vet-v19'));
  assert.ok(!sw.includes('magic-vet-v18'), 'the old cache name must be gone, not merely joined');
```

Nothing else on either line moves — not the quoting style, not the message string. Both files keep
their byte count exactly (1136 and 3604), because both edits are `18`→`19` and `17`→`18`.

**COMMANDS — the apply script, written to `$HOME/polish-art/apply-3.1.js`, run twice:**

```javascript
// STEP 3.1 -- the CACHE bump, applied in BINARY so that a CRLF file and an LF file are both
// byte-safe under one mechanism (field guide lesson 4: an editor insert once CRLF'd a whole LF
// file and git normalised the damage out of every git-based gate).
//
// Usage:  node apply-3.1.js <repo-root> [--sw-only]
//   --sw-only applies ONLY the public/sw.js edit. That is step 3.1's fail-first mutation: it
//   leaves tests/shell.test.js pinning magic-vet-v18 while sw.js says v19, so the suite MUST fail
//   and VAL-P3 MUST print the HALF-APPLIED BUMP line. Never commit in that state.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.argv[2];
const SW_ONLY = process.argv.includes("--sw-only");
if (!ROOT) { console.log("FAIL: apply-3.1.js needs the repo root as argv[2]"); process.exit(1); }

const md5 = (b) => crypto.createHash("md5").update(b).digest("hex");
const die = (w) => { console.log("FAIL: " + w); process.exit(1); };

// Replace exactly ONE occurrence of `from`, asserting first that it occurs exactly once.
function once(s, from, to, label) {
  const n = s.split(from).length - 1;
  if (n !== 1) die(label + ": expected exactly 1 occurrence of '" + from + "', found " + n);
  return s.replace(from, to);
}

function edit(rel, mutate, want) {
  const p = path.join(ROOT, rel);
  const before = fs.readFileSync(p);                 // Buffer -- no encoding guess
  const s = before.toString("binary");               // 1 byte -> 1 code unit, reversible
  const out = Buffer.from(mutate(s, rel), "binary"); // and back, byte for byte
  fs.writeFileSync(p, out);
  const after = fs.readFileSync(p);
  let cr = 0, lf = 0;
  for (let i = 0; i < after.length; i++) {
    if (after[i] === 10) { if (i > 0 && after[i - 1] === 13) cr++; else lf++; }
  }
  const got = { bytes: after.length, cr, lf, md5: md5(after) };
  console.log(rel + " bytes=" + got.bytes + " CRLF=" + got.cr + " LF=" + got.lf + " md5=" + got.md5);
  for (const k of ["bytes", "cr", "lf", "md5"]) {
    if (got[k] !== want[k]) die(rel + ": " + k + " is " + got[k] + ", expected " + want[k]);
  }
}

// public/sw.js -- CRLF, 51 lines, one occurrence of the cache name
edit("public/sw.js",
  (s) => once(s, "magic-vet-v18", "magic-vet-v19", "public/sw.js"),
  { bytes: 1136, cr: 51, lf: 0, md5: "6d836788d379e7872ce730cfec5db51a" });

if (SW_ONLY) {
  console.log("SW-ONLY MUTATION APPLIED -- the tree is now deliberately HALF-BUMPED. Run npm test and VAL-P3, record both failures, then re-run without --sw-only.");
  process.exit(0);
}

// tests/shell.test.js -- LF, 96 lines. BOTH substitutions are computed against the ORIGINAL
// string in one pass; a chained replace would rewrite the freshly written v18 a second time.
edit("tests/shell.test.js",
  (s) => {
    let t = once(s, "magic-vet-v18", " PIN ", "tests/shell.test.js (new-present pin)");
    t = once(t, "magic-vet-v17", "magic-vet-v18", "tests/shell.test.js (old-absent pin)");
    return once(t, " PIN ", "magic-vet-v19", "tests/shell.test.js (sentinel)");
  },
  { bytes: 3604, cr: 0, lf: 96, md5: "ca6c242a97ba1904994d491b5a04aaf8" });

console.log("APPLY-3.1 OK");
```

**THIS SCRIPT WAS BUILT AND RUN TODAY, on byte-copies of the two real files placed outside the
repository — the repository itself was never written to. Observed output, verbatim:**

```
public/sw.js bytes=1136 CRLF=51 LF=0 md5=6d836788d379e7872ce730cfec5db51a
tests/shell.test.js bytes=3604 CRLF=0 LF=96 md5=ca6c242a97ba1904994d491b5a04aaf8
APPLY-3.1 OK
```
and the resulting lines, read back off the copies:
```
const CACHE = "magic-vet-v19";
  assert.ok(sw.includes('magic-vet-v19'));
  assert.ok(!sw.includes('magic-vet-v18'), 'the old cache name must be gone, not merely joined');
```
and, run a second time on the already-edited copy, it refuses instead of corrupting:
```
FAIL: public/sw.js: expected exactly 1 occurrence of 'magic-vet-v18', found 0
```

**So the two md5 targets in `§VAL-P3` are not predictions.** They are the values this exact script
produced from these exact files.

**THE ORDER OF OPERATIONS, frozen:**

1. **`node "$HOME/polish-art/apply-3.1.js" C:/Users/dkreinov/claude/english-app --sw-only`**
   — the fail-first mutation. Then, and this is the point of the step:
2. **`npm test`** — it **MUST FAIL**, in `tests/shell.test.js`, on
   `assert.ok(sw.includes('magic-vet-v18'))`, because `sw.js` now says v19. Record the failing test
   name and the `# fail` count.
3. **`bash "$HOME/polish-art/pgate-3.1.sh"`** (= §VAL-P3 verbatim + this step's tail) — it **MUST
   FAIL** and its output **MUST CONTAIN** the literal line
   `FAIL: HALF-APPLIED BUMP: sw.js is POST but tests/shell.test.js is PRE -- the worker and its pin must move together`.
   **Record it.** This is the seam gate being watched to fail (SK-P3-10), and it is free.
4. **`git checkout -- public/sw.js`** — back to a clean tree. Confirm `git status --porcelain` is
   empty outside `.oplan/`.
5. **`node "$HOME/polish-art/apply-3.1.js" C:/Users/dkreinov/claude/english-app`** — the real edit,
   both files, from the ORIGINAL state. The script's own assertions are the first gate.
6. **`bash "$HOME/polish-art/pgate-3.1.sh"`** — must now print `STEP-3.1-OK` and exit 0.

Step 4 matters: the real edit is applied to a **restored** tree, never on top of the mutation, so
the committed bytes are the ones the script was proved to produce in one pass.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then, in the SAME file:

```bash
# --- the two files are in the POST state and the seam holds (VAL-P3 already asserted the seam) ---
case "$SWSTATE" in POST) ;; *) fail "public/sw.js is $SWSTATE -- step 3.1 must leave it POST";; esac
case "$STSTATE" in POST) ;; *) fail "tests/shell.test.js is $STSTATE -- step 3.1 must leave it POST";; esac

# --- the strings themselves, quoted not named ---
SW="$(cat public/sw.js)"
case "$SW" in *'const CACHE = "magic-vet-v19";'*) ;; *) fail "public/sw.js line 1 is not the frozen v19 literal";; esac
case "$SW" in *magic-vet-v18*) fail "public/sw.js still contains magic-vet-v18";; esac
case "$SW" in *magic-vet-v17*) fail "public/sw.js contains magic-vet-v17";; esac
ST="$(cat tests/shell.test.js)"
case "$ST" in *"assert.ok(sw.includes('magic-vet-v19'));"*) ;; *) fail "shell.test.js does not pin v19 present";; esac
case "$ST" in *"assert.ok(!sw.includes('magic-vet-v18'), 'the old cache name must be gone, not merely joined');"*) ;; *) fail "shell.test.js does not pin v18 absent, with the frozen message";; esac
case "$ST" in *magic-vet-v17*) fail "shell.test.js still mentions magic-vet-v17";; esac

# --- the PRECACHE array did not move: this step touches the CACHE name and nothing else ---
PC="$(node -e 'const s=require("fs").readFileSync("public/sw.js","utf8");const m=s.match(/const PRECACHE = \[([^\]]*)\]/);if(!m){console.log("NOPRECACHE");process.exit(0);}const q=m[1].match(/"[^"]*"/g)||[];console.log(q.length+" "+q.map(x=>x.slice(1,-1)).join(","));')"
case "$PC" in "15 /,/styles.css,/app.js,/api.js,/lemma.js,/words-index.js,/quiz-core.js,/quiz.js,/views/home.js,/views/placement.js,/views/reader.js,/views/words.js,/views/trophies.js,/manifest.webmanifest,/icons/icon.svg") ;; *) fail "the PRECACHE array moved: $PC";; esac

# --- the write set and the tree ---
case "$WROTE" in POST) ;; *) fail "the write set since 1e470bd is $WROTE, expected POST";; esac
case "$PORC" in "") ;; *) fail "the tree is dirty outside .oplan/ -- the edit must be COMMITTED before 3.2:
$PORC";; esac
git log -1 --format=%s | grep -q 'step 3.1' || fail "the bump is not committed"
echo STEP-3.1-OK
exit $RC
```

**COMMIT (orchestrator, at acceptance):**
`step 3.1: CACHE magic-vet-v18 -> magic-vet-v19 and its pin move together — two byte-preserving edits, the half-applied state seen to fail; ledger 353 flat / 358 reported`

**STOP IF:**
* the apply script's own byte/CRLF/md5 assertion fails → STOP. Something is not the file this plan
  measured. `git checkout --` both files and report; do not "fix" the expected md5.
* `npm test` **passes** after the `--sw-only` mutation → **STOP, and treat it as serious.** It would
  mean `tests/shell.test.js:58` does not actually observe `public/sw.js`, and the pin that has been
  guarding the cache name for four deploys is decorative.
* §VAL-P3 does **not** print `HALF-APPLIED BUMP` in the half-applied state → STOP. The seam clause
  is broken and the phase has no protection against shipping a worker whose test no longer guards
  it.
* the endings of either file move (`sw.js` CRLF=51/LF=0, `shell.test.js` CRLF=0/LF=96) → STOP.
  That is lesson 4's silent corruption and `git diff` will not show it.

**NON-GOALS:** no other file · no `PRECACHE` change · no new test · no touching
`tests/trophies-ui.test.js:351`'s historical `magic-vet-v18` comment · no deploy · no network.

---

# STEP 3.2 — PRE-FLIGHT: freeze the outgoing deployment and write the rollback down

**GOAL:** know exactly what is live, exactly what we would roll back to, and have that command
committed to the record BEFORE anything can go wrong. Nothing is deployed; nothing authenticated is
done.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 3.1 OK and committed.

**FILES:** `.oplan/word-polish/phase-state.md` (APPEND the rollback block) — the only repository
write in this step, and it is an `.oplan` record. Everything else goes to `$HOME/polish-deploy/`,
outside the repo (lesson 4: never write scratch into the repo).

**COMMANDS, frozen:**
```bash
mkdir -p "$HOME/polish-deploy" "$HOME/polish-art"
D="$HOME/polish-deploy"
# 1. the outgoing deployment, from inspect's own mouth (lesson 10) -- output to a FILE
"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app > "$D/outgoing.txt" 2>&1
# 2. live baselines, unauthenticated, read-only. NEVER /api/profile.
B=https://english-app-three-tan.vercel.app
{
  curl -s --ssl-no-revoke "$B/sw.js" | head -1
  curl -s --ssl-no-revoke -D - -o /dev/null "$B/sw.js" | grep -i '^cache-control\|^age\|^etag' || echo "no cache-control/age/etag on /sw.js"
  curl -s --ssl-no-revoke "$B/api/health"; echo
  curl -s --ssl-no-revoke -o /dev/null -w 'chapter=%{http_code}\n' "$B/api/chapter"
  for p in / /styles.css /app.js /api.js /lemma.js /words-index.js /quiz-core.js /quiz.js \
           /views/home.js /views/placement.js /views/reader.js /views/words.js \
           /views/trophies.js /manifest.webmanifest /icons/icon.svg /audio/words/index.json; do
    printf '%s ' "$p"; curl -s --ssl-no-revoke -o /dev/null -w '%{http_code}\n' "$B$p"
  done
} > "$D/live-baseline.txt" 2>&1
```
The `cache-control` probe on `/sw.js` is **recorded, never gated** (SK-P3-8): no threshold has ever
been agreed, and inventing one at ship time is how a good deploy gets rolled back. It goes into the
journal so the next run has a measured value instead of a guess.

Then, by hand, into `.oplan/word-polish/phase-state.md`, copied from `outgoing.txt` **verbatim** —
never retyped from memory, never hand-constructed (lesson 10):
```
ROLLBACK (code only) — the deployment live before phase 3, exactly as `vercel inspect` reported it:
  id  = <OUTGOING_ID, pasted>
  url = <OUTGOING_URL, pasted>
  `"$(npm prefix -g)/vercel" rollback <OUTGOING_URL, pasted> --yes`
  vercel rollback restores CODE ONLY. There is no restore path for her profile (D27).
```
and commit it:
`oplan: word-polish 3.2 pre-flight — outgoing deployment frozen, rollback command recorded before any deploy`

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the bump is not in place: SW=$SWSTATE ST=$STSTATE WROTE=$WROTE";; esac
case "$PORC" in "") ;; *) fail "the tree is dirty outside .oplan/:
$PORC";; esac
D="$HOME/polish-deploy"
OUT3="$D/outgoing.txt"
[ -s "$OUT3" ] || fail "vercel inspect produced no output"
OID="$(grep -o 'dpl_[A-Za-z0-9]*' "$OUT3" | head -1)"
case "$OID" in
  dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB) ;;
  "") fail "no deployment id in inspect output";;
  *) fail "LIVE DEPLOYMENT IS NOT THE ONE THE RECORD KNOWS ABOUT: got '$OID', record says dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB (.oplan/word-polish/phase-state.md:9) -- STOP";;
esac
OURL="$(grep -o 'https://english-[A-Za-z0-9-]*\.vercel\.app' "$OUT3" | head -1)"
[ -n "$OURL" ] || fail "inspect printed no deployment url -- never hand-build one (lesson 10)"
BL="$D/live-baseline.txt"
grep -q 'magic-vet-v18' "$BL" || fail "live /sw.js is not v18 -- the baseline moved, STOP"
grep -q 'magic-vet-v19' "$BL" && fail "live /sw.js ALREADY says v19 -- someone deployed this tree, STOP"
grep -q '{"ok":true,"data":{"status":"up","version":1}}' "$BL" || fail "/api/health payload is not byte-exact"
grep -q 'chapter=401' "$BL" || fail "/api/chapter is not 401"
BAD="$(grep -c ' 200$' "$BL")"
case "$BAD" in 16) ;; *) fail "only $BAD of the 16 baseline URLs (15 PRECACHE + the audio manifest) are 200 BEFORE the deploy -- production is already unhealthy, STOP";; esac
grep -q 'vercel" rollback' .oplan/word-polish/phase-state.md || fail "the rollback command is not in phase-state.md"
grep -q "$OID" .oplan/word-polish/phase-state.md || fail "the outgoing id is not recorded in phase-state.md"
grep -q "$OURL" .oplan/word-polish/phase-state.md || fail "the outgoing URL is not recorded VERBATIM in phase-state.md"
grep -q '<' .oplan/word-polish/phase-state.md && fail "an angle-bracket placeholder survived into the rollback record -- bash would read it as a redirect and roll back nothing" || true
git log -1 --format=%s | grep -q '3.2 pre-flight' || fail "the rollback record is not committed"
echo STEP-3.2-OK
exit $RC
```

**Note on the `grep -q '<'` clause:** `.oplan/word-polish/phase-state.md` today contains no `<`
character (checked). If a future edit legitimately introduces one, the clause is narrowed to the
rollback block rather than deleted — the executor STOPS and the orchestrator rules (lesson 9).

**STOP IF:**
* inspect reports any id other than `dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB` → STOP. Something deployed
  outside this run's knowledge; the whole baseline is re-established before anything ships.
* inspect prints no url → STOP. **Do not hand-build one** (lesson 10's exact incident). Without a
  url there is no rollback target, and without a rollback target there is no deploy.
* live `/sw.js` already says `magic-vet-v19` → STOP; someone shipped this tree already.
* `/api/health` is not byte-exact, or `/api/chapter` is not 401, or fewer than 16 baseline URLs
  answer 200 → STOP. Production is already unhealthy and deploying into that is strictly worse.
* §VAL-P3 fails for any reason → STOP. The tree that would ship is not the tree that was gated.

**NON-GOALS:** no deploy · no authenticated request · no `/api/profile` in any form · no
`vercel env` · no browser · no repository change outside `.oplan/`.

---

# STEP 3.3 — THE FRESH D25 CAPTURE, to a NEW path

**GOAL:** her profile is safely captured, proven and receipted, minutes before the deploy — to a
path that has never been used before, so no gate downstream can accidentally read last run's file.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 3.2 OK. **This step must be immediately followed by 3.4.**
If more than an hour passes before the deploy, **re-capture** with the same command and use the
later file.

**FILES:** `.oplan/word-polish/backup-receipt.txt` (CREATE — counts and digests only, **never
contents**). The capture itself lives at `/c/Users/dkreinov/english-app-backups/profile-<ts>.json`,
outside the repo.

**COMMANDS:** `$HOME/polish-art/step-3.3.sh`, which is `$HOME/trophies-art/step-4.2.sh` with four
substitutions and nothing else changed:

| in `step-4.2.sh` | in `step-3.3.sh` | why |
|---|---|---|
| `D="$HOME/trophies-deploy"` | `D="$HOME/polish-deploy"` | SK-P3-5 |
| `.oplan/word-trophies/backup-receipt.txt` | `.oplan/word-polish/backup-receipt.txt` | this run's record |
| the projection block's `TROPHY_CATALOG` walk | **kept verbatim** | it gives R2 an expectation to be checked against, costs nothing, and imports the engine rather than re-implementing it (lesson 2) |
| — | **added:** the three new-path assertions below | SK-P3-5 |

Everything else — the frozen capture subshell, the direct (unpiped) invocation, the `BACKUP OK`
proof block, `capture-path.txt`, `capture-copy.json`, the sha256 receipt, the `.data/profile.json`
check — is copied byte-for-byte from the script that ran successfully on 2026-07-30.

The added assertions, run immediately after `capture-path.txt` is written:
```bash
CP="$(cat "$D/capture-path.txt")"
case "$CP" in
  /c/Users/dkreinov/english-app-backups/profile-20260730-201842.json) echo "FAIL: the capture path is the PREVIOUS run's C2"; exit 1;;
  /c/Users/dkreinov/english-app-backups/profile-20260730-114016.json) echo "FAIL: the capture path is the 2026-07-30 morning capture"; exit 1;;
  /c/Users/dkreinov/english-app-backups/profile-*.json) ;;
  *) echo "FAIL: the capture path is not in the backups folder: $CP"; exit 1;;
esac
OLDCP="$(cat "$HOME/trophies-deploy/capture-path.txt" 2>/dev/null || echo NONE)"
[ "$CP" != "$OLDCP" ] || { echo "FAIL: the capture path equals the previous run's recorded path"; exit 1; }
[ "$CP" != "$D/readback-1.json" ] && [ "$CP" != "$D/readback-2.json" ] || { echo "FAIL: the capture path collides with a read-back path"; exit 1; }
```

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the bump is not in place";; esac
case "$PORC" in "") ;; *) fail "the tree is dirty outside .oplan/";; esac
D="$HOME/polish-deploy"
grep -q 'BACKUP OK' "$D/capture.log" || fail "the capture proof block did not print BACKUP OK"
grep -q '^capture C2 ' .oplan/word-polish/backup-receipt.txt || fail "no C2 receipt line"
grep -q 'sha256=' .oplan/word-polish/backup-receipt.txt || fail "receipt has no sha256"
[ -s "$D/projection.txt" ] || fail "no projection recorded"
[ -s "$D/capture-path.txt" ] || fail "capture-path.txt was not written -- 3.6/3.8 have no C2 to bind"
CP="$(cat "$D/capture-path.txt")"
[ -s "$CP" ] || fail "capture-path.txt points at '$CP', which is missing or empty"
case "$CP" in /c/Users/dkreinov/english-app-backups/profile-*.json) ;; *) fail "capture-path.txt does not point into the backups folder: $CP";; esac
case "$CP" in *20260730*) fail "capture-path.txt points at a 2026-07-30 capture -- that is the PREVIOUS run's file";; esac
cmp -s "$CP" "$D/capture-copy.json" || fail "capture-copy.json is not a byte-copy of the capture"
NEWEST="$(ls -1t /c/Users/dkreinov/english-app-backups/profile-*.json | head -1)"
[ "$NEWEST" = "$CP" ] || fail "the newest capture on disk is '$NEWEST', not the one this step recorded"
AGE=$(( $(date +%s) - $(stat -c %Y "$CP") ))
[ "$AGE" -lt 3600 ] || fail "the capture is $AGE seconds old -- re-capture before deploying"
[ -z "${APP_CODE:-}" ] || fail "APP_CODE leaked into this shell"
grep -riq 'x-app-code\|APP_CODE=' .oplan/word-polish/backup-receipt.txt "$D/" && fail "a secret may have been written to a file" || true
echo STEP-3.3-OK
exit $RC
```

**STOP IF:**
* **HTTP 401** → STOP immediately (B2). The local `.env` code no longer matches production; the
  owner supplies the production code out of band. **Never `vercel env`.** No deploy until a capture
  exists — T8 is not optional.
* **any code other than 200** → STOP. Production is not answering; deploying into that is worse.
* **the `APP_CODE` post-assertion fails** → STOP, close the shell, start a fresh one, re-run. A
  leaked code silently 401s everything afterwards and the failure will look like something else.
* **`BACKUP OK` does not print**, or `validateProfile` fails on her live data → STOP and report. A
  profile that does not validate BEFORE we deploy is a pre-existing condition that must be
  understood before new code touches it.

**NON-GOALS:** no deploy · no second GET "just to check" · never open, print, paste or summarise the
capture's CONTENTS anywhere — receipts are bytes, sha256 and counts only · never copy the capture
into the repository · no restore attempt (there is no restore path).

---

# STEP 3.4 — THE DEPLOY (once)

**GOAL:** ship the committed tree to production, exactly once, with the evidence of what shipped
written to a file rather than read off a scrolling terminal.

**TIER:** ORCHESTRATOR, **with the owner's explicit GO in the same session.**
**DEPENDS ON:** 3.1-3.3 OK, the capture less than an hour old, tree clean at the 3.1 commit.

**FILES:** none in the repository. Output to `$HOME/polish-deploy/deploy.log`.

**COMMANDS, frozen — this is the whole step, and it runs ONCE:**
```bash
cd C:/Users/dkreinov/claude/english-app
"$(npm prefix -g)/vercel" deploy --prod --yes > "$HOME/polish-deploy/deploy.log" 2>&1
echo "deploy exit=$?"
```
`"$(npm prefix -g)/vercel"` because the npm global bin is off PATH on this machine (lesson 4).
**Output to a FILE because truncated output once caused a double deploy** (lesson 10).

**IF THE COMMAND APPEARS TO HANG OR ITS OUTPUT IS LOST: DO NOT RE-RUN IT.** Read
`$HOME/polish-deploy/deploy.log`, then run
`"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app` and compare ids. That
is the exact mistake the field guide records, and re-running is how it happened.

**P3-AMENDMENT #1 (orchestrator, 2026-08-01, from the plan reviewer's HIGH finding).**
Acceptance criterion 9 requires the capture to be under 3600 s old *at the moment of the deploy*,
but the only mechanical check lived in step 3.3's own tail, seconds after the capture — where it is
tautologically true and can never fail. Step 3.4 waits for the owner's explicit GO, which is exactly
where an hour-plus gap is plausible, and nothing stopped it. Two additions, because a gate that only
reports after the fact cannot prevent anything:

**(a) PRE-DEPLOY GUARD — run this and see it print `CAPTURE-FRESH-OK` BEFORE the deploy command.**
If it fails, do NOT deploy: go back to step 3.3, take a new capture to a new path, then return.
```bash
D="$HOME/polish-deploy"; CP="$(cat "$D/capture-path.txt")"
[ -s "$CP" ] || { echo "FAIL: capture missing at $CP"; exit 1; }
NOW=$(date +%s); CT=$(stat -c %Y "$CP"); AGE=$(( NOW - CT ))
echo "capture age at deploy time: ${AGE}s (limit 3600)"
[ "$AGE" -lt 3600 ] || { echo "FAIL: capture is ${AGE}s old -- STALE. Re-capture (3.3) before deploying."; exit 1; }
echo CAPTURE-FRESH-OK
```

**(b) POST-HOC PROOF, added to the frozen validation below** — it compares the capture's mtime
against `deploy.log`'s mtime, so it measures the real gap and CAN fail on a stale run.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
D="$HOME/polish-deploy"; DL="$D/deploy.log"
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the bump is not in place";; esac
[ -s "$DL" ] || fail "deploy.log is empty -- do NOT re-run the deploy; inspect the alias instead"

# P3-AMENDMENT #1(b): the capture must have been fresh AT THE MOMENT THE DEPLOY RAN.
# Measured from mtimes, not from "now", so this stays true whenever the gate is re-run.
CP="$(cat "$D/capture-path.txt")"
[ -s "$CP" ] || fail "capture missing at $CP -- the deploy has no before-photograph"
CT=$(stat -c %Y "$CP"); DT=$(stat -c %Y "$DL"); GAP=$(( DT - CT ))
echo "CAPTURE->DEPLOY GAP: ${GAP}s (limit 3600)"
[ "$GAP" -ge 0 ] || fail "the capture is NEWER than the deploy log -- the before-photograph was taken after the deploy, it proves nothing"
[ "$GAP" -lt 3600 ] || fail "the capture was ${GAP}s old when the deploy ran -- criterion 9 violated"

# COUNT the ids: `head -1` would hide a double deploy behind a coin flip (P4-AMENDMENT #4)
NIDS="$(grep -o 'dpl_[A-Za-z0-9]*' "$DL" | LC_ALL=C sort -u | wc -l | tr -d ' ')"
case "$NIDS" in
  1) NID="$(grep -o 'dpl_[A-Za-z0-9]*' "$DL" | head -1)" ;;
  0) NID="" ;;
  *) fail "deploy.log names $NIDS distinct deployment ids -- a DOUBLE DEPLOY happened; do NOT deploy again, record both and report";;
esac

"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app > "$D/incoming.txt" 2>&1
AID="$(grep -o 'dpl_[A-Za-z0-9]*' "$D/incoming.txt" | head -1)"

# written fallback: if the CLI's log carries no id at all, take it from inspect (never re-deploy)
if [ -z "$NID" ]; then
  echo "NOTE: deploy.log carried no dpl_ id; falling back to the alias inspect (do NOT re-run the deploy)"
  NID="$AID"
  [ -n "$NID" ] || fail "neither deploy.log nor inspect yields a deployment id -- STOP, do not deploy again"
fi
case "$NID" in dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB) fail "the live id is still the OUTGOING one -- nothing new shipped";; esac
case "$AID" in "$NID") ;; *) fail "the alias points at '$AID' but the deploy created '$NID' -- ONE of these is the wrong deployment, STOP";; esac

grep -q 'https://' "$DL" || fail "deploy.log carries no production URL -- the deploy did not report success"
grep -qi 'ready' "$D/incoming.txt" || fail "inspect does not report the new deployment Ready"
SIZE="$(grep -Eio '[0-9.]+ *[KMG]?B' "$DL" | tail -1)"
echo "UPLOAD SIZE (recorded): ${SIZE:-not reported}"
ERRS="$(grep -in 'error\|failed' "$DL" | head -5)"
echo "ERROR-SUBSTRING OBSERVATIONS (reported, NOT a gate -- build logs legitimately print '0 errors'): ${ERRS:-none}"
echo "NEW DEPLOYMENT: $NID"
echo STEP-3.4-OK
exit $RC
```
The alias-vs-log comparison is the mechanical form of lesson 10's warning: it is the only thing that
distinguishes "we deployed and it is live" from "we deployed and something else is live".

**STOP IF:**
* the deploy exits non-zero or the log carries a build error → **STOP. Nothing shipped; production
  is untouched and still healthy at v18.** Read the log, report, do not retry blindly. A failed
  Vercel build does not change the alias, so no rollback is needed.
* the alias id ≠ the new deploy id → **STOP.** Do not deploy again. Report both ids; this is the
  wrong-deployment failure lesson 10 exists for.
* two `dpl_` ids appear in `deploy.log` → the double-deploy happened. Record both, verify which one
  the alias carries, proceed only after the owner is told.

**NON-GOALS:** no second invocation for any reason · no `--force` · no `vercel env` · no commit ·
no browser · no `/api/profile`.

---

# STEP 3.5 — THE MD5 PROOF, THE CACHE-BUMP PROOF, AND THE REACHABILITY SWEEP

**GOAL:** prove that what production now serves is byte-for-byte the tree that 358 tests gated; that
the `v19` bump took effect; and that every URL the new app will ask for actually answers — including
the one the previous deploy never probed. **No authenticated request in this step.**

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 3.4 OK.

**FILES:** none in the repository. Evidence to `$HOME/polish-deploy/deploy-verify.txt`.

**COMMANDS:** `$HOME/polish-art/step-3.5.sh` = `$HOME/trophies-art/step-4.4.sh` with `D` repointed
to `$HOME/polish-deploy`, `OC` set to `a40cdb2`, the two `magic-vet` counts moved to v19/v18, the
`MD5 OK` expectation moved from 16 to 4, **plus the enumeration-literal assertion (SK-P3-3) and the
audio block (SK-P3-6), which are new.** Everything else is byte-identical to the script that ran.

```bash
B=https://english-app-three-tan.vercel.app
# The outgoing deployment's commit, if `vercel inspect` printed one; otherwise the MEASURED value.
# a40cdb2 was HEAD when the live deployment was created (2026-07-30 20:21; a40cdb2 committed 20:17,
# the next commit is 869a78d at 20:28). Measured today: a40cdb2..HEAD and 678dbc8..HEAD -- public/
# give the same paths, because a40cdb2 touches only .oplan/.
OC="a40cdb2"
[ -n "$OC" ] || { echo "FAIL: set OC before running this step"; exit 1; }
git cat-file -e "$OC^{commit}" 2>/dev/null || { echo "FAIL: OC='$OC' is not a commit in this repo"; exit 1; }
D="$HOME/polish-deploy"; mkdir -p "$D/live"
{
  echo "=== payload enumeration (public/-scoped, so no test file can ever enter it) ==="
  git diff --name-only --diff-filter=ACMR "$OC"..HEAD -- public/ | LC_ALL=C sort

  echo "=== md5 live vs WORKTREE (never a git blob, never git show HEAD:) ==="
  for f in $(git diff --name-only --diff-filter=ACMR "$OC"..HEAD -- public/ | LC_ALL=C sort); do
    url="${f#public}"
    case "$url" in /index.html) url=/ ;; esac      # cleanUrls 308s every *.html
    curl -s --ssl-no-revoke -o "$D/live/probe" "$B$url"
    a="$(md5sum "$D/live/probe" | cut -d' ' -f1)"
    b="$(md5sum "$f" | cut -d' ' -f1)"
    if [ "$a" = "$b" ]; then echo "MD5 OK   $url"; else echo "MD5 BAD  $url live=$a work=$b"; fi
  done

  echo "=== the cache bump ==="
  curl -s --ssl-no-revoke -o "$D/live/sw.js" "$B/sw.js"
  echo "sw.js live md5 $(md5sum "$D/live/sw.js" | cut -d' ' -f1)  worktree $(md5sum public/sw.js | cut -d' ' -f1)"
  grep -c 'magic-vet-v19' "$D/live/sw.js" | sed 's/^/v19 count /'
  grep -c 'magic-vet-v18' "$D/live/sw.js" | sed 's/^/v18 count /'
  echo "--- /sw.js response headers, RECORDED not gated (SK-P3-8) ---"
  curl -s --ssl-no-revoke -D - -o /dev/null "$B/sw.js" | grep -i '^cache-control\|^age\|^etag\|^last-modified' || echo "none reported"

  echo "=== PRECACHE reachability (sw.js:24 is cache.addAll -- all or nothing) ==="
  # the list is DERIVED from the sw.js production actually serves, not hard-coded
  node -e 'const s=require("fs").readFileSync(process.argv[1],"utf8");const m=s.match(/const PRECACHE = \[([^\]]*)\]/);if(!m){console.error("NOPRECACHE");process.exit(1);}for(const q of m[1].match(/"[^"]*"/g)||[])console.log(q.slice(1,-1));' "$D/live/sw.js" > "$D/precache-urls.txt"
  echo "PRECACHE ENTRIES DERIVED $(wc -l < "$D/precache-urls.txt" | tr -d ' ')"
  while read -r p; do
    printf 'PRECACHE %s ' "$p"; curl -s --ssl-no-revoke -o /dev/null -w '%{http_code}\n' "$B$p"
  done < "$D/precache-urls.txt"

  echo "=== the speaker button's source of truth, which NO previous deploy probed (SK-P3-6) ==="
  curl -s --ssl-no-revoke -o "$D/live/manifest.json" -w 'MANIFEST %{http_code} %{content_type} ' "$B/audio/words/index.json"
  a="$(md5sum "$D/live/manifest.json" | cut -d' ' -f1)"; b="$(md5sum public/audio/words/index.json | cut -d' ' -f1)"
  if [ "$a" = "$b" ]; then echo "md5 OK"; else echo "md5 BAD live=$a work=$b"; fi
  for w in a kitchen zoo; do
    curl -s --ssl-no-revoke -o "$D/live/clip" -w "CLIP $w.aac %{http_code} " "$B/audio/words/$w.aac"
    a="$(md5sum "$D/live/clip" | cut -d' ' -f1)"; b="$(md5sum "public/audio/words/$w.aac" | cut -d' ' -f1)"
    if [ "$a" = "$b" ]; then echo "md5 OK"; else echo "md5 BAD live=$a work=$b"; fi
  done

  echo "=== the nine trophy webps, case-exact (Vercel is case-sensitive; this filesystem is not) ==="
  for f in chapters curious days known proven quizRight quizzer shelf-header streak; do
    curl -s --ssl-no-revoke -o "$D/live/art" -w "ART $f.webp %{http_code} %{content_type} " "$B/assets/trophies/$f.webp"
    a="$(md5sum "$D/live/art" | cut -d' ' -f1)"; b="$(md5sum "public/assets/trophies/$f.webp" | cut -d' ' -f1)"
    if [ "$a" = "$b" ]; then echo "md5 OK"; else echo "md5 BAD live=$a work=$b"; fi
  done

  echo "=== the function bundle (never /api/profile) ==="
  curl -s --ssl-no-revoke "$B/api/health"; echo
  curl -s --ssl-no-revoke -o /dev/null -w 'chapter=%{http_code}\n' "$B/api/chapter"
  curl -s --ssl-no-revoke -o /dev/null -w 'notafile=%{http_code}\n' "$B/assets/trophies/zzznotatrophy.webp"
} > "$D/deploy-verify.txt" 2>&1
```
The last line is the **negative control**: a path that must still 404, so a "200 for everything"
misconfiguration cannot masquerade as success.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
D="$HOME/polish-deploy"; V="$D/deploy-verify.txt"; B=https://english-app-three-tan.vercel.app
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the bump is not in place";; esac

# NOTHING auto-rolls-back on ONE curl. A failing URL is re-probed twice more, >=10s apart, and all
# three attempts must fail before the pre-authorised rollback fires (P4-AMENDMENT #3).
confirm_dead() {   # $1 = path. Returns 0 only if it fails three times in a row.
  local p="$1" c1 c2 c3
  c1="$(curl -s -m 20 --ssl-no-revoke -o /dev/null -w '%{http_code}' "$B$p")"
  case "$c1" in 200) return 1;; esac
  sleep 10
  c2="$(curl -s -m 20 --ssl-no-revoke -o /dev/null -w '%{http_code}' "$B$p")"
  case "$c2" in 200) echo "RECOVERED ON RETRY 2: $p ($c1 -> 200) -- recorded, NOT a rollback"; return 1;; esac
  sleep 10
  c3="$(curl -s -m 20 --ssl-no-revoke -o /dev/null -w '%{http_code}' "$B$p")"
  case "$c3" in 200) echo "RECOVERED ON RETRY 3: $p ($c1/$c2 -> 200) -- recorded, NOT a rollback"; return 1;; esac
  echo "CONFIRMED DEAD after 3 attempts >=10s apart: $p ($c1/$c2/$c3)"
  return 0
}

# --- the enumeration is exactly the four frozen paths (SK-P3-3) ---
ENUM="$(sed -n '/^=== payload enumeration/,/^=== md5 live/p' "$V" | grep '^public/' | tr '\n' ' ')"
case "$ENUM" in "public/styles.css public/sw.js public/views/reader.js public/views/trophies.js ") ;; *) fail "the payload enumeration is not the frozen four: [$ENUM]";; esac
case "$ENUM" in *tests/*) fail "a test file entered the payload enumeration -- impossible unless the -- public/ scope was dropped";; esac

N="$(grep -c '^MD5 OK ' "$V")"
case "$N" in 4) ;; *) fail "expected 4 MD5 OK lines, got $N";; esac
grep -q '^MD5 BAD' "$V" && fail "at least one live file does not match the worktree: $(grep '^MD5 BAD' "$V")"
grep -q '^v19 count 1' "$V" || fail "live sw.js does not contain magic-vet-v19 exactly once"
grep -q '^v18 count 0' "$V" || fail "live sw.js still contains magic-vet-v18"
grep -q '^PRECACHE ENTRIES DERIVED 15$' "$V" || fail "the PRECACHE list derived from the LIVE sw.js is not 15 entries"

P="$(grep -c '^PRECACHE .* 200$' "$V")"
if [ "$P" != "15" ]; then
  DEAD=""
  for p in $(grep '^PRECACHE ' "$V" | grep -v ' 200$' | awk '{print $2}'); do
    if confirm_dead "$p"; then DEAD="$DEAD $p"; fi
  done
  if [ -n "$DEAD" ]; then
    fail "PRECACHE urls CONFIRMED DEAD three times:$DEAD -- cache.addAll will REJECT, the v19 worker will never install, and every returning device stays on the v18 shell FOREVER. THIS IS THE PRE-AUTHORISED ROLLBACK (SK-P3-9)."
  else
    echo "NOTE: $((15-P)) PRECACHE url(s) failed once and recovered on retry -- recorded and REPORTED to the owner, no rollback"
  fi
fi

grep -q '^MANIFEST 200 application/json' "$V" || grep -q '^MANIFEST 200 ' "$V" || fail "/audio/words/index.json did not return 200 -- EVERY speaker button in the app would silently disappear (SK-P3-6)"
grep -q '^MANIFEST 200 .* md5 OK$' "$V" || fail "the live audio manifest does not match the worktree"
C="$(grep -c '^CLIP .* 200 md5 OK$' "$V")"
case "$C" in 3) ;; *) fail "only $C of the 3 frozen sample clips are 200 + md5-matched";; esac

A="$(grep -c '^ART .* 200 image/webp md5 OK$' "$V")"
case "$A" in 9) ;; *) fail "only $A of 9 trophy webps are 200 + image/webp + md5-matched";; esac
grep -q '{"ok":true,"data":{"status":"up","version":1}}' "$V" || fail "/api/health payload is not byte-exact"
grep -q 'chapter=401' "$V" || fail "/api/chapter is not 401 -- the function bundle may not have loaded"
grep -q 'notafile=404' "$V" || fail "the negative control did not 404 -- a 200-for-everything rule would fake this whole step"
grep -q 'x-app-code' "$V" && fail "a secret appears in the evidence file" || true
echo STEP-3.5-OK
exit $RC
```

**STOP IF (this step owns the most dangerous outcomes):**
* **any `PRECACHE` URL ≠ 200, CONFIRMED DEAD on three attempts ≥10 s apart** → **ROLL BACK
  IMMEDIATELY** under SK-P3-9's pre-authorised exception, then report. A URL that fails once and
  answers on retry is RECORDED and REPORTED, **never rolled back on**.
* **`/` does not serve, CONFIRMED on three attempts** → **ROLL BACK IMMEDIATELY**; that is the app
  itself. An md5 mismatch on `/` is **not** auto-rollback — a mismatch is a stable fact, not a
  transient one, so it goes to the owner like every other `MD5 BAD`.
* **any `MD5 BAD`** → STOP and report first. One file = a partial upload; many = the wrong tree
  shipped. The owner decides; the default recommendation is rollback, because byte-identity is the
  ONLY evidence this phase has that the screen works.
* **live `sw.js` still contains `magic-vet-v18`** → STOP. The bump did not ship and returning
  devices keep the old shell. Rollback is not urgent (they are no worse off than yesterday) but
  nothing further in this plan may proceed.
* **`/audio/words/index.json` is not 200, or its md5 differs** → STOP and report. Every speaker
  button in the app would vanish, silently, with a green suite. Recommend rollback; the owner
  decides.
* **a trophy webp 404s or has the wrong case** → STOP and report; a locked card renders as a broken
  image on her shelf. **Do not "fix" it by adding the art to `PRECACHE`** (T6).
* **the negative control returns 200** → STOP; every other 200 in this file is now meaningless.

**NON-GOALS:** no authenticated request · no `/api/profile` · no browser · no repository change ·
no "helpful" re-deploy.

---

# STEP 3.6 — READ-BACK R1: nothing she had was lost

**GOAL:** the first of the two checks ever run against her real data. Prove the deploy cost her
nothing. It cannot and does not try to prove that awarding works.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 3.5 OK.

**FILES:** `.oplan/word-polish/backup-receipt.txt` (APPEND, counts only). The read-back file is
`$HOME/polish-deploy/readback-1.json`, outside the repo.

## 3.6-A — the comparator and its self-test, in THIS phase's directory

The comparator is **copied, not rewritten** (SK-P3-4). The previous run's `result.txt` is dated
2026-07-30 and is **not** accepted as this phase's evidence:

```bash
D="$HOME/polish-deploy"; mkdir -p "$D/selftest"
cp "$HOME/trophies-deploy/readback.js"      "$D/readback.js"
cp "$HOME/trophies-deploy/make-fixtures.js" "$D/make-fixtures.js"
cp "$HOME/trophies-deploy/run-selftest.sh"  "$D/run-selftest.sh"
cmp "$HOME/trophies-deploy/readback.js"      "$D/readback.js"      || { echo "FAIL: readback.js copy differs";      exit 1; }
cmp "$HOME/trophies-deploy/make-fixtures.js" "$D/make-fixtures.js" || { echo "FAIL: make-fixtures.js copy differs"; exit 1; }
cmp "$HOME/trophies-deploy/run-selftest.sh"  "$D/run-selftest.sh"  || { echo "FAIL: run-selftest.sh copy differs";  exit 1; }
# the three md5s this planner measured today, re-asserted so a swapped file cannot slip through
case "$(md5sum "$D/readback.js"      | cut -d' ' -f1)" in d3f76f2cf0b187791cb5d1d0fe59aa28) ;; *) echo "FAIL: readback.js is not the repaired version";      exit 1;; esac
case "$(md5sum "$D/make-fixtures.js" | cut -d' ' -f1)" in 7b16fa18c614d33b3178d560b0b86112) ;; *) echo "FAIL: make-fixtures.js is not the known builder";   exit 1;; esac
case "$(md5sum "$D/run-selftest.sh"  | cut -d' ' -f1)" in f6076457e566f7091a437f13fc1e4d14) ;; *) echo "FAIL: run-selftest.sh is not the known runner";     exit 1;; esac
# and it must literally carry the self-comparison refusal
grep -q 'SAME FILE TWICE' "$D/readback.js" || { echo "FAIL: readback.js lacks the self-comparison refusal (P4-AMENDMENT #1)"; exit 1; }
bash "$D/run-selftest.sh" "$D/selftest" "$D/readback.js"
```
`run-selftest.sh:7` invokes `"$D/../make-fixtures.js"`, which is why the builder sits at
`$HOME/polish-deploy/make-fixtures.js` and the fixtures at `$HOME/polish-deploy/selftest/`.

The eight cases, and what each proves: 1 key LOST, 2 status change with no activity evidence,
3 trophy LOST, 4 tier RESTAMPED, 5 tier APPEARED with no evidence, 6 tier appeared WITH evidence
(positive control), 7 **the same file passed twice is refused**, 8 an unchanged profile still passes
(the control without which a comparator that failed on everything would score 8/8). It must write
`SELFTEST 8/8 AS REQUIRED` before her data is touched.

## 3.6-B — the read of her data, with both sides bound explicitly

```bash
D="$HOME/polish-deploy"
C2="$(cat "$D/capture-path.txt")"            # written by 3.3 -- NEVER carried in a variable across steps
RB1="$D/readback-1.json"
[ -s "$C2" ] || { echo "FAIL: no C2 capture at '$C2'"; exit 1; }
[ "$C2" != "$RB1" ] || { echo "FAIL: the read-back would compare a file with itself"; exit 1; }
case "$C2" in *trophies-deploy*|*20260730*) echo "FAIL: C2 points at the PREVIOUS run's data"; exit 1;; esac

# the frozen capture subshell, with -o pointed at RB1 and the backups folder untouched
code=$( ( set -a; . ./.env; set +a
          curl -s --ssl-no-revoke -H "x-app-code: $APP_CODE" \
               -o "$RB1" -w '%{http_code}' \
               https://english-app-three-tan.vercel.app/api/profile ) )
case "$code" in 200) ;; 401) echo "FAIL: 401 - local .env APP_CODE != production (B2)"; exit 1;;
                *) echo "FAIL: GET -> $code"; exit 1;; esac
[ -z "${APP_CODE:-}" ] || { echo "FAIL: APP_CODE leaked into this shell"; exit 1; }

node "$D/readback.js" "$C2" "$RB1" 2>&1 | tee "$D/readback-1.log"
case "${PIPESTATUS[0]}" in 0) ;; *) echo "FAIL: the read-back comparator exited non-zero"; exit 1;; esac
printf "readback R1 %s bytes=%s sha256=%s\n" "$RB1" "$(wc -c < "$RB1")" "$(sha256sum "$RB1" | awk '{print $1}')" \
  >> .oplan/word-polish/backup-receipt.txt
```
`${PIPESTATUS[0]}` rather than `$?` because `tee` is on the right of the pipe.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
D="$HOME/polish-deploy"
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the bump is not in place";; esac
grep -q 'SELFTEST 8/8 AS REQUIRED' "$D/selftest/result.txt" || fail "the read-back was not proven able to fail IN THIS PHASE"
NEWER="$(find "$D/selftest/result.txt" -newermt '2026-08-01' | wc -l | tr -d ' ')"
case "$NEWER" in 1) ;; *) fail "selftest/result.txt is not from today -- a stale 8/8 is not evidence";; esac
L="$D/readback-1.log"
grep -q '^READBACK OK ' "$L" || fail "the read-back did not print READBACK OK"
grep -q '^FAIL: ' "$L" && fail "the read-back reported a failure: $(grep '^FAIL: ' "$L")"
C2="$(cat "$D/capture-path.txt")"
[ "$C2" != "$D/readback-1.json" ] || fail "C2 and R1 are the same path -- the comparison was vacuous"
case "$C2" in *20260730*) fail "C2 is a 2026-07-30 file -- the previous run's capture";; esac
[ -z "${APP_CODE:-}" ] || fail "APP_CODE leaked into this shell"
grep -q '^readback R1 ' .oplan/word-polish/backup-receipt.txt || fail "no R1 receipt line"
echo STEP-3.6-OK
exit $RC
```

**WHAT TO EXPECT, AND HOW IT DIFFERS FROM LAST TIME.** In word-trophies phase 4 the expected result
was `trophyIds=0`, because the awarding engine had never run in production. **That is no longer
true:** the engine has been live since 2026-07-30 and R2 of that run proved it awards. **So R1 here
will very likely show a non-empty `trophies` key, and `TIERS APPEARED: none` relative to a capture
taken minutes earlier.** Neither is a failure. The failures are: anything LOST, anything RESTAMPED,
a status change with no activity evidence, or a tier appearing with no evidence at all.

**STOP IF:**
* **any key LOST, any trophy LOST, any tier LOST or RESTAMPED** → **STOP. This is the T8 rollback
  trigger.** Roll back the code with the step-3.2 command, tell the owner immediately, and state —
  because it is true and must not be softened — that **rollback restores code only; if her data was
  damaged, this does not undo it.** Then stop the phase.
* **a status change with no activity evidence** → same: STOP, report, owner decides.
* **HTTP 401 or non-200** → STOP; do not retry in a loop against her profile.
* **the self-test does not reach 8/8** → STOP before the GET. An unproven comparator pointed at her
  data is worse than no check, because it produces a false all-clear.

**NON-GOALS:** no POST of any kind, ever, to her profile · no third read "to be sure" · no contents
in any record · no rollback on the orchestrator's own initiative except the two pre-authorised cases
in 3.5.

---

# STEP 3.7 — HUMAN GATE: the owner looks at it on a real device

**GOAL:** the one thing no agent in this run may do, and the gate that lesson 15 says is the only
one that catches "correct but not comprehensible" — which is precisely defect D1, the reason this
run exists.

**TIER:** OWNER. **DEPENDS ON:** 3.6 OK. Prints nothing; its output is a yes or a named defect.

**WHAT IS AND IS NOT A WRITE — measured today, and it is better news than last time.** There is ONE
profile behind `APP_CODE`; the owner's phone and the child's phone are the same account. Traced in
`public/views/reader.js`:

| action | writes her profile? | evidence |
|---|---|---|
| opening the app | a `GET /api/profile` — the same read her own app does on every load | `reader.js:392` |
| **tapping a word to open the popup** | **NO** | `:728-757` — it reads the glossary and may `POST /api/translate`; `api/translate.js` contains no reference to `loadProfile`, `saveProfile` or `profile` at all |
| **pressing the 🔊 speaker button** | **NO** | `:783-793` — it constructs `new Audio(...)` and plays it. Nothing leaves the device. |
| pressing SAVE in the popup | **YES** | `:772` `postJson("/api/profile", body)` |
| answering a quiz question | **YES** | `:712` `postJson("/api/profile", {action:"log-check", …})` |
| generating a chapter | **YES** | `:447` `postJson("/api/chapter", …)`, which also runs `awardTrophies` |

**RULED: 3.7 is LOOK-AND-LISTEN, not look-only.** The owner may open the app, tap a word and press
the speaker button, because none of those three writes her profile — and the speaker button is one
of the three things this run fixed, so a gate that forbade pressing it would be a gate that cannot
see the feature. He may **not** press SAVE, answer a quiz question, or generate a chapter.

**THE CHECKLIST, frozen — the orchestrator hands it over exactly like this:**

> **BEFORE ANYTHING: you and she share one profile.** Opening the app is a read and is harmless.
> **Tapping a word and pressing the little speaker are also harmless** — I checked the code today,
> neither one saves anything. But **pressing "save" on a word, answering a quiz question, or making
> a new chapter WRITES to her profile** and would use up a moment that belongs to her. Please do the
> first three and none of the last three.
>
> 1. **Defeat the old app first.** Her phone is holding the previous version in a cache. Close the
>    installed app and every tab, then open it fresh. **The new version reloads itself once when it
>    takes over — a brief flash — and that is it working, not a glitch.** If the screen still looks
>    unchanged, close it and open it once more: the first open installs the new version, the second
>    is served by it.
> 2. **The trophies tab — the shelf picture at the top.** This is the whole point of the change.
>    Does it read as a **shelf**? You should see its front edge and its string of lights; before,
>    a fade wiped them out and it looked like a floating picture. Say if it still does.
> 3. **The rest of the trophies screen** should look exactly as it did before — same cards, same
>    Hebrew names, same progress lines. If anything else moved, that is a defect.
> 4. **Open a chapter and tap an English word.** A little card comes up with the Hebrew. **If that
>    word has a recording, a small speaker button appears — press it and you should hear the word.**
>    If a speaker button appears and pressing it does nothing, say so; that is exactly the bug this
>    change was supposed to end.
> 5. **Tap two or three more words.** Some will have a speaker and some will not. **A word with no
>    speaker button is CORRECT now** — it means we have no recording for that word yet. About
>    seventeen words in her current chapters are in that state, including `moon`, `deer`, `wings`
>    and `scary`. **She still cannot hear those words.** That is honest, not fixed.
> 6. **Look for a broken image** anywhere — a broken-image icon instead of a picture is a defect,
>    not a style choice.
> 7. **Turn the phone / try a narrow window** if it is easy. The layout is built for a phone column.
> 8. **What you will NOT see today:** the end-of-chapter quiz drawing from that chapter's own words.
>    Seeing it needs an actual chapter ending, which is a write, so it belongs to her. It is covered
>    by tests, and step 3.8 reports it after she next uses the app.
>
> **Say "yes" or name what is wrong.** A defect found here does not get fixed in place — it becomes
> its own planned, gated step.

**STOP IF:** the owner names any defect → STOP the phase here. The orchestrator brings him two
options with costs — (a) roll back now with the step-3.2 command and fix in a new gated step, or
(b) leave it live and fix forward — and **he chooses.** The recommendation is rollback for anything
a child would notice (broken image, unreadable text, a dead speaker button) and fix-forward for
anything cosmetic, but the decision is his.

**NON-GOALS:** no agent-driven browser on production · no SAVE, no quiz answer, no chapter
generation · no screenshot of her data · no in-gate edit.

---

# STEP 3.8 — READ-BACK R2: the engine still agrees with what production stamped

**GOAL:** the only evidence that can exist that the server half is unharmed after the deploy. It
requires her to have used the app at least once after it.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 3.6 OK and 3.7 yes, **and at least one real session by
her.** The orchestrator does not manufacture that session.

**FILES:** `.oplan/word-polish/backup-receipt.txt` (APPEND, counts only). Read-back file
`$HOME/polish-deploy/readback-2.json`.

**COMMANDS:** `$HOME/polish-art/step-3.8.sh` = `$HOME/trophies-art/step-4.7.sh` with `D` repointed
to `$HOME/polish-deploy` and the receipt path repointed to `.oplan/word-polish/backup-receipt.txt`.
**Nothing else changes** — its three-way path-distinctness block (`step-4.7.sh:11-13`), its frozen
capture subshell, its two comparisons (C2→R2 and R1→R2) and its `AWARDING-CORRECT` recomputation are
copied byte-for-byte from the script that ran on 2026-07-31.

The recomputation is the sharp half: it re-runs the shipped `awardTrophies` over R2 and asks whether
production stamped any tier the engine would **not** award. `extra` non-empty means a trophy awarded
on a metric nobody can reproduce — design §6's *"a trophy awarded on a buggy metric shows the child
a lie"*. `owed` (earned but not yet stamped) is expected and harmless.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
D="$HOME/polish-deploy"; L2="$D/readback-2.log"
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the bump is not in place";; esac
OKN="$(grep -c '^READBACK OK ' "$L2")"
case "$OKN" in 2) ;; *) fail "expected TWO READBACK OK lines (C2->R2 and R1->R2), got $OKN";; esac
RCN="$(grep -c '^rc=0$' "$L2")"
case "$RCN" in 2) ;; *) fail "expected both comparisons to exit 0, got $RCN";; esac
grep -q '^FAIL: ' "$L2" && fail "R2 reported a failure: $(grep '^FAIL: ' "$L2")"
grep -q '^AWARDING-CORRECT ' "$L2" || fail "the award recomputation did not pass"
grep -q '^stamped but NOT earned: none$' "$L2" || fail "production stamped a tier the shipped engine would not award"
grep -q 'SELFTEST 8/8 AS REQUIRED' "$D/selftest/result.txt" || fail "the comparator's self-test result is missing"
grep -q '^readback R2 ' .oplan/word-polish/backup-receipt.txt || fail "no R2 receipt line"
[ -z "${APP_CODE:-}" ] || fail "APP_CODE leaked into this shell"
echo STEP-3.8-OK
exit $RC
```

**WHAT R2 CAN AND CANNOT SEE, said plainly.** It can see that nothing was lost, nothing was
restamped, and that every stamped tier is one the shipped engine justifies. **It cannot see whether
the chapter-end quiz now draws from the chapter's own words** — the profile records `quizRight`,
`quizWrong` and `lastQuizAt`, not which lemmas were asked. That behaviour is covered by phase 1's
tests and by her own experience; the record must say so rather than imply R2 proved it.

**STOP IF:**
* **anything LOST or RESTAMPED** → the T8 rollback trigger, exactly as in 3.6.
* **`stamped but NOT earned` is non-empty** → STOP. A wrong award **cannot be silently retracted**
  (never-regress), so it is an **OWNER decision**: keep it, or authorise a one-time correction as
  its own gated work. The orchestrator never touches her trophies.
* **she has not used the app within the phase window** → **do not force it and do not fake it.**
  Close the phase with R2 explicitly OPEN and the record saying that post-deploy awarding is
  unre-verified. A phase that closes honestly with one open item is worth more than one that closes
  on an unmeasured claim.

**NON-GOALS:** never POST to trigger an award · never edit her trophies · no retry loop.

---

# STEP 3.9 — PHASE CLOSE

**GOAL:** re-run every criterion, write the record the next run starts from, and put the D27
question to the owner.

**TIER:** ORCHESTRATOR-authoring. **DEPENDS ON:** 3.1-3.8 (3.8 may be OPEN).

**FILES (exhaustive):** `.oplan/word-polish/journal.md` (APPEND),
`.oplan/word-polish/phase-state.md` (REWRITE), `.oplan/word-polish/field-guide/index.md` (amend, if
the phase produced a lesson), `.oplan/word-polish/STATUS.md` (create/rewrite for the owner).

**COMMANDS:** §VAL-P3 verbatim plus the close tail; then the records commit
`oplan: word-polish PHASE 3 CLOSED — magic-vet-v19 live at <NEW_ID>, 4/4 md5 proofs, 15/15 precache, audio manifest reachable, read-back intact`.

```bash
# TAIL of the close script, which BEGINS with §VAL-P3 verbatim in the SAME file
case "$SWSTATE:$STSTATE:$WROTE" in POST:POST:POST) ;; *) fail "the tree is not in the shipped state";; esac
case "$PORC" in "") ;; *) fail "tree not clean at the close:
$PORC";; esac
B=https://english-app-three-tan.vercel.app
# never `cmd | grep -q` under set -o pipefail (lesson 6, SIGPIPE) -- capture first, match with case
SW="$(curl -s -m 20 --ssl-no-revoke "$B/sw.js")"
case "$SW" in *magic-vet-v19*) ;; *) fail "live sw.js is not v19 at the close";; esac
case "$SW" in *magic-vet-v18*) fail "live sw.js still carries v18";; esac
MAN="$(curl -s -m 20 --ssl-no-revoke -o /dev/null -w '%{http_code}' "$B/audio/words/index.json")"
case "$MAN" in 200) ;; *) fail "/audio/words/index.json is $MAN at the close -- every speaker button would vanish";; esac
grep -q 'vercel" rollback' .oplan/word-polish/phase-state.md || fail "the rollback ladder is missing from the record"
echo STEP-3.9-OK
exit $RC
```

**THE RECORD MUST STATE, for whatever comes next:**
* the NEW deployment id and url **exactly as inspect reported them**, at the top of the rollback
  ladder, with `dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB` /
  `https://english-1jnh1sn5e-dkreinovs-projects.vercel.app` beneath it, **full urls, never a bare
  project-name fragment**;
* `magic-vet-v19` is LIVE; **QZ-22's next bump is v20** and the next phase that moves a precached
  file owes it — phase 3 spent v19 and nothing else;
* the 4 md5-proved payload paths, the 15/15 precache result, the manifest + 3 clips result, the nine
  webp results, and the `/sw.js` `cache-control` header **as measured** (it has never been recorded);
* the capture receipts (C2, R1, R2 — bytes, sha256, counts, **never contents**);
* what R1 and R2 actually showed, including any tiers that appeared and the evidence for each;
* **whether R2 ran at all**, plainly, and if not, that post-deploy awarding is unre-verified;
* the owner's 3.7 verdict, verbatim;
* **THE AUDIO DEBT, in the owner's words and at the top of the open items:** ~17 story words still
  have no clip, the speaker button is correctly absent for them, and she cannot hear them. The
  blocker is that `scripts/build-word-audio.js` rewrites the manifest from a band derivation on every
  run (`ae349c6`). That is a whole planned run, not a follow-up;
* the D27 answer, verbatim, and — if "delete" — that the deletion happened strictly AFTER R2 and the
  criteria re-run, with the pre-delete sha256 verified against the receipt first;
* anything worth promoting into the field guide. **Three candidates from this phase:**
  (a) *"A CORRECTION CAN BE THE ERROR. The phase-3 briefing 'corrected' the endings record to say
  five files were CRLF; two of them are LF, and the run's own gate (`VAL-P1.sh:82`) had been
  asserting LF successfully five times. Re-measure the correction, not just the claim."*
  (b) *"`console.log(n)` on a NUMBER emits ANSI colour when node thinks stdout is a terminal, so a
  frozen gate that pins a count can fail on a correct tree in one executor's shell and pass in
  another's. Always `console.log(String(n))`."* — measured today; `VAL-P1.sh:35-36` still carries it.
  (c) *"A per-file md5 pin cannot see a HALF-APPLIED change. When two files must move together
  (a service worker and the test that pins it), assert the SEAM: derive a state from each and
  require the states to be equal."*

**THE D27 QUESTION, asked verbatim at this step:** *"Do the capture files in
`C:/Users/dkreinov/english-app-backups/` get deleted now, as at the end of earlier phases, or kept?
There are now three of them (two from 2026-07-30 and this phase's). They are the only copies of her
profile that exist. Deleting ends the safety net; keeping leaves her data sitting on this machine."*

**NON-GOALS:** no code change · no deploy · no further read of her profile · no `public/` change ·
no "small fix while we are here".

---

## STOPPING CONDITIONS — the whole phase on one page

| # | observation | verdict | who decides | next action |
|---|---|---|---|---|
| 1 | the apply script's byte/CRLF/md5 assertion fails at 3.1 | STOP | orchestrator | `git checkout --` both files; never "fix" the expected md5 |
| 2 | `npm test` PASSES in the half-applied state | **STOP, serious** | owner | the cache-name pin does not observe `sw.js`; it has been decorative for four deploys |
| 3 | §VAL-P3 does not print `HALF-APPLIED BUMP` in the half-applied state | STOP | orchestrator | the seam clause is broken; the phase has no protection against a half-bump |
| 4 | either file's endings move | STOP | orchestrator | lesson 4's silent corruption; `git diff` will not show it |
| 5 | `vercel inspect` reports an id other than `dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB` | STOP before anything | owner rules | re-establish the entire live baseline |
| 6 | inspect gives no url | STOP | orchestrator | never hand-build one; no rollback target = no deploy |
| 7 | live `/sw.js` already says v19 at 3.2 | STOP | owner | something shipped outside the run; re-plan |
| 8 | fewer than 16 baseline URLs answer 200 at 3.2 | STOP | owner | production is already unhealthy |
| 9 | capture returns **401** | STOP | owner supplies the code out of band | never `vercel env`; no deploy without a capture |
| 10 | capture fails `validateProfile` | STOP | owner | understand a pre-existing data problem before adding code to it |
| 11 | `APP_CODE` leaked into the shell | STOP | orchestrator | new shell, re-run; a leak silently 401s everything after it |
| 12 | deploy build fails | STOP; **nothing shipped**, production still v18 | orchestrator reports | read the log; no blind retry; no rollback needed |
| 13 | deploy log lost / command seems to hang | **DO NOT RE-RUN** | orchestrator | read the log, then `vercel inspect` the alias |
| 14 | alias id ≠ new deploy id, or two ids in the log | STOP | owner | the wrong-deployment / double-deploy failures lesson 10 exists for |
| 15 | **any PRECACHE URL ≠ 200, confirmed dead 3× ≥10 s apart** | **ROLL BACK IMMEDIATELY**, then report | pre-authorised (SK-P3-9) | `cache.addAll` rejects as a whole; every returning device keeps the v18 shell forever |
| 15b | a PRECACHE URL fails once and recovers on retry | **no rollback** — record and report | orchestrator records, owner informed | a blip must not burn the one rollback |
| 16 | **`/` does not serve, confirmed 3×** | **ROLL BACK IMMEDIATELY**, then report | pre-authorised (SK-P3-9) | that is the app itself |
| 16b | `/` serves but md5-mismatches | STOP, no auto-rollback | owner | a mismatch is stable, not transient — row 17 |
| 17 | any `MD5 BAD` | STOP | owner (default recommendation: roll back) | without byte-identity this phase has no evidence at all |
| 18 | the payload enumeration is not the frozen four paths | STOP | orchestrator | the wrong base, or something else changed under `public/` |
| 19 | live `sw.js` still contains v18 | STOP | owner | the bump did not ship; nothing further proceeds |
| 20 | **`/audio/words/index.json` ≠ 200 or md5-mismatched** | STOP | owner (recommend rollback) | every speaker button in the app vanishes, silently, with a green suite |
| 21 | a trophy webp 404s or is case-wrong | STOP | owner (recommend rollback) | broken image on her shelf; never "fix" via `PRECACHE` |
| 22 | the negative control returns 200 | STOP | orchestrator | every other 200 is now meaningless |
| 23 | the comparator self-test is not 8/8, or `result.txt` is not from today | STOP **before** the GET | orchestrator | an unproven comparator produces a false all-clear, which is worse than no check |
| 24 | read-back: key/trophy/tier **LOST or RESTAMPED** | **STOP — the T8 trigger** | owner, immediately | roll back code; say plainly that code rollback does not restore data |
| 25 | status change with no activity evidence | STOP | owner | same path as 24 |
| 26 | a tier appeared with no evidence clause firing | STOP | owner | a trophy over an unchanged profile is the "shows her a lie" risk |
| 27 | R2's `stamped but NOT earned` non-empty | STOP | **owner only** — never-regress forbids silent retraction | keep, or a one-time correction as new gated work |
| 28 | she has not used the app in the window | **not a failure** | orchestrator records | close with R2 OPEN; do not fake a session |
| 29 | owner names a defect at 3.7 | STOP | owner picks rollback vs fix-forward | the fix is a new gated step, never in place |
| 30 | §VAL-P3 fails at any step | STOP | orchestrator | the tree that would ship is not the tree that was gated |

**The pre-authorised rollbacks are exactly two (rows 15 and 16)** — the cases where waiting for a
human leaves a child's app broken for longer. Everything else stops and asks.

---

## THE THREE REVIEW QUESTIONS, ANSWERED IN PLACE

1. **Runtime reachability** — SK-P3-6. Traced for all four shipped artifacts plus the one nobody had
   traced: `/audio/words/index.json`, fetched by the browser at `words-index.js:17`, **absent from
   `PRECACHE`**, and never probed by any previous deploy's evidence. Criterion 14 closes it.
2. **Contradictory sources** — SK-P3-7. Five shown values traced to their sources. The one pair that
   could have disagreed (the speaker button vs the clip URL) is proven to be **one variable, not
   two**. This phase creates no new pair.
3. **Ungated composites** — SK-P3-12. Four named; three go to the owner's eyes at 3.7, and the
   fourth (the chapter-end quiz) is stated as **not visible at the gate** rather than quietly
   assumed covered.

---

## RISKS

1. **The service worker hands her a broken mix.** Her phone holds the v18 shell. The new worker must
   install (all 15 URLs), activate, claim, and trigger the one-shot reload at `app.js:62-66`. If
   `addAll` fails she stays on v18 **silently and indefinitely**. *Noticed by:* criterion 13, the
   15/15 sweep. *Residual:* a phone that never revisits never updates.
2. **Rollback restores code, not data.** *Mitigation:* the awarding engine is pure and additive, T8
   watches for disappearance, and the capture exists for the deploy window — which is when the risk
   lives. *Residual, stated:* if her profile is damaged, the capture is a photograph, not a spare.
3. **The audio manifest 404s and every speaker button disappears.** New this phase because T3(a)
   made the button depend on it. Unprecedented in this project's gates. *Mitigation:* criterion 14.
   *Residual:* if the manifest is served but stale (a CDN edge case), the buttons would be right for
   the wrong words; the md5 comparison catches exactly that.
4. **The bump is applied to only one of the two files.** *Mitigation:* the seam clause in §VAL-P3,
   which is watched failing during step 3.1 itself. *Residual:* none identified — the two states are
   enumerated and no third passes.
5. **A stale artifact from the previous run is read as this phase's evidence.** This is the failure
   that shipped a vacuous gate last time. *Mitigation:* a separate directory, six path assertions, a
   freshness check on `selftest/result.txt`, and a comparator that refuses a self-comparison.
   *Residual:* an executor who edits a frozen path. Covered by the stop-rule, nothing more.
6. **The owner reads "shipped" as "she can hear the missing words".** *Mitigation:* SK-P3-11, the
   plain plan, and checklist item 5 all say the opposite in words a non-engineer reads. *Residual:*
   none mechanical; this is a communication risk and it is handled by repetition.

## BLOCKERS

* **B-P3-1 — the briefing's endings correction is wrong (RESOLVED IN THIS PLAN, but it must be
  corrected in the record).** `BRIEFING-POLISH-P3.md:81-85` states five files are CRLF; two are LF.
  A plan that inherited it would have pinned an ending only a corrupted file could satisfy. The plan
  above pins the measured values. **The orchestrator should correct the briefing before any other
  agent reads it.**
* **B-P3-2 — no live measurement was permitted to this planner.** Every production value in this
  plan is either quoted from the record as a hypothesis to confirm, or written as a thing step 3.2
  must measure. If the live baseline has moved since 2026-07-31, step 3.2 stops the phase, which is
  the correct behaviour but should be expected rather than treated as a surprise.
* **B-P3-3 — the phase cannot complete without her.** R2 needs a real session by the child. If she
  does not use the app in the window, the phase closes with R2 OPEN. That is planned for, not a
  failure, but the owner should know the close may be partial.

## RECORD GAPS

1. **`vercel inspect` may print no commit line.** It did not for the outgoing deployment last time
   (`step-4.4.sh:8-9` records exactly that). The plan therefore freezes `OC=a40cdb2` from a dated
   measurement rather than depending on inspect, and backs it with the frozen four-path literal.
2. **The `cache-control` header Vercel serves on `/sw.js` has never been recorded** in any phase of
   this project. It decides how quickly she gets a new worker. Steps 3.2 and 3.5 record it; **no
   step gates on it**, because no threshold has ever been agreed and this is not the phase to invent
   one.
3. **`.oplan/word-polish/STATUS.md` does not exist** (the previous run had one). Step 3.9 creates it.
4. **`.oplan/word-polish/backup-receipt.txt` does not exist.** Step 3.3 creates it.
5. **No owner ruling is on record for phase 3 specifically.** `phase-state.md:16` says "OPEN
   QUESTIONS: none" as of phase 1. The orchestrator must obtain an explicit GO before step 3.4, and
   the D27 rider must be re-asked at 3.9 rather than assumed.
6. **The projection in step 3.3 is less meaningful than it was last run**, because the engine has
   been live since 2026-07-30 and her `trophies` key is no longer empty. It is kept because it costs
   nothing and gives R2 an anchor, but the close must not describe it as a prediction of a first
   award pass.

---

## PLAIN PLAN — for the owner, in plain words

Three fixes are already built and tested on this machine and none of them has reached her phone yet.
This phase is the delivery: nine steps, one deploy, and two careful readings of her profile to prove
nothing was lost.

**3.1 — Give the app's stored copy a new name, and move the test that guards it in the same breath.**
*Why:* her phone keeps its own copy of the app's files and only throws it away when the name
changes. Without this, all three fixes sit on the server and she keeps seeing the old app forever.
The test that pins the name moves at the same moment so the two can never drift apart — and we
deliberately break the tree halfway first, to watch the alarm go off.
**DONE WHEN:** the app file says `magic-vet-v19`, its test says the same, all 358 tests pass, and
both files are exactly the same size they were.

**3.2 — Write down what is live right now, and the one command that undoes this.**
*Why:* if the deploy goes wrong, nobody should be composing a rescue command under pressure. It gets
written and saved before anything moves.
**DONE WHEN:** the current live version is confirmed to be the one we think it is, the undo command
is saved in the record with the real address pasted in, and it is committed.

**3.3 — Take a fresh copy of her profile, minutes before the deploy.**
*Why:* it is the only photograph of her words, her chapters and her trophies from just before the
change. It goes to a brand-new filename so nothing can confuse it with an older copy.
**DONE WHEN:** the copy exists, is readable, passes the app's own validity check, and a receipt
(size and fingerprint — never the contents) is written into the record.

**3.4 — Deploy. Once.**
*Why:* this is the moment the three fixes reach the internet. Once, with the output written to a
file rather than watched on screen — a truncated screen once caused an accidental second deploy.
**DONE WHEN:** exactly one deployment exists, the live address points at it, and it reports Ready.

**3.5 — Prove that what the internet is now serving is exactly what we tested.**
*Why:* "it deployed" and "it deployed correctly" are different claims. We compare the four changed
files byte for byte, check that every file her phone must download actually answers, and — new this
time — check the little list that tells the app which words have a recording. If that list ever
went missing, every speaker button in the app would quietly vanish and every test would still pass.
**DONE WHEN:** all four files match byte for byte, the new name is live and the old one gone, all
fifteen required files answer, the recordings list and three sample recordings answer, all nine
trophy pictures answer, and a deliberately fake address still returns "not found".

**3.6 — Read her profile back and prove the deploy cost her nothing.**
*Why:* this is the promise the whole ritual exists to keep. Before it runs, the comparison tool is
put through eight rigged tests — five of which it must FAIL — so we know it is capable of raising
an alarm at all.
**DONE WHEN:** every word she had is still there, no trophy or date has been changed, and the tool
proved itself first.

**3.7 — You look at it on your own phone.**
*Why:* the defect that started this run — the shelf that did not look like a shelf — passed every
automated check there was. Only a person looking found it. **You may tap a word and press the little
speaker: I checked the code today and neither of those saves anything.** Please do not press "save",
answer a quiz question, or make a new chapter — those write to her profile.
**DONE WHEN:** you say yes, or name what is wrong.

**3.8 — After she next uses the app, read the profile once more.**
*Why:* to confirm the server side is still healthy after the change — that nothing vanished and that
every trophy she has is one the app can justify.
**DONE WHEN:** both comparisons come back clean and the trophy recomputation agrees. **If she has
not used the app yet, we close the phase saying so, rather than pretending.**

**3.9 — Write it all down and ask you the one standing question.**
*Why:* the next run starts from this record. And the copies of her profile on this machine are the
only ones that exist — whether they are deleted is your call, asked fresh each time, never assumed.
**DONE WHEN:** every check has been re-run, the record names the new version and the undo command,
and you have answered.

### THE TWO THINGS THIS DOES NOT FIX — please read these

**1. She still cannot hear about seventeen words.** The plan was to record the missing ones before
this deploy. That did not happen: those words sit outside the vocabulary the recording script works
from, and the script rewrites the master list every time it runs, so making them naively would
scramble the list. It was stopped before anything was spent. **What changes after this deploy is
honesty, not coverage:** for words like `moon`, `deer`, `wings` and `scary` the little speaker
button will now be **absent** rather than present-and-dead. She will no longer press a button that
does nothing — but she still cannot hear those words. Recording them is its own separate piece of
work.

**2. She will not see the change instantly, and that is normal.** Her phone keeps its own copy of
the app. The next time she opens it, the first thing she sees is still the old version; while she is
looking at it the phone quietly fetches the new one, and then the app reloads itself once — a brief
flash — and from that moment she is on the new version. So: **the change arrives on her next visit,
after one automatic reload, not the second the deploy finishes.** If you open it yourself and it
looks unchanged, close it completely and open it once more. The one thing that would stop this
working entirely is if any single required file failed to download — and that is exactly what step
3.5 checks fifteen times over, because it is the one failure that would leave her stuck on the old
app indefinitely without anyone noticing.

---

*End of plan. Nine steps: 3.1 bump · 3.2 pre-flight · 3.3 capture · 3.4 deploy · 3.5 proof ·
3.6 read-back R1 · 3.7 owner's eyes · 3.8 read-back R2 · 3.9 close.*
