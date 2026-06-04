# EspressoScript

A subtractive superset of TypeScript. EspressoScript removes features instead of adding them — applying Go's philosophy ("one canonical way to do everything") to the TS/JS ecosystem.

- **Tooling shorthand:** `shot` (CLI command + file extension)
- **Target runtime:** modern JS runtimes (edge, server, scripts)

## Quick taste

```ts
// foo.shot
import { fetch, jsonParse } from "shot:std"

type User = { id: number; name: string }

async function getUser(id: number): Promise<[User | null, Error | null]> {
    const [res, fetchErr] = await fetch(`https://api.example.com/users/${id}`)
    if (fetchErr !== null) {
        return [null, fetchErr]
    }
    const text = await res.text()
    return jsonParse<User>(text)
}
```

No arrow functions. No `throw`. No `interface`. No `class`. No `any`. No `as`. No ternaries. No third-party imports outside the `shot:` and `jsr:@espresso/*` namespaces (relative `.shot` imports allowed). The list of what's banned is the language.

## Install

```
curl -fsSL https://espressoscript.dev/install.sh | sh
```

Verify:
```
shot --version
```

The installer is a small script that handles everything needed to run shot on your machine. Read it first if you prefer — it's published alongside every release.

Windows installer and prebuilt binaries are on the roadmap.

## CLI

```
shot check [files...]    Validate .shot files.
shot fmt [files...]      Format in-place via deno fmt.
shot build [files...]    Validate → type-check.
shot run <file>          Validate → type-check → run via Deno.
```

## Documentation

- [`docs/PHILOSOPHY.md`](docs/PHILOSOPHY.md) — what shot is and isn't
- [`docs/LANGUAGE.md`](docs/LANGUAGE.md) — full rule list with examples
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the toolchain works
- [`docs/STDLIB.md`](docs/STDLIB.md) — the `shot:std` v1 surface
- [`docs/CLI.md`](docs/CLI.md) — command reference

## Status

Pre-v1. See [`tasks/`](tasks/) for the v1 implementation plan.
# EspressoScript
