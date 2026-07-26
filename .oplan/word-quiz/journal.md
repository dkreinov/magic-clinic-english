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
