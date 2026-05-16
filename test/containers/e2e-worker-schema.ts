import { availableParallelism } from 'node:os';
import { URL } from 'node:url';

/** Upper bound for concurrent e2e workers to avoid oversubscribing local machines and CI. */
const E2E_MAX_WORKERS_CAP = 4;

/** Prefix used for worker-isolated PostgreSQL schemas in the shared e2e database. */
const E2E_WORKER_SCHEMA_PREFIX = 'e2e_worker';

/**
 * Builds a schema-scoped PostgreSQL connection string for one e2e worker.
 *
 * @param databaseUrl - Base PostgreSQL connection string returned by the shared test container.
 * @param schemaName - PostgreSQL schema that should become Prisma's active schema.
 * @returns Connection string configured to operate inside the requested schema.
 */
export function createSchemaScopedDatabaseUrl(databaseUrl: string, schemaName: string): string {
  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schemaName);
  return url.toString();
}

/**
 * Returns the deterministic schema name assigned to the provided Vitest pool id.
 *
 * @param poolId - One-based Vitest pool identifier.
 * @returns Worker-local PostgreSQL schema name.
 */
export function getE2EWorkerSchemaName(poolId: number): string {
  return `${E2E_WORKER_SCHEMA_PREFIX}_${poolId}`;
}

/**
 * Returns the worker count used by the parallel e2e suite.
 *
 * @returns Number of concurrent workers the e2e suite should use.
 */
export function getE2EMaxWorkers(): number {
  return Math.max(1, Math.min(E2E_MAX_WORKERS_CAP, availableParallelism()));
}

/**
 * Resolves the Vitest pool id exposed to the current worker process.
 *
 * @returns One-based Vitest pool identifier for the current worker.
 */
export function resolveE2EWorkerPoolId(): number {
  const poolId = process.env.VITEST_POOL_ID;

  if (poolId !== undefined && /^\d+$/.test(poolId)) {
    return Number(poolId);
  }

  return 1;
}

/**
 * Resolves the schema name assigned to the current Vitest worker.
 *
 * @returns Worker-local PostgreSQL schema name.
 */
export function resolveE2EWorkerSchemaName(): string {
  return getE2EWorkerSchemaName(resolveE2EWorkerPoolId());
}

/**
 * Resolves the worker-scoped PostgreSQL connection string for the current Vitest worker.
 *
 * @param databaseUrl - Base PostgreSQL connection string returned by the shared test container.
 * @returns Worker-scoped PostgreSQL connection string targeting the worker's isolated schema.
 */
export function resolveWorkerScopedDatabaseUrl(databaseUrl: string): string {
  return createSchemaScopedDatabaseUrl(databaseUrl, resolveE2EWorkerSchemaName());
}
