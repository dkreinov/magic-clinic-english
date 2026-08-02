# BRIEF — word-finish PHASE 2 "audio". For the fresh planner.

You are the planner for phase 2 of the `word-finish` run. You did not write phase 1 and you owe it
no loyalty. **Your job is to produce an executable plan, and to catch my errors while you do it.**
Every previous planner in this project caught at least one orchestrator error that would have sent
an executor to the wrong address. Assume there is one here too.

REPO: `C:/Users/dkreinov/claude/english-app` (git bash, Windows). Branch `master`, HEAD `81fb743`,
tree clean. **Do not commit anything. Do not modify the repo.** Your only write target is
`C:/Users/dkreinov/wf-p2-plan/PLAN-P2.md` (and any scratch files in that same directory).

## Rule 0 — how you must work

1. **Write your draft INCREMENTALLY to `C:/Users/dkreinov/wf-p2-plan/PLAN-P2.md`** as you go.
   Never paste the plan, or large parts of it, into your reply. Your reply to me is a short
   summary: what you decided, what you measured, what you found wrong in this brief, and your
   open blockers. Nothing else.
2. **Verify by EXECUTION, not by reading.** This project's field guide (lesson 15) records three
   defects that shipped past 349 passing tests because someone read source instead of running it.
   Run node, run the tests, run the scripts. Reading source is a last resort and must be labelled.
3. **You may run read-only commands and `npm test` freely. You may create scratch files OUTSIDE
   the repo. You must NOT: spend money (no TTS/OpenAI calls — the executor does that under the
   plan), write into the repo, or git-anything.**
4. If any fact in this brief disagrees with what you measure, **the measurement wins and you must
   say so loudly in your reply.** That is the single most valuable thing you can produce.

## Rule 1 — read these first, in full, before planning

In the repo:
- `.oplan/word-finish/design.md` — especially §2, §3 A, §6, §7, §8 (FROZEN marker), §9 (risk A
  resolved), §11 (the WAIVED listening gate + the mandatory mechanical checks).
- `.oplan/word-finish/phase-state.md` — frozen contracts, carried obligations F1-1..F1-4.
- `.oplan/word-finish/journal.md` — the 2026-08-02 entries.
- `.oplan/word-finish/field-guide/index.md` — all 23 lessons. **14, 15, 16, 17, 18, 19, 20, 21, 22
  are directly load-bearing for this phase.** Lesson 16 (measure endings by counting bytes, never
  grep) and lesson 22 (when a frozen pin and a mandated edit collide, ask which one names a
  property) will both bite you in this phase — I have already found where.
- `.oplan/word-finish/plan.md` — phase 1's plan, for the HOUSE STYLE of a step (packet shape,
  frozen quoting, validation tail, `exit $RC`). Your plan must match that style.

## Rule 2 — the frozen contracts. Re-acknowledge these in your plan before writing a step.

- `public/quiz.js` md5 `69b6d71117cf776715374abc6f0abb02` and `public/quiz-core.js` md5
  `9a2131be8b9d1b77c219f1e8c3482a71` — **QZ-18. NEVER touched, not even whitespace.**
- The audio **VOICE**, **MODEL** and **INSTRUCTIONS** in `scripts/build-word-audio.js`:
  `gpt-4o-mini-tts` / `nova` / the existing instructions string. 2254 shipped clips came from
  those. **Phase 2 changes none of the three.**
- The `.oplan` awk filter used by the write-set gates: `awk '$NF !~ /^\.oplan\//'`.
- **CACHE `magic-vet-v20` -> `v21` happens EXACTLY ONCE, in PHASE 4. Phase 2 does NOT bump it**
  (carried obligation F1-1), even though phase 2 changes precached files. Say this in the plan so
  no executor "helpfully" bumps it. Phase 1 already left two precached files changed and unbumped;
  phase 2 will add more. That is intentional and phase 4 pays it.
- Design §8's marker is **FROZEN, quoted not named**: class `btn-say na`, the existing speaker
  glyph `&#128266;`, a CSS-drawn diagonal line (NOT a swapped emoji), the ASCII caption
  `coming soon` (lower-case, English, no Hebrew). The exact CSS is quoted in design §8 — **copy it
  from there, do not retype it.**

## Rule 3 — the money and the ONLY gate

Phase 2 spends real money on the OpenAI TTS API. **Already authorised** by the owner 2026-08-01.
Cost is a fraction of a cent for ~16 clips.

**The owner has WAIVED the listening gate** (design §11, 2026-08-02, informed of the cost). Phase 2
does NOT stop for his ears. **Therefore the four mechanical checks in design §11 are the ONLY gate
and are MANDATORY.** Your plan must implement all four as executable checks with a real
pass/fail exit code, not as prose:

1. **Voice-drift control** — regenerate ONE word that ALREADY has a shipped clip, to a scratch path
   **outside `public/`**, and compare duration and byte size against the shipped clip. Large
   divergence => STOP and report. **The shipped clip is never overwritten.** You must decide and
   state: which word, what tolerance, and *how duration is measured on this machine* — check
   whether `ffprobe`/`ffmpeg` exists here before you specify it, and if it does not, specify what
   you use instead. Do not write a check that cannot run.
2. **Non-silence** — every new `.aac` must be non-trivial in size and must decode.
3. **Plausible duration** for the word's length.
4. **Manifest/file correspondence** — every generated word in the manifest, every manifest entry
   has a file. Design §3 A makes this structural rather than checked; say so, and still check it.

**ACCEPTED RESIDUAL RISK (owner's, knowingly):** a clip may mispronounce a word and ship. Blast
radius one word. Do not try to design that away.

## Rule 4 — what phase 2 must deliver

### (a) Fix the manifest architecture FIRST
`scripts/build-word-audio.js:102` `main()` calls `deriveWordList()` (`:40`), which is
`buildAllowedSet(A2 profile, band1, band2)` filtered by `WORD_RE` and sorted — 2254 words derived
**purely from the curriculum bands**. `writeManifest()` (`:95`) then **overwrites**
`public/audio/words/index.json` with exactly that list. A story word outside the bands can never be
in the manifest, and any hand-added entry is destroyed on the next run.

**Decision (design §3 A, already made, do not re-litigate):** the manifest becomes a statement
about **which `.aac` files exist ON DISK**. The band derivation stays as the source of *what to
generate*, extended by an explicit extras list for the words her stories use.

**RISK A IS RESOLVED — design §9.** Both `getAllowedSet()` consumers are audio-only
(`public/views/words.js:159` `sayLemma`, `public/views/reader.js:839` -> `canSay`). Nothing gates
her vocabulary on the manifest. **Re-verify this yourself in one command and confirm or refute it
in your reply** — do not take my word for it.

### (b) Generate the missing clips
Script **unchanged in model, voice and instructions**. `deep breath` excluded (contains a space,
can never be a lemma file).

### (c) Implement the FROZEN coming-soon marker (design §8)
`canSay` moves from gating the button's **EXISTENCE** to gating its **STATE**.

### (d) NOT in phase 2
No CACHE bump. No quiz items (phase 3). No deploy (phase 4). No R4(ii) (F1-2, needs its own step).
No touching F1-3. No new Hebrew string.

## Rule 5 — GROUND TRUTH I measured today, 2026-08-02, on HEAD 81fb743

Everything in this section was executed, not remembered. **Re-measure anything you depend on.**

**Repo state**
- `git status --porcelain` -> empty. HEAD `81fb743`. Branch `master`.
- `npm test` -> **369 reported / 364 flat / 0 fail**, duration ~8.8s. That is your baseline ledger.
- `.env` exists at the repo root (321 bytes) and contains `OPENAI_API_KEY`.

**Audio state**
- `public/audio/words/index.json` — 19942 bytes, **2254 entries**, endings **LF**.
- `public/audio/words/*.aac` on disk — **2254 files**. So manifest and disk agree exactly today.
- The 17 missing story words come from `.oplan/word-polish/design.md:26-27` (measured there across
  her five chapters: 50 glossary words, 29 had a clip, 17 did not):
  `after closer "deep breath" deer feet glow glowing glows growls harm moon nervous scary softly
  suddenly tightly wings`
- **I verified all 16 lemma-shaped ones today: every one is MISSING from disk AND OUT of the
  manifest.** (`deep breath` is the 17th and is excluded.) So the generation set is **16 words**,
  not 17. Design and phase-state both say "~17"; **the honest number is 16 clips.** State this.
- **Sanity check I want you to make**: `after`, `feet` and `moon` being outside an A2 band set is
  surprising. Confirm it rather than assuming my check was right.

**The code**
- `public/lemma.js` `resolveLemma(word, allowedSet)` returns the first lemma candidate that is in
  `allowedSet`, else `null`. **`allowedSet` IS the audio manifest.** There is no independent notion
  of "this is a real lemma" anywhere in the browser code.
- `public/words-index.js` `getAllowedSet()` fetches `/audio/words/index.json` and **swallows every
  failure into an empty Set**. Consequence recorded in design §9: a 404 manifest is
  indistinguishable at runtime from a manifest that legitimately lists nothing.
- `public/views/reader.js`:
  - `:334 renderWords()` — **EVERY whitespace-separated token in the story becomes a tappable
    `<span class="w" data-word="...">`**, not only glossary words.
  - `:839` `const lemma = resolveLemma(dataWord, allowedWords);` `:843` `canSay: lemma !== null,`
  - `:691` the popup renders the button **only if `canSay`**.
  - `:884` binds the `[data-say]` handler.
- `public/views/words.js`:
  - `:159` `const sayLemma = allowedWords ? resolveLemma(lemma, allowedWords) : lemma;`
    — note the `allowedWords === null` branch: **before the manifest loads, every row gets a live
    button optimistically**, then `:265` loads the set and re-renders. Preserve that or state why
    you changed it.
  - `:161` renders the button only when `sayLemma` is truthy.
- `public/styles.css:693 .btn-say` and `:708 .btn-say:active` — **`.btn-say` lives in the
  GLOBALLY LINKED sheet, not in a view's `VIEW_STYLE`.** Field guide 14: put `.btn-say.na` and
  `.btn-say-soon` there too, and gate that they are reachable from the document.
  `.btn-say` background is `var(--color-surface-2)`, **not** `--color-card`.

**Contrast**
- `scripts/check-contrast.mjs:13` **already has** `{ fg: "--color-muted", bg: "--color-card",
  min: 4.5, label: "muted text on card" }`. Design §8 requires the `coming soon` caption
  (`color: var(--color-muted)`) to pass against `--color-card`. **So the pair may already be
  covered — but verify the caption's ACTUAL background is `--color-card`**: in the reader it sits
  inside `.reader-popup` (`reader.js:260`, a VIEW_STYLE rule) and in the words list inside a row.
  If either real background is not `--color-card`, design §8's instruction to gate against
  `--color-card` is gating the wrong pair, and you must say so and propose the right pair.
  Design §8 explicitly permits "or state why not".

**THE COLLISION I ALREADY FOUND — field guide 22 applies, and you must rule on it**
- `tests/words-ui.test.js:181`:
  `assert.ok(!unknownRow.includes('btn-say'), 'no play button on a row we cannot speak');`
  This pin asserts **exactly the property design §8 deliberately overturns.** It names a property,
  not a spelling — so it must be **RE-EXPRESSED** (a row we cannot speak shows a NON-PRESSABLE
  `btn-say na` + `coming soon`), **never deleted**, and it must be **seen to fail** before the fix.
- `tests/reader-ui.test.js:134` `assert.ok(src.includes('activePopup.canSay'), 'the button is
  conditional on having a clip');` and `:337` pins the literal `'canSay: lemma !== null,'`.
  Decide for each: property or spelling. Say which and why.
- `tests/reader-ui.test.js:226` has a comment block about canSay being "honest today by accident of
  construction" — read it, it is phase-1 (step 1.2 / T3a) reasoning that constrains you.
- `tests/word-audio.test.js` last test pins `deriveWordList()` == disk == **2254** exactly, in both
  directions. **Redefining the manifest and adding 16 clips breaks this test.** It names a real
  property ("no play button that silently does nothing") — re-express it against the NEW
  architecture, see it fail, do not delete it. Its other tests pin `buildAllowedSet`, `band1.json`,
  `band2.json`, `'A2'`, and that the source contains no hardcoded `'apartment'`/`'telecommunications'`
  — an extras list of story words may or may not trip those; **check by running, not by reading.**
- `tests/quiz-ui.test.js:472` and `tests/reader-ui.test.js:83,89` also reference `btn-say`.

**Line endings, measured 2026-08-02 by BYTE COUNT (`tr -dc '\r' < f | wc -c` vs `'\n'`) — field
guide 16. Never re-derive these with grep.**

| file | CR | LF | kind |
|---|---|---|---|
| `public/styles.css` | 729 | 729 | **CRLF** |
| `public/views/reader.js` | 946 | 946 | **CRLF** |
| `public/views/words.js` | 289 | 289 | **CRLF** |
| `public/words-index.js` | 0 | 25 | LF |
| `public/lemma.js` | 0 | 64 | LF |
| `scripts/build-word-audio.js` | 0 | 154 | LF |
| `tests/word-audio.test.js` | 0 | 65 | LF |
| `tests/reader-ui.test.js` | 0 | 848 | LF |
| `tests/words-ui.test.js` | 0 | 272 | LF |
| `public/audio/words/index.json` | 0 | 1 | LF |
| `scripts/check-contrast.mjs` | 0 | 190 | LF |

**The three CRLF files are the three you must edit most.** `core.autocrlf=true` here, so an
Edit-tool insert can silently CRLF a whole LF file and `git diff` normalises the damage away.
Specify byte-preserving edits and an ending re-measurement in every step's validation tail.

## Rule 6 — the questions I want your plan to answer explicitly

These are the judgement questions. Field guide 15 records that reviewers spend their effort on
re-measurable claims and skip judgement, so I am naming the SHAPE, not the principle.

1. **When exactly does `btn-say na` appear?** `renderWords()` makes *every* token tappable, and
   `resolveLemma` is the *only* signal available. So a naive "render `na` whenever `lemma === null`"
   puts a crossed-out speaker under **every proper noun and every out-of-band token in the story**.
   Is that right, wrong, or acceptable? Decide, justify, and **show me the actual set of words in
   her five chapters that would get the marker after phase 2 generates the 16** — by running the
   tokenizer over the real chapter text if you can reach it without touching her live profile
   (**field guide 3: NEVER probe the live profile; `GET /api/profile` CREATES one**), or over a
   fixture, and say which you used.
2. **Does the marker land in the reader popup only, or in the words list too?** R7's own words are
   about her *dictionary* ("if she add a word to her dictionary and we dont have it yet"), which is
   the words list. Design §8's prose is about the popup. **Both, or one? Decide and justify.**
3. **What is the extras list, and where does it live?** A literal in `build-word-audio.js`? A data
   file? Whichever you pick, state what happens when the story generator later uses a word that is
   in neither the bands nor the extras — i.e. what the *routine* top-up looks like, since design §2
   accepted "one documented command" as the price of build-time generation.
4. **`deriveWordList()` is EXPORTED and consumed by a test.** After the split, what does it mean —
   "what to generate" or "what exists"? Name the two concepts separately if they are two concepts.
   A function whose meaning silently changed under a stable name is exactly the drift the
   disk-derived manifest is meant to abolish.
5. **What does a partially-failed generation run leave behind?** The script is resumable and writes
   each file as it goes. If clip 9 of 16 fails, the manifest, the disk and the tests must not be
   left in a state that looks fine. State the recovery.
6. **Ordering.** The manifest is currently written BEFORE generation (`main()` :109 then the loop).
   Under the disk-derived rule it must be written AFTER. State that and its consequence for a
   run that dies mid-way.
7. **The honesty property must survive.** word-polish proved: *a pressable button implies a clip
   exists*. State how your plan preserves it and how it is gated.
8. **Which of your gates was SEEN TO FAIL?** For every gate, say whether it is a GATE (mutated,
   watched to fail, restored) or a GUARD (cannot be tested). Field guide 2 and 15.
9. **`exit $RC` in every step's tail, in the same file** (field guide 17 — a preamble is not a gate).
10. **Instrument every sweep once** (field guide 18): print how many items it actually observed. If
    "observed" is 0, the check is decoration.

## Rule 7 — plan shape

Match `.oplan/word-finish/plan.md`'s house style. Steps sized for a cheap executor in a clean
context: each step gets its own frozen quoted contracts, an explicit repo write-set, a validation
script that ends `exit $RC`, and a stated fail-first mutation. Number them `2.1`, `2.2`, ...

State a **BASE** commit (`81fb743`) and, per step, the **exact repo write set**.

The step that spends money must be its own step, must be the LAST-but-one, must state the exact
command, and must state what the executor does if a check fails (STOP, do not retry blindly).

## What to return to me

A short reply only:
- the step list, one line each;
- every place this brief was WRONG (I expect at least one);
- your answers to Rule 6 in one line each;
- any BLOCKER that needs an owner-level ruling.

The plan itself stays in `C:/Users/dkreinov/wf-p2-plan/PLAN-P2.md`.
