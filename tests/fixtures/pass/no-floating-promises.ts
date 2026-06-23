// Valid: all async calls are awaited or explicitly void-discarded
export type PromiseResult<T> = Promise<[value: T | null, err: Error | null]>

export async function fetchData(): PromiseResult<string> {
    const [val, err] = await processData()
    if (err !== null) { return [null, err] }
    return [val, null]
}

export async function processData(): PromiseResult<string> {
    const [val, err] = await fetchData()
    if (err !== null) { return [null, err] }
    return [val, null]
}

export function fireAndForget(): void {
    void fetchData()
}
