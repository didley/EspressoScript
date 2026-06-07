import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const MUTABLE_TO_READONLY: ReadonlyMap<string, string> = new Map([
    ['Map', 'ReadonlyMap'],
    ['Set', 'ReadonlySet'],
])

/** `Map<K, V>` and `Set<T>` in type positions must be `ReadonlyMap<K, V>` and `ReadonlySet<T>`. */
export const requireReadonlyCollections: Rule = {
    name: 'require-readonly-collections',
    visit(node, ctx): void {
        if (!ts.isTypeReferenceNode(node)) return
        const name = node.typeName
        if (!ts.isIdentifier(name)) return
        const readonly = MUTABLE_TO_READONLY.get(name.text)
        if (readonly === undefined) return
        ctx.push({
            ...posOf(ctx.sourceFile, node),
            rule: 'require-readonly-collections',
            message: `Use \`${readonly}\` instead of \`${name.text}\` in type positions — collection types must be readonly.`,
        })
    },
}
