# plan.md — run "first-build"

Run goal: the **first build** from `design.md` §6 — polished Hebrew-UI PWA + placement test +
story loop (chapters, tap-to-translate, micro-checks) + word collection, deployed to Vercel.
Weekly-update features (design §6 items 1–5) are OUT of scope for this run.

Skill binding (SKILL.md §8): Orchestrator = Fable (this session; sits above Opus on the ladder).
Next-phase planner = Opus. Plan reviewer / Auditor = Sonnet. Executor = Sonnet.
Escalation ladder: Haiku < Sonnet < Opus < Fable.

Execution mode: **autonomous / continuous** — human opted in at run start ("Run all phases
without pausing"). Run is 5 phases (> the ~3 recommended for continuous); recommendation to
pause at boundaries was overruled up front by the human instruction.

---

## Global frozen contracts (all phases)

These are decided for the whole run. Changing one requires an orchestrator amendment logged in
the journal.

**GC-1 — Stack.** No build step, no bundler, no frontend framework. Frontend = static files in
`public/` (vanilla ES modules). Backend = Vercel serverless functions in `api/` (Node runtime,
ESM). `package.json` has `"type": "module"`. Only npm dependency: `@vercel/blob`. Tests:
`node --test` (bare — built-in runner's default `**/*.test.js` discovery, zero test deps;
AMENDED 2026-07-24 during step 1.1: the directory form `node --test tests/` fails through npm
on Windows/Node 22). All test files live in `tests/` and end in `.test.js`. Node >= 22.

**GC-2 — Storage.** One learner ⇒ one JSON document. `lib/store.js` exports
`async loadProfile()` / `async saveProfile(profile)`. Backend selection: if
`process.env.BLOB_READ_WRITE_TOKEN` is set → Vercel Blob at pathname `profile/profile.json`
(public access, `addRandomSuffix: false`, `allowOverwrite: true`); otherwise → local file
`<DATA_DIR>/profile.json` where `DATA_DIR` env var defaults to `.data`. Tests always use the
file backend with a temp `DATA_DIR`.

**GC-3 — Profile schema v1.** The single source of truth about the learner:

```json
{
  "version": 1,
  "learner": { "heroineName": null, "petName": null },
  "skills": {
    "receptiveVocab":        { "state": "unknown", "score": null, "band": null },
    "readingComprehension":  { "state": "unknown", "score": null, "band": null },
    "writing":               { "state": "unknown", "score": null, "band": null },
    "grammarInContext":      { "state": "unknown", "score": null, "band": null },
    "pronunciation":         { "state": "unknown", "score": null, "band": null }
  },
  "words": {},
  "placement": { "completed": false, "task1": null, "task2": null, "completedAt": null },
  "story": { "chapters": [], "summarySoFar": "", "cliffhanger": "" },
  "meta": { "createdAt": "<iso>", "updatedAt": "<iso>" }
}
```

- `skills.*.state` ∈ `"unknown" | "estimated"`; `score` ∈ null | number 0..1; `band` ∈ null |
  `"preA1" | "A1" | "A2"`.
- `words` is a map keyed by lowercase English lemma →
  `{ "status": "known"|"learning", "source": "placement"|"tap"|"band", "he": string|null,
     "taps": number, "firstSeen": iso, "lastSeen": iso }`.
- Later phases may ADD keys (never rename/remove) — additions logged as amendments.

**GC-4 — API envelope.** Every `api/*.js` exports `export default async function handler(req, res)`
and touches `res` ONLY through `lib/http.js` helpers (raw-Node compatible, so the same handlers
run under Vercel and the local dev server): `sendJson(res, status, body)` and
`readJsonBody(req)`. Response body is always `{ "ok": true, "data": ... }` or
`{ "ok": false, "error": "<message>" }`. Wrong method → 405 with the envelope.

**GC-5 — Frontend shape.** SPA, hash routing: `#/home` (default), `#/placement`, `#/reader`,
`#/words`. `public/index.html` has `<html lang="he" dir="rtl">`. UI text Hebrew; story text
English rendered LTR inside the reader. Each view module `public/views/<name>.js` exports
`render(container, ctx)`. App display name: **"מרפאת הקסמים"** (manifest `name`), `short_name`
"קסמים".

**GC-6 — Design tokens** (the "polished, not babyish, 11-year-old" look; design.md §7 tone):
primary purple `#7c3aed`, teal `#0d9488`, accent amber `#f59e0b`, background warm off-white
`#faf7f2`, ink `#1f2937`, cards white, `border-radius: 16px`, buttons min-height 48px.
Font: "Rubik" from Google Fonts (weights 400;500;700, Hebrew+Latin subsets) with
`system-ui` fallback. All tokens are CSS custom properties in `public/styles.css` `:root`.

**GC-7 — Secrets.** `OPENAI_API_KEY` server-side only (design §2). No key ever appears in
`public/` or in committed files. `.env` stays gitignored.

**GC-8 — Commits.** One commit per accepted step: `step <phase>.<n>: <title>` on branch
`master`. Orchestrator commits; executors never run git commands.

---

## PHASE 1 — Skeleton & app shell  (CURRENT — planned in full)

**Goal:** a runnable project skeleton: npm project Vercel can deploy zero-config, storage +
profile libraries with tests, health/profile API endpoints, the complete polished PWA shell
(RTL Hebrew, all four views navigable as real layouts), and a local dev server that serves both
static files and API routes.

**Phase acceptance criteria (frozen now, checked at the phase gate):**
1. From a clean state (`node_modules` removed): `npm install --no-audit --no-fund && npm test`
   exits 0, with tests covering store, profile, api handlers, shell static checks, and a live
   localhost round-trip through the dev server.
2. `git status --porcelain` shows no unexpected tracked changes; one commit per step exists
   (`git log --oneline` shows steps 1.1–1.5).
3. `node scripts/dev-server.js` (run by the orchestrator) serves `/` (index.html 200) and
   `/api/health` (`{"ok":true,...}`) — verified manually with curl once at the gate.

### STEP 1.1 — Project scaffold
- **goal:** npm project + Vercel zero-config + repo hygiene, so every later step can run
  `npm test` and Vercel can deploy `public/` + `api/` with no build.
- **files:** `package.json`, `package-lock.json` (via npm install), `vercel.json`,
  `.env.example`, `.gitignore` (modify: append `.data/` under "# Misc"), `README.md`,
  `tests/smoke.test.js`. (`node_modules/` appears as a side effect of `npm install`; it is
  gitignored and out of write-set accounting.)
- **commands:** `npm install --no-audit --no-fund`
- **validation (frozen):** `npm install --no-audit --no-fund && npm test` → exit 0
- **contracts:** GC-1. `package.json`: `name` "english-app", `private` true, `"type":"module"`,
  `engines.node` ">=22", scripts `{"test":"node --test","dev":"node scripts/dev-server.js"}` (AMENDED per GC-1),
  dependencies exactly `{"@vercel/blob":"^1.1.0"}`. `vercel.json`: exactly `{"cleanUrls": true}`.
  `.env.example`: three lines `OPENAI_API_KEY=`, `BLOB_READ_WRITE_TOKEN=`,
  `ANTHROPIC_API_KEY=` each with a short `#` comment above (Anthropic marked "dormant fallback —
  do not use at runtime"). `README.md`: ≤25 lines English — what the app is (one paragraph,
  from design.md §1), how to run tests, how to run dev server (`npm run dev`, exists after step
  1.5 — say "coming in this phase"). `tests/smoke.test.js` (node:test): asserts package.json
  parses + `type==="module"` + test script correct; vercel.json parses; `.env.example` contains
  the three key names; `.gitignore` contains `.env` and `.data/`.
- **non-goals:** no `lib/`, `api/`, `public/`, `scripts/` — later steps. Do not create `.data/`.
  Do not touch `design.md`, `assets/`, `.oplan/`.
- **tier:** WORKER (Sonnet). budgets: 2 retries, ≤1 packet-worth of work (single sitting).

### STEP 1.2 — Profile + storage libraries
- **goal:** `lib/profile.js` (schema v1 factory + validator) and `lib/store.js` (file/Blob
  backends per GC-2), fully unit-tested on the file backend.
- **files:** `lib/profile.js`, `lib/store.js`, `tests/profile.test.js`, `tests/store.test.js`
- **commands:** none — direct file edits (run `npm test` to check).
- **validation (frozen):** `npm test` → exit 0
- **contracts:** GC-2, GC-3. `lib/profile.js` exports: `defaultProfile(nowIso)` → a fresh
  schema-v1 object (both meta timestamps = `nowIso`, default `new Date().toISOString()`);
  `validateProfile(p)` → `{ok: boolean, errors: string[]}` checking: `version === 1`, all six
  top-level keys present with correct types, all five skills present each with valid
  `state/score/band` values, every `words` entry has valid `status/source` enums, numeric
  `taps`, `he` string-or-null, and `firstSeen`/`lastSeen` parseable ISO date strings (the
  validator enforces the FULL GC-3 word-entry schema, not a subset). `lib/store.js` exports `loadProfile()` (returns `null` if nothing stored),
  `saveProfile(profile)` (stamps `meta.updatedAt`, writes; file backend creates `DATA_DIR`
  recursively). Blob backend: `put` from `@vercel/blob` with the GC-2 options; read via
  `head(pathname)` → fetch URL → JSON, returning `null` on not-found. Blob code paths are NOT
  unit-tested live (no token in tests) — tests must assert the file backend is chosen when
  `BLOB_READ_WRITE_TOKEN` is unset, and use a temp `DATA_DIR`.
- **non-goals:** no word-update helpers, no skill-estimation logic (Phase 2), no API endpoints
  (step 1.3). Do not import `lib/store.js` from any existing file.
- **amendment (during 1.2 audit):** the store test's updatedAt-bump assertion is the
  conjunction `second >= first AND second !== first` (proves updatedAt advances); the packet's
  original "differ or second ≥ first" phrasing was sloppy and is superseded.
- **tier:** WORKER (Sonnet). budgets: 2 retries.

### STEP 1.3 — API endpoints: health + profile
- **goal:** first two serverless functions and the shared HTTP helpers, unit-tested with mock
  req/res.
- **files:** `lib/http.js`, `api/health.js`, `api/profile.js`, `tests/api.test.js`
- **commands:** none — direct file edits.
- **validation (frozen):** `npm test` → exit 0
- **contracts:** GC-4. `lib/http.js`: `sendJson(res, status, body)` uses only
  `res.writeHead(status, {"Content-Type":"application/json; charset=utf-8"})` + `res.end(JSON.stringify(body))`;
  `readJsonBody(req)` collects the stream, parses JSON, throws on invalid — an EMPTY body is
  invalid JSON and throws too; no special cases (AMENDED during 1.3 audit). `api/health.js`:
  GET → 200 `{ok:true, data:{status:"up", version:1}}`; other methods → 405 envelope.
  `api/profile.js`: GET → `loadProfile()`; if null, create `defaultProfile()`, save it, return
  it; response `{ok:true, data:<profile>}`; other methods → 405 (mutations come in Phase 2).
  `tests/api.test.js` builds minimal mock req (`{method, headers}` + Readable for body) and res
  (captures status/body), sets a temp `DATA_DIR`, asserts: health envelope; profile GET returns
  an object passing `validateProfile`; second GET returns the persisted profile (same
  `meta.createdAt`); POST to both → 405.
- **non-goals:** no other endpoints, no dev server (1.5), no changes to `lib/store.js` or
  `lib/profile.js`.
- **tier:** WORKER (Sonnet). budgets: 2 retries.

### STEP 1.4 — PWA app shell + design system
- **goal:** the complete polished static shell: RTL Hebrew SPA with hash router, four navigable
  views (real layouts, placeholder data), design-token stylesheet, PWA manifest + SVG icon +
  service worker. This is the app she will see — layout and styling are the deliverable, even
  though logic is stubbed.
- **files:** `public/index.html`, `public/styles.css`, `public/app.js`, `public/api.js`,
  `public/views/home.js`, `public/views/placement.js`, `public/views/reader.js`,
  `public/views/words.js`, `public/manifest.webmanifest`, `public/icons/icon.svg`,
  `public/sw.js`, `tests/shell.test.js`
- **commands:** none — direct file edits.
- **validation (frozen):** `npm test` → exit 0
- **contracts:** GC-5, GC-6. `index.html`: `<html lang="he" dir="rtl">`, `<meta name="viewport">`
  mobile-correct, `<link rel="manifest" href="/manifest.webmanifest">`, theme-color `#7c3aed`,
  Google Fonts Rubik preconnect+stylesheet link, single `<main id="app">`, bottom nav with 3
  tabs — "הסיפור" (`#/reader`), "בית" (`#/home`), "המילים שלי" (`#/words`) — inline SVG icons,
  `<script type="module" src="/app.js">`. `app.js`: hash router mapping GC-5 routes to view
  modules, default `#/home`, active-tab highlighting, registers `/sw.js` on load.
  `api.js`: `getJson(path)` / `postJson(path, body)` wrapping fetch + the GC-4 envelope
  (throws on `ok:false`). Views (Hebrew text): home = greeting "שלום!" + app title + two cards:
  "מבחן היכרות" (button → `#/placement`, subtitle "כדי שהסיפור יתאים בדיוק לך") and
  "הסיפור" (locked state: "קודם נכיר אותך קצת"); placement = intro screen explaining the two
  short tasks + big start button (disabled, "בקרוב"); reader = empty state "הסיפור עוד לא
  התחיל…" with illustration placeholder; words = empty state "עוד אין מילים באוסף" +
  explanation that tapped words land here. No fetch calls from views in this step.
  `manifest.webmanifest`: name "מרפאת הקסמים", short_name "קסמים", start_url "/", display
  "standalone", dir "rtl", lang "he", background_color "#faf7f2", theme_color "#7c3aed", icons:
  `icons/icon.svg` (sizes "any", purpose "any maskable"). `icon.svg`: simple flat mark — amber
  paw print over a purple rounded square (pure SVG shapes, no text). `sw.js`: `const CACHE =
  "magic-vet-v1"` and `const PRECACHE = [...]` where PRECACHE is a JSON-parseable array
  literal, exactly: `["/", "/styles.css", "/app.js", "/api.js", "/views/home.js",
  "/views/placement.js", "/views/reader.js", "/views/words.js", "/manifest.webmanifest",
  "/icons/icon.svg"]`; install handler `cache.addAll(PRECACHE)`; fetch handler: `/api/` →
  network-first, else cache-first with network fallback. `tests/shell.test.js`: reads files and asserts —
  index.html contains `dir="rtl"`, `lang="he"`, manifest link, app.js module script; manifest
  parses with required fields per this spec; every `public/**/*.js` passes `node --check`
  (spawn); sw.js contains `magic-vet-v1`, and the test extracts the `PRECACHE = [...]` array
  literal (regex between `[` and `]`), JSON-parses it, and asserts every entry resolves to an
  existing file under `public/` (`"/"` maps to `index.html`); styles.css defines tokens named
  `--color-primary`, `--color-teal`, `--color-accent`, `--color-bg`, `--color-ink`,
  `--radius`.
- **non-goals:** no placement logic, no reader logic, no API wiring from views, no push
  notifications, no PNG icons. Do not modify `api/` or `lib/`.
- **tier:** WORKER (Sonnet). budgets: 2 retries.

### STEP 1.5 — Local dev server
- **goal:** `npm run dev` serves the PWA + API locally so the orchestrator (and later phases)
  can exercise the real app without deploying.
- **files:** `scripts/dev-server.js`, `tests/dev-server.test.js`, `README.md` (modify: fill in
  the dev-server line).
- **commands:** none — direct file edits.
- **validation (frozen):** `npm test` → exit 0
- **contracts:** zero dependencies (node:http). Exports `startServer(port)` → `Promise<{server,
  port}>` (port 0 ⇒ ephemeral); when executed directly, starts on `process.env.PORT ?? 3000`
  and logs the URL. Static: serves `public/` with MIME map for `.html .css .js .json
  .webmanifest .svg .png .mp3` ; `/` → `index.html`; unknown non-API path → `index.html`
  (SPA fallback). API: path `/api/<name>` → `await import("../api/<name>.js")` and call default
  export with the raw req/res (handlers are raw-compatible per GC-4); unknown api name → 404
  envelope; handler throw → 500 envelope. No directory traversal (resolve+prefix check).
  `tests/dev-server.test.js`: temp `DATA_DIR`; `startServer(0)`; fetch `/` → 200 + `text/html`
  + body contains `dir="rtl"`; `/styles.css` → 200; `/api/health` → `{ok:true}`;
  `/api/nope` → 404; traversal check MUST bypass client normalization (fetch collapses `../`):
  use `node:http` `http.request({port, path})` with raw paths `"/../package.json"` and
  `"/..%2Fpackage.json"`, assert neither response body contains `"@vercel/blob"` (i.e. the
  real package.json never leaks); closes server.
- **non-goals:** no HTTPS, no live reload, no proxying, no changes under `public/` or `api/`.
- **tier:** WORKER (Sonnet). budgets: 2 retries.

---

## PHASE 2 — Word data & profile engine  (skeleton)
- **goal:** the calibration substrate: official MoE Band I word list as machine-usable data, and
  the profile mutation engine (word taps, known-word marking, coverage computation).
- **expected inputs:** Phase 1 libs (`lib/profile.js`, `lib/store.js`, GC-4 helpers).
- **expected outputs:** `data/band1.json` (word list w/ frequency tier), `lib/vocab.js`
  (coverage: % of a text's tokens known per profile; tokenizer + lemma normalization rules),
  `api/profile.js` POST actions (`word-tap`, `mark-known`), tests.
- **likely files/systems:** `data/raw/band1.pdf` (fetch with `curl --ssl-no-revoke`), a Python
  or npm PDF extraction path — TO DECIDE at phase planning after checking available tooling.
- **validation gate:** `npm test`; `data/band1.json` spot-checked against the PDF (sample words
  present, count plausible vs the official list size).
- **risks:** PDF extraction quality (two-column layout); corporate TLS blocking pip/npm installs.
- **open questions (decide at planning):** extraction tool; lemma normalization policy;
  whether Band words start as `source:"band"` known-hypotheses or empty until placement.

## PHASE 3 — Placement test  (skeleton)
- **goal:** the pre-built, owner-reviewable item bank + TTS audio + the two-task placement UI
  that writes the initial skill estimates and word statuses into the profile.
- **expected inputs:** `data/band1.json`, profile engine, app shell placement view.
- **expected outputs:** `scripts/build-item-bank.js` (offline, OpenAI; NEVER runtime),
  `data/placement-items.json`, `docs/item-bank-review.md` (owner checklist), `scripts/build-tts.js`
  → `public/audio/*.mp3` (gpt-4o-mini-tts), working placement flow (Task 1 word↔picture w/
  audio, Task 2 micro-texts + Hebrew-option MCQs), scoring → profile update endpoint.
- **validation gate:** `npm test` incl. scoring unit tests; item bank passes a mechanical lint
  (every item: valid word from band1, 1 correct + 3 distractors, audio file exists); owner
  review flagged as REQUIRED-BEFORE-CHILD-USE in STATUS (human gate, not run-blocking).
- **risks:** pictures for word↔picture items (likely emoji/SVG at launch — decide at planning);
  TTS cost/quality; item quality needs owner eyes.

## PHASE 4 — Story engine  (skeleton)
- **goal:** the core loop live end-to-end locally: generate chapter 1..N constrained to known
  words, read with tap-to-translate, answer micro-checks, watch the word collection grow.
- **expected inputs:** profile with placement estimates, `lib/vocab.js` coverage, app shell.
- **expected outputs:** `lib/openai.js` (chat wrapper, server-only), `api/chapter.js`
  (generate + coverage-check ≥95% known + question-answerability verification + Hebrew glossary;
  regenerate on failed checks), `api/translate.js` (fallback), reader UI (tap word → glossary
  popup → save to bank), micro-check UI (2–3 Hebrew-option MCQs inline), words view (real data),
  onboarding (heroine + pet naming) feeding `learner.*`.
- **validation gate:** `npm test` with mocked OpenAI; one live generation smoke-tested by the
  orchestrator against the real key; coverage checker demonstrably rejects a too-hard text.
- **risks:** coverage constraint may need multiple regeneration rounds (cost/latency); question
  verification mechanics (decide: verbatim-anchor check vs. second LLM pass) — decide at planning.

## PHASE 5 — Integration, polish & deploy  (skeleton)
- **goal:** deployed, installable, verified on production URL; owner handoff doc.
- **expected inputs:** everything above green locally.
- **expected outputs:** Vercel project linked + Blob store provisioned + env vars set
  (`vercel` CLI at `"$(npm prefix -g)/vercel"`), production deploy, PWA installability check,
  app icon via the ChatGPT image pipeline (design §7, dedicated chat), `docs/owner-handoff.md`
  (install steps, item-bank review, what to watch).
- **validation gate:** `curl --ssl-no-revoke` production `/api/health` + `/` 200; Lighthouse-
  style manifest/SW checks; full loop exercised once on production by the orchestrator.
- **risks:** Blob provisioning via CLI; public-access Blob URL for profile data (low
  sensitivity — no real name stored — but revisit `access` options here); Vercel project
  settings (no framework preset).
