```
 ███████╗██╗  ██╗ ██████╗ ████████╗
 ██╔════╝██║  ██║██╔═══██╗╚══██╔══╝
 ███████╗███████║██║   ██║   ██║   
 ╚════██║██╔══██║██║   ██║   ██║   
 ███████║██║  ██║╚██████╔╝   ██║   
 ╚══════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   
 ShotScript — TypeScript, one way.
```

TypeScript with 74% less syntax. One way to do each thing — less for AI to get wrong, less to learn, and easier to review.

---

## What it is

Five tools. One way to write TypeScript.

| | |
|---|---|
| **ShotScriptLint** | 110+ rules enforced as `tsc` errors. One way to write every construct — no ESLint, no config surface. |
| **ShotScriptFmt** | Shareable Biome config. 80-char lines, no semicolons, 4-space indent — formatted for terminals and clean diffs. |
| **ShotScriptTyping** | Strict tsconfig baseline. Full strict mode plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and more. |
| **ShotScriptStd** | Safe, non-throwing replacements for every banned global — `jsonParse`, `safeFetch`, `toResult`, `wrapError`. |

---

## Is it for you?

ShotScript is designed for greenfield projects and teams starting fresh. It is probably **not** what you want if:

- **You have an existing codebase.** Rules like `no-class`, `no-promise`, `no-throw`, and `no-arrow-functions` require architectural rewrites, not mechanical search-replace. There is no gradual migration path — though [`/shotscript-migrate`](#claude-code-skills) can handle the rewrite end-to-end.
- **You're using a class-based framework.** Angular, NestJS, and similar frameworks are built around classes, constructors, and decorators — constructs ShotScript bans outright.
- **You want to opt in rule-by-rule.** There is no config surface. The rules are interdependent by design: `no-throw`/`no-try` only makes sense once you have `PromiseResult`; `require-async-tuple-return` only makes sense once raw Promises are gone.

### A different way to think about it

ShotScript is better understood as a dialect of TypeScript than as a linter. The constraint set is comprehensive enough that valid ShotScript looks nothing like typical TypeScript — no classes, no arrow callbacks, no ternaries, no throw, no raw Promises, every field readonly. These aren't missing features; they're the point.

If you want a stricter ESLint config, this is not that. ShotScript is for teams who want a single, non-negotiable way to write typed JavaScript from day one.

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

### ShotScriptStd

```ts
import { jsonParse, safeFetch, wrapError, toResult, toPromiseResult } from "shotscript/std"
import type { Result, PromiseResult } from "shotscript/std"
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
import { safeFetch, jsonParse } from "shotscript/std"
import type { PromiseResult } from "shotscript/std"

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

110+ rules across functions, types, error handling, control flow, and hygiene. Full reference: [shotscript.dev/lint](https://shotscript.dev/lint/)

Key bans: `no-throw`, `no-try`, `no-arrow-functions`, `no-any`, `no-assertion`, `no-interface`, `no-class`, `no-ternary`, `no-optional-property`, `no-undefined-type`, `require-readonly-property`, `require-async-tuple-return`

---

## AGENTS.md

Drop the [AGENTS.md](./AGENTS.md) into any project. AI coding assistants will generate ShotScript-compliant code from the first message — no rule-by-rule prompting.

---

## Claude Code skills

Three slash commands for [Claude Code](https://claude.ai/code) — install with:

```sh
npx shotscript commands
```

This copies three commands into `.claude/commands/` in your project.

| Command | What it does |
|---|---|
| `/shotscript-fix` | Runs the linter and fixes all violations in-place — mechanical and structural |
| `/shotscript-migrate` | Staged migration for an existing TypeScript codebase: mechanical fixes first, then arrow functions, classes, and error-handling rewrites |
| `/shotscript-explain [rule]` | Explains any ShotScript rule or pasted violation with a before/after example |

The skills read your actual source files and follow the same rules as `AGENTS.md` — they won't introduce new violations while fixing existing ones.
