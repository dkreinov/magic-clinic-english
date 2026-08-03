# design — word-write (R5: quizzes where she WRITES the word)

**Run name:** word-write · **Opened:** 2026-08-03 · **Source request:** R5
(`.oplan/REQUESTS-FROM-THE-LEARNER.md:177`), plus R3(a) folded in by owner decision.

**PRIVACY, FIRST LINE, BECAUSE THIS FILE IS PUBLISHED.** `.oplan` is a public GitHub repo
(incident of 2026-08-03). No word of her vocabulary appears anywhere in this run's record.
Counts only. Every measurement below is a count or a shape.

---

## 1. What she asked for

Verbatim from R5, five items:

1. **Typing questions** — she wants to have to write the word, not only pick it.
2. **Turn off the keyboard's autocomplete/autocorrect** for those fields — "like a password" —
   or the phone writes the answer for her and she learns nothing.
3. **Hebrew → English direction.** Show the Hebrew, she picks the English *or hears it*, and then
   she has to write it. Her reason: this teaches the word AND reading comprehension.
4. **Listening to words all the time gets annoying** — audio should be one option among several,
   not the only way a question is asked.
5. **Later: writing sentences.** Recorded, NOT in this run.

Item 5 is explicitly out of scope. Items 1–4 are the whole of this run, plus R3(a).

---

## 2. What is true today, measured (not recalled)

Measured 2026-08-03 against a live capture taken under R-CAPTURE, then deleted; receipt at
`.oplan/word-write/capture-receipt.txt`.

| fact | value | why it matters |
|---|---|---|
| her word keys | 46 (16 known · 12 candidate · 18 learning) | the pool every question is drawn from |
| words carrying a Hebrew translation (`entry.he`) | **46 / 46** | Hebrew→English is buildable today for every word, with no new content and no API call |
| **distinct** `he` values among those 46 | **46 / 46 — zero collisions** | measured at the plan-review gate, because WK-2's whole design rests on it. Surviving distractor candidates per word: **45 of 45**, against the 3 that are needed. **`he-pick` is unbuildable for 0 of her 46 words today**, so WK-2's exclusion is free insurance for when her vocabulary grows into a collision, not a live constraint |
| words with a reachable audio clip (direct or via `resolveLemma`) | **46 / 46** | listen-and-type is buildable today for every word |
| words with a written quiz item | 29 / 46 (known **16/16**) | the sentence-cloze kind still has material |
| known lemma length | min 3 · max 6 · avg 4.4 · all pure `[a-z]` | typing is a reasonable ask at this length; no punctuation to grade |
| `skills.writing` | `state: "unknown", score: null` | R5 is the one skill the app has never measured |
| baseline suite | 433 reported / 428 flat / 0 fail, tree clean | the number every phase moves from |

**The two measurement bugs I made getting these numbers are recorded in the receipt**, because
both produced a confident wrong figure: `/api/profile` returns `{ok,data}` and I read the top
level (reported "0 known words" from a 30 KB file); and `public/audio/words/index.json` is an
**array**, so `Object.keys()` gave me indices and I reported "0 of her words have audio" when the
answer is all of them. Field guide 2, in its plainest form: I verified against my own assumption
about a shape instead of reading the shape.

### 2.1 The machinery that exists

- `public/quiz.js` — the screen, the session, the answer. ONE question kind: a sentence with a
  blank, answered by tapping one of six buttons. Renders, binds, posts `quiz-answer`, re-renders.
- `public/quiz-core.js` — pure: `selectOptions`, `pickItem`, `isUsableItem`, `pickQuizWords`,
  `pickCandidateWords`, `knownSetFromProfile`, `newSessionId`.
- Two call sites: `public/views/reader.js:1052` (chapter end) and `public/views/words.js:261`
  (practice from the words screen). Both pass `{lemmas, knownSet, candidateSet, count}`.
- `chapterQuizLemmas` (`reader.js:499`) **drops any glossary word that is not already a key in
  `profile.words`** — so every lemma that reaches `startQuiz` has a profile entry. This is a real
  guarantee and the design leans on it.
- Bank item shape: `{lemma, sense, sentence, answer, distractors[≥5]}`. `sense` is ENGLISH.
  **There is no Hebrew anywhere in the bank.** Every Hebrew word in this feature comes from her
  own profile at runtime.

### 2.2 The constraint that has to move

`FC-1` freezes `public/quiz.js` at md5 `69b6d711…` and `public/quiz-core.js` at `9a2131be…` —
"QZ-18, NEVER touched, not even whitespace". **There is no way to add a question kind without
changing both.** See ruling R-W-4 in §7: the freeze is lifted deliberately and re-expressed,
because it pins a *spelling*, not a property (field guide 22).

---

## 3. The four question kinds

Owner decision (§7 R-W-2): a **fixed rotation**, so variety is guaranteed inside every single
sitting and audio can never be more than one question in four.

| # | kind | prompt she sees | how she answers |
|---|---|---|---|
| 1 | `cloze-pick` | the sentence with a blank (today's question, unchanged) | taps one of the options |
| 2 | `he-pick` | her stored Hebrew word | taps one of the English options |
| 3 | `he-type` | her stored Hebrew word | **types the English word** |
| 4 | `listen-type` | a speaker button, no text | **types the English word** |

Rotation is by **position in the sitting**, not by word: question 1 is kind 1, question 2 is
kind 2, and so on, wrapping if a sitting is longer than four.

### 3.1 Buildability, and why the rotation is a PREFERENCE and not a rule

A kind can be impossible for a given word:

| kind | needs | can fail because |
|---|---|---|
| `cloze-pick` | a bank item | 17 of her 46 words have none |
| `he-pick` | `entry.he` + ≥3 English options | `applyWordTap` defaults `he` to `null` when a translation fails |
| `he-type` | `entry.he` | same |
| `listen-type` | a clip reachable via `resolveLemma` | a brand-new word with no recording |

**FROZEN RULE (contract WK-1):** the rotation gives a *starting position*. From that position,
walk the four kinds in order, wrapping, and take the **first kind that is buildable for this
word**. If none is buildable the question is skipped entirely, exactly as an unloadable item is
skipped today. A kind is never faked and a prompt is never blank.

This is the honest-degradation rule R7 already established for audio, applied to question kinds.

### 3.2 Where the `he-pick` options come from — and the collision that would make it unfair

The bank's `distractors` are chosen to fit a **sentence**. `he-pick` has no sentence, so they are
the wrong instrument: nothing stops a distractor from being a correct translation of the same
Hebrew word. `mom`/`mother` both translate to one Hebrew word; offered together under that
prompt, the question marks her wrong for a right answer — **precisely the `light`/`computer`
defect of the word-finish run, in a new place.**

**FROZEN RULE (contract WK-2):** `he-pick` options are drawn from **her own other words'
English keys**, and any candidate whose stored `he` equals the answer's `he` (after trim) is
**excluded**. She has 46 words all carrying `he`, so the pool is ample. If fewer than 3 survive
the exclusion, `he-pick` is **not buildable** for that word and WK-1's walk moves on.

This needs no translation call and no new content, and it is checkable at runtime from data we
already hold — which is why it is preferred over sweeping the bank with an API.

---

## 4. Typing: the input, and grading

### 4.1 The field (R5 item 2 — "like a password")

Precedent exists at `reader.js:699` (the onboarding name fields) but it is **incomplete**: it
sets `autocomplete/autocorrect/spellcheck` and omits `autocapitalize`, which on a phone yields a
leading capital. The frozen attribute set for this run (contract WK-3):

```
type="text" dir="ltr" lang="en" inputmode="text"
autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
name="q-<per-question random token>"
```

The random `name` is load-bearing, not decoration: mobile Safari and Chrome both ignore
`autocomplete="off"` on a field whose name they recognise, and re-offer a previous value for the
same name. A name they have never seen has nothing to offer.

**STATED RESIDUAL, not hidden:** I cannot drive her actual phone keyboard from here. The
attributes are the correct and complete set, and the visual gate confirms them in a
phone-sized viewport in a desktop browser — but "her keyboard really does stop suggesting" is
verifiable only by her, on her phone. This is the one claim in the run that ships unproved, and
it is stated on the owner's page.

### 4.2 Grading (owner decision R-W-1: one free retry on a near-miss)

Compare after `trim()` and `toLowerCase()` on both sides. Then:

- **exact match** → correct.
- **near-miss, first time** → not scored yet. Show the near-miss line, keep her text in the box,
  cursor at the end, let her fix it. **Nothing is posted.**
- **the retry** → exact match scores correct; anything else scores wrong.
- **anything that is not a near-miss** → wrong immediately, with the right word shown.

**Near-miss is Damerau-Levenshtein distance 1** — one insertion, one deletion, one substitution,
**or one transposition of adjacent letters**. The transposition case is why plain Levenshtein is
the wrong choice and is called out here in writing: `lgiht` for `light` is Levenshtein distance
**2**, so under plain Levenshtein the single most common typing slip a child makes would not
count as a near-miss. My own illustration to the owner used exactly that example. A spec that
had said only "one letter wrong" would have shipped an engine that failed its own demo.

**We never show her WHICH letter is wrong** — that turns a spelling question into a copying
question.

**Exactly one `quiz-answer` is posted per question**, after the answer resolves — so strikes,
`lastQuizAt`, the trophies and the score line all behave exactly as they do today. Contract
WK-4: *a near-miss retry is one question, not two.*

---

## 5. R3(a): the same word first, every single time

Folded in by owner decision (§7 R-W-3). `pickQuizWords` sorts by strikes → needsReview →
never-quizzed → oldest → alphabetical, and `startQuiz` walks that list **in order**, taking the
first four that load. A word with one strike is therefore question #1 in **every** quiz until she
gets it right. To a child that is "the same exact questions", and she said so.

**FROZEN RULE (contract WK-5):** keep the ranking as a *weighting*. **Reorder** the ranked list so
that its first `count` entries are drawn uniformly from its top `slice = min(8, length)`, using
the existing Fisher-Yates; everything not drawn follows in its original ranked order. A
struggling word stays highly likely; it stops being guaranteed.

**The list is REORDERED, never TRUNCATED, and that is load-bearing.** `startQuiz` walks the list
and skips any lemma whose item will not load, so a list cut down to four would hand her a short
sitting the moment one item failed to load. Reordering keeps the tail available as it is today.

`rand` is already threaded through every one of these functions, so this stays fully
deterministic under test.

---

## 6. The new Hebrew — five strings, and how they get into the code

FC-7 ("no new Hebrew string anywhere", with per-file byte pins) was a **word-finish phase
constraint**, not a standing rule. This run necessarily adds Hebrew: the typing prompts are text
she reads. **FC-7 is superseded for this run** and replaced by new byte pins measured after the
change (contract WK-6).

Field guide 8 forbids retyping Hebrew or copying it out of terminal output. The proven route is
FC-5's: the strings live **once**, in a fenced block in this design file, are **extracted by
script** into the code, and the block is md5-pinned so a tidy-up fails the suite.

```hebrew-strings
he_pick_prompt=איזו מילה באנגלית?
he_type_prompt=כתבי את המילה באנגלית
listen_type_prompt=הקשיבי וכתבי את המילה
near_miss=כמעט! תסתכלי שוב
check_button=בדקי
```

**The block is FROZEN. md5 of the block body = `ad6885fa6c4cc47751051b8f3fb9c9ea`, 225 bytes.**
Verified by codepoint dump at authoring time: every character is either Hebrew (U+0590–U+05FF),
a space, `!` or `?`. Nothing else. A test recomputes this digest and asserts the five strings in
the shipped code are byte-identical to it, so rewording her prompts fails the suite (the FC-5
precedent).

Nothing else is new: the wrong-answer line, the praise line, the next button, the progress line
and the speaker label are all reused verbatim from the existing card.

---

## 7. Decisions on the record

| id | who | decision |
|---|---|---|
| **R-W-1** | **OWNER**, 2026-08-03 | A one-letter near-miss gets **one free retry**, her text kept. Correct only if the retry is correct. Not forgiving (which would let her never spell it), not strict (which punishes a phone slip that is not a spelling error). |
| **R-W-2** | **OWNER**, 2026-08-03 | The four kinds run in a **fixed rotation** by position in the sitting. Guarantees variety inside every sitting and caps audio at one question in four — her item 4, answered by construction rather than on average. |
| **R-W-3** | **OWNER**, 2026-08-03 | **R3(a) is in scope.** The sampling fix ships in this run, because the file has to be opened anyway and doing it later means unfreezing the same file twice. |
| **R-W-4** | ORCHESTRATOR, 2026-08-03 | **FC-1's byte freeze on `quiz.js` / `quiz-core.js` is LIFTED**, and re-expressed as a property pin. Authority: QZ-18 is a plan-level contract of the word-quiz run, not an owner decision (checked, not recalled — `.oplan/word-quiz/plan.md:923`). The md5 pinned a *spelling*; field guide 22 says such a pin moves. **The alternative was considered and rejected:** a second engine beside the frozen one gives two answer paths, two scoring paths and two places to post `quiz-answer` — field guide 15(b)'s "parts correct, whole incoherent" seam, deliberately built. One engine, one scoring path. |
| **R-W-5** | ORCHESTRATOR, 2026-08-03 | Typing appears in **both** places she quizzes — chapter end and the words screen. She asked for "quizzes", not for one screen, and both call the same engine. |
| **R-W-6** | ORCHESTRATOR, 2026-08-03 | **No paid API and no runtime LLM**, honouring owner decision D7. Every Hebrew word comes from `entry.he`, already stored. Grading is local string comparison. This run spends nothing. |

**Out of scope, said plainly:** writing whole sentences (R5 item 5), background story generation
(R4), and the automatic audio top-up (the live remainder of R7).

---

## 8. What has to be true before this can be called done

Phase acceptance criteria live in `plan.md` and are mechanical. The design-level bar:

1. She can be asked all four kinds, and a sitting of four contains **each kind exactly once**
   whenever every kind is buildable.
2. A typed answer that is right scores **exactly** as a tapped right answer does — same post,
   same strike clearing, same trophy progress. Asserted at the **seam**, not in the parts.
3. A one-letter slip gives her a second try; a real wrong answer does not.
4. `he-pick` can never offer a distractor that means the same Hebrew word as the answer.
5. No question kind is ever shown with an empty or faked prompt.
6. Nothing about today's tapped question changes — same text-node order, same scoring.
7. Both precached quiz files ship a `CACHE` bump in the same commit (currently `magic-vet-v24`).

## 9. The known traps this run walks into

Named here so no step rediscovers them:

- **Line endings.** `quiz.js` is CRLF (346), `quiz-core.js` is CRLF (99). Field guide 4/16: edit
  byte-preservingly, verify with `tr -dc '\r' | wc -c`, never with grep.
- **Precache.** Both files are in `PRECACHE` (`sw.js:16-17`). QZ-22: the `CACHE` bump ships in the
  same commit as the change, with the pin in `tests/shell.test.js:64` moved in that same commit
  and the half-applied bump **seen to fail first**.
- **Visual gate origin.** R-F6-2: 3000, 127.0.0.1:3000, 3100, 3200, 3300 and 3400 all carry
  service workers. **Next free port is 3500**, and the step that uses it adds it to the list.
- **The `he-pick` sameness trap** (§3.2) is this run's `light`/`computer`. It is designed out by
  WK-2 rather than reviewed for.
- **Shape gates are blind to correctness** (F3-2 finding (i)): `isUsableItem` validates shape.
  Nothing mechanical can tell that a distractor is also a right answer. WK-2 removes the class
  for `he-pick` by construction; the `cloze-pick` residual is unchanged and still carried by F3-2.
- **Distractors are biased toward words she knows** (F3-2 finding (ii), `quiz-core.js:24`). WK-2
  draws from her own words deliberately, so this stops being a bias and becomes the design.
