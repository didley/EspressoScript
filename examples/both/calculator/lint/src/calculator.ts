import type { Result } from "shot-lint/utils"

export function add(a: number, b: number): number {
    return a + b
}

export function subtract(a: number, b: number): number {
    return a - b
}

export function multiply(a: number, b: number): number {
    return a * b
}

export function divide(a: number, b: number): Result<number> {
    if (b === 0) {
        return [null, new Error("division by zero")]
    }
    return [a / b, null]
}

function main(): void {
    console.log(`10 + 5 = ${add(10, 5).toString()}`)
    console.log(`10 - 5 = ${subtract(10, 5).toString()}`)
    console.log(`10 * 5 = ${multiply(10, 5).toString()}`)

    const [quotient, divErr] = divide(10, 5)
    if (divErr !== null) {
        console.error(`error: ${divErr.message}`)
        process.exit(1)
    }
    console.log(`10 / 5 = ${quotient.toString()}`)

    const [, zeroErr] = divide(10, 0)
    if (zeroErr !== null) {
        console.log(`10 / 0 → ${zeroErr.message}`)
    }
}

main()
