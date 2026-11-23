# The Opus experiment and what followed - the PnP arbiter session, 2026-11-23 (second session of the day)

Written into the tree by the arbiter session itself, on the operator's word of 2026-11-23: "запиши до тук каквото е необходимо,
репото е свободно". It continues `dev/changes/audit-measures-2026-11-23.md` (the casus, the Fable plan's baseline, the measures
M1-M4). It is evidence and an opinion, not doctrine. §§ 1-8 were written before the conversation about the measures; the operator then DECIDED them the same
evening - § 9 is the decision and supersedes every "not decided" above it.

Marks. OPENED = the arbiter opened the file itself. CODEX = the comparison pass's own reading, not re-checked by the arbiter.
PEER = reported by the Silerax session "PRCCAA Plan" in a cross-session message, not opened by the arbiter. The consumer is
Silerax, `D:\Stratex`.

## 1. How the session went, and the operator's correction

The session was opened with `/pnp:arbiter` on the parked brief `.aiwf/arbiter-brief.txt`. The arbiter found the Opus plan
itself, asked the brief's two questions in one dialog, and returned a full ruling in its first turns. The operator: "ти нормален
ли си не ме остави да напиша нито една дума даже не си наясно какво искам от теб" and "паркирания бриф беше от другата сесия
арбитражна и целта му беше да те насочи и да продължиш неята работа". The brief was an orientation for a conversation ("решаваме
какво правим"), not a case to be ruled on before he spoke. The ruling of § 3 below is therefore an opinion he has not discussed.

A second correction: the arbiter launched the comparison pass on the model of this project's audit table (gpt-6.1-sol) and told
him only afterwards that the two plans had been audited on gpt-6.2-sol. The operator: "спри го", then "това за модела на
аудитора можеш ли да ми го кажеш в началото". The pass was stopped; the choice was put to him; his word: "първо смени тука в
репост всички модели на 6.2 и след това пусни наново паса" (§ 6).

## 2. The Opus run - plan PRCCAA (Silerax, 2026-11-23)

The operator's dialog answers in this session: PRCCAA is the Opus plan ("Да, PRCCAA е на Opus"); the Opus session did not have
the Fable session's notes ("Не, нямаше ги"). The Fable plan PRCCA was moved to `D:\RCCA_TMP` (found by the arbiter on his word).
The operator's statement of the two settings: Fable 5.2 at medium effort, Opus 5.5 at high effort.

| what | figure | source |
|---|---|---|
| plugin version | 0.3.24 | OPENED `D:\Stratex\.claude\aiwf-native\aiwf.config.json`:4 |
| readiness pass 1 | Codex gpt-6.2-sol, xhigh, cold; `BLOCKERS: 13 INFO: 3`; 224,202 tokens | OPENED `D:\Stratex\dev\backlogs\readiness\PRCCAA\round-1.md`:3-4 |
| readiness pass 2 | the same session resumed, on the operator's word there; `BLOCKERS: 1 INFO: 2`, `CLOSED: 8 OPEN: 5`; 353,328 tokens cumulative | OPENED `round-2.md`:3-5 |
| revisions | 2 (the cap); revision 2 not re-audited | OPENED `readiness\PRCCAA\ledger.md`:43 |
| tickets | 2 | OPENED `drafts\PRCCAA\PLAN_PRCCAA.md`:2 |

Pass 1 against pass 1, by the four kinds of the first file's § 2 (the arbiter's classification, judgement-based at the margins -
B2 and B6 of the Opus plan could sit elsewhere):

| kind | Fable PRCCA (11) | Opus PRCCAA (13) |
|---|---|---|
| a real gap in the design | 4 (B1, B2, B5, B8) | 5 (B2 existing form tests left without the choice; B6 the migration's lock; B7 a mark-only edit of a VAT-on invoice changes money; B11 the E2E fixture the seed helper rejects; B12 the filter proof passes with an unwired checkbox) |
| the order of checks and the commands, restated in the plan | 4 (B7, B9, B10, B11) | 3 (B9 who runs the reset and the E2E build; B10 the unit gate and its baseline; B13 the E2E `-Require`) |
| the plan's form | 2 (B4, B6) | 5 (B1 the closing-grep sets; B3, B4, B5 the read / lock / write rows of the transactions; B8 a roadmap home for a deferred item) |
| rejected | 1 (B3) | 0 |

Opus pass 2: one new blocker, a real one (B14 - the note-create proof passes for a writer that always stores `false`).

Comparability (the six points of the first file's § 6): the same plugin version - yes; the same auditor, pass 1 cold - yes; no
leaked notes - on the operator's word; pass 1 with pass 1 - yes; the research - NOT the same (CODEX: the Fable plan built on its
session's phase-wide research, the Opus session ran its own scans and obtained additional product rulings); the test policy
document - not checked.

How the Opus plan came to restate the procedure: its index carries a paragraph "The E2E sequence" and one "The unit gate"
(OPENED `PLAN_PRCCAA.md`:66-84), both written or widened by the revisions that answered B9, B10 and B13. The planner brief of the
payload orders exactly that: "Acceptance is literal commands, each with the output that would mean 'broken'", "procedures and
tables move to the index", and the VERIFY COMMANDS slot (OPENED `templates/briefs/planner.md`:17-20, :60-66).

## 3. The arbiter's opinion on M1-M4 after the experiment (NOT discussed with the operator, NOT decided)

Direction of the one run: the cause is the plugin, not the model - two models drew the same kinds of wrapper blockers in about
the same number (6 of 11, 8 of 13). One run is a direction.

- M1 (a BLOCKER names a loss) - in, AMENDED: a proof that cannot fail for the ticket's own product property stays a blocker
  (as written, M1 would turn PRCCAA's B12 and B14 and PRCCA's B8 into notes); a test that merely cannot run is a note.
- M2 (the plan does not restate the procedure) - in, and it starts at the planner brief, which itself orders the restatement.
- M3 (plan-form duties scale with the change) - in unconditionally: a second case on a second model (PRCCAA B3-B5 for a write
  that carries one more column). A migration's lock stays a real finding where the project's stage needs it (§ 5).
- M4 - (a) the count by kind per readiness round, in; (b) "a rule change ships at the second case" is PnP's own working rule,
  not payload text - it goes through the operator's approval of a text.
- No measure about the planning model.

## 4. The comparison pass (Codex) and the operator's question

The operator's question, in his words: "искам да разбера за в бъдеще тъй като квотите на фабел са ограничени дали мога спокойно
да ползвам Опус за планиране на такъв ти планове където има миграции малко по-сложни архитектурни решения ... дори и с цената на
повече блокери от страна на кодекс". The number of blockers was explicitly not the score.

The pass: one cold read-only Codex pass, gpt-6.2-sol, xhigh, over both plan folders and the code; 263,643 tokens (the wrapper's
`codex-review: tokens used` line); session `01a2095a-ee3b-76a3-8a4a-7c557e7d46c5`; brief `.aiwf/PLANCMP-001-review-brief.txt`
(untracked scratch); log `<temp>/pnp-codex/PLANCMP-001-code-20261123-190123-22644.log` (outside the repository). A first launch
on gpt-6.1-sol was stopped by the operator after a few minutes; no figure was printed for it.

Its answer (CODEX): SAFE WITH CONDITIONS for letting Opus 5.5 at high effort plan plans of this type. The two plans are close;
each caught what the other missed. Still wrong in the final plans, by its reading:
- both: a mark-only edit submits the whole document - on a legacy VAT-on invoice of a supplier without a VAT number the save can
  store it without VAT and recalculate the totals (Fable did not see the case; Opus documented it and left it); a stale open form
  can overwrite a newer line;
- Fable only: the filter's browser proof opens a prebuilt URL; the field's error is not tied to the control; a header triangle on
  the detail where the product rule asks for the warning block;
- Opus only: the migration's `ALTER TABLE` has no lock-wait limit; the radio group has no accessible name and the ticket relied on
  `FormMessage`, which renders nothing on an error - the defect the Fable plan's audit had found and neither Opus pass rediscovered.
Its limits: one run per setting cannot establish failure rates or attribute a difference to the model; the two runs did not share
the research; revision 2 of neither plan was audited.

The operator's rulings on it: the VAT document - "нереалистично, това е стар тестов документ създаден от мен"; the migration's
timing - upgrades are done with the whole system closed and the users warned, there is one beta-testing company whose data is
also kept in a parallel software, a daily backup exists, and planning a migration under live users is his own duty. With the two
HIGH findings set aside the two plans are about equal. The arbiter's answer to his question: yes, Opus for planning plans of this
type - a direction from one run. He accepted the Opus plan.

## 5. What was done in Silerax (by its own session, on the operator's dialogs there)

- The arbiter sent the Silerax session "PRCCAA Plan" one correction to PRCCAA-001 on the operator's word: the choice control is
  composed so the refusal text shows in the label's inline error span, and the radio group gets its accessible name; the shared
  form kit's dangling `aria-describedby` goes to a Deferred line, the choice between a roadmap line and a fix left to the
  operator. The arbiter opened `D:\Stratex\silerax\src\components\ui\form.tsx`:207-275 itself; the source of the finding is
  `D:\RCCA_TMP\readiness\PRCCA\round-2.md`:11 and `D:\RCCA_TMP\DEFECT_shared_form_error_reference.md` (a finding the operator had
  withheld from the Opus session as a control - neither of its audits found it).
  After the correction the plan folder was stamped again (OPENED `readiness\PRCCAA\stamp.json`, `stampedAt`
  2026-11-23T18:02:53Z; `aria-labelledby` and `form-inline-error` present in PRCCAA-001). The plan landed as `ea8d5509` (PEER).
- A new local rule in Silerax, the operator's own conclusion from the two dismissed findings: "сега е момента да кажем на
  силиракс в крайна сметка какъв продукт развиваме на какъв етап сме и това да бъде подавано кратко в брифовете към одитора за да
  не търси повече отколкото е необходимо", with "не искам да разхлабвам ... пари rls политики ... тенантност". The text - where
  the product is, what is NOT asked at this stage, what stays mandatory - was shown to him here and approved ("на същата сесия,
  одобрявам"), then written by the Silerax session: `dev/PROJECT_OVERRIDES.md` § Product stage, commit `cfc044f8` (PEER). On
  concurrency his line: races in the writes are not loosened; the arbiter's split, which he accepted with the text - a write the
  plan adds or reorders stays correct under two concurrent users; protection against a stale open form is a later roadmap line
  (Silerax D-507, PEER).
- One copy of the section, two pointers: the code auditor's sentence in the project additions of Silerax's `review.md`; for the
  readiness pass the sentence stands in `plan.md`'s project additions and tells the planning COO to put one line into every
  readiness brief (PEER).

## 6. What changed in this repository

- The audit table: every Codex role and class moved to `gpt-6.2-sol` - reviewer, qa, qal, plan, code - through `/pnp:roles`
  (`roles.json` re-rendered, `aiwf.config.json`; project-scope self-check `==== 30/30 assertions passed ====`). The model id was
  found in `~/.codex/models_cache.json` first. The operator's word is in § 1.
- This file, ROADMAP § AUDITRULE line (10), the LEDGER rows of this session.

## 7. For the next step

- THE CONVERSATION ABOUT M1-M4 HAS NOT BEEN HELD. The operator set it for after the Silerax matters ("това ще го коментираме
  след това с теб по отношение на предложенията ти за плагина"). § 3 is the arbiter's starting position, not a decision.
- A new candidate for the same release, from the Silerax rule: a PRODUCT STAGE slot of the payload, beside the `TEST POLICY:`
  line - what the product's stage does not ask for and what stays mandatory, named to the planner and to both audits. The Silerax
  session found that the readiness brief never names `review.md`, so a local sentence in that file reaches the code pass only
  (PEER; not checked against `templates/briefs/readiness-codex.md` by the arbiter). The slot therefore belongs in the readiness
  brief template and the planner brief themselves. When the payload carries it, Silerax's two pointers retire and its section stays.
- How to carry the release, if it is decided: as a plan (`/pnp:plan`), as the first file's § 5 says.

## 8. What is not known

- Everything marked CODEX and PEER above.
- Whether the Opus plan executes cleanly: neither ticket has run.
- Whether the comparison would repeat: one plan per model, different research, a withheld finding found once.
- The share of the planning cost on each side (agents' figures of the Opus session were not read).

## 9. The decision (2026-11-23, the same session, after §§ 1-8 were committed)

The operator accepted the release as five parts, to be planned as ONE release and to ship BEFORE the next Silerax phase is
planned - he has four phases to plan and execute, and a new evaluation follows them. His words: on part 1's cost - "за част 1,
ако се хване при изпълнение съм ок, зс това е и одитора след това"; on the measurement - "искам релийза да въведе механизъм за
измерване и анализ на планирането и неговото изпълнение, без овъринжинеринг и без досадни въпроси към мен от агентите. имам 4
фази да планирам и изпълнявам и след тях да се направи нова оценка"; the acceptance - "приемам записвай всичко". The rule TEXTS
are not written yet: each is shown to him and approved in the session that writes it (`ORCHESTRATOR.md` guard (g)).

1. THE BLOCKER NAMES A LOSS (both audits). A blocker names what is lost if the work runs exactly as written: stored data or
   money wrong, an access or tenancy hole, a migration that fails, something the user sees wrong or cannot do, a decision left to
   the Writer - and a proof that cannot fail for the ticket's own product property. A finding about how the plan or the diff is
   worded, ordered, proven, evidenced or recorded names no loss and is a NOTE the COO fixes with no revision round and no pass;
   a test that merely cannot run is a note. The floor of 0.3.22 stays. Accepted cost: a wrong command in a plan is caught at
   execution, with the code auditor behind it.
2. THE PLAN DOES NOT RESTATE THE PROCEDURE. A ticket names what is its own (its test files, its new cases, whether it needs a
   reset and why, the acceptance commands of its own properties); who runs which check, in what order, against which baseline is
   the project's test policy, cited by one line. It starts at the planner brief, which orders the restatement today
   (`templates/briefs/planner.md`:17-20, :60-66); readiness classes 8 and 11 apply to what the plan itself introduces. Settled
   together with 0.3.11's rule that the auditor verifies the closing greps.
3. PLAN-FORM DUTIES SCALE WITH THE CHANGE. The read / lock / write rows and the closing-grep sets are owed for what the plan
   changes - a write whose order, lock or statement set changes; a write that only carries one more column through existing
   statements owes one sentence.
4. MEASUREMENT OF PLANNING AND OF EXECUTION - two fixed-form rows the COO fills by itself from figures it already holds; no new
   tool, no script, no dashboard, no question to the operator.
   - One row per PLAN, at its landing: the model and effort that planned; the readiness passes and the revisions; pass 1's
     blockers by kind (a loss named / no loss named / rejected); what the auditor and the planning agents spent, as the tools
     print it.
   - One row per TICKET, at its close: the code pass's blockers by kind, the effort split and the defects that reached the
     operator after the close (all three exist since 0.3.22); the correction rounds; and NEW - what in the plan turned out wrong
     at execution, a count and one sentence each (the price of part 1).
   - NOT in it: anything only the operator can read off a screen (a quota share, a context size), hours, a per-agent diary. A
     defect after the close is recorded when the operator reports it; nobody asks him.
   - Both rows start with one fixed prefix, so one grep collects them.
   - THE EVALUATION after the four phases: an arbiter session collects the rows of the four plans and their tickets and answers
     three questions - did the blockers with no loss named fall; did the real findings hold their level; how many plan mistakes
     were caught only at execution and what they cost. The Opus-for-planning question is read from the same rows.
   - The four phases are comparable only if all run on the new version; the phase already landed (PRCCAA, 0.3.24) is the
     "before".
5. PRODUCT STAGE - a slot of the payload beside the `TEST POLICY:` line: what the project's stage does not ask for and what
   stays mandatory, filled once by the project and named to the planner brief and to BOTH audits' briefs (the readiness brief
   does not carry the project's `review.md` - § 7). When it ships, Silerax's two local pointers retire and its section
   `dev/PROJECT_OVERRIDES.md` § Product stage stays; the release's `Retires local rules:` line names them.

Not in the release: the readiness effort and the number of passes (the operator's cost gate); any loosening of money, access,
RLS or tenancy checks; the planner's "enumerated matrix" (ROADMAP § AUDITRULE line (5), step 6 - decided on the rows of part 4).

How it is carried: a plan (`/pnp:plan`) in a working session of this repository, not the arbiter's - it changes the audit's
central sentence and reaches every consumer. The text of part 1 is checked against the recorded cases BOTH ways before it ships:
the 12 "record only" code blockers of the research file and the procedure and form blockers of PRCCA and PRCCAA must come out
as notes; the 15 code defects, PRCCA's B1 / B2 / B5 / B8, PRCCAA's B7 / B12 / B14 and PRCI round 1's B1 / B3 / B4 must stay
blockers. Whether one Codex opinion pass reads the contract text before the release is the operator's cost call, asked in that
session. The session brief for it: `dev/backlogs/inputs/session-brief-AUDITRULE-2026-11-23.md`.
