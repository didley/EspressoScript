import type ts from "typescript"

export type Diagnostic = {
    file: string
    line: number
    col: number
    rule: string
    message: string
}

export type Context = {
    file: string
    source: string
    sourceFile: ts.SourceFile
    typeChecker: ts.TypeChecker | undefined
    push(d: Omit<Diagnostic, "file">): void
}

export type Rule = {
    name: string
    visit(node: ts.Node, ctx: Context): void
}
