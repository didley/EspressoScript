export function posOf(sourceFile, node) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    return { line: line + 1, col: character + 1 };
}
//# sourceMappingURL=pos.js.map