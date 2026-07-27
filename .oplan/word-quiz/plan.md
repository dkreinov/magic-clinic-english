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
13. **(NEW, and a hazard D22 CREATED) the gloss must not name any of the item's own distractors.**
   Compared by resolved lemma, so `towns` catches the distractor `town`. While `sense` was private
   editorial metadata this was harmless; the moment D22 put it on screen beside the options, a gloss
   reading *"the PART that is left over"* next to an option `part` points her at a wrong answer in
   the item's own explanation. NINE shipped glosses did this — found by the R3 worker, not by me.
   **Banned outright, not "unless the mention is contrastive".** The five survivors were all
   negations (`"correct and not wrong"` beside the option `wrong`), negation is the first thing an
   ESL learner drops when skimming, and "is this mention contrastive?" is a human judgement that
   will not hold across phase 2's ~3150 glosses where a mechanical ban will. Rewording costs a
   clause and has never yet blocked a gloss.
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
RE-FROZEN AFTER THE AUDIT: R1+R2+R3-code +6 -> 224, then rule 13 +1 -> **225**. The six are: the REAL bank gates green;
rule 12; rule 4 hardened; rule 11; rule 9 hardened; and a NON-VACUOUS `== null` guard test.
Both audit-found test gaps are verified closed by mutation: deleting `public/quiz/` now fails a
test (it did not before), and neutralising the guard now fails a test (the old one asserted on
`gave`, which has no band entry, so it passed either way).

**RULE 11 IS DEFERRED IN THE GATE, NOT IN THE CONTRACT.** `lib/quiz-item.js` returns rule 11 as a
real error. `scripts/check-quiz-bank.mjs` downgrades it to a printed warning via `DEFERRED_RULE`
and prints `RULE-11 PENDING: <n> items`, so the 8 pre-D22 glosses do not turn the gate red before
R3 rewrites them. **Deleting the `isDeferred` branch re-arms it, and R3 must do exactly that.** A
deferred rule that is never re-armed is a gate that does not gate.

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

## PHASE 2 — CANCELLED AS A PHASE (D23). It is now a recurring operation.

**Do not plan or dispatch "the full bank".** D23 reversed D8: the bank starts at the 50 pilot words
and grows on demand. Building all 2217 up front was measured at ~55M tokens and ~45 agent-hours,
against a steady-state top-up cost of ~9,000 tokens and ~70 s per word.

**THE TOP-UP OPERATION** (run weekly, not daily — 3 words costs 26k/word, 25 words costs 11k/word,
and weekly means one deploy rather than seven):

1. Read her profile; take the words with `status: "known"` that have no `public/quiz/<lemma>.json`.
2. Drop any word in QZ-8's 37 exclusions. Never generate those.
3. Generate in one batch under QZ-1/QZ-2, D21, D22 and the pin test — the same contracts phase 1
   froze, unchanged.
4. **Verify with N independent adversarial passes, not one.** MEASURED in phase 1: a single pass
   finds only about half the leaks, and two passes agreed on 53% of each other's findings.
5. Gate green, then deploy.

**THE COMPLETENESS CRITERION INVERTS, and this is the one to get right.** It no longer asks "do
all 2217 words have a file". It asks: **does every word she has CLAIMED have an item?** — measured
against her profile, not the manifest. Both directions still matter: a claimed word with no item is
a word she can never be checked on, and a file for a QZ-8 word is the owner's decision quietly
reversed. (The word-audio run's criterion 6 pinned a true-but-irrelevant invariant and made a real
defect look verified. A count against the manifest would be exactly that mistake again — it would
report 2167 missing files as a failure while the thing that matters, her claimed words, was fine.)

**Phase 4 must tolerate a missing item** — she will claim a word days before its item exists. The
quiz skips those silently rather than breaking.

## PHASE 3 — the profile side (strikes, needsReview, quiz-answer) — PLANNED, NOT YET REVIEWED

Base: commit `eddb350`, tree clean, `npm test` = `# pass 225 / # fail 0`.

GOAL: build the correction term. **Nothing she can see changes in this phase** — the UI is phase 4
— so the only thing that can go wrong is invisible: a wrong write into the one file that holds
everything she has collected. Planned as a data-integrity phase, not a feature phase.

### ACCEPTANCE CRITERIA (frozen before execution)

1. `STEP-3.1-OK` .. `STEP-3.5-OK` all print, each re-run by the orchestrator in a clean tree.
2. `npm test` prints `# fail 0` and `# pass 257` (225 +6 +10 +4 +7 +5; see QZ-15).
3. **D16 HOLDS — three wrong taps in one sitting must never wipe a word.** Ten wrong answers for one
   word in ONE session leave `strikes === 1` and `status === "known"`. Run against `api/profile.js`,
   not the lib. This is the child-experience gate for the failure D16 exists to prevent.
4. **THE DEMOTION REACHES THE STORY.** Three wrong answers in three distinct sessions remove the
   word from `knownLemmaSet(profile)` — asserted against `lib/vocab.js`, the function
   `buildAllowedSet` actually consumes, NOT against the raw `status` string. (`status` is what we
   wrote; the set is what she experiences. Gating the field instead of the consumer is exactly the
   adjacent-measurement mistake this project has shipped three times.)
5. **A TAP IS NEVER A STRIKE (D11).** Five `word-tap` POSTs on a `known` word leave `status` known,
   `(strikes ?? 0) === 0`, and set `needsReview === true`.
6. **Nothing changed outside the seven allowed files — checked over the WHOLE tree, not a subset.**
   The reviewer found the earlier draft only diffed `public data docs assets scripts package.json`,
   so an edit to `lib/vocab.js` or **a DELETED existing test** (the cheapest way to make a ledger
   land) would have passed every criterion. FROZEN:
   **`git diff` is BLIND to untracked files — VERIFIED — and five of the seven expected files are
   NEW, so a `git diff`-based check would report an empty set and pass on any tree. Use
   `git status --porcelain`, which sees them.**
   ```bash
   changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | sort | tr '\n' ' ')
   expected='api/profile.js lib/profile.js tests/api-profile-quiz.test.js tests/profile-quiz-answer.test.js tests/profile-quiz-retap.test.js tests/profile-quiz-scenario.test.js tests/profile-quiz-schema.test.js '
   [ "$changed" = "$expected" ] || { echo "FAIL: [$changed]"; exit 1; }
   [ -z "$(git status --porcelain -- . ':(exclude).oplan' | grep '^ *D')" ] || { echo "FAIL: a file was DELETED"; exit 1; }
   echo CRIT-6-OK
   ```
   Run it against the working tree BEFORE committing the phase. Deleting an existing test is the
   cheapest way to make a ledger land, which is why the deletion check is separate and explicit.
   **AMENDMENT A5 (orchestrator, at the phase gate).** As frozen, this command reads the WORKING
   TREE — it assumed the whole phase would be committed in one go at the end. oplan's own procedure
   commits each step ON ACCEPTANCE, so by the time the gate runs the tree is clean and the command
   compares an EMPTY set against the expected seven and fails for the wrong reason. The PROPERTY
   being checked is unchanged; only the instrument moves, from the working tree to the phase's
   commit range:
   ```bash
   changed=$(git diff --name-only d9e0b9b..HEAD -- . ':(exclude).oplan' | sort | tr '\n' ' ')
   expected='api/profile.js lib/profile.js tests/api-profile-quiz.test.js tests/profile-quiz-answer.test.js tests/profile-quiz-retap.test.js tests/profile-quiz-scenario.test.js tests/profile-quiz-schema.test.js '
   [ "$changed" = "$expected" ] || { echo "FAIL: [$changed]"; exit 1; }
   dels=$(git diff --name-status d9e0b9b..HEAD -- . ':(exclude).oplan' | awk '$1 ~ /^D/ {print $2}')
   [ -z "$dels" ] || { echo "FAIL: DELETED: $dels"; exit 1; }
   echo CRIT-6-OK
   ```
   This is STRICTLY STRONGER than the original, and the reason matters: the working-tree form could
   only ever see the tree's final state, so an edit made and reverted across steps was invisible to
   it. The range form sees every file the phase touched. The plan's warning that "`git diff` is blind
   to untracked files" still stands but does not apply here — over a commit range a created file is
   tracked and shows as `A`, which is exactly why the untracked blindness bit the working-tree form
   and does not bite this one. **Verified green at the gate.**
   Recorded rather than quietly swapped, because changing an acceptance command after the work is
   done is precisely how a phase redefines "done" to fit what it built.
7. `.data/profile.json` does not exist and no step ran a server against the real data dir.
8. `node scripts/check-contrast.mjs` exits 0, prints `ALL PASS`, and **`grep -c '^PASS'` is exactly
   52** (QZ-7). The anchor is load-bearing: a naive `grep -c PASS` returns **53**, because the
   trailing `ALL PASS` line also matches. Verified — and this exact bug already cost a debug once in
   this run.
9. **HUMAN GATE — the phase does not close without it.** The orchestrator runs the QZ-16 transcript
   and puts its output verbatim in front of the owner, who explicitly approves. Criteria 1-8 being
   green is NOT sufficient. **The summary handed to the owner must be true** — phase 1 closed once
   on a false assurance and had to be re-opened.

**WHAT NO MACHINE CAN CHECK HERE, stated plainly:** whether 3 strikes / one-per-session / a-pass-
wipes-the-slate is the policy the owner wants her to live with; whether her REAL profile still loads
(D25 — the owner skipped that test, phase 6 carries a backup instead); whether phase 4 will mint a
genuinely new `sessionId` per sitting (QZ-11 pushes that into phase 4's criteria in advance); and
whether the demotion is *visible*, which D1 requires and phase 4 owns.

**D25's RESIDUE, and it is bigger than I told the owner.** I said "the cheap half is kept — step 3.1
still asserts a profile in today's shape validates". The plan reviewer showed that is weaker than it
sounds: **`validateProfile` is NEVER called at runtime** (verified), so proving it accepts an old
shape proves nothing about the path that actually loads her file. The real breaking direction is
`GET` → `migrateWordKeys` → `saveProfile`, which RUNS on every load and copies **named fields only**.
My first attempt to patch this was rejected by the plan reviewer as trivial: an old-shape entry that
does NOT merge already survives via `{...entry}` and `tests/profile-mutations.test.js:184` already
asserts it, while one that DOES merge cannot survive byte-identically (`taps` sum). **Two real
assertions replace it:**

- **step 3.2** — a NEW-shape entry as the NON-SURVIVING side of a merge must not lose its six keys
  (the named-fields-only branch is exactly where they would vanish). This is the inverse of what I
  first wrote, and it is the direction that actually destroys data.
- **step 3.4** — write an OLD-SHAPE profile into the temp `DATA_DIR`, issue a real `GET`, and assert
  the stored bytes are UNCHANGED and no save occurred. `loadProfile → migrateWordKeys → conditional
  saveProfile` is the only path that ever touches her file, and a lib-level test proves the function,
  not the path.

Both fit inside budgets the steps already have. This is NOT the elaborate end-to-end criterion the
owner cut under D25 — it is the minimum that makes the closure summary TRUE, and phase 1 closed once
on a summary that was not.

### NEW FROZEN CONTRACTS

**QZ-9 — the word entry after phase 3.** Gains exactly SIX optional keys and loses nothing:
`strikes` (int ≥ 0, absent means 0) · `needsReview` (bool, absent means false) · `lastQuizAt`
(parseable date string) · `lastStrikeSession` (string ≤ 64) · `quizRight`, `quizWrong` (ints ≥ 0,
absent means 0 — D24).
**NO BACKFILL, EVER.** No migration writes these onto entries that never had them; an entry gains a
key only when the action owning it runs on that word. This is what makes loading an old profile a
no-op read (D25) and keeps `defaultProfile`, tap-creation and claim-creation byte-identical.
`validateProfile` is **type-strict and range-lenient**: wrong type → `words.<lemma>.<key>: ...`;
absent → valid; `strikes: 99` → valid (a policy change must never invalidate a stored profile).
Unknown keys keep being ignored, as `context` is. `WORD_STATUSES` does not change (D18 is phase 5).

**QZ-10 — the `quiz-answer` action.** POST `/api/profile`
`{ action, lemma, correct, sessionId }`. **`lemma` is normalised with `String(lemma).trim()
.toLowerCase()` — as every sibling action does — and then looked up DIRECTLY in `profile.words`.
`resolveLemma` is NOT called.** Phase 4 sends a key it read out of the profile. Deriving it would
repeat the phase-1 failure shape — a lossy transform that fails open, except here it fails open by
striking a word she was never asked about. `correct` is a strict boolean (`"false"`, `0`, `1` are
400s, never truthiness). Response is the standard envelope, unchanged: `200 {ok, data:<profile>}`.

**WHICH LAYER VALIDATES — frozen, because the reviewer found both layers could claim it.**
`api/profile.js` performs ALL FOUR checks and returns the 400 itself; `applyQuizAnswer` is a pure
function that ALSO throws on the same four conditions (so the lib is not silently corruptible from
a future caller), but the handler must never rely on catching it. **Precedence when several are
wrong, checked in this order:** `lemma` → `sessionId` → `correct` → existence. Each returns 400 and
**writes NOTHING** — no `saveProfile`, so `meta.updatedAt` does not move either.

| condition | `error` string | thrown message from the lib |
|---|---|---|
| `lemma` missing / not a string / blank after trim | `lemma required` | `/lemma required/` |
| `sessionId` missing / not a string / blank / **> 64 chars** | `session required` | `/session required/` |
| `correct` not exactly `true` and not exactly `false` | `answer required` | `/answer required/` |
| no entry at that key in `profile.words` | `unknown word` | `/unknown word/` |

The >64 rule lives HERE, at the boundary, and is a 400 — never a truncation. `validateProfile` does
NOT enforce the length (QZ-9 is range-lenient), so a stored profile can never become invalid because
the limit later changes.

**QZ-11 — what a "session" is (D16 never defined it; this is the record gap that forced this
contract).** A **client-minted opaque string**. The server never invents one, never derives one from
a clock, compares only string equality. **REQUIRED, and it fails CLOSED** — missing/blank is a 400,
never "treat as a new session", because that is precisely the three-wrong-taps-wipe-a-word failure
D16 exists to prevent, and it would be silent. Invariant, stated so it is testable: *within one
`sessionId` a word's `strikes` can rise by at most 1 net* — a strike is skipped iff
`lastStrikeSession === sessionId`, and a PASS clears `lastStrikeSession`, so wrong→pass→wrong in one
session ends at 1.

**QZ-12 — the strike state machine.** `applyQuizAnswer(profile, {lemma, correct, sessionId, now})`.
`now` is an ISO string supplied by the caller (never `Date.now()` inside, so tests are deterministic).

**THE TABLE IS EXHAUSTIVE AND NON-OVERLAPPING. Exactly one row fires per event.** (The plan
reviewer found the earlier draft had "wrong, new session" and "reaching 3" both matching the same
event with contradictory cells — and that if `deleted` won, the demoting session would be re-armed
and a 4th wrong answer inside it would strike again, breaking D16. Rows 2 and 3 below are now
mutually exclusive on the resulting count.)

| # | event | strikes | status | needsReview | lastStrikeSession | lastQuizAt | counters |
|---|---|---|---|---|---|---|---|
| 1 | correct (D15) | set 0 | unchanged — **never promotes** (D13) | set false | **delete** | set `now` | `quizRight`+1 |
| 2 | wrong, new session, result **< 3** | +1 | unchanged | set false | set `sessionId` | set `now` | `quizWrong`+1 |
| 3 | wrong, new session, result **>= 3** (D1) | set 0 | `known`→`learning`; `learning` stays | set false | **set `sessionId`** | set `now` | `quizWrong`+1 |
| 4 | wrong, same session (D16) | unchanged | unchanged | set false | unchanged | set `now` | `quizWrong`+1 |
| 5 | `mark-known`, entry EXISTS (re-claim, D2) | **delete** | set `known` | **delete** | **delete** | unchanged | untouched |
| 6 | `mark-known`, NO entry (first claim) | **key not added** | `known` | **key not added** | **key not added** | **key not added** | **not added** |
| 7 | `word-tap` on `known` (D11) | untouched | untouched | set **true** | untouched | untouched | untouched |
| 8 | `word-tap` on `learning`/new | untouched | untouched | **key not added** | untouched | untouched | untouched |

**"set X" means assign; "delete" means `delete entry.key`; "key not added" means the key must not
appear at all** (absent ≠ false, and it is what keeps existing entries byte-identical). Row 6 is
what resolves the contradiction the reviewer found between row 5 and QZ-9's no-backfill rule: a
FIRST claim creates the frozen 6-key entry and nothing more.

**Row 3 is `>= 3`, NOT `== 3`.** QZ-9 stores `strikes: 99` as valid (range-lenient) and QZ-14's
`max` can carry a large value through a merge, so an `== 3` branch would leave such a word matching
NO row and therefore **permanently un-demotable, silently** — a fail-open in the one function whose
entire job is to demote. Found by the plan reviewer on the second pass.

**Row 3 keeps `lastStrikeSession = sessionId`, deliberately.** Deleting it at the demotion would
re-arm that same session and let a 4th wrong answer in the same sitting strike the freshly demoted
word — two strikes in one session, exactly what D16 forbids.

**Row 5 DELETES rather than zeroes, and that is not cosmetic.** VERIFIED in
`public/views/words.js:150`: the claim button renders only when `status === "learning"`, so
re-claiming a `known` word is unreachable from the UI. Row 5's only real production effect is
therefore what it does to OLD-SHAPE entries on the app's hottest write path — and "set 0 / set
false" would quietly add the new keys to entries that never had them, i.e. **a backfill by another
name, contradicting QZ-9.** Deleting is behaviourally identical for every reader (absent means 0,
absent means false) and keeps the no-backfill promise literally true. A step-3.2 test must assert
the keys are ABSENT, not zero.

**`now` is OPTIONAL and defaults inside the lib** to `new Date().toISOString()`, exactly as every
sibling mutator behaves. The handler does NOT pass it; tests DO, so they stay deterministic. Frozen
because the reviewer found the gap: if the lib had required it and the handler omitted it,
`lastQuizAt` would be assigned `undefined`, `JSON.stringify` would drop the key, and the field this
whole fix exists to create would silently never be written.

`0 ≤ strikes ≤ 2` after any answer — it means "failures since the last pass, claim or demotion".
Resetting at the demotion is what makes D15's "three failures with no success between" true and
stops a demoted word demoting again on its first slip. **A re-claimed word starts clean** (D2: her
claims are honest mistakes, not gaming). **Counters always move, even on a skipped strike** (row 4)
— they count ANSWERS, not strikes. `lastQuizAt` moves on every answer including a skipped one,
because phase 4's "longest-unseen" ordering must see that the word WAS asked.

**QZ-13 — phase-3 non-goals.** No UI. **No change to `public/` at all**, therefore no `CACHE` bump.
No `candidate` (phase 5). No promotion. No option selection or ordering (phase 4). No quiz LOG (D24
froze counters, not a log). **No reading of `public/quiz/` from `api/` or `lib/`** — the server stays
ignorant of the bank so a missing item is phase 4's silent skip (D23), not a 400. No deploy. No
`docs/growth.md` edit (its "nothing ever demotes" line becomes false only when phase 4 ships — a
phase 6 chore). No new dependency. No `scripts/`.

**QZ-14 — the merge rule in `migrateWordKeys`.** It runs on EVERY profile load and copies **named
fields only** — verified — so anything unnamed is silently dropped.

**Treat every absent key as its documented default before merging** (`strikes` 0, `needsReview`
false, `quizRight`/`quizWrong` 0, `lastQuizAt`/`lastStrikeSession` absent). The reviewer found the
earlier draft undefined for `undefined` operands; this closes it.

| key | rule | when neither side has it |
|---|---|---|
| `strikes` | **max** — a merge must not launder away a failure | key not added |
| `needsReview` | OR | key not added |
| `quizRight`, `quizWrong` | **sum** | key not added |
| `lastQuizAt` | the later parseable date; if only one is parseable, that one | key not added |
| `lastStrikeSession` | the one belonging to the entry with the later `lastQuizAt`; **if neither has a parseable `lastQuizAt`, keep `existing`'s own value** — `existing` being the base object the merge accumulates onto, NOT "the lemma" and NOT the alphabetically-first key, which need not be either | key not added |

**AMENDMENT A4 (orchestrator, at 3.2 dispatch time) — the `lastStrikeSession` row had a case with
no answer.** It says "the one belonging to the entry with the later `lastQuizAt`". It does not say
what happens when that winning side has a later `lastQuizAt` but **no `lastStrikeSession` at all**,
while the losing side has one. Decided: **the winning side's value wins even when it is ABSENT — the
merged entry then has no `lastStrikeSession`.** Not a coin-flip: row 1 DELETES `lastStrikeSession`
and sets `lastQuizAt`, so "later `lastQuizAt`, no session id" means *the most recent thing that
happened on that side was a PASS*, and a pass is exactly what is supposed to clear the id. Carrying
the older side's id forward would resurrect a session a pass had already ended, and the next wrong
answer would be silently skipped as a duplicate. The rival reading fails safe against a wrongful
demotion, which is why it is tempting — but it does so by discarding a real event, and this one
discards nothing.
**Implementation trap this creates, and a test must pin it:** the `lastStrikeSession` decision reads
BOTH sides' `lastQuizAt`, so it must be computed **before** `existing.lastQuizAt` is overwritten.
Compute the two dates first, then assign.

**THE DANGEROUS MERGE DIRECTION is a NEW-shape entry arriving as the NON-surviving side** — the
branch copies named fields only, so all six new keys vanish unless QZ-14 names them. That, not the
old-shape case, is what a test must cover: an old-shape `existing` merged with a new-shape `entry`
must end up carrying the new-shape entry's `strikes`, counters and flags. (The plan reviewer showed
my first attempt at this test was trivial — a non-merging old entry already survives byte-identically
via `{...entry}`, and `tests/profile-mutations.test.js:184` already asserts it.)

Its two existing invariants stand and must be re-proved: never drops a word, and **idempotent** —
running it twice changes nothing (which the sum rule makes non-trivial, so the test must merge, then
re-run on the merged result, and assert equality).

**QZ-15 — the test ledger.** 225 → 231 → 241 → 245 → 252 → **257**. MEASURED: 220 top-level
`test()` calls + 5 subtests in `dev-server.test.js` = the 225 `npm test` prints, so **every new test
must be a FLAT top-level `test()`** or the ledger stops being checkable.

**ONE TEST MAY CARRY SEVERAL ASSERTIONS. The COUNT IS DERIVED FROM THE LIST BELOW, not the other
way round** — the reviewer's second-pass point was that freezing a number before any list exists
just moves the problem to packet time, where the list gets fitted to the number by whoever set it.
So the lists are frozen HERE, in the plan, and each step's count is simply their length. **A step
that hits its count while missing a listed item is a FAILED step; the auditor is told to check the
LIST.**

- **3.1 (6):** old-shape profile validates · all six new keys with legal values validate ·
  `strikes` rejects `"2"`/`-1`/`1.5`/`null`/`NaN` with a `words.<lemma>.strikes` prefix ·
  `needsReview` rejects `"true"`/`1`/`null` · `lastQuizAt` unparseable and `lastStrikeSession`
  non-string rejected · `quizRight`/`quizWrong` reject non-integers, and `strikes: 99` is VALID.
- **3.2 (10):** rows 1-4 of QZ-12, one test each (4) · row 3 fires on a pre-existing `strikes: 99`
  (the `>= 3` guard) · rows 5+6 — re-claim DELETES the keys, first claim adds none (`deepStrictEqual`
  on the frozen 6-key entry) · the four throws, each leaving the profile unmodified · QZ-14's six
  merge fields · **a NEW-shape entry as the NON-surviving merge side keeps its keys** · idempotency
  re-run on the merged result. Every test also asserts `validateProfile(profile).ok`.
- **3.3 (4):** re-tap a `known` word flags it · re-tap a `learning` word adds NO key · first-ever tap
  yields the exact frozen 6-key entry · five taps on a `known` word leave it in `knownLemmaSet`.
- **3.4 (7):** happy path persists across a GET · three wrongs / three sessions demote · three wrongs
  / one session do not · a pass resets · the four 400s with exact strings **and byte-identical file
  after each** · an inflected lemma 400s as `unknown word` · **an OLD-SHAPE profile survives a real
  GET with its bytes unchanged** (the D25 replacement).
- **3.5 (5):** all-correct week changes nothing · tapping to hear a word is not a strike · three bad
  days demote, asserted via `knownLemmaSet` · six wrongs in one sitting do not · wrong/wrong/right/
  wrong/wrong across five sessions never demotes (D15).

**QZ-16 — the criterion-9 transcript.** **The ORCHESTRATOR writes this as a script file into
`.oplan/word-quiz/transcript.mjs` BEFORE step 3.4 is dispatched, not a worker** — the owner's
approval must not rest on a command the implementer wrote. It runs the real handler against a temp
`DATA_DIR` (`os.tmpdir()` from inside node — field guide 6), **`delete process.env.APP_CODE` and
`delete process.env.BLOB_READ_WRITE_TOKEN` first** (field guide 5: `isAuthorized` returns TRUE only
when `APP_CODE` is unset, so a developer machine that exports it gets 401s), and prints one
plain-English line per event:
`<event> -> <lemma>: status=<s> strikes=<n> needsReview=<b> right=<n> wrong=<n>`,
ending with the sorted `knownLemmaSet`.

FROZEN event script: claim light/fair/method · tap light ×2 · quiz light WRONG s1 ×3 · quiz light
WRONG s2 · quiz fair RIGHT s2 · quiz light RIGHT s3 · quiz light WRONG s4/s5/s6 · quiz method WRONG
s6. **The LITERAL expected stdout is frozen beside the script in
`.oplan/word-quiz/transcript-expected.txt`, and the orchestrator DIFFS the two before the output
goes anywhere near the owner.** Prose ("one right answer wipes the slate") is a paraphrase, and
comparing against a paraphrase is still a judgement call — which is precisely the failure that made
phase 1 close on a false assurance. If the diff is non-empty the phase does not reach the gate.

The owner then reads the transcript and answers one question: *is this what you want her week to
feel like?* What it should show: the three wrong taps in sitting s1 cost her ONE strike, not the
word; the right answer in s3 wipes the slate; only the three separate bad days s4/s5/s6 demote
`light`; `method` sits at one strike; `fair` is untouched.

### STEPS

**3.1 — the schema, and only the schema.** `lib/profile.js`, `tests/profile-quiz-schema.test.js`
(NEW). Validate the six new optional keys; a profile in today's shape still validates. No behaviour
change. Non-goals: no `applyQuizAnswer`; no change to `applyWordTap`/`markWordKnown`/
`migrateWordKeys`/`defaultProfile`; **no backfill**; no range check on `strikes`.
**AMENDMENT A3 (orchestrator, at dispatch time).** As frozen, that last non-goal contradicted this
step's own assertion list, which requires `-1` to be REJECTED and `99` to be VALID. Resolved, and
this is the wording the packet carries: the check is **`Number.isInteger(v) && v >= 0`** for
`strikes`, `quizRight` and `quizWrong`. Non-negative integer-ness is part of the TYPE (QZ-9 says
"int ≥ 0"); "no range check" means **no UPPER bound and no policy bound** — `strikes: 99` and
`strikes: 3` are both valid, because a policy change must never invalidate a stored profile.
**+6 tests → 231.** Validation: `node --check lib/profile.js`, `npm test` shows `# pass 231` and
`# fail 0`, `echo STEP-3.1-OK`. Tier WORKER · depends on nothing.

**3.2 — `applyQuizAnswer`, the re-claim reset, the merge rule.** `lib/profile.js`,
`tests/profile-quiz-answer.test.js` (NEW). The whole state machine as a pure function, plus QZ-14.
Non-goals: no HTTP; **no promotion of any kind**; no `resolveLemma`; no change to `applyWordTap`.
Every test also asserts `validateProfile(profile).ok`. **+10 → 241.** Tier WORKER · depends on 3.1.

**3.3 — D11: a re-tap flags, it never strikes.** `lib/profile.js`,
`tests/profile-quiz-retap.test.js` (NEW). `needsReview = true` iff the existing entry is `known`.
Non-goals: a tap never touches `strikes`/`status`/`lastQuizAt`; a tap on a `learning` word must add
**no key at all** (absent ≠ false — it keeps existing entries byte-identical). **+4 → 245.**
Tier WORKER · depends on 3.2.

**3.4 — the `quiz-answer` action.** `api/profile.js`, `tests/api-profile-quiz.test.js` (NEW).
Wire QZ-10 in; every validation direct, every failure path writing nothing. Non-goals: no
`resolveLemma`; must not create a word entry; must not read `public/quiz/`; no change to the other
four actions or to GET. **`withTempDataDir` is NOT a shared module — it is copy-pasted in six test
files (verified). The packet must therefore QUOTE the harness (`withTempDataDir`, the mock req/res)
verbatim from `tests/api-profile-post.test.js`**, because the step's file list does not permit
reading it and a worker told to "use the existing harness" would either guess or wander outside its
boundary. Then verify real `.data/` stayed empty. **+7 → 252.** Tier WORKER · depends on 3.3.

**3.5 — the child-experience pass, by a worker that did NOT write the code.**
`tests/profile-quiz-scenario.test.js` (NEW) only. Given the CONTRACTS and criteria, never steps
3.1-3.4's packets. **Every test must be run against a MUTATED implementation first and the report
must carry the mutation and its failing output** — a test never seen to fail is not evidence, and
phase 1's whole lesson is that the author's own green suite proves only what the author assumed.
It may temporarily edit the implementation to produce that evidence and **MUST restore it; the
orchestrator verifies with `git diff --quiet lib/ api/`, not a self-reported hash** (the reviewer
noted a worker hashing its own file after mutating proves nothing). It may not fix a defect it
finds — it REPORTS, and the orchestrator re-opens the owning step. Asserts through `knownLemmaSet`
and the real handler, not the raw field.
**On independence, honestly:** the other workers' test files are in the repo and `npm test` runs
them, so "forbidden to copy" is unenforceable by any command. The teeth are the mutation evidence —
a copied assertion that was never seen to fail cannot produce it. Stated here rather than pretended
away. **Like 3.4, its packet must QUOTE `withTempDataDir` and the mock req/res verbatim**, because
it also asserts through the real handler and its file list permits only its own new test file.
**+5 → 257.** Tier WORKER · depends on 3.4.

### RISKS
- **A wrongful demotion — she is right and the app takes the word away.** The worst outcome. Guarded
  by the required, fail-closed `sessionId` (QZ-11), criterion 3, and D15's reset.
- **The session guard fails OPEN** (missing id treated as new) → three taps wipe a word. Guarded by
  QZ-10's 400 and a step-3.4 test asserting no write on a rejected action.
- **The session guard fails CLOSED forever and everything stays green** — a phase-4 client sending a
  constant id makes every word un-strikeable and the correction loop never fires. **No phase-3 test
  can see this.** Guarded only by QZ-11 writing a criterion into phase 4 now.
- **Her live profile breaks.** Guarded by no-backfill, unchanged `defaultProfile`, type-strict/
  range-lenient validation — and, since D25 skipped the end-to-end test, by phase 6's backup.
- **A read that writes** — `GET /api/profile` creates a profile when absent. Temp `DATA_DIR`
  everywhere; criterion 7 verifies real `.data/` stayed empty.
- **The author's own suite proves only what the author assumed.** Guarded by step 3.5 being a
  separate worker writing from contracts with mandatory mutation evidence.
- **A merge quietly drops a strike or a counter.** `migrateWordKeys` copies named fields only.
  Guarded by QZ-14 and a step-3.2 test that also re-proves idempotency.

## PHASE 4 SKELETON — the quiz surface

`selectOptions(item, knownSet)` in `public/` (pure, exported, tested) returning 6 options — the
answer plus 5 of the 8 distractors, preferring words she knows, falling back to the frozen 8 (D19).
A speaker button per option reusing `.btn-say`. The after-chapter check of 4 words (D17) in
`reader.js`, and the quiz button inside `words.js` (D10). One cache bump `magic-vet-v12 -> v13`.
**D22: the item shows the `sense` gloss ABOVE the sentence.** That is what makes a distractor which
fits the sentence but not the meaning stop being a correct answer, and it is the whole reason the
pilot is shippable.

**FOUR OBLIGATIONS PHASE 4 INHERITS, written down now so they are not rediscovered late:**
1. **It must mint a FRESH `sessionId` per quiz sitting, and ship a test proving two sittings give
   two different ids.** A constant id makes every word permanently un-strikeable — the correction
   loop never fires and *every gate in this project stays green while it happens*. No phase-3 test
   can see this. (QZ-11.)
2. **It must tolerate a word with no quiz item** and skip it silently (D23). She will claim a word
   days before its item is generated.
3. **The ordering rule needs fields that did not exist.** design.md says "flagged, then recently
   claimed, then longest-unseen", and the record never said which field each key reads — a record
   gap the phase-3 planner found. Resolved: *flagged* = `needsReview`, *longest-unseen* =
   `lastQuizAt` (NOT `lastSeen`, which a tap moves). **"Recently claimed" has NO field** — nothing
   records when a word was claimed — so phase 4 must either add one or drop that key and say so.
4. **A word with `strikes > 0` must be prioritised for re-asking.** Orchestrator decision, taken
   because `needsReview` is cleared by ANY answer (QZ-12): without this, a word sitting at 1 or 2
   strikes has no ordering key at all, so the third strike may never arrive and D1's demotion
   silently never fires.

## PHASE 5 SKELETON — G1 candidates

`WORD_STATUSES` gains `candidate` (D18). G1's automatic promotion writes `candidate`, never
`known`; a quiz pass promotes `candidate -> known`, a fail returns it to `learning`. Her own claims
keep entering as `known` directly (D13, asymmetric trust).

## PHASE 6 SKELETON — deploy

**FIRST CRITERION, BEFORE ANY DEPLOY THAT CAN WRITE THE NEW PROFILE FIELDS (D25): BACK HER PROFILE
UP.** Capture the live profile to a timestamped file and prove the capture is non-empty, parseable
JSON, and contains her `words` map. There is no backup mechanism in this repo and no undo; the
owner skipped the end-to-end compatibility test, so a recoverable failure is the mitigation that
replaces it. A deploy that can write to her collection without a captured copy is the one
irreversible act in this whole run.

Second criterion: a post-deploy `GET /api/profile` against production must return 200 and validate
— the only check that ever runs against her REAL data rather than a fixture.


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
