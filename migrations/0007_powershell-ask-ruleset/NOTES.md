# 0007_powershell-ask-ruleset

**The second shell tool.** A permission rule is addressed to a TOOL. Every rule this plugin shipped
until 0.2.2 was a `Bash(...)` rule, and Gate 4 was wired on the matcher `Bash` - so on a session that
carries a `PowerShell` tool next to `Bash` (every Windows session does), the same `git commit`,
`git push`, `git reset --hard`, `Remove-Item` or `docker system prune` run through that other tool
reached neither layer and raised no dialog at all. It needed no unusual command form, only the other
tool, which is what made it the widest gap in the git boundary rather than one more residual of it.

Two operations, and the first one edits your `.claude/settings.json`.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `reconcile-ask-ruleset` | adds the 54 `PowerShell(<X>)` mirror rules to your ask list, wherever they are missing. A rule you added or edited yourself is never touched; an owned rule you removed stays removed. |
| 1 | `note` | one paragraph in your `CHANGES_*.md` - the same story, in the report you read after the update. |

## What is added

For every `Bash(<X>)` rule in `templates/settings.ask-ruleset.json` there is now a `PowerShell(<X>)`
rule with the same command prefix, in the same order - 54 pairs: the git verbs (commit, reset,
clean, rm, checkout, switch, restore, revert, pull, fetch, cherry-pick, stash, config, remote, `-c`,
push, merge, rebase, the three `git.exe` forms and the three rendered `git -C <projectRoot>` forms),
the package-manager and migration-tool rules, the container rules, and the four delete commands. The
factory allow posture gains `PowerShell(*)` next to `Bash(*)`.

The invariant is checked in **both** directions by the self-check: every `Bash(<X>)` rule must have a
`PowerShell(<X>)` mirror, and every `PowerShell(<X>)` rule must have a `Bash(<X>)` base. One
direction alone would tolerate an orphan rule - one that reads like coverage while gating a single
tool.

**If your session has no PowerShell tool, the new rules cost you nothing.** A rule matches by command
prefix on a named tool, so a rule for a tool that never appears never matches. That is the same
argument that already lets one OS-neutral ruleset carry `Remove-Item` and `rm` side by side.

## What changes in the gate

`scripts/engine/pretooluse-git-verb-guard.js` is wired on the matcher `Bash|PowerShell` - a matcher
built only from letters, digits, `_`, `-`, space, `,` and `|` is an exact alternation list, not a
regular expression - and reads `tool_name` from the payload to judge the command in that tool's
dialect. The deny branch is identical on both tools: a non-writer subagent that invokes an ask-class
git verb is refused before the form is looked at, because a background agent's dialog reaches nobody
whichever shell it picked.

The dialects differ in three documented ways, and every difference is resolved towards **asking**:

- **Separators.** PowerShell's documented AST split is `;`, `|` and, on PowerShell 7+, `&&` / `||`.
  `&` is the **call operator** there, not a list operator, so `& git push` is not split - it matches
  no rule form and asks. Splitting on it would manufacture a fragment the harness never matches a
  rule against, which is precisely how a false passthrough is made.
- **No stripping.** Nothing is documented about wrapper stripping for PowerShell, and `NAME=value` is
  not even its syntax. So `timeout 30 git commit -m x` asks on PowerShell while staying silent on
  Bash, where the stripping IS documented. You may notice this one: it is one extra click on a
  prefixed command, and the alternative is modelling a rewrite the host may not perform.
- **Case.** PowerShell matching is case-insensitive, so recognition folds case there and `GIT Push`
  is recognised - a rule would match that spelling, and a matching rule raised at a background
  subagent is a dialog nobody sees. The byte-exact rule test folds case on neither tool: a
  passthrough may not rest on a rewrite this repository cannot observe.

`Monitor` is not a third case: it runs its commands **under the Bash permission rules** and has no
namespace of its own.

## What is still open

The class, rather than a named hole: **a tool neither layer sees.** A harness tool that executed
commands under some third namespace would be outside the matcher and outside every rule, and an
agent whose allowlist carried it could reach a gated verb by choosing it. Closing that for a tool
that exists is two lines - the matcher, and the mirrored rules. `docs/LOOP.md` states it as a class
instead of promising it away.

## If you keep hand-edited permission rules

The reconcile operation adds what is missing and touches nothing else. A payload rule you already
carry in your own wording is left exactly as you wrote it - it is not adopted, not rewritten and not
reported as owned, which also means the engine will never update it for you.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene`, `0003_quiet-rerender`, `0004_audit-table`, `0005_posix-legs` and
`0006_git-verb-gate` still apply first, each with its own operations and its own notes; this one
follows them.
