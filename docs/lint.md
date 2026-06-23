---
page: lint
badge: ShotScriptLint
title: "110+ rules enforcing one way of doing things."
title_em: "one way of doing things."
sub: "A TypeScript language service plugin. Drop it into any project — no special runtime or file extension required. Violations surface as compiler errors in your editor and CI."
---

{label} Install

:::install-step[tsconfig.json]
```json
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [{ "name": "shotscript/plugin" }]
  }
}
```
:::

:::install-cmd
npx shotscript 'src/**/*.ts'
:::

Exits `0` when clean, `1` on violations. Add `--json` for machine-readable output.

---

{label} Example

## What linting looks like.

Eight violations, one file. Intersection types, three different function styles, optional params, ternaries, try/catch — common patterns that ShotScript rejects.

```ts ❌
// ❌ interface
interface BaseUser {
    id: number
    createdAt: Date
}

// ❌ intersection — what fields does Admin have?
type Admin = BaseUser & {
    role?: 'admin' | 'superadmin'  // ❌ optional
    permissions?: string[]           // ❌ optional
}

// ❌ arrow fn · optional param · ternary
const getLabel = (a?: Admin): string =>
    a?.role === 'superadmin' ? 'Super' : 'Admin'

// ❌ arrow fn · try/catch · as assertion
const findAdmin = async (
    id: number
): Promise<Admin> => {
    try {
        const res = await fetch(`/admins/${id}`)
        return res.json() as Admin
    } catch (e) {
        throw new Error(`failed: ${e}`)
    }
}

// ❌ anonymous callback
const ids = admins.map(a => a.id)
```

```ts ✅
import type { PromiseResult } from 'shotscript/std'
import { safeFetch, jsonParse } from 'shotscript/std'

type BaseUser = {
    readonly id: number
    readonly createdAt: Date
}

// embed — no & — every field is visible here
type Admin = {
    readonly user: BaseUser
    readonly role: 'admin' | 'superadmin'
    readonly permissions: readonly string[] | null
}

function getLabel(admin: Admin): string {
    if (admin.role === 'superadmin') {
        return 'Super Admin'
    }
    return 'Admin'
}

async function findAdmin(
    id: number,
): PromiseResult<Admin> {
    const [res, err] = await safeFetch(`/admins/${id}`)
    if (err !== null) {
        return [null, err]
    }
    return jsonParse<Admin>(await res.text())
}

function toId(admin: Admin): number {
    return admin.user.id
}
const ids = admins.map(toId)
```

---

{label} What gets removed

## Roughly half of TypeScript.

By syntax construct count, ShotScript removes approximately half of what TypeScript allows. Some categories disappear entirely — not because the features are bad, but because having fewer ways to do the same thing is the goal.

:::pct-grid
- **OOP** | class · this · extends · decorators · abstract | all of it
- **Error handling** | try · catch · finally · throw | all of it
- **Type constructs** | interface · enum · & · conditional · mapped · infer · any · void · undefined | ~65%
- **Function syntax** | arrow functions · generators · overloads · default params · optional params | ~50%
- **Control flow** | ternary · do-while · for-in · labels | ~40%
:::

---

{label} All rules

### Functions — 5 rules

:::rule
`no-arrow-functions` — Arrow functions are banned. Use named `function` declarations or expressions — they show up in stack traces, are grep-able, and are testable in isolation.
:::

:::rule
`require-named-functions` — Function expressions passed as arguments must be named. Anonymous callbacks disappear in stack traces.
:::

:::rule
`require-explicit-return-type` — Every function declaration must have an explicit return type annotation. Inference hides contracts from callers.
:::

:::rule
`no-default-parameter` — Default parameters are banned. Accept `T | null` and handle the null branch explicitly inside the body.
:::

:::rule
`no-async-without-await` — An `async` function with no `await` is banned. Remove `async` and return `Result<T>` instead of `PromiseResult<T>`.
:::

### Error handling — 7 rules

:::rule
`no-throw` — Throwing is banned. Return `[null, new Error(...)]` — errors belong in the type signature, not in hidden control flow.
:::

:::rule
`no-try` — `try`/`catch` is banned. Wrap third-party throwing code with `toResult` or `toPromiseResult` from `shotscript/std`.
:::

:::rule
`no-promise` — `new Promise()` and `Promise.resolve/reject/all/race/any/allSettled()` are banned. Use `toPromiseResult()` to wrap external Promise-returning functions.
:::

:::rule
`no-promise-chain` — `.then()` and `.catch()` chains are banned. Use `await` with tuple destructuring.
:::

:::rule
`no-floating-promises` — Every Promise-returning call must be `await`ed or explicitly discarded with `void fn()`. Unhandled promises silently swallow errors.
:::

:::rule
`require-tuple-destructure` — Calls to functions that return a `[T | null, E | null]` tuple must be destructured immediately — `const [val, err] = fn()`.
:::

:::rule
`require-async-tuple-return` — Async functions must return `Promise<void>`, `PromiseResult<T, E>`, or an explicit tuple form. A bare `Promise<User>` hides the failure path.
:::

### Variables — 7 rules

:::rule
`no-var` — `var` is banned. Use `const`.
:::

:::rule
`no-multi-var-decl` — Multiple declarators in one statement (`const a = 1, b = 2`) are banned. One declaration per statement.
:::

:::rule
`no-increment-decrement` — `++` and `--` are banned. Use `+= 1` and `-= 1`.
:::

:::rule
`no-shadow` — Variable shadowing is banned. Inner scopes cannot declare names that already exist in outer scopes.
:::

:::rule
`no-param-reassign` — Reassigning function parameters is banned. Use a new `const` with a distinct name.
:::

:::rule
`no-multi-assign` — Chained assignment (`a = b = 1`) is banned.
:::

:::rule
`no-return-assign` — Assignment inside a `return` statement is banned.
:::

### Control flow — 18 rules

:::rule
`no-ternary` — Ternary expressions are banned. Use `if`/`else` or extract a named function.
:::

:::rule
`no-and-shorthand` — `condition && doThing()` for side effects is banned. Use `if (condition === true) { doThing() }`.
:::

:::rule
`no-or-shorthand` — `condition || doThing()` for side effects is banned. Use an `if` block.
:::

:::rule
`no-implicit-truthy` — Conditions must be boolean-typed. Write `if (x !== null)`, not `if (x)` — implicit truthy is banned.
:::

:::rule
`no-unnecessary-condition` — A `=== null` check on a value whose type can never be null is banned — dead code the type system can prove unreachable.
:::

:::rule
`no-loose-equality` — `==` and `!=` are banned. Use `===` and `!==` only.
:::

:::rule
`no-for-in` — `for...in` is banned. Use `for...of Object.keys()` or `for...of Object.entries()`.
:::

:::rule
`no-do-while` — `do...while` is banned. Use a `while` loop.
:::

:::rule
`no-labels` — Labelled statements and `break`/`continue` with labels are banned. Extract a function and `return` instead.
:::

:::rule
`switch-no-fallthrough` — Every `switch` case must end with `break`, `return`, or `throw`. Implicit fallthrough is banned.
:::

:::rule
`no-logical-assignment` — Logical assignment operators (`??=`, `||=`, `&&=`) are banned.
:::

:::rule
`no-destructuring-default` — Defaults inside destructuring patterns (`const { x = 5 } = obj`) are banned. Use explicit null checks.
:::

:::rule
`no-generators` — Generator functions (`function*`) and `yield` are banned.
:::

:::rule
`no-loop-func` — Function declarations or expressions inside loops are banned — they close over a mutable loop variable.
:::

:::rule
`no-eval` — `eval()` is banned.
:::

:::rule
`no-self-compare` — Comparing a value to itself (`x === x`) is always a bug.
:::

:::rule
`no-self-assign` — Assigning a variable to itself (`x = x`) is always a bug.
:::

:::rule
`no-return-await` — `return await x` is redundant; use `return x`. Since `no-try` bans try blocks, there is no case where `return await` changes behavior.
:::

### Types — 37 rules

:::rule
`no-interface` — Interfaces are banned. Use `type` exclusively — one way to define a shape.
:::

:::rule
`no-class` — Classes are banned. Use a plain `type` for data and plain functions for behaviour.
:::

:::rule
`no-abstract` — `abstract` classes and members are banned.
:::

:::rule
`no-enum` — `enum` is banned. Use an `as const` object and a `typeof` type alias instead.
:::

:::rule
`no-any` — `any` is banned. Use `unknown` and narrow explicitly.
:::

:::rule
`no-assertion` — Type assertions (`value as T`) are banned. Parse and validate at boundaries; return a result tuple.
:::

:::rule
`no-non-null` — Non-null assertions (`value!`) are banned. Check for null explicitly.
:::

:::rule
`no-ts-comment` — `@ts-ignore`, `@ts-expect-error`, and `@ts-nocheck` are banned. Fix the type error.
:::

:::rule
`no-undefined-type` — `undefined` in type annotations is banned. The only nullable value is `null`.
:::

:::rule
`no-optional-property` — Optional properties (`prop?: T`) are banned. Use `prop: T | null`.
:::

:::rule
`no-optional-parameter` — Optional parameters (`x?: T`) are banned. Use `x: T | null`.
:::

:::rule
`require-readonly-property` — Every object type property must be `readonly`. Mutation is explicit, not the default.
:::

:::rule
`require-readonly-arrays` — Array type annotations must use `readonly T[]`. Not `T[]`, not `Array<T>`.
:::

:::rule
`require-readonly-collections` — `Map<K, V>` and `Set<T>` in type positions are banned. Use `ReadonlyMap<K, V>` and `ReadonlySet<T>`.
:::

:::rule
`no-array-generic` — `Array<T>` and `ReadonlyArray<T>` in annotations are banned. Use `readonly T[]`.
:::

:::rule
`no-intersection-types` — Intersection types (`A & B`) are banned. Spell out the combined fields, or compose by value.
:::

:::rule
`no-conditional-type` — Conditional types (`T extends U ? X : Y`) are banned.
:::

:::rule
`no-mapped-type` — Mapped types (`{ [K in keyof T]: ... }`) are banned.
:::

:::rule
`no-template-literal-type` — Template literal types (`` `prefix-${T}` ``) are banned.
:::

:::rule
`no-infer` — `infer` inside conditional types is banned.
:::

:::rule
`no-variadic-tuple` — Variadic tuple types (`[...T]`) are banned.
:::

:::rule
`no-anonymous-tuple` — Tuple elements must be named: `[value: T, err: E]` not `[T, E]`.
:::

:::rule
`no-index-signature` — Index signatures (`[k: string]: T`) are banned. Use `Map<K, V>`.
:::

:::rule
`no-banned-utility-types` — `Partial`, `Required`, `Record`, `InstanceType`, `ConstructorParameters`, and `ThisType` are banned. Spell out the shape.
:::

:::rule
`no-readonly-wrapper` — `Readonly<T>` wrapper is banned. Mark each property `readonly` directly.
:::

:::rule
`no-primitive-wrapper-types` — Boxed primitive types (`String`, `Number`, `Boolean`, `Symbol`, `BigInt`) are banned. Use the lowercase primitives.
:::

:::rule
`no-constructor-type` — Constructor type signatures (`new (...args): T`) are banned.
:::

:::rule
`no-function-type` — The `Function` type is banned. Use an explicit call signature type.
:::

:::rule
`no-object-type` — The `object` type is banned. Use an explicit type shape.
:::

:::rule
`no-empty-object-type` — The empty object type `{}` in annotations is banned.
:::

:::rule
`no-symbol-type` — `symbol` and `unique symbol` are banned. Their two practical uses — branded types and well-known symbols (`Symbol.iterator` etc.) — are both unavailable in ShotScript: branding uses a string phantom field (`{ readonly __brand: B }`), and generators/iterables are banned.
:::

:::rule
`no-literal-boolean-type` — `true | false` is banned — it is just `boolean`.
:::

:::rule
`no-overloads` — Function overload signatures are banned. Use a union parameter type and handle variants inside the body.
:::

:::rule
`no-namespace` — TypeScript namespaces and modules (`namespace` / `module` declarations) are banned.
:::

:::rule
`no-decorators` — Decorators are banned.
:::

:::rule
`no-this` — `this` is banned in all forms — no method context, no `this` parameters.
:::

:::rule
`require-readonly-parameters` — Inline array and object-literal parameter types must be readonly — `xs: readonly number[]` and `{ readonly x: number }`.
:::

### Imports & exports — 7 rules

:::rule
`no-default-export` — Default exports are banned. Named exports only — every export is addressable and tree-shakeable.
:::

:::rule
`no-require` — `require()` is banned. ESM `import` only.
:::

:::rule
`no-index-import` — Importing from an `index` file or a bare directory is banned. Import the specific file.
:::

:::rule
`no-useless-empty-export` — Empty `export {}` statements that serve no purpose are banned.
:::

:::rule
`no-export-star` — `export * from './x'` and `export * as ns from './x'` are banned; use named re-exports.
:::

:::rule
`no-side-effect-import` — Bare side-effect imports (`import './setup'` with no bindings) are banned; name what you import.
:::

:::rule
`no-dynamic-import` — Dynamic `import(...)` expressions are banned; use a static import.
:::

### Style & clarity — 29 rules

:::rule
`prefer-template` — String concatenation with `+` is banned when a template literal would work. Use `` `hello ${name}` ``.
:::

:::rule
`no-sparse-arrays` — Sparse array literals (`[1,,3]`) are banned. Use `null` for an explicit empty slot: `[1, null, 3]`.
:::

:::rule
`no-double-bang` — `!!value` is banned. Use `Boolean(value)`.
:::

:::rule
`no-unary-plus` — Unary `+` for coercion is banned. Use `Number(value)`.
:::

:::rule
`no-parse-number-fns` — `parseInt` and `parseFloat` are banned. Use `Number(str)`.
:::

:::rule
`no-throwing-globals` — `JSON.parse`, `JSON.stringify`, and bare `fetch` are banned. Use the safe wrappers from `shotscript/std`.
:::

:::rule
`no-metaprogramming-globals` — `Proxy`, `Reflect`, `Object.assign`, `Object.create`, `Object.defineProperty`, and similar metaprogramming APIs are banned.
:::

:::rule
`no-new-wrappers` — `new String()`, `new Number()`, `new Boolean()` are banned.
:::

:::rule
`no-new-user-types` — `new` on user-defined constructors is banned. No classes means no `new`.
:::

:::rule
`no-delete` — The `delete` operator is banned. Build a new object without the key.
:::

:::rule
`no-in` — The `in` operator is banned. Use explicit property checks or discriminated unions.
:::

:::rule
`no-bitwise` — Bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`) are banned.
:::

:::rule
`no-comma-operator` — The comma operator is banned.
:::

:::rule
`no-arguments` — The `arguments` object is banned. Use explicit rest parameters.
:::

:::rule
`no-void` — `void expr` is banned except as an explicit promise discard: `void someCall()` is the only permitted form.
:::

:::rule
`no-tagged-templates` — Tagged template literals are banned.
:::

:::rule
`no-empty` — Empty block bodies (`{}`) on functions, `if`, `while`, etc. are banned.
:::

:::rule
`no-empty-pattern` — Empty destructuring patterns (`const {} = x`, `const [] = x`) are banned.
:::

:::rule
`no-lone-blocks` — Standalone block statements (`{ ... }` not attached to control flow) are banned.
:::

:::rule
`no-unused-expressions` — Expressions whose result is not used are banned. Every expression must be assigned, returned, or have a deliberate side effect.
:::

:::rule
`no-useless-rename` — Renaming an import or export to the same name (`import { x as x }`) is banned.
:::

:::rule
`no-useless-return` — A bare `return` at the end of a `void` function is banned.
:::

:::rule
`no-useless-concat` — Concatenation of two string literals (`"a" + "b"`) is banned — just write `"ab"`.
:::

:::rule
`no-useless-computed-key` — Computed property keys that are string literals (`{ ["x"]: 1 }`) are banned.
:::

:::rule
`no-mutating-array-methods` — `.sort()`, `.reverse()`, `.splice()`, `.push()`, `.pop()`, `.shift()`, `.unshift()`, `.fill()`, `.copyWithin()` are banned; use ES2023 immutable alternatives (`toSorted`, `toReversed`, `toSpliced`, `with`, spread).
:::

:::rule
`no-object-assign` — `Object.assign(...)` is banned; use object spread `{ ...a, ...b }` instead.
:::

:::rule
`no-object-literal-accessors` — `get`/`set` accessors in object literals are banned; use plain properties or functions.
:::

:::rule
`no-restricted-globals` — Legacy global functions `isNaN`, `isFinite`, and `hasOwnProperty` are banned; use `Number.isNaN`, `Number.isFinite`, and `Object.hasOwn`.
:::

:::rule
`no-prototype-method-call` — `.hasOwnProperty()`, `.isPrototypeOf()`, `.propertyIsEnumerable()` as method calls are banned; use `Object.hasOwn` etc.
:::
