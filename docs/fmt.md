---
page: fmt
badge: ShotScriptFmt
title: "Zero-config formatting. No debates."
title_em: "No debates."
sub: "Formatting optimised for minimum diffs and terminal previews. 80-char lines, no semicolons, 4-space indent, single quotes."
---

{label} Install

:::install-step[biome.json]
```json
// biome.json
{
  "extends": ["shotscript/fmt"]
}
```
:::

:::install-cmd
npx @biomejs/biome format --write src/
:::

---

{label} Format spec

:::spec
- line width: 80
- indent: 4 spaces
- semicolons: none
- quotes: single
- trailing commas: all
- bracket spacing: true
:::

> **Why these choices:** 80 chars fits a split terminal. 4-space indent makes nesting depth visible before it becomes a problem. No semis removes line-noise with no semantic cost. Single quotes are one less keystroke for the common case.

---

{label} Before / after

## What formatting changes.

{label} Imports, spacing & semicolons

```ts ❌
import {UserService} from "./services";
import {Database,Config} from "./db";

async function getUser(id:number):Promise<User|null>{
  const svc:UserService = {db:getDb()}
  return findUserById(svc,id)
}
```

```ts ✅
import { UserService } from './services'
import { Database, Config } from './db'

async function getUser(
    id: number,
): Promise<User | null> {
    const svc: UserService = { db: getDb() }
    return findUserById(svc, id)
}
```

{label} Long parameter lists

```ts ❌
function createOrder(userId:number,items:readonly Item[],shippingAddress:Address,paymentMethod:PaymentMethod):Result<Order> {
  // ...
}
```

```ts ✅
function createOrder(
    userId: number,
    items: readonly Item[],
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
): Result<Order> {
    // ...
}
```

{label} Object literals

```ts ❌
const config: Config = {host:"localhost",port:3000,debug:true,timeout:5000,retries:3}

const updated = {...config,port:4000,debug:false}
```

```ts ✅
const config: Config = {
    host: 'localhost',
    port: 3000,
    debug: true,
    timeout: 5000,
    retries: 3,
}

const updated = { ...config, port: 4000, debug: false }
```
