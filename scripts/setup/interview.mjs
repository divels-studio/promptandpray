#!/usr/bin/env node
/*
 * Setup interview - the interactive half of /pnp:setup, and its CI entrypoint.
 *
 * WHAT IT ASKS
 *   Exactly the config keys that carry an operator character: project identity, the OS channel,
 *   the operator channel (language + role nicknames), the roles (engine / model / effort per role),
 *   the VERIFY commands, the E2E proof surface, the paths, and the product-boundary lines. Every
 *   default it offers is READ FROM THE SCHEMA (`default` keywords) or, on a re-run, from the config
 *   already installed - so a value the operator edited by hand survives a re-interview instead of
 *   being quietly reset to the factory value.
 *
 * WHAT IT REFUSES
 *   os != windows, fail-closed: only the PowerShell wrappers ship before 1.0, and generating an
 *   installation this version cannot run would be worse than refusing. The schema still admits the
 *   three channels - the format is not what is missing.
 *
 * NON-INTERACTIVE
 *   --answers-file <json> skips every question and uses the file as the answers object (the CI and
 *   test path). The two paths converge on the same generator, so a scripted install and an
 *   interactive one cannot drift apart.
 *
 * CLI
 *   node interview.mjs [--answers-file <json>] [--project-root <dir>] [--plugin-root <dir>]
 *                      [--confirm-remove-stale] [--dry-run] [--no-seeds]
 *   exit 0 = installed; exit 1 = refused or blocked (nothing written); exit 2 = cannot start.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadSchema, collectDefaults } from './validate-config.mjs';
import {
  DEFAULT_PLUGIN_ROOT, SetupError, assertSupportedOs, formatReport, generateProject,
  readMemorySeeds, resolveProjectRoot,
} from './generate.mjs';

const TIERS = ['fable', 'opus', 'sonnet', 'haiku'];
// A disabled QAL still renders into roles.json, and inventing a plausible codex model id would be
// worse than saying nothing: this placeholder is visibly not a model, and /pnp:qal is fail-closed on
// `enabled` anyway. Enabling QAL means supplying the real id.
const QAL_PLACEHOLDER_MODEL = 'unset';

const get = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function set(obj, dotted, value) {
  const parts = dotted.split('.');
  let node = obj;
  for (const part of parts.slice(0, -1)) {
    if (!node[part] || typeof node[part] !== 'object') node[part] = {};
    node = node[part];
  }
  node[parts.at(-1)] = value;
  return obj;
}

/**
 * Runs the question flow. `ask(question, fallback)` returns the raw answer string; the caller owns
 * the transport (readline in the CLI, a scripted function in a test).
 * `installed` is the config already present, if any - its values become the offered defaults.
 */
export async function runInterview({ schema, ask, installed = null }) {
  const factory = collectDefaults(schema) || {};
  const answers = {};
  const fallback = (dotted) => {
    const current = installed ? get(installed, dotted) : undefined;
    return current !== undefined ? current : get(factory, dotted);
  };

  const text = async (dotted, question, { allowEmpty = true } = {}) => {
    const def = fallback(dotted);
    for (;;) {
      const raw = (await ask(question, def)).trim();
      const value = raw === '' && def !== undefined ? String(def) : raw;
      if (value !== '' || allowEmpty) { set(answers, dotted, value); return value; }
      output.write('  a value is required here.\n');
    }
  };
  const choice = async (dotted, question, options) => {
    const def = fallback(dotted);
    for (;;) {
      const raw = (await ask(`${question} [${options.join('|')}]`, def)).trim();
      const value = raw === '' && def !== undefined ? String(def) : raw;
      if (options.includes(value)) { set(answers, dotted, value); return value; }
      output.write(`  answer with one of: ${options.join(', ')}\n`);
    }
  };
  const yesNo = async (dotted, question) => {
    const def = fallback(dotted);
    for (;;) {
      const raw = (await ask(`${question} [y/n]`, def === undefined ? undefined : (def ? 'y' : 'n'))).trim().toLowerCase();
      const value = raw === '' && def !== undefined ? (def ? 'y' : 'n') : raw;
      if (['y', 'yes', 'n', 'no'].includes(value)) { set(answers, dotted, value.startsWith('y')); return value.startsWith('y'); }
      output.write('  answer y or n.\n');
    }
  };
  const integer = async (dotted, question) => {
    const def = fallback(dotted);
    for (;;) {
      const raw = (await ask(question, def)).trim();
      const value = raw === '' && def !== undefined ? Number(def) : Number(raw);
      if (Number.isInteger(value)) { set(answers, dotted, value); return value; }
      output.write('  a whole number is required.\n');
    }
  };

  output.write('\n-- project --\n');
  await text('project.name', 'Project name', { allowEmpty: false });
  await text('project.description', 'One line of product description');
  await text('project.stack', 'One line of stack description');
  await text('project.defaultBranch', 'Default integration branch');

  output.write('\n-- platform --\n');
  const os = await choice('os', 'Operating system channel', ['windows', 'linux', 'macos']);
  assertSupportedOs(os); // fail-closed, before a single file is planned

  output.write('\n-- operator channel --\n');
  await text('operator.language', 'Language of the COO <-> operator channel (agent-to-agent stays English)');
  await text('operator.roleNicknames.writer', 'Conversational name for the Writer');
  await text('operator.roleNicknames.reviewer', 'Conversational name for the Reviewer');
  await text('operator.roleNicknames.qa', 'Conversational name for QA');

  output.write('\n-- roles --\n');
  await text('roles.writer.model', 'Writer model (a FULL model id is valid here)', { allowEmpty: false });
  await text('roles.writer.effort', 'Writer reasoning effort', { allowEmpty: false });
  for (const role of ['reviewer', 'qa']) {
    const engine = await choice(`roles.${role}.engine`, `${role}: host engine`, ['claude', 'codex']);
    await text(`roles.${role}.model`, engine === 'claude'
      ? `${role}: model (claude host - a TIER ALIAS: ${TIERS.join(' | ')})`
      : `${role}: model (codex host - the engine's own model id)`, { allowEmpty: false });
    await text(`roles.${role}.effort`, `${role}: reasoning effort`, { allowEmpty: false });
  }
  const qal = await yesNo('roles.qal.enabled', 'Enable QAL (live agentic browser, codex-only, operator-gated)');
  set(answers, 'roles.qal.engine', 'codex');
  if (qal) {
    await text('roles.qal.model', 'qal: codex model id', { allowEmpty: false });
    await text('roles.qal.effort', 'qal: reasoning effort', { allowEmpty: false });
  } else {
    set(answers, 'roles.qal.model', get(installed, 'roles.qal.model') || QAL_PLACEHOLDER_MODEL);
    set(answers, 'roles.qal.effort', get(installed, 'roles.qal.effort') || 'high');
  }

  output.write('\n-- loop --\n');
  await integer('loop.correctionRoundsCap', 'Correction-round cap (the operator lifts it, never the COO)');
  await yesNo('enforcement.routeWriteGuard', 'Gate 3: block main-session code writes while an R2/R3 ticket is open');

  output.write('\n-- verify --\n');
  const commands = [];
  for (;;) {
    const name = (await ask(`VERIFY command #${commands.length + 1} - short name (empty to finish)`, '')).trim();
    if (name === '') break;
    const run = (await ask('  command line', '')).trim();
    const cwd = (await ask('  cwd (project-relative, empty = project root)', '')).trim();
    const entry = { name, run };
    if (cwd !== '') entry.cwd = cwd;
    commands.push(entry);
  }
  set(answers, 'verify.commands', commands.length ? commands : (fallback('verify.commands') || []));
  const e2e = await yesNo('verify.e2e.enabled', 'Does this project have an end-to-end proof surface (QA reads its artifacts)');
  if (e2e) {
    await text('verify.e2e.cwd', 'e2e: cwd');
    await text('verify.e2e.runner', 'e2e: runner command');
    await text('verify.e2e.specDir', 'e2e: spec directory');
    await text('verify.e2e.outputDir', 'e2e: artifact output directory');
  }

  output.write('\n-- paths --\n');
  await text('paths.plansDir', 'Plans directory (the PARENT of active/ and archive/)', { allowEmpty: false });
  await text('paths.overridesDoc', 'Project overrides document', { allowEmpty: false });

  output.write('\n-- product boundary checks (rendered into the Reviewer; empty is a valid answer) --\n');
  const checks = [];
  for (;;) {
    const line = (await ask(`boundary check #${checks.length + 1} (empty to finish)`, '')).trim();
    if (line === '') break;
    checks.push(line);
  }
  set(answers, 'review.productBoundaryChecks', checks.length ? checks : (fallback('review.productBoundaryChecks') || []));

  return answers;
}

// ---- CLI -------------------------------------------------------------------
function isMain() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return invoked === path.resolve(fileURLToPath(import.meta.url));
}

if (isMain()) {
  const args = process.argv.slice(2);
  const flag = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
  const has = (name) => args.includes(name);
  const pluginRoot = path.resolve(flag('--plugin-root') || DEFAULT_PLUGIN_ROOT);
  let code = 0;
  try {
    const projectRoot = resolveProjectRoot(flag('--project-root'));
    if (!projectRoot) throw new SetupError('cannot resolve the project root - run this inside a git worktree or pass --project-root <dir>.');
    const schema = loadSchema(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json'));
    const configFile = path.join(projectRoot, '.claude', 'aiwf-native', 'aiwf.config.json');
    let installed = null;
    if (fs.existsSync(configFile)) {
      try { installed = JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch { installed = null; }
    }

    let answers;
    const answersFile = flag('--answers-file');
    if (answersFile) {
      answers = JSON.parse(fs.readFileSync(path.resolve(answersFile), 'utf8'));
      assertSupportedOs(answers.os ?? installed?.os ?? (collectDefaults(schema) || {}).os);
    } else {
      const rl = readline.createInterface({ input, output });
      try {
        console.log(installed
          ? `PromptAndPray is already installed in ${projectRoot} - this is a re-interview; press Enter to keep a value.`
          : `Installing PromptAndPray into ${projectRoot}. Press Enter to accept the value in brackets.`);
        answers = await runInterview({
          schema,
          installed,
          ask: (question, def) => rl.question(def === undefined || def === '' ? `${question}: ` : `${question} [${def}]: `),
        });
      } finally { rl.close(); }
    }

    const report = generateProject({
      pluginRoot, projectRoot, answers,
      confirmRemoveStale: has('--confirm-remove-stale'),
      dryRun: has('--dry-run'),
    });
    const seeds = (has('--no-seeds') || report.blocked || has('--dry-run')) ? [] : readMemorySeeds(pluginRoot);
    console.log(formatReport(report, { projectRoot, seeds }));
    if (!report.blocked && !has('--dry-run')) {
      console.log('\nNext: run the self-check (`/pnp:selfcheck`) and read the generated overrides document - its placeholders are yours to fill in.');
    }
    code = report.blocked ? 1 : 0;
  } catch (e) {
    console.error(`setup: ${e.message}`);
    code = e instanceof SetupError ? 1 : 2;
  }
  process.exit(code);
}
