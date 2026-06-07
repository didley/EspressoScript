/**
 * Wraps any synchronous call that might throw.
 * Use for third-party library calls that ShotScript can't detect.
 *
 *   const [value, err] = toResult(() => someLib.parse(input))
 */
export function toResult(fn) {
    try {
        return [fn(), null];
    }
    catch (e) {
        if (e instanceof Error) {
            return [null, e];
        }
        return [null, new Error(String(e))];
    }
}
/**
 * Wraps any async call that might reject.
 * Use for third-party async functions that return a plain Promise.
 *
 *   const [value, err] = await toPromiseResult(() => someLib.fetchData(id))
 */
export async function toPromiseResult(fn) {
    try {
        return [await fn(), null];
    }
    catch (e) {
        if (e instanceof Error) {
            return [null, e];
        }
        return [null, new Error(String(e))];
    }
}
/**
 * Safe JSON.parse — replaces the banned JSON.parse global.
 * Returns [parsed, null] on success, [null, Error] on invalid JSON.
 *
 *   const [data, err] = jsonParse<User>(text)
 */
export function jsonParse(text) {
    try {
        return [JSON.parse(text), null];
    }
    catch (e) {
        if (e instanceof Error) {
            return [null, e];
        }
        return [null, new Error(`JSON.parse failed: ${String(e)}`)];
    }
}
/**
 * Safe JSON.stringify — replaces the banned JSON.stringify global.
 * Throws only on circular references or BigInt values; both are surfaced as Error.
 *
 *   const [json, err] = jsonStringify(value)
 */
export function jsonStringify(value, indent = null) {
    try {
        return [JSON.stringify(value, null, indent ?? undefined), null];
    }
    catch (e) {
        if (e instanceof Error) {
            return [null, e];
        }
        return [null, new Error(`JSON.stringify failed: ${String(e)}`)];
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
export async function safeFetch(url, init = null) {
    try {
        const res = await fetch(url, init ?? undefined);
        return [res, null];
    }
    catch (e) {
        if (e instanceof Error) {
            return [null, e];
        }
        return [null, new Error(`fetch failed: ${String(e)}`)];
    }
}
/**
 * Adds context to a propagated error — the ShotScript equivalent of Go's fmt.Errorf("context: %w", err).
 * Sets err.cause (ES2022) so the original error remains inspectable.
 *
 *   const [data, err] = jsonParse<Config>(text)
 *   if (err !== null) { return [null, wrapError(`loadConfig: ${path}`, err)] }
 */
export function wrapError(message, cause) {
    const err = new Error(message);
    err.cause = cause;
    return err;
}
//# sourceMappingURL=index.js.map