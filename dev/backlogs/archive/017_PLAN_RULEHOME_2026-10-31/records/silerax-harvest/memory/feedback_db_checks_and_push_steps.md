---
name: feedback-db-checks-and-push-steps
description: "Operator hard rule 2026-10-24 - COO runs DEV/PROD SELECT checks itself; push/apply steps go to the operator as `!` commands, one per message"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e948000b-d770-425f-9cb4-ec22f0f28fef
  modified: 2026-10-25T13:36:23.046Z
---

**Operator hard rule (2026-10-24, "твърдо правило в паметта завинаги").**
1. Never hand the operator a SELECT / check to run in the SQL Editor with "paste the result, if not all zero we stop". The COO
   has the env files and tools to reach the databases (`silerax/.env.local` = DEV, `silerax/.env.local.prod` = PROD,
   `DATABASE_URL`; `psql` installed) and runs every read-only check itself, then confirms the result.
2. Push / apply / dry-run steps the operator must run go into the chat as ready-to-run `!` commands (no `<URL>` placeholders),
   ONE command per message, in consecutive messages - never several steps in one message (they get lost in the chat).

Operator words: „имате всичките енв и инструменти за достъп до базите за да си изпълнявате проверките със селект и да си
потвърждавате че всичко е ок. пуш команди/стъпки/драйрънове се дават тук в чата една по една - никога в едно съобщение".

**Scope of rule 2 (operator correction 2026-10-25, PLINK release: „ееее прекаляваш, това са твои команди").** The `!` commands are
ONLY the DB apply / dry-run (`supabase db push --db-url ...` with the PROD / DEV secrets). `git push` of the branch, `git push
origin <branch>:main` and `git push origin <tag>` are the COO's own commands, run from the session on the operator's word with the
native ask dialog as the gate (PnP `docs/WORKFLOW.md` § Commit & Push Authority) - never handed to the operator as `!` lines.

**Why:** TENANCY-001 apply - the COO gave a SQL Editor SELECT plus a 5-step block with `<DEV URL>` placeholders; the GRANTS-001
session had given ready `!` commands. **How to apply:** every DEV/PROD apply (migrations first rule, [[project-prod-db-state]]).
