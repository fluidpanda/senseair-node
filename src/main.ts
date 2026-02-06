import type { SerialPort } from "@/serial/types";
import { createSerialPortFromMock } from "@/serial/factory";
import { startService } from "@/service";

function main(): void {
    const pollingIntervalMs = 5_000;
    const port: SerialPort = createSerialPortFromMock();
    const service = startService(port, { pollingIntervalMs });
    const shutdown = async (): Promise<void> => {
        console.log("Shutting down");
        await service.stop();
        process.exit(0);
    };
    process.on("SIGINT", () => void shutdown());
    process.on("SIGTERM", () => void shutdown());
}

main();
