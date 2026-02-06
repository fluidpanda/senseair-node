export function parseCo2Frame(buffer: Buffer): number {
    if (buffer.length < 5) throw new Error("Frame too short");
    if (buffer[0] !== 0xfe) throw new Error("Invalid address");
    if (buffer[1] !== 0x04) throw new Error("Invalid function");
    if (buffer[2] !== 0x02) throw new Error("Invalid payload length");
    return buffer[3] * 256 + buffer[4];
}
