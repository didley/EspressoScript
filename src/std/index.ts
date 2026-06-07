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
    return toResult(function p(): T { return JSON.parse(text) as T })
}

/**
 * Safe JSON.stringify — replaces the banned JSON.stringify global.
 * Throws only on circular references or BigInt values; both are surfaced as Error.
 *
 *   const [json, err] = jsonStringify(value)
 */
export function jsonStringify(value: unknown, indent: number | null = null): Result<string> {
    return toResult(function s(): string { return JSON.stringify(value, null, indent ?? undefined) })
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
    return toPromiseResult(function f(): Promise<Response> { return fetch(url, init ?? undefined) })
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
    return toResult(function u(): URL { return new URL(url, base ?? undefined) })
}

/**
 * Safe decodeURIComponent — replaces the banned `decodeURIComponent()` which throws on malformed sequences.
 * Returns [decoded, null] on success, [null, Error] on invalid percent-encoding.
 *
 *   const [decoded, err] = safeDecodeURIComponent(rawStr)
 */
export function safeDecodeURIComponent(str: string): Result<string> {
    return toResult(function d(): string { return decodeURIComponent(str) })
}

/**
 * Safe decodeURI — replaces the banned `decodeURI()` which throws on malformed sequences.
 * Returns [decoded, null] on success, [null, Error] on invalid percent-encoding.
 *
 *   const [decoded, err] = safeDecodeURI(rawStr)
 */
export function safeDecodeURI(str: string): Result<string> {
    return toResult(function d(): string { return decodeURI(str) })
}

/**
 * Safe atob — replaces the banned `atob()` which throws on invalid base64 input.
 * Returns [decoded, null] on success, [null, Error] on invalid input.
 *
 *   const [bin, err] = safeAtob(base64Str)
 */
export function safeAtob(data: string): Result<string> {
    return toResult(function a(): string { return atob(data) })
}

/**
 * Safe btoa — replaces the banned `btoa()` which throws on non-Latin1 characters.
 * Returns [encoded, null] on success, [null, Error] on invalid input.
 *
 *   const [b64, err] = safeBtoa(binaryStr)
 */
export function safeBtoa(data: string): Result<string> {
    return toResult(function b(): string { return btoa(data) })
}

/**
 * Exhaustive-switch helper — call in the default branch to assert a value is never.
 * The `never` type guarantees this is only reachable if the exhaustiveness check
 * fails at runtime due to a bad cast.
 *
 *   switch (direction) {
 *     case 'left': ...; break
 *     case 'right': ...; break
 *     default: assertNever(direction)
 *   }
 */
export function assertNever(x: never): never {
    throw new Error('unreachable: ' + JSON.stringify(x))
}

/**
 * Safe RegExp constructor — replaces `new RegExp(...)` which throws on invalid patterns.
 * Returns [RegExp, null] on success, [null, Error] on invalid pattern.
 *
 *   const [re, err] = safeRegex('^foo.*', 'i')
 */
export function safeRegex(pattern: string, flags: string | null = null): Result<RegExp> {
    return toResult(function r(): RegExp { return new RegExp(pattern, flags ?? undefined) })
}

/**
 * Safe Date constructor — replaces `new Date(...)` which silently produces an invalid Date.
 * Returns [Date, null] on success, [null, Error] if the input produces an invalid date.
 *
 *   const [d, err] = safeDate('2024-01-15')
 */
export function safeDate(input: string | number): Result<Date> {
    const d = new Date(input)
    if (Number.isNaN(d.getTime())) {
        return [null, new Error(`Invalid date: ${String(input)}`)]
    }
    return [d, null]
}

/**
 * Safe number parser — fails on NaN instead of returning it silently.
 * Returns [number, null] on success, [null, Error] if the result is NaN.
 *
 *   const [n, err] = safeNumber('42')
 */
export function safeNumber(str: string): Result<number> {
    const n = Number(str)
    if (Number.isNaN(n)) {
        return [null, new Error(`Cannot convert to number: ${JSON.stringify(str)}`)]
    }
    return [n, null]
}

/**
 * Safe structuredClone — replaces the bare `structuredClone()` which throws on non-cloneable values.
 * Returns [cloned, null] on success, [null, Error] if the value cannot be cloned.
 *
 *   const [copy, err] = safeStructuredClone(value)
 */
export function safeStructuredClone<T>(value: T): Result<T> {
    return toResult(function c(): T { return structuredClone(value) })
}

/**
 * Safe BigInt constructor — replaces `BigInt(...)` which throws on invalid input.
 * Returns [bigint, null] on success, [null, Error] on invalid input.
 *
 *   const [n, err] = safeBigInt('12345678901234567890')
 */
export function safeBigInt(str: string): Result<bigint> {
    return toResult(function b(): bigint { return BigInt(str) })
}
