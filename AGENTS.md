# EspressoScript — Agent Context

This is the ShotScript toolchain repository. ShotScript is a TypeScript dialect that enforces lint constraints: one canonical way to write every construct. `.shot` files are valid TypeScript with a different extension — no new syntax, only stricter rules enforced at lint and build time.

---

## Repo layout

```
cli/                    Deno-based shot CLI
  mod.ts                Entry point — routes subcommands
  check.ts              `shot check` — AST lint
  build.ts              `shot build` — type-check only
  run.ts                `shot run` — type-check + execute
  test.ts               `shot test` — discover and run *.test.shot
  fmt.ts                `shot fmt` — delegates to deno fmt
  init.ts               `shot init` — scaffold a new project
  pipeline.ts           Shared: .shot→.ts rewriting, import map, temp dirs
  checker/              AST rule checker (used by `shot check`)
    mod.ts              check(file, source) → Diagnostic[]
    types.ts            Rule, Diagnostic, Context types
    rules/              One file per rule (~94 rules)
      index.ts          Registers all rules
lint/                   shot-lint submodule (npm package for users)
  src/checker/          Parallel copy of cli/checker/ for the npm package
stdlib/                 shot standard library (published as jsr:@shotscript/std)
  mod.ts                fetch, jsonParse, jsonStringify, tryCatch, mutableRef, etc.
tests/
  fixtures/             .shot files for rule fixture tests (syntax/, types/, imports/)
  run-syntax-fixtures.ts
  run-types-fixtures.ts
  run-imports-fixtures.ts
scripts/
  verify.sh             53 integration test cases against the real shot CLI
```

---

## The two checker copies

**This is the most important architectural fact in this repo.**

There are two parallel copies of the rule checker:

| Location | Used by | Runtime |
|---|---|---|
| `cli/checker/` | `shot check` CLI command | Deno (`npm:typescript`) |
| `lint/src/checker/` | `shot-lint` npm package | Node.js |

Both have the same rule files, types, and structure. When you add or change a rule, **you must update both**. The `lint/` submodule is what users install via npm; `cli/checker/` is what the CLI uses directly.

The `cli/checker/rules/index.ts` imports use `.ts` extensions (Deno style). The `lint/src/checker/rules/index.ts` imports use `.js` extensions (NodeNext/ESM style).

---

## Running the CLI locally

```bash
deno run -A cli/mod.ts --help
deno run -A cli/mod.ts check path/to/file.shot
deno run -A cli/mod.ts run path/to/file.shot
deno run -A cli/mod.ts test path/to/dir/
```

To point the CLI at the local stdlib instead of the published JSR version:

```bash
SHOT_STDLIB_LOCAL=$(pwd)/stdlib/mod.ts deno run -A cli/mod.ts run file.shot
```

To inspect the temp directory the CLI creates during `build`/`run`/`test`:

```bash
SHOT_KEEP_TEMP=1 deno run -A cli/mod.ts run file.shot
```

---

## Running tests

**Integration tests (primary)** — runs 53 real CLI cases end-to-end:

```bash
bash scripts/verify.sh
```

**Rule fixture tests** — fast, no CLI needed, runs the checker directly:

```bash
deno run -A tests/run-syntax-fixtures.ts
deno run -A tests/run-types-fixtures.ts
deno run -A tests/run-imports-fixtures.ts
```

**shot-lint submodule tests** (from inside `lint/`):

```bash
cd lint
npm ci
node --import tsx/esm tests/runner.ts
node --import tsx/esm --test tests/utils.test.ts
```

CI runs `bash scripts/verify.sh` for the root repo and all three npm commands for the submodule.

---

## How the pipeline works

`shot build`, `shot run`, and `shot test` all follow the same flow:

1. Read the `.shot` source file(s)
2. Rewrite relative `.shot` imports to `.ts` (e.g. `"./util.shot"` → `"./util.ts"`)
3. Copy transformed source into a temp directory
4. Write a `deno.json` import map pointing `shot:` → `jsr:@shotscript/` (or local override) and embedding strict `compilerOptions`
5. Run `deno check` or `deno run` against the temp copy

`shot check` skips Deno entirely — it runs the AST rule checker in `cli/checker/` directly.

---

## How to add a rule

1. **Add the rule file to `cli/checker/rules/`** — copy any existing rule as a template. Export a single `const` of type `Rule`. Use `.ts` import extensions.

2. **Register it in `cli/checker/rules/index.ts`** — import and add to the `rules` array.

3. **Add the same rule file to `rules/src/checker/rules/`** — identical logic but import extensions must be `.js` (NodeNext requirement).

4. **Register it in `rules/src/checker/rules/index.ts`**.

5. **Add fixture files** to `tests/fixtures/syntax/` or `tests/fixtures/types/`:
   - `rule-name-invalid.shot` — code that should trigger the rule (exactly 1 diagnostic)
   - `rule-name-valid.shot` — code that should pass clean

6. **Add an integration case** to `scripts/verify.sh` using the `diagnostic_check` helper.

7. **Add a pass/fail fixture** to `lint/tests/fixtures/` for the submodule's own test runner.

---

## Key env vars

| Variable | Effect |
|---|---|
| `SHOT_STDLIB_LOCAL` | Path to local stdlib `mod.ts` — bypasses JSR for development |
| `SHOT_KEEP_TEMP` | Set to `1` to leave the temp `deno.json` dir on disk after a command |
| `DENO_EXEC` | Override the deno binary used by `scripts/verify.sh` |

---

## Coding style in this repo

The CLI itself (`cli/`, `stdlib/`) is written in idiomatic TypeScript for Deno — it does not follow shot lint (the CLI needs `try/catch`, classes, etc. to implement the toolchain). The `stdlib/mod.ts` is the one place in the entire codebase where `try/catch` is intentionally used to wrap throwing APIs for shot users.

The `lint/` submodule source should follow shot lint where possible, but the checker implementation necessarily uses TypeScript AST APIs that require patterns shot bans (indexing, casting, etc.) — use guarded patterns with `noUncheckedIndexedAccess` in mind.
