---
description: Explain a ShotScript rule or violation with a before/after example
---

Explain the following ShotScript rule or violation: $ARGUMENTS

If nothing was provided, ask the user to supply one of:
- A full violation line from `npx shotscript` output — format: `file.ts:line:col [rule-name] message`
- A rule name — e.g. `no-arrow-functions`, `no-throw`, `require-async-tuple-return`

---

For the identified rule, give exactly three things:

**1. What is banned**
The specific TypeScript construct that triggers this rule. One sentence, with a code example of the banned form.

**2. Why**
The design principle behind the ban — one sentence. ShotScript rules exist for one of: consistency (one way to write the same thing), safety (errors in the type system not at runtime), or explicitness (no hidden behaviour).

**3. The fix**
The ShotScript-idiomatic alternative. Show a before/after pair:

```ts
// Before (banned)
...

// After (ShotScript)
...
```

Keep the explanation tight — what's banned, why, before → after. The before/after example is the most useful part; don't bury it in prose.

If the fix requires importing from `shotscript/std` (e.g. `toResult`, `safeFetch`, `jsonParse`), include the import line in the after example.
