import ts from 'typescript'
import type { Rule } from '../types.js'
import { defineSyntaxRule } from './_define.js'

export const noThrow: Rule = defineSyntaxRule({
    name: 'no-throw',
    match: ts.isThrowStatement,
    message: '`throw` is not allowed. Return `[T, Error | null]` tuples.',
})
