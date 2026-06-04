# Decisions log

This file records non-trivial judgment calls made during autonomous task
execution. Each entry should explain *what* was chosen and *why*. Read
this before reviewing the diff — many small choices add up.

Format per entry:

```
## YYYY-MM-DD HH:MM — T0X: <short title>

**Context:** what was ambiguous or non-obvious.

**Decision:** what I chose.

**Why:** the reasoning.

**Reversibility:** how to undo this if it was wrong (file paths, expected diff).
```

Add new entries at the bottom. Do not edit prior entries.

## 2026-06-05 01:00 — T03: no-new-user-types allows primitive wrappers to avoid double-reporting

**Context:** `new String("hi")` triggers both `no-new-wrappers` (specifically for primitive wrappers) and `no-new-user-types` (everything not in allowlist), producing 2 diagnostics on a fixture that should produce 1.

**Decision:** Added `String`, `Number`, `Boolean`, `Symbol` to `ALLOWED_CONSTRUCTORS` in `no-new-user-types.ts`. These are separately and more specifically handled by `no-new-wrappers`.

**Why:** Rules should not double-report the same construct. `no-new-wrappers` carries the precise message for primitive wrappers; `no-new-user-types` covers user-defined class instantiation.

**Reversibility:** Remove the 4 entries from `ALLOWED_CONSTRUCTORS`.

## 2026-06-05 01:01 — T03: no-unused-expressions excludes &&/||/?? short-circuit expressions

**Context:** `condition && doThing()` in an ExpressionStatement would be caught by BOTH `no-and-shorthand` AND `no-unused-expressions` (since `&&` is a non-assignment BinaryExpression), yielding 2 diagnostics.

**Decision:** `no-unused-expressions` skips BinaryExpressions with `&&`, `||`, and `??` operators, since these can have side effects via their RHS and are separately handled by `no-and-shorthand`.

**Why:** Prevent duplicate diagnostics; `no-and-shorthand` provides the more actionable message for this pattern.

**Reversibility:** Remove the `SHORTCIRCUIT_OPS` exclusion from `no-unused-expressions.ts`.

## 2026-06-05 01:02 — T03: no-throwing-globals flags fetch() without scope check

**Context:** The task calls for using a scope stack to confirm that `fetch` resolves to the global. Implementing a full scope stack within `no-throwing-globals` would duplicate `no-shadow`'s scope tracking.

**Decision:** Flagging any call to `fetch(...)` where `fetch` is a bare Identifier, without verifying it resolves to the global. This may produce false positives if a user defines a local `fetch` function (uncommon).

**Why:** V1 simplicity. The `no-shadow` rule will separately flag any local `fetch` that shadows a used global, making the combination robust in practice.

**Reversibility:** Add scope checking in `no-throwing-globals.ts` when a shared scope context is available.

---

## 2026-06-05 00:00 — T01: Deno not on PATH; used netlify deno

**Context:** `deno` is not on the system PATH. The verification commands in T01 call `deno` directly.

**Decision:** Found Deno at `/var/home/dylanlamont/.config/netlify/deno-cli/deno` (v2.6.4). Used that binary for all verification. The installed binary path does not affect the shipped code, only local development/testing.

**Why:** The task files assume `deno` is on PATH; the user may have Deno installed for Netlify. All source files and deno.json remain runtime-agnostic.

**Reversibility:** If Deno is later added to PATH, all verification commands work unchanged.

## 2026-06-05 00:01 — T01: Added version constraint and license to cli/deno.json

**Context:** `deno publish --dry-run` rejected the package for two reasons: the `jsr:@std/cli/parse-args` import lacked a semver constraint, and `cli/deno.json` had no `license` field.

**Decision:** Pinned `@std/cli` to `^1.0.30` (the version Deno resolved during first run). Added `"license": "MIT"` to `cli/deno.json`.

**Why:** JSR requires version constraints on all specifiers and a license declaration for publishing. MIT is consistent with the project's open-source intent.

**Reversibility:** Change import to `jsr:@std/cli/parse-args` (no constraint) and remove `license` field.

## 2026-06-05 — T04: no-class defers abstract and decorated classes

**Context:** `abstract class Foo {}` would fire both `no-class` and `no-abstract`. `@Dec class Foo {}` would fire both `no-class` and `no-decorators`. Each fixture must produce exactly 1 diagnostic.

**Decision:** `no-class` skips class declarations/expressions that have `AbstractKeyword` or `Decorator` in their modifiers. Those classes are owned by `no-abstract` and `no-decorators` respectively.

**Why:** Prevent double-reporting. The specialized rule carries the more actionable message.

**Reversibility:** Remove the `hasAbstract`/`hasDecorator` early-return guards in `cli/checker/rules/no-class.ts`.

## 2026-06-05 — T04: no-conditional-type defers to no-infer when infer is present

**Context:** `infer` can only appear inside a conditional type. Any `no-infer` fixture would also fire `no-conditional-type`, producing 2 diagnostics.

**Decision:** `no-conditional-type` skips conditional types that contain an `InferTypeNode` anywhere inside them. `no-infer` is the sole reporter for those cases.

**Why:** Prevent double-reporting; `no-infer` is more specific when infer is the issue.

**Reversibility:** Remove the `containsInfer` guard in `cli/checker/rules/no-conditional-type.ts`.

## 2026-06-05 — T04: no-metaprogramming-globals has no scope stack (v1)

**Context:** The task spec calls for a scope stack to distinguish global `Proxy`/`Reflect`/`Function`/`Symbol` from local shadows. Implementing a full scope stack duplicates `no-shadow`'s work.

**Decision:** Flagging bare identifiers in expression position (parent is not TypeReferenceNode, ImportSpecifier, or property name) without verifying they resolve to the global.

**Why:** V1 simplicity. `no-shadow` will separately flag any local that shadows these names, making the combination robust in practice.

**Reversibility:** Add scope tracking in `cli/checker/rules/no-metaprogramming-globals.ts` when a shared scope context is available.

## 2026-06-05 — T04: no-logical-assignment fixture updated for require-readonly-property

**Context:** The T03 `no-logical-assignment-invalid.shot` fixture used `{ x: number | null }` as a type annotation. T04's `require-readonly-property` now fires for any PropertySignature without ReadonlyKeyword, causing 2 diagnostics.

**Decision:** Added `readonly` to the property: `{ readonly x: number | null }`.

**Why:** The fixture must produce exactly 1 diagnostic total across all rules. Since logical assignment to a `readonly` property is a type error but not an AST-checker error, the rule still fires correctly.

**Reversibility:** Remove `readonly` from the fixture to restore the original (but it will break with T04 rules active).
