# 0036_planning-briefs-and-verify-owner

**The planning briefs carry what the first measured multi-service plans taught; the Writer runs only
what it adds and the ticket's VERIFY rows are the COO's; the fact-check gate is cheaper; two stale
"brief on stdin" sentences are corrected.**

## What changes

- `templates/briefs/research.md` - the transactional read: a function the goal changes that holds a
  transaction, a lock or more than one write is read whole, and section 2 carries one
  `read | lock | write` row per site with its `file:line`; everything else stays a pointer read.
- `templates/briefs/planner.md` - a `VERIFY COMMANDS` slot the COO fills verbatim from
  `aiwf.config.json` (`verify.commands`, `verify.e2e.runner`); the `CLOSING GREPS` block (per set:
  the grep, the hit count, the hits) is copied by the planner into the index under `## Closing
  greps`, so the enumeration sits in the stamped folder.
- `templates/briefs/readiness-codex.md` - the auditor verifies the enumeration against
  `## Closing greps` instead of re-deriving it, and asks for the read / lock / write rows of every
  transactional function the plan changes.
- `plan.md` § Plan readiness review - "Triage and the round file": a finding that opens new surface
  takes `deferred to the next plan` or `asked`, never `fixed` by expansion; "Pass economy": a
  mechanism admitted into the plan after such a finding restarts the readiness count with a cold pass
  over the whole re-stamped folder (the word that admits it is the word for that pass).
- The Writer agent (`templates/agents/writer.md.tmpl`) § VERIFY and § Done contract, and `ticket.md`
  § Role boundaries - the Writer runs only the tests it adds (red, then green) and the commands its
  brief names; the ticket's VERIFY rows run once, by the COO or its check agent, at the handoff -
  what `work.md` § Tests already said.
- `ticket.md` § Role boundaries - when auto mode refuses a write, the COO asks for a mode that asks;
  it never asks the operator to open and edit a file by hand.
- `/pnp:review` Step 2b and `ticket.md` § The COO write boundary - the fact-check gate checks only
  cross-reference claims on a code-class diff, extracts the claim list with `haiku` before the `sonnet`
  verification when the prose is long, skips a few-line pointer-free prose delta (the COO's own read,
  recorded), and compresses its reply to the FALSE and UNVERIFIABLE rows.
- `AGENTS.md` and `review.md` - the brief arrives through the brief file (`-BriefFile` /
  `--brief-file`), stdin the fallback (the wrappers' form since 0.3.7); `AGENTS.md` names the rendered
  core and stage files among the project's canon.
- `templates/PROJECT_OVERRIDES.md.tmpl` - the seeded "Restate scope" line no longer asks for a
  confirmation before the first change, which contradicted guard (b).

## What this migration does

- Five `rerender-managed-region` operations: `.claude/aiwf-native/doctrine/plan.md`,
  `.claude/aiwf-native/doctrine/ticket.md`, `.claude/aiwf-native/doctrine/review.md`,
  `.claude/agents/writer.md`, `AGENTS.md`.
- One `note` (`planning-briefs-and-verify-owner-0-3-11`): `/pnp:update` prints it with the CHANGELOG
  block of 0.3.11.

## What it leaves alone

Every config key, the ask-ruleset, every operator-owned file - the installed overrides document
included: a seed is written once, so an installation that carries the old "Restate scope ... confirm it
before changing anything" line keeps it until its operator rewords or deletes it. The additions blocks
of the five re-rendered files are carried.

## Superseded local rules

The CHANGELOG's `Retires local rules:` line names them: a planning-COO rule set whose first three rules
(the whole read of a transactional function; the closing greps copied into the plan; the project's
commands quoted from the config), a "finding that opens new surface" rule, and a "who runs VERIFY"
rule in the Writer agent's additions block. A fourth planning rule that verifies data claims on a
project's real database, and a "side-by-side tickets" rule, stay local: the first is project-specific,
the second waits for the plan gate (ROADMAP § GATES).
