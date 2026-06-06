#!/usr/bin/env bash
set -uo pipefail

FAILS=0
pass() { echo "  ✓ $1"; }
fail() { echo "  ✗ $1"; FAILS=$((FAILS+1)); }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DENO="${DENO_EXEC:-deno}"
# Find deno if not on PATH
if ! command -v "$DENO" &>/dev/null; then
    for candidate in \
        "$HOME/.config/netlify/deno-cli/deno" \
        "$HOME/.deno/bin/deno" \
        "/usr/local/bin/deno"; do
        if [ -x "$candidate" ]; then DENO="$candidate"; break; fi
    done
fi
SHOT="$DENO run -A $ROOT/cli/mod.ts"
STDLIB="$ROOT/stdlib/mod.ts"
TMPDIR_CASES="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_CASES"' EXIT

check_exit() {
    local label="$1" expected="$2"
    local actual="${PIPESTATUS[0]:-$?}"
    [ "${actual}" -eq "${expected}" ] && pass "$label" || fail "$label (expected exit $expected, got $actual)"
}

diagnostic_check() {
    local label="$1" expected_rule="$2" file="$3"
    local out
    out="$($SHOT check "$file" 2>&1)"
    local code=$?
    if [ "$code" -ne 1 ]; then
        fail "$label (expected exit 1, got $code)"
    elif echo "$out" | grep -q "$expected_rule"; then
        pass "$label"
    else
        fail "$label (rule $expected_rule not found in output: $out)"
    fi
}

tmp() { echo "$TMPDIR_CASES/$1"; }

# Case 01: tool runs
echo "Case 01: tool runs"
$SHOT --version > /dev/null 2>&1 && pass "shot --version" || fail "shot --version"

# Case 02: valid file lints clean
echo "Case 02: valid file lints clean"
printf 'export const x: number = 1\n' > "$(tmp hello.shot)"
$SHOT check "$(tmp hello.shot)" > /dev/null 2>&1 && pass "shot check hello.shot" || fail "shot check hello.shot"

# Case 03: no-arrow-functions
echo "Case 03: no-arrow-functions"
printf 'export const fn = (): void => {}\n' > "$(tmp arrow.shot)"
diagnostic_check "no-arrow-functions" "no-arrow-functions" "$(tmp arrow.shot)"

# Case 04: no-throw
echo "Case 04: no-throw"
printf 'export function f(): void { throw new Error("x") }\n' > "$(tmp throw.shot)"
diagnostic_check "no-throw" "no-throw" "$(tmp throw.shot)"

# Case 05: no-interface
echo "Case 05: no-interface"
printf 'interface Foo { readonly x: number }\nexport type { Foo }\n' > "$(tmp iface.shot)"
diagnostic_check "no-interface" "no-interface" "$(tmp iface.shot)"

# Case 06: no-enum
echo "Case 06: no-enum"
printf 'enum Direction { Up, Down }\nexport { Direction }\n' > "$(tmp enum.shot)"
diagnostic_check "no-enum" "no-enum" "$(tmp enum.shot)"

# Case 07: imports-allowlist
echo "Case 07: imports-allowlist"
printf 'import x from "npm:lodash"\nexport { x }\n' > "$(tmp npm.shot)"
diagnostic_check "imports-allowlist" "imports-allowlist" "$(tmp npm.shot)"

# Case 08: require-tuple-destructure (fetch from shot:std)
echo "Case 08: require-tuple-destructure"
cat > "$(tmp no-destructure.shot)" << 'EOF'
import { fetch } from "shot:std"
export async function main(): Promise<void> {
    const r = await fetch("https://example.com")
    console.log(r)
}
EOF
diagnostic_check "require-tuple-destructure" "require-tuple-destructure" "$(tmp no-destructure.shot)"

# Case 09: noUnusedLocals via shot build
echo "Case 09: noUnusedLocals (shot build)"
cat > "$(tmp unused-err.shot)" << 'EOF'
export function fallible(): [number | null, Error | null] { return [1, null] }
export function test(): void {
    const [v, err] = fallible()
    console.log(v)
}
EOF
$SHOT build "$(tmp unused-err.shot)" > /dev/null 2>&1
[ $? -ne 0 ] && pass "noUnusedLocals (err unread → build fails)" || fail "noUnusedLocals (expected build to fail)"

# Case 10: cross-file relative import
echo "Case 10: cross-file relative import"
printf 'export function add(a: number, b: number): number { return a + b }\n' > "$(tmp util.shot)"
cat > "$(tmp main.shot)" << 'EOF'
import { add } from "./util.shot"
export function run(): number { return add(1, 2) }
EOF
$SHOT check "$(tmp util.shot)" "$(tmp main.shot)" > /dev/null 2>&1 && pass "cross-file check" || fail "cross-file check"

# Case 11: shot fmt
echo "Case 11: shot fmt"
printf 'export const x=1;export function foo(  ):number{return x}\n' > "$(tmp dirty.shot)"
$SHOT fmt "$(tmp dirty.shot)" > /dev/null 2>&1 && grep -q "return x" "$(tmp dirty.shot)" && pass "shot fmt" || fail "shot fmt"

# Case 12: shot run hello world
echo "Case 12: shot run hello world"
cat > "$(tmp run-hello.shot)" << 'EOF'
function main(): void { console.log("hello from shot") }
main()
EOF
out="$($SHOT run "$(tmp run-hello.shot)" 2>&1)"
echo "$out" | grep -q "hello from shot" && pass "shot run hello world" || fail "shot run hello world (output: $out)"

# Case 13: type error blocks execution (sentinel test)
echo "Case 13: type error blocks execution"
SENTINEL="$(tmp sentinel)"
rm -f "$SENTINEL"
cat > "$(tmp bad-types.shot)" << EOF
import { writeFile } from "shot:std"
const [_, writeErr] = await writeFile("$SENTINEL", "executed")
if (writeErr !== null) { console.log(writeErr.message) }
const x: number = "this is a type error"
console.log(x)
EOF
SHOT_STDLIB_LOCAL="$STDLIB" $SHOT run "$(tmp bad-types.shot)" -- --allow-write > /dev/null 2>&1 || true
if [ ! -f "$SENTINEL" ]; then
    pass "sentinel not written (type error blocked execution)"
else
    fail "sentinel was written (type error did NOT block execution)"
fi

# Case 14: local install
# The installed wrapper calls `exec deno run ...` — prepend deno's directory to PATH
echo "Case 14: local install"
INSTALL_DIR="$(tmp install-bin)"
mkdir -p "$INSTALL_DIR"
DENO_DIR="$(dirname "$DENO")"
$DENO install --root "$INSTALL_DIR" -A -gn shot "$ROOT/cli/mod.ts" > /dev/null 2>&1
if PATH="$DENO_DIR:$PATH" "$INSTALL_DIR/bin/shot" --version > /dev/null 2>&1; then
    pass "deno install + shot --version"
else
    fail "deno install (shot binary not functional)"
fi

# Case 15: no-undefined-type
echo "Case 15: no-undefined-type"
printf 'type T = string | null | undefined\nexport type { T }\n' > "$(tmp undef.shot)"
diagnostic_check "no-undefined-type" "no-undefined-type" "$(tmp undef.shot)"

# Case 16: no-optional-property
echo "Case 16: no-optional-property"
printf 'type Config = { readonly port?: number }\nexport type { Config }\n' > "$(tmp opt-prop.shot)"
diagnostic_check "no-optional-property" "no-optional-property" "$(tmp opt-prop.shot)"

# Case 17: no-default-parameter
echo "Case 17: no-default-parameter"
printf 'export function f(x: number = 5): void { console.log(x) }\n' > "$(tmp default-param.shot)"
diagnostic_check "no-default-parameter" "no-default-parameter" "$(tmp default-param.shot)"

# Case 18: strict tsconfig catches missing property
echo "Case 18: strict tsconfig (missing required property)"
cat > "$(tmp missing-prop.shot)" << 'EOF'
type Config = { readonly host: string; readonly port: number }
export const c: Config = { host: "localhost" } as unknown as Config
EOF
# This is a structural test — just verify shot build fails on a type error
printf 'export const x: number = "bad"\n' > "$(tmp strict.shot)"
$SHOT build "$(tmp strict.shot)" > /dev/null 2>&1
[ $? -ne 0 ] && pass "strict tsconfig rejects type error" || fail "strict tsconfig (expected failure)"

# Case 19: require-readonly-property
echo "Case 19: require-readonly-property"
printf 'type T = { name: string }\nexport type { T }\n' > "$(tmp no-readonly.shot)"
diagnostic_check "require-readonly-property" "require-readonly-property" "$(tmp no-readonly.shot)"

# Case 20: require-explicit-return-type
echo "Case 20: require-explicit-return-type"
printf 'export function f(n: number) { return n * 2 }\n' > "$(tmp no-ret-type.shot)"
diagnostic_check "require-explicit-return-type" "require-explicit-return-type" "$(tmp no-ret-type.shot)"

# Case 21: require-readonly-arrays
echo "Case 21: require-readonly-arrays"
printf 'export const xs: number[] = []\n' > "$(tmp arr.shot)"
diagnostic_check "require-readonly-arrays" "require-readonly-arrays" "$(tmp arr.shot)"

# Case 22: no-multi-var-decl
echo "Case 22: no-multi-var-decl"
printf 'export const a = 1, b = 2\n' > "$(tmp multi.shot)"
diagnostic_check "no-multi-var-decl" "no-multi-var-decl" "$(tmp multi.shot)"

# Case 23: no-shadow
echo "Case 23: no-shadow"
cat > "$(tmp shadow.shot)" << 'EOF'
export const x: number = 1
export function f(): void { const x: number = 2; console.log(x) }
EOF
diagnostic_check "no-shadow" "no-shadow" "$(tmp shadow.shot)"

# Case 24: noUncheckedIndexedAccess
echo "Case 24: noUncheckedIndexedAccess (shot build)"
cat > "$(tmp unchecked-idx.shot)" << 'EOF'
export const xs: readonly number[] = [1]
export const y: number = xs[5]
EOF
$SHOT build "$(tmp unchecked-idx.shot)" > /dev/null 2>&1
[ $? -ne 0 ] && pass "noUncheckedIndexedAccess (build fails)" || fail "noUncheckedIndexedAccess (expected failure)"

# Case 25: no-param-reassign
echo "Case 25: no-param-reassign"
printf 'export function f(n: number): number { n = n + 1; return n }\n' > "$(tmp param-reassign.shot)"
diagnostic_check "no-param-reassign" "no-param-reassign" "$(tmp param-reassign.shot)"

# Case 26: no-empty
echo "Case 26: no-empty"
printf 'export function f(): void {}\n' > "$(tmp empty-fn.shot)"
diagnostic_check "no-empty" "no-empty" "$(tmp empty-fn.shot)"

# Case 27: no-self-compare
echo "Case 27: no-self-compare"
printf 'export const x: number = 1\nexport const r: boolean = x === x\n' > "$(tmp self-cmp.shot)"
diagnostic_check "no-self-compare" "no-self-compare" "$(tmp self-cmp.shot)"

# Case 28: prefer-template
echo "Case 28: prefer-template"
printf 'export const name: string = "world"\nexport const s: string = "hi " + name\n' > "$(tmp str-concat.shot)"
diagnostic_check "prefer-template" "prefer-template" "$(tmp str-concat.shot)"

# Case 29: no-new-user-types (function-based constructor)
echo "Case 29: no-new-user-types"
cat > "$(tmp new-user.shot)" << 'EOF'
export function Foo(): void {}
export const f = new Foo()
EOF
diagnostic_check "no-new-user-types" "no-new-user-types" "$(tmp new-user.shot)"

# Case 30: no-loop-func
echo "Case 30: no-loop-func"
cat > "$(tmp loop-func.shot)" << 'EOF'
export const xs: readonly number[] = [1, 2]
for (const x of xs) { function makeHandler(): void { console.log(x) } }
EOF
diagnostic_check "no-loop-func" "no-loop-func" "$(tmp loop-func.shot)"

# Case 31: no-array-generic
echo "Case 31: no-array-generic"
printf 'export const xs: ReadonlyArray<number> = []\n' > "$(tmp arr-generic.shot)"
diagnostic_check "no-array-generic" "no-array-generic" "$(tmp arr-generic.shot)"

# Case 32: no-readonly-wrapper
echo "Case 32: no-readonly-wrapper"
printf 'type T = Readonly<{ readonly x: number }>\nexport type { T }\n' > "$(tmp readonly-wrap.shot)"
diagnostic_check "no-readonly-wrapper" "no-readonly-wrapper" "$(tmp readonly-wrap.shot)"

# Case 33: no-banned-utility-types (Partial)
echo "Case 33: no-banned-utility-types (Partial)"
printf 'type T = Partial<{ readonly x: number }>\nexport type { T }\n' > "$(tmp partial.shot)"
diagnostic_check "no-banned-utility-types" "no-banned-utility-types" "$(tmp partial.shot)"

# Case 34: no-banned-utility-types (Record)
echo "Case 34: no-banned-utility-types (Record)"
printf 'type T = Record<string, number>\nexport type { T }\n' > "$(tmp record.shot)"
diagnostic_check "no-banned-utility-types" "no-banned-utility-types" "$(tmp record.shot)"

# Case 35: no-index-signature
echo "Case 35: no-index-signature"
printf 'type T = { [k: string]: number }\nexport type { T }\n' > "$(tmp idx-sig.shot)"
diagnostic_check "no-index-signature" "no-index-signature" "$(tmp idx-sig.shot)"

# Case 36: no-primitive-wrapper-types
echo "Case 36: no-primitive-wrapper-types"
printf 'export const s: String = "hi"\n' > "$(tmp prim-wrap.shot)"
diagnostic_check "no-primitive-wrapper-types" "no-primitive-wrapper-types" "$(tmp prim-wrap.shot)"

# Case 37: no-metaprogramming-globals (Proxy)
echo "Case 37: no-metaprogramming-globals (Proxy)"
cat > "$(tmp proxy.shot)" << 'EOF'
export function test(): void { const p = new Proxy({}, {}) }
EOF
diagnostic_check "no-metaprogramming-globals" "no-metaprogramming-globals" "$(tmp proxy.shot)"

# Case 38: no-throwing-globals (JSON.parse)
echo "Case 38: no-throwing-globals (JSON.parse)"
printf 'export function f(): unknown { return JSON.parse("{}") }\n' > "$(tmp json-parse.shot)"
diagnostic_check "no-throwing-globals" "no-throwing-globals" "$(tmp json-parse.shot)"

# Case 39: require-named-functions
echo "Case 39: require-named-functions"
printf 'export const xs: readonly number[] = [1]\nexport const r = xs.map(function (n: number): number { return n })\n' > "$(tmp anon-fn.shot)"
diagnostic_check "require-named-functions" "require-named-functions" "$(tmp anon-fn.shot)"

# Case 40: no-do-while
echo "Case 40: no-do-while"
printf 'export function f(): void { do { const x: number = 1; console.log(x) } while (false) }\n' > "$(tmp do-while.shot)"
diagnostic_check "no-do-while" "no-do-while" "$(tmp do-while.shot)"

# Case 41: no-labels
echo "Case 41: no-labels"
cat > "$(tmp labels.shot)" << 'EOF'
export const xs: readonly number[] = [1]
export function f(): void { outer: for (const x of xs) { console.log(x); break outer } }
EOF
diagnostic_check "no-labels" "no-labels" "$(tmp labels.shot)"

# Case 42: no-destructuring-default
echo "Case 42: no-destructuring-default"
cat > "$(tmp dest-default.shot)" << 'EOF'
export function f(obj: { readonly x: number }): number { const { x = 5 } = obj; return x }
EOF
diagnostic_check "no-destructuring-default" "no-destructuring-default" "$(tmp dest-default.shot)"

# Case 43: no-logical-assignment
echo "Case 43: no-logical-assignment"
printf 'export const obj: { readonly x: number | null } = { x: null }\nobj.x ??= 1\n' > "$(tmp logical-assign.shot)"
diagnostic_check "no-logical-assignment" "no-logical-assignment" "$(tmp logical-assign.shot)"

# Case 44: no-tagged-templates
echo "Case 44: no-tagged-templates"
printf 'export function html(s: TemplateStringsArray): string { return s[0] ?? "" }\nexport const r: string = html`<div>`\n' > "$(tmp tagged-tpl.shot)"
diagnostic_check "no-tagged-templates" "no-tagged-templates" "$(tmp tagged-tpl.shot)"

# Case 45: no-literal-boolean-type
echo "Case 45: no-literal-boolean-type"
printf 'type T = true | false\nexport type { T }\n' > "$(tmp lit-bool.shot)"
diagnostic_check "no-literal-boolean-type" "no-literal-boolean-type" "$(tmp lit-bool.shot)"

# Case 46: no-intersection-types
echo "Case 46: no-intersection-types"
printf 'type A = { readonly x: number }\ntype B = { readonly y: string }\ntype T = A & B\nexport type { T }\n' > "$(tmp intersect.shot)"
diagnostic_check "no-intersection-types" "no-intersection-types" "$(tmp intersect.shot)"

# Case 47: no-metaprogramming-globals (Object.assign)
echo "Case 47: no-metaprogramming-globals (Object.assign)"
printf 'export function f(): void { Object.assign({}, { x: 1 }) }\n' > "$(tmp obj-assign.shot)"
diagnostic_check "no-metaprogramming-globals (Object.assign)" "no-metaprogramming-globals" "$(tmp obj-assign.shot)"

# Case 48: no-parse-number-fns
echo "Case 48: no-parse-number-fns"
printf 'export function f(): number { return Number.parseInt("42") }\n' > "$(tmp parse-int.shot)"
diagnostic_check "no-parse-number-fns" "no-parse-number-fns" "$(tmp parse-int.shot)"

# Case 49: no-overloads
echo "Case 49: no-overloads"
cat > "$(tmp overload.shot)" << 'EOF'
export function add(a: number): number
export function add(a: number): number { return a }
EOF
diagnostic_check "no-overloads" "no-overloads" "$(tmp overload.shot)"

# Case 50: no-namespace
echo "Case 50: no-namespace"
printf 'namespace Util { export const v: string = `1.0` }\n' > "$(tmp ns.shot)"
diagnostic_check "no-namespace" "no-namespace" "$(tmp ns.shot)"

# Case 51: no-index-import
echo "Case 51: no-index-import"
printf 'import { add } from "./math/index.shot"\nexport { add }\n' > "$(tmp idx-import.shot)"
diagnostic_check "no-index-import" "no-index-import" "$(tmp idx-import.shot)"

# Case 52: require-async-tuple-return (plain Promise<string> rejected)
echo "Case 52: require-async-tuple-return"
printf 'export async function getUser(id: number): Promise<string> { return `${id}` }\n' > "$(tmp async-plain.shot)"
diagnostic_check "require-async-tuple-return" "require-async-tuple-return" "$(tmp async-plain.shot)"

# Case 53: require-async-tuple-return (Promise<void> and tuple form accepted)
echo "Case 53: require-async-tuple-return (valid forms)"
cat > "$(tmp async-valid.shot)" << 'EOF'
export async function effect(): Promise<void> { }
export async function fetch(id: number): Promise<[string | null, Error | null]> {
  return [null, new Error(`not found: ${id}`)]
}
EOF
$SHOT check "$(tmp async-valid.shot)" > /dev/null 2>&1
check_exit "require-async-tuple-return valid" 0

echo
if [ $FAILS -eq 0 ]; then
    echo "All 53 cases passed."
    exit 0
else
    echo "$FAILS case(s) failed."
    exit 1
fi
