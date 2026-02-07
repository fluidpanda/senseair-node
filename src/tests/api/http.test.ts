import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { StatusResponse } from "@/api/types";
import { createApi } from "@/api/http";
import { sensorState } from "@/state";

await describe(`src/api/http.createApi`, async (): Promise<void> => {
    let app: Awaited<ReturnType<typeof createApi>> | null = null;
    afterEach(async (): Promise<void> => {
        await app?.close();
        app = null;
    });
    await it(`/status returns sensor fields`, async (): Promise<void> => {
        sensorState.ok = true;
        sensorState.co2ppm = 600;
        sensorState.lastUpdateMs = Date.now() - 1000;
        sensorState.lastError = null;
        app = await createApi({ host: "127.0.0.1", port: 0 });
        const res = await app.inject({ method: "GET", url: "/status" });
        assert.equal(res.statusCode, 200);
        const body: StatusResponse = res.json();
        assert.equal(body.sensor.ok, true);
        assert.equal(body.sensor.co2ppm, 600);
        assert.ok(typeof body.sensor.lastUpdateMs === "number");
        assert.ok(typeof body.sensor.ageMs === "number");
        assert.equal(body.sensor.lastError, null);
    });
});
