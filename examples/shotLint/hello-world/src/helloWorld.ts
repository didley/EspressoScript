export function hello(name: string): string {
    return `Hello, ${name}!`
}

function main(): void {
    console.log(hello("world"))
}

main()
