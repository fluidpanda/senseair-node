import type { Logger } from "@/logging/logger";
import type { Announcer } from "@/network/announce";
import type { SensorRunner } from "@/sensor/runner";
import type { DetectedPort, DetectedSerialPort } from "@/serial/autodetect";
import { createApi } from "@/api/http";
import { getDeviceId } from "@/helpers/devices";
import { envInt, envStr, initEnv } from "@/helpers/envs";
import { createLogger } from "@/logging/logger";
import { createAnnouncer } from "@/network/announce";
import { createSensorRunner } from "@/sensor/runner";
import { autodetectPorts } from "@/serial/autodetect";
import { selectPort } from "@/serial/select";
import { isFtdi } from "@/serial/vendors";

initEnv();

const UART_SERIAL: string | null = envStr("UART_SERIAL");
const API_HOST: string = envStr("API_HOST") ?? "0.0.0.0";
const API_PORT: number = envInt("API_PORT", 4_545);
const POLL_INTERVAL_MS: number = envInt("POLL_INTERVAL_MS", 5_000);
const BROADCAST_INTERVAL_MS: number = envInt("BROADCAST_INTERVAL_MS", 10_000);

const logger: Logger = createLogger();

async function selectSenseAirPort(): Promise<DetectedPort | null> {
    const ports: Array<DetectedSerialPort> = await autodetectPorts(isFtdi);
    return selectPort(ports, { serial: UART_SERIAL ?? undefined });
}

async function main(): Promise<void> {
    const runner: SensorRunner = createSensorRunner({
        logger,
        selectPort: selectSenseAirPort,
        pollingIntervalMs: POLL_INTERVAL_MS,
    });
    await runner.start();
    const api = await createApi({
        logger,
        host: API_HOST,
        port: API_PORT,
    });
    const announcer: Announcer = createAnnouncer({
        logger,
        id: getDeviceId(),
        apiPort: API_PORT,
        intervalMs: BROADCAST_INTERVAL_MS,
    });
    const shutdown = async (): Promise<void> => {
        await runner.stop();
        await api.close();
        announcer.stop();
        process.exit(0);
    };
    process.on("SIGINT", (): undefined => void shutdown());
    process.on("SIGTERM", (): undefined => void shutdown());
}

void main();
