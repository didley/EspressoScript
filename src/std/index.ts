/**
 * shotscript/std — safe wrappers for globals that throw.
 *
 * Every function here returns [value, error] instead of throwing.
 * These are the canonical replacements for the globals banned by
 * the no-throwing-globals rule.
 *
 * Usage:
 *   import { toResult, toPromiseResult, jsonParse, jsonStringify, safeFetch } from "shotscript/std"
 */
export type Result<T, E extends Error = Error> = [T, null] | [null, E]

/**
 * A Promise that resolves to a Result tuple — the async equivalent of Result<T, E>.
 * Use as the return type of any async function that can fail.
 *
 *   async function fetchUser(id: number): PromiseResult<User> {
 *     const [res, err] = await safeFetch(`/users/${id}`)
 *     if (err !== null) { return [null, err] }
 *     return jsonParse<User>(await res.text())
 *   }
 */
export type PromiseResult<T, E extends Error = Error> = Promise<Result<T, E>>

/**
 * Wraps any synchronous call that might throw.
 * Use for third-party library calls that ShotScript can't detect.
 *
 *   const [value, err] = toResult(function parse(): ParsedData { return someLib.parse(input) })
 */
export function toResult<T>(fn: () => T): Result<T> {
    try {
        return [fn(), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(String(e))]
    }
}

/**
 * Wraps any async call that might reject.
 * Use for third-party async functions that return a plain Promise.
 *
 *   const [value, err] = await toPromiseResult(function fetchData(): Promise<Data> { return someLib.fetchData(id) })
 */
export async function toPromiseResult<T>(fn: () => Promise<T>): PromiseResult<T> {
    try {
        return [await fn(), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(String(e))]
    }
}

/**
 * Safe JSON.parse — replaces the banned JSON.parse global.
 * Returns [parsed, null] on success, [null, Error] on invalid JSON.
 *
 *   const [data, err] = jsonParse<User>(text)
 */
export function jsonParse<T>(text: string): Result<T> {
    try {
        return [JSON.parse(text) as T, null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`JSON.parse failed: ${String(e)}`)]
    }
}

/**
 * Safe JSON.stringify — replaces the banned JSON.stringify global.
 * Throws only on circular references or BigInt values; both are surfaced as Error.
 *
 *   const [json, err] = jsonStringify(value)
 */
export function jsonStringify(value: unknown, indent: number | null = null): Result<string> {
    try {
        return [JSON.stringify(value, null, indent ?? undefined), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`JSON.stringify failed: ${String(e)}`)]
    }
}

/**
 * Safe fetch — replaces the banned global fetch.
 * Network errors (DNS failure, timeout, etc.) surface as Error.
 * HTTP error status codes are NOT treated as errors here — check res.ok yourself.
 *
 *   const [res, err] = await safeFetch("https://api.example.com/users/1")
 *   if (err !== null) { return [null, err] }
 *   if (!res.ok) { return [null, new Error(`HTTP ${res.status.toString()}`)] }
 */
export async function safeFetch(url: string | URL, init: RequestInit | null = null): PromiseResult<Response> {
    try {
        const res = await fetch(url, init ?? undefined)
        return [res, null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`fetch failed: ${String(e)}`)]
    }
}

/**
 * Adds context to a propagated error — the ShotScript equivalent of Go's fmt.Errorf("context: %w", err).
 * Sets err.cause (ES2022) so the original error remains inspectable.
 *
 *   const [data, err] = jsonParse<Config>(text)
 *   if (err !== null) { return [null, wrapError(`loadConfig: ${path}`, err)] }
 */
export function wrapError(message: string, cause: Error): Error {
    const err = new Error(message)
    err.cause = cause
    return err
}

/**
 * Safe URL constructor — replaces the banned `new URL(str)` which throws on malformed input.
 * Returns [URL, null] on success, [null, Error] on invalid URL string.
 *
 *   const [url, err] = safeURL(rawInput)
 *   if (err !== null) { return [null, err] }
 */
export function safeURL(url: string, base: string | null = null): Result<URL> {
    try {
        return [new URL(url, base ?? undefined), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`Invalid URL: ${String(e)}`)]
    }
}

/**
 * Safe decodeURIComponent — replaces the banned `decodeURIComponent()` which throws on malformed sequences.
 * Returns [decoded, null] on success, [null, Error] on invalid percent-encoding.
 *
 *   const [decoded, err] = safeDecodeURIComponent(rawStr)
 */
export function safeDecodeURIComponent(str: string): Result<string> {
    try {
        return [decodeURIComponent(str), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`decodeURIComponent failed: ${String(e)}`)]
    }
}

/**
 * Safe decodeURI — replaces the banned `decodeURI()` which throws on malformed sequences.
 * Returns [decoded, null] on success, [null, Error] on invalid percent-encoding.
 *
 *   const [decoded, err] = safeDecodeURI(rawStr)
 */
export function safeDecodeURI(str: string): Result<string> {
    try {
        return [decodeURI(str), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`decodeURI failed: ${String(e)}`)]
    }
}

/**
 * Safe atob — replaces the banned `atob()` which throws on invalid base64 input.
 * Returns [decoded, null] on success, [null, Error] on invalid input.
 *
 *   const [bin, err] = safeAtob(base64Str)
 */
export function safeAtob(data: string): Result<string> {
    try {
        return [atob(data), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`atob failed: ${String(e)}`)]
    }
}

/**
 * Safe btoa — replaces the banned `btoa()` which throws on non-Latin1 characters.
 * Returns [encoded, null] on success, [null, Error] on invalid input.
 *
 *   const [b64, err] = safeBtoa(binaryStr)
 */
export function safeBtoa(data: string): Result<string> {
    try {
        return [btoa(data), null]
    } catch (e) {
        if (e instanceof Error) {
            return [null, e]
        }
        return [null, new Error(`btoa failed: ${String(e)}`)]
    }
}

