# Language Reference

Every rule below is enforced by ShotScriptLint. Violations surface as TypeScript compiler errors.

## Functions

### `function` keyword only — no arrow functions
```ts
// ❌
const greet = (name: string) => `hello ${name}`
[1, 2].map((n) => n * 2)

// ✅
function greet(name: string): string {
    return `hello ${name}`
}
[1, 2].map(function double(n: number): number { return n * 2 })
```
Rule: `no-arrow-functions`

## Variables

### `const` everywhere — `let` only inside `for`, `var` banned
```ts
// ❌
let x = 1
var y = 2

// ✅
const x = 1
for (let i = 0; i < 10; i += 1) { /* ... */ }   // let in for header is OK
```
Rules: `no-let-outside-for`, `no-var`

### No `++` / `--`
```ts
// ❌
i++
--count

// ✅
i += 1
count -= 1
```
Rule: `no-increment-decrement`

### No unary `+` coercion
```ts
// ❌
const n = +"42"

// ✅
const n = Number("42")
```
Rule: `no-unary-plus`

## Error handling

### No `throw`, no `try`/`catch`/`finally`
```ts
// ❌
throw new Error("bad")
try { /* ... */ } catch (e) { /* ... */ }

// ✅
return [null, new Error("bad")]
```
Rules: `no-throw`, `no-try`

### Fallible functions return `[T, Error | null]`
```ts
function divide(a: number, b: number): [number | null, Error | null] {
    if (b === 0) {
        return [null, new Error("divide by zero")]
    }
    return [a / b, null]
}

const [result, err] = divide(10, 2)
if (err !== null) { /* handle */ }
```

### Callers must destructure tuple-returning calls
```ts
// ❌
const result = divide(10, 2)        // not destructured

// ✅
const [v, err] = divide(10, 2)      // both bindings used (noUnusedLocals enforces)
```
Rule: `require-tuple-destructure`. Combined with TS `noUnusedLocals`, ignored `err` bindings fail the build.

### No raw Promise chains
```ts
// ❌
fetch(url).then((r) => r.json()).catch((e) => console.log(e))

// ✅
const [res, err] = await fetch(url)
```
Rule: `no-promise-chain`

### No `Promise` constructor or static methods
```ts
// ❌
new Promise((resolve) => resolve(1))
Promise.all([a, b])
Promise.race([a, b])

// ✅ — wrap external Promise-returning APIs with toPromiseResult
const [result, err] = await toPromiseResult(function doFetch(): Promise<Response> { return externalLib.fetch(url) })
```
Rule: `no-promise`

### Async functions must return a tuple

Every `async` function with a meaningful return must declare `Promise<[T | null, E | null]>` or the `PromiseResult<T, E>` alias from ShotScriptStd (`shotscript/std`). `Promise<void>` is allowed for fire-and-forget side effects.

```ts
// ❌
async function getUser(id: number): Promise<User> { ... }

// ✅ — spelled out
async function getUser(id: number): Promise<[User | null, Error | null]> { ... }

// ✅ — canonical alias
import type { PromiseResult } from "shotscript/std"
async function getUser(id: number): PromiseResult<User> { ... }

// ✅ — side-effect async with no meaningful return
async function logEvent(event: string): Promise<void> { ... }
```

Rule: `require-async-tuple-return`

### Custom error types — plain types + factories

There is no error hierarchy. Define error shapes as plain `type` declarations and construct them with factory functions. No `extends`, no `class`.

```ts
type DbError = {
    readonly message: string
    readonly code: number
    readonly table: string
}

function newDbError(message: string, code: number, table: string): DbError {
    return { message, code, table }
}

async function queryUser(id: number): PromiseResult<User, DbError> {
    return [null, newDbError("not found", 404, "users")]
}
```

For multiple failure modes across a module, use a **discriminated union**. The exhaustiveness checker enforces that every variant is handled at every call site:

```ts
type AppError =
    | { readonly kind: "database"; readonly code: number }
    | { readonly kind: "network"; readonly status: number }
    | { readonly kind: "parse"; readonly input: string }

const [user, err] = await getUser(1)
if (err !== null) {
    switch (err.kind) {
        case "database": /* err.code */ break
        case "network":  /* err.status */ break
        case "parse":    /* err.input */ break
    }
}
```

To add context when propagating an error up the call stack, use `wrapError` from ShotScriptStd — the ShotScript equivalent of Go's `fmt.Errorf("context: %w", err)`:

```ts
import { wrapError } from "shotscript/std"

async function loadConfig(path: string): PromiseResult<Config> {
    const [text, err] = await readFile(path)
    if (err !== null) {
        return [null, wrapError(`loadConfig: ${path}`, err)]
    }
    // ...
}
```

### Wrapping external throwing APIs

When importing external APIs that throw or reject instead of returning tuples, use `toResult` (sync) or `toPromiseResult` (async) from ShotScriptStd (`shotscript/std`):

```ts
import { toResult, toPromiseResult } from "shotscript/std"

// synchronous third-party call that throws
const [parsed, err] = toResult(function parse(): ParsedData { return someLib.parseSync(input) })

// async third-party call that rejects
const [rows, err] = await toPromiseResult(function query(): Promise<Row[]> { return db.query(sql) })
```

## Strict typing — the baseline

ShotScriptTyping (`shotscript/tsconfig/shotscript.json`) applies a strict `compilerOptions` baseline. Extend it in your project's `tsconfig.json`.

```json
"compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "noErrorTruncation": true,
    "noUncheckedSideEffectImports": true,
    "strictBuiltinIteratorReturn": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true
}
```

`strict: true` is the floor. Everything above goes beyond TS strict mode:

- `noUncheckedIndexedAccess` — `arr[i]` is `T | undefined`; you must check.
- `exactOptionalPropertyTypes` — distinguishes "missing" from "present-but-undefined" (mostly moot since ShotScript bans optionals, but enabled as belt-and-suspenders).
- `allowUnreachableCode: false` / `allowUnusedLabels: false` — promote dead-code warnings to errors.
- `noErrorTruncation` — full error messages, no `…`.
- `noUncheckedSideEffectImports` — `import "./side-effect.ts"` must be intentional (TS 5.6+).
- `strictBuiltinIteratorReturn` — tighter iterator return types (TS 5.6+).
- `moduleDetection: "force"` — every file is a module; no auto-detection ambiguity.
- `verbatimModuleSyntax` — type-only imports must say `import type`.

The ShotScript rules below extend this with additional bans the type checker can't express alone.

## Types — no escape hatches

```ts
// ❌
const x: any = foo()
const y = foo() as User
const z = bar()!
// @ts-ignore
const w = quux()

// ✅
const x: unknown = foo()
const [user, err] = parseUser(input)
```
Rules: `no-any`, `no-assertion` (allows `as const`), `no-non-null`, `no-ts-comment`

## `null`, not `undefined`

shot has one nullable value: `null`. The `undefined` type cannot appear in user-authored type annotations.

```ts
// ❌
type User = { name: string | undefined }
function f(x: string | undefined): void { /* ... */ }

// ✅
type User = { name: string | null }
function f(x: string | null): void { /* ... */ }
```

Runtime `undefined` still exists — `arr[i]` returns `T | undefined` under `noUncheckedIndexedAccess`. Convert it at the boundary: `arr[i] ?? null`. The language forbids you from writing `undefined` in types; it doesn't pretend it can't appear.

Rule: `no-undefined-type`

### No optional properties

```ts
// ❌
type Config = { host: string; port?: number }

// ✅
type Config = { host: string; port: number | null }
```

The `?:` syntax on object type members is banned. Use explicit `| null`. Forces callers to be deliberate about nullability and matches Go's zero-value philosophy: every field has a value; you choose the sentinel.

Rule: `no-optional-property`

### No optional parameters

```ts
// ❌
function greet(name: string, greeting?: string): string { /* ... */ }

// ✅
function greet(name: string, greeting: string | null): string { /* ... */ }
```

Same rationale. Every call passes every argument.

Rule: `no-optional-parameter`

### No default parameters

```ts
// ❌
function greet(name: string, greeting: string = "hello"): string { /* ... */ }

// ✅
function greet(name: string, greeting: string): string { /* ... */ }
function greetDefault(name: string): string { return greet(name, "hello") }
```

Default parameters use `undefined` as a sentinel — incompatible with the `undefined` ban. Wrap if you need a default.

Rule: `no-default-parameter`

### No `{}`, no `object`, no `Function`

```ts
// ❌
type Anything = {}
type AnyObj = object
type AnyFn = Function

// ✅
type Anything = unknown
type Specific = { kind: "..." }
type Callback = (x: number) => void
```

`{}` means "anything except null/undefined" — practically equivalent to `unknown` but with surprising behavior. `object` is rarely what you want over a specific type. `Function` accepts any callable with any signature. All three are common bug sources.

Rules: `no-empty-object-type`, `no-object-type`, `no-function-type`

## `void` is kept

`void` remains valid as a function return type, in its TS meaning: "this function returns nothing meaningful." It's about intent, not about a value. Same role Go's bare return statement plays.

## Immutable by default

### Object type properties must be `readonly`

```ts
// ❌
type User = { id: number; name: string }

// ✅
type User = { readonly id: number; readonly name: string }
```

Every property in a user-authored object type must carry the `readonly` modifier. Combined with `const`-everywhere, this makes mutation in shot code structurally impossible from the outside. To mutate, you create a new value.

Rule: `require-readonly-property`

### Array types must be `readonly`

```ts
// ❌
function f(): number[] { return [1, 2, 3] }
const xs: string[] = []

// ✅
function f(): readonly number[] { return [1, 2, 3] }
const xs: readonly string[] = []
```

`T[]` is banned in type annotations. Use `readonly T[]` (or `ReadonlyArray<T>`). Push toward functional updates.

Rule: `require-readonly-arrays`

## Explicit signatures

### Every function declaration needs an explicit return type

```ts
// ❌
function double(n: number) { return n * 2 }   // inferred
[1, 2].map(function (n: number) { return n * 2 })

// ✅
function double(n: number): number { return n * 2 }
[1, 2].map(function double(n: number): number { return n * 2 })
```

Inference is great for compiler ergonomics; explicit signatures are better for readers and for catching unintended return-type drift. Applies to all functions including callbacks.

Rule: `require-explicit-return-type`

## Lint

### One declaration per statement

```ts
// ❌
const a = 1, b = 2

// ✅
const a = 1
const b = 2
```

Rule: `no-multi-var-decl`

### No variable shadowing

```ts
// ❌
const x = 1
function f(): void {
    const x = 2   // shadows outer x
}

// ✅
const x = 1
function f(): void {
    const y = 2
}
```

Shadowing is the source of "wait, which `x`?" bugs. shot forbids it.

Rule: `no-shadow`

### No `symbol` types, no variadic tuples

```ts
// ❌
type S = symbol
type T = unique symbol
type Args = [string, ...number[]]

// ✅
type Args = { name: string; rest: readonly number[] }
```

`symbol` types encode identity rather than data; rarely needed in app code. Variadic tuples obscure intent — give the rest a name in a struct.

Rules: `no-symbol-type`, `no-variadic-tuple`

## Code hygiene

Rules that prevent classes of bug or remove dead syntax. Each is AST-detectable in v1.

### No reassignment of inputs

```ts
// ❌
function add(n: number): number { n = n + 1; return n }
const a = b = c = 5
return (x = 5)

// ✅
function add(n: number): number { const result = n + 1; return result }
const a = 5; const b = 5; const c = 5
x = 5
return x
```

Rules: `no-param-reassign`, `no-multi-assign`, `no-return-assign`, `no-self-assign` (`x = x`).

### No empty or useless constructs

```ts
// ❌
function f(): void {}                    // empty function body
{ doThing() }                            // lone block
const {} = obj                           // empty destructure
const [] = arr                           // empty array destructure
import { foo as foo } from "shotscript/std"    // useless rename
function f(): void { doThing(); return } // useless trailing return
const s = "hello" + " world"             // useless literal concat
const obj = { ["foo"]: 1 }               // useless computed key
export {}                                // useless empty export
```

Rules: `no-empty`, `no-lone-blocks`, `no-empty-pattern`, `no-useless-rename`, `no-useless-return`, `no-useless-concat`, `no-useless-computed-key`, `no-useless-empty-export`.

### No buggy patterns

```ts
// ❌
if (x === x) { /* ... */ }               // tautology (or NaN-check abuse)
for (const x of xs) {
    function makeHandler(): () => void { /* closes over loop var */ }
}
const s = new String("hi")               // primitive wrapper
const n = new Number(42)
const b = new Boolean(true)
foo                                       // bare expression statement (no side effect)
void someExpr                            // statement-level `void`
```

Rules: `no-self-compare`, `no-loop-func`, `no-new-wrappers`, `no-unused-expressions`, `no-void`.

### Prefer canonical forms

```ts
// ❌
const greeting = "hello " + name + "!"

// ✅
const greeting = `hello ${name}!`
```

Rule: `prefer-template`. String concatenation of variables → template literal.

### `new` is restricted to built-ins

```ts
// ✅ allowed
new Error("bad")
new Map<string, number>()
new Set<string>()
new Date()
new URL("https://example.com")
new RegExp("^x")
new Uint8Array(16)
new TextDecoder()
new TextEncoder()
new AbortController()

// ❌
new Foo()   // no user-defined classes exist; `new` is for runtime built-ins only
```

`class` is already banned, so `new` is structurally limited. The rule names an explicit allowlist of built-in constructors. If a built-in is missing, add it to the allowlist with a code review — small intentional list, not a default-open surface.

Rule: `no-new-user-types`

## One canonical form per type idea

### Arrays: only `readonly T[]`

```ts
// ❌
const xs: Array<number> = []
const ys: ReadonlyArray<number> = []
const zs: number[] = []        // already banned by require-readonly-arrays

// ✅
const xs: readonly number[] = []
```

`Array<T>` and `ReadonlyArray<T>` are banned as generic forms. The bracket suffix `readonly T[]` is the canonical (and only) way to type an array.

Rule: `no-array-generic`

### Objects: property-level `readonly` only, no `Readonly<T>` wrapper

```ts
// ❌
type Config = Readonly<{ host: string; port: number }>

// ✅
type Config = { readonly host: string; readonly port: number }
```

Every property is already required to carry `readonly` individually (`require-readonly-property`). The `Readonly<T>` wrapper is redundant — and worse, hides the per-property requirement at the declaration site.

Rule: `no-readonly-wrapper`

### Dictionaries: `Map<K, V>`, not index signatures or `Record`

```ts
// ❌
type Cache = { [key: string]: number }
type Cache = Record<string, number>

// ✅
const cache: Map<string, number> = new Map()
```

Index signatures and `Record<K, V>` both create open-ended object types where access returns `T | undefined`. Under `noUncheckedIndexedAccess`, every read needs a check anyway — at which point you're paying the runtime cost of `Map` semantics without the explicit API. Use `Map<K, V>` for runtime dictionaries.

Rules: `no-index-signature`, `no-banned-utility-types` (covers `Record`)

### Primitives: lowercase only

```ts
// ❌
const s: String = "hi"
const n: Number = 1
const b: Boolean = true
const sym: Symbol = Symbol()

// ✅
const s: string = "hi"
const n: number = 1
const b: boolean = true
```

The capitalized `String`/`Number`/`Boolean`/`Symbol` are wrapper-object types — almost always a mistake. Their constructors are banned (`no-new-wrappers`); the corresponding types should be too.

Rule: `no-primitive-wrapper-types`

### Banned utility types

These TS lib utility types are banned because they either produce shapes the language already forbids, or describe constructs the language doesn't have:

| Banned | Reason | Use instead |
|---|---|---|
| `Partial<T>` | Produces optional properties (banned) | Spell out the type with explicit `\| null` per field |
| `Required<T>` | Meaningless — shot has no optional properties to require | n/a |
| `Record<K, V>` | Produces an index signature (banned) | `Map<K, V>` |
| `InstanceType<T>` | shot has no classes | n/a |
| `ConstructorParameters<T>` | shot has no classes | n/a |
| `ThisType<T>` | shot has no `this` | n/a |
| `Generator`, `GeneratorFunction` | shot has no generators | `for...of` over iterables |
| `AsyncGenerator`, `AsyncGeneratorFunction` | shot has no generators | n/a |
| `ClassDecorator`, `MethodDecorator`, `PropertyDecorator`, `ParameterDecorator` | shot has no decorators | n/a |

Rule: `no-banned-utility-types`

### Kept utility types

These remain useful and are not banned:

`Pick<T, K>`, `Omit<T, K>`, `Exclude<T, U>`, `Extract<T, U>`, `NonNullable<T>`, `Parameters<T>`, `ReturnType<T>`, `Awaited<T>`.

### No constructor type signatures

```ts
// ❌
type Ctor = new () => Foo
type AbstractCtor = abstract new (n: number) => Bar

// ✅
type Factory = () => Foo
```

shot has no classes; constructor type signatures describe something that can't be authored.

Rule: `no-constructor-type`

### No metaprogramming globals

```ts
// ❌
const p = new Proxy(target, handler)
Reflect.get(obj, key)
const f = new Function("return 1")
const f = Function("return 1")
```

`Proxy`, `Reflect`, and the `Function` constructor are pure metaprogramming surfaces — incompatible with the language's "no decorators / no `this` / no classes / no `eval`" stance. Banned as identifiers in expression position.

Rule: `no-metaprogramming-globals`

## Throwing globals → ShotScriptStd wrappers

Functions that throw at the API boundary break the no-throw philosophy at every call site. Use the tuple-returning wrappers from ShotScriptStd (`shotscript/std`).

```ts
// ❌
const data = JSON.parse(text)
const json = JSON.stringify(value)
const res = await fetch(url)

// ✅
import { jsonParse, jsonStringify, safeFetch } from "shotscript/std"
const [data, parseErr] = jsonParse<T>(text)
const [res, fetchErr] = await safeFetch(url)
```

Banned identifiers: `JSON.parse`, `JSON.stringify`, bare `fetch` (and `globalThis.fetch`).

Rule: `no-throwing-globals`

## Function expressions must be named

```ts
// ❌
[1, 2].map(function (n: number): number { return n * 2 })

// ✅
[1, 2].map(function double(n: number): number { return n * 2 })

// also ✅ (named, extracted)
function double(n: number): number { return n * 2 }
[1, 2].map(double)
```

Anonymous function expressions produce useless `(anonymous)` stack frames and obscure intent. Naming is free.

Rule: `require-named-functions`

## Control flow — fewer ways to loop

### No `do...while`

```ts
// ❌
do { /* ... */ } while (condition)

// ✅
while (condition) { /* ... */ }
```

`do...while` is rare and runs the body before the test — surprising compared to every other loop in the language. Pick the regular `while`.

Rule: `no-do-while`

### No labels

```ts
// ❌
outer: for (const x of xs) {
    for (const y of ys) {
        if (done) { break outer }
    }
}

// ✅
function findPair(): null {
    for (const x of xs) {
        for (const y of ys) {
            if (done) { return null }
        }
    }
    return null
}
```

Labels enable goto-like control flow. Extract a function and `return` instead.

Rule: `no-labels`

## Forms with bad sentinels

### No default values in destructuring

```ts
// ❌
const { port = 8080 } = config
const [first = 0, second = 0] = nums

// ✅
const port = config.port === null ? 8080 : config.port
```

Destructuring defaults trigger on `undefined` — same sentinel banned in `no-default-parameter`. Be explicit.

Rule: `no-destructuring-default`

### No logical assignment

```ts
// ❌
a ||= b
a &&= b
a ??= b

// ✅
a = a === null ? b : a       // for ??=
if (a === false) { a = b }   // for ||= (but you'd rewrite with === anyway)
```

`||=` and `&&=` rely on truthiness (banned by spirit). `??=` is safer but still combines two operations into one symbol. Spell it out — consistent with the rest of the language.

Rule: `no-logical-assignment`

### No tagged templates

```ts
// ❌
const html = render`<div>${user}</div>`
const query = sql`SELECT * FROM users WHERE id = ${id}`

// ✅
const html = `<div>${user}</div>`
const query = `SELECT * FROM users WHERE id = ${id}`
```

Tagged templates are for embedded DSLs (HTML, SQL, GraphQL) — none of which are part of shot. Use plain template literals.

Rule: `no-tagged-templates`

## Type-shape minor cuts

### No literal-boolean union types

```ts
// ❌
type T = true | false

// ✅
type T = boolean
```

`true | false` is exactly `boolean`. Spell it `boolean`.

Rule: `no-literal-boolean-type`

### No intersection types

```ts
// ❌
type Base = { readonly id: string }
type Named = { readonly name: string }
type User = Base & Named

// ✅
type User = {
    readonly id: string
    readonly name: string
}
```

Intersection types compose at the type level — convenient, but they hide the actual shape, can silently produce `never` fields on conflict, and let inheritance back in through the type system. Spell out the fields. Go's philosophy: a little duplication is better than a wrong abstraction.

Rule: `no-intersection-types`

#### Composing types — the canonical pattern

When you need to share fields across types, use **named-field composition**: include the other type as a field. This is how Rust struct composition works and what Go's struct embedding desugars to.

```ts
// Shared fields belong together in the domain
type Audit = {
    readonly createdAt: number
    readonly createdBy: string
    readonly updatedAt: number
}

type User = {
    readonly id: string
    readonly name: string
    readonly audit: Audit       // composed by name, not by intersection
}

const u: User = {
    id: "u_1",
    name: "alice",
    audit: { createdAt: 0, createdBy: "system", updatedAt: 0 },
}

console.log(u.audit.createdAt)   // explicit; no field promotion
```

**Three reasons this is better than intersection:**

1. **The shape is visible.** Reading `User` tells you exactly what fields exist and where.
2. **No silent `never`.** If `User` and `Audit` both had an `id`, the intersection form would make `id: never`; the composition form just nests them.
3. **Refactor-safe.** Renaming `Audit.createdAt` only breaks code that goes through `.audit.createdAt`. The dependency edge is visible.

#### When you'd reach for intersection — the patterns that replace it

**Decorating an external type:**

```ts
// What you'd write with intersection (banned)
type APIResponse = Response & { readonly requestId: string }

// Canonical
type APIResponse = {
    readonly response: Response
    readonly requestId: string
}

// Access: apiResp.response.status, not apiResp.status
```

The cost is one indirection per read. The gain is honesty: an `APIResponse` is a wrapper around a `Response`, not a magical extension of it.

**Discriminated union with shared discriminator and per-variant payload:**

```ts
// What you'd write with intersection (banned)
type Event =
    | ({ readonly kind: "click" } & ClickPayload)
    | ({ readonly kind: "key" } & KeyPayload)

// Canonical — inline the payload
type Event =
    | { readonly kind: "click"; readonly clientX: number; readonly clientY: number }
    | { readonly kind: "key"; readonly key: string; readonly code: string }
```

Usually shorter, always clearer.

**"Mixin" sharing of common fields across many types:**

If you find yourself wanting to share 3 fields across 10 types via intersection — pause. Either the 10 types are really one type with a discriminator (use a union), or the shared fields are a sub-concept that deserves its own named composition (use the `audit: Audit` pattern above). Mixin-style intersection is usually premature abstraction in disguise.

#### When duplication wins

For small shared field sets (2–3 fields, 2–3 types), just duplicate. The cost of `readonly id: string; readonly createdAt: number` appearing twice in your codebase is essentially zero. The cost of a wrong abstraction is much higher. This is the Go answer: "a little copying is better than a little dependency."

## Expanded metaprogramming bans

The existing `no-metaprogramming-globals` rule grows to catch the wider object-reflection surface:

```ts
// ❌
Object.create(proto)
Object.defineProperty(obj, "x", {})
Object.defineProperties(obj, descriptors)
Object.getOwnPropertyDescriptor(obj, "x")
Object.getOwnPropertyDescriptors(obj)
Object.getOwnPropertyNames(obj)
Object.getOwnPropertySymbols(obj)
Object.getPrototypeOf(obj)
Object.setPrototypeOf(obj, proto)
Object.assign(target, source)   // also mutates target — banned for that reason too
Symbol("desc")
new Proxy(target, handler)
Reflect.get(obj, "x")
new Function("return 1")
```

Forces functional updates (`{ ...a, ...b }`), plain reads (`obj.x`), and the explicit `Map`/`Set` APIs for everything else.

Rule: `no-metaprogramming-globals` (expanded)

## `Number.parseInt` / `Number.parseFloat` also banned

The existing `no-parse-number-fns` rule extends to the `Number.*`-qualified forms — they're the same functions with the same semantics.

## Deferred to v2 (need type-aware checker)

These would require upgrading the checker from AST-only to using `ts.createProgram()` with a type checker. Important enough to call out so they don't get forgotten:

- **`no-implicit-truthy`** — only `boolean`-typed expressions allowed in conditionals.
- **`no-floating-promises`** — every Promise must be awaited or destructured into the tuple form.
- **`no-unnecessary-condition`** — `if (x === null)` when `x` is typed `string` (non-nullable) is dead code.
- **`prefer-readonly-locals`** — locals never reassigned should still be flagged as missing `readonly` semantics where applicable.

All four are common shot user-code bugs that v1's AST-only checker cannot see.

## Type declarations — one canonical form

### `type` only — no `interface`
```ts
// ❌
interface User { id: number }

// ✅
type User = { id: number }
```
Rule: `no-interface`

### No `enum` — use `as const` objects
```ts
// ❌
enum Direction { Up, Down }

// ✅
const Direction = { Up: "up", Down: "down" } as const
type Direction = typeof Direction[keyof typeof Direction]
```
Rule: `no-enum`

## Banned type complexity (authored only)

```ts
// ❌
type X<T> = T extends string ? "yes" : "no"           // conditional
type Y<T> = { [K in keyof T]: T[K] }                  // mapped
type Z = `prefix-${string}`                           // template literal type
type W<T> = T extends Array<infer U> ? U : never      // infer
```
Rules: `no-conditional-type`, `no-mapped-type`, `no-template-literal-type`, `no-infer`.

## Banned OOP / metaprogramming

```ts
// ❌
class Foo {}
abstract class Bar {}
@decorator class Baz {}
function f() { return this.x }
```
Rules: `no-class`, `no-abstract`, `no-decorators`, `no-this`

## Imports / exports

### ESM only, named exports only
```ts
// ❌
const x = require("foo")
export default thing

// ✅
import { helper } from "./helpers.js"
export { thing }
```

Rules: `no-require`, `no-default-export`, `no-index-import`

### No barrel files or index imports

Index files and barrel re-exports are not allowed. Every import must point to the specific file that contains the implementation.

```ts
// ❌
import { add } from "./math/index.js"   // index import
import { add } from "./math"            // extensionless index import

// ✅
import { add } from "./math/add.js"
```

### File naming convention

Name each file after the directory it lives in. This mirrors Go's package convention and makes imports self-describing.

```
calculator/
  calculator.ts   ✅  (matches directory name)
  index.ts        ❌  (do not use)

fetchUser/
  fetchUser.ts    ✅
```

For multi-file modules, name each file after what it exports — no generic names like `utils.ts` or `helpers.ts`.

```
math/
  add.ts
  divide.ts
```

## Equality

### `===` / `!==` only
```ts
// ❌
if (x == null) { /* ... */ }

// ✅
if (x === null) { /* ... */ }
```
Rule: `no-loose-equality`

### No `&&` shorthand, no `!!`
```ts
// ❌
condition && doThing()
const b = !!value

// ✅
if (condition === true) { doThing() }
const b = Boolean(value)
```
Rules: `no-and-shorthand`, `no-double-bang`

> **Truthiness:** v1 does **not** enforce a no-implicit-truthy rule. Without type information (v1 checker is AST-only), the rule would force `=== true` on already-boolean values and produce uglier code than it eliminates. When v2 upgrades the checker to be type-aware, this rule will land in its Go-equivalent form: only `boolean`-typed expressions allowed in conditionals.

## Operators

| Banned | Use instead |
|---|---|
| `& \| ^ ~ << >>` | Don't do bitwise |
| `delete obj.x` | Build new object without it |
| `"x" in obj` | `obj.x !== undefined` |
| `a, b` (comma) | Statements |
| `arguments` | rest params `...args` |
| `function*` / `yield` | Iteration via `for...of` |
| `eval` | n/a |

Rules: `no-bitwise`, `no-delete`, `no-in`, `no-comma-operator`, `no-arguments`, `no-generators`, `no-eval`

## Loops

### No `for...in`
```ts
// ❌
for (const k in obj) { /* ... */ }

// ✅
for (const k of Object.keys(obj)) { /* ... */ }
```
Rule: `no-for-in`

## Branching

### No ternary
```ts
// ❌
const label = isReady === true ? "go" : "wait"

// ✅
function labelFor(ready: boolean): string {
    if (ready === true) { return "go" }
    return "wait"
}
const label = labelFor(isReady)
```
Rule: `no-ternary`

### `switch` requires explicit terminator on every `case`
```ts
// ❌
switch (kind) {
    case "a":
        doA()           // implicit fallthrough
    case "b":
        doB()
        break
}

// ✅
switch (kind) {
    case "a":
        doA()
        break
    case "b":
        doB()
        break
}
```
Rule: `switch-no-fallthrough`

## Number conversion

```ts
// ❌
parseInt("42", 10)
parseFloat("3.14")

// ✅
Number("42")
Number("3.14")
```
Rule: `no-parse-number-fns`

## Kept

`?.` `??` `as const` generics union/intersection types destructuring spread template literal strings `for...of` indexed `for` `switch` `async`/`await` rest params method shorthand on object literals (harmless once `this` is banned)
