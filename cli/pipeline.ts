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

export async function writeImportMap(extraImports: Record<string, string> = {}): Promise<string> {
    const dir = await Deno.makeTempDir({ prefix: "shot-" })
    const path = `${dir}/deno.json`
    const stdlibOverride = Deno.env.get("SHOT_STDLIB_LOCAL")
    const base = stdlibOverride !== undefined && stdlibOverride !== ""
        ? { "shot:std": stdlibOverride, "shot:": "jsr:@shotscript/" }
        : { "shot:": "jsr:@shotscript/" }
    const imports = { ...base, ...extraImports }
    await Deno.writeTextFile(path, JSON.stringify({
        imports,
        compilerOptions: STRICT_COMPILER_OPTIONS,
    }))
    return path
}

// Returns true when a .shot file has at least one relative .shot import.
export function hasShotImports(source: string): boolean {
    return /(["']\.[^"']*?)\.shot(["'])/.test(source)
}

// Rewrites `"./foo.shot"` → `"./foo.ts"` throughout source text.
export function rewriteShotImports(source: string): string {
    return source.replace(/(["']\.[^"']*?)\.shot(["'])/g, "$1.ts$2")
}

// Returns all .shot files in dir (non-recursive, one level only).
export async function shotFilesInDir(dir: string): Promise<string[]> {
    const files: string[] = []
    for await (const e of Deno.readDir(dir)) {
        if (e.isFile && e.name.endsWith(".shot")) {
            files.push(`${dir}/${e.name}`)
        }
    }
    return files
}

// Copies shot files into tmpDir as .ts, rewriting relative .shot imports.
export async function copyTransform(files: string[], tmpDir: string): Promise<void> {
    for (const file of files) {
        const source = await Deno.readTextFile(file)
        const transformed = rewriteShotImports(source)
        const basename = file.split("/").pop()!.replace(/\.shot$/, ".ts")
        await Deno.writeTextFile(`${tmpDir}/${basename}`, transformed)
    }
}

export async function cleanup(configPath: string): Promise<void> {
    if (Deno.env.get("SHOT_KEEP_TEMP") === "1") {
        console.error(`SHOT_KEEP_TEMP: leaving ${configPath}`)
        return
    }
    const dir = configPath.replace(/\/deno\.json$/, "")
    await Deno.remove(dir, { recursive: true })
}
