# RBC-002 rule homes - docs/WORKFLOW.md

One `sonnet` agent, 2026-10-18: OLD = `git show 90a2f81:docs/WORKFLOW.md`, NEW = the compacted
`docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`. First run `rules: 190 homeless: 5`
(memory under the lock not authority; the readiness brief's risk threshold + stop condition;
compaction inside a ticket; the planning's own files stay until their landing; the Codex CLI
requirement); the COO restored all five in WORKFLOW and the agent re-verified them. Table as
returned, those rows updated.

| rule (old text, condensed) | home (file + section) |
|---|---|
| Durable knowledge in Git; live process state in session orchestration, not Markdown state files or an external runtime | WORKFLOW intro |
| Four-role loop runs natively; a project may run lighter than the defaults | WORKFLOW intro |
| COO duties; the only role presenting to the human | WORKFLOW § Roles |
| COO writes no implementation code in R2/R3; doctrine, not a hook (R1 needs main-session writes) | WORKFLOW § Roles |
| Writer the only repo writer, native subagent, `subagent_type: "writer"`, does not approve own work | WORKFLOW § Roles; § Reproducibility |
| Gate 1 blocks non-writer Edit/Write; Claude host boundary has no OS cell | LOOP § Enforcement (Gate 1); § Role boundaries (Reviewer) |
| Gate 2 dialog on every Writer dispatch or only off-plan, per `enforcement.dispatchGate` | LOOP § Enforcement (Gate 2) |
| Gate 2 denies a Claude plan pass whose folder fails the mechanical gate | LOOP § Enforcement (Gate 2) |
| Gate 4 denies ask-class git verbs to non-Writer subagents; asks on unspelled forms | LOOP § Enforcement (Gate 4) |
| Reviewer read-only, adversarial, not browser QA; engine-neutral | WORKFLOW § Roles; LOOP § Role boundaries |
| /pnp:review dispatches the Codex wrapper (read-only sandbox, stdin) or the `reviewer` subagent | LOOP § Role boundaries; REVIEW_CHECKLIST intro |
| Codex host hard OS cell; Claude host tool availability + Gate 1 + convention + git reversibility | LOOP § Role boundaries |
| QA read-only, only for observable runtime/UI behavior, artifact judge | WORKFLOW § Roles; LOOP § Role boundaries |
| Spec-flow; QA never starts a dev server or drives a browser | LOOP § Role boundaries (QA); REVIEW_CHECKLIST § QA |
| A Codex-launched browser cannot run under the read-only sandbox | LOOP § Role boundaries (QA) |
| QAL operator-gated, `roles.qal.enabled`, no OS sandbox, not default | WORKFLOW § Roles; LOOP § Role boundaries (QAL) |
| Operator sole authority for commit, push, merge, branch switches, destructive ops | WORKFLOW § Roles |
| Writer scan questions answered by the COO with cheap scan agents; silent assumption is the defect | WORKFLOW § COO owns broad scans |
| Delegation trigger; delegable list; never delegable | WORKFLOW § COO owns broad scans |
| Discovery precedes dispatch | WORKFLOW § COO owns broad scans |
| Tripwire 1: outside the repo is agent work | WORKFLOW § COO owns broad scans |
| Tripwire 2: two lookups without an answer -> dispatch | WORKFLOW § COO owns broad scans |
| Tripwire 3: mechanical procedures to a `general-purpose` subagent; second inline fix is the trigger | WORKFLOW § COO owns broad scans |
| Scan agent writes no file; procedure agent writes only under scratch at the named path | WORKFLOW § COO owns broad scans |
| Tripwire 4: enumeration closed by a grep that first HITs the known list | WORKFLOW § COO owns broad scans |
| New/changed evidentiary instrument made to fail first; retro-proofing a deliberate ticket | WORKFLOW § COO owns broad scans |
| Permission gate made to fail on a copy, never by weakening the live gate | WORKFLOW § COO owns broad scans |
| Memory seeds are a home of the enumeration; a grep matching nothing proves nothing | WORKFLOW § COO owns broad scans |
| Model policy for ad-hoc subagents | WORKFLOW § COO owns broad scans (Model policy) |
| Role dispatch physical; inline = route violation; doctrine IS the user request | WORKFLOW § COO owns broad scans (Role dispatch) |
| Docs class edited by the COO; code class to the Writer even one line | WORKFLOW § The COO write boundary |
| Code-class notes: micro-round to the live Writer; if dead, spawn and pay | WORKFLOW § The COO write boundary |
| Every direct COO edit announced in the commit summary | WORKFLOW § The COO write boundary |
| COO-authored text in the tree when a pass is dispatched | WORKFLOW § The COO write boundary |
| Reviewer verifies decisions; fact-check gate (Step 2b) before every diff pass above scan tier, per-claim ledger | WORKFLOW § The COO write boundary |
| COO fixes ledger findings, then dispatches the review | WORKFLOW § The COO write boundary |
| A plan gets no fact-check agent; the mechanical gate guards it | WORKFLOW § The COO write boundary |
| Gate guards the expensive pass; only a scan-tier alias skips; an exact id always gets it | WORKFLOW § The COO write boundary |
| Scope, brief content, sequencing are COO calls, reported with a one-line rationale | WORKFLOW § The operator does not arbitrate |
| Gate: commit click / push word | WORKFLOW § The operator does not arbitrate |
| Gate: passes beyond the first each on their own word; only the first rides the standing word | WORKFLOW § The operator does not arbitrate |
| Gate: destructive/system-changing ops; product/UX choices | WORKFLOW § The operator does not arbitrate |
| A question outside the gates is a workflow defect | WORKFLOW § The operator does not arbitrate |
| A blocker demanding more than the product needs is a product choice, raised early | WORKFLOW § The operator does not arbitrate |
| Speak plainly | WORKFLOW § How the COO speaks (1) |
| Invent no debts and no follow-up tickets | WORKFLOW § How the COO speaks (2) |
| Do not reverse under tone | WORKFLOW § How the COO speaks (3) |
| Report a verdict in substance; name passes by role, number, engine | WORKFLOW § How the COO speaks (4) |
| Guard (a) | WORKFLOW § Operator-interaction guards (a) |
| Guard (b): ticket stops; start is the operator's; data is not permission; loop runs to the end of the word | WORKFLOW guard (b) |
| Guard (b): a ticket born after a standing word is written, announced in one sentence, STOPS | WORKFLOW guard (b) |
| Guard (b): one question (audit pass?), never automatic | WORKFLOW guard (b) |
| Guard (b): zero mutations until answered; no same-turn dispatch; content COO's, start never | WORKFLOW guard (b) |
| Guard (c) | WORKFLOW guard (c) |
| Guard (d) | WORKFLOW guard (d) |
| Guard (e) | WORKFLOW guard (e) |
| Guard (f) | WORKFLOW guard (f) |
| Guard (g): rule-bearing write shown and approved; statuses exempt | WORKFLOW guard (g) |
| Guard (g): a remark is a rule only when declared; whose generalisation; no exemption for "the operator said it" | WORKFLOW guard (g) |
| Guard (g): ask once in place; only "from now on" goes through the gate | WORKFLOW guard (g) |
| Guard (h): pointer row on the transfer surface, one approval | WORKFLOW guard (h) |
| Guard (h): queued with frozen text when the window is closed | WORKFLOW guard (h) |
| Verify the failure claim and read the repo's docs before proposing a cause | WORKFLOW § Verifying failure claims |
| Relayed claims checked or marked unverified | WORKFLOW § Verifying failure claims |
| VERIFY honesty | WORKFLOW § Verifying failure claims |
| Shape configurable, gates not | WORKFLOW § Loop shape and its overrides |
| Configurable defaults (one reviewer, cap, R1 no loop, QA conditional) | WORKFLOW § Loop shape and its overrides |
| Audit table rows, inheritance, factory values | WORKFLOW § Loop shape and its overrides |
| Table has no fact-check gate or plan gate; neither configurable | WORKFLOW § Loop shape and its overrides |
| Plan-class pass needs a current stamp | WORKFLOW § Loop shape and its overrides |
| Only the operator lifts the cap; rounds count from an auditor's verdict | WORKFLOW § Loop shape and its overrides |
| Plan readiness on `review.plan.passes`, independent of the cap | WORKFLOW § Loop shape and its overrides |
| Risk threshold and stop condition mandatory | WORKFLOW § Loop shape; § Ticket brief contract; REVIEW_CHECKLIST |
| Code-touching correction round warrants a verification pass, on the operator's word | WORKFLOW § Loop shape and its overrides |
| Prose-only round warrants none; fact-check + first-hand check recorded | WORKFLOW § Loop shape and its overrides |
| Suppression dual: <= ~10 lines, audited files, red test -> no pass unless a check-1 surface | WORKFLOW § Loop shape and its overrides |
| A QA `fail` closed only by a QA run | WORKFLOW § Loop shape and its overrides |
| Planning lock binds every role; Plan Mode alone not the authority | WORKFLOW § Planning lock |
| What the COO may do under the lock | WORKFLOW § Planning lock |
| Memory updated under the lock is not project workflow authority | WORKFLOW § Planning lock (restored, re-verified) |
| No implementation dispatch or tracked-PLAN commit before approval | WORKFLOW § Planning lock |
| Draft and readiness files untracked under the lock; extension as an uncommitted edit | WORKFLOW § Planning lock |
| The readiness brief carries its own risk threshold + stop condition | WORKFLOW § Planning lock (restored, re-verified) |
| No delegation except the planner | WORKFLOW § Planning lock |
| No repo/config/state edit except the planning's own files and the roadmap entry | WORKFLOW § Planning lock |
| No Git mutation under the lock | WORKFLOW § Planning lock |
| Sole exception: the read-only readiness review | WORKFLOW § Planning lock |
| Selecting an option is not approval; other gates separate | WORKFLOW § Planning lock |
| Which plans get readiness review; no self-approval | WORKFLOW § Plan readiness review |
| COO owns routine choices; asks only on material alternatives | WORKFLOW § Plan readiness review |
| The cycle | WORKFLOW § Plan readiness review |
| The mechanical gate; wrapper exit 2; Gate 2 deny | WORKFLOW § Plan readiness review; LOOP § Enforcement |
| Honest limit of the gate | WORKFLOW § Plan readiness review |
| The pass: row, brief contents, whole folder, every gap at once | WORKFLOW § Plan readiness review |
| Output contract and blocker definition | REVIEW_CHECKLIST § Plan readiness; LOOP § Role boundaries |
| Triage and round files; disputes to the operator; planner writes the fix | WORKFLOW § Plan readiness review |
| Revision adds nothing new; no reduction stops the cycle | WORKFLOW § Plan readiness review |
| Pass economy | WORKFLOW § Plan readiness review |
| Session rule | WORKFLOW § Plan readiness review |
| No audit backlog, DoR/DoD; stamp + rounds are the history | WORKFLOW § Plan readiness review |
| The six readiness checks | WORKFLOW § Plan readiness review |
| Approved plan is the durable Git authority | WORKFLOW § Plan readiness review |
| Brief fields and tag | WORKFLOW § Ticket brief contract |
| `Ticket: <REF>` line; Gate 2 modes and lookup | WORKFLOW § Ticket brief contract; LOOP § Enforcement |
| Route state written at dispatch, cleared with `{}`; convention, not enforcement | WORKFLOW § Ticket brief contract |
| Gate 3 allowed paths; Writer never gated | LOOP § Enforcement (Gate 3) |
| Gate 3 states, plansDir, Edit/Write only, fixed paths | LOOP § Enforcement (Gate 3) |
| `routeWriteGuard` toggle | LOOP § Enforcement (Gate 3) |
| Brief failure: end state, not the edit | WORKFLOW § Ticket brief contract |
| Brief failure: verify an inherited fact | WORKFLOW § Ticket brief contract |
| Brief failure: walk a human-executed path | WORKFLOW § Ticket brief contract |
| Brief failure: `file:line` where the Writer acts | WORKFLOW § Ticket brief contract |
| Brief failure: guard anchored to HEAD at dispatch | WORKFLOW § Ticket brief contract |
| Brief failure: scope the adjacent contract | WORKFLOW § Ticket brief contract |
| Full precision in the first draft | WORKFLOW § Ticket brief contract |
| Plain engineering English between agents | WORKFLOW § Ticket brief contract |
| Proof-surface feasibility: E2E evidence | WORKFLOW § Proof-surface feasibility |
| Unit proof, discovery match, access path | WORKFLOW § Proof-surface feasibility |
| A verify command must be able to fail | WORKFLOW § Proof-surface feasibility |
| Out-of-scope failures recorded as risks | WORKFLOW § Out-of-scope failures found during work |
| When a durable record is required | WORKFLOW § Durable development history |
| One living Mission PLAN | WORKFLOW § Durable development history |
| PLAN items 1-3 incl. the scheduled paid review | WORKFLOW § Durable development history (1-3) |
| Completion record, skeleton, Measurements row | WORKFLOW § Durable development history (4) |
| Evidence out of scratch; deletions listed; next-session recommendation | WORKFLOW § Durable development history (4) |
| Compaction tolerable inside a ticket; planning and readiness not a boundary | WORKFLOW § Durable development history (4) (restored, re-verified) |
| Record in its own docs commit | WORKFLOW § Durable development history (4); § Commit & Push Authority |
| A system-state number is measured or not stated | WORKFLOW § Durable development history (4) |
| Closeout in two halves | WORKFLOW § Durable development history (5) |
| Archive immediately at 100% | WORKFLOW § Durable development history |
| Archive name; folder move; readiness not moved | WORKFLOW § Durable development history |
| Archiving grep with a positive control | WORKFLOW § Durable development history |
| Archive trigger; reversible bookkeeping | WORKFLOW § Durable development history |
| No raw conversation in the PLAN | WORKFLOW § Durable development history |
| `paths.plansDir` layout | WORKFLOW § Durable development history |
| Scratch holds live loop mechanics only | WORKFLOW § Durable development history |
| Approved PLAN written to Git at the landing | WORKFLOW § Durable development history |
| ABBR grammar; ticket refs; tooling reads it | WORKFLOW § Durable development history |
| An ABBR never reused | WORKFLOW § Durable development history |
| Ticket born in flight takes the same ABBR | WORKFLOW § Durable development history |
| A candidate has no ref | WORKFLOW § Durable development history |
| Abbreviation choice; not retroactive | WORKFLOW § Durable development history |
| Ledger is the PLAN; briefs carry the ref; `Refs:` | WORKFLOW § Durable development history |
| No Markdown updates for live events | WORKFLOW § Durable development history |
| Transfer surface and its skeleton | WORKFLOW § The transfer surface |
| R1 direct | WORKFLOW § Routes; LOOP table |
| Executable artifact ends R1 | WORKFLOW § Routes; LOOP table |
| R2 chains; cap; commit after approval | WORKFLOW § Routes; LOOP table |
| Review class selects the audit row | WORKFLOW § Routes; LOOP § Routing mapped to native |
| Claude-hosted row dispatches the rendered reviewer | WORKFLOW § Routes |
| Class is the COO's call | WORKFLOW § Routes |
| R3 chain | WORKFLOW § Routes |
| "COO routing" term | WORKFLOW § COO routing |
| Four routing checks | WORKFLOW § COO routing |
| ANY yes -> top; record line | WORKFLOW § COO routing |
| Routing moves the COO only | WORKFLOW § COO routing |
| Dynamic clause | WORKFLOW § COO routing |
| Hardening principle | WORKFLOW § COO routing |
| Dual: routing upward to be safe | WORKFLOW § COO routing |
| Default branch and working branches | WORKFLOW § Branch policy |
| Work on the checked-out branch; never hide dirty state | WORKFLOW § Branch policy |
| Planning's own files are not foreign work, stay until their landing | WORKFLOW § Branch policy (restored, re-verified) |
| Merge and push only on the word | WORKFLOW § Branch policy |
| No mutation of another repository without the word | WORKFLOW § Branch policy; LOOP § Enforcement |
| Settle which tree before writing | WORKFLOW § Branch policy |
| One executing session per tree | WORKFLOW § Branch policy |
| All visible problems in one round | WORKFLOW § Fail aggregation; REVIEW_CHECKLIST § Fail aggregation (both roles) |
| Handing the list; declaration for new findings | WORKFLOW § Fail aggregation; REVIEW_CHECKLIST § Fail aggregation (both roles) |
| Escalation triggers | WORKFLOW § Escalation and the arbiter |
| Fired trigger makes escalation mandatory | WORKFLOW § Escalation and the arbiter |
| Where it goes | WORKFLOW § Escalation and the arbiter |
| The arbiter reads, does not write | WORKFLOW § Escalation and the arbiter |
| The ruling ledger | WORKFLOW § Escalation and the arbiter |
| Suppression dual: no trigger, no escalation | WORKFLOW § Escalation and the arbiter |
| Test policy home | WORKFLOW § Tests |
| Status/release docs policy | WORKFLOW § Status / release docs policy |
| Commit authority and dialog | WORKFLOW § Commit & Push Authority |
| Click approves the invocation; `[NOTE]`, never a failure | WORKFLOW § Commit & Push Authority |
| Push/merge/rebase word + dialog; not `deny` | WORKFLOW § Commit & Push Authority |
| Destructive commands confirmed immediately before | WORKFLOW § Commit & Push Authority |
| Prefix matching, accident-grade | WORKFLOW § Commit & Push Authority; LOOP § Honest security model |
| Gate 4 behaviours | LOOP § Enforcement (Gate 4) |
| Both shell tools | LOOP § Enforcement (Both shell tools) |
| Residual class | LOOP § Honest security model |
| Writer rendered from its template | WORKFLOW § Reproducibility |
| Reviewer/QA resolution, fallback record, `-Class` | WORKFLOW § Reproducibility |
| The Codex path needs the Codex CLI | WORKFLOW § Reproducibility (restored, re-verified) |
| Claude subagents Read/Grep/Glob; QAL codex-only | LOOP § Role boundaries; § Enforcement |
| Enforcement wiring and ruleset cross-check | WORKFLOW § Reproducibility; LOOP § Enforcement |
| One-page mapping; selfcheck; no runtime state in Git | WORKFLOW § Reproducibility |

Stories dropped (as returned): the Writer run that spent a session on discovery; why the tripwires
exist; the harness nudge; where blockers cluster; the fact-check cost rationale; why vocabulary and
follow-ups confuse; the guards' origins incl. the revoked reading of (b); (f) observed three times;
(g)'s private-doctrine rationale; (e)'s history; the live-worker failure; the verification-pass
cost rationale; why Plan Mode is local; the runbook / loose-sentence / empty-grep incidents; the
docs ticket that gained a launcher; the closeout split mid-flight; (h)'s rationale; the amended
version file; why off-plan is worth one click; why no hook sees siblings; why the ledger enables a
cold arbiter; "a mission that escalates on most tickets"; "both had to be asked for".

rules: 190 homeless: 0
