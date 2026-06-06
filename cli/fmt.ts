import * as fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { glob } from 'glob'

async function fmtFile(filePath: string): Promise<boolean> {
    const source = await fs.readFile(filePath, 'utf-8')
    const formatted = await runBiome(source)
    if (formatted === null) return false
    await fs.writeFile(filePath, formatted)
    return true
}

function runBiome(source: string): Promise<string | null> {
    return new Promise((resolve) => {
        const biomeBin = new URL('./node_modules/.bin/biome', import.meta.url).pathname
        const biomeConfig = new URL(import.meta.resolve('shot-lint/biome')).pathname
        const proc = spawn(
            biomeBin,
            [
                'format',
                '--config-path',
                biomeConfig,
                '--stdin-file-path=virtual.ts',
                '--no-errors-on-unmatched',
                '-',
            ],
            { stdio: ['pipe', 'pipe', 'inherit'] },
        )
        const chunks: Buffer[] = []
        proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
        proc.stdin.write(source)
        proc.stdin.end()
        proc.on('close', (code) => {
            if (code !== 0) {
                resolve(null)
                return
            }
            resolve(Buffer.concat(chunks).toString('utf-8'))
        })
    })
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
