# Tasks

v1 implementation broken into sequentially-ordered tasks. Each task file is self-contained — a fresh Sonnet session picks up a task by reading its file plus referenced docs.

## Progress tracker

Status legend: ⬜ Not started · 🟡 In progress · ✅ Done · 🚫 Blocked

When you start a task, change ⬜ → 🟡 here and add your initials/date. When it's done and verification passes, change to ✅.

| #   | Task                                        | Status | Notes |
|-----|---------------------------------------------|--------|-------|
| T01 | Deno CLI skeleton                           | ⬜    |       |
| T02 | Checker skeleton (`npm:typescript`)         | ⬜    |       |
| T03 | Checker syntax rules                        | ⬜    |       |
| T04 | Checker type rules                          | ⬜    |       |
| T05 | Import allowlist rule                       | ⬜    |       |
| T06 | Wire `shot check`                           | ⬜    |       |
| T07 | `shot fmt`                                  | ⬜    |       |
| T08 | `shot build` pipeline                       | ⬜    |       |
| T09 | `shot run` pipeline                         | ⬜    |       |
| T10 | `shot:std` package                          | ⬜    |       |
| T11 | E2E verification                            | ⬜    |       |
| T12 | Install script (`curl \| sh`)               | ⬜    |       |

## Conventions

Every task file contains:
1. **Goal** — one sentence
2. **Files to create/modify** — explicit paths
3. **Dependencies** — earlier tasks required
4. **Acceptance criteria** — concrete, testable
5. **Verification commands** — what to run to prove it's done
6. **Notes** — gotchas and design pointers

## Working a task

1. Read the task file.
2. Re-read referenced docs (`docs/LANGUAGE.md`, `docs/ARCHITECTURE.md`) as needed.
3. **Update this table:** mark the task 🟡.
4. Implement.
5. Run the verification commands.
6. When all acceptance criteria pass, **mark the task ✅** in this table and commit.

If a task turns out to be larger than expected, split it — but update this table so the new file is tracked.

## Architecture in one paragraph

shot is a single Deno script published to JSR (`@espresso/shot`). No Go binary. No source rewriting. `shot:*` imports resolve to `jsr:@espresso/*` via a transient Deno import map. The checker is in-process TypeScript using `npm:typescript` (AST-only in v1). `shot build` / `shot run` write the import map, then invoke `deno check` / `deno run --check=all` directly on the `.shot` file with `--ext=ts`.
