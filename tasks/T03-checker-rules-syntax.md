# T03 — Checker syntax rules

## Goal
Implement all syntax-level rules. Each rule lives in `cli/checker/rules/<rule-name>.ts`, exports a `Rule`, and is registered in `cli/checker/rules/index.ts`. Each rule ships with a valid + invalid fixture under `tests/fixtures/syntax/`.

## Dependencies
T02.

## Files to modify
- `cli/checker/rules/index.ts` — register all rules below

## Files to create
- `cli/checker/rules/<rule-name>.ts` — one file per rule
- `tests/fixtures/syntax/<rule-name>-valid.shot` and `-invalid.shot` for each rule

## Rules

All use the TypeScript Compiler API (`ts.SyntaxKind`, `ts.is*` type guards).

| Rule name | Trigger | Message |
|---|---|---|
| `no-arrow-functions` | `ts.isArrowFunction(node)` | Arrow functions are not allowed. Use the `function` keyword. |
| `no-let-outside-for` | `ts.isVariableStatement(node)` with `NodeFlags.Let` AND parent is not a `ForStatement` (initializer) | `let` is only allowed in a `for` header. Use `const`. |
| `no-var` | `VariableDeclarationList` with `NodeFlags.None` (no Let/Const flag) | `var` is not allowed. Use `const`. |
| `no-increment-decrement` | `ts.isPostfixUnaryExpression(node)` or `ts.isPrefixUnaryExpression(node)` with `PlusPlusToken` / `MinusMinusToken` | `++` and `--` are not allowed. Use `+= 1` or `-= 1`. |
| `no-unary-plus` | `ts.isPrefixUnaryExpression(node)` with `PlusToken` | Unary `+` coercion is not allowed. Use `Number()`. |
| `no-throw` | `ts.isThrowStatement(node)` | `throw` is not allowed. Return `[T, Error \| null]` tuples. |
| `no-try` | `ts.isTryStatement(node)` | `try`/`catch`/`finally` is not allowed. |
| `no-promise-chain` | `ts.isCallExpression(node)` with `expression` a `PropertyAccessExpression` whose `name.text` is `"then"`, `"catch"`, or `"finally"` | Promise chains are not allowed. Use `async`/`await`. |
| `no-loose-equality` | `ts.isBinaryExpression(node)` with operator `EqualsEqualsToken` or `ExclamationEqualsToken` | Loose equality is not allowed. Use `===` / `!==`. |
| `no-and-shorthand` | `ts.isExpressionStatement(node)` whose `expression` is a `BinaryExpression` with `AmpersandAmpersandToken` | Don't use `&&` as conditional execution. Use an `if` block. |
| `no-double-bang` | `ts.isPrefixUnaryExpression(node)` with `ExclamationToken` AND `operand` is also a `PrefixUnaryExpression` with `ExclamationToken` | `!!` is not allowed. Use `Boolean()`. |
| `no-ternary` | `ts.isConditionalExpression(node)` | Ternary expressions are not allowed. Use a named function. |
| `no-bitwise` | `BinaryExpression` with `AmpersandToken`, `BarToken`, `CaretToken`, `LessThanLessThanToken`, `GreaterThanGreaterThanToken`, `GreaterThanGreaterThanGreaterThanToken`; `PrefixUnaryExpression` with `TildeToken`; matching assignment-op variants | Bitwise operators are not allowed. |
| `no-delete` | `ts.isDeleteExpression(node)` | `delete` is not allowed. |
| `no-in` | `BinaryExpression` with `InKeyword` operator | `in` operator is not allowed. |
| `no-comma-operator` | `BinaryExpression` with `CommaToken` operator (note: parameter lists use a different AST shape and are not affected) | Comma operator is not allowed. |
| `no-arguments` | `Identifier` with `escapedText === "arguments"` in a read position | `arguments` is not allowed. Use rest params `...args`. |
| `no-generators` | `FunctionDeclaration` / `FunctionExpression` / `MethodDeclaration` with an `AsteriskToken`; `YieldExpression` | Generators are not allowed. |
| `no-eval` | `CallExpression` whose `expression` is `Identifier { escapedText: "eval" }` | `eval` is not allowed. |
| `no-for-in` | `ts.isForInStatement(node)` | `for...in` is not allowed. Use `for...of` or indexed `for`. |
| `switch-no-fallthrough` | For each `CaseClause`: if `statements` is non-empty, the last must be `BreakStatement`, `ReturnStatement`, `ThrowStatement` (allowed for purposes of control flow even though `throw` is banned elsewhere), or `ContinueStatement`. Empty consequents are OK (fallthrough by absence is allowed Go-style). | Switch case must end with `break` or `return`. |
| `no-require` | `CallExpression` whose `expression` is `Identifier { escapedText: "require" }` | `require()` is not allowed. Use ESM `import`. |
| `no-default-export` | `ts.isExportAssignment(node)` (the `export default` form) | Default exports are not allowed. Use named exports. |
| `no-parse-number-fns` | `CallExpression` whose `expression` is either: (a) an `Identifier` with text `"parseInt"` or `"parseFloat"`; or (b) a `PropertyAccessExpression` matching `Number.parseInt` or `Number.parseFloat` | Use `Number()` instead of `parseInt` / `parseFloat`. |
| `no-multi-var-decl` | `VariableDeclarationList` with `declarations.length > 1` | One variable declaration per statement. |
| `no-shadow` | `Identifier` in a binding position whose name is already in scope from an enclosing scope. Build a scope stack during the walk; flag on hit. | Variable shadowing is not allowed. Rename the inner binding. |
| `no-param-reassign` | `BinaryExpression` with `OperatorToken in AssignmentToken family` whose left side is an `Identifier` resolving to a function parameter (use the scope stack from `no-shadow`). | Function parameters cannot be reassigned. Use a new `const`. |
| `no-multi-assign` | `BinaryExpression` with `EqualsToken` whose right side is itself an `AssignmentExpression` | Chained assignment (`a = b = c`) is not allowed. |
| `no-return-assign` | `ReturnStatement` whose `expression` is a `BinaryExpression` with an assignment operator | Return value cannot be an assignment expression. |
| `no-self-assign` | `BinaryExpression` `=` where left and right are textually identical (same identifier or same property access path) | Self-assignment has no effect. |
| `no-self-compare` | `BinaryExpression` with `===`/`!==`/`==`/`!=` where left and right are textually identical | Comparing a value to itself is a bug or a NaN-check abuse — use `Number.isNaN()`. |
| `no-empty` | `Block` with `statements.length === 0` (including function bodies, if branches, switch cases) | Empty blocks are not allowed. |
| `no-lone-blocks` | `Block` whose parent is a `Block`/`SourceFile`/`ModuleBlock` (i.e. not attached to a control-flow statement, function, try, or class) | Lone blocks are not allowed. |
| `no-empty-pattern` | `ObjectBindingPattern` or `ArrayBindingPattern` with `elements.length === 0` | Empty destructure has no effect. |
| `no-useless-rename` | `ImportSpecifier`/`ExportSpecifier`/`BindingElement` where the renamed name equals the original (`{ a as a }`, `{ a: a }`) | Useless rename — drop the alias. |
| `no-useless-return` | `ReturnStatement` with no expression as the last statement of a function returning `void` (or `undefined`-typed) | Trailing bare `return` is unnecessary. |
| `no-useless-concat` | `BinaryExpression` with `PlusToken` where both operands are string literals (not template literals with interpolations) | Concatenating string literals — write a single literal. |
| `no-useless-computed-key` | `PropertyAssignment`/`PropertySignature`/`MethodDeclaration` with a `ComputedPropertyName` whose expression is a string-literal or numeric-literal with a valid identifier name | Computed key is unnecessary — use the identifier form. |
| `no-useless-empty-export` | `ExportDeclaration` with empty `exportClause` (`export {}`) | `export {}` is meaningless under `moduleDetection: force`. |
| `no-loop-func` | `FunctionDeclaration`/`FunctionExpression` whose ancestor chain (stopping at the nearest function) crosses a `ForStatement`/`ForOfStatement`/`WhileStatement`/`DoStatement` | Declaring a function inside a loop closes over the loop variable — extract it. |
| `no-new-wrappers` | `NewExpression` whose `expression` is `Identifier { escapedText: "String" / "Number" / "Boolean" / "Symbol" }` | `new String/Number/Boolean/Symbol` creates wrapped primitives — use the function call form. |
| `no-unused-expressions` | `ExpressionStatement` whose expression has no side effect — heuristic v1: flag `Identifier`, `PropertyAccessExpression`, `ElementAccessExpression`, `BinaryExpression` with non-assignment operator, `ConditionalExpression`. Allow `CallExpression`, `NewExpression`, `AwaitExpression`, `YieldExpression`, assignments. | Bare expression has no effect. |
| `no-void` | `VoidExpression` | Statement-level `void` is not allowed. |
| `prefer-template` | `BinaryExpression` `+` where at least one operand is an `Identifier`/`PropertyAccessExpression`/`CallExpression` (i.e. not literal-only — that's `no-useless-concat`) AND the result is string-typed-ish (heuristic: any operand is a string literal). | Use a template literal instead of `+`. |
| `require-named-functions` | `ts.isFunctionExpression(node)` with `node.name === undefined` | Function expressions must be named. |
| `no-do-while` | `ts.isDoStatement(node)` | `do...while` is not allowed. Use `while`. |
| `no-labels` | `ts.isLabeledStatement(node)`; also `BreakStatement` / `ContinueStatement` with `label !== undefined` | Labels are not allowed. Extract a function and `return`. |
| `no-destructuring-default` | `ObjectBindingPattern` or `ArrayBindingPattern` whose element is a `BindingElement` with `initializer !== undefined` | Defaults in destructuring rely on `undefined` (banned sentinel). |
| `no-logical-assignment` | `BinaryExpression` with operator `BarBarEqualsToken`, `AmpersandAmpersandEqualsToken`, or `QuestionQuestionEqualsToken` | Logical assignment is not allowed. Spell it out. |
| `no-tagged-templates` | `ts.isTaggedTemplateExpression(node)` | Tagged template literals are not allowed. |
| `no-throwing-globals` | Property access or call: `JSON.parse`, `JSON.stringify`, `Deno.readTextFile`, `Deno.writeTextFile`; bare `fetch` identifier in a call position (use scope stack to confirm it resolves to the global). | This global throws — use the `shot:std` wrapper. |
| `no-new-user-types` | `NewExpression` whose `expression` is an `Identifier` NOT in the built-in allowlist: `Error`, `TypeError`, `RangeError`, `SyntaxError`, `Map`, `Set`, `WeakMap`, `WeakSet`, `Date`, `URL`, `URLSearchParams`, `RegExp`, `Promise` (rare but allowed for `new Promise` constructor pattern), `Uint8Array`, `Uint16Array`, `Uint32Array`, `Int8Array`, `Int16Array`, `Int32Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`, `ArrayBuffer`, `DataView`, `TextDecoder`, `TextEncoder`, `AbortController`, `AbortSignal`, `EventTarget`, `Event`, `CustomEvent`, `Headers`, `Request`, `Response`, `Blob`, `File`, `FormData`, `Worker` | `new` is only allowed on built-in runtime constructors. The allowlist lives in `cli/checker/rules/no-new-user-types.ts` — extend by code review. |

## Rules NOT in this task (cut from v1)

The following appeared in earlier drafts but were dropped:

- ~~`no-implicit-truthy`~~ — deferred to v2 (requires type-aware checker)
- ~~`no-method-shorthand`~~ — redundant with `no-this` (next task)
- ~~`no-iife`~~ — vanishingly rare in ESM, low value
- ~~`no-function-overload`~~ — rare, niche, expensive to detect
- ~~`no-with`~~ — strict mode (ESM modules are always strict) already bans this
- ~~`no-namespace`~~ — pre-ESM legacy, ESM-only rule already obviates

## Acceptance criteria
- Each rule registered in `cli/checker/rules/index.ts`.
- Each rule has at least one invalid fixture that produces exactly one matching diagnostic.
- Each rule has a valid fixture that produces zero diagnostics.
- Running the checker over `tests/fixtures/syntax/*-invalid.shot` (one at a time) produces the expected `rule` field per file.
- Running it on `*-valid.shot` produces zero diagnostics.

## Verification command

```ts
// tests/run-syntax-fixtures.ts
import { check } from "../cli/checker/mod.ts"
import { walk } from "jsr:@std/fs/walk"

let fails = 0
for await (const entry of walk("tests/fixtures/syntax/", { exts: [".shot"] })) {
    const source = await Deno.readTextFile(entry.path)
    const diagnostics = check(entry.path, source)
    const expected = entry.path.includes("-invalid") ? 1 : 0
    if (diagnostics.length !== expected) {
        console.log(`FAIL: ${entry.path} expected ${expected}, got ${diagnostics.length}`)
        fails++
    }
}
Deno.exit(fails > 0 ? 1 : 0)
```

```bash
cd /var/home/dylanlamont/Developer/ShotScript
deno run --allow-read tests/run-syntax-fixtures.ts
```

## Notes
- This task is large. Splitting into 3–5 sub-PRs (each grouping related rules) is fine — but keep all rules registered in one `index.ts`.
- The TS Compiler API uses `ts.SyntaxKind` enums plus type guards (`ts.isXyz(node)`). Use type guards in rules for type narrowing.
- For position info, use `node.getStart(sourceFile)` then `sourceFile.getLineAndCharacterOfPosition(pos)`. Wrap in a util.
- `no-shadow` needs a scope stack — the simplest implementation pushes a new frame on `FunctionDeclaration`/`FunctionExpression`/`Block`/`ForStatement`/`CatchClause` (catch is moot since `try` is banned, but include for completeness) and pops on exit. Track bindings introduced by `VariableDeclaration`, `Parameter`, `ImportClause`, and named function declarations. Built-ins (`console`, `globalThis`, etc.) live in the bottom frame.
- See `docs/LANGUAGE.md` for ✅/❌ examples to base fixtures on.
- TS docs: <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API>
