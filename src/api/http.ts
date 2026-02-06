import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { sensorState } from "@/state";

export interface ApiOptions {
    host: string;
    port: number;
}

function formatMs(ms: number): string {
    const total: number = Math.max(0, Math.floor(ms));
    const units: { value: number; suffix: string }[] = [
        { value: Math.floor(total / 86400000), suffix: "d" },
        { value: Math.floor((total % 86400000) / 3600000), suffix: "h" },
        { value: Math.floor((total % 3600000) / 60000), suffix: "m" },
        { value: Math.floor((total % 60000) / 1000), suffix: "s" },
        { value: total % 1000, suffix: "ms" },
    ];
    const parts: string[] = units
        .filter((unit: { value: number; suffix: string }): boolean => unit.value > 0)
        .map((unit: { value: number; suffix: string }): string => `${unit.value}${unit.suffix}`);
    return parts.length > 0 ? parts.join("") : "0ms";
}

export async function createApi(opts: ApiOptions): Promise<FastifyInstance> {
    const app = Fastify({ logger: true });
    app.get("/status", () => {
        const now: number = Date.now();
        const ageMs: number | null = sensorState.lastUpdateMs ? now - sensorState.lastUpdateMs : null;
        return {
            status: 200,
            uptime: formatMs(process.uptime()),
            sensor: {
                status: sensorState.ok,
                co2ppm: sensorState.co2ppm,
                lastUpdateMs: sensorState.lastUpdateMs,
                ageMs,
                lastError: sensorState.lastError,
            },
        };
    });
    app.get("/sensor", () => {
        return {
            value: sensorState.co2ppm,
            unit: "ppm",
            updatedAtMs: sensorState.lastUpdateMs,
        };
    });
    await app.listen({ host: opts.host, port: opts.port });
    app.log.info({ host: opts.host, port: opts.port }, "API started");
    return app;
}
