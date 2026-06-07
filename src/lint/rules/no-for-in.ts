import ts from 'typescript'
import type { Rule } from '../types.js'
import { defineSyntaxRule } from './_define.js'

export const noForIn: Rule = defineSyntaxRule({
    name: 'no-for-in',
    match: ts.isForInStatement,
    message: '`for...in` is not allowed. Use `for...of` or indexed `for`.',
})
