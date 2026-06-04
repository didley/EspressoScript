import type { Rule } from "../types.ts"
import { noArrowFunctions } from "./no-arrow-functions.ts"
import { noLetOutsideFor } from "./no-let-outside-for.ts"
import { noVar } from "./no-var.ts"
import { noIncrementDecrement } from "./no-increment-decrement.ts"
import { noUnaryPlus } from "./no-unary-plus.ts"
import { noThrow } from "./no-throw.ts"
import { noTry } from "./no-try.ts"
import { noPromiseChain } from "./no-promise-chain.ts"
import { noLooseEquality } from "./no-loose-equality.ts"
import { noAndShorthand } from "./no-and-shorthand.ts"
import { noDoubleBang } from "./no-double-bang.ts"
import { noTernary } from "./no-ternary.ts"
import { noBitwise } from "./no-bitwise.ts"
import { noDelete } from "./no-delete.ts"
import { noIn } from "./no-in.ts"
import { noCommaOperator } from "./no-comma-operator.ts"
import { noArguments } from "./no-arguments.ts"
import { noGenerators } from "./no-generators.ts"
import { noEval } from "./no-eval.ts"
import { noForIn } from "./no-for-in.ts"
import { switchNoFallthrough } from "./switch-no-fallthrough.ts"
import { noRequire } from "./no-require.ts"
import { noDefaultExport } from "./no-default-export.ts"
import { noParseNumberFns } from "./no-parse-number-fns.ts"
import { noMultiVarDecl } from "./no-multi-var-decl.ts"
import { noShadow } from "./no-shadow.ts"
import { noParamReassign } from "./no-param-reassign.ts"
import { noMultiAssign } from "./no-multi-assign.ts"
import { noReturnAssign } from "./no-return-assign.ts"
import { noSelfAssign } from "./no-self-assign.ts"
import { noSelfCompare } from "./no-self-compare.ts"
import { noEmpty } from "./no-empty.ts"
import { noLoneBlocks } from "./no-lone-blocks.ts"
import { noEmptyPattern } from "./no-empty-pattern.ts"
import { noUselessRename } from "./no-useless-rename.ts"
import { noUselessReturn } from "./no-useless-return.ts"
import { noUselessConcat } from "./no-useless-concat.ts"
import { noUselessComputedKey } from "./no-useless-computed-key.ts"
import { noUselessEmptyExport } from "./no-useless-empty-export.ts"
import { noLoopFunc } from "./no-loop-func.ts"
import { noNewWrappers } from "./no-new-wrappers.ts"
import { noUnusedExpressions } from "./no-unused-expressions.ts"
import { noVoid } from "./no-void.ts"
import { preferTemplate } from "./prefer-template.ts"
import { requireNamedFunctions } from "./require-named-functions.ts"
import { noDoWhile } from "./no-do-while.ts"
import { noLabels } from "./no-labels.ts"
import { noDestructuringDefault } from "./no-destructuring-default.ts"
import { noLogicalAssignment } from "./no-logical-assignment.ts"
import { noTaggedTemplates } from "./no-tagged-templates.ts"
import { noThrowingGlobals } from "./no-throwing-globals.ts"
import { noNewUserTypes } from "./no-new-user-types.ts"

export const rules: Rule[] = [
    noArrowFunctions,
    noLetOutsideFor,
    noVar,
    noIncrementDecrement,
    noUnaryPlus,
    noThrow,
    noTry,
    noPromiseChain,
    noLooseEquality,
    noAndShorthand,
    noDoubleBang,
    noTernary,
    noBitwise,
    noDelete,
    noIn,
    noCommaOperator,
    noArguments,
    noGenerators,
    noEval,
    noForIn,
    switchNoFallthrough,
    noRequire,
    noDefaultExport,
    noParseNumberFns,
    noMultiVarDecl,
    noShadow,
    noParamReassign,
    noMultiAssign,
    noReturnAssign,
    noSelfAssign,
    noSelfCompare,
    noEmpty,
    noLoneBlocks,
    noEmptyPattern,
    noUselessRename,
    noUselessReturn,
    noUselessConcat,
    noUselessComputedKey,
    noUselessEmptyExport,
    noLoopFunc,
    noNewWrappers,
    noUnusedExpressions,
    noVoid,
    preferTemplate,
    requireNamedFunctions,
    noDoWhile,
    noLabels,
    noDestructuringDefault,
    noLogicalAssignment,
    noTaggedTemplates,
    noThrowingGlobals,
    noNewUserTypes,
]
