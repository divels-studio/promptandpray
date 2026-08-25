'use strict';
/*
 * Gate 2 — every Writer dispatch is an operator click.
 *
 * PreToolUse(Agent). The Writer is the only role that writes implementation code, so handing work to
 * it is the moment the loop leaves planning and starts mutating the repo. That moment gets a native
 * Yes/No dialog, exactly like the commit gate: an operator gate that CAN be a native dialog IS a
 * native dialog, instead of a rule the orchestrating model has to remember.
 *
 *   - `tool_input.subagent_type === "writer"` -> `permissionDecision: "ask"` (visible dialog).
 *   - any other subagent type -> passthrough, silently. Reviewer, QA and every ad-hoc scan subagent
 *     are untouched by this gate, whatever their prompt says.
 *
 * FAIL DIRECTION IS ASK, NOT DENY (the opposite of Gate 1 — see the asymmetry note in aiwf-lib.js).
 * An unparseable payload or any unexpected throw raises the dialog: a deny here would block
 * legitimate work, while the stake is only "the operator should look at this".
 *
 * Empirical basis (live PreToolUse payload, CLI 2.1.x): the subagent dispatch tool is
 * `tool_name: "Agent"` (NOT "Task"); its `tool_input` carries `subagent_type` next to
 * `description`/`prompt`/`model`/`run_in_background`; and `permissionDecision: "ask"` on an `Agent`
 * call renders a visible dialog.
 *
 * Accident/role protection, not adversary-proofing: it catches the slip, not an attack.
 */
const lib = require('./aiwf-lib');

const WRITER_AGENT_TYPE = 'writer'; // matches `name:` in the generated writer agent file (same constant as Gate 1)
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// One-line label of what is being dispatched, for the dialog text. Never throws on a hostile payload.
function describe(ti) {
  const d = ti.description;
  return (typeof d === 'string' && d.trim() !== '') ? d.trim() : '(no description)';
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

  // Only the Writer is gated — it is the only role that writes to the repo.
  if (ti.subagent_type !== WRITER_AGENT_TYPE) return lib.allowPassthrough();

  return lib.askPreTool(
    `Writer dispatch: "${describe(ti)}". The Writer is the only role that writes implementation code, ` +
    `so starting it is an operator decision. Approve to hand the ticket over. ` +
    `[AIWF gate 2: Writer dispatch]`
  );
});
