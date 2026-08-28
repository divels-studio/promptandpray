#!/usr/bin/env bash
#
# AIWF role resolver (bash mirror of scripts/native/ps/aiwf-roles.ps1).
#
# Maps a review role (reviewer|qa|qal) to its {engine, model, effort}. Single source of truth for
# which engine + model hosts each read-only review role, so the loop is ENGINE-NEUTRAL. The
# engine/model are data in the project's .claude/aiwf-native/roles.json (itself a rendered artifact
# of aiwf.config.json.roles.*); this script resolves them for one role and prints a snapshot the
# /pnp:* skills and the Codex wrappers branch on (engine codex -> the wrapper; engine claude -> the
# Agent tool with the resolved model).
#
# ENTRYPOINT-ONLY:
#     bash <pluginRoot>/scripts/native/sh/aiwf-roles.sh --role <r> --roles-path <p> --as-json
# prints {"role":..,"engine":..,"model":..,"effort":..} to stdout and exits 0. There is
# intentionally NO sourced API and NO built-in per-role capability map - an unsupported engine for a
# role fails VISIBLY downstream (e.g. qal = claude has no Claude QAL host, so /pnp:qal fails
# naturally), which is the documented fail-closed. Keeping the resolver lean is deliberate.
#
# For qal the --as-json snapshot additionally carries the boolean "enabled" (the operator gate).
# The plain-text form stays "<engine> <model> <effort>" for every role, exactly as in the
# PowerShell channel: "enabled" is part of the MACHINE contract, which is what the wrappers read.
#
# FAIL SEMANTICS - exactly TWO paths, identical to the PowerShell channel:
#   (a) the config file is MISSING -> return the hardcoded factory fallback claude / opus / high
#       (exit 0), so the loop still runs read-only-on-Claude when the config is absent. Codex is an
#       explicit opt-in, never a fallback: falling back to a paid external engine without the
#       operator asking for it is the one failure mode a fallback must not have. Consequence for
#       QAL: QAL is codex-only, so a missing config resolves qal to claude and the QAL wrapper
#       refuses - fail-closed by construction;
#   (b) the file EXISTS but the role does not resolve to a valid (engine, model, effort) triple -
#       engine one of (claude|codex), model and effort non-empty strings - -> ONE line to STDERR
#       and exit 2. This single branch folds malformed JSON / missing role / unknown engine / empty
#       model / empty effort: there is no per-class taxonomy, and effort has NO enum (a bad value
#       like "wat" passes through and the engine rejects it VISIBLY at call time - documented
#       natural fail-closed).
#       Rationale: silently dispatching the WRONG engine burns the operator's paid budget
#       invisibly, so the resolver guards intent + money, not validateState theater.
#
# STRICT SHAPE (the same contract in both channels, and the reason this is spelled out rather than
# left to the host language): the top level must be a JSON OBJECT - an array root is rejected, even
# a single-element one - and every key lookup is CASE-SENSITIVE, including `enabled`. Both rules
# exist because PowerShell would otherwise accept files this channel rejects: its property lookup is
# case-insensitive, and `$raw | ConvertFrom-Json` ENUMERATES an array root so `[{...}]` arrives
# already unwrapped. roles.json is a MACHINE-RENDERED artifact with exact-case keys, so a file that
# only resolves through a host-language accident is a defect the resolver reports rather than papers
# over. Both collapse into the single exit-2 path above.
#
# The config file is read EXACTLY ONCE, by the single node invocation below.
#
# WHY node: the JSON has to be parsed by a real parser. node is already a hard prerequisite of this
# plugin (the hooks and every engine are node), while jq is not - and grep/sed "JSON parsing"
# silently coerces the exact shapes (a numeric model, the string "true") this resolver exists to
# reject. One invocation, no temp files.
#
# --roles-path is REQUIRED (as in the PowerShell channel): the plugin has no project context of its
# own, and a script-relative default would point at the payload instead of the project. The caller
# (skill Step 0 / a Codex wrapper's --project-root) resolves the project root and passes the path.
#
# EXAMPLE:
#   bash scripts/native/sh/aiwf-roles.sh --role reviewer \
#     --roles-path /path/to/repo/.claude/aiwf-native/roles.json --as-json
set -euo pipefail

# Factory fallback used ONLY when the config file is absent (never on a present-but-invalid file).
FALLBACK_ENGINE='claude'
FALLBACK_MODEL='opus'
FALLBACK_EFFORT='high'

ROLE=''
ROLES_PATH=''
AS_JSON=0

fail() {
  printf 'aiwf-roles: %s\n' "$1" >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --role)
      [ $# -ge 2 ] || fail "--role needs a value (expected one of: reviewer|qa|qal)."
      ROLE="$2"; shift 2 ;;
    --roles-path)
      [ $# -ge 2 ] || fail "--roles-path needs a value (the project's .claude/aiwf-native/roles.json)."
      ROLES_PATH="$2"; shift 2 ;;
    --as-json)
      AS_JSON=1; shift ;;
    *)
      fail "unknown argument '$1' (expected --role <reviewer|qa|qal> --roles-path <path> [--as-json])." ;;
  esac
done

case "$ROLE" in
  reviewer|qa|qal) ;;
  *) fail "role '$ROLE' is not a valid role (expected one of: reviewer|qa|qal)." ;;
esac

# Mandatory, with NO script-relative fallback: a default here would resolve against the payload.
[ -n "$ROLES_PATH" ] || fail "--roles-path is required - the plugin has no project of its own, so the caller passes the project's .claude/aiwf-native/roles.json."

if [ ! -f "$ROLES_PATH" ]; then
  # (a) missing file -> silent factory fallback (claude/opus/high; qal disabled).
  if [ "$AS_JSON" -eq 1 ]; then
    if [ "$ROLE" = 'qal' ]; then
      printf '{"role":"%s","engine":"%s","model":"%s","effort":"%s","enabled":false}\n' \
        "$ROLE" "$FALLBACK_ENGINE" "$FALLBACK_MODEL" "$FALLBACK_EFFORT"
    else
      printf '{"role":"%s","engine":"%s","model":"%s","effort":"%s"}\n' \
        "$ROLE" "$FALLBACK_ENGINE" "$FALLBACK_MODEL" "$FALLBACK_EFFORT"
    fi
  else
    printf '%s %s %s\n' "$FALLBACK_ENGINE" "$FALLBACK_MODEL" "$FALLBACK_EFFORT"
  fi
  exit 0
fi

# (b) present file: read EXACTLY ONCE, then resolve. ANY invalid-record condition (malformed JSON,
# missing role, unknown/empty engine, empty model/effort) collapses into the single exit-2 path
# below. The RAW (un-coerced) values are validated as real strings: a JSON number/bool/object/array
# must NOT become a valid-looking string ("model": 5 -> "5"). `enabled` is read LEAN and
# FAIL-CLOSED - only a real boolean true enables QAL; absent, null, "true" as a string, 1, or
# anything else -> false - so it never opens a third failure path.
RESOLVE_JS='
const fs = require("fs");
const KNOWN_ENGINES = ["claude", "codex"];
const role = process.env.PNP_ROLE;
let entry = null;
try {
  const cfg = JSON.parse(fs.readFileSync(process.env.PNP_ROLES_PATH, "utf8"));
  if (cfg !== null && typeof cfg === "object" && !Array.isArray(cfg)) entry = cfg[role];
} catch (e) {
  entry = null;
}
const rec = (entry !== null && typeof entry === "object" && !Array.isArray(entry)) ? entry : {};
const str = (v) => typeof v === "string" && v.trim() !== "";
const engine = rec.engine;
const model = rec.model;
const effort = rec.effort;
if (!str(engine) || KNOWN_ENGINES.indexOf(engine) === -1 || !str(model) || !str(effort)) process.exit(2);
if (process.env.PNP_AS_JSON === "1") {
  const out = { role: role, engine: engine, model: model, effort: effort };
  if (role === "qal") out.enabled = rec.enabled === true;
  process.stdout.write(JSON.stringify(out) + "\n");
} else {
  process.stdout.write(engine + " " + model + " " + effort + "\n");
}
'

snapshot=''
status=0
snapshot="$(PNP_ROLES_PATH="$ROLES_PATH" PNP_ROLE="$ROLE" PNP_AS_JSON="$AS_JSON" node -e "$RESOLVE_JS")" || status=$?

if [ "$status" -eq 2 ]; then
  fail "role '$ROLE' does not resolve to a valid (engine, model, effort) triple in '$ROLES_PATH' (engine one of claude|codex; model and effort non-empty strings). Fix roles.json."
fi
if [ "$status" -ne 0 ]; then
  # A different failure class from (b), and it says so: node is a hard prerequisite of this plugin,
  # so "the reader could not run" must never be reported as "the config is invalid".
  fail "the JSON reader could not be run (node exited $status) - node is a prerequisite of this plugin."
fi

printf '%s\n' "$snapshot"
exit 0
