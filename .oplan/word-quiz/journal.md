# Journal — run `word-quiz` (W5b)

## Planning — CLOSED, three review rounds

Design produced by a `grill-me` pass: 13 questions asked one at a time, all answered by the owner.
The grill's own value showed up in question 1, where I framed "what happens when she fails?" as a
parenting decision and it turned out to be a control-loop decision — `mark-known` writes
`status:"known"`, `knownLemmaSet` collects it, and `buildAllowedSet` feeds it into the story prompt.
So "never demote" was not the kind option; it was the one that silently makes her stories harder.
That also meant W5a, shipped hours earlier, had opened a one-way write into story generation with no
correction path. The quiz is the missing half of it, not a feature on top.

Five questions the grill left open were decided at plan time as D15-D19, because dispatching a step
containing an open question is a bug.

### The plan reviewer earned its keep three times over

**Round 1 — 6 findings, all valid, all fixed.** The two that mattered:
- The gate's tests needed a fixture directory but no CLI for pointing at one was specified — the
  worker would have invented the interface the tests then had to match. Frozen as `--dir <path>`.
- QZ-1 rule 4 (every token of a filled sentence must resolve into the manifest) is far harsher than
  it reads. VERIFIED: `after`, `children`, `men`, `women`, `feet` are absent from the 2254-word set
  while `before`, `went` and `gone` are present. Workers would have failed batch after batch for
  reasons unrelated to item quality. QZ-2 now warns explicitly and requires self-running the gate.
It also caught a pos-exemption count I had guessed at 67 when it was 69 — my fourth loose number in
this project's history, and the reason the next fix was measured rather than estimated.

**Round 2 — 1 finding, and it was the important one.** Rule 8 said "the first comma-separated token
of the band entry's pos", which presumes one canonical row per lemma. There is no such row: 393
manifest lemmas have more than one band entry, and `play` even carries a malformed `"v player n"`.
It hit nearly every pilot word — `kind` is `n` in band1 and `adj` in band2. Rewritten as a SET union
across both bands, matched by intersection, which is also the linguistically correct test.

**Then I found one myself while checking the rewrite actually runs.** The frozen expression omitted
a null guard, and `String(null)` is the truthy string `"null"` — so a null `pos` would have produced
the set `{"null"}`, stopped the word being exempt, and then wrongly rejected every real distractor
against it. It changes the exempt count from 50 to 63. Executing a frozen expression is cheap;
believing it is not.

**Round 3 — 2 findings.** `validateItem(item, ctx)` structurally cannot check rules 2 and 9, which
need to see an item's siblings; split into `validateItem` (item-level) and `validateItemFile`
(file-level). And my "406 lemmas, 180 disagree" did not reproduce, because 406 counted lemmas
outside the manifest and "disagree" was never defined. Restated with unambiguous definitions and
re-measured: **393 with >1 entry, 336 with a pos union larger than 1.**

### The pattern this run is deliberately built against

Both defects the predecessor run shipped were passed by a mechanically-green gate: "valid ADTS
header" passed 36 clips containing no speech, and "filenames match the allowed set" passed a set
that did not match the words on screen. Both gates were chosen because they were easy to check.

The quiz has the same shape of risk, worse: a bad item does not fail loudly, it marks an eleven-year-old
WRONG FOR A RIGHT ANSWER, in a feature whose whole purpose is confidence. So phase 1 exists only to
put 50 real items in front of a human before ~45 worker batches are spent, and acceptance criterion
9 is a HUMAN gate that a green criterion 3 explicitly does not satisfy.

PLANNING METRICS
  plan review rounds: 3 (findings: 6, 1, 2 — all fixed in place, no amendments appendix)
  orchestrator-found defects in own frozen text: 1 (the null guard)
  numbers stated then corrected by measurement: 3 (67->69->63 exempt; 406->393; 180->336)
  field guide: 40/40 lines (within budget)
  steps planned: 3 · frozen contracts: 7 · acceptance criteria: 9 (one of them human)

## Correction before execution — the learner is 11, not 9

The owner corrected her age after planning closed and before any code was written. I had written
"9-year-old" into D9 and into QZ-2, which is a frozen contract every generation batch follows, so
this was not a cosmetic error: it governs which senses of a polysemous word are worth an item and
what "age-appropriate" means. Corrected in design.md, plan.md, journal.md and STATUS.md, and in the
one line of word-audio/journal.md that stated it as a fact.

Flagged to the owner rather than decided: D4 (six options) was argued partly on reading load for a
child who cannot read the distractors, which is a weaker argument at eleven. Eight options is now
more defensible. Left at six — the owner chose it and changing a locked decision on my own initiative
because a premise shifted slightly is exactly the "work redefines done" hazard.

## PHASE 1 CLOSED — the owner approved the sample (2026-07-27)

Criteria 1-8 verified green by the orchestrator in a clean tree: 218 tests / 0 fail, gate
`QUIZ BANK OK: 50 files, 71 items`, the file set exactly equal to QZ-5 with no QZ-8 word present,
71 items inside the 50-150 band, 10 of 10 polysemous words carrying >=2 items against a
requirement of 6, nothing changed outside `lib/quiz-item.js`, `scripts/check-quiz-bank.mjs`,
`tests/` and `public/quiz/`, and `.data/profile.json` still absent. Contrast still 52 ALL PASS.

Criterion 9, the human gate, was run as specified — `--sample 50`, output put in front of the
owner — and the owner approved and opened phase 2. The sample reached 40 of the 50 words, which is
only true because of amendment A2; under the stride as originally written it would have shown the
alphabetically-first 63% and stopped at `question`.

WHAT PHASE 1 ACTUALLY BOUGHT, which is the thing it existed for: the format was wrong when the
first 22 items were written, and nothing mechanical could tell. Every gate was green. It took the
owner's D21 decision plus three audit rounds to find that distractors chosen to be *impossible in
the slot* measure grammar rather than vocabulary, and then that `and`/`but` clauses pin nothing at
all. Seven separate leaks were found and fixed by hand — `clean`, `clear`, `count`, `because`,
`while`, `warm`, `wet` — every one of which would have marked an eleven-year-old WRONG FOR A RIGHT
ANSWER, and not one of which the gate could see. Had this run generated 2217 words first and
reviewed after, all of it would have been generated in the broken style.

PHASE 1 METRICS
  steps: 3 · frozen contracts: 8 (QZ-1..QZ-8) + D21 · acceptance criteria: 9, all met
  execution-time amendments: 3 (A1 rule 10 by lemma, A2 sampler stride, A3 numeral pos fold)
  owner decisions taken during execution: 1 (D21, same-class distractors)
  leaks found by audit that the gate could not see: 7
  senses deliberately abandoned rather than shipped leaky: 2 (`pattern` abstract, `bear` endure)
  worker batches dispatched: 7 (5 batches + 2 rework rounds), all returned green
  tests: 208 -> 218, exactly as QZ-6 froze

## D20 — the owner cut 37 words from the quiz

Asked how ~50 sensitive words should be handled, the owner answered "dont need these words there
are enough other words". Frozen as QZ-8: 37 words, no quiz file, ever. 1.6% of the bank.

Two things I did NOT do, both deliberately:

- **I did not apply it as broadly as my own scan.** The scan cast a wide net to FIND candidates and
  swept up ordinary vocabulary — `love`, `kiss`, `marry`, `hospital`, `sick`, `doctor`, `police`,
  `body`, `poor`, `pain`, `hurt`, `fight`, `danger`, `afraid`. Cutting those on a broad instruction
  would have been me over-reading it. The 37 are written out in full in QZ-8 so the owner can see
  exactly which words and trim or extend the list before phase 2 generates anything.
- **I did not extend it to the story.** These words are still in `buildAllowedSet`, so a generated
  chapter may still use them, and their audio clips still exist. Removing them from the STORY means
  filtering the allowed set, which is a different and much larger change. Flagged in D20, not
  assumed.

The frozen pilot list contained two of the excluded words, `battle` and `gay`. Replaced
deterministically by the next word in the same band section that is neither excluded nor already in
the list: `battle` -> `bear`, `gay` -> `gentle`. Both turn out to be better test material than what
they replaced — `bear` is polysemous (animal / carry / endure), and `gentle` carries a malformed
`pos` of `"adj gently adv"`, which exercises rule 8's first-whitespace-token reduction.

## Execution — phase 1

### A1 — rule 10 was frozen with a hole in it (step 1.1)

The step-1.1 worker was asked what in the contract it believed was wrong. It answered that rule 10
compares the answer's SURFACE FORM, so with answer `feel` the sentence
`"I ___ happy when the cat feels warm."` passes clean — while `feels` sits there handing an
eleven-year-old the answer. I reproduced it against the unfixed code before changing anything (it
returned `[]`, which is the evidence the hole was real), then amended rule 10 to compare RESOLVED
LEMMAS.

I amended a frozen contract rather than deferring it, for three reasons. The rule failed *its own
stated purpose* — "it would give the answer away" — so this is a defect, not a preference. QZ-1 is
an orchestrator contract, not one of the owner's D1-D14/D20 decisions, and this run has already
rewritten rule 8 in place twice on the same grounds; the journal's own line is "executing a frozen
expression is cheap; believing it is not". And step 1.1 is the cheapest moment it will ever be: the
gate did not exist yet and not one item had been written. Deferring to the criterion-9 human gate
would have meant generating 50 items under the loose rule and regenerating some of them after.

Tightening cannot over-fire, and that is structural rather than lucky: rule 4 already requires every
token of the filled sentence to resolve into the manifest, and `resolveLemma` tries an exact match
first, so any token that de-inflects into the answer *is* an inflection of the answer. `carpet`
stays `carpet` and never collapses into `car`; verified explicitly.

Two more constraints the same worker surfaced, both now written into QZ-2 because the phase-1.3
generation batches would otherwise have hit them blind: **the blank can never be the first word of a
sentence** (rule 6 tests the template, so a leading `___` starts with `_`), and **rule 7 is direct
manifest membership while rule 4 de-inflects** — `cats` is legal inside a sentence and illegal as a
distractor.

One claim from the same report did NOT hold up: it reported that `npm test` does not run the
contrast gate, having checked only `package.json`. `tests/background.test.js`, `reader-ui.test.js`
and `words-ui.test.js` all spawn `check-contrast.mjs`. The field guide was right. Worth recording
because the packet-hole question is valuable precisely when its answers are checked rather than
believed.

### A2 — the sampler would have shown the owner only the front of the bank (step 1.2)

The step-1.2 worker implemented the stride as `i * floor(total/n)`, which is the obvious reading of
"walk it with a fixed stride", and then flagged in its own report that such a walk ends at
`(n-1)*floor(total/n)` and never reaches the tail. It declined to choose and asked. That was the
right call, and the number it exposed is worse than it looks.

I measured it at the exact invocation acceptance criterion 9 mandates, `--sample 50`, across the
range criterion 5 permits (50-150 items). At 80 items — the most likely pilot total, 50 words at
1-3 items each — the sample was the alphabetically-FIRST 50 items, 63% of the bank. At 99 items it
was 51%. The owner would have read fifty real items, seen nothing wrong, and approved a bank whose
last third they never saw. The gate would have been green and the human gate would have been
green, and neither would have looked at `sweet`, `ten`, `timetable` or `vegetable`.

This is the third instance of this project's signature defect and the most dangerous one yet,
because the previous two were mechanical gates measuring something adjacent to what mattered —
here it is the HUMAN gate being fed a biased sample while presented as a sample of the whole.
Criterion 9 exists precisely because the machine cannot see meaning; a sampler that hides a third
of the bank quietly converts the one gate that can see meaning into another one that cannot.

Frozen as `Math.floor(i * total / n)`: 98-100% coverage at every total in range, still
deterministic, still strictly increasing. The regression test was run against the unfixed stride
first and failed on `got: aaa.json[0]`, which is the evidence that it tests anything at all.

### Batch 1 of step 1.3 — green, clean, and weaker than it should be

10 files, 22 items, gate green, all 10 of 10 words multi-sense (the batch required 6). I read all
22 items myself rather than trusting the green gate, and checked every distractor against every
blank: **no item marks her wrong for being right.** That is the property that matters most and it
holds.

The batch worker then volunteered the real problem, unprompted, when asked which items it least
trusted: its distractor strategy is *impossible in the slot* rather than *plausible but wrong in
context*. `light` "not heavy" is tested against `happy angry hungry thirsty sad tired noisy lazy`
— eight person-adjectives against a box. Nothing there can mark her wrong, and nothing there
requires her to know what `light` means either; she can solve it by asking which word can describe
a box at all. Safe and weak. That trade was deliberate and defensible — the contract names "a
distractor that also fits" as the worst failure — but it is a trade, it affects all 22 items, and
it would affect the remaining 40 identically. Escalated to the owner before batch 2 rather than
after all 50 exist, which is exactly why the plan put the polysemous batch first.

### D21 in practice, and the pin test that came out of it

The owner chose the harder distractors. Batch 1 was regenerated under D21 and came back much
stronger — `light` "not heavy" now sits against `big small wide round old new tall deep`, pinned by
`"The HUGE box was so light that the little girl could LIFT IT EASILY."`

Two things worth recording. First, the illustrative distractor set **I** put in front of the owner
to explain D21 was itself leaky: `big small old new wide round thin` against "the box was so ___
that the little girl could lift it" — `small` and `thin` both fit. The worker caught it and killed
`small` by adding `huge` to the sentence. The example used to sell the rule broke the rule, which
is a fair measure of how easy this failure is to commit.

Second, the audit found the general form of the defect. I checked the regenerated items myself and
found two where a distractor still fit — `"My mother will ___ the shop and choose what to sell."`
lets `clean` through, and `"...so her answer is ___."` lets `clear` through. The first generalised:
**a coordinated clause is not a pin.** `and`/`but` join two independent statements, so they
constrain the blank not at all; only `so`, `so that`, `so ... that`, `because`, `... enough to`,
purpose infinitives and verb/argument selection do. Handed back as a test — *does this distractor
make the sentence FALSE, or merely describe something else that is also possible?* — it found
three more genuine escapes and four weak pins that neither of us had seen. Five of the original 23
items had an `and` or a `but` as their only pin and every one of them leaked.

Frozen into QZ-2 as the pin test. Final batch 1: 23 items, gate green, 10 of 10 words multi-sense,
zero irregular give-aways, and no distractor I can find that fits its blank.

### A3 — `ten` had no legal item, and it was rule 8's fault (step 1.3, before batch 2)

Before dispatching batch 2 I measured the distractor pool for all 40 remaining pilot words rather
than discovering the tight ones the way the worker would have — one at a time, mid-batch. One word
came back at **3**: `ten`. Rule 7 demands exactly eight distractors and rule 8 demands they share a
part of speech, so `ten` was unsatisfiable. No legal item for it existed.

The cause is a data defect, not a language fact. The bands tag numerals three different ways:
`three six ten thousand` are `cardinal`, `two four five seven nine twelve twenty thirty forty fifty
hundred third` are `number`, `second` is `ordinal`, and `eight eleven million billion` are plain
`n`. So rule 8 held that `ten` and `four` share no part of speech. Folding `cardinal`/`number`/
`ordinal` to one value takes `ten` from 3 legal distractors to 30, all of them actual numbers.

Checked for collateral damage before accepting it: the exempt count is still 63, the >1-pos count is
still 336 — the two numbers this plan is pinned to and that three review rounds argued over — batch
1 re-gates green with no item changed, and `kind` is still `{adj,n}`, so the fold does not reach
past numerals. Nothing else is normalised; `unfriendly` is still mis-tagged `{adv}` and the
prepositions still lack `prep`, both reported by the batch-1 worker. Those constrain item quality
but block nothing, so they stay as they are.

Worth noting what found this: measuring the pool for all 40 words up front cost one command. Had I
dispatched batch 2 blind, the worker would have burned a long context discovering that eight legal
distractors for `ten` do not exist, and the likeliest failure mode is that it would have padded the
set with exempt words like `dragon` and `witch` to get past the gate — green, and absurd.

### A known contract gap, deliberately NOT closed: rule 10 and irregular forms

The same worker reported that rule 10 is blind to irregular inflections. Verified: `resolveLemma`
tries an exact manifest match first, so `ran` resolves to `ran`, never to `run`. MEASURED, the
blind spot is **29 manifest lemmas carrying 42 such forms**, and they are the highest-frequency
verbs in the language — `be do go have get make take see say think find know leave run come`.

I did not close it mechanically, and the reason is worth recording because the obvious fix is
wrong. An irregular-form table would map `left`->`leave` and `rose`->`rise` — but MEASURED, `left`
carries pos `{adj,adv,n}` in the bands and `rose` carries `{n}`. They are ordinary homographs, so
the table would wrongly reject `"I ___ my bag on the left side."` Disambiguating needs
part-of-speech-in-context, which is real NLP and far outside this phase. Trading a rare give-away
for a class of false rejections is the wrong direction for this project, where the worst failure is
rejecting something correct.

So it is handled by hand instead: QZ-2 now lists all 29 base/form pairs explicitly, and batch 1 was
scanned against that list and is clean. Phase 2 must decide whether ~5000 items can rely on a
by-hand rule; it is flagged there, not assumed.

Phase 2's completeness criterion was corrected in the same pass, because it would otherwise have
demanded a file for every one of the 2254 manifest words and failed on the 37 that must not have
one. It now checks BOTH directions against 2217: no excluded word has a file, and nothing else is
missing. That is the same class of error as the word-audio run's criterion 6 — a completeness rule
that does not know about a deliberate exception is a rule that will be "fixed" by undoing the
decision.
