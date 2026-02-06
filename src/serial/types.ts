export type SerialDataHandler = (data: Buffer) => void;

export interface SerialPort {
    write(data: Buffer): void;
    onData(handler: SerialDataHandler): void;
    onError(handler: (err: Error) => void): void;
    close(): Promise<void>;
}
