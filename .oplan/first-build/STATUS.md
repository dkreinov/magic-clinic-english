# STATUS — English learning app, run "first-build"

**Updated:** 2026-07-24 13:00 · **Where we are:** Phase 1 of 5, step 1.4 executing (3/5 accepted).

## What's happening right now
Steps 1.1 (scaffold), 1.2 (profile + storage), and 1.3 (first API endpoints) are accepted and
committed — 24 tests green. Step 1.4 — the actual app she will see: the Hebrew RTL PWA shell
with all four screens, the purple/teal/amber design system, icon, and offline support — is
being executed by a worker.

## The road

```mermaid
flowchart LR
    P1[Phase 1<br/>Skeleton & app shell<br/>3/5 steps done] --> P2[Phase 2<br/>Word data & profile engine]
    P2 --> P3[Phase 3<br/>Placement test]
    P3 --> P4[Phase 4<br/>Story engine]
    P4 --> P5[Phase 5<br/>Deploy to Vercel]
    style P1 fill:#f59e0b,color:#000
```

## Decisions locked so far (the big ones)
- No build tools: plain HTML/CSS/JS PWA in `public/`, Vercel serverless functions in `api/`.
- Her profile (words, skills, story progress) = one JSON document; Vercel Blob in production,
  local file in development.
- App name: **"מרפאת הקסמים"** — purple/teal/amber look, Rubik font, Hebrew RTL UI.
- Tap-to-translate works from a per-chapter Hebrew glossary generated with the chapter
  (instant, no per-tap AI call).
- Test runner: bare `node --test` (the directory form breaks through npm on Windows).
- API contract: strict JSON envelope; malformed/empty request bodies are rejected loudly.

## Needs the owner (not blocking yet)
- Phase 3 will produce the placement item bank — you review it (~30 min) before she uses it.
- Nothing else right now; run is autonomous through all phases per your instruction.

## Risks being watched
- Extracting the official word list from the MoE PDF (Phase 2) — layout may fight us.
- Profile stored on a public-URL Blob (no real name in it; revisiting in Phase 5).
