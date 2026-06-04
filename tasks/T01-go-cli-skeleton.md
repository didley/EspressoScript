# T01 — Deno CLI skeleton

> **Note:** filename retained for stable task numbering; this task is the Deno CLI skeleton (the project no longer uses Go).

## Goal
Stand up the Deno CLI entrypoint with four subcommand stubs. No real behavior yet — every subcommand prints "not implemented" and exits 2.

## Files to create
- `cli/mod.ts` — argv parsing + subcommand dispatch
- `cli/deno.json` — JSR package config (`@espresso/shot`)
- `cli/check.ts`, `cli/fmt.ts`, `cli/build.ts`, `cli/run.ts` — one stub per subcommand

## Dependencies
None. This is the first task.

## Acceptance criteria
- `deno run cli/mod.ts --help` prints help listing all 4 subcommands.
- `deno run cli/mod.ts check`, `... fmt`, `... build`, `... run hello.shot` each exit code 2 and print `<subcommand>: not implemented` to stderr.
- `deno run cli/mod.ts --version` prints `0.0.0-dev`.
- `cli/deno.json` declares `name`, `version`, `exports`, and a `bin` entry pointing at `cli/mod.ts` (so `deno install` works).
- `deno publish --dry-run` from `cli/` succeeds.

## Suggested skeleton

```ts
// cli/mod.ts
import { parseArgs } from "jsr:@std/cli/parse-args"
import { check } from "./check.ts"
import { fmt } from "./fmt.ts"
import { build } from "./build.ts"
import { run } from "./run.ts"

const VERSION = "0.0.0-dev"

async function main(argv: string[]): Promise<number> {
    // parse subcommand, dispatch, return exit code
}

Deno.exit(await main(Deno.args))
```

```json
// cli/deno.json
{
    "name": "@espresso/shot",
    "version": "0.0.0",
    "exports": "./mod.ts",
    "bin": {
        "shot": "./mod.ts"
    }
}
```

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript/cli
deno run mod.ts --help
deno run mod.ts check; echo "exit: $?"
deno run mod.ts run nope.shot; echo "exit: $?"
deno publish --dry-run
```

## Notes
- Use `@std/cli/parse-args` from JSR. No third-party CLI framework.
- Don't add flags yet — those come in their respective tasks.
- The `run` subcommand should accept positional args (it'll need passthrough via `--` later, but for now just accept and ignore them).
- `deno install -gn shot ./mod.ts` works locally during development without publishing.
- See `docs/ARCHITECTURE.md` for the overall layout.
