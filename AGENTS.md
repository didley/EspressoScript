# ShotScript — Agent Context

This file is the coding style guide for **ShotScript** (`shotscript` npm package). You are writing TypeScript that follows the ShotScript rules. This file is authoritative. Follow it exactly. When in doubt, the explicit, verbose, named form always wins.

**One canonical way to write every construct.** The same philosophy as Go: remove choices, not features. Code that looks the same everywhere is easier to read, review, and generate correctly.

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
import { safeFetch, jsonParse } from "shotscript/utils"

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

**Use ShotScriptStd (`shotscript/utils`) for banned globals:**

```ts
import { toResult, toPromiseResult, jsonParse, jsonStringify, safeFetch, wrapError } from "shotscript/utils"
import type { Result, PromiseResult } from "shotscript/utils"

// third-party calls that throw
const [val, err] = toResult(function parse(): unknown { return thirdParty.parse(input) })
const [val, err] = await toPromiseResult(function query(): Promise<Row> { return db.find(id) })

// banned globals
const [data, err] = jsonParse<Config>(text)
const [json, err] = jsonStringify(payload)
const [res, err] = await safeFetch('https://api.example.com')
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
| `JSON.parse` | `jsonParse<T>()` from ShotScriptStd (`shotscript/utils`) |
| `JSON.stringify` | `jsonStringify()` from ShotScriptStd (`shotscript/utils`) |
| `fetch(url)` | `safeFetch(url)` from ShotScriptStd (`shotscript/utils`) |
| Third-party throws | `toResult(() => ...)` from ShotScriptStd (`shotscript/utils`) |
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
| `parseInt` / `parseFloat` | `Number(str)` |

---

## Common LLM mistakes to avoid

1. **Writing arrow functions** — the most frequent mistake. Every function is a named `function` keyword declaration.

2. **Forgetting tuple destructure** — if a function returns `Result<T>`, the caller must `const [val, err] = fn()`. Never `const result = fn()`.

3. **Using `interface`** — always `type`.

4. **Using `async` without tuple return** — async functions return `Promise<void>` or `Promise<[T | null, Error | null]>`. A bare `Promise<User>` fails the `require-async-tuple-return` rule.

5. **Using `undefined`** — the only nullable value is `null`. Write `string | null`, never `string | undefined`.

6. **Calling `JSON.parse` / `fetch` directly** — import `jsonParse` / `safeFetch` from ShotScriptStd (`shotscript/utils`) instead.

7. **Writing optional properties** — `{ name?: string }` is banned. Write `{ readonly name: string | null }`.

8. **Forgetting `readonly`** — every object type property and every array type annotation needs it.

9. **Using ternary for conditional values** — extract a named function instead.

10. **Omitting return type** — every function declaration needs an explicit `: ReturnType` annotation.

11. **Using type-level metaprogramming** — no conditional types, no mapped types, no `infer`. Write the concrete type you actually mean.
