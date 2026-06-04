# Tasks

v1 implementation broken into sequentially-ordered tasks. Each task file is self-contained — a fresh Sonnet session picks up a task by reading its file plus referenced docs.

## Progress tracker

Status legend: ⬜ Not started · 🟡 In progress · ✅ Done · 🚫 Blocked

When you start a task, change ⬜ → 🟡 here and add your initials/date. When it's done and verification passes, change to ✅.

| #   | Task                                        | Status | Notes |
|-----|---------------------------------------------|--------|-------|
| T01 | Deno CLI skeleton                           | ✅    |       |
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
6. **Run regression check:** if `scripts/verify.sh` exists (after T11), run it. It must stay green.
7. When all acceptance criteria pass AND no regressions, **mark the task ✅** in this table and commit.

If a task turns out to be larger than expected, split it — but update this table so the new file is tracked.

## Overnight autonomous protocol

When running unattended, follow these conventions strictly:

### Blockers — best-effort with a clear log
- **Small ambiguity** (an AST detail, a flag name, a missing detail in a task file): make the reasonable judgment call. Append a one-paragraph entry to `DECISIONS.md` explaining what you chose and why. Continue.
- **Structural blocker** (a fundamental design assumption is wrong, an external service is unreachable, the strict tsconfig is rejecting something that should work and you can't see why): append a clear entry to `BLOCKED.md`, mark the task 🚫 in the table, and *skip to the next task whose dependencies are still satisfied*. Do not halt the whole run.
- **Never relax the language design** to make a task pass. If a rule is wrong, log it to `DECISIONS.md` for human review; don't delete the rule.

### Validation cadence
- Run the task's own verification commands before marking ✅.
- After T11 completes, run `scripts/verify.sh` after **every** subsequent task commit. If it goes red, the task is not done — fix forward or revert.
- Never mark a task ✅ if its verification commands fail.

### Commit discipline
- One commit per completed task (or per logically atomic sub-step if a task is split).
- Commit message format: `T0X: <imperative one-liner>` (e.g. `T03: implement no-arrow-functions and 19 sibling syntax rules`).
- **Local commits only overnight.** Do not `git push`. The human reviews and pushes in the morning.
- If you have to abandon a partial implementation, commit a WIP with a clear message before moving on — never leave staging dirty across tasks.

### Status visibility
- Keep `tasks/README.md`'s table strictly in sync with reality. The morning-after status check (`bash scripts/status.sh`) reads this table.
- Append to `DECISIONS.md` every time you make a non-trivial judgment call.
- Append to `BLOCKED.md` every time you skip a task.

### When the night ends
- If all tasks are ✅, run `scripts/verify.sh` one final time. If green, write a short summary to the bottom of `DECISIONS.md` (`# SUMMARY` heading) listing total commits made, tasks completed, decisions logged, and blockers encountered. Stop.
- If not all tasks are ✅, stop at the next sensible boundary (don't start a task you can't finish before context fills). Status table reflects exactly where you stopped.

## Architecture in one paragraph

shot is a single Deno script published to JSR (`@espresso/shot`). No Go binary. No source rewriting. `shot:*` imports resolve to `jsr:@espresso/*` via a transient Deno import map. The checker is in-process TypeScript using `npm:typescript` (AST-only in v1). `shot build` / `shot run` write the import map, then invoke `deno check` / `deno run --check=all` directly on the `.shot` file with `--ext=ts`.
