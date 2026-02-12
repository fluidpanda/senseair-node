import type { ConnectedDevice } from "@/state/types";

export interface StatusResponse {
    uptime: number;
    memory: number;
    sensor: {
        ok: boolean;
        co2ppm: number | null;
        avg: { m1: number | null; m5: number | null; m10: number | null; m30: number | null };
        lastUpdateMs: number | null;
        ageMs: number | null;
        lastError: string | null;
        device: ConnectedDevice | null;
    };
}
