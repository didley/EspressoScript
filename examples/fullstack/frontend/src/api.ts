import type { PromiseResult } from 'shot-lint/utils'
import { jsonParse, jsonStringify, safeFetch } from 'shot-lint/utils'

export type Item = {
    readonly id: number
    readonly title: string
}

export async function fetchItems(): PromiseResult<readonly Item[]> {
    const [res, err] = await safeFetch('http://localhost:8000/items')
    if (err !== null) return [null, err]
    if (!res.ok) return [null, new Error(`HTTP ${res.status}`)]
    const [items, parseErr] = jsonParse<readonly Item[]>(await res.text())
    if (parseErr !== null) return [null, parseErr]
    if (items === null) return [null, new Error('empty response')]
    return [items, null]
}

export async function addItem(title: string): PromiseResult<Item> {
    const [body, bodyErr] = jsonStringify({ title })
    if (bodyErr !== null) return [null, bodyErr]
    if (body === null) return [null, new Error('serialization returned null')]
    const [res, err] = await safeFetch('http://localhost:8000/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    })
    if (err !== null) return [null, err]
    if (!res.ok) return [null, new Error(`HTTP ${res.status}`)]
    const [item, parseErr] = jsonParse<Item>(await res.text())
    if (parseErr !== null) return [null, parseErr]
    if (item === null) return [null, new Error('empty response')]
    return [item, null]
}
