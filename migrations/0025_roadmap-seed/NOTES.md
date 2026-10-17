# 0025_roadmap-seed

**An installed project gets its roadmap file, and the three rendered files whose templates changed
since 0.2.20 are re-rendered: plan folders, the `/pnp:plan` cycle, the findings table of a plan
pass.**

## What changes

- `<plansDir>/ROADMAP.md` - the roadmap, one entry per idea - reaches an installation set up before
  setup seeded it. It is seeded once and then yours: nothing records it, hashes it or rewrites it.
- The managed `CLAUDE.md` region says that Gate 2 in `off-plan` mode is also silent for a ticket of
  an `<ABBR>/` plan folder under `<plansDir>/active/`.
- `.claude/aiwf-native/ORCHESTRATOR.md` names the planning cycle - research, decisions, the planner,
  the mechanical gate, one readiness pass and its triage - as `/pnp:plan`, in place of the
  `/pnp:review` steps it used to point at.
- `.claude/agents/reviewer.md`, where the installation has one: a plan-readiness pass takes no diff,
  reads the plan folder its brief's `PLAN:` line names and returns one findings table and a
  `BLOCKERS: <n> INFO: <m>` line, with no `PASS` / `NEEDS-FIX` verdict of its own.

## What this migration does

Four operations, nothing else. One `seed-file`: `templates/ROADMAP.md.tmpl` to `<plansDir>/ROADMAP.md`
(the `<plansDir>` this project configures), written only when the file is absent, kept byte for byte
when it is there, and never recorded. Three `rerender-managed-region`: the `aiwf-core` region of
`CLAUDE.md` and `ORCHESTRATOR.md` on every installation; the Reviewer agent only where the
installation has it (`ifRecorded: true` - a codex-hosted role has no agent file). No `note`: the
CHANGELOG block of this version is what an update prints, and its `Retires local rules:` line names
the rules below.

## Superseded local rules

This release retires seven project-local rules; the payload now carries what they did. Delete your
copies from your overrides document in one sitting, on your operator's word:

1. readiness mechanics - the delta consequence scan and the delta fact-check;
2. chain-trace in the evidence pack;
3. the plan is read by sections;
4. the blockers of the previous ticket enter the next brief;
5. readiness symmetry;
6. a turn of its own is not a stop;
7. the checkpoint rules the session rule replaces.

An edit you made inside one of the three re-rendered files is overwritten by this update: move the
text you want to keep into the file's project additions block or into your overrides document BEFORE
running `/pnp:update`.
