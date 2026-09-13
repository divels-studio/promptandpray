# Changelog

All notable changes to PromptAndPray (`pnp`) are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow strict
`MAJOR.MINOR.PATCH` as enforced by `scripts/update/validate-payload.mjs`.

## [0.2.4] - 2026-09-13

Setup stops adopting a plans directory in silence. An install pointed at a project whose
`<plansDir>/active/` already holds `PLAN_*.md` files was handing Gate 2's `off-plan` mode a set of
plans nobody in this loop had approved, and saying nothing about it. `0008_consumer-correctness` is a
note-only migration: nothing already installed changes.

### Added

- **Setup warns about a pre-existing plans directory (HARD-003)** - the `paths.plansDir` question now
  checks the candidate path before it is answered (the offered default first, then whatever is typed)
  and prints `N existing PLAN_*.md in <path>/active - Gate 2 off-plan will read them as active pnp
  plans; pick another paths.plansDir if they are not.` The count is exactly the set Gate 2 reads - a
  real file matching `PLAN_*.md` - so a directory with that name, or a `notes.md` beside the plans,
  is not counted. It matters because in `off-plan` mode Gate 2 stays SILENT on a Writer dispatch
  whose `Ticket: <REF>` appears in one of those files: pointed at somebody else's plans, the dispatch
  gate goes quiet on refs this loop never approved. The generator repeats the line as a `note` in its
  plan and report, so `--dry-run` and the non-interactive `--answers-file` install - which never sees
  a question - show it too. It is a WARNING, never a blocker: an operator may want that directory on
  purpose, and no install is refused over it. The schema defaults are untouched.
- **Setup says when the overrides document is already there (HARD-003)** - the same treatment on
  `paths.overridesDoc`, for the opposite reason: setup seeds that file once and never rewrites it, so
  pointing it at an existing file means this install writes no template there at all. Correct
  behaviour that produced no output, and was therefore indistinguishable from having been written.

## [0.2.3] - 2026-09-13

The gate that was addressed to one shell tool now covers both. A permission rule names a TOOL, and a
Windows session carries a `PowerShell` tool next to `Bash` - so until now the whole ask list and
Gate 4 alike stopped at `Bash`, and the same commit, push, reset or recursive delete run through the
other tool raised no dialog at all. `0007_powershell-ask-ruleset` adds the 54 mirror rules to your
`.claude/settings.json`; rules you wrote or removed yourself are untouched.

### Added

- **The update names the payload rules it did not add and does not own (HARD-002)** - a payload ask
  rule your project already carries in the payload's own spelling is left alone forever: not added
  (it is there), not removed (it is not owned), not tombstoned (nobody removed it). That correct
  behaviour used to be invisible, because it produces no diff, and an operator reasonably read the
  silence as coverage. `planAskRules` now measures the set - `(desired n actual) - owned` - the
  reconcile summary reports it as `N payload rule(s) present but not owned here - hand-edited, the
  engine will never touch them`, and the `CHANGES_<from>-to-<to>.md` report lists those rules by name
  under the `reconcile-ask-ruleset` entry. Zero such rules, and the line is absent rather than zero.
  Nothing about what the reconcile adds, removes or tombstones changed: the add half never consulted
  ownership, and a project that owns nothing still receives every payload rule it is missing - now
  proven by the acceptance suite on the real entrypoint rather than described.
- **A `PowerShell(<X>)` mirror for every ask rule (HARD-001)** - `templates/settings.ask-ruleset.json`
  carries 54 pairs instead of 54 rules: the git verbs (including the three `git.exe` forms and the
  three rendered `git -C <projectRoot>` forms), the package-manager, migration-tool and container
  rules, and the four delete commands, each in a `Bash(<X>)` and a `PowerShell(<X>)` spelling, plus
  `PowerShell(*)` next to `Bash(*)` in the factory allow posture. The mirror is an invariant, not a
  convention: the self-check asserts it in BOTH directions - a `Bash` rule with no PowerShell twin
  leaves that tool unguarded, and an orphan `PowerShell` rule with no `Bash` base reads as coverage
  while gating one tool only - each direction with its own flipping control on a sabotaged copy. On a
  session with no PowerShell tool the new rules are inert, by the same prefix-matching argument that
  already lets one OS-neutral ruleset carry `Remove-Item` and `rm` side by side.
- **Gate 4 runs on both shell tools (HARD-001)** - the hook is wired on matcher `Bash|PowerShell` (a
  matcher of letters, digits, `_`, `-`, space, `,` and `|` is an exact alternation list, not a regex)
  and reads `tool_name` from the payload to judge each command in that tool's dialect. The deny
  branch is identical on both and still runs before the form is looked at: a non-writer subagent
  cannot reach a gated git verb by CHOOSING the other shell any more.
- **The PowerShell dialect is modelled as LESS, never as the same (HARD-001)** - three documented
  differences, each resolved towards asking. Its AST split is `;`, `|` and PS7's `&&` / `||`, so `&`
  stays the call operator it is and `& git push` matches no rule form; no wrapper or `NAME=value`
  stripping is documented for it, so `timeout 30 git commit` asks there while staying silent on Bash;
  and its matching is case-insensitive, so recognition folds case (`GIT Push` is recognised, and a
  background subagent is denied for it) while the byte-exact rule test folds case on neither tool - a
  passthrough may not rest on a rewrite this repository cannot observe. An unknown `tool_name`
  resolves to the PowerShell dialect, the stricter of the two on every axis.

### Changed

- **Every deny and ask names the REAL tool (HARD-001)** - the diagnostics said "Blocked Bash command"
  for every payload, which on a PowerShell command sent the reader to the wrong half of the ruleset;
  they now carry the tool from the payload, and a payload too malformed to name one says "shell"
  rather than inventing a name. Asserted on both tools with the other as the flipping control, in the
  spike matrix and in the self-check.
- **The honest limit is now a class, not a named hole (HARD-001)** - `README.md`,
  `docs/LOOP.md`, `docs/WORKFLOW.md`, `docs/OPERATOR_PROTOCOL.md`, `skills/loop/SKILL.md` and the two
  engine headers said "this gate sees one shell tool" and "every rule is a `Bash(...)` rule". Both
  layers now cover both shells, `Monitor` is documented as running under the Bash rules, and what
  remains is stated as the class it is: a tool NEITHER layer names, closable in two lines for any
  tool that exists, unclosable in advance for one nobody has named.
- **Branch policy states the cross-repository rule (HARD-001)** - a session does not run a mutating
  git or filesystem operation against a repository outside its own project root without the
  operator's explicit word for that exact operation. The `-C` forms ask by construction on both
  tools; the dialog is the backstop, the word is the rule.
- **The example fixture's negative control is relative (HARD-001)** - the self-check's
  `example-bump-id` sabotage hardcoded `0009_example-bump` against a fixture at `0007`. The fixture
  ascends by 1 with every shipped migration, so that constant would have become a VALID id two
  releases on and the control would have gone green while proving nothing. It now renumbers one past
  whatever the fixture currently is.

### Security

- The commit / push / merge / rebase / destructive boundary no longer depends on which shell tool an
  agent reaches for. Both the declarative `ask` rules and the hook behind them cover `Bash` and
  `PowerShell`; a background subagent is denied an ask-class git verb on either. This was the widest
  gap in that boundary, because unlike every other residual it needed no unusual command form - only
  the other tool.

## [0.2.2] - 2026-09-09

A third enforcement hook, for the two things a permission rule cannot do on its own: a background
agent's dialog reaches nobody, and a rule only covers the form it spells out - `git.exe reset
--hard`, `git -C <path> reset --hard` and `sudo git reset --hard` matched none of them. Nothing in
your project changes - `0006_git-verb-gate` carries a single note.

### Added

- **Gate 4, the git-verb guard (GATE-001)** - `scripts/engine/pretooluse-git-verb-guard.js`, wired
  on matcher `Bash`. It recognises `git` / `git.exe` (with an optional global `-C <path>` or
  `-c <k=v>`) followed by an ask-class verb anywhere in the command and then decides by identity:
  a subagent that is not the Writer is **denied**, naming the verb; the main session and the Writer
  pass through **silently** only where a rule the payload really ships matches the subcommand byte
  for byte (`git <verb> ...`, and `git.exe push|merge|rebase ...`), and are **asked** on everything
  else it recognised: `git.exe` outside those three verbs, **any** `git -C <path> <verb>` (the rule
  names `<projectRoot>`, and a hook that reads no project directory cannot confirm a path), a
  wrapper Claude Code does not strip (`sudo`, `npx`, `docker exec`, a flagged `xargs`, a
  `command -v` query), a nested shell (`bash -c "... git reset --hard"`), and irregular whitespace on
  either side of the verb - a tab or a second space where a rule spells out exactly one. Those forms
  matched no rule and raised nothing at all before. The default is
  inverted on purpose - confirm a real rule match or ask - because a guess about which forms "look
  gated" turns every looseness into a silent bypass, while asking is free: a hook decision does not
  bypass the permission rules, and a hook `ask` beside a matching `ask` rule is one dialog, not two.
  It fails closed like Gate 1, with the wider blast radius of matcher `Bash` named in its own
  header: it reads its stdin payload and nothing else - no config, no files, no project directory.
- **What the harness already does is left alone (GATE-001)** - Claude Code's permission documentation
  describes an operator-aware matcher: rules are tested against each subcommand of a chained command
  (`&&`, `||`, `;`, `|`, `|&`, `&`, newlines), the `timeout` / `time` / `nice` / `nohup` / `stdbuf` /
  `command` / `builtin` / `noglob` / flagless-`xargs` wrappers are stripped first, and matching
  continues past leading `NAME=value` assignments. So
  `cd <path> && git commit -m x`, `timeout 30 git commit -m x` and `FOO=bar git push` were never
  holes; Gate 4 stays silent on them and this release's doctrine says so instead of claiming
  otherwise.
- **The verb list is cross-checked, not proof-read (GATE-001)** - the hook carries one constant and
  the self-check parses `templates/settings.ask-ruleset.json` and requires every git verb those
  rules gate to be one the hook knows, with a control that adds a verb to a copy of the ruleset and
  requires the assertion to fail. A rule added to the ruleset can no longer outrun the gate in
  silence. Every shipped git rule is also parsed into its literal invocation FORM and held against
  the hook's own accept-space in both directions - each modelled form must be accepted, each accepted
  form must be carried by a rule, the `-C` forms must be refused - so deleting `Bash(git.exe push:*)`
  from the ruleset while the hook still accepts that form is now a failure rather than a green suite.
  The three gate branches are asserted as pairs - the same command from two identities, the
  same identity on two verbs, and every bypass shape (`.exe`, `-C`, `sudo`, `npx`, a flagged
  `xargs`, `command -v`, a nested `bash -c`, a tab or a second space on either side of the verb, a
  leading space, a newline split, a `$(...)` or `` `...` `` substitution, a verb glued to a `;`, a
  `)` or a backtick) against the
  nearest form a rule really matches - in the spike matrix and in the self-check, both of which run
  the shipped hook as the harness runs it. The verb token's reduction is a whitelist of the
  characters a verb is made of, and the self-check pins all 26 enumerated shell metacharacters as
  terminators, because a blacklist of them had already been wrong twice.

### Changed

- **The payload stops contradicting itself about second-layer shell hooks (GATE-001)** -
  `docs/LOOP.md` claimed one was deliberately not attempted while `scripts/engine/aiwf-lib.js`
  recorded that one had been tried and removed. Both now say the same thing: emulating shell
  escape/continuation semantics for every command remains out of scope, the removal record stands,
  and Gate 4 is the narrower thing that recognises verbs and decides on identity. The hook count
  moves from two to three across the README, the doctrine, the skills and the self-check's own
  wiring assertions, and the counted facts got a control that sabotages a copy of `hooks.json`.
- **The doctrine describes the harness's real matching (GATE-001)** - `docs/LOOP.md`,
  `docs/WORKFLOW.md` and `docs/OPERATOR_PROTOCOL.md` now state that permission rules are matched per
  subcommand, past the stripped wrapper set and past `NAME=value` prefixes, and that a hook decision
  never bypasses a rule. "Prefix matching" alone had been describing something weaker than what the
  harness actually does.
- **macOS is officially unsupported, and the payload says so (POSIX-005)** - supported channels are
  windows and linux. Nothing is removed and no configuration changes: macOS keeps its place in the
  `os` enum, keeps installing on the bash channel it shares with linux, and keeps its full CI leg
  running every gate. What changes is the promise, which had been wider than the evidence - the
  README's status section names the support tier, and the macos CI leg is now advisory
  (non-blocking) over the known defect below instead of blocking a merge on a platform nobody
  operates this loop on. The README's claim that no CI leg is advisory went with it.

### Fixed

- **The setup suite's section 23 control on macOS (POSIX-003)** - the entrypoint-identity section
  built its "direct" fixture inside the suite's own temp directory, which on macOS already sits
  behind a `/var` symlink, so the control that must prove "the link really defeats the naive guard
  here" was comparing a link against a link and failed on the premise it could not hold. Every
  fixture in that section now hangs off the resolved temp path, leaving the explicit junction as the
  only link in the picture.
- **The self-check reports even when it crashes (POSIX-004)** - a section that THREW escaped
  `main()` uncaught, so the tally, the `FAILURES:` block and the exit code never ran and the only
  thing the operator saw was output that stopped mid-run. An uncaught throw is now caught, printed
  on the same stream as the rest of the report - an `Error` with its full stack, any other thrown
  value rendered field by field rather than flattened or lost - counted as one `(uncaught)`
  failure - so the run exits 1 and keeps every assertion that ran before the crash - and announced
  as an INCOMPLETE RUN above the coverage text, which describes a complete one. The update
  acceptance suite stopped truncating the evidence in the same breath: a failing spawn's detail was
  its last three lines cut at 260 characters, and is now its complete output, printed only for the
  checks that fail.

### Known limits (stated, not hidden)

- **The git boundary covers ONE shell tool.** Every rule in `templates/settings.ask-ruleset.json` is
  a `Bash(...)` rule and Gate 4 is wired on the `Bash` matcher, so a harness that exposes a second
  shell tool - a Windows session carries a `PowerShell` tool next to `Bash` - runs commit, push,
  merge, rebase and reset through a tool neither layer sees, with no dialog at all - both halves of
  that are readable here, in the ruleset and in `hooks/hooks.json`. This is weaker than the
  recognition residuals below,
  because it costs no cleverness with the command - a subagent whose tool allowlist includes the
  other shell only has to choose it, so Gate 4's deny is bypassable by tool choice. What Gate 4 does
  on the `Bash` tool, it does as described above.
- **The passthrough branch rests on host behaviour this repository cannot test.** The operator-aware
  matching above is Claude Code's documented behaviour, not something any suite here pins - every
  assertion runs the hook against an assumed harness. If the host stopped matching per subcommand,
  the forms Gate 4 passes through (`cd <path> && git commit -m x` first) would silently stop being
  gated by anything and no test here would go red. The deny, the byte-exact rule test and the ask are
  the plugin's own behaviour and are covered.
- Gate 4 recognises, it does not parse a shell: an alias, a verb assembled from a variable
  (`git $VERB`) and an **escaped** verb (`git \push`) are not seen. A **quoted** verb is -
  `git 'push'` and `git "reset"` are recognised, because a verb token's surrounding quotes come off
  before the lookup - and so is a gated verb inside a quoted string, which costs a click. The
  decomposition does not mirror the harness's reach into subshells and command substitutions, so
  `` `git push` `` and `$(git reset --hard)` resolve to an ask rather than a pass.
- **The self-check's output truncates on macOS, and the cause is not pinned (POSIX-005).** On the
  macos runner the captured self-check output stops mid-line shortly after the role-resolver
  section, and the run ends with no tally and no `FAILURES:` block. It is not a JS throw: the catch
  added above prints nothing at all - no stack, no `(uncaught)` failure - so nothing threw. The
  capture in `scripts/selfcheck/run-selfcheck.mjs:49` is a `spawnSync` with no `maxBuffer`, and the
  self-check's `main()` ends by setting `process.exitCode` rather than exiting, which is consistent
  with buffered stdout being dropped when a process ends while its stdout pipe is asynchronous - as
  a pipe is on POSIX and is not on windows. That is a hypothesis with evidence behind it, not a
  diagnosis: the exact site is unpinned, pinning it needs a macOS host, and there is none. Tracked,
  not fixed; the macos CI leg is advisory for exactly this reason.

## [0.2.1] - 2026-09-03

A code-only release with an uncomfortable cause: the CI matrix had a Linux and a macOS leg since it
was written, both were red from their first run, and they were read for the first time after 0.2.0
was pushed. Nothing here changes your project - no config key, no managed region, no agent file -
and `0005_posix-legs` exists only because a version bump still needs a manifest entry.

### Fixed

- **Entrypoint identity behind a symlinked path (POSIX-001)** - every CLI entrypoint decided whether
  it was started directly or imported by comparing the invoked path with its own module path, and
  Node resolves an entry file to its real path before loading it. On a host whose temp directory sits
  behind a symlink - the normal case on macOS - an entrypoint spawned from a payload copy under temp
  concluded it was not the main module, did nothing, and exited 0. The suites read that 0 as success:
  sabotage controls came back green because nothing had run. All six entrypoints now compare real
  paths on both sides, and the self-check carries an entrypoint-identity assertion with a
  constructed-input control. Reproduced on Windows through a directory junction before the fix.
- **The Linux and macOS CI legs (POSIX-001)** - every defect that kept them red is fixed; the 0.2.1
  push's CI run is the proof. Besides the entrypoint defect: the `codex-qal.sh` cleanup function
  that only a `trap` ever calls is now exempted from BOTH shellcheck codes that report it (two
  ShellCheck generations name the same false positive differently), `actions/checkout` and
  `actions/setup-node` are pinned at `@v5`, and the workflow header no longer claims those legs have
  never executed. macOS itself is proven by CI on the 0.2.1 push - this repository has no macOS host.
- **A test expectation built with the host's separator (POSIX-001)** - the setup suite compared a
  rendered path against a string assembled with the separator of the machine running the test, while
  the product deliberately renders the separator of the CONFIGURED channel. The expectation is now
  built from the channel too.
- **The provenance scan ignores the harness's plugin-cache metadata (POSIX-002)** - when the plugin
  is installed from a marketplace, the payload root is a directory inside Claude Code's plugin cache,
  and the harness keeps `.in_use/<pid>` and `.orphaned_at` in it. The self-check's provenance scan
  fails on files whose type it does not know, so a perfectly clean marketplace installation reported
  four failures about the harness's own bookkeeping. Both names are skipped now - at the payload root
  only, by exact name, and only those two: a `.in_use` directory deeper in the payload is still
  scanned, an unclassified root file of any other name still fails, and two controls prove both
  directions.

## [0.2.0] - 2026-09-02

Who audits what stops being doctrine text and becomes a table in your config: three review classes
(`plan`, `code`, `docs`), each with its own pass count and, if you want one, its own host. One
command shows the whole picture and changes any of it without a re-interview.

### Added

- **The audit table (AUD-001)** - `review.plan`, `review.code` and `review.docs` in
  `aiwf.config.json`, factory `2 / 1 / 1` passes. A row carries only `passes` and INHERITS the
  Reviewer role whole (engine, model and effort together), or names its own host in one of exactly
  two shapes: `{ passes, engine: "claude", model }` or
  `{ passes, engine: "codex", model, effort }`. There is no field-by-field inheritance, so no
  configuration can compose a Claude tier with a Codex model id. The effective rows are rendered
  into `.claude/aiwf-native/roles.json`.
- **`/pnp:roles` (AUD-001)** - `scripts/setup/aiwf-roles.mjs`: `--show` prints the table (every
  role, every class, the fact-check gate and R1); `--set <target>.<field>=<value>` and
  `--reset <plan|code|docs>` change it and re-render `roles.json` and the agent files. Two phases:
  everything is decided and validated before a single byte is written, so a refusal leaves the
  project exactly as it was. It is plan-before-write, not a transaction - an interrupted run is
  finished by re-running the same command. Exit 0 written, 1 refused, 2 could not start.
  `/pnp:mission`, `/pnp:work` and `/pnp:setup` print the table in their reports.
- **The role resolver takes an optional review class (AUD-001)** - `-Class plan|code|docs`
  (`--class` on the bash channel), reviewer-only, in both channels: JSON gains `class` and
  `passes`, the plain form prints four tokens. Without the flag the output is byte-identical to
  0.1.2. The Codex review wrappers take the same flag and use the row's model and effort.
- **`ifRecorded` on `rerender-managed-region` (AUD-001)** - a migration can now re-render an
  artifact that exists on SOME installations only (`.claude/agents/reviewer.md` is rendered for a
  claude-hosted host and does not exist at all on a codex-configured project). Without a record it
  is reported as `not on this installation (no record) - skipped` instead of aborting the run. No
  adoption, no write, no new bookkeeping entry.
- **A third countable tripwire (AUD-002)** - running a mechanical procedure (a helper script, a bulk
  find/replace, a verify cycle over a fixed list, debugging a helper written a minute ago) is a
  `general-purpose` subagent's job with exact inputs and an output contract, not the orchestrator's.
  The countable moment is the SECOND inline fix of the same helper in one session. It is in
  `docs/WORKFLOW.md` and in the managed `CLAUDE.md` region, so it travels to installed projects.
- **The COO's own readiness pass, before any paid one (AUD-002)** - `docs/WORKFLOW.md` § Plan
  readiness: a finished draft is re-read in a separate turn against the six readiness checks, every
  `file:line` opened and every command executed on the recorded OS channel, before an auditor is
  dispatched. A paid pass verifies decisions; precision is paid for on the author's own account.
- **A fifth brief-authoring failure: a scope guard is anchored to HEAD at dispatch (AUD-002)** -
  never to the previous ticket's commit, which silently includes everything committed in between
  (typically the orchestrator's own completion-record commit) and manufactures a VERIFY failure the
  Writer cannot and must not fix. Guards that intentionally span several tickets keep their named
  base and say so.
- **Public install path (PUB-001)** - the plugin installs from the GitHub marketplace this
  repository serves: `/plugin marketplace add divels-studio/promptandpray` +
  `/plugin install pnp@promptandpray`, and `/plugin marketplace update` +
  `/plugin update pnp@promptandpray` + `/reload-plugins` + `/pnp:update` for a newer version.
  `README.md`, `docs/README.md` and `dev/README.md` put that path first and keep the local checkout
  as the alternative; `plugin.json` now names its `repository` and `homepage`. `/reload-plugins` is
  spelled out at every one of those places because a running session keeps the version it loaded at
  startup - the update lands on disk, and `/plugin list` is what says which version is live.

### Changed

- **A Claude auditor is never below the author (AUD-001)** - one rendered `reviewer` agent file per
  installation, whose `model` is the Reviewer's own when the Reviewer is claude-hosted and `fable`
  otherwise, and whose `effort` is always `roles.reviewer.effort` (the Agent tool has no
  per-invocation effort, so a Claude row carries none of its own). The file is now rendered when
  the Reviewer role OR any review row is claude-hosted. `/pnp:roles --show` marks a Claude auditor
  below the top tier; QA is deliberately not marked - it compares artifacts against acceptance
  criteria rather than auditing decisions.
- **The doctrine reads the table instead of stating rules (AUD-002)** - `docs/WORKFLOW.md`,
  `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`, `docs/OPERATOR_PROTOCOL.md`, `/pnp:review`,
  `/pnp:work`, the `README`, the reviewer agent template, the overrides template and the managed
  `CLAUDE.md` region no longer hardcode "two passes", "a third pass", a docs-class host or a model.
  The review brief carries `Class: plan | code | docs`, `/pnp:review` resolves that row through the
  resolver's `-Class`, plan readiness runs `review.plan.passes` with `review.plan.passes` + 1 as the
  hard maximum, and a docs-class ticket on a Claude host is a configuration `/pnp:roles` shows.
- **The fact-check gate guards the expensive pass, whichever engine hosts it (AUD-002)** - it runs
  before every reviewer pass above the scan tier (a Codex pass, or a Claude reviewer on
  `opus`/`fable`), over a diff **or over a plan**, and may be skipped only when the reviewer itself
  runs on a scan-tier model. The old wording skipped it whenever the Claude branch resolved, which
  was wrong the moment a Claude auditor became the expensive one.

### Removed

- **The ad-hoc `opus` reviewer for docs-class diffs (AUD-001)** - "a docs-class ticket goes to a
  Claude host regardless of the configured engine" is no longer a rule with a hardcoded model. It
  is `review.docs`, which starts out inheriting the same auditor as `review.code` and is one
  `/pnp:roles --set` away from anything else. A Claude-hosted row now dispatches the project's
  rendered `reviewer` agent, which exists whenever the Reviewer role or any row is Claude-hosted.
- **The plan pre-pass as a separate step (AUD-002)** - it was the fact-check gate under a second
  name, run over a plan instead of a diff. There is now one rule: fact-check before every pass above
  the scan tier, over a diff or a plan.

## [0.1.2] - 2026-08-31

The first consumer update (0.1.0 -> 0.1.1 on a real installation) produced two take-new dialogs for
artifacts the operator had never opened. A question that cannot be answered wrongly is not a gate, so
the update engine now asks only where there is operator content to lose - and says in the CHANGES
report what happened to every managed artifact.

### Changed

- **A payload change alone is no longer a conflict (P9)** - `scripts/update/migrate.mjs`: an unheld
  artifact the operator has not edited, whose payload render changed, is applied WITHOUT a dialog,
  through the same take-new path an operator decision goes through (same journal, same stage, same
  resume). The run says why: `<key>: the payload version applied (you had not edited it)`. A dialog is
  still raised - and the file still left untouched - when the operator edited the artifact, when it is
  GONE, and when a held artifact was edited again; a held, untouched artifact is still recorded as
  upstream and never re-applied. `/pnp:update`'s dry run now stops only where a decision is genuinely
  needed (a config key that asks, or a real edit of yours).
- **The CHANGES report names each artifact's final state (P9)** - every `rerender-managed-region`
  line in "Applied" carries `payload-current` or `held (your version kept)`, derived from the final
  bookkeeping only, so the report is identical whether the update ran in one process or resumed after
  a crash. One header sentence says which artifacts were applied without a dialog, which were asked
  about and which were only recorded. Accepted boundaries, stated in
  `migrations/0003_quiet-rerender/NOTES.md`: auto and operator take-new are not distinguished, and
  neither are applied and already-current.
- **Plan-readiness reviews always run on the configured engine (P9)** - the docs-class engine
  override from 0.1.1 applies to IMPLEMENTATION diffs only (`/pnp:review` Step 0c and its
  plan-readiness mode, `docs/WORKFLOW.md`, `docs/LOOP.md`). A cheap Claude pre-pass before the first
  pass is allowed, without a verdict, exactly like the fact-check gate.
- **The quota gate names its mechanics (P9)** - `docs/WORKFLOW.md` and the managed
  `CLAUDE.md#aiwf-core` region listed "expensive-quota passes" as an operator gate with no mechanics,
  which read literally made the orchestrator ask before EVERY paid pass. The gate is now the passes
  BEYOND the review contract - a third plan-readiness pass, a correction round past the cap - while
  the passes the route already prescribes run on the ticket's standing word. `0003_quiet-rerender`
  carries that region re-render, which on an unedited region applies with no dialog at all: the new
  conflict rule's first proof on a real installation.
- **The example cycle proves both halves of the rule (P9)** - `0004_example-bump` (renumbered from
  `0003_example-bump`, which the ascend-by-1 rule requires now that the payload ships a third
  migration) gains a second `rerender-managed-region`, over an artifact the cycle never edits: zero
  dialogs for it, `payload-current` in the report, and the hand-edited region still takes the
  keep-mine path.

### Fixed

- **The 0.1.0 entry below overstated the example cycle (P9)** - it exercises `keep-mine` and
  `take-new` (`merge` lives in the update suite) and contains no crash injection (resume after an
  interrupted migration is proven in the update suite, section 9). Corrected in place.
- **The self-check pins the new rule and the readiness carve-out (P9)** - `/pnp:update`'s conflict
  sentence and the plan-readiness clause are asserted as text with their own flipping controls,
  `/pnp:update` joins the six skills carrying the canonical "reading is not a shell job" sentence,
  and the example-fixture controls read the bump's id from `bump.json` instead of hardcoding a number
  that legitimately moves.

## [0.1.1] - 2026-08-30

Hygiene from the first real run of the loop through the plugin, one doctrine correction learned
from an observed violation, and the first migration with operations
(`0002_operator-word-and-hygiene`) - so an installed project takes all of it through
`/plugin update` + `/pnp:update`.

### Added

- **A ticket born after a standing word waits for its own word (P8)** - `docs/WORKFLOW.md` guard
  (b), the managed `CLAUDE.md` region, `/pnp:mission` and `/pnp:work`: a NEW ticket (one not in the
  PLAN's recorded execution order) is written into the PLAN, announced in ONE sentence, and STOPS -
  zero mutations on it until the operator's word for THAT ticket. The earlier reading, "the
  announcement is a notification, not a question", is explicitly REVOKED: it allowed a ticket to be
  born and started in the same turn without a word.
- **Review engine by ticket class (P8)** - the review brief carries `Class: docs | code` (`code`
  when absent) and `/pnp:review` Step 0c branches on it: a docs-class ticket is reviewed by the
  `reviewer` Claude subagent whatever `roles.reviewer.engine` says, a code-class one by the
  configured engine.
- **Fact-check gate before a paid pass (P8)** - `/pnp:review` Step 2b: one cheap read-only scan
  agent over the PROSE of the diff, returning only the false or unverifiable claims with
  `file:line`, before any pass on a paid external engine. The Reviewer verifies decisions; it is
  not the mechanism that discovers a wrong path or a wrong count.
- **A second paid pass only when the correction round touched code (P8)** - in the not-configurable
  half of `docs/WORKFLOW.md` § "Loop shape and its overrides". Prose-only corrections are verified
  by the fact-check gate plus the COO's own first-hand check, recorded in the completion record; the
  operator may always ask for a paid pass explicitly.
- **"Reading is not a shell job" as a skill instruction (P8)** - one identical sentence in Step 0 of
  `/pnp:mission`, `/pnp:work`, `/pnp:setup`, `/pnp:review`, `/pnp:qa` and `/pnp:loop`, and in the
  writer agent.
- **A `## VERIFY` section in the writer agent (P8)** - run every VERIFY command literally, report
  the exact exit code the harness shows, never append `; echo "X=$?"`.
- **Worktrees and memory (P8)** - a short section in `docs/OPERATOR_PROTOCOL.md`: a git worktree is
  a separate project path and therefore a separate memory directory; copying and merging memory is
  manual, and it is a harness fact, not a plugin mechanism.
- **A PAYLOAD DOCTRINE section in the self-check (P8)** - the rules that exist only as text are
  asserted as text, each with its own flipping control (including one that only REWORDS a rule), and
  the project layer now proves an owned ask rule belongs to the ruleset rendered for the CURRENT
  project root.

### Changed

- **The template-contract comment is stripped from every render (P8)** - `<!-- TEMPLATE CONTRACT`
  blocks are notes for whoever edits a template and no longer reach the rendered agent, overrides
  document or managed region. Both engines render through one shared context builder, so setup and
  update cannot disagree about the bytes.
- **`0002_operator-word-and-hygiene` re-renders the managed `CLAUDE.md` region and
  `.claude/agents/writer.md` and reconciles the ask ruleset (P8)** - deliberately with no op for
  `agents/reviewer.md` / `agents/qa.md`, which are absent on a codex-hosted install; the migration's
  `NOTES.md` states that limit and the two ways to re-render them.
- **The Gate 2 dialog spike is recorded as OBSERVED (P8)** - `scripts/spike/README.md`: the native
  Yes/No dialog was seen in `always` mode carrying the `[plugin:pnp]` tag, and a dispatch naming an
  on-plan ticket passed silently in `off-plan`. The procedure stays as the reproduction recipe.

### Fixed

- **A re-run no longer keeps ask rules rendered for a project root that is gone (P8)** - the
  to-remove half of the reconcile formula now lives in `planAskRules` itself, so setup and update
  apply it identically: an owned rule that is not in the desired set for the CURRENT root leaves
  `settings.json` and `ownedAskRules`. It is NOT tombstoned - a tombstone means the operator removed
  it - and a foreign rule that merely mentions the old path is untouched.
- **The blanket `Bash(git -C:*)` ask rule is gone from the factory ruleset (P8)** - it gated every
  `-C` form of every git command, read-only ones included, while adding nothing to the
  push/merge/rebase gate, which keeps its three rendered `Bash(git -C <projectRoot> ...)` forms.
  Consumers lose it through the migration's `reconcile-ask-ruleset` op only where the plugin
  inserted it.
- **The rendered writer agent no longer carries the template-contract comment or a mixed-slash
  overrides path (P8)** - the overrides document is now one absolute path in the native separator of
  `config.os`.

### Known limits (stated, not hidden)

- The hooks trust the harness identity fields and the permission rules match by command prefix:
  accident-grade, not adversary-proof. Mutations performed through shell commands are doctrine,
  not enforcement.
- On a claude-hosted reviewer or qa role, `agents/reviewer.md` / `agents/qa.md` keep the
  template-contract comment until they are re-rendered by `/pnp:setup` or
  `/pnp:update --resolve <key>` - see the migration's `NOTES.md`.

## [0.1.0] - 2026-08-29

First tagged version. Pre-release, private, not published to any marketplace. Extracted from a
production project's native AIWF working loop and genericized; proven by a dogfood installation in
that project (adopt mode, two Writer dispatches through the plugin-hosted loop, one real ticket).

### Added

- **Plugin skeleton** - `.claude-plugin/plugin.json` (`name: pnp`), `hooks/hooks.json` wired
  through `${CLAUDE_PLUGIN_ROOT}`, LF normalization via `.gitattributes`.
- **Two enforcement hooks, three responsibilities.** Gate 1 (`pretooluse-mutation-guard.js`):
  the Edit/Write family is allowed only for the true main session or the `writer` subagent.
  Gate 3 (same file, `enforcement.routeWriteGuard`): while `.aiwf/route-state.json` names an
  R2/R3 route the main session writes only `docs/**`, `.aiwf/**` and root `*.md`. Gate 2
  (`pretooluse-dispatch-gate.js`): the Writer dispatch through the Agent tool becomes a native
  Yes/No dialog - on every dispatch (`enforcement.dispatchGate: "always"`, factory default) or
  only when the brief's `Ticket: <REF>` line names no ticket in an active PLAN (`"off-plan"`).
  Every unreadable or malformed state of either key fails towards the dialog, never towards
  silence.
- **Ten skills** - `/pnp:loop`, `brief`, `mission`, `work`, `review`, `qa`, `qal`, `setup`,
  `update`, `selfcheck` - sharing one Step 0 (project root via `git rev-parse --show-toplevel`,
  config read, version interlock); `update` and `selfcheck` are the documented interlock
  exceptions.
- **Engine-neutral review roles.** Role resolver plus three Codex wrappers with locked flags
  (Reviewer and QA under `--sandbox read-only`, QAL operator-gated without a sandbox), on two
  mirrored OS channels: `scripts/native/ps/` (Windows, PowerShell 5.1-compatible, ASCII-only)
  and `scripts/native/sh/` (Linux/macOS, bash; brief on stdin only, NUL-delimited resolver
  transport). The Claude-hosted alternative renders `reviewer`/`qa` subagents held read-only by
  tool allowlist + Gate 1.
- **Config schema v1** (`schema/aiwf.config.schema.json`, draft 2020-12) as the single authority
  for `aiwf.config.json`; a schema-driven validator that fails loudly on any unknown keyword.
- **Setup engine** (`scripts/setup/`): interview (interactive or `--answers-file`), plan-then-write
  generator (a blocker means zero bytes written), three-state hash bookkeeping for the managed
  artifacts (`roles.json`, `agents/*.md`, the `aiwf-core` region of `CLAUDE.md`), ask-ruleset
  ownership without takeover and with tombstones (`_aiwf.ownedAskRules` /
  `_aiwf.suppressedAskRules`), a hand-owned `PROJECT_OVERRIDES.md` that is never rewritten, memory
  seeds printed rather than written.
- **Adopt mode** (`/pnp:setup --adopt --adopt-file`): installs into a project that already carries
  the loop by hand - identical artifacts are recorded clean, differing ones take an explicit
  per-artifact `keep-mine` / `take-new` decision, nothing is ever deleted, superseded legacy files
  are listed advisory-only; refused on a project that already has an installation.
- **Update engine** (`scripts/update/`): migration manifest (`migrations/index.json`, ops per
  version), fail-closed payload validator, migrator with a write-ahead journal and durable staging
  under `.claude/aiwf-native/update-stage/`, deterministic crash recovery, the
  `take-new` / `keep-mine` / `merge` conflict machine with an `override` that is never re-applied,
  read-through dry-run preview, CHANGES report, `--check` interlock, `--resolve <key>` outside a
  version bump.
- **Self-check** (`scripts/selfcheck/`): payload invariants (both hooks executed at their real
  entrypoints, resolver parity across both channels, wrapper flag locks byte-level), the project
  layer (bookkeeping, rendered artifacts, ask ownership, paths), a provenance scan of the whole
  payload (origin-project names, e-mail addresses, Cyrillic code points, absolute drive paths
  outside an allowlist), and negative controls proving every assertion can fail. It is the final
  step of `setup` and `update`; a red self-check after a successful write exits 1 and says so.
- **Example project and CI** (`examples/example-project/`, `.github/workflows/ci.yml`): the full
  setup -> simulated bump -> update -> self-check cycle, exercising `keep-mine` and `take-new`
  (`merge` and crash-resume are proven in the update suite, not here); OS matrix
  Windows / Linux / macOS (shellcheck on the bash channel). (Corrected in 0.1.2 - the original entry
  claimed all three conflict decisions and resume after an interrupted migration.)
- **Doctrine as payload** (`docs/`): `WORKFLOW.md`, `LOOP.md`, `REVIEW_CHECKLIST.md`,
  `OPERATOR_PROTOCOL.md`, `SESSION_BRIEF_RECIPE.md`, `CODEX_REVIEW_QA_RECIPE.md`,
  `QA_BROWSER_INVESTIGATION.md` - read under the installed plugin root, never copied into a
  project.

### Fixed

- Gate 2 (`off-plan`): ticket-ref boundaries use the whole identifier alphabet
  (`(?<![A-Za-z0-9_-])...(?![A-Za-z0-9_-])`) - a `\b` boundary let `DEMO-1` pass silently
  against a plan that only carried `DEMO-1-EXTRA`.

### Known limits (stated, not hidden)

- The hooks trust the harness identity fields and the permission rules match by command prefix:
  accident-grade, not adversary-proof. Mutations performed through shell commands are doctrine,
  not enforcement.
- Ask-rule reconciliation on re-run is additive: an owned rule that is no longer desired - a rule
  the payload dropped, or one rendered for a project root that has moved - stays in
  `settings.json`. (Fixed in 0.1.1.)
- The factory ruleset carries a blanket `Bash(git -C:*)` ask rule that a project with a
  deliberately silent sibling repository will want to remove. (Fixed in 0.1.1.)
- The `writer` template renders its template-contract comment and a mixed-slash overrides path
  into the project's `agents/writer.md` (cosmetic). (Fixed in 0.1.1.)

[0.2.3]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.3
[0.2.2]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.2
[0.2.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.1
[0.2.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.0
[0.1.2]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.2
[0.1.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.1
[0.1.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.0
