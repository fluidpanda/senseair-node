import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { describe, it } from "node:test";
import { crc16modbus } from "crc";
import { delay } from "@/helpers/sensors";
import { assertNonNull } from "@/helpers/tests";
import { co2ppmFromFrame } from "@/senseair/protocol";
import { MockSerialPort } from "@/serial/mock";

await describe(`src/serial/mock.MockSerialPort`, async (): Promise<void> => {
    await it("emits error on unsupported requests", async (): Promise<void> => {
        const port = new MockSerialPort({ responseDelayMs: 1 });
        let errMsg: string = "";
        let gotData: boolean = false;
        port.onError((err: Error) => (errMsg = err.message));
        port.onData(() => (gotData = true));
        port.write(Buffer.from([0x01, 0x02, 0x03]));
        await delay(5);
        assert.ok(errMsg.includes("Unsupported request"));
        assert.equal(gotData, false);
    });
    await it("emits a valid CO2 frame with correct CRC", async (): Promise<void> => {
        const port = new MockSerialPort({ responseDelayMs: 1, basePpm: 500, amplitude: 0 });
        let frame: Buffer | null = null;
        port.onData((b: Buffer) => (frame = b));
        port.onError((e: Error) => assert.fail(e));
        port.write(Buffer.from([0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5]));
        await delay(5);
        assertNonNull(frame, "No frame received");
        const fr: Buffer = frame;
        assert.equal(fr[0], 0xfe);
        assert.equal(fr[1], 0x04);
        assert.equal(fr[2], 0x02);
        const ppm: number = co2ppmFromFrame(fr);
        assert.equal(ppm, 500);
        const crc: number = crc16modbus(fr.subarray(0, 5));
        assert.equal(fr[5], crc & 0xff);
        assert.equal(fr[6], (crc >> 8) & 0xff);
    });
});
