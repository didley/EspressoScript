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
