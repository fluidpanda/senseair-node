import type { Logger } from "@/logging/logger";
import type { DetectedPort } from "@/serial/autodetect";
import type { SerialPort } from "@/serial/types";
import { delay, makeDeviceInfo, resetSensorData } from "@/helpers/sensors";
import { startService } from "@/sensor/service";
import { createSerialPortFromMock, createSerialPortFromNode } from "@/serial/factory";
import { runtimeState } from "@/state/runtime";

export interface SensorRunnerOptions {
    logger: Logger;
    selectPort: () => Promise<DetectedPort | null>;
    pollingIntervalMs: number;
    staleAfterMs?: number;
    reconnectBackoffMs?: number;
    probeNodePortEveryMs?: number;
}

export interface SensorRunner {
    start(): Promise<void>;
    stop(): Promise<void>;
}

type Mode = "mock" | "node";

export function createSensorRunner(opts: SensorRunnerOptions): SensorRunner {
    const log: Logger = opts.logger.child({ module: "runner" });
    let port: SerialPort | null = null;
    let service: { stop: () => void } | null = null;
    let watchdog: NodeJS.Timeout | null = null;
    let probeTimer: NodeJS.Timeout | null = null;
    let stopping: boolean = false;
    let reconnecting: boolean = false;
    let mode: Mode = "mock";
    const staleAfterMs: number = opts.staleAfterMs ?? Math.max(opts.pollingIntervalMs * 3, 15_000);
    const backoffMaxMs: number = opts.reconnectBackoffMs ?? 10_000;
    const probeEveryMs: number = opts.probeNodePortEveryMs ?? 3_000;

    async function teardown(): Promise<void> {
        if (watchdog) {
            clearInterval(watchdog);
            watchdog = null;
        }
        if (probeTimer) {
            clearInterval(probeTimer);
            probeTimer = null;
        }
        if (service) {
            service.stop();
            service = null;
        }
        if (port) {
            await port.close().catch((): void => undefined);
            port = null;
        }
    }
    function startWatchdog(): void {
        if (watchdog) return;
        watchdog = setInterval((): void => {
            if (mode !== "node") return;
            const last: number | null = runtimeState.data.lastUpdateMs;
            if (!last) return;
            const age: number = Date.now() - last;
            if (age > staleAfterMs) {
                void reconnect(`no data for ${age}ms`);
            }
        }, 2_000);
    }
    function attachNodePortHandlers(p: SerialPort): void {
        p.onClose?.((hadError: boolean): void => {
            if (stopping) return;
            log.warn({ hadError });
            void reconnect(`serial closed (hadError=${hadError})`);
        });
        p.onError((err: Error): void => {
            if (stopping) return;
            log.error({ err });
            void reconnect(`serial error: ${err.message}`);
        });
    }
    function startMock(): void {
        mode = "mock";
        runtimeState.device = makeDeviceInfo({
            mode,
            path: "mock",
            serialNumber: "M0CKM0CK",
            vendorId: "0001",
            productId: "0001",
            manufacturer: "MOCK",
        });
        resetSensorData({ lastError: "Demo mode, sensor device not detected" });
        port = createSerialPortFromMock();
        log.info({ mode });
        service = startService(port, {
            logger: log.child({ component: "service" }),
            pollingIntervalMs: opts.pollingIntervalMs,
        });
        if (!probeTimer) {
            probeTimer = setInterval((): void => {
                void trySwitchToNode();
            }, probeEveryMs);
        }
    }
    function startNode(d: DetectedPort): void {
        mode = "node";
        runtimeState.device = makeDeviceInfo({
            mode,
            path: d.path,
            serialNumber: d.device.serialNumber,
            vendorId: d.device.vendorId,
            productId: d.device.productId,
            manufacturer: d.device.manufacturer,
        });
        port = createSerialPortFromNode({
            logger: log.child({ component: "factory" }),
            path: d.path,
            baudRate: 9_600,
        });
        log.info({ mode, path: d.path, baudRate: 9_600 });
        service = startService(port, {
            logger: log.child({ component: "service" }),
            pollingIntervalMs: opts.pollingIntervalMs,
        });
        attachNodePortHandlers(port);
        startWatchdog();
        runtimeState.data.lastError = null;
    }
    async function trySwitchToNode(): Promise<void> {
        if (stopping) return;
        if (mode !== "mock") return;
        if (reconnecting) return;
        const d: DetectedPort | null = await opts.selectPort();
        if (!d) return;
        await teardown();
        startNode(d);
    }
    async function reconnect(reason: string): Promise<void> {
        if (stopping || reconnecting) return;
        reconnecting = true;
        resetSensorData({ lastError: reason });
        log.warn({ reason });
        let backoff = 500;
        while (!stopping) {
            try {
                await teardown();
                await delay(backoff);
                const d: DetectedPort | null = await opts.selectPort();
                if (!d) {
                    startMock();
                    reconnecting = false;
                    return;
                }
                startNode(d);
                reconnecting = false;
                return;
            } catch {
                backoff = Math.min(backoff * 2, backoffMaxMs);
            }
        }
    }
    async function startOnce(): Promise<void> {
        const d: DetectedPort | null = await opts.selectPort();
        if (!d) {
            startMock();
            return;
        }
        startNode(d);
    }
    return {
        async start(): Promise<void> {
            stopping = false;
            await startOnce();
        },
        async stop(): Promise<void> {
            stopping = true;
            await teardown();
        },
    };
}
