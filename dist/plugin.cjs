"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugin.ts
var plugin_exports = {};
__export(plugin_exports, {
  default: () => plugin_default
});
module.exports = __toCommonJS(plugin_exports);

// src/checker/index.ts
var import_typescript95 = __toESM(require("typescript"), 1);

// src/checker/rules/no-arrow-functions.ts
var import_typescript = __toESM(require("typescript"), 1);

// src/checker/pos.ts
function posOf(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return { line: line + 1, col: character + 1 };
}

// src/checker/rules/no-arrow-functions.ts
var noArrowFunctions = {
  name: "no-arrow-functions",
  visit(node, ctx) {
    if (!import_typescript.default.isArrowFunction(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-arrow-functions", message: "Arrow functions are not allowed. Use the `function` keyword." });
  }
};

// src/checker/rules/no-let-outside-for.ts
var import_typescript2 = __toESM(require("typescript"), 1);
var noLetOutsideFor = {
  name: "no-let-outside-for",
  visit(node, ctx) {
    if (!import_typescript2.default.isVariableStatement(node)) return;
    if ((node.declarationList.flags & import_typescript2.default.NodeFlags.Let) === 0) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-let-outside-for", message: "`let` is only allowed in a `for` header. Use `const`." });
  }
};

// src/checker/rules/no-var.ts
var import_typescript3 = __toESM(require("typescript"), 1);
var noVar = {
  name: "no-var",
  visit(node, ctx) {
    if (!import_typescript3.default.isVariableDeclarationList(node)) return;
    if ((node.flags & (import_typescript3.default.NodeFlags.Let | import_typescript3.default.NodeFlags.Const)) !== 0) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-var", message: "`var` is not allowed. Use `const`." });
  }
};

// src/checker/rules/no-increment-decrement.ts
var import_typescript4 = __toESM(require("typescript"), 1);
var noIncrementDecrement = {
  name: "no-increment-decrement",
  visit(node, ctx) {
    if (import_typescript4.default.isPostfixUnaryExpression(node)) {
      const op = node.operator;
      if (op === import_typescript4.default.SyntaxKind.PlusPlusToken || op === import_typescript4.default.SyntaxKind.MinusMinusToken) {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-increment-decrement", message: "`++` and `--` are not allowed. Use `+= 1` or `-= 1`." });
      }
    } else if (import_typescript4.default.isPrefixUnaryExpression(node)) {
      const op = node.operator;
      if (op === import_typescript4.default.SyntaxKind.PlusPlusToken || op === import_typescript4.default.SyntaxKind.MinusMinusToken) {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-increment-decrement", message: "`++` and `--` are not allowed. Use `+= 1` or `-= 1`." });
      }
    }
  }
};

// src/checker/rules/no-unary-plus.ts
var import_typescript5 = __toESM(require("typescript"), 1);
var noUnaryPlus = {
  name: "no-unary-plus",
  visit(node, ctx) {
    if (!import_typescript5.default.isPrefixUnaryExpression(node)) return;
    if (node.operator !== import_typescript5.default.SyntaxKind.PlusToken) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-unary-plus", message: "Unary `+` coercion is not allowed. Use `Number()`." });
  }
};

// src/checker/rules/no-throw.ts
var import_typescript6 = __toESM(require("typescript"), 1);
var noThrow = {
  name: "no-throw",
  visit(node, ctx) {
    if (!import_typescript6.default.isThrowStatement(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-throw", message: "`throw` is not allowed. Return `[T, Error | null]` tuples." });
  }
};

// src/checker/rules/no-try.ts
var import_typescript7 = __toESM(require("typescript"), 1);
var noTry = {
  name: "no-try",
  visit(node, ctx) {
    if (!import_typescript7.default.isTryStatement(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-try", message: "`try`/`catch`/`finally` is not allowed." });
  }
};

// src/checker/rules/no-promise-chain.ts
var import_typescript8 = __toESM(require("typescript"), 1);
var CHAIN_METHODS = /* @__PURE__ */ new Set(["then", "catch", "finally"]);
var noPromiseChain = {
  name: "no-promise-chain",
  visit(node, ctx) {
    if (!import_typescript8.default.isCallExpression(node)) return;
    const expr = node.expression;
    if (!import_typescript8.default.isPropertyAccessExpression(expr)) return;
    if (!CHAIN_METHODS.has(expr.name.text)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-promise-chain", message: "Promise chains are not allowed. Use `async`/`await`." });
  }
};

// src/checker/rules/no-promise.ts
var import_typescript9 = __toESM(require("typescript"), 1);
var PROMISE_STATIC_METHODS = /* @__PURE__ */ new Set([
  "resolve",
  "reject",
  "all",
  "allSettled",
  "race",
  "any"
]);
var noPromise = {
  name: "no-promise",
  visit(node, ctx) {
    if (import_typescript9.default.isNewExpression(node) && import_typescript9.default.isIdentifier(node.expression) && node.expression.text === "Promise") {
      ctx.push({
        ...posOf(ctx.sourceFile, node),
        rule: "no-promise",
        message: `new Promise() is not allowed. Use toPromiseResult(() => externalFn()) to wrap external Promise-returning functions.`
      });
      return;
    }
    if (import_typescript9.default.isCallExpression(node) && import_typescript9.default.isPropertyAccessExpression(node.expression) && import_typescript9.default.isIdentifier(node.expression.expression) && node.expression.expression.text === "Promise" && import_typescript9.default.isIdentifier(node.expression.name) && PROMISE_STATIC_METHODS.has(node.expression.name.text)) {
      ctx.push({
        ...posOf(ctx.sourceFile, node),
        rule: "no-promise",
        message: `Promise.${node.expression.name.text}() is not allowed. Use toPromiseResult(() => externalFn()) to wrap external Promise-returning functions.`
      });
    }
  }
};

// src/checker/rules/no-loose-equality.ts
var import_typescript10 = __toESM(require("typescript"), 1);
var noLooseEquality = {
  name: "no-loose-equality",
  visit(node, ctx) {
    if (!import_typescript10.default.isBinaryExpression(node)) return;
    const op = node.operatorToken.kind;
    if (op !== import_typescript10.default.SyntaxKind.EqualsEqualsToken && op !== import_typescript10.default.SyntaxKind.ExclamationEqualsToken) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-loose-equality", message: "Loose equality is not allowed. Use `===` / `!==`." });
  }
};

// src/checker/rules/no-and-shorthand.ts
var import_typescript11 = __toESM(require("typescript"), 1);
var noAndShorthand = {
  name: "no-and-shorthand",
  visit(node, ctx) {
    if (!import_typescript11.default.isExpressionStatement(node)) return;
    const expr = node.expression;
    if (!import_typescript11.default.isBinaryExpression(expr)) return;
    if (expr.operatorToken.kind !== import_typescript11.default.SyntaxKind.AmpersandAmpersandToken) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-and-shorthand", message: "Don't use `&&` as conditional execution. Use an `if` block." });
  }
};

// src/checker/rules/no-double-bang.ts
var import_typescript12 = __toESM(require("typescript"), 1);
var noDoubleBang = {
  name: "no-double-bang",
  visit(node, ctx) {
    if (!import_typescript12.default.isPrefixUnaryExpression(node)) return;
    if (node.operator !== import_typescript12.default.SyntaxKind.ExclamationToken) return;
    const operand = node.operand;
    if (!import_typescript12.default.isPrefixUnaryExpression(operand)) return;
    if (operand.operator !== import_typescript12.default.SyntaxKind.ExclamationToken) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-double-bang", message: "`!!` is not allowed. Use `Boolean()`." });
  }
};

// src/checker/rules/no-ternary.ts
var import_typescript13 = __toESM(require("typescript"), 1);
var noTernary = {
  name: "no-ternary",
  visit(node, ctx) {
    if (!import_typescript13.default.isConditionalExpression(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-ternary", message: "Ternary expressions are not allowed. Use a named function." });
  }
};

// src/checker/rules/no-bitwise.ts
var import_typescript14 = __toESM(require("typescript"), 1);
var BITWISE_BINARY = /* @__PURE__ */ new Set([
  import_typescript14.default.SyntaxKind.AmpersandToken,
  import_typescript14.default.SyntaxKind.BarToken,
  import_typescript14.default.SyntaxKind.CaretToken,
  import_typescript14.default.SyntaxKind.LessThanLessThanToken,
  import_typescript14.default.SyntaxKind.GreaterThanGreaterThanToken,
  import_typescript14.default.SyntaxKind.GreaterThanGreaterThanGreaterThanToken,
  import_typescript14.default.SyntaxKind.AmpersandEqualsToken,
  import_typescript14.default.SyntaxKind.BarEqualsToken,
  import_typescript14.default.SyntaxKind.CaretEqualsToken,
  import_typescript14.default.SyntaxKind.LessThanLessThanEqualsToken,
  import_typescript14.default.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  import_typescript14.default.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken
]);
var noBitwise = {
  name: "no-bitwise",
  visit(node, ctx) {
    if (import_typescript14.default.isBinaryExpression(node) && BITWISE_BINARY.has(node.operatorToken.kind)) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-bitwise", message: "Bitwise operators are not allowed." });
    } else if (import_typescript14.default.isPrefixUnaryExpression(node) && node.operator === import_typescript14.default.SyntaxKind.TildeToken) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-bitwise", message: "Bitwise operators are not allowed." });
    }
  }
};

// src/checker/rules/no-delete.ts
var import_typescript15 = __toESM(require("typescript"), 1);
var noDelete = {
  name: "no-delete",
  visit(node, ctx) {
    if (!import_typescript15.default.isDeleteExpression(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-delete", message: "`delete` is not allowed." });
  }
};

// src/checker/rules/no-in.ts
var import_typescript16 = __toESM(require("typescript"), 1);
var noIn = {
  name: "no-in",
  visit(node, ctx) {
    if (!import_typescript16.default.isBinaryExpression(node)) return;
    if (node.operatorToken.kind !== import_typescript16.default.SyntaxKind.InKeyword) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-in", message: "`in` operator is not allowed." });
  }
};

// src/checker/rules/no-comma-operator.ts
var import_typescript17 = __toESM(require("typescript"), 1);
var noCommaOperator = {
  name: "no-comma-operator",
  visit(node, ctx) {
    if (!import_typescript17.default.isBinaryExpression(node)) return;
    if (node.operatorToken.kind !== import_typescript17.default.SyntaxKind.CommaToken) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-comma-operator", message: "Comma operator is not allowed." });
  }
};

// src/checker/rules/no-arguments.ts
var import_typescript18 = __toESM(require("typescript"), 1);
function isBindingPosition(node) {
  const parent = node.parent;
  if (!parent) return false;
  if (import_typescript18.default.isVariableDeclaration(parent) && parent.name === node) return true;
  if (import_typescript18.default.isParameter(parent) && parent.name === node) return true;
  if (import_typescript18.default.isBindingElement(parent) && parent.name === node) return true;
  if (import_typescript18.default.isFunctionDeclaration(parent) && parent.name === node) return true;
  if (import_typescript18.default.isFunctionExpression(parent) && parent.name === node) return true;
  if (import_typescript18.default.isPropertyAssignment(parent) && parent.name === node) return true;
  return false;
}
var noArguments = {
  name: "no-arguments",
  visit(node, ctx) {
    if (!import_typescript18.default.isIdentifier(node)) return;
    if (node.text !== "arguments") return;
    if (isBindingPosition(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-arguments", message: "`arguments` is not allowed. Use rest params `...args`." });
  }
};

// src/checker/rules/no-generators.ts
var import_typescript19 = __toESM(require("typescript"), 1);
var noGenerators = {
  name: "no-generators",
  visit(node, ctx) {
    if ((import_typescript19.default.isFunctionDeclaration(node) || import_typescript19.default.isFunctionExpression(node) || import_typescript19.default.isMethodDeclaration(node)) && node.asteriskToken !== void 0) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-generators", message: "Generators are not allowed." });
    } else if (import_typescript19.default.isYieldExpression(node)) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-generators", message: "Generators are not allowed." });
    }
  }
};

// src/checker/rules/no-eval.ts
var import_typescript20 = __toESM(require("typescript"), 1);
var noEval = {
  name: "no-eval",
  visit(node, ctx) {
    if (!import_typescript20.default.isCallExpression(node)) return;
    const expr = node.expression;
    if (!import_typescript20.default.isIdentifier(expr)) return;
    if (expr.text !== "eval") return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-eval", message: "`eval` is not allowed." });
  }
};

// src/checker/rules/no-for-in.ts
var import_typescript21 = __toESM(require("typescript"), 1);
var noForIn = {
  name: "no-for-in",
  visit(node, ctx) {
    if (!import_typescript21.default.isForInStatement(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-for-in", message: "`for...in` is not allowed. Use `for...of` or indexed `for`." });
  }
};

// src/checker/rules/switch-no-fallthrough.ts
var import_typescript22 = __toESM(require("typescript"), 1);
var TERMINATORS = /* @__PURE__ */ new Set([
  import_typescript22.default.SyntaxKind.BreakStatement,
  import_typescript22.default.SyntaxKind.ReturnStatement,
  import_typescript22.default.SyntaxKind.ThrowStatement,
  import_typescript22.default.SyntaxKind.ContinueStatement
]);
var switchNoFallthrough = {
  name: "switch-no-fallthrough",
  visit(node, ctx) {
    if (!import_typescript22.default.isCaseClause(node)) return;
    if (node.statements.length === 0) return;
    const last = node.statements[node.statements.length - 1];
    if (TERMINATORS.has(last.kind)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "switch-no-fallthrough", message: "Switch case must end with `break` or `return`." });
  }
};

// src/checker/rules/no-require.ts
var import_typescript23 = __toESM(require("typescript"), 1);
var noRequire = {
  name: "no-require",
  visit(node, ctx) {
    if (!import_typescript23.default.isCallExpression(node)) return;
    const expr = node.expression;
    if (!import_typescript23.default.isIdentifier(expr)) return;
    if (expr.text !== "require") return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-require", message: "`require()` is not allowed. Use ESM `import`." });
  }
};

// src/checker/rules/no-default-export.ts
var import_typescript24 = __toESM(require("typescript"), 1);
var noDefaultExport = {
  name: "no-default-export",
  visit(node, ctx) {
    if (!import_typescript24.default.isExportAssignment(node)) return;
    if (node.isExportEquals) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-default-export", message: "Default exports are not allowed. Use named exports." });
  }
};

// src/checker/rules/no-parse-number-fns.ts
var import_typescript25 = __toESM(require("typescript"), 1);
function isParseNumberCall(node) {
  const expr = node.expression;
  if (import_typescript25.default.isIdentifier(expr)) {
    return expr.text === "parseInt" || expr.text === "parseFloat";
  }
  if (import_typescript25.default.isPropertyAccessExpression(expr)) {
    const obj = expr.expression;
    const name = expr.name.text;
    if (import_typescript25.default.isIdentifier(obj) && obj.text === "Number") {
      return name === "parseInt" || name === "parseFloat";
    }
  }
  return false;
}
var noParseNumberFns = {
  name: "no-parse-number-fns",
  visit(node, ctx) {
    if (!import_typescript25.default.isCallExpression(node)) return;
    if (!isParseNumberCall(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-parse-number-fns", message: "Use `Number()` instead of `parseInt` / `parseFloat`." });
  }
};

// src/checker/rules/no-multi-var-decl.ts
var import_typescript26 = __toESM(require("typescript"), 1);
var noMultiVarDecl = {
  name: "no-multi-var-decl",
  visit(node, ctx) {
    if (!import_typescript26.default.isVariableDeclarationList(node)) return;
    if (node.declarations.length <= 1) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-multi-var-decl", message: "One variable declaration per statement." });
  }
};

// src/checker/rules/no-shadow.ts
var import_typescript27 = __toESM(require("typescript"), 1);
function collectNames(node) {
  if (import_typescript27.default.isIdentifier(node)) return [node.text];
  const names = [];
  for (const elem of node.elements) {
    if (import_typescript27.default.isBindingElement(elem)) names.push(...collectNames(elem.name));
  }
  return names;
}
function isDefinedAbove(scopes, name) {
  for (let i = scopes.length - 2; i >= 0; i--) {
    if (scopes[i].bindings.has(name)) return true;
  }
  return false;
}
function addBinding(scopes, name, declNode, ctx) {
  if (isDefinedAbove(scopes, name)) {
    const pos = posOf(ctx.sourceFile, declNode);
    ctx.push({ ...pos, rule: "no-shadow", message: "Variable shadowing is not allowed. Rename the inner binding." });
  }
  scopes[scopes.length - 1].bindings.set(name, declNode);
}
function walk(node, scopes, ctx) {
  if (import_typescript27.default.isFunctionDeclaration(node)) {
    if (node.name) {
      addBinding(scopes, node.name.text, node.name, ctx);
    }
    const frame = { bindings: /* @__PURE__ */ new Map() };
    scopes.push(frame);
    for (const param of node.parameters) {
      for (const name of collectNames(param.name)) {
        addBinding(scopes, name, param.name, ctx);
      }
    }
    if (node.body) walk(node.body, scopes, ctx);
    scopes.pop();
  } else if (import_typescript27.default.isFunctionExpression(node)) {
    const frame = { bindings: /* @__PURE__ */ new Map() };
    scopes.push(frame);
    if (node.name) {
      frame.bindings.set(node.name.text, node.name);
    }
    for (const param of node.parameters) {
      for (const name of collectNames(param.name)) {
        addBinding(scopes, name, param.name, ctx);
      }
    }
    if (node.body) walk(node.body, scopes, ctx);
    scopes.pop();
  } else if (import_typescript27.default.isArrowFunction(node)) {
    const frame = { bindings: /* @__PURE__ */ new Map() };
    scopes.push(frame);
    for (const param of node.parameters) {
      for (const name of collectNames(param.name)) {
        addBinding(scopes, name, param.name, ctx);
      }
    }
    const body = node.body;
    if (import_typescript27.default.isBlock(body)) {
      walk(body, scopes, ctx);
    } else {
      walk(body, scopes, ctx);
    }
    scopes.pop();
  } else if (import_typescript27.default.isBlock(node)) {
    const parent = node.parent;
    const isFnBody = parent && (import_typescript27.default.isFunctionDeclaration(parent) || import_typescript27.default.isFunctionExpression(parent) || import_typescript27.default.isArrowFunction(parent));
    if (!isFnBody) {
      scopes.push({ bindings: /* @__PURE__ */ new Map() });
    }
    import_typescript27.default.forEachChild(node, (child) => walk(child, scopes, ctx));
    if (!isFnBody) scopes.pop();
  } else if (import_typescript27.default.isVariableDeclaration(node)) {
    for (const name of collectNames(node.name)) {
      addBinding(scopes, name, node.name, ctx);
    }
    if (node.initializer) walk(node.initializer, scopes, ctx);
  } else if (import_typescript27.default.isForStatement(node) || import_typescript27.default.isForOfStatement(node) || import_typescript27.default.isForInStatement(node)) {
    scopes.push({ bindings: /* @__PURE__ */ new Map() });
    import_typescript27.default.forEachChild(node, (child) => walk(child, scopes, ctx));
    scopes.pop();
  } else if (import_typescript27.default.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (clause) {
      if (clause.name) addBinding(scopes, clause.name.text, clause.name, ctx);
      if (clause.namedBindings) {
        if (import_typescript27.default.isNamespaceImport(clause.namedBindings)) {
          addBinding(scopes, clause.namedBindings.name.text, clause.namedBindings.name, ctx);
        } else if (import_typescript27.default.isNamedImports(clause.namedBindings)) {
          for (const spec of clause.namedBindings.elements) {
            addBinding(scopes, spec.name.text, spec.name, ctx);
          }
        }
      }
    }
  } else {
    import_typescript27.default.forEachChild(node, (child) => walk(child, scopes, ctx));
  }
}
var noShadow = {
  name: "no-shadow",
  visit(node, ctx) {
    if (node.kind !== import_typescript27.default.SyntaxKind.SourceFile) return;
    const scopes = [{ bindings: /* @__PURE__ */ new Map() }];
    import_typescript27.default.forEachChild(node, (child) => walk(child, scopes, ctx));
  }
};

// src/checker/rules/no-param-reassign.ts
var import_typescript28 = __toESM(require("typescript"), 1);
var ASSIGN_OPS = /* @__PURE__ */ new Set([
  import_typescript28.default.SyntaxKind.EqualsToken,
  import_typescript28.default.SyntaxKind.PlusEqualsToken,
  import_typescript28.default.SyntaxKind.MinusEqualsToken,
  import_typescript28.default.SyntaxKind.AsteriskEqualsToken,
  import_typescript28.default.SyntaxKind.SlashEqualsToken,
  import_typescript28.default.SyntaxKind.PercentEqualsToken,
  import_typescript28.default.SyntaxKind.AsteriskAsteriskEqualsToken,
  import_typescript28.default.SyntaxKind.AmpersandEqualsToken,
  import_typescript28.default.SyntaxKind.BarEqualsToken,
  import_typescript28.default.SyntaxKind.CaretEqualsToken,
  import_typescript28.default.SyntaxKind.LessThanLessThanEqualsToken,
  import_typescript28.default.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  import_typescript28.default.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken
]);
function collectNames2(node) {
  if (import_typescript28.default.isIdentifier(node)) return [node.text];
  const names = [];
  for (const elem of node.elements) {
    if (import_typescript28.default.isBindingElement(elem)) names.push(...collectNames2(elem.name));
  }
  return names;
}
function isParamInScope(frames, name) {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (frames[i].isFunction) {
      return frames[i].params.has(name);
    }
  }
  return false;
}
function walk2(node, frames, ctx) {
  if (import_typescript28.default.isFunctionDeclaration(node) || import_typescript28.default.isFunctionExpression(node) || import_typescript28.default.isArrowFunction(node)) {
    const fnNode = node;
    const params = /* @__PURE__ */ new Set();
    for (const param of fnNode.parameters) {
      for (const name of collectNames2(param.name)) params.add(name);
    }
    frames.push({ params, isFunction: true });
    const body = node.body;
    if (body) walk2(body, frames, ctx);
    frames.pop();
  } else if (import_typescript28.default.isBinaryExpression(node) && ASSIGN_OPS.has(node.operatorToken.kind)) {
    const lhs = node.left;
    if (import_typescript28.default.isIdentifier(lhs) && isParamInScope(frames, lhs.text)) {
      const pos = posOf(ctx.sourceFile, lhs);
      ctx.push({ ...pos, rule: "no-param-reassign", message: "Function parameters cannot be reassigned. Use a new `const`." });
    }
    walk2(node.right, frames, ctx);
  } else {
    import_typescript28.default.forEachChild(node, (child) => walk2(child, frames, ctx));
  }
}
var noParamReassign = {
  name: "no-param-reassign",
  visit(node, ctx) {
    if (node.kind !== import_typescript28.default.SyntaxKind.SourceFile) return;
    import_typescript28.default.forEachChild(node, (child) => walk2(child, [{ params: /* @__PURE__ */ new Set(), isFunction: false }], ctx));
  }
};

// src/checker/rules/no-multi-assign.ts
var import_typescript29 = __toESM(require("typescript"), 1);
var ASSIGN_OPS2 = /* @__PURE__ */ new Set([
  import_typescript29.default.SyntaxKind.EqualsToken,
  import_typescript29.default.SyntaxKind.PlusEqualsToken,
  import_typescript29.default.SyntaxKind.MinusEqualsToken,
  import_typescript29.default.SyntaxKind.AsteriskEqualsToken,
  import_typescript29.default.SyntaxKind.SlashEqualsToken,
  import_typescript29.default.SyntaxKind.PercentEqualsToken
]);
var noMultiAssign = {
  name: "no-multi-assign",
  visit(node, ctx) {
    if (!import_typescript29.default.isBinaryExpression(node)) return;
    if (node.operatorToken.kind !== import_typescript29.default.SyntaxKind.EqualsToken) return;
    if (!import_typescript29.default.isBinaryExpression(node.right)) return;
    if (!ASSIGN_OPS2.has(node.right.operatorToken.kind)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-multi-assign", message: "Chained assignment (`a = b = c`) is not allowed." });
  }
};

// src/checker/rules/no-return-assign.ts
var import_typescript30 = __toESM(require("typescript"), 1);
var ASSIGN_OPS3 = /* @__PURE__ */ new Set([
  import_typescript30.default.SyntaxKind.EqualsToken,
  import_typescript30.default.SyntaxKind.PlusEqualsToken,
  import_typescript30.default.SyntaxKind.MinusEqualsToken,
  import_typescript30.default.SyntaxKind.AsteriskEqualsToken,
  import_typescript30.default.SyntaxKind.SlashEqualsToken,
  import_typescript30.default.SyntaxKind.PercentEqualsToken
]);
var noReturnAssign = {
  name: "no-return-assign",
  visit(node, ctx) {
    if (!import_typescript30.default.isReturnStatement(node)) return;
    const expr = node.expression;
    if (!expr) return;
    if (!import_typescript30.default.isBinaryExpression(expr)) return;
    if (!ASSIGN_OPS3.has(expr.operatorToken.kind)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-return-assign", message: "Return value cannot be an assignment expression." });
  }
};

// src/checker/rules/no-self-assign.ts
var import_typescript31 = __toESM(require("typescript"), 1);
function nodeText(node, sf) {
  return sf.text.slice(node.getStart(sf), node.getEnd());
}
var noSelfAssign = {
  name: "no-self-assign",
  visit(node, ctx) {
    if (!import_typescript31.default.isBinaryExpression(node)) return;
    if (node.operatorToken.kind !== import_typescript31.default.SyntaxKind.EqualsToken) return;
    const lText = nodeText(node.left, ctx.sourceFile);
    const rText = nodeText(node.right, ctx.sourceFile);
    if (lText !== rText) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-self-assign", message: "Self-assignment has no effect." });
  }
};

// src/checker/rules/no-self-compare.ts
var import_typescript32 = __toESM(require("typescript"), 1);
var CMP_OPS = /* @__PURE__ */ new Set([
  import_typescript32.default.SyntaxKind.EqualsEqualsEqualsToken,
  import_typescript32.default.SyntaxKind.ExclamationEqualsEqualsToken,
  import_typescript32.default.SyntaxKind.EqualsEqualsToken,
  import_typescript32.default.SyntaxKind.ExclamationEqualsToken
]);
function nodeText2(node, sf) {
  return sf.text.slice(node.getStart(sf), node.getEnd());
}
var noSelfCompare = {
  name: "no-self-compare",
  visit(node, ctx) {
    if (!import_typescript32.default.isBinaryExpression(node)) return;
    if (!CMP_OPS.has(node.operatorToken.kind)) return;
    const lText = nodeText2(node.left, ctx.sourceFile);
    const rText = nodeText2(node.right, ctx.sourceFile);
    if (lText !== rText) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-self-compare", message: "Comparing a value to itself is a bug or a NaN-check abuse \u2014 use `Number.isNaN()`." });
  }
};

// src/checker/rules/no-empty.ts
var import_typescript33 = __toESM(require("typescript"), 1);
var noEmpty = {
  name: "no-empty",
  visit(node, ctx) {
    if (!import_typescript33.default.isBlock(node)) return;
    if (node.statements.length !== 0) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-empty", message: "Empty blocks are not allowed." });
  }
};

// src/checker/rules/no-lone-blocks.ts
var import_typescript34 = __toESM(require("typescript"), 1);
var noLoneBlocks = {
  name: "no-lone-blocks",
  visit(node, ctx) {
    if (!import_typescript34.default.isBlock(node)) return;
    const parent = node.parent;
    if (!parent) return;
    const pk = parent.kind;
    if (pk === import_typescript34.default.SyntaxKind.SourceFile || pk === import_typescript34.default.SyntaxKind.Block || pk === import_typescript34.default.SyntaxKind.ModuleBlock) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-lone-blocks", message: "Lone blocks are not allowed." });
    }
  }
};

// src/checker/rules/no-empty-pattern.ts
var import_typescript35 = __toESM(require("typescript"), 1);
var noEmptyPattern = {
  name: "no-empty-pattern",
  visit(node, ctx) {
    if (import_typescript35.default.isObjectBindingPattern(node) && node.elements.length === 0) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-empty-pattern", message: "Empty destructure has no effect." });
    } else if (import_typescript35.default.isArrayBindingPattern(node) && node.elements.length === 0) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-empty-pattern", message: "Empty destructure has no effect." });
    }
  }
};

// src/checker/rules/no-useless-rename.ts
var import_typescript36 = __toESM(require("typescript"), 1);
var noUselessRename = {
  name: "no-useless-rename",
  visit(node, ctx) {
    if (import_typescript36.default.isImportSpecifier(node)) {
      if (node.propertyName && node.propertyName.text === node.name.text) {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-useless-rename", message: "Useless rename \u2014 drop the alias." });
      }
    } else if (import_typescript36.default.isExportSpecifier(node)) {
      if (node.propertyName && node.propertyName.text === node.name.text) {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-useless-rename", message: "Useless rename \u2014 drop the alias." });
      }
    } else if (import_typescript36.default.isBindingElement(node)) {
      const propName = node.propertyName;
      if (propName && import_typescript36.default.isIdentifier(propName) && import_typescript36.default.isIdentifier(node.name)) {
        if (propName.text === node.name.text) {
          const pos = posOf(ctx.sourceFile, node);
          ctx.push({ ...pos, rule: "no-useless-rename", message: "Useless rename \u2014 drop the alias." });
        }
      }
    }
  }
};

// src/checker/rules/no-useless-return.ts
var import_typescript37 = __toESM(require("typescript"), 1);
var FN_KINDS = /* @__PURE__ */ new Set([
  import_typescript37.default.SyntaxKind.FunctionDeclaration,
  import_typescript37.default.SyntaxKind.FunctionExpression,
  import_typescript37.default.SyntaxKind.ArrowFunction,
  import_typescript37.default.SyntaxKind.MethodDeclaration
]);
var noUselessReturn = {
  name: "no-useless-return",
  visit(node, ctx) {
    if (!import_typescript37.default.isReturnStatement(node)) return;
    if (node.expression !== void 0) return;
    const parent = node.parent;
    if (!import_typescript37.default.isBlock(parent)) return;
    const stmts = parent.statements;
    if (stmts.length === 0) return;
    if (stmts[stmts.length - 1] !== node) return;
    const grandParent = parent.parent;
    if (!grandParent || !FN_KINDS.has(grandParent.kind)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-useless-return", message: "Trailing bare `return` is unnecessary." });
  }
};

// src/checker/rules/no-useless-concat.ts
var import_typescript38 = __toESM(require("typescript"), 1);
var noUselessConcat = {
  name: "no-useless-concat",
  visit(node, ctx) {
    if (!import_typescript38.default.isBinaryExpression(node)) return;
    if (node.operatorToken.kind !== import_typescript38.default.SyntaxKind.PlusToken) return;
    if (!import_typescript38.default.isStringLiteral(node.left)) return;
    if (!import_typescript38.default.isStringLiteral(node.right)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-useless-concat", message: "Concatenating string literals \u2014 write a single literal." });
  }
};

// src/checker/rules/no-useless-computed-key.ts
var import_typescript39 = __toESM(require("typescript"), 1);
var IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
var noUselessComputedKey = {
  name: "no-useless-computed-key",
  visit(node, ctx) {
    if (!import_typescript39.default.isComputedPropertyName(node)) return;
    const expr = node.expression;
    if (import_typescript39.default.isStringLiteral(expr) && IDENT_RE.test(expr.text)) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-useless-computed-key", message: "Computed key is unnecessary \u2014 use the identifier form." });
    }
  }
};

// src/checker/rules/no-useless-empty-export.ts
var import_typescript40 = __toESM(require("typescript"), 1);
var noUselessEmptyExport = {
  name: "no-useless-empty-export",
  visit(node, ctx) {
    if (!import_typescript40.default.isExportDeclaration(node)) return;
    const clause = node.exportClause;
    if (!clause) return;
    if (!import_typescript40.default.isNamedExports(clause)) return;
    if (clause.elements.length !== 0) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-useless-empty-export", message: "`export {}` is meaningless under `moduleDetection: force`." });
  }
};

// src/checker/rules/no-loop-func.ts
var import_typescript41 = __toESM(require("typescript"), 1);
var LOOP_KINDS = /* @__PURE__ */ new Set([
  import_typescript41.default.SyntaxKind.ForStatement,
  import_typescript41.default.SyntaxKind.ForOfStatement,
  import_typescript41.default.SyntaxKind.ForInStatement,
  import_typescript41.default.SyntaxKind.WhileStatement,
  import_typescript41.default.SyntaxKind.DoStatement
]);
var FN_KINDS2 = /* @__PURE__ */ new Set([
  import_typescript41.default.SyntaxKind.FunctionDeclaration,
  import_typescript41.default.SyntaxKind.FunctionExpression,
  import_typescript41.default.SyntaxKind.ArrowFunction,
  import_typescript41.default.SyntaxKind.MethodDeclaration
]);
function walk3(node, inLoop, ctx) {
  const isLoop = LOOP_KINDS.has(node.kind);
  const isFn = FN_KINDS2.has(node.kind);
  if (isFn && inLoop) {
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-loop-func", message: "Declaring a function inside a loop closes over the loop variable \u2014 extract it." });
    import_typescript41.default.forEachChild(node, (child) => walk3(child, false, ctx));
    return;
  }
  import_typescript41.default.forEachChild(node, (child) => walk3(child, inLoop || isLoop, ctx));
}
var noLoopFunc = {
  name: "no-loop-func",
  visit(node, ctx) {
    if (node.kind !== import_typescript41.default.SyntaxKind.SourceFile) return;
    import_typescript41.default.forEachChild(node, (child) => walk3(child, false, ctx));
  }
};

// src/checker/rules/no-new-wrappers.ts
var import_typescript42 = __toESM(require("typescript"), 1);
var WRAPPER_TYPES = /* @__PURE__ */ new Set(["String", "Number", "Boolean", "Symbol"]);
var noNewWrappers = {
  name: "no-new-wrappers",
  visit(node, ctx) {
    if (!import_typescript42.default.isNewExpression(node)) return;
    const expr = node.expression;
    if (!import_typescript42.default.isIdentifier(expr)) return;
    if (!WRAPPER_TYPES.has(expr.text)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-new-wrappers", message: "`new String/Number/Boolean/Symbol` creates wrapped primitives \u2014 use the function call form." });
  }
};

// src/checker/rules/no-unused-expressions.ts
var import_typescript43 = __toESM(require("typescript"), 1);
var ASSIGN_OPS4 = /* @__PURE__ */ new Set([
  import_typescript43.default.SyntaxKind.EqualsToken,
  import_typescript43.default.SyntaxKind.PlusEqualsToken,
  import_typescript43.default.SyntaxKind.MinusEqualsToken,
  import_typescript43.default.SyntaxKind.AsteriskEqualsToken,
  import_typescript43.default.SyntaxKind.SlashEqualsToken,
  import_typescript43.default.SyntaxKind.PercentEqualsToken,
  import_typescript43.default.SyntaxKind.AsteriskAsteriskEqualsToken,
  import_typescript43.default.SyntaxKind.AmpersandEqualsToken,
  import_typescript43.default.SyntaxKind.BarEqualsToken,
  import_typescript43.default.SyntaxKind.CaretEqualsToken,
  import_typescript43.default.SyntaxKind.LessThanLessThanEqualsToken,
  import_typescript43.default.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  import_typescript43.default.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  import_typescript43.default.SyntaxKind.BarBarEqualsToken,
  import_typescript43.default.SyntaxKind.AmpersandAmpersandEqualsToken,
  import_typescript43.default.SyntaxKind.QuestionQuestionEqualsToken
]);
var SHORTCIRCUIT_OPS = /* @__PURE__ */ new Set([
  import_typescript43.default.SyntaxKind.AmpersandAmpersandToken,
  import_typescript43.default.SyntaxKind.BarBarToken,
  import_typescript43.default.SyntaxKind.QuestionQuestionToken
]);
function hasNoSideEffect(expr) {
  const k = expr.kind;
  if (k === import_typescript43.default.SyntaxKind.Identifier) return true;
  if (k === import_typescript43.default.SyntaxKind.PropertyAccessExpression) return true;
  if (k === import_typescript43.default.SyntaxKind.ElementAccessExpression) return true;
  if (import_typescript43.default.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (ASSIGN_OPS4.has(op)) return false;
    if (SHORTCIRCUIT_OPS.has(op)) return false;
    return true;
  }
  if (import_typescript43.default.isConditionalExpression(expr)) return true;
  return false;
}
var noUnusedExpressions = {
  name: "no-unused-expressions",
  visit(node, ctx) {
    if (!import_typescript43.default.isExpressionStatement(node)) return;
    if (!hasNoSideEffect(node.expression)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-unused-expressions", message: "Bare expression has no effect." });
  }
};

// src/checker/rules/no-void.ts
var import_typescript44 = __toESM(require("typescript"), 1);
var noVoid = {
  name: "no-void",
  visit(node, ctx) {
    if (!import_typescript44.default.isVoidExpression(node)) return;
    if (import_typescript44.default.isCallExpression(node.expression)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-void", message: "`void` is only allowed to explicitly discard a promise: `void someCall()`. Use `await` or direct assignment instead." });
  }
};

// src/checker/rules/prefer-template.ts
var import_typescript45 = __toESM(require("typescript"), 1);
var VAR_KINDS = /* @__PURE__ */ new Set([
  import_typescript45.default.SyntaxKind.Identifier,
  import_typescript45.default.SyntaxKind.PropertyAccessExpression,
  import_typescript45.default.SyntaxKind.CallExpression
]);
var preferTemplate = {
  name: "prefer-template",
  visit(node, ctx) {
    if (!import_typescript45.default.isBinaryExpression(node)) return;
    if (node.operatorToken.kind !== import_typescript45.default.SyntaxKind.PlusToken) return;
    const left = node.left;
    const right = node.right;
    const leftIsStr = import_typescript45.default.isStringLiteral(left);
    const rightIsStr = import_typescript45.default.isStringLiteral(right);
    const leftIsVar = VAR_KINDS.has(left.kind);
    const rightIsVar = VAR_KINDS.has(right.kind);
    if (!(leftIsStr && rightIsVar || rightIsStr && leftIsVar)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "prefer-template", message: "Use a template literal instead of `+`." });
  }
};

// src/checker/rules/require-named-functions.ts
var import_typescript46 = __toESM(require("typescript"), 1);
var requireNamedFunctions = {
  name: "require-named-functions",
  visit(node, ctx) {
    if (!import_typescript46.default.isFunctionExpression(node)) return;
    if (node.name !== void 0) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "require-named-functions", message: "Function expressions must be named." });
  }
};

// src/checker/rules/no-do-while.ts
var import_typescript47 = __toESM(require("typescript"), 1);
var noDoWhile = {
  name: "no-do-while",
  visit(node, ctx) {
    if (!import_typescript47.default.isDoStatement(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-do-while", message: "`do...while` is not allowed. Use `while`." });
  }
};

// src/checker/rules/no-labels.ts
var import_typescript48 = __toESM(require("typescript"), 1);
var noLabels = {
  name: "no-labels",
  visit(node, ctx) {
    if (import_typescript48.default.isLabeledStatement(node)) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-labels", message: "Labels are not allowed. Extract a function and `return`." });
    } else if (import_typescript48.default.isBreakStatement(node) && node.label !== void 0) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-labels", message: "Labels are not allowed. Extract a function and `return`." });
    } else if (import_typescript48.default.isContinueStatement(node) && node.label !== void 0) {
      const pos = posOf(ctx.sourceFile, node);
      ctx.push({ ...pos, rule: "no-labels", message: "Labels are not allowed. Extract a function and `return`." });
    }
  }
};

// src/checker/rules/no-destructuring-default.ts
var import_typescript49 = __toESM(require("typescript"), 1);
var noDestructuringDefault = {
  name: "no-destructuring-default",
  visit(node, ctx) {
    if (!import_typescript49.default.isBindingElement(node)) return;
    if (node.initializer === void 0) return;
    const parent = node.parent;
    if (!import_typescript49.default.isObjectBindingPattern(parent) && !import_typescript49.default.isArrayBindingPattern(parent)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-destructuring-default", message: "Defaults in destructuring rely on `undefined` (banned sentinel)." });
  }
};

// src/checker/rules/no-logical-assignment.ts
var import_typescript50 = __toESM(require("typescript"), 1);
var LOGICAL_ASSIGN_OPS = /* @__PURE__ */ new Set([
  import_typescript50.default.SyntaxKind.BarBarEqualsToken,
  import_typescript50.default.SyntaxKind.AmpersandAmpersandEqualsToken,
  import_typescript50.default.SyntaxKind.QuestionQuestionEqualsToken
]);
var noLogicalAssignment = {
  name: "no-logical-assignment",
  visit(node, ctx) {
    if (!import_typescript50.default.isBinaryExpression(node)) return;
    if (!LOGICAL_ASSIGN_OPS.has(node.operatorToken.kind)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-logical-assignment", message: "Logical assignment is not allowed. Spell it out." });
  }
};

// src/checker/rules/no-tagged-templates.ts
var import_typescript51 = __toESM(require("typescript"), 1);
var noTaggedTemplates = {
  name: "no-tagged-templates",
  visit(node, ctx) {
    if (!import_typescript51.default.isTaggedTemplateExpression(node)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-tagged-templates", message: "Tagged template literals are not allowed." });
  }
};

// src/checker/rules/no-throwing-globals.ts
var import_typescript52 = __toESM(require("typescript"), 1);
var BANNED_MEMBERS = /* @__PURE__ */ new Map([
  ["JSON", /* @__PURE__ */ new Set(["parse", "stringify"])],
  ["globalThis", /* @__PURE__ */ new Set(["fetch"])]
]);
function isBannedPropertyAccess(node) {
  const obj = node.expression;
  if (!import_typescript52.default.isIdentifier(obj)) return false;
  const banned = BANNED_MEMBERS.get(obj.text);
  return banned !== void 0 && banned.has(node.name.text);
}
var noThrowingGlobals = {
  name: "no-throwing-globals",
  visit(node, ctx) {
    if (import_typescript52.default.isPropertyAccessExpression(node)) {
      if (isBannedPropertyAccess(node)) {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-throwing-globals", message: "This global throws on failure \u2014 wrap it in a safe function that returns [T, Error | null] instead." });
      }
    } else if (import_typescript52.default.isCallExpression(node)) {
      const expr = node.expression;
      if (import_typescript52.default.isIdentifier(expr) && expr.text === "fetch") {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-throwing-globals", message: "This global throws on failure \u2014 wrap it in a safe function that returns [T, Error | null] instead." });
      }
    }
  }
};

// src/checker/rules/no-new-user-types.ts
var import_typescript53 = __toESM(require("typescript"), 1);
var ALLOWED_CONSTRUCTORS = /* @__PURE__ */ new Set([
  // Primitive wrappers — caught by no-new-wrappers, allowed here to avoid double-reporting
  "String",
  "Number",
  "Boolean",
  "Symbol",
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Date",
  "URL",
  "URLSearchParams",
  "RegExp",
  "Promise",
  "Uint8Array",
  "Uint16Array",
  "Uint32Array",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
  "ArrayBuffer",
  "DataView",
  "TextDecoder",
  "TextEncoder",
  "AbortController",
  "AbortSignal",
  "EventTarget",
  "Event",
  "CustomEvent",
  "Headers",
  "Request",
  "Response",
  "Blob",
  "File",
  "FormData",
  "Worker"
]);
var noNewUserTypes = {
  name: "no-new-user-types",
  visit(node, ctx) {
    if (!import_typescript53.default.isNewExpression(node)) return;
    const expr = node.expression;
    if (!import_typescript53.default.isIdentifier(expr)) return;
    if (ALLOWED_CONSTRUCTORS.has(expr.text)) return;
    const pos = posOf(ctx.sourceFile, node);
    ctx.push({ ...pos, rule: "no-new-user-types", message: "`new` is only allowed on built-in runtime constructors." });
  }
};

// src/checker/rules/no-index-import.ts
var import_typescript54 = __toESM(require("typescript"), 1);
var INDEX_SUFFIXES = ["/index.ts", "/index.tsx", "/index.js", "/index.mjs", "/index.cjs"];
function isIndexPath(spec) {
  return INDEX_SUFFIXES.some(function isSuffix(s) {
    return spec.endsWith(s);
  }) || /\/index$/.test(spec);
}
function check(spec, node, ctx) {
  if (!isIndexPath(spec)) return;
  ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-index-import", message: `Importing index files is not allowed. Import the specific module file instead (e.g. "./dir/module.ts").` });
}
var noIndexImport = {
  name: "no-index-import",
  visit(node, ctx) {
    if (import_typescript54.default.isImportDeclaration(node) && import_typescript54.default.isStringLiteral(node.moduleSpecifier)) {
      check(node.moduleSpecifier.text, node.moduleSpecifier, ctx);
    } else if (import_typescript54.default.isExportDeclaration(node) && node.moduleSpecifier && import_typescript54.default.isStringLiteral(node.moduleSpecifier)) {
      check(node.moduleSpecifier.text, node.moduleSpecifier, ctx);
    }
  }
};

// src/checker/rules/no-overloads.ts
var import_typescript55 = __toESM(require("typescript"), 1);
var noOverloads = {
  name: "no-overloads",
  visit(node, ctx) {
    if (import_typescript55.default.isFunctionDeclaration(node) && node.body === void 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-overloads", message: "Function overloads are not allowed. Use a union parameter type instead." });
    }
    if (import_typescript55.default.isMethodDeclaration(node) && node.body === void 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-overloads", message: "Method overloads are not allowed. Use a union parameter type instead." });
    }
  }
};

// src/checker/rules/no-namespace.ts
var import_typescript56 = __toESM(require("typescript"), 1);
var noNamespace = {
  name: "no-namespace",
  visit(node, ctx) {
    if (!import_typescript56.default.isModuleDeclaration(node)) return;
    const keyword = (node.flags & import_typescript56.default.NodeFlags.Namespace) !== 0 ? "namespace" : "module";
    ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-namespace", message: `\`${keyword}\` declarations are not allowed. Use ES modules instead.` });
  }
};

// src/checker/rules/no-any.ts
var import_typescript57 = __toESM(require("typescript"), 1);
var noAny = {
  name: "no-any",
  visit(node, ctx) {
    if (node.kind === import_typescript57.default.SyntaxKind.AnyKeyword) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-any", message: "`any` is not allowed. Use `unknown` or a concrete type." });
    }
  }
};

// src/checker/rules/no-assertion.ts
var import_typescript58 = __toESM(require("typescript"), 1);
function isAsConst(node) {
  const t = node.type;
  return import_typescript58.default.isTypeReferenceNode(t) && import_typescript58.default.isIdentifier(t.typeName) && t.typeName.escapedText === "const";
}
var noAssertion = {
  name: "no-assertion",
  visit(node, ctx) {
    if (import_typescript58.default.isAsExpression(node)) {
      if (!isAsConst(node)) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-assertion", message: "Type assertions are not allowed. `as const` is the only exception." });
      }
    } else if (import_typescript58.default.isTypeAssertionExpression(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-assertion", message: "Type assertions are not allowed. `as const` is the only exception." });
    }
  }
};

// src/checker/rules/no-non-null.ts
var import_typescript59 = __toESM(require("typescript"), 1);
var noNonNull = {
  name: "no-non-null",
  visit(node, ctx) {
    if (import_typescript59.default.isNonNullExpression(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-non-null", message: "Non-null assertions (`!`) are not allowed." });
    }
  }
};

// src/checker/rules/no-ts-comment.ts
var import_typescript60 = __toESM(require("typescript"), 1);
var TS_ESCAPE = /^\s*@ts-(ignore|expect-error|nocheck)\b/;
function scanComments(source, pos, ctx) {
  const ranges = import_typescript60.default.getLeadingCommentRanges(source, pos) ?? [];
  for (const r of ranges) {
    const text = source.slice(r.pos, r.end);
    const body = r.kind === import_typescript60.default.SyntaxKind.SingleLineCommentTrivia ? text.slice(2) : text.slice(2, -2);
    if (TS_ESCAPE.test(body)) {
      const before = source.slice(0, r.pos);
      const line = (before.match(/\n/g) ?? []).length + 1;
      const lastNl = before.lastIndexOf("\n");
      const col = r.pos - (lastNl === -1 ? -1 : lastNl);
      ctx.push({ line, col, rule: "no-ts-comment", message: "TS escape-hatch comments are not allowed." });
    }
  }
}
var noTsComment = {
  name: "no-ts-comment",
  visit(node, ctx) {
    if (node.kind !== import_typescript60.default.SyntaxKind.SourceFile) return;
    const source = ctx.source;
    const seen = /* @__PURE__ */ new Set();
    function walk5(n) {
      const start = n.getFullStart();
      if (!seen.has(start)) {
        seen.add(start);
        scanComments(source, start, ctx);
      }
      import_typescript60.default.forEachChild(n, walk5);
    }
    walk5(node);
  }
};

// src/checker/rules/no-interface.ts
var import_typescript61 = __toESM(require("typescript"), 1);
var noInterface = {
  name: "no-interface",
  visit(node, ctx) {
    if (import_typescript61.default.isInterfaceDeclaration(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-interface", message: "`interface` is not allowed. Use `type`." });
    }
  }
};

// src/checker/rules/no-enum.ts
var import_typescript62 = __toESM(require("typescript"), 1);
var noEnum = {
  name: "no-enum",
  visit(node, ctx) {
    if (import_typescript62.default.isEnumDeclaration(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-enum", message: "`enum` is not allowed. Use an `as const` object." });
    }
  }
};

// src/checker/rules/no-conditional-type.ts
var import_typescript63 = __toESM(require("typescript"), 1);
function containsInfer(node) {
  if (import_typescript63.default.isInferTypeNode(node)) return true;
  return !!import_typescript63.default.forEachChild(node, containsInfer);
}
var noConditionalType = {
  name: "no-conditional-type",
  visit(node, ctx) {
    if (import_typescript63.default.isConditionalTypeNode(node)) {
      if (containsInfer(node)) return;
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-conditional-type", message: "Conditional types are not allowed." });
    }
  }
};

// src/checker/rules/no-mapped-type.ts
var import_typescript64 = __toESM(require("typescript"), 1);
var noMappedType = {
  name: "no-mapped-type",
  visit(node, ctx) {
    if (import_typescript64.default.isMappedTypeNode(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-mapped-type", message: "Mapped types are not allowed." });
    }
  }
};

// src/checker/rules/no-template-literal-type.ts
var import_typescript65 = __toESM(require("typescript"), 1);
var noTemplateLiteralType = {
  name: "no-template-literal-type",
  visit(node, ctx) {
    if (import_typescript65.default.isTemplateLiteralTypeNode(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-template-literal-type", message: "Template literal types are not allowed." });
    }
  }
};

// src/checker/rules/no-infer.ts
var import_typescript66 = __toESM(require("typescript"), 1);
var noInfer = {
  name: "no-infer",
  visit(node, ctx) {
    if (import_typescript66.default.isInferTypeNode(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-infer", message: "`infer` is not allowed." });
    }
  }
};

// src/checker/rules/no-class.ts
var import_typescript67 = __toESM(require("typescript"), 1);
function hasAbstract(node) {
  return node.modifiers?.some((m) => m.kind === import_typescript67.default.SyntaxKind.AbstractKeyword) ?? false;
}
function hasDecorator(node) {
  return node.modifiers?.some((m) => m.kind === import_typescript67.default.SyntaxKind.Decorator) ?? false;
}
var noClass = {
  name: "no-class",
  visit(node, ctx) {
    if (import_typescript67.default.isClassDeclaration(node) || import_typescript67.default.isClassExpression(node)) {
      if (hasAbstract(node) || hasDecorator(node)) return;
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-class", message: "`class` is not allowed. Use plain objects + functions." });
    }
  }
};

// src/checker/rules/no-abstract.ts
var import_typescript68 = __toESM(require("typescript"), 1);
function hasAbstractModifier(node) {
  const mods = node.modifiers;
  return mods?.some((m) => m.kind === import_typescript68.default.SyntaxKind.AbstractKeyword) ?? false;
}
var noAbstract = {
  name: "no-abstract",
  visit(node, ctx) {
    if (import_typescript68.default.isClassDeclaration(node) && hasAbstractModifier(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-abstract", message: "`abstract` is not allowed." });
    } else if ((import_typescript68.default.isMethodDeclaration(node) || import_typescript68.default.isPropertyDeclaration(node) || import_typescript68.default.isGetAccessorDeclaration(node) || import_typescript68.default.isSetAccessorDeclaration(node)) && hasAbstractModifier(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-abstract", message: "`abstract` is not allowed." });
    }
  }
};

// src/checker/rules/no-decorators.ts
var import_typescript69 = __toESM(require("typescript"), 1);
var noDecorators = {
  name: "no-decorators",
  visit(node, ctx) {
    if (import_typescript69.default.canHaveDecorators(node)) {
      const decorators = import_typescript69.default.getDecorators(node);
      if (decorators && decorators.length > 0) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-decorators", message: "Decorators are not allowed." });
      }
    }
  }
};

// src/checker/rules/no-this.ts
var import_typescript70 = __toESM(require("typescript"), 1);
var noThis = {
  name: "no-this",
  visit(node, ctx) {
    if (node.kind === import_typescript70.default.SyntaxKind.ThisKeyword) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-this", message: "`this` is not allowed." });
    }
  }
};

// src/checker/rules/no-undefined-type.ts
var import_typescript71 = __toESM(require("typescript"), 1);
var noUndefinedType = {
  name: "no-undefined-type",
  visit(node, ctx) {
    if (node.kind === import_typescript71.default.SyntaxKind.UndefinedKeyword) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-undefined-type", message: "`undefined` is not allowed in types. Use `null` for absent values; use `void` for functions that return nothing." });
    }
  }
};

// src/checker/rules/no-optional-property.ts
var import_typescript72 = __toESM(require("typescript"), 1);
var noOptionalProperty = {
  name: "no-optional-property",
  visit(node, ctx) {
    if (import_typescript72.default.isPropertySignature(node) && node.questionToken !== void 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-optional-property", message: "Optional properties (`?:`) are not allowed. Use `| null` explicitly." });
    }
  }
};

// src/checker/rules/no-optional-parameter.ts
var import_typescript73 = __toESM(require("typescript"), 1);
var noOptionalParameter = {
  name: "no-optional-parameter",
  visit(node, ctx) {
    if (import_typescript73.default.isParameter(node) && node.questionToken !== void 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-optional-parameter", message: "Optional parameters are not allowed. Use `| null` and require explicit values." });
    }
  }
};

// src/checker/rules/no-default-parameter.ts
var import_typescript74 = __toESM(require("typescript"), 1);
var noDefaultParameter = {
  name: "no-default-parameter",
  visit(node, ctx) {
    if (import_typescript74.default.isParameter(node) && node.initializer !== void 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-default-parameter", message: "Default parameters are not allowed (uses `undefined` as sentinel). Wrap with a thin function instead." });
    }
  }
};

// src/checker/rules/no-empty-object-type.ts
var import_typescript75 = __toESM(require("typescript"), 1);
var noEmptyObjectType = {
  name: "no-empty-object-type",
  visit(node, ctx) {
    if (import_typescript75.default.isTypeLiteralNode(node) && node.members.length === 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-empty-object-type", message: "`{}` is not allowed as a type. Use `unknown` or a specific shape." });
    }
  }
};

// src/checker/rules/no-object-type.ts
var import_typescript76 = __toESM(require("typescript"), 1);
var noObjectType = {
  name: "no-object-type",
  visit(node, ctx) {
    if (node.kind === import_typescript76.default.SyntaxKind.ObjectKeyword) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-object-type", message: "`object` / `Object` is not allowed. Use a specific type." });
    } else if (import_typescript76.default.isTypeReferenceNode(node) && import_typescript76.default.isIdentifier(node.typeName) && node.typeName.escapedText === "Object") {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-object-type", message: "`object` / `Object` is not allowed. Use a specific type." });
    }
  }
};

// src/checker/rules/no-function-type.ts
var import_typescript77 = __toESM(require("typescript"), 1);
var noFunctionType = {
  name: "no-function-type",
  visit(node, ctx) {
    if (import_typescript77.default.isTypeReferenceNode(node) && import_typescript77.default.isIdentifier(node.typeName) && node.typeName.escapedText === "Function") {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-function-type", message: "`Function` is not allowed. Declare the specific function signature." });
    }
  }
};

// src/checker/rules/require-readonly-property.ts
var import_typescript78 = __toESM(require("typescript"), 1);
var requireReadonlyProperty = {
  name: "require-readonly-property",
  visit(node, ctx) {
    if (import_typescript78.default.isPropertySignature(node)) {
      const hasReadonly = node.modifiers?.some((m) => m.kind === import_typescript78.default.SyntaxKind.ReadonlyKeyword) ?? false;
      if (!hasReadonly) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-readonly-property", message: "Object type properties must be declared `readonly`." });
      }
    }
  }
};

// src/checker/rules/require-readonly-arrays.ts
var import_typescript79 = __toESM(require("typescript"), 1);
var requireReadonlyArrays = {
  name: "require-readonly-arrays",
  visit(node, ctx) {
    if (import_typescript79.default.isArrayTypeNode(node)) {
      const parent = node.parent;
      const coveredByReadonly = import_typescript79.default.isTypeOperatorNode(parent) && parent.operator === import_typescript79.default.SyntaxKind.ReadonlyKeyword;
      if (!coveredByReadonly) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-readonly-arrays", message: "Array types must be declared `readonly T[]`." });
      }
    }
  }
};

// src/checker/rules/require-explicit-return-type.ts
var import_typescript80 = __toESM(require("typescript"), 1);
var requireExplicitReturnType = {
  name: "require-explicit-return-type",
  visit(node, ctx) {
    if ((import_typescript80.default.isFunctionDeclaration(node) || import_typescript80.default.isFunctionExpression(node) || import_typescript80.default.isMethodDeclaration(node)) && node.type === void 0) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-explicit-return-type", message: "Function declarations must have an explicit return type annotation." });
    }
  }
};

// src/checker/rules/no-symbol-type.ts
var import_typescript81 = __toESM(require("typescript"), 1);
var noSymbolType = {
  name: "no-symbol-type",
  visit(node, ctx) {
    if (node.kind === import_typescript81.default.SyntaxKind.SymbolKeyword) {
      const parent = node.parent;
      if (import_typescript81.default.isTypeOperatorNode(parent) && parent.operator === import_typescript81.default.SyntaxKind.UniqueKeyword) return;
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-symbol-type", message: "`symbol` / `unique symbol` types are not allowed." });
    } else if (import_typescript81.default.isTypeOperatorNode(node) && node.operator === import_typescript81.default.SyntaxKind.UniqueKeyword) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-symbol-type", message: "`symbol` / `unique symbol` types are not allowed." });
    }
  }
};

// src/checker/rules/no-variadic-tuple.ts
var import_typescript82 = __toESM(require("typescript"), 1);
var noVariadicTuple = {
  name: "no-variadic-tuple",
  visit(node, ctx) {
    if (import_typescript82.default.isTupleTypeNode(node)) {
      const hasRest = node.elements.some((el) => import_typescript82.default.isRestTypeNode(el));
      if (hasRest) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-variadic-tuple", message: "Variadic tuples are not allowed. Give the rest a name in a struct type." });
      }
    }
  }
};

// src/checker/rules/no-array-generic.ts
var import_typescript83 = __toESM(require("typescript"), 1);
var BANNED = /* @__PURE__ */ new Set(["Array", "ReadonlyArray"]);
var noArrayGeneric = {
  name: "no-array-generic",
  visit(node, ctx) {
    if (import_typescript83.default.isTypeReferenceNode(node) && import_typescript83.default.isIdentifier(node.typeName) && BANNED.has(node.typeName.escapedText)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-array-generic", message: "Use `readonly T[]` instead of `Array<T>` or `ReadonlyArray<T>`." });
    }
  }
};

// src/checker/rules/no-readonly-wrapper.ts
var import_typescript84 = __toESM(require("typescript"), 1);
var noReadonlyWrapper = {
  name: "no-readonly-wrapper",
  visit(node, ctx) {
    if (import_typescript84.default.isTypeReferenceNode(node) && import_typescript84.default.isIdentifier(node.typeName) && node.typeName.escapedText === "Readonly") {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-readonly-wrapper", message: "`Readonly<T>` is redundant; declare each property `readonly`." });
    }
  }
};

// src/checker/rules/no-banned-utility-types.ts
var import_typescript85 = __toESM(require("typescript"), 1);
var BANNED2 = /* @__PURE__ */ new Set([
  "Partial",
  "Required",
  "Record",
  "InstanceType",
  "ConstructorParameters",
  "ThisType",
  "Generator",
  "GeneratorFunction",
  "AsyncGenerator",
  "AsyncGeneratorFunction",
  "ClassDecorator",
  "MethodDecorator",
  "PropertyDecorator",
  "ParameterDecorator"
]);
var noBannedUtilityTypes = {
  name: "no-banned-utility-types",
  visit(node, ctx) {
    if (import_typescript85.default.isTypeReferenceNode(node) && import_typescript85.default.isIdentifier(node.typeName) && BANNED2.has(node.typeName.escapedText)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-banned-utility-types", message: "This utility type is banned. See `docs/LANGUAGE.md` for the canonical form." });
    }
  }
};

// src/checker/rules/no-index-signature.ts
var import_typescript86 = __toESM(require("typescript"), 1);
var noIndexSignature = {
  name: "no-index-signature",
  visit(node, ctx) {
    if (import_typescript86.default.isIndexSignatureDeclaration(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-index-signature", message: "Index signatures are not allowed. Use `Map<K, V>`." });
    }
  }
};

// src/checker/rules/no-primitive-wrapper-types.ts
var import_typescript87 = __toESM(require("typescript"), 1);
var BANNED3 = /* @__PURE__ */ new Set(["String", "Number", "Boolean", "Symbol"]);
var noPrimitiveWrapperTypes = {
  name: "no-primitive-wrapper-types",
  visit(node, ctx) {
    if (import_typescript87.default.isTypeReferenceNode(node) && import_typescript87.default.isIdentifier(node.typeName) && BANNED3.has(node.typeName.escapedText)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-primitive-wrapper-types", message: "Use the lowercase primitive type." });
    }
  }
};

// src/checker/rules/no-constructor-type.ts
var import_typescript88 = __toESM(require("typescript"), 1);
var noConstructorType = {
  name: "no-constructor-type",
  visit(node, ctx) {
    if (import_typescript88.default.isConstructorTypeNode(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-constructor-type", message: "Constructor type signatures are not allowed (no classes)." });
    }
  }
};

// src/checker/rules/no-metaprogramming-globals.ts
var import_typescript89 = __toESM(require("typescript"), 1);
var BANNED_GLOBALS = /* @__PURE__ */ new Set(["Proxy", "Reflect", "Function", "Symbol"]);
var BANNED_OBJECT_METHODS = /* @__PURE__ */ new Set([
  "create",
  "assign",
  "defineProperty",
  "defineProperties",
  "getOwnPropertyDescriptor",
  "getOwnPropertyDescriptors",
  "getOwnPropertyNames",
  "getOwnPropertySymbols",
  "getPrototypeOf",
  "setPrototypeOf"
]);
var noMetaprogrammingGlobals = {
  name: "no-metaprogramming-globals",
  visit(node, ctx) {
    if (import_typescript89.default.isIdentifier(node)) {
      const name = node.escapedText;
      if (BANNED_GLOBALS.has(name)) {
        if (import_typescript89.default.isTypeReferenceNode(node.parent)) return;
        if (import_typescript89.default.isPropertyAccessExpression(node.parent) && node.parent.name === node) return;
        if (import_typescript89.default.isImportSpecifier(node.parent) || import_typescript89.default.isImportClause(node.parent)) return;
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-metaprogramming-globals", message: "Metaprogramming globals are banned." });
      }
    } else if (import_typescript89.default.isPropertyAccessExpression(node)) {
      const expr = node.expression;
      if (import_typescript89.default.isIdentifier(expr) && expr.escapedText === "Object" && BANNED_OBJECT_METHODS.has(node.name.escapedText)) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-metaprogramming-globals", message: "Metaprogramming globals are banned." });
      }
    }
  }
};

// src/checker/rules/no-literal-boolean-type.ts
var import_typescript90 = __toESM(require("typescript"), 1);
function isBooleanLiteral(node) {
  return import_typescript90.default.isLiteralTypeNode(node) && (node.literal.kind === import_typescript90.default.SyntaxKind.TrueKeyword || node.literal.kind === import_typescript90.default.SyntaxKind.FalseKeyword);
}
var noLiteralBooleanType = {
  name: "no-literal-boolean-type",
  visit(node, ctx) {
    if (import_typescript90.default.isUnionTypeNode(node) && node.types.length === 2) {
      const [a, b] = node.types;
      if (a && b && isBooleanLiteral(a) && isBooleanLiteral(b)) {
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-literal-boolean-type", message: "`true | false` is just `boolean`." });
      }
    }
  }
};

// src/checker/rules/no-intersection-types.ts
var import_typescript91 = __toESM(require("typescript"), 1);
var noIntersectionTypes = {
  name: "no-intersection-types",
  visit(node, ctx) {
    if (import_typescript91.default.isIntersectionTypeNode(node)) {
      ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-intersection-types", message: "Intersection types are not allowed. Spell out the combined shape." });
    }
  }
};

// src/checker/rules/require-tuple-destructure.ts
var import_typescript92 = __toESM(require("typescript"), 1);
var STD_FNS = /* @__PURE__ */ new Set(["jsonParse", "jsonStringify", "safeFetch", "toResult", "toPromiseResult"]);
function collectStdImports(sourceFile) {
  const imported = /* @__PURE__ */ new Set();
  for (const stmt of sourceFile.statements) {
    if (!import_typescript92.default.isImportDeclaration(stmt)) continue;
    const spec = stmt.moduleSpecifier;
    if (!import_typescript92.default.isStringLiteral(spec) || spec.text !== "shotscript/utils") continue;
    const bindings = stmt.importClause?.namedBindings;
    if (!bindings || !import_typescript92.default.isNamedImports(bindings)) continue;
    for (const el of bindings.elements) {
      const name = el.name.escapedText;
      if (STD_FNS.has(name)) imported.add(name);
    }
  }
  return imported;
}
function walk4(node, stdImports, ctx) {
  if (import_typescript92.default.isVariableDeclaration(node)) {
    if (stdImports.size > 0 && import_typescript92.default.isIdentifier(node.name) && node.initializer) {
      let init2 = node.initializer;
      if (import_typescript92.default.isAwaitExpression(init2)) init2 = init2.expression;
      if (import_typescript92.default.isCallExpression(init2)) {
        const callee = init2.expression;
        if (import_typescript92.default.isIdentifier(callee) && stdImports.has(callee.escapedText)) {
          ctx.push({
            ...posOf(ctx.sourceFile, node),
            rule: "require-tuple-destructure",
            message: `Tuple-returning calls must be destructured: use \`const [result, err] = ...\`.`
          });
        }
      }
    }
  }
  import_typescript92.default.forEachChild(node, (child) => walk4(child, stdImports, ctx));
}
var requireTupleDestructure = {
  name: "require-tuple-destructure",
  visit(node, ctx) {
    if (node.kind !== import_typescript92.default.SyntaxKind.SourceFile) return;
    const stdImports = collectStdImports(node);
    import_typescript92.default.forEachChild(node, (child) => walk4(child, stdImports, ctx));
  }
};

// src/checker/rules/require-async-tuple-return.ts
var import_typescript93 = __toESM(require("typescript"), 1);
function containsNull(typeNode) {
  if (!import_typescript93.default.isUnionTypeNode(typeNode)) return false;
  return typeNode.types.some(
    (t) => import_typescript93.default.isLiteralTypeNode(t) && t.literal.kind === import_typescript93.default.SyntaxKind.NullKeyword
  );
}
function isValidAsyncReturn(typeNode) {
  if (!import_typescript93.default.isTypeReferenceNode(typeNode)) return false;
  const name = typeNode.typeName;
  if (!import_typescript93.default.isIdentifier(name)) return false;
  if (name.text === "PromiseResult") return true;
  if (name.text !== "Promise") return false;
  const args = typeNode.typeArguments;
  if (!args || args.length !== 1) return false;
  const inner = args[0];
  if (!inner) return false;
  if (inner.kind === import_typescript93.default.SyntaxKind.VoidKeyword) return true;
  if (inner.kind === import_typescript93.default.SyntaxKind.NeverKeyword) return true;
  if (import_typescript93.default.isTypeReferenceNode(inner) && import_typescript93.default.isIdentifier(inner.typeName) && inner.typeName.text === "Result") return true;
  if (!import_typescript93.default.isTupleTypeNode(inner)) return false;
  if (inner.elements.length !== 2) return false;
  const second = inner.elements[1];
  return second !== void 0 && containsNull(second);
}
var requireAsyncTupleReturn = {
  name: "require-async-tuple-return",
  visit(node, ctx) {
    if (!import_typescript93.default.isFunctionDeclaration(node) && !import_typescript93.default.isFunctionExpression(node)) return;
    const isAsync = node.modifiers?.some((m) => m.kind === import_typescript93.default.SyntaxKind.AsyncKeyword) ?? false;
    if (!isAsync) return;
    if (!node.type) return;
    if (!isValidAsyncReturn(node.type)) {
      ctx.push({
        ...posOf(ctx.sourceFile, node),
        rule: "require-async-tuple-return",
        message: `Async functions must return PromiseResult<T> or Promise<[T | null, E | null]>. Use a tuple return type so callers can handle errors explicitly.`
      });
    }
  }
};

// src/checker/rules/no-floating-promises.ts
var import_typescript94 = __toESM(require("typescript"), 1);
function isAwaitable(checker, node) {
  const type = checker.getTypeAtLocation(node);
  if (type.flags & import_typescript94.default.TypeFlags.Any) return false;
  if (type.flags & import_typescript94.default.TypeFlags.Unknown) return false;
  const thenProp = type.getProperty("then");
  if (!thenProp) return false;
  const thenType = checker.getTypeOfSymbol(thenProp);
  return thenType.getCallSignatures().length > 0;
}
var noFloatingPromises = {
  name: "no-floating-promises",
  visit(node, ctx) {
    if (!ctx.typeChecker) return;
    if (!import_typescript94.default.isExpressionStatement(node)) return;
    const expr = node.expression;
    if (import_typescript94.default.isVoidExpression(expr)) return;
    if (import_typescript94.default.isAwaitExpression(expr)) return;
    if (!import_typescript94.default.isCallExpression(expr)) return;
    if (!isAwaitable(ctx.typeChecker, expr)) return;
    ctx.push({
      ...posOf(ctx.sourceFile, node),
      rule: "no-floating-promises",
      message: `Promise must be handled. Use \`await\` to wait for the result, or \`void fn()\` to explicitly discard it.`
    });
  }
};

// src/checker/rules/index.ts
var rules = [
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
  noFloatingPromises
];

// src/checker/index.ts
function buildProgram(file, source) {
  try {
    const options = {
      target: import_typescript95.default.ScriptTarget.ES2022,
      noEmit: true,
      skipLibCheck: true
    };
    const host = import_typescript95.default.createCompilerHost(options);
    const base = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ver) => name === file ? import_typescript95.default.createSourceFile(name, source, ver, true) : base(name, ver);
    const program = import_typescript95.default.createProgram([file], options, host);
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) return void 0;
    return { sourceFile, checker: program.getTypeChecker() };
  } catch {
    return void 0;
  }
}
function check2(file, source, typeChecker, programSourceFile) {
  const diagnostics = [];
  let sourceFile;
  let checker;
  if (typeChecker && programSourceFile) {
    sourceFile = programSourceFile;
    checker = typeChecker;
  } else {
    const result = buildProgram(file, source);
    sourceFile = result?.sourceFile ?? import_typescript95.default.createSourceFile(file, source, import_typescript95.default.ScriptTarget.Latest, true, import_typescript95.default.ScriptKind.TS);
    checker = result?.checker;
  }
  const parseDiags = sourceFile.parseDiagnostics ?? [];
  if (parseDiags.length > 0) {
    const d = parseDiags[0];
    if (!d) return diagnostics;
    const pos = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0);
    diagnostics.push({
      file,
      line: pos.line + 1,
      col: pos.character + 1,
      rule: "parse-error",
      message: import_typescript95.default.flattenDiagnosticMessageText(d.messageText, " ")
    });
    return diagnostics;
  }
  const ctx = {
    file,
    source,
    sourceFile,
    typeChecker: checker,
    push(d) {
      diagnostics.push({ file, ...d });
    }
  };
  function walk5(node) {
    for (const rule of rules) {
      rule.visit(node, ctx);
    }
    import_typescript95.default.forEachChild(node, walk5);
  }
  walk5(sourceFile);
  return diagnostics;
}

// src/plugin.ts
function init(modules) {
  const tsModule = modules.typescript;
  function create(info) {
    const ls = info.languageService;
    const proxy = /* @__PURE__ */ Object.create(null);
    for (const k of Object.keys(ls)) {
      const method = ls[k];
      if (typeof method === "function") {
        proxy[k] = function(...args) {
          return method.apply(ls, args);
        };
      }
    }
    proxy.getSemanticDiagnostics = function(fileName) {
      const prior = ls.getSemanticDiagnostics(fileName);
      const program = ls.getProgram();
      const sourceFile = program?.getSourceFile(fileName);
      if (sourceFile === void 0) return prior;
      const source = sourceFile.getFullText();
      const shotDiags = check2(fileName, source, program?.getTypeChecker(), sourceFile);
      const converted = shotDiags.map(function(d) {
        const start = sourceFile.getPositionOfLineAndCharacter(d.line - 1, d.col - 1);
        return {
          file: sourceFile,
          start,
          length: 1,
          messageText: `[${d.rule}] ${d.message}`,
          category: tsModule.DiagnosticCategory.Error,
          code: 90001,
          source: "shotscript"
        };
      });
      return [...prior, ...converted];
    };
    return proxy;
  }
  return { create };
}
var plugin_default = init;
module.exports=module.exports.default??module.exports;
