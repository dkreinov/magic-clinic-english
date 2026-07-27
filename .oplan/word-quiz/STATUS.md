# STATUS — word-quiz (W5b)

**Where we are: THE QUIZ IS LIVE.** Deployed 2026-07-27 20:22 with your approval, in the hint
form you chose (D28). Her profile survived untouched — proven by reading it back: all 20 words,
every status unchanged, not even the last-modified stamp moved. One thing remains: **your phone
check** (the checklist is in the chat), then the phase closes and — as you asked — the backup
files are deleted.

## What got built this phase

Mika now gets asked. After every chapter she answers four quick questions — the word's meaning on
top, a sentence with a gap, six words she can read or hear. There is also a "בואי נתרגל מילים"
button in המילים שלי. Get a word wrong on three separate sittings and it goes back to
"learning" — and a kind line TELLS her so. Nothing is deployed yet; her app is unchanged until
phase 6.

```mermaid
flowchart LR
    A["chapter done"] --> B["4 questions<br/>meaning + sentence + 6 words"]
    B -->|right| C["slate wiped<br/>on to the story"]
    B -->|"wrong, 3rd<br/>separate sitting"| D["word back to learning<br/>and she is TOLD"]
    E["בואי נתרגל מילים<br/>button"] --> B
```

## Progress

| Phase | What | State |
|---|---|---|
| 1 | item format, checker, 50-word pilot | done — you approved it |
| 2 | the bank | grows weekly on demand; FIRST top-up is now a phase-6 requirement |
| 3 | profile: strikes and demotion | done — you approved the transcript |
| 4 | the quiz screens | done — you approved the screens |
| 5 | automatic promotion | deferred by you to a future run (design doc first) |
| 6 | deploy (backup + first top-up + your first real look) | **LIVE — waiting only on your phone check** |

## What the checking machinery caught this phase (all fixed before anything shipped)

- The plan itself: the after-chapter quiz would have run once and then never again (chapter 2
  onward) — caught by the plan reviewer before any code existed.
- An invisible blank line quietly added to the words page — caught by a checker, rejected, fixed.
- A test that would have stayed green while the app showed the "word taken back" message on every
  wrong answer — caught by a checker; the test now proves the message stays silent until the
  real third strike.
- Eight deliberate sabotage runs against the finished code: every one was caught by a test. An
  independent helper who never saw the code being written could not make it misbehave.

## What needs you

Nothing right now. You chose deploy-first; automatic promotion waits for its design doc. The
next thing you will see is the deploy plan in plain words — and the deploy itself will need you
at two points: the backup of her profile happens before anything ships, and you take the first
real look at the app afterwards.

## Honest limits

- No screen has rendered in a real browser this whole run — the tests check the text and
  structure, not the look. Your first look at the deployed app is the real look.
- Until the first bank top-up runs, the quiz only knows the 50 pilot words.

## What it costs

**No money.** No paid API, no live AI call in the app.
