# PLAN_PLB - fact-check gate, round 2 (Step 2b), over draft r4 -> closed in r5

Two `sonnet` Explore agents, 2026-10-15 (Decisions + PLB-001..003; header/Scope + PLB-004..006 +
order), re-verifying every pointer after the round-1 corrections.

| section | CLAIMS total | verified | false | unverifiable | GAPS A | B | C |
|---|---|---|---|---|---|---|---|
| Decisions, PLB-001..003 | 152 | 142 | 9 | 1 | 5 | 3 | 2 |
| header, Scope, PLB-004..006, order | 107 | 105 | 1 | 3 | 3 | 0 | 1 |
| **total** | **259** | **247** | **10** | **4** | **8** | **3** | **3** |

## FALSE rows and their closure (draft r5)

| claim (r4) | correct value | closed by |
|---|---|---|
| D6 / PLB-001 "12 files" | the list names 11 | both say 11 |
| D7 PLB-002/003 "cheap, all four no" | check 1 reads "writes migration ... code" (`WORKFLOW.md:906`); both write migration 0023 | `top, because check 1` for PLB-001, 002, 003 |
| PLB-001 deny rows `../x.md`, `C:/x.md` "written as configured: denied" | an outside-project write passes through (`guard.js:205`); `C:/x.md` is relative on POSIX | resolver-level rows: `resolveTransferSurface` returns `null` for `src/app.ts`, `../x.md`, `C:/x.md`, `/abs/x.md` (win32 + posix absolute + `..`), and a write to `dev/x.md` is denied |
| PLB-002 preflight `:469-472` | config loaded at `:473`; `:469-472` is payload validation | "`:473` ff." |
| PLB-002 README `:88` "names the configured folder" | names no folder today | "gains ..." |
| PLB-002 "four tests" | six labels | "six" |
| PLB-002 no-op branch calls `writeConfig(ctx)` | the branch returns before `makeContext` (`:1487`) | `schemaRef()` helper + direct `writeAtomic` in the branch |
| PLB-003 positive control "prints `1`" via `git grep -c` | prints `<path>:1`, and an unstaged file is invisible to `git grep` | plain `grep -c` on the file |
| PLB-003 `{{#each}}` one-liner | the engine renders nodes per line; the inverse block needs its closing tag | multi-line block as `reviewer.md.tmpl:75-81` |
| PLB-005 "for each of the 20 old titles" | 19 translated (Direction already English) | 19; Bulgarian spans kept on one line; `:196`, `:263-264` named as left by design |
| PLB-005 overrides quote `:71-72` not byte-verbatim | parenthetical omitted | quoted whole |

## Gaps closed

- A: PLB-001 acceptance adds `setup-suite`, `validate-payload` and the provenance grep (the diff
  touches `schema/` and `skills/`); PLB-003 positive control and template block as above; PLB-002
  no-op mechanism as above; PLB-005 one-line spans and the 19-title loop.
- B/C: the rows above.
- Left as stated (no new gap): Codex's reading of `AGENTS.md` is observed from the binary's strings
  and the consumer's use, not executed here.
