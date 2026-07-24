# Field guide — first-build (budget: 40 lines)

1. `curl` on this Windows machine needs `--ssl-no-revoke` (corporate TLS blocks revocation
   checks). Applies to any script shelling out to curl too.
2. npm global bin is NOT on Git Bash PATH. Call global CLIs via `"$(npm prefix -g)/<tool>"`
   (e.g. the authenticated `vercel` CLI).
3. Shell is Git Bash on Windows: use forward slashes and `/dev/null`; expect CRLF warnings
   from git — they are noise, not errors.
4. Secrets live in `.env` (gitignored). NEVER commit it, never copy key values into any other
   file. `OPENAI_API_KEY` is the only runtime key (design.md §2).
5. Tests are plain `node --test tests/`. No test framework, no assertion libs beyond
   `node:assert`. Node is v22.14.0.
