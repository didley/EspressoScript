// Valid: || used in value position (boolean OR), not as statement-level control flow
export function run(condition: boolean): void {
    if (condition === false) { doThing() }
}

export function combine(a: boolean, b: boolean): boolean {
    return a || b
}

function doThing(): void { doThing() }
