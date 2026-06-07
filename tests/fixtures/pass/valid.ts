// Valid ShotScript TypeScript — all rules pass

export type User = {
    readonly id: number
    readonly name: string
    readonly email: string | null
}

export type Result<T> = [T | null, Error | null]

export function divide(a: number, b: number): Result<number> {
    if (b === 0) {
        return [null, new Error("divide by zero")]
    }
    return [a / b, null]
}

export function formatName(user: User): string {
    return `${user.name} (${user.id.toString()})`
}

export function isActive(id: number): boolean {
    return id > 0
}

const ids: readonly number[] = [1, 2, 3]

export function sumIds(nums: readonly number[]): number {
    return nums.reduce(function add(acc: number, n: number): number {
        return acc + n
    }, 0)
}

export { ids }
