export const ProtocolErrors = {
    frameLength: "Frame too short",
    frameAddress: "Invalid address",
    frameFunction: "Invalid function",
    framePayload: "Invalid payload",
} as const;

export function co2ppmFromFrame(frame: Buffer): number {
    return frame[3] * 256 + frame[4];
}

export function parseCo2Frame(buffer: Buffer): number {
    if (buffer.length < 5) throw new Error(ProtocolErrors.frameLength);
    if (buffer[0] !== 0xfe) throw new Error(ProtocolErrors.frameAddress);
    if (buffer[1] !== 0x04) throw new Error(ProtocolErrors.frameFunction);
    if (buffer[2] !== 0x02) throw new Error(ProtocolErrors.framePayload);
    return co2ppmFromFrame(buffer);
}
