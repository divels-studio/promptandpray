# PLAN_RGATE - consequence scan (Step 2c, first use of the format), pass 1

Agent: Explore/sonnet, 2026-10-02, over draft r0 (decisions :64-108, ticket :109-540). Rows abridged
from the agent's return; closures are the COO's. `plan: rN` = revision item N in revisions.md.

| # | ticket | decision | surface | violation | closure |
|---|---|---|---|---|---|
| 1 | RGATE-001 | D5 Codex gate keys on `-Class plan` | docs/CODEX_REVIEW_QA_RECIPE.md:185-192 | classless recipe sends a plan brief ungated | plan: r1 - wrapper also fires on a column-0 `Class: plan` brief line; recipe gets the refusal sentence (r13) |
| 2 | RGATE-001 | D5; risk "any channel" | codex-review.ps1:82-87, codex-review.sh:103 | classless call with a plan brief spends the pass ungated | plan: r1 - brief-line detection covers the classless call (W6) |
| 3 | RGATE-001 | D5/D7 | skills/review/SKILL.md:51-52, :395, :402 | `-Class code` + a plan brief is unrefused | plan: r1 - the brief's own `Class: plan` line fires the gate whatever the flag; a plan brief without the line under another class stays an honest limit (r14) |
| 4 | RGATE-001 | D3, worklist 2(b)/3 | skills/review/SKILL.md:489-495 | the continuation prompt of an interrupted plan pass carries no artifact lines, so the recovery path is refused | plan: r13 - the continuation prompt of a plan pass carries the five lines (the plan is unchanged, the hash still holds); W5 tests plan + resume + valid brief |
| 5 | RGATE-001 | D5 Claude = `reviewer` only | skills/review/SKILL.md:252-254, :292-294, :547-549 | another agent type given a plan audit bypasses Gate 2 | no defect: substituting another agent for the auditor is already forbidden at SKILL.md:547-549; named in the honest limit (r14) |
| 6 | RGATE-001 | D4 Gate 2 on `Agent` | hooks/hooks.json:15 | continuing a running reviewer by message is not an `Agent` dispatch | no defect for this ticket: the matcher is pinned at aiwf-selfcheck.js:2229; named in the honest limit (r14) |
| 7 | RGATE-001 | D5 line anywhere in prompt | skills/review/SKILL.md:150-151, :519-520 | an indented `Class: plan` inside pasted text or a diff makes a code brief look like a plan brief | plan: r1/r2 - all five lines are recognised only at column 0 (no leading whitespace); W7 and G6 test an indented line |
| 8 | RGATE-001 | D5 | SKILL.md:52, WORKFLOW.md:748-749 | a Claude plan brief omitting `Class:` is a code brief and passes | no defect: honest limit already stated in blocks D and W2 |
| 9 | RGATE-001 | D4 error path stays ASK | pretooluse-dispatch-gate.js:70-73 | with CLAUDE_PROJECT_DIR unset, relative paths resolve against the plugin root and a valid set is denied | plan: r8 - the plan branch needs a non-blank CLAUDE_PROJECT_DIR, otherwise it asks; G5 tests it |
| 10 | RGATE-001 | D4 | aiwf-lib.js:11, :26-33, :60-61, :87-88, :102 | the shared lib says Gate 2 never blocks | plan: r13 - worklist adds the lib comments |
| 11 | RGATE-001 | D2 one checker; worklist 4 | pretooluse-dispatch-gate.js:115-117, :284 | refRegex is private, so the checker would copy it | plan: r3 - refRegex moves to aiwf-lib.js, exported, used by both |
| 12 | RGATE-001 | checker ref grammar | pretooluse-dispatch-gate.js:57; aiwf-selfcheck.js:984-999 | legacy refs Gate 2 accepts are refused forever | plan: r3 - TICKETS grammar = the TICKET_LINE alphabet `[A-Za-z0-9][A-Za-z0-9_-]*` |
| 13 | RGATE-001 | D8 byte hash | scripts/setup/generate.mjs:142 | a CRLF/LF re-save of an unchanged plan reads as a mismatch | plan: r4 - hash over LF-normalised UTF-8 text, compared lowercase |
| 14 | RGATE-001 | D8 own pass last | skills/review/SKILL.md:311-312 (and :199) | Step 2b says the pass is dispatched right after the fact-check fixes | plan: r13 - :311-312 sends a readiness pass to Step 2d first; :199 "first" is no defect: the ledger is owed once before pass 1, the scan before every pass (class 14) |
| 15 | RGATE-001 | D8 | docs/WORKFLOW.md:386, :399-400 | the bold lead still says the own pass "comes first" | plan: r13 - the bold lead is rewritten too |
| 16 | RGATE-001 | block D/W2 at passes 0 | skills/review/SKILL.md:202-204 | the passes-0 "whole contract" omits the scan and the own-pass file | plan: r13 |
| 17 | RGATE-001 | block D/W2 at passes 0 | docs/WORKFLOW.md:441-443 | same whole-contract sentence | plan: r13 |
| 18 | RGATE-001 | block T | templates/ORCHESTRATOR.md.tmpl:183-186 (and :13-17, :36-42) | the adjacent whole-contract sentence contradicts block T | plan: r13 - :183-186 rewritten; the enumerations name the section, which block T extends - no defect there |
| 19 | RGATE-001 | outcome (4) | templates/CLAUDE.md.tmpl:55, :68-76 | the managed region describes Gate 2 as the Writer-dispatch dialog | no defect: the region describes the two Writer modes, both still true, and claims no "only"; a rerender of every consumer's CLAUDE.md region for a missing clause costs more than it says |
| 20 | RGATE-001 | outcome (4), README worklist | README.md:9-12 | the intro enumerates what each hook decides | plan: r13 - README :11 gains the plan-pass clause |
| 21 | RGATE-001 | hooks.json unchanged | hooks/hooks.json:2 | the description says Gate 2 is the Writer dispatch gate | plan: r13 - the description gains one clause (the matcher and commands stay byte-identical) |
| 22 | RGATE-001 | what hooks read | skills/loop/SKILL.md:115-117 | lists what Gate 2 reads without the brief-named files | plan: r13 |
| 23 | RGATE-001 | block O | docs/OPERATOR_PROTOCOL.md:37-45 | a separate bullet after Gate 4 reads as contradicting "gates the Writer path" | plan: r13 - block O sits directly after the Gate 2 bullet |
| 24 | RGATE-001 | non-configurable lists | OPERATOR_PROTOCOL.md:90-93; WORKFLOW.md:297-300 | the new gate is in neither list | plan: r13 - WORKFLOW :297-298 and the :300 list gain it; OPERATOR_PROTOCOL :90-93 is no defect: it describes the two lines /pnp:roles prints |
| 25 | RGATE-001 | roles out of scope | scripts/setup/aiwf-roles.mjs:631; skills/roles/SKILL.md:112; aiwf-selfcheck.js:4135, :4155 | the audit table never shows the gate | no defect: the table prints configurable rows plus the fact-check row; the gate is named as outside the table in README :218-219 and WORKFLOW :297-298 (r13) |
| 26 | RGATE-001 | precondition only | skills/review/SKILL.md:332-336 | the mode's non-configurable sentence omits the gate | plan: r13 |
| 27 | RGATE-001 | five-line brief | skills/review/SKILL.md:141, :153-157 | the diff skeleton's `Class: plan \| code \| docs` copied literally is not `Class: plan` | plan: r2 - block text says the line is exactly `Class: plan` at column 0 |
| 28 | RGATE-001 | PS control | aiwf-selfcheck.js:2426-2454 | the PS executed fixture is claude-hosted and exits before the gate | plan: r10 - W probes and the PS control run on runPsWrapperWithStub (codex fixture) |
| 29 | RGATE-001 | spikes in gate2Cases | run-spikes.mjs:217-228, :548-549 | gate2Cases ignores a per-case project | plan: r12 - G1/G2 run in a per-case-project list like gate2ModeCases |
| 30 | RGATE-001 | existing reviewer cases | aiwf-selfcheck.js:741, :757-758; run-spikes.mjs:219, :287 | the section title says every Writer dispatch raises a dialog | no defect: the title describes the factory Writer mode, still true; the new cases live in their own section |
| 31 | RGATE-001 | wrapper headers only | scripts/native/README.md:18-26; docs/CODEX_REVIEW_QA_RECIPE.md:195-200 | the two docs of the wrapper contract miss the refusal | plan: r13 |
| 32 | RGATE-001 | absolute root | codex-review.sh:161-162 | PROJECT_ROOT_ABS stays relative when the dir does not exist | no defect: with no project dir there is no roles.json, the resolver's factory record is `claude` and the wrapper exits 2 at the engine check (sh :132-136) before the gate |
| 33 | RGATE-001 | stdin transport untouched | codex-review.ps1:200-203, :331; sh:324 | a second pipeline use of `$Prompt` | no defect: piping a string variable is a read; the pinned codex line stays byte-identical (aiwf-selfcheck.js:2361 pins presence) |
| 34 | RGATE-001 | provenance | dev/PROJECT_OVERRIDES.md:83-86 | a consumer measurement in payload prose | no defect: "a consumer" names no project; precedent docs/WORKFLOW.md:933-934 "measured on a real consumer" |
| 35 | RGATE-001 | D2 | none found - no pin counts scripts/engine files | none | no defect: none found |
| 36 | RGATE-001 | D1 | none found - no seed or skill states the own-pass order | none | no defect: none found |
| 37 | RGATE-001 | D9 | none found - Step 2b references enumerated | none | no defect: none found |
| 38 | RGATE-001 | D3 | none found - no other hook reads the brief | none | no defect: none found |
| 39 | RGATE-001 | D11 | none found - no other home | none | no defect: none found |

## Delta scan before pass 2 (over the r3 changes; agent Explore/sonnet, 2026-10-02)

| # | ticket | decision | surface | violation | closure |
|---|---|---|---|---|---|
| 40 | RGATE-001 | TICKETS ref must be a ticket heading | dev/backlogs/active/PLAN_HARD.md:60, :2981, :3027 | HARD-014 (dropped) has only a table row; a heading merely naming it would pass | no defect: a dropped number is not a ticket a pass audits; the r4 first-token rule refuses a heading that only names it |
| 41 | RGATE-001 | heading rule | PLAN_HARD.md:342, :1284, :385; fenced blocks in PLAN_RGATE | any heading mentioning the ref counted, incl. aliases and fenced `#` lines | plan: r4 - the ref must be the heading's FIRST token, headings inside fenced blocks are skipped |
| 42 | RGATE-001 | heading rule vs older plans | archive 001-004 headings | none - every archived ticket has a heading with its ref | no defect: none found (P8, AUD-001, DEV-001 pass the first-token rule) |
| 43 | RGATE-001 | five-line check | skills/review/SKILL.md:489-495 | continuation prompt carries none of the lines | no defect: worklist 5(j) makes the continuation of a plan pass carry the five lines |
| 44 | RGATE-001 | Class line mandatory | WORKFLOW.md:748; SKILL.md:51-52 | Class line optional elsewhere, defaults to code | no defect: the readiness brief shape (5(b)) prescribes `Class: plan`; a plan run without it is refused with `line-missing:Class` naming the fix |
| 45 | RGATE-001 | five-line check, other brief writers | SESSION_BRIEF_RECIPE.md:45 and others | none | no defect: none found |
| 46 | RGATE-001 | class-not-plan | SKILL.md:141 diff skeleton literal | a literal skeleton copy is refused / unrecognised | no defect: refused on codex by design; unrecognised on claude is the stated honest limit (block D) |
| 47 | RGATE-001 | duplicate semantics | PLAN text pasted into a brief | a column-0 `TICKETS:` in pasted text duplicates the line | no defect: the result is a refusal naming `line-duplicate`, the safe direction; the readiness brief names the plan file rather than pasting it |
| 48 | RGATE-001 | scan whitelist + empty cells | this file rows 35-39 | empty violation cells | plan: this file fixed - rows 35-39 now carry `none` |
| 49 | RGATE-001 | scan header | this file | same defect as 48 | plan: fixed with 48 |
| 50 | RGATE-001 | D13 no QA | WORKFLOW, overrides, qa/loop skills, LOOP | none - every QA rule is conditional on observable runtime/UI | no defect: none found |
| 51 | RGATE-001 | D13 "non-runtime" | docs/LOOP.md:13-14 | the ticket does have observable behavior | plan: r4 - D13 reworded: observable behavior exists, QA has no E2E artifacts to judge here, the probes are the proof |
| 52 | RGATE-001 | archive timing | WORKFLOW.md:625-638, :689-691 | release record written into the archived plan after the tag | no defect: release facts (CI run, tag) do not exist at archive time; precedent 006_PLAN_RDY + its release record commit b7a5e01 |
| 53 | RGATE-001 | rule-class grep | the draft (17 lines), 005 (27) | none - the grep can hit | no defect: the archive step reads every line it returns |
| 54 | RGATE-001 | pnp-live refresh | CLAUDE.md:172-173; 006_PLAN_RDY:401-403 | precedent asked a word + porcelain check | plan: r4 - a porcelain check precedes every refresh; the word is the CLAUDE.md operator-zone standing rule |
| 55 | RGATE-001 | code pass via the 0.2.14 wrapper | the repo copy of the wrappers | the repo copy (0.2.15) could gate a code brief quoting the lines | no defect: `/pnp:review` invokes `${CLAUDE_PLUGIN_ROOT}` = D:\pnp-live (CLAUDE.md § This repository is the plugin) |
| 56 | RGATE-001 | block O "complete" | OPERATOR_PROTOCOL.md:37-45 | "complete" stronger than what is checked | plan: r4 - blocks O and T name exactly what is checked |
| 57 | RGATE-001 | block T vs COVERED BY | ORCHESTRATOR.md.tmpl:66-83 | the checker does not read COVERED BY | no defect: block T makes no claim about the coverage line, which the plan does not change |
| 58 | RGATE-001 | PS runner class | aiwf-selfcheck.js:2781 | runner hardcodes `-Class code` | no defect: worklist 12 already gives the runner a class (and PATH) parameter |
| 59 | RGATE-001 | W9 PATH | aiwf-selfcheck.js:210-217 | the pwsh directory is unknown; PWSH may be powershell | plan: r4 - located with `where pwsh` at probe time; otherwise `[NOTE]` |
| 60 | RGATE-001 | W9 stub on node | aiwf-selfcheck.js:2769, :2771 | none - reasoning confirmed | no defect: W9 reads the exit code and the refusal line |
| 61 | RGATE-001 | W9 exit exactly 2 | codex-review.ps1 (no Stop preference) | none | no defect: none found |
| 62 | RGATE-001 | W9 on POSIX | ci.yml ubuntu | removing node's dir may remove /usr/bin | plan: r4 - W9 runs on win32 only, `[NOTE]` elsewhere |
| 63 | RGATE-001 | ctl-6 detection | aiwf-selfcheck.js:2504-2560 | depends on the stale `$LASTEXITCODE` being 0 | no defect: it is 0 (the resolver succeeded to reach the gate), the wrapper then hits codex.cmd without node and exits non-2, which W9 detects |
| 64 | RGATE-001 | every token has an M case | internal-error | no case | plan: r4 - stated as the one exception, `[NOTE]` |
| 65 | RGATE-001 | column-0 vs Gate 2 Ticket: parser | pretooluse-dispatch-gate.js:57 | two parsers of brief lines differ | no defect: different brief families (Writer vs review); column 0 is D5's answer to pasted text (scan row 7) |

## Delta scan before pass 3 (over the r5 changes; agent Explore/sonnet, 2026-10-02)

| # | ticket | decision | surface | violation | closure |
|---|---|---|---|---|---|
| 66 | RGATE-001 | D13 no QA | docs/LOOP.md:15 | the runtime route table orders /pnp:qa | plan: r6 - D13 names itself a recorded operator exception to this rule, for this ticket |
| 67 | RGATE-001 | D13 no QA | skills/loop/SKILL.md:73-74 | the loop skill orders QA for declared observable behavior | plan: r6 - listed in the D13 exception |
| 68 | RGATE-001 | D13 no QA | docs/WORKFLOW.md:742, :770 | prescribes /pnp:qa; the plan cited :739 | plan: r6 - citation corrected to :742, listed in the exception |
| 69 | RGATE-001 | D13 no QA | CLAUDE.md:51 | orders /pnp:qa for observable behavior | plan: r6 - listed in the exception |
| 70 | RGATE-001 | D13 no QA | dev/PROJECT_OVERRIDES.md:297 | QA conditional on observable behavior | plan: r6 - listed in the exception; the ruling is in CANDIDATES § Ruling ledger |
| 71 | RGATE-001 | fence rule | PLAN_HARD.md:2882-2900 | an opener with an info string is untested | plan: r6 - info strings allowed by the rule; M36 uses a ```text opener |
| 72 | RGATE-001 | fence rule | PLAN_HARD.md:1677-1793, :2518-2566 | fences indented 3 spaces | plan: r6 - up to three leading spaces open and close a fence |
| 73 | RGATE-001 | fence rule | PLAN_RGATE closing clause | unclosed fence, closer with info, longer containing shorter undefined | plan: r6 - closer is the same marker, at least as long, nothing else; a shorter inner fence does not close; unclosed runs to EOF; M36 variants + M37 passing side |
| 74 | RGATE-001 | heading rule vs Gate 2 lookup | pretooluse-dispatch-gate.js:115-165 | the Writer lookup clears a ref found anywhere | plan: r6 - the difference is stated as intended (two different questions) |
| 75 | RGATE-001 | fence rule | none found - no `~~~` or 4-backtick fences in dev/backlogs | none | no defect: none found |
| 76 | RGATE-001 | six-column header | consequence-scan.md:6, :50 | two tables; one or all read unstated | plan: r6 - every table with the exact header is read, rows pooled; M38 |
| 77 | RGATE-001 | table rows start with `\|` | block C agent row format | agent rows have no leading pipe; pasted rows drop out | plan: r6 - Step 2c records rows with leading and trailing pipes; a digit-led row without a pipe inside a scan table is `scan-row-shape` (M39) |
| 78 | RGATE-001 | six-column header | none found - every existing scan table has the six columns | none | no defect: none found |
| 79 | RGATE-001 | literal ids | none found - no `plan-gate` ids in the tree yet | none | no defect: none found |
| 80 | RGATE-001 | pair model | aiwf-selfcheck.js:950-961 | seven variants share one control | plan: r6 - the model is stated as a fixture family with a flipping counterpart (:790-791), not one pair per case |
| 81 | RGATE-001 | pair model | M19, M20 | --hash cases pair with each other | plan: r6 - M19 <-> M20 named as the --hash pair |
| 82 | RGATE-001 | pair model | M21 | same outcome as M1 | plan: r6 - M21 <-> M22/M31 named |
| 83 | RGATE-001 | pair model | M17, M7, M33, M36 | two facts differ | plan: r6 - refusing cases run on M1's fixture with the NAMED damage (one or more facts), M1 being their passing side |
| 84 | RGATE-001 | pair model | M18, M23, M24 | pass-side cases | plan: r6 - counterparts named (M18<->M28, M23<->M3, M24<->M34); the base fixture carries LEGACY-7 rows |
| 85 | RGATE-001 | controls | M35, M36 | no sabotage control; M36 two facts | plan: r6 - M36 changes only TICKETS (the fenced heading is in the base fixture) and pairs with M37; M35 pairs with M1; sabotage controls are additional |
| 86 | RGATE-001 | every outcome has a case | usage exit 2; unreadable-stdin pass | no M case, no NOTE | plan: r6 - M40 (usage); the unreadable-stdin path is a `[NOTE]` with its reason |
