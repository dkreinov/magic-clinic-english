# journal.md — run "first-build" (append-only)

## 2026-07-24T12:10+03:00 — RUN START
- Orchestrator: Fable (this session). Execution mode: autonomous/continuous — human opted in
  at run start ("Run all phases without pausing"). Run has 5 phases (> the ~3 recommended for
  continuous); the pause recommendation was overruled up front by the human instruction.
- Environment verified: node v22.14.0, npm 10.9.2, python 3.12.10, git repo with ZERO commits
  (baseline commit created: a3375ec), `.env` present (OpenAI + dormant Anthropic keys).
- Workspace `.oplan/first-build/` created; design.md copied in; skill + templates copied to
  `skill/` (skill not installed in environment — record must be self-governing).

## 2026-07-24T12:14+03:00 — PHASE 1 PLANNED
- plan.md written: global contracts GC-1..GC-8, Phase 1 in 5 steps, Phases 2–5 skeletons.
- Orchestrator decisions made at plan time (all logged as frozen contracts): zero-build vanilla
  stack; Vercel Blob + local-file storage fallback; profile schema v1; API envelope +
  raw-res-compatible handlers; hash-router SPA; app name "מרפאת הקסמים"; design tokens
  (purple/teal/amber, Rubik); chapter-glossary approach for tap-to-translate (Phase 4).

## 2026-07-24T12:18+03:00 — PLAN REVIEW (Sonnet, fresh eyes)
- VERDICT: fix-first. Findings and resolutions:
  1. [undecided] step 1.4 — sw.js precache list unenumerated, untested → FIXED: PRECACHE array
     frozen as an exact JSON-parseable literal; shell.test.js now parses it and asserts every
     entry maps to a real file in public/.
  2. [validation] step 1.5 — fetch() normalizes `../`, traversal test would be a no-op →
     FIXED: test now uses raw `node:http` request paths `/../package.json` and
     `/..%2Fpackage.json`, asserting `@vercel/blob` never appears in a response body.
  3. [boundary] step 1.2 — validator weaker than GC-3 → FIXED: validator must enforce the FULL
     word-entry schema (he, firstSeen/lastSeen ISO, taps).
- Reviewer tokens: 52,395.
- Note for the record: Write tool produced literal `\` for some `/` in plan.md prose
  (`icons\icon.svg` on line 194 render); harmless in prose, but exact-match Edits needed
  smaller anchors. Watch for this when writing specs containing many path strings.

## 2026-07-24T12:30+03:00 — STEP 1.1 INTERVENTION (unanswered-question)
- Executor (Sonnet) stopped correctly: frozen contract `"test": "node --test tests/"` cannot
  pass — through npm (cmd.exe) on Windows/Node 22 the directory form throws MODULE_NOT_FOUND.
  Orchestrator reproduced it (direct Git Bash invocation works; npm invocation fails).
- DECISION: test script is bare `node --test` (default `**/*.test.js` discovery). plan.md
  GC-1 and step 1.1 contract amended. Worker resumed with the answer.
- Lesson candidate for field guide: npm scripts run under cmd.exe — a command that works in
  Git Bash can fail via npm; validate through `npm test`, not direct invocation.

STEP 1.1 Project scaffold
  tier: WORKER (Sonnet)
  did: Created package.json, vercel.json, .env.example, README.md, tests/smoke.test.js per
       spec; appended `.data/` to .gitignore; npm install generated package-lock.json. Second
       turn (after amendment): scripts.test -> "node --test", smoke assertion updated.
  surprises: `node --test <dir>` fails through npm (cmd.exe) on Node v22 — directory-path
       support removed post-v20; bare `node --test` / explicit files / globs only.
  deviations: none
  validation_first_try: no (first attempt blocked by the frozen-contract flaw; passed
       first try after amendment)
  retries: 0
  escalations: 0
  tokens: worker=46002+46358 (two turns, as reported), checker=29018,
       orchestrator_delta=unavailable
  interventions: 1 (unanswered-question -> contract amendment GC-1: bare `node --test`)
  audit: match, confidence high (caveats — validation run + .gitignore prior content —
       covered by orchestrator's own clean-state run)
  commit: 7983095
  accepted: 2026-07-24T12:27:19+03:00

## 2026-07-24T12:40+03:00 — STEP 1.2 AUDIT ROUND 1: mismatch (spec wording), re-audit
- Auditor finding: store test asserts `second >= first AND notStrictEqual` where the step spec
  said "differ or second ≥ first". Orchestrator ruling: spec phrasing was sloppy; the intent is
  "prove updatedAt advances"; the conjunction implies the disjunction and is accepted. Step
  spec amended (plan.md) to name the conjunction explicitly.
- Process defect (mine): auditor received a natural-language SUMMARY of lib diffs instead of
  raw hunks -> CONFIDENCE: low. Re-audit supplies the raw test hunks + validator excerpt.
  Lesson candidate: never summarize the diff for the auditor; paste hunks verbatim.

STEP 1.2 Profile + storage libraries
  tier: WORKER (Sonnet)
  did: lib/profile.js — defaultProfile(nowIso) + validateProfile(p) per schema v1.
       lib/store.js — loadProfile/saveProfile, file/Blob backend by BLOB_READ_WRITE_TOKEN at
       call time. tests/profile.test.js — shape/defaults + 8 mutation-rejection cases.
       tests/store.test.js — temp DATA_DIR, null-on-empty, roundtrip, updatedAt bump.
  surprises: none (worker noted orchestrator's uncommitted STATUS.md in git status; benign)
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=39288, checker=32666+33148 (two audit rounds), orchestrator_delta=unavailable
  interventions: 1 (bad-spec: audit round 1 mismatch was my packet's sloppy "or" phrasing;
       spec amended, re-audit passed. No code change needed.)
  audit: match, confidence high (round 2)
  commit: 2012689
  accepted: 2026-07-24T12:34:21+03:00

## 2026-07-24T12:55+03:00 — STEP 1.3 AUDIT ROUND 1: mismatch (1 contract finding)
- Auditor: readJsonBody returns `undefined` for empty body; contract says invalid JSON throws
  and empty IS invalid. Orchestrator ruling: empty body throws, no special cases — plan.md
  step 1.3 contract amended; worker resumed to delete the special case. Re-audit will follow
  (a second mismatch on this step stops the run per SKILL §7).

STEP 1.3 API endpoints: health + profile
  tier: WORKER (Sonnet)
  did: lib/http.js (sendJson via writeHead/end, readJsonBody strict — empty body throws);
       api/health.js (GET 200 envelope, else 405); api/profile.js (GET loads/creates+saves
       default profile, else 405); tests/api.test.js (mock req/res, temp DATA_DIR, 5 tests).
  surprises: none
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=34286+35897 (two turns), checker=27936+27749 (two audit rounds),
       orchestrator_delta=unavailable
  interventions: 1 (bad-spec/unauthorized-choice: worker special-cased empty body in
       readJsonBody; ruling = empty throws; contract amended; audit round 2 match)
  audit: match, confidence high (round 2)
  commit: 12dce41
  accepted: 2026-07-24T12:38:15+03:00

STEP 1.4 PWA app shell + design system
  tier: WORKER (Sonnet)
  did: public/index.html (RTL shell, manifest/theme/Rubik, bottom nav 3 tabs, inline SVG
       icons); public/styles.css (GC-6 tokens + cards/buttons/nav/empty-states);
       public/app.js (hash router, active tab, SW registration); public/api.js (envelope
       fetch wrappers); views home/placement/reader/words (Hebrew layouts per spec);
       manifest.webmanifest; icons/icon.svg (amber paw on purple); sw.js (PRECACHE literal,
       cache-first + api network-first); tests/shell.test.js (5 static checks).
  surprises: none
  deviations: none (worker); audit found 1 extra: favicon + apple-touch-icon links in head.
       Ruling: accepted INTO spec by amendment (serves PWA polish; avoids favicon 404).
  validation_first_try: no
  retries: 1 (trailing comma in PRECACHE made it non-JSON; worker self-fixed)
  escalations: 0
  tokens: worker=44181, checker=42506, orchestrator_delta=unavailable
  interventions: 1 (extra-work ruling -> spec amendment, no code change)
  audit: mismatch round 1 (sole finding = the icon links); resolved by amendment; all other
       contract strings verified byte-for-byte by auditor -> accepted without ceremony round 2
  commit: 16c1866
  accepted: 2026-07-24T12:44:36+03:00

## 2026-07-24T12:49:33+03:00 — PHASE 1 GATE
- Acceptance criteria: (1) clean-state `npm install && npm test` exit 0, 35/35 tests — PASS;
  (2) one commit per step 1.1–1.5 in git log — PASS; (3) live dev-server round-trip:
  /api/health {ok:true}, / serves RTL index, /api/profile creates+returns valid default
  profile — PASS. Temporary .data/ from the manual check removed.

PHASE 1 CLOSED
  steps: 5, first-try passes: 3/5 (1.1 blocked by contract flaw it correctly reported;
    1.4 one self-fixed retry — trailing comma in PRECACHE)
  escalations: 0 (steps: none)
  interventions: 4 (1.1 unanswered-question; 1.2 bad-spec wording; 1.3 unauthorized
    empty-body choice -> ruling; 1.4 extra icon links -> accepted by amendment)
  cost: worker=281212 tokens, checker=276931 tokens (incl. plan reviewer 52395),
    planner=orchestrator main thread (delta unavailable), total subagent=558143 tokens.
    Dollar figures: unavailable (harness reports tokens per subagent, not $).
  orchestrator_context: unavailable from within the run (/context is a human UI command);
    qualitative: well within budget, no compaction observed.
  field_guide: 25/40 lines (within budget; promoted lessons 5–9 at this gate)
  observation for the honesty clause: checker spend ≈ worker spend this phase. The auditor
    caught 2 real defects (empty-body choice, unrequested icon links) and the plan reviewer 3;
    escalation rule fired once and was correct. Machinery earning its keep so far, but
    checker-cost parity is the number to watch.

## 2026-07-24T13:03:20+03:00 — PHASE 2 PLANNED (fresh Opus planner, files only)
- Planner did live reconnaissance: pymupdf 1.27.2.3 importable; MoE PDF fetched & inspected
  (52 pages); extraction algorithm pre-validated (~1341 entries, ~1137 single-word lemmas).
- BLOCKERS: none. RECORD GAPS: G1 — design.md §3 claims the lexical list carries "frequency
  data"; the real PDF has NO frequency column (record patched in plan.md; Phase 3 must not
  assume frequency). G2 — no enum value for self-asserted known words; sidestepped by D5.
- Orchestrator review: APPROVED with no step changes. Decisions D1–D5 ratified (PyMuPDF
  offline extraction; conservative hand-rolled lemmatizer; word bank starts EMPTY — no
  band-seeded "known" words, honoring design §1's founding failure; coverage counts
  status==="known" only; mark-known requires explicit source).
- Record-completeness test PASSED: the fresh planner planned the phase from files alone.
- Planner tokens: 99579.

STEP 2.1 Extract MoE Band list -> data/band1.json
  tier: WORKER (Sonnet)
  did: Downloaded MoE PDF (52 pages, 1,003,073 bytes) to data/raw/band1.pdf; wrote
       deterministic scripts/build_band1.py per the frozen algorithm; generated
       data/band1.json (1341 entries, 1137 single-word, sections preBandI:190/bandI:1151,
       reg Prod:971/Rec:363/null:7, 453 with disambiguation meanings); tests/band1.test.js
       (5 cases: meta ranges, full schema sweep, sample lemmas, phrase-with-pos).
  surprises: none — structure and counts matched planning reconnaissance exactly (1341/1137)
  deviations: none
  validation_first_try: yes
  retries: 0
  escalations: 0
  tokens: worker=34842, checker=41591, orchestrator_delta=unavailable
  interventions: 0 code-affecting. Audit round 1 returned one finding that was a FALSE
       POSITIVE caused by the orchestrator ABBREVIATING the spec in the auditor packet
       ("ws-collapsed meaning" vs the authoritative plan.md text
       're.sub(r"\s+"," ",meaning).strip() or None'). Work matches the authoritative spec
       byte-for-byte; finding voided against plan.md; all other checks passed. LESSON:
       auditor packets must quote spec text VERBATIM, never re-abbreviate.
  extra orchestrator checks: rebuild byte-identical (md5); clean npm test 40/40.
  commit: fc1f0a6
  accepted: 2026-07-24T13:09:49+03:00

## 2026-07-24T14:20+03:00 — STEP 2.2 INTERVENTION (unanswered-question / planner bug)
- Executor implemented the frozen baseForms rules verbatim, hit the frozen test, and STOPPED
  correctly: "running" -> slice(0,-3)="runn"/+"e"="runne", never "run"; same flaw makes
  "bigger" -> "bigg" (never "big"). The Opus planner's frozen algorithm contradicted its own
  frozen test fixtures; the worker deleted its files and reported cleanly rather than "fixing"
  the spec itself — exactly the two-designs failure mode the escalation rule exists to prevent.
- DECISION: doubled-consonant reduction added (undouble(stem): len>=3, last two chars equal
  and not a vowel -> drop one), applied ONLY to the plain-slice stems of ed/ing/est/er rules.
  plan.md step 2.2 contract amended; worker resumed with the exact rule.

STEP 2.2 Coverage engine lib/vocab.js
  tier: WORKER (Sonnet)
  did: lib/vocab.js — tokenize/baseForms/knownLemmaSet/coverage, pure ESM zero imports,
       with undouble() doubled-consonant reduction per the mid-step amendment.
       tests/vocab.test.js — fixture (known: dog/cat/run/big; learning: swim) + 8 assertions.
  surprises: none (after amendment)
  deviations: none
  validation_first_try: yes (after amendment; original frozen algorithm was self-contradictory)
  retries: 1 (the stopped-with-question cycle)
  escalations: 0
  tokens: worker=28562+32302 (two turns), checker=31071, orchestrator_delta=unavailable
  interventions: 1 (unanswered-question: planner's frozen baseForms rules could not satisfy
       the planner's own frozen fixtures; undouble rule added by orchestrator amendment)
  audit: match, confidence high
  commit: 204213b
  accepted: 2026-07-24T13:14:06+03:00

STEP 2.3 Profile word-mutation functions
  tier: WORKER (Sonnet)
  did: lib/profile.js — applyWordTap/markWordKnown added (purely additive; existing code
       untouched). tests/profile-mutations.test.js — 7 cases per spec.
  surprises: none · deviations: none
  validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=32315, checker=27868, orchestrator_delta=unavailable
  interventions: 0
  audit: match, confidence high (first round, clean)
  commit: 251f76c
  accepted: 2026-07-24T13:16:12+03:00

## 2026-07-24T14:50+03:00 — STEP 2.4 INTERVENTION (unanswered-question / planner miss)
- Executor stopped correctly before writing anything: Phase 1's tests/api.test.js case
  "profile POST returns 405" contradicts 2.4's new POST semantics (non-iterable mock req ->
  body-read TypeError -> spec-mandated 400, not 405). Planner missed that 2.4 invalidates a
  Phase 1 assertion. Worker proved the failure with a direct repro before stopping.
- DECISION: the obsolete test gives way — single case retargeted to "profile PUT returns 405"
  (mock method PUT); tests/api.test.js added to 2.4's write set for exactly that change.
  plan.md amended; worker resumed.

STEP 2.4 Profile API POST actions
  tier: WORKER (Sonnet)
  did: api/profile.js — POST word-tap/mark-known (validation, mutators, persist, 400/405
       discipline; GET unchanged). tests/api-profile-post.test.js — 10 cases with real
       Readable-stream mocks. tests/api.test.js — single authorized change (obsolete POST-405
       case retargeted to PUT).
  surprises: Readable.from(string) chunks break readJsonBody's Buffer.concat — test mocks
       must stream Buffer chunks. (Production unaffected: real HTTP gives Buffers.)
  deviations: Buffer.from wrapping in test mocks (mechanical, accepted as amendment 2)
  validation_first_try: no · retries: 1 · escalations: 0
  tokens: worker=33497+44213, checker=33140, orchestrator_delta=unavailable
  interventions: 1 (unanswered-question: planner missed that POST semantics invalidate
       Phase 1's "profile POST returns 405" test; single-case retarget authorized)
  audit: match, confidence high
  commit: e42a9e6
  accepted: 2026-07-24T13:22:16+03:00

## 2026-07-24T13:22:17+03:00 — PHASE 2 GATE
- AC1 clean-state install+test: exit 0, 61/61 — PASS. AC2 band1.json: verified at 2.1
  (1341/1137, schema sweep, deterministic rebuild) — PASS. AC3 one commit per step 2.1–2.4
  (fc1f0a6, 204213b, 251f76c, e42a9e6) — PASS. AC4 coverage fixtures green in suite — PASS.
  AC5 live round-trip: POST word-tap -> GET persisted (taps 1) -> mark-known flips status
  and preserves taps/source; malformed body -> 400 — PASS. Hebrew console mojibake is a Git
  Bash display artifact; unit tests assert UTF-8 round-trip.

PHASE 2 CLOSED
  steps: 4, first-try passes: 2/4 (2.2 and 2.4 stopped-with-question on REAL planner defects
    before writing; both resolved by orchestrator amendment, then passed first try)
  escalations: 0 (steps: none)
  interventions: 3 (2.2 planner algorithm/fixture contradiction; 2.4 obsolete Phase 1 test;
    2.1 audit false-positive from orchestrator's abbreviated spec — process defect, mine)
  cost: worker=205731 tokens, checker=133670 tokens, planner=99579 tokens (Opus),
    total subagent=438980 tokens. Dollar figures: unavailable from harness.
  orchestrator_context: unavailable from within the run; qualitative: healthy.
  field_guide: about to add 2 lessons (see next entry).
  honesty-clause note: 2 of 4 steps hit planner defects that the escalation rule converted
    from silent divergence into cheap round-trips. The checker layer also caught nothing
    false in code this phase (its one mismatch was the orchestrator's own summarization).
    Machinery still earning its keep; checker cost dropped to 0.65x worker (better than
    Phase 1's parity).

## 2026-07-24T13:33:04+03:00 — PHASE 3 PLANNED (fresh Opus planner, files only)
- Planner reconnaissance: OpenAI TTS (gpt-4o-mini-tts -> 200 mp3) and chat (gpt-4.1-mini ->
  200) re-verified live; JSON import-attributes + \p{Extended_Pictographic} confirmed on
  Node 22.14; band1 has 562 single nouns for Task 1 candidates.
- BLOCKERS: none. RECORD GAPS: none new (G1 no-frequency reaffirmed; D4 band thresholds are
  heuristic, owner-recalibratable).
- Orchestrator review: APPROVED with Amendment A1 — frozen FUNCTION_FORMS allowlist for the
  Task-2 vocab constraint (irregular forms unreachable via baseForms) + no-contractions rule.
  Preempts the likeliest stopped-with-question round-trip. Decisions D1-D9 ratified.
- Record-completeness test PASSED again (planner needed nothing outside the files).
- Planner tokens: 89067.

## 2026-07-24T15:45+03:00 — STEP 3.1 AUDIT ROUND 1: mismatch (3 tooling findings)
- Committed bank itself is compliant (65/65 tests + orchestrator content inspection).
  Findings hit the generator/test robustness: (1) task2 retry loop re-checked only vocab,
  not full schema; (2) emoji distinctness enforced on only the a2p half in generator AND
  test; (3) shortfall-fill drew from leftover preBandI beyond spec. Worker resumed to fix
  all three with the bank byte-identical (no OpenAI re-run). Re-audit to follow.
- Worker deviations ACCEPTED at acceptance review: retry-feedback prompting (temp-0 blind
  retries pointless) and theme softening "vet's clinic"->"doctor checking an animal" (kept
  texts in vocabulary).
- Content notes for the OWNER review doc (3.5): weak emoji on t1-06 desk (🧑‍💻, he
  "שולחן") and t1-04 fan (🌀) — flag these two for replacement or re-translation.

STEP 3.1 Placement item-bank generator + committed bank
  tier: WORKER (Sonnet)
  did: scripts/build-item-bank.js (offline, mulberry32 seed 20260724, 2×gpt-4.1-mini calls,
       full self-validation incl. retry-feedback prompting); data/placement-items.json
       (12 task1 items — 6 a2p pet/mom/camp/fan/dad/desk + 6 p2w singer/horse/zoo/movie/
       monkey/steak — and 2 task2 texts: dog-at-doctor, elephant-at-zoo, 3 Hebrew MCQs each);
       tests/placement-items.test.js (full mechanical lint, no network).
  surprises: "vet's clinic" theme clashes with band1 vocab (no vet/medicine lemmas);
       temp-0 blind retries were identical -> retry-feedback prompting added (accepted).
  deviations: 2 accepted (retry-feedback prompting; theme softened to "doctor checking an
       animal")
  validation_first_try: no · retries: 1 (generator engineering) · escalations: 0
  tokens: worker=60730+90884, checker=57158+71603 (two audit rounds),
       orchestrator_delta=unavailable
  interventions: 1 (audit round 1: 3 tooling findings — retry-loop scope, emoji-distinctness
       coverage, shortfall-fill source — fixed with bank byte-identical, sha256-verified)
  audit: match, confidence high (round 2)
  commit: 55be2d5
  accepted: 2026-07-24T13:49:47+03:00

STEP 3.2 TTS audio generator + committed mp3s
  tier: WORKER (Sonnet)
  did: scripts/build-tts.js (gpt-4o-mini-tts/nova, frozen instructions); 6 mp3s committed
       under public/audio (12-24KB each, valid MPEG magic 0xFFF3, orchestrator-verified);
       tests/placement-audio.test.js (existence/size, audio-iff-a2p, PRECACHE exclusion).
  surprises: none · deviations: none
  validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=44470, checker=29012, orchestrator_delta=unavailable
  interventions: 0
  audit: match, confidence high (first round)
  commit: 2dce91c
  accepted: 2026-07-24T13:53:01+03:00

STEP 3.3 Placement scoring lib + API endpoint
  tier: WORKER (Sonnet)
  did: lib/placement.js (scoreTask1/scoreTask2/bandForScore/clientView, pure); api/placement.js
       (GET stripped bank via JSON import-attributes, POST submit -> deterministic scoring ->
       skills + markWordKnown(placement) + placement.task1/2 + completed); 2 test files
       (inline-fixture units + real-bank API flow incl. persistence via api/profile.js).
  surprises: none · deviations: none
  validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=51744, checker=38611, orchestrator_delta=unavailable
  interventions: 0 (audit's single finding VOID — my audit-packet abbreviation "??" vs the
       authoritative packet text "if (p === null)", which the code matches verbatim; GC-2 +
       store tests guarantee null. Second occurrence of the abbreviation slip — reminder:
       quote spec text verbatim in auditor packets.)
  audit: match (finding voided against authoritative spec), confidence high
  commit: c00ce8a
  accepted: 2026-07-24T13:57:14+03:00

STEP 3.4 Placement UI flow
  tier: WORKER (Sonnet)
  did: public/views/placement.js — full state machine (intro/task1/task1done/task2/done/error)
       with resume-from-profile, a2p audio+emoji-grid items, p2w large-emoji items, no-feedback
       test discipline, pausable break screen, LTR text cards; tests/placement-ui.test.js —
       static checks (syntax, frozen Hebrew strings, endpoints).
  surprises: none · deviations: none (2 non-frozen helper labels chosen within delegated
       aesthetic latitude)
  validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=55679, checker=39309, orchestrator_delta=unavailable
  interventions: 0
  audit: match, confidence high (first round)
  commit: c3a2455
  accepted: 2026-07-24T14:03:03+03:00

STEP 3.5 Owner review doc
  tier: WORKER (Sonnet)
  did: docs/item-bank-review.md — banner, intro, 12-row fact-checked task1 table, weak-spot
       callouts (t1-06 desk, t1-04 fan), both texts + 6 answered questions, safe-edit guide,
       sign-off.
  surprises: none · deviations: none
  validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=39667, checker=33321, orchestrator_delta=unavailable
  interventions: 1 (two over-literal audit findings — 4 sentences vs "2-3", extra audio-path
       column — ACCEPTED into spec by amendment; auditor fact-checked all 12 rows + 6 answers
       against the bank: zero factual mismatches)
  audit: mismatch round 1 on formalities only; accepted by amendment; facts verified clean
  commit: 06348cf
  accepted: 2026-07-24T14:06:23+03:00

## 2026-07-24T14:07:44+03:00 — PHASE 3 GATE
- AC1 clean-state install+test: exit 0, 88/88 — PASS. AC2 bank lint (in suite) — PASS.
  AC3 audio files exist/sized (in suite) + live serve check (word-pet.mp3, 12288B) — PASS.
  AC4/AC5 scoring + API persistence (in suite) + live GET /api/placement stripped (zero
  "correctIndex") — PASS. AC6 five step commits + review doc with banner — PASS.
- Manual DOM verification (Playwright, real browser): intro screen renders per spec; task1
  a2p item shows progress "שאלה 1 מתוך 12", play button, 2x2 emoji grid; tapping an option
  advances with NO feedback; item 2 options match the bank. UI clean/polished per GC-6.
  Screenshot captured. .data cleaned after check.

PHASE 3 CLOSED
  steps: 5, first-try passes: 4/5 clean validation (3.1 needed one generator-engineering
    retry); audits: 3 first-round match, 2 mismatch rounds resolved (3.1 tooling fixes;
    3.5 formalities accepted by amendment)
  escalations: 0
  interventions: 3 (3.1 audit fixes; 3.3 void finding — my abbreviation slip again;
    3.5 formalities amendment)
  cost: worker=343174, checker=269014, planner=89067 (Opus), total subagent=701255 tokens.
    Dollar figures: unavailable. One-time OpenAI content spend: 2-4 chat calls + 6 TTS calls.
  orchestrator_context: unavailable from within the run; qualitative: mid-session, healthy.
  field_guide: 25/40 + 2 = within budget (no new promotions this gate — lessons 10/11 added
    during phase; nothing new to promote).
  honesty note: the auditor's byte-level cross-check of the review doc against the bank
    (12 rows + 6 answers, zero factual errors found) is exactly the check a tired human
    skips; checker layer continues to earn its cost.
  OWNER GATE (not run-blocking): docs/item-bank-review.md must be reviewed and signed off
    BEFORE the child uses the placement test. Flagged in STATUS.

## 2026-07-24T14:17:13+03:00 — PHASE 4 PLANNED (fresh Opus planner, files only)
- Planner ran ONE sanctioned live probe: real gpt-4.1-mini chapter vs preBandI-only allowed
  set = 0.53 coverage; same text vs preBandI+function-words = 0.89 — grounding cold-start
  decision D1 empirically instead of by guess.
- BLOCKERS: none. RECORD GAPS: none. GC-3 amendment A2 (story.checkLog, additive) logged.
- Orchestrator review: APPROVED, no changes. D0-D10 ratified; the D1 allowed-set union
  (known ∪ preBandI ∪ CORE_FUNCTION_WORDS ∪ STORY_LEXICON, gate ≥0.95 via new
  coverageAgainst) is the phase's load-bearing decision and is mechanical.
- Record-completeness test PASSED (third consecutive phase).
- Planner tokens: 124466.

STEP 4.1 OpenAI wrapper + coverageAgainst
  tier: WORKER (Sonnet)
  did: lib/openai.js (chatJSON, injectable transport, key at call time); lib/vocab.js +
       coverageAgainst (additive); 2 test files (transport shape, key-missing throw, coverage
       fixtures — zero network).
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=30461, checker=25536, orchestrator_delta=unavailable · interventions: 0
  audit: match, confidence high (first round)
  commit: 5975c4d · accepted: 2026-07-24T14:19:14+03:00

STEP 4.2 Story orchestrator lib/story.js
  tier: WORKER (Sonnet)
  did: lib/story.js (CORE_FUNCTION_WORDS+STORY_LEXICON frozen lists, buildAllowedSet,
       verifyChapter 4-gate pipeline, buildPrompt, generateChapter retry loop w/ forbidden
       feedback); tests/story.test.js (list pins, real-band1 allowed-set, accept/reject
       fixtures, retry/give-up flows). 105/105.
  surprises: worker noted Edit-tool converts \u escapes to literal Hebrew chars in code —
       verified byte-identical regex via codePointAt (same quirk as my plan.md writes).
  deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=56655, checker=40510, orchestrator_delta=unavailable
  interventions: 0 (auditor's Object.freeze hedge VOID — "frozen" is contract vocabulary in
       this run, not runtime immutability)
  audit: match, confidence high
  commit: d580015 · accepted: 2026-07-24T14:53:43+03:00

## 2026-07-24T18:20+03:00 — STEP 4.3 INTERVENTION (unanswered-question / planner miss, lesson-11 pattern)
- Executor stopped correctly: A2 (story.checkLog in defaultProfile) breaks Phase-1's
  exact-shape deepStrictEqual test in tests/profile.test.js — outside its file list. Exactly
  the field-guide lesson 11 class (Phase-4 planner missed it, as the Phase-2 planner did).
- DECISION: single-assertion update authorized; tests/profile.test.js added to 4.3 write set
  for exactly that change. plan.md amended; worker resumed.
- Note: lesson 11 should be GENERALIZED in the field guide at the phase gate: any additive
  schema/endpoint change → grep existing tests for exact-shape/method-guard assertions first.

STEP 4.3 setLearner/logCheck + GC-3 A2
  tier: WORKER (Sonnet)
  did: lib/profile.js — checkLog in defaultProfile + validator (A2), setLearner (trim/throw
       rules), logCheck (migration-safe append); tests/profile-learner.test.js (10 cases);
       tests/profile.test.js single authorized literal update. 113/113.
  surprises: none (after amendment) · deviations: none
  validation_first_try: yes (after amendment) · retries: 0 · escalations: 0
  tokens: worker=36851+36940, checker=26619, orchestrator_delta=unavailable
  interventions: 1 (unanswered-question, lesson-11 pattern: A2 broke Phase-1 exact-shape
       test; single-assertion update authorized)
  audit: match, confidence high
  commit: 4b62356 · accepted: 2026-07-24T14:56:55+03:00

STEP 4.4 API: chapter, translate, profile actions
  tier: WORKER (Sonnet)
  did: api/chapter.js (generate->verify->persist, 502 degrade, nothing persisted on fail);
       api/translate.js (single-word fallback, temp 0); api/profile.js +set-learner/+log-check;
       3 test files (transport-injected, real-allowed-set fixture, 132/132).
  surprises: fixture reuse from story tests kept it valid against real band1 without
       profile-specific words.
  deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=66361, checker=39097, orchestrator_delta=unavailable
  interventions: 0 (audit's import-line finding VOID — the spec itself mandated importing
       setLearner/logCheck)
  audit: match, confidence high
  commit: d10beed · accepted: 2026-07-24T15:01:35+03:00

## 2026-07-24T19:10+03:00 — STEP 4.5 AUDIT ROUND 1: mismatch (real logic bug)
- Auditor caught by CODE READING what the static string-tests cannot: wrong answer sets
  answered=true + disables all options -> question locks forever -> "המשך הסיפור" unreachable.
  Spec requires retry-until-right. Also: normalizeWord kept apostrophes (spec: letters only).
- Worker resumed with both fixes (log-check still fires on first choice only). Re-audit next;
  second mismatch on this step would stop the run.

## 2026-07-24T19:50+03:00 — PHASE 4 GATE: AC5 LIVE SMOKE FAILED -> AMENDMENT A3 (orchestrator)
- Real gpt-4.1-mini chapter failed verification 3x (502 degrade worked as designed). Diagnosis
  (direct probe): ratio 0.65. Three causes: (1) learner-chosen names Luna/Sparkle counted
  unknown (~10% of tokens); (2) unicode possessive "Sparkle's" -> stray "s" token; (3) D1
  floor (preBandI only) is below the model's natural register (happy/head/look/must/small/
  want/will are bandI) — while THIS profile measured A2 in placement, and design §3 says
  placement is the prior.
- AMENDMENT A3 (frozen): (a) buildAllowedSet also adds lowercased learner.heroineName/petName
  when non-empty; (b) if skills.receptiveVocab.band is "A1" or "A2", the floor becomes ALL
  band1 lemmas (both sections) — band-aware prior; preA1/null keeps preBandI only; (c)
  verifyChapter normalizes text before coverage: unicode apostrophes -> ascii, then strip
  possessive /'s\b/ (possessives tolerated at verification; no-contraction prompt rule
  stands).
- Empirical check of A3 against the failing chapter: ratio 0.962, unknown = glow/nervous/
  suddenly (exactly the 2-5% glossed-new-words band). NOT the founding failure: the bandI
  floor activates only on a MEASURED A1/A2 placement band.
- Dispatching as step 4.6 to the 4.2 worker.

## 2026-07-24T20:20+03:00 — PHASE 4 GATE round 2: ratio 0.9487 + partial glossary -> AMENDMENT A4
- Post-A3 probe: ratio 0.9487 (4 unknown / 78 tokens, one word short) and the model glossed
  only some off-list words — a passing-ratio chapter can still fail if 2-3 new words lack
  glosses.
- AMENDMENT A4 (frozen): (1) buildPrompt system gains: "You may use AT MOST 3 words that are
  not on the ALLOWED WORD LIST. Every word not on the list MUST have an entry in the
  glossary." (2) generateChapter: when a candidate fails ONLY on glossary-coverage errors
  (ratio/structure/evidence all pass), auto-repair: per missing word, call the injected chat
  with the translate-one-word prompt (temp 0, catch->skip), append {word,he}, re-verify once;
  same attempt, no extra generation. Coverage gate (>=0.95) UNCHANGED.
- Rationale: keeps design's comprehensibility promise and the mechanical guarantee that every
  unknown word is tappable; removes the brittlest failure mode without weakening any gate.

## 2026-07-24T15:25:10+03:00 — PHASE 4 GATE (round 3): PASSED
- AC1 clean install+test 146/146 (after A3/A4) — PASS. AC2-AC4 in suite — PASS.
- AC5 LIVE SMOKE — PASS: real gpt-4.1-mini chapter in 7.8s FIRST attempt: 74 words, ratio
  0.973, 10-entry Hebrew glossary, 3 grounded questions, cliffhanger ("Luna and Sparkle").
  Browser-verified: reader renders chapter LTR; micro-check wrong answer -> "לא נורא, ננסה
  שוב" + retry stays open (the audited fix works live); 3 correct answers -> "המשך הסיפור";
  words view: 14 words, lastSeen-desc, correct badges. Tap-to-translate popup's POST path
  verified via API (the physical tap gesture flagged as an owner first-use check — word spans
  carry no a11y refs for automation). 502 degrade observed live in rounds 1-2 (by design).
- AC6 commits per step (4.1-4.7) — PASS.
- Known display artifact: Git Bash curl mangles Hebrew in -d args (console encoding) — test
  clients must POST Hebrew via Node/browser, never shell-quoted curl. Promoted to field guide.

PHASE 4 CLOSED
  steps: 7 (5 planned + 2 gate-driven amendment steps 4.6/4.7)
  first-try passes: 5/7 clean; interventions: 4 (4.3 lesson-11 question; 4.5 real UI logic
    bug caught by auditor CODE READING; A3+A4 gate-driven design amendments)
  escalations: 0
  cost: worker=517902, checker=291904, planner=124466 (Opus), total subagent=934272 tokens.
    Live OpenAI spend: ~6 generation calls + probes (trivial).
  orchestrator_context: unavailable from within run; qualitative: long session, still coherent;
    continuous mode as instructed.
  field_guide: promoting 2 lessons at this gate (12: schema/method changes invalidate
    exact-shape tests — grep first; 13: curl+Hebrew mojibake).
  honesty note: the live gate caught TWO real design flaws (names/floor cold-start; partial
    glossaries) that 146 green mocked tests could not. The single most valuable check in the
    run so far was AC5's "run it for real once".
