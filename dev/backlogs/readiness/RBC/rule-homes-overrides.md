# RBC-002 rule homes - dev/PROJECT_OVERRIDES.md

One `sonnet` agent, 2026-10-18: OLD = `git show 90a2f81:dev/PROJECT_OVERRIDES.md`; allowed homes =
the NEW overrides, the compacted `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`,
and for config literals / template text `.claude/aiwf-native/aiwf.config.json`,
`templates/PROJECT_OVERRIDES.md.tmpl`, `CLAUDE.md`. First run `rules: 139 homeless: 5` (the E2E
example list, the Portion 2 marker, the objection trigger, the gate list of "Dialogs only at the
gates", the Writer reply's content list); the COO restored all five in the overrides and the agent
re-verified them. Table as returned, those rows updated.

| rule (old text, condensed) | home (file + section) |
|---|---|
| Every role reads this file before starting work; keep it short and true | NEW header blockquote |
| Generic doctrine is payload (WORKFLOW/LOOP/REVIEW_CHECKLIST), never copied or restated here | NEW header blockquote |
| Not the extracted product: it is a consumer; its name, language, paths never enter payload; only dev/ may hold them | NEW Identity |
| Not a Codex plugin; Reviewer/QA engine-neutral; official Codex plugin a second opinion, not a component | NEW Identity |
| Not a runtime/state machine: no counters, locks, service; daemon feature out of scope | NEW Identity |
| Not advice: every gate that can be a native dialog is one; doc-only rule is a defect | NEW Identity |
| Never run destructive git/fs cleanup commands unless the operator asks that exact operation immediately before | NEW Hard rules; WORKFLOW § Commit & Push Authority |
| Never touch/move/delete untracked operator work or legacy files unless requested | NEW Hard rules |
| Destructive ops need confirmation immediately before, even if marked MUST | WORKFLOW § Commit & Push Authority; template Hard rules |
| git tag: separate operator word, also covers pushing the tag (operator rule 2026-10-01) | NEW Hard rules |
| git push/merge/rebase to this repo or a consumer: separate word each; release-tag push rides the tag word | NEW Hard rules |
| Removing anything under docs/ only through a migration that names it | NEW Hard rules |
| `--confirm-remove-stale` and `/plugin uninstall` in a consumer are gated | NEW Hard rules |
| `git worktree remove` and deleting a memory dir under ~/.claude/projects/ are gated | NEW Hard rules |
| Do not change files outside the requested scope | NEW Hard rules |
| Planning lock: on /plan or a planning request stay planning-only | WORKFLOW § Planning lock; template Hard rules |
| Commit authority: local only, after review route passes and human approves; no automatic commits | WORKFLOW § Commit & Push Authority |
| Push authority: push/merge/rebase only on the explicit word via the native ask dialog | WORKFLOW § Commit & Push Authority |
| Fetch, cherry-pick, sync likewise need explicit approval | WORKFLOW § Commit & Push Authority (fetch, cherry-pick); template Hard rules |
| No long-running services; a claude session observing a gate live is the operator's | NEW Hard rules |
| Prose in payload is R1 in the main session: edit, provenance grep, validate-payload, commit (operator decision 2026-10-16) | NEW Hard rules |
| Code goes through the Writer; Codex pass over code only on the operator's word | NEW Hard rules |
| dev/ and the self-install layer are R1 | NEW Hard rules |
| Migration only when STRUCTURE changes; prose ships with the plugin | NEW Hard rules (Release discipline) |
| Release: version bump in plugin.json + CHANGELOG block ending `Retires local rules:` | NEW Hard rules (Release discipline) |
| Tag local on the record commit, pushed WITH main in ONE push; two words, one dialog; CI not waited (operator rule 2026-10-02) | NEW Hard rules (Release discipline) |
| Released when the push lands; a red POSIX leg is a defect ticket, not a release block | NEW Hard rules (Release discipline) |
| Consumer picks up a version only via `/plugin update` + `/pnp:update` | NEW Hard rules (Release discipline) |
| Provenance grep empty before every commit; for a prose-only diff it is the gate | NEW Hard rules (Provenance) |
| Self-check provenance runs when the diff touches scripts/hooks/templates/schema; new allowlist entry needs its justifying file | NEW Hard rules (Provenance) |
| No AI attribution in git/PR text, all operator repos; reminder overridden; Writer briefs carry the line (operator rule 2026-08-31) | NEW Hard rules |
| A word for content is not a word to write into a live foreign tree | NEW Hard rules |
| Checklist first | NEW Execution discipline |
| Restate scope in 1-3 bullets and confirm before changing anything | NEW Execution discipline |
| Surgical edits over rewrites; whole-file restructure announced first (operator rule 2026-10-02) | NEW Execution discipline |
| No `cd` prefix (operator rule 2026-09-09) | NEW Execution discipline |
| COO runs scripts itself (operator rule 2026-09-29) | NEW Execution discipline |
| Auto mode blocks config-file edits: ask to switch it off; never bypass via sed/heredoc/redirect | NEW Execution discipline |
| Never pipe a test run through `tail` | NEW Execution discipline |
| Commands over ~5 min: background, timeout >= 3600000, killed run not restarted, briefs repeat it | NEW Execution discipline |
| A documentation claim is a hypothesis; code wins | NEW Execution discipline |
| Origin project is read-only reference; consumed as pnp@promptandpray, never --plugin-dir, no own PNP plan/version/memory | NEW Sibling products |
| No Git coupling to origin; a fix seen there is a ticket here | NEW Sibling products |
| Reusable as platform/workflow reference only (hook payloads via `git show c2626789^` in origin, dialog behavior) | NEW Sibling products |
| Not reusable as product truth | NEW Sibling products |
| First value loop install->loop->update; a change not advancing it is not the next step | NEW Product direction |
| Publishing only after the update path is proven on the consumer (P8) | NEW Product direction |
| Stack line | NEW Architecture direction; config project.stack |
| Three layers; engines write only managed artifacts under two-hash bookkeeping, never operator content | NEW Architecture direction |
| Hooks read only config, roles.json, active PLANs, plan-class brief files, route-state.json; Gate 4 nothing beyond payload | NEW Architecture direction |
| Nothing in the project layer writes the payload | NEW Architecture direction |
| Schema is the single authority for the config shape | NEW Architecture direction |
| Hooks fail safe per gate (1, 3, 4 DENY; 2 ASKS, denies failing plan-class pass; unexpected Gate 2 error ASK) | NEW Architecture direction; LOOP § Enforcement |
| A change that flips a fail direction is R3 | NEW Architecture direction |
| Zero runtime deps; PS 5.1 ASCII-only / bash LF-only, mirrored flags | NEW Architecture direction |
| Self-check executes real entrypoints; every assertion has a negative control or a `[NOTE]` | NEW Architecture direction |
| dev/ is not payload | NEW Architecture direction |
| Payload migrations: index.json, NNNN_<slug>/ with ops.json + NOTES.md, validate-payload, journal | NEW Data, tenancy and access control |
| Closed op vocabulary; no migration deletes an operator file | NEW Data, tenancy and access control |
| Ask-ruleset: added rule = migration + bump; removed rule ships with reconcile-ask-ruleset | NEW Data, tenancy and access control |
| Tests are part of implementation, not polish | WORKFLOW § Tests |
| Test policy home = this section + the five suites | NEW Test policy |
| Pure logic -> targeted unit tests | NEW Test policy |
| E2E only for a business result needing server+browser; never visual/text/"page loads"; no E2E runner (operator rule 2026-10-05) | NEW Test policy |
| E2E-eligible examples: data read back, permissions in UI, server redirect, server-computed values, integrations | NEW Test policy (restored, re-verified) |
| Mixed change -> both; missing obvious proof test is a scope miss | NEW Test policy |
| Proof must exercise the production code path or an extracted helper | REVIEW_CHECKLIST § Reviewer; template Test policy |
| Literal VERIFY commands live in aiwf.config.json | config verify.commands; NEW Test policy (names) |
| VERIFY proportional, run ONCE (operator rules 2026-09-24, 2026-10-17) | NEW Test policy |
| Prose row: provenance grep + validate-payload; template adds a render dry-run | NEW Test policy |
| schema/config/roles row | NEW Test policy |
| update engine/migrations row | NEW Test policy |
| hooks/gates row | NEW Test policy |
| scripts/ci/ or examples/ row | NEW Test policy |
| Union of rows; nothing beyond the ticket's rows; no row twice; CI full set after the fact (operator rule 2026-09-28, HARD-021) | NEW Test policy |
| Portion 1: eight Windows commands as ONE parallel batch | NEW Test policy |
| Portion 2: WSL, ONE invocation, legs sequential, only after Portion 1, never concurrent | NEW Test policy |
| Every Writer brief states the portions in those words | NEW Test policy |
| Portion 2 is NOT a release gate (operator rule 2026-09-28) | NEW Test policy (marker restored, re-verified) |
| Runbook dev/VERIFY_RUNBOOK.md (operator rule 2026-09-22); trap = defect of the brief | NEW Test policy |
| Writer runs only the tests it adds; suite once by the COO in background at handoff (operator rule 2026-10-17) | NEW Test policy |
| Logs of any run go outside the repository | NEW Test policy |
| No micro-round edits while a suite runs (RBA-001) | NEW Test policy |
| Independent units in parallel by default (operator rules 2026-10-02, 2026-10-05) | NEW Test policy |
| A file count on disk is not a runner count | NEW Test policy |
| Status page README § Status | NEW Status and release artifacts |
| Changelog CHANGELOG.md | NEW Status and release artifacts |
| Roadmap dev/backlogs/ROADMAP.md + active/ | NEW Status and release artifacts |
| Respond in bg | NEW Communication; config operator.language |
| Agent-to-agent traffic always English | NEW Communication (English everywhere); WORKFLOW § Ticket brief contract |
| Conversational role names, identifiers never change | NEW Communication; config operator.roleNicknames |
| English everywhere in the tree (operator rule 2026-10-15, restated 2026-10-16) | NEW Communication |
| Existing Bulgarian translated only when a ticket names it | NEW Communication |
| A rule record carries a marker, not its story (operator rule 2026-10-16) | NEW Communication |
| Be concise; no narration | NEW Communication |
| Operator channel short (operator rule 2026-09-22, sharpened 2026-10-16) | NEW Communication |
| No retelling (operator rule 2026-09-27; 2026-10-11) | NEW Communication |
| Stop for an operator choice only on material alternatives; COO owns routine decisions | WORKFLOW § The operator does not arbitrate; § Plan readiness review |
| A dialog only when the ticket cannot continue (operator rule 2026-10-16; Silerax 2026-10-05) | NEW Communication |
| Analyse and decide (operator rule 2026-10-05; 2026-10-04) | NEW Communication |
| Never a whole PLAN in front of the operator (operator rule 2026-09-10) | NEW Communication |
| On an objection or surprise at a cost/process, stop the tools | NEW Communication (trigger restored, re-verified) |
| The gate is not prompted | NEW Communication |
| Informal address (operator rule 2026-10-04) | NEW Communication |
| No /pnp:brief offer when state is durable (operator rule 2026-09-10) | NEW Communication |
| Platform windows: native commands and paths | NEW Environment |
| COO context source ~/.claude/ctx | NEW Environment |
| Workspace path map | NEW Workspace paths |
| .aiwf/ holds only live loop mechanics + current ticket artifacts | NEW Workspace paths |
| Plan drafted untracked in drafts/, lands in active/ with readiness/ in the same commit | WORKFLOW guard (e); § Durable development history; § Planning lock |
| Approved plan has no copy in .aiwf/ | WORKFLOW § Durable development history |
| A session not holding the tree writes nothing in .aiwf/ | WORKFLOW § Branch policy |
| Default branch main; short-lived branches; branch/dirty check; no stash/clean/reset | NEW Workspace paths; WORKFLOW § Branch policy |
| Loop shape params only; gates are payload mechanics | NEW Loop shape; WORKFLOW § Loop shape and its overrides |
| One reviewer, not two | WORKFLOW § Loop shape and its overrides |
| Correction rounds capped at 2 | NEW Loop shape (cap = 2); WORKFLOW § Loop shape and its overrides |
| Only the operator lifts the cap | WORKFLOW § Loop shape and its overrides |
| R1 uses no orchestration loop | WORKFLOW § Loop shape and its overrides; § Routes |
| COO routing tiers: Fable / Opus, never Sonnet (operator rule 2026-10-15) | NEW Loop shape |
| Routing moves the COO session only | WORKFLOW § COO routing |
| Plan COO line names the model; Writer gets no recommendation | NEW Loop shape |
| QA conditional | WORKFLOW § Loop shape and its overrides |
| Readiness passes: ceiling, first on standing word, each further on its own word | WORKFLOW § Plan readiness review; § The operator does not arbitrate |
| Gate checkpoint hook (operator rule 2026-10-14; HARD-024), byte-identical | NEW Loop shape |
| Dialogs only at the gates, with the gate list (operator rule 2026-10-05) | NEW Loop shape (gate list restored, re-verified) |
| No audit-pass question for prose (operator decision 2026-10-16) | NEW Loop shape |
| Ticket-end cleanup (operator rule 2026-10-06, widened 2026-10-16) | NEW Loop shape |
| A ticket born mid-work: plan committed ONCE after the answers (operator rule 2026-10-01) | NEW Loop shape; WORKFLOW guard (b) |
| Out-of-scope findings to the operator with a destination (operator rule 2026-09-30) | NEW Loop shape |
| Paid passes stated and priced, euro (operator rule 2026-10-03) | NEW Loop shape |
| A dead paid pass waits; resume id | NEW Loop shape |
| Resource checks are the COO's own (operator rule 2026-09-01) | NEW Loop shape |
| The Writer's reply is short, ~25 lines (operator rule 2026-10-10) | NEW Loop shape |
| Writer's reply content: blockers, deviations, failed checks, handoff path | NEW Loop shape (restored, re-verified) |
| Product boundary checks, byte-identical | NEW Product boundary checks; config review.productBoundaryChecks |
| Durable knowledge in dev/backlogs/ | NEW Workflow; WORKFLOW § Durable development history |
| Candidates registered where born | NEW Workflow |
| Resume memory is state, not a log (operator rule 2026-10-04) | NEW Workflow |
| Repo copy of a live artifact refreshed at the canon moment (operator rule 2026-09-15) | NEW Workflow |

Stories dropped (as returned): the TEMPLATE CONTRACT comment (generator internals); the extraction
history; the Codex-wrapper sandbox aside and README FAQ pointer; Gate 4's header-risk description;
the auto-mode incident dates; the "destroys the evidence" and "invalidates the run" rationales; the
origin-hash aside and the "generic or wrong" slogan; the provenance section's scan list; the memory
and "time is a resource" rationales; the runbook trap list (lives in the runbook); "replacing the
morning rule"; "install -> loop -> update" restated; "a sequential Portion 1 ... defects of the
brief" (restates the rule); colour asides.

rules: 139 homeless: 0
