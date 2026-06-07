import { toResult, toPromiseResult, wrapError, jsonParse, safeURL } from "shotscript/std"
import type { Result, PromiseResult } from "shotscript/std"
import { Category, newNotFoundError, newDuplicateError } from "./types.js"
import type { Book, CatalogEntry, CatalogError, Audit } from "./types.js"
import {
    createCatalog,
    addBook,
    findBook,
    removeBook,
    findByCategory,
    exportToJson,
    importFromJson,
} from "./catalog.js"
import type { Catalog } from "./catalog.js"
import { readFile } from "node:fs/promises"

// --- Async function pattern ---
// Shows: PromiseResult<T>, toPromiseResult, async/await, wrapError for propagation

async function readTextFile(path: string): PromiseResult<string> {
    const [content, err] = await toPromiseResult(function readAsync(): Promise<string> {
        return readFile(path, "utf-8")
    })
    if (err !== null) {
        return [null, wrapError(`readTextFile: ${path}`, err)]
    }
    return [content, null]
}

// --- Wrapping synchronous throwing APIs ---
// toResult catches throws and converts them to the tuple pattern

function parseUrl(href: string): Result<URL> {
    return safeURL(href)
}

// --- Discriminated union error handling ---
// switch must have an explicit break on every case; exhaustiveness enforced by TS

function describeCatalogError(err: CatalogError): string {
    switch (err.kind) {
        case "not-found":
            return `book "${err.id}" not found`
        case "duplicate":
            return `book "${err.id}" already exists in catalog`
        case "validation":
            return `validation error on field "${err.field}": ${err.message}`
    }
}

// --- Named function expressions in callbacks ---
// Arrow functions are banned; every function expression must be named

function titlesOf(entries: readonly CatalogEntry[]): readonly string[] {
    return entries.map(function extractTitle(entry: CatalogEntry): string {
        return entry.book.title
    })
}

function booksAfterYear(entries: readonly CatalogEntry[], year: number): readonly CatalogEntry[] {
    return entries.filter(function publishedAfter(entry: CatalogEntry): boolean {
        return entry.book.year > year
    })
}

// --- Set for unique values ---
// Map and Set are the only dictionary/collection built-ins allowed

function collectUniqueTags(catalog: Catalog): readonly string[] {
    const tags = new Set<string>()
    for (const [, entry] of catalog) {
        for (const tag of entry.book.tags) {
            tags.add(tag)
        }
    }
    return [...tags]
}

// --- Building a catalog in-place from a known-good seed ---
// Uses const Map binding + mutation (no let needed for accumulation)

function buildCatalog(books: readonly Book[]): Result<Catalog, Error> {
    const catalog = createCatalog()
    for (const book of books) {
        if (catalog.has(book.id)) {
            return [null, new Error(`duplicate seed id: "${book.id}"`)]
        }
        const audit: Audit = { addedAt: Date.now(), addedBy: "seed" }
        catalog.set(book.id, { book, audit })
    }
    return [catalog, null]
}

// --- Number conversion ---
// Number() is the canonical form — parseInt/parseFloat/Number.parseInt are banned

function parseYear(raw: string): Result<number> {
    const year = Number(raw)
    if (Number.isNaN(year)) {
        return [null, new Error(`"${raw}" is not a valid year`)]
    }
    return [year, null]
}

// --- Boolean conversion ---
// Boolean() is the canonical form — !! double-bang is banned

function isRecentBook(entry: CatalogEntry): boolean {
    return Boolean(entry.book.year > 2000)
}

async function main(): Promise<void> {
    // Seed data — readonly array, readonly object properties, as-const enum values
    const seed: readonly Book[] = [
        {
            id: "b1",
            title: "The Go Programming Language",
            author: "Donovan & Kernighan",
            category: Category.Reference,
            year: 2015,
            tags: ["go", "programming", "systems"],
        },
        {
            id: "b2",
            title: "Thinking, Fast and Slow",
            author: "Daniel Kahneman",
            category: Category.NonFiction,
            year: 2011,
            tags: ["psychology", "cognition"],
        },
        {
            id: "b3",
            title: "Dune",
            author: "Frank Herbert",
            category: Category.Fiction,
            year: 1965,
            tags: ["sci-fi", "classic"],
        },
        {
            id: "b4",
            title: "The Selfish Gene",
            author: "Richard Dawkins",
            category: Category.Science,
            year: 1976,
            tags: ["biology", "evolution"],
        },
        {
            id: "b5",
            title: "Foundation",
            author: "Isaac Asimov",
            category: Category.Fiction,
            year: 1951,
            tags: ["sci-fi", "classic", "series"],
        },
    ]

    // Build initial catalog — const Map, mutated in-place during construction
    const [catalog, seedErr] = buildCatalog(seed)
    if (seedErr !== null) {
        console.error(`seed failed: ${seedErr.message}`)
        return
    }
    console.log(`Catalog seeded with ${catalog.size.toString()} books`)

    // addBook — returns a new Map (immutable update)
    const newBook: Book = {
        id: "b6",
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: Category.Science,
        year: 1988,
        tags: ["physics", "cosmology"],
    }
    const [extended, addErr] = addBook(catalog, newBook, "admin")
    if (addErr !== null) {
        console.error(describeCatalogError(addErr))
        return
    }
    console.log(`Added book. Catalog now has ${extended.size.toString()} books`)

    // Intentional duplicate — demonstrates error path and switch on discriminated union
    const [, dupErr] = addBook(extended, newBook, "admin")
    if (dupErr !== null) {
        console.log(`Expected error: ${describeCatalogError(dupErr)}`)
    }

    // findBook — successful lookup
    const [entry, findErr] = findBook(extended, "b3")
    if (findErr !== null) {
        console.error(describeCatalogError(findErr))
        return
    }
    console.log(`Found: "${entry.book.title}" by ${entry.book.author}`)

    // findBook — not-found path
    const [, missingErr] = findBook(extended, "b99")
    if (missingErr !== null) {
        console.log(`Expected error: ${describeCatalogError(missingErr)}`)
    }

    // removeBook — returns a new Map with the entry removed
    const [trimmed, removeErr] = removeBook(extended, "b1")
    if (removeErr !== null) {
        console.error(describeCatalogError(removeErr))
        return
    }
    console.log(`Removed b1. Catalog now has ${trimmed.size.toString()} books`)

    // findByCategory — uses named filter function expression internally
    const scifiBooks = findByCategory(extended, Category.Fiction)
    const scifiTitles = titlesOf(scifiBooks)
    console.log(`Fiction titles: ${scifiTitles.join(", ")}`)

    // booksAfterYear — named function expression filter
    const recentEntries = booksAfterYear([...extended.values()], 2000)
    console.log(`Books after 2000: ${titlesOf(recentEntries).join(", ")}`)

    // isRecentBook — Boolean() conversion (no !!)
    const recentCount = [...extended.values()].filter(isRecentBook).length
    console.log(`Recent books (post-2000): ${recentCount.toString()}`)

    // Set — unique tags across the catalog
    const allTags = collectUniqueTags(extended)
    console.log(`Unique tags (${allTags.length.toString()}): ${allTags.join(", ")}`)

    // Indexed for loop — the only place let is allowed: for (let ...) headers
    // noUncheckedIndexedAccess: arr[i] is T | undefined, must check
    const scienceCatalog = findByCategory(extended, Category.Science)
    console.log("Science books:")
    for (let i = 0; i < scienceCatalog.length; i += 1) {
        const scienceEntry = scienceCatalog[i]
        if (scienceEntry === undefined) { break }
        console.log(`  ${(i + 1).toString()}. ${scienceEntry.book.title} (${scienceEntry.book.year.toString()})`)
    }

    // While loop — no let outside for headers; check external mutable state instead
    const retryIds = new Set<string>(["b2", "b3"])
    while (retryIds.size > 0) {
        const iter = retryIds.values()
        const next = iter.next()
        if (next.done !== true) {
            const [retryEntry, retryErr] = findBook(extended, next.value)
            if (retryErr !== null) {
                console.error(describeCatalogError(retryErr))
            } else {
                console.log(`Verified: "${retryEntry.book.title}"`)
            }
            retryIds.delete(next.value)
        }
    }

    // JSON round-trip — jsonStringify/jsonParse from std (bare JSON.* is banned)
    const [json, exportErr] = exportToJson(extended)
    if (exportErr !== null) {
        console.error(`export failed: ${exportErr.message}`)
        return
    }
    console.log(`Exported ${json.length.toString()} chars of JSON`)

    const [reimported, importErr] = importFromJson(json, "reimport")
    if (importErr !== null) {
        console.error(`import failed: ${importErr.message}`)
        return
    }
    console.log(`Reimported catalog has ${reimported.size.toString()} books`)

    // toResult — wrapping synchronous throwing APIs (URL constructor throws on bad input)
    const [goodUrl, urlErr] = parseUrl("https://example.com/books")
    if (urlErr !== null) {
        console.error(`url parse failed: ${urlErr.message}`)
        return
    }
    console.log(`Parsed URL: ${goodUrl.hostname}`)

    const [, badUrlErr] = parseUrl("not a url")
    if (badUrlErr !== null) {
        console.log(`Expected URL error: ${badUrlErr.message}`)
    }

    // Number() — canonical number conversion (parseInt/parseFloat/Number.parseInt banned)
    const [year, yearErr] = parseYear("1984")
    if (yearErr !== null) {
        console.error(yearErr.message)
        return
    }
    console.log(`Parsed year: ${year.toString()}`)

    const [, invalidYearErr] = parseYear("not-a-year")
    if (invalidYearErr !== null) {
        console.log(`Expected year error: ${invalidYearErr.message}`)
    }

    // toPromiseResult + wrapError — async wrapping of a node API
    const [content, readErr] = await readTextFile("./package.json")
    if (readErr !== null) {
        console.error(readErr.message)
        return
    }

    // jsonParse with type parameter — wrapping a potentially-failing JSON.parse
    const [pkg, pkgErr] = jsonParse<{ readonly name: string; readonly version: string }>(content)
    if (pkgErr !== null) {
        console.error(`package.json parse failed: ${pkgErr.message}`)
        return
    }
    console.log(`Running example from package: ${pkg.name}@${pkg.version}`)
}

await main()
