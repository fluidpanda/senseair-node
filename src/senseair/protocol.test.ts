import { describe, expect, it } from "vitest";
import { parseCo2Frame } from "@/senseair/protocol";

describe("parseCo2Frame", (): void => {
    it("parses ppm from a valid frame", (): void => {
        const frame: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x02, 0x01, 0xf4, 0x00, 0x00]);
        expect(parseCo2Frame(frame)).toBe(500);
    });

    it("throws on short frame", (): void => {
        const frame: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x02, 0x01]);
        expect((): number => parseCo2Frame(frame)).toThrow(/Frame too short/i);
    });

    it("throws on wrong header bytes", (): void => {
        const frame: Buffer<ArrayBuffer> = Buffer.from([0xff, 0x04, 0x02, 0x01, 0xf4]);
        expect((): number => parseCo2Frame(frame)).toThrow(/Invalid address/i);
    });

    it("throws on wrong function", (): void => {
        const frame: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x03, 0x02, 0x01, 0xf4]);
        expect((): number => parseCo2Frame(frame)).toThrow(/Invalid function/i);
    });

    it("throws on wrong payload length marker", (): void => {
        const frame: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x04, 0x01, 0xf4]);
        expect((): number => parseCo2Frame(frame)).toThrow(/Invalid payload length/i);
    });
});
