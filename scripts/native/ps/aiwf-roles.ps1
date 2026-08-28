<#
.SYNOPSIS
  AIWF role resolver - maps a review role (reviewer|qa|qal) to its {engine, model, effort}.

.DESCRIPTION
  Single source of truth for which engine + model hosts each read-only review role, so the loop is
  ENGINE-NEUTRAL. The engine/model are data in the project's `.claude/aiwf-native/roles.json` (itself
  a rendered artifact of `aiwf.config.json.roles.*`); this script resolves them for one role and
  prints a snapshot the /pnp:* skills and the Codex wrappers branch on (engine `codex` -> the
  wrapper; engine `claude` -> the Agent tool with the resolved model).

  ENTRYPOINT-ONLY:
      pwsh -NoProfile -File <pluginRoot>/scripts/native/ps/aiwf-roles.ps1 -Role <r> -RolesPath <p> -AsJson
  prints `{ "role":.., "engine":.., "model":.., "effort":.. }` to stdout and exits 0. There is
  intentionally NO dot-source API and NO built-in per-role capability map - an unsupported engine
  for a role fails VISIBLY downstream (e.g. `qal = claude` has no Claude QAL host, so /pnp:qal
  fails naturally), which is the documented fail-closed. Keeping the resolver lean is deliberate.

  Each role resolves to an (engine, model, effort) triple. For `qal` the snapshot additionally
  carries the boolean `enabled` (see -AsJson below).

  FAIL SEMANTICS - exactly TWO paths:
    (a) the config file is MISSING -> return the hardcoded factory fallback `claude` / `opus` /
        effort `high` (exit 0), so the loop still runs read-only-on-Claude when the config is
        absent. Codex is an explicit opt-in, never a fallback: falling back to a paid external
        engine without the operator asking for it is the one failure mode a fallback must not have.
        Note the consequence for QAL: QAL is codex-only, so a missing config resolves qal to
        `claude` and the QAL wrapper refuses - fail-closed by construction;
    (b) the file EXISTS but the role does not resolve to a valid (engine, model, effort) triple -
        engine one of (claude|codex), model and effort non-empty strings - -> ONE line to STDERR
        and `exit 2`. This single branch folds malformed JSON / a non-object root / missing role /
        unknown engine / empty model / empty effort: there is no per-class taxonomy, and `effort`
        has NO enum (a bad value like "wat" passes through and the engine rejects it VISIBLY at
        call time - documented natural fail-closed).
        Rationale: silently dispatching the WRONG engine burns the operator's paid budget invisibly,
        so the resolver guards intent + money, not `validateState` theater.

  STRICT SHAPE (the same contract in both channels, deliberately NOT PowerShell's defaults):
    - the top level must be a JSON OBJECT. An array root is rejected, even a single-element one:
      `$raw | ConvertFrom-Json` ENUMERATES an array, so `[{...}]` would arrive unwrapped and
      resolve a file the bash channel rejects.
    - the role key is matched CASE-SENSITIVELY (`-ceq`), and so is `enabled`. PowerShell property
      lookup is case-insensitive by default, which would resolve a `"Reviewer"` key here and fail
      on bash.
    Both are host-language accidents, not contract: roles.json is a MACHINE-RENDERED artifact with
    exact-case keys, so a file that only resolves by accident of the host language is a defect the
    resolver must report rather than paper over. Both collapse into the single exit-2 path above.

  The config file is read EXACTLY ONCE.

.PARAMETER Role
  The review role to resolve: `reviewer`, `qa`, or `qal`. Required.

.PARAMETER AsJson
  Emit compact JSON `{"role":..,"engine":..,"model":..,"effort":..}`. For `qal` the object also
  carries `"enabled":<bool>` - the operator gate from `roles.qal.enabled` (absent or non-boolean
  -> false, fail-closed). The plain-text form stays `<engine> <model> <effort>` for every role;
  `enabled` is part of the MACHINE contract (-AsJson), which is what the wrappers and skills read.

.PARAMETER RolesPath
  Path to the PROJECT's `.claude/aiwf-native/roles.json`. REQUIRED - the plugin has no project
  context of its own, and a script-relative default would point at the payload instead of the
  project. The caller (skill Step 0 / a Codex wrapper's -ProjectRoot) resolves the project root
  and passes the path explicitly.

.EXAMPLE
  pwsh -NoProfile -File scripts/native/ps/aiwf-roles.ps1 -Role reviewer -RolesPath 'C:\repo\.claude\aiwf-native\roles.json' -AsJson
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string] $Role,
  [switch] $AsJson,
  [Parameter(Mandatory)][string] $RolesPath
)

Set-StrictMode -Version Latest

$KnownRoles   = @('reviewer', 'qa', 'qal')
$KnownEngines = @('claude', 'codex')
# Factory fallback used ONLY when the config file is absent (never on a present-but-invalid file).
$Fallback     = @{ engine = 'claude'; model = 'opus'; effort = 'high' }

function Invoke-Fail([string] $Message) {
  [Console]::Error.WriteLine("aiwf-roles: $Message")
  exit 2
}

if ($KnownRoles -notcontains $Role) {
  Invoke-Fail "role '$Role' is not a valid role (expected one of: $($KnownRoles -join '|'))."
}

$path = $RolesPath

if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
  # (a) missing file -> silent factory fallback (claude/opus/high; qal disabled).
  $out = [pscustomobject]@{ role = $Role; engine = $Fallback.engine; model = $Fallback.model; effort = $Fallback.effort }
  if ($Role -eq 'qal') { $out | Add-Member -NotePropertyName enabled -NotePropertyValue $false }
} else {
  # (b) present file: read EXACTLY ONCE, then resolve. ANY invalid-record condition (malformed JSON,
  # missing role, unknown/empty engine, empty model/effort) collapses into the single exit-2 path below.
  $raw = Get-Content -LiteralPath $path -Raw
  # Capture the RAW (un-coerced) engine/model/effort values - a JSON number/bool/object/array must NOT
  # be silently coerced into a valid-looking string (`"model": 5` -> "5"); each is validated as a real
  # string below, BEFORE any coercion.
  $engine  = $null
  $model   = $null
  $effort  = $null
  $enabled = $null
  try {
    $cfg   = $raw | ConvertFrom-Json -ErrorAction Stop
    # STRICT SHAPE (see the header): an object root only - an array root would be member-enumerated
    # by PowerShell and resolve a file the bash channel rejects - and a CASE-SENSITIVE key lookup,
    # because `$cfg.$Role` matches "Reviewer" for "reviewer" and bash never would.
    # The object-root rule is checked on the RAW TEXT, and it has to be: `$raw | ConvertFrom-Json`
    # ENUMERATES an array root, so a single-element `[{...}]` arrives here already unwrapped into
    # the object it contains and no test on $cfg can see that it was an array (measured, not
    # assumed). PowerShell 5.1 has no -NoEnumerate to turn that off. The first non-whitespace
    # character of a JSON object root is `{`; a leading BOM is stripped with the whitespace.
    $rootIsObject = ($raw -replace '^[\uFEFF\s]+', '').StartsWith('{')
    $entry = $null
    if ($rootIsObject -and ($null -ne $cfg) -and -not ($cfg -is [array]) -and ($cfg -is [System.Management.Automation.PSCustomObject])) {
      # Every read below is a DIRECT ASSIGNMENT from the property, deliberately not a helper that
      # returns: a PowerShell `return` unrolls an array through the pipeline, so `"model": ["a"]`
      # would arrive as the string "a" and pass the validation this resolver exists to fail
      # (measured). Direct assignment preserves the value's real type.
      foreach ($p in $cfg.PSObject.Properties) {
        if ($p.Name -ceq $Role) { $entry = $p.Value; break }
      }
    }
    if ($null -ne $entry) {
      # `switch -CaseSensitive` IS the case-sensitive key lookup: PowerShell's `$entry.engine` is
      # case-insensitive and would resolve an "Engine" key the bash channel never sees.
      # `enabled` is read LEAN and FAIL-CLOSED: it never opens a third failure path. Only a real
      # boolean true enables QAL; absent, null, "true" as a string, 1, "Enabled" -> false.
      $enabledValue = $null
      foreach ($p in $entry.PSObject.Properties) {
        switch -CaseSensitive ($p.Name) {
          'engine'  { $engine = $p.Value }
          'model'   { $model  = $p.Value }
          'effort'  { $effort = $p.Value }
          'enabled' { $enabledValue = $p.Value }
        }
      }
      if ($Role -eq 'qal') { $enabled = ($enabledValue -is [bool]) -and $enabledValue }
    }
  } catch {
    $engine  = $null
    $model   = $null
    $effort  = $null
    $enabled = $null
  }

  # engine, model AND effort must each be actual, non-empty strings - a non-string type (number/bool/
  # object/array), null, or a whitespace value collapses into the single exit-2 path. `effort` is
  # validated LEAN (string + non-empty) with NO enum taxonomy: an out-of-range value (e.g. "wat") is
  # passed through to the engine, which rejects it VISIBLY at call time (documented natural fail-closed).
  if (-not ($engine -is [string]) -or [string]::IsNullOrWhiteSpace($engine) -or
      ($KnownEngines -notcontains $engine) -or
      -not ($model -is [string]) -or [string]::IsNullOrWhiteSpace($model) -or
      -not ($effort -is [string]) -or [string]::IsNullOrWhiteSpace($effort)) {
    Invoke-Fail ("role '$Role' does not resolve to a valid (engine, model, effort) triple in '$path' " +
      "(engine one of $($KnownEngines -join '|'); model and effort non-empty strings). Fix roles.json.")
  }

  $out = [pscustomobject]@{ role = $Role; engine = [string] $engine; model = [string] $model; effort = [string] $effort }
  if ($Role -eq 'qal') { $out | Add-Member -NotePropertyName enabled -NotePropertyValue ([bool] $enabled) }
}

if ($AsJson) {
  Write-Output ($out | ConvertTo-Json -Compress)
} else {
  Write-Output ("{0} {1} {2}" -f $out.engine, $out.model, $out.effort)
}
exit 0
