# AIWF Workflow

Active authority for how AI work is routed and executed. Paired with your project's
**overrides document** (identity + hard rules; its path is `paths.overridesDoc` in
`aiwf.config.json`) and `docs/REVIEW_CHECKLIST.md` (Reviewer/QA verdict rules).

Durable knowledge lives in Git. Live process state (delegation, review rounds, correction
cycles) lives in the in-session orchestration of the main Claude Code session - not in
Markdown state files and not in an external runtime.

The proven model is a light four-role loop: **Orchestrator -> Implementer -> Code Reviewer ->
QA**, run **natively inside Claude Code** (one-page mapping: `docs/LOOP.md`). A project may
run it deliberately lighter than the generic four-role defaults (see "Loop shape and its
overrides") - not every ticket is a ceremony.

## Roles

- **COO / Orchestrator** - the **main Claude Code session**. Accepts the goal, reads product
  authority, classifies R1/R2/R3, authors the ticket brief (with risk threshold + stop
  condition), delegates, reads the full diff, makes product/UI judgment, arbitrates, stops the
  loop at the stop condition, and is the only AI role that presents the final result to the
  human. It does not write implementation code in the R2/R3 cycle.
- **Writer / Implementer** - the **only** role that writes to the repo. A native Claude
  subagent (`.claude/agents/writer.md`, rendered from the plugin's writer template), invoked
  via the **Agent tool** with `subagent_type: "writer"`. Does not approve its own work.
  (Gate 1, the plugin's PreToolUse mutation guard, catches the Edit/Write family so non-writer
  subagents cannot write - and on a Claude review host this tool-availability + convention
  block is the read-only boundary itself, with no OS cell (the OS cell is codex-only); the main
  session *can* write - R1 requires it - so the COO's not writing implementation code in the
  R2/R3 cycle is doctrine, not a hook. Gate 2, the dispatch gate, turns every Writer dispatch
  into a native Yes/No dialog.)
- **Reviewer / Code Reviewer** - read-only adversarial code/design review; not browser QA.
  **Engine-neutral**: the host is data in the project's `.claude/aiwf-native/roles.json`
  (resolved by the plugin's `scripts/native/ps/aiwf-roles.ps1`), so `/pnp:review` dispatches
  either the read-only Codex wrapper `scripts/native/ps/codex-review.ps1` (`--sandbox
  read-only`, prompt via stdin) **or** the `reviewer` Claude subagent (`Read/Grep/Glob` only).
  On the codex host the read-only boundary is a hard OS cell; on the claude host Gate 1 catches
  the Edit/Write family (tool-availability + convention + git reversibility, no OS cell).
- **QA** - read-only; verifies real runtime/UI behavior against acceptance criteria; engages
  only for observable runtime/UI behavior. An **artifact judge**, not a live browser: the Writer
  authors an E2E `.spec`, the orchestrator runs the configured test runner, and QA reads the
  artifacts (report/screenshots/traces). **Engine-neutral**: `/pnp:qa` dispatches either
  `scripts/native/ps/codex-qa.ps1` (`--sandbox read-only`) **or** the `qa` Claude subagent
  (`Read/Grep/Glob` only); never starts a dev server, never drives a browser. (A Codex-launched
  browser cannot run under the read-only sandbox - see `docs/QA_BROWSER_INVESTIGATION.md`.)
- **QAL** - live agentic-browser Codex via `/pnp:qal` (wraps
  `scripts/native/ps/codex-qal.ps1`). The **operator-gated exception**, invoked only after an
  explicit operator request, and only when `roles.qal.enabled` is true; runs **without an OS
  sandbox** (containment is cwd/profile hygiene, not a guarantee). Not part of the default
  route - read-only QA is the default.
- **Operator** - the human. Sole authority for commit approval, push, merge, branch switches,
  and destructive or system-changing operations.

## COO owns broad scans

The Writer has no Agent tool and an expensive context. When the Writer returns a scan question -
blocking mid-ticket or confirming in the handoff - the COO runs it with cheap read-only scan
agents in its own session and returns the answer. A scan question is correct behavior, not a
failure; the defect is a Writer that silently assumed. Delegation taxonomy - **trigger** to
delegate: 3+ independent files, 2+ verify tracks, or a docs/code/test cross-check.
**Delegable:** grep/inventory, docs/reference checks, i18n scans, test-gap scans, schema/policy
evidence gathering. **Never delegable:** the final architecture decision, the final
code-integration decision, and the final synthesis/handoff - those the COO owns and does not
delegate.

**Discovery precedes dispatch.** The reactive form above - answering the Writer's scan
questions - is not the whole rule. When the delegation triggers are met, the COO runs the
cheap-agent discovery BEFORE authoring the R2/R3 brief, and the brief carries the harvested
evidence: a concrete worklist with `file:line` pointers, not reading assignments. The Writer's
expensive context is spent on writing, not searching; a Writer that must scan broadly to learn
WHAT to change is the symptom of a defective brief, not of diligence. A single Writer run has
been observed spending on the order of a full session's context budget on discovery that a
pre-brief scan pass would have delivered at scan-tier cost.

**Model policy for ad-hoc subagents:** always pass an explicit `model` to the Agent tool - never
inherit the session model silently. `haiku` for purely mechanical scans (existence/counts, grep
inventory, reference sweeps; mind its smaller context); `sonnet` for evidence gathering with
judgment (coverage comparisons, harvest-type scans) - the default scan tier. The top-tier
session model is never delegated for scans; synthesis and audit decisions stay with the COO
regardless of tier. On contradiction or uncertainty in a cheap scan's result, the COO verifies
directly or re-dispatches one tier up. The pinned loop roles (Writer frontmatter, Reviewer/QA
via `roles.json`) are unaffected by this policy.

**Role dispatch is physical, never simulated:** the R2/R3 loop roles (Writer, Reviewer, QA) are
ALWAYS dispatched as real subagents (Agent tool / the `/pnp:*` skills) - the main session
"performing" a role's work inline is a route violation equivalent to a failed review, even when
the output looks complete. Rationale: some harness builds carry a built-in nudge against
subagent use; this doctrine's explicit dispatch requirement IS the user request, and a silent
inline substitution would produce a non-blind review that defeats the independent-audit
guarantee.

## The COO write boundary runs along artifact class, not size

Docs class (`docs/**`, PLAN sections, README, comments without code) - the COO edits directly.
Code class (anything under an app/package source tree that compiles, is imported, or is tested)
- goes to the Writer, even a single line; one-line code changes are exactly the ones that break
silently, and "mechanical, no logic" is self-assessed by the party that wants to skip the gate.
The mechanism for code-class notes is a micro-round to the **live** Writer, not a fresh spawn -
the warm context is an order of magnitude cheaper. If the Writer session has died, you spawn and
pay; that is the price of the audit trail right before the commit gate. Every direct COO edit is
announced explicitly in the commit summary.

**COO-authored text is reviewed like the Writer's:** when a ticket has a Reviewer pass, that
text must already be in the tree when the pass is dispatched - the review covers the whole diff,
not the Writer's half of it. Blockers cluster precisely where COO-written prose escaped a pass.

## The operator does not arbitrate engineering decisions

Scope structuring, brief content, technical sequencing, and what-lands-in-which-ticket (within
an approved plan) are the COO's calls - decided and REPORTED with a one-line rationale, not
offered as questions. The operator's gates are exactly: the commit/push word, expensive-quota
passes (e.g. a paid external review engine), destructive or system-changing operations, and
product/UX choices (what the user sees or loses as functionality). A question outside those
gates blocks the operator without adding value - asking it is a workflow defect, not politeness.

### How the COO speaks to the operator

Deciding well is not enough; the report has to land.

1. **Plainly.** Answer the question and stop. One decision, one line; numbers and names rather
   than categories. The abstract vocabulary the COO thinks in - debt / blocker / follow-up /
   trade-off - is not the operator's, and the translation layer the COO skips is paid for in the
   operator's confusion.
2. **Invent no debts and no follow-up tickets.** A mission does not close while any debt stands,
   so a manufactured follow-up literally defers the closeout and reframes finished work as
   unfinished. Closing a ticket, ask whether the thing blocks anything real; if not, say
   "closed" - and leave no "follow-up ticket" wording in the canon or the PLAN, because the next
   session will read it and open one for nothing.
3. **Do not reverse under tone.** After a sharp operator reaction, separate two things: am I
   wrong on the substance, or only in the wording? Correct exactly that and restate the rest
   calmly. Judgements that move with the operator's tone are worth nothing, including the ones
   that happen to be right.

## Operator-interaction guards

Five rules, promoted into Git so they travel with the repo: doctrine in prose did not survive a
change of COO model, and each of these was learned from an observed violation.

- **(a) Stop semantics.** An operator stop/interrupt freezes every mutating action. The response
  is exactly three things: (1) a one-line state - the tree, and what is in flight; (2) a proposal
  for how the mess gets cleaned up; (3) waiting for an explicit word. No apology theatre, no
  continuation of the old plan. Continuing without the word repeats the violation itself.
- **(b) Dispatch waits for the word; data is not an order.** A ticket is written and then STOPS;
  starting the work is the operator's call, ticket by ticket - the content of the ticket is not.
  Values and facts the operator supplies are DATA for the ticket, not permission to execute.
  After the word, the loop runs to the end without asking again.
- **(c) Brief constraints are read literally.** An explicit constraint is read literally; a
  "temporary and reverted" violation is still a violation. A loose reading is never
  self-granted - if the COO believes the constraint means something else, it asks the author of
  the constraint (the operator).
- **(d) A demand on the operator only after checking.** An extension of the "a question outside
  those gates" rule above: a DEMAND too (env values, secrets, actions) is raised only after a
  Read/check that the state already present does not cover it. A demand that one Read would have
  cancelled is a workflow defect.
- **(e) An approved plan lands in the repo immediately.** At the moment of approval, in the same
  session, unprompted: the plan is copied to `<plansDir>/active/PLAN_<name>.md` (the Git canon),
  and any plan-mode file outside the repo becomes a pointer to it. The principle "durable
  knowledge lives in Git" already existed; what had never been written down was the mechanical
  moment of approval.

## Verifying failure claims

When a tool or a test fails, first verify the claim about the failure itself - which
environment, which target database or service, what else is touching the same resource - and
read this repository's own documentation for that tool before proposing a cause. Several
consistent observations can describe the environment rather than the code: a live worker polling
the same local database as the gated tests will produce a stable, entirely misleading failure
signature, and a day can go into the wrong explanations before anyone states the environment
explicitly.

**VERIFY honesty.** Run every VERIFY command literally and record the exact exit code - a
claimed "exit 0" is not authority, the actual run is. If VERIFY fails for an environment reason
(corrupted state, missing test data, stale path, unavailable service), STOP and ask the
operator; never silently fix the environment and report a pass.

## Loop shape and its overrides

The loop's *shape* is project-configurable; the *gates* are not.

Configurable, and documented in your project's overrides document (`paths.overridesDoc`) - the
defaults the plugin seeds there are: one reviewer rather than two; a correction-round cap of
`loop.correctionRoundsCap` (factory default 2) instead of the generic low-4 / medium-8 /
high-12 caps; R1 uses no orchestration loop; QA is conditional (only when a brief declares
observable runtime/UI behavior, never in R1 or non-runtime R2).

Not configurable, and enforced here regardless of the project:

- **Only the operator lifts the correction-round cap.** After the cap without a passable result,
  stop and summarize to the operator. A round beyond the cap requires an explicit word in chat
  *before* the re-dispatch, granted one extension at a time and recorded in the ticket's PLAN
  entry.
- Plan readiness keeps its own two-pass contract (below), independent of the correction cap.
- The risk threshold and the stop condition are mandatory in every R2/R3 brief.

## Planning lock

`/plan` and any explicit request to plan before implementation activate a planning-only lock at
the orchestration level. Native Claude Plan Mode is useful but is not by itself the authority:
it is local to one CLI session and does not constrain the Writer subagent or the Codex
review/QA runs. The planning lock is doctrine that binds every role in the loop.

While locked, the COO may read files, inspect Git state, research, compare options, and present
a concrete plan. It may also update its own agent-local memory to retain user corrections or
preferences; these memory updates need no separate approval and are not project workflow
authority.

Until the concrete plan is presented and the operator explicitly approves its execution, the COO
must not:

- dispatch or advance an **implementation** brief for execution, or mutate the Git-tracked PLAN -
  these wait for execution approval. Composing the concrete draft plan and a read-only
  plan-readiness brief (each carrying its risk threshold + stop condition) is **explicitly
  permitted** by the readiness exception below;
- delegate to the Writer subagent, QA, or another implementation run;
- edit the repository, agent/tooling configuration, or other project state;
- stage, commit, switch/create branches, merge, push, or perform another Git mutation.

The sole orchestration exception is a read-only plan-readiness review by the Reviewer - run
through the **plan-readiness mode of `/pnp:review`** (the `PASS`/`NEEDS-FIX`, two-pass branch)
under the rules below. It does not release the planning lock or authorize implementation.

Selecting an option (for example `A`, `B`, or `C`) chooses direction and refines the plan; it is
not by itself approval to execute. Execution approval applies to the presented plan only.
Commit, merge, push, destructive, and system-changing gates remain separate. Entering or leaving
plan mode does not replace these human authority rules.

## Plan readiness review

Plans for durable R2 work and all R3 work receive an independent read-only review before the COO
presents the final plan for execution approval. Small R1 and non-durable R2 work do not receive
this ceremony. The Planner/COO may not approve its own plan.

Once the COO has a concrete draft, it starts this readiness review automatically; no intermediate
human permission is required. The COO also owns routine engineering choices such as
policy-required tests, file/directory naming, local module boundaries, and step sequencing. It
asks the operator before readiness only when missing authority or an unresolved alternative would
materially change product intent, an architecture boundary, security/external risk or cost, or an
irreversible outcome and cannot be resolved from the repo.

The same Reviewer performs a minimum of two full passes:

1. adversarially review the complete draft and return all visible material gaps at once;
2. after the COO revises the plan, review the complete plan again - not only the changed lines.

If blockers remain after pass two, the COO may revise once more and - only with the **operator's
explicit permission**, requested before dispatch - run one final third pass. Any review pass
beyond the standard two is a budget/limits-gated operator decision regardless of the engine
hosting the Reviewer. Three passes are the hard maximum; if the plan still does not pass, stop
and return the unresolved blockers to the operator. Each pass returns only `PASS` or `NEEDS-FIX`
with concise, actionable blockers (this is the plan-readiness branch of `/pnp:review`, distinct
from the implementation `pass`/`pass-with-notes`/`fail` verdict). No separate audit backlog,
handoff file, narrative report, universal DoR, or universal DoD is created.

The readiness review checks only:

1. the plan matches the actual repository state;
2. scope and out-of-scope boundaries are clear;
3. no hidden discovery or unresolved architectural decision remains;
4. tickets/steps are executable in the correct dependency order;
5. acceptance criteria and verification commands are real and sufficient;
6. branch, worktree, and Git prerequisites are valid.

The readiness review is live orchestration state only, not a Git document. The approved plan
remains the durable Git authority after the operator approves execution.

## Ticket brief contract (R2/R3)

No heavy schema or template. Each R2/R3 ticket brief - the delegation the COO hands to the Writer
subagent and the Reviewer/QA - is tagged `[R1]`/`[R2]`/`[R3]` and contains, compactly:

```text
Outcome            - what the finished work delivers
Scope / out of scope
Acceptance criteria - testable
Risk threshold     - which defect severity blocks (given to Reviewer/QA)
Stop condition     - when Reviewer/QA have enough evidence and must stop
Verify policy      - checks/proof required, by risk
Assignee
Working branch     - only when different from the default integration branch
```

`Risk threshold` and `Stop condition` are mandatory for every R2/R3 brief: without them
Reviewer/QA can loop forever.

Every Writer brief additionally carries the ticket ref on a **line of its own**, `Ticket: <REF>` -
the machine-readable form of the ref the contract already requires. Gate 2 raises a native
Yes/No dialog on every Writer dispatch, so a dispatch that cannot name a ticket is exactly the
accident worth one operator click.

At the same moment - dispatch of an R2/R3 ticket - the COO writes the **route state**, the
gitignored `.aiwf/route-state.json`, as `{ "ticket": "<REF>", "route": "R2"|"R3" }`, and on
closing the ticket clears it by writing `{}`. While that file names an R2/R3 route, **Gate 3**
(the route-state guard inside the Gate 1 hook) lets the **main session** write only `docs/**`,
`.aiwf/**` and root-level `*.md`; anything else is denied with a message naming the open ticket,
because code-class work belongs to the Writer while a ticket is open. With no state file - or
with the cleared `{}` - behaviour is exactly what it was before, so R1 work is untouched, and the
Writer is never affected in either case. A present-but-unusable state (a route that is not
R2/R3, a non-string route, malformed JSON) denies by design, and is self-healing because
`.aiwf/**` stays writable. Two honest limits, stated in the same breath: the guard covers the
**Edit/Write tool class only**, so a main-session mutation performed through a shell command is
not caught and remains doctrine; and it only bites if the COO actually writes the file at
dispatch - a convention, not an enforcement. The paths and the state-file location are fixed in
v0.1; the `enforcement.routeWriteGuard` toggle that makes the guard configurable arrives with the
config layer.

Four brief-authoring failures each cost a correction round:

- **State the end state, not the edit.** "A reader cannot reach step X without having established
  the prerequisite" is checkable; "add the version constraint" is not - and it can land *after*
  the step it was meant to guard.
- **Verify an inherited fact before it enters a brief.** A number or claim copied from the PLAN
  or another doc is not evidence. A loose sentence in a plan can pass through a brief and ship as
  a false statement in a runbook.
- **Walk any path a human executes** (runbook, setup, migration sequence) end to end yourself
  before briefing it. A runbook has been briefed as correct while one of its steps carried no
  command at all.
- **A factual claim about existing code carries a `file:line` pointer** - or is marked explicitly
  unverified, for the Writer to check. A claim dictated from memory of the design instead of read
  from the source comes back as a review blocker; a brief that instructs the Writer to read the
  source before writing any factual claim produces zero factual errors.

Briefs, micro-rounds, and verdict contracts between the COO and the subagents are written in
**plain engineering English** - the operator does not read agent-to-agent traffic, and another
language between agents risks ambiguity and lost-in-translation on technical wording. The
operator-channel language (`operator.language`) applies only to the COO <-> operator
conversation.

### Proof-surface feasibility (checked at brief-authoring / readiness time)

Every proof a brief requires must be observable through a real, in-scope surface; an infeasible
proof is a **readiness blocker**, not an execution-time note:

- **End-to-end (browser) proof** requires evidence visible in the DOM, network, a browser-visible
  state, permitted DB evidence, or explicitly authored response metadata. Reject a server-stdout
  requirement unless an explicit bridge is part of the ticket scope.
- **Unit proof** must be observable through the named production module or an explicitly authored
  test helper.
- **Every verify command's** path/project/flags must match the repo's configured test discovery.
- Proof requiring DB access, response metadata, or runtime state needs the access path stated
  explicitly in scope.
- **A verify command must be able to fail.** If you cannot name the output that would mean
  "broken", it is not a check. A grep that silently matches nothing has manufactured a false pass
  that survived to review; byte-level facts are counted at byte level.

### Out-of-scope failures found during work

Out-of-scope pre-existing failures, stale tests, or build blockers discovered during work are
recorded as risks in the report - never silently dropped, never silently fixed.

## Durable development history

The in-session orchestration owns live execution state; it does not replace the Git-tracked
history that future agents and collaborators need to understand why the code exists.

A durable record is required when work is multi-session, changes architecture,
migrations/security/access policy, or important domain behavior, or is likely to need future
code-level explanation. Small R1/R2 fixes do not receive an artificial document.

Every durable initiative uses **one living Mission PLAN**, including when it has multiple
tickets. Do not create a separate active BACKLOG file. The PLAN keeps:

1. product/problem context and repository reality discovered during planning;
2. mission goal, scope/out-of-scope, architecture boundaries, decisions, and rejected
   alternatives that matter later;
3. an executable ticket ledger: stable Ticket Ref, context/problem, outcome, scope, dependencies,
   affected areas, acceptance criteria, and verification;
4. after each ticket is accepted, its durable completion record: actual changes, material
   decisions/deviations, verification results, Reviewer/QA conclusion, commit hash, and remaining
   debt. The COO writes this record **immediately after the ticket's commit, in the same session,
   unprompted** - a ticket is not closed without it, and tracking it is never the operator's job.
   **A number describing the state of the system is measured or it is not stated:** anything a
   reader may rely on as a current fact and regress against - tests passed or skipped, timings,
   sizes, coverage, benchmark results - carries the command that produced it or does not go in at
   all, and arithmetic over two real measurements is not a measurement. Numbers describing the
   history of the work - blockers in a review round, observations across sessions, correction
   rounds - are narrative anchored to the ticket record rather than facts about the code, and are
   not covered; nor are identifiers, versions, dates, line references and design constants.
   Refusing to write an unmeasured number into the canon is the Writer doing its job;
5. the final Mission outcome and next durable follow-up. **Write a closeout ticket in two
   separable halves.** The durable half - platform canon, factual corrections, anything true
   whether or not the mission ends - is worth landing on its own. The irreversible half - the
   `CHANGELOG.md` release block, the version bump and its tag - is kept apart, so a mission that
   turns out not to be closing costs nothing. A closeout scoped and executed as a single unit has
   had to be split mid-flight, with the version bump reverted, when the live product was
   exercised and found defective.

**A plan that is 100% executed is archived immediately.** The moment every ticket in a PLAN
carries a closed status and its completion record, the COO moves the file from
`<plansDir>/active/` to `<plansDir>/archive/` - in the same session, unprompted, as the last act
of closing the final ticket, not as a step someone has to remember later. The archive has a
naming convention the active directory does not: `<NNN>_PLAN_<TOPIC>_<YYYY-MM-DD>.md`, where
`NNN` is the next free sequence number and the date is the day of ARCHIVING, not of creation.
`git mv` preserves the history; a bare copy of the active filename does not belong there.

This is the mirror image of guard (e) above: (e) fixes the mechanical moment a plan ENTERS the
repo, this fixes the moment it LEAVES the active set. Both had to be asked for, and for the same
reason - the principle was written down while the moment was not. The trigger is the checkable
fact - every ticket closed, every verify green - never a feeling that the work is finished.
Archiving is bookkeeping and reversible with one `git mv` back, which is why it is deliberately
NOT part of the irreversible half above; the release block, the version bump and the tag stay
gated exactly as before.

Do not copy raw orchestration conversation, assignee/status changes, or review rounds into the
PLAN. Preserve accepted engineering context, not runtime noise.

Use the configured paths (`paths.plansDir`):

```text
<plansDir>/active/PLAN_<TOPIC>.md
<plansDir>/archive/
```

The approved PLAN is written to Git only after the planning lock is released - and then
immediately, by the COO itself (docs class, per the write boundary above and guard (e)), before
production-code changes begin. Rough personal notes are inputs, never implementation authority.
When a durable record is warranted:

- assign stable Ticket Refs such as `ABC-001`;
- choose a Ticket Ref whose prefix identifies the actual product/workstream; do not reuse an
  unrelated migration or technology prefix merely because it is available;
- the durable ledger is the living Mission PLAN itself - there is no separate runtime work-item
  store;
- carry the Ticket Ref, PLAN path, and ticket-section anchor in the brief the COO hands the
  Writer, instead of copying the plan into it;
- use the stable Ticket Ref in commit bodies (`Refs: ABC-001`) and in code comments only when it
  preserves a non-obvious architectural, compatibility, security, or domain reason.

Do not update Markdown for assignee changes, review rounds, or other live events. Update the
relevant ticket section once after that ticket is accepted, then update the Mission closeout once
and archive the PLAN.

## Routes

### R1 - routine

Direct work in the main Claude Code session. No subagents, no Reviewer, no QA.

**An executable artifact ends R1.** The moment a ticket scoped as docs-only gains an executable
artifact - a script, a hook, anything that runs - it is re-classified and takes the code loop,
Writer and Reviewer included. A "closeout docs, no code" ticket that gained a shell launcher was
still producing blockers in the final review pass; under R1 that launcher would have had no
Reviewer at all.

### R2 - product

- **Non-runtime:** `COO -> Writer subagent -> /pnp:review -> COO`.
- **Runtime/UI (observable behavior):** `COO -> Writer subagent -> /pnp:review -> /pnp:qa -> COO`.

Correction rounds are capped (see "Loop shape and its overrides"). Local commit after the loop
passes and a human approves (the commit `ask` dialog - see Commit & Push Authority).

### R3 - critical (migrations / access policy / auth / destructive / push)

`COO-approved mini-plan + plan-readiness review (before Writer starts) -> Writer subagent on
r3/<topic> -> /pnp:review -> /pnp:qa (when there is observable/runtime behavior) -> COO synthesis
-> operator commit/merge gate`. Push always requires the operator's explicit word and is executed
via the `ask` dialog.

R3 always uses the full ticket-brief contract. It also uses the durable Mission PLAN when the
work crosses the durable-history threshold above. Durable decisions go to a short ADR when
warranted.

## Branch policy

`project.defaultBranch` is the default integration/base branch, not the only allowed working
branch. R1/R2 may work directly on it or on a short-lived `feature/<topic>`, `fix/<topic>`,
`experiment/<topic>`, or `spike/<topic>` branch. R3 defaults to `r3/<topic>`. A non-default
working branch is declared in the brief or directly by the operator.

The agent works on whichever branch is currently checked out in the project root; it does not
impose a branch of its own. Check branch and dirty state before work. If pre-existing dirty or
untracked files are outside the planned task, do not propose branch creation/switching as an
immediate execution step and do not carry those files into the task branch. State the
prerequisite instead: finish or checkpoint the current scope first, or use a separate clean
worktree explicitly provided by the operator. Never stash, clean, reset, or otherwise hide that
state. Merge and push run only on the operator's explicit word, through the `ask` dialog.

## Fail aggregation

Reviewer and QA must return ALL visible material problems in a single round - not one problem per
cycle. A later round may not raise a blocker that was already visible earlier.

## Tests

Test policy has a single home in your project - the standard named in your overrides document
(`paths.overridesDoc`), and the concrete commands live in `verify.commands` and `verify.e2e` in
`aiwf.config.json`. Tests are part of implementation, not polish.

## Status / release docs policy

Your project's status and release artifacts (a project-status page, `CHANGELOG.md`, a roadmap -
whichever of these exist) are named in the overrides document. The rules the plugin applies to
them:

- they are evaluated only **after a DONE product ticket**;
- docs-only analysis / inventory / audit / backlog work MUST NOT touch them;
- a roadmap-class document is updated only by exception (accepted priority, milestone, or
  direction change) - not as a default checkpoint artifact.

## Commit & Push Authority

- **Commit:** Writer only, local only, after the review route passes AND a human explicitly
  approves. The approval is a native Claude Code visual Yes/No dialog - `Bash(git commit:*)` is
  an `ask` rule in the project's `.claude/settings.json`; the operator clicks **Yes** and types
  nothing (no approval token, no state file). No automatic commits.
- **Push / merge / rebase:** executed from the session **only after the operator's explicit
  word** in chat, and each additionally surfaces a native `ask` dialog (Yes/No) as the second
  gate - `Bash(git push:*)` / `merge` / `rebase` (and the `git.exe` and
  `git -C <projectRoot>` variants) are `ask` rules. They are deliberately **not** `deny`-blocked:
  the operator does not drive git manually, so the agent must be able to run these itself, gated
  by the dialog plus the explicit-word doctrine.
- Destructive/system-changing commands need explicit human confirmation immediately before
  execution, even when a brief marks them `MUST` - surfaced as `ask` permission dialogs for
  matching commands (`git reset/clean/rm/checkout/restore/revert/pull/fetch/cherry-pick`,
  database reset/seed scripts, migration tools, containers, recursive delete).

These permission rules are harness-enforced and match by command **prefix**, so they cover the
matching command forms in a normal permission mode; they are accident-grade, not
adversary-proof - see `docs/LOOP.md` for the full honest model.

## Reproducibility

The loop is reproducible from Git plus the plugin payload - no external runtime required:

- **Writer:** `.claude/agents/writer.md` in the project, rendered by `/pnp:setup` from
  `templates/agents/writer.md.tmpl`; invoked via the Agent tool with `subagent_type: "writer"`.
- **Reviewer / QA:** **engine-neutral** - the host per role is data in the project's
  `.claude/aiwf-native/roles.json` (itself rendered from `aiwf.config.json.roles.*`), resolved by
  `scripts/native/ps/aiwf-roles.ps1` (entrypoint `-Role <r> -RolesPath <p> -AsJson`; a missing
  config file falls back to the factory `claude`/`opus`/`high` record). `/pnp:review` and
  `/pnp:qa` dispatch either the read-only Codex wrappers `scripts/native/ps/codex-review.ps1` /
  `scripts/native/ps/codex-qa.ps1` (recipe: `docs/CODEX_REVIEW_QA_RECIPE.md`; needs the Codex
  CLI) **or** the `reviewer` / `qa` Claude subagents (`Read/Grep/Glob` only; read-only by Gate 1
  + tool allowlist). QA is an artifact judge on either host: the orchestrator runs the configured
  E2E runner (which produces the JSON report/traces/screenshots) and QA reads those artifacts
  read-only - QA does not drive a browser. The live-browser tools are used by the operator-gated
  **QAL** (`scripts/native/ps/codex-qal.ps1`, `/pnp:qal`, codex-only), not by QA.
- **Enforcement:** Gate 1 (the PreToolUse mutation guard, which also carries Gate 3, the
  route-state write guard) and Gate 2 (the PreToolUse dispatch gate), both wired through the
  plugin's `hooks/hooks.json` - two hook files, three responsibilities - plus the declarative `ask`
  permission rules merged into the project's `.claude/settings.json` from
  `templates/settings.ask-ruleset.json`.
- **One-page native mapping:** `docs/LOOP.md`. Regression: the selfcheck engine under
  `scripts/selfcheck/`.

No adapter framework, no lifecycle wrapper, no runtime state in Git.
