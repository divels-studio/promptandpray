#!/usr/bin/env node
/*
 * /pnp:roles - the audit table: show it, change it, reset a row. The whole picture on one screen,
 * and one command to change any of it without a re-interview.
 *
 * WHAT IT OWNS
 *   `aiwf.config.json` roles.* and review.* (the three review classes plan/code/docs), and the
 *   artifacts rendered from them:
 *     .claude/aiwf-native/roles.json   always
 *     .claude/agents/writer.md         always
 *     .claude/agents/reviewer.md       when the Reviewer role OR any review row is claude-hosted
 *     .claude/agents/qa.md             when the QA role is claude-hosted
 *   Nothing else. It never touches CLAUDE.md, the overrides document, settings.json or the
 *   migration bookkeeping's version stamps.
 *
 * TWO PHASES, AND WHAT THE GUARANTEE ACTUALLY IS
 *   Phase 1 decides everything and writes NOTHING: the new config is built, validated against the
 *   payload schema, every artifact is rendered and classified against the two-hash bookkeeping. Any
 *   refusal there ends the run with ZERO writes - so a rejected `--set` leaves the project exactly
 *   as it was, and a run with two `--set` pairs where the second is bad applies neither.
 *
 *   Phase 2 is PLAN-BEFORE-WRITE, NOT A TRANSACTION. This is the same honest guarantee /pnp:setup
 *   gives (scripts/setup/generate.mjs applies its plan as a sequence of writeFileSync/rmSync calls):
 *   there is no journal here and no rollback. The write order is fixed - every agent-file operation
 *   (writes AND removes), then roles.json, then aiwf.config.json (the config and its bookkeeping in
 *   ONE file, LAST) - so a crash between two writes leaves an artifact whose stamp is not yet
 *   updated. That state is
 *   visible (`/pnp:selfcheck` reports it as a drifted managed artifact) and recoverable by simply
 *   running the SAME command again: phase 1 then finds `sha(actual) == sha(the render I want)`,
 *   takes the already-applied branch, and finishes by stamping the file it does not need to write.
 *   A journal would buy exactly that, at the price of a second recovery state machine.
 *
 * WHAT IT REFUSES (exit 1, nothing written)
 *   - a resulting config the payload schema rejects (including `passes` outside its range);
 *   - an artifact HELD by the operator (`override: true`) - `/pnp:update --resolve <key>` is that
 *     door, and it is the operator's to open;
 *   - an artifact EDITED by hand that does not already equal the render this run wants;
 *   - a file at an artifact's path that this engine never wrote and that differs from the render;
 *   - a STALE agent file (the role is no longer claude-hosted) without --confirm-remove-stale;
 *   - `<row>.effort=` on a Claude row: every Claude-hosted review pass runs through the ONE
 *     rendered reviewer agent, whose effort is roles.reviewer.effort, because the Agent tool has no
 *     per-invocation effort. A value nothing reads is not a setting;
 *   - `<target>.engine=codex` with no model, when the Reviewer is not codex either.
 *
 * EXIT CODES (one contract)
 *   0  shown, or written
 *   1  refused - see above; nothing was written
 *   2  the run could not start, or the command line could not be understood: an unknown flag,
 *      target or field, an unparseable value (`passes=x`, `enabled=maybe`), no installation here
 *
 * CRASH INJECTION (test-only, production-inert)
 *   PNP_ROLES_CRASH_AT="<project-relative path>" makes the process exit 86 the instant that file's
 *   phase-2 write completes. Without the variable nothing here reads it twice and no branch changes.
 *
 * CLI
 *   node aiwf-roles.mjs --show
 *   node aiwf-roles.mjs --set <target>.<field>=<value> [--set ...] [--confirm-remove-stale]
 *   node aiwf-roles.mjs --reset <plan|code|docs> [--confirm-remove-stale]
 *     common: [--project-root <dir>] [--plugin-root <dir>] [--no-selfcheck] [--quiet]
 *     target ::= writer | reviewer | qa | qal | plan | code | docs
 *     field  ::= engine | model | effort | passes | enabled
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIG_REL, ROLES_REL, DEFAULT_PLUGIN_ROOT, REVIEW_CLASSES,
  effectiveReviewRow, jsonText, lf, orderConfig, renderTemplate, resolveProjectRoot,
  reviewerAgentRendered, sha256, templateContext,
} from './generate.mjs';
import { formatErrors, loadSchema, validate } from './validate-config.mjs';
import { finishWithSelfCheck } from '../selfcheck/run-selfcheck.mjs';

const AGENTS_DIR = '.claude/agents';
const TOP_TIER = 'fable';
const TIER_ALIASES = ['fable', 'opus', 'sonnet', 'haiku'];
const ROLE_TARGETS = ['writer', 'reviewer', 'qa', 'qal'];
const TARGETS = [...ROLE_TARGETS, ...REVIEW_CLASSES];
const FIELDS = ['engine', 'model', 'effort', 'passes', 'enabled'];
// Which fields each target really has. A field that exists in the vocabulary but not on this target
// is a USAGE error (exit 2), not a refusal: `writer.engine` names something that has never existed.
const FIELDS_BY_TARGET = {
  writer: ['model', 'effort'],
  reviewer: ['engine', 'model', 'effort'],
  qa: ['engine', 'model', 'effort'],
  qal: ['enabled', 'engine', 'model', 'effort'],
  plan: ['passes', 'engine', 'model', 'effort'],
  code: ['passes', 'engine', 'model', 'effort'],
  docs: ['passes', 'engine', 'model', 'effort'],
};
const CLAUDE_ROW_EFFORT_NOTE = "the Reviewer's - Claude rows share the agent file";

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const toPosix = (p) => p.split(path.sep).join('/');
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

/** Refused: the command was understood, the answer is no. Nothing has been written. */
export class RolesRefusal extends Error {}
/** The run could not start, or the command line could not be understood. */
export class RolesUsageError extends Error {}

// ---------------------------------------------------------------------------
// Parsing one `<target>.<field>=<value>` assignment
// ---------------------------------------------------------------------------
/**
 * Nothing is guessed. An unknown target or field, a field the target does not have, and a value
 * that is not of the field's type are all USAGE errors - the caller wrote something this command
 * has no meaning for, and inventing one would change a setting they did not ask for.
 */
export function parseAssignment(text) {
  const eq = text.indexOf('=');
  if (eq === -1) {
    throw new RolesUsageError(`--set needs <target>.<field>=<value>, found "${text}".`);
  }
  const address = text.slice(0, eq);
  const raw = text.slice(eq + 1);
  const dot = address.indexOf('.');
  if (dot === -1) {
    throw new RolesUsageError(`--set address "${address}" is not <target>.<field> (targets: ${TARGETS.join('|')}).`);
  }
  const target = address.slice(0, dot);
  const field = address.slice(dot + 1);
  if (!TARGETS.includes(target)) {
    throw new RolesUsageError(`unknown target "${target}" (expected one of: ${TARGETS.join('|')}).`);
  }
  if (!FIELDS.includes(field)) {
    throw new RolesUsageError(`unknown field "${field}" (expected one of: ${FIELDS.join('|')}).`);
  }
  if (!FIELDS_BY_TARGET[target].includes(field)) {
    throw new RolesUsageError(
      `"${target}" has no "${field}" field (it has: ${FIELDS_BY_TARGET[target].join(', ')}).`,
    );
  }
  let value = raw;
  if (field === 'passes') {
    if (!/^-?[0-9]+$/.test(raw)) throw new RolesUsageError(`"${address}=${raw}": passes is a count, so it must be an integer.`);
    value = Number(raw);
  } else if (field === 'enabled') {
    if (raw !== 'true' && raw !== 'false') throw new RolesUsageError(`"${address}=${raw}": enabled is a boolean, so it must be exactly "true" or "false".`);
    value = raw === 'true';
  } else if (raw.trim() === '') {
    throw new RolesUsageError(`"${address}=": ${field} cannot be empty.`);
  }
  return { target, field, value, text };
}

// ---------------------------------------------------------------------------
// The three legal row shapes
// ---------------------------------------------------------------------------
/**
 * A review row is exactly one of:
 *   { passes }                                     inherited - the Reviewer role, whole
 *   { passes, engine: "claude", model }            a Claude host, no effort of its own
 *   { passes, engine: "codex",  model, effort }    a Codex host, its own effort
 * Anything else is refused. The schema enforces most of it, but two rules need `not` (which this
 * project's schema interpreter deliberately does not implement) and live here plus in the
 * self-check's `review-row-shape` assertion: no `effort` on a Claude row, and no host field at all
 * on an inherited one.
 */
export function rowShapeError(cls, row) {
  if (!isPlainObject(row)) return `review.${cls} is not an object.`;
  const keys = Object.keys(row);
  const unknown = keys.filter((k) => !['passes', 'engine', 'model', 'effort'].includes(k));
  if (unknown.length) return `review.${cls} carries unknown field(s) ${unknown.join(', ')}.`;
  if (!Object.prototype.hasOwnProperty.call(row, 'passes')) return `review.${cls} has no "passes".`;
  if (row.engine === undefined) {
    const stray = keys.filter((k) => k === 'model' || k === 'effort');
    if (stray.length) {
      return `review.${cls} has ${stray.join(' and ')} but no engine - a host is engine+model together, `
        + `so set ${cls}.engine= in the same call or use --reset ${cls} to go back to the Reviewer.`;
    }
    return null;
  }
  if (row.engine === 'claude') {
    if (Object.prototype.hasOwnProperty.call(row, 'effort')) {
      return `review.${cls} is a Claude row and carries its own "effort" (${CLAUDE_ROW_EFFORT_NOTE}).`;
    }
    if (!TIER_ALIASES.includes(row.model)) return `review.${cls} is a Claude row, so its model must be a tier alias (${TIER_ALIASES.join('|')}).`;
    return null;
  }
  if (row.engine === 'codex') {
    if (typeof row.model !== 'string' || row.model.trim() === '') return `review.${cls} is a Codex row with no model.`;
    if (typeof row.effort !== 'string' || row.effort.trim() === '') return `review.${cls} is a Codex row with no effort.`;
    return null;
  }
  return `review.${cls} has an unknown engine "${row.engine}".`;
}

/** A row in its canonical field ORDER, so a re-run produces byte-identical JSON. */
function orderRow(row) {
  const out = {};
  for (const key of ['passes', 'engine', 'model', 'effort']) {
    if (Object.prototype.hasOwnProperty.call(row, key)) out[key] = row[key];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Applying the assignments to a config
// ---------------------------------------------------------------------------
/**
 * Returns the NEW config (the input is never mutated) plus the lines to print about the defaults
 * this applied. Every rule that cannot live in the schema is here, and each one refuses rather than
 * guesses.
 *
 * ORDER OF APPLICATION, and it is FIXED rather than the order the flags were typed in:
 *   1. every `--reset <row>`, collapsing those rows back to `{ passes }`;
 *   2. the ROLE targets, in the order writer, reviewer, qa, qal;
 *   3. the ROW targets, in the order plan, code, docs.
 * Rows come last because a row's codex default reads `roles.reviewer` - so a run that changes both
 * the Reviewer and a row must have the row read the Reviewer this run ENDS with, not the one it
 * started from. Anything else makes one command line mean two different things depending on which
 * `--set` was typed first.
 */
export function applyChanges(config, { sets = [], resets = [] }) {
  const next = JSON.parse(JSON.stringify(config));
  const notes = [];
  if (!isPlainObject(next.roles) || !isPlainObject(next.roles.reviewer)) {
    throw new RolesRefusal('this config carries no roles.reviewer block, so there is no Reviewer to inherit from or compare against.');
  }
  if (!isPlainObject(next.review)) next.review = {};

  for (const cls of resets) {
    const row = isPlainObject(next.review[cls]) ? next.review[cls] : {};
    if (!Object.prototype.hasOwnProperty.call(row, 'passes')) {
      throw new RolesRefusal(`--reset ${cls}: this config has no review.${cls} row to reset - run /pnp:update first.`);
    }
    next.review[cls] = { passes: row.passes };
    notes.push(`${cls}: reset to the Reviewer (inherited engine, model and effort).`);
  }

  // Grouped by target, because "engine with no model" is a question about the WHOLE invocation:
  // `--set docs.engine=codex --set docs.model=x` supplies one, and a default must not fire then.
  const byTarget = new Map();
  for (const s of sets) {
    if (!byTarget.has(s.target)) byTarget.set(s.target, []);
    byTarget.get(s.target).push(s);
  }

  // A FIXED ORDER, never the order the flags happened to arrive in: the ROLE targets
  // (writer, reviewer, qa, qal) are applied before the ROW targets (plan, code, docs).
  // A row's codex default reads `next.roles.reviewer`, so with first-seen ordering
  //   --set docs.engine=codex --set reviewer.engine=codex --set reviewer.model=X
  // refused (the row looked at the not-yet-updated claude Reviewer) while the same three
  // assignments in the reverse order succeeded. One command line, two outcomes, decided by typing
  // order - so the order is pinned here and a row always reads the Reviewer this run ends with.
  const orderedTargets = TARGETS.filter((t) => byTarget.has(t));
  for (const target of orderedTargets) {
    const assignments = byTarget.get(target);
    const isRow = REVIEW_CLASSES.includes(target);
    const container = isRow ? next.review : next.roles;
    if (!isPlainObject(container[target])) {
      throw new RolesRefusal(`this config carries no ${isRow ? `review.${target}` : `roles.${target}`} block - run /pnp:update first.`);
    }
    const node = { ...container[target] };
    const given = new Set(assignments.map((a) => a.field));

    // The Claude-row effort refusal comes FIRST: it must fire on the row as the operator is asking
    // for it, whether the row is already Claude-hosted or is being made one in this same call.
    if (isRow && given.has('effort')) {
      const engineNow = given.has('engine') ? assignments.find((a) => a.field === 'engine').value : node.engine;
      if (engineNow === 'claude' || (engineNow === undefined && next.roles.reviewer.engine === 'claude')) {
        throw new RolesRefusal(
          `${target}.effort cannot be set on a Claude row (${CLAUDE_ROW_EFFORT_NOTE}): every Claude-hosted pass is `
          + 'dispatched through the one rendered reviewer agent, and the Agent tool has no per-invocation effort. '
          + 'Change roles.reviewer.effort instead.',
        );
      }
    }

    for (const a of assignments) node[a.field] = a.value;

    // `--set X.engine=` with no model in the same call: the ONE place a default is filled in, and it
    // is printed. claude -> the top tier, because an auditor below the author is not an audit.
    // codex -> the Reviewer's own codex model+effort when there is one, and a refusal otherwise:
    // there is no safe guess at an external engine's model id.
    if (given.has('engine') && !given.has('model')) {
      const reviewer = next.roles.reviewer;
      if (node.engine === 'claude') {
        node.model = TOP_TIER;
        notes.push(`${target}.model was not given, so it is "${TOP_TIER}" - the top tier.`);
      } else if (node.engine === 'codex') {
        if (reviewer.engine === 'codex') {
          node.model = reviewer.model;
          node.effort = reviewer.effort;
          notes.push(`${target} took the Reviewer's codex host: model "${reviewer.model}", effort "${reviewer.effort}".`);
        } else {
          throw new RolesRefusal(`codex needs a model id, e.g. ${target}.model=gpt-5.6-sol (the Reviewer is not codex-hosted, so there is nothing to copy).`);
        }
      }
    }
    // A Claude row never carries an effort - not even one inherited from a previous codex host.
    if (isRow && node.engine === 'claude') delete node.effort;
    // A claude-hosted ROLE keeps its own effort (it has its own agent file); only rows share one.
    container[target] = isRow ? orderRow(node) : node;
  }

  for (const cls of REVIEW_CLASSES) {
    if (!isPlainObject(next.review[cls])) continue;
    const bad = rowShapeError(cls, next.review[cls]);
    if (bad) throw new RolesRefusal(bad);
  }
  return { config: next, notes };
}

// ---------------------------------------------------------------------------
// Phase 1 - decide everything, write nothing
// ---------------------------------------------------------------------------
const AGENT_OF = { writer: 'writer.md', reviewer: 'reviewer.md', qa: 'qa.md' };

/** Which claude agent files THIS config implies. reviewer follows the role OR any review row. */
export function claudeAgents(config) {
  return {
    writer: true,
    reviewer: reviewerAgentRendered(config),
    qa: isPlainObject(config.roles) && isPlainObject(config.roles.qa) && config.roles.qa.engine === 'claude',
  };
}

function renderArtifacts(pluginRoot, projectRoot, config) {
  const payloadHalf = { ...config };
  delete payloadHalf.$schema;
  delete payloadHalf._aiwf;
  const context = templateContext(payloadHalf, projectRoot);
  const tmpl = (...rel) => {
    const file = path.join(pluginRoot, 'templates', ...rel);
    const text = readText(file);
    if (text === null) throw new RolesUsageError(`missing payload template templates/${rel.join('/')}.`);
    return text;
  };
  const wanted = claudeAgents(config);
  const artifacts = [{ key: toPosix(ROLES_REL), rel: ROLES_REL, content: renderTemplate(tmpl('roles.json.tmpl'), context) }];
  try { JSON.parse(artifacts[0].content); } catch (e) {
    throw new RolesRefusal(`the rendered roles.json is not valid JSON (${e.message}) - check the values you set.`);
  }
  const stale = [];
  for (const role of ['writer', 'reviewer', 'qa']) {
    const rel = path.join('.claude', 'agents', AGENT_OF[role]);
    const key = `${AGENTS_DIR}/${AGENT_OF[role]}`;
    if (wanted[role]) {
      artifacts.push({ key, rel, content: renderTemplate(tmpl('agents', `${role}.md.tmpl`), context) });
    } else {
      stale.push({ key, rel, role });
    }
  }
  return { artifacts, stale };
}

/**
 * Classifies one artifact against the two-hash bookkeeping and the render this run wants.
 * Returns { action, entry, why } or throws a RolesRefusal. `action` is 'write' | 'stamp' | 'none'.
 */
export function classifyArtifact({ key, actual, previous, render }) {
  const renderHash = sha256(render);
  const entry = { upstream: renderHash, local: renderHash, override: false };

  if (!isPlainObject(previous)) {
    if (actual === null) return { action: 'write', entry, why: 'created' };
    // A file this engine never wrote. Identical to the render is not a takeover, it is a fact;
    // anything else is somebody's file at an address this command is about to write.
    if (sha256(actual) === renderHash) return { action: 'stamp', entry, why: 'already exactly the render - adopted into the bookkeeping' };
    throw new RolesRefusal(
      `${key}: a file I did not write is in the way - move it aside, or run /pnp:setup --adopt to take ownership of it deliberately.`,
    );
  }
  if (previous.override === true) {
    throw new RolesRefusal(
      `${key} is held by you (override) - use \`/pnp:update --resolve ${key}\`, which is the door out of a hold. Nothing was written.`,
    );
  }
  if (actual === null) {
    throw new RolesRefusal(
      `${key} is recorded in _aiwf.managedRegions but is GONE from disk. A deletion is a manual edit, and this command `
      + `never silently recreates a managed artifact - resolve it with \`/pnp:update --resolve ${key}\`.`,
    );
  }
  const actualHash = sha256(actual);
  if (actualHash !== previous.local) {
    // ALREADY-APPLIED comes first, and it is the whole recovery story of a crash between the two
    // phase-2 writes: the file on disk already IS the render this run wants, so nothing is at risk
    // and nothing is asked - only the stamp is completed.
    if (actualHash === renderHash) return { action: 'stamp', entry, why: 'already applied - the stamp was completed' };
    throw new RolesRefusal(
      `${key} was edited by hand (its content no longer matches the recorded local hash). Nothing was overwritten - `
      + `resolve it first with \`/pnp:update --resolve ${key}\`.`,
    );
  }
  if (actualHash === renderHash) return { action: 'none', entry, why: 'unchanged' };
  return { action: 'write', entry, why: 're-rendered from the config' };
}

/**
 * The whole decision. Returns { config, writes, removes, regions, notes, changed } and touches
 * nothing on disk. `writes` is an ordered list - agent files first, roles.json last - and the
 * config write is the caller's, always after all of them.
 */
export function planRoles({ pluginRoot, projectRoot, config, schema, sets = [], resets = [], confirmRemoveStale = false }) {
  const bk = config._aiwf;
  if (!isPlainObject(bk) || !isPlainObject(bk.managedRegions)) {
    throw new RolesUsageError(`${toPosix(CONFIG_REL)} carries no _aiwf.managedRegions bookkeeping - this is not a project /pnp:setup installed.`);
  }
  const applied = applyChanges(config, { sets, resets });
  const nextConfig = orderConfig(applied.config);

  const errors = validate(nextConfig, schema);
  if (errors.length) {
    throw new RolesRefusal(`that would produce a config the payload schema rejects, so nothing was written:\n${formatErrors(errors)}`);
  }

  const { artifacts, stale } = renderArtifacts(pluginRoot, projectRoot, nextConfig);
  const regions = { ...bk.managedRegions };
  const writes = [];
  const removes = [];
  const notes = [...applied.notes];

  for (const artifact of artifacts) {
    const abs = path.join(projectRoot, artifact.rel);
    const decision = classifyArtifact({
      key: artifact.key,
      actual: readText(abs),
      previous: bk.managedRegions[artifact.key],
      render: artifact.content,
    });
    regions[artifact.key] = decision.entry;
    if (decision.action === 'write') writes.push({ key: artifact.key, rel: artifact.rel, file: abs, content: artifact.content, why: decision.why });
    else if (decision.action === 'stamp') notes.push(`${artifact.key}: ${decision.why}`);
  }

  // A STALE agent file: the role is no longer claude-hosted, so this configuration renders nothing
  // at that path. FOUR conditions before it is deleted: it is not HELD by the operator, it is
  // recorded as ours, it still hashes to what we recorded, and the operator passed the flag - which
  // confirms removing THAT file, not whatever happens to sit there.
  for (const { key, rel, role } of stale) {
    const abs = path.join(projectRoot, rel);
    const actual = readText(abs);
    const previous = bk.managedRegions[key];
    if (actual === null) { delete regions[key]; continue; }
    if (!isPlainObject(previous)) {
      throw new RolesRefusal(`${key} exists but is not recorded in _aiwf.managedRegions, and the ${role} host is not Claude any more - this command will not delete a file it did not write. Move it aside and re-run.`);
    }
    // HELD FIRST - before the hash check and before the flag, and that ORDER is the whole point.
    // `override: true` means the operator went through a conflict dialog and kept this file, so its
    // content MATCHES `local` by construction: a hash check alone waves a held artifact straight
    // through to deletion, and --confirm-remove-stale then silently answers a question the operator
    // already answered the other way. Leaving a hold is `/pnp:update --resolve`, and nothing else.
    if (previous.override === true) {
      throw new RolesRefusal(
        `${key} is HELD by you (override), so it is not a stale render this command may delete - not even with `
        + `--confirm-remove-stale, and not even though the ${role} host is no longer Claude. Leaving a hold is a `
        + `decision of yours: reopen it with \`/pnp:update --resolve ${key}\`. Nothing was written.`,
      );
    }
    if (sha256(actual) !== previous.local) {
      throw new RolesRefusal(`${key} is a stale render that was ALSO edited by hand, so it is not the file the removal flag confirms. Nothing was deleted - resolve it with \`/pnp:update --resolve ${key}\`.`);
    }
    if (!confirmRemoveStale) {
      throw new RolesRefusal(`${key} is now a STALE render (the ${role} host is not Claude any more) and must not stay behind - the self-check fails on it. Nothing was deleted: re-run with --confirm-remove-stale to remove it.`);
    }
    removes.push({ key, rel, file: abs });
    delete regions[key];
  }

  const finalConfig = orderConfig({ ...nextConfig, _aiwf: { ...bk, managedRegions: regions } });
  const configText = jsonText(finalConfig);
  const currentText = readText(path.join(projectRoot, CONFIG_REL));
  const configChanged = currentText === null || lf(currentText) !== lf(configText);
  return {
    config: finalConfig,
    configText,
    configChanged,
    writes,
    removes,
    notes,
    changed: writes.length > 0 || removes.length > 0 || configChanged,
  };
}

// ---------------------------------------------------------------------------
// Phase 2 - the fixed write order
// ---------------------------------------------------------------------------
// Inert unless PNP_ROLES_CRASH_AT names exactly this artifact. Read fresh each time so a test can
// set it per child process; nothing else in this file branches on it.
function crashPoint(key) {
  const spec = process.env.PNP_ROLES_CRASH_AT;
  if (spec && spec === key) {
    process.stderr.write(`pnp-roles: PNP_ROLES_CRASH_AT=${spec} - exiting 86 immediately after that write.\n`);
    process.exit(86);
  }
}

export function applyRoles({ projectRoot, plan }) {
  const applied = [];
  // THE FIXED ORDER, and it is THREE stages, not two:
  //   1. every AGENT-FILE operation - writes AND removes together, because both are changes to the
  //      same class of artifact and roles.json is what tells a reader which of them should exist;
  //   2. roles.json;
  //   3. aiwf.config.json (the config and its bookkeeping, in ONE file, LAST).
  // Removing a stale agent AFTER roles.json would leave a window where roles.json already says the
  // host is codex while the Claude agent file is still on disk - the exact stale-render state the
  // self-check fails on, reached on the way through rather than only by a crash.
  // A crash between any two stages leaves an artifact whose stamp is not yet written: visible to the
  // self-check, and finished by re-running the same command (the already-applied branch of phase 1).
  const agentWrites = plan.writes.filter((w) => w.key !== toPosix(ROLES_REL));
  const rolesWrites = plan.writes.filter((w) => w.key === toPosix(ROLES_REL));
  const write = (w, why) => {
    fs.mkdirSync(path.dirname(w.file), { recursive: true });
    fs.writeFileSync(w.file, lf(w.content), 'utf8');
    applied.push(`write  ${w.key}  (${why || w.why})`);
    crashPoint(w.key);
  };

  for (const w of agentWrites) write(w);
  for (const r of plan.removes) {
    fs.rmSync(r.file, { force: true });
    applied.push(`remove ${r.key}  (stale render, removal confirmed)`);
    crashPoint(r.key);
  }
  for (const w of rolesWrites) write(w);
  if (plan.configChanged) {
    const file = path.join(projectRoot, CONFIG_REL);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, lf(plan.configText), 'utf8');
    applied.push(`write  ${toPosix(CONFIG_REL)}  (config + bookkeeping, last)`);
    crashPoint(toPosix(CONFIG_REL));
  }
  return applied;
}

// ---------------------------------------------------------------------------
// --show: the whole picture on one screen
// ---------------------------------------------------------------------------
const DASH = '-';

function roleLine(label, role, notes) {
  if (!isPlainObject(role)) return { label, host: DASH, model: DASH, effort: DASH, passes: DASH, notes };
  const host = role.engine || 'claude';
  return { label, host, model: role.model || DASH, effort: role.effort || DASH, passes: DASH, notes };
}

/**
 * The table. It is the answer to "who audits what", so every cell is a resolved value, never a
 * template: an inherited row prints the Reviewer's host because that is what will really run.
 *
 * Two markers earn their place:
 *   `(the Reviewer's)` on a Claude row's effort - the row has no effort of its own and the number
 *     shown is the agent file's, so a reader does not go looking for a setting that is not there;
 *   `(below the top tier)` on a Claude auditor whose model is not the top tier - the Reviewer role
 *     and the review rows only. QA is deliberately NOT marked: QA compares artifacts against
 *     acceptance criteria, it does not audit decisions, so a mid-tier QA is an ordinary choice.
 */
export function showLines(config) {
  const roles = isPlainObject(config.roles) ? config.roles : {};
  const cap = (isPlainObject(config.loop) && config.loop.correctionRoundsCap) || 2;
  const rows = [];
  rows.push(roleLine('writer', roles.writer, DASH));
  const reviewerRow = roleLine('reviewer', roles.reviewer, DASH);
  // The Reviewer role carries the same "auditor is never below the author" marker as the rows.
  if (isPlainObject(roles.reviewer) && roles.reviewer.engine === 'claude' && roles.reviewer.model !== TOP_TIER) {
    reviewerRow.model = `${roles.reviewer.model} (below the top tier)`;
  }
  rows.push(reviewerRow);
  rows.push(roleLine('qa', roles.qa, 'runtime/UI tickets only'));
  const qal = isPlainObject(roles.qal) ? roles.qal : null;
  rows.push(qal && qal.enabled === true
    ? { label: 'qal', host: qal.engine, model: qal.model, effort: qal.effort, passes: DASH, notes: 'operator-gated' }
    : { label: 'qal', host: 'off', model: DASH, effort: DASH, passes: DASH, notes: 'operator-gated' });

  const CLASS_LABEL = { plan: 'plan', code: 'code (R2/R3)', docs: 'docs (R2)' };
  const CLASS_NOTE = {
    plan: '+1 with your word; fact-check before each pass',
    code: `correction rounds cap ${cap}; fact-check before each pass`,
    docs: 'fact-check before each pass',
  };
  for (const cls of REVIEW_CLASSES) {
    const row = effectiveReviewRow(config, cls);
    if (!row) {
      rows.push({ label: CLASS_LABEL[cls], host: DASH, model: DASH, effort: DASH, passes: DASH, notes: 'no review.' + cls + ' row - run /pnp:update' });
      continue;
    }
    if (row.passes === 0) {
      rows.push({ label: CLASS_LABEL[cls], host: DASH, model: DASH, effort: DASH, passes: '0', notes: 'no auditor' });
      continue;
    }
    const marked = row.engine === 'claude' && row.model !== TOP_TIER ? `${row.model} (below the top tier)` : row.model;
    const effort = row.engine === 'claude' ? `${row.effort} (${CLAUDE_ROW_EFFORT_NOTE})` : row.effort;
    rows.push({ label: CLASS_LABEL[cls], host: row.engine, model: marked, effort, passes: String(row.passes), notes: CLASS_NOTE[cls] });
  }
  rows.push({ label: 'fact-check', host: 'claude', model: 'sonnet', effort: DASH, passes: 'always', notes: 'not configurable' });
  rows.push({ label: 'R1', host: DASH, model: DASH, effort: DASH, passes: '0', notes: 'no auditor' });

  const header = { label: 'role/class', host: 'host', model: 'model', effort: 'effort', passes: 'passes', notes: 'notes' };
  const all = [header, ...rows];
  const width = (key) => Math.max(...all.map((r) => String(r[key]).length));
  const w = { label: width('label'), host: width('host'), model: width('model'), effort: width('effort'), passes: width('passes') };
  const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - String(s).length));
  return all.map((r) => (
    `${pad(r.label, w.label)}  ${pad(r.host, w.host)}  ${pad(r.model, w.model)}  ${pad(r.effort, w.effort)}  ${pad(r.passes, w.passes)}  ${r.notes}`
  ).replace(/\s+$/, ''));
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
export function parseArgv(argv) {
  const out = { show: false, sets: [], resets: [], confirmRemoveStale: false, projectRoot: null, pluginRoot: null, quiet: false, noSelfcheck: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const value = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new RolesUsageError(`${a} needs a value.`);
      i += 1;
      return v;
    };
    if (a === '--show') out.show = true;
    else if (a === '--set') out.sets.push(parseAssignment(value()));
    else if (a === '--reset') {
      const cls = value();
      if (!REVIEW_CLASSES.includes(cls)) throw new RolesUsageError(`--reset takes a review class (${REVIEW_CLASSES.join('|')}), found "${cls}".`);
      out.resets.push(cls);
    } else if (a === '--confirm-remove-stale') out.confirmRemoveStale = true;
    else if (a === '--project-root') out.projectRoot = value();
    else if (a === '--plugin-root') out.pluginRoot = value();
    else if (a === '--quiet') out.quiet = true;
    else if (a === '--no-selfcheck') out.noSelfcheck = true;
    else throw new RolesUsageError(`unknown flag "${a}". Usage: --show | --set <target>.<field>=<value> | --reset <plan|code|docs>.`);
  }
  const writing = out.sets.length > 0 || out.resets.length > 0;
  if (!out.show && !writing) throw new RolesUsageError('nothing to do: pass --show, --set <target>.<field>=<value>, or --reset <plan|code|docs>.');
  if (out.show && writing) throw new RolesUsageError('--show is a read-only report; run it on its own, and it is printed after a --set anyway.');
  const dup = out.sets.map((s) => `${s.target}.${s.field}`).filter((k, i, arr) => arr.indexOf(k) !== i);
  if (dup.length) throw new RolesUsageError(`the same address was set twice (${[...new Set(dup)].join(', ')}) - one value per field per run.`);
  return out;
}

function isMain() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return invoked === path.resolve(fileURLToPath(import.meta.url));
}

if (isMain()) {
  let opts;
  try { opts = parseArgv(process.argv.slice(2)); } catch (e) {
    console.error(`pnp-roles: ${e.message}`);
    process.exit(2);
  }
  const pluginRoot = path.resolve(opts.pluginRoot || DEFAULT_PLUGIN_ROOT);
  const projectRoot = resolveProjectRoot(opts.projectRoot);
  try {
    if (!projectRoot) throw new RolesUsageError('cannot resolve the project root - pass --project-root <dir> (this directory is not a git worktree).');
    const configFile = path.join(projectRoot, CONFIG_REL);
    const raw = readText(configFile);
    if (raw === null) throw new RolesUsageError(`no PromptAndPray installation in ${projectRoot} (${toPosix(CONFIG_REL)} is missing) - run /pnp:setup.`);
    let config;
    try { config = JSON.parse(raw); } catch (e) {
      throw new RolesUsageError(`${toPosix(CONFIG_REL)} is not valid JSON (${e.message}) - nothing is written over a config that cannot be read.`);
    }

    if (opts.show) {
      for (const line of showLines(config)) console.log(line);
      process.exit(0);
    }

    const schema = loadSchema(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json'));
    const plan = planRoles({
      pluginRoot, projectRoot, config, schema,
      sets: opts.sets, resets: opts.resets, confirmRemoveStale: opts.confirmRemoveStale,
    });
    const applied = applyRoles({ projectRoot, plan });
    if (!opts.quiet) {
      for (const n of plan.notes) console.log(`  note   ${n}`);
      if (applied.length === 0) console.log('no changes - the project layer already matches the config.');
      else for (const line of applied) console.log(`  ${line}`);
      console.log('');
    }
    const code = finishWithSelfCheck({
      pluginRoot, projectRoot, code: 0,
      wouldRun: applied.length > 0,
      skipped: opts.noSelfcheck,
      quiet: opts.quiet,
      subject: 'the roles and the audit table',
    });
    if (code === 0 && !opts.quiet) {
      console.log('');
      for (const line of showLines(plan.config)) console.log(line);
    }
    process.exit(code);
  } catch (e) {
    console.error(`pnp-roles: ${e.message}`);
    process.exit(e instanceof RolesUsageError ? 2 : 1);
  }
}
