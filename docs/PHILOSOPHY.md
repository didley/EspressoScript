# Philosophy

## What shot is

shot is a **linted dialect of TypeScript** — a subtractive superset. Every valid `.shot` program is also a valid TypeScript program. The toolchain enforces a smaller set of features than TypeScript allows.

## What shot is not

shot is **not a compiled language**. There is no compiler, no AST transformation, no IR, no codegen, no lowering. The pipeline is:

1. Lint the `.shot` file in-process (TypeScript Compiler API + custom rules)
2. Write a transient Deno import map (`shot:` → `npm:@shotscript/`)
3. Hand the original `.shot` file to Deno with `--ext=ts` and the import map

No source rewriting. No `.ts` emission. No copies. The file Deno sees is the file the user wrote. Compilation (TS → JS) happens inside Deno, exactly as it would for plain TypeScript.

## Why subtractive

The TS/JS ecosystem suffers from optionality. Three ways to declare a variable. Four ways to write a function. Five error-handling patterns in the same file. Static analysis is hard; code review is harder; reading unfamiliar code is hardest.

Go's response is well known: pick one way and remove the others. `gofmt` is not configurable. There is one loop construct. One error pattern. One way to handle nullability. The language is small and the standard library does the heavy lifting.

shot applies this approach to TS. Rather than designing a new language, we restrict the one developers already know. The benefits:

- **Zero learning curve for readers** — every shot program is readable as TS.
- **Full ecosystem compatibility** — emitted output IS TypeScript; Deno's tooling and type system work unchanged.
- **No bootstrap problem** — no parser, no compiler, no language spec to maintain. We maintain a list of rules.

## Consequences of the lint-only architecture

Because shot can only subtract, never add:

- The subtractive philosophy is enforced by the **architecture**, not just policy. There is no transform stage where new syntax could be lowered, so the temptation to add features doesn't exist.
- Error positions stay 1:1 between `.shot` and the emitted `.ts` — no source maps needed.
- Zero compile cost beyond what Deno already pays.

## But it behaves like a compiled language for users

`shot run` type-checks before invoking the program. If `deno check` fails, the program never runs. This is the same UX as `go run`: types are part of correctness, not an optional layer.

## The line we won't cross

If we ever added even one transform (e.g. auto-wrapping throwing third-party calls in tuple shims), shot would become a real transpiler — and the architecture, complexity, and maintenance story would change significantly. v1 stays on the lint-only side of that line. Future versions should justify any crossing of it with care.

## Go inspirations applied to TS

| Go | shot |
|---|---|
| `gofmt`, no config | `shot fmt` — zero config, one canonical output |
| Multiple return values for errors | `[T, Error \| null]` tuples |
| No exceptions | `throw`/`try`/`catch` banned |
| Capitalized = exported, lowercase = private | Named exports only, no defaults |
| One canonical loop | `for...of` and indexed `for` only |
| Standard library does the heavy lifting | `shot:std` wraps the runtime safely |
| Compilation gates execution | `shot run` requires `deno check` to pass |
| One nil value (`nil`) | One nullable (`null`); `undefined` banned in types |
| Zero values — every struct field initialized | No optional properties; every field has a value |
| Strict by default, no opt-out | `compilerOptions` baked into `shot build`/`run`; users can't relax it |

## Beyond TS strict mode

`strict: true` is the floor, not the ceiling. The pipeline writes additional `compilerOptions` into every transient `deno.json`: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, and others. See `docs/ARCHITECTURE.md` for the full list. Users cannot disable any of these — the language defines its own tsconfig; project-level tsconfigs are overridden.
