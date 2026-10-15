# 0022_stab-prose

**Doctrine text tightened where consumers found it silent or wrong.** Every change is one to three sentences inside an existing section; no hook, matcher, ask rule, schema key or script changes.

## What changes

- **Editing is not a shell job either** (`docs/LOOP.md`, the managed `CLAUDE.md` region, the Writer agent): tracked files change through Edit/Write, never `sed -i`, a heredoc or a redirect. A scan agent returns its result in its reply; a procedure agent that must leave a file writes it only under the scratch directory (`docs/WORKFLOW.md` § COO owns broad scans). A permission gate is made to fail on a copy, never by weakening the live gate.
- **Dialogs and the channel** (`docs/WORKFLOW.md` § The operator does not arbitrate engineering decisions and § How the COO speaks to the operator, `ORCHESTRATOR.md` § The operator-channel filter): a dialog is named by what it approves, never by which button to press; passes are named by role, number and engine; a verdict names who gave it; a question that stops work is raised only when the ticket cannot continue without it, the rest is asked at the ticket's close; a blocker beyond the business scope goes to the operator early.
- **Passes** (`docs/WORKFLOW.md` § Loop shape, `/pnp:review`, `/pnp:qa`, `/pnp:loop`): a correction round is counted from an auditor's verdict; a small code round answering a Reviewer `fail` (at most ~10 lines, in audited files, with a unit test seen red) warrants no verification pass unless it touches migration, access policy, grants, auth or the permission model, and a QA `fail` is closed only by a QA run; a paid pass that dies is resumed only on the operator's word; the review brief is written before the dispatch, in a separate tool call; a paid review beyond readiness and the diff audit is written into its plan with scope and cost.
- **Plans and close** (`docs/WORKFLOW.md`): each ticket records its COO routing in one line; the Writer commits code and the COO commits its own records; at a ticket's close the scratch directory goes back to the live mechanics and the COO recommends staying in the session or a fresh one; every claim relayed to the operator is checked first or marked unverified; a product named in a request is not a path.
- **Smaller**: several Writers may share one ticket over disjoint files; a long command runs in the background; a test that cannot fail is a finding; the `/pnp:mission` resume point is rewritten whole; an incident recorded only in memory is not recorded; `/pnp:roles` and `/pnp:update` say what to do when the host refuses a self-modifying write.

## What this migration does

- **Re-renders** the managed `CLAUDE.md` region, `.claude/agents/writer.md`, `.claude/aiwf-native/ORCHESTRATOR.md`, and `.claude/agents/reviewer.md` where your installation has it (a codex-hosted Reviewer with no claude row has none, and that operation is reported as skipped). An installation that never edited these files gets the new render silently; an edited file raises the usual conflict question; an artifact held through an override is not applied - the new render is recorded as upstream.
- **One `note`** saying the above.

## Superseded local rules

A local rule for editing only through Edit/Write, for dialogs only when the ticket cannot continue, for counting correction rounds from a verdict, for the small round without a verification pass, for a paid pass that died, for naming passes, for the COO routing line, for who commits what, or for cleaning the scratch directory at close can be removed or become a one-line pointer to `docs/WORKFLOW.md` or `docs/LOOP.md`.
