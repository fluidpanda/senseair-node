import type { Co2Frame } from "@/senseair/frame";
import type { SerialPort } from "@/serial/types";
import { extractCo2Frames } from "@/senseair/frame";
import { co2ppmFromFrame } from "@/senseair/protocol";
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
    let acc: Buffer = Buffer.alloc(0);
    port.onData((chunk: Buffer): void => {
        try {
            acc = Buffer.concat([acc, chunk]);
            const res: Co2Frame = extractCo2Frames(acc);
            acc = res.rest;
            for (const frame of res.frames) {
                const ppm: number = co2ppmFromFrame(frame);
                sensorState.ok = true;
                sensorState.co2ppm = ppm;
                sensorState.lastUpdateMs = Date.now();
                sensorState.lastError = null;
                console.log("Sensor update", { co2ppm: ppm });
            }
        } catch (err) {
            const msg: string = err instanceof Error ? err.message : String(err);
            sensorState.ok = false;
            sensorState.lastError = msg;
            console.error("Error occurred", msg);
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
