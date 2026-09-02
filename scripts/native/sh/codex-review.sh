#!/usr/bin/env bash
#
# Invoke the Reviewer on the Codex engine (read-only, OS-sandboxed).
# Bash mirror of scripts/native/ps/codex-review.ps1 - same locked flags, same stdin-only contract.
#
# Thin wrapper over the proven command (prompt delivered via stdin - see body):
#     "<prompt>" | codex exec -C <projectRoot> -m <model> --sandbox read-only -c approval_policy=never
# Reviewer is read-only by OS sandbox and reports; it never edits, commits, or pushes.
# NEVER passes --ignore-user-config (keeps the user's Codex config; the CWD/model/sandbox/
# user-config posture stays exactly as proven). The `-c approval_policy=never` pin is a deliberate
# hardening on top of that posture: it stops the approval mechanism being inherited from
# ~/.codex/config.toml (read-only + an inherited interactive/auto approval policy could otherwise
# permit a sandbox escalation). See docs/CODEX_REVIEW_QA_RECIPE.md.
#
# THE BRIEF ARRIVES ON STDIN, AND ONLY ON STDIN. There is deliberately no prompt flag: text that
# never reaches the option parser cannot inject a CLI option. An empty or whitespace-only brief is
# refused (exit 2) rather than sent.
#
# --project-root <path> is REQUIRED: the plugin payload has no project of its own, so the caller
# (the /pnp:review skill, Step 0) resolves the project root and passes it in. It is the cwd Codex is
# given (-C), and the project's roles.json is read from <projectRoot>/.claude/aiwf-native/roles.json.
#
# --class <plan|code|docs> is OPTIONAL: with it, the model and effort come from that row of the
# audit table (review.<class> in roles.json) instead of the Reviewer role's own triple, which is
# what /pnp:review passes on every invocation. Without it the wrapper behaves exactly as it did.
#
# EXAMPLE:
#   cat .aiwf/review-brief.txt | bash scripts/native/sh/codex-review.sh --project-root /path/to/repo
#   cat .aiwf/review-brief.txt | bash scripts/native/sh/codex-review.sh --project-root /repo --class docs
set -euo pipefail

PROJECT_ROOT=''
CLASS=''
HAS_CLASS=0

fail() {
  printf 'codex-review: %s\n' "$1" >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --project-root)
      [ $# -ge 2 ] || fail '--project-root needs a value.'
      PROJECT_ROOT="$2"; shift 2 ;;
    --class)
      [ $# -ge 2 ] || fail '--class needs a value (plan|code|docs).'
      CLASS="$2"; HAS_CLASS=1; shift 2 ;;
    *)
      fail "unknown argument '$1' - the brief is delivered on STDIN, never on argv." ;;
  esac
done

[ -n "$PROJECT_ROOT" ] || fail 'no --project-root <path>. The plugin payload has no project of its own: pass the resolved project root.'

# Engine-neutral role resolution. This Codex wrapper only runs when the `reviewer` role - or, with
# --class, the row of that review class - is assigned to the `codex` engine in the project's
# .claude/aiwf-native/roles.json. The MODEL comes from the resolver (one argv atom); if the host is
# Claude instead, the resolved engine != codex and this wrapper exits 2 so /pnp:review routes to the
# Claude Agent branch. The read-only guarantee is untouched: --sandbox / -C /
# -c approval_policy=never remain LITERALS.
#
# The two invocations are spelled out rather than assembled into an argv array on purpose: a
# resolver call built from a variable is a call whose flags no longer read as flags, and the flags
# of THIS call decide which engine gets paid.
#
# THE BRANCH IS ON WHETHER --class WAS PASSED (HAS_CLASS), NEVER ON ITS VALUE. `--class ''` must
# FAIL, exactly as the resolver's own contract says - branching on the value instead let an
# explicitly empty class fall through to the classless call and quietly review a docs-class diff on
# the Reviewer's own host, which is the wrong engine, the wrong model and someone else's budget.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLES_PATH="$PROJECT_ROOT/.claude/aiwf-native/roles.json"

snapshot=''
if [ "$HAS_CLASS" -eq 1 ]; then
  snapshot="$(bash "$HERE/aiwf-roles.sh" --role reviewer --class "$CLASS" --roles-path "$ROLES_PATH" --as-json)" \
    || fail "aiwf role resolve failed for review class '$CLASS' (see resolver stderr above)."
else
  snapshot="$(bash "$HERE/aiwf-roles.sh" --role reviewer --roles-path "$ROLES_PATH" --as-json)" \
    || fail "aiwf role resolve failed for 'reviewer' (see resolver stderr above)."
fi

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
  what="role 'reviewer'"
  [ "$HAS_CLASS" -eq 0 ] || what="review class '$CLASS'"
  fail "$what resolves to engine '$ROLE_ENGINE', not 'codex'; this Codex wrapper does not run - route through the Claude Agent branch of /pnp:review."
fi

# Locked flags - the proven read-only + user-config-loaded posture. Do not add
# --ignore-user-config and do not change --sandbox without re-proving it. Data from the resolver:
# the -m model and the model_reasoning_effort value - each one argv atom; everything else
# (sandbox/approval) is literal, and -C is the caller-supplied project root.
# `-c approval_policy=never` pins the approval mechanism explicitly (does NOT inherit it from
# ~/.codex/config.toml), so read-only cannot be paired with an escalating approval policy.
CODEX_ARGS=(
  exec
  -C "$PROJECT_ROOT"
  -m "$ROLE_MODEL"
  --sandbox read-only
  -c approval_policy=never
  -c "model_reasoning_effort=$ROLE_EFFORT"
)

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY - it never appears
# on the command line, so no caller text (even one starting with "--", e.g. --ignore-user-config or
# --dangerously-bypass-approvals-and-sandbox) can reach the option parser. The brief is read here
# first only to refuse an EMPTY one before spending a paid pass; it is then handed on unchanged.
PROMPT="$(cat)"
if [ -z "$(printf '%s' "$PROMPT" | tr -d '[:space:]')" ]; then
  fail 'No prompt provided. Pipe the brief in: cat brief.txt | bash scripts/native/sh/codex-review.sh --project-root <path>'
fi

status=0
printf '%s\n' "$PROMPT" | codex "${CODEX_ARGS[@]}" || status=$?
exit "$status"
