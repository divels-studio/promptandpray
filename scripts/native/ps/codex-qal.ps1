<#
.SYNOPSIS
  Invoke QAL - the LIVE agentic-browser Codex surface (NO sandbox, operator-gated).

.DESCRIPTION
  QAL is the *live exploratory* QA surface: a real Codex-driven agentic browser. It is the
  operator-gated exception to the default read-only QA. Unlike QA (codex-qa.ps1, the read-only
  artifact judge), QAL runs WITHOUT an OS sandbox: any restrictive sandbox (read-only or
  workspace-write) blocks a Codex-launched browser, so it must be relaxed. --sandbox
  danger-full-access is the MINIMAL non-bypass flag that runs one
  (docs/QA_BROWSER_INVESTIGATION.md); the broader --dangerously-bypass-approvals-and-sandbox also
  works but additionally strips the approval mechanism. NEITHER is "safe" - both give the browser
  full disk access.

  Command shape (prompt via stdin - see body):
      "<prompt>" | codex exec -C <unique-scratch> -m <model> --sandbox danger-full-access -c approval_policy=never

  WHY `--sandbox danger-full-access` and NOT `--dangerously-bypass-approvals-and-sandbox`:
  the investigation proved `--sandbox danger-full-access` is the MINIMAL flag that makes a
  Codex-launched browser work. The broader `--dangerously-bypass-approvals-and-sandbox` also works
  but additionally strips the approval mechanism - an unnecessary widening. We take the narrower
  proven flag. Any restrictive `--sandbox` (read-only OR workspace-write) BLOCKS the browser at
  launch/attach (proven) - do NOT reintroduce one here. Do NOT add --ignore-user-config; it strips
  the browser tooling QAL needs.

  APPROVAL PIN: `-c approval_policy=never` is set so the approval mechanism is pinned explicitly
  and NOT inherited from ~/.codex/config.toml (same hardening as the read-only wrappers). Under
  danger-full-access this does not reduce QAL's capability - full access needs no approval to
  act, and `never` simply removes prompting (correct for non-interactive `codex exec`, which has
  no human to answer a prompt). It does NOT relax the sandbox: danger-full-access is unchanged.

  PREFLIGHT (fail-closed, three conditions). QAL runs ONLY when all three hold:
    (1) `roles.qal.enabled` is true in the project's roles.json - checked here;
    (2) the qal role resolves to engine `codex` - checked here (QAL is codex-only by design;
        there is no Claude QAL host);
    (3) the operator asked for QAL explicitly in the CURRENT conversation - this one cannot be
        checked by a script; it is enforced by the /pnp:qal skill and the doctrine. The
        orchestrator NEVER decides to run QAL on its own.

  HONEST SECURITY MODEL - read before running (no overclaiming):
  - There is NO cell here. `--sandbox danger-full-access` gives the Codex process (and the
    browser it drives) FULL disk access. Repo safety rests only on:
      (1) `-C <unique-scratch>` cwd isolation - a UNIQUE throwaway dir created fresh under the
          per-user temp directory on EVERY run (timestamp + GUID) and removed (best-effort)
          afterward, so no state leaks between runs; the project repo is NEVER the cwd;
      (2) the browser launching its OWN default (throwaway) profile, not the operator's;
      (3) git reversibility + the operator-in-the-loop backstop.
    These are HYGIENE / accident-grade containment, NOT a guarantee. Under danger-full-access
    nothing structurally prevents a write outside the scratch dir - do NOT claim the scratch
    cwd or the "never writes the repo" convention is a guarantee anywhere.
  - QAL's contract is: explore the UI, report with evidence, NEVER write the repo. That is a
    CONVENTION of the role, enforced by nothing but the brief and the operator - stated honestly.

  See docs/CODEX_REVIEW_QA_RECIPE.md, docs/LOOP.md and the /pnp:qal skill.

.PARAMETER Prompt
  The QAL brief (exploration goal, scope, stop condition). Pass with -Prompt or pipe it
  (use -Raw for long briefs). It is delivered to Codex via STDIN only and never placed on the
  command line, so a brief cannot inject a CLI option. Errors if neither is given.

.PARAMETER ProjectRoot
  Absolute path to the project repository. REQUIRED, and used for ONE thing only: locating the
  project's `.claude/aiwf-native/roles.json` for the preflight. It is deliberately NOT passed to
  Codex - QAL's cwd is always the unique throwaway scratch dir, never the repo.

.EXAMPLE
  scripts\native\ps\codex-qal.ps1 -ProjectRoot 'C:\repo' -Prompt "Explore the editor at http://localhost:3000 ..."
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0, ValueFromPipeline = $true)]
  [string] $Prompt,
  [Parameter(Mandatory)][string] $ProjectRoot
)

# --- per-run scratch helpers ----------------------------------------------------------------
$QalRoot = Join-Path $env:TEMP 'aiwf-qal'

# Best-effort removal of a per-run scratch dir. Never blocks the run: on failure it warns WITH the
# path (so the operator can remove it) and returns; callers still exit with the real code. Shared by
# BOTH the empty-prompt early exit and the post-run path, so cleanup behaviour is identical on both.
function Remove-QalScratch {
  param([Parameter(Mandatory)][string] $Path)
  try {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
  } catch {
    Write-Warning "QAL scratch cleanup failed (remove it manually): $Path - $($_.Exception.Message)"
  }
}

# Create a UNIQUE fresh scratch dir under <temp>\aiwf-qal\. FULL GUID (+ timestamp for readability);
# the leaf is created WITHOUT -Force, so an existing path is a real collision (never silently reused)
# - on collision, or a lost create race, retry with a NEW GUID. This is what makes "fresh every run"
# TRUE, not merely likely. The project repo is NEVER the cwd. This is cwd HYGIENE (accident-grade
# containment), NOT a sandbox guarantee (see header security model).
function New-QalScratch {
  New-Item -ItemType Directory -Path $QalRoot -Force -ErrorAction SilentlyContinue | Out-Null
  for ($i = 0; $i -lt 5; $i++) {
    $RunId = ('{0:yyyyMMdd-HHmmss}-{1}' -f (Get-Date), ([guid]::NewGuid().ToString('N')))
    $candidate = Join-Path $QalRoot $RunId
    if (Test-Path -LiteralPath $candidate) { continue }
    try {
      New-Item -ItemType Directory -Path $candidate -ErrorAction Stop | Out-Null
      return $candidate
    } catch {
      continue  # lost a race / stale path appeared between test and create - try a new GUID
    }
  }
  throw "QAL could not create a unique scratch dir under $QalRoot after 5 attempts."
}

# Engine-neutral role resolution (done BEFORE creating a scratch dir so a failed preflight leaves
# nothing behind). QAL is codex-only, so a non-codex resolution is a misconfiguration -> exit 2.
# Data from the resolver: the -m model and the model_reasoning_effort value ($role.effort), each one
# argv atom; --sandbox / -c approval_policy=never stay LITERALS.
$rolesPath = Join-Path $ProjectRoot '.claude\aiwf-native\roles.json'
$roleSnapshot = & pwsh -NoProfile -File (Join-Path $PSScriptRoot 'aiwf-roles.ps1') -Role qal -RolesPath $rolesPath -AsJson
if ($LASTEXITCODE -ne 0) {
  Write-Error "aiwf role resolve failed for 'qal' (see resolver stderr above)."
  exit 2
}
$role = $roleSnapshot | ConvertFrom-Json

# Preflight condition (1): the operator gate. Absent/false/non-boolean `enabled` -> refuse.
$qalEnabled = ($role.PSObject.Properties.Name -contains 'enabled') -and ($role.enabled -is [bool]) -and $role.enabled
if (-not $qalEnabled) {
  Write-Error "QAL is disabled: roles.qal.enabled is not true in '$rolesPath'. QAL is an operator-gated exception - enable it deliberately (config key roles.qal.enabled) before running it."
  exit 2
}

# Preflight condition (2): codex-only by design.
if ($role.engine -ne 'codex') {
  Write-Error "role 'qal' resolves to engine '$($role.engine)', not 'codex'; QAL is codex-only - no Claude QAL host exists. Fix the project's roles.json."
  exit 2
}

$Scratch = New-QalScratch

# Locked flags - danger-full-access is the MINIMAL proven-working flag for a Codex-launched
# browser. Do NOT swap to --dangerously-bypass-approvals-and-sandbox (broader than needed) and do
# NOT add a restrictive --sandbox (read-only/workspace-write both BLOCK the browser - proven). -C
# points at the unique throwaway scratch, never the repo. Only -m is data (resolved model, one argv
# atom); everything else literal.
# `-c approval_policy=never` pins the approval mechanism explicitly (does NOT inherit it from
# ~/.codex/config.toml); it does NOT relax the sandbox (see APPROVAL PIN in the header).
$codexArgs = @(
  'exec',
  '-C', $Scratch,
  '-m', $role.model,
  '--sandbox', 'danger-full-access',
  '-c', 'approval_policy=never',
  '-c', "model_reasoning_effort=$($role.effort)"
)

if ([string]::IsNullOrWhiteSpace($Prompt)) {
  Write-Error 'No prompt provided. Pass -Prompt "<brief>" or pipe one: Get-Content brief.txt -Raw | scripts\native\ps\codex-qal.ps1 -ProjectRoot <path>'
  Remove-QalScratch -Path $Scratch
  exit 2
}

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY - it never
# appears on the command line, so no caller text (even one starting with "--") can reach the
# option parser. A literal "--" separator does NOT work here: PowerShell's "Windows"
# native-argument mode strips "--" before it reaches codex. Routing through stdin bypasses
# option parsing entirely. (QAL is unsandboxed by design - stdin locking here protects the
# pinned -C scratch cwd and model, not a read-only boundary.)
$Prompt | & codex @codexArgs
$exitCode = $LASTEXITCODE

# Best-effort cleanup of the unique per-run scratch dir (same helper as the empty-prompt path): on
# failure it warns with the path and we still exit with Codex's real exit code.
Remove-QalScratch -Path $Scratch
exit $exitCode
