# Blockers

This file records tasks that could not be completed autonomously and the
reason. The human triages these in the morning.

Format per entry:

```
## T0X — <task name>

**Date:** YYYY-MM-DD HH:MM

**What I tried:** the sequence of attempts.

**Where it failed:** specific error, file, or expectation that broke.

**What I think is needed:** human input, design call, external dependency, etc.

**Dependent tasks:** which downstream tasks this blocks (look at task files).
```

Add new entries at the bottom.

---

## T04 — Checker type rules

**Date:** 2026-06-05 02:00

**What I tried:** Completed T01, T02, T03 (52 syntax rules), T05. Reached context limit before T04.

**Where it failed:** Context exhausted — T04 has ~30 type-syntax rules plus fixtures, similar in size to T03. Not enough context window remaining to implement safely.

**What I think is needed:** A fresh context. T04 is fully self-contained — read tasks/T04-checker-rules-types.md and implement following the same pattern as T03 rules in cli/checker/rules/.

**Dependent tasks:** T06 (Wire `shot check`) lists T04 as a dependency. T07 (`shot fmt`) and T12 (install script) do NOT depend on T04 and can proceed independently. T08/T09/T10/T11 depend on T06 which depends on T04.
