import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

export async function init(args: string[]): Promise<number> {
    if (args.length !== 1) {
        console.error('shot init: expected exactly one project name')
        console.error('Usage: shot init <name>')
        return 2
    }

    const name = args[0]

    if (!/^[a-z][a-z0-9_-]*$/.test(name)) {
        console.error(
            `shot init: invalid project name "${name}" — use lowercase letters, digits, hyphens, and underscores`,
        )
        return 2
    }

    try {
        await fs.mkdir(name)
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
            console.error(`shot init: directory "${name}" already exists`)
        } else {
            console.error(`shot init: ${(e as Error).message}`)
        }
        return 2
    }

    const entryPath = `${name}/${name}.shot`
    const testPath = `${name}/${name}.test.shot`
    const agentsPath = `${name}/AGENTS.md`

    await fs.writeFile(
        entryPath,
        `export function hello(): string {
    return "Hello from ${name}!"
}
`,
    )

    await fs.writeFile(
        testPath,
        `import { hello } from "./${name}.shot"
import { test, expect } from "bun:test"

test("hello returns greeting", function testHello(): void {
    expect(hello()).toBe("Hello from ${name}!")
})
`,
    )

    const agentsTemplate = fileURLToPath(new URL('./templates/AGENTS.md', import.meta.url))
    await fs.copyFile(agentsTemplate, agentsPath)

    console.log(`Created ${name}/`)
    console.log(`  ${entryPath}`)
    console.log(`  ${testPath}`)
    console.log(`  ${agentsPath}`)
    console.log(`\nRun tests: shot test ${testPath}`)
    return 0
}
