# ShotScript coding rules

This project uses ShotScript — a strict TypeScript dialect enforced by `shot check`.
All rules below are non-negotiable; violations fail the build.

## Functions
- Named `function` declarations only — no arrow functions (`=>`)
- Every function must have an explicit return type annotation
- Function expressions (callbacks) must be named: `arr.map(function double(n: number): number { ... })`

## Variables
- `const` everywhere — `let` only inside `for` loop headers — `var` banned
- No `++` / `--`: use `+= 1` / `-= 1`

## Error handling — no throw, no try/catch
- Fallible functions return `[T | null, Error | null]`
- Async fallible functions return `Promise<[T | null, Error | null]>` or `ShotPromise<T, E>`
- Callers must destructure: `const [value, err] = fn()`
- Use `wrapError(msg, err)` from `shot:std` to add context when propagating

```ts
// ❌
throw new Error("bad")
try { ... } catch (e) { ... }
async function getUser(id: number): Promise<User> { ... }

// ✅
return [null, new Error("bad")]
async function getUser(id: number): ShotPromise<User> { ... }
const [user, err] = await getUser(1)
if (err !== null) { ... }
```

## Types
- `type` only — no `interface`
- No `class`, no `abstract`, no `this`, no decorators
- `null` not `undefined` — never write `undefined` in type annotations
- No optional properties (`?`) or optional parameters — use `| null` explicitly
- No default parameters — wrap in a separate function if you need a default
- All object type properties must be `readonly`
- All array types must be `readonly T[]` — not `T[]`, not `Array<T>`, not `ReadonlyArray<T>`
- No `any`, no `as T` (except `as const`), no `!`, no `@ts-ignore`
- No `Partial<T>`, `Record<K,V>`, `InstanceType<T>` — see docs for full banned list

## Imports / exports
- Named exports only — no `export default`
- Import only from `shot:*` or relative paths ending in `.shot`
- No `require()`, no barrel/index files

## stdlib — use shot:std wrappers, not globals
```ts
import { jsonParse, jsonStringify, fetch, readFile, writeFile, wrapError } from "shot:std"
import type { ShotPromise } from "shot:std"

// These throw and are banned:
JSON.parse(s)         // ❌  →  jsonParse<T>(s)        ✅
JSON.stringify(v)     // ❌  →  jsonStringify(v)        ✅
fetch(url)            // ❌  →  await fetch(url)        ✅  (returns tuple)
Bun.file(p).text()    // ❌  →  await readFile(p)       ✅
```

## Other key rules
- No ternary — use `if`/`return`
- `===` / `!==` only — no `==`
- No `&&` shorthand for side effects — use `if`
- No bitwise operators, no `delete`, no `in`, no `eval`, no generators
- Template literals over string concatenation
- `Map<K, V>` for dictionaries — no index signatures, no `Record`
- `as const` objects + union type for enums — no `enum`
