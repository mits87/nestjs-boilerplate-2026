# CLAUDE.md

## Source of truth

**AGENTS.md is the repository law.**  
Before doing anything else, **read `AGENTS.md`** and follow it exactly.

If there is any conflict between instructions:

1. The user request wins (only if explicit).
2. Otherwise **AGENTS.md wins**.
3. This file (CLAUDE.md) is only an execution wrapper and must not override AGENTS.md.

## Default workflow

When working on a task:

1. **Plan first** (briefly): list impacted files and steps.
2. **Implement**: keep diffs minimal and focused.
3. **Verify** using repo scripts (as required by AGENTS.md): lint, test, build.

## Output expectations

- Prefer concrete, actionable changes over discussion.
- Don't introduce new tools/deps unless necessary.
- Follow repo style rules from AGENTS.md.

## When unsure

Make the smallest safe assumption, document it, and avoid inventing requirements.
