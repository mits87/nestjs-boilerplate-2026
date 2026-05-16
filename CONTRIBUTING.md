# CONTRIBUTING.md

Guidance for contributing changes to this repository.

`CONTRIBUTING.md` is the source of truth for branch naming, commit messages, pushes, and pull requests.

## Before You Start

- Read `README.md` for setup and repository overview
- Read `AGENTS.md` for authoritative coding and agent behavior rules
- Keep changes scoped to the requested task

## Branch Naming

When creating a branch, use this format:

```txt
short-title
```

Example:

```txt
add-request-logging
```

Rules:

- use lowercase kebab-case
- keep the branch focused on one concern
- do not mix unrelated changes in the same branch

## Commit Messages

Use Conventional Commits. Do not add `Co-Authored-By` lines unless explicitly requested.

Format:

```txt
<type>(<scope>): <imperative summary>
```

`<scope>` is optional but recommended when it adds clarity.

Allowed types:

```txt
feat
fix
refactor
perf
docs
test
style
chore
build
ci
revert
```

Guidelines:

- keep the subject concise and descriptive
- prefer 50 characters or fewer when practical; hard cap 72 characters
- use imperative mood
- keep one commit focused on one concern
- add a body only when the why is not obvious from the diff
- add a body for breaking changes, schema or data migrations, reverts, and security-sensitive changes
- wrap commit body lines at 72 characters
- do not mention AI tools or authorship metadata in the commit message

Recommended scopes:

```txt
api
auth
users
health
prisma
config
docs
```

Examples:

```txt
feat(api): add request id logging
fix(auth): validate jwt subject
docs(readme): refresh boilerplate setup guide
chore(prisma): add initial user migration
```

## Pull Requests

Pull requests must follow `.github/pull_request_template.md`.

PR title rules:

- use the same Conventional Commit format as commit messages
- keep the title aligned with the main change in the branch
- do not use vague titles such as `updates`, `fix stuff`, or `misc changes`

When preparing a pull request:

- keep the PR scoped to a single concern
- explain what changed
- explain why it changed
- describe how the change was validated
- mention follow-up work or limitations when relevant
- do not omit migration notes when schema or data changes are included

## Pushes

When pushing changes:

- push the branch that contains the validated work
- do not push unrelated local changes
- do not force-push unless the task explicitly requires it
- do not push directly to `main` unless explicitly requested

## Validation

Before opening a PR, run the relevant repository scripts and ensure the change follows existing patterns.

The default quality gate is:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Also run `pnpm test:e2e` when endpoint behavior, auth, or integration flows changed.
