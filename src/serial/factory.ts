import type { SerialPort } from "@/serial/types";
import { MockSerialPort } from "@/serial/mock";

export function createSerialPortFromMock(): SerialPort {
    console.log("Serial, using mock port");
    return new MockSerialPort({
        basePpm: 650,
        amplitude: 200,
        responseDelayMs: 60,
    });
}
