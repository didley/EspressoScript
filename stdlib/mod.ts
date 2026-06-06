import * as fs from 'node:fs/promises'

// stdlib is the only place in the shot codebase where try/catch is used.
// These wrappers hide throws from .shot user code via the tuple-return pattern.

// ShotPromise<T, E> is the canonical return type for async fallible functions.
// E defaults to Error but can be any plain type — no class extension required.
// Custom error shapes: type DbError = { readonly message: string; readonly code: number }
export type ShotPromise<T, E = Error> = Promise<[T | null, E | null]>

// mutableRef returns a single-slot mutable cell — the canonical way to hold
// module-level state in .shot without `let` (which is banned outside for-headers).
export function mutableRef<T>(initial: T): { value: T } {
    return { value: initial }
}

// wrapError adds context to a propagated error — the shot equivalent of Go's fmt.Errorf("context: %w", err).
export function wrapError(message: string, cause: Error): Error {
    const err = new Error(message)
    err.cause = cause
    return err
}

// toResult wraps any synchronous third-party call that might throw.
// Use when importing bun:* or node:* APIs that don't return tuples.
export function toResult<T>(fn: () => T): [T | null, Error | null] {
    try {
        return [fn(), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

// toPromiseResult wraps any async third-party call that might reject.
// Use when importing bun:* or node:* APIs that return plain Promises.
export async function toPromiseResult<T>(fn: () => Promise<T>): Promise<[T | null, Error | null]> {
    try {
        return [await fn(), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

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

// serve bridges the ShotPromise<Response> handler to Deno.serve's expected signature.
// A [null, Error] result becomes a 500; a [Response, null] result is returned as-is.
export function serve(
    handler: (req: Request) => ShotPromise<Response>,
    port?: number,
): void {
    async function serveHandler(req: Request): Promise<Response> {
        try {
            const [res, err] = await handler(req)
            if (err !== null || res === null) {
                return new Response('{"error":"internal server error"}', {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                })
            }
            return res
        } catch (e) {
            console.error("serve: unhandled error in handler", e)
            return new Response('{"error":"internal server error"}', {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }
    }
    if (port !== undefined) {
        Deno.serve({ port }, serveHandler)
    } else {
        Deno.serve(serveHandler)
    }
}
