import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { glob } from 'glob'

async function fmtFile(filePath: string): Promise<boolean> {
    const source = await fs.readFile(filePath, 'utf-8')
    const formatted = await runBiome(source)
    if (formatted === null) return false
    await fs.writeFile(filePath, formatted)
    return true
}

async function runBiome(source: string): Promise<string | null> {
    // Biome lands in cli/node_modules (direct install) or root/node_modules (workspace hoist)
    const localBin = new URL('./node_modules/.bin/biome', import.meta.url).pathname
    const rootBin = new URL('../node_modules/.bin/biome', import.meta.url).pathname
    const biomeBin = existsSync(localBin) ? localBin : rootBin
    const biomeConfig = new URL(import.meta.resolve('shot-lint/biome')).pathname
    const proc = Bun.spawn(
        [biomeBin, 'format', '--config-path', biomeConfig, '--stdin-file-path=virtual.ts', '--no-errors-on-unmatched', '-'],
        {
            stdin: Buffer.from(source, 'utf-8'),
            stdout: 'pipe',
            stderr: 'inherit',
        },
    )
    const [output] = await Promise.all([new Response(proc.stdout).text(), proc.exited])
    return proc.exitCode === 0 ? output : null
}

export async function fmt(files: string[]): Promise<number> {
    const targets: string[] =
        files.length === 0
            ? await glob('**/*.shot', { ignore: 'node_modules/**' })
            : files.filter((f) => {
                  if (!f.endsWith('.shot')) {
                      console.error(`shot fmt: skipping non-.shot file: ${f}`)
                      return false
                  }
                  return true
              })

    if (targets.length === 0) {
        console.error('shot fmt: no .shot files found')
        return 1
    }

    let ok = true
    for (const filePath of targets) {
        console.log(filePath)
        const success = await fmtFile(filePath)
        if (!success) ok = false
    }
    return ok ? 0 : 1
}
