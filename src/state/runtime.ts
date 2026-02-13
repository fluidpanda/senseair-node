export interface SensorAvg {
    m1: number | null;
    m5: number | null;
    m10: number | null;
    m30: number | null;
    m60: number | null;
}

export interface SensorData {
    ok: boolean;
    co2ppm: number | null;
    avg: SensorAvg;
    lastUpdateMs: number | null;
    lastError: string | null;
}

export interface DeviceInfo {
    mode: "mock" | "node";
    path: string;
    serialNumber: string | null;
    vendorId: string | null;
    productId: string | null;
    manufacturer: string | null;
    connectedAtMs: number | null;
}

export interface RuntimeState {
    data: SensorData;
    device: DeviceInfo | null;
}

export const sensorAvgEmpty: SensorAvg = {
    m1: null,
    m5: null,
    m10: null,
    m30: null,
    m60: null,
};

export const sensorDataEmpty: SensorData = {
    ok: false,
    co2ppm: null,
    avg: sensorAvgEmpty,
    lastUpdateMs: null,
    lastError: null,
};

export const runtimeState: RuntimeState = {
    data: { ...sensorDataEmpty, avg: { ...sensorAvgEmpty } },
    device: null,
};
