# ShotScript expansion plan

Goal: close the gaps that let "more than one way" sneak back into the dialect.
Group into 4 phases. Each phase is independently shippable.

For every new lint rule:
1. Create `src/lint/rules/<rule-name>.ts` matching the shape of
   `src/lint/rules/no-array-generic.ts` (named export, `Rule` type, `posOf`).
2. Add the import and the array entry in `src/lint/rules/all.ts`.
3. Add a one-line entry in `docs/lint.md` under the right section.
4. If the README's "95+ rules" count meaningfully shifts, bump it.

Run `npx tsc --noEmit` after each phase. Do not change rule message style —
match the existing terse "Use X instead of Y." or "X is banned; use Y." voice.

---

## Phase 1 — Mutation containment (highest impact)

The readonly-everywhere story is incomplete: typed arrays are readonly, but
mutating methods and mutable parameter types still slip through.

### 1.1 `no-mutating-array-methods`
Ban `.sort`, `.reverse`, `.splice`, `.push`, `.pop`, `.shift`, `.unshift`,
`.fill`, `.copyWithin` as method-call expressions. Suggest the ES2023
replacements in the message: `toSorted`, `toReversed`, `toSpliced`, `with`,
or spread (`[...xs, x]`) for `push`.

Detection: `ts.isCallExpression` → callee `ts.isPropertyAccessExpression` →
`name.text` in the banned set. Do NOT try to type-check the receiver — the
syntactic rule is the point. Accept the rare false positive on a Map's
`.delete` etc. by only matching the array-mutator names listed above.

### 1.2 `require-readonly-parameters`
Function/method parameters with array or object types must be readonly.
- `xs: number[]`            → `xs: readonly number[]`
- `xs: Array<number>`       → covered separately by `no-array-generic`
- `o: { x: number }`        → `o: { readonly x: number }` (object-literal
  param types must mark every property readonly; if any property is missing
  `readonly`, flag the param).

Detection: walk `ts.isParameter`; inspect `parameter.type`. For
`ts.isArrayTypeNode` flag if not wrapped in a `readonly` modifier
(`ts.isTypeOperatorNode` with `operator === ReadonlyKeyword`). For
`ts.isTypeLiteralNode` flag if any `PropertySignature` lacks `readonly`.

Scope: only flag inline parameter types. Named type aliases are already
covered by `require-readonly-property` / `require-readonly-arrays`.

### 1.3 `no-object-assign`
Ban `Object.assign(...)` calls. Message: "Object.assign mutates its target;
use object spread `{ ...a, ...b }` instead."

Detection: `ts.isCallExpression` whose `expression` is a
`PropertyAccessExpression` of `Object.assign`.

### 1.4 `no-object-literal-accessors`
Ban `get`/`set` accessors in object literals (classes are already banned,
but `{ get x() {…} }` smuggles hidden behavior back in).

Detection: `ts.isObjectLiteralExpression` → check `properties` for
`ts.isGetAccessorDeclaration` / `ts.isSetAccessorDeclaration`.

---

## Phase 2 — Import & module hygiene

### 2.1 `no-export-star`
Ban `export * from './x'` and `export * as ns from './x'`. Force named
re-exports for grep-ability — same spirit as `require-named-functions`.

Detection: `ts.isExportDeclaration` where `exportClause` is `undefined`
(bare `export *`) or `ts.isNamespaceExport`.

### 2.2 `no-side-effect-import`
Ban `import './setup'` with no bindings. Either name what you import or
don't import it.

Detection: `ts.isImportDeclaration` with `importClause === undefined`.

### 2.3 `no-dynamic-import`
Ban `import(...)` expressions. Defeats the static module graph that the
rest of the rules assume.

Detection: `ts.isCallExpression` with `expression.kind ===
SyntaxKind.ImportKeyword`.

### 2.4 `no-return-await` (outside try)
`return await x` is redundant unless inside a `try` block (where it
changes catch behavior). Since `no-try` already bans try, this rule
becomes "no `return await`, ever."

Detection: `ts.isReturnStatement` whose `expression` is
`ts.isAwaitExpression`. Flag unconditionally — there is no try in valid
ShotScript.

---

## Phase 3 — Global hygiene

### 3.1 Extend `no-throwing-globals` (or add `no-restricted-globals`)
Add to the banned global identifiers:
- `isNaN`           → use `Number.isNaN`
- `isFinite`        → use `Number.isFinite`
- `hasOwnProperty`  → use `Object.hasOwn`

If `no-throwing-globals` is strictly "globals that throw," put these in a
new `no-restricted-globals` rule instead. Check the existing rule's intent
first — the file is `src/lint/rules/no-throwing-globals.ts`.

### 3.2 `no-prototype-method-call`
Ban `.hasOwnProperty(…)`, `.isPrototypeOf(…)`,
`.propertyIsEnumerable(…)` as property-access calls. Force
`Object.hasOwn` etc.

Detection: `ts.isCallExpression` → `PropertyAccessExpression` with
`name.text` in the banned set.

---

## Phase 4 — tsconfig pinning

Edit `src/tsconfig/shotscript.json`. Without these, the "one way" promise
is undefined per-consumer.

Add:
```json
"target": "ES2023",
"lib": ["ES2023"],
"module": "NodeNext",
"moduleResolution": "NodeNext",
"skipLibCheck": true,
"useUnknownInCatchVariables": true
```

`useUnknownInCatchVariables` is part of `strict` since 4.4 — pin it
explicitly because `no-try`/`no-throw` lean on it.

If pinning `module: NodeNext` is too opinionated for library consumers,
fall back to `"module": "Preserve"` (TS 5.4+, bundler-neutral). Pick one
and document the choice in a one-line comment above the field.

ES2023 lib is non-negotiable — Phase 1 rule 1.1 tells users to call
`toSorted`/`toReversed`, which don't exist below ES2023.

---

## Phase 5 — std additions

Edit `src/std/index.ts`. Match the existing wrapper shape (Result tuple,
`if (e instanceof Error)` branch, fallback `new Error(...)`). Match the
existing JSDoc voice — one-line summary, usage block.

Add:
- `assertNever(x: never): never` — exhaustive-switch helper. Body:
  `throw new Error('unreachable: ' + JSON.stringify(x))`. Yes, it throws
  — that's the point; the `never` type means it's only reachable if the
  exhaustiveness check fails at runtime due to bad casts.
- `safeRegex(pattern: string, flags: string | null = null): Result<RegExp>`
- `safeDate(input: string | number): Result<Date>` — wraps `new Date()`,
  fails if `Number.isNaN(d.getTime())`.
- `safeNumber(str: string): Result<number>` — fails on NaN result.
- `safeStructuredClone<T>(value: T): Result<T>`
- `safeBigInt(str: string): Result<bigint>`

Also update `src/lint/rules/no-throwing-globals.ts` to flag the bare
globals these replace (`new RegExp`, `new Date`, `structuredClone`,
`BigInt`) and route users to the new std wrappers in the message — check
the existing rule first to see which globals it already covers.

---

## Phase 6 — fmt: import organization

Edit `src/fmt/shotscript.json`. Enable Biome's assist actions so import
order is enforced, not author-chosen:

```json
"assist": {
    "enabled": true,
    "actions": {
        "source": {
            "organizeImports": "on"
        }
    }
}
```

Verify the key shape against the Biome version pinned in the `$schema`
URL (2.4.16) — the assist config moved between Biome 1.x and 2.x.

---

## Out of scope (decided against)

- `Result.map`/`mapErr` composability helpers — cuts against the explicit
  Go-style `if err !== null` checks the rest of the design assumes.
- `no-await-in-loop` — flags legitimate sequential work too often.
- `no-globalThis` — too portability-hostile.
- `no-conditional-spread` — clever but rare; not worth a rule.

---

## Ship order

Phases are independent. Recommended order: 4 → 1 → 2 → 3 → 5 → 6.

Phase 4 first because Phase 1.1 depends on `lib: ES2023` being pinned
before we tell users to call `toSorted`.

Each phase: one commit per rule (or one commit for the phase if rules
are tightly related). Run `npx tsc --noEmit` and any existing test
script before committing each phase.
