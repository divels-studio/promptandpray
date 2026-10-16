/*
 * The E2E trace note - one predicate and one sentence, shared by the setup interview and the
 * self-check.
 *
 * An app whose build traces its own files (a `next.config.*` beside it) may copy whatever lies under
 * its root into the standalone bundle. When `verify.e2e.outputDir` sits under `verify.e2e.cwd`, the
 * whole E2E output (traces, videos, screenshots) is under that root. This is an OBSERVATION, never a
 * failure: the project may exclude the directory from tracing by its own means.
 *
 * `outputDir` is cwd-relative because the E2E runner is run FROM `cwd`.
 */
import fs from 'node:fs';
import path from 'node:path';

export const E2E_TRACE_NOTE = 'verify.e2e.outputDir sits under verify.e2e.cwd, which holds a next.config.* - a traced build may copy the whole E2E output into the standalone bundle; point outputDir outside the app root or exclude it from tracing';

const NEXT_CONFIG_RE = /^next\.config\.[^.]+$/;

/**
 * True iff the e2e block is enabled, its outputDir resolves under its cwd, and that cwd directory
 * holds a `next.config.*` file. Anything absent, disabled, mistyped or unreadable is false.
 */
export function tracedOutputDir(projectRoot, e2e) {
  if (typeof projectRoot !== 'string' || !e2e || e2e.enabled !== true) return false;
  if (typeof e2e.cwd !== 'string' || typeof e2e.outputDir !== 'string') return false;
  const appRoot = path.resolve(projectRoot, e2e.cwd);
  const rel = path.relative(appRoot, path.resolve(appRoot, e2e.outputDir));
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  let names;
  try { names = fs.readdirSync(appRoot); } catch (e) { names = []; }
  return names.some((n) => NEXT_CONFIG_RE.test(n));
}
