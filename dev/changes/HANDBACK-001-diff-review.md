# HANDBACK-001 - the COO's reading of the whole diff (against a926045)

## Code (the Writer, four files)

- `scripts/engine/pretooluse-mutation-guard.js`: `HANDBACK_SEGMENTS`, `HANDBACK_REFUSED_TYPES`, `everyTargetInHandback`,
  one call on the non-writer branch after the outside-root passthrough, the header rewritten to two passthroughs. Read
  whole: identity first (non-empty string, not reviewer/qa/qal), then every present path field - non-empty string, inside
  the root, more than two segments, the first two `.aiwf` / `agents` case-insensitively. `projectRelative` resolves before
  the segments are read, so `.aiwf/agents/../route-state.json` is judged as `.aiwf/route-state.json` (two segments, deny).
  A field outside the root returns false here, so a mixed inside/outside payload passes neither helper. No config, no
  route state, no filesystem read. The deny text at the end of the branch is untouched.
- `scripts/selfcheck/aiwf-selfcheck.js`: 18 rows + 3 named-fault controls inside `sectionGate1Identity`, the existing
  pattern (`g1Payload`, `exactDeny`, `pgEngineCopy`, `pgPatch`). The identity rows replace EXPLORE whole.
- `scripts/spike/run-spikes.mjs`: three rows in `gate1Cases`.
- `hooks/hooks.json`: the description string only.

## Decisions and deviations

- The segment compare is case-insensitive on every OS (the brief's rule c, the house style of `isAllowlisted`). On a
  case-sensitive filesystem `.AIWF/Agents/x` is a different, non-ignored folder a helper agent could write a file into.
  Accepted: the same leniency the main-session allowlist carries; it reaches no existing file of the project.
- Spike count 484, not the brief's 481: each case records two checks (decision + exit 0). A brief defect, not a code one.
- A whitespace-only `agent_type` is treated as empty (deny) - the `trim()` test the path fields use.
- No realpath: a symlink under `.aiwf/agents/` pointing into the repo would pass; creating one needs a shell, which Gate 1
  never covered. The same limit as the outside-root rule.
- `reviewer` writing OUTSIDE the root stays allowed as before - out of scope, no row added (the Writer asked).

## Narrowed tests

`skip` / `only` / `todo` / reduced sets in the diff: none (read whole).

## Acceptance -> the defect its proof would see

1. Self-check exit 0, 1789 assertions - a helper write under `.aiwf/agents/` denied (rows g1-hb-rel/-abs/-nested/-case/-nb/
   -captured read `r.decision`); a write beside the folder allowed (g1-hb-state/-brief/-prefix/-traverse/-dir read
   `r.reason` against the byte-exact deny); a review role allowed (g1-hb-reviewer/-qa/-qal); an incomplete identity allowed
   (g1-hb-noid/-null); a mixed payload allowed (g1-hb-mixed-in/-out). The three controls prove the folder, role and
   third-segment rows can fail.
2. Spikes exit 0, `failures: 0` - the same three verdicts through the spike harness.
3. Deny text unchanged - `G1_DENY` compares it byte for byte in every exactDeny row.
4. `git diff --stat a926045 -- scripts hooks` names exactly four files - a write outside the Code Map.
5. Provenance grep empty over scripts and hooks.

## Red-then-green

The six passthrough rows were written first and run against the unchanged hook: `==== 1780/1786 assertions passed ====`,
exit 1, the six red (the Writer's hand-back). The deny rows guard unchanged paths; the three controls are their proof.

## COO-authored text in the same diff (0.3.22 prose, operator-approved 2026-11-22)

templates/doctrine/{review,ticket,plan}.md.tmpl, templates/ORCHESTRATOR.md.tmpl, templates/agents/writer.md.tmpl,
templates/briefs/{readiness-codex,record}.md, skills/review/SKILL.md, docs/LOOP.md, README.md, CHANGELOG.md,
migrations/0047_test-authority/, migrations/index.json, .claude-plugin/plugin.json.

## Fact-check gate (sonnet, one agent, before pass 1)

CLAIMS: total=110 verified=99 false=6 unverifiable=5. The six FALSE rows fixed before the pass: the spike probes carry rows, not controls (CHANGELOG, NOTES); the two earlier tripwire-3 sentences no longer quoted as verbatim (NOTES); 0.3.21 released the same day, not a day earlier (NOTES); the enumerated-matrix sentence is the brief contract's, not the planner's (NOTES); Superseded local rules names the two retired texts (NOTES). UNVERIFIABLE closed: the ticket ref GATES-005 was already an archived ticket of 0.3.12 - renamed HANDBACK-001 (a ref is never reused); the consumer-candidate wording no longer in quotation marks; 'no installation had taken it' attributed to the arbiter session's reading; 'the smallest source' stands at dev/changes/test-cost-research-2026-11-22.md § 4 item 5 (opened by the COO).


## Pass 1 (Codex gpt-6.1-sol/xhigh, cold) - fail, one blocker; correction round 1

Blocker (P2): veryTargetInHandback split the relative path on both slash types; on POSIX .aiwf\agents\report.md is one root-level file name and passed. A code defect, confirmed by reading. No other blocker, no note. Session 01a202d8-2f2c-73a2-9725-d545490f15c3.

Round 1 (the live Writer, two files): projectRelative and veryTargetInHandback take an optional pathImpl (default the module's path); the helper splits on pathImpl.sep; the outside line is byte-identical; the helper is exported. Self-check: five direct-call rows g1-hb-posix-bslash / -posix-mixed / -posix-fslash / -win32-bslash / -win32-fslash and the control g1-ctl-hb-sep (the patched copy required, its export called). Red run before the fix: 1785/1794, exit 1 - the two posix deny rows red as required, plus seven failures of the Writer's own making (an edited outside line that broke g1-ctl-outside; a literal drive-letter root tripping the provenance scan), both undone before green. Read whole by the COO: .aiwf/agents\report.md on posix yields two segments (deny); a field the outside test misreads is denied by the segment check. COO VERIFY over the round: self-check `==== 1795/1795 assertions passed ====` exit 0; spikes `checks: 484, failures: 0` exit 0.

Out of scope, pre-existing, same class: projectRelative's outside test, isAllowlisted and Gate 3's allowlist split on both slash types too, so on POSIX a root-level file whose NAME starts with ..\ reads as outside the root and one named docs\x as under docs/. Not touched: it would change existing verdicts. To the operator at the close.

