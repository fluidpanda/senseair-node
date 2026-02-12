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

export interface Announcer {
    stop(): void;
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

function buildPayload(opts: UdpAnnounceOptions): AnnouncePayloadV1 {
    return {
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
}

export function createAnnouncer(opts: UdpAnnounceOptions): Announcer {
    const host: string = opts.broadcastHost ?? "255.255.255.255";
    const port: number = opts.broadcastPort ?? 45_454;
    const intervalMs: number = opts.intervalMs ?? 5_000;
    const socket = dgram.createSocket("udp4");
    socket.unref();
    let closed = false;
    const sendOnce = (): void => {
        if (closed) return;
        const payload: AnnouncePayloadV1 = buildPayload(opts);
        const msg: Buffer = Buffer.from(JSON.stringify(payload), "utf8");
        socket.send(msg, port, host, (err: Error | null) => {
            if (err) console.error("UDP announce send failed:", err.message);
        });
    };
    socket.bind((): void => {
        if (closed) return;
        socket.setBroadcast(true);
        sendOnce();
    });
    const timer = setInterval(sendOnce, intervalMs);
    timer.unref();
    return {
        stop(): void {
            if (closed) return;
            closed = true;
            clearInterval(timer);
            socket.close();
        },
    };
}
