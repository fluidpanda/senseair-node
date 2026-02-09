export interface Co2Avg {
    m1: number | null;
    m5: number | null;
    m10: number | null;
    m30: number | null;
}

export interface SensorState {
    ok: boolean;
    co2ppm: number | null;
    avg: Co2Avg;
    lastUpdateMs: number | null;
    lastError: string | null;
}

export const sensorState: SensorState = {
    ok: false,
    co2ppm: null,
    avg: { m1: null, m5: null, m10: null, m30: null },
    lastUpdateMs: null,
    lastError: null,
};
