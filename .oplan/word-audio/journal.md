# Journal — run `word-audio`

## Phase 1 — "she can hear every word she collects" — ACCEPTED

Base `f5d8ae7`. Delivered as commits `791c19d` (1.3), `e139052` (1.4), `10d9cab` (1.5),
`9983137` (1.6), `28140be` (1.2). All nine acceptance criteria re-run by me in one gate:
`PHASE-1-ALL-CRITERIA-OK`. 197 pass / 0 fail, contrast 52 `ALL PASS`, 2254 clips, 26.8 MB.

### What the resume actually found

The handoff said step 1.2 was done and to verify 2254 clips. **It was not done: 454 existed and a
generator from the previous session was still running**, ~54 clips/min. I did not start a second
generator — that would have raced the live one and re-spent the owner's money. It finished on its
own at `wrote 2254, skipped 0`, zero retries.

### The defect the frozen gate would have passed (the important one)

Criterion 5 asks only that each file start `FF F1`/`FF F9`. **A valid ADTS header says nothing about
whether the clip contains speech.** There is no ffmpeg on this machine, but ADTS frames are
self-describing — 1024 samples each, and the sample rate is in the header — so durations are
computable in plain JS. The duration histogram was not a speech distribution:

```
 4fr(0.17s): 1     9fr(0.38s): 33    16fr(0.68s): 5
 5fr(0.21s): 1    10-15fr:      0    17fr(0.73s): 18
 6,7,8fr:    0                       19fr(0.81s): 30
```

A spike of 33 at *exactly* 9 frames with empty neighbours on both sides is a truncation artifact, not
fast speech. Confirmation: single-letter `a` takes 44 frames (1.88 s), so `university` in 9 frames
(0.38 s) is impossible; `check` at 4 frames is 170 ms, too short to contain the word. Four clips
(`car`, `seen`, `keyboard`, `skin`) were also ~97 B/frame against a normal ~325 — near-silence.

**36 clips affected**, including `car`, `check`, `road`, `thank`, `great`, `here`, `were`, `its`,
`plan`, `free` — common words a beginner taps constantly. The failure mode is a button that plays
0.38 s of nothing. WA-3 deliberately makes a missing clip *silent*, so nothing in the app, and no
local gate, would ever have reported it. She would have decided the button was broken.

Fixed by deleting the 36 and re-running the generator (resumable, so ~1 cent). 35 came back correct;
`chain` truncated a second time and needed one more attempt. Shortest clip is now 0.68 s and the
9-frame spike is gone. Originals kept outside the repo, in the session scratchpad.

**Lesson for the field guide: a format gate is not a content gate.** "Valid ADTS" was chosen because
it was mechanically checkable, and it passed 36 broken files.

### Cost: the third under-projection of this run

Measured from the finished set: **53.9 minutes of audio, ~$0.80**, against OD-C's approved ~$0.47
(31.2 min). OD-C's 0.832 s/word came from a 20-word probe; the true mean is 1.44 s/word. The run's
own record now reads: $0.37 -> $0.47 (owner caught it), 12 MB -> 26 MB (A7), 31 min -> 54 min (here).
Every one was an extrapolation from a small or unrepresentative sample, and every one was caught by
measuring the finished artifact. The money is already spent; this is recorded because the owner
approved a number that turned out to be 70% low.

### Amendments I had to make (all recorded in plan.md)

- **A8** — step 1.3's file list left the `api/profile.js` wiring with no test at all; the natural
  patch was a source-grep, which field-guide 4a says catches a missing decision and never a wrong
  one. Added an assertion to an existing handler test instead. Ledger unchanged.
- **A9** — ran 1.3-1.5 concurrently with 1.2's generation. The stated dependency was "so the suite
  total is stable", and 1.2 adds +0 tests, so it was vacuous; the file sets are disjoint.
- **A10** — criterion 6 demanded a test that WA-7's ledger forbade. Resolved in favour of the
  criterion (the gate gets stricter, not looser): **ledger 196 -> 197**. The test calls the
  generator's own `deriveWordList`, because re-deriving the set inside the test is verifying code
  against a re-implementation of itself — field-guide 6, the lesson that put a wrong count in all
  three bands. That required exporting it and guarding `main()` behind a direct-run check: the module
  ended in a bare `main()`, so importing it would have started generating audio.

### Smaller things worth knowing

- Commit `e0b23f1` from the previous session, labelled as an oplan doc correction, had silently swept
  in **115 audio files** that happened to exist mid-generation. Nothing is wrong with the tree (all
  2254 are tracked), but the commit does not say what it contains.
- `reader.js`'s `normalizeWord` strips `[^a-z]`, so a tapped `let's` normalises to `lets` — the one
  apostrophe word in the set is unreachable from the reader, and `lets.aac` does not exist. Its
  button is silently inert, which is WA-3's accepted behaviour. `encodeURIComponent` is still in
  place for the dictionary path, where the real lemma can appear.
- `sentenceFor` now runs inside the save handler's `try` **before** the POST, so a throw there would
  skip the save. It cannot throw in practice (`String()` coerces everything) and the pre-existing
  `catch` was already silent, so behaviour on failure is unchanged.
- The step 1.5 worker caught a genuine contradiction in my own packet: I asked it to assert no
  `color-mix()` anywhere in `words.js`'s `VIEW_STYLE`, but the pre-existing `.word-badge` rules
  already use it, so that check could never have passed. It scoped the check the way my validation
  script actually did and flagged the discrepancy instead of quietly widening or dropping it.

### Verification stance

Every worker claim was re-run by me, not taken on report. Two worker "seen to fail" proofs were
weaker than they looked and I re-did them: step 1.4's stash test failed the whole *file* to load
(193 -> 187, `fail 1`) rather than exercising the assertions, so I reverted `styles.css` alone and
confirmed the test fails as an assertion (192 / `fail 1`). Hebrew was never anchored on terminal
output: the frozen strings live in a scratchpad file, workers copied from the file, and I verified
byte-equality with `grep -F -f` plus a `comm` of every non-ASCII run before and after — nothing
removed or altered, additions exactly the frozen tokens.
