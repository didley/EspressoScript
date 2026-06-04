# T09 — `shot run` pipeline

## Goal
Implement `shot run`: lint, then `deno run --check=all` with import map. Type errors block execution.

## Dependencies
T08.

## Files to create
- `cli/run.ts`

## Files to modify
- `cli/mod.ts` — dispatch

## Behavior

```
shot run <file.shot> [-- deno-flags-and-script-args...]
```

- Exactly one positional `.shot` file. Multiple files = error (exit 2).
- Everything after `--` is forwarded to `deno run`.
- The combined invocation:
  ```
  deno run --check=all --config=<tempjson> --ext=ts [user-flags] <file.shot> [-- script-args]
  ```
  Note: `deno run`'s own `--` convention separates deno flags from script args. We pass through the user's entire tail as-is.

### Default permissions
None. `shot run` invokes deno with no permission flags. Users opt in:
```
shot run hello.shot -- --allow-net
shot run hello.shot -- --allow-net --allow-read=./config
```

### Type-check gating
`--check=all` makes deno type-check the **entire module graph** before execution. If types fail, the program does not run.

## Implementation sketch

```ts
// cli/run.ts
import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup } from "./pipeline.ts"

export async function runCmd(args: string[]): Promise<number> {
    const sep = args.indexOf("--")
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    if (positional.length !== 1) {
        console.error("shot run: expected exactly one .shot file")
        return 2
    }
    const file = positional[0]

    // Lint
    const source = await Deno.readTextFile(file)
    const diagnostics = check(file, source)
    for (const d of diagnostics) {
        console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
    }
    if (diagnostics.length > 0) return 1

    // Import map
    const configPath = await writeImportMap()

    try {
        // Type-check + run in one invocation
        const cmd = new Deno.Command("deno", {
            args: [
                "run",
                "--check=all",
                `--config=${configPath}`,
                "--ext=ts",
                ...passthrough,
                file,
            ],
            stdout: "inherit",
            stderr: "inherit",
        })
        const { code } = await cmd.output()
        return code
    } finally {
        await cleanup(configPath)
    }
}
```

## Acceptance criteria
- Hello-world runs and prints output.
- Permission-needing program fails without flags, succeeds with `-- --allow-net` (etc).
- A file with a type error never executes — verified by a sentinel test: the program writes a sentinel file as its first action, runs, then has a type error later. After `shot run`, the sentinel must NOT exist.
- A file with a lint error never executes (same sentinel test).
- `shot run a.shot b.shot` → exit 2.

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript

# 1) Hello world (no permissions needed)
cat > /tmp/hello.shot <<'EOF'
function main(): void { console.log("hello from shot") }
main()
EOF
deno run -A cli/mod.ts run /tmp/hello.shot
echo "exit: $?"

# 2) Type error blocks execution
rm -f /tmp/sentinel
cat > /tmp/bad.shot <<'EOF'
import { writeFile } from "shot:std"
const [_, err] = await writeFile("/tmp/sentinel", "executed")
if (err !== null) { console.log(err.message) }
const x: number = "this is a type error"
console.log(x)
EOF
deno run -A cli/mod.ts run /tmp/bad.shot -- --allow-write 2>&1
echo "exit: $?"
test ! -f /tmp/sentinel && echo "OK: sentinel not written"

# 3) Permission passthrough
cat > /tmp/needs-net.shot <<'EOF'
const [_, err] = await fetch("https://example.com")
if (err !== null) { console.log("err: " + err.message) }
EOF
deno run -A cli/mod.ts run /tmp/needs-net.shot 2>&1                 # permission error
deno run -A cli/mod.ts run /tmp/needs-net.shot -- --allow-net 2>&1  # succeeds
```

## Notes
- `--check=all` is the single command that gates execution on type-check success. No separate `deno check` step.
- The sentinel test is the critical assertion that compile-language UX is preserved.
- See `docs/CLI.md` "Permission posture".
