# AUDR-001 - the five parts, migration 0050, manifest entry and bump to 0.3.25

## What landed

- `54df72e` (the Writer's code commit, `Refs: AUDR-001`): `templates/doctrine/review.md.tmpl` (§ A blocker names a loss, the
  product-stage bullet and its dual, the readiness and Reviewer pointers, the TEST POLICY `none` dual), `templates/doctrine/plan.md.tmpl`
  (the `note: land` / `note: drop` dispositions, check 5, the triage dual, class 16), `templates/doctrine/ticket.md.tmpl` (a note
  opens no correction round; § Proof-surface feasibility opening), `templates/agents/reviewer.md.tmpl` (pass 2 NOTED),
  `templates/briefs/{readiness-codex,planner,research,record}.md`, `templates/PROJECT_OVERRIDES.md.tmpl` (§ Product stage),
  `skills/review/SKILL.md`, `skills/plan/SKILL.md`, `docs/READINESS_CLASSES.md` (classes 8, 11, 15, 16),
  `migrations/0050_audit-loss/{ops.json,NOTES.md}`, `migrations/index.json`, `.claude-plugin/plugin.json` 0.3.25; the COO's
  prose in the same commit: the `CHANGELOG.md` 0.3.25 block and `README.md:22`.
- `c7e706d` (the COO's commit): the self-install - `/pnp:update --apply` 0.3.24 -> 0.3.25, 5 operations, the three stage files
  re-rendered, the Reviewer agent skipped (not recorded here), `aiwf.config.json` stamps.
- The record commit: this record, the ticket's amendment line, the index row, `dev/PROJECT_OVERRIDES.md` § Environment (the
  context source no longer read by `/pnp:plan` or the record - DECISIONS § Deferred's close duty), ROADMAP, LEDGER, the archive.

## Decisions and deviations

- Correction round 1 went outside the worklist W01-W29 on the code audit's four blockers: five sites (C1-C5, the ticket's
  amendment line), each text shown to the operator and approved in a dialog 2026-11-24 - "1. Одобрявам трите" (C1-C3),
  "1. Блокер само при загуба (препоръка)" (C4, class 16 a blocker only with a loss); C5 was the audit's note.
- The audit's CONTRACT TEXT opinions (the "decision left to the Writer" edge; a proof-collecting gate filed as a note can let a
  regression through) - no change, the operator's answer "1. Остава както е (препоръка)"; kept for the evaluation (ROADMAP
  § AUDITRULE line (13)).
- The Writer's four framing deviations around the approved texts (accepted): "Of the product stage:" before the copied dual;
  "(Triage above)" for "(D-03)"; the record row written bare with its kept counting sentence renamed to the new columns; the
  planner sentence split.
- VERIFY ran the self-check in its CI form (`--plugin-root .`), not the fixture form of `verify.commands`: a bump reds the
  fixture form's version row until the self-install (`dev/VERIFY_RUNBOOK.md` § Portion 1); the self-install's project-scope
  self-check proved the project layer after the commit.
- This plan's own `## Measurements` was written under the skill in force at its landing (0.3.24); the ticket row below uses the
  skeleton as released (index order-and-gates step 7).

## Events

| 2026-11-24 | `ORCHESTRATOR.md` § Verifying failure claims (no pipe into head) | catch | the COO's `git diff ... \| head -80` denied by the Gate 4 habit guard; the delta read by Grep instead (this session) |

## Verification (what actually ran)

- Baseline at `fe04608` and handoff, Portion 1, one parallel batch, logs under the session scratchpad: `node
  scripts/update/validate-payload.mjs --plugin-root .` exit 0 / exit 0; `node scripts/update/test-update.mjs` exit 0 `checks:
  495, failures: 0` / exit 0 `checks: 495, failures: 0`; `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` exit 0 `====
  1809/1809 assertions passed ====` / exit 0 `==== 1809/1809 assertions passed ====`.
- Provenance grep `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples
  README.md`: no hits (the Writer, after the dispatch and after round 1).
- The ticket's Acceptance lines (PowerShell 7, the Writer's script): exit 0, every line clean, after the dispatch and after round 1.
- Render dry-run `node scripts/update/aiwf-update.mjs --dry-run --project-root . --plugin-root .` exit 0 (handoff and after
  round 1); after round 1 also `validate-payload` exit 0.
- Fact-check gate (sonnet): handoff `claims: 66 verified: 63 false: 0 unverifiable: 3` (the three closed by the COO, § Diff
  review); round 1 `CLAIMS: total=22 verified=22 false=0 unverifiable=0`.
- Code audit: pass 1, Codex gpt-6.2-sol xhigh, cold, `tokens used 172,578`, session `01a20cdc-f85c-7ae0-a45d-def40334c4fe` -
  `fail`, 4 blockers, 1 note, CONTRACT TEXT 2 opinions. Correction round 1 was prose only: no verification pass (`ticket.md`
  § Loop shape and its overrides), verified by the fact-check gate and the COO's first-hand read.
- Self-install: `node "D:/pnp-live/scripts/update/aiwf-update.mjs" --apply --project-root "D:/promptandpray"` exit 0 -
  `updated: 0.3.24 -> 0.3.25, 5 operation(s) applied.`, `self-check: PASS - ==== 31/31 assertions passed ====`; the stamps
  `"installedPluginVersion": "0.3.25"` and `"lastMigrationApplied": "0050_audit-loss"` grep-found in `aiwf.config.json`; the
  markers `## A blocker names a loss` (review.md:63), `with no revision counted` (plan.md:97), `**A note opens no correction
  round**` (ticket.md:286) grep-found in the re-rendered stage files.

## Remaining debt

- `templates/doctrine/plan.md.tmpl`:126 places class 16 "under check 4 below", and check 4 is the dependency order, not the cut
  (the round-1 fact-check's flag; pre-existing wording) - its destination asked at the close.
- The update engine's apply window against a session beside it - ROADMAP § AUDITRULE line (12) (readiness round 2, B7).

## Diff review

The COO's reading of the whole diff (`.aiwf/AUDR-001-diff-review.md`, folded here):

- Read whole: `git diff fe04608` over the 16 payload files + `migrations/0050_audit-loss/{ops.json,NOTES.md}` + the COO's
  `CHANGELOG.md` block and `README.md:22`.
- Per acceptance criterion: approved texts verbatim (read by eye against DECISIONS.md; the Writer's one-line markers read by the
  Acceptance greps); old sentences gone (S1, S2 the QA-only clause kept by design, S3, S5, S7, the removed INFO-cost sentence);
  migration - four rerender ops each paired with its own template, the reviewer op `ifRecorded: true` (0046 shape), one note,
  manifest last entry 0050 -> 0.3.25, plugin.json 0.3.25; QA unchanged (`skills/qa` untouched; QA's material-blocker clause kept).
- Before the pass: the row `class=code -> review.code: codex gpt-6.2-sol/xhigh, 1 pass` (resolver); no test or spec file in
  the diff, so no skip / only / todo / reduced set to decide on.
- Notes, none blocking: N1 `skills/plan/SKILL.md` names the disposition as `note` where it is now written `note: land` / `note:
  drop`; N2 the readiness brief's copied D-03 text carries bare § cites into `review.md`, which the readiness auditor is not
  handed - they concern the code pass; N3 the planner's two new slots are not marked "COO-filled".
- The fact-check's three unverifiable rows closed: the consumer's two local rules opened by a haiku agent
  (`D:\Stratex\.claude\aiwf-native\doctrine\plan.md`:274-278, `review.md`:306-308, both titled "The product stage"); the
  readiness brief names no `review.md` (COO grep, 0 hits); the bare § cites = N2.
- CHANGELOG names no consumer; its Retires line names the `plan.md` rule retired and the `review.md` one narrowed to QA.

## Scratch

- `.aiwf/AUDR-001-diff-review.md` - folded into § Diff review above, then deleted.
- `.aiwf/AUDR-001-review-brief.txt` - moved to `dev/backlogs/readiness/AUDR/AUDR-001-review-brief.txt`.
- `.aiwf/last-review-session.AUDR-001.txt` - its id stands in § Verification above, then deleted.
- `.aiwf/route-state.json` - cleared to `{}`; `.aiwf/checkpoint.md` - the live gate checkpoint (overrides § Loop shape), kept.

## Closing checklist

- the operator's own run on a real input - n/a: the outcome is the audit's and the planner's behaviour in a consumer session;
  it is first seen when the operator plans the next Silerax phase on 0.3.25, and the `pnp-measure` rows record it;
- the diff review folded in above - yes;
- the ticket's finding lines on their roadmap area entry - ROADMAP § AUDITRULE line (11) marked `done 54df72e`;
- every out-of-scope finding registered - the class-16 "check 4" pointer: asked at the close; the apply window: line (12);
  the contract-text opinions: line (13);
- every scratch file found standing in the tree or moved into git before its delete - § Scratch;
- the next ticket: none in this plan; the release tag and the push wait for the operator's two words.

## Measurements

| pnp-measure | ticket | AUDR-001 | code pass: code defect 4 / test defect 0 / record or form only 0 | correction rounds 1 | effort: test Writers / production Writers / fact-check - | defects after the close 0 | plan wrong at execution 1 |

- Plan wrong at execution: the plan's closing greps enumerated the phrases of the old rules it replaced, not the untouched
  sentences that state a rule the new text contradicts (the TEST POLICY `none` dual, the proof-feasibility opening, the triage
  `fixed` dual, class 16); the code audit found the four, and they cost one prose correction round with four operator dialog
  answers.
- Sources: the code-pass kinds from the verdict as returned (four blockers, each a contradiction in the product's doctrine text);
  one Writer for the whole ticket, so the effort split is `-` (its agent usage: 159,065 tokens, the last notification).
