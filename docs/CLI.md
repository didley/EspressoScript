# CLI Reference

```
shot <command> [args...]
```

Install:
```
curl -fsSL https://shot.didley.dev/install.sh | sh
```

The installer handles everything needed to run Shot on your machine. Re-run any time to update.

All commands return exit 0 on success, non-zero on any failure (lint, type-check, or runtime).

---

## `shot init <name>`

Scaffold a new project directory with a `.shot` entry file, a test file, and a `shot.json` config stub.

```
$ shot init my-app
```

---

## `shot check [files...]`

Validate one or more `.shot` files. Runs the linter only — does not type-check, does not run.

```
$ shot check src/main.shot
$ shot check src/**/*.shot
```

**Output:** human-readable diagnostics on stderr, one per line. Format:
```
src/main.shot:3:5  no-arrow-functions  Arrow functions are not allowed. Use the function keyword.
```

**Exit codes:**
- `0` — no diagnostics
- `1` — at least one diagnostic emitted
- `2` — internal error

---

## `shot fmt [files...]`

Format `.shot` files in place. Zero config — one canonical output.

```
$ shot fmt src/main.shot
$ shot fmt src/
```

If no files are given, formats the current directory recursively.

---

## `shot build [files...]`

Validate → type-check. Does not execute.

Pipeline:
1. Lint each `.shot` file. Abort on diagnostics.
2. Type-check via the TypeScript compiler. Abort on type errors.

```
$ shot build src/main.shot
```

No emitted `.ts` files; build is purely a validation gate.

---

## `shot run <file> [-- flags...]`

Validate → type-check → execute. Type errors block execution.

Pipeline:
1. Lint all project files. Abort on diagnostics.
2. Type-check in-process. Abort on type errors.
3. Run via Bun if both pass.

```
$ shot run hello.shot
$ shot run hello.shot -- --port 3000
```

Flags after `--` pass through to Bun.

**Exit codes:**
- The program's own exit code on successful run
- `1` if lint or type-check failed (program never executed)
- `2` for internal errors

---

## `shot test [files...]`

Validate → type-check → run `*.test.shot` files.

```
$ shot test
$ shot test src/calculator.test.shot
```

---

## Common errors

### Import not in allowlist
`shot check` flags imports outside `shot:`, `bun:`, and relative `.shot` paths.

### Type errors block `shot run`
A `.shot` program that lints clean but fails type-checking will not execute. This is intentional — type-checks are gating, like `go run`.
