import type { Logger } from "@/logging/logger";
import type { Co2Frame } from "@/senseair/frame";
import type { SerialPort } from "@/serial/types";
import { avgs, calcAvg } from "@/helpers/avgs";
import { extractCo2Frames } from "@/senseair/frame";
import { co2ppmFromFrame } from "@/senseair/protocol";
import { sensorState } from "@/state/types";

const READ_CO2: Buffer<ArrayBuffer> = Buffer.from([0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5]);

export interface ServiceOptions {
    logger: Logger;
    pollingIntervalMs?: number;
}

export function startService(port: SerialPort, opts: ServiceOptions): { stop: () => void } {
    const log: Logger = opts.logger;
    log.info({ pollingIntervalMs: opts.pollingIntervalMs });
    port.onError((err: Error): void => {
        log.error({ err });
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
                const now: number = Date.now();
                for (const w of avgs.values()) {
                    w.push(ppm, now);
                }
                sensorState.ok = true;
                sensorState.co2ppm = ppm;
                sensorState.avg = calcAvg(now);
                sensorState.lastUpdateMs = now;
                sensorState.lastError = null;
                log.debug({ co2ppm: ppm });
            }
        } catch (err) {
            const msg: string = err instanceof Error ? err.message : String(err);
            sensorState.ok = false;
            sensorState.lastError = msg;
            log.error({ err });
        }
    });
    const intervalMs: number = opts.pollingIntervalMs ?? 5_000;
    const timer = setInterval((): void => {
        port.write(READ_CO2);
    }, intervalMs);
    port.write(READ_CO2);
    return {
        stop: (): void => {
            clearInterval(timer);
            log.warn("service stopped");
        },
    };
}
