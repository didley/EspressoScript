// Options that Deno 2.x ignores (warns about) are excluded:
// forceConsistentCasingInFileNames, isolatedModules, moduleDetection, noUncheckedSideEffectImports
const STRICT_COMPILER_OPTIONS = {
    strict: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    exactOptionalPropertyTypes: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
    noErrorTruncation: true,
    strictBuiltinIteratorReturn: true,
    verbatimModuleSyntax: true,
    // Deno 2.8+ has a conflict in its own bundled node/https.d.cts types;
    // skipLibCheck silences declaration-file errors without weakening user-code checks.
    skipLibCheck: true,
}

export async function writeImportMap(): Promise<string> {
    const dir = await Deno.makeTempDir({ prefix: "shot-" })
    const path = `${dir}/deno.json`
    const stdlibOverride = Deno.env.get("SHOT_STDLIB_LOCAL")
    const imports = stdlibOverride !== undefined && stdlibOverride !== ""
        ? { "shot:std": stdlibOverride, "shot:": "jsr:@espresso/" }
        : { "shot:": "jsr:@espresso/" }
    await Deno.writeTextFile(path, JSON.stringify({
        imports,
        compilerOptions: STRICT_COMPILER_OPTIONS,
    }))
    return path
}

export async function cleanup(configPath: string): Promise<void> {
    if (Deno.env.get("SHOT_KEEP_TEMP") === "1") {
        console.error(`SHOT_KEEP_TEMP: leaving ${configPath}`)
        return
    }
    const dir = configPath.replace(/\/deno\.json$/, "")
    await Deno.remove(dir, { recursive: true })
}
