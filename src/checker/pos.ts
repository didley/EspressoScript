import type ts from "typescript"

export function posOf(sourceFile: ts.SourceFile, node: ts.Node): { line: number; col: number } {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    return { line: line + 1, col: character + 1 }
}
