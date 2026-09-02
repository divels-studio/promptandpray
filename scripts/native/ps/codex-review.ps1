<#
.SYNOPSIS
  Invoke the Reviewer on the Codex engine (read-only, OS-sandboxed).

.DESCRIPTION
  Thin wrapper over the proven command (prompt delivered via stdin - see body):
      "<prompt>" | codex exec -C <projectRoot> -m <model> --sandbox read-only -c approval_policy=never
  Reviewer is read-only by OS sandbox and reports; it never edits, commits, or pushes.
  NEVER passes --ignore-user-config (keeps the user's Codex config; the CWD/model/sandbox/
  user-config posture stays exactly as proven). The `-c approval_policy=never` pin is a deliberate
  hardening on top of that posture: it stops the approval mechanism being inherited from
  ~/.codex/config.toml (read-only + an inherited interactive/auto approval policy could otherwise
  permit a sandbox escalation). See docs/CODEX_REVIEW_QA_RECIPE.md.

.PARAMETER Prompt
  The review brief. Pass with -Prompt or pipe it (use -Raw for long briefs). It is
  delivered to Codex via STDIN only and never placed on the command line, so a brief
  cannot inject a CLI option. If neither is provided, the script errors.

.PARAMETER ProjectRoot
  Absolute path to the project repository - the cwd Codex is given (`-C`). REQUIRED: the plugin
  payload has no project of its own, so the caller (the /pnp:review skill, Step 0) resolves the
  project root and passes it in. The project's roles.json is read from
  <ProjectRoot>/.claude/aiwf-native/roles.json.

.PARAMETER Class
  Optional review class - `plan`, `code` or `docs`. With it, the model and effort come from that
  row of the audit table (`review.<class>` in roles.json) instead of the Reviewer role's own
  triple; /pnp:review passes the ticket's class on every invocation. Without it the wrapper behaves
  exactly as it always did.

.EXAMPLE
  scripts\native\ps\codex-review.ps1 -ProjectRoot 'C:\repo' -Prompt "Review diff on branch X for ticket Y ..."

.EXAMPLE
  Get-Content .\brief.txt -Raw | scripts\native\ps\codex-review.ps1 -ProjectRoot 'C:\repo' -Class docs
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0, ValueFromPipeline = $true)]
  [string] $Prompt,
  [Parameter(Mandatory)][string] $ProjectRoot,
  [string] $Class
)

# Engine-neutral role resolution. This Codex wrapper only runs when the `reviewer` role - or, with
# -Class, the row of that review class - is assigned to the `codex` engine in the project's
# .claude/aiwf-native/roles.json. The MODEL comes from the resolver (one argv atom); if the host is
# Claude instead, the resolved engine != codex and this wrapper exits 2 so /pnp:review routes to the
# Claude Agent branch. The read-only guarantee is untouched: --sandbox / -C /
# -c approval_policy=never remain LITERALS.
#
# The two invocations are spelled out rather than assembled into an argv array on purpose: a
# resolver call built from a variable is a call whose flags no longer read as flags, and the flags
# of THIS call decide which engine gets paid.
#
# THE BRANCH IS ON WHETHER -Class WAS PASSED, NEVER ON ITS VALUE. `-Class ''` must FAIL, exactly as
# the resolver's own contract says - branching on the value instead let an explicitly empty class
# fall through to the classless call and quietly review a docs-class diff on the Reviewer's own
# host, which is the wrong engine, the wrong model and someone else's budget.
$rolesPath = Join-Path $ProjectRoot '.claude\aiwf-native\roles.json'
$resolver = Join-Path $PSScriptRoot 'aiwf-roles.ps1'
$HasClass = $PSBoundParameters.ContainsKey('Class')
if ($HasClass) {
  $roleSnapshot = & pwsh -NoProfile -File $resolver -Role reviewer -Class $Class -RolesPath $rolesPath -AsJson
} else {
  $roleSnapshot = & pwsh -NoProfile -File $resolver -Role reviewer -RolesPath $rolesPath -AsJson
}
if ($LASTEXITCODE -ne 0) {
  Write-Error "aiwf role resolve failed for 'reviewer' (see resolver stderr above)."
  exit 2
}
$role = $roleSnapshot | ConvertFrom-Json
if ($role.engine -ne 'codex') {
  $what = if ($HasClass) { "review class '$Class'" } else { "role 'reviewer'" }
  Write-Error "$what resolves to engine '$($role.engine)', not 'codex'; this Codex wrapper does not run - route through the Claude Agent branch of /pnp:review."
  exit 2
}

# Locked flags - the proven read-only + user-config-loaded posture. Do not add
# --ignore-user-config and do not change --sandbox without re-proving it. Data from the resolver:
# the -m model and the model_reasoning_effort value ($role.effort) - each one argv atom; everything
# else (sandbox/approval) is literal, and -C is the caller-supplied project root.
# `-c approval_policy=never` pins the approval mechanism explicitly (does NOT inherit it from
# ~/.codex/config.toml), so read-only cannot be paired with an escalating approval policy.
$codexArgs = @(
  'exec',
  '-C', $ProjectRoot,
  '-m', $role.model,
  '--sandbox', 'read-only',
  '-c', 'approval_policy=never',
  '-c', "model_reasoning_effort=$($role.effort)"
)

if ([string]::IsNullOrWhiteSpace($Prompt)) {
  Write-Error 'No prompt provided. Pass -Prompt "<brief>" or pipe one: Get-Content brief.txt -Raw | scripts\native\ps\codex-review.ps1 -ProjectRoot <path>'
  exit 2
}

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY -
# it never appears on the command line, so no caller text (even one starting with
# "--", e.g. --ignore-user-config or --dangerously-bypass-approvals-and-sandbox) can
# reach the option parser. A literal "--" separator does NOT work here: PowerShell's
# "Windows" native-argument mode strips "--" before it reaches codex, so an on-argv
# prompt cannot be protected. Routing through stdin bypasses option parsing entirely.
$Prompt | & codex @codexArgs
exit $LASTEXITCODE
