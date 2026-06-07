// Violates: no-floating-promises
export type PromiseResult<T> = Promise<[T | null, Error | null]>

export async function fetchData(): PromiseResult<string> {
    return ["hello", null]
}

export async function main(): Promise<void> {
    fetchData()
}
