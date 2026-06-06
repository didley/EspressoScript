import { safeFetch, jsonParse } from "shot-lint/utils"
import type { PromiseResult } from "shot-lint/utils"

type User = {
    readonly id: number
    readonly name: string
    readonly email: string
}

export async function fetchUser(id: number): PromiseResult<User> {
    const url = `https://jsonplaceholder.typicode.com/users/${id.toString()}`
    const [res, fetchErr] = await safeFetch(url)
    if (fetchErr !== null) {
        return [null, fetchErr]
    }
    if (!res.ok) {
        return [null, new Error(`HTTP ${res.status.toString()} fetching user ${id.toString()}`)]
    }
    return jsonParse<User>(await res.text())
}

async function main(): Promise<void> {
    const [user, err] = await fetchUser(1)
    if (err !== null) {
        console.error(`error: ${err.message}`)
        process.exit(1)
    }
    console.log(`name:  ${user.name}`)
    console.log(`email: ${user.email}`)
}

void main()
