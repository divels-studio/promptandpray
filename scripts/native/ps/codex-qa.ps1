<#
.SYNOPSIS
  Invoke QA on the Codex engine (read-only artifact judge).

.DESCRIPTION
  QA is the read-only "judge over evidence" surface. It does NOT drive a browser itself -
  a Codex-launched browser cannot run under any restrictive sandbox
  (docs/QA_BROWSER_INVESTIGATION.md). The runtime/UI evidence is produced OUTSIDE Codex instead:
    - Writer authors end-to-end `.spec` files from the acceptance criteria;
    - the ORCHESTRATOR (main session) runs the project's configured E2E command (the browser lives
      in the test runner, outside Codex's sandbox);
    - QA reads the resulting artifacts (JSON report, screenshots, traces) under
      `--sandbox read-only` and returns a verdict against the acceptance criteria.

  Thin wrapper over the proven command (prompt delivered via stdin - see body):
      "<prompt>" | codex exec -C <projectRoot> -m <model> --sandbox read-only -c approval_policy=never

  QA engages only for observable runtime/UI behavior. It is read-only by OS sandbox, NEVER starts a
  dev server, NEVER drives a live browser, and NEVER passes --ignore-user-config. For LIVE
  exploratory browsing there is a separate, operator-gated surface - QAL
  (scripts\native\ps\codex-qal.ps1) - which is NOT read-only. See docs/CODEX_REVIEW_QA_RECIPE.md.

.PARAMETER Prompt
  The QA brief (which artifacts to read, acceptance criteria, risk threshold, stop condition).
  Pass with -Prompt or pipe it (use -Raw for long briefs). It is delivered to Codex via STDIN
  only and never placed on the command line, so a brief cannot inject a CLI option. Errors if
  neither given.

.PARAMETER ProjectRoot
  Absolute path to the project repository - the cwd Codex is given (`-C`). REQUIRED: the plugin
  payload has no project of its own, so the caller (the /pnp:qa skill, Step 0) resolves the project
  root and passes it in. The project's roles.json is read from
  <ProjectRoot>/.claude/aiwf-native/roles.json.

.EXAMPLE
  scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -Prompt "QA ticket Y: read the E2E report/traces under ... against criteria ..."
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0, ValueFromPipeline = $true)]
  [string] $Prompt,
  [Parameter(Mandatory)][string] $ProjectRoot
)

# Engine-neutral role resolution. This Codex wrapper only runs when the `qa` role is assigned to
# the `codex` engine in the project's .claude/aiwf-native/roles.json. The MODEL comes from the
# resolver (one argv atom); if the role is reassigned to Claude, the resolved engine != codex and
# this wrapper exits 2 so /pnp:qa routes to the Claude Agent branch instead. The read-only
# guarantee is untouched: --sandbox / -C / -c approval_policy=never remain LITERALS.
$rolesPath = Join-Path $ProjectRoot '.claude\aiwf-native\roles.json'
$roleSnapshot = & pwsh -NoProfile -File (Join-Path $PSScriptRoot 'aiwf-roles.ps1') -Role qa -RolesPath $rolesPath -AsJson
if ($LASTEXITCODE -ne 0) {
  Write-Error "aiwf role resolve failed for 'qa' (see resolver stderr above)."
  exit 2
}
$role = $roleSnapshot | ConvertFrom-Json
if ($role.engine -ne 'codex') {
  Write-Error "role 'qa' resolves to engine '$($role.engine)', not 'codex'; this Codex wrapper does not run - route through the Claude Agent branch of /pnp:qa."
  exit 2
}

# Locked flags - the proven read-only command. QA is an artifact judge (reads test-runner output);
# it does NOT drive a browser (a Codex-launched browser cannot run under read-only).
# Do NOT add --ignore-user-config - keep the CWD/model/sandbox/user-config posture as proven.
# Do not change --sandbox without re-proving it. Data from the resolver: the -m model and the
# model_reasoning_effort value ($role.effort) - each one argv atom; sandbox/approval stay literal,
# and -C is the caller-supplied project root.
# `-c approval_policy=never` is a deliberate hardening on top of the proven posture: it pins the
# approval mechanism explicitly (does NOT inherit it from ~/.codex/config.toml), so read-only
# cannot be paired with an escalating approval policy.
$codexArgs = @(
  'exec',
  '-C', $ProjectRoot,
  '-m', $role.model,
  '--sandbox', 'read-only',
  '-c', 'approval_policy=never',
  '-c', "model_reasoning_effort=$($role.effort)"
)

if ([string]::IsNullOrWhiteSpace($Prompt)) {
  Write-Error 'No prompt provided. Pass -Prompt "<brief>" or pipe one: Get-Content brief.txt -Raw | scripts\native\ps\codex-qa.ps1 -ProjectRoot <path>'
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
