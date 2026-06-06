# notes

A fullstack example combining a ShotScript backend with a React client that uses ShotLint.

```
notes/
├── backend/        ShotScript HTTP API (Bun)
│   ├── main.shot
│   ├── handlers.shot
│   ├── store.shot
│   └── store.test.shot
└── client/         React + Vite, linted with ShotLint
    ├── src/
    │   ├── App.tsx   — function declarations, named callbacks, result tuples
    │   └── api.ts    — safeFetch + jsonParse from shot-lint/utils
    └── package.json
```

## What it demonstrates

- **ShotScript backend**: `shot:std` `serve()`, `mutableRef()`, error-tuple handlers, CORS.
- **ShotLint on the client**: `no-arrow-functions`, `no-throw`, `no-try`, named functions in JSX callbacks, result tuples via `shot-lint/utils`.
- Both sides of the stack follow the same error-handling lint — `[T | null, Error | null]` everywhere.

## Prerequisites

- [Bun](https://bun.sh) — for the backend
- [Node.js 20+](https://nodejs.org) — for the client

## Running

**Backend** (terminal 1):
```bash
shot run backend/main.shot
```

**Client** (terminal 2):
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api/*` to the backend at `:8000`.

## Linting the client

```bash
cd client
npm run lint
```

## Running the backend tests

```bash
shot test backend/store.test.shot
```
