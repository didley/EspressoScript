import type ts from 'typescript'

/** Returns the 1-based line and column of a node's start position. */
export function posOf(sourceFile: ts.SourceFile, node: ts.Node): { readonly line: number; readonly col: number } {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    return { line: line + 1, col: character + 1 }
}
