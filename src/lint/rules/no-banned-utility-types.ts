import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const BANNED = new Set([
    'Partial', 'Required', 'Record', 'InstanceType', 'ConstructorParameters',
    'ThisType', 'Generator', 'GeneratorFunction', 'AsyncGenerator',
    'AsyncGeneratorFunction', 'ClassDecorator', 'MethodDecorator',
    'PropertyDecorator', 'ParameterDecorator',
])

/** This utility type is banned. See `shotscript.dev/lint/` for the canonical form. */
export const noBannedUtilityTypes: Rule = {
    name: 'no-banned-utility-types',
    visit(node, ctx): void {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has(node.typeName.text)
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-banned-utility-types', message: 'This utility type is banned. See `shotscript.dev/lint/` for the canonical form.' })
        }
    },
}
