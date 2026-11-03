<!-- Managed by PromptAndPray. `/pnp:setup` renders this file and `/pnp:update` re-renders it,
     overwriting any edit. Text of your own goes between the project additions markers at the end of
     this file - every re-render carries it over; a local rule there opens with the heading of the
     rule it modifies. -->

# Ticket stage - PromptAndPray

Read IN FULL before an R2/R3 ticket brief is authored or dispatched - `/pnp:work` the moment the
task routes R2/R3, `/pnp:mission` before the dispatch - and by `/pnp:review`, `/pnp:qa` and
`/pnp:qal` at their first step, beside the always-on `ORCHESTRATOR.md`. It carries the brief, the
roles' boundaries, the loop's shape, the ticket boundary and the ticket's close - the archive of a
finished plan and the roadmap writes included.

## Ticket brief contract (R2/R3)

No heavy schema or template. Each R2/R3 ticket brief - the delegation the COO hands to the Writer
subagent and the Reviewer/QA - is tagged `[R1]`/`[R2]`/`[R3]` and contains, compactly:

```text
Outcome            - what the finished work delivers
Scope              - in and out of scope
Acceptance         - testable criteria
Risk threshold     - which defect severity blocks (given to Reviewer/QA)
Stop condition     - when Reviewer/QA have enough evidence and must stop
Verify             - checks/proof required, by risk; the project's VERIFY runbook, when it has one
Assignee
Working branch     - only when different from the default integration branch
```

The first six names are the six headings a plan ticket carries, the ones the mechanical plan gate
checks (`plan.md` § Plan readiness review).

`Risk threshold` and `Stop condition` are mandatory for every R2/R3 brief.

Every Writer brief additionally carries the ticket ref on a **line of its own**, `Ticket: <REF>` -
the contract Gate 2 reads (`docs/LOOP.md` § Enforcement of Writer-only writes).

At dispatch of an R2/R3 ticket the COO writes the **route state**, `.aiwf/route-state.json` (kept
out of git by the project's `.gitignore`), as `{ "ticket": "<REF>", "route": "R2"|"R3" }`, and on
closing the ticket clears it by writing `{}`. While it names an R2/R3 route, **Gate 3** lets the
main session write only `docs/**`, `.aiwf/**`, root-level `*.md`, the transfer surface, the
roadmap and the planning folders `<plansDir>/drafts/**` and `<plansDir>/readiness/**` (mechanics
and limits: `docs/LOOP.md` § Enforcement of Writer-only writes). The guard only bites if the COO
actually writes the file at dispatch - a convention, not an enforcement.

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

The previous ticket's blockers that still stand enter the next ticket's brief. Agents work without
dialogs: a dialog stands only at a gate - the commit, push/merge/rebase, a destructive or
system-changing operation, the word for a paid pass - and every Writer brief carries this line.

**The brief carries its full precision in the first draft.** A review VERIFIES decisions the COO
has already made; it is never the mechanism that extracts them. Every looseness the COO can see is
resolved before the first pass: a CLI surface names its modes and exit codes; a record names its
exact field shape (discriminated where it varies); a "reuse where it fits" names the files and
functions; a test is an enumerated matrix, not a category; a verify command is literal and can fail
with a named output.

Briefs, micro-rounds, and verdict contracts between the COO and the subagents are written in
**plain engineering English**; `operator.language` applies only to the COO <-> operator
conversation. Everything written into the tree is English - plans, tickets, records, ledger rows,
memory, briefs, verdicts, commit messages, code comments, docs - and the operator's own words are
quoted verbatim in their language wherever recorded, with an English reading beside them when needed.

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

## The COO write boundary runs along artifact class, not size

Docs class (`docs/**`, PLAN sections, README, comments without code) - the COO edits directly.
Code class (anything that compiles, is imported, or is tested) - goes to the Writer, even a single
line. A code-class note goes as a micro-round to the **live** Writer, not a fresh spawn; if the
Writer session has died, spawn and pay. Every direct COO edit is announced in the commit summary.
The COO reads the whole diff of every ticket and writes that reading into
`<scratchDir>/<REF>-diff-review.md`, which is folded into the ticket's completion record at the close.
Before the first paid pass that file carries one line per acceptance criterion naming the defect the
proof would see and the field and line it reads.

**COO-authored text is reviewed like the Writer's:** when a ticket has a Reviewer pass, that
text must already be in the tree when the pass is dispatched - the review covers the whole diff.

**The Reviewer verifies DECISIONS; it is not the mechanism that discovers factual errors.** A wrong
path, line number, count, a command that does not exist, a claim about how an engine or a hook
behaves are caught by the **fact-check gate** (`/pnp:review` Step 2b): one cheap read-only scan
agent over the prose of a diff, run BEFORE every diff pass above the scan tier, returning a
per-claim ledger - every claim verified, false or unverifiable, with `file:line` and a count line.
The COO fixes those, and only then dispatches the review. A plan gets no fact-check agent: its pass
is guarded by the mechanical gate (`plan.md` § Plan readiness review). The gate guards the EXPENSIVE
pass, whichever engine hosts it: only a reviewer on a scan-tier alias (`haiku`/`sonnet`) skips it.
The skip is read off the tier ALIAS alone: a Claude reviewer pinned to an exact model id always gets
the gate.

## Role boundaries

- **COO / Orchestrator** (main session) - plans, authors the ticket brief with a mandatory **risk
  threshold** and **stop condition**, delegates, reads the **full** diff, arbitrates, stops at the
  stop condition, and is the only role that presents the result to the operator. Does **not** write
  implementation code in the R2/R3 cycle; in **R1** the main session implements directly - the
  deliberate exception, not a violation.
- **Writer** - the **only** repo writer. A native Claude subagent (`.claude/agents/writer.md`),
  invoked via the **Agent tool** with `subagent_type: "writer"`. Never approves its own work;
  returns the diff, the tests it added, and VERIFY output with exact exit codes. It does not decide
  acceptance or invent ledger content; it performs the Git PLAN write only when the COO explicitly
  delegates that specific mutation. Several Writers may run on ONE ticket when its worklist splits
  into file sets that do not overlap: the brief records the split, and one VERIFY and one commit
  close the ticket. The Agent tool's `isolation: "worktree"` is not the instrument for it (its copy
  starts from the default branch, not the branch checked out). The planner of `/pnp:plan` runs as
  the `writer` agent type and writes only its plan folder under `<plansDir>/drafts/<ABBR>/`.
  **Dispatch contract - do NOT pass `model` to the Agent tool for the Writer.** The Writer's model
  is pinned in its frontmatter (a tier alias or an exact model id); the Agent tool's `model`
  override takes precedence over frontmatter and takes only a tier alias (`sonnet|opus|haiku|fable`),
  so passing one silently discards the pin. To change the Writer's model, change
  `roles.writer.model` in the config and re-render. A Claude-hosted Reviewer, QA or review row takes
  a tier alias or an exact model id: `/pnp:review` and `/pnp:qa` pass `model` ONLY for a tier alias
  and omit it for an exact id, so the rendered agent's frontmatter pin applies. The Reviewer has ONE
  agent file with ONE pin, shared by every Claude-hosted row, so such a row takes a tier alias or
  exactly `roles.reviewer.model` (a tier alias when the Reviewer is Codex-hosted and the file
  carries `fable`): setup, `/pnp:update` and `/pnp:roles` refuse anything else before writing, and
  `/pnp:review` fails closed at dispatch when the row's exact id and the file's pin disagree.
- **Reviewer** - read-only, **engine-neutral**: the host is data in `.claude/aiwf-native/roles.json`,
  resolved by the role resolver of this project's OS channel - `scripts/native/ps/aiwf-roles.ps1` on
  `windows`, `scripts/native/sh/aiwf-roles.sh` on `linux`/`macos` (`config.os` selects it; the two
  channels mirror each other flag for flag). `/pnp:review` resolves the class's row once and
  dispatches either the Codex wrapper (`scripts/native/ps/codex-review.ps1` /
  `scripts/native/sh/codex-review.sh`, same `-Class` / `--class`) **or** the `reviewer` Claude
  subagent (`Read/Grep/Glob` only). Adversarial code/design review; reports `pass` /
  `pass-with-notes` / `fail` per `review.md` (a plan-readiness pass returns a findings
  table and a `BLOCKERS:` line instead); never edits. On the **codex** host the read-only boundary
  is a hard OS cell (`--sandbox read-only`); on the **claude** host it is tool-availability + Gate 1
  + convention + git reversibility, with NO OS cell.
- **QA** - read-only, **engine-neutral** the same way: `/pnp:qa` dispatches either the Codex wrapper
  (`scripts/native/ps/codex-qa.ps1` / `scripts/native/sh/codex-qa.sh`) **or** the `qa` Claude
  subagent, **only** when the ticket has observable runtime/UI behavior. QA is an **artifact
  judge**, not a live browser: a Codex-launched browser cannot run under the read-only sandbox
  (`docs/QA_BROWSER_INVESTIGATION.md`), so the browser lives in the **test runner**. The spec-flow:
  the **Writer** authors/extends an E2E `.spec` from the acceptance criteria -> **the orchestrator**
  runs the configured runner over the ticket's scope -> **QA** reads the artifacts (JSON report,
  screenshots, traces) and reports `pass` / `pass-with-notes` / `fail` (or a precondition `BLOCKED`
  when the artifacts are missing/unreadable). Same boundary per host as the Reviewer. QA never starts
  a dev server and never drives a browser.
- **QAL** - live agentic-browser Codex via `scripts/native/ps/codex-qal.ps1` /
  `scripts/native/sh/codex-qal.sh` (wrapped by `/pnp:qal`), **codex-only**. The **operator-gated
  exception**: runs **only after an explicit operator request in the current conversation** and only
  when `roles.qal.enabled` is true - never on the orchestrator's own initiative. It runs **without an
  OS sandbox** (`--sandbox danger-full-access`, the minimal non-bypass flag that runs a
  Codex-launched browser; `--dangerously-bypass-approvals-and-sandbox` also strips the approval
  mechanism; neither is "safe") in a throwaway scratch cwd with a disposable browser profile - hygiene,
  not a guarantee; its "never writes the repo" is a convention, not a cell. QA stays the default.
- **Arbiter** - not a loop role: an on-demand, cold-start second view opened through `/pnp:arbiter`
  on a fired escalation trigger, read-only on the tree; the doctrine is `ORCHESTRATOR.md`
  § Escalation and the arbiter.
- **Operator** - the human; the sole authority for commit approval, push, merge, branch switches,
  destructive/system-changing operations, and for authorizing a QAL (unsandboxed live-browser) run.

The ticket boundary (~400k tokens, a heavy ticket, a ticket's reading, the session brief): § The
ticket boundary below; a readiness cycle in a fresh session: `plan.md` § Plan readiness review.

**Reading is not a shell job (all roles).** Read or inspect files and config with the Read/Grep/Glob
tools, not shell commands (`cat`/`head`/`node -e`/shell loops) - the shell is for execution
(tests/git/build). Editing is not a shell job either: change tracked files with Edit / Write, never
`sed -i`, a heredoc or a redirect - a shell edit can stall on a dialog nobody is watching, and a file
whose text names a gated git verb trips Gate 4 when written through the shell. No command carries a
`cd` prefix: it runs from the repository root and reaches a subfolder with the tool's own flag -
the habit guard (`docs/LOOP.md` § Enforcement of Writer-only writes) denies the prefix, since Claude
Code's working-directory variable returns only the main session to the root and no migration op
carries it.
Surgical edits over rewrites: a file is never rewritten whole when the result is the same, and a
whole-file restructure that is needed is announced in one line first, with its reason. A command
expected to run over about five minutes runs in the background for every role, with a timeout of at
least 3600000 ms, awaited by its notification; a run killed by the cap is not restarted but
reported, and every brief repeats this. Auto mode refuses Edit/Write-tool edits to
`.claude/settings.json` and `.claude/hooks/**`, even with the operator's word: the COO asks the
operator to switch auto mode off in its first reply, and if still blocked stops and explains - never
a bypass through `sed`, a heredoc or a redirect; the operator may hand-edit from the COO's exact
lines. The update engine's own config write is a different case: `/pnp:update --apply` was observed
running through under auto mode, so an apply does not ask in advance for auto mode to be switched
off; a host that does refuse it is handled by `/pnp:update` Step 3 (run it again in a mode that
asks). The
Writer's reply is its report, and it is short - about 25 lines: blockers, deviations, failed checks
and the VERIFY exit codes, with no separate handoff document. The diff stays in the tree, where the
COO reads it whole.

## Loop shape and its overrides

The loop's *shape* is project-configurable; the *gates* are not.

Configurable in your project's overrides document (`paths.overridesDoc`), with the seeded defaults:
one reviewer rather than two; a correction-round cap of `loop.correctionRoundsCap` (factory 2)
instead of the generic low-4 / medium-8 / high-12 caps; R1 uses no orchestration loop; QA is
conditional (only when a brief declares observable runtime/UI behavior, never in R1 or non-runtime
R2). A rule record in the overrides document carries its marker - `(operator rule <date>)`, or
nothing when it is the COO's generalisation - not its story: the wording, the occasion and the
evidence live in one row of the transfer surface.

Configurable in `aiwf.config.json` and shown by `/pnp:roles`: the **audit table** - `review.plan`,
`review.code` and `review.docs`, one row per review class. A row carries `passes` alone and
INHERITS the Reviewer role whole (engine, model and effort), or names its own host. Factory: `plan
2`, `code 1`, `docs 1`, all inheriting the Reviewer. The table does NOT contain the fact-check gate
nor the mechanical plan gate; neither is configurable.

Not configurable:

- **A plan-class pass does not start without a current stamp** over a folder that meets its
  mechanical contract (`plan.md` § Plan readiness review).
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

## Fail aggregation

Reviewer and QA must return ALL visible material problems in a single round; a later round may not
raise a blocker that was already visible earlier (the role's side: `review.md` § Fail aggregation
(both roles)).

**In the plan-readiness cycle the mechanism is HANDING the list:** the pass-2 brief carries
`<plansDir>/readiness/<ABBR>/round-1.md` verbatim - the findings and the COO's dispositions - and a
verification pass after a code correction round carries the previous pass's blockers the same way.
Every NEW finding then declares why it was not visible before; a finding with no declaration is a
contract violation, reported separately from the table.

## The ticket boundary

About 400k tokens of context is a ticket boundary and a guide, not a target: there the COO finishes
the current ticket - commit and record - and the next ticket starts in a new session. A context
checkpoint is a project's own addition; the payload ships none. A heavy ticket moves to a fresh
session on the operator's word, never on the COO's alone. A ticket's session reads the plan's shared
sections - the index and the decisions - and its own ticket file, not the other tickets. No session
brief is offered when the state is durable: once the record, the memory and the transfer surface are
complete the COO says "new session, `/pnp:mission`", and a brief is offered only mid-flight - an
unfinished ticket, an uncommitted diff, decisions spoken but not recorded.

## Durable development history

Items 1-3 of the PLAN's list and the ledger: `plan.md` § Durable development history. The archive
of a finished plan and the roadmap writes close this section, below item 5.

4. after each ticket is accepted, its durable completion record: actual changes, material
   decisions/deviations, verification results, Reviewer/QA conclusion, commit hash, and remaining
   debt - in a folder plan the file `records/<REF>.md`, with the index's ticket row closed. The COO
   writes this record **immediately after the ticket's commit, in the same session,
   unprompted** - a ticket is not closed without it. The record is written on the skeleton
   `templates/briefs/record.md`, its `## Measurements` row filled at the close; the ticket's
   rule-class events - a violation, a catch, an operator correction - are rows of its `## Events`
   section, not of the ledger. Two acts ride the
   record: evidence worth keeping moves from the scratch directory into the record or the plan's
   `readiness/<ABBR>/`, and then the scratch directory (`paths.scratchDir`) is emptied of everything
   but the route state and the files of a ticket or plan still in flight - this ticket's files and
   any leftover of earlier work alike - with no chat question: the delete dialog is the gate.
   **Before a delete in the scratch directory every file is kept or moved first:** its content is
   found standing in the tree - checked by a grep of its headings and items, never by its name - or
   it is moved into git first: ticket evidence to the record or `readiness/<ABBR>/`, anything else
   beside the plan it belongs to, a ledger row when it belongs to no plan. A file whose content
   stands nowhere else is never deleted unmoved. The record names, per file, where it moved or
   where it already stood. The
   session's own temporary directory outside the repository is not covered; agents delete there
   freely. And the COO says in one line whether the next
   ticket stays in this session or wants a fresh one - a recommendation, not a stop: compaction is
   tolerable inside a ticket, while a plan's planning and readiness are not a boundary. The record
   lands in its own docs commit, separate from the code commit. A ticket whose outcome is visible in the running product
   closes only after the operator's own run on a real input, their words recorded in the record;
   offline proof never replaces it. **A number describing the state of the system is
   measured or it is not stated:** anything a reader may rely on as a current fact and regress
   against - tests passed or skipped, timings, sizes, coverage, benchmark results - carries the
   command that produced it or does not go in at all, and arithmetic over two real measurements is
   not a measurement; a file count on disk is not a runner count either - the collected figure comes
   only from running the suite and reading its summary line. Numbers describing the history of the work (blockers in a round, correction
   rounds) are narrative anchored to the record and not covered; nor are identifiers, versions,
   dates, line references and design constants;
5. the final Mission outcome and next durable follow-up. **Write a closeout ticket in two
   separable halves.** The durable half - platform canon, factual corrections, anything true
   whether or not the mission ends - lands on its own. The irreversible half - the `CHANGELOG.md`
   release block, the version bump and its tag - is kept apart, so a mission that turns out not to
   be closing costs nothing. The version bump is made by hand, never by a hook, and the release tag
   takes its own operator word, which also covers pushing the tag.

**A plan that is 100% executed is archived immediately.** The moment every ticket in a PLAN
carries a closed status and its completion record, the COO moves it from `<plansDir>/active/` to
`<plansDir>/archive/` - in the same session, unprompted, as the last act of closing the final
ticket. Archive name: `<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>.md`, `NNN` the next free sequence number, the
date the day of ARCHIVING; `git mv` preserves the history. A folder plan moves as a DIRECTORY
under the same grammar: `git mv <plansDir>/active/<ABBR>/
<plansDir>/archive/<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>/`. `<plansDir>/readiness/<ABBR>/` is not moved.
The plan's line under the ledger's `## Plans` is rewritten to the archive path, and the archiving of
the last plan of a roadmap entry takes the entry out of `<plansDir>/ROADMAP.md`: the roadmap holds
only live entries, and an idea dropped before its plans are done leaves it with one ledger row
`<ABBR> dropped: <why>`. **The roadmap is written at exactly three entry events, plus the two
list writes below, and never otherwise:**
(1) an entry is born -> `Status: idea` (`researching` when `/pnp:plan` dispatches the research
agents); (2) a plan lands in `active/` -> `Plans:` gains it, `Status: planned`, and the first
ticket's dispatch - the moment the COO writes `.aiwf/route-state.json` - sets `Status: in
progress`; (3) the last plan under the entry is archived -> the entry leaves the roadmap. **An entry
may be an area** - a module or theme whose goal is "no known open defect" - whose `Scope: in -` list
collects the findings born during work, one indented line each (`<date> <origin> - <what>
[<pointer>]`), until the list is worth a plan; the plan is born over the list and its tickets come
from the lines. That list is the fourth write: it grows at a finding's birth. The fifth write closes
a line: when the commit that closes a finding lands, its line is marked `done <pointer>` or removed.
`Status` and `Plans` change at the three events only. An installation older than the roadmap ports
its live candidates once - each row to an area or goal entry, the old row marked `taken up -> ROADMAP §
<ABBR>`, `done` or `dropped: <why>` - and from then on reads the roadmap alone for open work. Archiving also greps the plan's process sections for rule-class points without a pointer row -
fail-capable, with a positive control (the grep run once over a plan known to carry such a point,
seen to report) - the backstop under guard (h) (`ORCHESTRATOR.md` § Operator-interaction guards).
The trigger is the checkable fact - every ticket closed, every verify green. Archiving is
bookkeeping, reversible with one `git mv` back, and NOT part of the irreversible half (item 5
above).

<!-- project additions -->
<!-- /project additions -->
