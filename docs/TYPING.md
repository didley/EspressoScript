# ShotScriptTyping

Full strict mode. A tsconfig preset that enables the complete set of TypeScript strictness flags. If the compiler can catch it, it will.

## Install

```json
// tsconfig.json
{
    "extends": "shotscript/tsconfig/shotscript.json"
}
```

## What it enables

| Option | Effect |
|---|---|
| `strict` | Enables the full strict family: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, and more. |
| `noUncheckedIndexedAccess` | Array and object index access returns `T \| undefined` instead of `T`. Every `array[i]` must be checked. |
| `exactOptionalPropertyTypes` | Optional properties cannot be assigned `undefined` explicitly — only omitted. Tightens the gap between `prop?: T` and `prop: T \| undefined`. |
| `noImplicitReturns` | Every code path in a non-void function must return a value. No silent `undefined` fallthrough. |
| `noFallthroughCasesInSwitch` | Switch cases must end with `break` or `return`. Implicit fallthrough is a compile error. |
| `noImplicitOverride` | Overriding a base class method requires the `override` keyword. Accidental shadowing is a compile error. |
| `forceConsistentCasingInFileNames` | Import paths must match the actual filename casing. Prevents case-insensitive filesystem bugs from reaching case-sensitive deployments. |
| `noUnusedLocals` | Unused local variables are a compile error. |
| `noUnusedParameters` | Unused function parameters are a compile error. |
| `noPropertyAccessFromIndexSignature` | Properties from index signatures must be accessed with bracket notation, not dot notation. |
| `verbatimModuleSyntax` | `import type` must be used for type-only imports. Prevents accidental value imports being kept in output. |
| `isolatedModules` | Each file must be independently transformable. Required for compatibility with esbuild, swc, and similar tools. |

## Before / after

### Array access — noUncheckedIndexedAccess

**Why it matters:** without this flag, `items[0]` has type `Item` even when the array might be empty. With it, you get `Item | undefined` and must handle the empty case explicitly.

```ts
// ❌ without strict — compiles, fails at runtime
const items: readonly string[] = getItems()
const first: string = items[0]
process(first.toUpperCase()) // 💥 runtime if empty
```

```ts
// ✅ ShotScriptTyping — first: string | undefined
const items: readonly string[] = getItems()
const first = items[0]
if (first === undefined) {
    return [null, new Error('empty list')]
}
process(first.toUpperCase()) // ✓ safe
```

### Missing returns — noImplicitReturns

**Why it matters:** a function that sometimes returns a value and sometimes falls off the end silently returns `undefined`. ShotScriptTyping makes this a compile error — every path must return.

```ts
// ❌ without strict — TypeScript accepts the missing return
function getLabel(status: string): string {
    if (status === 'active') {
        return 'Active'
    }
    if (status === 'inactive') {
        return 'Inactive'
    }
    // falls off here — returns undefined
}
```

```ts
// ✅ ShotScriptTyping — compile error forces the explicit return
function getLabel(status: string): string {
    if (status === 'active') {
        return 'Active'
    }
    if (status === 'inactive') {
        return 'Inactive'
    }
    return `Unknown: ${status}`
}
```

### Null propagation — strictNullChecks

**Why it matters:** without `strictNullChecks`, every type implicitly includes `null` and `undefined`. With it, nullable values must be explicitly typed and checked before use.

```ts
// ❌ without strict — compiles, fails at runtime
function getUser(id: number): User | null {
    return db.find(id)
}

const user = getUser(1)
console.log(user.name) // 💥 runtime if null
```

```ts
// ✅ ShotScriptTyping — null check required
function getUser(id: number): User | null {
    return db.find(id)
}

const user = getUser(1)
if (user === null) {
    return [null, new Error('not found')]
}
console.log(user.name) // ✓ user: User
```
