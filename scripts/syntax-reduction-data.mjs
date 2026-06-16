/**
 * syntax-reduction-data.mjs — ShotScript syntax-reduction source of truth
 *
 * Two exports:
 *
 *   REDUCTION_DATA   — every "decision category" (a thing a developer needs to
 *                      express in TypeScript) with ts/ss counts used to compute
 *                      the headline reduction percentage: (Σts − Σss) / Σts
 *
 *   SYNTAX_FEATURES  — every individual TypeScript syntax form, each tagged
 *                      allowed/banned and what to use instead.  Drives the
 *                      feature grid on site/lint/index.html#syntax-reduction.
 *
 * Run:  node scripts/syntax-reduction-data.mjs
 *
 * Both datasets are also embedded inline in the relevant HTML files for the
 * live site. When you update a category here, mirror the change in:
 *   REDUCTION_DATA  → site/index.html (inline <script>)
 *   SYNTAX_FEATURES → site/lint/index.html (inline <script>)
 */

export const REDUCTION_DATA = [
    {
        id: 'variable-declaration',
        label: 'Variable declaration',
        forms: 'var · let (general) · const',
        permitted: 'const (let only inside for headers)',
        rules: ['no-var', 'no-let-outside-for'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'function-syntax',
        label: 'Function syntax',
        forms: 'arrow fn · named declaration · anonymous expression · method shorthand · generator',
        permitted: 'named declaration',
        rules: ['no-arrow-functions', 'require-named-functions', 'no-generators'],
        ts: 5,
        ss: 1,
    },
    {
        id: 'error-handling',
        label: 'Error-handling patterns',
        forms: 'throw + catch · .then/.catch chain · rejected Promise · error-first callback · return tuple',
        permitted: 'PromiseResult<T> return tuple',
        rules: ['no-throw', 'no-try', 'no-promise-chain', 'require-async-tuple-return', 'require-tuple-destructure'],
        ts: 5,
        ss: 1,
    },
    {
        id: 'expressing-nothing',
        label: 'Expressing absence / nothing',
        forms: 'optional property ? · | undefined · | null · default parameter',
        permitted: '| null',
        rules: ['no-undefined-type', 'no-optional-property', 'no-optional-parameter', 'no-default-parameter'],
        ts: 4,
        ss: 1,
    },
    {
        id: 'type-definition',
        label: 'Type shape definition',
        forms: 'type alias · interface · class',
        permitted: 'type alias',
        rules: ['no-interface', 'no-class'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'type-composition',
        label: 'Type composition',
        forms: 'flat inline · intersection & · interface extends · class extends/implements · embed by value',
        permitted: 'embed by value (nested fields)',
        rules: ['no-intersection-types', 'no-interface', 'no-class'],
        ts: 5,
        ss: 1,
    },
    {
        id: 'async-sequencing',
        label: 'Async sequencing',
        forms: '.then/.catch chains · async/await + try/catch · async/await + tuple destructure',
        permitted: 'async/await + tuple destructure',
        rules: ['no-promise-chain', 'no-try', 'require-tuple-destructure'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'conditional-branching',
        label: 'Conditional / branching expression',
        forms: 'if/else · ternary ?: · && short-circuit · || default · ?? nullish · ??= logical assign',
        permitted: 'if/else (and switch with no-fallthrough)',
        rules: ['no-ternary', 'no-and-shorthand', 'no-logical-assignment'],
        ts: 6,
        ss: 1,
    },
    {
        id: 'loop-constructs',
        label: 'Loop constructs',
        forms: 'for · for-in · for-of · while · do-while · labelled break/continue',
        permitted: 'for · for-of · while',
        rules: ['no-for-in', 'no-do-while', 'no-labels'],
        ts: 6,
        ss: 3,
    },
    {
        id: 'boolean-coercion',
        label: 'Boolean coercion',
        forms: '!! · Boolean() · ternary ? true : false',
        permitted: 'Boolean()',
        rules: ['no-double-bang'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'number-coercion',
        label: 'Number coercion / parsing',
        forms: 'parseInt · parseFloat · Number() · unary +',
        permitted: 'Number()',
        rules: ['no-parse-number-fns', 'no-unary-plus'],
        ts: 4,
        ss: 1,
    },
    {
        id: 'string-concatenation',
        label: 'String concatenation',
        forms: '+ operator · template literal',
        permitted: 'template literal',
        rules: ['prefer-template'],
        ts: 2,
        ss: 1,
    },
    {
        id: 'object-merging',
        label: 'Object merging / update',
        forms: 'Object.assign · spread { ...a, ...b } · in-place mutation + delete',
        permitted: 'spread',
        rules: ['no-object-assign', 'no-delete', 'no-mutating-array-methods'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'type-safety-escapes',
        label: 'Type-safety escape hatches',
        forms: 'as T · <T>value · ! non-null · @ts-ignore · @ts-expect-error · @ts-nocheck',
        permitted: 'none — all banned',
        rules: ['no-assertion', 'no-non-null', 'no-ts-comment'],
        ts: 6,
        ss: 0,
    },
    {
        id: 'export-style',
        label: 'Export style',
        forms: 'default export · named export · export * re-export',
        permitted: 'named export',
        rules: ['no-default-export', 'no-export-star'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'module-syntax',
        label: 'Module syntax',
        forms: 'require() · static import · dynamic import()',
        permitted: 'static import',
        rules: ['no-require', 'no-dynamic-import'],
        ts: 3,
        ss: 1,
    },
    {
        id: 'increment-decrement',
        label: 'Increment / decrement',
        forms: '++ · -- · += n · -= n',
        permitted: '+= n · -= n',
        rules: ['no-increment-decrement'],
        ts: 4,
        ss: 2,
    },
    {
        id: 'array-mutation',
        label: 'In-place array mutation methods',
        forms: 'sort · reverse · splice · push · pop · shift · unshift · fill · copyWithin',
        permitted: 'none — use immutable equivalents (toSorted, toReversed, toSpliced, with, spread)',
        rules: ['no-mutating-array-methods'],
        ts: 9,
        ss: 0,
    },
    {
        id: 'oop-constructs',
        label: 'OOP constructs',
        forms: 'class · constructor · this · extends · abstract · decorators · new (user types)',
        permitted: 'none — all banned',
        rules: ['no-class', 'no-this', 'no-abstract', 'no-decorators', 'no-new-user-types'],
        ts: 7,
        ss: 0,
    },
    {
        id: 'advanced-types',
        label: 'Advanced type-system features',
        forms: 'conditional types · mapped types · template literal types · infer · variadic tuples · index signatures',
        permitted: 'none — all banned',
        rules: ['no-conditional-type', 'no-mapped-type', 'no-template-literal-type', 'no-infer', 'no-variadic-tuple', 'no-index-signature'],
        ts: 6,
        ss: 0,
    },
    {
        id: 'equality-operators',
        label: 'Equality operators',
        forms: '== · != · === · !==',
        permitted: '=== · !==',
        rules: ['no-loose-equality'],
        ts: 4,
        ss: 2,
    },
    {
        id: 'legacy-globals',
        label: 'Legacy / unsafe globals',
        forms: 'eval · arguments · isNaN (global) · isFinite (global) · hasOwnProperty (method)',
        permitted: 'none — use Number.isNaN, Number.isFinite, Object.hasOwn',
        rules: ['no-eval', 'no-arguments', 'no-restricted-globals', 'no-prototype-method-call'],
        ts: 5,
        ss: 0,
    },
]

export const SYNTAX_FEATURES = [
    // ── Variable declaration ──────────────────────────────────────────────────
    { syntax: 'var', name: 'var', category: 'Variable declaration', allowed: false, replacedBy: 'const' },
    { syntax: 'let', name: 'let', category: 'Variable declaration', allowed: false, replacedBy: 'const (or let inside for headers)' },
    { syntax: 'const', name: 'const', category: 'Variable declaration', allowed: true, replacedBy: null },
    // ── Function syntax ───────────────────────────────────────────────────────
    { syntax: '() => {}', name: 'arrow function', category: 'Function syntax', allowed: false, replacedBy: 'function f() {}' },
    { syntax: 'function f()', name: 'named declaration', category: 'Function syntax', allowed: true, replacedBy: null },
    { syntax: 'const f = function()', name: 'anonymous expression', category: 'Function syntax', allowed: false, replacedBy: 'function f() {}' },
    { syntax: '{ f() {} }', name: 'method shorthand', category: 'Function syntax', allowed: false, replacedBy: 'function f() {}' },
    { syntax: 'function*()', name: 'generator', category: 'Function syntax', allowed: false, replacedBy: null },
    // ── Error handling ────────────────────────────────────────────────────────
    { syntax: 'throw', name: 'throw', category: 'Error handling', allowed: false, replacedBy: 'PromiseResult<T>' },
    { syntax: 'try / catch', name: 'try/catch', category: 'Error handling', allowed: false, replacedBy: 'PromiseResult<T>' },
    { syntax: 'Promise.reject()', name: 'rejected Promise', category: 'Error handling', allowed: false, replacedBy: 'PromiseResult<T>' },
    { syntax: 'cb(err, val)', name: 'error-first callback', category: 'Error handling', allowed: false, replacedBy: 'PromiseResult<T>' },
    { syntax: '[val, err]', name: 'return tuple', category: 'Error handling', allowed: true, replacedBy: null },
    // ── Expressing nothing ────────────────────────────────────────────────────
    { syntax: 'prop?: T', name: 'optional property', category: 'Expressing nothing', allowed: false, replacedBy: 'T | null' },
    { syntax: 'T | undefined', name: '| undefined', category: 'Expressing nothing', allowed: false, replacedBy: 'T | null' },
    { syntax: 'T | null', name: '| null', category: 'Expressing nothing', allowed: true, replacedBy: null },
    { syntax: 'f(x = val)', name: 'default parameter', category: 'Expressing nothing', allowed: false, replacedBy: 'T | null' },
    // ── Type shape definition ─────────────────────────────────────────────────
    { syntax: 'interface T {}', name: 'interface', category: 'Type shape definition', allowed: false, replacedBy: 'type T = {}' },
    { syntax: 'type T = {}', name: 'type alias', category: 'Type shape definition', allowed: true, replacedBy: null },
    { syntax: 'class C {}', name: 'class (type shape)', category: 'Type shape definition', allowed: false, replacedBy: 'type T = {}' },
    // ── Type composition ──────────────────────────────────────────────────────
    { syntax: '{ ...A, b: B }', name: 'flat inline', category: 'Type composition', allowed: false, replacedBy: '{ base: A }' },
    { syntax: 'A & B', name: 'intersection &', category: 'Type composition', allowed: false, replacedBy: '{ base: A, ext: B }' },
    { syntax: 'interface A extends B', name: 'interface extends', category: 'Type composition', allowed: false, replacedBy: '{ base: B }' },
    { syntax: 'class A extends B', name: 'class extends', category: 'Type composition', allowed: false, replacedBy: '{ base: B }' },
    { syntax: '{ base: A }', name: 'embed by value', category: 'Type composition', allowed: true, replacedBy: null },
    // ── Async sequencing ──────────────────────────────────────────────────────
    { syntax: '.then().catch()', name: '.then/.catch chain', category: 'Async sequencing', allowed: false, replacedBy: 'async/await + [v, e] = await f()' },
    { syntax: 'await + try/catch', name: 'async/await + try/catch', category: 'Async sequencing', allowed: false, replacedBy: 'async/await + [v, e] = await f()' },
    { syntax: '[v, e] = await f()', name: 'async/await + tuple', category: 'Async sequencing', allowed: true, replacedBy: null },
    // ── Conditional branching ─────────────────────────────────────────────────
    { syntax: 'if / else', name: 'if/else', category: 'Conditional branching', allowed: true, replacedBy: null },
    { syntax: 'x ? a : b', name: 'ternary', category: 'Conditional branching', allowed: false, replacedBy: 'if / else' },
    { syntax: 'x && y', name: '&& short-circuit', category: 'Conditional branching', allowed: false, replacedBy: 'if / else' },
    { syntax: 'x || y', name: '|| default', category: 'Conditional branching', allowed: false, replacedBy: 'if / else' },
    { syntax: 'x ?? y', name: '?? nullish', category: 'Conditional branching', allowed: false, replacedBy: 'if / else' },
    { syntax: 'x ??= y', name: '??= logical assign', category: 'Conditional branching', allowed: false, replacedBy: 'if / else' },
    // ── Loop constructs ───────────────────────────────────────────────────────
    { syntax: 'for (;;)', name: 'for', category: 'Loop constructs', allowed: true, replacedBy: null },
    { syntax: 'for (k in obj)', name: 'for-in', category: 'Loop constructs', allowed: false, replacedBy: 'for (x of xs)' },
    { syntax: 'for (x of xs)', name: 'for-of', category: 'Loop constructs', allowed: true, replacedBy: null },
    { syntax: 'while (cond)', name: 'while', category: 'Loop constructs', allowed: true, replacedBy: null },
    { syntax: 'do {} while', name: 'do-while', category: 'Loop constructs', allowed: false, replacedBy: 'while (cond)' },
    { syntax: 'label: for', name: 'labelled break/continue', category: 'Loop constructs', allowed: false, replacedBy: null },
    // ── Boolean coercion ──────────────────────────────────────────────────────
    { syntax: '!!x', name: 'double negation', category: 'Boolean coercion', allowed: false, replacedBy: 'Boolean(x)' },
    { syntax: 'Boolean(x)', name: 'Boolean()', category: 'Boolean coercion', allowed: true, replacedBy: null },
    { syntax: 'x ? true : false', name: 'ternary coerce', category: 'Boolean coercion', allowed: false, replacedBy: 'Boolean(x)' },
    // ── Number coercion ───────────────────────────────────────────────────────
    { syntax: 'parseInt(s)', name: 'parseInt', category: 'Number coercion', allowed: false, replacedBy: 'Number(s)' },
    { syntax: 'parseFloat(s)', name: 'parseFloat', category: 'Number coercion', allowed: false, replacedBy: 'Number(s)' },
    { syntax: 'Number(s)', name: 'Number()', category: 'Number coercion', allowed: true, replacedBy: null },
    { syntax: '+s', name: 'unary +', category: 'Number coercion', allowed: false, replacedBy: 'Number(s)' },
    // ── String concatenation ──────────────────────────────────────────────────
    { syntax: '"a" + "b"', name: '+ operator', category: 'String concatenation', allowed: false, replacedBy: '`${a}${b}`' },
    { syntax: '`${a}${b}`', name: 'template literal', category: 'String concatenation', allowed: true, replacedBy: null },
    // ── Object merging ────────────────────────────────────────────────────────
    { syntax: 'Object.assign()', name: 'Object.assign', category: 'Object merging', allowed: false, replacedBy: '{ ...a, ...b }' },
    { syntax: '{ ...a, ...b }', name: 'spread', category: 'Object merging', allowed: true, replacedBy: null },
    { syntax: 'obj.x = y', name: 'mutation + delete', category: 'Object merging', allowed: false, replacedBy: '{ ...obj, x: y }' },
    // ── Type-safety escapes ───────────────────────────────────────────────────
    { syntax: 'x as T', name: 'type assertion', category: 'Type-safety escapes', allowed: false, replacedBy: null },
    { syntax: '<T>x', name: 'angle bracket cast', category: 'Type-safety escapes', allowed: false, replacedBy: null },
    { syntax: 'x!', name: 'non-null assertion', category: 'Type-safety escapes', allowed: false, replacedBy: null },
    { syntax: '// @ts-ignore', name: '@ts-ignore', category: 'Type-safety escapes', allowed: false, replacedBy: null },
    { syntax: '// @ts-expect-error', name: '@ts-expect-error', category: 'Type-safety escapes', allowed: false, replacedBy: null },
    { syntax: '// @ts-nocheck', name: '@ts-nocheck', category: 'Type-safety escapes', allowed: false, replacedBy: null },
    // ── Export style ──────────────────────────────────────────────────────────
    { syntax: 'export default', name: 'default export', category: 'Export style', allowed: false, replacedBy: 'export { name }' },
    { syntax: 'export { name }', name: 'named export', category: 'Export style', allowed: true, replacedBy: null },
    { syntax: 'export * from', name: 're-export *', category: 'Export style', allowed: false, replacedBy: 'export { name }' },
    // ── Module syntax ─────────────────────────────────────────────────────────
    { syntax: 'require()', name: 'require', category: 'Module syntax', allowed: false, replacedBy: 'import x from' },
    { syntax: 'import x from', name: 'static import', category: 'Module syntax', allowed: true, replacedBy: null },
    { syntax: 'import()', name: 'dynamic import', category: 'Module syntax', allowed: false, replacedBy: 'import x from' },
    // ── Increment / decrement ─────────────────────────────────────────────────
    { syntax: 'x++', name: 'increment ++', category: 'Increment / decrement', allowed: false, replacedBy: 'x += 1' },
    { syntax: 'x--', name: 'decrement --', category: 'Increment / decrement', allowed: false, replacedBy: 'x -= 1' },
    { syntax: 'x += n', name: '+= n', category: 'Increment / decrement', allowed: true, replacedBy: null },
    { syntax: 'x -= n', name: '-= n', category: 'Increment / decrement', allowed: true, replacedBy: null },
    // ── Array mutation ────────────────────────────────────────────────────────
    { syntax: 'arr.sort()', name: '.sort()', category: 'Array mutation', allowed: false, replacedBy: 'arr.toSorted()' },
    { syntax: 'arr.reverse()', name: '.reverse()', category: 'Array mutation', allowed: false, replacedBy: 'arr.toReversed()' },
    { syntax: 'arr.splice()', name: '.splice()', category: 'Array mutation', allowed: false, replacedBy: 'arr.toSpliced()' },
    { syntax: 'arr.push(x)', name: '.push()', category: 'Array mutation', allowed: false, replacedBy: '[...arr, x]' },
    { syntax: 'arr.pop()', name: '.pop()', category: 'Array mutation', allowed: false, replacedBy: 'arr.slice(0, -1)' },
    { syntax: 'arr.shift()', name: '.shift()', category: 'Array mutation', allowed: false, replacedBy: 'arr.slice(1)' },
    { syntax: 'arr.unshift(x)', name: '.unshift()', category: 'Array mutation', allowed: false, replacedBy: '[x, ...arr]' },
    { syntax: 'arr.fill(x)', name: '.fill()', category: 'Array mutation', allowed: false, replacedBy: 'Array.from()' },
    { syntax: 'arr.copyWithin()', name: '.copyWithin()', category: 'Array mutation', allowed: false, replacedBy: null },
    // ── OOP constructs ────────────────────────────────────────────────────────
    { syntax: 'class C {}', name: 'class', category: 'OOP constructs', allowed: false, replacedBy: 'type T = {}' },
    { syntax: 'constructor()', name: 'constructor', category: 'OOP constructs', allowed: false, replacedBy: 'factory function' },
    { syntax: 'this.x', name: 'this', category: 'OOP constructs', allowed: false, replacedBy: 'explicit parameters' },
    { syntax: 'extends', name: 'extends', category: 'OOP constructs', allowed: false, replacedBy: '{ base: Parent }' },
    { syntax: 'abstract class', name: 'abstract', category: 'OOP constructs', allowed: false, replacedBy: 'type + function' },
    { syntax: '@Decorator', name: 'decorators', category: 'OOP constructs', allowed: false, replacedBy: null },
    { syntax: 'new MyClass()', name: 'new (user types)', category: 'OOP constructs', allowed: false, replacedBy: 'factory function' },
    // ── Advanced types ────────────────────────────────────────────────────────
    { syntax: 'T extends U ? A : B', name: 'conditional type', category: 'Advanced types', allowed: false, replacedBy: null },
    { syntax: '{ [K in T]: V }', name: 'mapped type', category: 'Advanced types', allowed: false, replacedBy: null },
    { syntax: '`${T}Suffix`', name: 'template literal type', category: 'Advanced types', allowed: false, replacedBy: 'union type' },
    { syntax: 'infer T', name: 'infer', category: 'Advanced types', allowed: false, replacedBy: null },
    { syntax: '[...T, U]', name: 'variadic tuple', category: 'Advanced types', allowed: false, replacedBy: 'explicit tuple' },
    { syntax: '{ [key: string]: T }', name: 'index signature', category: 'Advanced types', allowed: false, replacedBy: 'Map<string, T>' },
    // ── Equality operators ────────────────────────────────────────────────────
    { syntax: 'x == y', name: 'loose ==', category: 'Equality operators', allowed: false, replacedBy: 'x === y' },
    { syntax: 'x != y', name: 'loose !=', category: 'Equality operators', allowed: false, replacedBy: 'x !== y' },
    { syntax: 'x === y', name: 'strict ===', category: 'Equality operators', allowed: true, replacedBy: null },
    { syntax: 'x !== y', name: 'strict !==', category: 'Equality operators', allowed: true, replacedBy: null },
    // ── Legacy globals ────────────────────────────────────────────────────────
    { syntax: 'eval()', name: 'eval', category: 'Legacy globals', allowed: false, replacedBy: null },
    { syntax: 'arguments', name: 'arguments object', category: 'Legacy globals', allowed: false, replacedBy: 'named parameters' },
    { syntax: 'isNaN(x)', name: 'global isNaN', category: 'Legacy globals', allowed: false, replacedBy: 'Number.isNaN(x)' },
    { syntax: 'isFinite(x)', name: 'global isFinite', category: 'Legacy globals', allowed: false, replacedBy: 'Number.isFinite(x)' },
    { syntax: '.hasOwnProperty()', name: 'hasOwnProperty', category: 'Legacy globals', allowed: false, replacedBy: 'Object.hasOwn()' },
]

export function computeReduction(data) {
    const tsTotal = data.reduce((n, c) => n + c.ts, 0)
    const ssTotal = data.reduce((n, c) => n + c.ss, 0)
    const removed = tsTotal - ssTotal
    const pct = Math.round((removed / tsTotal) * 100)
    return { tsTotal, ssTotal, removed, pct }
}

// ── CLI output ─────────────────────────────────────────────────────────────────
// Run: node scripts/syntax-reduction-data.mjs

const { tsTotal, ssTotal, removed, pct } = computeReduction(REDUCTION_DATA)

const PAD_LABEL = 38
const PAD_N = 4

console.log('\nShotScript — syntax reduction methodology\n')
console.log(
    'Category'.padEnd(PAD_LABEL) +
    'TS forms'.padStart(PAD_N) +
    'SS forms'.padStart(PAD_N) +
    'Removed'.padStart(PAD_N)
)
console.log('─'.repeat(PAD_LABEL + PAD_N * 3))

for (const c of REDUCTION_DATA) {
    const r = c.ts - c.ss
    console.log(
        c.label.padEnd(PAD_LABEL) +
        String(c.ts).padStart(PAD_N) +
        String(c.ss).padStart(PAD_N) +
        String(r).padStart(PAD_N)
    )
}

console.log('─'.repeat(PAD_LABEL + PAD_N * 3))
console.log(
    'TOTAL'.padEnd(PAD_LABEL) +
    String(tsTotal).padStart(PAD_N) +
    String(ssTotal).padStart(PAD_N) +
    String(removed).padStart(PAD_N)
)
console.log(`\nReduction: ${removed} / ${tsTotal} = ${pct}%\n`)
