import ts from 'typescript'
import type { Rule } from '../types.js'
import { defineSyntaxRule } from './_define.js'

export const noDelete: Rule = defineSyntaxRule({
    name: 'no-delete',
    match: ts.isDeleteExpression,
    message: '`delete` is not allowed.',
})
