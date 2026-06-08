---
page: std
badge: ShotScriptStd
title: "Safe wrappers. Never throws."
title_em: "Never throws."
sub: "The standard library. Every function returns a Result or PromiseResult tuple — no throws, no hidden control flow. The primitives the lint rules require."
---

> **Import:** `import { safeFetch, jsonParse, wrapError } from 'shotscript/std'`
> `import type { Result, PromiseResult } from 'shotscript/std'`

---

{label} Types

:::fn[Result<T, E>|type]{Result}
The canonical return type for synchronous fallible functions. A discriminated tuple — either `[T, null]` on success or `[null, E]` on failure. `E` defaults to `Error`.

```ts
type Result<T, E = Error> = [T, null] | [null, E]

function parseConfig(src: string): Result<Config> {
    return jsonParse<Config>(src)
}
```
:::

:::fn[PromiseResult<T, E>|type]{PromiseResult}
The canonical return type for async fallible functions. Shorthand for `Promise<Result<T, E>>`.

```ts
type PromiseResult<T, E = Error> =
    Promise<Result<T, E>>

async function queryUser(id: number): PromiseResult<User> {
    const [res, err] = await safeFetch(`/users/${id}`)
    if (err !== null) { return [null, err] }
    return jsonParse<User>(await res.text())
}
```
:::

---

{label} Functions

:::fn[safeFetch(url, opts?)|async]{safeFetch}
Wraps `globalThis.fetch`. Returns `[Response, null]` on success, `[null, Error]` on network failure. HTTP error status codes are not treated as errors — check `res.ok` yourself.

```ts
function safeFetch(
    input: string | URL,
    init: RequestInit | null,
): PromiseResult<Response>

const [res, err] = await safeFetch(`https://api.example.com/users/${id}`, null)
if (err !== null) { return [null, err] }
if (!res.ok) { return [null, new Error(`HTTP ${res.status}`)] }
```
:::

:::fn[jsonParse<T>(str)|sync]{jsonParse}
Wraps `JSON.parse`. Returns `[T, null]` or `[null, Error]` if parsing fails.

```ts
function jsonParse<T>(str: string): Result<T>

const [user, err] = jsonParse<User>(text)
```
:::

:::fn[jsonStringify(val, indent?)|sync]{jsonStringify}
Wraps `JSON.stringify`. Returns `[string, null]` or `[null, Error]` if serialization fails.

```ts
function jsonStringify(
    value: unknown,
    indent: number | null,
): Result<string>
```
:::

:::fn[wrapError(message, cause)|sync]{wrapError}
Adds context to a propagated error — the ShotScript equivalent of Go's `fmt.Errorf("context: %w", err)`. Sets `err.cause` so the original error is inspectable.

```ts
function wrapError(message: string, cause: Error): Error

const [res, err] = await safeFetch(url, null)
if (err !== null) {
    return [null, wrapError(`fetchUser: ${url}`, err)]
}
```
:::

:::fn[toResult<T>(fn)|sync]{toResult}
Wraps any synchronous dependency call that might throw — any library that doesn't return tuples.

```ts
function toResult<T>(fn: () => T): Result<T>

const [parsed, err] = toResult(function parse(): ParsedData { return someLib.parseSync(input) })
```
:::

:::fn[toPromiseResult<T>(fn)|async]{toPromiseResult}
Wraps any async dependency call that might reject — any library that returns plain Promises.

```ts
function toPromiseResult<T>(
    fn: () => Promise<T>,
): PromiseResult<T>

const [rows, err] = await toPromiseResult(function query(): Promise<Row[]> { return db.query(sql) })
```
:::

:::fn[safeURL(url, base?)|sync]{safeURL}
Safe URL constructor — replaces the banned `new URL(str)` which throws on malformed input. Returns `[URL, null]` on success, `[null, Error]` on invalid URL string.

```ts
function safeURL(url: string, base: string | null): Result<URL>

const [url, err] = safeURL(rawInput, null)
if (err !== null) { return [null, err] }
```
:::

:::fn[safeDecodeURIComponent(str)|sync]{safeDecodeURIComponent}
Safe `decodeURIComponent` — replaces the banned global which throws on malformed sequences. Returns `[decoded, null]` on success, `[null, Error]` on invalid percent-encoding.

```ts
function safeDecodeURIComponent(str: string): Result<string>

const [decoded, err] = safeDecodeURIComponent(rawStr)
```
:::

:::fn[safeDecodeURI(str)|sync]{safeDecodeURI}
Safe `decodeURI` — replaces the banned global which throws on malformed sequences. Returns `[decoded, null]` on success, `[null, Error]` on invalid percent-encoding.

```ts
function safeDecodeURI(str: string): Result<string>

const [decoded, err] = safeDecodeURI(rawStr)
```
:::

:::fn[safeAtob(data)|sync]{safeAtob}
Safe `atob` — replaces the banned global which throws on invalid base64 input. Returns `[decoded, null]` on success, `[null, Error]` on invalid input.

```ts
function safeAtob(data: string): Result<string>

const [bin, err] = safeAtob(base64Str)
```
:::

:::fn[safeBtoa(data)|sync]{safeBtoa}
Safe `btoa` — replaces the banned global which throws on non-Latin1 characters. Returns `[encoded, null]` on success, `[null, Error]` on invalid input.

```ts
function safeBtoa(data: string): Result<string>

const [b64, err] = safeBtoa(binaryStr)
```
:::

{label} Patterns

**External library facade** — when a library used in multiple places doesn't return `Result`/`PromiseResult` tuples, create a dedicated facade module. Wrap all its calls there, export `Result`/`PromiseResult`-returning functions, and have consumers import only from the facade. `toResult`/`toPromiseResult` stays confined to that one file.

```ts
// lib/db.ts — facade for the db library
import { db } from 'some-db'
import { toPromiseResult } from 'shotscript/std'
import type { PromiseResult } from 'shotscript/std'

export function dbFind(id: string): PromiseResult<Row> {
    return toPromiseResult(function find(): Promise<Row> { return db.find(id) })
}

export function dbInsert(row: Row): PromiseResult<void> {
    return toPromiseResult(function insert(): Promise<void> { return db.insert(row) })
}

// consumers import from the facade — never from the library directly
import { dbFind } from './lib/db'
const [row, err] = await dbFind(userId)
```
