import type { DetectedPort } from "@/serial/autodetect";
import type { SerialPort } from "@/serial/types";
import { createApi } from "@/api/http";
import { envInt, envStr, initEnv } from "@/helpers/env";
import { autodetectPort } from "@/serial/autodetect";
import { createSerialPortFromNode, createSerialPortFromMock } from "@/serial/factory";
import { startService } from "@/service";

initEnv();

const API_HOST: string = "0.0.0.0";
const API_PORT: number = envInt("API_PORT", 4_545);
const POLL_INTERVAL_MS: number = envInt("POLL_INTERVAL_MS", 5_000);

async function selectSerial(): Promise<DetectedPort | null> {
    const envPath: string | null = envStr("SERIAL_PATH");
    if (envPath) {
        return { path: envPath, reason: "environment SERIAL_PATH set" };
    }
    return await autodetectPort();
}

async function main(): Promise<void> {
    const select = await selectSerial();
    console.log("Serial selected", select ?? { using: "mock" });
    const port: SerialPort = select
        ? createSerialPortFromNode({ path: select.path, baudRate: 9_600 })
        : createSerialPortFromMock();
    const service = startService(port, { pollingIntervalMs: POLL_INTERVAL_MS });
    const api = await createApi({ host: API_HOST, port: API_PORT });
    const shutdown = async (): Promise<void> => {
        console.log("Shutting down");
        await api.close();
        await service.stop();
        process.exit(0);
    };
    process.on("SIGINT", (): undefined => void shutdown());
    process.on("SIGTERM", (): undefined => void shutdown());
}

void main();
