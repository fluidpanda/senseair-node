import type { SerialPort } from "@/serial/types";
import { sensorState } from "@/state";

const READ_CO2: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5]);

export interface ServiceOptions {
    pollingIntervalMs?: number;
}

function parseCo2Frame(buffer: Buffer): number {
    if (buffer.length < 5) throw new Error("Frame too short");
    if (buffer[0] !== 0xfe) throw new Error("Invalid address");
    if (buffer[1] !== 0x04) throw new Error("Invalid function");
    if (buffer[2] !== 0x02) throw new Error("Invalid payload length");
    return buffer[3] * 256 + buffer[4];
}

export function startService(port: SerialPort, opts: ServiceOptions): { stop: () => Promise<void> } {
    console.log("Service started, polling", { pollingIntervalMs: opts.pollingIntervalMs });
    port.onError((err: Error): void => {
        console.error("Serial error", err.message);
        sensorState.ok = false;
        sensorState.lastError = err.message;
    });
    port.onData((buffer: Buffer<ArrayBufferLike>): void => {
        try {
            const ppm: number = parseCo2Frame(buffer);
            sensorState.ok = true;
            sensorState.co2ppm = ppm;
            sensorState.lastUpdateMs = Date.now();
            sensorState.lastError = null;

            console.log("Sensor update", { co2ppm: ppm });
        } catch (err) {
            const msg: string = err instanceof Error ? err.message : String(err);
            console.error("Error occurred", msg);
            sensorState.ok = false;
            sensorState.lastError = msg;
        }
    });
    const timer = setInterval((): void => {
        port.write(READ_CO2);
    }, opts.pollingIntervalMs);
    port.write(READ_CO2);
    return {
        stop: async (): Promise<void> => {
            clearInterval(timer);
            await port.close();
            console.log("Service stopped");
        },
    };
}
