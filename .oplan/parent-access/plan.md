# Plan — run `parent-access`

Base commit: `8644ac1` (tree clean; 172 tests / 0 fail; contrast gate 52 pairs ALL PASS; production
LIVE at `magic-vet-v8`, deployment `dpl_6tEUHF6T7f5pxVFwfgFxepFdtR1V`).

Owner brief, verbatim: *"to allow parent access from installed app and not browser, add password
setting so other wont be able to read it. I dont care if my daughter read, so we can use same
password"*.

## The problem, stated precisely

`#/parent` is reachable **only by typing a URL**. The installed PWA opens fullscreen with no address
bar (`docs/owner-handoff.md` §1), so on the phone where the app actually lives, the owner cannot
reach her own screen at all. The route is also completely ungated: anyone who reaches that URL on an
unlocked phone reads the child's level, scores and word count.

## Owner decisions taken this run (asked and answered before planning)

- **OD-1 — entry point: a HIDDEN GESTURE.** A ~1.5 s long-press on the home screen's app title.
  Chosen over a visible link and over a nav tab. Nothing on her screen changes.
- **OD-2 — the password IS the existing entry code.** No second secret, nothing new to store or
  recover. The owner explicitly accepts that the daughter knows it: *"I dont care if my daughter
  read"*.
- **OD-3 — it asks EVERY time** the parent screen is opened. No session memory.

## How this stands against the frozen record

**It relaxes D2, and that is the owner's call, made explicitly.** `brief.md` D2 froze `#/parent` as
"deliberately absent from the tab bar; reachable by URL". Its stated reason was *"telling an
11-year-old 'you are A1' is meaningless at best and demotivating at worst"* — a reason about not
putting the band in front of the child, NOT about secrecy. OD-1 keeps that reason fully intact (the
gesture is invisible; no tab, no link, no label), and OD-2 knowingly sets the secrecy bar at "not
the child". So D2's intent survives; only its "URL-only" mechanism is superseded. Logged, not buried.

**`docs/visual-design.md` §8 is NOT relaxed. `PRECACHE` stays byte-identical** and
`/views/parent.js` is NOT added to it. Consequence, accepted and surfaced to the owner rather than
fixed by breaking a frozen document: the parent screen still needs a working connection the first
time it is opened after a cache bump, and offline it shows the existing one-line Hebrew message.

---

PHASE 1: the gated parent door
GOAL: the owner can reach `#/parent` from the installed app by long-pressing the home title, and
every route into that view — gesture, typed URL, bookmark, refresh — first demands the entry code,
checked against the code already stored on the device, asked again on every visit. No profile
request is made until the code is right. `npm test` goes 172 → 179, `public/sw.js` ships exactly one
`CACHE` bump (`magic-vet-v8` → `magic-vet-v9`), and the contrast gate still prints `ALL PASS` over
exactly 52 pairs.

ACCEPTANCE CRITERIA: (frozen before execution)
1. `STEP-1.1-OK` … `STEP-1.4-OK` all print, each re-run by the orchestrator.
2. `npm test` prints `# fail 0` and `# pass 179` (172 + 4 + 3 + 0 + 0; see PA-8).
3. `node scripts/check-contrast.mjs` exits 0, last line `ALL PASS`, `grep -c '^PASS'` is **52**.
   `public/styles.css` is byte-unchanged: `git diff --name-only 8644ac1..HEAD -- public/styles.css`
   is EMPTY (PA-5).
4. `grep -qF -- 'const CACHE = "magic-vet-v9";' public/sw.js`; `grep -rq 'magic-vet-v8' public/ tests/`
   finds nothing; `git diff 8644ac1..HEAD -- public/sw.js | grep -c '^[+-][^+-]'` is exactly `2`
   (PRECACHE untouched — `docs/visual-design.md` §8).
5. `git diff --name-only 8644ac1..HEAD -- . ':!.oplan'` lists exactly these 7 paths:
   `docs/owner-handoff.md`, `public/sw.js`, `public/views/home.js`, `public/views/parent.js`,
   `tests/parent-access.test.js`, `tests/parent-ui.test.js`, `tests/shell.test.js`.
6. Nothing under `api/`, `lib/`, `data/`, `assets/`, `scripts/` changed, and `public/index.html`,
   `public/app.js`, `public/api.js` and `public/styles.css` are byte-unchanged.
7. **The door is invisible:** `grep -rq '#/parent' public/index.html` finds nothing, and no `href`,
   `<a>`, nav tab or visible Hebrew label pointing at the parent view exists anywhere in `public/`.
8. **The lock cannot be skipped:** in `public/views/parent.js` the index of `await unlock(container)`
   is LESS than the index of `getJson("/api/profile")` — proven by a test, not by eye.
9. The learner's profile was never contacted locally: `.data/profile.json` does not exist and no step
   runs a server.

SKELETON FOR LATER PHASES:

**Phase 2 — deploy.** Same recipe as the previous run's Phase 2, which is written down in
`.oplan/poc-basics/plan.md` and `journal.md`: record the outgoing deployment id + url + what it
serves via `vercel inspect` on the canonical URL **before** the deploy call; deploy with
`"$(npm prefix -g)/vercel" deploy --prod --yes`; verify live by md5 against the **worktree** for
`sw.js`, `app.js`, `api.js`, `views/home.js`, `views/parent.js`, `styles.css` and
`manifest.webmanifest`; assert live `/sw.js` contains `magic-vet-v9`; `/` 200 and `/index.html` 308;
`GET /api/health` exact payload; `POST /api/chapter {"action":"ping"}` → **401**. Never request
`/api/profile`, never open a browser on production, never spend OpenAI credit, never run
`vercel env`. **The D4 404 probe must follow redirects to the terminus and use a known-absent
control** — a bare `.html` 404 probe proves nothing under `cleanUrls` (field-guide lesson 10).

FROZEN CONTRACTS FOR THIS PHASE:

**PA-1 — the lock gates the VIEW, not the door.** The code prompt lives in `public/views/parent.js`
and runs at the very top of `render()`, before any network call. Every way into the view hits it.
Putting the check on the gesture instead would leave the typed URL wide open, which is the hole this
run exists to close.

**PA-2 — what it checks.** `const CODE_KEY = "appCode";` at module scope in `parent.js` — the same
key `public/api.js` already writes. The trimmed input is compared with `===` to the stored value.
**Fail closed:** if `localStorage` throws, or the stored value is missing or empty, EVERY attempt
shows the error. Empty/whitespace input does nothing. Retries are unlimited; each needs a human tap,
so it cannot become a hot loop. This is a client-side check by design — the threat is a person
holding an already-unlocked phone, not an attacker with developer tools, and OD-2 sets the bar at
"not the child" anyway.

**PA-3 — asked every time.** The lock runs on every `render()` call. No `sessionStorage` flag, no
module-level "unlocked" boolean that survives navigation. (`parent.js` already uses
`sessionStorage` for the re-take flag — that is PB-3 and is untouched.)

**PA-4 — the gesture.** In `public/views/home.js`: `const LONG_PRESS_MS = 1500;` and
`const MOVE_TOLERANCE = 10;`. A `pointerdown` on `.app-title` starts the timer; `pointerup`,
`pointercancel`, `pointerleave`, or a `pointermove` further than `MOVE_TOLERANCE` px cancels it. On
fire: `location.hash = "#/parent";`. `contextmenu` is `preventDefault()`-ed on that element (Android
Chrome raises a context menu on long-press) and text selection is disabled by setting
`style.userSelect` / `style.webkitUserSelect` in JS. **No `<a>`, no label, no tab, no title
attribute, no cursor change** — nothing that reveals the door exists.

**PA-5 — ZERO new CSS.** `public/styles.css` is NOT touched. The lock reuses existing classes only:
`entry-gate-card`, `entry-gate-title`, `entry-gate-text`, `entry-gate-input`, `entry-gate-error`,
`btn btn-primary`. No new `:root` token, no raw hex, no `color-mix()`. The contrast gate stays at
exactly 52 pairs and is not edited. The only inline styling anywhere is the two `userSelect`
assignments of PA-4, which set no colour.

**PA-6 — frozen Hebrew for the lock** (feminine, matching the app's voice):
- reuses the existing header: greeting `תצוגת הורים`, title `מה האפליקציה יודעת עליה`
- card title `אזור הורים`
- card text `הקלידי את קוד הכניסה כדי לראות את המסך הזה.`
- input placeholder `קוד כניסה` · submit button `כניסה` · error `הקוד לא נכון. נסי שוב.`
  (the last three are byte-identical to the strings `public/api.js` already ships, deliberately —
  the same prompt should look the same in both places)

**PA-7 — one cache bump.** `public/sw.js` line 1 becomes `const CACHE = "magic-vet-v9";` and
`tests/shell.test.js` line 58 becomes `assert.ok(sw.includes('magic-vet-v9'));`. Exactly two changed
lines in each file. `PRECACHE` and its `deepStrictEqual` assertion stay byte-identical, and
`/views/parent.js` is NOT added to it.

**PA-8 — the test ledger.** 172 today. Step 1.1 +4 → 176. Step 1.2 +3 → 179. Step 1.3 +0 → 179.
Step 1.4 +0 → 179. Every step's validation asserts its own running total.

---

STEP 1.1: lock the parent view behind the entry code
  goal: `public/views/parent.js` demands the entry code before it renders anything or calls any API,
    on every `render()`, failing closed when no code is stored.
  files: `public/views/parent.js`, `tests/parent-ui.test.js` — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const CODE_KEY = "appCode";' public/views/parent.js \
  && grep -qF -- 'function storedCode()' public/views/parent.js \
  && grep -qF -- 'function unlock(container)' public/views/parent.js \
  && grep -qF -- 'await unlock(container);' public/views/parent.js \
  && grep -qF -- 'אזור הורים' public/views/parent.js \
  && grep -qF -- 'class="entry-gate-card"' public/views/parent.js \
  && grep -qF -- 'class="entry-gate-input"' public/views/parent.js \
  && grep -qF -- 'class="entry-gate-error"' public/views/parent.js \
  && ! grep -q '#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]' public/views/parent.js \
  && ! grep -qF -- 'color-mix' public/views/parent.js \
  && node --check public/views/parent.js \
  && node -e 'const s=require("fs").readFileSync("public/views/parent.js","utf8");const a=s.indexOf("await unlock(container);");const b=s.indexOf("getJson(\"/api/profile\")");if(a<0||b<0||a>b)throw new Error("lock does not precede the profile fetch");' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "2" ] \
  && [ "$(git status --porcelain -- public/styles.css | grep -c '')" = "0" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 176' \
  && C="$(node scripts/check-contrast.mjs)" \
  && printf '%s\n' "$C" | tail -1 | grep -qx 'ALL PASS' \
  && [ "$(printf '%s\n' "$C" | grep -c '^PASS')" = "52" ] \
  && echo STEP-1.1-OK
```
  contracts:
    - PA-1, PA-2, PA-3, PA-5, PA-6.
    - **Edit 1** — immediately after the existing `const RETAKE_KEY = "retakePlacement";` line, add:
```js
const CODE_KEY = "appCode";
```
    - **Edit 2** — immediately BEFORE `export async function render(`, add exactly:
```js
function storedCode() {
  try {
    return localStorage.getItem(CODE_KEY) || "";
  } catch {
    return "";
  }
}

function lockMarkup(showError) {
  return `
    ${styleTag()}
    ${header("תצוגת הורים", "מה האפליקציה יודעת עליה")}
    <form class="entry-gate-card" data-action="unlock">
      <h2 class="entry-gate-title">אזור הורים</h2>
      <p class="entry-gate-text">הקלידי את קוד הכניסה כדי לראות את המסך הזה.</p>
      <input
        class="entry-gate-input"
        type="text"
        dir="ltr"
        placeholder="קוד כניסה"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
      />
      <p class="entry-gate-error" role="alert">${showError ? "הקוד לא נכון. נסי שוב." : ""}</p>
      <button class="btn btn-primary" type="submit">כניסה</button>
    </form>
  `;
}

function unlock(container) {
  return new Promise((resolve) => {
    const paint = (showError) => {
      container.innerHTML = lockMarkup(showError);
      const form = container.querySelector('[data-action="unlock"]');
      const input = container.querySelector(".entry-gate-input");
      input.focus();
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        const expected = storedCode();
        if (expected && value === expected) {
          resolve();
          return;
        }
        paint(true);
      });
    };
    paint(false);
  });
}

```
      Note the template literal inside `lockMarkup` interpolates `styleTag()` and `header(...)`,
      which already exist in this file — do not redefine them.
    - **Edit 3** — the FIRST statement inside `export async function render(container, ctx)` becomes:
```js
  await unlock(container);
```
      placed immediately before the existing `container.innerHTML = ...טוען...` line. Everything
      after it is unchanged.
    - **Edit 4** — append exactly **four** tests to the END of `tests/parent-ui.test.js`, in the
      file's existing style (`src` = the read source of `public/views/parent.js`):
      1. `'parent.js locks the view behind the entry code'` — asserts the source contains
         `const CODE_KEY = "appCode";`, `function storedCode()`, `function unlock(container)`,
         `await unlock(container);` and `אזור הורים`.
      2. `'parent.js does not fetch the profile before unlocking'` — computes
         `src.indexOf('await unlock(container);')` and `src.indexOf('getJson("/api/profile")')`,
         asserts both are `!== -1` and that the first is **less than** the second.
      3. `'the parent lock fails closed when no code is stored'` — asserts the source contains
         `if (expected && value === expected)` and `return localStorage.getItem(CODE_KEY) || "";`.
      4. `'the parent lock adds no styling of its own'` — asserts the source contains
         `class="entry-gate-card"`, `class="entry-gate-input"` and `class="entry-gate-error"`, and
         asserts it does NOT contain `color-mix`, and does not match `/#[0-9a-fA-F]{3}/`.
  non-goals: do not touch `public/styles.css` (PA-5 — the lock reuses existing classes and this
    phase adds no CSS at all); do not touch `public/api.js`, `public/app.js`, `public/index.html`,
    `public/views/home.js` (step 1.2 owns it) or `public/sw.js` (step 1.3 owns the only bump); do
    not change ANY of the frozen PB-2 Hebrew strings or the four cards already in this view; do not
    change the re-take button or its `sessionStorage` flag (PB-3); do not add a "remember me",
    a session flag, a logout control, or a way to skip the lock; do not add a cancel/back button
    (the bottom nav stays reachable — the lock is rendered inside `#app`, not as a fixed overlay);
    do not call any API before the lock resolves; do not touch `api/placement.js` or any test other
    than `tests/parent-ui.test.js`.
  tier: WORKER
  depends on: nothing (baseline `8644ac1`, clean tree).

STEP 1.2: the hidden long-press door on the home screen
  goal: a ~1.5 s press on the home screen's app title navigates to `#/parent`, and nothing about the
    home screen looks any different.
  files: `public/views/home.js`, `tests/parent-access.test.js` (NEW) — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const LONG_PRESS_MS = 1500;' public/views/home.js \
  && grep -qF -- 'const MOVE_TOLERANCE = 10;' public/views/home.js \
  && grep -qF -- 'function bindOwnerGesture(container)' public/views/home.js \
  && grep -qF -- 'bindOwnerGesture(container);' public/views/home.js \
  && grep -qF -- 'location.hash = "#/parent";' public/views/home.js \
  && grep -qF -- 'pointerdown' public/views/home.js \
  && grep -qF -- 'pointercancel' public/views/home.js \
  && grep -qF -- 'contextmenu' public/views/home.js \
  && ! grep -qF -- 'href="#/parent"' public/views/home.js \
  && ! grep -qF -- 'הורים' public/views/home.js \
  && ! grep -qF -- '#/parent' public/index.html \
  && node --check public/views/home.js \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "2" ] \
  && [ "$(git status --porcelain -- public/styles.css public/index.html | grep -c '')" = "0" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 179' \
  && echo STEP-1.2-OK
```
  contracts:
    - PA-4.
    - **Edit 1** — at the TOP of `public/views/home.js`, before `export function render`, add:
```js
const LONG_PRESS_MS = 1500;
const MOVE_TOLERANCE = 10;

function bindOwnerGesture(container) {
  const title = container.querySelector(".app-title");
  if (!title) return;
  title.style.userSelect = "none";
  title.style.webkitUserSelect = "none";

  let timer = null;
  let pressing = false;
  let startX = 0;
  let startY = 0;

  const cancel = () => {
    pressing = false;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  title.addEventListener("pointerdown", (event) => {
    pressing = true;
    startX = event.clientX;
    startY = event.clientY;
    timer = setTimeout(() => {
      timer = null;
      pressing = false;
      location.hash = "#/parent";
    }, LONG_PRESS_MS);
  });

  title.addEventListener("pointermove", (event) => {
    if (!pressing) return;
    if (
      Math.abs(event.clientX - startX) > MOVE_TOLERANCE ||
      Math.abs(event.clientY - startY) > MOVE_TOLERANCE
    ) {
      cancel();
    }
  });

  title.addEventListener("pointerup", cancel);
  title.addEventListener("pointercancel", cancel);
  title.addEventListener("pointerleave", cancel);
  title.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}
```
    - **Edit 2** — the existing `render(container)` keeps its markup **byte-identical** and gains
      exactly one new final statement, after the closing backtick+semicolon of the `innerHTML`
      assignment:
```js
  bindOwnerGesture(container);
```
    - **`tests/parent-access.test.js` (NEW)** — `node:test` + `node:assert`, header block copied
      from `tests/parent-ui.test.js` (`__dirname`, `root`), exactly **three** tests:
      1. `'home.js passes node --check'` — `spawnSync(process.execPath, ['--check', homePath])`,
         `status === 0`.
      2. `'a long press on the home title opens the parent view'` — reads `public/views/home.js`,
         asserts it contains `const LONG_PRESS_MS = 1500;`, `function bindOwnerGesture(container)`,
         `bindOwnerGesture(container);`, `"pointerdown"`, `"pointercancel"`, `"contextmenu"` and
         `location.hash = "#/parent";`.
      3. `'the parent door is invisible in the shipped UI'` — reads `public/index.html` and
         `public/views/home.js`; asserts `index.html` does NOT contain `#/parent`; asserts
         `home.js` does NOT contain `href="#/parent"`; asserts `home.js` does NOT contain the
         Hebrew word `הורים`; and asserts `index.html` does not contain `data-route="/parent"`.
  non-goals: do not add a visible link, label, button, tab, `title` attribute, `aria-label`,
    tooltip or cursor change that reveals the gesture; do not change ONE character of the existing
    `render()` markup — the home screen must look pixel-identical; do not touch
    `public/index.html`, `public/styles.css`, `public/app.js` or `public/views/parent.js` (step 1.1
    owns it); do not add the gesture to any other view; do not use `click`, `dblclick` or
    `touchstart` (pointer events only); do not add a haptic/vibration cue; do not touch
    `public/sw.js` (step 1.3).
  tier: WORKER
  depends on: step 1.1 COMMITTED (the `# pass 179` total assumes 1.1's four tests are in the tree).

STEP 1.3: the service-worker cache bump (the one and only bump this phase)
  goal: returning devices — including the installed PWA on her phone — fetch the new shell.
  files: `public/sw.js`, `tests/shell.test.js` — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- 'const CACHE = "magic-vet-v9";' public/sw.js \
  && grep -qF -- "assert.ok(sw.includes('magic-vet-v9'));" tests/shell.test.js \
  && ! grep -rq 'magic-vet-v8' public/ tests/ \
  && [ "$(git diff 8644ac1 -- public/sw.js | grep -c '^[+-][^+-]')" = "2" ] \
  && [ "$(git diff 8644ac1 -- tests/shell.test.js | grep -c '^[+-][^+-]')" = "2" ] \
  && ! grep -qF -- 'views/parent.js' public/sw.js \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 179' \
  && [ "$(git status --porcelain -- public scripts tests docs lib api data | grep -c '')" = "2" ] \
  && echo STEP-1.3-OK
```
  contracts: PA-7. `public/sw.js` line 1 becomes `const CACHE = "magic-vet-v9";`.
    `tests/shell.test.js` line 58 becomes `assert.ok(sw.includes('magic-vet-v9'));`. The `PRECACHE`
    array and its `deepStrictEqual` assertion are byte-identical afterwards — which the two
    "exactly 2 changed lines" assertions prove.
  non-goals: do not add `/views/parent.js` — or anything else — to `PRECACHE`
    (`docs/visual-design.md` §8 is FROZEN and this run does not re-open it); do not change the
    install/activate/fetch handlers; do not add any other assertion to `tests/shell.test.js`; do not
    bump to `v10` later in this phase; do not touch `public/manifest.webmanifest` or
    `public/index.html`.
  tier: WORKER
  depends on: steps 1.1 and 1.2 COMMITTED — every `public/` change must be in the tree before the
    single bump lands. No later step may touch `public/`.

STEP 1.4: tell the owner how to open her own screen
  goal: `docs/owner-handoff.md` §2א stops describing a URL she cannot type on her phone and
    describes the gesture and the code instead.
  files: `docs/owner-handoff.md` — and nothing else.
  commands: none — direct file edits.
  validation:
```
cd C:/Users/dkreinov/claude/english-app && set -o pipefail \
  && grep -qF -- '## 2א. תצוגת הורים / Parent view' docs/owner-handoff.md \
  && grep -qF -- 'לחיצה ארוכה' docs/owner-handoff.md \
  && grep -qF -- 'קוד הכניסה' docs/owner-handoff.md \
  && grep -qF -- 'https://english-app-three-tan.vercel.app/#/parent' docs/owner-handoff.md \
  && [ "$(wc -l < docs/owner-handoff.md)" = "135" ] \
  && [ "$(sed -n '51,65p' docs/owner-handoff.md | md5sum | cut -d' ' -f1)" = "144403b47eb5f2ad2b2936048154a94a" ] \
  && [ "$(git status --porcelain -- . ':!.oplan' | grep -c '')" = "1" ] \
  && [ "$(git status --porcelain -- public scripts tests lib api data assets | grep -c '')" = "0" ] \
  && T="$(npm test 2>&1)" \
  && printf '%s\n' "$T" | grep -qx '# fail 0' \
  && printf '%s\n' "$T" | grep -qx '# pass 179' \
  && echo STEP-1.4-OK
```
  contracts:
    - **Lines 51-60 inclusive (10 lines) are replaced, in full, by exactly these FIFTEEN lines,
      byte-for-byte.** MEASURED, not counted by eye: 130 - 10 + 15 = **135**, and the resulting
      region `sed -n '51,65p'` must md5 to `144403b47eb5f2ad2b2936048154a94a`.
```
יש מסך שמיועד לך בלבד, ואינו מופיע בתפריט של האפליקציה. באפליקציה המותקנת
בטלפון: **לחיצה ארוכה** (כשנייה וחצי) על הכותרת `מרפאת הקסמים` במסך הבית
פותחת אותו. בדפדפן אפשר גם להוסיף `#/parent` לכתובת:

`https://english-app-three-tan.vercel.app/#/parent`

המסך מבקש את **קוד הכניסה** בכל פעם מחדש — אותו קוד שהילדה מקלידה כדי להיכנס
לאפליקציה — כדי שמי שמחזיק את הטלפון לא יוכל פשוט לקרוא אותו. אם אין חיבור
לאינטרנט, המסך לא ייטען ותופיע הודעה על כך.

המסך מציג את רמת אוצר המילים שנקבעה לה, את התוצאות של שתי משימות המיון, מתי
המבחן נעשה, וכמה מילים יש באוסף שלה. הרמה נקבעת לפי 12 שאלות בלבד — שש מהן
שאלות שמיעה — ולכן שתי טעויות יכולות להוריד אותה רמה שלמה. אם התוצאה נראית לך
שגויה, יש במסך כפתור **מבחן מיון מחדש** שמתחיל את המבחן מההתחלה, והתוצאה
החדשה מחליפה את הקודמת.
```
      The last five lines are the EXISTING paragraph, carried through unchanged — it is included in
      the replacement only so the worker performs ONE contiguous splice rather than two edits with a
      gap between them. The `wc -l` + region-md5 pair is the guard against a silent re-wrap that
      would satisfy every content grep (field-guide lesson 6).
    - Copy the Hebrew block **byte-for-byte** from this plan file. Do not retype, reflow or "fix"
      it (field-guide lesson 11 — Hebrew is bidi; anchoring on retyped text is how byte order goes
      wrong invisibly).
  non-goals: do not touch `design.md` or `docs/visual-design.md` (FROZEN); do not touch `README.md`
    or `docs/item-bank-review.md` (the item-bank gate is SIGNED — leave it alone); do not renumber
    any section; do not change the production URL, the costs section or the privacy section; do not
    touch anything under `public/`, `tests/` or `.oplan/`.
  tier: WORKER
  depends on: steps 1.1-1.3 COMMITTED.

RISKS:
- **The gesture is undiscoverable by design, including by the owner.** If she forgets it, the URL
  still works in a browser. Both are documented in step 1.4 for exactly this reason.
- **A long-press on Android raises the context menu or selects text.** Both are suppressed
  (`contextmenu` preventDefault + `userSelect: none`). If either leaks through, the symptom is
  cosmetic and immediately visible on her phone, not silent.
- **`pointerleave` may fire on a small finger movement** and cancel the press, making the gesture
  feel unreliable. `MOVE_TOLERANCE` exists for the common case; if it proves fussy in real use the
  fix is a bigger tolerance, and it is one constant in one file.
- **The lock is client-side and trivially bypassable with developer tools.** Stated, not hidden.
  OD-2 sets the bar at "a person holding an unlocked phone", and the app's real secret — the API —
  is still gated server-side by `APP_CODE` on every `/api/*` call.
- **The parent view still needs a connection.** `PRECACHE` is frozen, so the dynamic import of
  `views/parent.js` fails offline and the existing Hebrew message appears. Surfaced to the owner in
  step 1.4 rather than fixed by breaking a frozen document.
- **A cache bump means the PWA serves the old shell until the service worker updates.** Same as
  every previous deploy; the bump is what forces it.