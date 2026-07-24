# Field guide — delight-pass (budget: 40 lines)

Inherited from first-build (still binding):
1. `curl` on this Windows machine needs `--ssl-no-revoke` (corporate TLS).
2. npm global bin is NOT on Git Bash PATH. Call global CLIs via `"$(npm prefix -g)/<tool>"`
   (e.g. the authenticated `vercel` CLI).
3. Shell is Git Bash on Windows: forward slashes, `/dev/null`; git CRLF warnings are noise.
4. Secrets live in `.env` (gitignored). NEVER commit it or copy key values anywhere.
5. Tests: bare `node --test` via `npm test`; test files in `tests/*.test.js`, node:test only.
6. npm scripts run under cmd.exe, NOT Git Bash — always validate with `npm test` itself.
7. `public/sw.js` PRECACHE must stay a JSON-parseable literal AND is frozen by a
   deepStrictEqual test — in THIS run sw.js is simply untouchable (GC-D2).
8. Before touching any view/style: grep tests/ for exact-shape and selector assertions —
   shell.test.js freezes the six token names, manifest colors, and PRECACHE.
9. Git Bash curl mangles Hebrew in -d args; POST Hebrew via Node or the browser only.

New this run:
10. ChatGPT image downloads land in `C:\Users\dkreinov\Downloads` as `ChatGPT Image <date>.png`
    — find newest with `ls -t`, then `mv` to the target name immediately (next download would
    be ambiguous otherwise).
11. ALL image generation happens in the ONE dedicated chat (design.md §7 URL). Never a new chat.
    Generate one image at a time — ChatGPT serializes generations within a chat.
12. Activate ChatGPT's Download control exactly ONCE and wait via Bash polling only. Re-clicking
    while waiting made Chrome save 89 identical copies (2026-07-24 incident) — and once
    Downloads is polluted with duplicates, the "newest file" heuristic grabs stale bytes.
13. Any validation over generated assets must assert CONTENT distinctness (md5 across all
    assets + anchor), not just per-file format/aspect — duplicate grabs pass per-file checks.
