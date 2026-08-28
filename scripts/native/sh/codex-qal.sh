#!/usr/bin/env bash
#
# Invoke QAL - the LIVE agentic-browser Codex surface (NO sandbox, operator-gated).
# Bash mirror of scripts/native/ps/codex-qal.ps1 - same locked flags, same stdin-only contract.
#
# QAL is the *live exploratory* QA surface: a real Codex-driven agentic browser. It is the
# operator-gated exception to the default read-only QA. Unlike QA (codex-qa.sh, the read-only
# artifact judge), QAL runs WITHOUT an OS sandbox: any restrictive sandbox (read-only or
# workspace-write) blocks a Codex-launched browser, so it must be relaxed. --sandbox
# danger-full-access is the MINIMAL non-bypass flag that runs one
# (docs/QA_BROWSER_INVESTIGATION.md); the broader --dangerously-bypass-approvals-and-sandbox also
# works but additionally strips the approval mechanism. NEITHER is "safe" - both give the browser
# full disk access.
#
# Command shape (prompt via stdin - see body):
#     "<prompt>" | codex exec -C <unique-scratch> -m <model> --sandbox danger-full-access -c approval_policy=never
#
# WHY `--sandbox danger-full-access` and NOT `--dangerously-bypass-approvals-and-sandbox`:
# the investigation proved `--sandbox danger-full-access` is the MINIMAL flag that makes a
# Codex-launched browser work. The broader flag also works but additionally strips the approval
# mechanism - an unnecessary widening. We take the narrower proven flag. Any restrictive `--sandbox`
# (read-only OR workspace-write) BLOCKS the browser at launch/attach (proven) - do NOT reintroduce
# one here. Do NOT add --ignore-user-config; it strips the browser tooling QAL needs.
#
# APPROVAL PIN: `-c approval_policy=never` is set so the approval mechanism is pinned explicitly and
# NOT inherited from ~/.codex/config.toml (same hardening as the read-only wrappers). Under
# danger-full-access this does not reduce QAL's capability - full access needs no approval to act,
# and `never` simply removes prompting (correct for non-interactive `codex exec`, which has no human
# to answer a prompt). It does NOT relax the sandbox: danger-full-access is unchanged.
#
# PREFLIGHT (fail-closed, three conditions). QAL runs ONLY when all three hold:
#   (1) `roles.qal.enabled` is true in the project's roles.json - checked here;
#   (2) the qal role resolves to engine `codex` - checked here (QAL is codex-only by design; there
#       is no Claude QAL host);
#   (3) the operator asked for QAL explicitly in the CURRENT conversation - this one cannot be
#       checked by a script; it is enforced by the /pnp:qal skill and the doctrine. The
#       orchestrator NEVER decides to run QAL on its own.
#
# HONEST SECURITY MODEL - read before running (no overclaiming):
# - There is NO cell here. `--sandbox danger-full-access` gives the Codex process (and the browser
#   it drives) FULL disk access. Repo safety rests only on:
#     (1) `-C <unique-scratch>` cwd isolation - a UNIQUE throwaway dir created fresh under the
#         per-user temp directory on EVERY run (mktemp -d, so the name is unique and the create is
#         atomic) and removed afterwards by a trap, so no state leaks between runs; the project repo
#         is NEVER the cwd;
#     (2) the browser launching its OWN default (throwaway) profile, not the operator's;
#     (3) git reversibility + the operator-in-the-loop backstop.
#   These are HYGIENE / accident-grade containment, NOT a guarantee. Under danger-full-access
#   nothing structurally prevents a write outside the scratch dir - do NOT claim the scratch cwd or
#   the "never writes the repo" convention is a guarantee anywhere.
# - QAL's contract is: explore the UI, report with evidence, NEVER write the repo. That is a
#   CONVENTION of the role, enforced by nothing but the brief and the operator - stated honestly.
#
# --project-root <path> is REQUIRED, and used for ONE thing only: locating the project's
# .claude/aiwf-native/roles.json for the preflight. It is deliberately NOT passed to Codex - QAL's
# cwd is always the unique throwaway scratch dir, never the repo.
#
# See docs/CODEX_REVIEW_QA_RECIPE.md, docs/LOOP.md and the /pnp:qal skill.
#
# EXAMPLE:
#   cat qal-brief.txt | bash scripts/native/sh/codex-qal.sh --project-root /path/to/repo
set -euo pipefail

PROJECT_ROOT=''
SCRATCH=''

fail() {
  printf 'codex-qal: %s\n' "$1" >&2
  exit 2
}

# Best-effort removal of the per-run scratch dir, wired to EXIT so that EVERY path - the empty-prompt
# refusal, a preflight failure before the dir exists, and the normal run - leaves nothing behind.
# It never changes the exit code: on failure it warns WITH the path (so the operator can remove it).
cleanup_scratch() {
  if [ -n "$SCRATCH" ] && [ -d "$SCRATCH" ]; then
    rm -rf "$SCRATCH" || printf 'codex-qal: QAL scratch cleanup failed (remove it manually): %s\n' "$SCRATCH" >&2
  fi
}
trap cleanup_scratch EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --project-root)
      [ $# -ge 2 ] || fail '--project-root needs a value.'
      PROJECT_ROOT="$2"; shift 2 ;;
    *)
      fail "unknown argument '$1' - the brief is delivered on STDIN, never on argv." ;;
  esac
done

[ -n "$PROJECT_ROOT" ] || fail 'no --project-root <path>. It is used only to locate the project roles.json for the preflight; it is never passed to codex.'

# Engine-neutral role resolution (done BEFORE creating a scratch dir so a failed preflight leaves
# nothing behind). QAL is codex-only, so a non-codex resolution is a misconfiguration -> exit 2.
# Data from the resolver: the -m model and the model_reasoning_effort value, each one argv atom;
# --sandbox / -c approval_policy=never stay LITERALS.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLES_PATH="$PROJECT_ROOT/.claude/aiwf-native/roles.json"

snapshot=''
snapshot="$(bash "$HERE/aiwf-roles.sh" --role qal --roles-path "$ROLES_PATH" --as-json)" \
  || fail "aiwf role resolve failed for 'qal' (see resolver stderr above)."

# The snapshot is JSON, so it is read by a real parser (same reasoning as the resolver: node is a
# prerequisite of this plugin, jq is not, and a grep/sed reading would coerce shapes silently).
#
# The fields come back NUL-DELIMITED, and are read through a process substitution rather than a
# variable. Both halves of that are load-bearing: the config schema admits ANY non-empty string for
# model/effort, so a value containing a NEWLINE (or a space) would shift or truncate a
# line-delimited transport and silently change the argv this wrapper hands the engine - the exact
# class of defect the locked-flag contract exists to prevent. NUL is the one byte that cannot
# appear in an argv atom at all, and a shell variable cannot carry it, hence the redirect.
# The `enabled` field is the operator gate and is emitted as a strict boolean by the resolver:
# only a real JSON true ever becomes "true" here.
FIELDS_JS='
const s = JSON.parse(process.env.PNP_SNAPSHOT);
process.stdout.write([s.engine, s.model, s.effort, s.enabled === true ? "true" : "false"].join("\u0000") + "\u0000");
'
if ! {
  IFS= read -r -d "" ROLE_ENGINE &&
  IFS= read -r -d "" ROLE_MODEL &&
  IFS= read -r -d "" ROLE_EFFORT &&
  IFS= read -r -d "" ROLE_ENABLED
} < <(PNP_SNAPSHOT="$snapshot" node -e "$FIELDS_JS"); then
  fail "the resolver snapshot could not be read (node); the resolver printed: $snapshot"
fi

# Preflight condition (1): the operator gate. Absent/false/non-boolean `enabled` -> refuse.
if [ "$ROLE_ENABLED" != 'true' ]; then
  fail "QAL is disabled: roles.qal.enabled is not true in '$ROLES_PATH'. QAL is an operator-gated exception - enable it deliberately (config key roles.qal.enabled) before running it."
fi

# Preflight condition (2): codex-only by design.
if [ "$ROLE_ENGINE" != 'codex' ]; then
  fail "role 'qal' resolves to engine '$ROLE_ENGINE', not 'codex'; QAL is codex-only - no Claude QAL host exists. Fix the project's roles.json."
fi

# A UNIQUE fresh scratch dir under the per-user temp directory. mktemp -d creates it atomically with
# a name that did not exist a moment ago, which is what makes "fresh every run" TRUE rather than
# merely likely. The project repo is NEVER the cwd. This is cwd HYGIENE (accident-grade
# containment), NOT a sandbox guarantee (see the header security model).
SCRATCH="$(mktemp -d "${TMPDIR:-/tmp}/aiwf-qal.XXXXXX")" || fail 'QAL could not create a unique scratch dir (mktemp -d failed).'

# Locked flags - danger-full-access is the MINIMAL proven-working flag for a Codex-launched browser.
# Do NOT swap to --dangerously-bypass-approvals-and-sandbox (broader than needed) and do NOT add a
# restrictive --sandbox (read-only/workspace-write both BLOCK the browser - proven). -C points at
# the unique throwaway scratch, never the repo. Only -m and the effort are data (from the resolver,
# one argv atom each); everything else literal.
# `-c approval_policy=never` pins the approval mechanism explicitly (does NOT inherit it from
# ~/.codex/config.toml); it does NOT relax the sandbox (see APPROVAL PIN in the header).
CODEX_ARGS=(
  exec
  -C "$SCRATCH"
  -m "$ROLE_MODEL"
  --sandbox danger-full-access
  -c approval_policy=never
  -c "model_reasoning_effort=$ROLE_EFFORT"
)

# SECURITY (locks the flag set): the prompt is delivered to Codex via STDIN ONLY - it never appears
# on the command line, so no caller text (even one starting with "--") can reach the option parser.
# (QAL is unsandboxed by design - stdin locking here protects the pinned -C scratch cwd and model,
# not a read-only boundary.) The brief is read here first only to refuse an EMPTY one before
# spending a paid pass; the EXIT trap removes the scratch dir on that path too.
PROMPT="$(cat)"
if [ -z "$(printf '%s' "$PROMPT" | tr -d '[:space:]')" ]; then
  fail 'No prompt provided. Pipe the brief in: cat brief.txt | bash scripts/native/sh/codex-qal.sh --project-root <path>'
fi

status=0
printf '%s\n' "$PROMPT" | codex "${CODEX_ARGS[@]}" || status=$?
exit "$status"
