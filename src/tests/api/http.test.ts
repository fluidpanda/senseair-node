import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { StatusResponse } from "@/api/types";
import { createApi } from "@/api/http";
import { isNumber, logger } from "@/helpers/tests";
import { runtimeState } from "@/state/runtime";

await describe(`src/api/http.createApi`, async (): Promise<void> => {
    let app: Awaited<ReturnType<typeof createApi>> | null = null;
    afterEach(async (): Promise<void> => {
        await app?.close();
        app = null;
    });
    await it(`/status returns sensor fields`, async (): Promise<void> => {
        runtimeState.data.ok = true;
        runtimeState.data.co2ppm = 600;
        runtimeState.data.avg = { m1: 650, m5: 630, m10: 620, m30: 610, m60: 600 };
        runtimeState.data.lastUpdateMs = Date.now() - 1000;
        runtimeState.data.lastError = null;
        app = await createApi({ logger, host: "127.0.0.1", port: 0 });
        const res = await app.inject({ method: "GET", url: "/status" });
        assert.equal(res.statusCode, 200);
        const api: StatusResponse = res.json();
        assert.deepStrictEqual(api, {
            ...api,
            memory: api.memory,
            uptime: api.uptime,
            sensor: {
                ...api.sensor,
                ok: true,
                co2ppm: 600,
                avg: { m1: 650, m5: 630, m10: 620, m30: 610, m60: 600 },
                lastError: null,
            },
        });
        assert.ok(isNumber(api.memory) && api.memory >= 0);
        assert.ok(isNumber(api.uptime) && api.uptime >= 0);
        assert.ok(isNumber(api.sensor.lastUpdateMs));
    });
});
