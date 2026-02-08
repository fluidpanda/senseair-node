export interface SensorState {
    ok: boolean;
    co2ppm: number | null;
    co2ppmAvg: number | null;
    lastUpdateMs: number | null;
    lastError: string | null;
}

export const sensorState: SensorState = {
    ok: false,
    co2ppm: null,
    co2ppmAvg: null,
    lastUpdateMs: null,
    lastError: null,
};
