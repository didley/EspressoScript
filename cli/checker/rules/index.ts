import type { Rule } from "../types.ts"
import { noArrowFunctions } from "../../../lint/src/checker/rules/no-arrow-functions.ts"
import { noLetOutsideFor } from "../../../lint/src/checker/rules/no-let-outside-for.ts"
import { noVar } from "../../../lint/src/checker/rules/no-var.ts"
import { noIncrementDecrement } from "../../../lint/src/checker/rules/no-increment-decrement.ts"
import { noUnaryPlus } from "../../../lint/src/checker/rules/no-unary-plus.ts"
import { noThrow } from "../../../lint/src/checker/rules/no-throw.ts"
import { noTry } from "../../../lint/src/checker/rules/no-try.ts"
import { noPromiseChain } from "../../../lint/src/checker/rules/no-promise-chain.ts"
import { noPromise } from "../../../lint/src/checker/rules/no-promise.ts"
import { noLooseEquality } from "../../../lint/src/checker/rules/no-loose-equality.ts"
import { noAndShorthand } from "../../../lint/src/checker/rules/no-and-shorthand.ts"
import { noDoubleBang } from "../../../lint/src/checker/rules/no-double-bang.ts"
import { noTernary } from "../../../lint/src/checker/rules/no-ternary.ts"
import { noBitwise } from "../../../lint/src/checker/rules/no-bitwise.ts"
import { noDelete } from "../../../lint/src/checker/rules/no-delete.ts"
import { noIn } from "../../../lint/src/checker/rules/no-in.ts"
import { noCommaOperator } from "../../../lint/src/checker/rules/no-comma-operator.ts"
import { noArguments } from "../../../lint/src/checker/rules/no-arguments.ts"
import { noGenerators } from "../../../lint/src/checker/rules/no-generators.ts"
import { noEval } from "../../../lint/src/checker/rules/no-eval.ts"
import { noForIn } from "../../../lint/src/checker/rules/no-for-in.ts"
import { switchNoFallthrough } from "../../../lint/src/checker/rules/switch-no-fallthrough.ts"
import { noRequire } from "../../../lint/src/checker/rules/no-require.ts"
import { noDefaultExport } from "../../../lint/src/checker/rules/no-default-export.ts"
import { noParseNumberFns } from "../../../lint/src/checker/rules/no-parse-number-fns.ts"
import { noMultiVarDecl } from "../../../lint/src/checker/rules/no-multi-var-decl.ts"
import { noShadow } from "../../../lint/src/checker/rules/no-shadow.ts"
import { noParamReassign } from "../../../lint/src/checker/rules/no-param-reassign.ts"
import { noMultiAssign } from "../../../lint/src/checker/rules/no-multi-assign.ts"
import { noReturnAssign } from "../../../lint/src/checker/rules/no-return-assign.ts"
import { noSelfAssign } from "../../../lint/src/checker/rules/no-self-assign.ts"
import { noSelfCompare } from "../../../lint/src/checker/rules/no-self-compare.ts"
import { noEmpty } from "../../../lint/src/checker/rules/no-empty.ts"
import { noLoneBlocks } from "../../../lint/src/checker/rules/no-lone-blocks.ts"
import { noEmptyPattern } from "../../../lint/src/checker/rules/no-empty-pattern.ts"
import { noUselessRename } from "../../../lint/src/checker/rules/no-useless-rename.ts"
import { noUselessReturn } from "../../../lint/src/checker/rules/no-useless-return.ts"
import { noUselessConcat } from "../../../lint/src/checker/rules/no-useless-concat.ts"
import { noUselessComputedKey } from "../../../lint/src/checker/rules/no-useless-computed-key.ts"
import { noUselessEmptyExport } from "../../../lint/src/checker/rules/no-useless-empty-export.ts"
import { noLoopFunc } from "../../../lint/src/checker/rules/no-loop-func.ts"
import { noNewWrappers } from "../../../lint/src/checker/rules/no-new-wrappers.ts"
import { noUnusedExpressions } from "../../../lint/src/checker/rules/no-unused-expressions.ts"
import { noVoid } from "../../../lint/src/checker/rules/no-void.ts"
import { preferTemplate } from "../../../lint/src/checker/rules/prefer-template.ts"
import { requireNamedFunctions } from "../../../lint/src/checker/rules/require-named-functions.ts"
import { noDoWhile } from "../../../lint/src/checker/rules/no-do-while.ts"
import { noLabels } from "../../../lint/src/checker/rules/no-labels.ts"
import { noDestructuringDefault } from "../../../lint/src/checker/rules/no-destructuring-default.ts"
import { noLogicalAssignment } from "../../../lint/src/checker/rules/no-logical-assignment.ts"
import { noTaggedTemplates } from "../../../lint/src/checker/rules/no-tagged-templates.ts"
import { noThrowingGlobals } from "../../../lint/src/checker/rules/no-throwing-globals.ts"
import { noNewUserTypes } from "../../../lint/src/checker/rules/no-new-user-types.ts"
import { importsAllowlist } from "./imports-allowlist.ts"
import { noIndexImport } from "../../../lint/src/checker/rules/no-index-import.ts"
import { noOverloads } from "../../../lint/src/checker/rules/no-overloads.ts"
import { noNamespace } from "../../../lint/src/checker/rules/no-namespace.ts"
// T04 type rules
import { noAny } from "../../../lint/src/checker/rules/no-any.ts"
import { noAssertion } from "../../../lint/src/checker/rules/no-assertion.ts"
import { noNonNull } from "../../../lint/src/checker/rules/no-non-null.ts"
import { noTsComment } from "../../../lint/src/checker/rules/no-ts-comment.ts"
import { noInterface } from "../../../lint/src/checker/rules/no-interface.ts"
import { noEnum } from "../../../lint/src/checker/rules/no-enum.ts"
import { noConditionalType } from "../../../lint/src/checker/rules/no-conditional-type.ts"
import { noMappedType } from "../../../lint/src/checker/rules/no-mapped-type.ts"
import { noTemplateLiteralType } from "../../../lint/src/checker/rules/no-template-literal-type.ts"
import { noInfer } from "../../../lint/src/checker/rules/no-infer.ts"
import { noClass } from "../../../lint/src/checker/rules/no-class.ts"
import { noAbstract } from "../../../lint/src/checker/rules/no-abstract.ts"
import { noDecorators } from "../../../lint/src/checker/rules/no-decorators.ts"
import { noThis } from "../../../lint/src/checker/rules/no-this.ts"
import { noUndefinedType } from "../../../lint/src/checker/rules/no-undefined-type.ts"
import { noOptionalProperty } from "../../../lint/src/checker/rules/no-optional-property.ts"
import { noOptionalParameter } from "../../../lint/src/checker/rules/no-optional-parameter.ts"
import { noDefaultParameter } from "../../../lint/src/checker/rules/no-default-parameter.ts"
import { noEmptyObjectType } from "../../../lint/src/checker/rules/no-empty-object-type.ts"
import { noObjectType } from "../../../lint/src/checker/rules/no-object-type.ts"
import { noFunctionType } from "../../../lint/src/checker/rules/no-function-type.ts"
import { requireReadonlyProperty } from "../../../lint/src/checker/rules/require-readonly-property.ts"
import { requireReadonlyArrays } from "../../../lint/src/checker/rules/require-readonly-arrays.ts"
import { requireExplicitReturnType } from "../../../lint/src/checker/rules/require-explicit-return-type.ts"
import { noSymbolType } from "../../../lint/src/checker/rules/no-symbol-type.ts"
import { noVariadicTuple } from "../../../lint/src/checker/rules/no-variadic-tuple.ts"
import { noArrayGeneric } from "../../../lint/src/checker/rules/no-array-generic.ts"
import { noReadonlyWrapper } from "../../../lint/src/checker/rules/no-readonly-wrapper.ts"
import { noBannedUtilityTypes } from "../../../lint/src/checker/rules/no-banned-utility-types.ts"
import { noIndexSignature } from "../../../lint/src/checker/rules/no-index-signature.ts"
import { noPrimitiveWrapperTypes } from "../../../lint/src/checker/rules/no-primitive-wrapper-types.ts"
import { noConstructorType } from "../../../lint/src/checker/rules/no-constructor-type.ts"
import { noMetaprogrammingGlobals } from "../../../lint/src/checker/rules/no-metaprogramming-globals.ts"
import { noLiteralBooleanType } from "../../../lint/src/checker/rules/no-literal-boolean-type.ts"
import { noIntersectionTypes } from "../../../lint/src/checker/rules/no-intersection-types.ts"
import { requireTupleDestructure } from "../../../lint/src/checker/rules/require-tuple-destructure.ts"
import { requireAsyncTupleReturn } from "../../../lint/src/checker/rules/require-async-tuple-return.ts"

export const rules: Rule[] = [
    noArrowFunctions,
    noLetOutsideFor,
    noVar,
    noIncrementDecrement,
    noUnaryPlus,
    noThrow,
    noTry,
    noPromiseChain,
    noPromise,
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
    importsAllowlist,
    noIndexImport,
    noOverloads,
    noNamespace,
    // T04 type rules
    noAny,
    noAssertion,
    noNonNull,
    noTsComment,
    noInterface,
    noEnum,
    noConditionalType,
    noMappedType,
    noTemplateLiteralType,
    noInfer,
    noClass,
    noAbstract,
    noDecorators,
    noThis,
    noUndefinedType,
    noOptionalProperty,
    noOptionalParameter,
    noDefaultParameter,
    noEmptyObjectType,
    noObjectType,
    noFunctionType,
    requireReadonlyProperty,
    requireReadonlyArrays,
    requireExplicitReturnType,
    noSymbolType,
    noVariadicTuple,
    noArrayGeneric,
    noReadonlyWrapper,
    noBannedUtilityTypes,
    noIndexSignature,
    noPrimitiveWrapperTypes,
    noConstructorType,
    noMetaprogrammingGlobals,
    noLiteralBooleanType,
    noIntersectionTypes,
    requireTupleDestructure,
    requireAsyncTupleReturn,
]
