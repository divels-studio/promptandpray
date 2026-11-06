#!/usr/bin/env bash
#
# Invoke QA on the Codex engine (read-only artifact judge).
# Bash mirror of scripts/native/ps/codex-qa.ps1 - same locked flags, same stdin / brief-file contract.
#
# QA is the read-only "judge over evidence" surface. It does NOT drive a browser itself - a
# Codex-launched browser cannot run under any restrictive sandbox (docs/QA_BROWSER_INVESTIGATION.md).
# The runtime/UI evidence is produced OUTSIDE Codex instead:
#   - Writer authors end-to-end .spec files from the acceptance criteria;
#   - the ORCHESTRATOR (main session) runs the project's configured E2E command (the browser lives
#     in the test runner, outside Codex's sandbox);
#   - QA reads the resulting artifacts (JSON report, screenshots, traces) under
#     --sandbox read-only and returns a verdict against the acceptance criteria.
#
# Thin wrapper over the proven command (prompt delivered via stdin - see body):
#     "<prompt>" | codex exec -C <projectRoot> -m <model> --sandbox read-only -c approval_policy=never
#
# QA engages only for observable runtime/UI behavior. It is read-only by OS sandbox, NEVER starts a
# dev server, NEVER drives a live browser, and NEVER passes --ignore-user-config. For LIVE
# exploratory browsing there is a separate, operator-gated surface - QAL
# (scripts/native/sh/codex-qal.sh) - which is NOT read-only. See docs/CODEX_REVIEW_QA_RECIPE.md.
#
# THE BRIEF ARRIVES ON STDIN OR FROM A FILE, NEVER ON ARGV. There is deliberately no prompt flag:
# text that never reaches the option parser cannot inject a CLI option. An empty or whitespace-only
# brief is refused (exit 2) rather than sent.
#
# --brief-file <path> is OPTIONAL: the brief is read from that file instead of stdin - the per-ticket
# brief file <scratchDir>/<key>-qa-brief.txt, keyed like the session-state file, so the launch command
# keeps one constant prefix an allow rule can match. A missing, unreadable, empty or whitespace-only
# file is exit 2 before any state read and any engine start; --brief-file together with a non-empty
# brief on stdin is exit 2 (ambiguous). For that check stdin is read ONCE, bounded to 64 KiB and 2
# seconds, so an open stdin never hangs the run; a stdin that fills the bound is refused unread. Without the flag the brief is read from stdin exactly as before. The
# session key below is read from the brief whichever way it arrived.
#
# --project-root <path> is REQUIRED: the plugin payload has no project of its own, so the caller
# (the /pnp:qa skill, Step 0) resolves the project root and passes it in. It is the cwd Codex is
# given (-C), and the project's roles.json is read from <projectRoot>/.claude/aiwf-native/roles.json.
#
# --resume [<id>] is OPTIONAL and takes an OPTIONAL argument: without one it replays the session id
# THIS wrapper recorded last (<scratchDir>/last-qa-session.<key>.txt, QA's own file per role and per
# ticket - a QA run can never hijack a Reviewer resume and vice versa, and two tickets never take each
# other's session); with one it resumes that id verbatim. The key is read from the brief: its first
# `Ticket: <REF>` line, else the last segment of its first `PLAN: <folder>` line, else no key and the
# legacy unkeyed <scratchDir>/last-qa-session.txt; a value that is not 1-64 characters of
# A-Za-z0-9_.- starting with a letter or digit is a refusal (exit 2). --resume-id <id>
# is the same thing spelled with a mandatory value, and it implies --resume. Every run - cold or
# resumed - records the session id afterwards from codex's OWN session store (never from this run's
# output, which goes to the run log), so the NEXT pass can be a resume instead of a second cold
# read of the whole evidence set.
#
# OUTPUT CONTRACT - the review wrapper's, with every line prefixed `codex-qa:`. codex's stdout and
# stderr go to ONE log file of this run, outside the repository:
# ${TMPDIR:-/tmp}/pnp-codex/<key>-qa-<YYYYmmdd-HHMMSS>-<pid>.log, and codex writes its final message
# (-o) beside it, same stem, .last.txt. This wrapper's STDOUT is that final message, byte for byte, and
# nothing else. Its STDERR carries, in this order: the run line before codex starts; after the run the
# tokens line (the engine's last `tokens used` figure, never computed), the capacity line when the
# engine refused at capacity, the no-verdict line when codex left no final message, the log line, and
# the exit line. The exit code is codex's own; a refusal before the engine is exit 2.
#
# EXAMPLE:
#   bash scripts/native/sh/codex-qa.sh --project-root /path/to/repo --brief-file .aiwf/<key>-qa-brief.txt
#   bash scripts/native/sh/codex-qa.sh --project-root /path/to/repo --resume --brief-file .aiwf/<key>-qa-brief.txt
#   cat .aiwf/<key>-qa-brief.txt | bash scripts/native/sh/codex-qa.sh --project-root /path/to/repo --resume
set -euo pipefail

PROJECT_ROOT=''
RESUME=0
RESUME_ID=''
BRIEF_FILE=''
HAS_BRIEF_FILE=0

fail() {
  printf 'codex-qa: %s\n' "$1" >&2
  exit 2
}

# True when the text carries at least one non-whitespace character.
has_text() {
  case "$1" in
    *[![:space:]]*) return 0 ;;
  esac
  return 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    --project-root)
      [ $# -ge 2 ] || fail '--project-root needs a value.'
      PROJECT_ROOT="$2"; shift 2 ;;
    --resume)
      # THE ARGUMENT IS OPTIONAL. A following token is taken as the session id only when it exists
      # and does not start with `-`; anything starting with `-` is the NEXT flag, never an id, so
      # `--resume --project-root X` cannot silently swallow a flag as a session id.
      RESUME=1
      if [ $# -ge 2 ] && [ -n "$2" ] && [ "${2#-}" = "$2" ]; then
        RESUME_ID="$2"; shift 2
      else
        shift
      fi ;;
    --resume-id)
      [ $# -ge 2 ] || fail '--resume-id needs a value (the codex session id).'
      # AN EXPLICITLY EMPTY ID REFUSES, it does not fall through to the recorded session: that
      # fall-through would resume a session the caller never named, which is the same defect class as
      # an empty --class degrading into the classless host in the review wrapper.
      [ -n "$2" ] || fail '--resume-id was given an empty session id. Pass a real one, or use --resume with no argument to replay the recorded session.'
      RESUME=1; RESUME_ID="$2"; shift 2 ;;
    --brief-file)
      [ $# -ge 2 ] || fail '--brief-file needs a value (the path of the brief file).'
      BRIEF_FILE="$2"; HAS_BRIEF_FILE=1; shift 2 ;;
    *)
      fail "unknown argument '$1' - the brief is delivered on STDIN or through --brief-file <path>, never on argv." ;;
  esac
done

[ -n "$PROJECT_ROOT" ] || fail 'no --project-root <path>. The plugin payload has no project of its own: pass the resolved project root.'

# THE BRIEF FROM A FILE (--brief-file <path>). Read HERE, before the role resolution, any state read
# and any engine start, so every refusal below costs nothing. The branch is on whether the flag was
# SUPPLIED, never on its value: an explicitly empty path is a missing file, not "no flag". A brief that
# also arrived on stdin makes the call ambiguous and is refused rather than one of the two silently
# winning - and stdin is read with a BOUND, never to its end: `[ -t 0 ]` is a terminal (nothing
# piped); otherwise ONE read takes at most 64 KiB within at most 2 seconds, so a stdin that is an
# open pipe - silent, or one that delivered a byte and stays open - cannot hang the run. The read's
# status is captured, not tested: 0 (the 64 KiB were read), 1 (end of input) and >128 (the time
# bound hit; the bytes read so far stay in the variable) are all decided by the bytes alone. Two
# cases are ambiguous: a stdin that fills the bound is refused unread (the cap reached means stdin
# carries data beside the flag, whatever the 64 KiB were), and a shorter read that carries text. A
# leading UTF-8 byte-order mark of the file is dropped, as the PowerShell mirror's UTF-8 read drops it.
if [ "$HAS_BRIEF_FILE" -eq 1 ]; then
  if [ ! -t 0 ]; then
    STDIN_BRIEF=''
    STDIN_STATUS=0
    IFS= read -r -d '' -t 2 -N 65536 STDIN_BRIEF || STDIN_STATUS=$?
    if [ "${#STDIN_BRIEF}" -ge 65536 ]; then
      fail "--brief-file '$BRIEF_FILE' was given while stdin filled the 64 KiB bound - ambiguous (refused unread); pass the brief one way only."
    fi
    if has_text "$STDIN_BRIEF"; then
      fail "--brief-file '$BRIEF_FILE' was given together with a brief on stdin - ambiguous; pass the brief one way only (stdin read status $STDIN_STATUS)."
    fi
  fi
  if [ -z "$BRIEF_FILE" ] || [ ! -f "$BRIEF_FILE" ]; then
    fail "the brief file does not exist (or is not a file): '$BRIEF_FILE'. Write the brief there first."
  fi
  PROMPT="$(cat -- "$BRIEF_FILE" 2>/dev/null)" || fail "the brief file could not be read: '$BRIEF_FILE'."
  PROMPT="${PROMPT#$'\xEF\xBB\xBF'}"
  has_text "$PROMPT" || fail "the brief file is empty or whitespace-only: '$BRIEF_FILE'. Write the brief there first."
fi

# Engine-neutral role resolution. This Codex wrapper only runs when the `qa` role is assigned to the
# `codex` engine in the project's .claude/aiwf-native/roles.json. The MODEL comes from the resolver
# (one argv atom); if the role is reassigned to Claude, the resolved engine != codex and this
# wrapper exits 2 so /pnp:qa routes to the Claude Agent branch instead. The read-only guarantee is
# untouched: --sandbox / -C / -c approval_policy=never remain LITERALS.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLES_PATH="$PROJECT_ROOT/.claude/aiwf-native/roles.json"

snapshot=''
snapshot="$(bash "$HERE/aiwf-roles.sh" --role qa --roles-path "$ROLES_PATH" --as-json)" \
  || fail "aiwf role resolve failed for 'qa' (see resolver stderr above)."

# The snapshot is JSON, so it is read by a real parser (same reasoning as the resolver: node is a
# prerequisite of this plugin, jq is not, and a grep/sed reading would coerce shapes silently).
#
# The fields come back NUL-DELIMITED, and are read through a process substitution rather than a
# variable. Both halves of that are load-bearing: the config schema admits ANY non-empty string for
# model/effort, so a value containing a NEWLINE (or a space) would shift or truncate a
# line-delimited transport and silently change the argv this wrapper hands the engine - the exact
# class of defect the locked-flag contract exists to prevent. NUL is the one byte that cannot
# appear in an argv atom at all, and a shell variable cannot carry it, hence the redirect.
FIELDS_JS='
const s = JSON.parse(process.env.PNP_SNAPSHOT);
process.stdout.write([s.engine, s.model, s.effort].join("\u0000") + "\u0000");
'
if ! {
  IFS= read -r -d "" ROLE_ENGINE &&
  IFS= read -r -d "" ROLE_MODEL &&
  IFS= read -r -d "" ROLE_EFFORT
} < <(PNP_SNAPSHOT="$snapshot" node -e "$FIELDS_JS"); then
  fail "the resolver snapshot could not be read (node); the resolver printed: $snapshot"
fi

if [ "$ROLE_ENGINE" != 'codex' ]; then
  fail "role 'qa' resolves to engine '$ROLE_ENGINE', not 'codex'; this Codex wrapper does not run - route through the Claude Agent branch of /pnp:qa."
fi

# THE SESSION STATE FILE IS PER ROLE AND PER TICKET, AND THIS WRAPPER TOUCHES ONLY QA'S.
# `last-qa-session.<key>.txt` (or the unkeyed `last-qa-session.txt`) is written and read here and
# nowhere else, and the Reviewer wrapper's own file is not named anywhere in this one - not even in a
# comment, so the crossed-state question can be answered by a plain grep. One shared file would let
# a QA run overwrite the id a Reviewer correction round is about to resume - a wrong-context review
# that still returns a confident verdict. The key is derived from the brief further down.
#
# The scratch directory is the PROJECT's own: `paths.scratchDir` from its aiwf.config.json, with
# `.aiwf` when the config is missing, unreadable or carries no key. The config is read by a real
# JSON parser for the same reason the resolver snapshot is (node is a prerequisite of this plugin,
# jq is not, and a grep/sed reading would coerce shapes silently), and the whole read is best-effort:
# a project without the file still resumes, it just uses the factory path.
SCRATCH_JS='
const fs = require("fs");
try {
  const cfg = JSON.parse(fs.readFileSync(process.env.PNP_CONFIG, "utf8"));
  const dir = cfg && cfg.paths && cfg.paths.scratchDir;
  if (typeof dir === "string" && dir.trim()) process.stdout.write(dir.trim());
} catch (e) { /* no config, no key, unreadable JSON: the caller falls back to .aiwf */ }
'
SCRATCH_REL="$(PNP_CONFIG="$PROJECT_ROOT/.claude/aiwf-native/aiwf.config.json" node -e "$SCRATCH_JS" 2>/dev/null || true)"
[ -n "$SCRATCH_REL" ] || SCRATCH_REL='.aiwf'
# Resolved to an ABSOLUTE path here, before the resume branch below changes the cwd: a state file
# path that moved with the cwd would be written somewhere nobody reads it.
PROJECT_ROOT_ABS="$PROJECT_ROOT"
if [ -d "$PROJECT_ROOT" ]; then PROJECT_ROOT_ABS="$(cd "$PROJECT_ROOT" && pwd)"; fi

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY - it never appears
# on the command line, so no caller text (even one starting with "--", e.g. --ignore-user-config or
# --dangerously-bypass-approvals-and-sandbox) can reach the option parser. The brief is read HERE,
# before the state file is named, because the session key below comes out of it; it is refused
# further down if EMPTY, before a paid pass is spent, and otherwise handed on unchanged. With
# --brief-file it was read from that file above instead, and stdin is not read again.
if [ "$HAS_BRIEF_FILE" -eq 0 ]; then
  PROMPT="$(cat)"
fi

# THE STATE FILE IS ALSO PER TICKET. Two sessions on one working tree - two tickets' QA passes - must
# not resume each other's conversation, so the file name carries a KEY read from the brief itself,
# the same way on a cold run and on a bare --resume: the FIRST line `Ticket: <REF>`, else the LAST
# segment of the FIRST line `PLAN: <folder>` (trailing separators stripped, split on both / and \),
# else NO key and the legacy unkeyed file. The key must be 1-64 characters of A-Za-z0-9_.- starting
# with a letter or digit; a value that fails the rule is a refusal (exit 2) naming the line, BEFORE
# any state read and any engine start - never a silent fall-back to the unkeyed file, which is
# exactly the collision the key removes.
# The derivation is a node snippet for the same reason the snapshot is read by one: the PowerShell
# mirror splits the brief into lines on LF, drops one trailing CR per line and matches every line on
# its own, and this does the same thing with the same expressions, so both channels read one key out
# of one brief. The brief travels on node's STDIN (no size limit), and a derivation that could not
# run at all is a refusal too - a node that never started must not read as "no key".
KEY_JS='
const fs = require("fs");
const key = (brief) => {
  const lines = brief.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
  let line = null;
  let value = "";
  for (const l of lines) { const m = /^Ticket:[ \t]*(.*?)[ \t]*$/s.exec(l); if (m) { line = l; value = m[1]; break; } }
  if (line === null) for (const l of lines) { const m = /^PLAN:[ \t]*(.*?)[ \t]*$/s.exec(l); if (m) { line = l; value = m[1].replace(/[\\/]+$/, "").split(/[\\/]/).pop(); break; } }
  if (line === null) return [0, ""];
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(value)) return [3, line];
  return [0, value];
};
const [code, text] = key(fs.readFileSync(0, "utf8"));
process.stdout.write(text);
process.exitCode = code;
'
KEY_STATUS=0
SESSION_KEY="$(printf '%s' "$PROMPT" | node -e "$KEY_JS")" || KEY_STATUS=$?
if [ "$KEY_STATUS" -eq 3 ]; then
  fail "the brief's line '$SESSION_KEY' does not give a usable session key: a Ticket: value - or the last segment of a PLAN: folder - must be 1-64 characters of A-Za-z0-9_.- starting with a letter or digit. Fix the line; this wrapper never falls back to another state file."
elif [ "$KEY_STATUS" -ne 0 ]; then
  fail "the session key could not be read from the brief (node exited $KEY_STATUS); refusing rather than falling back to another state file."
fi
if [ -n "$SESSION_KEY" ]; then
  SESSION_STATE="$PROJECT_ROOT_ABS/$SCRATCH_REL/last-qa-session.$SESSION_KEY.txt"
else
  SESSION_STATE="$PROJECT_ROOT_ABS/$SCRATCH_REL/last-qa-session.txt"
fi

# THE RUN'S OWN FILES, OUTSIDE THE REPOSITORY: the log that receives codex's stdout and stderr, and
# the final message codex writes itself (-o) beside it with the same stem. The name is
# <key>-qa-<YYYYmmdd-HHMMSS>-<pid> under ${TMPDIR:-/tmp}/pnp-codex (a brief with no key has no key
# segment, as its state file has none). The files belong to the run that created them: the timestamp
# plus this process id make the name unique, and an existing log is a refusal, so two runs never
# share one - no lock. The session-state file is NOT touched by any of this: two runs with one key at
# once remain what they always were, the one-executing-session-per-tree invariant the operator holds.
RUN_DIR="${TMPDIR:-/tmp}/pnp-codex"
RUN_STEM="qa-$(date +%Y%m%d-%H%M%S)-$$"
if [ -n "$SESSION_KEY" ]; then RUN_STEM="$SESSION_KEY-$RUN_STEM"; fi
LOG_FILE="$RUN_DIR/$RUN_STEM.log"
LAST_FILE="$RUN_DIR/$RUN_STEM.last.txt"

# --resume with no id means "the session THIS wrapper recorded last". A missing or empty state file
# is a refusal with the path in it, never a silent cold run: a resume that quietly became a cold
# pass would spend the operator's quota on the read-the-whole-evidence pass they were avoiding.
if [ "$RESUME" -eq 1 ] && [ -z "$RESUME_ID" ]; then
  [ -f "$SESSION_STATE" ] || fail "no recorded codex session to resume: $SESSION_STATE does not exist. Run one cold pass first, or pass --resume <id>."
  # THE FILE MUST BE WRITABLE TO BE TRUSTED. This wrapper clears it whenever a run cannot be
  # identified, so a state file it cannot write is one a previous run may have failed to clear - and
  # its content is then exactly the stale id a bare resume must never replay. Refuse, and say how to
  # get past it deliberately.
  [ -w "$SESSION_STATE" ] || fail "the recorded session file is not writable, so a stale id could not have been cleared from it and its content cannot be trusted: $SESSION_STATE. Pass --resume <id> explicitly, or make the file writable."
  RESUME_ID="$(tr -d ' \t\r\n' < "$SESSION_STATE")"
  [ -n "$RESUME_ID" ] || fail "the recorded session file is empty: $SESSION_STATE. Run one cold pass first, or pass --resume <id>."
fi

# Locked flags - the proven read-only command. QA is an artifact judge (reads test-runner output);
# it does NOT drive a browser (a Codex-launched browser cannot run under read-only).
# Do NOT add --ignore-user-config - keep the CWD/model/sandbox/user-config posture as proven.
# Do not change --sandbox without re-proving it. Data from the resolver: the -m model and the
# model_reasoning_effort value - each one argv atom; sandbox/approval stay literal, and -C is the
# caller-supplied project root.
# `-c approval_policy=never` is a deliberate hardening on top of the proven posture: it pins the
# approval mechanism explicitly (does NOT inherit it from ~/.codex/config.toml), so read-only cannot
# be paired with an escalating approval policy.
# `-o <file>` makes codex write its final message to this run's own file - the verdict this wrapper
# prints on stdout; `codex exec resume` accepts the same flag (measured, codex-cli 0.156.1).
CODEX_ARGS=(
  exec
  -C "$PROJECT_ROOT"
  -m "$ROLE_MODEL"
  --sandbox read-only
  -c approval_policy=never
  -c "model_reasoning_effort=$ROLE_EFFORT"
  -o "$LAST_FILE"
)

# THE RESUME FORM IS FROZEN, AND IT IS A DIFFERENT COMMAND, NOT THE COLD ONE WITH A FLAG ADDED.
# `codex exec resume` has no -C and no --sandbox at all (they do not exist on the subcommand), so
# the read-only posture is carried by the `-c sandbox_mode=read-only` + `-c approval_policy=never`
# pair and the cwd is set to the project root just before the call. `-m` DOES exist on resume and is
# deliberately NOT used: one uniform `-c` posture carries all four values, and effort has no flag of
# its own anyway. The trailing `-` is part of the form - it is the atom that tells codex the prompt
# arrives on stdin. Data from the resolver (model, effort) stays one argv atom each.
RESUME_ARGS=(
  exec
  resume "$RESUME_ID"
  -c sandbox_mode=read-only
  -c approval_policy=never
  -c "model=$ROLE_MODEL"
  -c "model_reasoning_effort=$ROLE_EFFORT"
  -o "$LAST_FILE"
  -
)
if [ "$RESUME" -eq 1 ]; then
  CODEX_ARGS=("${RESUME_ARGS[@]}")
  cd "$PROJECT_ROOT" || fail "the project root is not a directory this wrapper can enter: $PROJECT_ROOT"
fi

# The brief read above is refused here if EMPTY (or whitespace-only), before a paid pass is spent.
if [ -z "$(printf '%s' "$PROMPT" | tr -d '[:space:]')" ]; then
  fail 'No prompt provided. Pass --brief-file <path> or pipe the brief in: cat <key>-qa-brief.txt | bash scripts/native/sh/codex-qa.sh --project-root <path>'
fi

# THE SESSION ID IS READ FROM CODEX'S OWN SESSION STORE, NOT FROM THIS RUN'S OUTPUT.
# Codex's two streams go to the run log, and NOTHING stands between codex and that log: the
# invocation below redirects both straight to the file (`> "$LOG_FILE" 2>&1`), with no tee and no
# pipe, so bash hands codex the file itself and every byte lands as codex wrote it. Codex renders by
# whether its streams are a terminal; a file is what it sees under the PowerShell channel too, where
# PowerShell cannot be the one writing the log (it re-encodes a redirected native stream - measured,
# plan GATES D-12) and scripts/native/codex-capture.mjs does it instead. That capture mechanism is the
# one documented difference between the two channels. An earlier attempt to parse the output for the
# id captured nothing on a real run, so the id is looked up afterwards.
#
# The store is the one codex maintains itself - $CODEX_HOME (default ~/.codex), the same place
# `codex exec resume --last` resolves against - where every session is one rollout-*.jsonl file whose
# first line is a `session_meta` record carrying `session_id`.
#
# IDENTIFICATION IS POSITIVE, NEVER "the newest file": a candidate must have been written during THIS
# run (mtime at or after the marker taken just below) AND contain THIS run's brief. Exactly one
# survivor is recorded; zero or several record NOTHING, so a second codex session in the same
# repository can never be mistaken for this one.
CAPTURE_JS='
const fs = require("fs");
const path = require("path");
const MAX = 512 * 1024;
const since = Number(process.env.PNP_SINCE_MS || 0);
const brief = process.env.PNP_BRIEF || "";
// The fingerprint: the longest run of printable ASCII in the head of the brief that JSON does not
// escape (no quote, no backslash), so it appears VERBATIM inside the rollout JSON.
let fp = "";
for (const m of brief.slice(0, 400).match(/[ -!#-\[\]-~]{24,}/g) || []) if (m.length > fp.length) fp = m;
fp = fp.slice(0, 120);
// NO FINGERPRINT IS AN ANSWER, NOT A LICENCE. A brief too short or too exotic to leave a verbatim
// trace cannot identify anything, and widening the candidate set to "every fresh rollout" would let
// an unrelated session be recorded - the wrong conversation for the next bare resume. Say nothing.
if (!fp) process.exit(0);
const head = (p) => {
  let fd = null;
  try {
    fd = fs.openSync(p, "r");
    const buf = Buffer.alloc(MAX);
    const n = fs.readSync(fd, buf, 0, MAX, 0);
    return buf.slice(0, n).toString("utf8");
  } catch (e) { return ""; } finally { if (fd !== null) { try { fs.closeSync(fd); } catch (e2) { /* closed */ } } }
};
const hits = [];
const walk = (dir, depth) => {
  if (depth > 6) return;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p, depth + 1); continue; }
    if (!/^rollout-.*\.jsonl$/.test(e.name)) continue;
    let st = null;
    try { st = fs.statSync(p); } catch (e2) { continue; }
    if (st.mtimeMs >= since) hits.push(p);
  }
};
walk(process.env.PNP_SESSIONS || "", 0);
const mine = hits.filter((p) => head(p).indexOf(fp) !== -1);
if (mine.length !== 1) process.exit(0);
const m = /"session_id"\s*:\s*"([^"]+)"/.exec(head(mine[0]));
if (m) process.stdout.write(m[1]);
'
SESSIONS_DIR="${CODEX_HOME:-$HOME/.codex}/sessions"
# Two seconds of slack for a filesystem whose mtime resolution is coarser than this clock.
CAPTURE_SINCE_MS=$(( ($(date +%s) - 2) * 1000 ))

# Clearing is DELETE first, truncate second, and then VERIFIED by re-reading. A file whose write bit
# is gone is still removable while its directory is writable (the remove also clears the read-only
# attribute on Windows), so the delete clears strictly more cases than a truncation - measured, not
# assumed: truncating a read-only state file fails with "Permission denied" and leaves the id in
# place, while `rm -f` removes it. The truncation stays for the opposite case, a writable file in a
# directory that refuses unlink. If the id SURVIVES both, that is reported as an ERROR naming it -
# never as "cleared", because the next bare --resume would otherwise replay exactly that stale id.
clear_session_state() {
  rm -f "$SESSION_STATE" 2>/dev/null || true
  if [ -e "$SESSION_STATE" ]; then
    : > "$SESSION_STATE" 2>/dev/null || true
  fi
  local left
  left=''
  if [ -e "$SESSION_STATE" ]; then
    left="$(tr -d ' \t\r\n' < "$SESSION_STATE" 2>/dev/null || true)"
  fi
  if [ -n "$left" ]; then
    printf 'codex-qa: ERROR: this run could not be identified in the codex session store AND the stale session id %s could NOT be removed from %s. Do not resume from it - pass --resume <id> explicitly.\n' "$left" "$SESSION_STATE" >&2
    return 0
  fi
  printf 'codex-qa: this run could not be identified in the codex session store; no session id is recorded now (%s), so the next --resume will need an explicit id.\n' "$SESSION_STATE" >&2
}

record_session_id() {
  # $1 = 1 when this run RESUMED a session, 0 for a cold run.
  local id
  if [ "$1" -eq 1 ]; then
    # A RESUMED RUN ALREADY KNOWS ITS SESSION, so the store is not consulted at all. `codex exec
    # resume <id>` continues THAT conversation - branching into a new one is a different subcommand
    # (`codex exec fork`) this wrapper never uses - and the lookup could not answer anyway: a resumed
    # session's rollout has grown past the window the lookup reads, so the new brief sits beyond it
    # and the run reports itself unidentifiable. Recording the known id also repairs the state file
    # after an explicit --resume <id>, which is the one case where it was not written by this pair.
    id="$RESUME_ID"
  else
    id="$(PNP_SESSIONS="$SESSIONS_DIR" PNP_SINCE_MS="$CAPTURE_SINCE_MS" PNP_BRIEF="$PROMPT" node -e "$CAPTURE_JS" 2>/dev/null || true)"
  fi
  if [ -n "$id" ]; then
    mkdir -p "$(dirname "$SESSION_STATE")" 2>/dev/null || true
    if printf '%s\n' "$id" > "$SESSION_STATE" 2>/dev/null; then
      RECORDED_ID="$id"
    else
      printf 'codex-qa: the session id could not be recorded in %s\n' "$SESSION_STATE" >&2
    fi
    return 0
  fi
  clear_session_state
}

# THIS WRAPPER'S STDOUT IS THE FINAL MESSAGE AND NOTHING ELSE: the bytes codex wrote through -o, by
# `cat`. When codex left no final message, stdout stays EMPTY and stderr says so.
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
# THE CAPACITY LINE: a run that exited non-zero with one of CAPACITY_TEXTS in its log was refused by
# the engine at capacity (the recorded real text is "Selected model is at capacity"; not reproduced
# at will, so the text is the recorded one). It names the session to resume when one was recorded. A
# run that exited 0 is never called a refusal, whatever its log quotes.
# EACH LINE IS ONE PHYSICAL LINE. Every dynamic field (run mode, resume id, model, effort, session id,
# tokens figure, log path) passes through header_field, which turns every control character - CR, LF
# and the rest of 0x00-0x1F, and 0x7F - into one space each: the schema admits any non-empty string
# for a model or an effort, and a value carrying a line break could otherwise split a line or print a
# fake exit line before codex has even started.
header_field() {
  printf '%s' "$1" | LC_ALL=C tr '\000-\037\177' ' '
}
CAPACITY_TEXTS=('at capacity')
mkdir -p "$RUN_DIR" 2>/dev/null || fail "the run log directory could not be created: $RUN_DIR"
if [ -e "$LOG_FILE" ] || [ -e "$LAST_FILE" ]; then
  fail "this run's log already exists: $LOG_FILE - a log is never shared by two runs; start the run again."
fi
if [ "$RESUME" -eq 1 ]; then RUN_MODE="resumed $RESUME_ID"; else RUN_MODE='cold'; fi
printf 'codex-qa: run %s, role qa, model %s, effort %s\n' "$(header_field "$RUN_MODE")" "$(header_field "$ROLE_MODEL")" "$(header_field "$ROLE_EFFORT")" >&2
RECORDED_ID=''
status=0
printf '%s\n' "$PROMPT" | codex "${CODEX_ARGS[@]}" > "$LOG_FILE" 2>&1 || status=$?
record_session_id "$RESUME"
HAS_VERDICT=0
if [ -f "$LAST_FILE" ]; then
  HAS_VERDICT=1
  cat "$LAST_FILE" || true
fi
TOKENS_FIGURE=''
AT_CAPACITY=0
if [ -f "$LOG_FILE" ]; then
  TOKENS_FIGURE="$(awk '{ sub(/\r$/, "") } prev == "tokens used" && /^[0-9][0-9,]*$/ { n = $0 } { prev = $0 } END { printf "%s", n }' "$LOG_FILE" 2>/dev/null || true)"
  if [ "$status" -ne 0 ]; then
    for capacity_text in "${CAPACITY_TEXTS[@]}"; do
      if grep -q -F -- "$capacity_text" "$LOG_FILE" 2>/dev/null; then AT_CAPACITY=1; fi
    done
  fi
fi
SID=''
if [ -n "$RECORDED_ID" ]; then SID="$(header_field "$RECORDED_ID")"; fi
LOG_SHOWN="$(header_field "$LOG_FILE")"
if [ -z "$TOKENS_FIGURE" ]; then
  printf 'codex-qa: tokens used: not printed by the engine\n' >&2
elif [ "$RESUME" -eq 1 ]; then
  printf 'codex-qa: tokens used %s (cumulative over session %s)\n' "$(header_field "$TOKENS_FIGURE")" "$(header_field "$RESUME_ID")" >&2
else
  printf 'codex-qa: tokens used %s\n' "$(header_field "$TOKENS_FIGURE")" >&2
fi
if [ "$AT_CAPACITY" -eq 1 ]; then
  if [ -n "$SID" ]; then
    printf 'codex-qa: engine refused: capacity, session %s resumable\n' "$SID" >&2
  else
    printf 'codex-qa: engine refused: capacity, session not identified\n' >&2
  fi
fi
if [ "$HAS_VERDICT" -eq 0 ]; then
  printf 'codex-qa: no verdict - the engine wrote no final message; log %s\n' "$LOG_SHOWN" >&2
fi
printf 'codex-qa: log %s\n' "$LOG_SHOWN" >&2
if [ -n "$SID" ]; then
  printf 'codex-qa: exit %s, session %s (resumable: --resume %s)\n' "$status" "$SID" "$SID" >&2
else
  printf 'codex-qa: exit %s, session not identified - the next resume needs an explicit id\n' "$status" >&2
fi
exit "$status"
