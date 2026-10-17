# RESEARCH - plan RBC (REBUILD plan C: measurement, doctrine compaction, two gate defects)

Two `sonnet` scan agents, 2026-10-17, read-only over the tree at `ba8d626`. Pointers, not prose; a
line number is what the agent saw at that commit and is re-verified by whoever acts on it. Base:
`archive/013_PLAN_RBB_2026-10-17/RESEARCH.md` (its line numbers are older; the surfaces here are
mostly new).

## Code Map (file -> role today)

| file | role |
|---|---|
| `scripts/selfcheck/aiwf-selfcheck.js` | provenance walk + its controls; plan-gate mutation matrix (M7/M8, ctl-7); cross-ref existence scan |
| `scripts/engine/plan-gate.js` | the mechanical plan gate: `MAX_TICKET_BYTES`, the six `TICKET_FIELDS`, `examine()`, the stamp |
| `skills/plan/SKILL.md` | `/pnp:plan`, Steps 0-6; Step 6 ends with approval and landing, no measurement |
| `templates/briefs/planner.md` | the planner contract; states the 6,144-byte cap |
| `templates/README.md` | says `briefs/` is read at run time, never rendered |
| `docs/WORKFLOW.md` | main doctrine, read in full at every session start |
| `docs/LOOP.md` | native mapping, read in full at every session start |
| `docs/REVIEW_CHECKLIST.md` | Reviewer/QA verdict rules, read by the review agents, not in the preflight |
| `docs/README.md` | the doc index, one bullet per document, no section names |
| `dev/PROJECT_OVERRIDES.md` | this repository's overrides, read in full at session start; § Loop shape |
| `dev/REBUILD.md` | the redesign document; § The session start cost |
| `dev/backlogs/drafts/PLAN_DOCT.draft.md`, `dev/backlogs/readiness/DOCT/` | the parked compaction plan and its analyses - input only |
| `.claude/hooks/context-gate.mjs` | self-install context hook; cites overrides § Loop shape by name |

## What the code does today

1. Provenance walk: `readdir(..., {withFileTypes:true})`; `.git` is skipped only when
   `isDirectory()` (`PROV_SKIP_DIRS = {'.git','node_modules'}`, any depth) - `aiwf-selfcheck.js`
   `provenanceWalk` and `PROV_SKIP_DIRS`. A `.git` FILE has no extension and is not in
   `PROV_TEXT_NAMES`, so it lands in `unclassified` and `provenance-scope` goes RED.
2. `D:\pnp-live\.git` is a gitfile (`gitdir: D:/promptandpray/.git/worktrees/pnp-live`): the live
   copy every session runs from fails fact 1 - the 1295/1296 row of `/pnp:update --apply`.
3. Root-only skips already exist (`PROV_SKIP_ROOT_FILES`, `PROV_SKIP_ROOT_HARNESS_FILES`, matched at
   `dir === root`); the sabotage table `PROVENANCE_CONTROLS` holds a "resembling root file stays RED"
   control (`.orphaned_at.bak`) - the model for "a `.foo` at root still red". The `.git`-directory
   control plants into a `.git` DIRECTORY of a `copyPayloadTree` copy (`sectionProvenance`).
4. Plan gate: `MAX_TICKET_BYTES = 6144` (`plan-gate.js`), counted as `Buffer.byteLength` of the
   WHOLE LF-normalised ticket file, `Status:` line included; problem token `ticket-over-bytes:<rel>`.
5. Real tickets carry ONE header line `Status: ... Branch: ... Depends on: ...` as line 4, before the
   first `## ` heading (`archive/012_*/tickets/*.md`, `archive/013_*/tickets/*.md`); RBA-001 also has
   a `Status:` inside a quoted example in its body. RBB-003 froze at 6138/6144 bytes (CANDIDATES
   ruling row).
6. The cap is pinned only in `aiwf-selfcheck.js`: M7 (6,145 bytes -> `ticket-over-bytes`), M8
   (exactly 6,144 LF bytes, written CRLF -> valid), helper `pgTicketOfBytes`, and ctl-7, which
   replaces the literal `const MAX_TICKET_BYTES = 6144;` textually. Stated in prose at
   `docs/WORKFLOW.md` § Plan readiness review (the mechanical gate), `skills/plan/SKILL.md` Step 5,
   `templates/briefs/planner.md`.
7. No completion-record template exists: the record's shape is prose in `docs/WORKFLOW.md`
   § Durable development history, item 4; real records use `## What landed`, `## Decisions and
   deviations`, `## Verification (what actually ran)`, `## Remaining debt`, `## Scratch`.
8. Nothing in the payload names the four measurement numbers. Sources today: the harness reports
   each subagent's tokens in its task notification (`subagent_tokens`); the Codex CLI's token line
   is what `round-N.md`'s header records; the COO's context size is visible only on the operator's
   statusline (the self-install hook reads `~/.claude/ctx/`, not payload).
9. Plan-gate and the self-check run from the plugin root; nothing renders them into a project, so a
   change to either needs no migration.
10. Doc sizes (`wc -l`, `wc -c`): WORKFLOW 1060 lines / 76,034 B; LOOP 346 / 27,843; REVIEW_CHECKLIST
    238 / 12,888; `dev/PROJECT_OVERRIDES.md` 455 / 33,669. RBB-002 already cut WORKFLOW from 82,999 B.
11. The preflight read set is WORKFLOW + LOOP + the overrides document + `ORCHESTRATOR.md`
    (`skills/mission/SKILL.md`, `skills/work/SKILL.md`, root `CLAUDE.md` / `templates/CLAUDE.md.tmpl`);
    REVIEW_CHECKLIST is read by the reviewer and QA agents only.
12. Pointers into the docs are by SECTION NAME: ~90 `§` pointers from skills, templates, the
    rendered `.claude/` copies, README and other docs (most cited: LOOP § Role boundaries 11, WORKFLOW
    § Plan readiness review 9, § How the COO speaks to the operator 6, § Fail aggregation 6, § Commit &
    Push Authority 6); guard letters (a)-(h) are cited from CLAUDE, ORCHESTRATOR and four memory
    seeds; `skills/review/SKILL.md` cites the run-in sentence "COO-authored text is reviewed like the
    Writer's". The self-check's cross-ref scan checks FILE existence only - a renamed heading breaks
    a pointer silently.
13. No check pins a doctrine sentence or heading of the three payload docs (the PLB-004 pin was
    removed by UPDARCH-001, `b3be045`); the provenance scan constrains their content.
14. `dev/PROJECT_OVERRIDES.md` § Loop shape: 20 bullets; seven restate a payload rule (one reviewer,
    cap 2, R1 no loop, QA conditional, readiness passes, dialogs only at gates, out-of-scope
    findings - the last two only in part); the rest are project-only (COO tiers, checkpoint hook,
    no pass question for prose, ticket-end cleanup, ticket born mid-work, euro pricing, dead paid
    pass, resource checks, Writer reply length). `.claude/hooks/context-gate.mjs` and its test quote
    the checkpoint bullet's name.
15. PLAN_DOCT (input): six tickets, rationale moved to a new `docs/RATIONALE.md`, a locked-anchors
    list, target nine-file set <= 175,000 B; its per-unit analysis (pre-0.3.0) counted ~18 KB
    removable in WORKFLOW and ~8.7 KB in LOOP, and concluded that duplicate normative text across
    homes is the larger lever than pure rationale. Its WORKFLOW line map is stale after RBB-002; its
    "verbatim pins" item is void (fact 13).
16. Relayed by the arbitration session (not re-measured here): the consumer proof of 0.3.0 in Silerax
    passed (`--apply` exit 0, self-check 1300/1300, `--check` up to date, four expected files changed,
    the additions block kept); the start context in this repo after 0.3.0 is ~130k, of which the
    active PLAN_HARD (~3,300 lines, ~34k tokens) is part.

17. The C2 baseline, measured by the operator's `/context` in a preflight-only Silerax session and
    relayed by the arbitration session (2026-10-17): total 109.8k - messages (the four preflight
    documents read in full) 70.9k, system tools 23.8k, skills 6.1k, system prompt 4k, memory 3.8k,
    compact buffer 3k, agents 0.6k, MCP tools 0. Preflight-only start: PnP 110k, Silerax 120k. The
    doctrine read is about two thirds of the start.

## Unknowns left to the executing session (confirm before acting; none changes a decision)

- Whether `copyPayloadTree` copies `.git`, i.e. whether the gitfile control needs its own copy.
- Whether `pgTicketText()` carries a `Status:` header line (M7/M8's padding arithmetic).
- Whether any of the four "project-only" overrides bullets (dead paid pass, born mid-work, resource
  checks, Writer reply) has a payload home - found by keyword grep only.
