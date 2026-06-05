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

## T04 — Checker type rules ✅ RESOLVED

**Originally logged:** 2026-06-05 02:00 (context limit)

**Resolved:** 2026-06-05 — implemented in full in the next session. Committed as `e79400e T04: implement 36 type-syntax and OOP checker rules`. All 48 verify.sh cases pass.
