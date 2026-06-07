import ts from 'typescript'
import type { Rule } from '../types.js'
import { defineSyntaxRule } from './_define.js'

export const noDoWhile: Rule = defineSyntaxRule({
    name: 'no-do-while',
    match: ts.isDoStatement,
    message: '`do...while` is not allowed. Use `while`.',
})
