// Violates: no-async-without-await
export type Result<T> = [T, null] | [null, Error]
export type PromiseResult<T> = Promise<Result<T>>

export async function computeHash(input: string): PromiseResult<string> {
    return [input, null]
}
