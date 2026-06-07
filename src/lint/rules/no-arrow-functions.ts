import ts from 'typescript'
import type { Rule } from '../types.js'
import { defineSyntaxRule } from './_define.js'

export const noArrowFunctions: Rule = defineSyntaxRule({
    name: 'no-arrow-functions',
    match: ts.isArrowFunction,
    message: 'Arrow functions are not allowed. Use the `function` keyword.',
})
