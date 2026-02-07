export interface StatusResponse {
    uptime: number;
    sensor: {
        ok: boolean;
        co2ppm: number | null;
        lastUpdateMs: number | null;
        ageMs: number | null;
        lastError: string | null;
    };
}
