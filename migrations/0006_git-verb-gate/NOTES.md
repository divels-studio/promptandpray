# 0006_git-verb-gate

**A migration with nothing to apply.** 0.2.2 adds payload code - a third PreToolUse hook - and
changes nothing in an installed project: no config key moves, no managed region is re-rendered, no
ask rule is added or removed, no agent file is touched. It exists because the manifest's last entry
must equal the payload version; otherwise "no unapplied migrations" and "installed == payload
version" would disagree and an installation would sit on 0.2.1 while reporting that it is current.

One operation, and it asks nothing.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one paragraph in your `CHANGES_*.md` saying what the new gate does, and that there is nothing for you to do. |

## What Gate 4 is

The commit/push/destructive boundary has always been a set of declarative `ask` rules in your
`.claude/settings.json`, and those rules have two limits that no wording could fix:

- **A dialog is only a gate where somebody can see it.** A background subagent that runs
  `git reset --hard` raises its dialog nowhere the operator is looking.
- **A rule covers the form it spells out, and no other.** `git.exe reset --hard` and
  `git -C <path> reset --hard` matched no rule and raised no dialog at all, because the ruleset
  carries those two spellings for `push`, `merge` and `rebase` only - and neither did a git command
  behind a wrapper Claude Code does not strip, such as `sudo`.

`scripts/engine/pretooluse-git-verb-guard.js`, wired on matcher `Bash`, closes those two. It
recognises `git` / `git.exe` (with an optional global `-C <path>` or `-c <k=v>`) followed by an
ask-class verb anywhere in the command, and then:

- from a **subagent that is not the Writer** it **denies**, naming the verb;
- from the **main session or the Writer** it **passes through silently** wherever one of your `ask`
  rules matches the subcommand byte for byte - `git <verb> ...` for every ask-class verb, and
  `git.exe push|merge|rebase ...` - because that dialog is about to appear and a second one would be
  noise;
- from the main session or the Writer it **asks** on everything else it recognised: `git.exe <verb>`
  outside push/merge/rebase, any `git -C <path> <verb>`, a wrapper the harness does not strip
  (`sudo`, `npx`, `docker exec`, a flagged `xargs`, a `command -v` query), a nested shell
  (`bash -c "... git reset --hard"`), and irregular whitespace on either side of the verb - a tab or
  a second space where the rule spells out exactly one.

**What Claude Code already does for you, which this gate deliberately leaves alone.** Its permission
documentation describes an operator-aware matcher - this paragraph is that description, and nothing
in this repository tests it: rules are matched against each subcommand of a chained command (`&&`,
`||`, `;`, `|`, `|&`, `&`, newlines), the wrappers `timeout`, `time`, `nice`, `nohup`, `stdbuf`,
`command`, `builtin`, `noglob` and a flagless `xargs` are stripped first, and matching continues past
leading `NAME=value` assignments. `cd <path> && git commit -m x` and `timeout 30 git commit -m x`
therefore already raise your dialog - Gate 4 stays silent on them and adds nothing. That silence is
where this gate leans on the host: if a version of Claude Code stopped matching per subcommand, those
forms would go ungated and nothing in the plugin's own tests would notice, because they exercise the
hook, never the harness.

**What you will notice:** nothing on the commands you already run. A new dialog appears exactly where
one used to be missing - and where a rule already matches, a hook ask and a rule ask are one dialog,
not two.

## What it is not

It is a recogniser, not a shell parser: it does not interpret escapes, aliases or env-indirection,
and it is quote-aware in exactly two narrow places - a separator inside quotes does not split a
command, and a verb token's surrounding quotes come off, so `git 'push'` is recognised while
`git \push` is not. The guarantee is the identity check and the byte-exact rule test; recognition is
best-effort, and both of its edges are stated in the hook's own header - a gated verb inside a quoted
string still costs a click, and a verb assembled from a variable is not seen at all. Its
decomposition also does not mirror the harness's reach into subshells and command substitutions: a
`$(git reset --hard)` or `` `git push` `` is recognised but never confirmed as a rule match, so it
asks. Asking is the
safe direction here by design, because a hook `ask` next to a matching rule does not add a second
dialog.

**And one limit of a different kind: this gate sees one shell tool.** It is wired on the `Bash`
matcher, and every rule in your ask list is a `Bash(...)` rule. If your harness exposes a second
shell tool - a Windows session carries a `PowerShell` tool next to `Bash` - the same commit, push,
merge, rebase or reset run through that tool reach neither this hook nor a permission rule, and no
dialog appears at all. It needs no unusual command form,
only the other tool, so a subagent with a broad tool allowlist can get past the deny by choosing it.
What Gate 4 does on the `Bash` tool it does as described above; it does not reach any other one. A file mutation performed through the shell
(`echo ... > file`) is not this gate's subject and remains doctrine, exactly as before. The verb list
is not maintained by proof-reading: the self-check parses `templates/settings.ask-ruleset.json` and
requires every git verb those rules gate to be one the hook knows, so a rule added to the ruleset
cannot quietly outrun the gate.

## If you are updating from 0.1.x or 0.2.0

`0002_operator-word-and-hygiene`, `0003_quiet-rerender`, `0004_audit-table` and `0005_posix-legs`
still apply first, each with its own operations and its own notes; this one follows them and adds
nothing to what they ask of you.
