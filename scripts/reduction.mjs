/**
 * reduction.mjs — ShotScript syntax-reduction methodology
 *
 * Defines every "decision category" — a thing a developer needs to express in
 * TypeScript — and counts:
 *   ts  — how many valid TypeScript syntax forms exist for that category
 *   ss  — how many ShotScript permits (after lint rules are applied)
 *
 * The headline percentage is: (Σts − Σss) / Σts
 *
 * Run:  node scripts/reduction.mjs
 * The same data is embedded inline in site/index.html for the live site.
 * When you update a category here, mirror the change in the REDUCTION_DATA
 * array inside site/index.html.
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

export function computeReduction(data) {
    const tsTotal = data.reduce((n, c) => n + c.ts, 0)
    const ssTotal = data.reduce((n, c) => n + c.ss, 0)
    const removed = tsTotal - ssTotal
    const pct = Math.round((removed / tsTotal) * 100)
    return { tsTotal, ssTotal, removed, pct }
}

// ── CLI output ─────────────────────────────────────────────────────────────────

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
