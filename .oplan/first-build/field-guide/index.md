# Field guide — first-build (budget: 40 lines)

1. `curl` on this Windows machine needs `--ssl-no-revoke` (corporate TLS blocks revocation
   checks). Applies to any script shelling out to curl too.
2. npm global bin is NOT on Git Bash PATH. Call global CLIs via `"$(npm prefix -g)/<tool>"`
   (e.g. the authenticated `vercel` CLI).
3. Shell is Git Bash on Windows: use forward slashes and `/dev/null`; expect CRLF warnings
   from git — they are noise, not errors.
4. Secrets live in `.env` (gitignored). NEVER commit it, never copy key values into any other
   file. `OPENAI_API_KEY` is the only runtime key (design.md §2).
5. Tests are plain bare `node --test` (run as `npm test`): default `**/*.test.js` discovery;
   test files live in `tests/`, end `.test.js`, use only `node:test` + `node:assert`. Node 22.
6. npm scripts run under cmd.exe, NOT Git Bash — a command that works in your shell can fail
   via npm (`node --test tests/` did). Always validate with `npm test` itself.
7. `public/sw.js` has `const PRECACHE = [...]` that MUST stay a JSON-parseable literal
   (no trailing commas, double quotes) — tests/shell.test.js extracts and JSON.parses it, and
   every entry must map to a real file under `public/`. Adding a shell file = updating PRECACHE.
8. API handlers touch `res` ONLY via lib/http.js (`sendJson`/`readJsonBody`) — raw-node style,
   never Vercel's `res.status().json()`; that is what lets the same handler run under the dev
   server. Empty/invalid JSON request bodies THROW — callers must send a valid JSON body.
9. Windows paths in ESM: compare module URLs with `pathToFileURL(...)`.href, never raw paths.
