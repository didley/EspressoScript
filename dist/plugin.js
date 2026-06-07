import { check } from './checker/index.js';
function init(modules) {
    const tsModule = modules.typescript;
    function create(info) {
        const ls = info.languageService;
        const proxy = Object.create(null);
        for (const k of Object.keys(ls)) {
            const method = ls[k];
            if (typeof method === 'function') {
                proxy[k] = function (...args) {
                    return method.apply(ls, args);
                };
            }
        }
        proxy.getSemanticDiagnostics = function (fileName) {
            const prior = ls.getSemanticDiagnostics(fileName);
            const program = ls.getProgram();
            const sourceFile = program?.getSourceFile(fileName);
            if (sourceFile === undefined)
                return prior;
            const source = sourceFile.getFullText();
            const shotDiags = check(fileName, source, program?.getTypeChecker(), sourceFile);
            const converted = shotDiags.map(function (d) {
                const start = sourceFile.getPositionOfLineAndCharacter(d.line - 1, d.col - 1);
                return {
                    file: sourceFile,
                    start,
                    length: 1,
                    messageText: `[${d.rule}] ${d.message}`,
                    category: tsModule.DiagnosticCategory.Error,
                    code: 90001,
                    source: 'shotscript',
                };
            });
            return [...prior, ...converted];
        };
        return proxy;
    }
    return { create };
}
export default init;
//# sourceMappingURL=plugin.js.map