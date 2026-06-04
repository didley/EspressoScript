# T11 — End-to-end verification

## Goal
A single script that runs every verification case. Exit 0 means v1 is delivered.

## Dependencies
T01–T10.

## Files to create
- `scripts/verify.sh` — bash script that runs all cases
- `tests/e2e/` — directory containing input `.shot` files and expected outputs

## Verification cases

| # | Case | Pass criteria |
|---|---|---|
| 01 | Tool runs | `deno run -A cli/mod.ts --version` exits 0 |
| 02 | Valid file lints clean | `shot check hello.shot` exits 0 |
| 03 | `const fn = () => {}` | exits 1, diagnostic `no-arrow-functions` |
| 04 | `throw new Error("x")` | exits 1, diagnostic `no-throw` |
| 05 | `interface Foo {}` | exits 1, diagnostic `no-interface` |
| 06 | `enum Direction {}` | exits 1, diagnostic `no-enum` |
| 07 | `import x from "npm:lodash"` | exits 1, diagnostic `imports-allowlist` |
| 08 | `const r = await fetch(url)` (no destructure, `fetch` from shot:std) | exits 1, diagnostic `require-tuple-destructure` |
| 09 | `const [v, err] = fallible(); use(v)` (err unread) | `shot build` exits 1 via `deno check`'s `noUnusedLocals` |
| 10 | Cross-file relative import `import { x } from "./util.shot"` | `shot build` exits 0; both files lint and type-check together |
| 11 | `shot fmt dirty.shot` | reformats the file in place |
| 12 | `shot run hello.shot` | runs; with `-- --allow-net` permissions pass through correctly |
| 13 | `shot run bad-types.shot` (lint clean, type errors, has writeFile sentinel as first action) | exits non-zero, sentinel file NOT written — program never executed |
| 14 | Local install path | `deno install -gn shot ./cli/mod.ts && shot check hello.shot` works |
| 15 | `type T = string \| undefined` | exits 1, diagnostic `no-undefined-type` |
| 16 | `type Config = { port?: number }` | exits 1, diagnostic `no-optional-property` |
| 17 | `function f(x = 5): void {}` | exits 1, diagnostic `no-default-parameter` |
| 18 | `const a: { name: string } = {}` (missing prop under strict tsconfig) | `shot build` exits 1 via `deno check` strict mode |
| 19 | `type T = { name: string }` (no readonly) | exits 1, diagnostic `require-readonly-property` |
| 20 | `function f(n: number) { return n * 2 }` (no return type) | exits 1, diagnostic `require-explicit-return-type` |
| 21 | `const xs: number[] = []` (non-readonly array) | exits 1, diagnostic `require-readonly-arrays` |
| 22 | `const a = 1, b = 2` | exits 1, diagnostic `no-multi-var-decl` |
| 23 | Inner `const x` inside outer `const x` scope | exits 1, diagnostic `no-shadow` |
| 24 | `const x: number[] = [1]; const y = x[5]; console.log(y.toFixed())` (unchecked index) | `shot build` exits 1 via `deno check` (`noUncheckedIndexedAccess`) |
| 25 | `function f(n: number): number { n = n + 1; return n }` | exits 1, diagnostic `no-param-reassign` |
| 26 | `function f(): void {}` (empty body) | exits 1, diagnostic `no-empty` |
| 27 | `if (x === x) {}` | exits 1, diagnostic `no-self-compare` |
| 28 | `const s = "hi " + name` | exits 1, diagnostic `prefer-template` |
| 29 | `class Foo {}; new Foo()` — the `class` is caught first, but verify `new Foo()` alone (Foo declared as a `function`) flags `no-new-user-types` | exits 1, diagnostic `no-new-user-types` |
| 30 | `for (const x of xs) { function makeHandler(): void {} }` | exits 1, diagnostic `no-loop-func` |
| 31 | `const xs: ReadonlyArray<number> = []` | exits 1, diagnostic `no-array-generic` |
| 32 | `type T = Readonly<{ x: number }>` | exits 1, diagnostic `no-readonly-wrapper` |
| 33 | `type T = Partial<{ readonly x: number }>` | exits 1, diagnostic `no-banned-utility-types` |
| 34 | `type T = Record<string, number>` | exits 1, diagnostic `no-banned-utility-types` |
| 35 | `type T = { [k: string]: number }` | exits 1, diagnostic `no-index-signature` |
| 36 | `const s: String = "hi"` | exits 1, diagnostic `no-primitive-wrapper-types` |
| 37 | `const p = new Proxy({}, {})` | exits 1, diagnostic `no-metaprogramming-globals` |
| 38 | `JSON.parse("{}")` | exits 1, diagnostic `no-throwing-globals` |
| 39 | `[1].map(function (n) { return n })` (anonymous function expression) | exits 1, diagnostic `require-named-functions` |
| 40 | `do { /* ... */ } while (true)` | exits 1, diagnostic `no-do-while` |
| 41 | `outer: for (const x of xs) { break outer }` | exits 1, diagnostic `no-labels` |
| 42 | `const { x = 5 } = obj` | exits 1, diagnostic `no-destructuring-default` |
| 43 | `a ??= b` | exits 1, diagnostic `no-logical-assignment` |
| 44 | `` html`<div>` `` (tagged template) | exits 1, diagnostic `no-tagged-templates` |
| 45 | `type T = true \| false` | exits 1, diagnostic `no-literal-boolean-type` |
| 46 | `type T = A & B` | exits 1, diagnostic `no-intersection-types` |
| 47 | `Object.assign({}, src)` | exits 1, diagnostic `no-metaprogramming-globals` |
| 48 | `Number.parseInt("42")` | exits 1, diagnostic `no-parse-number-fns` |

## Script structure

```bash
#!/usr/bin/env bash
set -uo pipefail

FAILS=0
pass() { echo "  ✓ $1"; }
fail() { echo "  ✗ $1"; FAILS=$((FAILS+1)); }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SHOT="deno run -A $ROOT/cli/mod.ts"

case_01() {
    echo "Case 01: tool runs"
    $SHOT --version > /dev/null && pass "shot --version" || fail "shot --version exited non-zero"
}

# ... case_02 through case_14

main() {
    for n in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48; do
        "case_$n"
    done
    echo
    if [ $FAILS -eq 0 ]; then
        echo "All 48 cases passed."
        exit 0
    else
        echo "$FAILS case(s) failed."
        exit 1
    fi
}

main
```

Each case should be independently runnable and self-contained (creates its own fixture, cleans up after itself).

## Acceptance criteria
- `bash scripts/verify.sh` exits 0 on a clean checkout where all prior tasks are complete.
- Each case prints `✓` or `✗` with a short label.
- A failing case does not abort the script — all 14 run regardless.
- Handles missing `deno` gracefully (case 01 fails clearly; later cases short-circuit).

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript
bash scripts/verify.sh
echo "exit: $?"
```

## Notes
- This is the "definition of done" for v1. Green = ship.
- Case 09 depends on `deno check` enforcing `noUnusedLocals`. If the deno default isn't strict enough, the transient `deno.json` from T08 should include:
  ```json
  { "imports": { "shot:": "jsr:@espresso/" }, "compilerOptions": { "noUnusedLocals": true, "noUnusedParameters": true } }
  ```
  If this turns out necessary, update `cli/pipeline.ts` accordingly and flag in this task's "discovered subtasks" section.
- Case 13 is the "compile-language UX" assertion. The sentinel-not-written check is non-negotiable.
- Case 10 verifies the relaxed allowlist (relative `.shot` imports) is wired end-to-end.
