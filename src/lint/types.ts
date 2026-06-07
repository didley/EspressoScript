import type ts from 'typescript'

/** A single rule violation reported by the checker. */
export type Diagnostic = {
    readonly file: string
    readonly line: number
    readonly col: number
    readonly rule: string
    readonly message: string
}

/** Shared context passed to every rule's `visit` function. */
export type Context = {
    readonly file: string
    readonly source: string
    readonly sourceFile: ts.SourceFile
    readonly typeChecker: ts.TypeChecker | undefined
    push(d: Omit<Diagnostic, 'file'>): void
}

/** A single ShotScript lint rule. */
export type Rule = {
    readonly name: string
    visit(node: ts.Node, ctx: Context): void
}
