import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import request, { type Test as SuperTestRequest } from 'supertest';
import type { App as SuperTestApp } from 'supertest/types';
import { afterAll, beforeAll, beforeEach } from 'vitest';

import { parsePrismaPgConnectionDetails } from '../../src/modules/core/prisma/prisma-pg-connection.helper';
import { readE2ERuntimeState } from '../containers/e2e-runtime-state';
import { resolveE2EWorkerSchemaName, resolveWorkerScopedDatabaseUrl } from '../containers/e2e-worker-schema';
import { getSharedE2EApp } from './e2e-app-singleton';

/** Supertest target accepted by endpoint specs in the shared e2e harness. */
type E2EHttpTarget = string | SuperTestApp;

/**
 * Shared Nest e2e application context exposed to endpoint tests.
 */
export interface E2EApplicationContext {
  /** Fully initialized Nest application instance. */
  readonly app: Awaited<ReturnType<typeof getSharedE2EApp>>['app'];
  /** Base URL of the listening Nest application. */
  readonly baseUrl: string;
  /** HTTP target accepted by SuperTest for the shared Nest application. */
  readonly httpServer: E2EHttpTarget;
  /** Prisma client connected to the shared e2e database. */
  readonly prisma: PrismaClient;
}

/**
 * Signs a bearer token for the provided e2e user identifier.
 *
 * @param userId - Authenticated user identifier encoded into the JWT subject claim.
 * @returns Valid JWT token recognized by the real JWT strategy.
 */
export function createAccessToken(userId: string): string {
  return sign({ sub: userId }, process.env.JWT_SECRET_KEY ?? 'test-jwt-secret-here');
}

/**
 * Registers standard Nest e2e lifecycle hooks and exposes the initialized test context.
 *
 * @returns Lazily resolved e2e application context.
 */
export function setupE2EApplication(): E2EApplicationContext {
  let app: E2EApplicationContext['app'] | undefined;
  let baseUrl: string | undefined;
  let httpServer: E2EHttpTarget | undefined;
  const runtimeState = readE2ERuntimeState();
  const prisma = createE2EPrismaClient(resolveWorkerScopedDatabaseUrl(runtimeState.databaseUrl));

  beforeAll(async () => {
    const sharedApp = await getSharedE2EApp();

    app = sharedApp.app;
    baseUrl = sharedApp.baseUrl;
    httpServer = sharedApp.httpServer;
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await truncateApplicationTables(prisma);
  });

  return {
    get app() {
      return resolveE2EContextValue(app, 'app');
    },
    get baseUrl() {
      return resolveE2EContextValue(baseUrl, 'baseUrl');
    },
    get httpServer() {
      return resolveE2EContextValue(httpServer, 'httpServer');
    },
    get prisma() {
      return prisma;
    },
  };
}

/**
 * Authenticated supertest builder for one actor.
 */
export interface AuthedRequestBuilder {
  /** Build a `DELETE <path>` request with the actor's JWT pre-set. */
  readonly delete: (path: string) => SuperTestRequest;
  /** Build a `GET <path>` request with the actor's JWT pre-set. */
  readonly get: (path: string) => SuperTestRequest;
  /** Build a `PATCH <path>` request with the actor's JWT pre-set. */
  readonly patch: (path: string) => SuperTestRequest;
  /** Build a `POST <path>` request with the actor's JWT pre-set. */
  readonly post: (path: string) => SuperTestRequest;
}

/**
 * Returns a builder that issues authenticated requests against the e2e HTTP server.
 *
 * @param httpServer - Supertest target returned by `setupE2EApplication`.
 * @param userId - Authenticated actor identifier encoded into the JWT subject claim.
 * @returns Builder exposing one supertest factory per HTTP verb.
 */
export function authedRequest(httpServer: E2EHttpTarget, userId: string): AuthedRequestBuilder {
  const applyHeaders = (req: SuperTestRequest): SuperTestRequest =>
    req.set('authorization', `Bearer ${createAccessToken(userId)}`);

  return {
    delete: (path) => applyHeaders(request(httpServer).delete(path)),
    get: (path) => applyHeaders(request(httpServer).get(path)),
    patch: (path) => applyHeaders(request(httpServer).patch(path)),
    post: (path) => applyHeaders(request(httpServer).post(path)),
  };
}

/**
 * Narrows a supertest response body to an object carrying a string `id` field.
 *
 * @param body - Supertest response body of unknown shape.
 * @returns The extracted string identifier.
 * @throws When the body is not an object with a string `id` field.
 */
export function expectResponseId(body: unknown): string {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error('Expected response body to be an object with a string `id` field.');
  }
  if (!('id' in body) || typeof body.id !== 'string') {
    throw new Error('Expected response body to be an object with a string `id` field.');
  }

  return body.id;
}

/**
 * Creates a standalone Prisma client for e2e fixture setup and database cleanup.
 *
 * @param databaseUrl - Connection string of the shared PostgreSQL test container.
 * @returns Prisma client configured for the e2e database.
 */
function createE2EPrismaClient(databaseUrl: string): PrismaClient {
  const connectionDetails = parsePrismaPgConnectionDetails(databaseUrl);
  const adapter = new PrismaPg(
    { connectionString: connectionDetails.connectionString, max: 5 },
    connectionDetails.schema === null ? undefined : { schema: connectionDetails.schema },
  );

  return new PrismaClient({ adapter });
}

/**
 * Resolves an initialized e2e context value or fails with a clear setup error.
 *
 * @param value - Potentially initialized context value.
 * @param name - Context field name used in the error message.
 * @returns Initialized context value.
 */
function resolveE2EContextValue<T>(value: T | undefined, name: string): T {
  if (value === undefined) {
    throw new Error(`E2E application context "${name}" is not initialized.`);
  }

  return value;
}

/**
 * Removes all application data between test cases while keeping Prisma migrations intact.
 *
 * @param prisma - Real Prisma client connected to the test container database.
 * @returns Resolves once all application tables have been truncated.
 */
export async function truncateApplicationTables(prisma: PrismaClient): Promise<void> {
  const schemaName = resolveE2EWorkerSchemaName();

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "${schemaName}"."users"
    RESTART IDENTITY CASCADE
  `);
}
