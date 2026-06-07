// Violates: no-or-shorthand
export function run(condition: boolean): void {
    condition || doThing()
}

function doThing(): void {}
