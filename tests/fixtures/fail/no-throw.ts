// Violates: no-throw, no-try
export function risky(x: number): number {
    try {
        if (x < 0) throw new Error("negative")
        return x
    } catch (e) {
        throw e
    }
}
