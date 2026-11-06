# PLAN_GATES - the enforcement hooks carry the broken habits, and the Codex wrappers print less
Tickets: 5 - four mechanisms in four homes (the habit guard, Gate 1, the plan gate, the wrappers), each with its own pins and its own one-commit cut, plus the release ticket (DECISIONS D-10)

The plan of the roadmap entries `GATES` (all four items) and `CODEX` (three output items) in
`dev/backlogs/ROADMAP.md`. One folder: this index, `DECISIONS.md` (D-01..D-11), `RESEARCH.md` (two
scans of 2026-11-06), `tickets/GATES-NNN.md` (the frozen contract), `records/GATES-NNN.md` (written at
each ticket's close). Operator word 2026-11-06: „Един план върху ROADMAP § GATES и § CODEX, с
деклариран брой тикети, release 0.3.12." (one plan over ROADMAP § GATES and § CODEX, with a declared
ticket count, release 0.3.12).

## Goal

A rule sessions keep breaking in one shape is carried by a hook, and no hook refuses a legitimate act
outside the repository: the habit guard denies every `git -C` and reads through a leading call
operator or block opener (D-01, D-02); Gate 1 lets a non-writer subagent write outside the project
root and nowhere inside it (D-03); the plan gate refuses tickets declared side by side whose Code Maps
share a path (D-04); the review and QA wrappers send the engine's stream to a log outside the
repository, print the verdict from codex's `-o` file, a capacity line and a labelled token figure
(D-05..D-09). Released as 0.3.12 (D-10), each code ticket R2 with one Codex code pass (D-11).

## Scope

In:
- GATES-001 the habit guard (D-01, D-02) - its worklist A1-A6 in the ticket's `## Scope`.
- GATES-002 Gate 1 outside the root (D-03) - its worklist B1-B4 in the ticket's `## Scope`.
- GATES-003 the plan gate's side-by-side lines (D-04) - its worklist C1-C4 in the ticket's `## Scope`.
- GATES-004 the review and QA wrappers' output (D-05..D-09) - its worklist D0-D7 in the ticket's
  `## Scope`.
- GATES-005 the release 0.3.12: migration `0037`, the bump, the changelog, the self-install (D-10).

Out: everything under DECISIONS § Deferred (the Gate 1 reference parity, deeper nesting, the kept
`git -C <projectRoot>` ask rules, a token increment, QAL's output, the other § CODEX items); the fail
direction of every gate (overrides § Architecture direction); the consumers - a consumer takes 0.3.12
through `/plugin update` + `/pnp:update` in its own session, and deletes its retired local rule on its
own operator's word.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| GATES-001 | the habit guard denies every `git -C` and reads through a leading operator | D-01 D-02 D-11 | closed `4122b27` | `records/GATES-001.md` |
| GATES-002 | Gate 1 passes a non-writer's write outside the project root | D-03 D-11 | closed `2c1ad1d` | `records/GATES-002.md` |
| GATES-003 | the plan gate refuses side-by-side tickets whose Code Maps share a path | D-04 D-11 | open | - |
| GATES-004 | the review and QA wrappers: the stream to a log, the verdict from `-o`, capacity and tokens lines | D-05 D-06 D-07 D-08 D-09 D-11 | open | - |
| GATES-005 | release 0.3.12: migration 0037, the bump, the changelog, the self-install | D-10 D-11 | open | - |

## Order and gates

Order 001 -> 002 -> 003 -> 004 -> 005, sequential (D-10): every code ticket edits
`scripts/selfcheck/aiwf-selfcheck.js`, and 001-003 also `scripts/spike/run-spikes.mjs`, so no two of
them are side by side (D-04).

- **GATES-001 .. GATES-004**, each: the operator's word for the ticket (the planning word is not it,
  D-11); the Writer dispatched with `Ticket: GATES-00N` on its own line (Gate 2 silent, the ref is in
  an active plan); the scope guard `HEAD <hash>` at the dispatch; the COO runs the ticket's Verify rows
  ONCE in the background at the hand-back, beside the full diff read; Codex code pass 1 of the audit
  table's code row rides the ticket's word, any further pass takes its own word; the code commit
  through its native dialog (`Refs: GATES-00N`); the live copy refreshed after the commit (root
  `CLAUDE.md` § This repository is the plugin); the record `records/GATES-00N.md` (GATES-004's carries
  D-07's measured run).
- **GATES-005**: the operator's word; the Writer (`Ticket: GATES-005`); Codex code pass 1 on that
  word; the release commit through its dialog; the live copy refreshed; the self-install
  `/pnp:update --apply` by the COO on the operator's word, its embedded selfcheck the release's proof;
  the record and close commit through its dialog (the plan archived at once, guard (e)); then the tag
  word and the push word - the tag created locally on the record commit and pushed with `main` in one
  push (overrides § Hard rules, release discipline).

## Closing greps

(run 2026-11-06 over the repository outside `dev/`, `.aiwf/`, `.git/`; history files - `CHANGELOG.md`, `CHANGES_*.md`, `migrations/*/NOTES.md`, `migrations/*/ops.json` - are listed by count only and never edited; `.claude/*` rendered copies move by the release re-render, not by hand)
- set `HABIT_DIRECTORY_CHANGERS` - 2 hits: `scripts/engine/pretooluse-git-verb-guard.js:544` (the array), `:617` (the only reader)
- set `gitDashC` - 2 hits: `pretooluse-git-verb-guard.js:535` (the HABITS entry), `:618` (the match)
- set `HINT_DIRECTORY` - 2 hits: `pretooluse-git-verb-guard.js:528` (the constant), `:534` (HABITS.cd)
- set "five shapes" (the count the habit guard states) - 4 hits: `docs/LOOP.md:121`, `pretooluse-git-verb-guard.js:516`, `scripts/spike/run-spikes.mjs:517`, `:595`
- set `Push-Location` in the payload - 0 hits (no existing handling)
- set `git -C` - 82 hits in all (re-run 2026-11-06, round-2 I2: matching lines over the repository outside `dev/` and `.aiwf/`; 81 before); the live ones: `templates/settings.ask-ruleset.json:5,66-68,120-122`; `hooks/hooks.json:2`; `README.md:48`; `docs/OPERATOR_PROTOCOL.md:66`; `docs/LOOP.md:82`; `templates/ORCHESTRATOR.md.tmpl:524`; `scripts/engine/aiwf-lib.js:21,43`; `pretooluse-git-verb-guard.js:25,67,179,206,217,491,700,704`; `scripts/spike/run-spikes.mjs:414,443,444,446,481,576,577,587,604`; `scripts/selfcheck/aiwf-selfcheck.js:1486,1612-1619,1685,1776,1779,1866,1877,1935,1989,2022,2137,9143,9152`; `scripts/setup/test-setup.mjs:1430-1431`; rendered copies `.claude/settings.json:59-61,113-115`, `.claude/aiwf-native/aiwf.config.json:69-71,123-125`, `.claude/aiwf-native/ORCHESTRATOR.md:510`; history: `CHANGELOG.md` 7, `CHANGES_*.md` 3, `migrations/` 8
- set "non-writer subagents cannot write" - 6 hits: `scripts/engine/pretooluse-mutation-guard.js:397` (the deny text), `aiwf-selfcheck.js:677` (section title), `run-spikes.mjs:635` (section title), `hooks/hooks.json:2`, `schema/aiwf.config.schema.json:252,257` (descriptive text; corrected from 3 in round 1, I1)
- set `codemap-path-missing` (the token the side-by-side tokens stand beside) - 5 hits: `scripts/engine/plan-gate.js:53,522`; `aiwf-selfcheck.js:5067,5068,5279`
- set `declaredTicketCap` (the model for the new index-line reader) - 3 hits: `plan-gate.js:443,481`; `aiwf-selfcheck.js:5407`
- set "side by side" in the payload (re-run 2026-11-06, round-2 I2: `side[- ]by[- ]side` case-insensitive, matching lines outside `dev/` and `.aiwf/`) - 6 hits, all history or unrelated (`CHANGELOG.md:55,1262`; `CHANGES_0.2.2-to-0.2.3.md:10`; `migrations/0007_powershell-ask-ruleset/ops.json:12`, `NOTES.md:33`; `migrations/0036_planning-briefs-and-verify-owner/NOTES.md:60` names the Stratex local rule): no existing index grammar
- set `stream-purity` (the pins D-05 replaces) - 4 hits: `aiwf-selfcheck.js:3397,3658,3899,4605`
- set `Tee-Object` - 5 hits: `scripts/native/ps/codex-review.ps1:444`, `scripts/native/ps/codex-qa.ps1:404`, `aiwf-selfcheck.js:3396,3398,3401`
- set `codex-review: run` - 9 hits: `docs/CODEX_REVIEW_QA_RECIPE.md:119`; `skills/review/SKILL.md:477`; `aiwf-selfcheck.js:4343,5502,5558,5566,5581`; `scripts/native/sh/codex-review.sh:479`; `codex-review.ps1:468`
- set `codex-review: exit` - 12 hits: `docs/CODEX_REVIEW_QA_RECIPE.md:120`; `aiwf-selfcheck.js:4079,5503,5504,5559,5567,5581`; `codex-review.sh:486,488`; `codex-review.ps1:476,478`; `skills/review/SKILL.md:478`
- set "tokens used" in the payload - 0 hits; set "at capacity" - 0 hits; set `output-last-message` - 0 hits (no existing handling of any of the three)
- set `last-qa-session` (the QA twin's state file, unchanged by D-08) - 20 hits: `codex-qa.ps1:45,49,133,200,201`; `codex-qa.sh:40,44,178,251,253`; `aiwf-selfcheck.js:4262,4264,4265`; `docs/CODEX_REVIEW_QA_RECIPE.md:151,156`; `skills/qa/SKILL.md:293`; `CHANGELOG.md:233`; `migrations/0031_session-key/` 3

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 240,000 tokens (COO context 330,000 at the approval minus 90,000 at Step 1; both read from the statusline's ctx files, `pct * size / 100`) | 957,577 tokens |

Parts of the cycle spend, one per line, with the source of each value:
- research agent A (hooks and plan gate, sonnet) - 104,280 - notification
- research agent B (Codex wrappers, sonnet) - 107,748 - notification
- closing-greps agent (haiku) - 58,283 - notification
- planner (writer type; the first write and revisions 1-3, one live agent) - 265,540 cumulative - notification (the last one; the same agent across the whole cycle)
- runnability pre-pass agent (sonnet) - 74,057 - notification
- QA save/clear scan agent (sonnet, round-1 B4) - 59,853 - notification
- Codex readiness passes 1-3 (gpt-6-sol/xhigh; pass 1 cold, 2 and 3 resumed in the same session) - 287,816 - round header of `round-3.md`: the engine prints a running total over the session, so the session's last figure is the three passes' spend (round-1 105,488; round-2 172,490 cumulative); the per-pass increments are not derived
- the COO's own context: in column 1, not here

## Roadmap entry

From `dev/backlogs/ROADMAP.md` § GATES, verbatim:
- Goal: a rule that sessions keep breaking in the same shape is carried by a hook, and no hook refuses a legitimate act outside the repository
- Why: the 2026-11-03 harvest - `git -C` broken four times in three projects although a written rule forbids it, the habit guard bypassed by a nested form, Gate 1 refusing a scratchpad write twice (harvest S1, S6, F20, F41)

From `dev/backlogs/ROADMAP.md` § CODEX (the three output items this plan takes), verbatim:
- Goal: the three Codex wrappers keep their line endings under every git setting and use the tier agents once upstream is fixed
- Why: two recorded wrapper behaviours wait for an external event
