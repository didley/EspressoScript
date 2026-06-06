# `shot:std`

The standard library. Ships as `@shotscript/std` on JSR; imported via the branded `shot:std` specifier in `.shot` source.

Every function in `shot:std` returns a tuple — never throws. Internal `try`/`catch` is hidden inside the wrappers; users never see it.

## v1 surface

```ts
import { fetch, jsonParse, jsonStringify, readFile, writeFile, wrapError } from "shot:std"
import type { ShotPromise } from "shot:std"
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

### `wrapError(message, cause)`
Adds context to a propagated error. The shot equivalent of Go's `fmt.Errorf("context: %w", err)`.
```ts
function wrapError(message: string, cause: Error): Error
```
Sets `err.cause` (standard `Error.cause` from ES2022) so the original error is inspectable. Use this when re-returning an error from a lower layer with added context:
```ts
const [data, err] = await readFile(path)
if (err !== null) {
    return [null, wrapError(`loadConfig: ${path}`, err)]
}
```

### `ShotPromise<T, E = Error>` _(type)_
The canonical return type for async fallible functions. Equivalent to `Promise<[T | null, E | null]>`.
```ts
type ShotPromise<T, E = Error> = Promise<[T | null, E | null]>
```
`E` has no `extends Error` constraint — custom error shapes are plain `type` declarations, no class hierarchy required:
```ts
type DbError = { readonly message: string; readonly code: number }

async function queryUser(id: number): ShotPromise<User, DbError> {
    return [null, { message: "not found", code: 404 }]
}
```

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
- Errors from stdlib wrappers are returned as `Error` instances. User code may use any plain `type` as the `E` parameter of `ShotPromise<T, E>` — no class hierarchy needed.
- Async functions return `Promise<[T | null, Error | null]>`. Sync functions return `[T | null, Error | null]`.

## Out of scope for v1

- Streams, sockets, child processes
- Cryptography helpers
- Path manipulation utilities
- HTTP server helpers
- Anything beyond the five functions listed above

Future stdlib additions should follow the same tuple convention and be added to this document.
