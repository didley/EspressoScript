import { z } from 'zod'
import type { ZodType } from 'zod'

export { z }

export function parse<T>(schema: ZodType<T>, data: unknown): [T | null, Error | null] {
    const result = schema.safeParse(data)
    if (!result.success) {
        return [null, new Error(result.error.issues.map((i) => i.message).join(', '))]
    }
    return [result.data, null]
}
