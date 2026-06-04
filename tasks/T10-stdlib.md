# T10 — `shot:std` package

## Goal
Implement the v1 standard library as a Deno-runnable TypeScript module, with a JSR publish config. Do **not** publish to JSR in this task — only prepare the layout.

## Dependencies
None for the implementation (it's a standalone module). T09 is useful for end-to-end testing.

## Files to create
- `stdlib/mod.ts` — five tuple-returning wrappers
- `stdlib/deno.json` — JSR publish config (`name`, `version`, `exports`)
- `stdlib/README.md` — short usage note pointing back to `docs/STDLIB.md`

## Implementation

### `stdlib/mod.ts`

Each function follows the tuple pattern. Internal `try`/`catch` is used here — stdlib is the only place this is acceptable, because it's the abstraction layer hiding throws from `.shot` user code.

```ts
// stdlib/mod.ts

export async function fetch(
    input: string | URL,
    init?: RequestInit,
): Promise<[Response | null, Error | null]> {
    try {
        const res = await globalThis.fetch(input, init)
        return [res, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export function jsonParse<T>(str: string): [T | null, Error | null] {
    try {
        return [JSON.parse(str) as T, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export function jsonStringify(
    value: unknown,
    indent?: number,
): [string | null, Error | null] {
    try {
        return [JSON.stringify(value, null, indent), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export async function readFile(path: string): Promise<[string | null, Error | null]> {
    try {
        return [await Deno.readTextFile(path), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export async function writeFile(path: string, data: string): Promise<[null, Error | null]> {
    try {
        await Deno.writeTextFile(path, data)
        return [null, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}
```

### `stdlib/deno.json`

```json
{
    "name": "@espresso/std",
    "version": "0.0.1",
    "exports": "./mod.ts"
}
```

(JSR scope ownership is out of scope for this task — assume `@espresso` is reserved.)

## Acceptance criteria
- `cd stdlib && deno check mod.ts` passes with no errors.
- `cd stdlib && deno publish --dry-run` reports a valid package (no actual publish).
- An ad-hoc consumer test passes:
  ```ts
  // /tmp/consume.ts (plain .ts, not .shot, for direct testing)
  import { jsonParse } from "../stdlib/mod.ts"
  const [v, err] = jsonParse<{ x: number }>("{\"x\":42}")
  console.log(err === null ? v?.x : err.message)
  ```

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript/stdlib
deno check mod.ts
echo "exit: $?"
deno publish --dry-run

# End-to-end via shot run (depends on T09)
cd /var/home/dylanlamont/Developer/EspressoScript
cat > /tmp/use-std.shot <<'EOF'
import { jsonStringify } from "shot:std"
const [out, err] = jsonStringify({ hello: "world" }, 2)
if (err === null && out !== null) { console.log(out) }
EOF
deno run -A cli/mod.ts run /tmp/use-std.shot
```

The end-to-end case requires the rewriter (T08) to map `shot:std` → `jsr:@espresso/std`. Since `@espresso/std` is **not yet published**, this last verification will fail with a JSR resolution error. That's expected for v1 — document it clearly and either:
(a) test against a local `deno.json` import map that maps `jsr:@espresso/std` to `../stdlib/mod.ts`, or
(b) skip the end-to-end test until publish happens.

Recommended: (a) — add a `SHOT_STDLIB_LOCAL=<path>` env var that, when set, makes `writeImportMap()` in `cli/pipeline.ts` map `shot:std` directly to the local file instead of the JSR scope. This is a one-line change in the pipeline. Add as a follow-up task if it grows past trivial.

## Notes
- See `docs/STDLIB.md` for the canonical signatures.
- The fully `try`/`catch`-based implementation here is the **one place** in the codebase where throws are caught. Document this in `stdlib/mod.ts` with a single comment at the top of the file.
- Don't add error subclasses, error codes, or context wrapping — keep v1 minimal.
