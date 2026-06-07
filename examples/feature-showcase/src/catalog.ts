import { jsonParse, jsonStringify, wrapError } from "shotscript/std"
import type { Result } from "shotscript/std"
import type { Book, CatalogEntry, CatalogError, Category, Audit } from "./types.js"
import { newNotFoundError, newDuplicateError, newValidationError } from "./types.js"

// Map<K, V> for dictionaries — not Record<K, V>, not index signatures
export type Catalog = Map<string, CatalogEntry>

export function createCatalog(): Catalog {
    return new Map<string, CatalogEntry>()
}

// Fallible functions return Result<T, E> — never throw
export function addBook(catalog: Catalog, book: Book, addedBy: string): Result<Catalog, CatalogError> {
    if (book.title.length === 0) {
        return [null, newValidationError("title", "must not be empty")]
    }
    if (catalog.has(book.id)) {
        return [null, newDuplicateError(book.id)]
    }
    const audit: Audit = { addedAt: Date.now(), addedBy }
    // Immutable update: create a new Map from the existing one, then set on the copy
    const next = new Map<string, CatalogEntry>(catalog)
    next.set(book.id, { book, audit })
    return [next, null]
}

export function findBook(catalog: Catalog, id: string): Result<CatalogEntry, CatalogError> {
    const entry = catalog.get(id)
    if (entry === undefined) {
        return [null, newNotFoundError(id)]
    }
    return [entry, null]
}

export function removeBook(catalog: Catalog, id: string): Result<Catalog, CatalogError> {
    if (catalog.has(id) === false) {
        return [null, newNotFoundError(id)]
    }
    const next = new Map<string, CatalogEntry>(catalog)
    next.delete(id)
    return [next, null]
}

// Named function expression in callback — no arrow functions allowed
export function findByCategory(catalog: Catalog, category: Category): readonly CatalogEntry[] {
    return [...catalog.values()].filter(function matchesCategory(entry: CatalogEntry): boolean {
        return entry.book.category === category
    })
}

// Named function expression in map callback
export function exportToJson(catalog: Catalog): Result<string> {
    const books = [...catalog.values()].map(function toBook(entry: CatalogEntry): Book {
        return entry.book
    })
    const [json, err] = jsonStringify(books, 2)
    if (err !== null) {
        return [null, wrapError("exportToJson", err)]
    }
    return [json, null]
}

// In-place Map population — const binding, mutation is scoped to this function
export function importFromJson(json: string, addedBy: string): Result<Catalog, Error> {
    const [books, parseErr] = jsonParse<readonly Book[]>(json)
    if (parseErr !== null) {
        return [null, wrapError("importFromJson: parse failed", parseErr)]
    }
    const catalog = createCatalog()
    for (const book of books) {
        if (catalog.has(book.id)) {
            return [null, new Error(`importFromJson: duplicate id "${book.id}"`)]
        }
        const audit: Audit = { addedAt: Date.now(), addedBy }
        catalog.set(book.id, { book, audit })
    }
    return [catalog, null]
}
