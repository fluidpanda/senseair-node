import type { DetectedPort, DetectedSerialPort } from "@/serial/autodetect";

function deviceInfoFromPort(p: DetectedSerialPort): DetectedPort["device"] {
    return {
        serialNumber: p.serialNumber,
        vendorId: p.vendorId,
        productId: p.productId,
        manufacturer: p.manufacturer,
    };
}

export function selectPort(ports: Array<DetectedSerialPort>, opts: { serial?: string }): DetectedPort | null {
    if (ports.length === 0) return null;
    if (opts.serial) {
        const p: DetectedSerialPort | undefined = ports.find(
            (x: DetectedSerialPort): boolean => x.serialNumber === opts.serial,
        );
        if (!p) {
            throw new Error(`Requested serial ${opts.serial} not found`);
        }
        return {
            path: p.path,
            reason: `matched by serial ${opts.serial}`,
            device: deviceInfoFromPort(p),
        };
    }
    if (ports.length > 1) {
        throw new Error(
            `Multiple device found. Serial must be explicitly defined. ` +
                `Available: ${ports.map((p: DetectedSerialPort): string => `${p.serialNumber}@${p.path}`).join(", ")}`,
        );
    }
    const p: DetectedSerialPort = ports[0];
    return {
        path: p.path,
        reason: `single device ${p.serialNumber ?? "?"}`,
        device: deviceInfoFromPort(p),
    };
}
