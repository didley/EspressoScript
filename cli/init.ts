export async function init(args: string[]): Promise<number> {
    if (args.length !== 1) {
        console.error("shot init: expected exactly one project name")
        console.error("Usage: shot init <name>")
        return 2
    }

    const name = args[0]

    if (!/^[a-z][a-z0-9_-]*$/.test(name)) {
        console.error(`shot init: invalid project name "${name}" — use lowercase letters, digits, hyphens, and underscores`)
        return 2
    }

    try {
        await Deno.mkdir(name)
    } catch (e) {
        if (e instanceof Deno.errors.AlreadyExists) {
            console.error(`shot init: directory "${name}" already exists`)
        } else {
            console.error(`shot init: ${(e as Error).message}`)
        }
        return 2
    }

    const entryPath = `${name}/${name}.shot`
    const testPath = `${name}/${name}.test.shot`

    await Deno.writeTextFile(entryPath, `export function hello(): string {
    return "Hello from ${name}!"
}
`)

    await Deno.writeTextFile(testPath, `import { hello } from "./${name}.shot"
import { assertEquals } from "shot:assert"

Deno.test("hello returns greeting", function testHello(): void {
    assertEquals(hello(), "Hello from ${name}!")
})
`)

    console.log(`Created ${name}/`)
    console.log(`  ${entryPath}`)
    console.log(`  ${testPath}`)
    console.log(`\nRun tests: shot test ${testPath}`)
    return 0
}
