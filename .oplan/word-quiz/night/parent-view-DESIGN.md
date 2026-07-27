# Design proposal — the READ-ONLY PARENT VIEW (the weekly look)

Status: **PROPOSAL, not frozen.** Nothing here is decided. It exists so the owner can decide once,
with the trade-offs visible, instead of deciding in the middle of a run.

Written 2026-07-27 against the tree at `HEAD` (`ab80d19`, the deploy commit). No code was written
for it, no live profile was read for it, and no file outside this one was touched. Every number
below is either derived from the shipped code (cited) or from artefacts already committed to this
repo (`backup-receipt.txt`, `topup-1-words.txt`).

This is the redemption of **D14** — *"fully automatic now, parent read-only view soon"* — and of
**D24**, which recorded two counters per word for a reader that does not exist yet: *"any week we
do not record is lost forever."* Some weeks have now been recorded. This is the reader.

---

## 0. What already exists (so nothing here is built twice)

Not a greenfield. A parent view **ships today** and has since before the quiz run:

- `public/app.js` holds `const OWNER_ROUTE = "/parent"` outside the `ROUTES` table, lazily importing
  `views/parent.js`. It is a real route with no nav tab.
- The door is a **1500 ms long-press on the home title** (`bindOwnerGesture` in `views/home.js`,
  pinned by `tests/parent-lock.test.js`, which also asserts the word `הורים` appears nowhere in
  `index.html` or `home.js` — the door is deliberately invisible).
- Behind the door is a code prompt. `codeAccepted(typed, stored)` (`views/parent.js:181`) and
  `tests/parent-lock.test.js` together say what it really is: **any non-empty string is accepted
  when nothing is stored**, and thereafter the typed value must equal `localStorage.appCode` — which
  is the code the child herself typed to get into the app (`public/api.js` writes that key). Read
  section 2(a) before calling this a lock.
- The view renders three cards — band, placement result, `מילים באוסף` (a bare `Object.keys` count) —
  plus a re-take button. `tests/parent-ui.test.js` freezes **17 exact Hebrew strings** and asserts
  the file contains no `postJson` and never touches `/api/placement`: read-only is a tested property,
  not an intention. Keep it that way.
- `docs/growth.md` §5 already names this screen as the place automatic decisions must surface:
  *"Every move G2 makes must be visible on `#/parent` … An automatic change you cannot see
  reintroduces the exact defect this project exists to remove."* §7 item 3 puts "the full parent
  view" third in the landing order, with the reason: *"the route and `public/views/parent.js`
  already exist today; extending them is smaller than building them."*

Demotion is exactly the automatic decision §5 is about. It shipped on 2026-07-27 and **nothing on
any screen tells the parent it happened.** The child is told (phase 4's demotion line). The parent
is not.

---

## 1. What the parent can actually be told, from data that EXISTS

### 1.1 The word entry, in full

`lib/profile.js` `validateProfile` + the three mutators define the shape. Required: `status`
(`known`|`learning`), `source`, `he`, `taps`, `firstSeen`, `lastSeen`. Optional: `context` (≤200
chars of the sentence she tapped in), `strikes`, `needsReview`, `lastQuizAt`, `lastStrikeSession`,
`quizRight`, `quizWrong`. Profile-level: `skills.receptiveVocab.band`, `placement`,
`story.chapters[]` (each with `generatedAt` and `coverageRatio`), `story.checkLog[]`, `meta`.

### 1.2 The six questions, and how each is derived

| # | The parent's question | Derivation from today's data | Sound? |
|---|---|---|---|
| 1 | How big is her collection, and how much of it does she claim to know? | `Object.keys(words).length`; count of `status === 'known'` | **Exact** |
| 2 | What did she pick up this week? | `firstSeen` inside the window | **Exact** — `firstSeen` is written once, on the first tap (`applyWordTap`), and `migrateWordKeys` keeps the earliest on a merge |
| 3 | Which words is she in trouble with? | `strikes >= 1` (wrong on separate sittings, not yet demoted) and `needsReview === true` (she re-tapped a word she claims to know — D11) | **Exact**, with the fragility in 1.4 |
| 4 | Did the app take a word back from her? | `status === 'learning'` **and** `lastStrikeSession` present. `lastQuizAt` on that word **is the demotion timestamp** | **Exact**, and see the finding below |
| 5 | How is she doing on the questions? | `sum(quizRight)` / `sum(quizRight + quizWrong)` across all words; same ratio per word | **Exact as a lifetime total.** Not a weekly one — see 1.3 |
| 6 | Which of her claimed words has no question yet? | `status === 'known'` with no `public/quiz/<lemma>.json` | **Exact locally** (`ls public/quiz`); in-app it costs a 404 probe per word, because **QZ-19 forbids a quiz index** |

**The finding worth its own paragraph (row 4).** The quiz records no event log, yet a demotion is
still recoverable *with its date*, and this appears to be the only dated event the quiz produces.
The chain: `pickQuizWords` (`public/quiz-core.js:53`) filters `status === 'known'` **exactly**, so
only a claimed word can ever be answered; `applyQuizAnswer` is the only writer of `lastStrikeSession`;
and the demoting answer sets `status = 'learning'`, after which the word can never be drawn again.
Therefore a `learning` word carrying `lastStrikeSession` was demoted by the quiz, and its `lastQuizAt`
is the moment it happened, frozen, because no later quiz answer can overwrite it. That gives
"two words were taken back, on Tuesday and Thursday" out of a design that deliberately stores no log.

**The counter-finding, equally important.** `markWordKnown` deletes `strikes`, `needsReview` and
`lastStrikeSession` (`lib/profile.js:411-413`) but leaves `quizRight`/`quizWrong` alone. **If she
re-claims a demoted word, the only evidence it was ever demoted is erased.** The week's report must
be generated before she re-claims, or that event is gone. This is a real argument for a screen that
is always current over a report someone remembers to run.

### 1.3 What CANNOT be shown — state this on the screen, not only in this doc

- **No per-day or per-session history.** D24 chose two counters over a log, on purpose, bounded by
  construction (`story.checkLog` is the cautionary precedent: it grows forever and nothing reads it).
  So: no "she practised Tuesday and Thursday", no streak, no session count, no time spent.
- **No claim date, ever recorded.** `markWordKnown` sets `lastSeen = now`, but `applyWordTap` sets
  the same field. `lastSeen` is *last activity of any kind*, so "she claimed 4 words this week"
  **cannot be computed** — the honest substitute is question 2 (`firstSeen`, first tap), which is a
  different fact and must be labelled as one.
- **No trend from the profile alone.** "Better than last week" requires two snapshots; the profile
  is a single mutable state. See option (b) and grill question G6.
- **No item-level detail.** Which sentence she saw, which wrong option she chose, how long she took —
  none of it is stored. Nor is a hint press: **D28 made the hint free** — *"no strike, no recording,
  no new profile field (QZ-9 stays frozen)"*. The one thing the parent would most like ("did she need
  the hint?") is the one thing deliberately not captured.
- **No strike history.** `strikes` resets to 0 on a pass (D15) and on demotion. A word that struggled
  in March and is fine now looks identical to a word never tested.
- **`quizWrong` counts ANSWERS, not strikes.** D16 caps strikes at one per word per session, but
  `applyQuizAnswer` increments `quizWrong` on *every* wrong answer including repeats inside one
  sitting (`lib/profile.js:451`, before the `sameSession` return). So `quizWrong >= strikes-ever`,
  and a word can show 5 wrong with 1 strike. Any wording like "she got it wrong 5 times" is fine;
  "she is 5 strikes from losing it" is false.
- **Nothing about the 37 QZ-8 exclusions or missing items reads as her failure.** A claimed word with
  no question is *our* backlog, not hers, and the screen must say so or it reads as a gap in her.

### 1.4 Two fragilities to design around

- `needsReview` is cleared by **any** quiz answer, right or wrong (`lib/profile.js:441,449`). It means
  "she re-tapped this and has not been asked since", not "she is shaky on this". Label it that way.
- `strikes` is *deleted* by `markWordKnown` and *set to 0* by a pass. Absent and `0` mean the same
  thing; treat `entry.strikes ?? 0` everywhere, as `pickQuizWords` already does.

### 1.5 One thing the brief did not ask for, which is worth more than most of the above

`story.checkLog` **is a real dated log** — `{chapter, questionId, chosenIndex, correctIndex, correct,
at}`, first-attempt only (`reader.js` guards on `isFirstAnswer`). `growth.md` §2 records that nothing
ever reads it back out. It is the only per-day evidence in the whole profile: comprehension accuracy
with timestamps, plus `story.chapters[].generatedAt` for "she read 3 chapters this week". If the
parent view is going to read anything, it should read this too — it answers "is she still reading?",
which is the question that comes before every question in 1.2. Cost: it is unbounded, so read the
tail, never render all of it. Flagged, not assumed — it is outside the brief.

---

## 2. The options

### (a) Extend the existing `#/parent` route — **effort S–M**

Surface: `public/views/parent.js`, one new section per 1.2 row. No new route, no new API, no new
file. The profile is already fetched there.

**How is it gated? Honestly: it is not.** The door is a hidden long-press, and the code is the app
code the child already knows and which her own browser already stored. `codeAccepted` returns `true`
for any string when `localStorage.appCode` is empty. It is a latch against accidental discovery, not
a lock. Making it a real lock means a **second secret**, and `lib/auth.js` authorises on `APP_CODE`
alone — so a real gate means a new env var, a new server check, and a new auth surface (effort **L**,
and a new way to lock the parent out of her own app). **The recommendation is not to pretend.** The
view is provably read-only (`tests/parent-ui.test.js` asserts no `postJson`), so the exposure is not
a data risk — it is an *emotional* one: a screen listing "words taken back from you" is a scoreboard
of her failures, in an app whose stated purpose is that she *feels* confident. That is grill question
G3, and it is a content decision, not a security one.

Costs, all known and small:
- 17 frozen Hebrew strings in `tests/parent-ui.test.js` become ~30. Additive; existing ones stay.
- `sw.js` `CACHE` bump in the same phase (standing practice, `growth.md` §8).
- **Contrast gate: zero new token pairs needed if the palette is chosen deliberately.** The 52 pinned
  pairs already cover `--color-ink` on `teal 16%`, `accent 18%`, `teal 18%` and `danger 16%` mixes
  over `--color-card`, plus `--color-teal`, `--color-accent`, `--color-danger` and `--color-muted` as
  text on card. Reuse `.word-badge.known` / `.learning` verbatim for known/learning, `danger 16%`
  (pinned as "label on wrong option") for the taken-back badge. Any *other* plate — a new mix
  percentage, a new token — costs a deliberate new pair and an owner-visible line in the phase.
- RTL/Hebrew is the house style already; lemmas need `dir="ltr"` exactly as `words.js` does.

### (b) A weekly static HTML report generated on this machine — **effort M, zero app changes**

Surface: a script here, an HTML file on the laptop. Nothing deploys, no test ledger moves, no
contrast gate, no cache bump, no risk to `public/`.

**It requires an authenticated read of her live profile, and this run's rules about that are strict.**
Field guide item 3 says flatly: *"Production is Vercel Blob behind `APP_CODE`, unreadable from here.
NEVER probe it."* Phase 6 carved out exactly **two sanctioned reads** and governed them with a command
form frozen in `plan.md` (step 6.2) precisely so nobody would improvise one at run time:

```bash
code=$( ( set -a; . ./.env; set +a
          curl -s --ssl-no-revoke -H "x-app-code: $APP_CODE" -o "$BK" -w '%{http_code}' \
               https://english-app-three-tan.vercel.app/api/profile ) )
[ -z "${APP_CODE:-}" ] || { echo "FAIL: APP_CODE leaked"; exit 1; }
```

The load-bearing parts: `.env` is sourced **inside** the subshell so `APP_CODE` dies with it
(`isAuthorized` returns TRUE only when the var is UNSET — a leak silently 401s the whole test suite);
`--ssl-no-revoke` is mandatory on this machine; the code is never echoed or logged; only a SHA-256 and
counts go into `backup-receipt.txt`, **never contents**; and `vercel env` is forbidden.

A *sanctioned weekly read* would therefore need, as a standing grant rather than a per-run one:
1. That exact command form, reused verbatim, never re-typed.
2. **A stated side effect:** `GET /api/profile` runs `migrateWordKeys` and conditionally saves — a
   read that can write. Measured harmless for her profile (both phase-6 captures were byte-identical,
   sha `58870a1b…`, because her keys are already sorted), but it is not a pure read and must not be
   described as one.
3. A retention rule. This is the crux: **weekly deltas need last week's snapshot to still exist**, and
   D27's privacy rider deletes captures at phase close. Retaining a derived digest (counts only, no
   `context` strings, no Hebrew, no lemmas) is a far smaller footprint than retaining profiles, and is
   probably the right shape — but it is the owner's call (G6).
4. A named home outside the repo (`C:/Users/dkreinov/english-app-backups/` is the existing precedent)
   and a receipt line per run.

What (b) buys that (a) cannot: **real weekly deltas** — claimed this week, demoted this week, quiz
answers this week — recovered by diffing snapshots, which is the one thing the counters structurally
cannot give (1.3). What it costs: it silently stops existing the first week nobody runs it, and it can
miss a demotion erased by a re-claim (1.2).

### (c) A printable one-pager — **effort S on top of (b), L standalone**

A print stylesheet over (b)'s HTML, or `@media print` on (a). Real use: sitting down with her on a
Friday over three words. Real cost: it is stale the moment it prints, and it turns a child's failure
list into a paper artefact that outlives the failure. Recommend **not now** — reachable in an
afternoon later if the owner asks (G4).

### Which respects D14 — *"the correction loop must never wait on a human"*?

Stated precisely, because it is easy to answer this wrongly: **all three are read-only and none of
them sits in the correction path.** The demotion loop runs in `applyQuizAnswer` on her phone and is
untouched by every option here. So D14 is not violated by any of them.

The question D14 *should* be read to ask is: **which one fails safe when nobody does anything?**

- (a) is always current. Nobody has to run it, nobody can forget it, and it cannot go stale. If the
  parent opens it in three months it is right.
- (b) exists only on the weeks a human executes it — and it needs an authenticated read of the one
  file this project protects. Skip a week and that week is exactly what D24 warned about.
- (c) is (b) plus decay.

On D14's own logic, **(a) wins**, and `growth.md` §5 independently pins the destination to `#/parent`.

---

## 3. The mockup, in text

Profile: **20 words, 12 known.** Her real known set is already committed in this repo
(`topup-1-words.txt`); the learning-side words below are **invented** and marked so.

**First: the briefed numbers cannot all be true, and why that matters.** "Two demoted last week"
requires 3 wrong answers each, on separate sittings (D1/D16), each incrementing `quizWrong`
(`lib/profile.js:451` runs *before* the same-session return) — **≥6 wrong**. "One word at 2 strikes"
requires 2 more — **≥8 wrong**. So 14 right cannot sit inside 19 answers; the minimum consistent
total is **22**. The mockup below uses 14/22. That arithmetic is not pedantry: it is the counters'
limit made visible. With no dates, "14 of 19" is a *lifetime* number, and a parent who reads it as
"this week" will draw a false conclusion about a real child.

```
┌─ תצוגת הורים / מה האפליקציה יודעת עליה ──────── (Parent view) ──┐

  השבוע                                    ("This week", 20–27.7)
    3 מילים חדשות באוסף        garden · river · desk    (new: firstSeen in window)
    2 מילים נלקחו בחזרה        desk · fan               (taken back)
    3 פרקים נקראו                                       (chapters read — chapters[].generatedAt)

  האוסף                                                 ("The collection")
    20 מילים באוסף · 12 היא אומרת שהיא יודעת · 8 בלמידה

  צריך תשומת לב                                         ("Needs attention")
    monkey   ⚠ 2 טעויות בשתי פעמים שונות · עוד אחת והמילה חוזרת ללמידה
    steak    ⚑ לחצה עליה שוב אחרי שאמרה שהיא יודעת · עוד לא נשאלה מאז
                                             (strikes=2 · needsReview=true)

  מילים שחזרו ללמידה                                    ("Words returned to learning")
    desk     23.7   3 טעויות · חזרה ללמידה               (lastQuizAt = the demotion)
    fan      25.7   3 טעויות · חזרה ללמידה
    השאלות ישאלו אותה שוב על המילים האלה כשהסיפור ילמד אותן מחדש.

  השאלות                                                ("The questions")
    14 תשובות נכונות מתוך 22 — מאז ומתמיד, לא רק השבוע     (LIFETIME, said out loud)
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]

  עדיין בלי שאלה                                        ("No question yet")
    garden · river    — היא סימנה אותן, עוד לא כתבנו להן שאלה. זה לא חסר אצלה.
                        (2 claimed words with no public/quiz/<lemma>.json)

  ─────────────────────────────────────────────────────────────
  מה המסך הזה לא יודע:  אין פירוט לפי ימים, ואין תאריך שבו סימנה
  שהיא יודעת מילה — נשמרים רק סיכומים.                  (the 1.3 line, on screen)

  רמת אוצר המילים: A2 · מבחן המיון 24.7 · [ מבחן מיון מחדש ]   (existing cards)
└──────────────────────────────────────────────────────────────┘
```

[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
Right 14 spread over the 10 claimed words that have items. `steak` carries `needsReview` at no cost
in wrong answers, because a re-tap never strikes (D11).

---

## 4. The grill questions for the owner

Nothing below is answered here. Answering them is what turns this into a plan.

- **G1 — reassurance or intervention?** These are different screens. *Reassurance* is three numbers
  and a green tick and never mentions a specific word. *Intervention* is a named list — "sit with her
  on `fan` and `desk`" — and is only honest if you intend to act on it. The mockup above is
  intervention-shaped. If the real want is reassurance, delete two sections and the effort halves.
- **G2 — Hebrew or English?** The app is Hebrew-first RTL throughout and `tests/parent-ui.test.js`
  freezes the existing parent strings in Hebrew. Staying Hebrew is free; English means a second string
  set with no mechanism to choose between them.
- **G3 — does the child ever see it?** She can reach `#/parent` (section 2a) and the code is one she
  knows. Three answers, and they are genuinely different products: (i) assume she may, and write every
  line so it is safe for her to read — no "failed", no ranking, `desk` phrased as *"the story will
  teach it again"*; (ii) assume she does not, and write bluntly for the parent; (iii) spend the L to
  build a real second secret. **(i) is the cheapest and the most robust**, and it costs only word
  choice — but it must be decided before the strings are frozen, not after.
- **G4 — weekly, or whenever it is opened?** "Weekly" implies a window, which implies deltas, which
  implies snapshots (G6). "Whenever opened" is a state-of-today screen with no window and no retention
  question at all. The mockup mixes both — its top section is the only part that needs a window.
- **G5 — what should a demotion make the parent DO?** If the answer is "nothing, the loop handles it"
  (which is D14's position), then the demotion section is *information*, and should be small and calm.
  If the answer is "go practise that word with her", the screen owes her a next step and does not have
  one today.
- **G6 — may a weekly digest be retained, and where?** D27's rider deleted the phase-6 captures on
  purpose. Deltas need memory. Proposed narrowest form: a counts-only digest (no lemmas, no `context`
  strings, no Hebrew) outside the repo. This is the only privacy question in the whole design and it
  only exists if option (b) is chosen.
- **G7 — may the view read `story.checkLog`?** Section 1.5. It is the only dated evidence in the
  profile and would answer "is she still reading?". It is outside the brief and outside D24.
- **G8 — should "no question yet" be shown to the parent at all?** It is really the operator's top-up
  backlog wearing a parent's clothes. Useful to the owner, meaningless to a parent who is not also the
  person running the weekly top-up. (They are currently the same person. They may not always be.)

---

## 5. Recommendation

**Build (a): extend the existing `#/parent`. Do not build (b) or (c) yet.**

Four reasons, in order of weight: `growth.md` §5 already *pins* the visibility of automatic decisions
to `#/parent`, and demotion is precisely such a decision; it is the only option that is always current
and needs no human, which is D14's spirit even though D14 does not literally bind here; it is the only
one that cannot miss a demotion erased by a re-claim (1.2); and it needs **no authenticated read of her
live profile at all**, so the field guide's "NEVER probe it" stays intact and G6 never has to be asked.

Explicitly rejected, with the reason recorded so it does not look like an oversight: option (b) is the
only source of true weekly deltas, and that is a real loss. It is accepted because the alternative is a
standing grant to read a child's live profile every week, retained snapshots, and a report that exists
only on the weeks somebody remembers. **If the owner reads the shipped screen for a month and finds
"what changed since last week" is the thing missing, (b) is a clean bolt-on afterwards** — it shares no
code with (a) and blocks nothing.

Prove the screen the way phases 3 and 4 proved theirs: a **hand-derived transcript diffed against the
real renderer**, run over a fixture in exactly the live shape (20 words / 12 known, per
`backup-receipt.txt`). That gate needs no live read, and it is the technique this run has already shown
works — `quiz-transcript.mjs` diffed empty twice.

### PHASE SKETCH — "the parent's weekly look"

```
Base: HEAD at start (ab80d19 or later), tree clean, npm test all-pass, contrast 52 ALL PASS.
GOAL: the parent can see, on her phone, what the quiz did to Mika's words this week.
      Read-only. No new route, no new API, no new secret, no change to any write path.

ACCEPTANCE CRITERIA (frozen before execution)
 1. STEP-P.1-OK .. STEP-P.5-OK all print (P.6 is a human gate and prints nothing).
 2. Test ledger rises by exactly the new flat top-level test()s; `# fail 0`.
 3. Contrast gate: still 52 pairs, ALL PASS, and `scripts/check-contrast.mjs` is UNCHANGED
    — the deliberate proof that no new token pair was needed. If a design needs one, that is
    an AMENDMENT with an owner line, not a quiet edit.
 4. `tests/parent-ui.test.js`: all 17 existing frozen strings still asserted; the no-`postJson`
    and no-`/api/placement` assertions still present and still passing.
 5. Byte-identity: `git diff --numstat` touches ONLY parent.js, parent-ui.test.js, sw.js,
    the new pure module and its test. Nothing under lib/, api/, data/, public/quiz/.
 6. The transcript diff is EMPTY against an expectation hand-derived BEFORE the code exists.
 7. Mutation-proved: each new derivation has a mutant that a test catches (esp. the demotion
    rule and the strikes-vs-answers distinction — a cry-wolf mutant must go red).

STEPS
 P.1 [ORCHESTRATOR] Freeze the fixture + the hand-derived expected transcript, from §3's
     mockup, BEFORE any code. Files: night/parent-view-fixture.json,
     night/parent-view-expected.txt.                                    -> STEP-P.1-OK
 P.2 [WORKER] New PURE module public/parent-summary.js — profile in, plain summary object out.
     No fetch, no DOM, no Date.now() outside an injected `now` (the QZ-17 pattern from
     quiz-core.js). Owns every derivation in §1.2 incl. the demotion rule and `?? 0`.
     Tests: flat top-level, each with its negative control.             -> STEP-P.2-OK
 P.3 [WORKER] Render the sections in parent.js from that summary. Palette restricted to the
     already-pinned pairs (§2a). Hebrew strings added to the frozen list in the same commit.
     The "what this screen does not know" line is a CRITERION, not a nicety.   -> STEP-P.3-OK
 P.4 [WORKER] Transcript runner (night/parent-transcript.mjs) -> diff vs P.1. Empty or fail.
     -> STEP-P.4-OK
 P.5 [WORKER, INDEPENDENT AGENT] Sabotage pass: >=6 mutations of the derivations, every one
     must be caught. Reports uncaught ones rather than fixing them.     -> STEP-P.5-OK
 P.6 [OWNER GATE] Read the transcript. G1/G3 decide the wording BEFORE P.3 freezes strings,
     so this gate is really two: a wording gate before P.3 and an approval gate after P.4.
 P.7 [ORCHESTRATOR] sw.js CACHE bump + deploy, using the frozen phase-6 recipe. No profile
     read is required by this phase; if one is wanted to eyeball real output, it is the
     step-6.2 command form verbatim, or it does not happen.

RISK THAT OUTRANKS THE REST: this screen is the first thing in the project that turns her
mistakes into a list an adult reads. Every mechanical criterion above can pass on a screen
that is unkind. G1 and G3 are the only defence, and they are human.
```
