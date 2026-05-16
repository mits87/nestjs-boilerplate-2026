# Test Infrastructure

The test directory contains shared setup for both unit and e2e runs.

## Unit Tests

- configured through `vitest.config.ts`
- global Nest logger output is disabled in `test/setup.ts`
- focus on deterministic helpers, services, filters, and config behavior

## E2E Tests

The e2e suite is intentionally close to the real application bootstrap:

- `test/global-setup-e2e.ts` starts one shared PostgreSQL Testcontainers instance
- `test/containers/e2e-worker-schema.ts` assigns one schema per Vitest worker
- `test/helpers/e2e-app-singleton.ts` boots one shared Nest app per worker
- `test/helpers/e2e.helpers.ts` provides auth helpers, Prisma cleanup, and shared hooks

Each test case truncates application tables between runs, so endpoint specs stay isolated without rebuilding the whole application for every file.

## Running E2E Locally

```bash
pnpm test:e2e
```

Requirements:

- Docker must be available
- `.env.test` must contain the JWT secret and any other test-only config

The suite does not depend on `docker compose`; it provisions its own PostgreSQL container.
