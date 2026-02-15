import type { DeviceInfo, SensorData, SensorAvg } from "@/state/runtime";
import { runtimeState, sensorAvgEmpty, sensorDataEmpty } from "@/state/runtime";

export function delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

export function makeDeviceInfo(
    init: Omit<DeviceInfo, "connectedAtMs"> & {
        connectedAtMs?: number | null;
    },
): DeviceInfo {
    return {
        ...init,
        connectedAtMs: init.connectedAtMs ?? Date.now(),
    };
}

export function resetSensorData(extra?: Partial<SensorData>): void {
    runtimeState.data = {
        ...sensorDataEmpty,
        avg: { ...sensorAvgEmpty },
        ...extra,
    };
}

export function applySensorFrame(ppm: number, avg: SensorAvg, now: number): void {
    runtimeState.data.ok = true;
    runtimeState.data.co2ppm = ppm;
    runtimeState.data.avg = avg;
    runtimeState.data.lastUpdateMs = now;
    runtimeState.data.lastError = null;
}

export function setSensorError(message: string): void {
    runtimeState.data.ok = false;
    runtimeState.data.lastError = message;
}
