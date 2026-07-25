# Growth Design: how the app grows with her

STATUS: AWAITING-OWNER-SIGN-OFF

## 1. What this document is

This is a proposal, not a change. You are the person who reads it. Nothing in this
document has run yet, and nothing in it changes the live app: the code that generates
her chapters today is exactly the code that generated them yesterday.

The document does three things: it states, with file and line citations, what the
growth engine actually does today (section 2); it names two places where the shipped
code does not match `design.md`, the frozen design document (section 3); and it freezes
three rules - named G1, G2, G3 - that close that gap, plus the order in which the
remaining parked items from `design.md` section 6 should land after them (sections 4
through 7).

Your signature on section 10 is what authorizes the next run to build sections 4
through 7, in the order given in section 7. Nothing here is built until you sign it.
If you do not sign it, the app keeps running exactly as it runs today - the placement
test sets a band once, and it never moves again.

## 2. What the code does today

This section states only facts that were measured directly in this repository, each
with the file and line where it was checked.

- The vocabulary band is written in exactly one place: `api/placement.js:54`, on
  `POST /api/placement` with `{action: "submit"}`. Nothing else in `api/` or `lib/`
  ever assigns `skills.receptiveVocab.band`. Once the placement test sets it, it never
  moves again.

- `buildAllowedSet` (`lib/story.js:23-64`) reads that band at `lib/story.js:30`. The
  bands `A1` and `A2` unlock all of `data/band1.json` (1341 entries); only `A2` unlocks
  `data/band2.json` (2016 entries) as well, at `lib/story.js:39`.

- Allowed-set sizes, re-derived by calling `buildAllowedSet` with the real band files:
  `preA1` = 296, `A1` = 1257, `A2` = 2850 entries. These are the three integers
  `public/views/parent.js` shows you under "the vocabulary level."

- Of the 2850 entries available at A2, only 2254 can ever match a word in a chapter's
  text. `tokenize` (`lib/vocab.js:4`) only ever emits tokens matching
  `[a-z]+(?:'[a-z]+)?`, so the 596 entries containing anything else can never match:
  phrases with spaces ("a few", "a little bit"), hyphenated forms, slashed pairs, words
  with accented letters, and entries carrying punctuation. Note the apostrophe is
  allowed, so "let's" does match. At A1 the same gap is 201 entries out of 1257 (1056
  usable); at preA1 it is 74 out of 296 (222 usable). This does not break the coverage
  gate that keeps chapters readable - it means about 21% of what the number counts (596
  of 2850) can never be recognized, so the usable vocabulary at A2 is 2254 words rather
  than 2850. This is stated once, here, and nowhere else in this document.

- A word she taps is stored with `status: 'learning'` by `applyWordTap`
  (`lib/profile.js:181` is the function; the status literal is on line 190), called from
  `api/profile.js:46`. `knownLemmaSet` (`lib/vocab.js:64-74`) counts only entries
  with `status === 'known'`. Therefore a tapped word never enters the allowed set and
  never changes a generated chapter. The `mark-known` action exists at
  `api/profile.js:51`, and no client code ever calls it. The only words ever marked
  `known` today are the ones she answered correctly in placement task 1
  (`api/placement.js:55-57`).

- Micro-check answers inside a chapter are logged on the first attempt only
  (`public/views/reader.js:556-564` computes and guards on `isFirstAnswer`) into
  `story.checkLog`, via `api/profile.js:77` and `lib/profile.js:233`. Nothing in the
  codebase ever reads `story.checkLog` back out.

- Each generated chapter stores its own measured `coverageRatio` (`lib/story.js:240`)
  and a `generatedAt` timestamp. Nothing reads either field back out either.

- Placement task 2 writes `skills.readingComprehension` (`api/placement.js:67`), but
  `buildAllowedSet` never reads that field - it has no effect on what a chapter is
  allowed to contain. The whole vocabulary band rests on 12 items, six of them audio
  (counted in `data/placement-items.json`), scored by `bandForScore`
  (`lib/placement.js:41-45`): a score under 0.5 gives `preA1`, under 0.8
  gives `A1`, otherwise `A2`. The gap between the `A1` ceiling (1257 words) and the
  `A2` ceiling (2850 words) is 1593 words, decided by which side of one or two answers
  a child lands on.

- `lib/profile.js:9` restricts a skill's `state` to `unknown` or `estimated` only, and
  `lib/profile.js:10` restricts `band` to `preA1`, `A1`, or `A2` only. `validateProfile`
  rejects any profile that uses a value outside these sets.

## 3. The contradiction

Two contradictions between `design.md` and the shipped code, in this order:

(a) `design.md section 3` states that continuous calibration is the real engine of the
app: every word she taps and every comprehension question she misses is supposed to
update her profile forever, with the placement test serving only as the starting
prior. In the code that is actually running, the placement test is not the prior - it
is the entire posterior. Nothing after it ever moves the band (section 2, first bullet).

(b) Both signal channels the design describes are captured and then discarded. Every
tap she makes lands in `status: 'learning'`, a status the chapter generator never
reads (section 2, fifth bullet). Every comprehension check she answers lands in
`story.checkLog`, a log nothing reads (section 2, sixth bullet). The app records her
behavior faithfully and then never acts on it.

The project brief's sentence "Tapped words accumulate into the allowed set" is wrong,
and this document corrects it: tapped words accumulate into a status the allowed set
never consults. The engine `design.md` describes - one that watches her and adjusts -
was never wired up. The three rules in the next three sections are that wiring.

## 4. G1 - words she taps become words she knows

`promoteKnownWords(profile)` is a pure function. It is called from `api/chapter.js`,
immediately after `loadProfile()` and before `generateChapter` - the one place in the
codebase where the profile is already loaded into memory and about to be saved back,
so no new load or save is required.

THE RULE: a word with `status === 'learning'` is promoted to `status: 'known'`
(keeping its existing `source`) once it has appeared, matched via `baseForms` (the
same matcher `coverageAgainst` already uses for chapter verification), in at least
`KNOWN_AFTER_QUIET_CHAPTERS = 2` chapters whose `generatedAt` is later than that
word's `lastSeen`. Promotion is one-way; nothing in this design ever demotes a word
back to `learning`.

Why this signal and not tap count: re-tapping a word is evidence she does NOT know
it - `taps` on an existing entry only increments on a fresh tap (`lib/profile.js:198`),
which means a high tap count is a child asking for help repeatedly, not a child who
has learned the word. The signal this design uses instead is meeting the word again,
later, in a new chapter, without needing to tap it a second time. That is the right
signal, and it is computable entirely from data the profile already stores - no new
field on a word, no new capture surface, no new client code.

Second-order effect: for a word that is already on her band list, promoting it from
`learning` to `known` changes nothing about the allowed set - it was already allowed
via the band. But a chapter may carry up to 3 words that are off the band list
entirely (`lib/story.js:188`, glossed and explained). For those words, G1 is the only
mechanism that ever moves them into her known vocabulary. This is what makes section
6's G3 possible at all: her personal vocabulary, not the fixed band lists, becomes the
thing that keeps growing once the lists are exhausted.

## 5. G2 - the band has to be able to move

`evaluateBand(profile)` runs from the same call site as G1, at most once per chapter
generation. Its two signals are first-attempt accuracy taken from `story.checkLog`,
and the count of distinct newly tapped words - words whose `firstSeen` falls inside
the evaluation window.

The seven constants this design freezes, exactly as follows:

```
KNOWN_AFTER_QUIET_CHAPTERS = 2
PROMOTE_WINDOW = 6
PROMOTE_ACCURACY = 0.85
PROMOTE_MAX_NEW_TAPS = 6
DEMOTE_WINDOW = 4
DEMOTE_ACCURACY = 0.50
DEMOTE_MIN_NEW_TAPS = 32
```

PROMOTE one band step (`preA1 -> A1 -> A2 -> A2+`) when ALL three hold at once: at
least `PROMOTE_WINDOW` chapters have been generated since the band was last set;
first-attempt accuracy over those chapters is at least `PROMOTE_ACCURACY`; and the
count of distinct new tapped words over those chapters is at most
`PROMOTE_MAX_NEW_TAPS`. High accuracy plus few new taps together mean the text is not
challenging her - she is ready for more.

DEMOTE one band step (never below `preA1`) when at least `DEMOTE_WINDOW` chapters
have passed since the band was last set, AND EITHER first-attempt accuracy is below
`DEMOTE_ACCURACY`, OR the count of distinct new tapped words is at least
`DEMOTE_MIN_NEW_TAPS` (8 per chapter, over the window). Either signal alone is enough:
frequent wrong answers means comprehension is failing; a flood of new taps means the
text reads as a wall of unknown words even if she is guessing the multiple-choice
questions correctly.

Guard rails, all frozen: at most one step moves per evaluation, in either direction.
`skills.receptiveVocab.sinceChapter` is set to `story.chapters.length` on every single
write to the band, including the original placement write at `api/placement.js:54`, so
no second move can fire until a full window has passed again. Every move that fires
appends one entry to `skills.receptiveVocab.history`:
`{from, to, at, reason, window: {chapters, accuracy, newTaps}}`. `state` stays
`'estimated'` in every case, because `lib/profile.js:9` allows no third value, and the
provenance of the move belongs in `history`, not in a schema break.

Two properties that this design argues for, not merely states:

(i) Demotion is not optional. The finding that started this whole project is that a
wrong verdict about her level is invisible and permanent - the placement test sets a
band once and it never moves (section 2, first bullet; section 3(a)). A rule that can
only ever move the band up rebuilds exactly that trap, just facing the other
direction: once wrongly promoted, always stuck too high.

(ii) The owner always wins. The re-take button on `#/parent` is a client-side flag
that, when the placement test is retaken, overwrites the band unconditionally,
regardless of anything G2 has done. G2's next evaluation window starts counting fresh
from whatever band you set by retaking the test. Nothing in this design can override
that.

Every move G2 makes must be visible on `#/parent`: the current band, when it last
moved, and why (the reason and window data already stored in `history`). An automatic
change you cannot see reintroduces the exact defect this project exists to remove -
an invisible, unaccountable verdict about her level.

State plainly: these seven constants have no data behind them today. She has not read
a single chapter under this system yet. They are engineering judgment, not a measured
fit. They must live in one exported constants object, so all seven can be re-tuned in
a single edit rather than hunted across files. The first month of watching `#/parent`
after this ships is what actually calibrates them.

## 6. G3 - above A2, when the Band II list runs out

Facts first: `data/` holds `band1.json` (1341 entries) and `band2.json` (2016
entries) and nothing above them. At band `A2` the list is fully consumed - there is no
larger official list this app can fall back to. The usable ceiling, given section 2's
tokenizer gap, is 2254 matchable words, not 2850. And a 12-item placement test cannot
distinguish "she is exactly at the ceiling" from "she is far past the ceiling" - both
look identical on 12 questions. This is why the placement scoring function is left
alone, and `A2+` is reachable ONLY through G2 promotion, never through the placement
test.

THE RULE: above `A2`, the app stops trying to grow the LIST and grows two other
things instead.

1. Her personal vocabulary, through G1 - the only channel in this design with no
   ceiling, because it is anchored to what she actually reads, not to a fixed list.

2. The TEXT itself, not the vocabulary constraint. `buildPrompt` (`lib/story.js:178-190`)
   currently hardcodes "80-140 English words," "Use simple, short sentences," and "AT
   MOST 3 words that are not on the ALLOWED WORD LIST." The `A2+` tier raises the word
   count to 140-200, permits compound sentences, and allows up to 5 off-list glossed
   words per chapter instead of 3. It NEVER lowers `minRatio` (`lib/story.js:127`,
   currently 0.95) - that constraint is the founding principle of the whole design,
   and relaxing it is exactly what a previous, failed attempt at this app got wrong.

Every touch point the next run must change to add `A2+`, enumerated:

- `lib/profile.js:10` - `SKILL_BANDS` gains the value `'A2+'`.
- `lib/story.js:31` and `lib/story.js:39` - both `band === 'A2'` tests need an `A2+`
  case (at minimum, `A2+` must unlock everything `A2` unlocks).
- `lib/story.js:178-190` - the difficulty ladder in `buildPrompt` needs an `A2+` tier
  as described above.
- `public/views/parent.js`, the frozen-strings test in `tests/parent-ui.test.js`, and
  that same file's vocabulary-size assertion (`tests/parent-ui.test.js`, "the
  vocabulary sizes parent.js states match buildAllowedSet") - all three need an `A2+`
  case or they will fail the moment a profile reaches that band.
- `lib/placement.js:41` - left unchanged, deliberately. The placement test still only
  ever produces `preA1`, `A1`, or `A2`; `A2+` is not a placement outcome.

A fourth, larger word list is not present anywhere in this repository. Whether one is
obtainable is section 9's open question (b) - it is not something this document
answers.

## 7. The order the parked items land

`design.md` section 6 lists five weekly-update items still parked. This section fixes
the order they should land in, after this document's own G1 and G2, with one
dependency reason each. Do not reorder these.

1. G1 and G2, as specified in sections 4 and 5 of this document. Every item below is
   worth less if the band the app is teaching to is wrong, and getting the band wrong
   silently is the exact contradiction section 3 names.

2. `design.md section 6` item 1a, daily spaced-repetition review of her tapped words.
   This reuses the same `words` data G1 already reads and writes - no new capture
   surface - and it is a second, faster evidence channel feeding the same signal G1
   depends on: whether a word sticks.

3. `design.md section 6` item 4b, the full parent view. The route and
   `public/views/parent.js` already exist today; extending them is smaller than
   building them. You must be able to see the engine - band history, word list,
   chapter log - before it is allowed to run unsupervised on the next two items below.

4. `design.md section 6` item 1b, push notifications. Deliberately split from item 1
   and placed after it, because push requires an installed PWA plus a one-time
   permission grant, and the PWA is not installed on her phone yet.

5. `design.md section 6` item 4, trophies and achievements. Cheap retention, no new
   API surface, no grading design required - it slots in without depending on
   anything above it finishing first.

6. `design.md section 6` item 2, writing exercises. This needs a grading approach
   that does not exist yet: `skills.writing` and `skills.grammarInContext` are still
   `unknown` in every profile, and nothing in this codebase produces a value for
   either of them.

7. `design.md section 6` item 3, record-only speech. Last, and gated on a storage
   change: `docs/owner-handoff.md` section 6 records that the profile store is a
   public-access Vercel Blob store today, which is acceptable for pseudonyms and word
   lists, and is not acceptable for a child's recorded voice.

8. `design.md section 6` item 5, automatic pronunciation scoring. Stays out of scope;
   `design.md` already marks this the highest-risk deferred item, and nothing in this
   document changes that.

## 8. What must not change

- `design.md` and `docs/visual-design.md` stay FROZEN. This document proposes new
  rules alongside them; it does not amend either of them.
- `minRatio` stays at 0.95 (`lib/story.js:127`). No item in this document lowers it,
  under any band, including `A2+`.
- The placement test, its scoring function (`lib/placement.js`), and the item bank
  stay exactly as they are today.
- The re-take flow stays client-only, and `api/placement.js`'s action surface
  (`submit` only) stays closed - this document adds no new placement action.
- The band stays off the child's screen. It is visible only on `#/parent`.
- Any future change under `public/` still ships with a `sw.js` `CACHE` version bump
  in the same phase as the change, per existing practice.

## 9. Open questions for the owner

This document deliberately does not answer these. Only you can.

(a) Do you accept the app moving the band by itself under G2, given that retaking the
placement test always overrides whatever G2 has set?

(b) Is a word list above Band II obtainable from the Ministry of Education or another
source, or is `A2+` (text-side growth only, per section 6) the permanent ceiling for
vocabulary-list growth?

(c) Should `design.md section 3` be amended to describe what the code will actually
do once G1 and G2 land? It is frozen, and only you can re-open it.

(d) Do you want the seven constants in section 5 reviewed after the first month of
real data, and if so, on what evidence should that review be based?

(e) Do you accept a private Blob store as a prerequisite for item 7 in section 7
(record-only speech), given the current store is public-access?

## 10. Sign-off

Date: ______________

[ ] Approved - build this next run, in the order in section 7.

Signed: ______________
