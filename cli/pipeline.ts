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
export function rewriteShotSpecifiers(source: string): string {
    const stdlibOverride = process.env['SHOT_STDLIB_LOCAL']
    return source.replace(/"shot:([^"]+)"/g, (_: string, name: string) => {
        if (name === 'std' && stdlibOverride) return `"${stdlibOverride}"`
        return `"@shotscript/${name}"`
    })
}

// Returns all .shot files in dir (non-recursive, one level only).
export async function shotFilesInDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
        .filter((e) => e.isFile() && e.name.endsWith('.shot'))
        .map((e) => path.join(dir, e.name))
}

// Copies .shot files into tmpDir as .ts, rewriting relative and shot: imports.
export async function copyTransform(files: string[], tmpDir: string): Promise<void> {
    for (const file of files) {
        const source = await fs.readFile(file, 'utf-8')
        const transformed = rewriteShotSpecifiers(rewriteShotImports(source))
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
