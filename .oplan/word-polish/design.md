# Design — word-polish

STATUS: decided by the orchestrator from owner rulings on 2026-07-31/08-01. Three changes the
learner or the owner actually reported, shipped in one deploy. This is the WHAT; the planner turns
it into steps.

## 1. Where this came from

All three items are reported defects, not inventions:
- **D1** the owner, looking at the live trophies screen: the shelf banner does not read as a shelf.
- **D2** the learner: "at the end of each chapter I get the same exact questions."
- **D3** the learner: tapping a word in the story should read it aloud, not only offer to save it.

The prior run's record is `.oplan/word-trophies/` — read `field-guide/index.md` **lesson 15**
before planning anything: three defects there escaped 349 passing tests because assertions were
written from the same model as the code, and only a human looking found them.

## 2. Verified facts this design is built on (measured 2026-08-01, not remembered)

- `public/views/reader.js:532` **already renders a speaker button**:
  `${activePopup.canSay ? `<button class="btn-say" data-say="..." aria-label="הקשיבי למילה">🔊</button>` : ""}`
  and `:715` already binds a `[data-say]` handler that plays `/audio/words/<lemma>.aac`.
- `:674` sets `canSay: lemma !== null` — i.e. **the button appears whenever the word resolves to a
  lemma, and never checks that a clip exists.** The player swallows failures (`p.catch(() => {})`).
- Across her five chapters: **50 glossary words, 29 have a clip, 17 distinct words do not.**
  Missing: `after closer deep breath deer feet glow glowing glows growls harm moon nervous scary
  softly suddenly tightly wings`. **`deep breath` contains a space** and cannot be a lemma file.
- Chapter glossary entries are `{ word, he }` — the key is **`word`**, not `lemma`.
- `scripts/build-word-audio.js` synthesises `.aac` via OpenAI `gpt-4o-mini-tts`, a fixed `VOICE`
  and `INSTRUCTIONS`, and **skips any word whose file already exists** — it is incremental by
  design. `OPENAI_API_KEY` is present in `.env`.
- The chapter-end quiz is built at `reader.js:344` as
  `candidateLemmas.concat(pickQuizWords(profile, 20))` — **her whole vocabulary, unrelated to the
  chapter** — and `public/quiz.js:232` takes **the first four that load**, in order. `rand` only
  shuffles the multiple-choice options and picks among alternate bank items.
- `public/quiz.js` (md5 `69b6d711…`) and `public/quiz-core.js` (md5 `9a2131be…`) are **QZ-18 frozen**.
- `.trophy-banner` does not exist; the shelf uses `.hero-banner`, which shares a rule with
  `.chapter-banner` and `.celebrate-image` carrying `aspect-ratio: 3/2`, `object-fit: cover` and
  `mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%)`.
- Endings on disk: `reader.js` **CRLF**, `styles.css` **CRLF**, `sw.js` **CRLF**,
  `trophies.js` **LF**, `tests/*.js` **LF**.
- Live: `magic-vet-v18`, deployment `dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB`. **v18 is spent; this run
  owes v19** (QZ-22) because it changes precached files.

## 3. The decisions

### T1 — the shelf banner gets its own class
`.hero-banner` must NOT change: `.chapter-banner` and `.celebrate-image` want its bottom fade. Add
a new class used only by the trophies screen, with **no bottom mask**, so the shelf's front edge
and its string of lights survive. Keep the same width, radius and shadow treatment as the other
banners so the screen still looks of a piece. The crop must be chosen so the shelf edge is visible
— the planner decides the exact aspect-ratio/object-position from the image, and **the composite
is judged by eye at the visual gate, not by a CSS assertion** (field guide 15c: image gated, CSS
gated, composite gated by nobody).

### T2 — the end-of-chapter quiz asks about THAT chapter's words
Owner's ruling. The chapter carries its own `glossary` of `{word, he}`. The quiz that follows a
chapter must draw from those words first, then top up from the existing global pool only if the
chapter cannot supply enough questions.

**Frozen constraints:** `public/quiz.js` and `public/quiz-core.js` are QZ-18 frozen and md5-pinned
— **do not touch them.** This is achievable without them: `reader.js` alone decides what `lemmas`
array it hands to `startQuiz`, so the change is to that array. A glossary word with no usable bank
item simply produces no question and the next word is tried — `startQuiz` already skips
unloadable lemmas, so the top-up keeps the quiz at four.

Ordering within the chapter's words must not be a fixed alphabetical or glossary order, or she
will get the same first four from the same chapter every time she re-opens it.

### T3 — the speaker button tells the truth, and the missing clips get made
Two halves, both required:
- **(a) honest affordance:** `canSay` must additionally require that a clip actually exists, so she
  never presses a button that does nothing. The audio manifest (`public/audio/words/index.json`,
  2254 entries, already imported by `api/profile.js`) is the source of truth for existence.
- **(b) coverage:** generate the missing clips with **`scripts/build-word-audio.js`, unchanged** —
  same model, same voice, same instructions — because 2254 existing clips came from that voice and
  a different engine would drop a stranger's voice into the middle of her story. Voice consistency
  here is what the frozen style suffix is for the artwork.
  `deep breath` is excluded: it contains a space and cannot be a lemma file.
  **OWNER GATE:** generation uses a PAID API, against the standing free-web-route preference. The
  owner must say yes before any clip is generated; the cost is a fraction of a cent for 17 words.
  He must also hear a sample before the batch is accepted (the GC-D8 habit, applied to audio).

### T4 — one deploy, one bump
All three changes ship together. `CACHE` `magic-vet-v18` → **`magic-vet-v19`**, and
`tests/shell.test.js`'s pin moves in the same step. The ship phase repeats the proven ritual: fresh
D25 capture, one deploy to a file, md5 live-vs-worktree over the changed payload, PRECACHE and
asset reachability, and a read-back that must show nothing lost.

## 4. Non-goals
No change to `public/quiz.js` or `public/quiz-core.js`. No change to `.hero-banner`,
`.chapter-banner` or `.celebrate-image`. No new Hebrew string (the speaker button's label already
exists). No re-recording of existing clips. No touching the trophies engine, the celebration, or
the awarding paths. Not R2 (the story reloading when she returns from the dictionary) — that is
riskier and belongs in its own run. No deploy until the visual gate and the audio gate have passed.

## 5. Risks
- **The quiz change is the one that can break her reading flow.** If the chapter's words yield too
  few questions the quiz must still work; if it yields none, the existing no-questions path must
  still fire without a done screen (QZ-18 behaviour) and must not celebrate.
- **A voice mismatch** if anything other than the existing script generates the clips.
- **The banner crop is a judgement**, not a check — it needs eyes.
