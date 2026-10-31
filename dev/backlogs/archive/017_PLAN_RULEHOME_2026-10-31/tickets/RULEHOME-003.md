# RULEHOME-003 [consumer] - the Silerax harvest, removal and diet against 0.3.7

Implements: D-02, D-07, D-08, D-09, D-10; uses the answer of D-05 (b).
COO: Fable - because check 2, check 4.
Branch: `main` here; Silerax's own branch there. Depends on: 0.3.7 pushed and Silerax on it (D-02).

## Outcome

D-07 done: harvest here, one marker line there, the overrides dieted, memory rule-free, Retires
0.3.1..0.3.7 swept.

## Scope

Through the live Silerax session the operator names; this session reads `D:\Stratex`, writes only
here (D-07). Silerax lines below are at `9020e8c3` (RESEARCH § S2) and drift: step 1 re-anchors
every one before it is acted on. Step content: the index § RULEHOME-003 procedure.

1. Re-scan the delta from `9020e8c3`; read RESEARCH § S1 and § S2 whole first (D-08).
2. Harvest, one cut-off (`<date> <hash>` of Silerax HEAD): `D:\Stratex\dev\backlogs\COO_SELF_ANALYSIS.md`;
   every plan-less and `pnp-candidate` row of `D:\Stratex\dev\backlogs\LEDGER.md` (the latter
   :71-76, :80-81, :88, :103); the incident files of `C:\Users\dyosi\.claude\projects\D--Stratex\memory\`
   -> `dev/backlogs/active/RULEHOME/records/silerax-harvest/`, each PnP idea one disposition. Ends
   with the harvest commit HERE, through its dialog.
3. Only after that commit, remove there: the self-analysis file and its rule
   (`D:\Stratex\dev\PROJECT_OVERRIDES.md:671-674`); the harvested ledger rows, one line left:
   `harvested by PromptAndPray RULEHOME through <date> <hash>, landed <harvest commit hash>`; the
   incident memory files.
4. Diet of `D:\Stratex\dev\PROJECT_OVERRIDES.md` into `silerax-harvest/diet.md`. It OPENS with ONE
   operator dialog over the conflicts - mockup vs code authority, M6 DB checks vs the prod confirm,
   400k vs 950k/1000k, which roadmap, English-everywhere vs Bulgarian, counterparty vs supplier,
   "never write dates" vs the dated markers - each answer in `diet.md` before any diet edit. Then a
   row per overrides line of the index § RULEHOME-003 diet pointers and per Silerax memory file;
   homes `D:\Stratex\.claude\aiwf-native\ORCHESTRATOR.md` and `D:\Stratex\.claude\agents\writer.md`
   project additions; the three dangling links resolved; the Silerax COO's docs commit. A SEPARATE
   Silerax code-class item - its Writer, review route and commit dialog: the cited titles in
   `D:\Stratex\.claude\hooks\long-command-guard.mjs` and `context-gate.mjs`, the dead pointer of
   `D:\Stratex\.claude\agents\fable-auditor.md`. `.claude/rules` only if D-05 (b) passed.
5. Sweep every `Retires local rules:` line of `CHANGELOG.md` 0.3.1..0.3.7 against the overrides,
   the memory and the `D:\Stratex\CLAUDE.md` operator zone: duplicate / contradiction /
   project-only, a table in `records/RULEHOME-003.md`.

## Acceptance

Silerax rows run in the Silerax session from `D:\Stratex`, reported verbatim; the `git diff ...
HEAD` row runs BEFORE the commit (empty after it); the output after the dash means broken.

- `git ls-files dev/backlogs/COO_SELF_ANALYSIS.md` - any output.
- `git grep -c -F "harvested by PromptAndPray RULEHOME through" -- dev/backlogs/LEDGER.md` - any count but 1.
- `git grep -n -F "pnp-candidate" -- dev/backlogs/LEDGER.md` - a row dated on or before the cut-off.
- `git grep -n -F "COO_SELF_ANALYSIS" -- dev/PROJECT_OVERRIDES.md CLAUDE.md AGENTS.md .claude` - any hit (readiness and archive are history).
- Grep `feedback-surgical-edits|feedback-scope-question-early|feedback-operator-role` over `C:\Users\dyosi\.claude\projects\D--Stratex\memory` - any hit.
- for each `diet.md` row with a new home: `git grep -n -F "<its key phrase>" -- <new home>` - no hit; the same phrase over `dev/PROJECT_OVERRIDES.md` - a hit.
- `git grep -n -F "operator rule" -- dev/PROJECT_OVERRIDES.md` - a hit with no `diet.md` row.
- Here: `git ls-files -- dev/backlogs/active/RULEHOME/records/silerax-harvest` - `COO_SELF_ANALYSIS.md`, `ledger-rows.md`, `diet.md` or `memory/` missing.
- Here: a `pnp-candidate` or "For PnP" row of `silerax-harvest/ledger-rows.md` with an empty `disposition` column, or a `roadmap: <area>` with no line on that `dev/backlogs/ROADMAP.md` entry.
- Here: `git log --format=%H -- dev/backlogs/active/RULEHOME/records/silerax-harvest` - empty, or without the hash Silerax's marker line carries.
- Here: each file of `C:\Users\dyosi\.claude\projects\D--Stratex\memory` (Glob) - its name absent from `silerax-harvest/diet.md` § Memory.
- Here: `silerax-harvest/diet.md` § Conflicts - fewer than the 7 conflicts of step 4, or a row with an empty `answer`.
- Here: `git diff --name-only HEAD -- docs skills templates scripts schema hooks migrations examples .claude-plugin` - any path.

## Risk threshold

Blocks: a rule lost - deleted with no new home, no retire verdict and no operator answer; a
harvested row or file deleted in Silerax before its copy is here; a write in `D:\Stratex` from this
session; a memory file still carrying a rule; a contradiction resolved by neither a D-NN, the
payload nor the operator; a Silerax hook edited outside its code-class route; D-09: a rule the COO
and the Writer both obey moved into one role's block. Notes: phrasing.

## Stop condition

A Silerax rule whose disposition is not decided by a D-NN or the payload goes to the operator; the
row waits, the rest goes on. Silerax not on 0.3.7, or no live Silerax session named: do not start.
Stop after the harvest commit here and Silerax's two commit classes; the next analysis starts at
the cut-off (DECISIONS § Deferred).

## Verify

No suite: `dev/` only (overrides § Architecture direction :116). The Acceptance rows with their
output, the Silerax ones as reported, into `records/RULEHOME-003.md`.

## Code Map

| path | role |
|---|---|
| `dev/backlogs` | the harvest destination `active/RULEHOME/records/silerax-harvest/` |
| `dev/backlogs/ROADMAP.md` | the dispositions' area lines |
| `CHANGELOG.md` | read: the Retires lines 0.3.1..0.3.7 |
| `templates/ORCHESTRATOR.md.tmpl` | read: the COO additions block |
| `templates/agents/writer.md.tmpl` | read: the Writer additions block |
| `docs/WORKFLOW.md` | read: the payload contradictions resolve to |
