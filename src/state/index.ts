export interface SensorState {
    ok: boolean;
    co2ppm: number | null;
    co2ppmAvg1min: number | null;
    co2ppmAvg5min: number | null;
    co2ppmAvg10min: number | null;
    lastUpdateMs: number | null;
    lastError: string | null;
}

export const sensorState: SensorState = {
    ok: false,
    co2ppm: null,
    co2ppmAvg1min: null,
    co2ppmAvg5min: null,
    co2ppmAvg10min: null,
    lastUpdateMs: null,
    lastError: null,
};
