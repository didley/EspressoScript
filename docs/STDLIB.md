# `shot:std`

The standard library. Ships as `@shotscript/std` on JSR; imported via the branded `shot:std` specifier in `.shot` source.

Every function in `shot:std` returns a tuple — never throws. Internal `try`/`catch` is hidden inside the wrappers; users never see it.

## v1 surface

```ts
import { fetch, jsonParse, jsonStringify, readFile, writeFile, wrapError, mutableRef, toResult, toPromiseResult } from "shot:std"
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
Wraps `node:fs/promises` `readFile`.
```ts
function readFile(path: string): Promise<[string | null, Error | null]>
```

### `writeFile(path, data)`
Wraps `node:fs/promises` `writeFile`.
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

### `mutableRef<T>(initial)`
Returns a single-slot mutable cell — the canonical way to hold mutable state when `no-let-outside-for` bans `let` in function bodies and module scope.
```ts
function mutableRef<T>(initial: T): { value: T }
```
```ts
const count = mutableRef(0)
count.value += 1
```

### `toResult<T>(fn)`
Wraps any synchronous third-party call that might throw. Use when importing `bun:*` or `node:*` APIs that don't return tuples.
```ts
function toResult<T>(fn: () => T): [T | null, Error | null]
```
```ts
const [parsed, err] = toResult(() => someLib.parseSync(input))
```

### `toPromiseResult<T>(fn)`
Wraps any async third-party call that might reject. Use when importing `bun:*` or `node:*` APIs that return plain Promises.
```ts
function toPromiseResult<T>(fn: () => Promise<T>): Promise<[T | null, Error | null]>
```
```ts
const [result, err] = await toPromiseResult(() => db.query(sql))
```

### `ShotPromise<T, E>` _(type)_
The canonical return type for async fallible functions.
```ts
type ShotPromise<T, E = Error> = Promise<[T | null, E | null]>
```
Use it to type async functions that return errors as values:
```ts
async function queryUser(id: number): ShotPromise<User> {
    const [res, err] = await fetch(`/users/${id.toString()}`)
    if (err !== null) { return [null, err] }
    return jsonParse<User>(await res.text())
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
- Errors from stdlib wrappers are returned as `Error` instances.
- Async functions return `ShotPromise<T>`. Sync functions return `[T | null, Error | null]`.

## Out of scope for v1

- Streams, sockets, child processes
- Cryptography helpers
- Path manipulation utilities
- HTTP server (`serve` is deferred — needs a cross-runtime API)
- Anything beyond the functions listed above

Future stdlib additions should follow the same tuple convention and be added to this document.
