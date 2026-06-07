---
description: Migrate an existing TypeScript codebase to full ShotScript compliance
---

Migrate this TypeScript codebase to ShotScript compliance. Target: $ARGUMENTS (if blank, use `src/**/*.ts`).

This is a staged process — do not attempt everything at once.

---

**Phase 1 — Audit**

Run `npx shotscript '<glob>'` and count violations per rule. Categorize them:

- **Mechanical** (safe, local rewrites): `no-interface`, `no-optional-property`, `no-undefined-type`, `require-readonly-property`, `require-readonly-arrays`, `no-let-outside-for`, `no-increment-decrement`, `no-loose-equality`, `no-double-bang`, `no-and-shorthand`, `no-enum`, `no-default-export`, `no-any`, `require-return-type`
- **Structural** (require reasoning across call sites): `no-arrow-functions`, `no-class`, `no-throw`, `no-try`, `no-promise`, `require-async-tuple-return`, `no-assertion`

Report the counts grouped by category. Confirm with the user before proceeding.

---

**Phase 2 — Mechanical fixes**

Fix all mechanical violations file by file:

- `interface Foo { prop: T }` → `type Foo = { readonly prop: T }`
- `prop?: T` → `prop: T | null`
- `T | undefined` → `T | null`
- `T[]` → `readonly T[]` in type positions
- `let x = v` (not reassigned) → `const x = v`
- `x++` / `x--` → `x += 1` / `x -= 1`
- `cond && fn()` → `if (cond === true) { fn() }`
- `==` / `!=` → `===` / `!==`
- `!!x` → `Boolean(x)`
- `enum E { A }` → `const E = { A: 'a' } as const; type E = typeof E[keyof typeof E]`
- `export default fn` → `export function fn` — update every import site
- `any` → `unknown` where safe; add explicit type annotations where needed
- Missing return type annotations → add `: ReturnType` to every function

Run the linter after Phase 2. Confirm zero mechanical violations before moving on.

---

**Phase 3 — Structural fixes**

Work through one category at a time:

**Arrow functions → named functions**

Every arrow function and every anonymous callback becomes a named `function`:
- `const f = (x: T): R => expr` → `function f(x: T): R { return expr }`
- `arr.map(x => x * 2)` → `arr.map(function double(x: number): number { return x * 2 })`
- Top-level arrow exports: `export const handler = (req) => ...` → `export function handler(req: Req): Res { ... }`

Add explicit return type annotations to every function.

**Classes → types + functions**

For each class:
1. Extract the shape: `type ClassName = { readonly field: FieldType; ... }`
2. Convert each method to a standalone named function with the instance as first param
3. Replace `new ClassName(args)` with an object literal or a `makeClassName(args): ClassName` factory
4. Update every call site

**Error handling → Result tuples**

This is the core architectural change. Import from `shotscript/std`:
```ts
import { toResult, toPromiseResult, safeFetch, jsonParse, jsonStringify } from 'shotscript/std'
import type { Result, PromiseResult } from 'shotscript/std'
```

Then:
- `throw new Error(msg)` → `return [null, new Error(msg)]`
- `return value` in a fallible function → `return [value, null]`
- `try { const x = risky() } catch (e) { ... }` → `const [x, err] = toResult(function run() { return risky() })`
- `await fetch(url)` → `const [res, fetchErr] = await safeFetch(url)`
- `JSON.parse(text)` → `const [data, parseErr] = jsonParse<T>(text)`
- `fn()` that now returns `Result<T>` → every caller must `const [val, err] = fn()` and check `if (err !== null)`
- Async functions: return type becomes `Promise<[T | null, Error | null]>`

Update every call site. This cascades — fix from the leaves of the call graph toward the entry point.

**Promises → async/await + tuples**

- `Promise.resolve(x)` → make the function synchronous, or use `toPromiseResult`
- `.then(fn).catch(fn)` → `await` + tuple destructure
- `Promise.all([...])` → sequential `await` calls with error checks, or `toPromiseResult`

---

**Phase 4 — Final check**

Run `npx shotscript '<glob>'` one last time. Zero violations is the goal. If any remain, fix them before finishing.
