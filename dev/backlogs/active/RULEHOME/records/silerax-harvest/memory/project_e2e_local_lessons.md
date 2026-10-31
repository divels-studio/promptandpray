---
name: project-e2e-local-lessons
description: Local E2E environment - machine-local traps for every session/agent (no dialogs, no hung processes, how the local stack differs)
metadata:
  node_type: memory
  type: project
  originSessionId: 024b79d2-105d-4a49-8195-ccb4aa428320
  modified: 2026-10-26T06:50:49.320Z
---

Contract: `scripts/e2e-local/README.md`, `docs/guides/TESTING.md` § Local E2E environment; rules: `dev/PROJECT_OVERRIDES.md` § Hard rules.

1. `up.ps1` from an agent shell: `run_in_background` (timeout >= 3600000); bare, `> file` or a pipeline work the same way since
   UIR-042 (`scripts/e2e-local/README.md:101-106`). In the background it ends and notifies; after a machine restart Docker Desktop takes minutes. Right after a stopped server it can
   fail with "cannot access .next-e2e\standalone" (a race) - just run it again.
2. A scan agent that started `up.ps1` in the background stays "alive" and re-notifies - TaskStop it after its report (the server survives, Start-Process).
3. Local DB queries: `psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -Atc "..."` - never `docker exec`, `supabase ...`
   (`--help` / `--version` included - the rule is a prefix) or `Remove-Item`; say so explicitly in scan-agent briefs.
4. `.aiwf/e2e-local/supabase-start.log` and `supabase status -o env` carry the local keys - never print them.
5. The local Postgres image gives `anon/authenticated/service_role` only `Dxtm` default privileges in `public` -> PostgREST 42501;
   `silerax/supabase/roles.sql` block 5 restores ALL. Check: `has_table_privilege('authenticated', oid, 'SELECT')` -> 0 tables without it.
6. Node 24 intercepts `--env-file` even after the script name -> the seed's flag is `--infra-env`.
7. pgTAP locally (image 17.6.1.063): `GRANT app_user TO CURRENT_USER` segfaults; use
   `DO $grant$ BEGIN EXECUTE format('GRANT app_user TO %I', current_user); END $grant$;` in every new pgTAP file.
8. Two companies with the same `created_at` in one transaction come back in random A/B order - use `clock_timestamp()`.
9. Playwright `--reporter=...` on the command line REPLACES the configured reporters (the JSON goes to stdout) - never pass it. U1
    (`scripts/e2e-compare.ps1`) refuses an unreadable report (an empty file once gave a false `NEW FAILING: 0`).
10. The cloud test company carries config the seed does not create (SKU settings, company quality parameters, import batch) - locally
    `supabase/seed-e2e-fixtures.sql` gives it; reference data: `seed-settlements.sql` (generator `scripts/db/build-settlements-seed.mjs` + `alias-resolver.mjs`).
11. File names that differ only by letter case overwrite each other on NTFS (negative-control fixtures) - use distinct names.
12. Never read a Server Action response body in E2E (Chromium drops large stream bodies, flaky only in a full run); `route.fetch()`
    forwards an upload without the file -> the template misses -> a paid AI call. Proof is the DOM (wizard debug panel `HIT` + id) and the DB.
13. The Agent tool's `isolation: "worktree"` branches from `main`, not the current branch - for parallel Writers the COO makes the worktree:
    `git worktree add --detach .aiwf/wt/<name> <hash>` + a `silerax/node_modules` junction; cleanup: the junction first
    (`cmd /c rmdir <junction>` - link only), then `git worktree remove --force`. SKIPPING THE FIRST STEP COSTS THE REAL node_modules:
    on 2026-10-20 a `git worktree remove --force` on a worktree still holding the junction ended with "Filename too long" and the
    real `silerax/node_modules/.bin` was gone (every `npm run` script failed with "'cross-env' is not recognized"); `npm install`
    restored it (inferred cause, no log proves it - the arbiter's instruction to the operator had omitted the junction step).
    A stale worktree is checked with `cmd /c "dir /al <wt>\silerax"` before any removal.

Related: [[feedback-no-dialogs-agents]], [[project-mission-resume]].
