import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveWorkerScopedDatabaseUrl } from './e2e-worker-schema';

/** Environment variable carrying the per-run runtime-state file path. */
const E2E_RUNTIME_STATE_PATH_ENV = 'NESTJS_BOILERPLATE_E2E_RUNTIME_STATE_PATH';

/** Fallback runtime-state file path used when the per-run path has not been configured yet. */
const E2E_RUNTIME_STATE_PATH_FALLBACK = join(tmpdir(), 'nestjs-boilerplate-2026-e2e-runtime.json');

/**
 * Shared runtime values produced by the one-time e2e global setup and consumed by each test worker.
 */
export interface E2ERuntimeState {
  /** PostgreSQL connection string exposed by the shared test container. */
  readonly databaseUrl: string;
}

/**
 * Applies the shared runtime state to `process.env` for the current test worker.
 *
 * @returns The loaded runtime state.
 */
export function applyE2ERuntimeStateToProcessEnv(): E2ERuntimeState {
  const state = readE2ERuntimeState();
  process.env.DATABASE_URL = resolveWorkerScopedDatabaseUrl(state.databaseUrl);
  return state;
}

/**
 * Configures a unique runtime-state file path for the current e2e run.
 *
 * @returns The absolute runtime-state file path assigned to the current run.
 */
export function configureE2ERuntimeStatePath(): string {
  const runtimeStatePath = join(tmpdir(), `${randomUUID()}-nestjs-boilerplate-e2e-runtime.json`);
  process.env[E2E_RUNTIME_STATE_PATH_ENV] = runtimeStatePath;
  return runtimeStatePath;
}

/**
 * Removes the persisted runtime-state file after the e2e suite completes.
 */
export function deleteE2ERuntimeState(): void {
  const runtimeStatePath = getE2ERuntimeStatePath();

  if (!existsSync(runtimeStatePath)) {
    return;
  }

  rmSync(runtimeStatePath, { force: true });
}

/**
 * Loads the shared runtime state from disk.
 *
 * @returns Parsed runtime state.
 * @throws When the global e2e setup has not produced the runtime file.
 */
export function readE2ERuntimeState(): E2ERuntimeState {
  const runtimeStatePath = getE2ERuntimeStatePath();

  if (!existsSync(runtimeStatePath)) {
    throw new Error(`Missing e2e runtime state at ${runtimeStatePath}. Run the suite through vitest globalSetup.`);
  }

  const payload = readFileSync(runtimeStatePath, 'utf8');
  return parseE2ERuntimeState(JSON.parse(payload));
}

/**
 * Persists the shared runtime state produced by the global e2e setup.
 *
 * @param state - Runtime values that each test worker needs in `process.env`.
 */
export function writeE2ERuntimeState(state: E2ERuntimeState): void {
  writeFileSync(getE2ERuntimeStatePath(), JSON.stringify(state), 'utf8');
}

/**
 * Resolves the runtime-state file path for the current e2e run.
 *
 * @returns Absolute path to the runtime-state file used by the current run.
 */
function getE2ERuntimeStatePath(): string {
  const runtimeStatePath = process.env[E2E_RUNTIME_STATE_PATH_ENV];

  if (runtimeStatePath !== undefined && runtimeStatePath.length > 0) {
    return runtimeStatePath;
  }

  return E2E_RUNTIME_STATE_PATH_FALLBACK;
}

/**
 * Validates the unknown JSON payload loaded from the runtime-state file.
 *
 * @param value - Parsed JSON value.
 * @returns Narrowed runtime state.
 * @throws When the payload does not match the expected runtime-state shape.
 */
function parseE2ERuntimeState(value: unknown): E2ERuntimeState {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid e2e runtime state: expected an object payload.');
  }

  if (!('databaseUrl' in value) || typeof value.databaseUrl !== 'string') {
    throw new Error('Invalid e2e runtime state: expected databaseUrl.');
  }

  return {
    databaseUrl: value.databaseUrl,
  };
}
