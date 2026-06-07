# ShotScriptStd

Safe, non-throwing wrappers for the globals ShotScript bans. Every function returns a tuple — never throws. Import from `shotscript/utils`.

```ts
import { jsonParse, jsonStringify, safeFetch, wrapError, toResult, toPromiseResult } from "shotscript/utils"
import type { Result, PromiseResult } from "shotscript/utils"
```

## Types

### `Result<T, E>`
```ts
type Result<T, E extends Error = Error> = [T, null] | [null, E]
```
The sync result tuple. Return type of all fallible synchronous functions.

### `PromiseResult<T, E>`
```ts
type PromiseResult<T, E extends Error = Error> = Promise<Result<T, E>>
```
The async result tuple. Return type of all fallible async functions.

## Functions

### `jsonParse<T>(str)`
Wraps `JSON.parse`.
```ts
function jsonParse<T>(str: string): Result<T>
```
```ts
const [data, err] = jsonParse<User>(text)
```

### `jsonStringify(val, indent?)`
Wraps `JSON.stringify`.
```ts
function jsonStringify(value: unknown, indent?: number | null): Result<string>
```
```ts
const [json, err] = jsonStringify(user, 2)
```

### `safeFetch(url, init?)`
Wraps `globalThis.fetch`. Network errors surface as `Error`; HTTP status codes are not errors — check `res.ok`.
```ts
function safeFetch(url: string | URL, init?: RequestInit | null): PromiseResult<Response>
```
```ts
const [res, fetchErr] = await safeFetch(`/users/${id.toString()}`)
if (fetchErr !== null) { return [null, fetchErr] }
if (!res.ok) { return [null, new Error(`HTTP ${res.status.toString()}`)] }
```

### `wrapError(message, cause)`
Adds context to a propagated error — the ShotScript equivalent of Go's `fmt.Errorf("context: %w", err)`. Sets `err.cause` (ES2022) so the original error stays inspectable.
```ts
function wrapError(message: string, cause: Error): Error
```
```ts
const [data, err] = jsonParse<Config>(text)
if (err !== null) { return [null, wrapError(`loadConfig: ${path}`, err)] }
```

### `toResult<T>(fn)`
Wraps any synchronous call that might throw.
```ts
function toResult<T>(fn: () => T): Result<T>
```
```ts
const [parsed, err] = toResult(() => someLib.parseSync(input))
```

### `toPromiseResult<T>(fn)`
Wraps any async call that might reject.
```ts
function toPromiseResult<T>(fn: () => Promise<T>): PromiseResult<T>
```
```ts
const [result, err] = await toPromiseResult(() => db.query(sql))
```

## Usage example

```ts
import { safeFetch, jsonParse } from "shotscript/utils"
import type { PromiseResult } from "shotscript/utils"

type User = { readonly id: number; readonly name: string }

async function getUser(id: number): PromiseResult<User> {
    const [res, fetchErr] = await safeFetch(`/users/${id.toString()}`)
    if (fetchErr !== null) { return [null, fetchErr] }
    if (!res.ok) { return [null, new Error(`HTTP ${res.status.toString()}`)] }
    return jsonParse<User>(await res.text())
}
```
