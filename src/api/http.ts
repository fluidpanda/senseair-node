import Fastify from "fastify";
import type { StatusResponse } from "@/api/types";
import type { Logger } from "@/logging/logger";
import { runtimeState } from "@/state/runtime";

export interface ApiOptions {
    logger: Logger;
    host: string;
    port: number;
}

export async function createApi(opts: ApiOptions) {
    const app = Fastify({ loggerInstance: opts.logger });
    const log = opts.logger.child({ module: "api" });
    app.get("/status", (): StatusResponse => {
        const now: number = Date.now();
        const ageMs: number | null = runtimeState.data.lastUpdateMs ? now - runtimeState.data.lastUpdateMs : null;
        return {
            uptime: Math.floor(process.uptime()),
            memory: process.memoryUsage().rss,
            sensor: { ageMs, ...runtimeState.data },
            device: runtimeState.device,
        };
    });
    await app.listen({ host: opts.host, port: opts.port });
    log.info({ host: opts.host, port: opts.port });
    return app;
}
