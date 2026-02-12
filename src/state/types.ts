import type { DeviceInfo } from "@/serial/autodetect";

export interface Co2Avg {
    m1: number | null;
    m5: number | null;
    m10: number | null;
    m30: number | null;
}

export interface ConnectedDevice extends DeviceInfo {
    path: string;
    connectedAtMs: number;
}

export interface SensorState {
    ok: boolean;
    co2ppm: number | null;
    avg: Co2Avg;
    lastUpdateMs: number | null;
    lastError: string | null;
    device: ConnectedDevice | null;
    mode: "mock" | "node";
}

export const sensorState: SensorState = {
    ok: false,
    co2ppm: null,
    avg: { m1: null, m5: null, m10: null, m30: null },
    lastUpdateMs: null,
    lastError: null,
    device: null,
    mode: "mock",
};
