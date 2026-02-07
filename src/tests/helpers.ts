import assert from "node:assert/strict";

export function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

export function assertNonNull<T>(value: T, message?: string): asserts value is NonNullable<T> {
    assert.ok(value !== null && value !== undefined, message);
}
