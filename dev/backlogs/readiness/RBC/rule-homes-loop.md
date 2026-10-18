# RBC-002 rule homes - docs/LOOP.md

One `sonnet` agent, 2026-10-18: OLD = `git show 90a2f81:docs/LOOP.md`, NEW = the compacted
`docs/LOOP.md`, `docs/WORKFLOW.md`, `docs/REVIEW_CHECKLIST.md`. First run `rules: 96 homeless: 1`
(the Gate 4 "guarantee" sentence); the COO restored it in LOOP § Enforcement of Writer-only writes
and made "never a failure" explicit in WORKFLOW § Commit & Push Authority; the agent re-verified
both rows. Table as returned, the two rows updated.

| rule (old text, condensed) | home (file + section) |
|---|---|
| The loop is a native mapping, not a new authority; WORKFLOW.md and the overrides document stay the source of truth | LOOP intro |
| Reviewer/QA are engine-neutral (Codex or Claude per `roles.json`); the COO orchestrates in-session | LOOP intro |
| R1: done directly in the main session; no subagents, Reviewer, QA or loop | LOOP § Routing mapped to native (table) |
| An R1 ticket that gains an executable artifact is re-classified out of R1 and takes the code loop | LOOP table; WORKFLOW § Routes R1 |
| R2 non-runtime route, correction rounds capped at `loop.correctionRoundsCap` | LOOP table |
| R2 runtime/UI route adds /pnp:qa, same cap | LOOP table |
| R3: plan-first, readiness review before the Writer, on `r3/<topic>`, review, QA if runtime, COO synthesis, operator gate | LOOP table; WORKFLOW § Routes R3 |
| Review engine and pass count come from the ticket's class, in both R2 rows and R3 | LOOP § Routing mapped to native; WORKFLOW § Routes |
| Brief carries `Class: plan\|code\|docs`, default `code` when absent | WORKFLOW § Routes |
| /pnp:review resolves the class row via the reviewer-only `-Class`/`--class` flag (one snapshot) | LOOP § Routing mapped to native; WORKFLOW § Reproducibility |
| Factory audit table: all rows inherit the Reviewer; plan 2, code 1, docs 1 | WORKFLOW § Loop shape and its overrides |
| /pnp:roles shows and changes the audit table | WORKFLOW § Loop shape and its overrides |
| A Claude-hosted row dispatches the rendered `reviewer` agent; model passed only for a tier alias | LOOP § Routing mapped to native; § Role boundaries (dispatch contract) |
| The reviewer agent file is rendered whenever the Reviewer role or any row is Claude-hosted | WORKFLOW § Routes |
| Fact-check gate runs before every diff pass above the scan tier; only a scan-tier alias skips; an exact id always gets it | LOOP § Routing mapped to native; WORKFLOW § The COO write boundary |
| A plan pass has the mechanical plan gate instead; the planning cycle is /pnp:plan | LOOP § Routing mapped to native; WORKFLOW § The COO write boundary |
| /pnp:loop is convention only: no runtime state machine, no counters | LOOP § Routing mapped to native |
| COO: plans, authors the brief with risk threshold and stop condition, delegates, reads the full diff, arbitrates, stops | LOOP § Role boundaries (COO) |
| COO is the only role that presents the result to the operator | LOOP § Role boundaries (COO) |
| COO does not write implementation code in R2/R3; R1 is the deliberate exception | LOOP § Role boundaries (COO) |
| Writer is the only repo writer, `.claude/agents/writer.md`, `subagent_type: "writer"` | LOOP § Role boundaries (Writer) |
| Writer never approves its own work; returns diff, tests added, VERIFY output with exact exit codes | LOOP § Role boundaries (Writer) |
| Writer does not decide acceptance or invent ledger content; PLAN write only when explicitly delegated | LOOP § Role boundaries (Writer) |
| Several Writers on one ticket only for non-overlapping file sets; split recorded; one VERIFY, one commit | LOOP § Role boundaries (Writer) |
| `isolation: "worktree"` is not the instrument (copy starts from the default branch) | LOOP § Role boundaries (Writer) |
| The planner runs as the `writer` agent type and writes only `<plansDir>/drafts/<ABBR>/` | LOOP § Role boundaries (Writer); WORKFLOW § Planning lock |
| Do NOT pass `model` for the Writer; the Agent override takes only tier aliases and discards the pin | LOOP § Role boundaries (dispatch contract) |
| To change the Writer's model, change `roles.writer.model` and re-render | LOOP § Role boundaries |
| /pnp:review and /pnp:qa pass `model` only for a tier alias, omit it for an exact id | LOOP § Role boundaries |
| One reviewer file/pin shared by all Claude rows; tier alias or exactly `roles.reviewer.model`; refusals; fail closed on mismatch | LOOP § Role boundaries |
| Reviewer resolver per OS channel (ps1 windows, sh linux/macos), selected by `config.os`, mirrored flags | LOOP § Role boundaries (Reviewer) |
| /pnp:review dispatches `codex-review.ps1`/`.sh` (same class flag) or the `reviewer` subagent (Read/Grep/Glob) | LOOP § Role boundaries (Reviewer) |
| Reviewer verdicts per REVIEW_CHECKLIST; plan pass returns findings table + `BLOCKERS:` line; never edits | LOOP § Role boundaries (Reviewer) |
| Codex host is a hard OS sandbox; Claude host has no OS cell; the hard boundary only on the codex path | LOOP § Role boundaries (Reviewer); § Honest security model |
| QA engine-neutral, Codex wrapper or `qa` subagent, only for observable runtime/UI behavior | LOOP § Role boundaries (QA) |
| QA is an artifact judge; the browser lives in the runner; never starts a dev server or drives a browser | LOOP § Role boundaries (QA); REVIEW_CHECKLIST § QA |
| QA spec-flow and verdicts, `BLOCKED` when artifacts are missing or unreadable | LOOP § Role boundaries (QA); REVIEW_CHECKLIST § QA |
| QA has the same read-only boundary per host | LOOP § Role boundaries (QA) |
| QAL: operator-gated, explicit request in the current conversation, `roles.qal.enabled`, never on the orchestrator's initiative | LOOP § Role boundaries (QAL); WORKFLOW § Roles |
| QAL is codex-only, wrapped by /pnp:qal, with its wrapper scripts | LOOP § Role boundaries (QAL) |
| QAL runs with no OS sandbox (`danger-full-access`; the bypass flag strips approvals; neither safe), scratch cwd, disposable profile | LOOP § Role boundaries (QAL) |
| QAL isolation is hygiene, not a guarantee; "never writes the repo" a convention; QA stays the default | LOOP § Role boundaries (QAL) |
| Arbiter: not a loop role; on-demand, cold-start, read-only, via /pnp:arbiter on a fired trigger | LOOP § Role boundaries (Arbiter); WORKFLOW § Escalation and the arbiter |
| Operator: sole authority for commit, push, merge, branch switches, destructive ops, a QAL run | LOOP § Role boundaries (Operator); WORKFLOW § Roles |
| The planner writes only its plan folder under drafts | LOOP § Role boundaries (Writer) |
| Session rule: fresh session for readiness; ~400k a ticket boundary; finish the ticket, then a new session | WORKFLOW § Plan readiness review; LOOP pointer |
| Reading is not a shell job: Read/Grep/Glob; the shell is for execution | LOOP § Role boundaries ("Reading is not a shell job") |
| Editing is not a shell job: Edit/Write, never `sed -i`/heredoc/redirect; a gated verb in the text trips Gate 4 | LOOP § Role boundaries ("Reading is not a shell job") |
| Gate 1: Edit/Write only from the main session or `agent_type` exactly `writer`; others denied | LOOP § Enforcement (Gate 1) |
| Gate 2 modes via `enforcement.dispatchGate`; `always` factory default, every dispatch a Yes/No dialog | LOOP § Enforcement (Gate 2) |
| `off-plan`: `Ticket: <REF>` looked up in active PLANs; silent when found; dialog otherwise | LOOP § Enforcement (Gate 2); WORKFLOW § Ticket brief contract |
| Any other state of the key means `always` | LOOP § Enforcement (Gate 2) |
| The Gate 2 matcher is the `Agent` tool name (SDK reports `Task`) | LOOP § Enforcement (Gate 2) |
| `reviewer` dispatch with `Class: plan` runs `plan-gate.js`, DENIES while `--check` fails, silent on pass | LOOP § Enforcement; WORKFLOW § Plan readiness review |
| Unreadable payload, a throw, or no `CLAUDE_PROJECT_DIR` resolves to ask | LOOP § Enforcement |
| The Codex wrappers refuse a plan-class run with exit 2 | LOOP § Enforcement; WORKFLOW § Plan readiness review |
| Honest limit: `ask` on an Agent call observed live; `deny` rests on the documented contract | LOOP § Enforcement |
| Gate 3 lives inside the Gate 1 hook file (three hook files, four gates) | LOOP § Enforcement (Gate 3); WORKFLOW § Reproducibility |
| Gate 3 allowed paths: `docs/**`, `.aiwf/**`, root `*.md`, the transfer surface (fallback, contained, not under `.claude`), the roadmap | LOOP § Enforcement (Gate 3) |
| Gate 3 never opens the transfer surface or roadmap while the state is unusable | LOOP § Enforcement (Gate 3) |
| No state file or `{}`: invisible; the Writer is never gated | LOOP § Enforcement (Gate 3) |
| Gate 3 covers Edit/Write only; shell mutations remain doctrine | LOOP § Enforcement (Gate 3) |
| `enforcement.routeWriteGuard: false` disables; any other state ARMED; never reaches Gate 1 | LOOP § Enforcement (Gate 3) |
| Gate 4 on `Bash\|PowerShell`; recognises `git`/`git.exe` (optional `-C`/`-c`) plus an ask-class verb | LOOP § Enforcement (Gate 4) |
| The self-check requires every gated git verb of the ruleset to be known to the hook | LOOP § Enforcement (Gate 4) |
| Gate 4 denies, naming the verb, from a non-Writer subagent | LOOP § Enforcement (Gate 4) |
| Silent passthrough only on a byte-for-byte rule match: `git <verb>` and `git.exe push\|merge\|rebase` | LOOP § Enforcement (Gate 4) |
| Ask for everything else recognised (git.exe, any `git -C`, unstripped wrappers, nested shells, irregular whitespace) | LOOP § Enforcement (Gate 4) |
| Claude Code's own matcher splits, strips wrappers, matches past `NAME=value`; those forms are not holes | LOOP § Enforcement (after the Gate 4 list) |
| A hook decision does not bypass permission rules; Gate 4 confirms a real rule match or asks | LOOP § Enforcement (after the Gate 4 list) |
| Honest limit: the passthrough depends on unobserved documented host behaviour | LOOP § Enforcement (after the Gate 4 list) |
| Gate 4 fails closed like Gate 1 and reads its payload only | LOOP § Enforcement ("It fails closed") |
| Gate 4 is a recogniser, not a shell parser: escapes, aliases, env-indirection not seen | LOOP § Enforcement ("It fails closed") |
| Quoted verb still costs a click; quoted separator does not split; verb quotes come off | LOOP § Enforcement ("It fails closed") |
| `$(git reset --hard)` and `` `git push` `` recognised, never confirmed, so they ask | LOOP § Enforcement ("It fails closed") |
| "The guarantee is the identity check and the byte-exact rule test; recognition is best-effort" | LOOP § Enforcement of Writer-only writes, end of "It fails closed" (restored, re-verified) |
| The matcher is an exact alternation list, not a regex | LOOP § Enforcement ("Both shell tools") |
| Every ask rule ships as a `Bash(X)`/`PowerShell(X)` mirror pair, with the blanket allow for both | LOOP § Enforcement ("Both shell tools") |
| The self-check asserts the mirror in both directions | LOOP § Enforcement ("Both shell tools") |
| PowerShell splits on `;`, `\|`, PS7+ `&&`/`\|\|`; `&` is the call operator (`& git push` asks) | LOOP § Enforcement ("Both shell tools") |
| No wrapper/`NAME=value` stripping documented for PowerShell; `timeout 30 git commit` asks there | LOOP § Enforcement ("Both shell tools") |
| Recognition folds case; the byte-exact rule test folds it on neither tool | LOOP § Enforcement ("Both shell tools") |
| `Monitor` runs under the Bash rules and needs none of its own | LOOP § Enforcement; § Honest security model |
| Residual class: a tool on neither layer; reachable by tool choice; weaker than recognition residuals | LOOP § Honest security model |
| Closing a known tool is two lines; an unnamed tool cannot be closed in advance | LOOP § Honest security model |
| Commits local only, after review passes AND explicit approval; the operator types nothing | WORKFLOW § Commit & Push Authority; LOOP § Commit gate |
| The Writer attempts the commit; `Bash(git commit:*)` and its mirror are `ask` rules | LOOP § Commit gate; WORKFLOW § Commit & Push Authority |
| No approval token, no state file, no content binding; the click is the approval | WORKFLOW § Commit & Push Authority |
| The click approves the invocation, not the final tree; commit automation diverges; file-set guards wrong there | WORKFLOW § Commit & Push Authority |
| /pnp:selfcheck reports such a hook as a `[NOTE]`, never a failure; auditing it stays the project's job | WORKFLOW § Commit & Push Authority ("never a failure" made explicit, re-verified) |
| Push/merge/rebase only after the explicit word AND a native `ask` dialog | WORKFLOW § Commit & Push Authority; § Branch policy |
| `ask`, not `deny` (git.exe, `-C <projectRoot>`, PowerShell mirrors): the operator does not drive git | WORKFLOW § Commit & Push Authority |
| Push gate is dialog + word + branch isolation; accident-grade; prefix matching | LOOP § Honest security model; WORKFLOW § Commit & Push Authority |
| Explicit push URL, alias/env-indirection, escaped verb out of scope | LOOP § Honest security model |
| Gate 4 narrows the residual but is not a shell layer; emulation out of scope (record in `aiwf-lib.js`) | LOOP § Honest security model |
| Destructive/system-changing commands are `ask` rules; a role may run one only after the Yes | WORKFLOW § Commit & Push Authority |
| Gates and permission rules are accident/role protection, not adversary-proofing | LOOP § Honest security model |
| Hooks trust harness identity; prefix per subcommand; Gate 4 DENY for every other subagent | LOOP § Honest security model |
| Out of scope: obfuscated forms; raw SQL, production flags, platform-specific deletes | LOOP § Honest security model |
| Dialogs fire only in a permission mode that asks | LOOP § Honest security model |
| The git boundary covers the two shell tools; the widest gap is a tool on neither list | LOOP § Honest security model |
| Hard guarantees: Codex OS sandbox, git reversibility, operator-in-the-loop | LOOP § Honest security model |

Stories dropped (as returned): Gate 1 confirmed against the real harness; the worktree-copy
observation on a consumer; the measured-on-a-consumer amended version file; why the default is to
ask; why the hook exists; why a broken config should cost clicks; why a missing mirror twin
matters; why QAL is codex-only; the "escape hatch" framing; the N4-R history; several explanatory
asides.

rules: 96 homeless: 0
