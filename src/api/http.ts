import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { sensorState } from "@/state";

export interface ApiOptions {
    host: string;
    port: number;
}

export async function createApi(opts: ApiOptions): Promise<FastifyInstance> {
    const app = Fastify({ logger: true });
    app.get("/status", () => {
        const now: number = Date.now();
        const ageMs: number | null = sensorState.lastUpdateMs ? now - sensorState.lastUpdateMs : null;
        return {
            status: 200,
            uptime: Math.floor(process.uptime()),
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
        };
    });
    await app.listen({ host: opts.host, port: opts.port });
    app.log.info({ host: opts.host, port: opts.port }, "API started");
    return app;
}
