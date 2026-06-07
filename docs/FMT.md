# ShotScriptFmt

Zero-config formatting. A Biome preset enforcing a single canonical style — 80-char lines, no semicolons, 4-space indent, single quotes. Consistent diffs, readable in any terminal.

## Install

```json
// biome.json
{
    "extends": ["shotscript/fmt"]
}
```

Run:

```sh
npx @biomejs/biome format --write src/
```

## Format spec

| Option | Value |
|---|---|
| line width | 80 |
| indent | 4 spaces |
| semicolons | none |
| quotes | single |
| trailing commas | all |
| bracket spacing | true |

**Why these choices:** 80 chars fits a split terminal. 4-space indent makes nesting depth visible before it becomes a problem. No semis removes line-noise with no semantic cost. Single quotes are one less keystroke for the common case.

## Before / after

### Imports, spacing & semicolons

```ts
// ❌ unformatted
import {UserService} from "./services";
import {Database,Config} from "./db";

async function getUser(id:number):Promise<User|null>{
  const svc:UserService = {db:getDb()}
  return findUserById(svc,id)
}
```

```ts
// ✅ ShotScriptFmt
import { UserService } from './services'
import { Database, Config } from './db'

async function getUser(
    id: number,
): Promise<User | null> {
    const svc: UserService = { db: getDb() }
    return findUserById(svc, id)
}
```

### Long parameter lists

```ts
// ❌ unformatted
function createOrder(userId:number,items:readonly Item[],shippingAddress:Address,paymentMethod:PaymentMethod):Result<Order> {
  // ...
}
```

```ts
// ✅ ShotScriptFmt
function createOrder(
    userId: number,
    items: readonly Item[],
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
): Result<Order> {
    // ...
}
```

### Object literals

```ts
// ❌ unformatted
const config: Config = {host:"localhost",port:3000,debug:true,timeout:5000,retries:3}
const updated = {...config,port:4000,debug:false}
```

```ts
// ✅ ShotScriptFmt
const config: Config = {
    host: 'localhost',
    port: 3000,
    debug: true,
    timeout: 5000,
    retries: 3,
}

const updated = { ...config, port: 4000, debug: false }
```
