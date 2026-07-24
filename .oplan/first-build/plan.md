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
  Google Fonts Rubik preconnect+stylesheet link, `<link rel="icon">` + `<link rel="apple-touch-icon">` pointing at `/icons/icon.svg`
  (AMENDED during 1.4 audit — icon links accepted into spec), single `<main id="app">`, bottom nav with 3
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

## PHASE 2 — Word data & profile engine  (CURRENT — planned by fresh Opus planner, reviewed & approved by orchestrator 2026-07-24)

**GOAL:** the official MoE Pre-Band I / Band I lexical list as committed machine-usable data
(`data/band1.json`), a dependency-free vocabulary coverage engine (`lib/vocab.js`), and the
profile word-mutation engine (word-tap / mark-known) as pure functions + GC-4 POST actions on
`api/profile.js`. All green under `npm test`.

**ACCEPTANCE CRITERIA (frozen):**
- AC1: clean-state `npm install --no-audit --no-fund && npm test` exits 0; suite includes
  tests/band1.test.js, tests/vocab.test.js, tests/profile-mutations.test.js,
  tests/api-profile-post.test.js.
- AC2: data/band1.json parses; `.meta.entryCount === .entries.length` ∈ [1250,1450];
  `.meta.singleWordCount` ∈ [1050,1200]; frozen sample lemmas present; every entry passes the
  frozen entry schema; at least one phrase entry has `single:false`.
- AC3: one commit per step 2.1–2.4; `git status --porcelain` clean at gate.
- AC4: coverage() returns the exact frozen fixture ratios in tests/vocab.test.js.
- AC5: POST /api/profile word-tap / mark-known mutates AND persists (second GET reflects it).

**DEPENDS ON (Phase 1):** lib/profile.js (defaultProfile/validateProfile + enums, extended
additively), lib/store.js (GC-2), lib/http.js (GC-4; readJsonBody THROWS on empty/invalid —
field guide 8), api/profile.js GET, test patterns from tests/api.test.js.

**SKELETON CHANGES (approved):** (1) The source PDF has NO per-word frequency column — columns
are Entry/PoS/Meaning/(Oral|Family member(s))/Rec-Prod. "Frequency tier" replaced by the two
real signals: `section` ∈ {preBandI, bandI} and `reg` ∈ {Prod, Rec, null}. (2) lib/vocab.js
operates on the PROFILE's known set only; band1.json is static reference for Phase 3. (3)
band1.json is {meta, entries:[…]} (array — duplicate lemmas exist across PoS/section rows).

**DECISIONS (planner-proposed, orchestrator-approved):**
- D1 PDF extraction = Python + PyMuPDF (`import fitz`; pymupdf 1.27.2.3 verified importable
  on this machine). Offline build tool only, never runtime; zero npm footprint (GC-1 intact).
- D2 Lemma normalization = hand-rolled conservative inflection stripper in lib/vocab.js (rules
  frozen in step 2.2); MoE list is already base-forms, only story-side inflections need reducing.
- D3 Band words start EMPTY in the profile (NOT seeded as source:"band" known-hypotheses) —
  seeding ~1000 unmeasured "known" words would repeat design.md §1's founding failure.
  `source:"band"` stays reserved.
- D4 coverage() counts `status==="known"` only; "learning" (tapped) words do NOT count toward
  the 95–98% constraint.
- D5 markWordKnown REQUIRES explicit `source` ∈ {"placement","tap","band"} (no default; API
  returns 400 if missing/invalid). No GC-3 amendment needed.

### STEP 2.1 — Extract MoE Band list → data/band1.json
- **goal:** committed data/raw/band1.pdf + deterministic Python builder + data/band1.json
  validated by a Node test.
- **files (create):** scripts/build_band1.py, data/raw/band1.pdf, data/band1.json,
  tests/band1.test.js
- **commands:**
  `curl --ssl-no-revoke -s -o data/raw/band1.pdf "https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/CurriculumFilesAugust21/LexicalBand1.pdf"` ·
  `python scripts/build_band1.py` (pymupdf already importable; fallback `pip install --user pymupdf`)
- **validation (frozen):** `npm test`
- **contracts:** PDF: 52 pages; pages 0–1 cover/sources (SKIP); pages 2–7 PRE-BAND I (page
  text lacks "Family member"); pages 8–51 BAND I (contains "Family member").
  build_band1.py algorithm FROZEN (reproduce exactly):
  open PDF; for pages 2..end: section = "bandI" if "Family member" in page text else
  "preBandI"; words = page.get_text("words") filtered to y0 > 90 (drops top banner); group
  into rows by round(y0), each row sorted by x0; header = first row whose word-set contains
  "Entry" AND ("PoS" or "Meaning"), skip page if none; xs = sorted distinct round(x0) of
  header words, entry_left=xs[0], second_left=xs[1]; reg_left = min x0 of tokens "Prod"/"Rec"
  on the page (fallback max header x0); meaning_left = x0 of header word starting "Meaning"
  (else None); header_y = round(header row y); for each row below header_y+2:
  entry = join of words with x0 < second_left-2 (whitespace-collapsed, stripped);
  reg = join of words with x0 >= reg_left-2, kept only if in {"Prod","Rec"} else null;
  meaning = join of words with meaning_left-2 <= x0 < reg_left-2 (if meaning_left) else "";
  pos = join of words with second_left-2 <= x0 < (meaning_left-2 if meaning_left else
  reg_left-2); skip row if entry empty; skip if neither reg nor pos (wrapped-continuation
  fragments); lemma = entry.lower();
  emit {"lemma", "pos": pos or None, "meaning": ws-collapsed or None, "reg", "section",
  "single": bool(re.fullmatch(r"[a-z]+", lemma))}.
  Sort by (section=="bandI", lemma, pos or "", meaning or "") — preBandI first, deterministic.
  Write {"meta":{"source":"Israel MoE — Lexical Pre-Band I & Band I (Elementary), Nov 2020,
  rev. 2023-01-26","sourceUrl":<the URL>,"extractedWith":"pymupdf","entryCount":len,
  "singleWordCount":count single},"entries":[...]} with ensure_ascii=False, indent=2,
  trailing newline.
  Entry schema (frozen): lemma lowercase/trimmed/ws-collapsed string; pos string|null;
  meaning string|null; reg "Prod"|"Rec"|null; section "preBandI"|"bandI"; single boolean ===
  /^[a-z]+$/.test(lemma).
  tests/band1.test.js asserts: parses; meta counts equal recomputed counts and in ranges
  ([1250,1450] entries, [1050,1200] single); every entry passes schema; sample single lemmas
  present with section — preBandI: dog,cat,pet,friend,run · bandI: animal,because,beautiful,
  apple,water; ≥1 entry with single===false and non-null pos. (Reference: entryCount≈1341,
  singleWordCount≈1137.)
- **non-goals:** no runtime PDF parsing; no npm PDF dep; no profile seeding; do not touch
  lib/ or api/.
- **tier:** WORKER (Sonnet). depends on: nothing (first step). Needs network + Python.

### STEP 2.2 — Coverage engine lib/vocab.js
- **goal:** pure, dependency-free tokenizer + conservative lemmatizer + coverage() over a profile.
- **files (create):** lib/vocab.js, tests/vocab.test.js
- **commands:** none — direct file edits. **validation (frozen):** `npm test`
- **contracts (pure ESM, zero imports):**
  `tokenize(text)` → `(String(text).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [])`.
  `baseForms(token)` → de-duplicated array, token first, adding candidates only when result
  length ≥ 2: ends "ies"(len≥5)→stem+"y"; "es"(len≥4)→slice(0,-2); "s"(len≥4, not "ss")→
  slice(0,-1); "ied"(len≥5)→stem+"y"; "ed"(len≥4)→slice(0,-2) AND slice(0,-1);
  "ing"(len≥5)→slice(0,-3) AND slice(0,-3)+"e"; "est"(len≥5)→slice(0,-3); "er"(len≥4)→slice(0,-2).
  `knownLemmaSet(profile)` → Set of keys where words[k].status==="known" (missing words ⇒ empty).
  `coverage(text, profile)` → {total, known, unknown: sorted unique unknown tokens, ratio:
  total===0?0:known/total}; token known iff baseForms(token).some(b=>known.has(b)).
  tests/vocab.test.js fixture: known dog,cat,run,big; "swim" status "learning" (must NOT
  count). Asserts: tokenize("The dogs RUN!")=["the","dogs","run"]; baseForms("dogs")∋"dog";
  baseForms("running")∋"run"; baseForms("bigger")∋"big"; baseForms("ss") no crash;
  coverage("dogs run")→{total:2,known:2,ratio:1}; coverage("dogs swim")→known:1, ratio:0.5,
  unknown:["swim"]; coverage("")→{total:0,known:0,unknown:[],ratio:0}.
- **non-goals:** no band1.json import; no story generation; no profile mutation; don't touch
  lib/profile.js or api/.
- **tier:** WORKER (Sonnet). depends on: nothing (independent of 2.1).

### STEP 2.3 — Profile word-mutation functions (lib/profile.js, additive)
- **goal:** pure mutators applyWordTap / markWordKnown added to lib/profile.js (ADDITIVE
  exports only; existing exports unchanged — GC-3).
- **files:** lib/profile.js (modify), tests/profile-mutations.test.js (create)
- **commands:** none. **validation (frozen):** `npm test`
- **contracts:**
  `applyWordTap(profile, {lemma, he=null, now=new Date().toISOString()})`: k =
  String(lemma).trim().toLowerCase(); throw Error("lemma required") if ""; new entry →
  {status:"learning", source:"tap", he:he??null, taps:1, firstSeen:now, lastSeen:now};
  existing → taps+=1, lastSeen=now, he backfilled only if currently null (status/source
  unchanged). Returns profile (in-place).
  `markWordKnown(profile, {lemma, source, he=null, now=...})`: same lemma normalization/throw;
  throw Error("invalid source") if source ∉ WORD_SOURCES {"placement","tap","band"}; new →
  {status:"known", source, he:he??null, taps:0, firstSeen:now, lastSeen:now}; existing →
  status="known", lastSeen=now, he backfill-if-null (source and taps preserved). Returns profile.
  All produced entries satisfy validateProfile.
  tests/profile-mutations.test.js: new tap → learning/tap/taps 1/he set/firstSeen===lastSeen;
  second tap with later `now` → taps 2, lastSeen advanced, firstSeen unchanged, still
  "learning"; markWordKnown new lemma source "placement" → known/taps 0; markWordKnown on
  existing tapped lemma → flips to known, taps + original source preserved; bad/missing source
  throws; blank lemma throws; final validateProfile ok.
- **non-goals:** no API/HTTP; no store I/O; no coverage; don't modify enum VALUES; don't touch
  api/ or lib/vocab.js.
- **tier:** WORKER (Sonnet). depends on: step 1.2's lib/profile.js (already accepted).

### STEP 2.4 — Profile API POST actions
- **goal:** api/profile.js gains GC-4 POST word-tap / mark-known using 2.3's mutators,
  persisted via store.
- **files:** api/profile.js (modify), tests/api-profile-post.test.js (create)
- **commands:** none. **validation (frozen):** `npm test`
- **contracts:** keep existing GET. POST: readJsonBody in try/catch → 400
  {ok:false,error:"invalid JSON body"} on throw. action==="word-tap": require non-blank string
  lemma (else 400 "lemma required"); applyWordTap(p,{lemma, he: body.he ?? null}).
  action==="mark-known": require lemma AND source ∈ {"placement","tap","band"} (else 400
  "source required"/"lemma required"); markWordKnown(...). other action → 400 "unknown
  action". Mutator throws → 400 with err.message. Then saveProfile(p); 200 {ok:true,data:p}.
  p = await loadProfile() ?? defaultProfile(). Non-GET/POST → 405 (unchanged shape).
  tests/api-profile-post.test.js: reuse withTempDataDir pattern + mock res; req = node:stream
  Readable of the JSON string with `method` property set (readJsonBody consumes `for await`).
  Asserts: word-tap dog/כלב → 200, words.dog.status "learning", taps 1; GET persists (taps 1);
  second tap → taps 2; mark-known cat/placement → known; mark-known no source → 400; unknown
  action → 400; malformed body "{" → 400; missing lemma → 400; PUT → 405; all envelopes GC-4.
- **non-goals:** no new endpoints; no placement/scoring; no coverage endpoint; don't modify
  lib/*, data/*, public/*.
- **tier:** WORKER (Sonnet). depends on: 2.3.

**RISKS:** R1 pymupdf version drift → band1.json committed + count-range tests. R2
over-aggressive baseForms over-credits knowledge → conservative rules, known-only counting
(D4), frozen unit pins; residual risk re-reviewed in Phase 4. R3 readJsonBody throws on empty
body → 2.4 try/catch → 400, tested. R4 the 2.4 mock req MUST be a real Readable (async
iterable), not `{method}` — a plain object hangs readJsonBody.

**RECORD GAPS (patched at planning):** G1 design.md §3 says the lexical list has "frequency
data" — the actual PDF has none (PoS/Meaning/Rec-Prod/section only). Phase 3 item ordering
must use section+reg or an external corpus (decide at Phase 3 planning); do NOT assume a
frequency field exists. G2 no `source` enum value for learner-asserted "known" outside
placement — D5 sidesteps; additive enum amendment only if a future phase needs it.

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
