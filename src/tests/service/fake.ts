import type { SerialDataHandler, SerialPort } from "@/serial/types";

export class FakePort implements SerialPort {
    public writes: Buffer[] = [];
    public closed: boolean = false;
    private onDataCb: SerialDataHandler | null = null;
    private onErrorCb: ((err: Error) => void) | null = null;
    onData(handler: SerialDataHandler): void {
        this.onDataCb = handler;
    }
    onError(handler: (err: Error) => void): void {
        this.onErrorCb = handler;
    }
    write(data: Buffer): void {
        this.writes.push(Buffer.from(data));
    }
    close(): Promise<void> {
        this.closed = true;
        return Promise.resolve();
    }
    emitData(data: Buffer): void {
        this.onDataCb?.(data);
    }
    emitError(data: Error): void {
        this.onErrorCb?.(data);
    }
}
