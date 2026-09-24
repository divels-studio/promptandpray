#!/usr/bin/env node
/*
 * Role rules - the ONE home of the Claude model-pin rule, shared by every writer of the config.
 *
 * WHY THIS EXISTS
 *   A Claude-hosted Reviewer, QA or review row takes a tier alias OR an exact model id, and the two
 *   are dispatched differently. `/pnp:review` and `/pnp:qa` pass a tier alias as the Agent tool's
 *   `model` (that parameter's enum is the four aliases and nothing else, and it takes precedence over
 *   the agent's frontmatter). An exact id is NOT passed: `model` is omitted, and the pin in the
 *   rendered agent's frontmatter is what runs - the pattern the Writer has always used.
 *
 *   The Reviewer has ONE rendered agent file carrying ONE pin, shared by every Claude-hosted row, so
 *   a Claude row's exact id runs only if it is exactly the id that file carries:
 *     the Reviewer is Claude-hosted -> the file carries roles.reviewer.model, so a Claude row takes a
 *                                      tier alias or exactly roles.reviewer.model;
 *     the Reviewer is Codex-hosted  -> the file carries the top tier `fable`, so a Claude row takes
 *                                      a tier alias.
 *   Anything else would dispatch a model other than the one the row records. The rule compares two
 *   fields, which this project's schema subset cannot express, so it lives here - and ALL THREE
 *   writers of the config call it before their first write: setup (generate.mjs, next to the schema
 *   validation of the resulting config), the update engine (migrate.mjs, in preflight, right after
 *   the project config is loaded) and /pnp:roles (aiwf-roles.mjs, through rowShapeError). The
 *   self-check's `review-row-shape` runs the same function through the CLI below.
 *
 *   An exact id is never RANKED: PnP does not know where `claude-<anything>` sits against the tier
 *   aliases, so the fact-check gate treats every exact id as above the scan tier and /pnp:roles
 *   --show marks it `(exact id - tier not ranked)` instead of guessing.
 *
 * API (ESM)
 *   REVIEW_CLASSES             -> ['plan', 'code', 'docs'] (the ONE definition; generate.mjs re-exports it)
 *   TIER_ALIASES, TOP_TIER     -> the Agent tool's model enum, and the top tier among it
 *   isTierAlias(model)         -> boolean
 *   claudePinErrors(config)    -> [message, ...] (empty = the rule holds). Never mutates the config,
 *                                 and says nothing about a shape the schema already reports.
 *
 * CLI
 *   node role-rules.mjs <config.json>
 *     exit 0 = the rule holds; exit 1 = violations on stderr; exit 2 = the config cannot be read.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The three review classes, in the order /pnp:roles prints them. ONE definition: the schema, the
// resolver contract, the renderer and the table all mean the same three words.
export const REVIEW_CLASSES = ['plan', 'code', 'docs'];

// The Agent tool's `model` enum. The ONLY values a dispatch may pass as `model`.
export const TIER_ALIASES = ['fable', 'opus', 'sonnet', 'haiku'];
export const TOP_TIER = 'fable';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function isTierAlias(model) {
  return typeof model === 'string' && TIER_ALIASES.includes(model);
}

/**
 * Every Claude-hosted review row whose model the ONE reviewer agent file cannot run. An inherited
 * row (no engine) and a Codex row are not this rule's business; a missing or non-string model is the
 * schema's, which reports it on its own - this function only speaks where the schema cannot.
 */
export function claudePinErrors(config) {
  const errors = [];
  if (!isPlainObject(config)) return errors;
  const roles = isPlainObject(config.roles) ? config.roles : {};
  const reviewer = isPlainObject(roles.reviewer) ? roles.reviewer : {};
  const review = isPlainObject(config.review) ? config.review : {};
  const reviewerIsClaude = reviewer.engine === 'claude';
  const filePin = reviewerIsClaude ? reviewer.model : TOP_TIER;
  const aliases = TIER_ALIASES.join('|');
  for (const cls of REVIEW_CLASSES) {
    const row = review[cls];
    if (!isPlainObject(row) || row.engine !== 'claude') continue;
    if (typeof row.model !== 'string' || row.model === '') continue;
    if (isTierAlias(row.model) || row.model === filePin) continue;
    errors.push(reviewerIsClaude
      ? `review.${cls} is a Claude row on the exact id "${row.model}", but the one reviewer agent file carries `
        + `roles.reviewer.model "${filePin}" - a Claude row takes a tier alias (${aliases}) or exactly `
        + 'roles.reviewer.model, because an exact id is not passed at dispatch and the file\'s pin is what runs.'
      : `review.${cls} is a Claude row on the exact id "${row.model}", but the Reviewer is not Claude-hosted, so `
        + `the one reviewer agent file carries "${TOP_TIER}" - a Claude row takes a tier alias (${aliases}) here, `
        + 'because an exact id is not passed at dispatch and the file\'s pin is what runs.');
  }
  return errors;
}

// ---- CLI -------------------------------------------------------------------
// Both sides through realpath: a payload reached through a SYMLINK hands `import.meta.url` the real
// file while `process.argv[1]` keeps the link (see validate-config.mjs, same guard).
function isMain() {
  const real = (p) => { try { return fs.realpathSync(p); } catch { return p; } };
  const invoked = process.argv[1] ? real(path.resolve(process.argv[1])) : '';
  return invoked !== '' && invoked === real(path.resolve(fileURLToPath(import.meta.url)));
}

// The exit code is SET, never forced: a forced exit can cut a pending stdout/stderr write on a POSIX
// pipe (the class CONS-011 removed from the other entrypoints).
function main() {
  const configPath = process.argv.slice(2).find((a) => !a.startsWith('--')) || null;
  if (!configPath) {
    console.error('usage: node role-rules.mjs <config.json>');
    return 2;
  }
  let config;
  try {
    config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
  } catch (e) {
    console.error(`role-rules: cannot read the config - ${e.message}`);
    return 2;
  }
  const errors = claudePinErrors(config);
  if (errors.length === 0) {
    console.log(`the Claude pin rule holds: ${path.resolve(configPath)}`);
    return 0;
  }
  console.error(`the Claude pin rule is violated: ${path.resolve(configPath)}`);
  console.error(errors.map((e) => `  ${e}`).join('\n'));
  return 1;
}

if (isMain()) process.exitCode = main();
