# ShotScript — Agent Context

This file is the coding style guide for **ShotScript** (`shotscript` npm package). You are writing TypeScript that follows the ShotScript rules. This file is authoritative. Follow it exactly. When in doubt, the explicit, verbose, named form always wins.

**One canonical way to write every construct.** The same philosophy as Go: remove choices, not features. Code that looks the same everywhere is easier to read, review, and generate correctly.

---

## Repo architecture

ShotScript is a **published npm library** (`shotscript`). Users install it and run it against *their* projects. Every design decision must account for arbitrary user codebases — not just this repo's own source.

### Package exports

| Export | Entry point | Purpose |
|---|---|---|
| `shotscript` | `dist/lint/index.js` | Programmatic linter API (`check`, `posOf`) |
| `shotscript/std` | `dist/std/index.js` | Standard library (`toResult`, `safeFetch`, etc.) |
| `shotscript/plugin` | `dist/lintTsPlugin.cjs` | TypeScript language service plugin (IDE integration) |
| `shotscript/tsconfig/shotscript.json` | `src/tsconfig/shotscript.json` | Strict tsconfig preset users extend |
| `shotscript/fmt` | `src/fmt/shotscript.json` | Prettier config preset |

The CLI binary (`shotscript`) is `src/lintCli.ts` — not part of the published API, just the command-line runner.

### Source layout

```
src/
  lintCli.ts          — CLI entry point (glob → check → print diagnostics → exit)
  lintTsPlugin.ts     — TS language service plugin (IDE real-time linting)
  lint/
    check.ts          — core check() function: builds AST, walks nodes, collects diagnostics
    types.ts          — Diagnostic, Context, Rule types
    pos.ts            — posOf() helper: ts.Node → { line, col }
    index.ts          — public re-exports for the programmatic API
    rules/
      all.ts          — imports every rule and exports the rules array
      no-*.ts         — one file per rule
      require-*.ts    — one file per rule
  std/
    index.ts          — toResult, safeFetch, jsonParse, jsonStringify, etc.
```

### How the linter works

1. **CLI** (`lintCli.ts`) resolves globs to absolute paths, reads the nearest `tsconfig.json` via `ts.findConfigFile`, then calls `ts.createProgram(allFiles, compilerOptions)` **once** for the entire run.
2. **`check(file, source, typeChecker, programSourceFile)`** walks the AST of one file. When `typeChecker` and `programSourceFile` are provided (from the shared program), it uses them directly. When both are `null` (e.g. in tests), it falls back to building a per-file program.
3. **Rules** receive every AST node via `visit(node, ctx)`. Rules that need type information check `if (!ctx.typeChecker) return` and skip gracefully when the checker is absent.
4. **TS plugin** (`lintTsPlugin.ts`) calls `check()` with the existing program's checker — no extra compilation cost.

### Adding a rule

1. Create `src/lint/rules/no-<name>.ts` exporting a `Rule` object with `name` and `visit`.
2. Import and add it to the array in `src/lint/rules/all.ts`.
3. Add a fixture file to `tests/pass/` or `tests/fail/` — the test runner picks them up automatically.

**Rule implementation must itself be valid ShotScript.** Common pitfalls when writing rule files:

- **Use `ctx.report(...)`, not `ctx.push(...)`** — `push` is banned by `no-mutating-array-methods`. `Context.report` is the correct method name.
- **No arrow functions in callbacks** — `members.every(member => ...)` is banned. Extract a named `function` and pass it: `members.every(isReadonlyProperty)`.
- **No ternary chains for lookup** — `method === 'a' ? x : method === 'b' ? y : z` is banned. Use a module-level `ReadonlyMap` instead and call `.get()`.
- **No non-null assertions** — `map.get(key)!` is banned. Guard with `if (value === undefined) return` after `.get()`.
- **Module-level constants** — put `BANNED` sets/maps at module scope, not inside `visit`. They're constructed once per rule, not per node.

### Key constraints

- **Never hardcode compiler options** in `lintCli.ts`. Always read the user's `tsconfig.json` via `ts.findConfigFile`. Users choose their own `target`, `lib`, `paths`, etc.
- **One shared `ts.createProgram`** per CLI run. Creating a program per file adds ~50s to a 30-file run. The `check()` fallback exists for tests only.
- **Rules must be side-effect free** — `visit` only calls `ctx.report()` to emit diagnostics. No state between files.
- **The linter itself must pass its own rules.** The pre-commit hook runs `npm run lint` over `src/`. Any new code in `src/` must be valid ShotScript.

---

## Functions

**Only `function` declarations. No arrow functions, ever.**

```ts
// ❌
const double = (n: number) => n * 2
setTimeout(() => doThing(), 1000)

// ✅
function double(n: number): number { return n * 2 }
setTimeout(function doThing(): void { doThing() }, 1000)
```

**Every function must have an explicit return type annotation.**

```ts
// ❌
function double(n: number) { return n * 2 }

// ✅
function double(n: number): number { return n * 2 }
```

**Every function expression must be named.**

```ts
// ❌
[1, 2, 3].map(function (n: number): number { return n * 2 })

// ✅
[1, 2, 3].map(function double(n: number): number { return n * 2 })
```

**No default parameters. No optional parameters. Use `| null` explicitly.**

```ts
// ❌
function greet(name: string, greeting?: string): string { ... }
function greet(name: string, greeting: string = "hello"): string { ... }

// ✅
function greet(name: string, greeting: string | null): string {
    if (greeting === null) { return `hello, ${name}` }
    return `${greeting}, ${name}`
}
```

---

## Error handling

**The most important pattern. Never throw, never catch. Return a tuple.**

```ts
type Result<T> = [T, null] | [null, Error]
```

Every fallible function returns `[value, null]` on success or `[null, Error]` on failure. The caller always destructures and checks.

```ts
// ❌ — throws, hides errors from the type system
async function getUser(id: number): Promise<User> {
    const res = await fetch(`/users/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status.toString()}`)
    return res.json() as User
}

// ✅ — errors are in the type signature
import { safeFetch, jsonParse } from 'shotscript/std'

async function getUser(id: number): Promise<[User | null, Error | null]> {
    const [res, fetchErr] = await safeFetch(`/users/${id.toString()}`)
    if (fetchErr !== null) { return [null, fetchErr] }
    if (!res.ok) { return [null, new Error(`HTTP ${res.status.toString()}`)] }
    return jsonParse<User>(await res.text())
}
```

**Async functions must return `Promise<void>` or `Promise<[T | null, Error | null]>`. Nothing else.**

```ts
// ❌
async function loadConfig(): Promise<Config> { ... }

// ✅
async function loadConfig(): Promise<[Config | null, Error | null]> { ... }
```

**No `throw`. No `try`/`catch`. No `.then()`/`.catch()` chains.**

```ts
// ❌
throw new Error("bad input")
try { riskyOp() } catch (e) { handle(e) }
fetch(url).then(function handleRes(r: Response): Promise<unknown> { return r.json() })

// ✅
return [null, new Error("bad input")]
const [result, err] = toResult(function run(): unknown { return riskyOp() })
const [res, err] = await safeFetch(url)
```

**Every call that returns a tuple must be destructured immediately.**

```ts
// ❌
const result = divide(10, 2)

// ✅
const [quotient, divErr] = divide(10, 2)
if (divErr !== null) { return [null, divErr] }
```

**Use ShotScriptStd (`shotscript/std`) for banned globals:**

```ts
import { toResult, toPromiseResult, jsonParse, jsonStringify, safeFetch, wrapError } from 'shotscript/std'
import type { Result, PromiseResult } from 'shotscript/std'

// third-party calls that throw
const [val, err] = toResult(function parse(): unknown { return thirdParty.parse(input) })
const [val, err] = await toPromiseResult(function query(): Promise<Row> { return db.find(id) })

// banned globals
const [data, err] = jsonParse<Config>(text)
const [json, err] = jsonStringify(payload)
const [res, err] = await safeFetch('https://api.example.com')

// add context when propagating errors
const [cfg, cfgErr] = jsonParse<Config>(text)
if (cfgErr !== null) { return [null, wrapError('loadConfig: parse failed', cfgErr)] }
```

---

## Variables

**`const` everywhere. `let` only inside `for` loop headers. `var` never.**

```ts
// ❌
let count = 0
var name = 'alice'

// ✅
const count = 0
for (let i = 0; i < 10; i += 1) { ... }
```

**One declaration per statement.**

```ts
// ❌
const a = 1, b = 2

// ✅
const a = 1
const b = 2
```

**No `++` / `--`. Use `+= 1` / `-= 1`.**

**No variable shadowing.**

```ts
// ❌
const x = 1
function f(): void { const x = 2 }  // shadows outer x

// ✅
const x = 1
function f(): void { const y = 2 }
```

---

## Types

**`type` only. No `interface`.**

```ts
// ❌
interface User { id: number; name: string }

// ✅
type User = { readonly id: number; readonly name: string }
```

**Every object type property must be `readonly`.**

```ts
// ❌
type Config = { host: string; port: number }

// ✅
type Config = { readonly host: string; readonly port: number }
```

**Arrays in type annotations must be `readonly T[]`. Not `T[]`, not `Array<T>`, not `ReadonlyArray<T>`.**

```ts
// ❌
const xs: number[] = []
const ys: Array<number> = []

// ✅
const xs: readonly number[] = []
```

**`null` only. No `undefined` in type annotations.**

```ts
// ❌
type User = { name: string | undefined }
function f(x?: string): void { ... }

// ✅
type User = { readonly name: string | null }
function f(x: string | null): void { ... }
```

**No optional properties. Use `| null` per field.**

```ts
// ❌
type Config = { readonly host: string; readonly port?: number }

// ✅
type Config = { readonly host: string; readonly port: number | null }
```

**No `any`, no type assertions, no non-null assertions, no `@ts-ignore`.**

```ts
// ❌
const x: any = getValue()
const y = getValue() as User
const z = getValue()!

// ✅
const x: unknown = getValue()
const [user, err] = parseUser(getValue())
```

**No `enum`. Use `as const` objects.**

```ts
// ❌
enum Status { Active, Inactive }

// ✅
const Status = { Active: 'active', Inactive: 'inactive' } as const
type Status = typeof Status[keyof typeof Status]
```

**No `class`, no `abstract`, no decorators, no `this`.**

**No intersection types. Spell out the fields or use named composition.**

```ts
// ❌
type Tagged = Base & { readonly tag: string }

// ✅
type Tagged = { readonly base: Base; readonly tag: string }
```

**No conditional types. No mapped types. No `infer`.**

```ts
// ❌
type NonNullable<T> = T extends null ? never : T
type Nullable<T> = { readonly [K in keyof T]: T[K] | null }

// ✅ — write the concrete type directly
type Name = string
type NullableUser = { readonly id: number | null; readonly name: string | null }
```

**Banned utility types: `Partial`, `Required`, `Record`, `Readonly` (wrapper form), `InstanceType`, `ConstructorParameters`, `ThisType`.**

**Use `Map<K, V>` for dictionaries. Not index signatures, not `Record`.**

**`Map<K, V>` and `Set<T>` in type positions must be `ReadonlyMap<K, V>` and `ReadonlySet<T>`.** A "type position" is any explicit type annotation (`: Map<...>`), return type, or type alias body. `new Map<string, Node>()` in an expression is fine — it uses a type *argument*, not a type annotation.

When you need a mutating `Map` or `Set` inside a type (e.g. you call `.set()` on it), **do not use `as Map<...>` to cast** — that violates `no-assertion`. Instead derive the type via `typeof`:

```ts
// Module-level proto — never written in a type annotation
const _BINDINGS_PROTO = new Map<string, ts.Node>()

type ScopeFrame = {
    readonly bindings: typeof _BINDINGS_PROTO  // TypeQueryNode, not TypeReferenceNode — rule won't fire
}

function createFrame(): ScopeFrame {
    return { bindings: new Map<string, ts.Node>() }
}
// scope.bindings.set(k, v) — works, because typeof resolves to the mutable Map type
```

**`new` is only allowed on built-in runtime constructors** (`Map`, `Set`, `Error`, `Date`, `URL`, `RegExp`, etc.). Never `new UserType()` — use plain object literals and factory functions instead.

---

## Async main

**Async entry points must be `await`-ed, not called bare. `void fn()` is banned (`no-void`). Top-level `await` is valid in ESM modules.**

```ts
// ❌ — no-floating-promises; the Promise is unhandled
main()

// ❌ — no-void; void as a statement is banned
void main()

// ✅ — top-level await in an ESM module
async function main(): Promise<void> { ... }
await main()
```

---

## Accumulation without `let`

`let` is banned outside `for` headers. Two patterns work for building up state.

**Pattern 1 — in-place mutation of a `const` Map/Set (scoped to one function):**

```ts
function buildCatalog(books: readonly Book[]): Map<string, Book> {
    const catalog = new Map<string, Book>()   // const binding
    for (const book of books) {
        catalog.set(book.id, book)            // mutate the object, not the binding
    }
    return catalog
}
```

**Pattern 2 — immutable update, different name each step:**

```ts
const [v1, err1] = addBook(empty, bookA, 'seed')
if (err1 !== null) { return [null, err1] }
const [v2, err2] = addBook(v1, bookB, 'seed')
if (err2 !== null) { return [null, err2] }
```

**Pattern 3 — sequential async collection (for-await + index assignment):**

When you need to `await` inside a loop and collect results into a flat array, `Promise.all` is banned and `let` is banned outside `for` headers. Use index assignment on a `const` array (index assignment is not a method call — `no-mutating-array-methods` doesn't fire):

```ts
const fileGroups = []
for (const pattern of patterns) {
    const matches = await glob(pattern, { absolute: true })
    fileGroups[fileGroups.length] = matches   // index assignment, not .push()
}
const files = fileGroups.flat()              // .flat() is not mutating — fine
```

Do not annotate `fileGroups` or `files` with an explicit array type — `require-readonly-arrays` would flag `string[][]`. Let TypeScript infer.

**While loops without `let` — check external mutable state:**

```ts
// ❌ — needs a let counter
let i = 0
while (i < items.length) { i += 1 }

// ✅ — const bindings inside the loop body; condition checks mutable Set.size
const pending = new Set(items)
while (pending.size > 0) {
    const iter = pending.values()
    const next = iter.next()
    if (next.done !== true) {
        process(next.value)
        pending.delete(next.value)
    }
}
```

---

## Array access under `noUncheckedIndexedAccess`

`arr[i]` returns `T | undefined`. Always check before use.

```ts
// ❌ — TypeScript error: arr[i] is T | undefined
const item = arr[i]
doThing(item)

// ✅
const item = arr[i]
if (item === undefined) { break }
doThing(item)
```

---

## Control flow

**No ternary. Use `if`/`else` or extract a named function.**

```ts
// ❌
const label = isReady ? 'go' : 'wait'

// ✅
function labelFor(ready: boolean): string {
    if (ready) { return 'go' }
    return 'wait'
}
```

**`===` / `!==` only. No `==` / `!=`.**

**Every condition must be an explicit boolean expression — no implicit truthy/falsy (`no-implicit-truthy`).** This applies to `if`, `while`, `&&`, `||`, and ternary conditions.

```ts
// ❌ — implicit truthy on optional references, numbers, bitwise results
if (node.name) { ... }
if (node.body) walk(node.body)
if (flags & ts.TypeFlags.Any) return false
if (node.isExportEquals) return   // boolean | undefined is still not a boolean

// ✅ — explicit comparisons
if (node.name !== undefined) { ... }
if (node.body !== undefined) walk(node.body)
if (Boolean(flags & ts.TypeFlags.Any)) return false
if (node.isExportEquals === true) return
```

Common patterns to always be explicit about:
- Optional TS API fields (`node.name`, `node.body`, `node.initializer`, `clause.namedBindings`): `!== undefined`
- Bitwise enum flags: `Boolean(x & Enum.Flag)`
- Properties typed `boolean | undefined`: `=== true` / `!== true`

**No `&&` shorthand for side effects. Use `if`.**

```ts
// ❌
condition && doThing()

// ✅
if (condition === true) { doThing() }
```

**No `for...in`. Use `for...of` or `Object.keys()`.**

**No `do...while`. Use `while`.**

**No labels. Extract a function and `return` instead.**

**`switch` requires `break` or `return` on every case — no fallthrough.**

---

## Imports / exports

**Named exports only. No `export default`.**

```ts
// ❌
export default function handler() { ... }

// ✅
export function handler(): void { ... }
```

**No `require()`. ESM only.**

**No barrel/index imports. Import the specific file.**

```ts
// ❌
import { add } from './math/index.js'
import { add } from './math'

// ✅
import { add } from './math/add.js'
```

---

## Banned constructs — quick reference

| Banned | Use instead |
|---|---|
| Arrow functions | Named `function` declaration/expression |
| `throw` / `try` / `catch` | Return `[null, new Error(...)]` |
| `.then()` / `.catch()` | `await` + tuple destructure |
| `interface` | `type` |
| `enum` | `as const` object + `typeof` type |
| `class` | Plain types + functions |
| `any` | `unknown` |
| `as T` (cast) | Parse and validate, return Result |
| `x!` | Explicit null check |
| `// @ts-ignore` | Fix the type |
| `T[]` in annotations | `readonly T[]` |
| `Array<T>` / `ReadonlyArray<T>` | `readonly T[]` |
| Optional property `prop?:` | `prop: T \| null` |
| Optional parameter `x?:` | `x: T \| null` |
| Default parameter `x = val` | Explicit check inside body |
| `undefined` in types | `null` |
| Ternary `? :` | `if`/`else` or named function |
| `let` outside `for` header | `const` |
| `var` | `const` |
| `++` / `--` | `+= 1` / `-= 1` |
| `JSON.parse` | `jsonParse<T>()` from ShotScriptStd (`shotscript/std`) |
| `JSON.stringify` | `jsonStringify()` from ShotScriptStd (`shotscript/std`) |
| `fetch(url)` | `safeFetch(url)` from ShotScriptStd (`shotscript/std`) |
| Third-party throws | `toResult(function fn() { return ... })` from `shotscript/std` |
| `Record<K, V>` | `Map<K, V>` |
| Index signature `[k: string]: T` | `Map<string, T>` |
| `Partial<T>` | Spell out optional fields with `\| null` |
| Intersection `A & B` | Spell out fields or compose by value |
| Conditional type `T extends U ? X : Y` | Write the concrete type directly |
| Mapped type `{ [K in keyof T]: ... }` | Spell out the fields explicitly |
| `infer` | Write the concrete type directly |
| `Object.assign` / `Object.create` | Spread `{ ...a, ...b }` |
| `Proxy` / `Reflect` | Direct access |
| `eval` | Never |
| `for...in` | `for...of Object.keys()` |
| `do...while` | `while` |
| `&&` for side effects | `if (condition === true)` |
| `!!value` | `Boolean(value)` |
| `typeof x !== 'undefined'` | `x !== null` |
| `Map<K,V>` or `Set<T>` in type annotations | `ReadonlyMap<K,V>` / `ReadonlySet<T>`, or `typeof _proto` when mutability is needed |
| `new UserType()` | Plain object literal + factory function |
| Truthy condition on optional/nullable (`if (x)`) | Explicit `if (x !== undefined)` or `if (x !== null)` |
| `x & Enum.Flag` as condition | `Boolean(x & Enum.Flag)` |
| `boolOrUndefinedProp` as condition | `boolOrUndefinedProp === true` |
| `parseInt` / `parseFloat` | `Number(str)` |

---

## Common LLM mistakes to avoid

1. **Writing arrow functions** — the most frequent mistake. Every function is a named `function` keyword declaration.

2. **Forgetting tuple destructure** — if a function returns `Result<T>`, the caller must `const [val, err] = fn()`. Never `const result = fn()`.

3. **Using `interface`** — always `type`.

4. **Using `async` without tuple return** — async functions return `Promise<void>` or `Promise<[T | null, Error | null]>`. A bare `Promise<User>` fails the `require-async-tuple-return` rule.

5. **Using `undefined`** — the only nullable value is `null`. Write `string | null`, never `string | undefined`.

6. **Calling `JSON.parse` / `fetch` directly** — import `jsonParse` / `safeFetch` from ShotScriptStd (`shotscript/std`) instead.

7. **Writing optional properties** — `{ name?: string }` is banned. Write `{ readonly name: string | null }`.

8. **Forgetting `readonly`** — every object type property and every array type annotation needs it.

9. **Using ternary for conditional values** — extract a named function instead.

10. **Omitting return type** — every function declaration needs an explicit `: ReturnType` annotation.

11. **Using type-level metaprogramming** — no conditional types, no mapped types, no `infer`. Write the concrete type you actually mean.

12. **Calling `main()` bare** — this is a floating Promise. Top-level `await main()` is the correct form in ESM. The `void` operator is also banned (`no-void`).

13. **Using `let` to accumulate in a loop** — `let catalog = empty; for (...) { catalog = addBook(catalog, ...) }` is banned. Use in-place mutation of a `const` Map/Set, or carry named versions (`v1`, `v2`) through a chain of Result checks.

14. **Using `Promise.resolve()` / `Promise.all()` / `Promise.race()`** — these static methods are banned (`no-promise`). To wrap a known-good value as an async result, restructure the function to be synchronous, or use `toPromiseResult` wrapping a real async call.

15. **Using `ReadonlyMap<K, V>` as a function parameter type for a dictionary** — `new Map(existingMap)` accepts `Map<K, V>` but TypeScript doesn't accept `ReadonlyMap<K, V>` there. Use `Map<K, V>` as the type; `const` binding prevents reassignment.

16. **Forgetting `no-floating-promises`** — always `await` async calls or ensure they're within an `async` function that is itself awaited.

17. **Implicit truthy conditions on optional TypeScript API nodes** — `ts.Node` properties like `node.name`, `node.body`, `node.initializer`, `node.importClause`, and `clause.namedBindings` are typed as `T | undefined`. Writing `if (node.name)` is banned by `no-implicit-truthy`. Always write `if (node.name !== undefined)`. Bitwise flag tests (`flags & ts.TypeFlags.X`) return a number, not a boolean — use `Boolean(flags & ts.TypeFlags.X)`. A `boolean | undefined` property still needs `=== true`.

18. **Reaching for a class or arrow function when a factory is needed** — `no-class`, `no-arrow-functions`, and `no-new-user-types` are all active. Factory functions must be named `function` declarations. Use plain object literals as the return value.

19. **Writing `undefined` in a return type to drive `ts.forEachChild` short-circuit** — `undefined` is banned in type annotations. Use `void` instead: `true | void`. At runtime, `return` with no value produces `undefined`, which `ts.forEachChild` treats as "continue". The pattern:

    ```ts
    function walk(n: ts.Node): true | void {
        if (ts.isAwaitExpression(n)) return true
        if (BOUNDARIES.has(n.kind)) return   // implicit void/undefined — continues traversal
        return ts.forEachChild(n, walk)
    }
    return ts.forEachChild(root, walk) === true
    ```

20. **Not reading the rule source before fixing a violation** — when a lint fix requires introducing a new type annotation pattern (readonly collections, type queries, etc.), read the rule implementation in `src/lint/rules/` first to understand exactly what AST node shape it checks. For example, `require-readonly-collections` only fires on `TypeReferenceNode`s — a `typeof` type query (`TypeQueryNode`) is invisible to it, which is the correct escape hatch when you need a mutable Map type without writing `Map<K,V>` in an annotation position.

---

## Documentation and copy style

ShotScript targets developers who know TypeScript but may not know language theory. All site copy, rule descriptions, and error messages should use plain language approachable to new developers.

**Prefer outcome language over mechanism language:**
- ✅ "~79% fewer ways to write the same thing" — developers immediately understand fewer choices
- ❌ "~79% of valid TypeScript syntax forms removed" — "valid forms" is language-spec jargon

The ~79% figure is computed in `scripts/reduction.mjs` (`npm run reduction`). Update both that file and `site/index.html` when rules change.

**Explain constraints as simplifications, not restrictions:**
- ✅ "one way to say nothing: `null`" — frames the rule as reducing cognitive load
- ❌ "prohibits `undefined` in type annotation positions" — sounds punitive

**Make the type system benefit concrete:**
- ✅ "when absence is always `null`, you only ever need one check" — shows the payoff
- ✅ "flat types — every field is readable where the type is defined, no hidden merges" — explains why no `&`
- ❌ "eliminates intersection type indirection" — too abstract

**Prefer concrete before abstract.** Show code first, explain why second. Never explain a rule without a before/after.

**Key term preferences:**
- "ways to write" not "syntax forms" or "valid constructs"
- "fewer decisions" not "reduced configuration surface"
- "simpler types" not "flatter type hierarchies"
- "errors you can't forget to handle" not "exhaustive error propagation"
- "one check" not "single branch condition"
