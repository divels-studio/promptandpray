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
# EXAMPLE:
#   cat .aiwf/qa-brief.txt | bash scripts/native/sh/codex-qa.sh --project-root /path/to/repo
set -euo pipefail

PROJECT_ROOT=''

fail() {
  printf 'codex-qa: %s\n' "$1" >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --project-root)
      [ $# -ge 2 ] || fail '--project-root needs a value.'
      PROJECT_ROOT="$2"; shift 2 ;;
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

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY - it never appears
# on the command line, so no caller text (even one starting with "--", e.g. --ignore-user-config or
# --dangerously-bypass-approvals-and-sandbox) can reach the option parser. The brief is read here
# first only to refuse an EMPTY one before spending a paid pass; it is then handed on unchanged.
PROMPT="$(cat)"
if [ -z "$(printf '%s' "$PROMPT" | tr -d '[:space:]')" ]; then
  fail 'No prompt provided. Pipe the brief in: cat brief.txt | bash scripts/native/sh/codex-qa.sh --project-root <path>'
fi

status=0
printf '%s\n' "$PROMPT" | codex "${CODEX_ARGS[@]}" || status=$?
exit "$status"
