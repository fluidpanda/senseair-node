import type { SensorData, DeviceInfo } from "@/state/runtime";

export interface SensorStatus extends SensorData {
    ageMs: number | null;
}

export interface StatusResponse {
    uptime: number | null;
    memory: number | null;
    sensor: SensorStatus;
    device: DeviceInfo | null;
}
