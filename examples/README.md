# Examples

Examples are organised by which tool they target.

## `both/`

Side-by-side examples that work with both ShotScript and shot-lint. Each contains a `shot/` subdirectory (`.shot` files for the ShotScript toolchain) and a `lint/` subdirectory (`.ts` files enforced by shot-lint).

- **`calculator/`** — pure arithmetic functions; demonstrates tuple error returns, explicit types, and function declarations

- **`fetch-user/`** — async HTTP fetch with schema validation; demonstrates `shot:std` / `shot-lint/utils` wrappers, `shot:zod`, and `PromiseResult`

## `shotScript/`

Examples that use the full ShotScript toolchain: `.shot` file extension, `shot` CLI, Bun runtime, and `shot:std` stdlib.

- **`notes/`** — REST API (list / get / create / delete); demonstrates `shot:std`, `Bun.serve`, multi-file modules, and `wrapError`

## `shotLint/`

Examples that add shot-lint to an existing TypeScript project. Files are plain `.ts`, linted via the TypeScript plugin.

- **`hello-world/`** — minimal project showing shot-lint setup (tsconfig plugin, Biome config)

## `fullstack/`

A combined ShotScript backend and TypeScript frontend. The frontend is checked by shot-lint; the backend uses the full ShotScript toolchain.
