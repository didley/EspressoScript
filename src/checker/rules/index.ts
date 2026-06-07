import type { Rule } from "../types.js"
import { noArrowFunctions } from "./no-arrow-functions.js"
import { noLetOutsideFor } from "./no-let-outside-for.js"
import { noVar } from "./no-var.js"
import { noIncrementDecrement } from "./no-increment-decrement.js"
import { noUnaryPlus } from "./no-unary-plus.js"
import { noThrow } from "./no-throw.js"
import { noTry } from "./no-try.js"
import { noPromiseChain } from "./no-promise-chain.js"
import { noPromise } from "./no-promise.js"
import { noLooseEquality } from "./no-loose-equality.js"
import { noAndShorthand } from "./no-and-shorthand.js"
import { noDoubleBang } from "./no-double-bang.js"
import { noTernary } from "./no-ternary.js"
import { noBitwise } from "./no-bitwise.js"
import { noDelete } from "./no-delete.js"
import { noIn } from "./no-in.js"
import { noCommaOperator } from "./no-comma-operator.js"
import { noArguments } from "./no-arguments.js"
import { noGenerators } from "./no-generators.js"
import { noEval } from "./no-eval.js"
import { noForIn } from "./no-for-in.js"
import { switchNoFallthrough } from "./switch-no-fallthrough.js"
import { noRequire } from "./no-require.js"
import { noDefaultExport } from "./no-default-export.js"
import { noParseNumberFns } from "./no-parse-number-fns.js"
import { noMultiVarDecl } from "./no-multi-var-decl.js"
import { noShadow } from "./no-shadow.js"
import { noParamReassign } from "./no-param-reassign.js"
import { noMultiAssign } from "./no-multi-assign.js"
import { noReturnAssign } from "./no-return-assign.js"
import { noSelfAssign } from "./no-self-assign.js"
import { noSelfCompare } from "./no-self-compare.js"
import { noEmpty } from "./no-empty.js"
import { noLoneBlocks } from "./no-lone-blocks.js"
import { noEmptyPattern } from "./no-empty-pattern.js"
import { noUselessRename } from "./no-useless-rename.js"
import { noUselessReturn } from "./no-useless-return.js"
import { noUselessConcat } from "./no-useless-concat.js"
import { noUselessComputedKey } from "./no-useless-computed-key.js"
import { noUselessEmptyExport } from "./no-useless-empty-export.js"
import { noLoopFunc } from "./no-loop-func.js"
import { noNewWrappers } from "./no-new-wrappers.js"
import { noUnusedExpressions } from "./no-unused-expressions.js"
import { noVoid } from "./no-void.js"
import { preferTemplate } from "./prefer-template.js"
import { requireNamedFunctions } from "./require-named-functions.js"
import { noDoWhile } from "./no-do-while.js"
import { noLabels } from "./no-labels.js"
import { noDestructuringDefault } from "./no-destructuring-default.js"
import { noLogicalAssignment } from "./no-logical-assignment.js"
import { noTaggedTemplates } from "./no-tagged-templates.js"
import { noThrowingGlobals } from "./no-throwing-globals.js"
import { noNewUserTypes } from "./no-new-user-types.js"
import { noIndexImport } from "./no-index-import.js"
import { noOverloads } from "./no-overloads.js"
import { noNamespace } from "./no-namespace.js"
// T04 type rules
import { noAny } from "./no-any.js"
import { noAssertion } from "./no-assertion.js"
import { noNonNull } from "./no-non-null.js"
import { noTsComment } from "./no-ts-comment.js"
import { noInterface } from "./no-interface.js"
import { noEnum } from "./no-enum.js"
import { noConditionalType } from "./no-conditional-type.js"
import { noMappedType } from "./no-mapped-type.js"
import { noTemplateLiteralType } from "./no-template-literal-type.js"
import { noInfer } from "./no-infer.js"
import { noClass } from "./no-class.js"
import { noAbstract } from "./no-abstract.js"
import { noDecorators } from "./no-decorators.js"
import { noThis } from "./no-this.js"
import { noUndefinedType } from "./no-undefined-type.js"
import { noOptionalProperty } from "./no-optional-property.js"
import { noOptionalParameter } from "./no-optional-parameter.js"
import { noDefaultParameter } from "./no-default-parameter.js"
import { noEmptyObjectType } from "./no-empty-object-type.js"
import { noObjectType } from "./no-object-type.js"
import { noFunctionType } from "./no-function-type.js"
import { requireReadonlyProperty } from "./require-readonly-property.js"
import { requireReadonlyArrays } from "./require-readonly-arrays.js"
import { requireExplicitReturnType } from "./require-explicit-return-type.js"
import { noSymbolType } from "./no-symbol-type.js"
import { noVariadicTuple } from "./no-variadic-tuple.js"
import { noArrayGeneric } from "./no-array-generic.js"
import { noReadonlyWrapper } from "./no-readonly-wrapper.js"
import { noBannedUtilityTypes } from "./no-banned-utility-types.js"
import { noIndexSignature } from "./no-index-signature.js"
import { noPrimitiveWrapperTypes } from "./no-primitive-wrapper-types.js"
import { noConstructorType } from "./no-constructor-type.js"
import { noMetaprogrammingGlobals } from "./no-metaprogramming-globals.js"
import { noLiteralBooleanType } from "./no-literal-boolean-type.js"
import { noIntersectionTypes } from "./no-intersection-types.js"
import { requireTupleDestructure } from "./require-tuple-destructure.js"
import { requireAsyncTupleReturn } from "./require-async-tuple-return.js"
import { noFloatingPromises } from "./no-floating-promises.js"

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
    noFloatingPromises,
]
