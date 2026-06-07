import { readFileSync } from "node:fs";
import { glob } from "glob";
import { check } from "./checker/index.js";
const patterns = process.argv.slice(2);
if (patterns.length === 0) {
    process.stderr.write("Usage: shotscript <glob> [...glob]\n");
    process.exit(1);
}
const files = (await Promise.all(patterns.map((p) => glob(p, { absolute: true })))).flat();
let errorCount = 0;
for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const d of check(file, source)) {
        process.stdout.write(`${d.file}:${d.line}:${d.col} [${d.rule}] ${d.message}\n`);
        errorCount++;
    }
}
if (errorCount > 0)
    process.exit(1);
//# sourceMappingURL=cli.js.map