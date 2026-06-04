# T07 — `shot fmt` command

## Goal
Wire `shot fmt` to delegate to `deno fmt --ext ts`. Trivial passthrough.

## Dependencies
T01.

## Files to modify
- `cli/fmt.ts`
- `cli/mod.ts` — dispatch

## Implementation

```ts
// cli/fmt.ts
export async function fmtCmd(files: string[]): Promise<number> {
    const args = ["fmt", "--ext", "ts", ...(files.length > 0 ? files : [])]
    const cmd = new Deno.Command("deno", {
        args,
        stdout: "inherit",
        stderr: "inherit",
    })
    const { code } = await cmd.output()
    return code
}
```

## Acceptance criteria
- `shot fmt <file>` reformats the file in place.
- `shot fmt` with no args formats the current directory recursively.
- Deno's exit code is forwarded.
- Streams stdout/stderr (don't buffer — users want to see filenames as they're formatted).

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript
printf 'const x=1;function foo(  ){return x}\n' > /tmp/dirty.shot

deno run --allow-read --allow-write --allow-run=deno cli/mod.ts fmt /tmp/dirty.shot
cat /tmp/dirty.shot   # should be reformatted

# Idempotent
deno run --allow-read --allow-write --allow-run=deno cli/mod.ts fmt /tmp/dirty.shot
echo "exit: $?"   # 0
```

## Notes
- Permissions: subprocess invocation requires `--allow-run=deno`. Document this in the install snippet (`deno install` with the right `-A` posture or scoped flags).
- The `--ext ts` flag tells deno fmt to treat `.shot` files as TypeScript. Requires Deno ≥ 1.40.
- Don't run the linter from `fmt` — formatting and linting are independent.
