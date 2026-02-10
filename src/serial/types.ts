export type SerialDataHandler = (data: Buffer) => void;

export interface SerialPort {
    write(data: Buffer): void;
    onData(handler: SerialDataHandler): void;
    onError(handler: (err: Error) => void): void;
    onClose?(handler: (hadError: boolean) => void): void;
    close(): Promise<void>;
}
