#!/usr/bin/env bash
#
# Invoke QA on the Codex engine (read-only artifact judge).
# Bash mirror of scripts/native/ps/codex-qa.ps1 - same locked flags, same stdin-only contract.
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
# THE BRIEF ARRIVES ON STDIN, AND ONLY ON STDIN. There is deliberately no prompt flag: text that
# never reaches the option parser cannot inject a CLI option. An empty or whitespace-only brief is
# refused (exit 2) rather than sent.
#
# --project-root <path> is REQUIRED: the plugin payload has no project of its own, so the caller
# (the /pnp:qa skill, Step 0) resolves the project root and passes it in. It is the cwd Codex is
# given (-C), and the project's roles.json is read from <projectRoot>/.claude/aiwf-native/roles.json.
#
# --resume [<id>] is OPTIONAL and takes an OPTIONAL argument: without one it replays the session id
# THIS wrapper recorded last (<scratchDir>/last-qa-session.txt, QA's own file - a QA run can never
# hijack a Reviewer resume and vice versa); with one it resumes that id verbatim. --resume-id <id>
# is the same thing spelled with a mandatory value, and it implies --resume. Every run - cold or
# resumed - records the session id afterwards from codex's OWN session store (never from this run's
# output, which belongs to the caller), so the NEXT pass can be a resume instead of a second cold
# read of the whole evidence set.
#
# EXAMPLE:
#   cat .aiwf/qa-brief.txt | bash scripts/native/sh/codex-qa.sh --project-root /path/to/repo
#   cat .aiwf/qa-brief.txt | bash scripts/native/sh/codex-qa.sh --project-root /path/to/repo --resume
set -euo pipefail

PROJECT_ROOT=''
RESUME=0
RESUME_ID=''

fail() {
  printf 'codex-qa: %s\n' "$1" >&2
  exit 2
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
    *)
      fail "unknown argument '$1' - the brief is delivered on STDIN, never on argv." ;;
  esac
done

[ -n "$PROJECT_ROOT" ] || fail 'no --project-root <path>. The plugin payload has no project of its own: pass the resolved project root.'

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

# THE SESSION STATE FILE IS PER ROLE, AND THIS WRAPPER TOUCHES ONLY QA'S.
# `last-qa-session.txt` is written and read here and nowhere else, and the Reviewer wrapper's own
# file is not named anywhere in this one - not even in a comment, so the crossed-state question can
# be answered by a plain grep. One shared file would let a QA run overwrite the id a Reviewer
# correction round is about to resume - a wrong-context review that still returns a confident
# verdict.
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
SESSION_STATE="$PROJECT_ROOT_ABS/$SCRATCH_REL/last-qa-session.txt"

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
CODEX_ARGS=(
  exec
  -C "$PROJECT_ROOT"
  -m "$ROLE_MODEL"
  --sandbox read-only
  -c approval_policy=never
  -c "model_reasoning_effort=$ROLE_EFFORT"
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
  -
)
if [ "$RESUME" -eq 1 ]; then
  CODEX_ARGS=("${RESUME_ARGS[@]}")
  cd "$PROJECT_ROOT" || fail "the project root is not a directory this wrapper can enter: $PROJECT_ROOT"
fi

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY - it never appears
# on the command line, so no caller text (even one starting with "--", e.g. --ignore-user-config or
# --dangerously-bypass-approvals-and-sandbox) can reach the option parser. The brief is read here
# first only to refuse an EMPTY one before spending a paid pass; it is then handed on unchanged.
PROMPT="$(cat)"
if [ -z "$(printf '%s' "$PROMPT" | tr -d '[:space:]')" ]; then
  fail 'No prompt provided. Pipe the brief in: cat brief.txt | bash scripts/native/sh/codex-qa.sh --project-root <path>'
fi

# THE SESSION ID IS READ FROM CODEX'S OWN SESSION STORE, NOT FROM THIS RUN'S OUTPUT.
# BOTH output streams belong to the caller and this wrapper touches NEITHER. The reason is not
# tidiness: codex renders its configuration banner - the part carrying the session id - on STDERR and
# reserves STDOUT for the final message, and it decides what to render by whether those streams are a
# terminal. A tee, a pipe or a redirect added here changes what the caller sees and what codex
# prints; an earlier attempt to parse STDOUT captured nothing on a real run and duplicated the
# caller's output. So the invocation below is the plain one, and the id is looked up afterwards.
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
    printf '%s\n' "$id" > "$SESSION_STATE" 2>/dev/null \
      || printf 'codex-qa: the session id could not be recorded in %s\n' "$SESSION_STATE" >&2
    return 0
  fi
  clear_session_state
}

status=0
printf '%s\n' "$PROMPT" | codex "${CODEX_ARGS[@]}" || status=$?
record_session_id "$RESUME"
exit "$status"
