# Design proposal — a SECOND PROFILE for parent testing on the LIVE app

Status: **PROPOSAL, not frozen.** Nothing here is decided. It exists so the owner can decide once,
with the trade-offs visible, instead of deciding in the middle of a run.

Written 2026-07-27 against the tree at `HEAD` (`5db1d10`). No code was written for it and no file
outside this one was touched.

---

## 1. The need, plainly

The parent wants to click around the app **as it actually runs in production** — the deployed build,
on a phone, installed as a PWA, talking to the real serverless functions and the real Blob
storage — and do things a tester does: take the placement test, generate chapters, tap words, claim
words, fail quiz items on purpose, watch a word demote after three strikes.

Every one of those actions is a **write to her profile**. Today there is exactly one profile in the
world: `profile/profile.json` in Vercel Blob, reached by `lib/store.js`, written by three handlers
(`api/profile.js`, `api/chapter.js`, `api/placement.js`). It holds her band, her placement result,
her whole word bank with statuses, strikes and quiz counters. `design.md` is explicit that this file
is the thing the project protects: phase 1 of `word-quiz` was forbidden to touch it, D25 records that
there is **no undo** and bought a timestamped backup instead of a test. There is no version history,
no second copy, no restore path beyond a manual capture someone remembered to take.

So today the parent has two choices, and both are bad:

- Test on the live app and pollute her data (a fake placement retake rewrites her band; a deliberate
  wrong answer puts a real strike on a real word).
- Test on the local sandbox — dev server, `DATA_DIR` pointed somewhere disposable, file backend
  instead of Blob — which is safe but is **not the thing that ships**. It does not exercise the Blob
  backend, the serverless runtime, the service worker, the installed-PWA shell, or the phone.

The ask is a way to have the second column of that table without the first.

---

## 2. What the code actually looks like today

Stated because every option below is a mutation of exactly these facts.

- `lib/store.js` has two module constants, `PROFILE_FILENAME` and `BLOB_PATHNAME`, and two exported
  functions, `loadProfile()` and `saveProfile(profile)` — **both take no argument identifying whose
  profile it is.** The backend is chosen by whether `BLOB_READ_WRITE_TOKEN` is set; the local path
  comes from `DATA_DIR` (default `.data`).
- Three API handlers call those two functions, six call sites in total.
- `lib/auth.js` compares the `x-app-code` request header against the single `APP_CODE` env var and
  returns a boolean. **When `APP_CODE` is unset the gate is open** — deliberate, so local dev and the
  test suite work unconfigured, and so a missing production variable degrades to "unprotected"
  rather than "she is locked out of her own app".
- `public/api.js` reads the code from `localStorage` under **one key, `appCode`**, attaches it to
  every request, and only shows the entry overlay when the server answers 401.
- `public/app.js` routes on the hash. `#/parent` is a hidden route; `public/views/parent.js` gates it
  with `codeAccepted(typed, stored)`, which compares against the **locally stored** code — a
  client-side lock, and it returns `true` when nothing is stored.
- `public/sw.js` passes `/api/` straight through to the network and caches everything else by origin.

Two consequences worth holding onto:

1. There is no request-scoped notion of "which profile" anywhere in the system. Any option that
   introduces one has to thread it from the handler into the store, through six call sites.
2. `localStorage` holds exactly one code, per origin. Two codes on the same origin cannot coexist —
   the second one typed silently replaces the first.

---

## 3. Options

Effort is coding effort for a competent worker plus review, not wall-clock.

### (a) Second access code selects a second storage path

**Mechanism.** Add a second env var (say `APP_CODE_TEST`). `lib/auth.js` stops returning a boolean
and starts returning *which* identity matched — child or test — or nothing. That identity is passed
explicitly into `loadProfile()`/`saveProfile()`, which map it to `profile/profile.json` or
`profile/test.json` (and, locally, to `profile.json` or `test.json` under `DATA_DIR`).

**Code surface.** `lib/auth.js` (`isAuthorized` changes shape, so every caller changes),
`lib/store.js` (both exports gain a parameter; `BLOB_PATHNAME` becomes a lookup), `api/profile.js`,
`api/chapter.js`, `api/placement.js` (six call sites), plus tests. `public/` is untouched — the
client already sends whatever code is stored, and does not need to know there is a second one.

**Risk to her data.** Real but bounded, and it is the *shape* of the risk that matters: after this
change, the same running process, holding the same Blob write token, can address **both** files. The
only thing keeping her file safe is a correct branch — an `if` that must be right on every one of six
call sites, forever, including in code nobody has written yet. That is "unlikely", not "impossible".
Two specific failure modes deserve naming:

- **The fail-open default.** With `APP_CODE` unset the gate is open and no identity matched. Which
  file does that request get? If the answer is "hers", then a misconfigured production deployment
  writes her file from unauthenticated requests. If the answer is "the test file", her app silently
  starts up empty. Neither is obviously right; it must be decided, not discovered.
- **The single `localStorage` key.** If the parent ever types the test code into a browser that also
  runs her app — her phone, or a shared laptop — the stored `appCode` is overwritten and *every*
  subsequent request from that browser goes to the test store. No 401 is raised, because the test
  code is valid, so nothing prompts anyone to fix it. Her stored data is not damaged, but the app in
  her hand shows an empty profile and her taps land in the test file until someone notices. This is
  the most likely real-world failure of this option and it is a UX failure, not a corruption.

**Effort.** M. Maybe 150 lines of change and a dozen tests, most of the work in getting the
defaults and the tests honest rather than in the plumbing.

**UX.** The parent opens the same URL in a different browser (or a private window), types the test
code once, and is in a fresh app. The child sees nothing new. That is genuinely good.

### (b) A `?profile=test` / `#test` route with its own storage key

**Mechanism.** The client reads a URL parameter or hash flag, remembers it, and sends it alongside
the code (header or query) on every request; the server maps it to a storage path.

**Code surface.** `public/api.js` (attach the flag to every request), `public/app.js` (read and
persist it), `lib/store.js`, all three handlers, tests. Larger than (a) and it lands in the
**client**, which is the part of the system the child is holding.

**Risk to her data.** Worse than (a) on every axis. The selector is now something the *browser*
asserts, so it is decoupled from authentication: whatever validation exists, the effective rule is
"whoever knows the flag picks the store". `#/parent` is the local precedent — a URL-only secret that
turned out to be reachable enough to need a lock (`parent-access`, OD-1). A URL is one autocomplete
entry, one shared link, one back-button away. The test profile also lives on **the same origin**, so
it shares the service-worker cache and `localStorage` with her app; a stale flag that survives a
reload is a plausible bug, not a contrived one. And the "no flag" default is necessarily "her
profile", which is the fail-open direction.

**Effort.** M, and more test surface than (a) because the client is involved.

**UX.** Slightly nicer for the parent (one URL, no second code to remember) — which is precisely why
it is more dangerous. The thing that makes it convenient is the thing that makes it reachable.

### (c) Status quo: local sandbox only, made one command

**Mechanism.** No product change. A single npm script that starts the dev server with a disposable
`DATA_DIR` and with `BLOB_READ_WRITE_TOKEN` explicitly cleared, so the file backend is forced and the
Blob path is unreachable by construction. Optionally a second script that seeds that directory from a
redacted snapshot, and a line in `docs/owner-handoff.md`.

**Code surface.** `package.json`, one small script under `scripts/`, one doc. Nothing in `api/`,
`lib/` or `public/`.

**Risk to her data.** Zero, and zero in the strong sense: the process never holds the Blob token, so
it cannot name her file. Nothing about production changes, so nothing about production can regress.

**Effort.** S. An hour, most of it on the Windows/Git Bash env handling and the doc.

**UX.** The parent tests on a laptop, at `localhost`, against the file backend. What it does not
give them is the thing they actually asked for: the deployed build, the Blob backend, the phone, the
installed PWA, the service worker. If the bug they are chasing lives in any of those, this option
cannot see it. Worth keeping regardless as the everyday path — it is faster and freer than anything
that touches the network — but on its own it does not answer the request.

### (d) Full multi-profile with a chooser screen

**Mechanism.** Profiles become first-class: an id, a list, a chooser at boot, storage keyed by id,
the parent view scoped to a selected profile.

**Code surface.** Everything — storage, auth, all three handlers, boot, routing, at least one new
view, the service worker's cache story, and every existing test that assumes one profile.

**Risk to her data.** The largest of any option, from breadth alone: a migration on the one file
that has no backup, plus a new screen **on her device** whose whole job is to let the person holding
the phone switch which profile is being written.

**Effort.** L.

**UX.** A chooser the child sees, in an app whose founding design says *"An app for one child …
no accounts, no multi-user, no productization"* (`design.md` §1).

**This is overkill, and I will say so plainly.** It builds a product feature to solve an operations
problem. The need is "the parent wants a scratch environment", not "the app has users". Recommending
it would mean adding the one screen we would then have to hide from her, and paying L effort for a
worse safety position than (c) or (e). It should be declined unless a second real learner appears —
at which point it is the right design and this document is void.

### (e) A separate deployment with its own storage credential — ADDED, not in the brief

Added because the four listed options all share one property that is worth breaking: in (a), (b) and
(d) the process serving the parent's test traffic **holds the token that can write her file**. Safety
then rests on a branch being correct. There is an option where it does not.

**Mechanism.** A second Vercel project, built from the same repo and ideally the same commit, with
its own environment: its own `BLOB_READ_WRITE_TOKEN` pointing at a **second Blob store**, its own
`APP_CODE`, the same `OPENAI_API_KEY`. The parent opens a different URL and types a different code.
No application code changes at all — `lib/store.js` writes `profile/profile.json` in *that project's
store*, which is a different file in a different place.

**Code surface.** None. Configuration only: one Vercel project, one Blob store, three env vars, and
a line in `docs/owner-handoff.md`. Optionally one read-only snapshot script (see below).

**Risk to her data.** This is the option where touching her data is **structurally impossible rather
than merely unlikely**. A Vercel Blob read/write token is issued per store and identifies the store
it belongs to; a process holding only the test store's token cannot name, read or write a blob in
hers, no matter what path string the code computes. A path-derivation bug in the test deployment
produces a wrong file *in the test store*. There is no branch to get wrong, because there is no
branch. Separate origin also means separate `localStorage` and separate service-worker cache, which
kills option (a)'s most likely failure outright: typing the test code in the test app cannot
overwrite the code her app uses.

Two honest caveats:

- **A second project, not a preview environment.** Vercel preview deployments inherit project
  environment variables unless every variable is overridden per environment. One forgotten override
  and the preview holds the production token — which is exactly the class of mistake this option
  exists to eliminate. A separate project has nothing to inherit.
- **It is the same build, not the same instance.** Anything that only reproduces on the production
  deployment — a wrong env var *there*, a stale build *there* — will not reproduce here. This option
  tests the code as deployed, not the deployment. That is a real limit and it should be stated to
  the owner rather than glossed.

**Effort.** S in code (zero), M in operations: the second project, the second store, the env vars,
the deploy check, the doc. Recurring cost is a few Blob writes and whatever OpenAI spend the parent's
test chapters incur on the shared key.

**UX.** Best of the lot for the parent: a real URL, installable as its own PWA on the same phone
without colliding with hers, a fresh profile every time the store is cleared. For the child:
literally nothing changes — not one byte of the app she runs.

**Optional companion: a one-way snapshot.** If the parent needs to test against data shaped like
hers (200 claimed words, real strike history), a small script run from the laptop can read her
profile with the production token and write it into the test store with the test token. Two
credentials, one direction, read-only on her side. That gives realistic test data without ever
opening a write path to her file. It is a separate decision from the deployment and can wait.

### Comparison

| | mechanism | her data can be written by the test path? | effort | what she sees |
|---|---|---|---|---|
| (a) second code → second path | server branch on identity | yes — prevented by a correct `if` | M | nothing (unless the code gets crossed on her device) |
| (b) URL flag → second key | client-asserted selector | yes — prevented by a weaker `if` | M | nothing, but the door is on her origin |
| (c) local sandbox only | no production change | no — token absent | S | nothing |
| (d) multi-profile + chooser | first-class profiles | yes — plus a chooser on her phone | L | a chooser |
| (e) separate deployment + store | separate credential | **no — token cannot name her store** | S code / M ops | nothing |

---

## 4. The hard questions the owner must answer

These are the questions I would refuse to start building without. Several have no obviously right
answer; they need a decision, not an analysis.

**On what is actually being tested**

1. What exactly must the test environment exercise — the deployed *build*, the deployed *instance*,
   the Blob backend, the phone, the installed PWA, or all five? If the honest answer is "I want to
   click through the new quiz on my phone before she sees it", (e) is sufficient and (a) is a code
   change bought for nothing. If it is "I need to reproduce something that only happens on the
   production deployment", none of these options help, and the real answer is a backup plus a
   rollback plan.
2. Does the parent need to test against **her data** (her word bank, her strikes) or against fresh
   data? "Fresh" is much cheaper and much safer. "Hers" requires a copy, which is a read of
   production — safe in itself, but it puts a copy of her profile somewhere new, and that copy will
   go stale and start lying.

**On authentication**

3. Is a **second shared code** acceptable at all? `parent-access` OD-2 chose the opposite direction —
   *"I dont care if my daughter read, so we can use same password"* — precisely to avoid a second
   secret. A test profile is the one place where sharing the code defeats the purpose, so this is a
   deliberate reversal for a narrow reason. Confirm it explicitly.
4. Where does the second code live, and what happens when it is wrong or missing? Today, `APP_CODE`
   unset means the gate is **open**. Under (a), "gate open, no identity" is a new third state that
   must map to a file. Which one? (My answer: fail closed — refuse rather than guess — but that
   changes the "a missing variable never locks her out" property that `lib/auth.js` documents on
   purpose, so it is the owner's call.)
5. If the child types the test code — she can read, and codes get left on screens — what does she
   see? Under (a): a working app with no history, on her own origin, and her stored code is now the
   test one. Under (e): a different URL she has no reason to have.

**On reachability**

6. Does the test profile appear **anywhere** she could reach it: a tab, a link, a URL she might
   autocomplete, a share sheet, a bookmark, the PWA icon grid, the service-worker cache? Under (e)
   the answer is "only if the test PWA is installed on her phone" — so is it, or is it on the
   parent's device only?
7. What happens on her device if she lands in the test profile by accident? Is there a visible
   marker (a banner, a different colour) so anyone can tell in one second which profile they are in?
   I would argue any option that ships without such a marker is incomplete — the worst outcome is not
   a wrong write, it is thirty minutes of testing that nobody realises went to the wrong place.

**On making cross-writing impossible**

8. Is the guarantee you want **"the code branches correctly"** or **"the credential cannot name her
   file"**? This is the central question of the document. Options (a), (b) and (d) can only offer the
   first. Option (e) offers the second.
9. If the answer is (a): what proves the branch, and what proves it stays proved? A test that the
   test identity writes the test path is easy. A test that **no** input — missing header, empty
   string, whitespace, the child's code with a different case, an unknown code, a request that skips
   auth entirely — can cause a write to `profile/profile.json` is the one that matters, and it has to
   be enumerated rather than sampled. And it must be re-run on every future change to the three
   handlers, forever.
10. Must the store layer stay **stateless per request**? Any implementation that stashes "the current
    profile" in a module-level variable is a latent cross-write the moment a warm serverless instance
    handles two requests. This should be a written rule, not a code-review hope.
11. Under (a), is a **read** of her profile from the test identity acceptable, or must reads be
    barred too? (Reads are harmless to the data and useful for debugging; barring them is stricter
    and simpler to reason about.)

**On operations**

12. Has her profile been **captured** before the first live test, and where is the receipt? D25 made
    exactly this a phase criterion (`backup-receipt.txt`). Whatever is chosen, the first live test
    should not be the first thing that could ever need an undo.
13. Who resets the test store, and how often? A test profile that drifts for six months becomes a
    fixture nobody trusts, and then people go back to testing on hers.
14. Does the test traffic spend real money — OpenAI chapter generation on the shared key, Blob
    writes, a second Blob store's quota? Is there a ceiling, and does a second Blob store exist on
    the current Vercel plan? (This one is a fact to verify before deciding, not a judgement.)
15. Does the parent view (`#/parent`) ever show the test profile, or is it strictly hers?

---

## 5. Recommendation

**Take (e) — a separate deployment with its own Blob store and its own code — and keep (c) as the
everyday path.** Decline (b) and (d). Hold (a) as the fallback if the owner refuses a second Vercel
project.

**Why.** The parent's request is an environment request, not a feature request, and (e) answers it
without adding a single line to the app the child runs — zero new branches, zero new client state,
zero new screens, and nothing that has to keep being right in code nobody has written yet. It is the
only option whose effort is spent in configuration rather than in the six call sites that write her
file, and it is the only one that gives the parent a genuinely clean environment: separate origin,
separate `localStorage`, separate service-worker cache, its own installable PWA. The local sandbox
stays because it is faster and free and covers most days; (e) is for the days when "it works on my
laptop" is not enough. Its two limits are real and should be said out loud rather than hidden: it
tests the same build in a near-identical environment, not the production instance itself, and it does
not by itself give the parent data shaped like hers.

**The safety argument, stated precisely.** Options (a), (b) and (d) leave the test path executing
inside a process that holds the write credential for her file. Her data is then protected by a
conditional: correct today, and correct tomorrow only if every future change to `lib/store.js` and
the three handlers keeps it correct. That is a promise about human attention, and this project has
already been bitten twice by mechanically-green checks that were about form rather than substance
(`design.md`, "the risk that outranks all others"). Option (e) removes the conditional. A process
holding only the test store's token cannot address her blob — not because it declines to, but because
it cannot name it. A total failure of the test deployment's storage logic writes garbage into the
test store. That converts "we are careful" into "it is not possible", which is the correct standard
for the single file that holds everything and has no undo.

**One thing that should ship whichever option wins:** a visible, unmistakable marker on the test
environment — a banner, a different accent colour, the word TEST in the header — so that no session
can be spent in the wrong profile without someone noticing in the first second.

---

## 6. Sketch of the oplan phase that would build it

For option (e). Small — one phase, four steps, one human gate. Not written as a plan; a plan comes
after the decision.

**Base and scope.** Base commit is whatever `HEAD` is at the time, tree clean, `npm test` green.
Scope is deliberately narrow: **nothing under `api/`, `lib/` or `public/` may change.** That is
checkable and it is the phase's main safety property.

**GOAL.** The parent can open a second URL, type a second code, and use the whole app — placement,
chapters, tap-to-translate, the word quiz — with every write landing in a Blob store that provably
cannot name her profile. Her app, her data and her deployment are byte-unchanged.

**Step e.1 — capture and receipt.** Snapshot the live profile to a timestamped file before anything
else happens, and prove the capture is non-empty and parses. Follows D25's precedent and produces a
receipt file in the run folder. This step exists first so that everything after it is recoverable.

**Step e.2 — stand up the second project and store.** Create the second Vercel project from the same
repo, create the second Blob store, set its three environment variables, deploy the same commit that
is live in production. Record the project name, deployment id and URL in the journal. No repo change
except, at the end, one section in `docs/owner-handoff.md`.

**Step e.3 — prove the boundary.** This is the step that earns the recommendation, and it is the one
the owner should read. Three mechanical proofs, each an artifact in the run folder:
- With **only** the test store's token in the environment, attempt to read her production blob path
  and show it fails. The token cannot reach that store; the failure is the point.
- Record her profile's `meta.updatedAt` before the test session, exercise the test deployment hard
  (retake the placement test, generate a chapter, tap words, claim a word, fail a quiz item three
  times so a word demotes), then re-read her `meta.updatedAt` and show it is **identical**. The most
  destructive available test run, and her file did not move.
- Confirm the two deployments are different origins with different codes, and that the test
  deployment's environment contains no production credential.

**Step e.4 — the one-second marker and the doc.** The TEST banner and the handoff documentation:
which URL, which code, how to reset the store, what this environment does and does not prove. If the
banner requires a code change to `public/`, it is scoped to a build-time flag or an environment-driven
string and it becomes the single reviewed exception to "nothing under `public/` changes" — and the
diff must show it cannot render in the production build.

**Test surface.** `npm test` must stay at its current count and stay green — this phase should add
no unit tests, because it adds no code, and a growing test count would itself be a signal that scope
leaked. The real test surface is step e.3's three artifacts plus a diff proving `api/`, `lib/` and
`public/` are untouched (or, with e.4's exception, changed in exactly one reviewed place).

**What the human gate shows the owner.** One screen, four things:
1. The two URLs and the two codes, side by side, and confirmation that her app is unchanged.
2. The boundary proof in plain words: *"the test site was given a key that only opens a different
   cabinet. We tried to open her file with it and it could not. Then we did the worst things we could
   think of on the test site — retook her placement test, failed words on purpose until one demoted —
   and her file's last-modified timestamp did not move."*
3. The backup receipt from step e.1, with its timestamp and size.
4. The stated limits, unhedged: this is the same build in a near-identical environment, not the
   production instance; it does not carry her data unless a snapshot is separately decided; and the
   test store will drift unless someone resets it.

The phase does not close without the owner reading item 4 and saying yes.
