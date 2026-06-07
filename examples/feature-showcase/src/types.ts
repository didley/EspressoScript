// Canonical as-const enum pattern — no enum keyword
export const Category = {
    Fiction: "fiction",
    NonFiction: "non-fiction",
    Reference: "reference",
    Science: "science",
} as const
export type Category = typeof Category[keyof typeof Category]

// Every property in a user-authored type must be readonly — type, not interface
export type Book = {
    readonly id: string
    readonly title: string
    readonly author: string
    readonly category: Category
    readonly year: number
    readonly tags: readonly string[]
}

// Composed by named field, not by intersection (&)
export type Audit = {
    readonly addedAt: number
    readonly addedBy: string
}

export type CatalogEntry = {
    readonly book: Book
    readonly audit: Audit
}

// Discriminated union error type — no Error hierarchy, no class, no extends
export type NotFoundError = {
    readonly kind: "not-found"
    readonly id: string
}

export type DuplicateError = {
    readonly kind: "duplicate"
    readonly id: string
}

export type ValidationError = {
    readonly kind: "validation"
    readonly field: string
    readonly message: string
}

export type CatalogError = NotFoundError | DuplicateError | ValidationError

// Factory functions — new is for built-in constructors only; no user-defined class constructors
export function newNotFoundError(id: string): NotFoundError {
    return { kind: "not-found", id }
}

export function newDuplicateError(id: string): DuplicateError {
    return { kind: "duplicate", id }
}

export function newValidationError(field: string, message: string): ValidationError {
    return { kind: "validation", field, message }
}
