import { walk } from "jsr:@std/fs@^1.0.0/walk"

async function fmtFile(path: string): Promise<boolean> {
    const source = await Deno.readTextFile(path)
    const cmd = new Deno.Command(Deno.execPath(), {
        args: ["fmt", "--ext", "ts", "--options-no-semicolons", "--options-single-quote", "--options-indent-width", "4", "-"],
        stdin: "piped",
        stdout: "piped",
        stderr: "inherit",
    })
    const child = cmd.spawn()
    const writer = child.stdin.getWriter()
    await writer.write(new TextEncoder().encode(source))
    await writer.close()
    const { code, stdout } = await child.output()
    if (code !== 0) return false
    await Deno.writeTextFile(path, new TextDecoder().decode(stdout))
    return true
}

export async function fmt(files: string[]): Promise<number> {
    const targets: string[] = []
    if (files.length === 0) {
        for await (const entry of walk(".", { exts: [".shot"] })) {
            targets.push(entry.path)
        }
    } else {
        for (const f of files) {
            if (f.endsWith(".shot")) {
                targets.push(f)
            } else {
                console.error(`shot fmt: skipping non-.shot file: ${f}`)
            }
        }
    }
    if (targets.length === 0) {
        console.error("shot fmt: no .shot files found")
        return 1
    }
    let ok = true
    for (const path of targets) {
        console.log(path)
        const success = await fmtFile(path)
        if (!success) ok = false
    }
    return ok ? 0 : 1
}
