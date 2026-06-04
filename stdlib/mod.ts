// stdlib is the only place in the shot codebase where try/catch is used.
// These wrappers hide throws from .shot user code via the tuple-return pattern.

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
        return [await Deno.readTextFile(path), null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}

export async function writeFile(path: string, data: string): Promise<[null, Error | null]> {
    try {
        await Deno.writeTextFile(path, data)
        return [null, null]
    } catch (e) {
        return [null, e instanceof Error ? e : new Error(String(e))]
    }
}
