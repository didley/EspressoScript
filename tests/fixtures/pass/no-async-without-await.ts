// Valid: all async functions have a direct await
export type Result<T> = [T, null] | [null, Error]
export type PromiseResult<T> = Promise<Result<T>>

export async function step1(x: string): PromiseResult<string> {
    const [val, err] = await step2(x)
    if (err !== null) { return [null, err] }
    return [val, null]
}

async function step2(x: string): PromiseResult<string> {
    const [val, err] = await step1(x)
    if (err !== null) { return [null, err] }
    return [val, null]
}
