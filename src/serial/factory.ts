import { SerialPort as NodeSerialPort } from "serialport";
import type { SerialDataHandler, SerialPort } from "@/serial/types";
import { MockSerialPort } from "@/serial/mock";

export interface SerialPortFromNodeOptions {
    path: string;
    baudRate?: number;
}

export function createSerialPortFromMock(): SerialPort {
    console.log("Serial port created from mock");
    return new MockSerialPort({
        basePpm: 650,
        amplitude: 200,
        responseDelayMs: 60,
    });
}

export function createSerialPortFromNode(opts: SerialPortFromNodeOptions): SerialPort {
    const port = new NodeSerialPort({
        path: opts.path,
        baudRate: opts.baudRate ?? 9_600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        autoOpen: true,
    });
    console.log(`Serial port created from`, { path: opts.path });
    return {
        write(data: Buffer): void {
            port.write(data);
        },
        onData(handler: SerialDataHandler): void {
            port.on("data", (chunk: Buffer): void => {
                handler(chunk);
            });
        },
        onError(handler: (err: Error) => void): void {
            port.on("error", handler);
        },
        close(): Promise<void> {
            return new Promise((resolve, reject): void => {
                port.close((err?: Error | null): void => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        },
    };
}
