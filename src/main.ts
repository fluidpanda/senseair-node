import type { SensorRunner } from "@/sensor/runner";
import { createApi } from "@/api/http";
import { envInt, envStr, initEnv } from "@/helpers/env";
import { createSensorRunner } from "@/sensor/runner";
import { autodetectPort } from "@/serial/autodetect";

initEnv();

const API_HOST: string = envStr("API_HOST") ?? "0.0.0.0";
const API_PORT: number = envInt("API_PORT", 4_545);
const POLL_INTERVAL_MS: number = envInt("POLL_INTERVAL_MS", 5_000);

async function main(): Promise<void> {
    const runner: SensorRunner = createSensorRunner({
        selectPort: autodetectPort,
        pollingIntervalMs: POLL_INTERVAL_MS,
    });
    await runner.start();
    const api = await createApi({ host: API_HOST, port: API_PORT });
    const shutdown = async (): Promise<void> => {
        await runner.stop();
        await api.close();
        process.exit(0);
    };
    process.on("SIGINT", (): undefined => void shutdown());
    process.on("SIGTERM", (): undefined => void shutdown());
}

void main();
