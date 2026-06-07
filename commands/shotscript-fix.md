---
description: Fix all ShotScript violations in the current project
---

Fix all ShotScript lint violations in this project.

**Step 1 — Run the linter.**

If `$ARGUMENTS` contains a glob, use it. Otherwise check `package.json` scripts for an existing `shotscript` invocation pattern. If none found, default to `src/**/*.ts`.

Run: `npx shotscript '<glob>'`

Output format: `path/to/file.ts:line:col [rule-name] message`

**Step 2 — Group violations by file, fix each one.**

Read each affected file and apply the following rewrites:

| Rule | Fix |
|---|---|
| `no-arrow-functions` | `const f = (x) => expr` → `function f(x: T): R { return expr }` with explicit return type |
| `no-interface` | `interface Foo { prop: T }` → `type Foo = { readonly prop: T }` |
| `no-optional-property` | `prop?: T` → `prop: T \| null` |
| `no-undefined-type` | `T \| undefined` → `T \| null`; `param?: T` → `param: T \| null` |
| `no-any` | `any` → `unknown`; remove unsafe casts |
| `no-assertion` | Remove `as T`; use explicit narrowing or a typed parse function |
| `require-readonly-property` | Add `readonly` to every object type property |
| `require-readonly-arrays` | `T[]` → `readonly T[]` in type positions |
| `no-let-outside-for` | `let x = v` (not reassigned) → `const x = v`; accumulators → named versions (`v1`, `v2`) or in-place `Map`/`Set` mutation |
| `no-increment-decrement` | `x++` / `x--` → `x += 1` / `x -= 1` |
| `no-ternary` | `cond ? a : b` → `if`/`else` block or extract a named function |
| `no-throw` | `throw new Error(msg)` → `return [null, new Error(msg)]` |
| `no-try` | `try { risky() } catch (e) { ... }` → `const [val, err] = toResult(function run() { return risky() })` |
| `no-enum` | `enum E { A }` → `const E = { A: 'a' } as const; type E = typeof E[keyof typeof E]` |
| `no-class` | Extract `type T = { readonly ... }` + standalone named functions; replace `new` with a `make` factory |
| `no-loose-equality` | `==` / `!=` → `===` / `!==` |
| `no-double-bang` | `!!x` → `Boolean(x)` |
| `no-and-shorthand` | `cond && fn()` → `if (cond === true) { fn() }` |
| `no-implicit-truthy` | `if (x)` → `if (x !== null)` or `if (x !== undefined)` depending on type |
| `require-return-type` | Add `: ReturnType` annotation to every function declaration |
| `no-default-export` | `export default fn` → `export function fn`; update all import sites |
| `no-floating-promises` | `fn()` (returns Promise) → `await fn()` inside an async function, or `await main()` at top level |
| `no-promise` | `Promise.resolve(x)` / `.then()` / `.catch()` → direct `await` + tuple destructure |

For `no-throw` / `no-try` / `no-promise` fixes, import from `shotscript/std`:
```ts
import { toResult, toPromiseResult, safeFetch, jsonParse } from 'shotscript/std'
```

**Step 3 — Verify.**

Re-run the linter after fixing all files. If violations remain, fix and repeat until zero.

Do not introduce new violations while fixing existing ones — every line you write must also comply with ShotScript rules.
