CURRENT: phase 1 "Skeleton & app shell", next step 1.5
PLAN: .oplan/first-build/plan.md
ACCEPTED: step 1.1 — 7983095 · step 1.2 — 2012689 · step 1.3 — 12dce41 · step 1.4 — 16c1866
FROZEN CONTRACTS IN FORCE: GC-1 stack (zero-build, ESM, @vercel/blob only, tests = bare
`node --test`, files tests/*.test.js) · GC-2 store API (loadProfile/saveProfile, Blob
"profile/profile.json" vs <DATA_DIR>/profile.json) · GC-3 profile schema v1 (lib/profile.js
is now its reference implementation) · GC-4 API envelope {ok,data|error} via lib/http.js only ·
GC-5 hash routes #/home #/placement #/reader #/words, rtl/he, app name "מרפאת הקסמים" ·
GC-6 design tokens (purple #7c3aed / teal #0d9488 / amber #f59e0b / bg #faf7f2, Rubik) ·
GC-7 keys server-side only · GC-8 one commit per step
OPEN QUESTIONS: none
BLOCKED: no
