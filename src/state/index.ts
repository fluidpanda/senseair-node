export interface SensorState {
    ok: boolean;
    co2ppm: number | null;
    lastUpdateMs: number | null;
    lastError: string | null;
}

export const sensorState: SensorState = {
    ok: false,
    co2ppm: null,
    lastUpdateMs: null,
    lastError: null,
};
