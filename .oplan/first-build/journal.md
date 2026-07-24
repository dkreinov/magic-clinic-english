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
