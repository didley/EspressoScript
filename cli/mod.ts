import { parseArgs } from 'node:util'
import { check } from './check.ts'
import { fmt } from './fmt.ts'
import { build } from './build.ts'
import { run } from './run.ts'
import { test } from './test.ts'
import { init } from './init.ts'

const VERSION = '0.0.0-dev'

const HELP = `shot — ShotScript toolchain

USAGE:
  shot <subcommand> [args]

SUBCOMMANDS:
  init    <name>        Scaffold a new project directory
  check   <file.shot>   Lint a .shot file for violations
  fmt     [file.shot]   Format a .shot file
  build   <file.shot>   Type-check a .shot file
  run     <file.shot>   Type-check and run a .shot file
  test    [files]       Lint and run *.test.shot files (auto-discovers if no files given)

FLAGS:
  --help      Show this help message
  --version   Print version
`

async function main(argv: string[]): Promise<number> {
    const { values, positionals } = parseArgs({
        args: argv,
        options: {
            help: { type: 'boolean' },
            version: { type: 'boolean' },
        },
        allowPositionals: true,
        strict: false,
    })

    if (values['version']) {
        console.log(VERSION)
        return 0
    }

    if (values['help'] || positionals.length === 0) {
        console.log(HELP)
        return 0
    }

    const [subcommand] = positionals
    const subcommandIdx = argv.indexOf(subcommand as string)
    const rest = subcommandIdx >= 0 ? argv.slice(subcommandIdx + 1) : []

    switch (subcommand) {
        case 'check':
            return await check(rest)
        case 'fmt':
            return await fmt(rest)
        case 'build':
            return await build(rest)
        case 'run':
            return await run(rest)
        case 'test':
            return await test(rest)
        case 'init':
            return await init(rest)
        default:
            console.error(`shot: unknown subcommand "${subcommand}"`)
            console.error(`Run 'shot --help' for usage.`)
            return 1
    }
}

process.exit(await main(process.argv.slice(2)))
