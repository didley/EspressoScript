import { parseArgs } from "jsr:@std/cli@^1.0.30/parse-args"
import { check } from "./check.ts"
import { fmt } from "./fmt.ts"
import { build } from "./build.ts"
import { run } from "./run.ts"
import { test } from "./test.ts"
import { init } from "./init.ts"

const VERSION = "0.0.0-dev"

const HELP = `shot — EspressoScript toolchain

USAGE:
  shot <subcommand> [args]

SUBCOMMANDS:
  init    <name>        Scaffold a new project directory
  check   <file.shot>   Lint a .shot file for violations
  fmt     [file.shot]   Format a .shot file (delegates to deno fmt)
  build   <file.shot>   Type-check a .shot file
  run     <file.shot>   Type-check and run a .shot file
  test    [files]       Lint and run *.test.shot files (auto-discovers if no files given)

FLAGS:
  --help      Show this help message
  --version   Print version
`

async function main(argv: string[]): Promise<number> {
    const args = parseArgs(argv, {
        boolean: ["help", "version"],
        stopEarly: true,
    })

    if (args["version"]) {
        console.log(VERSION)
        return 0
    }

    if (args["help"] || args._.length === 0) {
        console.log(HELP)
        return 0
    }

    const [subcommand, ...rest] = args._ as string[]

    switch (subcommand) {
        case "check":
            return await check(rest)
        case "fmt":
            return await fmt(rest)
        case "build":
            return await build(rest)
        case "run":
            return await run(rest)
        case "test":
            return await test(rest)
        case "init":
            return await init(rest)
        default:
            console.error(`shot: unknown subcommand "${subcommand}"`)
            console.error(`Run 'shot --help' for usage.`)
            return 1
    }
}

Deno.exit(await main(Deno.args))
