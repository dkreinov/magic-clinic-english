# Field guide — word-g1 (amended: word-trophies phase-1 close widened lessons 4 and 8; phase-2 close added lesson 13; phase-3 close corrected lesson 4 and added lesson 14; phase-4 close added lesson 15) (word-finish phase 2 added lessons 24-27 and SPENT lesson 23s remedy) (budget: 40 lines; at 133 because these are commands+mechanisms that do not compress — justification in word-trophies journal)

1. A FORMAT GATE IS NOT A CONTENT GATE — bitten three times. Gate what the CHILD experiences
   (phase 3 gated `knownLemmaSet`, not `status`). If no gate can see the failure, add a human one.
2. WHAT COUNTS AS EVIDENCE. A test never seen to FAIL is not evidence — mutate first (fail-first),
   and report guards as guards. A positive assertion needs its NEGATIVE control (cry-wolf). Derive
   the expected output BY HAND from the contract BEFORE the code exists, then diff (the QZ-21 and
   G1 transcripts); commit the expected file ONCE and never edit it — a red diff means the CODE is
   wrong. Never verify against your own re-implementation; anything reaching its subject through a
   transform (`tokenize`, `resolveLemma`) fails OPEN.
3. THE PROFILE IS LIVE (Vercel Blob behind `APP_CODE`). NEVER probe it. `GET /api/profile` CREATES
   one — a read that writes (re-bitten at phase 2's visual gate via a stale localhost server).
   Tests point `DATA_DIR` at a temp dir; prove "nothing written" by BYTE-comparing. `isAuthorized`
   is open only when `APP_CODE` is UNSET; the frozen subshell capture
   (`.oplan/word-quiz/plan.md:1573-1586`) is the ONLY sanctioned live read — its post-assert
   proves no leak, and a leak silently 401s the whole suite.
4. Windows/Git Bash: forward slashes; git's CRLF warnings are noise but FILE line endings are law
   (MEASURE, never remember: the WORKTREE is law and `git diff` normalises it away. Measured
   2026-07-30: `sw.js` **CRLF**, `styles.css` **CRLF**, `index.html` **CRLF**, `quiz.js`/
   `quiz-core.js`/`views/words.js`/`views/reader.js` CRLF; `app.js`, `lib/*.js`, `tests/*.js`,
   `scripts/*.mjs`, `*.md` LF. This guide previously asserted `sw.js` was LF and was WRONG —
   two independent phase-3 planners caught it. One normalisation turns the deploy's md5 proof
   into a whole-file hunt); `curl` needs
   `--ssl-no-revoke`; `vercel` via `"$(npm prefix -g)/vercel"`; Git Bash `/tmp` is NOT node's;
   never write scratch into the repo. core.autocrlf=true makes DISK endings unstable: checkout
   materialises CRLF, an Edit-tool insert CRLF'd a whole LF file, and `git diff` normalises so
   the damage is INVISIBLE to any git-based gate — edit LF files byte-preservingly (python
   `newline=''`) and verify endings with an `rb` byte count, never grep/`file`. GIT-MEDIATED
   COPIES TOO: `git archive`, `git stash`, a fresh clone or worktree re-apply autocrlf and
   silently flip EVERY file's endings — a byte comparison inside such a copy is meaningless;
   only the working tree you measured is evidence (measured live, word-trophies phase 1).
5. `npm test` = bare `node --test` + the contrast gate; every new test is a FLAT top-level
   `test()`; pin the exact cumulative ledger per step (298 at the phase-2 close = 293 flat + 5
   subtests in dev-server.test.js). Contrast anchor = `grep -c '^PASS'` = 52 (bare `PASS` gives
   53). `color-mix()` FABRICATES a contrast pass; a raw hex is invisible to the gate.
6. Validation chains: `set -o pipefail`; capture to variables, match with `case`; `LC_ALL=C sort`;
   `cmd | grep -q` SIGPIPEs under pipefail. Put the file-boundary check in the STEP's script.
7. Before touching a view/style/data file, grep `tests/` for exact-shape assertions (the `CACHE`
   string, the `PRECACHE` array, class names, Hebrew strings) — append beside a frozen thing,
   never replace it. Any precached-file change ships a `CACHE` bump the same phase (QZ-22).
8. HEBREW IS BIDI + ESCAPES COLLAPSE IN ANY TRANSPORT: never retype Hebrew and never copy it
   from terminal output — EXTRACT it from its source file by script. ANY backslash through ANY
   transport is at risk: `bash -e`, quoted heredocs, regex `\\d`, and JSON strings (an agent
   packet is JSON — `\uXXXX` in it DECODES to the raw glyph in transit; caused a false-positive
   audit, word-trophies phase 1: double the backslashes or ship evidence as byte counts). Write
   scripts to FILES and verify the WRITTEN BYTES (codepoint dump). In test files `\u` only.
9. A packet that NAMES a frozen contract without QUOTING it is a hole — and a frozen VALIDATION
   can itself be the bug: this run's three bad-specs (self-referential wrapper text, a
   forbidden-string tail, a probe fixture that could never validate) were each caught by a
   DIFFERENT layer, the last by the executor stop-rule. Honour the stop-rule; never "fix" a frozen
   script silently — escalate, rule, log.
10. DEPLOY: `vercel inspect` FIRST and record the id AND the url exactly as inspect reports it (a
    hand-constructed url once pointed at the WRONG deployment); deploy ONCE with output to a FILE
    (truncated output once caused a double deploy); md5 the WORKTREE vs live, never a git blob;
    recipe: `.oplan/word-audio/phase-state.md:55-66`.
11. VISUAL GATES ARE SELF-SERVED (owner directive): sandbox browser only, NEVER production; CHECK
    PORT 3000 FOR A STALE SERVER FIRST (one squatted with the wrong DATA_DIR and answered a
    probe); hard-reload past the stale localhost SW; restore the sandbox profile byte-from-backup
    and stop the server before recording the step.
12. A COPIED-IN SIGNED DOCUMENT carries wrapper text (header/tail) that becomes FALSE the moment
    it is copied — re-derive wrapper lines to state the post-copy truth; copy only the signed BODY.
13. DRIVING THE ART CHAT (word-trophies phase 2, 9/9 generated first try). Get the PROMPT in
    without a transport: powershell Set-Clipboard reads the prompt FILE -> in-page
    `navigator.clipboard.readText()` -> synthetic `ClipboardEvent('paste')` with a DataTransfer
    into `div#prompt-textarea`; the bytes never enter a tool-call string. Then gate the send on a
    BYTE-EXACT composer read-back — char count + sum of charCodeAt + a position-weighted sum —
    not the ends-only "starts with / ends with" check, which a dropped middle word survives.
    Keep every digest DECIMAL: the extension redacts hex as "[BLOCKED: Base64 encoded data]".
    Four traps, each of which silently produced a no-op: (a) computer-tool coordinates are
    SCREENSHOT px, `getBoundingClientRect` returns CSS px — convert `css * 1568/innerWidth`
    (0.899 here) or your click lands nowhere; (b) synthetic ctrl+v carries NO clipboard, and
    `readText()` throws NotAllowedError whenever a shell command has just stolen focus — click the
    page first; (c) while a turn streams, the send button IS the stop button, so Return does NOT
    send and the prompt silently sits in the composer — re-read the composer AFTER sending, and a
    stuck "Stop answering" clears with a plain reload (the draft survives, re-verify it); (d)
    naturalWidth does NOT separate a PREVIEW from a final — a preview was already 1254x1254. Gate
    on no-Preview-label AND no-stop-button AND the fetched blob's byte length stable across ~7s.
14. VIEW-SCOPED CSS CANNOT STYLE A BODY-LEVEL ELEMENT — and no format gate will tell you.
    Every view here emits `<style>${VIEW_STYLE}</style>` INSIDE its own `container.innerHTML`
    (`words.js`, `reader.js`, `placement.js`, `parent.js`), so that CSS exists only while that
    view is mounted. word-trophies phase 3 put the celebration overlay's rules there while
    `document.body.appendChild`-ing the overlay from OTHER views — so in production it would
    have been unstyled 100% of the time (a raw 640px image dumped inline), and the one route
    whose CSS it needed was the one route it never fires on. 342 tests passed: the test asserted
    the CSS TEXT existed in `VIEW_STYLE`, never that it was REACHABLE FROM THE DOCUMENT when the
    element appears. Body-level UI goes in `public/styles.css` (the entry-code gate's precedent).
    GATE IT by asserting the rules live in the globally-linked sheet AND that the view emits no
    `<style>` — and write that test BEFORE the fix so you watch it fail. Lesson 1, again, with a
    new costume: only the human visual gate could see this one.
15. THE THREE WAYS A GREEN SUITE STILL SHIPS A BROKEN SCREEN — all three happened in
    word-trophies, all three were found by a HUMAN LOOKING, none by 349 tests.
    (a) EXISTENCE IS NOT EFFECT. The celebration test asserted the CSS TEXT was in VIEW_STYLE.
        It was — in a string that never reached the document, so the overlay was unstyled on
        every route it can actually fire on. Same shape: a no-sound test forbidding `new Audio(`
        while Web Audio sails past; a ray-cap assertion matching its own CSS COMMENT.
    (b) PARTS CORRECT, WHOLE INCOHERENT. The tier ring reads STORED state, the progress number is
        computed LIVE. Both had passing tests. Nothing asserted they AGREE, so four cards read
        "12 out of 5" while greyed out. Bugs live in the SEAM between two correct things.
    (c) CORRECT BUT NOT COMPREHENSIBLE. The shelf banner passed every check — right file, size,
        class, tokens — while `.hero-banner`'s bottom fade erased the shelf edge that identifies
        it AS a shelf. The image was gated; the CSS was gated; THE COMPOSITE WAS GATED BY NOBODY.
    THE CAUSE UNDER ALL THREE: the assertions were written from the SAME MENTAL MODEL, at the same
    moment, as the implementation — so both encode the same error and agree perfectly. A test
    written by the implementer catches deviations FROM the model, never errors IN it. Note that
    lesson 1 was known and in force throughout and did NOT prevent this; a remembered lesson is
    not a countermeasure, only a mechanical habit is. The habits:
    · AT WRITE TIME ask "what would make this assertion PASS while the feature is BROKEN?" — that
      one question finds (a) instantly.
    · ASSERT THE SEAM, not the parts: "no card may show metric >= target while locked" is one
      line and kills (b) forever.
    · PREFER EXECUTING the shipped code over reading it as text (this run: 13 of 20 executed,
      and the disaster was in the 7 that only read source — source-needle tests fail OPEN).
    WHY THE AUDITORS DID NOT CATCH THESE (they caught ~10 other real defects, so this matters):
    every catch was about the ARTIFACT — is this script correct, is this claim true, is this
    assertion sound. All three misses were about the RUNNING SYSTEM. Two specific causes:
    · VERIFIABLE CLAIMS CROWD OUT JUDGEMENT QUESTIONS. The phase-3 review brief explicitly said
      "does each step's gate actually observe the behaviour, or only its shape?" — and the review
      still spent its effort re-measuring digests, endings, ratios and arithmetic, because those
      yield concrete findings and judgement does not. The SAME reviewer found a can-never-fail
      gate in phase 4, where the brief named the concrete SHAPE ("distinguish GATES that were seen
      to fail from GUARDS that cannot be tested"). Abstract instructions get abstract attention:
      name the shape, not the principle.
    · AUDIT AT THE LAYER THE FEATURE LIVES IN. Step 3.4's audit DID execute the celebration — in
      node, where there is no CSS. The module was audited; the bug was in the page. A UI feature
      audited in node is audited at the wrong layer, and the browser check was two steps late.
    SO ADD TO EVERY REVIEW BRIEF, as concrete questions: (i) for each artifact the plan creates,
    trace its RUNTIME path — where does it exist, who needs it, can they reach it AT THE MOMENT
    they need it? (ii) for each value shown to the user, name its SOURCE; where two shown values
    have different sources, prove they cannot contradict each other. (iii) name every place an
    approved asset meets approved styling and require someone to LOOK at the composite.
    · TWO APPROVED THINGS MAKE AN UNAPPROVED THIRD. Wherever approved art meets approved CSS, or
      approved code meets approved config, there is a surface nobody signed off — gate it or look
      at it.

16. GREP CANNOT MEASURE LINE ENDINGS IN THIS ENVIRONMENT. COUNT BYTES.
    Proven 2026-08-01 on lf.txt / crlf.txt fixtures:
    · `grep -c` with a CR in the pattern returns 0 on a REAL CRLF file — MSYS grep opens in text
      mode and strips CR before matching. False "it is LF".
    · If the raw CR is stripped from the command string before bash sees it, the pattern collapses
      to `$` (the end-of-line anchor), which matches EVERY line of EVERY file. False "it is CRLF".
    Both failure modes are silent and both look like a measurement. The orchestrator shipped the
    second one into a planning brief and told a planner the record was wrong; the planner
    re-measured and was right.
    THE ONLY TRUSTWORTHY FORM: `tr -dc '\r' < f | wc -c` (CR bytes) vs `tr -dc '\n' < f | wc -c`.
    CR==0 -> LF. CR==LF -> CRLF. Otherwise MIXED, which is a defect.
    NEVER put a raw control character inside a shell command here. And: WHEN EVERY INPUT PASSES A
    CHECK IDENTICALLY, THE CHECK IS THE SUSPECT, not the inputs. Five files all reporting
    "CRLF-lines == total lines" was the tell, and it was ignored.

17. A PREAMBLE IS NOT A GATE; ONLY PREAMBLE+TAIL IS.
    §VAL-F1 printed four FAIL: lines and EXITED 0 — the preamble carries no `exit $RC` by design.
    Run alone it is a REPORT. Every step's tail must end `exit $RC`, in the SAME file.

18. NEVER BUILD A PATTERN OUT OF THE CONTENT YOU ARE SEARCHING FOR.
    A sweep meant to prove a trophy card cannot contradict itself used a regex containing the
    Hebrew word מתוך. It matched NOTHING on all 3020 cards and reported zero violations — a green
    test that had inspected nothing. Extract structurally (`>([^<]*)<`), then pull `\d+` out of the
    result. And ALWAYS instrument a new sweep once: print how many items it actually observed.
    If "observed" is 0 or equals "skipped", the test is decoration.

19. WRITING CODE THROUGH SHELL QUOTING EATS BACKSLASHES. USE A FILE.
    `node -e` inside single quotes inside a heredoc turned `<\/p>` into `</p>` and `\d+` into `d+`,
    breaking a whole test file — 364 passing tests became 337. Write the block to a file with a
    QUOTED heredoc (<<'X'), then splice it in with node. And read the test COUNT back, not just
    "tests pass": a file that fails to parse silently removes all of its tests from the total.

20. LOOK FOR THE HARNESS BEFORE WRITING THE PLAN.
    reader.js had NO behavioural test for two whole runs, and was only ever source-needle tested.
    The fake-container idiom needed to actually execute it had existed at quiz-ui.test.js:67 the
    entire time. Nobody had looked. Before writing "this cannot be tested mechanically", grep the
    test folder for a harness that already does it.

21. SIMULATE THE EDIT BEFORE SPECIFYING ITS NUMBERS; AND PREFER THE PIN THAT NAMES THE ARTIFACT.
    Every line/byte pin in this phase was measured on a simulated post-edit tree; a hand-count was
    wrong by 4. And when step 1.3's DELETION budget (29) disagreed with its byte/line pin, the byte
    pin was right and the diff-shaped pin was wrong: git counts textually identical replaced lines
    as context. A deletion count is a proxy; a content digest is the thing.

22. WHEN A FROZEN PIN AND A MANDATED EDIT COLLIDE, ASK WHICH ONE NAMES A PROPERTY.
    Twice in one phase. (a) A verbatim comment contained `awardTrophies`, which a raw-substring gate
    forbids under public/ -> the PROSE moved, because the gate guarded something real and cheap.
    (b) A frozen test pinned the literal `profile = await getJson(...)`, which the fix necessarily
    splits -> the PIN moved, because it described a spelling, not the invariant it named. The test:
    does the pin still describe a property we care about, or only a way of writing it? Never delete
    such a pin -- re-express it, and see it fail.

23. THE LOCALHOST SERVICE WORKER WILL SERVE YOU YESTERDAY'S CODE.
    A visual gate read the trophy screen as still broken while curl proved the server was sending
    the FIXED file. A stale SW on localhost:3000 was serving cached modules. Switching origin to
    127.0.0.1:3000 (no worker registered there) showed the truth immediately. Do this FIRST, before
    reporting any visual regression. And after any sandbox session, RESTORE the fixture: the dev
    server writes to DATA_DIR and its md5 had changed.

24. A LATER RUN'S BRIEF CAN LOSE AN EARLIER RUN'S RULING. RULINGS GO IN phase-state.md THE DAY
    THEY ARE MADE.
    Ruling B2 ("generate BASE LEMMAS only; the list is TEN") was made AND owner-approved on
    2026-08-01 and lived only in word-polish/journal.md. One day later it was absent from
    design.md, absent from phase-state.md, and absent from the phase-2 planning brief, which
    confidently told a fresh planner "the honest number is 16". Generating those sixteen would
    have split her live dictionary on the server. Only the planner re-deriving it from scratch
    caught it. A ruling that lives in a journal is a ruling that will be re-made wrongly; the
    journal is the NARRATIVE, phase-state.md's FROZEN CONTRACTS is the CONTRACT.

25. ASK THE QUESTION OF THE ARTIFACT, NOT OF THE ACCESSOR.
    design section 9 asked "who calls getAllowedSet()?", got a TRUE answer (both callers are
    audio-only), and concluded the manifest had no second meaning. It has one: api/profile.js:6
    imports public/audio/words/index.json DIRECTLY -- never touching getAllowedSet -- and feeds it
    to migrateWordKeys, which rewrites the keys of her durable dictionary on every POST. The right
    question was of the FILE, not the function. Grep the artifact's PATH, then every accessor of
    every result.

26. ABSENCE FROM A LIST IS NOT ABSENCE OF THE BEHAVIOUR.
    "These 16 words are not in the manifest" was true. "These 16 words are silent" was FALSE:
    resolveLemma de-inflects INTO the manifest, so `softly` already spoke as `soft`. A transform
    sat between the list and the behaviour. This is lesson 2's "anything reaching its subject
    through a transform fails OPEN" in its positive form -- measure THROUGH the transform
    (resolveLemma, tokenize, normalizeWord), never at the list.

27. A TEST VERIFIED IN ISOLATION IS NOT VERIFIED IN ITS FILE -- MODULE CACHES ARE PROCESS-WIDE.
    An executed popup test passed alone and could NEVER pass where it was appended:
    public/words-index.js caches the manifest in a module-level variable for the life of the
    PROCESS, and an earlier test in the same file stubbed that fetch as []. An empty Set is
    TRUTHY, so the cache never refilled and the new test silently measured the OLD test's stub.
    `node --test` isolates per FILE, not per test -- so a test that needs its own module state
    needs its own FILE, with a header saying why. Field guide 15's shape one layer up: the
    assertion was sound, its NEIGHBOURS were not. Before appending any test that stubs a module
    already stubbed earlier in that file, ask what the module remembers.
    COMPANION, and it invalidates lesson 23's remedy: THE SERVICE WORKER NOW LIVES ON 127.0.0.1
    TOO, because lesson 23 told us to go there and going there REGISTERED ONE. Phase 2's visual
    gate read the marker as missing while curl proved the server was sending the fixed file --
    a precached magic-vet-v20 reader.js, which the deferred CACHE bump gives no reason to refetch.
    THE REMEDY THAT STILL WORKS IS A FRESH ORIGIN: run the dev server on a different PORT
    (`PORT=3100 DATA_DIR=... node scripts/dev-server.js`). No worker is registered there. Any
    remedy that names a specific origin expires the moment you use it.
    28  THE OBVIOUS REUSE CAN ANSWER A DIFFERENT QUESTION THAN THE ONE YOU ASKED. quiz-topup.mjs is
        correct and documented and reports `missing=0` on a profile where nothing works. Reuse the
        FILTERS, not the POOL — and prove the difference on a fixture before trusting it on real
        data. The obvious route is dangerous precisely because it is documented.
    29  GATE THE INSTRUMENT, NOT ONLY THE OUTPUT. Plant known defects and require the reviewer to
        find them BEFORE believing its verdicts. Two blind passes once cleared a bank while walking
        past a leak a prior audit had already named in writing.
    30  AN APPROVAL THAT IS NOT BOUND TO BYTES IS NOT AN APPROVAL. Digest the batch, name the digest
        in the approval record, and make the promoter recompute it before it copies anything.
