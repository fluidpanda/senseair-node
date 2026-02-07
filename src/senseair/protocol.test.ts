import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCo2Frame, ProtocolErrors } from "@/senseair/protocol";

await describe(`senseair/protocol.parseCo2Frame`, async (): Promise<void> => {
    await it("parses valid CO2 frame", (): void => {
        const frame: Buffer<ArrayBuffer> = Buffer.from([
            0xfe,
            0x04,
            0x02,
            0x01,
            0xf4, // 500 ppm
            0x00,
            0x00,
        ]);
        const ppm: number = parseCo2Frame(frame);
        assert.equal(ppm, 500);
    });
    await it("throws on short frame", (): void => {
        const frame: Buffer = Buffer.from([0xfe, 0x04, 0x02, 0x01]);
        assert.throws((): void => {
            parseCo2Frame(frame);
        }, new RegExp(ProtocolErrors.frameLength));
    });
    await it("throws on invalid header", (): void => {
        const frame: Buffer = Buffer.from([0xff, 0x04, 0x02, 0x01, 0xf4]);
        assert.throws((): void => {
            parseCo2Frame(frame);
        }, new RegExp(ProtocolErrors.frameAddress));
    });
    await it("throws on wrong function", (): void => {
        const frame: Buffer = Buffer.from([0xfe, 0x03, 0x02, 0x01, 0xf4]);
        assert.throws((): void => {
            parseCo2Frame(frame);
        }, new RegExp(ProtocolErrors.frameFunction));
    });
    await it("throws on wrong payload length marker", (): void => {
        const frame: Buffer = Buffer.from([0xfe, 0x04, 0x04, 0x01, 0xf4]);
        assert.throws((): void => {
            parseCo2Frame(frame);
        }, new RegExp(ProtocolErrors.framePayload));
    });
});
