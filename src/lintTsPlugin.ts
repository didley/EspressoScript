import type ts from 'typescript'
import { check } from './lint/check.js'

/** TypeScript language service plugin that surfaces ShotScript diagnostics in the editor. */
function init(modules: {
    readonly typescript: typeof ts
}): { readonly create: (info: ts.server.PluginCreateInfo) => ts.LanguageService } {
    const tsModule = modules.typescript

    function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
        const ls = info.languageService
        const proxy = Object.create(null) as ts.LanguageService

        for (const k of Object.keys(ls) as Array<keyof ts.LanguageService>) {
            const method = ls[k]
            if (typeof method === 'function') {
                (proxy as unknown as Record<string, unknown>)[k] = function proxyMethod(
                    ...args: unknown[]
                ): unknown {
                    return (method as (...a: unknown[]) => unknown).apply(ls, args)
                }
            }
        }

        proxy.getSemanticDiagnostics = function getSemanticDiagnostics(
            fileName: string,
        ): ts.Diagnostic[] {
            const prior = ls.getSemanticDiagnostics(fileName)
            const program = ls.getProgram()
            const sourceFile = program?.getSourceFile(fileName)
            if (sourceFile === undefined) return prior

            const source = sourceFile.getFullText()
            const typeChecker = program?.getTypeChecker() ?? null
            const shotDiags = check(fileName, source, typeChecker, sourceFile)

            const converted: ts.Diagnostic[] = shotDiags.map(
                function toDiagnostic(d: {
                    readonly line: number
                    readonly col: number
                    readonly rule: string
                    readonly message: string
                }): ts.Diagnostic {
                    const start = sourceFile.getPositionOfLineAndCharacter(d.line - 1, d.col - 1)
                    return {
                        file: sourceFile,
                        start,
                        length: 1,
                        messageText: `[${d.rule}] ${d.message}`,
                        category: tsModule.DiagnosticCategory.Error,
                        code: 90001,
                        source: 'shotscript',
                    }
                },
            )

            return [...prior, ...converted]
        }

        return proxy
    }

    return { create }
}

export default init
