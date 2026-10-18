# AIWF Workflow

Active authority for how AI work is routed and executed. Paired with your project's
**overrides document** (identity + hard rules; its path is `paths.overridesDoc` in
`aiwf.config.json`) and `docs/REVIEW_CHECKLIST.md` (Reviewer/QA verdict rules).

Durable knowledge lives in Git. Live process state (delegation, review rounds, correction
cycles) lives in the in-session orchestration of the main Claude Code session - not in
Markdown state files and not in an external runtime.

The model is a light four-role loop: **Orchestrator -> Implementer -> Code Reviewer -> QA**, run
**natively inside Claude Code** (one-page mapping: `docs/LOOP.md`). A project may run it lighter
than the generic defaults (see "Loop shape and its overrides").

## Roles

- **COO / Orchestrator** - the **main Claude Code session**. Accepts the goal, reads product
  authority, classifies R1/R2/R3, authors the ticket brief (with risk threshold + stop
  condition), delegates, reads the full diff, makes product/UI judgment, arbitrates, stops the
  loop at the stop condition, and is the only AI role that presents the final result to the
  human. It does not write implementation code in the R2/R3 cycle - doctrine, not a hook: the
  main session can write, because R1 requires it.
- **Writer / Implementer** - the **only** role that writes to the repo. A native Claude
  subagent (`.claude/agents/writer.md`), invoked via the **Agent tool** with
  `subagent_type: "writer"`. Does not approve its own work. The gates around it (Gate 1-4):
  `docs/LOOP.md` § Enforcement of Writer-only writes.
- **Reviewer / Code Reviewer** - read-only adversarial code/design review; not browser QA.
  **Engine-neutral** (Codex or Claude per the project's `.claude/aiwf-native/roles.json`; hosts,
  wrappers and boundaries: `docs/LOOP.md` § Role boundaries).
- **QA** - read-only; verifies real runtime/UI behavior against acceptance criteria; engages
  only for observable runtime/UI behavior. An **artifact judge**, not a live browser;
  engine-neutral (`docs/LOOP.md` § Role boundaries).
- **QAL** - live agentic-browser Codex via `/pnp:qal`. The **operator-gated exception**, invoked
  only after an explicit operator request and only when `roles.qal.enabled` is true; runs
  **without an OS sandbox**. Not part of the default route.
- **Operator** - the human. Sole authority for commit approval, push, merge, branch switches,
  and destructive or system-changing operations.

## COO owns broad scans

When the Writer returns a scan question - blocking mid-ticket or confirming in the handoff - the
COO runs it with cheap read-only scan agents in its own session and returns the answer. A scan
question is correct behavior; a Writer that silently assumed is the defect. **Trigger** to
delegate: 3+ independent files, 2+ verify tracks, or a docs/code/test cross-check.
**Delegable:** grep/inventory, docs/reference checks, i18n scans, test-gap scans, schema/policy
evidence gathering. **Never delegable:** the final architecture decision, the final
code-integration decision, and the final synthesis/handoff.

**Discovery precedes dispatch.** When the delegation triggers are met, the COO runs the cheap-agent
discovery BEFORE authoring the R2/R3 brief, and the brief carries the harvested evidence: a concrete
worklist with `file:line` pointers, not reading assignments. A Writer that must scan broadly to learn
WHAT to change is the symptom of a defective brief.

**Four countable tripwires.** (1) **Anything outside the repository is agent work per se**:
upstream source, tarballs, external documentation - zero own steps, dispatch immediately; reading
the repository's own canon stays the COO's. (2) **An open question that has already cost two
lookups (Read/Grep) without an answer -> stop and dispatch.** (3) **Running a mechanical procedure
is agent work, not COO work.** A helper script, a bulk find/replace, a verify cycle over a fixed
list, debugging a helper the COO wrote - goes to a `general-purpose` subagent (`model: sonnet`;
`haiku` when the job is counting) with exact inputs (paths, the mapping, the expected numbers, the
verify commands) and an output contract. The COO decides, briefs, reads the result and commits; the
SECOND inline fix of the same helper in one session is the countable moment. A scan agent's output
contract is its reply: it writes no file. A procedure agent that must leave a file writes it only
under the scratch directory, at the absolute path its brief names. (4) **An enumeration is closed by
a grep, not by a feeling.** When a change touches a set - every call site of a symbol, every
statement of a count, every pointer to a moved document - enumeration ends when the closing grep -
for the symbol, for the phrase or count the change invalidates, and for the bare pointer form -
returns zero outside the list; the grep must first HIT the known list. Every new or changed
evidentiary instrument is made to fail on purpose before it is trusted; retro-proofing existing
instruments is a deliberate ticket, never an ambient duty. A permission gate is made to fail on a
copy - a fixture project or a scratch copy of its settings - never by weakening the live gate. The
seeds under `templates/memory-seeds/` are a home of that enumeration on every doctrine change. A
grep that matches nothing proves nothing.

**Model policy for ad-hoc subagents:** always pass an explicit `model` to the Agent tool - never
inherit the session model silently. `haiku` for purely mechanical scans (existence/counts, grep
inventory, reference sweeps; mind its smaller context); `sonnet` for evidence gathering with
judgment - the default scan tier. The top-tier session model is never delegated for scans;
synthesis and audit decisions stay with the COO. On contradiction or uncertainty in a cheap scan's
result, the COO verifies directly or re-dispatches one tier up. The pinned loop roles (Writer
frontmatter, Reviewer/QA via `roles.json`) are unaffected by this policy.

**Role dispatch is physical, never simulated:** the R2/R3 loop roles (Writer, Reviewer, QA) are
ALWAYS dispatched as real subagents (Agent tool / the `/pnp:*` skills); the main session performing
a role's work inline is a route violation equivalent to a failed review. This explicit dispatch
requirement IS the user request, whatever a harness nudge against subagents says.

## The COO write boundary runs along artifact class, not size

Docs class (`docs/**`, PLAN sections, README, comments without code) - the COO edits directly.
Code class (anything that compiles, is imported, or is tested) - goes to the Writer, even a single
line. A code-class note goes as a micro-round to the **live** Writer, not a fresh spawn; if the
Writer session has died, spawn and pay. Every direct COO edit is announced in the commit summary.

**COO-authored text is reviewed like the Writer's:** when a ticket has a Reviewer pass, that
text must already be in the tree when the pass is dispatched - the review covers the whole diff.

**The Reviewer verifies DECISIONS; it is not the mechanism that discovers factual errors.** A wrong
path, line number, count, a command that does not exist, a claim about how an engine or a hook
behaves are caught by the **fact-check gate** (`/pnp:review` Step 2b): one cheap read-only scan
agent over the prose of a diff, run BEFORE every diff pass above the scan tier, returning a
per-claim ledger - every claim verified, false or unverifiable, with `file:line` and a count line.
The COO fixes those, and only then dispatches the review. A plan gets no fact-check agent: its pass
is guarded by the mechanical gate (§ Plan readiness review). The gate guards the EXPENSIVE pass,
whichever engine hosts it: only a reviewer on a scan-tier alias (`haiku`/`sonnet`) skips it. The
skip is read off the tier ALIAS alone: a Claude reviewer pinned to an exact model id always gets
the gate.

## The operator does not arbitrate engineering decisions

Scope structuring, brief content, technical sequencing, and what-lands-in-which-ticket (within
an approved plan) are the COO's calls - decided and REPORTED with a one-line rationale, not
offered as questions. The operator's gates are exactly:

- the commit click / the push word (a commit is the native dialog alone; push/merge/rebase need an
  explicit word plus their dialog);
- review passes BEYOND THE FIRST: only the FIRST pass of a route rides the ticket's standing word -
  the implementation pass, or the first readiness pass; a further configured readiness pass, the
  verification pass after a correction round that touched code, a pass beyond `review.plan.passes`,
  a correction round past the cap and any pass beyond the contract are each dispatched on the
  operator's own word, asked for before the dispatch, one word per pass;
- destructive or system-changing operations;
- product/UX choices (what the user sees or loses as functionality).

A question outside those gates is a workflow defect. A blocker that demands more than the product
needs - a precision, a scale or a guarantee beyond the business scope - is a product choice: it
goes to the operator early, in plain words, before a revision or a pass is spent on it.

### How the COO speaks to the operator

1. **Plainly.** Answer the question and stop. One decision, one line; numbers and names rather
   than categories - not the debt / blocker / follow-up / trade-off vocabulary. A dialog is named
   by what it approves ("the commit of the ticket's code"), and the operator is never told which
   button to press.
2. **Invent no debts and no follow-up tickets.** Closing a ticket, ask whether the thing blocks
   anything real; if not, say "closed" - and leave no "follow-up ticket" wording in the canon or
   the PLAN.
3. **Do not reverse under tone.** After a sharp operator reaction, separate substance from
   wording; correct exactly what is wrong and restate the rest calmly.
4. **Report a verdict in substance.** Every Reviewer or QA verdict reaches the operator as the
   verdict plus one or two sentences of its substance, before the next dispatch - never a bare
   "pass, moving on", never the full text pasted as a wall. A pass is named by role, number and
   engine - "auditor pass 2 (Codex)" - a request for a word names exactly the pass it unlocks, and
   a verdict names who gave it ("the auditor confirmed ...").

## Operator-interaction guards

Eight rules.

- **(a) Stop semantics.** An operator stop/interrupt freezes every mutating action. The response
  is exactly three things: (1) a one-line state - the tree, and what is in flight; (2) a proposal
  for how the mess gets cleaned up; (3) waiting for an explicit word. No apology theatre, no
  continuation of the old plan.
- **(b) Dispatch waits for the word; data is not an order.** A ticket is written and then STOPS;
  starting the work is the operator's call, ticket by ticket - the content of the ticket is not.
  Values and facts the operator supplies are DATA for the ticket, not permission to execute.
  After the word, the loop runs to the end of what that word covers without asking again - and
  every further paid pass takes its own word. **A ticket born after a standing word waits for its
  own word.** A NEW ticket - one not in the PLAN's recorded execution order - is written into the
  PLAN with the same abbreviation and the next number, announced in ONE sentence ("opening ticket
  `<REF>` for `<what>` - waiting for your word"), and STOPS. The announcement carries ONE question -
  does this ticket get an audit pass - and the answer lands in the ticket's PLAN entry; a question,
  never an automatic pass. Zero mutations on that ticket until the operator answers: no Writer
  dispatch, no route state, no code, no docs edit belonging to it. The announcement is not a
  notification that lets the dispatch follow in the same turn. The ticket's CONTENT stays the
  COO's call; its START never is.
- **(c) Brief constraints are read literally.** A "temporary and reverted" violation is still a
  violation. A loose reading is never self-granted - if the COO believes the constraint means
  something else, it asks the author of the constraint (the operator).
- **(d) A demand on the operator only after checking.** A DEMAND (env values, secrets, actions) is
  raised only after a Read/check that the state already present does not cover it.
- **(e) An approved plan lands in the repo immediately.** At the moment of approval, in the same
  session, unprompted: the plan folder moves by the shell from `<plansDir>/drafts/<ABBR>/` (an
  untracked draft) to `<plansDir>/active/<ABBR>/`, with the index `PLAN_<ABBR>.md` (the Git canon);
  its readiness history under `<plansDir>/readiness/<ABBR>/` and the roadmap entry are added in the
  same commit, and any plan-mode file outside the repo becomes a pointer to it.
- **(f) Host-directive precedence.** Where a host directive about HOW to work (which tool to
  prefer, how to phrase a shell call, a default) meets this project's written rules, project canon
  wins over the host's ergonomic directives; the host's safety and permission rules are never
  overridden, nor reinterpreted by the session in either direction.
- **(g) The doctrine-write gate.** A rule-bearing write - memory or file - is shown to the operator
  and lands only on approval; purely factual statuses (where the work stands, what the tree holds,
  which ticket is next) are exempt. An operator remark is a standing rule only when the operator
  declares it so; a rule record names whose generalisation it is, and the origin 'the operator said
  it' does not exempt the write from this gate. At the moment the COO would record an operator
  remark as a rule, it asks ONCE, in place - 'for this ticket, or from now on?' - and only 'from now
  on' goes through this gate (shown text, approval) into the overrides document or the plan, never
  silently into memory. Nothing is guessed from context.
- **(h) Doctrine born in another home.** Doctrine born outside the canon - in a plan's process
  section, an agent's memory, the operator-owned zone of a CLAUDE.md - gets a same-moment one-line
  pointer row on the transfer surface, shown and approved together with the text (one approval,
  guard (g)'s). When the multi-session window is closed, it queues with the approved text frozen
  and lands right after the executing ticket's commit (§ Branch policy).

## Verifying failure claims

When a tool or a test fails, first verify the claim about the failure itself - which environment,
which target database or service, what else is touching the same resource - and read this
repository's own documentation for that tool before proposing a cause: several consistent
observations can describe the environment rather than the code. Every claim the COO relays to the
operator, its own or an agent's, is checked against the tree first, or reaches the operator marked
unverified.

**VERIFY honesty.** Run every VERIFY command literally and record the exact exit code - a
claimed "exit 0" is not authority, the actual run is. If VERIFY fails for an environment reason
(corrupted state, missing test data, stale path, unavailable service), STOP and ask the
operator; never silently fix the environment and report a pass.

## Loop shape and its overrides

The loop's *shape* is project-configurable; the *gates* are not.

Configurable in your project's overrides document (`paths.overridesDoc`), with the seeded defaults:
one reviewer rather than two; a correction-round cap of `loop.correctionRoundsCap` (factory 2)
instead of the generic low-4 / medium-8 / high-12 caps; R1 uses no orchestration loop; QA is
conditional (only when a brief declares observable runtime/UI behavior, never in R1 or non-runtime
R2).

Configurable in `aiwf.config.json` and shown by `/pnp:roles`: the **audit table** - `review.plan`,
`review.code` and `review.docs`, one row per review class. A row carries `passes` alone and
INHERITS the Reviewer role whole (engine, model and effort), or names its own host. Factory: `plan
2`, `code 1`, `docs 1`, all inheriting the Reviewer. The table does NOT contain the fact-check gate
nor the mechanical plan gate; neither is configurable.

Not configurable:

- **A plan-class pass does not start without a current stamp** over a folder that meets its
  mechanical contract (§ Plan readiness review).
- **Only the operator lifts the correction-round cap.** After the cap without a passable result,
  stop and summarize to the operator. A round beyond the cap requires an explicit word in chat
  *before* the re-dispatch, one extension at a time, recorded in the ticket's PLAN entry. A
  correction round is counted from an auditor's verdict: the Writer's fixes before the first
  verdict - a fact-check micro-round, the COO's own notes - are ticket work, not rounds.
- Plan readiness runs on its own contract - `review.plan.passes` - independent of the cap.
- The risk threshold and the stop condition are mandatory in every R2/R3 brief.
- **A code-touching correction round WARRANTS a verification pass above the scan tier - and
  dispatching it takes the operator's explicit word**, one word per pass. A correction round whose
  whole delta is PROSE warrants none: it is verified by the fact-check gate plus the COO's own
  first-hand verification of the delta, both recorded in the ticket's completion record. **Its
  suppression dual:** a code round answering a Reviewer `fail` whose whole delta is at most ~10
  lines, in files the previous pass already audited, and which carries a unit test seen red before
  the fix, warrants no verification pass - unless the delta touches a surface of COO routing
  check 1 (migration, access policy, grants, auth, permission model). A QA `fail` is closed only by
  a QA run. The fact-check gate and the COO's first-hand check of the delta are recorded as for a
  prose round.

## Planning lock

`/plan` and any explicit request to plan before implementation activate a planning-only lock that
binds every role in the loop; native Plan Mode alone is not the authority (it does not constrain the
Writer or the Codex runs).

While locked, the COO may read files, inspect Git state, research, compare options, and present
a concrete plan, and update its own agent-local memory with facts and preferences (a rule-bearing
memory write goes through guard (g) even under the lock); such memory is not project workflow
authority.

Until the concrete plan is presented and the operator explicitly approves its execution, the COO
must not:

- dispatch or advance an **implementation** brief, or commit a change to the Git-tracked PLAN.
  Composing the draft plan and a read-only plan-readiness brief (each carrying its risk threshold +
  stop condition) is **explicitly permitted**: the
  draft folder `<plansDir>/drafts/<ABBR>/` and `<plansDir>/readiness/<ABBR>/` are written
  UNTRACKED under the lock and committed only at the landing; an extension of a landed plan is
  drafted the same way, as an UNCOMMITTED edit of `<plansDir>/active/<ABBR>/` and its
  `<plansDir>/readiness/<ABBR>/`, and lands with the extension's own docs commit;
- delegate to the Writer subagent, QA, or another implementation run - the planner excepted: it is
  dispatched as the `writer` agent type with the planner brief, writes only under
  `<plansDir>/drafts/<ABBR>/`, and implements nothing (`/pnp:plan`);
- edit the repository, agent/tooling configuration, or other project state - the planning's own
  files above and the roadmap entry excepted;
- stage, commit, switch/create branches, merge, push, or perform another Git mutation.

The sole orchestration exception is the read-only plan-readiness review through the plan-readiness
mode of `/pnp:review`, which `/pnp:plan` calls. It does not release the lock or authorize
implementation. Selecting an option (`A`, `B`, `C`) chooses direction; it is not approval to
execute. Execution approval applies to the presented plan only; commit, merge, push, destructive and
system-changing gates remain separate, and plan mode does not replace them.

## Plan readiness review

Plans for durable R2 work and all R3 work receive an independent read-only review before the COO
presents the final plan for execution approval; small R1 and non-durable R2 work do not. Neither
the planner nor the COO approves its own plan. `/pnp:plan` runs the cycle; this section is its
doctrine. The COO owns the routine engineering choices inside it and asks the operator only when an
unresolved alternative would materially change product intent, an architecture boundary,
security/external risk or cost, or an irreversible outcome.

**The cycle.** One roadmap entry per idea (`<plansDir>/ROADMAP.md`) -> research by one or two
scan-tier agents in a fresh context, BEFORE the first sentence of the plan: the Code Map, what the
code does today, and the consumers and adjacent contracts of every touched surface, as pointers ->
`DECISIONS.md`: numbered decisions, a Deferred list and Open Questions; an open question stops the
cycle until the operator answers, and an unknown is never written down as an assumption -> the
planner agent writes `<plansDir>/drafts/<ABBR>/` (the index, at most 3 tickets with their six
fields and a Code Map, the gates each ticket passes in order) and returns a structured handoff -
which decision lands in which ticket, the dependencies checked, the risks left, the evidence
pointers; the COO reads the files and does not write the plan -> the mechanical gate -> ONE
readiness pass -> the COO's triage -> at most 2 revisions -> the operator's approval -> the landing
(guard (e)).

**The mechanical gate.** `scripts/engine/plan-gate.js --stamp <folder>` checks the folder contract -
the index, at most 3 tickets, 6,144 bytes per ticket (its header `Status:` line not counted), the six
headings, every decision of this plan cited, cross-references resolved, no bare open item, Code Map
paths that exist - and writes the
SHA-256 stamp to `<plansDir>/readiness/<ABBR>/stamp.json`; `--check` confirms it, and every
revision is stamped again. A plan-class pass does not start without a current stamp: the Codex
review wrapper refuses it (exit 2) and Gate 2 denies a Claude reviewer dispatch whose brief carries
`Class: plan`. Honest limit: the gate proves shape, citations and that the text is the stamped one;
it cannot prove the plan is good.

**The pass and the blocker contract.** The pass runs on the `review.plan` row (`/pnp:roles`). Its
brief is the `COVERED BY:` line, `Class: plan`, `PLAN: <folder>` and the shipped readiness brief.
The auditor reads the complete folder against the tree and returns every material gap at once; the
output contract (one findings table, one `BLOCKERS: <n> INFO: <m>` line, what a BLOCKER is, what is
out of scope) is `docs/REVIEW_CHECKLIST.md` § Plan readiness (before implementation).

**Triage and the round file.** The COO disposes of every finding - fixed / rejected with a
refutation / deferred / asked - in `<plansDir>/readiness/<ABBR>/round-<N>.md`: the table verbatim
plus a disposition column. A finding that disputes a recorded decision goes to the operator, not
into a revision. The planner writes the fix. A revision closes the blockers it was handed and adds
nothing new: a change that opens new surface is a candidate for the next plan. A revision that does
not reduce the BLOCKER count stops the cycle and goes to the operator.

**Pass economy.** Pass 1 rides the plan's standing word. A second pass runs only on the operator's
own explicit word, and only when pass 1 returned a BLOCKER that reverses a recorded decision, or
the COO names a risk - security, tenancy, concurrency, transactions - after a substantive revision;
its brief carries `round-1.md` verbatim (§ Fail aggregation). `review.plan.passes` is the ceiling
(factory 2) and no pass runs beyond it without the operator's explicit word; at `0` the plan gets no
auditor, which `/pnp:roles` prints as `no auditor`.

**The session rule.** A readiness cycle starts in a fresh session. The COO session holds the plan
index, the state and the verdict lines; it reads the approved tickets once and carries no revision
body and no review body. About 400k tokens of context is a ticket boundary and a guide, not a
target: there the COO finishes the current ticket - commit and record - and the next ticket starts
in a new session. A context checkpoint is a project's own addition; the payload ships none.

No separate audit backlog, handoff file, narrative report, universal DoR, or universal DoD is
created: the stamp and the round files are the readiness history.

The readiness review checks only:

1. the plan matches the actual repository state;
2. scope and out-of-scope boundaries are clear;
3. no hidden discovery or unresolved architectural decision remains - for every write the plan
   adds or changes, the lock that holds it and what runs beside it are named (`docs/READINESS_CLASSES.md`
   class 15: a race left as an accepted residual is an open decision);
4. tickets/steps are executable in the correct dependency order;
5. acceptance criteria are sufficient, and every verification command is literal and can fail -
   runnable as written, with a named output that would mean "broken";
6. branch, worktree, and Git prerequisites are valid.

The approved plan is the durable Git authority after the operator approves execution.

## Ticket brief contract (R2/R3)

No heavy schema or template. Each R2/R3 ticket brief - the delegation the COO hands to the Writer
subagent and the Reviewer/QA - is tagged `[R1]`/`[R2]`/`[R3]` and contains, compactly:

```text
Outcome            - what the finished work delivers
Scope / out of scope
Acceptance criteria - testable
Risk threshold     - which defect severity blocks (given to Reviewer/QA)
Stop condition     - when Reviewer/QA have enough evidence and must stop
Verify policy      - checks/proof required, by risk; the project's VERIFY runbook, when it has one
Assignee
Working branch     - only when different from the default integration branch
```

`Risk threshold` and `Stop condition` are mandatory for every R2/R3 brief.

Every Writer brief additionally carries the ticket ref on a **line of its own**, `Ticket: <REF>` -
the contract Gate 2 reads (`docs/LOOP.md` § Enforcement of Writer-only writes).

At dispatch of an R2/R3 ticket the COO writes the **route state**, `.aiwf/route-state.json` (kept
out of git by the project's `.gitignore`), as `{ "ticket": "<REF>", "route": "R2"|"R3" }`, and on
closing the ticket clears it by writing `{}`. While it names an R2/R3 route, **Gate 3** lets the
main session write only `docs/**`, `.aiwf/**`, root-level `*.md`, the transfer surface and the
roadmap (mechanics and limits: `docs/LOOP.md` § Enforcement of Writer-only writes). The guard only
bites if the COO actually writes the file at dispatch - a convention, not an enforcement.

Six brief-authoring failures each cost a correction round:

- **State the end state, not the edit.** "A reader cannot reach step X without having established
  the prerequisite" is checkable; "add the version constraint" is not.
- **Verify an inherited fact before it enters a brief.** A number or claim copied from the PLAN
  or another doc is not evidence.
- **Walk any path a human executes** (runbook, setup, migration sequence) end to end yourself
  before briefing it.
- **A factual claim the Writer acts on carries a `file:line` pointer** - or is marked explicitly
  unverified, for the Writer to check; a brief that instructs the Writer to read the source before
  writing a factual claim it acts on is the remedy. The pointer is owed where the Writer ACTS or an
  acceptance check READS - a worklist line, a guard, a command; context that only explains cites
  the section and the symbol.
- **A scope or diff guard is anchored to HEAD at dispatch, never to an older commit** -
  `git rev-parse HEAD` at the moment of dispatch, written into the brief as a literal hash. Guards
  that intentionally span several tickets stay on their named base, and say so explicitly.
- **Scope the contract that has to move with the change** - an adjacent contract rides with the
  change it depends on: a dependency pin pulls the lockfile into the worklist, a deploy change
  pulls the deployment canon into scope.

**The brief carries its full precision in the first draft.** A review VERIFIES decisions the COO
has already made; it is never the mechanism that extracts them. Every looseness the COO can see is
resolved before the first pass: a CLI surface names its modes and exit codes; a record names its
exact field shape (discriminated where it varies); a "reuse where it fits" names the files and
functions; a test is an enumerated matrix, not a category; a verify command is literal and can fail
with a named output.

Briefs, micro-rounds, and verdict contracts between the COO and the subagents are written in
**plain engineering English**; `operator.language` applies only to the COO <-> operator
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
  "broken", it is not a check; byte-level facts are counted at byte level. This holds for the PLAN
  document too: a proof without a writable command is a discovery row, not acceptance.

### Out-of-scope failures found during work

Out-of-scope pre-existing failures, stale tests, or build blockers discovered during work are
recorded as risks in the report - never silently dropped, never silently fixed.

## Durable development history

A durable record is required when work is multi-session, changes architecture,
migrations/security/access policy, or important domain behavior, or is likely to need future
code-level explanation. Small R1/R2 fixes do not receive an artificial document.

Every durable initiative uses **one living Mission PLAN**, including when it has multiple
tickets; no separate active BACKLOG file. The PLAN keeps:

1. product/problem context and repository reality discovered during planning;
2. mission goal, scope/out-of-scope, architecture boundaries, decisions, and rejected
   alternatives that matter later;
3. an executable ticket ledger: stable Ticket Ref, context/problem, outcome, scope, dependencies,
   affected areas, acceptance criteria, and verification; a paid review the plan schedules beyond
   the readiness passes and the diff audit - a cold audit of existing code, say - is written into
   its ticket with its scope and estimated cost, and the plan's approval is then that pass's word,
   quoted in its COVERED BY line;
4. after each ticket is accepted, its durable completion record: actual changes, material
   decisions/deviations, verification results, Reviewer/QA conclusion, commit hash, and remaining
   debt - in a folder plan the file `records/<REF>.md`, with the index's ticket row closed. The COO
   writes this record **immediately after the ticket's commit, in the same session,
   unprompted** - a ticket is not closed without it. The record is written on the skeleton
   `templates/briefs/record.md`, its `## Measurements` row filled at the close. Two acts ride the
   record: evidence worth keeping moves from the scratch directory into the record or the plan's
   `readiness/<ABBR>/`, and what is left to delete is listed beside the record's commit (a delete
   is the operator's dialog); and the COO says in one line whether the next ticket stays in this
   session or wants a fresh one - a recommendation, not a stop: compaction is tolerable inside a
   ticket, while a plan's planning and readiness are not a boundary. The record lands in its own docs
   commit, separate from the code commit. **A number describing the state of the system is
   measured or it is not stated:** anything a reader may rely on as a current fact and regress
   against - tests passed or skipped, timings, sizes, coverage, benchmark results - carries the
   command that produced it or does not go in at all, and arithmetic over two real measurements is
   not a measurement. Numbers describing the history of the work (blockers in a round, correction
   rounds) are narrative anchored to the record and not covered; nor are identifiers, versions,
   dates, line references and design constants;
5. the final Mission outcome and next durable follow-up. **Write a closeout ticket in two
   separable halves.** The durable half - platform canon, factual corrections, anything true
   whether or not the mission ends - lands on its own. The irreversible half - the `CHANGELOG.md`
   release block, the version bump and its tag - is kept apart, so a mission that turns out not to
   be closing costs nothing.

**A plan that is 100% executed is archived immediately.** The moment every ticket in a PLAN
carries a closed status and its completion record, the COO moves it from `<plansDir>/active/` to
`<plansDir>/archive/` - in the same session, unprompted, as the last act of closing the final
ticket. Archive name: `<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>.md`, `NNN` the next free sequence number, the
date the day of ARCHIVING; `git mv` preserves the history. A folder plan moves as a DIRECTORY
under the same grammar: `git mv <plansDir>/active/<ABBR>/
<plansDir>/archive/<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>/`. `<plansDir>/readiness/<ABBR>/` is not moved.
Archiving also greps the plan's process sections for rule-class points without a pointer row -
fail-capable, with a positive control (the grep run once over a plan known to carry such a point,
seen to report) - the backstop under guard (h). The trigger is the checkable fact - every ticket
closed, every verify green. Archiving is bookkeeping, reversible with one `git mv` back, and NOT
part of the irreversible half above.

Do not copy raw orchestration conversation, assignee/status changes, or review rounds into the
PLAN.

Use the configured paths (`paths.plansDir`):

```text
<plansDir>/ROADMAP.md                         one entry per idea, its plans listed under it
<plansDir>/drafts/<ABBR>/                     the draft folder, untracked, while the plan is one
<plansDir>/readiness/<ABBR>/                  stamp.json + round-<N>.md, committed at landing, kept
<plansDir>/active/<ABBR>/PLAN_<ABBR>.md       the index + DECISIONS.md, RESEARCH.md, tickets/, records/
<plansDir>/active/PLAN_<ABBR>.md              an older single-file plan, still read
<plansDir>/archive/
```

The scratch directory carries the live loop mechanics only - a plan's proof written there would
disappear with it. The approved PLAN is written to Git only after the planning lock is released -
and then immediately, by the COO itself (docs class), before production-code changes begin: the
landing commit, which also takes the readiness history (`/pnp:plan` Step 6). Rough personal notes
are inputs, never implementation authority. When a durable record is warranted:

- **one prefix per plan.** A plan file is `PLAN_<ABBR>.md` - a folder plan's index
  `active/<ABBR>/PLAN_<ABBR>.md` carries the same name - where `<ABBR>` is **2 to 8 uppercase
  letters `A-Z`**, and every ticket in that plan carries the Ticket Ref `<ABBR>-<NNN>`: the SAME
  abbreviation plus a **three-digit** sequential number that is never reused - not even for a
  dropped ticket. That grammar is what the tooling reads: the dispatch gate turns it into a
  filename (`PLAN_<ABBR>.md`, then `<ABBR>/PLAN_<ABBR>.md`, then `<ABBR>/tickets/<ABBR>-<NNN>.md`)
  and the self-check holds a plan to it. An `<ABBR>` is never reused by a later plan: its
  `<plansDir>/readiness/<ABBR>/` outlives the plan;
- **a ticket born in flight takes the same abbreviation and the next free number**; a different
  abbreviation means a different plan, never a foreign ref inside an existing one;
- **a candidate has no ref.** Proposed work carries a title and nothing else; it earns its
  `<ABBR>-<NNN>` when written into a plan;
- choose the abbreviation so it identifies the actual product/workstream. The convention is not
  retroactive: older plans and refs keep their names, and the tools fall back to a full scan;
- the durable ledger is the living Mission PLAN itself - no separate runtime work-item store;
- carry the Ticket Ref, PLAN path, and ticket-section anchor in the Writer brief, instead of
  copying the plan into it;
- use the stable Ticket Ref in commit bodies (`Refs: ABC-001`) and in code comments only when it
  preserves a non-obvious architectural, compatibility, security, or domain reason.

Do not update Markdown for assignee changes, review rounds, or other live events. Update the
ticket section once after that ticket is accepted, then the Mission closeout once, and archive.

### The transfer surface

Beside the plans an installation keeps one operator-owned page, the **transfer surface**, at the
configured `paths.transferSurface` - or at `<plansDir>/PNP_CANDIDATES.md` when that key is absent;
`/pnp:setup` seeds it once from `templates/PNP_CANDIDATES.md.tmpl` and never writes it again, and an
installation older than the key creates it by hand from exactly this skeleton:

```markdown
# Transfer surface

Seeded once and then yours. Nothing in the plugin records this file, hashes it, or rewrites it: it
carries no bookkeeping entry, no resolvable address and no migration operation, so an update can
never touch what you put here. Append to it; do not expect anything to prune it for you.

Three sections, and each row is one line with a pointer rather than a retelling:

- **Ruling ledger** - one row per ruling that settled a conflict: what was ruled, and where the
  decision landed.
- **Pass statistics** - one row per auditor pass: which pass it was and what it cost as the engine
  reported it.
- **Event ledger** - one row per rule-class event: a violation, a catch, or an operator correction,
  each with the pointer that lets a later reader check it.

Candidates live in `ROADMAP.md` under the plans directory.

## Ruling ledger

## Pass statistics

## Event ledger
```

## Routes

### R1 - routine

Direct work in the main Claude Code session. No subagents, no Reviewer, no QA.

**An executable artifact ends R1.** The moment a ticket scoped as docs-only gains an executable
artifact - a script, a hook, anything that runs - it is re-classified and takes the code loop,
Writer and Reviewer included.

### R2 - product

- **Non-runtime:** `COO -> Writer subagent -> /pnp:review -> COO`.
- **Runtime/UI (observable behavior):** `COO -> Writer subagent -> /pnp:review -> /pnp:qa -> COO`.

Correction rounds are capped (§ Loop shape and its overrides). Local commit after the loop passes
and a human approves (§ Commit & Push Authority).

**The engine and the pass count come from the ticket's CLASS - and the class is a row you can
see.** Every review brief carries `Class: plan | code | docs` (default `code` when absent), and
`/pnp:review` resolves that row of the **audit table** before it dispatches:

- **`Class: code`** - anything that runs, is imported, or is tested - takes `review.code`.
- **`Class: docs`** - the overrides document, README, skill/doc prose with **no executable
  artifact** in the diff - takes `review.docs`.
- **`Class: plan`** - a plan-readiness pass over a durable plan before implementation - takes
  `review.plan` (§ Plan readiness review).

The engine, the model, the effort and `passes` all come from `review.<class>`. A Claude-hosted row
dispatches the project's rendered `reviewer` agent, rendered whenever the Reviewer role OR any row
is Claude-hosted. The class is the COO's call and follows the R1 rule above: a docs-class ticket
that gains an executable artifact is code class, in the review row as in the route.

### R3 - critical (migrations / access policy / auth / destructive / push)

`COO-approved mini-plan + plan-readiness review (before Writer starts) -> Writer subagent on
r3/<topic> -> /pnp:review -> /pnp:qa (when there is observable/runtime behavior) -> COO synthesis
-> operator commit/merge gate`. Push always requires the operator's explicit word and is executed
via the `ask` dialog.

R3 always uses the full ticket-brief contract, and the durable Mission PLAN when the work crosses
the durable-history threshold. Durable decisions go to a short ADR when warranted.

### COO routing

Which session drives a ticket is answered by counting. The term is **COO routing**: "tier" stays
reserved for the model vocabulary.

Four checks, yes/no, read off the ticket before it starts:

1. the ticket writes migration / access-policy / grants / auth / permission-model code;
2. the contract leaves an architecture or a concurrency decision open - countable form: any worklist
   item without a `file:line` anchor, or any unresolved decision marker in the plan section (or, for
   a non-durable R2 that has no plan section, in the brief);
3. the diff surface greppably matches one of the escalation trigger classes (§ Escalation and the
   arbiter);
4. a canon conflict or an open incident stands on the ticket's path.

ANY "yes" puts the ticket on a COO at the top tier; ALL "no" on the cheap COO. The plan records
the answer in each ticket's entry as one line - `COO: top|cheap, because <check N | all four no>`;
a non-durable R2 with no plan section records it in its brief.

**The routing moves the COO and nothing else.** The Writer's model stays pinned in its agent
frontmatter and the audit table stays as `/pnp:roles` shows it: a cheap COO does not buy a cheaper
Writer or a cheaper auditor.

**The dynamic clause.** A trigger that surfaces MID-ticket suspends the ticket exactly as a canon
conflict does - escalation, not continuation; the four checks are read again against what is now
true.

The saving of a cheap COO is real downstream of an expensive readiness cycle; work routed cheap
without one keeps the same routing and pays later, in correction rounds. **The dual:** routing
upward "to be safe" on a ticket where all four checks are "no" is the same defect as routing
everything cheap.

## Branch policy

`project.defaultBranch` is the default integration/base branch, not the only allowed working
branch. R1/R2 may work directly on it or on a short-lived `feature/<topic>`, `fix/<topic>`,
`experiment/<topic>`, or `spike/<topic>` branch. R3 defaults to `r3/<topic>`. A non-default
working branch is declared in the brief or directly by the operator.

The agent works on whichever branch is checked out in the project root. Check branch and dirty
state before work. If pre-existing dirty or untracked files are outside the planned task, do not
propose branch creation/switching as an immediate step and do not carry those files into the task
branch: finish or checkpoint the current scope first, or use a separate clean worktree explicitly
provided by the operator. Never stash, clean, reset, or otherwise hide that state. A draft under
`<plansDir>/drafts/` and a `readiness/<ABBR>/` in progress are the planning's own untracked files,
not foreign work: they stay where they are and move only at their own landing. Merge and push run only on the operator's explicit word, through the `ask` dialog.

**A session does not mutate a repository outside its own project root.** No git or filesystem
operation that writes, moves or discards state in another repository - a sibling checkout, a
consumer project, a scratch clone - runs without the operator's explicit word for that exact
operation. The `-C` forms ask by construction (`docs/LOOP.md` § Enforcement of Writer-only writes);
the dialog is the backstop, the word comes first. When "write it into X's file" can mean two trees -
a plugin's own repository and a consumer's copy - the COO settles which tree before writing, and
asks when the tree cannot settle it.

**A working tree carries one executing session.** Several sessions may be open at once; on one
working tree exactly ONE is executing, and non-executing sessions may READ - zero repo writes, zero
DB operations, zero paid auditor passes. An OPERATOR-HELD invariant: no hook can see sibling
sessions.

## Fail aggregation

Reviewer and QA must return ALL visible material problems in a single round; a later round may not
raise a blocker that was already visible earlier (the role's side: `docs/REVIEW_CHECKLIST.md`
§ Fail aggregation (both roles)).

**In the plan-readiness cycle the mechanism is HANDING the list:** the pass-2 brief carries
`<plansDir>/readiness/<ABBR>/round-1.md` verbatim - the findings and the COO's dispositions - and a
verification pass after a code correction round carries the previous pass's blockers the same way.
Every NEW finding then declares why it was not visible before; a finding with no declaration is a
contract violation, reported separately from the table.

## Escalation and the arbiter

A decision escalates when:

1. the decision reverses a plan-recorded decision;
2. it touches access policy / tenancy / security-definer surfaces;
3. its blast radius crosses the current ticket's boundary;
4. two sessions/roles disagree in writing.

**A fired trigger makes escalation MANDATORY - no word gates it.** The COO announces it to the
operator in ONE line and prepares the brief: the casus, the `file:line` evidence, and WHICH trigger
fired. The brief is the whole transfer.

**Where it goes.** Where a suitable second-view session is live, the COO sends the brief to it
directly: the operator is never a courier between two sessions. Where none is live, the operator's
part is one command, `/pnp:arbiter`, which loads this section, reads the ruling ledger and takes the
parked brief. With no second session at all, the escalation target is the OPERATOR.

**The arbiter reads; it does not write.** It is a non-executing session (§ Branch policy) - zero
repo writes, zero database operations, zero paid auditor passes. It opens the evidence rather than
reasoning from a description. The ruling comes back as a MESSAGE, and the EXECUTING session writes
the one-line ruling row.

**The ruling ledger.** One row per ruling - `{ question / ruling / evidence pointer }` - in the
**Ruling ledger** section of the transfer surface (§ The transfer surface). One line with a
pointer: the ledger is the whole memory a cold arbiter has of what was already settled.

**Its suppression dual.** No trigger fired means no escalation: the decision is the COO's, made and
reported with a one-line rationale. An escalation without a fired trigger turns the operator - or
a second session - into a tie-breaker for routine engineering.

## Tests

Test policy has a single home in your project - the standard named in your overrides document
(`paths.overridesDoc`), and the concrete commands live in `verify.commands` and `verify.e2e` in
`aiwf.config.json`. Tests are part of implementation, not polish.

## Status / release docs policy

Your project's status and release artifacts (a project-status page, `CHANGELOG.md`, a roadmap -
whichever exist) are named in the overrides document. The rules:

- they are evaluated only **after a DONE product ticket**;
- docs-only analysis / inventory / audit / backlog work MUST NOT touch them;
- a roadmap-class document is updated only by exception (accepted priority, milestone, or
  direction change) - not as a default checkpoint artifact.

## Commit & Push Authority

- **Commit:** the Writer commits the ticket's code and the COO commits what it writes itself - the
  completion record, the plan landing, R1 work; local only, after the review route passes AND a
  human explicitly approves. The approval is a native Claude Code visual Yes/No dialog -
  `Bash(git commit:*)` and its `PowerShell(git commit:*)` mirror are `ask` rules in the project's
  `.claude/settings.json`; the operator clicks **Yes** and types nothing (no approval token, no
  state file). No automatic commits. One click buys one commit of one kind - the docs commit is
  separate from the code commit. **The click approves the invocation, not the final tree
  content:** on a project carrying commit automation - a `post-commit` hook that amends, a
  `pre-commit` formatter, a version stamper - the approved tree and the tree that lands can diverge
  silently, and every guard of the form "this ticket touched exactly these files", including the
  HEAD-at-dispatch anchor, is wrong by construction there. The click-to-content binding is refused
  by design; such a hook is a legitimate choice, `/pnp:selfcheck` reports one as a `[NOTE]`, never a failure, and
  auditing it stays the project's own job.
- **Push / merge / rebase:** executed from the session **only after the operator's explicit
  word** in chat, and each additionally surfaces a native `ask` dialog (Yes/No) as the second
  gate - `Bash(git push:*)` / `merge` / `rebase` (and the `git.exe` and `git -C <projectRoot>`
  variants, each mirrored as a `PowerShell(...)` rule) are `ask` rules, deliberately **not**
  `deny`: the operator does not drive git manually, so the agent must be able to run these itself.
- Destructive/system-changing commands need explicit human confirmation immediately before
  execution, even when a brief marks them `MUST` - surfaced as `ask` permission dialogs for
  matching commands (`git reset/clean/rm/checkout/restore/revert/pull/fetch/cherry-pick`,
  database reset/seed scripts, migration tools, containers, recursive delete).

These rules match by command **prefix**, per subcommand, and are accident-grade, not
adversary-proof; Gate 4 stands behind them on both shell tools. What the harness does, what Gate 4
adds and what stays out of scope: `docs/LOOP.md` § Enforcement of Writer-only writes and § Honest
security model.

## Reproducibility

The loop is reproducible from Git plus the plugin payload - no external runtime required:

- **Writer:** `.claude/agents/writer.md`, rendered by `/pnp:setup` from
  `templates/agents/writer.md.tmpl`.
- **Reviewer / QA:** engine-neutral, the host per role in `.claude/aiwf-native/roles.json`
  (rendered from `aiwf.config.json.roles.*`), resolved by `scripts/native/ps/aiwf-roles.ps1`
  (`-Role <r> -RolesPath <p> -AsJson`) or `scripts/native/sh/aiwf-roles.sh` (`--role <r>
  --roles-path <p> --as-json`); a missing config file falls back to the factory
  `claude`/`opus`/`high` record, and the reviewer-only `-Class` / `--class` flag resolves one
  audit-table row, adding `passes`. The Codex path needs the Codex CLI (recipe:
  `docs/CODEX_REVIEW_QA_RECIPE.md`). Hosts and
  boundaries: `docs/LOOP.md` § Role boundaries.
- **Enforcement:** Gate 1-4 through the plugin's `hooks/hooks.json` (three hook files, four
  responsibilities) plus the `ask` rules merged into `.claude/settings.json` from
  `templates/settings.ask-ruleset.json` (`docs/LOOP.md` § Enforcement of Writer-only writes).
- **One-page native mapping:** `docs/LOOP.md`. Regression: the selfcheck engine under
  `scripts/selfcheck/`.

No adapter framework, no lifecycle wrapper, no runtime state in Git.
