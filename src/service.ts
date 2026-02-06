import type { SerialPort } from "@/serial/types";
import { parseCo2Frame } from "@/senseair/protocol";
import { sensorState } from "@/state";

const READ_CO2: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5]);

export interface ServiceOptions {
    pollingIntervalMs?: number;
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
    const intervalMs: number = opts.pollingIntervalMs ?? 5_000;
    const timer = setInterval((): void => {
        port.write(READ_CO2);
    }, intervalMs);
    port.write(READ_CO2);
    return {
        stop: async (): Promise<void> => {
            clearInterval(timer);
            await port.close();
            console.log("Service stopped");
        },
    };
}
