```
  ███████╗██╗  ██╗ ██████╗ ████████╗ ███████╗ ██████╗ ██████╗ ██╗██████╗ ████████╗
  ██╔════╝██║  ██║██╔═══██╗╚══██╔══╝ ██╔════╝██╔════╝ ██╔══██╗██║██╔══██╗╚══██╔══╝
  ███████╗███████║██║   ██║   ██║    ███████╗██║      ██████╔╝██║██████╔╝   ██║   
  ╚════██║██╔══██║██║   ██║   ██║    ╚════██║██║      ██╔══██╗██║██╔═══╝    ██║   
  ███████║██║  ██║╚██████╔╝   ██║    ███████║╚██████╗ ██║  ██║██║██║        ██║   
  ╚══════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   
  TypeScript, one way.
```

TypeScript has too many ways to write the same thing. ShotScript picks one — and enforces it.

---

## What it is

Four tools. One way to write TypeScript.

| | |
|---|---|
| **ShotScriptLint** | 95+ rules enforced as `tsc` errors. One canonical form for every construct — no ESLint, no config surface. |
| **ShotScriptFmt** | Shareable Biome config. 80-char lines, no semicolons, 4-space indent — formatted for terminals and clean diffs. |
| **ShotScriptTyping** | Strict tsconfig baseline. Full strict mode plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and more. |
| **Utils** | Safe, non-throwing replacements for every banned global — `jsonParse`, `safeFetch`, `toResult`, `wrapError`. |

---

## Install

```sh
npm install --save-dev shotscript
```

### ShotScriptLint

Add the plugin to `tsconfig.json`:

```json
{
    "extends": "shotscript/tsconfig/shotscript.json",
    "compilerOptions": {
        "plugins": [{ "name": "shotscript/plugin" }]
    }
}
```

Violations surface as `tsc` errors — red squiggles in your editor, non-zero exit in CI. No extra tooling required.

### ShotScriptFmt

Extend in `biome.json`:

```json
{ "extends": ["shotscript/biome"] }
```

### ShotScriptTyping

Extend in `tsconfig.json` (shown above with the plugin). The config alone, without the plugin:

```json
{ "extends": "shotscript/tsconfig/shotscript.json" }
```

### Utils

```ts
import { jsonParse, safeFetch, wrapError, toResult, toPromiseResult } from "shotscript/utils"
import type { Result, PromiseResult } from "shotscript/utils"
```

---

## What changes

**Errors as values — failure is in the return type**
```ts
// ❌ caller can't see this throws; nothing in the type says so
async function getUser(id: number): Promise<User> {
    const res = await fetch(`/users/${id}`)
    return res.json() as User
}

// ✅ every failure path is explicit in the type
import { safeFetch, jsonParse } from "shotscript/utils"
import type { PromiseResult } from "shotscript/utils"

async function getUser(id: number): PromiseResult<User> {
    const [res, fetchErr] = await safeFetch(`/users/${id.toString()}`)
    if (fetchErr !== null) { return [null, fetchErr] }
    return jsonParse<User>(await res.text())
}
```

**One absent value — `null`, not `undefined | null | ?`**
```ts
// ❌ three ways to say nothing
type User = { id: number; avatar?: string; deletedAt?: Date }

// ✅ one way
type User = {
    readonly id: number
    readonly avatar: string | null
    readonly deletedAt: Date | null
}
```

**Named functions — no anonymous callbacks**
```ts
// ❌ untestable, ungrepable
const total = items.filter(x => x.active).reduce((acc, x) => acc + x.score, 0)

// ✅ named, testable, findable in stack traces
function isActive(item: Item): boolean { return item.active }
function sumScore(acc: number, item: Item): number { return acc + item.score }
const total = items.filter(isActive).reduce(sumScore, 0)
```

---

## Rules

95+ rules across functions, types, error handling, control flow, and hygiene. Full reference: [docs/LANGUAGE.md](./docs/LANGUAGE.md)

Key bans: `no-throw`, `no-try`, `no-arrow-functions`, `no-any`, `no-assertion`, `no-interface`, `no-class`, `no-ternary`, `no-optional-property`, `no-undefined-type`, `require-readonly-property`, `require-async-tuple-return`

---

## AGENTS.md

Drop the [AGENTS.md](./AGENTS.md) into any project. AI coding assistants will generate ShotScript-compliant code from the first message — no rule-by-rule prompting.
