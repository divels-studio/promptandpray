# Plan RBB - readiness round 2

Pass 2: Codex, `review.plan` row (`gpt-6-sol`/xhigh), RESUMED from pass 1's session
`01a149c8-de76-7182-8271-239a068c792f` on the operator's word („пас 2 топъл", 2026-10-17), with the
compensations: `round-1.md` carried verbatim, re-read of every file from disk, an independent search
for consumers of the revision's new surface. Tokens as the engine printed them: 340,344 (the figure
after a resume; pass 1 alone printed 193,977). Verdict line: `BLOCKERS: 2 INFO: 0 CLOSED: 9 OPEN: 4`.
The auditor's rows verbatim; the disposition column is the COO's (revision 2 - the cap).

| id | class | property the plan must have | evidence | hint | disposition |
|---|---|---|---|---|---|
| B1 | CLOSED | The planner writes the draft through the permitted Writer agent and returns a handoff. | `dev/backlogs/drafts/RBB/DECISIONS.md:21-28`; `dev/backlogs/drafts/RBB/tickets/RBB-001.md:21-24` | - | - |
| B2 | CLOSED | Stamp precedes check, and each revision is restamped. | `dev/backlogs/drafts/RBB/tickets/RBB-001.md:24-30` | - | - |
| B3 | OPEN | Class 11: The landing move must resolve from the project root. The specified `Move-Item drafts/RBB active/RBB` names paths that do not exist there; the configured plans directory is `dev/backlogs`. | `dev/backlogs/drafts/RBB/PLAN_RBB.md:48`; `.claude/aiwf-native/aiwf.config.json:223` | Use paths under `<plansDir>` or specify the working directory. | fixed: every landing and archive path written from the root with the `dev/backlogs/` prefix (D-04, index trace steps 1 and 4) |
| B4 | CLOSED | The Writer pointer reaches the session brief recipe and `/pnp:brief`. | `dev/backlogs/drafts/RBB/tickets/RBB-002.md:35-41` | - | - |
| B5 | CLOSED | The Claude plan branch and reviewer template are assigned the folder brief and findings-table contract. | `dev/backlogs/drafts/RBB/tickets/RBB-002.md:18-24` | - | - |
| B6 | CLOSED | Migration 0025 conditionally re-renders the managed reviewer artifact. | `dev/backlogs/drafts/RBB/tickets/RBB-003.md:17-23` | - | - |
| B7 | OPEN | Class 1: All pass-economy readers must agree with D-06. The revised worklist skips the roles skill's explicit `passes + 1` rule, while the proposed CLI note still says `+1`. | `dev/backlogs/drafts/RBB/tickets/RBB-002.md:39-41`; `skills/roles/SKILL.md:131-134`; `dev/backlogs/drafts/RBB/tickets/RBB-003.md:32-34` | Update the explanatory rule and state the conditional second pass in the display. | fixed: `skills/roles/SKILL.md:131-134` in RBB-002 item 7; the CLI note is `second pass only on your word: a reversed decision or a named risk` (D-06, RBB-003 item 5) |
| B8 | CLOSED | Pass 2 carries round 1 verbatim, and both fail-aggregation sections are assigned for reconciliation. | `dev/backlogs/drafts/RBB/DECISIONS.md:50-55`; `dev/backlogs/drafts/RBB/tickets/RBB-002.md:29-32` | - | - |
| B9 | OPEN | Class 1: The public command table must describe the plan findings-table verdict. D-13 names the FAQ verdict sentence but omits the `/pnp:review` table row, whose old verdict has no `NEEDS-FIX` token for the closing grep to catch. | `README.md:198`; `dev/backlogs/drafts/RBB/DECISIONS.md:94-96`; `dev/backlogs/drafts/RBB/tickets/RBB-003.md:60` | Include the command-table row. | fixed: README :198 named in D-13 and the prose half; acceptance `git grep -c "findings table" -- README.md` - 0 |
| B10 | CLOSED | The acceptance check performs a scratch render and searches rendered artifacts for named defects. | `dev/backlogs/drafts/RBB/tickets/RBB-002.md:57-61` | - | - |
| B11 | CLOSED | The migration ticket is routed to the required top COO tier. | `dev/backlogs/drafts/RBB/tickets/RBB-003.md:3`; `dev/REBUILD.md:209-211` | - | - |
| B12 | CLOSED | This repository's Workspace paths block and its old-path check are in scope. | `dev/backlogs/drafts/RBB/tickets/RBB-003.md:39-42`; `dev/backlogs/drafts/RBB/tickets/RBB-003.md:59` | - | - |
| B13 | OPEN | Class 11: The final record must actually archive the plan before tagging. The added `git mv active/RBB archive/...` uses paths absent from the project root, and no working-directory change is specified. | `dev/backlogs/drafts/RBB/PLAN_RBB.md:55-58`; `docs/WORKFLOW.md:740-741` | Use `<plansDir>` paths for the archive move. | fixed: with B3 (root-relative `git mv dev/backlogs/active/RBB dev/backlogs/archive/<NNN>_PLAN_RBB_<date>`) |
| B14 | BLOCKER | Class 11: RBB-003's required self-check must be able to pass at the stated handoff. The code half bumps the payload to 0.3.0, but the specified check uses this installation, still stamped 0.2.20 until a later `/pnp:update`; self-check fails that version mismatch. | `dev/backlogs/drafts/RBB/tickets/RBB-003.md:24-25,50-53,76-79`; `.claude/aiwf-native/aiwf.config.json:4`; `scripts/selfcheck/aiwf-selfcheck.js:5923-5929`; origin: a fact pass 1 did not open | Use a current-version fixture for this check, or place the local update before it with its required word. | fixed: D-16 - the example cycle's step 8 is the handoff proof; `selfcheck` over `.` only after the local `/pnp:update` (operator word, auto mode off); the update's self-install diff rides the prose commit (RBB-003 § Acceptance, § Verify, index trace step 4) |
| B15 | BLOCKER | Class 13: The added archive step must include the required fail-capable process-section grep and a positive control. The revised trace and ticket specify the move and record only. | `dev/backlogs/drafts/RBB/PLAN_RBB.md:55-58`; `dev/backlogs/drafts/RBB/tickets/RBB-003.md:42`; `docs/WORKFLOW.md:743-749`; origin: born of the revision | Add the archival check before the record/archive commit. | fixed: the archiving grep `git grep -n "operator rule"` over the plan folder, run first over `archive/012_PLAN_RBA_2026-10-17/DECISIONS.md` as the positive control (D-15 hits) - D-04, index trace step 4, RBB-003 § Acceptance |

Revision 2: 6 fixed (4 OPEN + 2 new), 0 rejected, 0 deferred, 0 asked; the BLOCKER count went
13 -> 6 -> 0 open on the author's side. Revision 2 is the cap (D-06); re-stamped after it
(`plan-gate --check` clean, tickets 5260 / 6144 / 6138 bytes). A third pass is beyond the configured
two and would take the operator's own word.
