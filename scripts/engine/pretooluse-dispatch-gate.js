'use strict';
/*
 * Gate 2 - the Writer dispatch gate, in one of TWO modes chosen by the project's config.
 *
 * PreToolUse(Agent). The Writer is the only role that writes implementation code, so handing work to
 * it is the moment the loop leaves planning and starts mutating the repo. What that moment costs the
 * operator is a project decision, taken in `enforcement.dispatchGate` of
 * `<projectDir>/.claude/aiwf-native/aiwf.config.json`:
 *
 *   - "always" (the factory default) - EVERY Writer dispatch raises a native Yes/No dialog, exactly
 *     like the commit gate: an operator gate that CAN be a native dialog IS a native dialog, instead
 *     of a rule the orchestrating model has to remember.
 *   - "off-plan" - the dispatch is judged against the PLAN instead of being counted. The brief's
 *     marker line `Ticket: <REF>` is read out of `tool_input.prompt` and `<REF>` is looked up in
 *     `<plansDir>/active/PLAN_*.md`. Found -> passthrough, SILENTLY: dispatching the Writer inside an
 *     approved plan is exactly the COO's job. Missing marker line, a ref that is in no active PLAN,
 *     or a plans directory that cannot be read -> the dialog, naming the ref.
 *
 * In BOTH modes:
 *   - `tool_input.subagent_type !== "writer"` -> passthrough. Reviewer, QA, Explore, general-purpose
 *     and every ad-hoc scan subagent are untouched by this gate, whatever their prompt says.
 *
 * THE MODE IS READ FAIL-SAFE, in the same direction as Gate 3's `enforcement.routeWriteGuard`: a
 * missing config, an unreadable or corrupt one, a missing key, or ANY value other than the exact
 * string "off-plan" (so "OFF-PLAN", true, null and "off-plan " are all NOT off-plan) behaves as
 * "always". For an ask-gate that is the safe direction - a broken config costs clicks, never
 * silence. `paths.plansDir` is read from the same config and falls back to the schema default
 * `docs/backlogs` when it is absent or is not a non-empty string.
 *
 * FAIL DIRECTION IS ASK, NOT DENY (the opposite of Gate 1 - see the asymmetry note in aiwf-lib.js).
 * An unparseable payload, an unreadable plans directory or any unexpected throw raises the dialog: a
 * deny here would block legitimate work, while the stake is only "the operator should look at this".
 *
 * Empirical basis (live PreToolUse payload, CLI 2.1.x): the subagent dispatch tool is
 * `tool_name: "Agent"` (NOT "Task"); its `tool_input` carries `subagent_type` next to
 * `description`/`prompt`/`model`/`run_in_background`; and `permissionDecision: "ask"` on an `Agent`
 * call renders a visible dialog.
 *
 * Accident/role protection, not adversary-proofing: in off-plan mode the ref is read from the prompt
 * the COO wrote, so a determined caller can always write a real ref. That is fine - this catches the
 * slip, not an attack.
 */
const fs = require('fs');
const path = require('path');
const lib = require('./aiwf-lib');

const WRITER_AGENT_TYPE = 'writer'; // matches `name:` in the generated writer agent file (same constant as Gate 1)
const OFF_PLAN = 'off-plan';        // the ONLY value that leaves "always"; compared as an exact string
const CONFIG_REL = path.join('.claude', 'aiwf-native', 'aiwf.config.json');
const DEFAULT_PLANS_DIR = 'docs/backlogs'; // the schema default for paths.plansDir
const TAG = '[AIWF gate 2: Writer dispatch]';
// The machine-readable brief convention (payload docs/WORKFLOW.md, "Ticket brief contract"): a
// dedicated line of its own, so a ref merely mentioned in prose cannot be mistaken for the ticket
// being worked.
const TICKET_LINE = /^[ \t]*Ticket:[ \t]*([A-Za-z0-9][A-Za-z0-9_-]*)[ \t]*$/m;
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// One-line label of what is being dispatched, for the dialog text. Never throws on a hostile payload.
function describe(ti) {
  const d = ti.description;
  return (typeof d === 'string' && d.trim() !== '') ? d.trim() : '(no description)';
}

// Same resolution as Gate 1/Gate 3 (pretooluse-mutation-guard.js): CLAUDE_PROJECT_DIR is what the
// harness launches us with; fall back to the hook's own location (scripts/engine/ -> payload root)
// so the hook also works when run directly (e.g. from the spikes and the self-check).
function projectDirOf() {
  const envDir = process.env.CLAUDE_PROJECT_DIR;
  return envDir && envDir.trim() !== '' ? envDir : path.resolve(__dirname, '..', '..');
}

// The project config, or null for every unusable state (absent, unreadable, not JSON, not an
// object). Both callers below treat null as "the factory answer", which is what keeps a broken
// config from being a way to make this gate quieter than it is configured to be.
function readProjectConfig(projectDir) {
  let raw;
  try {
    raw = fs.readFileSync(path.join(projectDir, CONFIG_REL), 'utf8');
  } catch (e) {
    return null; // no config layer, or unreadable -> factory behaviour
  }
  let config;
  try {
    config = JSON.parse(raw);
  } catch (e) {
    return null; // a corrupt config must not change how a gate behaves
  }
  return isPlainObject(config) ? config : null;
}

// "off-plan" or "always". Anything that is not the exact string "off-plan" is "always": no
// coercion, no case folding, no trimming.
function dispatchGateMode(config) {
  if (!config || !isPlainObject(config.enforcement)) return 'always';
  return config.enforcement.dispatchGate === OFF_PLAN ? OFF_PLAN : 'always';
}

// <projectDir>/<paths.plansDir>/active - the directory a plan ENTERS at approval. A missing,
// non-string or empty plansDir falls back to the schema's own default rather than guessing.
function plansDirOf(projectDir, config) {
  const configured = (config && isPlainObject(config.paths)) ? config.paths.plansDir : undefined;
  const rel = (typeof configured === 'string' && configured.trim() !== '') ? configured.trim() : DEFAULT_PLANS_DIR;
  return path.join(projectDir, rel, 'active');
}

// The off-plan branch: silent only when the brief names a ticket that really is in an active PLAN.
function offPlanDecision(ti, projectDir, config) {
  const m = typeof ti.prompt === 'string' ? TICKET_LINE.exec(ti.prompt) : null;
  if (!m) {
    return lib.askPreTool(
      'Writer dispatch with no ticket: the brief carries no "Ticket: <REF>" line, so this dispatch ' +
      'cannot be traced to a ticket in an active PLAN. Add the line to the brief, or approve if this ' +
      `dispatch is deliberate. ${TAG}`
    );
  }
  const ref = m[1];
  const activeDir = plansDirOf(projectDir, config);

  let entries = null;
  try {
    entries = fs.readdirSync(activeDir, { withFileTypes: true });
  } catch (e) {
    return lib.askPreTool(
      `Cannot verify ticket "${ref}": the active PLAN directory ${activeDir} is missing or unreadable ` +
      `(${e && e.message ? e.message : String(e)}). ${TAG}`
    );
  }

  // WHOLE-IDENTIFIER match, case-sensitive. A plain substring test would be wrong ("ABC-2" would
  // match "ABC-21" and clear a ref that is in no PLAN), and so is `\b`: the ref alphabet admitted by
  // TICKET_LINE is [A-Za-z0-9_-], while `-` is NOT a regex word character, so `\bDEMO-1\b` finds a
  // boundary in the middle of "DEMO-1-EXTRA" and in "X-DEMO-1" and clears both. The boundaries below
  // are therefore stated over the COMPLETE identifier alphabet: the ref matches only where it is not
  // glued to another ref character on either side.
  const refRe = new RegExp('(?<![A-Za-z0-9_-])' + escapeRe(ref) + '(?![A-Za-z0-9_-])');
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/^PLAN_.*\.md$/.test(entry.name)) continue;
    let text = '';
    try {
      text = fs.readFileSync(path.join(activeDir, entry.name), 'utf8');
    } catch (e) {
      continue; // one unreadable PLAN must not clear or block on its own; the others still decide.
    }
    if (refRe.test(text)) return lib.allowPassthrough(); // on plan -> silent, the common path
  }

  return lib.askPreTool(
    `Off-plan Writer dispatch: ticket "${ref}" appears in no active PLAN (searched PLAN_*.md in ` +
    `${activeDir}). Either the ticket is not in a plan yet, or the ref is a typo. Approve only if the ` +
    `dispatch is deliberate. ${TAG}`
  );
}

lib.runFailAsk(async () => {
  const input = lib.parseInput(await lib.readStdin());

  // Non-object payload: we cannot read the dispatch at all, so we cannot clear it either -> ask.
  if (!isPlainObject(input)) {
    return lib.askPreTool(
      'Cannot verify this dispatch: hook input is not an object, so the target subagent is unreadable. ' +
      'Approve only if you know what is being dispatched. [AIWF gate 2: Writer dispatch]'
    );
  }

  // Defensive: the hooks.json matcher is the exact string "Agent", so this should be unreachable.
  if (input.tool_name !== 'Agent') return lib.allowPassthrough();

  const ti = input.tool_input;
  if (!isPlainObject(ti)) {
    return lib.askPreTool(
      'Cannot verify this dispatch: tool_input is not an object, so the target subagent is unreadable. ' +
      '[AIWF gate 2: Writer dispatch]'
    );
  }

  // Only the Writer is gated - it is the only role that writes to the repo.
  if (ti.subagent_type !== WRITER_AGENT_TYPE) return lib.allowPassthrough();

  const projectDir = projectDirOf();
  const config = readProjectConfig(projectDir);
  if (dispatchGateMode(config) === OFF_PLAN) return offPlanDecision(ti, projectDir, config);

  return lib.askPreTool(
    `Writer dispatch: "${describe(ti)}". The Writer is the only role that writes implementation code, ` +
    `so starting it is an operator decision. Approve to hand the ticket over. ` +
    `[AIWF gate 2: Writer dispatch]`
  );
});
