import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { delay } from "@/helpers/sensors";
import { makeCo2Frame } from "@/helpers/tests";
import { startService } from "@/sensor/service";
import { sensorState } from "@/state/types";
import { FakePort } from "@/tests/service/fake";

await describe(`src/service.startService`, async (): Promise<void> => {
    beforeEach((): void => {
        sensorState.ok = false;
        sensorState.co2ppm = null;
        sensorState.lastUpdateMs = null;
        sensorState.lastError = null;
    });
    await it("writes READ_CO2 immediately on start", (): void => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        assert.ok(port.writes.length >= 1);
        service.stop();
    });
    await it("polls periodically and stops polling", async (): Promise<void> => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 10 });
        await delay(50);
        const writeBeforeStop: number = port.writes.length;
        assert.ok(writeBeforeStop >= 2);
        service.stop();
        assert.equal(port.closed, false);
        await delay(30);
        assert.equal(port.writes.length, writeBeforeStop);
    });
    await it("updates state on valid frame", (): void => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        port.emitData(makeCo2Frame(500));
        assert.equal(sensorState.ok, true);
        assert.equal(sensorState.co2ppm, 500);
        assert.equal(sensorState.lastError, null);
        assert.ok(typeof sensorState.lastUpdateMs === "number");
        service.stop();
    });
    await it("waits for frame ending", (): void => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        port.emitData(Buffer.from([0x00, 0xff]));
        assert.equal(sensorState.ok, false);
        assert.equal(sensorState.co2ppm, null);
        assert.equal(sensorState.lastError, null);
        service.stop();
    });
    await it("sets error state on serial error", (): void => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        port.emitError(new Error("Yoba eto ti?"));
        assert.equal(sensorState.ok, false);
        assert.equal(sensorState.lastError, "Yoba eto ti?");
        service.stop();
    });
});
