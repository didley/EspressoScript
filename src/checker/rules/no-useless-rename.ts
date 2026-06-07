import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noUselessRename: Rule = {
    name: "no-useless-rename",
    visit(node, ctx) {
        if (ts.isImportSpecifier(node)) {
            if (node.propertyName && node.propertyName.text === node.name.text) {
                const pos = posOf(ctx.sourceFile, node)
                ctx.push({ ...pos, rule: "no-useless-rename", message: "Useless rename — drop the alias." })
            }
        } else if (ts.isExportSpecifier(node)) {
            if (node.propertyName && node.propertyName.text === node.name.text) {
                const pos = posOf(ctx.sourceFile, node)
                ctx.push({ ...pos, rule: "no-useless-rename", message: "Useless rename — drop the alias." })
            }
        } else if (ts.isBindingElement(node)) {
            const propName = node.propertyName
            if (propName && ts.isIdentifier(propName) && ts.isIdentifier(node.name)) {
                if (propName.text === node.name.text) {
                    const pos = posOf(ctx.sourceFile, node)
                    ctx.push({ ...pos, rule: "no-useless-rename", message: "Useless rename — drop the alias." })
                }
            }
        }
    },
}
