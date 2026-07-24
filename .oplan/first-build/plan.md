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
  AMENDED during 2.2 (planner bug — "running"→"runn", "bigger"→"bigg"): for every stem
  produced by the plain-slice variants of the "ed", "ing", "er", "est" rules (not the +"e"/+"y"
  variants), if the stem has length ≥ 3 and ends in a doubled non-vowel letter (last two chars
  equal and ∉ {a,e,i,o,u}), ALSO add stem.slice(0,-1). Same ≥2-length guard applies.
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
- **files:** api/profile.js (modify), tests/api-profile-post.test.js (create),
  tests/api.test.js (modify — AMENDED during 2.4: ONLY the now-obsolete case
  "profile POST returns 405" becomes "profile PUT returns 405" with the mock method "PUT";
  the planner missed that adding POST semantics invalidates that Phase 1 assertion)
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

## PHASE 3 — Placement test  (CURRENT — planned by fresh Opus planner, orchestrator-approved 2026-07-24 with Amendment A1)

**GOAL:** a committed, owner-reviewable placement item bank (emoji "pictures" + committed TTS
mp3s) built OFFLINE from data/band1.json, plus deterministic server-side scoring and the
two-task placement UI. Completing it writes skills.receptiveVocab +
skills.readingComprehension (state/score/band) and markWordKnown(source:"placement") for each
correctly answered Task-1 word. Test items are NEVER generated at runtime.

**ACCEPTANCE CRITERIA (frozen):**
- AC1 clean `npm install --no-audit --no-fund && npm test` exits 0; suite adds
  tests/placement-items.test.js, placement-audio.test.js, placement-scoring.test.js,
  api-placement.test.js, placement-ui.test.js.
- AC2 data/placement-items.json parses; task1 length ∈ [10,16]; every task1 item passes the
  frozen item schema (direction enum; 4 distinct options; correctIndex in range;
  options[correctIndex] === (audio-to-picture?emoji:lemma); audio-to-picture options all match
  \p{Extended_Pictographic}; picture-to-word options all /^[a-z]+$/; he non-empty Hebrew);
  task2 has exactly 2 texts × exactly 3 questions; every question = 4 distinct Hebrew options
  + correctIndex 0..3; every task2 text passes the band1 vocab constraint (as AMENDED by A1)
  via lib/vocab.js baseForms; task2 texts contain no apostrophes (A1).
- AC3 every audio path referenced by an audio-to-picture item resolves to an existing
  public/<path> file with bytes > 1000.
- AC4 scoring units green: scoreTask1/scoreTask2/bandForScore hit frozen fixtures; clientView
  output contains no "correctIndex" and no "lemma" key (string scan).
- AC5 GET /api/placement returns stripped bank; POST submit scores + persists: after task1
  submit, GET /api/profile shows receptiveVocab "estimated" + correct Task-1 lemmas
  known/placement + placement.task1 set; after both tasks placement.completed === true.
- AC6 one commit per step 3.1–3.5; porcelain clean at gate; docs/item-bank-review.md exists
  with a REQUIRED-BEFORE-CHILD-USE banner.

**DEPENDS ON:** band1.json (2.1); lib/vocab.js (2.2); lib/profile.js mutators (2.3);
lib/store.js; lib/http.js (body THROWS — field guide 8/10); api pattern (2.4); public/api.js +
placement stub + style tokens (1.4); dev-server .mp3 MIME (1.5); OpenAI TTS gpt-4o-mini-tts +
chat gpt-4.1-mini (design §9, re-verified by planner this session).

**SKELETON CHANGES:** (a) placement gets its OWN endpoint api/placement.js (GET stripped bank
+ POST submit) — answer keys stay server-side, api/profile.js untouched. (b) pure scoring in
new lib/placement.js. (c) "pictures" = emoji committed in the bank JSON. (d) audio ONLY on
audio-to-picture items (~6 mp3s) — playing the word on picture-to-word would leak the answer.

**DECISIONS:**
- D1 Fixed sets, no adaptivity: Task 1 = 12 items (6 audio-to-picture + 6 picture-to-word);
  Task 2 = 2 texts × 3 MCQs.
- D2 Pictures = one emoji per item; Task-1 candidates = band1 single===true AND pos matches
  \bn\b; LLM assigns emoji+he and drops words without a clean emoji.
- D3 Distractors drawn from the OTHER selected targets; seeded RNG (mulberry32, seed
  20260724) for reproducible option order.
- D4 Deterministic scoring; score = correct/total; bandForScore: s<0.5→preA1; 0.5≤s<0.8→A1;
  s≥0.8→A2 (heuristic — no per-item difficulty data exists (G1); owner-recalibratable).
- D5 Only correctly answered Task-1 lemmas get markWordKnown(source "placement", he from
  item). Task 2 marks no individual words.
- D6 TTS: gpt-4o-mini-tts, voice "nova", mp3, frozen instructions ("Speak slowly and clearly,
  like a warm, friendly teacher pronouncing one English word for a young learner.").
- D7 data/placement-items.json = FULL bank incl. answer keys (server-only, committed,
  owner-reviewed); client gets clientView() stripped; api/placement.js loads the bank via
  `import bank from '../data/placement-items.json' with {type:'json'}` (verified Node 22.14;
  ensures Vercel bundling).
- D8 (AMENDED by A1) Task-2 vocab constraint: every token's baseForms() must intersect
  allowedTokens = all /[a-z]+/ substrings of every band1 lemma ∪ the frozen FUNCTION_FORMS
  list (see A1 below). Texts contain no contractions (no apostrophes).
- D9 Generator LLM: gpt-4.1-mini, temperature 0, JSON-only; two calls (emoji+he assignment;
  task2 texts+questions given the allowed word list); generator SELF-VALIDATES (schema + D8 +
  Hebrew checks + option distinctness), retries task2 ≤3×, exits non-zero on failure (no
  partial output).

### STEP 3.1 — Item-bank generator + committed bank + lint
- **files (create):** scripts/build-item-bank.js, data/placement-items.json,
  tests/placement-items.test.js
- **commands:** `set -a; . ./.env; set +a; node scripts/build-item-bank.js` (one-time,
  OpenAI + network; output committed like band1.json; tests pass WITHOUT re-running it).
- **validation (frozen):** `npm test`
- **contracts:** FULL item schema: task1 item = {id:"t1-NN", direction:"audio-to-picture"|
  "picture-to-word", lemma:/^[a-z]+$/, he:<Hebrew>, emoji:<pictographic>, options:[4 distinct
  strings], correctIndex:0..3, section:"preBandI"|"bandI", audio:"audio/word-<lemma>.mp3"
  ONLY when direction==="audio-to-picture"}. Invariants: options[correctIndex] ===
  (a2p?emoji:lemma); a2p ⇒ all options pictographic; p2w ⇒ all options /^[a-z]+$/.
  task2 item = {id:"t2-tN", title:<he>, text:<English, no apostrophes>, questions:[{id:
  "t2-tN-qM", prompt:<he>, options:[4 distinct he], correctIndex:0..3} ×3]}. top = {meta:
  {version:1, generatedAt, generator, model:"gpt-4.1-mini", source:"data/band1.json",
  task1Count, task2TextCount:2, task2QuestionCount:6}, task1, task2}.
  Generator algorithm: candidatePool = single && /\bn\b/.test(pos); LLM(emoji+he) → keep
  non-null distinct emoji; select 12 targets (6 preBandI + 6 bandI when available); first 6 →
  audio-to-picture, next 6 → picture-to-word; 3 distractors per item from other targets
  (emoji for a2p, lemma for p2w) via mulberry32(20260724); shuffle options; LLM(task2) with
  allowed word list + theme "everyday life / animals / a vet's clinic, no story spoilers",
  no contractions; SELF-VALIDATE per D8(A1) + Hebrew /[֐-׿]/ + distinctness; retry
  ≤3; exit 1 on failure. JSON indent 2, ensure non-ASCII preserved, trailing newline.
  tests/placement-items.test.js asserts AC2 in full, duplicating the A1 FUNCTION_FORMS list
  verbatim and the no-apostrophe check.
- **non-goals:** no runtime generation; no audio (3.2); no scoring/API (3.3); no UI; don't
  touch lib/, api/, public/.
- **tier:** WORKER (Sonnet). depends on: 2.1, 2.2.

### STEP 3.2 — TTS audio generator + committed mp3s
- **files (create):** scripts/build-tts.js, public/audio/word-*.mp3 (one per a2p lemma),
  tests/placement-audio.test.js
- **commands:** `set -a; . ./.env; set +a; node scripts/build-tts.js` (one-time; commits mp3s)
- **validation (frozen):** `npm test`
- **contracts:** read bank; for each task1 item WITH audio field: POST
  https://api.openai.com/v1/audio/speech {model:"gpt-4o-mini-tts", voice:"nova",
  input:<lemma>, response_format:"mp3", instructions:<D6 frozen string>} → write bytes to
  public/<item.audio>; mkdir -p public/audio; idempotent. tests/placement-audio.test.js:
  every a2p audio file exists with size > 1000 bytes; no audio field on p2w items; PRECACHE
  in sw.js NOT modified (field guide 7).
- **non-goals:** no PRECACHE edit; no scoring/API/UI; don't touch the bank JSON.
- **tier:** WORKER (Sonnet). depends on: 3.1.

### STEP 3.3 — Scoring lib + placement API endpoint
- **files (create):** lib/placement.js, api/placement.js, tests/placement-scoring.test.js,
  tests/api-placement.test.js
- **commands:** none. **validation (frozen):** `npm test`
- **contracts:** lib/placement.js (pure, zero imports): scoreTask1(bank, answers=[{id,choice}])
  → {correct,total,score,knownLemmas:[{lemma,he}]} (match by id; total=matched; score=
  total?correct/total:0); scoreTask2(bank, answers) → {correct,total,score} over flattened
  task2 questions by qid; bandForScore(s) per D4; clientView(bank) → task1 a2p:{id,direction,
  audio,options} / p2w:{id,direction,emoji,options}; task2:{id,title,text,questions:[{id,
  prompt,options}]} — NO lemma/correctIndex/section anywhere, no emoji on a2p, no audio on p2w.
  api/placement.js (GC-4): bank via import-with-type-json. GET → 200 clientView. POST:
  readJsonBody try/catch → 400 "invalid JSON body"; action must be "submit" else 400 "unknown
  action"; require task1 or task2 array else 400 "no answers"; p = loadProfile() ??
  defaultProfile(); task1 present → r=scoreTask1; r.total===0 → 400 "no valid answers";
  skills.receptiveVocab={state:"estimated",score,band}; markWordKnown for each knownLemma
  (source "placement", he); placement.task1={correct,total,score,answeredAt}. task2 analogous
  → readingComprehension + placement.task2. Both present in profile → completed=true +
  completedAt. saveProfile; 200 {ok:true,data:p}. Non-GET/POST → 405.
  tests/placement-scoring.test.js: inline fixture bank; bandForScore at 0,0.4,0.5,0.79,0.8,1
  → preA1,preA1,A1,A1,A2,A2; clientView string scans (no "correctIndex", no "lemma" key; a2p
  has no emoji key; p2w has no audio key). tests/api-placement.test.js: temp DATA_DIR, mock
  res, Readable-of-Buffer req (field guide 10): GET stripped; POST task1 → 200 + estimated +
  known lemma persisted (verify via GET /api/profile) + placement.task1; POST task2 →
  readingComprehension + completed; malformed body 400; bad action 400; PUT 405; final
  validateProfile ok.
- **non-goals:** no UI; no live OpenAI; don't modify api/profile.js, lib/profile.js, data/*,
  public/*.
- **tier:** WORKER (Sonnet). depends on: 3.1, 2.3, 1.2/1.3.

### STEP 3.4 — Placement UI flow
- **files:** public/views/placement.js (rewrite), tests/placement-ui.test.js (create)
- **commands:** none. **validation (frozen):** `npm test`
- **contracts:** render(container) async: getJson("/api/placement") + getJson("/api/profile")
  for resume (task1 done & task2 not → start at task2; both → done screen). State machine
  intro→task1→task1done→task2→done (+error state). Task 1: a2p = play button (`new
  Audio(item.audio)`) + 4-option grid; p2w = large emoji + 4 word options; record choice,
  advance, NO right/wrong feedback. After 12 → postJson("/api/placement", {action:"submit",
  task1:[{id,choice}]}) → task1done. Task 2: text rendered dir="ltr", then 3 questions × 4
  Hebrew options; submit task2 → done. FROZEN Hebrew strings (must appear literally):
  "מתחילים" · "הקשיבי ובחרי את התמונה הנכונה" · "▶ השמעה" · "הביטי בתמונה ובחרי את המילה" ·
  "שאלה {X} מתוך {Y}" · "כל הכבוד! סיימת את המשימה הראשונה." · "אפשר לנוח רגע." ·
  "ממשיכים למשימה 2" · "אמשיך אחר כך" (→ #/home) · "קראי את הטקסט ועני על השאלות" ·
  "סיימת את המבחן!" · "עכשיו הסיפור יתאים בדיוק לך." · "לסיפור" (→ #/reader) ·
  "משהו השתבש, נסי שוב.". Existing style classes only (btn/btn-primary/card); small inline
  styles allowed for grids. tests/placement-ui.test.js: node --check; exports render; contains
  each frozen string; references /api/placement, /api/profile, "submit". (DOM behavior
  verified manually at the phase gate by the orchestrator.)
- **non-goals:** no sw.js/PRECACHE changes, no other views, no new endpoints, no new CSS file.
- **tier:** WORKER (Sonnet). depends on: 3.3, 1.4.

### STEP 3.5 — Owner-review doc
- **files (create):** docs/item-bank-review.md
- **commands:** none. **validation (frozen):** `npm test`
- **contracts:** begins with banner "STATUS: REQUIRED-BEFORE-CHILD-USE"; bilingual ok;
  checklist per Task-1 item (emoji matches word; audio plays + pronounces clearly; distractors
  unambiguous) and per Task-2 text (natural, level-appropriate, no story spoilers; each
  question answerable from the text; marked-correct option right; Hebrew phrasing correct);
  how to edit the bank safely (schema, re-run npm test, re-run build-tts.js only if an a2p
  lemma changed). Human gate, NOT run-blocking.
- **non-goals:** no code changes; don't touch the bank or audio.
- **tier:** WORKER (Sonnet). depends on: 3.1, 3.2.

**RISKS:** R1 task2 vocab constraint unsatisfiable in natural prose → A1 allowlist +
generator retries ≤3 then exits 1 (worker stops, never weakens the constraint). R2 emoji/he
mismatch or ambiguous distractors → owner review (3.5). R3 answer-key leakage → server-side
scoring + clientView strip + AC4/AC5 scans. R4 Vercel bundling of bank JSON → import
attributes (proof at Phase 5 deploy). R5 ≤12 measured known words seeded — by design. R6
emoji rendering varies by device — single Android Chrome target, owner confirms. R7 one-time
OpenAI spend trivial (~6 mp3s + 2 chat calls).

**BLOCKERS:** none. **RECORD GAPS:** none new (G1 reaffirmed: no frequency data; D4
thresholds heuristic and owner-recalibratable).

### AMENDMENT A1 (orchestrator, at plan approval)
allowedTokens for the Task-2 constraint = all /[a-z]+/ substrings of band1 lemmas ∪ frozen
FUNCTION_FORMS list:
["is","are","was","were","am","been","being","has","had","did","done","does","went","gone",
 "said","saw","seen","got","made","came","come","took","taken","ran","ate","gave","given",
 "found","knew","known","put","let","its","an","her","him","his","hers","them","they",
 "their","theirs","us","our","ours","me","my","mine","your","yours"]
The generator self-check AND tests/placement-items.test.js duplicate this list verbatim.
Task-2 texts must contain no contractions — /'/.test(text) === false, asserted in the test
and stated in the generator prompt. Rationale: irregular forms (is/was/went/saw...) are
unreachable via baseForms from band1 base verbs; a frozen allowlist keeps the gate mechanical
without weakening it.

## PHASE 4 — Story engine  (CURRENT — planned by fresh Opus planner, orchestrator-approved 2026-07-24, no changes)

GOAL: core loop live end-to-end locally — onboarding (name heroine + pet), server-side OpenAI
chapter generation constrained to a mechanically-verified ≥95% known-word floor with Hebrew
glossary + 2–3 answerable Hebrew MCQs, reader with tap-to-translate and inline micro-checks,
live word collection. All tests OpenAI-mocked; ONE real generation smoke-tested by the
orchestrator at the gate.

ACCEPTANCE CRITERIA (frozen): AC1 clean install+test exit 0 with 8 new test files, zero
network in tests (transport injection). AC2 story.test.js: buildAllowedSet(post-placement
profile, band1) ≥250 lemmas; verifyChapter accepts frozen in-vocab fixture (ratio ≥0.95,
glossary covers every unknown token, every question.evidence verbatim in text) and rejects
too-hard fixture + bogus-evidence fixture. AC3 generateChapter retry-then-succeed on mocks;
all-fail → {ok:false}; api/chapter.js 502 on that path, 200+persist on success. AC4 profile
POST set-learner + log-check persist; validateProfile green. AC5 (ORCHESTRATOR-EXECUTED live
smoke at gate): real-key POST /api/chapter → 200, stored coverageRatio ≥0.95, glossary covers
unknowns; tap-to-translate + micro-check verified in real browser. AC6 one commit per step
4.1–4.5; porcelain clean; sw.js PRECACHE unchanged.

DECISIONS (approved):
- D1 COLD-START: allowed set = knownLemmaSet(profile) ∪ preBandI lemmas ∪ CORE_FUNCTION_WORDS
  ∪ STORY_LEXICON; coverage via new coverageAgainst(text, allowedSet); gate ratio ≥0.95.
  Empirical: preBandI-only = 0.53 on a real gpt-4.1-mini chapter; + function words = 0.89;
  prompt+retry closes to ≥0.95. Tightens as her bank grows (only knownLemmaSet grows). NOT the
  §1 founding failure: floors = ~190 school-assumed + ~110 function + ~25 premise words, all
  glossed on first appearance.
- D0 Model: gpt-4.1-mini frozen (chapters temp 0.7, translation temp 0).
- D2 Mock seam: lib/openai.js setTransport/resetTransport + generateChapter takes chat param.
- D3 Question gate: deterministic verbatim-anchor — each MCQ carries `evidence` (verbatim
  English substring of the text); gate = text.includes(evidence) && ≥3 word-tokens.
- D4 Glossary gate: every coverageAgainst(...).unknown token must be glossary-covered
  (baseForms match) — every new word translatable offline.
- D5 Tap-to-translate: glossary first; miss → POST /api/translate fallback (gpt-4.1-mini,
  temp 0); save via existing word-tap.
- D6 summarySoFar written by the LLM each generation; api/chapter.js persists it +
  cliffhanger; fed back on next call.
- D7 Micro-check logging: story.checkLog[] via POST /api/profile "log-check" — GC-3
  AMENDMENT A2 (additive: defaultProfile seeds checkLog:[]; validator requires array if
  present).
- D8 Onboarding: POST /api/profile "set-learner" (heroineName/petName, trim, 1–24 chars).
- D9 Chapter: 80–140 English words, 2–3 MCQs, cliffhanger required, no contractions.
- D10 Degrade: maxAttempts=3 with forbidden-token feedback; total failure → 502 envelope,
  NEVER an unverified chapter; reader shows fixed friendly Hebrew retry message.

STEP 4.1 — OpenAI wrapper + coverageAgainst
  files: lib/openai.js (create), lib/vocab.js (modify — additive export coverageAgainst),
    tests/openai.test.js, tests/vocab-coverage-against.test.js. validation: npm test.
  contracts: lib/openai.js — CHAT_MODEL='gpt-4.1-mini'; CHAT_URL=chat/completions; module
    _transport with setTransport/resetTransport; chatJSON({system,user,temperature=0.7}) →
    _transport({model,temperature,response_format:{type:'json_object'},messages:[system?,user]});
    defaultTransport: OPENAI_API_KEY at call time (throw 'OPENAI_API_KEY not set'), POST w/
    Bearer, throw on !ok or missing content, JSON.parse(content). coverageAgainst(text,
    allowedSet) → {total,known,unknown sorted-unique,ratio} via baseForms; existing exports
    UNCHANGED. Tests: transport injection (payload shape), resetTransport, key-missing throw
    (no network); coverageAgainst fixtures.
  non-goals: no story logic/prompts/endpoints. tier WORKER. depends 2.2.

STEP 4.2 — lib/story.js (allowed set + gates + generation loop)
  files: lib/story.js, tests/story.test.js. validation: npm test.
  contracts: exports STORY_MODEL; CORE_FUNCTION_WORDS = Phase-3 A1 FUNCTION_FORMS verbatim ∪
    ["a","the","this","that","these","those","i","you","he","she","it","we","to","of","in",
    "on","at","for","with","from","by","as","and","or","but","not","no","yes","what","who",
    "where","when","why","how","here","there","now","then","so","if","up","down","out","all",
    "one","two","three","very","too","also","because","about","into","over","again","new",
    "some","many","more","most","little","big","good","bad"]; STORY_LEXICON=["vet","magical",
    "magic","animal","creature","clinic","apprentice","dragon","unicorn","fairy","wizard",
    "witch","spell","potion","wing","tail","scale","feather","paw","horn","pet","heal","cure",
    "sick","forest","cave"]; buildAllowedSet(profile,band1); verifyChapter(chapter,allowedSet,
    {minRatio=0.95}) → {ok,ratio,unknown,errors[]} (structural + coverage + glossary-covers-
    unknowns + evidence gates); chapterSchema {n,title,text,cliffhanger,glossary:[{word,he}],
    questions:[{id:`ch${n}-q${m}`,prompt,options[4],correctIndex,evidence}],coverageRatio,
    generatedAt}; buildPrompt(...) (premise: heroine=learner.heroineName apprenticed to a vet
    for magical creatures with pet learner.petName; 80–140 words; cliffhanger; ONLY allowed
    words, inflections ok, no contractions; JSON output incl. summarySoFar);
    generateChapter({profile,band1,chat,now,maxAttempts=3}) loop w/ forbidden-token feedback →
    {ok:true,chapter,summarySoFar} | {ok:false,error,lastErrors}. Tests per AC2/AC3 with fake
    chat; CORE lists duplicated in test for mechanical pin.
  non-goals: no HTTP/store/live calls. tier WORKER. depends 4.1, 2.1.

STEP 4.3 — setLearner/logCheck + GC-3 A2
  files: lib/profile.js (modify additive), tests/profile-learner.test.js,
    tests/profile.test.js (modify — AMENDED during 4.3: ONLY add `checkLog: []` to the
    expected literal in the exact-shape defaultProfile assertion; planner missed that A2
    invalidates that Phase-1 test — field-guide lesson 11 pattern). validation: npm test.
  contracts: defaultProfile story gains checkLog:[]; validator: story.checkLog must be array
    if present; setLearner (trim, ''→throw 'name required', >24→'name too long', set only
    provided); logCheck pushes {chapter,questionId,chosenIndex,correctIndex,correct,at}.
  non-goals: no HTTP; existing mutators untouched. tier WORKER. depends 1.2/2.3.

STEP 4.4 — api/chapter.js + api/translate.js + profile actions
  files: api/chapter.js, api/translate.js, api/profile.js (modify — 2 new actions),
    tests/api-chapter.test.js, tests/api-translate.test.js, tests/api-profile-post.test.js
    (modify — add cases). validation: npm test.
  contracts: chapter: GET→405; POST action 'generate': require placement.completed (400
    'placement required') + heroineName&&petName (400 'learner required'); generateChapter
    with chat=chatJSON; !ok → 502 'chapter generation failed'; ok → push chapter, set
    summarySoFar+cliffhanger, saveProfile, 200 {chapter}; other action 400. translate: POST
    {word} non-blank (400 'word required') → chatJSON translate-one-word system prompt temp 0
    → 200 {word,he}; chat throw → 502 'translation failed'; GET→405. profile POST adds
    'set-learner' (require a name; try/catch → 400 err.message) + 'log-check' (require string
    questionId + numeric indexes else 400 'invalid check'). Tests via setTransport fakes +
    withTempDataDir + Readable-of-Buffer; resetTransport in finally.
  non-goals: no UI; no lib/data/sw changes; key never in public/. tier WORKER. depends 4.2/4.3/2.4.

STEP 4.5 — Reader + Words views
  files: public/views/reader.js (rewrite), public/views/words.js (rewrite),
    tests/reader-ui.test.js, tests/words-ui.test.js. validation: npm test.
  contracts: reader state machine — !placement.completed → prompt card ("קודם נעשה מבחן היכרות
    קטן" → #/placement); no names → onboarding ("איך נקרא לגיבורה שלנו?" · "ואיך נקרא לחיה
    הקסומה הראשונה?" · "יאללה, מתחילים!") → set-learner then generate; no chapters →
    "מתחילים את הסיפור"; else latest chapter: LTR text with every word in tappable
    <span data-word>; tap → popup (glossary first, else /api/translate) + "שמרי למילים שלי"
    (word-tap); inline questions w/ feedback ("כל הכבוד!" / "לא נורא, ננסה שוב") + log-check;
    all answered → "המשך הסיפור" → next chapter; any generate error → "רגע, הקסם מתעכב… ננסה
    שוב עוד רגע." + retry. words view: empty state unchanged; else word list (LTR lemma + he,
    badges "יודעת"/"לומדת", sort lastSeen desc). Static tests: node --check, exports, frozen
    strings, endpoint/action references.
  non-goals: no sw.js/PRECACHE, no other views, no new CSS file, no new endpoints. tier
    WORKER. depends 4.4, 1.4.

RISKS: R1 gate unsatisfiable w/ tiny known set → D1 floors + retries + 502 degrade. R2
evidence gate grounds correct answer, not distractor impossibility — accepted, future 2nd-pass
verifier possible. R3 STORY_LEXICON ~25 unmeasured premise words — bounded, glossed,
owner-reviewable. R4 baseForms over-credit → makes texts easier, safe direction. R5 non-JSON
LLM output → parse throw = failed attempt. R6 translate cost per tap — rare (glossary covers
new words).

BLOCKERS: none. RECORD GAPS: none.

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
