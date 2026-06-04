# Decisions log

This file records non-trivial judgment calls made during autonomous task
execution. Each entry should explain *what* was chosen and *why*. Read
this before reviewing the diff — many small choices add up.

Format per entry:

```
## YYYY-MM-DD HH:MM — T0X: <short title>

**Context:** what was ambiguous or non-obvious.

**Decision:** what I chose.

**Why:** the reasoning.

**Reversibility:** how to undo this if it was wrong (file paths, expected diff).
```

Add new entries at the bottom. Do not edit prior entries.

---

## 2026-06-05 00:00 — T01: Deno not on PATH; used netlify deno

**Context:** `deno` is not on the system PATH. The verification commands in T01 call `deno` directly.

**Decision:** Found Deno at `/var/home/dylanlamont/.config/netlify/deno-cli/deno` (v2.6.4). Used that binary for all verification. The installed binary path does not affect the shipped code, only local development/testing.

**Why:** The task files assume `deno` is on PATH; the user may have Deno installed for Netlify. All source files and deno.json remain runtime-agnostic.

**Reversibility:** If Deno is later added to PATH, all verification commands work unchanged.

## 2026-06-05 00:01 — T01: Added version constraint and license to cli/deno.json

**Context:** `deno publish --dry-run` rejected the package for two reasons: the `jsr:@std/cli/parse-args` import lacked a semver constraint, and `cli/deno.json` had no `license` field.

**Decision:** Pinned `@std/cli` to `^1.0.30` (the version Deno resolved during first run). Added `"license": "MIT"` to `cli/deno.json`.

**Why:** JSR requires version constraints on all specifiers and a license declaration for publishing. MIT is consistent with the project's open-source intent.

**Reversibility:** Change import to `jsr:@std/cli/parse-args` (no constraint) and remove `license` field.
