# PLAN_STAB - fact-check r1 (Step 2b over draft r1, HEAD bc8c9a4)

## Agent 1 - ticket section (plan lines 78-366)

CLAIMS: total=103 verified=94 false=4 unverifiable=5

FALSE:
- 80 | COO cheap, all four routing checks "no" | check 2 (WORKFLOW:873-875) counts any worklist item without file:line - worklist 14 (plugin.json, CHANGELOG.md, ops.json, NOTES.md, --apply) has none.
- 83 | "four rendered templates re-rendered" | three here; reviewer.md has no record (codex Reviewer) -> skipped (migrate.mjs:634-640).
- 101 | worklist 1(b) anchor :103 | "...never an ambient duty." is at WORKFLOW:104.
- 155-156 | "leading blank means same line" | no block has one; check-blocks trims.

UNVERIFIABLE (host behaviour, no pointer in the tree): block L (`isolation: "worktree"` base branch); block N (foreground kill; server task never notifies); blocks R1/R2 (calls in one message start together); block S1 (classifier refuses self-modification).

Verified highlights: all other worklist anchors; Y is valid JSON and passes validate-payload op specs; Y note and blocks pass the self-check PROV rules (0 digest hits, ASCII); acceptance pins print `<file>:N` as stated; check-blocks exits 1 with MISSING lines today, 2 with no argument.

GAPS: A=8 B=4 C=4
A:
- provenance grep misses untracked migrations/0022_stab-prose/* - add `git add` before the grep.
- check-blocks checks no OLD wording, position or duplicates; replaced blocks E, G2, I, R1, R2, T, X need a negative grep each (only W has one).
- worklist 14: CHANGELOG entry titles, NOTES.md sections and the date are left to the Writer - fix them.
- `--apply`: no stop rule on exit 1/2, no `--dry-run` pre-flight; a Writer cannot answer a conflict dialog.
- dry trace: pnp-live refresh (`git -C ... checkout`) is a dialog (Gate 4) and another repo - mark the click and actor.
- README stamp, CHANGELOG block, NOTES.md have no acceptance check.
- render-equals-template only pinned for ORCHESTRATOR; CLAUDE.md region and writer.md checked for block presence only.
- VERIFY names no expected exit per command (state 0, anything else broken).
B: anchor :104; three re-renders not four; host-behaviour claims in L, N, R1/R2, S1 need a dated source or softer wording; drop the leading-blank sentence.
C: COO check 2 vs worklist 14; D11 word count omits the six skills files; A vs M1 (scratch dir is inside the repo tree); D vs P2 (an early product question vs "only when the ticket cannot continue").

## Agent 2 - shared sections (header, Контекст, Решения)

CLAIMS: total=64 verified=51 false=8 unverifiable=5

FALSE:
- 23-24 | "every block 1-2 sentences in an existing paragraph" | K and S1 are 3 sentences; S1 and J1 are new paragraphs.
- 37-38 | D1 "WORKFLOW § Routes defines executable artifact as code a runtime executes" | WORKFLOW:819 says "a script, a hook, anything that runs"; Class: code (WORKFLOW:837) = "runs, is imported, or is tested".
- 41 | D2 quote of check 1 | literal: "migration / access-policy / grants / auth / permission-model code" (WORKFLOW:872).
- 43 | D2 "no open conflict" | H conflicts with WORKFLOW:317/323 ("The moment a correction round changes code the pass is warranted"), CLAUDE.md.tmpl:31-34, skills/review/SKILL.md:695.
- 48 | D4 "deferred in CANDIDATES" | CANDIDATES § Инвентар lists them under plan A; the deferred list omits them.
- 66 | D9 H's surfaces = check 1 | H omits "permission-model".
- 69 | D10 "union of templates + migrations rows" | overrides § Test policy has no templates row.
- 70-71 | D10 list = what the policy prescribes | migrations+docs rows = validate-payload, update-suite, example-cycle-windows, selfcheck + grep; setup-suite and plugin-validate are additions.
UNVERIFIABLE: inventory agent count (session-only); "templates and ops.json are data" (no doc says so); "data and rights" gloss; "no escalation class in the diff" (diff not yet written); chain-trace "extends the ledger's debt".

GAPS: A=10 B=9 C=4
A: Gate 2 off-plan asks unless the ref is in active/ - the plan must land before dispatch; pnp-live refresh has no command/dialog/word; NOTES.md and CHANGELOG free text (LEAN gave NOTES verbatim); `--apply` exit 1 / rerun path unstated; `--apply` permission mode vs S1/S2 refusal; check-blocks presence-only (old text beside the block; J2/M1 outside the managed region); pins observed only by selfcheck/setup-suite - name them; D11 `<file>` placeholder and missing skills files; VERIFY batch vs runbook "zero edits while the example cycles run"; git prerequisites - branch, and stage only worklist files + CHANGES (untracked drafts/ and readiness/STAB/ must not ride).
B: as the FALSE rows above + header agent count + chain-trace source.
C: H vs WORKFLOW:317/323 and the other unconditional homes (make H an explicit exception or extend D9); D1/D2 vs R3 heading "migrations" and dev/README.md "payload R2 goes through the Writer and a Reviewer pass"; D3/D10 vs overrides "prose-only release = note-only migration, nothing else runs"; M2 lacks the "repository files" qualifier.
