import { crc16modbus } from "crc";

const HEADER: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x02]);
const FRAME_LENGTH: number = 7;

export type Co2Frame = {
    frames: Buffer[];
    rest: Buffer;
};

export function extractCo2Frames(acc: Buffer): Co2Frame {
    const frames: Buffer[] = [];
    let b: Buffer = acc;
    while (b.length > 0) {
        const index: number = b.indexOf(HEADER);
        if (index < 0) return { frames, rest: b.subarray(Math.max(0, b.length - 2)) };
        if (index > 0) b = b.subarray(index);
        if (b.length < FRAME_LENGTH) return { frames, rest: b };
        const frame: Buffer = b.subarray(0, FRAME_LENGTH);
        const crc: number = crc16modbus(frame.subarray(0, 5));
        const crcLo: number = crc & 0xff;
        const crcHi: number = (crc >> 8) & 0xff;
        if (frame[5] !== crcLo || frame[6] !== crcHi) {
            b = b.subarray(1);
            continue;
        }
        frames.push(frame);
        b = b.subarray(FRAME_LENGTH);
    }
    return { frames, rest: Buffer.alloc(0) };
}
