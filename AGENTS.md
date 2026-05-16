# AGENTS.md

This repository is a NestJS API service (Node 24+, TypeScript, pnpm, Prisma, Vitest, ESLint + Prettier).

This document is repository law for AI agents. Default behavior:

- Keep changes minimal, scoped, and correct.
- Follow existing repository conventions.
- Verify with project scripts before completion.

---

## 1) Non-negotiables

### Package manager and runtime

- Use **pnpm only**.
- Node version must be **>= 24**.
- Do not introduce npm/yarn/bun flows.

### Project tooling

- Linting uses **ESLint** (flat config).
- Formatting uses **Prettier**.
- Testing uses **Vitest**.
- ORM is **Prisma**.
- Environment loading is handled via `dotenvx` in scripts.

### Quality gate

A task is complete only when relevant checks pass:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Run `pnpm test:e2e` when endpoint behavior, auth, or integration paths are affected.

### Scope discipline

- Do not refactor unrelated code.
- Do not rename public APIs unless requested.
- Do not change architecture without explicit need.
- Do not add dependencies unless clearly justified.

---

## 2) Repo laws (hard rules)

### File naming

- Use **kebab-case** for files.
- Keep folder naming consistent; prefer kebab-case.

### TypeScript style

- Prefer `Array<T>` and `ReadonlyArray<T>` over `T[]` and `readonly T[]`.
- Prefer `readonly` properties in object-shaped type contracts unless mutation is intentional.
- Prefer `Record<K, V>` over index signatures when practical.
- Prettier is configured with `semi: true`; do not introduce formatting rules that fight the formatter.
- Avoid `any`; use `unknown` and narrow.
- Avoid non-null assertions (`!`) unless unavoidable.
- Avoid broad type assertions (`as X`) unless necessary.

### Documentation

- Add JSDoc to exported classes, functions, and types in new or changed code when the public contract, side effects, or domain meaning is not obvious.
- Keep documentation concrete; avoid comments that only restate the symbol name.

### NestJS constructor injection order (mandatory)

- Parameters decorated with `@Inject(...)` come **first**.
- Remaining parameters are in **alphabetical order by type name**.
- Keep `@Inject(...)` on the **same line** as the parameter declaration.

Correct:

```ts
constructor(
  @Inject(MAIL_PROVIDER) private readonly mailProvider: MailProvider,
  private readonly configService: ConfigService,
  private readonly jwtService: JwtService,
  private readonly prisma: PrismaService,
) {}
```

Forbidden:

- `@Inject` parameter after non-`@Inject` parameters
- non-`@Inject` params not alphabetical by type name
- `@Inject(...)` on a separate line from its parameter

### Safety and correctness

- Never invent env vars, API fields, or schema behavior.
- If requirements are ambiguous, choose the smallest safe default and document it.

---

## 3) NestJS architecture rules

### Layering

- Keep controllers thin.
- Put business logic in services.
- Keep module boundaries clear.
- Prefer explicit dependencies over hidden side effects.

### DTOs and validation

- Validate request payloads for public endpoints with DTOs and `class-validator`.
- Keep DTOs focused and reusable where appropriate.
- Do not bypass validation for convenience.

### Error handling

- Use Nest exceptions and consistent HTTP semantics.
- Avoid leaking internal details in error messages.

### Logging

- Keep logs structured (`nestjs-pino`/`pino`).
- Avoid noisy debug logs in hot paths.
- Do not log secrets, tokens, or sensitive payloads.

### Security

- Use secure defaults (`helmet`, auth guards, input validation).
- Do not weaken auth/authorization flows unless requested.
- Ensure Express v5 compatibility for any middleware changes.

---

## 4) Prisma and data rules

- Keep Prisma schema changes minimal and intentional.
- After every change to `prisma/schema.prisma`, run `pnpm db:generate` before considering the task complete.
- For reusable or production-intended schema changes, add a matching migration and verify `pnpm prisma migrate status`.
- If migration generation or status checks are blocked by local database state, do not reset or drop data without explicit approval. Report the blocker and the command summary.
- Never hardcode credentials or database URLs.
- Avoid destructive data operations unless explicitly required.

---

## 5) Testing rules (Vitest)

- Prefer deterministic tests.
- Add or update tests when behavior changes.
- Unit test service logic; use e2e tests for request/response flows when needed.
- Keep fixtures and mocks simple and local to test scope.

---

## 6) Agent workflow

When executing tasks:

1. Plan the minimal file set and approach.
2. Implement focused changes.
3. Verify with relevant scripts.
4. Report assumptions and verification results.

Preferred command sequence for most code changes:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

For API behavior changes, also run:

- `pnpm test:e2e`

### Git and PR workflow

- `CONTRIBUTING.md` is the source of truth for branch naming, commit messages, pushes, and pull request titles/descriptions.
- Do not push or open a PR unless the user explicitly asks for it.
- Do not push directly to `main` unless the user explicitly asks for it.
- Before committing, pushing, or opening a PR, ensure the relevant validation commands have passed or clearly document what could not be run.
- Do not invent issue keys, ticket links, reviewers, or PR metadata.

---

## 7) Dependency hygiene

- Prefer existing dependencies and built-in Node APIs.
- Keep dependency scope minimal.
- If a new dependency is added, explain why existing tools are insufficient.

---

## 8) When unsure

- Make the smallest safe assumption.
- Document the assumption in the completion summary.
- Avoid speculative architecture or product behavior.

Never:

- invent endpoints or config values
- guess secrets or credentials
- perform unrelated wide refactors

---

## 9) Completion checklist

Before marking work complete:

- [ ] Changes are minimal and scoped to request
- [ ] Code follows NestJS and repo conventions
- [ ] No unnecessary dependencies added
- [ ] `pnpm typecheck` passed
- [ ] `pnpm lint` passed
- [ ] `pnpm test` passed
- [ ] `pnpm build` passed
- [ ] `pnpm test:e2e` passed (if endpoint/integration behavior changed)
- [ ] Assumptions are documented

---

## 10) Suggested commit message style

Use concise Conventional Commit style:

- `feat(api): add email verification endpoint`
- `fix(auth): validate refresh token payload`
- `chore(prisma): add index for sessions table`
