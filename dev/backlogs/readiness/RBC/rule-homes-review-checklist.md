# RBC-002 rule homes - docs/REVIEW_CHECKLIST.md

One `sonnet` agent, 2026-10-18: OLD = `git show 90a2f81:docs/REVIEW_CHECKLIST.md`, NEW = the
compacted `docs/REVIEW_CHECKLIST.md`, `docs/WORKFLOW.md`, `docs/LOOP.md`. Table as returned.

| rule (old text, condensed) | home |
|---|---|
| Reviewer and QA are engine-neutral: a read-only Codex wrapper or a `reviewer`/`qa` Claude subagent | REVIEW_CHECKLIST intro |
| Host is data in `.claude/aiwf-native/roles.json`, resolved by the OS-channel role resolver (ps1 on windows, sh on linux/macos) | LOOP § Role boundaries (Reviewer) |
| Codex wrapper script paths (`codex-review`/`codex-qa`, ps1 and sh) | LOOP § Role boundaries (Reviewer, QA) |
| Brief goes on stdin under OS `--sandbox read-only`; recipe is `docs/CODEX_REVIEW_QA_RECIPE.md` | REVIEW_CHECKLIST intro |
| Claude subagents are `Read/Grep/Glob` only, with no OS cell; the hard OS boundary applies only on the codex path | REVIEW_CHECKLIST intro; LOOP § Role boundaries |
| Roles report only: they do not fix, stage, commit or push | REVIEW_CHECKLIST intro |
| Routing and ticket-brief contract live in WORKFLOW; native mapping is LOOP | REVIEW_CHECKLIST intro; LOOP header |
| Plan readiness: for durable R2 and all R3, the Reviewer does ONE read-only pass over the plan folder before execution approval | REVIEW_CHECKLIST § Plan readiness; WORKFLOW § Plan readiness review |
| The pass runs on the plan row of the audit table (`/pnp:roles`) | WORKFLOW § Plan readiness review |
| Pass 1 rides the plan's standing word | WORKFLOW § Plan readiness review (Pass economy) |
| Pass 2 only on the operator's explicit word, and only if pass 1 had a BLOCKER reversing a recorded decision or the COO names a risk after a substantive revision | WORKFLOW § Plan readiness review (Pass economy) |
| `review.plan.passes` is the ceiling | WORKFLOW § Plan readiness review (Pass economy) |
| Planner and COO never approve their own plan | WORKFLOW § Plan readiness review |
| No fact-check agent before a plan pass; the mechanical plan gate guards it | WORKFLOW § The COO write boundary; § Plan readiness review |
| Read the complete folder against the tree | REVIEW_CHECKLIST § Plan readiness; WORKFLOW § Plan readiness review |
| Check only: plan matches repo | WORKFLOW § Plan readiness review (check 1) |
| Check only: clear scope | WORKFLOW (check 2) |
| Check only: no hidden discovery or unresolved architecture; for every write, the lock and what runs beside it (class 15) | WORKFLOW (check 3); REVIEW_CHECKLIST § Plan readiness |
| Check only: work sequenced executably | WORKFLOW (check 4) |
| Check only: real acceptance and verification | WORKFLOW (check 5) |
| Check only: valid branch, worktree and Git prerequisites | WORKFLOW (check 6) |
| Checks follow the classes of `docs/READINESS_CLASSES.md` | REVIEW_CHECKLIST § Plan readiness |
| A BLOCKER is a required missing property plus evidence (`file:line`, opened) | REVIEW_CHECKLIST § Plan readiness (blocker contract) |
| INFO never causes a revision | REVIEW_CHECKLIST § Plan readiness (blocker contract) |
| Out of scope: wording, formatting, `file:line` precision in explaining context, the operator's recorded design choices; the hint is never the finding | REVIEW_CHECKLIST § Plan readiness (blocker contract) |
| Output is one findings table `\| id \| class \| property the plan must have \| evidence \| hint \|` plus one `BLOCKERS: <n> INFO: <m>` line, nothing else | REVIEW_CHECKLIST § Plan readiness (blocker contract) |
| Pass 2 adds `CLOSED: <k> OPEN: <j>` | REVIEW_CHECKLIST § Plan readiness (blocker contract) |
| Do not require a universal DoR/DoD, create an audit document, or review formatting for its own sake | REVIEW_CHECKLIST § Plan readiness (blocker contract) |
| Every R2/R3 brief gives a risk threshold: block at or above it, record anything below as a non-blocking note | REVIEW_CHECKLIST § Given per brief |
| Every R2/R3 brief gives a stop condition | REVIEW_CHECKLIST § Given per brief; WORKFLOW § Ticket brief contract |
| No obligation to invent findings; no defects at the threshold is a valid `pass`; stop when the stop condition is met | REVIEW_CHECKLIST § Given per brief |
| Implementation loop capped at `loop.correctionRoundsCap`; plan readiness has its own pass economy | REVIEW_CHECKLIST § Given per brief; WORKFLOW § Loop shape |
| Reviewer priority order: correctness, security/tenant isolation, product boundary, missing tests, stale docs; style secondary | REVIEW_CHECKLIST § Reviewer |
| Product-boundary slot is `review.productBoundaryChecks` (empty by default); if empty there is no boundary to enforce and the order is unchanged | REVIEW_CHECKLIST § Reviewer |
| Read the actual diff, not the summary; do not accept optimistic prose | REVIEW_CHECKLIST § Reviewer |
| Trace the ordered chain from entry to end point through the Code Map files, adversarially, and still read the whole diff | REVIEW_CHECKLIST § Reviewer |
| Every acceptance criterion maps to a proof; a missing proof surface is a completion blocker even with green tests | REVIEW_CHECKLIST § Reviewer |
| Algorithmic/matcher/routing/transform/parser proof MUST exercise the production function or an extracted helper | REVIEW_CHECKLIST § Reviewer |
| Assertions must be unconditional; reject `expect()` inside an `if` and assertions that cannot fail | REVIEW_CHECKLIST § Reviewer |
| A runtime check gated only behind an optional flag/param/shape and skipped on the default path is incomplete | REVIEW_CHECKLIST § Reviewer |
| Tenancy/security/i18n bullet (tenant key, access policy, no server code in client, no hardcoded user-facing text, migrations) | REVIEW_CHECKLIST § Reviewer |
| The Reviewer does not reproduce runtime behavior; that is QA's job | REVIEW_CHECKLIST § Reviewer |
| Read the diff against each defect class and group findings by class | REVIEW_CHECKLIST § Review dimensions |
| Regression & back-compat: the three bullets | REVIEW_CHECKLIST § Regression & back-compat |
| State & data safety: the three bullets | REVIEW_CHECKLIST § State & data safety |
| Logic & contract: the nine bullets | REVIEW_CHECKLIST § Logic & contract |
| UI & runtime: the nine bullets | REVIEW_CHECKLIST § UI & runtime |
| Persistence & consistency: the four bullets | REVIEW_CHECKLIST § Persistence & consistency |
| Tenancy: cross-tenant leak via template/profile/row reuse | REVIEW_CHECKLIST § Tenancy |
| Scope integrity: the two bullets | REVIEW_CHECKLIST § Scope integrity |
| Verify truthfulness: the three bullets | REVIEW_CHECKLIST § Verify truthfulness |
| Proof adequacy: the three bullets | REVIEW_CHECKLIST § Proof adequacy |
| Test quality: the five bullets | REVIEW_CHECKLIST § Test quality |
| Runtime crash, typecheck failure or in-scope assertion failure is a completion blocker; `pass` with "fix later" is forbidden | REVIEW_CHECKLIST § Verdict discipline |
| Four invalid partial completions | REVIEW_CHECKLIST § Verdict discipline |
| i18n carve-out for internal-only diagnostic strings | REVIEW_CHECKLIST § Verdict discipline |
| On zero findings, state "No findings" and list residual risks and testing gaps | REVIEW_CHECKLIST § Verdict discipline |
| Severity scale P1/P2/P3; one-line "why not minor polish"; thresholds reference the scale | REVIEW_CHECKLIST § Severity scale |
| Routing note: the three mappings | REVIEW_CHECKLIST § Routing note |
| QA engages only for declared observable runtime/UI behavior | REVIEW_CHECKLIST § QA |
| QA verifies what the software DOES against acceptance criteria, not code style | REVIEW_CHECKLIST § QA |
| QA is an artifact judge: never drives a browser, never starts a dev server | REVIEW_CHECKLIST § QA; LOOP § Role boundaries (QA) |
| Spec-flow: Writer authors the E2E `.spec`, the orchestrator runs the runner, QA reads the artifacts | LOOP § Role boundaries (QA) |
| A Codex-launched browser cannot run under the read-only sandbox (`docs/QA_BROWSER_INVESTIGATION.md`) | LOOP § Role boundaries (QA) |
| Codex host QA read under a hard OS cell; claude host QA read-only by allowlist + Gate 1, no OS cell | LOOP § Role boundaries (Reviewer; QA "same boundary per host") |
| QAL is a separate operator-gated surface, NOT read-only; never invoke it from the QA role | REVIEW_CHECKLIST § QA |
| Never claim PASS without a real reproduction backed by concrete artifact evidence | REVIEW_CHECKLIST § QA |
| No usable artifacts: report `BLOCKED` as a precondition; never to defer a defect | REVIEW_CHECKLIST § QA |
| On `fail`, list ALL already-visible material blockers in the same round; define material blocker | REVIEW_CHECKLIST § Fail aggregation |
| Do not serialize fail reasons; a later round may not raise an already-visible blocker | REVIEW_CHECKLIST § Fail aggregation; WORKFLOW § Fail aggregation |
| For each blocker name the exact failing surface, require proof on it, forbid proxy closure | REVIEW_CHECKLIST § Fail aggregation |
| Pass 2 is handed the previous list (`round-1.md` verbatim; previous blockers after a correction round) | REVIEW_CHECKLIST § Fail aggregation (pointer); WORKFLOW § Fail aggregation |
| Every NEW blocker declares why it was not visible before; none is a contract violation reported separately | REVIEW_CHECKLIST § Fail aggregation; WORKFLOW § Fail aggregation |
| Name the origin in one clause | REVIEW_CHECKLIST § Fail aggregation |
| Brief without the previous list: say so as a precondition and review anyway | REVIEW_CHECKLIST § Fail aggregation |
| Verdict is exactly one of `pass`, `pass-with-notes`, `fail` | REVIEW_CHECKLIST § Verdict |
| Order: blockers, notes, exact next action; return to the COO | REVIEW_CHECKLIST § Verdict |
| Never declare a patch accepted while proof is missing, a blocker remains, docs contradict, a boundary is assumed, or a failure ignored | REVIEW_CHECKLIST § Verdict |

Stories dropped (as returned): the gate mechanics behind the Claude subagent's read-only boundary
(restated in LOOP); the explanation of how a plan pass is guarded (pointer to WORKFLOW); the longer
Codex browser/sandbox narrative (pointer); the description of what each pass-2 brief carries (moved
to WORKFLOW § Fail aggregation). The agent flagged "requested before the dispatch" as implied only;
the COO restored it in WORKFLOW § The operator does not arbitrate engineering decisions ("asked for
before the dispatch").

rules: 75 homeless: 0
