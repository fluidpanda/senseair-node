import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { StatusResponse } from "@/api/types";
import { createApi } from "@/api/http";
import { isNumber } from "@/helpers/tests";
import { sensorState } from "@/state/types";

await describe(`src/api/http.createApi`, async (): Promise<void> => {
    let app: Awaited<ReturnType<typeof createApi>> | null = null;
    afterEach(async (): Promise<void> => {
        await app?.close();
        app = null;
    });
    await it(`/status returns sensor fields`, async (): Promise<void> => {
        sensorState.ok = true;
        sensorState.co2ppm = 600;
        sensorState.avg = { m1: 650, m5: 620, m10: 610, m30: 600 };
        sensorState.lastUpdateMs = Date.now() - 1000;
        sensorState.lastError = null;
        app = await createApi({ host: "127.0.0.1", port: 0 });
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
                avg: { m1: 650, m5: 620, m10: 610, m30: 600 },
                lastError: null,
            },
        });
        assert.ok(isNumber(api.memory) && api.memory >= 0);
        assert.ok(isNumber(api.uptime) && api.uptime >= 0);
        assert.ok(isNumber(api.sensor.ageMs) && api.sensor.ageMs >= 0 && api.sensor.ageMs < 5_000);
        assert.ok(isNumber(api.sensor.lastUpdateMs));
    });
});
