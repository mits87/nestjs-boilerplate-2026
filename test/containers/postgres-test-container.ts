import { execFileSync } from 'node:child_process';

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';

import { createSchemaScopedDatabaseUrl } from './e2e-worker-schema';

const TEST_DATABASE_IMAGE = 'postgres:16-alpine';
const TEST_DATABASE_NAME = 'nestjs_boilerplate_e2e';
const TEST_DATABASE_PASSWORD = 'postgres';
const TEST_DATABASE_USERNAME = 'postgres';

let postgresContainer: StartedPostgreSqlContainer | null = null;
let postgresContainerPromise: Promise<StartedPostgreSqlContainer> | null = null;
let migrationsApplied = false;

/**
 * Starts the shared PostgreSQL test container when it is not already running.
 *
 * @returns Running PostgreSQL test container instance.
 */
export async function ensurePostgresTestContainer(): Promise<StartedPostgreSqlContainer> {
  if (postgresContainer !== null) {
    return postgresContainer;
  }

  if (postgresContainerPromise === null) {
    postgresContainerPromise = new PostgreSqlContainer(TEST_DATABASE_IMAGE)
      .withDatabase(TEST_DATABASE_NAME)
      .withPassword(TEST_DATABASE_PASSWORD)
      .withUsername(TEST_DATABASE_USERNAME)
      .start();
  }

  postgresContainer = await postgresContainerPromise;
  process.env.DATABASE_URL = postgresContainer.getConnectionUri();

  return postgresContainer;
}

/**
 * Starts PostgreSQL, prepares every requested worker schema, and applies pending Prisma migrations
 * to each worker schema exactly once.
 *
 * @param schemaNames - Worker schemas that should exist and contain the latest Prisma structure.
 * @returns Active base test database connection string.
 */
export async function preparePostgresTestDatabase(schemaNames: ReadonlyArray<string>): Promise<string> {
  const container = await ensurePostgresTestContainer();
  const databaseUrl = container.getConnectionUri();

  process.env.DATABASE_URL = databaseUrl;

  if (!migrationsApplied) {
    await ensureWorkerSchemas(databaseUrl, schemaNames);

    for (const schemaName of schemaNames) {
      const schemaDatabaseUrl = createSchemaScopedDatabaseUrl(databaseUrl, schemaName);

      execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: schemaDatabaseUrl,
        },
        stdio: 'inherit',
      });
    }

    migrationsApplied = true;
  }

  return databaseUrl;
}

/**
 * Creates the worker-local PostgreSQL schemas used by the parallel e2e suite.
 *
 * @param databaseUrl - Base PostgreSQL connection string returned by the shared test container.
 * @param schemaNames - Worker schemas that should exist before Prisma migrations run.
 */
async function ensureWorkerSchemas(databaseUrl: string, schemaNames: ReadonlyArray<string>): Promise<void> {
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();

  try {
    for (const schemaName of schemaNames) {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    }
  } finally {
    await client.end();
  }
}

/**
 * Stops the shared PostgreSQL test container after all e2e suites finish.
 *
 * @returns Resolves once the shared container has been stopped.
 */
export async function stopPostgresTestContainer(): Promise<void> {
  if (postgresContainer === null) {
    return;
  }

  await postgresContainer.stop();
  postgresContainer = null;
  postgresContainerPromise = null;
  migrationsApplied = false;
}
