import { test } from "node:test"
import assert from "node:assert/strict"
import { toResult, toPromiseResult, jsonParse, jsonStringify, safeFetch } from "../src/utils/index.ts"

test("toResult: returns value on success", function runTest(): void {
    const [val, err] = toResult(function parse(): number { return JSON.parse("42") as number })
    assert.equal(err, null)
    assert.equal(val, 42)
})

test("toResult: returns Error on throw", function runTest(): void {
    const [val, err] = toResult(function parse(): unknown { return JSON.parse("{bad") })
    assert.equal(val, null)
    assert.ok(err instanceof Error)
})

test("toResult: wraps non-Error throws as Error", function runTest(): void {
    const [val, err] = toResult(function throwStr(): never { throw "oops" })
    assert.equal(val, null)
    assert.ok(err instanceof Error)
    assert.ok(err.message.includes("oops"))
})

test("toPromiseResult: returns value on success", async function runTest(): Promise<void> {
    const [val, err] = await toPromiseResult(async function resolve(): Promise<number> { return 42 })
    assert.equal(err, null)
    assert.equal(val, 42)
})

test("toPromiseResult: returns Error on rejection", async function runTest(): Promise<void> {
    const [val, err] = await toPromiseResult(async function reject(): Promise<never> { throw new Error("boom") })
    assert.equal(val, null)
    assert.ok(err instanceof Error)
    assert.equal(err.message, "boom")
})

test("jsonParse: parses valid JSON", function runTest(): void {
    const [val, err] = jsonParse<{ readonly x: number }>('{"x":1}')
    assert.equal(err, null)
    assert.deepEqual(val, { x: 1 })
})

test("jsonParse: returns Error on invalid JSON", function runTest(): void {
    const [val, err] = jsonParse("{bad json}")
    assert.equal(val, null)
    assert.ok(err instanceof Error)
})

test("jsonStringify: serialises a value", function runTest(): void {
    const [json, err] = jsonStringify({ x: 1 })
    assert.equal(err, null)
    assert.equal(json, '{"x":1}')
})

test("jsonStringify: returns Error on circular reference", function runTest(): void {
    const obj: Record<string, unknown> = {}
    obj["self"] = obj
    const [json, err] = jsonStringify(obj)
    assert.equal(json, null)
    assert.ok(err instanceof Error)
})

test("jsonStringify: respects indent param", function runTest(): void {
    const [json, err] = jsonStringify({ x: 1 }, 2)
    assert.equal(err, null)
    assert.equal(json, '{\n  "x": 1\n}')
})

test("safeFetch: returns Error on network failure", async function runTest(): Promise<void> {
    const [res, err] = await safeFetch("http://localhost:0/nonexistent")
    assert.equal(res, null)
    assert.ok(err instanceof Error)
})
