---
page: typing
badge: ShotScriptTyping
title: "Full strict mode. Every invalid state, prevented."
title_em: "Every invalid state, prevented."
sub: "The strict settings TypeScript recommends but can't enable by default."
---

{label} Install

:::install-step[tsconfig.json]
```json
// tsconfig.json
{
  "extends": "shotscript/tsconfig/shotscript.json"
}
```
:::

---

{label} What it enables

:::options
- **strict** — Enables the full strict family: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, and more.
- **noUncheckedIndexedAccess** — Array and object index access returns `T | undefined` instead of `T`. Every array[i] must be checked.
- **exactOptionalPropertyTypes** — Optional properties cannot be assigned `undefined` explicitly — only omitted. Tightens the gap between `prop?: T` and `prop: T | undefined`.
- **noImplicitReturns** — Every code path in a non-void function must return a value. No silent `undefined` fallthrough.
- **noFallthroughCasesInSwitch** — Switch cases must end with `break` or `return`. Implicit fallthrough is a compile error.
- **noImplicitOverride** — Overriding a base class method requires the `override` keyword. Accidental shadowing is a compile error.
- **forceConsistentCasingInFileNames** — Import paths must match the actual filename casing. Prevents case-insensitive filesystem bugs from reaching case-sensitive deployments.
:::

---

{label} Before / after

## What strict mode catches.

{label} Array access — noUncheckedIndexedAccess

> **Why it matters:** without this flag, `items[0]` has type `Item` even when the array might be empty. With it, you get `Item | undefined` and must handle the empty case explicitly.

```ts ❌
const items: readonly string[] = getItems()

// TypeScript accepts this — but items
// might be empty at runtime
const first: string = items[0]
process(first.toUpperCase()) // 💥 runtime
```

```ts ✅
const items: readonly string[] = getItems()

// first: string | undefined
const first = items[0]
if (first === undefined) {
    return [null, new Error('empty list')]
}
process(first.toUpperCase()) // ✓ safe
```

{label} Missing returns — noImplicitReturns

> **Why it matters:** a function that sometimes returns a value and sometimes falls off the end silently returns `undefined`. ShotScriptTyping makes this a compile error — every path must return.

```ts ❌
function getLabel(status: string): string {
    if (status === 'active') {
        return 'Active'
    }
    if (status === 'inactive') {
        return 'Inactive'
    }
    // falls off here — returns undefined
    // TypeScript accepts it anyway
}
```

```ts ✅
function getLabel(status: string): string {
    if (status === 'active') {
        return 'Active'
    }
    if (status === 'inactive') {
        return 'Inactive'
    }
    // ✗ compile error: not all code paths
    //   return a value
    return `Unknown: ${status}`
}
```

{label} Null propagation — strictNullChecks

> **Why it matters:** without `strictNullChecks`, every type implicitly includes `null` and `undefined`. With it, nullable values must be explicitly typed and checked before use.

```ts ❌
function getUser(id: number): User | null {
    return db.find(id)
}

// TypeScript does not require you
// to check — this compiles fine
const user = getUser(1)
console.log(user.name) // 💥 runtime
```

```ts ✅
function getUser(id: number): User | null {
    return db.find(id)
}

const user = getUser(1)
if (user === null) {
    return [null, new Error('not found')]
}
// user: User — now safe
console.log(user.name) // ✓
```
