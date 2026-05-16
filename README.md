# NestJS Boilerplate 2026

Opinionated NestJS 11 starter for PostgreSQL-backed APIs on Node `24+`.

The repository is intentionally small, but the foundation is production-oriented:

- `pnpm` workspace with Node `24+`
- NestJS + Prisma + PostgreSQL
- strict TypeScript + ESLint flat config + Prettier
- structured request logging via `nestjs-pino`
- global validation, normalized HTTP errors, and JWT auth foundation
- real sample `users` CRUD module backed by Prisma
- containerized, isolated e2e testing with Vitest + Testcontainers
- checked-in Prisma migrations for deterministic local and CI bootstrap

## What This Starter Includes

- public health endpoint at `GET /api/v1/health/ping`
- protected sample user endpoints at `GET/POST/PATCH/DELETE /api/v1/users`
- authenticated self endpoint at `GET /api/v1/users/me`
- Swagger UI at `/api/docs`
- Prisma PG adapter wiring with schema-aware connection parsing
- worker-isolated PostgreSQL schemas for parallel-safe e2e runs

Valkey remains in `compose.yml` as optional local infrastructure, but the starter does not depend on it yet.

## Requirements

- Node.js `24+`
- `pnpm` `10+`
- Docker for local Postgres services and e2e tests

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Create a local env file:

```bash
cp .env.dist .env
```

3. Start local infrastructure:

```bash
docker compose up -d db valkey
```

4. Apply the checked-in migration and generate the Prisma client:

```bash
pnpm db:migrate:deploy
pnpm db:generate
```

5. Start the API:

```bash
pnpm start:dev
```

## Runtime Notes

- API base path: `/api`
- URI versioning: `/api/v1/...`
- Swagger UI: `/api/docs`
- production entrypoint: `pnpm start:prod`
- scripts load `.env` first and fall back to `.env.dist`

## Sample API

Protected routes require a bearer token signed with `JWT_SECRET_KEY`.

- `GET /api/v1/users/me`
- `POST /api/v1/users`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

The sample module is intentionally simple: one Prisma model, one controller, one service, and deterministic CRUD behavior. It is meant to be replaced or extended, not treated as final product logic.

## Database Commands

- `pnpm db:generate` - generate Prisma client
- `pnpm db:push` - push schema without creating a migration
- `pnpm db:migrate` - create and apply a development migration
- `pnpm db:migrate:deploy` - apply checked-in migrations
- `pnpm db:seed` - run the seed entrypoint
- `pnpm db:reset` - reset the database
- `pnpm db:studio` - open Prisma Studio

## Quality Commands

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

`pnpm test:ci` runs both unit and e2e suites.

## Testing

Unit tests cover the core helpers and error normalization.

E2E tests use a shared PostgreSQL Testcontainers instance plus worker-scoped schemas, adapted from the reference patterns in `bookmyslot.ai`. Each worker:

- receives its own schema
- boots one shared Nest app
- truncates application tables between tests
- runs against real Prisma + PostgreSQL behavior

That keeps the suite deterministic locally and CI-friendly without bolting on unnecessary abstractions.

## Reusing This Boilerplate

Before turning this into a real service, update:

- `package.json` metadata
- `src/app.metadata.ts`
- Prisma schema, migrations, and seed data
- `.env.dist` and `.env.test`
- sample `users` module if it does not belong in your domain
- `README.md`, `AGENTS.md`, and `CONTRIBUTING.md`
