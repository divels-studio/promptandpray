# PLAN_RGATE - behavior ledger (Step 2a), RGATE-001

Agent: Explore/sonnet, 2026-10-02, over draft r0. Rows abridged by the COO (DOES / NOTE kept, the
other cells summarised); every NOTE was acted on in revisions.md r1-r14 or judged no defect.

| # | behavior | link (file:line) | DOES | CLOSES OVER | STATES | LIB | NOTE |
|---|---|---|---|---|---|---|---|
| 1 | readiness brief composed | skills/review/SKILL.md:321-351 | prose; no Class/PLAN/TICKETS/SCAN/OWN lines today | - | one invocation = one pass | none | artifact location unnamed -> Steps 2c/2d name scratchDir |
| 2 | codex branch writes the brief, runs the wrapper | SKILL.md:380-425 | fixed file, fixed command text | constant path | resume reuses the file with a continuation (:490-495) | none | continuation lacks the lines -> r13 (scan 4) |
| 3 | brief file write | mutation-guard.js:85-211 | main session may write .aiwf/** while R2 open | env, config | - | none | brief under scratchDir passes |
| 4 | PS param binding | codex-review.ps1:55-63 | `-Prompt` pipeline-bound | - | without -Raw only the last piped line | none | skill uses -Raw; existing contract |
| 5 | PS $HasClass + resolver | codex-review.ps1:80-97; aiwf-roles.ps1:106-131,193 | class validated, codex engine required | - | claude row exits 2 before any gate | none | gate must follow the engine check |
| 6 | PS resume + Set-Location | codex-review.ps1:129-198 | bare resume refuses without state | $SessionState absolute | resume refusals precede the gate | none | W3 needs an explicit id -> r10; root before Set-Location -> r9 |
| 7 | PS empty-brief check | codex-review.ps1:200-203 | exit 2 on blank | - | - | none | gate after it |
| 8 | PS gate invocation | NEW | pipe brief to node, exit back | - | refusal before capture | pwsh 7 UTF-8 stdin (5.1 ASCII) - same transport as codex | node not starting must refuse -> r9 |
| 9 | PS codex invocation | codex-review.ps1:312-332 | pinned line | - | - | none | untouched |
| 10 | PS header | codex-review.ps1:26-30 | help text | - | - | none | provenance allowlist pins C:\repo here |
| 11 | sh arg loop | codex-review.sh:39-82 | fail() exits 2 | globals | - | none | `\|\| fail` adds one line after the gate's own |
| 12 | sh resolver + engine | codex-review.sh:99-136 | codex required | HERE | - | none | HERE gives the engine path |
| 13 | sh PROJECT_ROOT_ABS + resume | codex-review.sh:157-177,210-213 | abs root before cd | - | resume refusals precede the gate | none | W3 explicit id -> r10 |
| 14 | sh PROMPT read | codex-review.sh:215-222 | cat; blank -> exit 2 | - | - | none | gate after :222 |
| 15 | sh gate invocation | NEW | pipe to node | - | refusal before capture | none | regex pins key on the codex line only |
| 16 | sh codex invocation | codex-review.sh:335-338 | pinned | - | - | none | untouched |
| 17 | plan-gate CLI | NEW scripts/engine/plan-gate.js | exit 0 ok / 2 refused | - | any non-zero = refusal in wrappers | node core | stdin method -> r7; control copies lack engine/ -> r10 |
| 18 | brief-line parsing | NEW | per-NAME regex | - | CRLF tolerated | ECMAScript m-flag | quoted example would duplicate -> r2 (column 0) |
| 19 | TICKETS check | NEW; dispatch-gate.js:109-117 | grammar + whole-identifier | - | - | none | refRegex private; grammar narrower than TICKET_LINE -> r3 |
| 20 | table parser | NEW | header/separator/rows | - | CRLF row end | none | `\|` unescape unstated -> r5 |
| 21 | scan checks | NEW | closure, coverage | - | several tables count | none | `#` cell may repeat -> r6 |
| 22 | own-pass checks | NEW | hash, blockers, tables | - | - | none | lowercase compare -> r4 |
| 23 | planHash / --hash | NEW | sha256 | - | CRLF changes a byte hash | node core crypto | engine hashes LF-normalised (generate.mjs:138-142) -> r4 |
| 24 | hooks.json Agent matcher | hooks/hooks.json:14-22 | runs Gate 2 | - | - | harness: outside repo | description says Writer-only -> r13 |
| 25 | Gate 2 entry | dispatch-gate.js:246-267; aiwf-lib.js:64-78 | runFailAsk | - | throw -> ask | none | top-level require escapes runFailAsk -> r8 (lazy require) |
| 26 | Gate 2 subagent branch | dispatch-gate.js:269-274,70-73 | non-writer passthrough | CLAUDE_PROJECT_DIR | - | none | indented match, root fallback -> r1, r8 |
| 27 | Gate 2 deny emitter | NEW; aiwf-lib.js:81-95 | denyPreTool envelope | - | - | harness deny on Agent: outside repo | no precedent; docs/lib say Gate 2 never denies -> r11, r13 |
| 28 | self-check runHook | aiwf-selfcheck.js:187-205 | spawn, classify | env | crash != allow | node core | G cases map onto decision |
| 29 | sectionGate2 | aiwf-selfcheck.js:729-777 | one root, no artifacts | root | - | none | G2 needs its own fixture; check() has no id -> r10 |
| 30 | sectionGate2Mode | aiwf-selfcheck.js:792-969 | mkProject fixtures | - | - | none | fixtures need artifacts + hash -> r10 |
| 31 | PS stub runner | aiwf-selfcheck.js:2712-2793 | codex fixture, `-Class code` fixed | - | stub records no argv | none | W probes and class param -> r10 |
| 32 | PS control copies | aiwf-selfcheck.js:2503-2520,2796-2830 | copy ps dir only | - | - | none | copy must keep engine path -> r10 |
| 33 | sh stub runner | aiwf-selfcheck.js:3345-3445 | records argv; atoms null if not run | - | - | none | W probes fit; seedState for resume |
| 34 | sh controls | aiwf-selfcheck.js:3447-3690 | copy sh dir; SH_EXEC_IDS | - | - | none | engine path + exec ids -> r10 |
| 35 | hook wiring | aiwf-selfcheck.js:2198-2250 | three hooks pinned | - | - | none | unchanged |
| 36 | spike Gate 2 cases | run-spikes.mjs:217-228,548-556 | fixed project | - | - | none | per-case project -> r12 |
| 37 | spike runHook | run-spikes.mjs:66-95 | classify | - | - | node core | - |
| 38 | manifest | migrations/index.json | append 0019 -> 0.2.15 | - | - | none | version pair must move together |
| 39 | validate-payload | validate-payload.mjs:180-416,478 | ops shape | - | - | none | output string matches acceptance |
| 40 | rerender | migrate.mjs:619-724 | take-new when unedited | - | edited -> dialog | none | self-update keys exist |
| 41 | render | generate.mjs:264-276,393-394 | strip contract, render | - | - | none | block T: no `{{`, a dual -> present |
| 42 | test-setup render | test-setup.mjs:224-243 | rendered === template | - | - | none | passes by construction |
| 43 | release files | NEW 0019, CHANGELOG, CHANGES | modelled on 0018 | - | - | none | CHANGES generated by the self-update |
| 44 | provenance | aiwf-selfcheck.js:6040-6226 | Cyrillic, email, drive paths | - | - | node core | fixtures must avoid them -> r10 |

ROWS: 44
