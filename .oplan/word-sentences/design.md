# design — word-sentences (R5 item 5: letting her WRITE SENTENCES)

**Run name:** word-sentences · **Opened:** 2026-08-11 · **Source request:** R5 item 5
(`.oplan/REQUESTS-FROM-THE-LEARNER.md:213`) — *"Later: writing sentences." Recorded, not scheduled.*

**PRIVACY, FIRST LINE, BECAUSE THIS FILE IS PUBLISHED.** `.oplan` is a public GitHub repo (the
incident of 2026-08-03). No word of her vocabulary, no sentence of her story, and no per-word score
appears anywhere in this file. Every measurement below is a **count or a shape**. One live profile
capture was taken under R-CAPTURE to write §2; its receipt is §2.4 and the file was deleted.

**STATUS: DESIGN + PHASE-1 PLAN ONLY. NOTHING IS BUILT AND NOTHING IS DECIDED THAT IS THE
OWNER'S TO DECIDE.** §9 is the blocker list and it is not decoration — three of those five
questions genuinely change what gets built.

---

## 1. What she asked for, and what she did not say

The whole of the request is five words: **"Later: writing sentences."** Four sibling items in the
same request (typing questions, autocomplete off, Hebrew→English, audio as one option among
several) shipped on 2026-08-03 as the **word-write** run. Item 5 has never had a design.

**Its under-specification is the central fact of this document, not a footnote.** "Writing
sentences" could mean at least four different features:

| reading | what she would do | can this project decide if it is right? |
|---|---|---|
| (a) **compose** freely — "write a sentence with the word *garden*" | types anything | **No.** Needs a language model in the grading loop. |
| (b) **translate** a sentence — Hebrew shown, she writes the English | types one sentence | Yes, **if** a target English sentence is stored beside the Hebrew. |
| (c) **assemble** a sentence — the words are given, she puts them in order | taps tiles | Yes, same condition as (b). |
| (d) **just write** — a box, no grading, someone reads it later | types anything | Nothing to decide; nothing is taught back to her either. |

Nothing she said picks one. What the four shipped siblings tell us is that she wanted to **produce**
rather than **recognise** — item 1 was "I want to have to write the word, not only pick it". On that
evidence (b) and (c) are closer to her intent than (d), and (a) is the purest form of it.

**This design proposes (c) now and (b) next, and puts (a) and (d) to the owner in §9.** It says
plainly what (c) does not deliver: she is not composing. She is being asked to produce correct
English word order for a meaning she is shown. That is a real and teachable skill — it is
Duolingo's single most-used exercise, which is also R6's "cheapest first" — but it is not
composition, and calling it "writing sentences" without that sentence would be a lie of the kind
this record exists to prevent.

---

## 2. What is TRUE TODAY — measured 2026-08-11, not recalled

Base commit **`8d2a772`**, tree clean. Every number below came from a command run today.

### 2.1 The tree

| fact | value | how it was measured |
|---|---|---|
| suite | **551 tests / 551 pass / 0 fail** | `node --test 2>&1 \| grep -E '^# (tests\|pass\|fail)'` |
| `public/quiz.js` | md5 `a5df4cfdb031b68a6aceaf8b8c2d9fe4`, CR=540 LF=540 (CRLF) | `md5sum`, `tr -dc '\r' \| wc -c` |
| `public/quiz-core.js` | md5 `04b61a2e7602e5cd8dc0dad3c7ad1e4a`, CR=263 LF=263 (CRLF) | same |
| `public/views/reader.js` | md5 `cda033cd74e967e1f7a1510beb48b139`, CR=1080 LF=1080 (CRLF) | same |
| `public/quiz-strings.js` | md5 `e50c944fa8ccb59c4894c7bcb8b63829`, **CR=0** (LF, R-W-8) | same |
| `public/sw.js` | `CACHE = "magic-vet-v25"`, pinned at `tests/shell.test.js:64` | read |
| non-ASCII bytes in `quiz.js` | **293** | byte scan; this is the "nobody typed Hebrew" gate |
| next free visual-gate origin | **port 3800** | `.oplan/word-write/phase-state.md:385` (R-F6-2) |

### 2.2 The quiz bank — the sentence material that already exists in the repo

| fact | value |
|---|---|
| bank files (`public/quiz/*.json`) | **78** |
| bank items | **103** |
| items whose `sentence` contains `___` | **103 / 103** |
| items with more than one blank | **0** |
| sentence length, words | min **7** · median **12** · max **14** |
| punctuation appearing in bank sentences | `.` `,` `?` only |
| item keys | `lemma, sense, sentence, answer, distractors` |

So the bank's "sentence with a blank" is real, uniform, and **too long for tiles** (median 12
words). It was built for the cloze-pick card and it is the wrong instrument here.

### 2.3 Her story — the sentence material that already exists in her profile

Measured from one R-CAPTURE capture, 2026-08-11. **Counts and shapes only.**

| fact | value | why it matters |
|---|---|---|
| word keys | **50** (16 known · 15 candidate · 19 learning) | the pool every existing question draws from |
| words carrying `he` | **49 / 50** · distinct `he` values **49** | one word now has NO Hebrew — on 2026-08-03 it was 46/46. WK-2's exclusion still costs nothing |
| her words with a bank file | **29 / 50**; known **16 / 16** | unchanged in shape from the last run |
| bank items reachable for her words | **34** | five of her words have more than one item |
| `skills.writing` | `state:"unknown", score:null, band:null` | **never written by anything, ever** — see 2.5 |
| chapters | **16** | each 56–115 words |
| glossary entries | **115** across 16 chapters · **66** distinct words · **115/115** carry `he` · 1 multi-word | word-level Hebrew is abundant |
| comprehension questions | **40** (2–3 per chapter), each with a Hebrew prompt, 4 Hebrew options, and an `evidence` sentence | **40/40 evidence strings appear VERBATIM in the chapter text** |
| **sentences in her chapter prose** | **258** | this is the material |
| sentence length, words | min 1 · p25 **4** · median **5** · p75 **7** · max 14 | far shorter than the bank's |
| sentences ≤ 8 words | **233 / 258** | tile-sized by construction |
| sentences containing a comma | 40 · a double quote | 22 · an apostrophe 39 · a digit **0** · a semicolon **0** |
| **"plain"** (letters + spaces + one terminal `.?!` only) | **133 / 258** | the safe subset for a word-order task |
| **plain AND 3–8 words** | **114** | the candidate pool |
| of those, containing a word she has (any status) | **66** | so two thirds can be anchored to her vocabulary |
| of those, containing a **known** word | **12** | anchoring to *known* words alone would starve it |
| of the 114, containing a repeated token | **4** | matters only if we compared tiles instead of the joined string — we do not (§4.2) |
| of the 114, with a capitalised token after position 0 | **0** | no proper noun ever lands mid-sentence in the safe subset |
| **per chapter**, usable plain 3–8-word sentences containing a word she has | min **2** · median **4** · max **8** · **chapters with zero: 0 of 16** | *every* chapter she has ever read could supply this question |

### 2.4 Capture receipt (D27 / R-CAPTURE)

```
path (outside the repo): /c/Users/dkreinov/english-app-backups/profile-20260811-<hhmmss>.json
bytes: 40063 · sha256: d13cb59fe72db4466bc4a4b758b86b7cb93e8c83f4e26d4e2cff92712f5829d9
authority: R-CAPTURE (owner, 2026-08-02, standing). Frozen subshell form,
           .oplan/word-quiz/plan.md:1573-1586. HTTP 200. APP_CODE proved not leaked.
DELETED immediately after measurement; verified absent; the backups directory is empty.
Everything derived from it appears in this file as a COUNT or a SHAPE.
```

### 2.5 Five facts that decide the design, each of which surprised me

1. **There is no Hebrew translation of any English SENTENCE anywhere in this project.** Not in
   `data/band1.json` / `band2.json` (word lists), not in `data/placement-items.json` (task1 is 12
   word items with `he`; task2 is 2 reading passages with Hebrew *questions*), not in the quiz bank
   (`sense` is English), not in the chapter object (`glossary` is `{word, he}` — word level).
   The chapter's comprehension `questions` carry Hebrew, but they are *questions about* the text,
   not translations *of* a sentence. **Hebrew-to-English at the sentence level does not exist and
   cannot be assembled from what we hold.** This single fact is why §3 goes where it goes.
2. **The chapter text is on screen while the chapter-end quiz runs.** `renderChapter()`
   (`reader.js:825-839`) emits the full `.reader-text` and then the `.reader-quiz-slot` *below it*.
   Anything the quiz asks that is quoted from the chapter she is reading is **visible on the same
   page**. A "rebuild the sentence from the story" question sourced from the current chapter is
   therefore a **copying exercise**, mechanically, not a memory or grammar exercise.
3. **The quiz already does not work offline. At all.** `public/sw.js` has **no runtime caching** —
   no `cache.put` anywhere; only the 17 `PRECACHE` entries are ever stored, and the fetch handler
   is `caches.match(req) || fetch(req)`. `/api/*` is passed straight to the network by an explicit
   branch, and **`/quiz/<lemma>.json` is not precached**, so every quiz item is a live network
   fetch. `reader.js boot()` fetches `/api/profile` and lands on the error stage when it fails.
   So "does this feature work offline?" has a pre-existing answer for the whole quiz: **no**. This
   run must not pretend to solve that, and must not make it worse.
4. **Nothing has ever written `skills.writing`.** Grepped across `api/`, `lib/`, `public/`,
   `scripts/`: the only skill writes in the codebase are `api/placement.js:54` and `:67`
   (`receptiveVocab`, `readingComprehension`). Three of the five skills — `writing`,
   `grammarInContext`, `pronunciation` — have been `unknown` since the schema was written.
5. **`osaDistance` already works on arrays, unchanged.** The Damerau/OSA helper at
   `quiz-core.js:153-174` uses only `.length`, `[i]` and `===`. Executed today against token
   arrays: identical → 0, one adjacent swap → **1**, one word moved to the end → 2, two swaps → 4.
   So the near-miss rule R-W-1 froze for *letters* lifts to *words* with **zero change to any
   existing line** — see §5.3.

---

## 3. THE CENTRAL TENSION: where is the LLM boundary actually drawn?

Owner decision **D7** (`.oplan/word-quiz/design.md:36`) is standing, and R-W-6 restated it during
the run that just shipped. Verbatim, D7 is one row of the word-quiz run's *fourteen locked
decisions*, and its two columns read:

> **Decision:** Generated by **Claude via oplan workers**, cheap tier — no paid API, no runtime LLM,
> no second key.
> **Reason:** DeepSeek V4 Flash and Kimi K2.5/K2.6 were priced and set aside; at ~5k items the price
> difference is cents and **the runtime dependency is the real cost**.

And R-W-6: *"NO PAID API, NO RUNTIME LLM (owner decision D7 honoured). Every Hebrew word comes from
`entry.he`, already stored. **Grading is local string comparison.** This run spends nothing."*

**Yet the app calls a model at runtime in two places, and I went and read them rather than assuming:**

- `api/chapter.js:52` → `generateChapter({ chat: chatJSON })`. One call per chapter, plus — and
  this matters — **`lib/story.js:264` makes an ADDITIONAL `chat` call per missing glossary word**
  inside the repair path, whose failure is swallowed (`// skip this word`). So more than one
  runtime model call per chapter is already normal, already shipped, already tested.
- `api/translate.js:32` → one call per word she tapped that we have no translation for. This is
  R7's "translate in real time", explicitly asked for by the owner and shipped.
- Both go through `lib/openai.js`: **one** key (`OPENAI_API_KEY`), **one** model (`gpt-4.1-mini`),
  **one** wrapper (`chatJSON`), with an injectable transport so tests never touch the network.

**So D7 is not "never call a model". Read against the code, the line it actually draws is:**

> A model may be called **once per thing she asks the app to make** — a chapter, a translation of a
> word she tapped. A model is **never** called inside the loop that decides whether her answer was
> right. Every question this app has ever asked is decided from bytes already on the device or in
> the repo, with `===`.

Three independent things sit on that line and all three point the same way. **(i) Cost shape:** a
generation call is bounded by content she creates (16 chapters in ~3 weeks); a grading call is
bounded by how much she practises, which is the thing we are trying to increase. **(ii) Failure
shape:** a generation failure is already visible and actionable — she presses the button again
(`genError`, `reader.js:851`). A grading failure leaves her staring at a sentence she wrote with no
verdict, and **R-F6-3 forbids showing her an error about a network write she cannot act on**.
**(iii) Trust shape:** a wrong LLM verdict does not just annoy her — `applyQuizAnswer` writes a
strike, and per R3 a strike sorts **first and unconditionally** in `pickQuizWords`, so one bad
verdict pins a word she knows to the front of every future quiz until she "fixes" it.

### 3.1 The decision this design takes

**A shape that needs NO grading model at all.** Correctness is `===` on a string, decided on her
phone, offline-capable in the sense that everything around it is.

But the *material* — a Hebrew meaning paired with a specific English sentence — does not exist and
cannot be derived (§2.5.1). It has to be **generated**, and the only generator this project has is
the model it already calls once per chapter. So:

> **The sentences are produced at chapter-generation time, by the call that already runs, and
> stored in the chapter beside `glossary` and `questions`. The question is graded locally, with
> `===`, for the rest of that chapter's life.**

That is not a loophole in D7; it is the exact side of D7's line that `glossary` and `questions`
already sit on. `questions[].evidence` — a verbatim English sentence, produced by the model at
generation time and used afterwards as ground truth — is the **precedent**, already shipped,
already validated (`story.js:160` asserts it appears verbatim in the text).

**Cost of the recommended route, stated plainly:** if the sentences are added to the existing
chapter prompt's JSON schema, this run costs **zero additional API calls, zero additional keys, and
a handful of output tokens per chapter**. It does not spend anything per answer, per sitting, or per
day. §9 B-2 puts the alternative (a second, isolated call per chapter) to the owner with its cost.

### 3.2 What I rejected, and why

- **Grade free text with an LLM (reading (a)).** Rejected for this run and escalated as B-1.
  It crosses D7's real line at exactly the point the line exists to protect: a paid, networked,
  non-deterministic verdict inside the loop that writes to her durable profile. It also cannot be
  tested — there is no fixture that proves a grader is fair, only samples of its behaviour.
- **A place to write with no grading (reading (d)).** Not rejected; **escalated as B-4**, because
  it is cheap, honest, and its value is entirely a question about *the owner*, not about code: it
  teaches only if a human reads what she writes and answers her.
- **Tiles built from the CURRENT chapter with no Hebrew prompt.** Rejected by measurement §2.5.2:
  the chapter text is on the same page, so it is a transcription exercise. And with no prompt
  identifying the target, a set of tiles has many valid orderings, which is the unfairness this
  project has shipped twice already.
- **Tiles built from an EARLIER chapter with no Hebrew prompt.** Same ambiguity without the
  copying: "put these six words in order" has no single right answer, and we would be marking her
  wrong for producing correct English. Rejected outright.
- **Speak the sentence and have her rebuild what she heard.** Measured before rejecting: the audio
  manifest holds 2266 clips and covers **93.0%** of the tokens in the bank's sentences, but only
  **43 of 103** sentences are *fully* covered — so the prompt would be unbuildable for more than
  half. And concatenated single-word clips are not a spoken sentence; they would teach wrong
  rhythm to a child whose stated goal is reading and hearing English.
- **Tiles from the bank's cloze sentences** (fill the blank, then scramble). Buildable, and it
  needs nothing new — but median 12 words is roughly twice the tile count a beginner can hold, and
  only 29 of her 50 words have a bank file at all. Kept in reserve; see §7 phase 2 fallback.

---

## 4. THE QUESTION, CONCRETELY

### 4.1 What she sees — the card, in the terms `renderQuizCard` uses today

A new `kind: 'sentence-build'`, appended as **the last card of a chapter-end sitting**, after the
four word questions. In the shape of the existing branches at `quiz.js:281-339`:

```
${progressHtml}                    <p class="quiz-progress">  — unchanged, "question 5 of 5"
<p class="quiz-prompt">            — NEW Hebrew string: "build this sentence in English"
<p class="quiz-he" dir="rtl" lang="he">   — THE HEBREW SENTENCE. Existing class, existing direction.
<div class="quiz-built" dir="ltr">        — NEW. The tiles she has placed, left to right, in order.
                                            Empty at the start. Tapping a placed tile returns it.
<div class="quiz-tiles" dir="ltr">        — NEW. The remaining tiles, shuffled. Tapping one places it.
${checkHtml}                        — the EXISTING check button, QUIZ_STRINGS.check_button
${nearMissHtml}                     — the EXISTING near-miss line, QUIZ_STRINGS.near_miss
${feedbackHtml}                     — the EXISTING praise line on correct
${revealHtml}                       — NEW Hebrew label "the story said:" + the sentence, on wrong
${nextHtml}                         — the EXISTING next button
```

Two new Hebrew strings, three new CSS classes, no new interaction vocabulary: every control is a
`<button>` with a `data-` attribute, bound in `bind()` exactly like `[data-choice]` is today.

**What happens when she is wrong.** Nothing durable (§4.4). She is shown the sentence the story
actually used, under a label that says so, and the next button. A **token-level near-miss** — one
adjacent pair swapped — gets **one free retry with her tiles kept**, which is R-W-1's rule lifted
one level up and is a shape she has already met in the typing questions.

### 4.2 What counts as correct — mechanically

The tiles are **exactly the target sentence's whitespace-delimited tokens, and nothing else**. No
distractor tiles, no extra words, no missing words. Then:

```
placed.join(' ').trim().toLowerCase()  ===  target.tokens.join(' ').trim().toLowerCase()
```

Frozen consequences of comparing the **joined string** rather than tile identity:
- Two identical tiles are automatically fair. Swapping the two `the`s produces the same string
  (measured: 4 of the 114 candidate sentences contain a repeated token; under a tile-identity
  comparison every one of them would be a coin flip).
- Capitalisation cannot fail her — the tiles carry their own capitals and she never types.
- Punctuation cannot fail her — the terminal `.?!` rides on the last tile, and the candidate filter
  admits no other punctuation (§4.3).

**An incomplete assembly is a NO-OP**, exactly as an empty typed box is under R-W-13: nothing is
graded, nothing is posted, no retry is consumed, the card does not change. R-W-13's reasoning
transfers verbatim — a mis-tap must never be scored as an answer.

### 4.3 Where the material comes from

A new **optional** field on the chapter object:

```
chapter.sentences: [ { en: "<a sentence copied verbatim from chapter.text>", he: "<its Hebrew>" } ]
```

Sitting beside `glossary` and `questions`, produced by the same generation request (§3.1),
validated on arrival and **never repaired**. An entry is usable only if all of:

| rule | value | why |
|---|---|---|
| `en` appears **verbatim** in `chapter.text` | exact `includes` | the `evidence` precedent, `story.js:160`. It guarantees she has *read* the sentence |
| token count | **3 to 8** | measured: 114 of her 258 chapter sentences are already in this window, ≥2 per chapter |
| shape | matches `^[A-Za-z ]+[.?!]$` | no comma, quote, apostrophe, semicolon or digit — the comma is where alternative word orders live |
| `he` | non-empty and contains U+0590–U+05FF | `HEBREW_RE`, `story.js:70`, already used for question prompts |

**Absent, empty or wholly invalid ⇒ the field is simply not there, and the card is not buildable.**
The chapter still generates. This is WK-1's rule (*a kind is never faked and a prompt is never
blank*) and R7's rule (*degrade honestly*) applied to a field that did not exist yesterday.

**THE COST OF THIS, STATED UP FRONT: her 16 existing chapters carry no `sentences` field, so she
will not see this card until she generates her next chapter.** There is no backfill, because a
backfill means walking 16 chapters through the model — a batch job nobody has asked for. If the
owner wants her to see it immediately, that is B-5.

### 4.4 Does it score into her profile? — **No, and that is the point**

The `sentence-build` card **posts nothing**. No `quiz-answer`, no strike, no `quizRight`, no
`lastQuizAt`, no trophy movement, no `skills.writing`. It carries `lemma: null`.

**This is not laziness, it is the answer to §8's unfairness question.** I cannot prove that a
different, valid ordering is never marked wrong (§8). Since I cannot make the verdict always fair,
I make being marked wrong **cost nothing that survives the sitting**. She sees the story's sentence,
she reads it, she goes on.

Two consequences, stated so neither is a surprise:
- It **does** count on the score line at the end of the sitting (`renderQuizDone`, "N out of 5"),
  because that number is a per-sitting display value with a single source, and a fifth card that
  vanished from the count would be the "two values, one card" seam of field guide 15(b).
- `skills.writing` **stays `unknown`**, truthfully. It has been unknown since the schema was
  written, and filling it with a word-order ratio would make it *wrong* rather than *unmeasured*.
  If the owner wants a number there, B-3 says exactly what it would have to mean.

### 4.5 Where it appears — chapter end only, by construction

`startQuiz` gains one new option, `sentences` (default `null`). `reader.js:1052` passes the current
chapter's validated sentences; `words.js:261` **is not changed at all** and therefore passes none,
so the card is never buildable there. That is honest degradation achieved by the absence of data
rather than by a feature flag — the same trick WK-1 uses.

Why not the words screen: the Hebrew prompt is the *meaning of a sentence from the chapter she just
read*. Fifteen chapters later, out of context, it is a bare word-order puzzle. R5's own item 3
records her reason for wanting Hebrew→English at all: *"this teaches the word AND reading
comprehension"*. Comprehension needs the context to still be warm.

### 4.6 Offline, and what she sees when it fails

- **Offline.** This card adds **no new network dependency**. Its sentences travel inside the
  chapter, inside the profile object the reader is already holding in memory when the quiz runs.
  It is strictly *less* network-dependent than the existing `cloze-pick` card, which fetches
  `/quiz/<lemma>.json` live on every question. And per §2.5.3, the whole quiz is already offline-
  dead. **This run neither fixes that nor worsens it, and must not claim to.**
- **Generation failed / the model returned nothing usable.** The card does not appear. She sees a
  sitting of four, exactly as today. **Nothing is shown to her**, on the R-F6-3 principle: an
  eleven-year-old is never shown an error about a machine failure she cannot act on. Note this is
  *not* the FC-5 "coming soon" case — FC-5 shows a crossed-out speaker because she can *see* that a
  word exists and wants its sound. Here there is no visible absence: a card she has never been
  promised cannot be perceived as missing. **R7 is the owner's rule, so B-5 puts the option of a
  visible placeholder to him rather than deciding it here.**
- **A tile tap when the profile write fails.** Cannot happen. There is no write.

---

## 5. The frozen contracts this run proposes

| id | contract |
|---|---|
| **WS-1** | **The sentence card is the LAST card of a chapter-end sitting, appended after the `count` word questions — it is NOT a fifth kind in the WK-1 rotation.** `QUESTION_KINDS`, `chooseKind` and `buildQuestion` are untouched, so R-W-2's guarantee that audio is *exactly one question in four* survives intact. The sitting becomes "four words, then one sentence", and `total` becomes 5. |
| **WS-2** | **Tiles are exactly the target's tokens — no distractors, no omissions.** Correctness is equality of `tokens.join(' ')` after `trim().toLowerCase()`, never tile identity. This makes repeated tokens, capitals and terminal punctuation fair by construction rather than by review. |
| **WS-3** | **An incomplete assembly is a NO-OP** — nothing graded, nothing posted, no retry consumed, no visible change. R-W-13, verbatim, one level up. |
| **WS-4** | **One free retry on a TOKEN-level near-miss**, her placed tiles kept: OSA distance **exactly 1** over the token array (one adjacent transposition, or one insertion/deletion which the fixed tile set makes impossible). Any other wrong assembly resolves immediately. R-W-1 lifted from letters to words, using the **existing** `osaDistance` helper unchanged (§2.5.5). |
| **WS-5** | **The card writes NOTHING durable.** No `quiz-answer`, no strike, no counter, no skill, `lemma: null`. It counts only on the end-of-sitting score line. |
| **WS-6** | **A sentence entry is used only if it passes every rule in §4.3, and is DROPPED otherwise. It is never repaired and it never fails a chapter.** A chapter must never fail to generate because a bonus field was malformed. |
| **WS-7** | **The new Hebrew strings are minted ONCE, into an md5-pinned fenced block in this file, and extracted by script** — the WK-6/FC-5 precedent. `scripts/extract-quiz-strings.mjs` gains a SECOND pinned source; **the word-write block's md5 `ad6885fa…` / 225 bytes is NOT touched**, so its pin keeps holding. See §6 — the block is deliberately absent from this document and phase 1 mints it. |
| **WS-8** | **`public/quiz.js` and `public/quiz-core.js` are CRLF; the gate is `CR == LF` and `CR >= ` the recorded baseline (540 / 263), NEVER a fixed count.** `public/quiz-strings.js` is **LF, gate `CR == 0`** (R-W-8). |

---

## 6. The new Hebrew — and why this document does not contain it

Two new strings are needed. Named here by **key and English meaning only**:

| key | what it must say (in Hebrew) |
|---|---|
| `sentence_prompt` | *"build this sentence in English"* — the instruction line above the Hebrew sentence |
| `sentence_reveal` | *"the story said:"* — the label above the correct sentence, shown after a wrong answer |

Everything else is **reused verbatim** from the shipped card: `check_button`, `near_miss`, the
praise line, the next button, the progress line.

**THIS DESIGN DELIBERATELY DOES NOT CONTAIN THE HEBREW BLOCK, and that is a finding, not an
omission.** Field guide 8 forbids retyping Hebrew and forbids copying it out of terminal output;
field guide 34 requires code points to cross any boundary as decimal numbers. A planner writing
this file cannot legally produce those glyphs. **And the record does not say how the word-write
run's five strings were originally minted** — `phase-state.md` and `journal.md` both record only
the resulting md5 (`ad6885fa…`, 225 bytes, "verified by codepoint dump"), never where the
characters came from. That is RECORD GAP **G-A** below.

So phase 1 has an explicit step whose whole job is to **mint the block**: construct the two strings
from decimal code points inside a written file, dump the code points back out of the written bytes
to verify, compute the md5, append the fenced ```hebrew-strings-2 block to THIS file, and record
the digest in `phase-state.md` in the same step. Until that step runs, §6 is a specification, not a
string.

---

## 7. What "done" means

The mechanical acceptance criteria live in `plan.md`, per phase. The design-level bar:

1. At the end of a chapter she is asked **four word questions and then one sentence card**, and
   the four word questions are byte-for-byte the experience that shipped on 2026-08-03.
2. Tapping tiles into the right order is scored **correct**; one adjacent swap gives her **one
   free retry with her tiles where she left them**; any other wrong order shows her the story's
   sentence and moves on.
3. **No sentence answer, right or wrong, changes a single byte of `profile.words`.** Asserted at
   the seam — by byte-comparing the profile before and after a whole simulated sitting — not by
   reading the source for the absence of a `post(` call.
4. A chapter with no `sentences` field, or with only invalid ones, produces a sitting of exactly
   four questions and **no visible difference from today**.
5. A malformed `sentences` field can never prevent a chapter from being generated.
6. Nothing about `cloze-pick`, `he-pick`, `he-type` or `listen-type` changes — same rotation, same
   text-node order, same scoring, same posts.
7. Both precached quiz files ship a `CACHE` bump (`magic-vet-v25` → `v26`) in the same commit as
   the first reachable change, with `tests/shell.test.js:64` moved in that same commit and the
   half-applied bump **seen to fail first** (QZ-22).
8. A self-served visual gate on **port 3800** shows the card at 390×844 **and OPERATES IT** — taps
   real tiles, submits a wrong order, sees the retry, corrects it, sees the praise (field guide 35:
   a gate that does not press the button has not tested the button).

---

## 8. How a wrong answer would be UNFAIR — the mechanism, named

This project has twice shipped a question that marked her wrong for a right answer
(`light`/`computer`, and the `he-pick` sameness trap WK-2 was built to prevent). With word order,
**the risk is real and I cannot design it away.**

**The mechanism:** the tiles admit `n!` orderings; the target is one of them; more than one may be
correct English. *"Then Pip ran home"* and *"Pip ran home then"* can both be acceptable, and the
stored target is only one. Nothing mechanical can tell that the other is also right — that is
exactly F3-2's finding (i) in a new place: **a shape gate cannot see correctness.**

**What reduces it, by construction and measured:**
- The `^[A-Za-z ]+[.?!]$` filter removes every sentence with a comma (40 of 258) or a quotation
  (22) — commas are where fronted adverbials and appositives live, which is where alternative
  orders come from.
- The 3–8 token window keeps the ordering space small: at the measured median of 5 tokens, a simple
  SVO English sentence has essentially one grammatical order.
- The chapter prompt already forbids contractions and demands "simple, short sentences"
  (`story.js:183-187`), so the source material is skewed toward exactly the sentences with one
  legal order.
- No distractor tiles: she is never asked to *choose* words, only to *order* the given ones.

**What I cannot do:** prove the residual is zero, or even bound it, without a human reading the
sentences — and the sentences are generated fresh for every chapter, so **no human can pre-vet
them**. This is a genuine difference from the quiz bank, where 84 items were read by hand (F3-2).

**So the design pays for the residual instead of denying it: WS-5.** A wrong verdict costs her
nothing that survives the sitting — no strike, no counter, no pinned word, no skill number. She
sees how the story said it, and goes on. If the owner wants this scored, B-3 is where that trade
gets made, and it should be made knowing that a strike is the most expensive thing this app can
spend on a wrong answer (R3: strikes sort first, unconditionally, forever).

---

## 9. BLOCKERS — decisions that are the OWNER's, with what each costs

**B-1 · Which reading of "writing sentences" ships?** — *the big one.*
- **(c) assemble from tiles** *(this design's recommendation)*: zero grading model, verdict is
  `===`, she cannot misspell so the only failure mode is order. **Cost:** it is not writing. She
  produces no characters.
- **(b) type the English sentence from the Hebrew**: the same stored material, the same local
  grading, genuinely writing. **Cost:** unfairness explodes — every synonym, every contraction,
  every capital and every comma becomes a wrong answer against a single stored string, and the
  near-miss rule cannot absorb a whole different-but-correct sentence. Best shipped *after* (c),
  reusing the same material.
- **(a) free composition, LLM-graded**: what she probably imagines. **Cost:** a paid, networked,
  non-deterministic verdict inside the answer loop; crosses D7's real line (§3); no fixture can
  prove it fair; and its failure mode is the one R-F6-3 forbids showing her.
- **(d) a box she writes in, nothing graded**: cheapest of all. **Cost:** teaches nothing unless a
  human reads it and replies — see B-4.

**B-2 · How are the sentences generated?**
- **(A) extend the existing chapter prompt's JSON schema** *(recommended)*: **0** extra calls, **0**
  extra latency, a handful of output tokens. **Cost:** the story prompt changes, and the story is
  her core experience. Risk is small but not zero and cannot be measured without generating.
- **(B) a second `chatJSON` call inside `api/chapter.js`**, given the finished chapter text: the
  story prompt is untouched, so the story cannot regress. **Precedent exists** — `story.js:264`
  already makes extra per-word calls in the repair path. **Cost:** one more call per chapter
  (cents per month at `gpt-4.1-mini`) and **~2–4 s added to a wait she has already complained
  about** (R4: *"generating a new story takes time, so she often does not want to do it"*).
- **(C) no model at all**, using bank cloze sentences with no Hebrew: free, but §3.2 shows it has
  no fair prompt and the sentences are twice too long.

**B-3 · Does a sentence answer score anything?** This design says **no** (WS-5).
- **no scoring** *(recommended)*: a possibly-unfair verdict costs nothing durable.
- **strike the anchor word**: consistent with every other question — and it means a muddled word
  order pins a word she *knows* to the front of every quiz (R3). Strongly advised against.
- **write `skills.writing`**: the only honest number available is *"share of sentence cards ordered
  correctly on the first try, over the last N"*, `state: "estimated"`, `score` in [0,1] — and it
  would be measuring **word order**, not writing. It would also be the first thing outside
  `api/placement.js` ever to write a skill, and needs a new POST action.

**B-4 · Should she also get an ungraded place to write?** A box, one sentence, saved to her
profile, shown in the parent view. **Cost:** it teaches only if the owner actually reads it and
answers her; it puts her free text in the durable profile (fine — but it must **never** reach
`.oplan`); and it is a second feature, not a variant of the first.

**B-5 · Two small honesty calls that are R7's, and R7 is his rule.**
- Chapters generated before this run carry no sentences. **Backfill them through the model, or let
  the card simply start appearing with her next chapter?** (This design: no backfill.)
- When no sentence is available, **show nothing, or show a visible "coming soon" placeholder** as
  FC-5 does for a missing audio clip? (This design: show nothing, because she has never been shown
  the card and therefore cannot perceive its absence — but FC-5 is the standing precedent and this
  is the owner's call.)

---

## 10. RECORD GAPS

- **G-A · How the word-write Hebrew block was originally minted is not recorded anywhere.**
  `phase-state.md` (WK-6) and `journal.md:33` both record only the resulting md5 and byte length.
  Field guide 8 forbids typing or copying Hebrew, so *something* must have produced those glyphs,
  and no file says what. This run has to invent the procedure again (§6). It belongs in
  `.oplan/word-write/field-guide/index.md` as a lesson, not in a run journal.
- **G-B · `.oplan/word-write/check-frozen-card.mjs` and `cloze-card-frozen.txt` are NOT wired into
  anything.** Grepped `tests/`, `scripts/` and `package.json`: no reference. The byte-exact freeze
  of the `cloze-pick` card was a *step-scoped* gate that expired when the step closed, and the
  record does not say so. Criterion 6 of §7 must therefore re-freeze the card itself; it cannot
  lean on an existing gate.
- **G-C · Nothing records that the quiz has never worked offline.** `sw.js` has no runtime caching
  and `/quiz/*.json` is not precached, so every question is a live fetch — yet "offline" is
  discussed in several run records as though the quiz degrades gracefully. Measured in §2.5.3 and
  written here because the next planner will otherwise design against a PWA that does not exist.
- **G-D · The `sentences` field has no schema owner.** `validateProfile` (`lib/profile.js:192`)
  checks `story.chapters` only for *being an array*; per-chapter structure is validated at
  generation time by `verifyChapter` and never again. So a chapter field added today is validated
  once, on arrival, and trusted forever after — including across a restore from any backup.
- **G-E · No record states what `skills.writing` was ever supposed to mean.** It has existed in the
  schema since `defaultProfile` was written and no design defines its scale, its band mapping, or
  what would move it. B-3 cannot be answered well until somebody writes that down.

---

## 11. The traps this run walks into — named so no step rediscovers them

- **The chapter text is on screen during the quiz** (§2.5.2). Any question quoting the current
  chapter is copyable. This design survives it only because the prompt is Hebrew.
- **Line endings.** `quiz.js` CRLF (540), `quiz-core.js` CRLF (263), `reader.js` CRLF (1080),
  `quiz-strings.js` LF (0). Gate `CR == LF` (or `CR == 0`), never a fixed count; measure with
  `tr -dc '\r' < f | wc -c`, **never grep** (field guide 16, and I-1/I-3 of the last run).
- **Precache.** `quiz.js`, `quiz-core.js`, `quiz-strings.js`, `views/reader.js` are all in
  `PRECACHE` (`sw.js:8-25`). QZ-22: the `CACHE` bump ships in the same commit as the first
  reachable change, with `tests/shell.test.js:64` moved in that commit and the half-applied bump
  seen to fail first. R-W-7's deferral is available for engine-only phases, and if used, its
  boundary check is **mandatory at the deploy pre-flight**.
- **The existing precache seam test** (`tests/music.test.js:163`): *every module a precached file
  imports must itself be precached*. It will go red the instant a precached file imports something
  new — by design. If a new module is introduced, its `PRECACHE` entry moves into the same step.
- **`git diff --numstat` cannot tell an append from a mid-file insertion** (field guide 32, and
  criterion 6 of the last run's phase 1). Use `.oplan/word-write/subsequence-check.mjs`, which
  already exists and is reusable.
- **A frozen validation can itself be the bug** (field guide 31). The last run shipped three:
  `node --test tests/` (impossible on Node v22 — use the **bare** form), a `CR == 99` pin on a
  99-line file, and a hardcoded observation counter. **Every frozen command in `plan.md` is
  dry-run against the real tree before dispatch.**
- **Shape gates are blind to correctness** (F3-2 (i)). Nothing mechanical can see that a different
  word order is also right. WS-5 pays for that instead of pretending to fix it.
- **A visual gate that does not press the button has not tested the button** (field guide 35). The
  tiles are the control she operates; the gate taps them.
- **Visual-gate origins.** Spent: `localhost:3000`, `127.0.0.1:3000`, 3100, 3200, 3300, 3400, 3500,
  3600, 3700. **Next free: 3800**, and a gate that finds a defect costs at least two.
- **The contrast gate is a hand-maintained `PAIRS` list in `scripts/check-contrast.mjs` against
  `public/styles.css`** — it does **not** read `quiz.js`'s `VIEW_STYLE`. So new tile CSS does not
  move the 58-line pin (`tests/quiz-ui.test.js:501`) **unless** a new colour pair is introduced;
  reuse `--color-ink` on `--color-surface-2`, which is already covered. The separate rule that
  *does* apply: `VIEW_STYLE` may contain no raw hex and no `color-mix()`.
- **`.oplan` is published.** Counts and shapes only, always. No sentence of her story, ever.
