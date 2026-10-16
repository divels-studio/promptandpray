# Cross-project alignment of GENERIC rules - COO decision (2026-10-16, DRAFT, no action taken)

Inputs: rules-pnp.md (58 generic), rules-silerax.md (77), rules-furnissimo.md (71), rules-matrix.md (106
concepts). Scope: non-product rules only. Principle per row: (1) if the payload (0.2.19 docs/templates/
skills) carries the rule, no project keeps a local copy UNLESS the copy was seeded by the overrides
template (those stay - the plugin chose to render them) or adds a clause the payload lacks (the
clause stays as a one-line addition with its marker); (2) otherwise all three projects carry the SAME
sentence with the same `(operator rule <date>)` marker - the fullest/newest version wins; (3) a
rule that only makes sense with a capability a project lacks (E2E, lint, hooks) is marked n/a there.
Every change on a consumer lands through its own session on the operator's dialog; PnP's through this
session. Nothing below is executed before the operator's word.

## A. Questions for the operator (contradictions the COO cannot settle - operator rules on both sides)

Q1 (C-001) QA default. Three rules: payload + PnP "QA runs when the brief declares observable
runtime/UI behaviour"; Silerax "QA only on the operator's explicit word, for a ticket whose result the
COO cannot read from the JSON" (operator rule 2026-10-05); Furnissimo "QA is never n/a for a visible
ticket" (operator rule 2026-08-31). Recommendation: the payload's rule as the one text everywhere -
the brief declares observable behaviour (the COO's call), and a declared ticket gets its QA pass
without a further word; Silerax's cost clause is REVOKED, Furnissimo's "never n/a" is the same thing
said from the other side. Alternative: keep Silerax's word-per-QA as the rule everywhere (cheaper,
one more word per ticket).

Q2 (C-003, C-068) How a product/UX question reaches you. Silerax: AskUserQuestion dialog, numbered
options, up to 4 points per dialog, one topic each (COO rules). Furnissimo: in CHAT, one sentence per
question, the recommended option first; no built mockups (operator rule 2026-10-04). Recommendation:
Furnissimo's (it is your dated rule) with Silerax's batching clause kept ("up to 4 points in one
message, decisions recorded once at the end") - chat, not the dialog tool.

Q3 (C-004) What the operator channel may carry. PnP: "no file:line, no counts" (operator rule
2026-09-22). Furnissimo + payload: a few lines WITH counts (tickets, audits passed, blocker/correction
counts, remaining gates) + the path (operator rule 2026-09-10; WORKFLOW "numbers and names rather than
categories"). Recommendation: one text everywhere - "short; numbers and names the operator acts on
(counts of blockers, passes, gates, costs) are fine; never file:line, test ids or code names - the
evidence lives in briefs and records". This relaxes PnP's "no counts" to "no identifiers".

Q4 (C-056) Ticket-end cleanup. Silerax: "stop the environment and delete the ticket's heavy .aiwf
artifacts without asking; asking is a process defect" (operator rule 2026-10-06). Payload: "a delete
is the operator's dialog". Recommendation: compatible reading everywhere - no CHAT question, the
rm/Remove-Item dialog is the gate; confirm that is what you meant on 2026-10-06.

## A-resolved (operator answers 2026-10-16, verbatim where words)
- Q1: „съгласен" -> the payload's QA rule everywhere; Silerax's 2026-10-05 word-per-QA REVOKED.
- Q2: „Силеракс печели - с диалог ... диалог само за продуктови решения, за да не пречат на автономната
  работа" -> text everywhere = CANDIDATES § „Прием от Silerax" item 26: an AskUserQuestion dialog with
  numbered options, one topic, ONLY when the ticket cannot continue without the answer (product
  decisions); everything else is collected in a "questions for the operator" list and asked once at the
  ticket's end; up to 4 points per dialog, decisions recorded once. Furnissimo's "ask in chat" (2026-10-04)
  is replaced; its "no built mockups" clause stays (C-072 reconciled).
- Q3: „да искам числата без подробности за файловете, само (брой блокери, пасове, цена)" -> text
  everywhere: "replies to the operator are short and carry the numbers the operator acts on - counts of
  blockers, passes, cost - never file:line, test ids or code names; the evidence lives in briefs and
  records" (operator rule 2026-09-22, sharpened 2026-10-16). PnP's "no counts" is superseded.
- Q4: „не само ... остатъците от тестовата среда а за всичко което по време на работа агентите и COO
  са създали в .aiwf. Ако има нещо (артефакт) което трябва да остане ... отива в документационната
  папка" -> text everywhere: "at the end of a ticket everything the ticket created under `.aiwf/` is
  deleted - the environment stopped, no chat question, the rm dialog is the gate; anything worth keeping
  moves to the documentation folder (readiness/<ABBR>/ or the record) BEFORE the delete; `.aiwf/` holds
  only the live loop mechanics" (operator rule 2026-10-06, widened 2026-10-16).
- (в): „не са локални" -> C-044 tail, C-045 lint baseline, C-065 timeout, C-071 repo root are generic: spread.
- (б): no problem seen by the operator -> C-059 diff-review record and C-060 plan-by-sections spread to all three.
- Execution safeguard (COO): each session shows its dry-run list (lines added/trimmed/deleted) before
  its commit; sonnet equivalence scan; commit on the operator's dialog.

## B. Contradictions settled by the COO (no operator rule on both sides)

C-002 parallel vs portions: NOT a contradiction - PnP's portions rule is machine/VERIFY-specific
(PRODUCT); Silerax's "independent units run in parallel by default; time is a resource on par with
tokens" is GENERIC -> adopt in PnP and Furnissimo with the clause "subject to the project's machine
resource rule where one exists".

## C. Alignment list (target text = the fullest version; action per project)

Legend: ADOPT = add the sentence with its marker; TRIM = keep only the clause the payload lacks;
DEL = delete the local copy (payload or template carries it); KEEP = already there; n/a = capability absent.

### C1. Rules every project gets the same (TWO-OF-THREE / ONLY-* that are generic)
| # | Rule (marker) | PnP | Silerax | Furnissimo |
|---|---|---|---|---|
| C-015 | Checks (full VERIFY, acceptance commands, re-runs) run by a fresh sonnet scan agent with only the brief's commands; fixes nothing; exact exit codes + counts + failing names + tail; stops on env failure; Writer only on a failure, and still runs its own red-seen test while writing (operator rule 2026-10-15) | KEEP | KEEP (add the Writer-red-test dual) | ADOPT |
| C-016/017/018 | Checkpoint file rewritten WHOLE at every gate and at >=950k / immediately at >=1000k; compaction is the operator's; after compaction read only the checkpoint + named files; "a title is not the text" - reread rule text before a gate (operator rule 2026-10-14) | KEEP | KEEP | ADOPT + port the context-gate hook from Silerax (a Furnissimo ticket) |
| C-019 | Readiness only through `/pnp:review` Class: plan Steps 2a-2d verbatim, skill loaded before any scan agent (operator rule 2026-10-14) | KEEP | KEEP | ADOPT (keep FUR-076/077 as its own clauses, see C-038) |
| C-020 | Chain-trace in the evidence pack of every code auditor pass (operator rule 2026-09-24; expires when the payload carries it - PnP candidate exists) | ADOPT | KEEP | KEEP |
| C-021 | An answer carries only what is new; no recap, no narration; interim notification with no result = nothing; a status is one line (operator rule 2026-09-27; still-running 2026-10-11) | ADOPT (SIL text) | KEEP | ADOPT the still-running clause |
| C-022 | A „да" covers only the named action; a bundled "and then X" or an earlier skipped "apply?" is not approval; role/config changes need an apply word naming the change (operator rule 2026-09-23) | KEEP | ADOPT | ADOPT (keep FUR-087 as its narrower sibling) |
| C-023 | Every out-of-scope finding goes to the operator with a proposed destination (plan ticket per guard (b), or candidates), asked at the ticket's end; nothing stays only "pre-existing" (operator rule 2026-09-30) | ADOPT | KEEP | KEEP |
| C-025 | COO routing tiers: top = Fable, cheap = Opus, never a Sonnet COO; routing moves the COO only (operator rule 2026-10-15) | KEEP | ADOPT | ADOPT |
| C-026 | A Claude-hosted judging agent never runs below the session model; scans stay haiku/sonnet (operator rule 2026-08-31) | KEEP | ADOPT | ADOPT |
| C-028 | No review dispatch justified from precedent (operator rule 2026-09-13) | KEEP | ADOPT | ADOPT |
| C-029 | Each paid pass measured as its own quota start/stop pair; token counters overstate resumed passes (COO) | KEEP | ADOPT | ADOPT |
| C-033 | Removing a git worktree and deleting a memory directory are destructive -> explicit confirmation (COO) | KEEP | ADOPT | ADOPT |
| C-034 | A ticket born mid-work: written into the plan, its questions asked, the plan committed ONCE after the answers; no answer in the session -> commit with the question recorded open (operator rule 2026-10-01) | ADOPT | ADOPT | KEEP |
| C-035 | Blockers paid for on the previous ticket enter the next brief as literal requirements and the diff is checked against that list before the paid pass (operator rule 2026-09-10) | ADOPT | ADOPT | KEEP |
| C-036 | A promise over N surfaces needs N fixtures/asserts, not one sample (COO, from operator correction 2026-09-09) | ADOPT | ADOPT | KEEP |
| C-037 | Every delete/edit of an entity in a plan checks who references it and what happens to the references (COO, 2026-09-09) | ADOPT | ADOPT | KEEP |
| C-038 | No pointer-refresh agent before the fact-check (the gate returns the new line with every FALSE); the delta consequence scan and the delta fact-check run in parallel, never merged (operator rule 2026-10-02; expires when the payload carries it - PnP candidate exists) | ADOPT | ADOPT | KEEP |
| C-039 | A step "in a turn of its own" is a separate step inside the same autonomous run; a turn ends only at a gate, a stop or the stop condition (operator rule 2026-10-16; PnP candidate exists) | ADOPT | ADOPT | KEEP |
| C-040 | E2E runs with `--trace retain-on-failure`, not `--trace on` (operator rule 2026-10-04; overrides `/pnp:qa`; expires when the payload carries it) | n/a | ADOPT | KEEP |
| C-041 | The JSON report of an E2E run is copied out of the output dir right after the run; before deleting test/build output the COO checks no uncopied evidence is left (operator rule 2026-10-04) | n/a | ADOPT as a rule (today only a check-agent step) | KEEP |
| C-042 | Resource checks (RAM) before a paid pass are the COO's own, never a question to the operator; never stop the operator's dev server for the agents (operator rule 2026-09-01) | ADOPT | ADOPT | KEEP |
| C-043 | No `cd` prefix on ANY command, git or not; reach into a workspace with the tool's own flag (operator rule 2026-09-09) | ADOPT | ADOPT | KEEP |
| C-044 | Never pipe a test run through tail; run to a log file and read it (COO) | ADOPT | ADOPT | KEEP |
| C-045 | The lint baseline is a standing operator decision, never raised silently (COO) | n/a | ADOPT | KEEP |
| C-047 | Never a whole PLAN in front of the operator: a few lines + the path (operator rule 2026-09-10) | ADOPT | ADOPT | KEEP |
| C-048 | Do not offer `/pnp:brief` when the state is durable - "new session, /pnp:mission"; a brief only mid-flight (operator rule 2026-09-10) | ADOPT | ADOPT | KEEP |
| C-049 | The COO runs scripts itself wherever the host allows; a `!` command goes to the operator only when the host blocks (operator rule 2026-09-29) | ADOPT | ADOPT | KEEP |
| C-050 | A mission's resume/status memory holds only the CURRENT state, rewritten whole; MEMORY.md one line per memory (operator rule 2026-10-04) | ADOPT (practised, not written) | ADOPT | KEEP |
| C-053 | A repo copy of a live artifact is refreshed the moment anything declares it canon; the check is a mechanical diff (operator rule 2026-09-15) | ADOPT | ADOPT | KEEP |
| C-054 | The gate is not prompted; the operator's refusal is a valid answer, not an obstacle to route around (COO) | ADOPT | KEEP | ADOPT |
| C-055 | Agents work without dialogs except at the gates (commit, push/merge, destructive, paid pass); every Writer brief carries the line (operator rule 2026-10-05) | ADOPT | KEEP | ADOPT |
| C-058 | The Writer's reply to the COO is <= ~25 lines; details go in the handoff file (operator rule 2026-10-10) | ADOPT | KEEP | ADOPT |
| C-059 | Before the auditor pass the COO reads the whole diff and records it in `.aiwf/<TICKET>-diff-review.md` (hashes, files, findings, decisions) (operator rule 2026-10-10; expires when the payload carries it) | ADOPT | KEEP | ADOPT |
| C-060 | A new session reads from the PLAN only the shared sections and its ticket's section (operator rule 2026-10-10; expires when the payload carries it) | ADOPT | KEEP | ADOPT |
| C-061 | The plan's COO line names the model: `COO: <model> - because <check>` (COO) | ADOPT the model name into the existing `COO: top|cheap` line | KEEP | ADOPT |
| C-062 | Paid passes beyond the one Codex pass over the diff are stated in the first sentence of the report (count, engine); a paid pass outside readiness/diff audit is written into the plan with cost; the currency is the euro (operator rule 2026-10-03) | ADOPT | KEEP | ADOPT |
| C-063 | A dead paid pass gets a report with the numbers and waits for the word; no local re-dispatch; scan-tier retried freely; the finish after the word uses `-ResumeId` (COO + FUR-131) | ADOPT | KEEP | ADOPT the wait clause |
| C-064 | A non-green suite is judged against a recorded baseline JSON (zero newly failing), never "exit 0" (COO) | n/a | KEEP | ADOPT |
| C-065 | Commands over ~5 minutes run in the background for every role, timeout >= 3600000; a capped run is not restarted on one's own (COO) | ADOPT | KEEP | ADOPT |
| C-066 | A file count on disk is not a runner count; the collected figure comes from the suite's summary line (COO) | ADOPT | KEEP | ADOPT |
| C-067 | Every ticket brief carries one line `E2E: yes/no - because ...` (COO) | n/a | KEEP | ADOPT |
| C-069 | When the operator objects to a cost or process: stop the tools in the same turn, answer, wait (COO) | ADOPT | KEEP | ADOPT |
| C-070 | Informal address to the operator, in every session (operator rule 2026-10-04) | ADOPT | KEEP | ADOPT |
| C-071 | Sessions start from the repo root; a wrong start is reported at once (COO; PnP rejected it for the payload) | n/a (always root) | KEEP | ADOPT |
| C-072 | When the operator points at a problem, analyse and decide instead of handing back options; a UX question comes with an existing screenshot or a plain example, never a newly built mockup (operator rule 2026-10-05 + FUR 2026-10-04 reconciled) | ADOPT | TRIM (picture = existing example) | ADOPT |
| C-073 | A documentation claim is a hypothesis; the code is the authority; a disagreement is a finding (COO) | ADOPT | KEEP | ADOPT |

### C2. DIFFERS - one target text
| # | Target | PnP | Silerax | Furnissimo |
|---|---|---|---|---|
| C-005 | VERIFY is proportional to the diff: the suites the diff can break, named in the brief; the full set only where the project's policy names it (CI after the push / phase end) (operator rule 2026-09-24) | KEEP | KEEP (phase-end clause stays, product) | ADOPT |
| C-006 | Test routing: unit for pure logic; E2E only for a business result through server+browser that cannot be proven otherwise - never a visual property, a text or "the page loads" (operator rule 2026-10-05) | ADOPT (n/a for E2E, keep the sentence) | KEEP | ADOPT |
| C-008 | Changelog: bold title <= ~80 chars; optional sub-items max 3-5 | ADOPT the caps | KEEP | ADOPT the sub-items cap |
| C-009 | Session boundary = ticket boundary; a heavy ticket starts in a fresh session when the operator says so; a long context alone is no reason for a new session (operator rule 2026-10-14) | ADOPT heavy-ticket clause | KEEP | ADOPT |
| C-010 | A verification pass resumes with the explicit `-ResumeId` recorded at pass-1 time; bare `-Resume` only when one session is known to hold the tree (operator rule 2026-10-02) | ADOPT (memory text changes) | KEEP | ADOPT |
| C-011 | The small-round suppression dual is the payload's (<= ~10 lines, audited files, red-seen test, exclusions) - no local restatement; "prose-only doctrine change takes no auditor pass" stays a PnP config fact | KEEP | DEL SIL-092 restatement | DEL FUR-059 |
| C-012 | Auto mode blocks edits to `.claude/settings.json`, hooks and config: ask the operator in the first reply to turn auto mode off; if still blocked stop and explain; never bypass through sed/heredoc; the operator may hand-edit from the COO's exact lines (COO; incidents 2026-08-18, 2026-10-16) | ADOPT | ADOPT the ask-first clause | KEEP |
| C-013 | Every candidate is registered in the session it was born, with a retrigger/expires condition; done items marked, never deleted | ADOPT | ADOPT same-session clause | ADOPT retrigger clause |
| C-014 | A version bump is manual, never by a hook; the tag is the irreversible half and takes its own word | KEEP | KEEP | ADOPT |
| C-007 | Commit message format - PRODUCT (Conventional Commits is Silerax's convention); only `Refs: <TICKET>` is generic (payload) | - | - | - |

### C3. PAYLOAD-CARRIES - local copies
Template-seeded sections stay as rendered (C-074..C-087, C-094, C-095, C-101, C-102; the plugin chose
to render them). Delete or trim the NON-template restatements:
- C-088 SIL-069 VERIFY honesty -> DEL (payload). C-089 FUR-156 tail "never edit through the shell" -> DEL; SIL-028/014 additions (unix2dos, script writes, gated verb never as text) -> KEEP as additions. C-090 FUR-069 -> DEL (pointer only). C-091 keep PNP-105 (shell-redirection workaround) as an addition. C-092/C-093 SIL-124, SIL-120, FUR-095 -> DEL (reviewer/writer contracts are the payload's). C-096 PNP-088 memory pointer stays (already a pointer). C-097/C-098 SIL-038 part -> KEEP (the candidates clause is C-013). C-099 FUR-116 (a word for content is not a word to write into a live foreign tree) -> KEEP as addition in all three (ADOPT PnP, SIL). C-100 SIL-085 -> TRIM to the unrecorded-infrastructure-fact clause. C-051 FUR-088 -> DEL. C-052 FUR-097/098/082 -> DEL (payload). C-080 FUR-085/086 -> TRIM to the template line. C-030 PNP-095: no change (the pack's spot-check duty and the fact-check's no-sampling are different instruments).

### C4. SAME - small unions
- C-103 trailers: one text everywhere: "no Co-Authored-By, Claude-Session, session URL or 'Generated by' in any commit or PR, COO and Writer alike; every Writer brief carries the line" (operator rule 2026-08-31) - PnP: ADOPT as an overrides § Hard rules line (today memory only); SIL/FUR: ADOPT the union wording.
- C-104 surgical edits: add FUR's "a needed whole-file restructure is announced in one line first" to PnP and SIL.
- C-105 marker rule, C-106 English: SIL adds the 2026-10-16 restatement date. Done otherwise.

## D. Out of scope (stays per project): PRODUCT rows of the inventories; C-002 portions (PnP machine), C-007 commit format, C-031 runbook pointer (PnP has the runbook; a consumer with a runbook may adopt), C-032 CI proof (PnP), C-046 version policy (FUR), C-057 worktree recipe (SIL stack), SIL-011 (local ask-rule choice), C-024 (payload general).

## E. Execution shape after the operator's word
One list per project (ADOPT/TRIM/DEL lines with the target text), sent to its session; each project
lands it as ONE overrides commit + memory pass + a ledger row quoting the operator's word for this
alignment; PnP's done here. A sonnet equivalence scan per project before the commit (obligations
present / provenance homed), as in the three-way pass. Furnissimo's hook port is a separate ticket there.
