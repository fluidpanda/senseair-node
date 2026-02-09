import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { startService } from "@/service";
import { sensorState } from "@/state/types";
import { makeCo2Frame, sleep } from "@/tests/helpers";
import { FakePort } from "@/tests/service/fake";

await describe(`src/service.startService`, async (): Promise<void> => {
    beforeEach((): void => {
        sensorState.ok = false;
        sensorState.co2ppm = null;
        sensorState.lastUpdateMs = null;
        sensorState.lastError = null;
    });
    await it("writes READ_CO2 immediately on start", async (): Promise<void> => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        assert.ok(port.writes.length >= 1);
        await service.stop();
    });
    await it("polls periodically and stops polling", async (): Promise<void> => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 10 });
        await sleep(50);
        const writeBeforeStop: number = port.writes.length;
        assert.ok(writeBeforeStop >= 2);
        await service.stop();
        assert.equal(port.closed, true);
        await sleep(30);
        assert.equal(port.writes.length, writeBeforeStop);
    });
    await it("updates state on valid frame", async (): Promise<void> => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        port.emitData(makeCo2Frame(500));
        assert.equal(sensorState.ok, true);
        assert.equal(sensorState.co2ppm, 500);
        assert.equal(sensorState.lastError, null);
        assert.ok(typeof sensorState.lastUpdateMs === "number");
        await service.stop();
    });
    await it("sets error on invalid frame", async (): Promise<void> => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        port.emitData(Buffer.from([0x00, 0xff]));
        assert.equal(sensorState.ok, false);
        assert.equal(sensorState.lastError, null);
        await service.stop();
    });
    await it("sets error state on serial error", async (): Promise<void> => {
        const port = new FakePort();
        const service = startService(port, { pollingIntervalMs: 50_000 });
        port.emitError(new Error("Yoba eto ti?"));
        assert.equal(sensorState.ok, false);
        assert.equal(sensorState.lastError, "Yoba eto ti?");
        await service.stop();
    });
});
