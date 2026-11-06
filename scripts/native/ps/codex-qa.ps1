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

  OUTPUT CONTRACT - the review wrapper's, with every line prefixed `codex-qa:`. codex's stdout and
  stderr go to ONE log file of this run, outside the repository:
  <temp>\pnp-codex\<key>-qa-<yyyyMMdd-HHmmss>-<pid>.log, and codex writes its final message (`-o`)
  beside it, same stem, .last.txt. This wrapper's STDOUT is that final message, byte for byte, and
  nothing else. Its STDERR carries, in this order: the run line before codex starts; after the run the
  tokens line (the engine's last `tokens used` figure, never computed), the capacity line when the
  engine refused at capacity, the no-verdict line when codex left no final message, the log line, and
  the exit line. The exit code is codex's own; a refusal before the engine is exit 2.

.PARAMETER Prompt
  The QA brief (which artifacts to read, acceptance criteria, risk threshold, stop condition).
  Pass with -Prompt or pipe it (use -Raw for long briefs), or name its file with -BriefFile. It is
  delivered to Codex via STDIN only and never placed on the command line, so a brief cannot inject
  a CLI option. Errors if none is given.

.PARAMETER BriefFile
  The path of a file holding the QA brief (read as UTF-8) - the per-ticket brief file
  <scratchDir>\<key>-qa-brief.txt, keyed like the session-state file, so the launch command keeps one
  constant prefix an allow rule can match. A missing, unreadable, empty or whitespace-only file is
  exit 2 before any state read and any engine start; -BriefFile together with a non-empty brief on
  the pipeline (or -Prompt) is exit 2 (ambiguous). Without it the pipeline / -Prompt contract is
  unchanged. The session key below is read from the brief whichever way it arrived.

.PARAMETER ProjectRoot
  Absolute path to the project repository - the cwd Codex is given (`-C`). REQUIRED: the plugin
  payload has no project of its own, so the caller (the /pnp:qa skill, Step 0) resolves the project
  root and passes it in. The project's roles.json is read from
  <ProjectRoot>/.claude/aiwf-native/roles.json.

.PARAMETER Resume
  Resume QA's LAST recorded codex session instead of starting a cold one. Without -ResumeId the id
  comes from <scratchDir>\last-qa-session.<key>.txt - QA's OWN state file, per role AND per ticket,
  so a QA run can never hijack a Reviewer resume and vice versa, and two tickets never take each
  other's session. The key is read from the brief: its first `Ticket: <REF>` line, else the last
  segment of its first `PLAN: <folder>` line, else no key and the legacy unkeyed
  <scratchDir>\last-qa-session.txt; a value that is not 1-64 characters of A-Za-z0-9_.- starting
  with a letter or digit is a refusal (exit 2). Every run, cold or resumed, records the session id
  afterwards from codex's OWN session store - never from this run's output, which goes to the run
  log untouched.

.PARAMETER ResumeId
  An explicit codex session id to resume; it implies -Resume. The bash mirror spells the two as ONE
  flag with an OPTIONAL argument (`--resume [<id>]`), which PowerShell cannot express: a parameter
  that takes a value makes bare `-Resume` a parse error ("Missing an argument"). The switch plus an
  explicit id parameter is that same contract in this language - `-Resume`, `-Resume -ResumeId <id>`
  and `-ResumeId <id>` cover exactly the two bash forms.

.EXAMPLE
  scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -Prompt "QA ticket Y: read the E2E report/traces under ... against criteria ..."

.EXAMPLE
  scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -BriefFile .aiwf\<key>-qa-brief.txt

.EXAMPLE
  scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -Resume -BriefFile .aiwf\<key>-qa-brief.txt

.EXAMPLE
  Get-Content .aiwf\<key>-qa-brief.txt -Raw | scripts\native\ps\codex-qa.ps1 -ProjectRoot 'C:\repo' -Resume
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0, ValueFromPipeline = $true)]
  [string] $Prompt,
  [Parameter(Mandatory)][string] $ProjectRoot,
  [switch] $Resume,
  [string] $ResumeId,
  [string] $BriefFile
)

# THE BRIEF FROM A FILE (-BriefFile <path>). Read HERE, before the role resolution, any state read and
# any engine start, so every refusal below costs nothing. The branch is on whether the parameter was
# SUPPLIED, never on its value: an explicitly empty path is a missing file, not "no flag". A brief
# that also arrived on the pipeline (or through -Prompt) makes the call ambiguous and is refused
# rather than one of the two silently winning.
if ($PSBoundParameters.ContainsKey('BriefFile')) {
  if (-not [string]::IsNullOrWhiteSpace($Prompt)) {
    Write-Error "-BriefFile '$BriefFile' was given together with a brief on the pipeline (or -Prompt) - ambiguous; pass the brief one way only."
    exit 2
  }
  $briefPath = $BriefFile
  if (-not [string]::IsNullOrWhiteSpace($briefPath) -and -not [System.IO.Path]::IsPathRooted($briefPath)) {
    $briefPath = Join-Path (Get-Location).Path $briefPath
  }
  if ([string]::IsNullOrWhiteSpace($briefPath) -or -not (Test-Path -LiteralPath $briefPath -PathType Leaf)) {
    Write-Error "the brief file does not exist (or is not a file): '$BriefFile'. Write the brief there first."
    exit 2
  }
  $briefText = $null
  try {
    $briefText = [System.IO.File]::ReadAllText($briefPath, [System.Text.Encoding]::UTF8)
  } catch {
    Write-Error "the brief file could not be read: '$BriefFile' ($($_.Exception.Message))."
    exit 2
  }
  if ([string]::IsNullOrWhiteSpace($briefText)) {
    Write-Error "the brief file is empty or whitespace-only: '$BriefFile'. Write the brief there first."
    exit 2
  }
  $Prompt = $briefText
}

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

# THE SESSION STATE FILE IS PER ROLE AND PER TICKET, AND THIS WRAPPER TOUCHES ONLY QA'S.
# last-qa-session.<key>.txt (or the unkeyed last-qa-session.txt) is written and read here and
# nowhere else, and the Reviewer wrapper's own file is not named anywhere in this one - not even in a
# comment, so the crossed-state question can be answered by a plain grep. One shared file would let
# a QA run overwrite the id a Reviewer correction round is about to resume - a wrong-context review
# that still returns a confident verdict. The key is derived from the brief further down.
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

# THE STATE FILE IS ALSO PER TICKET. Two sessions on one working tree - two tickets' QA passes - must
# not resume each other's conversation, so the file name carries a KEY read from the brief itself,
# the same way on a cold run and on a bare -Resume: the FIRST line `Ticket: <REF>`, else the LAST
# segment of the FIRST line `PLAN: <folder>` (trailing separators stripped, split on both / and \),
# else NO key and the legacy unkeyed file. The key must be 1-64 characters of A-Za-z0-9_.- starting
# with a letter or digit; a value that fails the rule is a refusal (exit 2) naming the line, BEFORE
# any state read and any engine start - never a silent fall-back to the unkeyed file, which is
# exactly the collision the key removes.
# The brief is split into lines on LF, one trailing CR dropped per line, and every line is matched on
# its own (case-sensitive): the bash mirror reads the same key out of the same brief.
$SessionKey = ''
$keyLine = $null
$keyValue = ''
$briefLines = @()
if ($Prompt) {
  $briefLines = @($Prompt.Split([char]10) | ForEach-Object {
    if ($_.Length -gt 0 -and $_[$_.Length - 1] -eq [char]13) { $_.Substring(0, $_.Length - 1) } else { $_ }
  })
}
foreach ($briefLine in $briefLines) {
  $m = [regex]::Match($briefLine, '^Ticket:[ \t]*(.*?)[ \t]*$')
  if ($m.Success) { $keyLine = $briefLine; $keyValue = $m.Groups[1].Value; break }
}
if ($null -eq $keyLine) {
  foreach ($briefLine in $briefLines) {
    $m = [regex]::Match($briefLine, '^PLAN:[ \t]*(.*?)[ \t]*$')
    if ($m.Success) {
      $keyLine = $briefLine
      $keyValue = @(($m.Groups[1].Value -replace '[\\/]+$', '') -split '[\\/]')[-1]
      break
    }
  }
}
if ($null -ne $keyLine) {
  if (-not [regex]::IsMatch($keyValue, '^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$')) {
    Write-Error "the brief's line '$keyLine' does not give a usable session key: a Ticket: value - or the last segment of a PLAN: folder - must be 1-64 characters of A-Za-z0-9_.- starting with a letter or digit. Fix the line; this wrapper never falls back to another state file."
    exit 2
  }
  $SessionKey = $keyValue
}

# Made absolute HERE, before the resume branch below changes the location: a state file path that
# moved with the cwd would be written somewhere nobody reads it. [Path]::GetFullPath is deliberately
# not used - it resolves against the .NET working directory, which is not PowerShell's own location.
$SessionStateName = 'last-qa-session.txt'
if ($SessionKey) { $SessionStateName = "last-qa-session.$SessionKey.txt" }
$SessionState = Join-Path (Join-Path $ProjectRoot $scratchRel) $SessionStateName
if (-not [System.IO.Path]::IsPathRooted($SessionState)) {
  $SessionState = Join-Path (Get-Location).Path $SessionState
}

# THE RUN'S OWN FILES, OUTSIDE THE REPOSITORY: the log that receives codex's stdout and stderr, and
# the final message codex writes itself (`-o`) beside it with the same stem. The name is
# <key>-qa-<yyyyMMdd-HHmmss>-<pid> under <temp>\pnp-codex (a brief with no key has no key segment,
# as its state file has none). The files belong to the run that created them: the timestamp plus
# this process id make the name unique, and the log is created exclusively, so two runs never share
# one - no lock. The session-state file is NOT touched by any of this: two runs with one key at once
# remain what they always were, the one-executing-session-per-tree invariant the operator holds.
# <temp> is $env:TEMP; a host without one (pwsh on POSIX) uses the .NET temp path.
$tempRoot = if ($env:TEMP) { $env:TEMP } else { [System.IO.Path]::GetTempPath() }
$RunDir = Join-Path $tempRoot 'pnp-codex'
$RunStem = "qa-$((Get-Date).ToString('yyyyMMdd-HHmmss'))-$PID"
if ($SessionKey) { $RunStem = "$SessionKey-$RunStem" }
$LogFile = Join-Path $RunDir "$RunStem.log"
$LastFile = Join-Path $RunDir "$RunStem.last.txt"

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
# `-o <file>` makes codex write its final message to this run's own file - the verdict this wrapper
# prints on stdout; `codex exec resume` accepts the same flag (measured, codex-cli 0.156.1).
$codexArgs = @(
  'exec',
  '-C', $ProjectRoot,
  '-m', $role.model,
  '--sandbox', 'read-only',
  '-c', 'approval_policy=never',
  '-c', "model_reasoning_effort=$($role.effort)",
  '-o', $LastFile
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
  '-o', $LastFile,
  '-'
)
if ($IsResume) {
  $codexArgs = $resumeArgs
  Set-Location -LiteralPath $ProjectRoot
}

if ([string]::IsNullOrWhiteSpace($Prompt)) {
  Write-Error 'No prompt provided. Pass -BriefFile <path>, -Prompt "<brief>", or pipe one: Get-Content <key>-qa-brief.txt -Raw | scripts\native\ps\codex-qa.ps1 -ProjectRoot <path>'
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
  # On STDERR, never Write-Warning: the PowerShell host prints warnings on stdout, and this wrapper's
  # stdout is the final message and nothing else.
  [Console]::Error.WriteLine("WARNING: this run could not be identified in the codex session store; no session id is recorded now (${StateFile}), so the next -Resume will need an explicit id.")
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
      $script:RecordedSessionId = $sessionId
    } catch {
      [Console]::Error.WriteLine("WARNING: the codex session id could not be recorded in ${StateFile}: $($_.Exception.Message)")
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

# CODEX'S TWO STREAMS GO TO THE RUN LOG, AND NOTHING STANDS BETWEEN CODEX AND THAT LOG.
# PowerShell cannot be the one that writes it. Measured (plan GATES, D-12): a 447-byte UTF-8 emitter
# run under Windows PowerShell 5.1 with all its streams redirected to a file produced a 1796-byte log -
# UTF-16LE with a byte order mark, the UTF-8 decoded through the console code page, every LF turned
# into CRLF, and the first stderr line wrapped in a NativeCommandError record. A pipeline element is no
# better: PowerShell decodes a native command's output line by line and re-emits it. So codex is run
# by scripts/native/codex-capture.mjs, a node child process that hands codex ONE file handle for both
# streams at the operating-system level, resolves codex without a shell and keeps the argv an array;
# the prompt still arrives on stdin. Codex writes to a file, not a terminal, as it does under the bash
# channel's `> "$log" 2>&1` - the capture mechanism is the one documented difference between the two
# channels. The session id is NOT taken from this output: it is looked up from codex's own session
# store after the run. The helper's own `--` only separates its options from codex's argv (measured:
# both PowerShell 5.1 and 7 pass it to node); were it ever stripped, the helper refuses with exit 2
# rather than read codex's first argument as its own.
#
# THIS WRAPPER'S STDOUT IS THE FINAL MESSAGE AND NOTHING ELSE: the bytes codex wrote through `-o`,
# printed by the same helper as a native process, so a caller that redirects this wrapper's stdout
# receives them the way it received codex's own stdout before. No Write-Output, no Write-Host and no
# Write-Warning anywhere in this file - the host prints those on stdout. When codex left no final
# message, stdout stays EMPTY and stderr says so.
#
# THE STDERR LINES are this wrapper's own, written beside the run and never through it, in a fixed
# order: the run line before codex starts (cold or resumed, the role, the model and effort the
# resolver returned); after the run the tokens line, the capacity line when it applies, the no-verdict
# line when there is no final message, the log line, and the exit line (the exit code, and the session
# id with the flag that resumes it). They are information, never a decision: the exit code below is
# codex's own.
# THE TOKENS LINE is the engine's own figure, never computed. Measured on codex-cli 0.156.1: codex
# prints `tokens used` on stderr as two lines - the words alone, then the figure with comma grouping
# (`3,506`) - and on a resumed session the figure is the session's running total. The LAST such pair
# in the log is printed as the engine wrote it; a log without one says so instead.
# THE CAPACITY LINE: a run that exited non-zero with one of $CapacityTexts in its log was refused by
# the engine at capacity (the recorded real text is "Selected model is at capacity"; not reproduced
# at will, so the text is the recorded one). It names the session to resume when one was recorded. A
# run that exited 0 is never called a refusal, whatever its log quotes.
# EACH LINE IS ONE PHYSICAL LINE. Every dynamic field (run mode, resume id, model, effort, session id,
# tokens figure, log path) passes through Sanitize-HeaderField, which turns every control character -
# CR, LF and the rest of 0x00-0x1F, and 0x7F - into one space each: the schema admits any non-empty
# string for a model or an effort, and a value carrying a line break could otherwise split a line or
# print a fake exit line before codex has even started.
function Sanitize-HeaderField {
  param([string] $Value)
  return ([string]$Value -replace '[\x00-\x1F\x7F]', ' ')
}
$CapacityTexts = @('at capacity')
$CaptureHelper = Join-Path $PSScriptRoot '..\codex-capture.mjs'
try {
  if (-not (Test-Path -LiteralPath $RunDir)) { New-Item -ItemType Directory -Path $RunDir -Force | Out-Null }
} catch {
  Write-Error "the run log directory could not be created: $RunDir ($($_.Exception.Message))"
  exit 2
}
if ((Test-Path -LiteralPath $LogFile) -or (Test-Path -LiteralPath $LastFile)) {
  Write-Error "this run's log already exists: $LogFile - a log is never shared by two runs; start the run again."
  exit 2
}
$runMode = if ($IsResume) { "resumed $ResumeId" } else { 'cold' }
[Console]::Error.WriteLine("codex-qa: run $(Sanitize-HeaderField $runMode), role qa, model $(Sanitize-HeaderField $role.model), effort $(Sanitize-HeaderField $role.effort)")
$script:RecordedSessionId = $null
$Prompt | & node $CaptureHelper --log $LogFile -- @codexArgs
$code = $LASTEXITCODE

Save-CodexSessionId -StateFile $SessionState -Resumed $IsResume -KnownId $ResumeId -Brief $Prompt -Since $CaptureSince
$hasVerdict = Test-Path -LiteralPath $LastFile -PathType Leaf
if ($hasVerdict) {
  & node $CaptureHelper --print $LastFile
}
$logText = ''
if (Test-Path -LiteralPath $LogFile -PathType Leaf) {
  try { $logText = [System.IO.File]::ReadAllText($LogFile, (New-Object System.Text.UTF8Encoding($false))) } catch { $logText = '' }
}
$tokensFigure = $null
$previousLine = $null
foreach ($rawLine in $logText.Split([char]10)) {
  $logLine = if ($rawLine.Length -gt 0 -and $rawLine[$rawLine.Length - 1] -eq [char]13) { $rawLine.Substring(0, $rawLine.Length - 1) } else { $rawLine }
  if ($previousLine -ceq 'tokens used' -and $logLine -cmatch '^[0-9][0-9,]*$') { $tokensFigure = $logLine }
  $previousLine = $logLine
}
$atCapacity = $false
if ($code -ne 0) {
  foreach ($capacityText in $CapacityTexts) { if ($logText.Contains($capacityText)) { $atCapacity = $true } }
}
$sid = if ($script:RecordedSessionId) { Sanitize-HeaderField $script:RecordedSessionId } else { $null }
$logShown = Sanitize-HeaderField $LogFile
if ($null -eq $tokensFigure) {
  [Console]::Error.WriteLine('codex-qa: tokens used: not printed by the engine')
} elseif ($IsResume) {
  [Console]::Error.WriteLine("codex-qa: tokens used $(Sanitize-HeaderField $tokensFigure) (cumulative over session $(Sanitize-HeaderField $ResumeId))")
} else {
  [Console]::Error.WriteLine("codex-qa: tokens used $(Sanitize-HeaderField $tokensFigure)")
}
if ($atCapacity) {
  if ($sid) {
    [Console]::Error.WriteLine("codex-qa: engine refused: capacity, session $sid resumable")
  } else {
    [Console]::Error.WriteLine('codex-qa: engine refused: capacity, session not identified')
  }
}
if (-not $hasVerdict) {
  [Console]::Error.WriteLine("codex-qa: no verdict - the engine wrote no final message; log $logShown")
}
[Console]::Error.WriteLine("codex-qa: log $logShown")
if ($sid) {
  [Console]::Error.WriteLine("codex-qa: exit $code, session $sid (resumable: -ResumeId $sid)")
} else {
  [Console]::Error.WriteLine("codex-qa: exit $code, session not identified - the next resume needs an explicit id")
}
exit $code
