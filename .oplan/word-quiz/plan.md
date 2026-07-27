# Plan — run `word-quiz` (W5b)

Base commit: `ceca519` (tree clean; 208 tests / 0 fail; contrast 52 ALL PASS; LIVE at
`magic-vet-v12`, deployment `english-d0roovfpq-dkreinovs-projects.vercel.app`).

Design: `.oplan/word-quiz/design.md` — **FROZEN, 14 owner decisions + 5 orchestrator decisions.**
Read it before this file. Nothing in it is re-opened during execution.

Predecessor: `.oplan/word-audio/` (closed, deployed). Its journal carries the deploy recipe, the
rollback procedure, and the two gate failures this run must not repeat.

---

## PHASE 1 — the item contract, the mechanical gate, and a pilot the owner reviews

GOAL: prove the item format is *good*, on 50 words, before spending ~45 worker batches on 2254.
The bank's quality risk is not mechanical (design.md, "the risk that outranks all others"), so
phase 1 exists to put items in front of a human early and cheaply.

### ACCEPTANCE CRITERIA (frozen before execution)

1. `STEP-1.1-OK` .. `STEP-1.3-OK` all print, each re-run by the orchestrator in a clean state.
2. `npm test` prints `# fail 0` and `# pass 218` (208 +6 +4 +0; see QZ-6).
3. `node scripts/check-quiz-bank.mjs` exits **0** and prints `QUIZ BANK OK: 50 files, <M> items`.
4. `ls public/quiz/*.json | wc -l` is exactly **50**, and the set of filenames (minus `.json`)
   equals the frozen pilot list of QZ-5 exactly — no extras, none missing.
5. Total items is between **50 and 150**, and **at least 6 of the 10 frozen polysemous words**
   (`run light like play back watch right kind fair well`) have **≥2 items**. This is a mechanical
   proxy for "the worker actually exercised the multi-sense rule of D9" rather than writing one
   item for everything. FROZEN COMMAND:
   ```bash
   node -e "const fs=require('fs');const P='run light like play back watch right kind fair well'.split(' ');
   const all=fs.readdirSync('public/quiz').filter(f=>f.endsWith('.json'));
   let total=0; for(const f of all) total+=JSON.parse(fs.readFileSync('public/quiz/'+f,'utf8')).length;
   const multi=P.filter(w=>JSON.parse(fs.readFileSync('public/quiz/'+w+'.json','utf8')).length>=2).length;
   console.log('items:',total,'polysemous with >=2:',multi);
   process.exit(total>=50&&total<=150&&multi>=6?0:1)"
   ```
6. Every item satisfies every rule of QZ-1 — which is exactly what criterion 3 runs.
7. Nothing changed outside `lib/quiz-item.js`, `scripts/check-quiz-bank.mjs`, `tests/`, and
   `public/quiz/`. Specifically byte-unchanged: `public/sw.js`, `public/index.html`,
   `public/styles.css`, `public/lemma.js`, `public/words-index.js`, `public/views/`,
   `public/audio/`, `api/`, `lib/` (other than the new file), `data/`, `docs/`, `assets/`.
8. `.data/profile.json` does not exist and no step runs a server against the real data dir.
9. **HUMAN GATE — the phase does not close without it.** `node scripts/check-quiz-bank.mjs
   --sample 50` is run by the orchestrator, the output is put in front of the owner, and the owner
   explicitly approves. A green criterion 3 is NOT sufficient: the gate checks form, not meaning.

### FROZEN CONTRACTS

**QZ-1 — the item file.** `public/quiz/<lemma>.json`, a JSON array of 1..3 objects. Each object has
exactly these five keys, no others: `lemma`, `sense`, `sentence`, `answer`, `distractors`.
There is deliberately NO `pos` field on an item: `data/band1.json` + `data/band2.json` are the
single source of truth for part of speech (rule 8), and a second copy could only ever disagree.

```json
{
  "lemma": "feel",
  "sense": "to touch something with your hand",
  "sentence": "I ___ the soft cat with my hand.",
  "answer": "feel",
  "distractors": ["jump","sing","open","carry","paint","climb","wash","count"]
}
```

Rules, ALL mechanically checkable and ALL enforced by QZ-3. **Rules 1, 2 and 9 are FILE-level (they
need to see every item in the file); rules 3-8 and 10 are ITEM-level.** That split is why step 1.1
exports two functions and not one — a single `validateItem(item, ...)` structurally cannot count its
own siblings or compare their senses.

1. the filename minus `.json` === every item's `lemma` === every item's `answer`.
2. 1 ≤ items per file ≤ 3.
3. `sentence` contains **exactly one** occurrence of `___` (exactly three underscores) and no other
   `_` character.
4. the **filled sentence** (`___` replaced by `answer`) tokenises via `tokenize` from
   `lib/vocab.js`, and **every** token resolves via `resolveLemma` (from `public/lemma.js`) into the
   manifest set `public/audio/words/index.json`. This is what guarantees she can read it.
   **HARDENED AFTER THE AUDIT — rule 4 must reject on RESIDUE, not merely tokenise-and-drop.**
   `tokenize` matches `[a-z]+(?:'[a-z]+)?` and silently DISCARDS everything else, so the rule was
   blind to digits, non-Latin script and emoji: `"I ___ 42 soft cat toys."` passed, as did a
   Cyrillic word and an emoji, and the discarded junk still counted toward rule 5's word budget so
   it could pad a too-short sentence into legality. Worse, accent residue was laundered — `caté`
   tokenises to `cat`, which IS in the manifest, so the garbage word passed; `café` was blocked
   only by the luck of `cafe` not being a manifest word. The sentence must therefore be checked for
   characters outside `[A-Za-z' .!?,-]` and rejected if any remain, IN ADDITION to the token check.
5. the filled sentence is between **4 and 14 words** inclusive.
6. the sentence starts with an uppercase letter and ends with `.`, `!` or `?`.
7. `distractors` is exactly **8** strings, all distinct, none equal to `answer`, every one present
   in the manifest set.
8. **Part of speech is a SET, not a value** — `posSetFor(lemma)` is the union, over EVERY entry for
   that lemma in `data/band1.json` AND `data/band2.json`, of
   `entry.pos == null ? [] : String(entry.pos).split(',').map(s => s.trim().split(/\s+/)[0].toLowerCase()).filter(Boolean)`
   — **the `== null` guard is load-bearing**: `String(null)` is the truthy string `"null"`, so
   without it a null `pos` yields the set `{"null"}` instead of an empty one, the word stops being
   exempt, and rule 8 then wrongly rejects every real distractor against it. Caught while checking
   the frozen expression actually runs; it changes the exempt count from 50 to 63.
   **NUMERALS ARE FOLDED (AMENDED AT EXECUTION TIME, A3, step 1.3 batch 2).** `cardinal`, `number`
   and `ordinal` all map to the single value `num`. The bands tag one category three ways —
   `three six ten thousand` are `cardinal`, `two four five seven nine twelve twenty hundred third`
   are `number`, `second` is `ordinal`, and `eight eleven million billion` are plain `n`. That is a
   transcription inconsistency in the source, not a fact about English. Unfolded, rule 8 rejects
   `four` as a distractor for `ten` and leaves `ten` with exactly THREE legal same-class distractors
   (`six`, `three`, `thousand`) while rule 7 demands eight — **no legal item for `ten` could exist at
   all**, and every number word in the 2217-word bank hits the same wall. Folded, `ten` has 30.
   MEASURED after the fold: the exempt count is still **63** and the >1-pos count still **336**, so
   the two invariants this plan is pinned to are undisturbed, and batch 1 re-gates green unchanged.
   Nothing other than numerals is normalised.
   **Rule: when `posSetFor(answer)` and `posSetFor(distractor)` are both non-empty they must share
   at least one value.** Empty set = exempt: **63** of 2254, MEASURED under this rule.
   My original "the first comma-separated token of the band entry's pos" was a fiction — a plan
   reviewer proved it. MEASURED over the 2254-word manifest, with definitions chosen to be
   unambiguous: **393 lemmas have more than one band entry, and 336 have a pos union of size > 1.**
   (An earlier draft said "406 / 180"; 406 counted lemmas outside the manifest too and "disagree"
   was never defined, so a third reviewer could not reproduce it. Both numbers are restated here
   rather than quietly dropped.) It hits nearly every pilot word: `kind` = {n, adj}, `back` = {adv, n, adj}, `light` = {adj, n},
   `like` = {prep, con, v}. `play` even carries a malformed `"v player n"`, which is why each
   comma-segment is reduced to its FIRST WHITESPACE TOKEN. A lemma being several parts of speech is
   the normal case, and intersection is the linguistically correct test for "plausible distractor".
9. `sense` is a non-empty string ≤ 80 characters; when a file holds >1 item all `sense` values are
   distinct. **`sense` must also contain at least one non-whitespace character** — the audit found
   `"   "` passes as "non-empty" and that two whitespace strings of different length count as
   "distinct".
11. **(NEW, D22) `sense` IS SHOWN TO THE LEARNER, so it must be in her vocabulary.** Every token of
   `sense` must resolve via `resolveLemma` into the manifest, exactly as rule 4 requires of the
   filled sentence. She reads the gloss now; a gloss she cannot decode is worse than no gloss.
   MEASURED at the time of the change: 8 of 71 glosses failed, on 7 distinct words — `everyone
   teeth outdoor rules brightness sensible relax`. This is the FIRST mechanically-checkable content
   rule the feature has, and it exists only because D22 made the gloss learner-facing.
12. **(NEW) `answer` must itself be a manifest word** — `allowed.has(answer)`, checked directly and
   not via any transform. The audit proved rules 4, 8 and 10 all reach the answer through a lossy
   transform (`tokenize`, `posIndex` lookup, `resolveLemma`) and every one of them FAILS OPEN:
   `feels.json` and `cats.json` passed the gate, and `answer:"Feel"` silently disabled rule 8
   entirely while `answer:"feel "` silently disabled rule 10. One direct check closes all three.
10. the answer word does **not** appear anywhere else in the sentence (it would give the answer
    away). Checked on the filled sentence, whole-word, case-insensitive, **by RESOLVED LEMMA**:
    every token is passed through `resolveLemma` and compared against the resolved answer, so an
    INFLECTION counts as giving it away too.
    **AMENDED AT EXECUTION TIME (A1, step 1.1)** — as originally frozen this compared surface forms,
    and `"I ___ happy when the cat feels warm."` with answer `feel` passed the gate completely clean
    while `feels` sat in the sentence handing her the answer. The rule did not achieve its own
    stated purpose. Tightening is safe and cannot over-fire: rule 4 already requires every token to
    resolve into the manifest, and `resolveLemma` is exact-match-first, so any token that
    de-inflects to the answer *is* an inflection of the answer — `carpet` stays `carpet` and never
    collapses into `car`. Verified against the unfixed code first (it passed, which is the evidence
    the hole was real), then against the fixed code.

**QZ-2 — the generation rules** (binding on every worker that writes items):

- **One item per distinct meaning an 11-year-old would actually meet.** `run` (move fast / a run in a
  game), `light` (not heavy / not dark). Abstract words one context cannot pin get 2. Concrete
  single-sense words get 1. **Hard cap 3.** (D9)
- **The lemma must fit the blank in its BASE form.** Write `I ___ the cat`, never `She ___s the
  cat`. The options she sees are lemmas, so the sentence must accept a lemma.
- **The sentence must make the meaning inferable**: a child who knows the word should get it; a
  child who does not should not be able to guess it from context alone.
- **Every distractor must be genuinely WRONG in that sentence.** Read the sentence with each one
  substituted and confirm it does not work. A distractor that also fits marks her wrong for being
  right — the worst failure this feature has (design.md).
- **DISTRACTORS MUST BE SAME-CLASS (D21, owner, at the batch-1 gate).** They come from the same
  semantic class as the answer — same kind of thing, action or quality — so the item tests the
  MEANING and not the grammar. Test `light` "not heavy" against `big small old new wide round thin`,
  NOT against `happy angry hungry thirsty`. If seven of your eight options are obviously the wrong
  *kind* of word, she can solve the item by elimination without knowing the answer, and the item has
  measured nothing.
- **Therefore THE SENTENCE must do the disambiguating work.** With same-class options, a loose
  sentence is what makes a distractor also fit. The sentence needs a clause that only the answer
  satisfies: `"The box was so ___ that the little girl could lift it."` is what kills `big`; drop
  "could lift it" and `big` fits and she is marked wrong for being right. **Write the pinning clause
  first, then choose the distractors it excludes.** This is now the highest-risk instruction in the
  run — the mechanical gate cannot see any of it.
- **THE PIN TEST — a coordinated clause is NOT a pin.** For every distractor ask: *does substituting
  it make the sentence FALSE, or merely make it describe something else that is also possible?* Only
  the first is a pin. `and` and `but` join two independent statements and therefore pin NOTHING:
  `"My mother will ___ the shop and choose what to sell."` lets `clean` straight through, because
  cleaning the shop AND choosing the stock is a perfectly good sentence. Only **`so`, `so that`,
  `so ... that`, `because`, `... enough to`, purpose infinitives (`to catch the bus`), and
  verb/argument selection** actually constrain the blank. Discovered at the batch-1 gate: six of
  the first 23 D21 items pinned with a coordinator — four leaked outright and two were merely weak.
  **This is not a ban on the words.** 11 of the final 71 items contain an `and` or a `but` and are
  fine, because something else does the pinning. The rule is that a coordinator may never be the
  ONLY pin.
- Age-appropriate for an 11-year-old girl. **If a word cannot be given an age-appropriate sentence,
  STOP and return the question. Do not guess.** The 37 words the owner ruled out are already gone
  (QZ-8), so this should not fire — but it stays as the backstop, because a list written in advance
  cannot anticipate every word.
- No proper nouns. No contractions (matches `lib/story.js`'s own rule).
- **THE BLANK CAN NEVER BE THE FIRST WORD OF THE SENTENCE.** Surfaced at step 1.1. Rule 6 requires
  the sentence to start with an uppercase letter and it is applied to the TEMPLATE, so a sentence
  beginning `___` starts with `_` and fails. Applying rule 6 to the filled sentence instead would be
  worse — it would demand a capitalised answer and contradict rule 1 (`answer === lemma`, lowercase)
  — so the constraint is real under either reading. Write `The ___ girl smiled.`, never `___ girls
  smile.`
- **NEVER put ANY form of the answer in the sentence, including IRREGULAR ones.** Rule 10 catches
  regular inflections (`feels`, `running`) but is structurally blind to irregular forms that are
  themselves manifest entries: MEASURED, **29 manifest lemmas have 42 such forms** — `run/ran`,
  `go/went`, `go/gone`, `see/saw`, `take/took`, `make/made`, `come/came`, `eat/ate`, `give/gave`,
  `know/knew`, `do/did`, `be/was`, `have/had`, `get/got`, `find/found`, `leave/left`, `say/said`,
  `think/thought`, `lose/lost`, `rise/rose`, `read/read`, `put/put`, `cut/cut`, `let/let`,
  `hit/hit`, `hurt/hurt`, `shut/shut`, `cost/cost`, `write/written`, `break/broken`. `resolveLemma`
  tries an exact manifest match FIRST, so `ran` resolves to `ran` and never to `run`. The gate will
  NOT stop you. Check by hand. (Batch 1 was scanned against this list and is clean.)
- **Rule 7 is DIRECT manifest membership; rule 4 de-inflects. This asymmetry is deliberate.** A
  distractor must be in `public/audio/words/index.json` *exactly* — the options she sees are lemmas
  (D5), so `cats` is not a legal distractor even though `cats` is legal inside a sentence. Sentence
  words may be inflected; distractors may not.
- **THE ALLOWED VOCABULARY IS NOT ORDINARY ENGLISH — this will bite you.** MEASURED against the
  real manifest: `after`, `children`, `men`, `women`, `feet` are all **ABSENT**, while `before`,
  `went` and `gone` are present. Irregular plurals and many everyday words simply are not in the
  set, and rule 4 rejects a sentence containing even one of them. Do not trust your instinct for
  "simple English"; check every word against
  `public/audio/words/index.json`. (Inflections are fine — `resolveLemma` maps `cats`->`cat`,
  `walked`->`walk` — but only when the BASE form is in the manifest.)
- **You MUST run the gate on your own work before returning**, and iterate until it is green:
  `node scripts/check-quiz-bank.mjs`. It names the offending tokens for rule 4. A batch returned
  without a green gate is a failed batch.

**QZ-3 — the gate.** `scripts/check-quiz-bank.mjs`, ESM, zero npm dependencies.

FROZEN CLI: `node scripts/check-quiz-bank.mjs [--dir <path>] [--sample <N>]`.
`--dir` defaults to `public/quiz`; the tests point it at a temp fixture dir and MUST NOT write
fixtures into the real bank. `--sample` and the gate are mutually exclusive modes.

It walks every `<dir>/*.json`, applies every rule of QZ-1, and:
- on success prints exactly `QUIZ BANK OK: <N> files, <M> items` and exits **0**;
- on failure prints one line per offending file/item naming the rule number broken AND, for rule 4,
  **the exact offending tokens** (a worker cannot fix "rule 4 failed"; it can fix
  `rule 4: children, after`), then `QUIZ BANK FAILED: <K> problems`, and exits **1**;
- `--sample <N>` prints N items in a human-readable form (sentence with the blank, the answer, the
  8 distractors, the sense) and exits 0 **without** running the gate. Sampling is deterministic —
  no `Math.random()`. **It samples ITEMS, not files:** build the flat list of every item as
  `(filename, index-within-file)` sorted by filename then index, and walk it with a fixed stride.
  Sampling per file and always printing `item[0]` would hide exactly the multi-sense items D9
  exists to produce, which is what criterion 9's human gate is looking for.
  **The stride is FROZEN as `Math.floor(i * total / n)` for `i` in `0..n-1`, NOT `i * Math.floor(total / n)`
  (AMENDED AT EXECUTION TIME, A2, step 1.2).** A uniform integer stride from 0 stops at
  `(n-1)*floor(total/n)` and never reaches the tail of the bank. MEASURED at the exact criterion-9
  invocation `--sample 50`: at 80 items it showed only the alphabetically-first 50 — 63% of the
  bank, front-loaded — and across the criterion-5 legal range of 50-150 items its coverage ran as
  low as **51%**. The owner would have reviewed words beginning a-q and signed off on the whole
  bank. The frozen form spans 98-100% at every total in that range, stays deterministic, and stays
  strictly increasing. Caught by the step-1.2 worker, which flagged it rather than choosing.
- the gate also prints, on success, `MULTI-SENSE: <N> files with >=2 items` — the number
  criterion 5 needs.

**QZ-4 — non-goals for the whole of phase 1.** No UI of any kind. No change to `lib/profile.js`,
`api/`, `public/views/`, `public/styles.css`, `public/sw.js`, `public/index.html`, `data/`, `docs/`.
No cache bump (nothing precached changes; `public/quiz/` is fetched at runtime like the audio, and
is NOT added to `PRECACHE`). No deploy. No paid API call. No runtime LLM.

**QZ-5 — the frozen pilot word list (exactly 50).** Deterministic: the ten polysemous words chosen
to exercise D9, plus a fixed stride through each band section.

```
run light like play back watch right kind fair well
add boy fact hat job net rest ten
about body country ever goal itself million online question since sweet vegetable
abroad bear chef dentist euro grammar introduce maximum pattern reasonable sir timetable
ability beyond complex drama gentle method reality suffer
```

`battle` and `gay` were in the original stride and are now excluded by QZ-8. Replaced
deterministically by the next word in the same band section that is neither excluded nor already in
the list: `battle` -> `bear`, `gay` -> `gentle`. Both are useful: `bear` is polysemous (the animal /
to carry / to endure) and `gentle` carries a malformed `pos` of `"adj gently adv"`, which exercises
rule 8's first-whitespace-token reduction.

**QZ-6 — the test ledger.** 208 today. 1.1 +6 -> 214. 1.2 +4 -> 218. 1.3 +0 -> 218.

**QZ-8 — the excluded words (owner decision, 2026-07-26).** These 37 words get **no quiz file and
no quiz item, ever**. The owner's reasoning: "dont need these words there are enough other words" —
and at 37 of 2254 the cost is 1.6% of the bank.

```
alcohol arrest army attack battle beer blood bomb boyfriend cancer christian church crime dead
death die disease drug enemy gay girlfriend god guilty gun jail kill murder prison race religion
sex shoot smoke soldier steal war wine
```

DELIBERATELY KEPT, because a wide net swept them up and they are ordinary vocabulary an 11-year-old
needs: `love kiss marry married wedding hospital sick ill doctor nurse medicine police body poor
pain hurt fight danger lie afraid`. If the owner wants any of these cut too, that is a one-line
change to the list above and must happen BEFORE phase 2 generates the bank.

The exclusion applies to the QUIZ ONLY. These words remain in `buildAllowedSet`, so the story
generator may still use them and their audio clips still exist — removing them from the story is a
separate, larger decision the owner has not been asked for.

**QZ-7 — inherited and still binding.** `PRECACHE` may gain first-party JS a precached file
statically imports, and NOTHING else (`docs/visual-design.md`, as amended by word-audio A11) —
`public/quiz/*.json` is data and stays out. The contrast gate must keep exiting 0 at exactly 52
pairs. Any change to a precached file needs a `CACHE` bump in the same phase. The learner's profile
is never contacted. Never open a browser on production. Never run `vercel env`. The six
`public/audio/word-*.mp3` exam clips and `data/placement-items.json` are untouched.

### STEPS

**STEP 1.1 — the item contract, in code**
- files: `lib/quiz-item.js` (NEW), `tests/quiz-item.test.js` (NEW).
- goal: three exported pure functions.
  `buildPosIndex(band1, band2, allowed)` -> `Map<lemma, Set<string>>`, implementing rule 8's union
  exactly as frozen there.
  `validateItem(item, ctx)` -> `{ ok, errors }` where `ctx = { allowed: Set, posIndex: Map }`,
  implementing the ITEM-level rules 3, 4, 5, 6, 7, 8 and 10.
  `validateItemFile(lemma, items, ctx)` -> `{ ok, errors }`, implementing the FILE-level rules 1, 2
  and 9, and calling `validateItem` on every item, prefixing each returned error with its item
  index so the gate can name `feel.json[1]`. QZ-3 calls ONLY `validateItemFile`.
  The module MUST IMPORT `resolveLemma` from `../public/lemma.js` and `tokenize` from
  `./vocab.js` — never re-implement either (field guide 3: verifying code against a
  re-implementation of itself is how a wrong regex put a bad count in all three bands).
- validation (frozen): `node --check lib/quiz-item.js && npm test 2>&1 | grep -qF -- '# pass 214'
  && npm test 2>&1 | grep -qF -- '# fail 0' && echo STEP-1.1-OK`
- the 6 tests, one per line, each may carry several assertions:
  1. a valid single-item file passes `validateItemFile` with `errors` empty;
  2. sentence shape — rule 3 (zero blanks fails, two blanks fails), rule 6 (no leading capital
     fails, no terminating punctuation fails), rule 10 (the answer appearing a second time fails);
  3. rule 4 — a sentence containing `children` (VERIFIED absent from the manifest) fails and the
     error names the offending token; plus rule 5 (3 words fails, 15 words fails);
  4. rule 7 — 7 distractors fails, a duplicate fails, one equal to the answer fails, one absent
     from the manifest fails;
  5. rule 8 — `buildPosIndex` unions across both bands (`kind` -> `{adj, n}`, `back` ->
     `{adj, adv, n}`), a distractor sharing no pos with the answer fails, one sharing ANY pos
     passes, and an empty-pos word is exempt;
  6. FILE-level — rule 1 (filename not matching `lemma`/`answer` fails), rule 2 (4 items fails,
     0 items fails), rule 9 (two items with the same `sense` fails), and an item-level error comes
     back prefixed with its item index.
- tier: WORKER · depends on: nothing.

**STEP 1.2 — the gate and the sampler**
- files: `scripts/check-quiz-bank.mjs` (NEW), `tests/quiz-bank.test.js` (NEW).
- goal: QZ-3. Loads the manifest and the band pos data, walks `public/quiz/*.json`, applies rule 1
  itself and delegates rules 2-10 to `validateItem`. Exits 0 on an EMPTY bank with
  `QUIZ BANK OK: 0 files, 0 items` — phase 1 runs it before any items exist.
- validation (frozen): `node --check scripts/check-quiz-bank.mjs && node
  scripts/check-quiz-bank.mjs && npm test 2>&1 | grep -qF -- '# pass 218' && npm test 2>&1 |
  grep -qF -- '# fail 0' && echo STEP-1.2-OK`
- the 4 tests must include: the script parses; a fixture bank written to a temp dir passes; a
  fixture with a broken item exits 1 and names the rule; `--sample` is deterministic across two
  runs. Fixtures go in a temp dir, NEVER in `public/quiz/`.
- tier: WORKER · depends on: 1.1 COMMITTED.

**STEP 1.3 — the 50-word pilot**
- files: `public/quiz/<lemma>.json` × 50 (NEW), for exactly the QZ-5 list.
- goal: real items for the pilot list, obeying QZ-2, passing QZ-3.
- **FROZEN BATCH COMPOSITION.** Batch 1 is the ten polysemous words, deliberately first, and its
  packet says explicitly: *"every one of these has more than one common meaning an 11-year-old meets;
  write >=2 items for at least 6 of them."* Criterion 5 is then checkable after batch 1 instead of
  only after all 50 files exist.
  - batch 1 (10): `run light like play back watch right kind fair well`
  - batch 2 (8):  `add boy fact hat job net rest ten`
  - batch 3 (12): `about body country ever goal itself million online question since sweet vegetable`
  - batch 4 (12): `abroad bear chef dentist euro grammar introduce maximum pattern reasonable sir timetable`
  - batch 5 (8):  `ability beyond complex drama gentle method reality suffer`
- each batch is validated and accepted separately by the orchestrator (gate green + its files
  present) before the next is dispatched; the step is accepted only when all 50 files exist, the
  gate is green, and criterion 5's frozen command exits 0.
- No escalation on sensitive words is expected any more: QZ-8 removes them from the bank entirely,
  and the pilot list no longer contains any. QZ-2's stop-and-ask rule remains as a backstop.
- validation (frozen): `node scripts/check-quiz-bank.mjs && [ "$(ls public/quiz/*.json | wc -l)"
  = "50" ] && echo STEP-1.3-OK`
- tier: WORKER · depends on: 1.2 COMMITTED.

---

## PHASE 2 SKELETON — the full bank

2254 words, ~5000 items, batched worker packets, same QZ-1/QZ-2/QZ-3 contracts. Adds the
**completeness** criterion — and it must ask the RIGHT question this time: *every word she can be
quizzed on has an item*, i.e. every word in `public/audio/words/index.json` **minus QZ-8's 37
exclusions** has a `public/quiz/<lemma>.json`, and **no excluded word has one**. Both directions:
a missing file is a word she can claim but never be checked on, and a present file for an excluded
word is the owner's decision quietly reversed. Expected count: 2254 - 37 = **2217**. (The word-audio run's criterion 6 pinned a true-but-irrelevant
invariant and made a real defect look verified; see that run's journal.) Ends with a second owner
sample review.

## PHASE 3 SKELETON — the profile side

`strikes` on a word entry; `needsReview` flag set when a `known` word is re-tapped (D11); a
`quiz-answer` action on `/api/profile` that records right/wrong, resets strikes on a pass (D15),
increments at most once per session (D16), and demotes `known -> learning` at 3 (D1). Backward
compatible exactly as `context` was: a profile written before this run must still validate.

## PHASE 4 SKELETON — the quiz surface

`selectOptions(item, knownSet)` in `public/` (pure, exported, tested) returning 6 options — the
answer plus 5 of the 8 distractors, preferring words she knows, falling back to the frozen 8 (D19).
A speaker button per option reusing `.btn-say`. The after-chapter check of 4 words (D17) in
`reader.js`, and the quiz button inside `words.js` (D10). One cache bump `magic-vet-v12 -> v13`.

## PHASE 5 SKELETON — G1 candidates

`WORD_STATUSES` gains `candidate` (D18). G1's automatic promotion writes `candidate`, never
`known`; a quiz pass promotes `candidate -> known`, a fail returns it to `learning`. Her own claims
keep entering as `known` directly (D13, asymmetric trust).

## PHASE 6 SKELETON — deploy

The recipe in `.oplan/word-audio/journal.md`: record the outgoing deployment via `vercel inspect`
FIRST; `"$(npm prefix -g)/vercel" deploy --prod --yes`; md5 live vs WORKTREE for every changed
`public/` file; live `/sw.js` carries the new CACHE; a 401 probe on `/api/profile` proves the
function bundled; spot-check `/quiz/<lemma>.json` with a 404 negative control. Watch deploy size.

## RISKS

- **A bad item marks her wrong for being right.** The single worst outcome. Mitigated by QZ-2's
  explicit substitution check, QZ-1 rule 10, and the human gate in criterion 9 — not by the
  mechanical gate, which cannot see it.
- **~45 worker batches in phase 2 is a lot of dispatches.** Phase 1 exists to make sure the format
  is right before paying that cost.
- **`public/quiz/` adds 2254 more files to the repo** on top of 2254 clips. They are small JSON and
  regenerable, but review is only possible in aggregate.
