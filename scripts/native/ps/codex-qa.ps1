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

.PARAMETER Resume
  Resume QA's LAST recorded codex session instead of starting a cold one. Without -ResumeId the id
  comes from <scratchDir>\last-qa-session.txt - QA's OWN state file, so a QA run can never hijack a
  Reviewer resume and vice versa. Every run, cold or resumed, records the session id afterwards from
  codex's OWN session store - never from this run's output, which belongs to the caller and is
  passed through untouched.

.PARAMETER ResumeId
  An explicit codex session id to resume; it implies -Resume. The bash mirror spells the two as ONE
  flag with an OPTIONAL argument (`--resume [<id>]`), which PowerShell cannot express: a parameter
  that takes a value makes bare `-Resume` a parse error ("Missing an argument"). The switch plus an
  explicit id parameter is that same contract in this language - `-Resume`, `-Resume -ResumeId <id>`
  and `-ResumeId <id>` cover exactly the two bash forms.

.EXAMPLE
  scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -Prompt "QA ticket Y: read the E2E report/traces under ... against criteria ..."

.EXAMPLE
  Get-Content .\qa-brief.txt -Raw | scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -Resume
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0, ValueFromPipeline = $true)]
  [string] $Prompt,
  [Parameter(Mandatory)][string] $ProjectRoot,
  [switch] $Resume,
  [string] $ResumeId
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

# THE SESSION STATE FILE IS PER ROLE, AND THIS WRAPPER TOUCHES ONLY QA'S.
# last-qa-session.txt is written and read here and nowhere else, and the Reviewer wrapper's own file
# is not named anywhere in this one - not even in a comment, so the crossed-state question can be
# answered by a plain grep. One shared file would let a QA run overwrite the id a Reviewer correction
# round is about to resume - a wrong-context review that still returns a confident verdict.
#
# The scratch directory is the PROJECT's own: paths.scratchDir from its aiwf.config.json, with
# '.aiwf' when the config is missing, unreadable or carries no key. Same precedent as roles.json
# above: the project layer is located under <ProjectRoot>\.claude\aiwf-native. The read is
# best-effort - a project without the file still resumes, it just uses the factory path.
$scratchRel = '.aiwf'
$configPath = Join-Path $ProjectRoot '.claude\aiwf-native\aiwf.config.json'
if (Test-Path -LiteralPath $configPath) {
  try {
    $cfg = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    if ($cfg -and $cfg.paths -and -not [string]::IsNullOrWhiteSpace([string]$cfg.paths.scratchDir)) {
      $scratchRel = ([string]$cfg.paths.scratchDir).Trim()
    }
  } catch {
    $scratchRel = '.aiwf'
  }
}
# Made absolute HERE, before the resume branch below changes the location: a state file path that
# moved with the cwd would be written somewhere nobody reads it. [Path]::GetFullPath is deliberately
# not used - it resolves against the .NET working directory, which is not PowerShell's own location.
$SessionState = Join-Path (Join-Path $ProjectRoot $scratchRel) 'last-qa-session.txt'
if (-not [System.IO.Path]::IsPathRooted($SessionState)) {
  $SessionState = Join-Path (Get-Location).Path $SessionState
}

# -Resume with no explicit id means "the session THIS wrapper recorded last". A missing or empty
# state file is a refusal with the path in it, never a silent cold run: a resume that quietly became
# a cold pass would spend the operator's quota on the read-the-whole-evidence pass they were
# avoiding.
#
# AN EXPLICITLY EMPTY -ResumeId REFUSES, it does not fall through to the recorded session: that
# fall-through would resume a session the caller never named, which is the same defect class as an
# empty -Class degrading into the classless host in the review wrapper. The branch is therefore on
# whether the parameter was SUPPLIED, never on its value.
$IsResume = $Resume.IsPresent -or $PSBoundParameters.ContainsKey('ResumeId')
if ($PSBoundParameters.ContainsKey('ResumeId') -and [string]::IsNullOrWhiteSpace($ResumeId)) {
  Write-Error '-ResumeId was given an empty session id. Pass a real one, or use -Resume with no id to replay the recorded session.'
  exit 2
}
if ($IsResume -and [string]::IsNullOrWhiteSpace($ResumeId)) {
  if (-not (Test-Path -LiteralPath $SessionState)) {
    Write-Error "no recorded codex session to resume: $SessionState does not exist. Run one cold pass first, or pass -ResumeId <id>."
    exit 2
  }
  # THE FILE MUST BE WRITABLE TO BE TRUSTED. This wrapper clears it whenever a run cannot be
  # identified, so a state file it cannot write is one a previous run may have failed to clear - and
  # its content is then exactly the stale id a bare resume must never replay. The test is an actual
  # open for write, so an ACL is caught as well as the read-only attribute.
  $writable = $false
  try { $probe = [System.IO.File]::Open($SessionState, 'Open', 'Write'); $probe.Dispose(); $writable = $true } catch { $writable = $false }
  if (-not $writable) {
    Write-Error "the recorded session file is not writable, so a stale id could not have been cleared from it and its content cannot be trusted: $SessionState. Pass -ResumeId <id> explicitly, or make the file writable."
    exit 2
  }
  $ResumeId = ((Get-Content -LiteralPath $SessionState -Raw) -replace '\s', '')
  if ([string]::IsNullOrWhiteSpace($ResumeId)) {
    Write-Error "the recorded session file is empty: $SessionState. Run one cold pass first, or pass -ResumeId <id>."
    exit 2
  }
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

# THE RESUME FORM IS FROZEN, AND IT IS A DIFFERENT COMMAND, NOT THE COLD ONE WITH A FLAG ADDED.
# `codex exec resume` has no -C and no --sandbox at all (they do not exist on the subcommand), so
# the read-only posture is carried by the '-c','sandbox_mode=read-only' + '-c','approval_policy=never'
# pairs and the cwd is set to the project root just before the call. -m DOES exist on resume and is
# deliberately NOT used: one uniform -c posture carries all four values, and effort has no flag of
# its own anyway. The trailing '-' is part of the form - it is the atom that tells codex the prompt
# arrives on stdin. Data from the resolver (model, effort) stays one argv atom each.
$resumeArgs = @(
  'exec',
  'resume', $ResumeId,
  '-c', 'sandbox_mode=read-only',
  '-c', 'approval_policy=never',
  '-c', "model=$($role.model)",
  '-c', "model_reasoning_effort=$($role.effort)",
  '-'
)
if ($IsResume) {
  $codexArgs = $resumeArgs
  Set-Location -LiteralPath $ProjectRoot
}

if ([string]::IsNullOrWhiteSpace($Prompt)) {
  Write-Error 'No prompt provided. Pass -Prompt "<brief>" or pipe one: Get-Content brief.txt -Raw | scripts\native\ps\codex-qa.ps1 -ProjectRoot <path>'
  exit 2
}

# THE SESSION ID IS READ FROM CODEX'S OWN SESSION STORE, NOT FROM THIS RUN'S OUTPUT.
# The store is the one codex maintains itself - $CODEX_HOME (default ~/.codex), the same place
# `codex exec resume --last` resolves against - where every session is one rollout-*.jsonl file whose
# first line is a `session_meta` record carrying `session_id`.
#
# IDENTIFICATION IS POSITIVE, NEVER "the newest file": a candidate must have been written during THIS
# run (LastWriteTime at or after the marker taken below) AND contain THIS run's brief. Exactly one
# survivor is recorded; zero or several record NOTHING, so a second codex session in the same
# repository can never be mistaken for this one.
function Read-CodexRolloutHead {
  param([string] $Path, [int] $MaxChars)
  $reader = $null
  try {
    $reader = New-Object System.IO.StreamReader($Path)
    $buf = New-Object char[] $MaxChars
    $n = $reader.Read($buf, 0, $MaxChars)
    if ($n -le 0) { return '' }
    return [string]::new($buf, 0, $n)
  } catch {
    return ''
  } finally {
    if ($reader) { $reader.Dispose() }
  }
}

# Clearing is DELETE first, truncate second, and then VERIFIED by re-reading. A file whose write bit
# is gone is still removable while its directory is writable (Remove-Item -Force clears the read-only
# attribute), so the delete clears strictly more cases than a truncation - measured, not assumed:
# Set-Content on a read-only state file throws UnauthorizedAccessException and leaves the id in place,
# while Remove-Item -Force removes it. The truncation stays for the opposite case, a writable file in
# a directory that refuses deletion. If the id SURVIVES both, that is reported as an ERROR naming it -
# never as "cleared", because the next bare -Resume would otherwise replay exactly that stale id.
function Clear-CodexSessionState {
  param([string] $StateFile)
  try { Remove-Item -LiteralPath $StateFile -Force -ErrorAction SilentlyContinue } catch { }
  if (Test-Path -LiteralPath $StateFile) {
    try { Set-Content -LiteralPath $StateFile -Value '' -Encoding ASCII -ErrorAction Stop } catch { }
  }
  $left = ''
  if (Test-Path -LiteralPath $StateFile) {
    try { $left = ((Get-Content -LiteralPath $StateFile -Raw -ErrorAction Stop) -replace '\s', '') } catch { $left = '' }
  }
  if ($left) {
    Write-Error "this run could not be identified in the codex session store AND the stale session id ${left} could NOT be removed from ${StateFile}. Do not resume from it - pass -ResumeId <id> explicitly."
    return
  }
  Write-Warning "this run could not be identified in the codex session store; no session id is recorded now (${StateFile}), so the next -Resume will need an explicit id."
}

function Save-CodexSessionId {
  param([string] $StateFile, [bool] $Resumed, [string] $KnownId, [string] $Brief, [datetime] $Since)
  $sessionId = $null
  if ($Resumed) {
    # A RESUMED RUN ALREADY KNOWS ITS SESSION, so the store is not consulted at all. `codex exec
    # resume <id>` continues THAT conversation - branching into a new one is a different subcommand
    # (`codex exec fork`) this wrapper never uses - and the lookup could not answer anyway: a resumed
    # session's rollout has grown past the window the lookup reads, so the new brief sits beyond it
    # and the run reports itself unidentifiable. Recording the known id also repairs the state file
    # after an explicit -ResumeId <id>, which is the one case where it was not written by this pair.
    $sessionId = $KnownId
  } else {
    # The fingerprint: the longest run of printable ASCII in the head of the brief that JSON does not
    # escape (no quote, no backslash), so it appears VERBATIM inside the rollout JSON.
    $fingerprint = ''
    $briefHead = $Brief.Substring(0, [Math]::Min(400, $Brief.Length))
    foreach ($m in [regex]::Matches($briefHead, '[ -!#-\[\]-~]{24,}')) {
      if ($m.Value.Length -gt $fingerprint.Length) { $fingerprint = $m.Value }
    }
    if ($fingerprint.Length -gt 120) { $fingerprint = $fingerprint.Substring(0, 120) }

    # NO FINGERPRINT IS AN ANSWER, NOT A LICENCE. A brief too short or too exotic to leave a verbatim
    # trace identifies nothing, and accepting every fresh rollout instead would record an unrelated
    # session - the wrong conversation for the next bare resume. The scan is simply not run.
    $codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }
    $sessionsDir = Join-Path $codexHome 'sessions'
    $mine = @()
    if ($fingerprint -and (Test-Path -LiteralPath $sessionsDir)) {
      $fresh = @(Get-ChildItem -LiteralPath $sessionsDir -Recurse -File -Filter 'rollout-*.jsonl' -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -ge $Since })
      foreach ($f in $fresh) {
        $text = Read-CodexRolloutHead -Path $f.FullName -MaxChars 524288
        if ($text.Contains($fingerprint)) { $mine += , $text }
      }
    }
    if ($mine.Count -eq 1) {
      $m = [regex]::Match($mine[0], '"session_id"\s*:\s*"([^"]+)"')
      if ($m.Success) { $sessionId = $m.Groups[1].Value }
    }
  }

  if ($sessionId) {
    try {
      $stateDir = Split-Path -Parent $StateFile
      if ($stateDir -and -not (Test-Path -LiteralPath $stateDir)) {
        New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
      }
      Set-Content -LiteralPath $StateFile -Value $sessionId -Encoding ASCII -ErrorAction Stop
    } catch {
      Write-Warning "the codex session id could not be recorded in ${StateFile}: $($_.Exception.Message)"
    }
    return
  }
  Clear-CodexSessionState -StateFile $StateFile
}

# Taken BEFORE the invocation: it is the lower bound a rollout file must beat to be this run's.
# Two seconds of slack for a filesystem whose timestamp resolution is coarser than this clock.
$CaptureSince = (Get-Date).AddSeconds(-2)

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY -
# it never appears on the command line, so no caller text (even one starting with
# "--", e.g. --ignore-user-config or --dangerously-bypass-approvals-and-sandbox) can
# reach the option parser. A literal "--" separator does NOT work here: PowerShell's
# "Windows" native-argument mode strips "--" before it reaches codex, so an on-argv
# prompt cannot be protected. Routing through stdin bypasses option parsing entirely.

# THE INVOCATION IS THE PLAIN ONE: NEITHER OUTPUT STREAM IS TOUCHED.
# No pipeline element, no redirect, no Tee-Object and above all no ForEach-Object pass-through -
# PowerShell decodes a native command's stdout line by line and re-emits it, which cannot preserve
# bytes (an `A CRLF B` payload came back as `A CRLF B CRLF`), and any pipe also changes what codex
# itself decides to print, because it renders by whether the stream is a terminal. The session id is
# NOT in this output anyway: codex puts its configuration banner on STDERR and reserves STDOUT for
# the final message. It is looked up from codex's own session store after the run instead.
$Prompt | & codex @codexArgs
$code = $LASTEXITCODE

Save-CodexSessionId -StateFile $SessionState -Resumed $IsResume -KnownId $ResumeId -Brief $Prompt -Since $CaptureSince
exit $code
