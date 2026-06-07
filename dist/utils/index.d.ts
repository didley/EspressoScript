/**
 * shotscript/utils — safe wrappers for globals that throw.
 *
 * Every function here returns [value, error] instead of throwing.
 * These are the canonical replacements for the globals banned by
 * the no-throwing-globals rule.
 *
 * Usage:
 *   import { toResult, toPromiseResult, jsonParse, jsonStringify, safeFetch } from "shotscript/utils"
 */
export type Result<T, E extends Error = Error> = [T, null] | [null, E];
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
export type PromiseResult<T, E extends Error = Error> = Promise<Result<T, E>>;
/**
 * Wraps any synchronous call that might throw.
 * Use for third-party library calls that ShotScript can't detect.
 *
 *   const [value, err] = toResult(() => someLib.parse(input))
 */
export declare function toResult<T>(fn: () => T): Result<T>;
/**
 * Wraps any async call that might reject.
 * Use for third-party async functions that return a plain Promise.
 *
 *   const [value, err] = await toPromiseResult(() => someLib.fetchData(id))
 */
export declare function toPromiseResult<T>(fn: () => Promise<T>): PromiseResult<T>;
/**
 * Safe JSON.parse — replaces the banned JSON.parse global.
 * Returns [parsed, null] on success, [null, Error] on invalid JSON.
 *
 *   const [data, err] = jsonParse<User>(text)
 */
export declare function jsonParse<T>(text: string): Result<T>;
/**
 * Safe JSON.stringify — replaces the banned JSON.stringify global.
 * Throws only on circular references or BigInt values; both are surfaced as Error.
 *
 *   const [json, err] = jsonStringify(value)
 */
export declare function jsonStringify(value: unknown, indent?: number | null): Result<string>;
/**
 * Safe fetch — replaces the banned global fetch.
 * Network errors (DNS failure, timeout, etc.) surface as Error.
 * HTTP error status codes are NOT treated as errors here — check res.ok yourself.
 *
 *   const [res, err] = await safeFetch("https://api.example.com/users/1")
 *   if (err !== null) { return [null, err] }
 *   if (!res.ok) { return [null, new Error(`HTTP ${res.status.toString()}`)] }
 */
export declare function safeFetch(url: string | URL, init?: RequestInit | null): PromiseResult<Response>;
/**
 * Adds context to a propagated error — the ShotScript equivalent of Go's fmt.Errorf("context: %w", err).
 * Sets err.cause (ES2022) so the original error remains inspectable.
 *
 *   const [data, err] = jsonParse<Config>(text)
 *   if (err !== null) { return [null, wrapError(`loadConfig: ${path}`, err)] }
 */
export declare function wrapError(message: string, cause: Error): Error;
//# sourceMappingURL=index.d.ts.map