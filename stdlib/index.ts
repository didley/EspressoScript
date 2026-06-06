import * as fs from 'node:fs/promises'

// stdlib is the only place in the shot codebase where try/catch is used.
// These wrappers hide throws from .shot user code via the tuple-return pattern.

// Result<T, E> is the canonical return type for synchronous fallible functions.
// E defaults to Error but can be any plain type — no class extension required.
// Custom error shapes: type DbError = { readonly message: string; readonly code: number }
export type Result<T, E = Error> = [T, null] | [null, E]

// PromiseResult<T, E> is the canonical return type for async fallible functions.
export type PromiseResult<T, E = Error> = Promise<Result<T, E>>

// wrapError adds context to a propagated error — the shot equivalent of Go's fmt.Errorf("context: %w", err).
export function wrapError(message: string, cause: Error): Error {
    const err = new Error(message)
    err.cause = cause
    return err
}

// toResult wraps any synchronous third-party call that might throw.
// Use when importing bun:* or node:* APIs that don't return tuples.
export function toResult<T>(fn: () => T): Result<T> {
    try {
        return [fn(), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

// toPromiseResult wraps any async third-party call that might reject.
// Use when importing bun:* or node:* APIs that return plain Promises.
export async function toPromiseResult<T>(fn: () => Promise<T>): PromiseResult<T> {
    try {
        return [await fn(), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export async function safeFetch(
    input: string | URL,
    init?: RequestInit,
): PromiseResult<Response> {
    try {
        const res = await globalThis.fetch(input, init)
        return [res, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export function jsonParse<T>(str: string): Result<T> {
    try {
        return [JSON.parse(str) as T, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export function jsonStringify(
    value: unknown,
    indent?: number,
): Result<string> {
    try {
        return [JSON.stringify(value, null, indent), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export async function readFile(path: string): PromiseResult<string> {
    try {
        return [await fs.readFile(path, 'utf-8'), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export async function writeFile(path: string, data: string): Promise<[null, Error | null]> {
    try {
        await fs.writeFile(path, data, 'utf-8')
        return [null, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}
