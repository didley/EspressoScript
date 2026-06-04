# T05 — Import allowlist rule

## Goal
Implement the `imports-allowlist` rule: only `shot:*`, `jsr:@espresso/*`, and relative paths ending in `.shot` are permitted in `.shot` source.

## Dependencies
T02, T03.

## Files to create
- `cli/checker/rules/imports-allowlist.ts`
- `tests/fixtures/imports/allowlist-valid.shot` — uses `shot:std`, `jsr:@espresso/foo`, and `./util.shot`
- `tests/fixtures/imports/allowlist-invalid-npm.shot`
- `tests/fixtures/imports/allowlist-invalid-jsr-other.shot`
- `tests/fixtures/imports/allowlist-invalid-url.shot`
- `tests/fixtures/imports/allowlist-invalid-node.shot`
- `tests/fixtures/imports/allowlist-invalid-relative-nonshot.shot` — `import x from "./helper.ts"`
- `tests/fixtures/imports/allowlist-invalid-dynamic.shot` — `await import("npm:lodash")`

## Rule

An import specifier is allowed if and only if it matches **any** of:
- `^shot:` — branded stdlib/scope
- `^jsr:@espresso/` — explicit espresso JSR scope
- `^\./` or `^\.\./` AND ends with `.shot` — relative to another `.shot` file in this project

Everything else is a violation. Triggered on:
- `ts.isImportDeclaration(node)` — read `node.moduleSpecifier.text`
- `ts.isExportDeclaration(node)` with `node.moduleSpecifier` (re-exports)
- Dynamic `import("...")`: `ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword`

## Diagnostic

```json
{"rule":"imports-allowlist","message":"Import specifier \"npm:lodash\" is not allowed. v1 permits shot:*, jsr:@espresso/*, and relative *.shot imports only."}
```

## Acceptance criteria
- All fixtures behave as expected (one valid → 0 diagnostics; six invalid → 1 diagnostic each).
- Dynamic `import()` is also flagged.
- Re-exports (`export * from "..."`, `export { x } from "..."`) are flagged when the specifier is disallowed.

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript
deno run --allow-read tests/run-imports-fixtures.ts
```

## Notes
- Matching is on raw string specifiers — no resolution. `jsr:@espresso/std` ✓, `jsr:@other/pkg` ✗.
- Resolution of `shot:*` → `jsr:@espresso/*` happens at Deno's import-map layer (see `docs/ARCHITECTURE.md`), not in the checker. The checker only validates source-level specifiers.
- Multi-file projects: this task enables them. Cross-file type-checking is handled by `deno check`'s normal module graph traversal — no extra work needed.
