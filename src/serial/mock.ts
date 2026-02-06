import { crc16 } from "crc";
import type { SerialDataHandler, SerialPort } from "@/serial/types";

export class MockSerialPort implements SerialPort {
    private dataHandler: SerialDataHandler | null = null;
    private errorHandler: ((err: Error) => void) | null = null;
    private closed: boolean = false;

    private readonly basePpm: number;
    private readonly amplitude: number;
    private readonly startedAtMs: number;
    private readonly responseDelayMs: number;

    private emmitError(err: Error): void {
        if (this.errorHandler) {
            this.errorHandler(err);
        }
    }
    private simulatePpm(): number {
        const t: number = (Date.now() - this.startedAtMs) / 1_000;
        const v: number = this.basePpm + Math.sin(t / 6) * this.amplitude;
        return Math.max(400, Math.min(2_500, Math.round(v)));
    }
    constructor(opts?: { basePpm?: number; amplitude?: number; responseDelayMs?: number }) {
        this.basePpm = opts?.basePpm ?? 500;
        this.amplitude = opts?.amplitude ?? 200;
        this.responseDelayMs = opts?.responseDelayMs ?? 60;
        this.startedAtMs = Date.now();
    }
    onData(handler: SerialDataHandler): void {
        this.dataHandler = handler;
    }
    onError(handler: (err: Error) => void): void {
        this.errorHandler = handler;
    }
    write(data: Buffer): void {
        if (this.closed) return;
        // Master Transmit: `FE 04 00 03 00 01 D5 C5`
        // Slave Reply Ex:  `FE 04 02 01 90 AC D8`    0x190
        const isReadCo2: boolean =
            data.length >= 6 &&
            data[0] === 0xfe &&
            data[1] === 0x04 &&
            data[2] === 0x00 &&
            data[3] === 0x03 &&
            data[4] === 0x00 &&
            data[5] === 0xd5 &&
            data[6] === 0xc5;
        if (!isReadCo2) {
            this.emmitError(new Error(`MockSerialPort: Unsupported request: ${data.toString("hex")}`));
        }
        const ppm: number = this.simulatePpm();
        // Slave Reply: `FE 04 02 HI LO CRC_LO CRC_HI`
        const hi: number = (ppm >> 8) & 0xff;
        const lo: number = ppm & 0xff;
        const frame: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x02, hi, lo, 0x00, 0x00]);
        const crc: number = crc16(frame.subarray(0, 5));
        frame[5] = crc & 0xff; // CRC low byte
        frame[6] = (crc >> 8) & 0xff; // CRC high byte
        setTimeout((): void => {
            if (this.closed) return;
            if (!this.dataHandler) return;
            this.dataHandler(frame);
        }, this.responseDelayMs);
    }
    close(): Promise<void> {
        this.closed = true;
        return Promise.resolve();
    }
}
