import * as dgram from "node:dgram";
import * as os from "node:os";

export interface AnnouncePayloadV1 {
    type: "senseair.sensor.announce";
    version: 1.0;
    id: string;
    ips: Array<string>;
    api: {
        port: number;
        path: "/status";
    };
    ts: number;
}

export interface UdpAnnounceOptions {
    id: string;
    apiPort: number;
    broadcastHost?: string;
    broadcastPort?: number;
    intervalMs?: number;
    ips?: Array<string>;
}

function detectLocalIPv4(): Array<string> {
    const iface = os.networkInterfaces();
    const ips: Array<string> = [];
    for (const entries of Object.values(iface)) {
        for (const e of entries ?? []) {
            if (e.family !== "IPv4") continue;
            if (e.internal) continue;
            ips.push(e.address);
        }
    }
    return ips;
}

export function startAnnounce(opts: UdpAnnounceOptions): { stop: () => Promise<void> } {
    const host: string = opts.broadcastHost ?? "255.255.255.255";
    const port: number = opts.broadcastPort ?? 45_454;
    const intervalMs: number = opts.intervalMs ?? 5_000;
    const socket = dgram.createSocket("udp4");
    socket.unref();
    socket.bind((): void => {
        socket.setBroadcast(true);
    });
    const sendOnce = (): void => {
        const payload: AnnouncePayloadV1 = {
            type: "senseair.sensor.announce",
            version: 1.0,
            id: opts.id,
            ips: opts.ips ?? detectLocalIPv4(),
            api: {
                port: opts.apiPort,
                path: "/status",
            },
            ts: Date.now(),
        };
        const msg: Buffer<ArrayBuffer> = Buffer.from(JSON.stringify(payload), "utf8");
        socket.send(msg, port, host);
    };
    const timer = setInterval(sendOnce, intervalMs);
    timer.unref();
    return {
        stop: async (): Promise<void> => {
            clearInterval(timer);
            await new Promise<void>((resolve): void => {
                socket.close((): void => resolve());
            });
        },
    };
}
