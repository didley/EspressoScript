# CLI Reference

```
shot <command> [args...]
```

Install:
```
curl -fsSL https://shotscript.dev/install.sh | sh
```

The installer takes care of the runtime, the `shot` binary, and your PATH. Re-run any time to update to the latest release.

All commands return exit 0 on success, non-zero on any failure (lint, type-check, or runtime).

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
2. Write a transient `deno.json` containing `{ "imports": { "shot:": "npm:@shotscript/" } }`.
3. `deno check --config=<tempjson> --ext=ts <files>`. Abort on type errors.

```
$ shot build src/main.shot
```

No emitted `.ts` files; build is purely a validation gate.

---

## `shot run <file> [-- deno-flags...]`

Validate → type-check → execute. Type errors block execution.

Pipeline:
1. Lint + type-check via `deno run --check=all`.
2. Deno runs the program if and only if both pass.

```
$ shot run hello.shot
$ shot run hello.shot -- --allow-net
$ shot run hello.shot -- --allow-net --allow-read=./config
```

**Permission posture:** by default, `shot run` invokes `deno run` with no permission flags. Flags after `--` pass through to deno.

**Exit codes:**
- The program's own exit code on successful run
- `1` if lint or type-check failed (program never executed)
- `2` for internal errors

---

## Common errors

### Import not in allowlist
`shot check` flags imports outside `shot:`, `bun:`, and relative `.shot` paths.

### Type errors block `shot run`
A `.shot` program that lints clean but fails `deno check` will not execute. This is intentional — type-checks are gating, like `go run`.
