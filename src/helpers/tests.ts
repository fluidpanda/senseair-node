import assert from "node:assert/strict";
import { crc16modbus } from "crc";
import pino from "pino";
import type { Logger } from "@/logging/logger";

export function assertNonNull<T>(value: T, message?: string): asserts value is NonNullable<T> {
    assert.ok(value !== null && value !== undefined, message);
}

export function makeCo2Frame(ppm: number): Buffer {
    const hi: number = (ppm >> 8) & 0xff;
    const lo: number = ppm & 0xff;
    const payload: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x02, hi, lo]);
    const crc: number = crc16modbus(payload);
    return Buffer.concat([payload, Buffer.from([crc & 0xff, (crc >> 8) & 0xff])]);
}

export function isNumber(v: unknown): v is number {
    return typeof v === "number" && Number.isFinite(v);
}

const testLogger: Logger = pino({ level: "silent" });
export const logger: Logger = testLogger.child({ module: "tests" });
