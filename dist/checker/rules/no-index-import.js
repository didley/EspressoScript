import ts from "typescript";
import { posOf } from "../pos.js";
const INDEX_SUFFIXES = ["/index.ts", "/index.tsx", "/index.js", "/index.mjs", "/index.cjs"];
function isIndexPath(spec) {
    return INDEX_SUFFIXES.some(function isSuffix(s) { return spec.endsWith(s); })
        || /\/index$/.test(spec);
}
function check(spec, node, ctx) {
    if (!isIndexPath(spec))
        return;
    ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-index-import", message: `Importing index files is not allowed. Import the specific module file instead (e.g. "./dir/module.ts").` });
}
export const noIndexImport = {
    name: "no-index-import",
    visit(node, ctx) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            check(node.moduleSpecifier.text, node.moduleSpecifier, ctx);
        }
        else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            check(node.moduleSpecifier.text, node.moduleSpecifier, ctx);
        }
    },
};
//# sourceMappingURL=no-index-import.js.map