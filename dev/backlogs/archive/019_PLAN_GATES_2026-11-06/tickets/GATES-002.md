# GATES-002 [R2 code] - Gate 1 passes a non-writer's write outside the project root

Implements: D-03, D-11.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: GATES-001 committed (the
selfcheck and the spikes are shared files, D-10).

## Outcome

A non-writer subagent's Edit / Write / MultiEdit / NotebookEdit passes through only when every path
field present in its `tool_input` (`file_path`, `notebook_path`) resolves OUTSIDE the project root.
One field inside (the root itself included), a missing or unparseable field, or no path field at all
keeps the deny, byte-identical to today (D-03). `targetPathOf` and the main session's decisions do
not move.

## Scope

The worklist; every row at its `file:line`.

- B1 `scripts/engine/pretooluse-mutation-guard.js`: one helper from `:345-350` (`path.resolve` +
  `path.relative`; outside = `path.isAbsolute(rel)` or a first segment `..`), used by the main branch,
  which keeps its own `rel === ''` passthrough and its `targetPathOf` `:115-122` read (its behaviour
  byte-identical), and by the non-writer branch `:390-398`, against `projectDirOf()` `:95-98`: the
  branch reads every path field PRESENT in `tool_input` - `file_path` and `notebook_path`, an own
  property each - not `targetPathOf`, which returns the first non-empty one only (round-1 B5); it
  passes through (`lib.allowPassthrough()`) only when at least one field is present and EVERY present
  field is a non-empty string that resolves outside; a field inside, the root itself, a present field
  that is not a non-empty string, a `tool_input` that is not an object, or no path field -> the deny
  `:394-397` byte-identical. Header `:7-20`, `:45-48`: "inside the project root".
- B2 `scripts/selfcheck/aiwf-selfcheck.js` Gate 1 section `:677-730`: an Explore Write to
  `../outside.txt` and to an absolute outside path, a NotebookEdit `notebook_path` outside ->
  passthrough; an Explore Write inside -> the deny, byte-identical to the captured payloads `:711-722`;
  no target, and the root itself -> deny; a mixed payload (`file_path` outside, `notebook_path`
  inside) -> deny; an outside `file_path` beside a present `notebook_path` that is not a string ->
  deny; a named-fault control (the helper forced to "outside") turns the inside row red, and one
  (only the first field read) turns the mixed row red; title `:677` gains "inside the project root";
  main-session row `:2185` unchanged.
- B3 `scripts/spike/run-spikes.mjs` `gate1Cases` `:151`: the outside passthrough, the inside deny and
  the mixed-payload deny rows; title `:635`; the reference parity `:631` stays SKIPPED without
  `--reference` (DECISIONS § Deferred).
- B4 the descriptions, each gaining "inside the project root": `docs/LOOP.md:25-27`;
  `hooks/hooks.json:2` (round-1 I1). The schema descriptions `schema/aiwf.config.schema.json:252`,
  `:257` stay as they are: a non-writer still cannot write inside the root, so they stay true.

## Acceptance

From the repository root, on the Bash tool, `CLAUDE_PROJECT_DIR` the repository root (the session's
own); the output after the dash means broken.

- `echo '{"tool_name":"Write","agent_id":"a1","agent_type":"Explore","tool_input":{"file_path":"../pnp-gate1-probe.txt","content":"x"}}' | node scripts/engine/pretooluse-mutation-guard.js` - output containing `deny`.
- the same payload with `"tool_name":"NotebookEdit"` and `"notebook_path":"../pnp-gate1-probe.ipynb"`
  in place of `file_path` - output containing `deny`.
- the same payload with `"file_path":"scripts/pnp-gate1-probe.js"` - output without
  `[AIWF-N3 gate 1: non-writer subagents cannot write]`.
- the same payload with `"file_path":"."` (the root itself) - output without that tag.
- the same payload with `"tool_input":{}` - output without that tag.
- the same payload with `"file_path":"../pnp-gate1-probe.txt","notebook_path":"scripts/pnp-gate1-probe.ipynb"`
  (outside `file_path`, inside `notebook_path`; the expected output contains `deny`) - output without
  that tag.
- the same payload with `"file_path":"../pnp-gate1-probe.txt","notebook_path":42` - output without
  that tag.
- `git grep -n -F "may not write to the repo" -- scripts/engine/pretooluse-mutation-guard.js` - no hit
  (the deny text moved).
- `git grep -c -F "inside the project root" -- docs/LOOP.md scripts/engine/pretooluse-mutation-guard.js hooks/hooks.json`
  - a file with no hit.
- The selfcheck run of § Verify - exit != 0, or the B2 rows absent, or a named-fault control does
  not turn its row red; the spikes run - exit != 0.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: a non-writer write INSIDE the root passes, through any path field, or an unreadable /
unresolvable / unparseable target passes (a fail-direction flip, R3 - overrides § Architecture
direction); `targetPathOf` changed; the deny text changed by a byte; a main-session or Gate 3
decision changed (`:345-367`, selfcheck `:2176-2191`); Gate 3's route state read for a non-writer; any
schema change; a path or project name in the payload. Notes:
comment and description wording.

## Stop condition

Stop and hand back before writing when: the helper would change a main-session decision; a case
needs `realpath` or any resolution beyond `path.resolve` + `path.relative` (D-03 names those two); a
write tool names its target in a field other than `file_path` / `notebook_path`; a file outside the
Code Map must change. Stop after the hand-back; the commit follows the review, on the operator's
click.

## Verify

D-11's hooks row plus the union for a doc edit (overrides § Test policy): `selfcheck` (`node
scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`), `spikes` (`node
scripts/spike/run-spikes.mjs`) and `validate-payload` (`node scripts/update/validate-payload.mjs
--plugin-root .`), cwd `.`, once, by the COO in the background at the hand-back. Portion 1 only (Portion 2 is not a release
gate); runbook `dev/VERIFY_RUNBOOK.md`; logs outside the repository; a run over ~5 minutes in the
background with a 3600000 ms timeout. The Writer runs only the tests it adds, red then green.

## Code Map

| path | role |
|---|---|
| `scripts/engine/pretooluse-mutation-guard.js` | B1 |
| `scripts/selfcheck/aiwf-selfcheck.js` | B2 |
| `scripts/spike/run-spikes.mjs` | B3 |
| `docs/LOOP.md` | B4 |
| `hooks/hooks.json` | B4 |
