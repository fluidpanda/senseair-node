import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { StatusResponse } from "@/api/types";
import { sensorState } from "@/state";

export interface ApiOptions {
    host: string;
    port: number;
}

export async function createApi(opts: ApiOptions): Promise<FastifyInstance> {
    const app = Fastify({ logger: true });
    app.get("/status", (): StatusResponse => {
        const now: number = Date.now();
        const ageMs: number | null = sensorState.lastUpdateMs ? now - sensorState.lastUpdateMs : null;
        return {
            uptime: Math.floor(process.uptime()),
            sensor: {
                ok: sensorState.ok,
                co2ppm: sensorState.co2ppm,
                lastUpdateMs: sensorState.lastUpdateMs,
                ageMs,
                lastError: sensorState.lastError,
            },
        };
    });
    await app.listen({ host: opts.host, port: opts.port });
    app.log.info({ host: opts.host, port: opts.port }, "API started");
    return app;
}
