import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

// Returns true when a .shot file has at least one relative .shot import.
export function hasShotImports(source: string): boolean {
    return /(["']\.[^"']*?)\.shot(["'])/.test(source)
}

// Rewrites `"./foo.shot"` → `"./foo.ts"` in relative imports.
export function rewriteShotImports(source: string): string {
    return source.replace(/(["']\.[^"']*?)\.shot(["'])/g, '$1.ts$2')
}

// Rewrites `"shot:std"` → `"@shotscript/std"` (or SHOT_STDLIB_LOCAL when set).
// If localModules is provided, `shot:foo` resolves to the absolute path of
// `<projectDir>/shot_modules/foo.ts` when that file exists.
export function rewriteShotSpecifiers(source: string, localModules?: Map<string, string>): string {
    const stdlibOverride = process.env['SHOT_STDLIB_LOCAL']
    return source.replace(/(['"])shot:([^'"]+)\1/g, (_: string, q: string, name: string) => {
        const localPath = localModules?.get(name)
        if (localPath !== undefined) return `${q}${localPath}${q}`
        if (name === 'std' && stdlibOverride) return `${q}${stdlibOverride}${q}`
        return `${q}@shotscript/${name}${q}`
    })
}

// Returns all .shot files in dir (non-recursive, one level only).
export async function shotFilesInDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
        .filter((e) => e.isFile() && e.name.endsWith('.shot'))
        .map((e) => path.join(dir, e.name))
}

// Builds a map of module name → absolute path from <projectDir>/shot_modules/.
async function resolveLocalModules(projectDir: string): Promise<Map<string, string>> {
    const modDir = path.join(projectDir, 'shot_modules')
    const result = new Map<string, string>()
    try {
        const entries = await fs.readdir(modDir, { withFileTypes: true })
        for (const e of entries) {
            if (e.isFile() && e.name.endsWith('.ts')) {
                result.set(e.name.replace(/\.ts$/, ''), path.join(modDir, e.name))
            }
        }
    } catch {
        // no shot_modules directory — that's fine
    }
    return result
}

// Copies .shot files into tmpDir as .ts, rewriting relative and shot: imports.
// Pass projectDir to enable shot_modules/ resolution for that project.
export async function copyTransform(files: string[], tmpDir: string, projectDir?: string): Promise<void> {
    const localModules = projectDir !== undefined ? await resolveLocalModules(projectDir) : undefined
    for (const file of files) {
        const source = await fs.readFile(file, 'utf-8')
        const transformed = rewriteShotSpecifiers(rewriteShotImports(source), localModules)
        const basename = path.basename(file).replace(/\.shot$/, '.ts')
        await fs.writeFile(path.join(tmpDir, basename), transformed)
    }
}

export async function makeTempDir(prefix: string): Promise<string> {
    return fs.mkdtemp(path.join(os.tmpdir(), prefix))
}

export async function removeTempDir(dir: string): Promise<void> {
    if (process.env['SHOT_KEEP_TEMP'] === '1') {
        console.error(`SHOT_KEEP_TEMP: leaving ${dir}`)
        return
    }
    await fs.rm(dir, { recursive: true })
}
