# DOCSTAGE-001 - the four stage templates and the core of ORCHESTRATOR

Closed 2026-11-02, Opus 5.5 session `3ef06225` (D-12 S3a), on the operator's word "da" (2026-11-02,
after `/pnp:mission` reported the ticket). R1 prose in the main session, no Writer, no auditor
(`review.docs` row 0).

## What landed

- `78fa59a` (docs) - five files, 1326 insertions, 2 deletions:
  - `templates/doctrine/work.md.tmpl` (new) - WORKFLOW § Routes (R1, R2, R3, COO routing), LOOP
    § Routing mapped to native, WORKFLOW § Tests with ### Out-of-scope failures found during work,
    WORKFLOW § Status / release docs policy (A1).
  - `templates/doctrine/ticket.md.tmpl` (new) - WORKFLOW § Ticket brief contract (R2/R3) with
    ### Proof-surface feasibility, § The COO write boundary runs along artifact class, not size, LOOP
    § Role boundaries WHOLE, WORKFLOW § Loop shape and its overrides whole, § Fail aggregation,
    § Durable development history items 4-5 (A2, D-05).
  - `templates/doctrine/plan.md.tmpl` (new) - WORKFLOW § Planning lock, § Plan readiness review,
    § Durable development history without items 4-5, ### The ledger with its fence byte for byte
    (A3, D-05).
  - `templates/doctrine/review.md.tmpl` (new) - `docs/REVIEW_CHECKLIST.md` whole (A4).
  - `templates/ORCHESTRATOR.md.tmpl` - the core sections directly above the block (WORKFLOW § Roles,
    § COO owns broad scans, § The operator does not arbitrate engineering decisions with ### How the
    COO speaks to the operator, § Operator-interaction guards, § Verifying failure claims, § Branch
    policy, § Escalation and the arbiter, § Commit & Push Authority); the four triggers once; the
    contract's THIN bullet rewritten to CORE STAGE; `records/<REF>.md` kept; `:24` and the
    References-only list untouched (A5).
  - Each new file framed (A6): the TEMPLATE CONTRACT block first, the managed-by comment, a stage H1
    and one "Read IN FULL by ..." paragraph (D-06's doors), the `##` headings verbatim, one empty
    project additions block last; placeholders only `{{config.project.name}}` and
    `{{config.paths.overridesDoc}}`.
- `D:\pnp-live` refreshed to `78fa59a` (the `Start-Process git ... -WorkingDirectory` form).
- The record commit: this file, the index row closed.

## Decisions and deviations

- **Written by hand through the Write tool, not by an assembler script** - editing is not a shell
  job (LOOP § Role boundaries); the D-08 mid-state is the verbatim proof: every moved paragraph not
  on the list below hits exactly twice.
- **Cross-stage rewrite scope.** Only the bare `§ <heading>` and `guard (x)` references that the
  move itself broke were rewritten, to `<stage>.md § <heading>` (D-05). File-qualified pointers
  (`docs/WORKFLOW.md` § X, `docs/LOOP.md` § Role boundaries, `docs/REVIEW_CHECKLIST.md` § X) were
  left verbatim: they resolve until 002 reduces the docs, and 002's B9 re-aims every pointer under
  `templates/`.
- **Escalation collapse direction.** ORCHESTRATOR's own § Escalation stays as it was; from the moved
  § Escalation and the arbiter the four duplicate paragraphs (the "A decision escalates when:" lead,
  the triggers, the bar, the mandatory paragraph) are dropped and one same-file pointer line stands
  in their place - why: ORCHESTRATOR's rule text and its "the rule above" stay intact, and the
  triggers stand once (D-02 core).
- **Deviation: the ORCHESTRATOR contract bullet THIN rewritten to CORE STAGE** - not in A5's list;
  the bullet ("every rule whose home is a payload document is one pointer line, never a copy")
  contradicted the file's new content. The block is stripped from the render.
- **Placement** (Note class): the core sections directly above the block, after § References only,
  as A5 reads; ### Out-of-scope failures found during work under ## Tests in `work.md` (it has no
  `##` parent of its own); `## Durable development history` in both `ticket.md` and `plan.md`, each
  with one cross-pointer line to the other half; `review.md` keeps the source H1 `# Review & QA
  Checklist` with one frame line under it.
- **Fact-check fixes before the commit:** `plan.md.tmpl`'s contract said a suite pins the fence
  (false today: `scripts/setup/test-setup.mjs:1597-1603` compares `templates/LEDGER.md.tmpl` with
  the docs fence; B3 re-aims it in 002) - now names the seed `templates/LEDGER.md.tmpl` instead;
  `review.md.tmpl`'s "read IN FULL by the reviewer and QA agents" (not what D-06 says) - now "named
  by". The render dry-run was re-run after both.
- **The diff review is written directly below** - no paid pass, so no scratch file was owed before
  one.
- **The procedure agent wrote its scripts by shell heredoc** in the session scratch directory outside
  the repository: Gate 1 denies the Write tool to every non-writer subagent whatever the path. My
  brief had not said so; no tracked file was touched that way.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-11-02 | RULEHOME/D-16 (b) fact-check before the commit | catch | one FALSE frame claim (the fence "pinned by a suite") and one unverifiable (agents read review.md IN FULL), both fixed before `78fa59a`; § Decisions and deviations |

## Verification (what actually ran)

- **A0, D-08 control** (`coverage.mjs --bar 1`, session scratch; positive control first: a deleted
  paragraph reported `OFF 0`, a duplicated one `OFF 2`): `sources: 223`, `off-bar: 5 of 223`, each
  explained:
  - `docs/WORKFLOW.md:811` "A decision escalates when:", `:813` the four triggers, `:818` the bar -
    the known pre-existing duplicate with ORCHESTRATOR § Escalation, collapsed by A5 (count 2);
  - `docs/WORKFLOW.md:797` "## Fail aggregation" - a substring of REVIEW_CHECKLIST's "## Fail
    aggregation (both roles)" (count 2);
  - `docs/REVIEW_CHECKLIST.md:44` "---" - substring coincidence with LOOP's table rules (count 4).
- **A7, D-08 mid-state** (`--bar 2`): `off-bar: 54 of 223`, every line on the list below; no `OFF 0`.
- **A7, render dry-run** (`render.mjs`: `templateContext`, `renderTemplate`, `carryProjectAdditions`
  against this repository's config, a one-line probe carried into each block): `OK` for work, ticket,
  plan, review, ORCHESTRATOR; `FENCE identical (raw); identical (CRLF->LF)`; negative controls
  `NEG fence: FENCE differs at 24` and `NEG render: RED ... unresolvable template path
  "config.nope.key"`. Re-run after the fact-check fixes: the same lines.
- **Fact-check** (one sonnet scan over the frame prose and every pointer): `claims: 36 verified: 26
  false: 1 unverifiable: 1 future: 8` - the FUTURE lines are D-06's door reads, true at 002's B7.
- Provenance grep (`dev/PROJECT_OVERRIDES.md` § Test policy form, before and after staging): no hit.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0, `valid: 32 migration(s) ...
  payload version 0.3.7`, before and after the commit.
- Acceptance greps after `78fa59a`: `templates/doctrine` holds exactly the four names; one
  `<!-- project additions -->` in each of the five files; no file without `<!-- TEMPLATE CONTRACT`;
  `git diff --name-only e8761b6 HEAD -- docs skills scripts hooks schema migrations .claude-plugin`
  empty; the templates diff only `templates/doctrine/*` and `templates/ORCHESTRATOR.md.tmpl`;
  `records/<REF>.md` at `templates/ORCHESTRATOR.md.tmpl:172`; the heading pairs at `plan.md.tmpl:28`,
  `:62`, `ticket.md.tmpl:25`, `:226`, `work.md.tmpl:26`, `:102`, `review.md.tmpl:240`,
  `ORCHESTRATOR.md.tmpl:461`, `:484`.
- No suite (the prose row, `dev/PROJECT_OVERRIDES.md` § Test policy); no auditor (`review.docs` 0).

### Merged-or-dropped list (the mid-state's 54 off-bar paragraphs)

| source paragraphs | count | why |
|---|---|---|
| `docs/WORKFLOW.md:1`, `:3`, `:7`, `:11` (title, intro) | 1 | stays in docs as the map's opening (D-02); 002 |
| `docs/WORKFLOW.md:892`, `:894`, `:896`, `:912` (§ Reproducibility) | 1 | stays in docs (D-02) |
| `docs/LOOP.md:1`, `:3` (title, intro) | 1 | stays in docs (D-02) |
| `docs/LOOP.md:119`, `:121`, `:125`, `:128`, `:134`, `:139`, `:149`, `:167`, `:172`, `:184`, `:196`, `:204`, `:214`, `:219`, `:227`, `:230` (§ Enforcement of Writer-only writes) | 1 | stays in docs (D-02) |
| `docs/LOOP.md:240`, `:242` (§ Commit gate), `:248`, `:250`, `:261`, `:268` (§ Honest security model) | 1 | stays in docs (D-02) |
| `docs/WORKFLOW.md:111` (fact-check gate), `:439` (the first six names), `:286` (Not configurable) | 1 | cross-stage reference rewritten -> `ticket.md` (D-05) |
| `docs/LOOP.md:18` (§ Role boundaries ref), `:95` (§ Enforcement ref, now `docs/LOOP.md` §) | 1 | cross-stage reference rewritten -> `work.md`, `ticket.md` (D-05) |
| `docs/WORKFLOW.md:697`, `:704`, `:732`, `:511` | 1 | cross-stage reference rewritten -> `work.md` (D-05) |
| `docs/WORKFLOW.md:312` (guard (g)), `:349` (guard (e)), `:387` (§ Fail aggregation), `:573` (guard (h), the irreversible half) | 1 | cross-stage reference rewritten -> `plan.md` (D-05) |
| `docs/WORKFLOW.md:157` (item 7), `:188` (guard (h)), `:835` (§ The ledger) | 1 | cross-stage reference rewritten -> `ORCHESTRATOR.md` (D-05) |
| `docs/WORKFLOW.md:526` (the PLAN's items 1-5, one paragraph) | 1 | split at item boundaries: 1-3 `plan.md`, 4-5 `ticket.md` (D-05) |
| `docs/WORKFLOW.md:821` (A fired trigger makes escalation MANDATORY) | 1 | merged into `ORCHESTRATOR.md` § Escalation's mandatory paragraph (D-02 core) |
| `docs/WORKFLOW.md:517` "## Durable development history" | 3 | the heading of the D-05 split, in both halves |
| `docs/WORKFLOW.md:651` "### The ledger" | 3 | `plan.md.tmpl`'s contract block names the heading (stripped from the render) |
| `docs/WORKFLOW.md:797` "## Fail aggregation" | 4 | substring of "## Fail aggregation (both roles)" (as in the control) |
| `docs/REVIEW_CHECKLIST.md:44` "---" | 8 | substring of table rules (as in the control) |

## Remaining debt

None outside DOCSTAGE-002. Inputs for its brief (its own worklist rows, not new tickets):

- `work.md.tmpl` carries LOOP's "`/pnp:loop` states this sequence" paragraph verbatim - B11 removes
  it there too (D-07's closing check would catch it);
- `templates/ORCHESTRATOR.md.tmpl`'s "Who reads this" second paragraph ("a rule whose home is a
  payload document is pointed at and not restated") is stale beside `:24` - B8 rewrites it with
  `:24`;
- the file-qualified pointers inside the five templates - B9;
- the fence pin - B3; the door reads the frame lines describe - B7;
- ROADMAP § DOCSTAGE stays `Status: planned`: an R1 ticket writes no route state, so the "in
  progress" event fires at 002's dispatch.

## Diff review

The whole of `78fa59a` read against the three docs at `e8761b6`. Per acceptance line, the defect the
proof would see:

- four names / one additions block / a contract block per file - a missing or a second block (the
  greps above, `git grep -c`);
- readers untouched - any reader path in `git diff --name-only e8761b6 HEAD` (empty);
- `records/<REF>.md` - lost from ORCHESTRATOR (`:172` hit);
- the fence - a byte difference (the dry-run's `FENCE identical`);
- the heading pairs - a section in the wrong stage (the nine heading hits);
- the D-08 runs - a paragraph dropped (`OFF 0`, none) or changed (an untouched paragraph at 1, none
  outside the list);
- the render - a throw, a `{{`, a contract line, a block not last (all `OK`).

The moved text differs from the source only at the rewritten references listed above, the four
dropped escalation paragraphs and line wrapping inside two rewritten paragraphs (whitespace,
normalised by D-08). No Cyrillic, no project name beyond the plugin's own managed-by line, no
absolute path.

## Scratch

- `.aiwf/route-state.json` - `{}`, kept (live loop mechanics).
- `.aiwf/checkpoint.md` - its content (the DOCSTAGE landing, next DOCSTAGE-001) stands in the
  memory file `promptandpray-mission-status` and in `PLAN_DOCSTAGE.md`; rewritten whole to the
  current state (the gate checkpoint of `dev/PROJECT_OVERRIDES.md` § Loop shape), not deleted.
- The D-08 script, its logs and the render script live in the session's own temporary directory
  outside the repository (not covered); their outputs are copied into § Verification above.

## Closing checklist

- the operator's own run on a real input - n/a: nothing renders the templates before 002 (D-09);
- the diff review folded in above - yes;
- finding lines on a roadmap area entry - n/a: the ticket closes none;
- out-of-scope findings - none; the four inputs above belong to 002's existing rows;
- scratch files kept or moved before any delete - yes, nothing deleted (§ Scratch);
- the next ticket: DOCSTAGE-002 on a FRESH Fable session (D-12), on the operator's word.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (no auditor) | 240,000 (24 % of 1,000,000) | `~/.claude/ctx/3ef06225-f81d-4517-b677-a7fbc6dde454.pct` x `.size` |
