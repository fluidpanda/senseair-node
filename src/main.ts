import type { SerialPort } from "@/serial/types";
import { createApi } from "@/api/http";
import { createSerialPortFromMock } from "@/serial/factory";
import { startService } from "@/service";

async function main(): Promise<void> {
    const pollingIntervalMs = 5_000;
    const apiHost: string = "127.0.0.1";
    const apiPort: number = 4_545;
    const port: SerialPort = createSerialPortFromMock();
    const service = startService(port, { pollingIntervalMs });
    const api = await createApi({ host: apiHost, port: apiPort });
    const shutdown = async (): Promise<void> => {
        console.log("Shutting down");
        await api.close();
        await service.stop();
        process.exit(0);
    };
    process.on("SIGINT", () => void shutdown());
    process.on("SIGTERM", () => void shutdown());
}

void main();
