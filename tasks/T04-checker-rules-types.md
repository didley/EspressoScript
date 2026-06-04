# T04 — Checker type rules

## Goal
Implement type-syntax and OOP rules. Uses the same `Rule` shape as T03.

## Dependencies
T02, T03.

## Files to create
- `cli/checker/rules/<rule-name>.ts` — one file per rule
- `tests/fixtures/types/<rule-name>-valid.shot` / `-invalid.shot`

## Rules

| Rule name | Trigger | Message |
|---|---|---|
| `no-any` | `ts.SyntaxKind.AnyKeyword` (any node of that kind) | `any` is not allowed. Use `unknown` or a concrete type. |
| `no-assertion` | `ts.isAsExpression(node)` AND the `type` is not a `TypeReferenceNode` with `typeName.escapedText === "const"`; also `ts.isTypeAssertionExpression(node)` (`<X>value`) | Type assertions are not allowed. `as const` is the only exception. |
| `no-non-null` | `ts.isNonNullExpression(node)` | Non-null assertions (`!`) are not allowed. |
| `no-ts-comment` | Walk leading & trailing comments on each node via `ts.getLeadingCommentRanges` / `ts.getTrailingCommentRanges`; flag if the comment body matches `/^\s*@ts-(ignore\|expect-error\|nocheck)\b/` | TS escape-hatch comments are not allowed. |
| `no-interface` | `ts.isInterfaceDeclaration(node)` | `interface` is not allowed. Use `type`. |
| `no-enum` | `ts.isEnumDeclaration(node)` | `enum` is not allowed. Use an `as const` object. |
| `no-conditional-type` | `ts.isConditionalTypeNode(node)` | Conditional types are not allowed. |
| `no-mapped-type` | `ts.isMappedTypeNode(node)` | Mapped types are not allowed. |
| `no-template-literal-type` | `ts.isTemplateLiteralTypeNode(node)` | Template literal types are not allowed. |
| `no-infer` | `ts.isInferTypeNode(node)` | `infer` is not allowed. |
| `no-class` | `ts.isClassDeclaration(node)` or `ts.isClassExpression(node)` | `class` is not allowed. Use plain objects + functions. |
| `no-abstract` | A class declaration whose modifiers contain `AbstractKeyword`; also any `AbstractKeyword` modifier on a member | `abstract` is not allowed. |
| `no-decorators` | `node.modifiers` contains a `ts.Decorator` (TS 5+ stores decorators in modifiers); also `ts.canHaveDecorators(node) && ts.getDecorators(node)?.length` | Decorators are not allowed. |
| `no-this` | `node.kind === ts.SyntaxKind.ThisKeyword` (as an expression, not as a parameter type — `this`-parameters are a type annotation and may be left untouched; if you want to also ban those, add a check on `ts.ThisTypeNode`) | `this` is not allowed. |
| `no-undefined-type` | `ts.SyntaxKind.UndefinedKeyword` appearing in a type position (parent is a type node or `ts.isTypeNode(node.parent)`) | `undefined` is not allowed in types. Use `null`. |
| `no-optional-property` | `ts.isPropertySignature(node) && node.questionToken !== undefined` (on an object type member) | Optional properties (`?:`) are not allowed. Use `\| null` explicitly. |
| `no-optional-parameter` | `ts.isParameter(node) && node.questionToken !== undefined` | Optional parameters are not allowed. Use `\| null` and require explicit values. |
| `no-default-parameter` | `ts.isParameter(node) && node.initializer !== undefined` | Default parameters are not allowed (uses `undefined` as sentinel). Wrap with a thin function instead. |
| `no-empty-object-type` | `ts.isTypeLiteralNode(node) && node.members.length === 0` | `{}` is not allowed as a type. Use `unknown` or a specific shape. |
| `no-object-type` | `ts.SyntaxKind.ObjectKeyword` in a type position; also a `TypeReferenceNode` with `typeName.escapedText === "Object"` | `object` / `Object` is not allowed. Use a specific type. |
| `no-function-type` | `TypeReferenceNode` with `typeName.escapedText === "Function"` | `Function` is not allowed. Declare the specific function signature. |
| `require-readonly-property` | `ts.isPropertySignature(node)` AND `node.modifiers` does not contain `ReadonlyKeyword` | Object type properties must be declared `readonly`. |
| `require-readonly-arrays` | `ts.isArrayTypeNode(node)` whose parent is NOT a `ts.TypeOperatorNode` with `operator: ReadonlyKeyword` | Array types must be declared `readonly T[]`. (`Array<T>` and `ReadonlyArray<T>` generic forms are separately banned by `no-array-generic`.) |
| `require-explicit-return-type` | `FunctionDeclaration`, `FunctionExpression`, `MethodDeclaration` with `type === undefined` (no return-type annotation) | Function declarations must have an explicit return type annotation. |
| `no-symbol-type` | `ts.SyntaxKind.SymbolKeyword` in a type position; `TypeOperatorNode` with `operator: UniqueKeyword` | `symbol` / `unique symbol` types are not allowed. |
| `no-variadic-tuple` | `ts.isTupleTypeNode(node)` whose elements include a `ts.isRestTypeNode` | Variadic tuples are not allowed. Give the rest a name in a struct type. |
| `no-array-generic` | `TypeReferenceNode` with `typeName.escapedText` in `{"Array", "ReadonlyArray"}` | Use `readonly T[]` instead of `Array<T>` or `ReadonlyArray<T>`. |
| `no-readonly-wrapper` | `TypeReferenceNode` with `typeName.escapedText === "Readonly"` | `Readonly<T>` is redundant; declare each property `readonly`. |
| `no-banned-utility-types` | `TypeReferenceNode` with `typeName.escapedText` in `{"Partial", "Required", "Record", "InstanceType", "ConstructorParameters", "ThisType", "Generator", "GeneratorFunction", "AsyncGenerator", "AsyncGeneratorFunction", "ClassDecorator", "MethodDecorator", "PropertyDecorator", "ParameterDecorator"}` | This utility type is banned. See `docs/LANGUAGE.md` for the canonical form. |
| `no-index-signature` | `ts.isIndexSignatureDeclaration(node)` | Index signatures are not allowed. Use `Map<K, V>`. |
| `no-primitive-wrapper-types` | `TypeReferenceNode` with `typeName.escapedText` in `{"String", "Number", "Boolean", "Symbol"}` | Use the lowercase primitive type. |
| `no-constructor-type` | `ts.isConstructorTypeNode(node)` | Constructor type signatures are not allowed (no classes). |
| `no-metaprogramming-globals` | Either: (a) an `Identifier` in expression position with `escapedText` in `{"Proxy", "Reflect", "Function", "Symbol"}` resolving to the global (use scope stack); or (b) a `PropertyAccessExpression` matching `Object.create`, `Object.assign`, `Object.defineProperty`, `Object.defineProperties`, `Object.getOwnPropertyDescriptor`, `Object.getOwnPropertyDescriptors`, `Object.getOwnPropertyNames`, `Object.getOwnPropertySymbols`, `Object.getPrototypeOf`, `Object.setPrototypeOf` | Metaprogramming globals are banned. |
| `no-literal-boolean-type` | `UnionTypeNode` whose members are exactly the literal types `true` and `false` (in either order), with no other members | `true \| false` is just `boolean`. |
| `no-intersection-types` | `ts.isIntersectionTypeNode(node)` | Intersection types are not allowed. Spell out the combined shape. |
| `require-tuple-destructure` | See below | Tuple-returning calls must be destructured. |

## `require-tuple-destructure` heuristic (v1, AST-only)

We can't resolve types in v1. The rule fires when **all** of:

- `ts.isVariableDeclaration(node)` and `node.name` is `ts.isIdentifier` (a plain binding, not an array pattern).
- `node.initializer` exists and (after peeling one `await`) is a `ts.CallExpression`.
- The callee is one of:
  - A bare `Identifier` whose `escapedText` matches any of: `fetch`, `jsonParse`, `jsonStringify`, `readFile`, `writeFile` (the shot:std exports), **and** that identifier was imported from `"shot:std"` in the same file (track imports in a pre-pass).
  - Any other call site can be added in v2 once type info is available.

```ts
// ❌ flagged
const r = await fetch("https://...")

// ✅
const [res, err] = await fetch("https://...")
```

False negatives (user-defined fallible fns aren't tracked) and rare false positives (someone shadows `fetch` locally) are documented v1 limitations.

## Acceptance criteria
- Each rule registered; each has a valid + invalid fixture.
- `no-assertion` correctly **allows** `x as const` and flags everything else.
- `no-ts-comment` walks the comment ranges via the TS compiler API, not just AST nodes.
- `require-tuple-destructure` flags `const r = await fetch(url)` (when `fetch` is imported from `shot:std`) and accepts `const [res, err] = await fetch(url)`.
- `no-undefined-type` flags `string | undefined` but does NOT flag the runtime identifier `undefined` (e.g. `if (x === undefined)` is valid — it's a value comparison, not a type annotation). Distinguish by checking whether the node sits inside a type position.
- `no-optional-property` only flags `?` on object-type members (`PropertySignature`), not on JS optional chaining (`?.`) which is in expression position.
- `require-readonly-arrays` should NOT flag the `T[]` inside `readonly T[]` itself — check the parent. Pattern: an `ArrayType` is "covered" if its parent is `TypeOperator { operator: Readonly }`.
- `no-array-generic`, `no-readonly-wrapper`, `no-banned-utility-types`, and `no-primitive-wrapper-types` all match on `TypeReferenceNode { typeName: Identifier { escapedText: "..." } }`. Sharing a small helper `matchTypeRefName(node, names: Set<string>)` keeps the rules compact.
- `no-metaprogramming-globals` needs the scope stack from T03 to distinguish global `Proxy` from a local shadow named `Proxy`.
- `require-explicit-return-type` applies to *declarations*, not type-level function signatures. Skip when the function is the body of a `MethodSignature` in a type/interface (those are type-level and already have annotations).
- `require-readonly-property` applies only to `PropertySignature` (type-level), not to runtime `PropertyAssignment` in object literals.

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript
deno run --allow-read tests/run-types-fixtures.ts   # mirror the T03 runner for types fixtures
```

## Notes
- See `docs/LANGUAGE.md` for ✅/❌ examples.
- For `no-ts-comment`: TS's `getLeadingCommentRanges(source, node.getFullStart())` gives `[{ pos, end, kind, hasTrailingNewLine }]`. Slice `source.slice(pos, end)` for the comment text and apply the regex.
- `no-decorators` is sensitive to TS version. Target TS ≥ 5.0 where decorators are part of `modifiers`. Pin the `typescript` npm version in `cli/deno.json` or via an explicit `npm:typescript@^5.4` specifier in imports.
