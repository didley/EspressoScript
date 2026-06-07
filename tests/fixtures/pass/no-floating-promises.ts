// Valid: all async calls are awaited or explicitly void-discarded
export type PromiseResult<T> = Promise<[T | null, Error | null]>

export async function fetchData(): PromiseResult<string> {
    return ["hello", null]
}

export async function processData(): Promise<void> {
    const [_val, _err] = await fetchData()
}

export async function fireAndForget(): Promise<void> {
    void fetchData()
}
