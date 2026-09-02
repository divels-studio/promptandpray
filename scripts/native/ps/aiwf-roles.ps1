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

  THE AUDIT TABLE (-Class) - a REVIEWER-ONLY extension, and everything else is byte-identical
  Without -Class this script prints exactly what it always printed. With -Class plan|code|docs it
  resolves the EFFECTIVE row of that review class from `review.<class>` in roles.json - the row the
  renderer already resolved (own host, or the Reviewer's inherited whole) - and adds `passes`, the
  number of paid passes that class gets on the ticket's standing word. -Class is valid ONLY with
  -Role reviewer (any other role -> exit 2) and only for a known class (-> exit 2): a class silently
  ignored on the wrong role would route a pass to a host nobody chose.
  A roles.json that carries no `review.<class>` record was rendered before the table existed -> exit
  2 naming `/pnp:update`, never a guessed row. A MISSING file keeps the factory fallback
  (claude/opus/high) and adds the factory `passes` (plan 2, code 1, docs 1), exit 0: the fallback is
  a broken installation running read-only-on-Claude, not a choice.

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

.PARAMETER Class
  Optional, and only with -Role reviewer: the review class `plan`, `code` or `docs`. Resolves the
  audit table's effective row for that class instead of the Reviewer role's own triple.

.PARAMETER AsJson
  Emit compact JSON `{"role":..,"engine":..,"model":..,"effort":..}`. For `qal` the object also
  carries `"enabled":<bool>` - the operator gate from `roles.qal.enabled` (absent or non-boolean
  -> false, fail-closed). With -Class the object is
  `{"role":"reviewer","class":..,"engine":..,"model":..,"effort":..,"passes":<int>}`. The plain-text
  form is `<engine> <model> <effort>` for every role, and `<engine> <model> <effort> <passes>` -
  four tokens - with -Class; `enabled` is part of the MACHINE contract (-AsJson), which is what the
  wrappers and skills read.

.PARAMETER RolesPath
  Path to the PROJECT's `.claude/aiwf-native/roles.json`. REQUIRED - the plugin has no project
  context of its own, and a script-relative default would point at the payload instead of the
  project. The caller (skill Step 0 / a Codex wrapper's -ProjectRoot) resolves the project root
  and passes the path explicitly.

.EXAMPLE
  pwsh -NoProfile -File scripts/native/ps/aiwf-roles.ps1 -Role reviewer -RolesPath 'C:\repo\.claude\aiwf-native\roles.json' -AsJson

.EXAMPLE
  pwsh -NoProfile -File scripts/native/ps/aiwf-roles.ps1 -Role reviewer -Class docs -RolesPath 'C:\repo\.claude\aiwf-native\roles.json' -AsJson

.EXAMPLE
  pwsh -NoProfile -File scripts/native/ps/aiwf-roles.ps1 -Role reviewer -Class plan -RolesPath 'C:\repo\.claude\aiwf-native\roles.json'
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string] $Role,
  [string] $Class,
  [switch] $AsJson,
  [Parameter(Mandatory)][string] $RolesPath
)

Set-StrictMode -Version Latest

$KnownRoles    = @('reviewer', 'qa', 'qal')
$KnownEngines  = @('claude', 'codex')
$KnownClasses  = @('plan', 'code', 'docs')
# Factory fallback used ONLY when the config file is absent (never on a present-but-invalid file).
$Fallback      = @{ engine = 'claude'; model = 'opus'; effort = 'high' }
# The factory pass counts that travel with that fallback - the schema's own defaults.
$FactoryPasses = @{ plan = 2; code = 1; docs = 1 }
$StaleTable    = 'roles.json predates the audit table - run /pnp:update'

function Invoke-Fail([string] $Message) {
  [Console]::Error.WriteLine("aiwf-roles: $Message")
  exit 2
}

if ($KnownRoles -notcontains $Role) {
  Invoke-Fail "role '$Role' is not a valid role (expected one of: $($KnownRoles -join '|'))."
}

# -Class is judged on whether it was PASSED, not on whether it has content: `-Class ''` must fail
# rather than degrade into the classless form, which is a different contract with a different output.
$HasClass = $PSBoundParameters.ContainsKey('Class')
if ($HasClass) {
  if ($Role -ne 'reviewer') {
    Invoke-Fail "-Class is a reviewer-only flag (the audit table's rows are review classes), but -Role is '$Role'."
  }
  if ($KnownClasses -notcontains $Class) {
    Invoke-Fail "class '$Class' is not a review class (expected one of: $($KnownClasses -join '|'))."
  }
}

$path = $RolesPath

if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
  # (a) missing file -> silent factory fallback (claude/opus/high; qal disabled). With -Class the
  # factory pass count travels with it, so the fallback is a complete row rather than a partial one.
  if ($HasClass) {
    $out = [pscustomobject]@{
      role = $Role; class = $Class; engine = $Fallback.engine; model = $Fallback.model;
      effort = $Fallback.effort; passes = [int] $FactoryPasses[$Class]
    }
  } else {
    $out = [pscustomobject]@{ role = $Role; engine = $Fallback.engine; model = $Fallback.model; effort = $Fallback.effort }
    if ($Role -eq 'qal') { $out | Add-Member -NotePropertyName enabled -NotePropertyValue $false }
  }
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
  $passes  = $null
  # $null = "the file carries no such record" (a roles.json rendered before the audit table), which
  # is a DIFFERENT message from "the record is invalid" - one says run /pnp:update, the other says
  # fix the file.
  $classEntry = $null
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
      # The audit table lives beside the roles, under the same STRICT shape rules: `review` and the
      # class key are both matched case-sensitively, and both must be real objects.
      if ($HasClass) {
        $reviewNode = $null
        foreach ($p in $cfg.PSObject.Properties) {
          if ($p.Name -ceq 'review') { $reviewNode = $p.Value; break }
        }
        if (($null -ne $reviewNode) -and ($reviewNode -is [System.Management.Automation.PSCustomObject])) {
          foreach ($p in $reviewNode.PSObject.Properties) {
            if ($p.Name -ceq $Class) { $classEntry = $p.Value; break }
          }
        }
      }
    }
    if ($HasClass) {
      # In class mode the ROW is the whole answer: the renderer already resolved "own host or the
      # Reviewer's, inherited whole" into these four values, so nothing is composed here.
      if (($null -ne $classEntry) -and ($classEntry -is [System.Management.Automation.PSCustomObject])) {
        foreach ($p in $classEntry.PSObject.Properties) {
          switch -CaseSensitive ($p.Name) {
            'engine' { $engine = $p.Value }
            'model'  { $model  = $p.Value }
            'effort' { $effort = $p.Value }
            'passes' { $passes = $p.Value }
          }
        }
      }
    }
    elseif ($null -ne $entry) {
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
    $engine     = $null
    $model      = $null
    $effort     = $null
    $enabled    = $null
    $passes     = $null
    $classEntry = $null
  }

  # A roles.json with no record for this class was rendered before the audit table existed. That is
  # not an invalid file and not a row to guess at - it is an installation one /pnp:update behind.
  if ($HasClass -and (($null -eq $classEntry) -or -not ($classEntry -is [System.Management.Automation.PSCustomObject]))) {
    Invoke-Fail "$StaleTable (no review.$Class record in '$path')."
  }
  $ClassInvalid = "review class '$Class' does not resolve to a valid (engine, model, effort) triple in '$path' " +
    "(engine one of $($KnownEngines -join '|'); model and effort non-empty strings; passes an integer). Fix roles.json."

  # engine, model AND effort must each be actual, non-empty strings - a non-string type (number/bool/
  # object/array), null, or a whitespace value collapses into the single exit-2 path. `effort` is
  # validated LEAN (string + non-empty) with NO enum taxonomy: an out-of-range value (e.g. "wat") is
  # passed through to the engine, which rejects it VISIBLY at call time (documented natural fail-closed).
  if (-not ($engine -is [string]) -or [string]::IsNullOrWhiteSpace($engine) -or
      ($KnownEngines -notcontains $engine) -or
      -not ($model -is [string]) -or [string]::IsNullOrWhiteSpace($model) -or
      -not ($effort -is [string]) -or [string]::IsNullOrWhiteSpace($effort)) {
    if ($HasClass) { Invoke-Fail $ClassInvalid }
    Invoke-Fail ("role '$Role' does not resolve to a valid (engine, model, effort) triple in '$path' " +
      "(engine one of $($KnownEngines -join '|'); model and effort non-empty strings). Fix roles.json.")
  }

  if ($HasClass) {
    # `passes` is a COUNT and is validated as one: a string "2" would print as a number in the plain
    # form and read as a string in the JSON one, which is two different contracts from one file.
    if (-not ($passes -is [int]) -and -not ($passes -is [long])) { Invoke-Fail $ClassInvalid }
    $out = [pscustomobject]@{
      role = $Role; class = $Class; engine = [string] $engine; model = [string] $model;
      effort = [string] $effort; passes = [int] $passes
    }
  } else {
    $out = [pscustomobject]@{ role = $Role; engine = [string] $engine; model = [string] $model; effort = [string] $effort }
    if ($Role -eq 'qal') { $out | Add-Member -NotePropertyName enabled -NotePropertyValue ([bool] $enabled) }
  }
}

if ($AsJson) {
  Write-Output ($out | ConvertTo-Json -Compress)
} elseif ($HasClass) {
  Write-Output ("{0} {1} {2} {3}" -f $out.engine, $out.model, $out.effort, $out.passes)
} else {
  Write-Output ("{0} {1} {2}" -f $out.engine, $out.model, $out.effort)
}
exit 0
