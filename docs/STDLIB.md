# `shot:std`

The standard library. Ships as `@shotscript/std` on JSR; imported via the branded `shot:std` specifier in `.shot` source.

Every function in `shot:std` returns a tuple — never throws. Internal `try`/`catch` is hidden inside the wrappers; users never see it.

## v1 surface

```ts
import { fetch, jsonParse, jsonStringify, readFile, writeFile } from "shot:std"
```

### `fetch(url, opts?)`
Wraps `globalThis.fetch`.
```ts
function fetch(
    input: string | URL,
    init?: RequestInit,
): Promise<[Response | null, Error | null]>
```

### `jsonParse<T>(str)`
Wraps `JSON.parse` with a caller-supplied type.
```ts
function jsonParse<T>(str: string): [T | null, Error | null]
```

### `jsonStringify(val)`
Wraps `JSON.stringify`.
```ts
function jsonStringify(value: unknown, indent?: number): [string | null, Error | null]
```

### `readFile(path)`
Wraps `Deno.readTextFile`.
```ts
function readFile(path: string): Promise<[string | null, Error | null]>
```

### `writeFile(path, data)`
Wraps `Deno.writeTextFile`.
```ts
function writeFile(path: string, data: string): Promise<[null, Error | null]>
```
The first tuple element is always `null` for void-returning operations — the destructure pattern stays uniform.

## Usage example

```ts
import { fetch, jsonParse, writeFile } from "shot:std"

type User = { id: number; name: string }

async function downloadUser(id: number, outPath: string): Promise<[null, Error | null]> {
    const [res, fetchErr] = await fetch(`https://api.example.com/users/${id}`)
    if (fetchErr !== null) { return [null, fetchErr] }

    const text = await res.text()
    const [user, parseErr] = jsonParse<User>(text)
    if (parseErr !== null) { return [null, parseErr] }

    const [stringified, stringifyErr] = jsonStringify(user, 2)
    if (stringifyErr !== null) { return [null, stringifyErr] }

    return await writeFile(outPath, stringified)
}
```

## Implementation conventions

- All wrappers internally use `try`/`catch` to convert thrown errors into the second tuple slot. The ban on `try`/`catch` applies to `.shot` user code; stdlib is `.ts` and exempt.
- Errors are returned as instances of `Error` (or subclasses). Custom error types are out-of-scope for v1.
- Async functions return `Promise<[T | null, Error | null]>`. Sync functions return `[T | null, Error | null]`.

## Out of scope for v1

- Streams, sockets, child processes
- Cryptography helpers
- Path manipulation utilities
- HTTP server helpers
- Anything beyond the five functions listed above

Future stdlib additions should follow the same tuple convention and be added to this document.
