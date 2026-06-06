# ShotScript — Agent Context

This is the ShotScript toolchain repository. ShotScript is a TypeScript dialect that enforces lint constraints: one canonical way to write every construct. `.shot` files are valid TypeScript with a different extension — no new syntax, only stricter rules enforced at lint and build time.

---

## ShotScript vs ShotLint

**ShotScript** (this repo) is the full opinionated toolchain. It requires Bun, uses `.shot` files instead of `.ts`, enforces Shot principles at the runtime level, and ships its own CLI (`shot init` · `check` · `fmt` · `build` · `run` · `test`) and stdlib (`shot:std`). Users adopt ShotScript by starting a new project with `shot init` — there is no config, no overrides.

**ShotLint** (`lint/` submodule, published as `shot-lint` on npm) is the package for existing TypeScript projects. It brings Shot principles via a TypeScript language-server plugin (rules surface as `tsc` errors in CI and editor squiggles), a shareable Biome config, and safe util wrappers. No `.shot` extension, no Bun, no CLI required — just `npm install shot-lint`.

---

## Repo layout

```
cli/                    Bun-based shot CLI
  index.ts              Entry point — routes subcommands
  check.ts              `shot check` — AST lint
  build.ts              `shot build` — type-check only
  run.ts                `shot run` — type-check + execute
  test.ts               `shot test` — discover and run *.test.shot
  fmt.ts                `shot fmt` — formats .shot files in place
  init.ts               `shot init` — scaffold a new project
  pipeline.ts           Shared: .shot→.ts rewriting, import map, temp dirs
  checker/              AST rule checker (used by `shot check`)
    index.ts            check(file, source) → Diagnostic[]
    types.ts            Rule, Diagnostic, Context types
    rules/              One file per rule (~94 rules)
      index.ts          Registers all rules
lint/                   shot-lint submodule (npm package for users)
  src/checker/          Parallel copy of cli/checker/ for the npm package
stdlib/                 shot standard library (published as @shotscript/std on npm)
  index.ts              safeFetch, jsonParse, jsonStringify, readFile, writeFile, wrapError, toResult, toPromiseResult
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
| `cli/checker/` | `shot check` CLI command | Bun |
| `lint/src/checker/` | `shot-lint` npm package | Node.js |

Both have the same rule files, types, and structure. When you add or change a rule, **you must update both**. The `lint/` submodule is what users install via npm; `cli/checker/` is what the CLI uses directly.

The `cli/checker/rules/index.ts` imports use `.ts` extensions (Bun style). The `lint/src/checker/rules/index.ts` imports use `.js` extensions (NodeNext/ESM style).

---

## Running the CLI locally

```bash
bun run cli/index.ts --help
bun run cli/index.ts check path/to/file.shot
bun run cli/index.ts run path/to/file.shot
bun run cli/index.ts test path/to/dir/
```

To point the CLI at the local stdlib instead of the published npm version:

```bash
SHOT_STDLIB_LOCAL=$(pwd)/stdlib/index.ts bun run cli/index.ts run file.shot
```

To inspect the temp directory the CLI creates during `build`/`run`/`test`:

```bash
SHOT_KEEP_TEMP=1 bun run cli/index.ts run file.shot
```

---

## Running tests

**Integration tests (primary)** — runs 53 real CLI cases end-to-end:

```bash
bash scripts/verify.sh
```

**Rule fixture tests** — fast, no CLI needed, runs the checker directly:

```bash
bun run tests/run-syntax-fixtures.ts
bun run tests/run-types-fixtures.ts
bun run tests/run-imports-fixtures.ts
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
3. Rewrite `shot:` specifiers to `@shotscript/` (or local override via `SHOT_STDLIB_LOCAL`)
4. Copy transformed source into a temp directory
5. Type-check in-process via the TypeScript compiler API (`cli/typecheck.ts`) with strict options
6. Execute with `bun run` against the temp entry file

`shot check` skips type-checking entirely — it runs the AST rule checker in `cli/checker/` directly.

---

## How to add a rule

1. **Add the rule file to `cli/checker/rules/`** — copy any existing rule as a template. Export a single `const` of type `Rule`. Use `.ts` import extensions.

2. **Register it in `cli/checker/rules/index.ts`** — import and add to the `rules` array.

3. **Add the same rule file to `lint/src/checker/rules/`** — identical logic but import extensions must be `.js` (NodeNext requirement).

4. **Register it in `lint/src/checker/rules/index.ts`**.

5. **Add fixture files** to `tests/fixtures/syntax/` or `tests/fixtures/types/`:
   - `rule-name-invalid.shot` — code that should trigger the rule (exactly 1 diagnostic)
   - `rule-name-valid.shot` — code that should pass clean

6. **Add an integration case** to `scripts/verify.sh` using the `diagnostic_check` helper.

7. **Add a pass/fail fixture** to `lint/tests/fixtures/` for the submodule's own test runner.

---

## Key env vars

| Variable | Effect |
|---|---|
| `SHOT_STDLIB_LOCAL` | Path to local stdlib `index.ts` — bypasses npm for development |
| `SHOT_KEEP_TEMP` | Set to `1` to leave the temp dir on disk after a command |

---

## Coding style in this repo

The CLI itself (`cli/`, `stdlib/`) is written in idiomatic TypeScript for Bun — it does not follow shot lint (the CLI needs `try/catch`, classes, etc. to implement the toolchain). The `stdlib/index.ts` is the one place in the entire codebase where `try/catch` is intentionally used to wrap throwing APIs for shot users.

The `lint/` submodule source should follow shot lint where possible, but the checker implementation necessarily uses TypeScript AST APIs that require patterns shot bans (indexing, casting, etc.) — use guarded patterns with `noUncheckedIndexedAccess` in mind.
