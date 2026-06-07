import ts from "typescript";
import { posOf } from "../pos.js";
const BANNED = new Set([
    "Partial", "Required", "Record", "InstanceType", "ConstructorParameters",
    "ThisType", "Generator", "GeneratorFunction", "AsyncGenerator",
    "AsyncGeneratorFunction", "ClassDecorator", "MethodDecorator",
    "PropertyDecorator", "ParameterDecorator",
]);
export const noBannedUtilityTypes = {
    name: "no-banned-utility-types",
    visit(node, ctx) {
        if (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has(node.typeName.escapedText)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-banned-utility-types", message: "This utility type is banned. See `docs/LANGUAGE.md` for the canonical form." });
        }
    },
};
//# sourceMappingURL=no-banned-utility-types.js.map