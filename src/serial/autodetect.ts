import { SerialPort as NodeSerialPort } from "serialport";
import { sanitizePort } from "@/helpers/serials";

// {
//     path: '/dev/ttyUSB0',
//     manufacturer: 'FTDI',
//     serialNumber: 'BG02PWGZ',
//     pnpId: 'usb-FTDI_FT232R_USB_UART_BG02PWGZ-if00-port0',
//     locationId: undefined,
//     vendorId: '0403',
//     productId: '6001'
// }

// {
//     path: 'COM3',
//     manufacturer: 'FTDI',
//     serialNumber: 'BG02PWGZ',
//     pnpId: 'FTDIBUS\\VID_0403+PID_6001+BG02PWGZA\\0000',
//     locationId: undefined,
//     friendlyName: 'USB Serial Port (COM3)',
//     vendorId: '0403',
//     productId: '6001'
// }

export interface DetectedSerialPort {
    path: string;
    vendorId: string | null;
    productId: string | null;
    manufacturer: string | null;
    serialNumber: string | null;
}

export interface DeviceInfo {
    serialNumber: string | null;
    vendorId: string | null;
    productId: string | null;
    manufacturer: string | null;
}

export interface DetectedPort {
    path: string;
    reason: string;
    device: DeviceInfo;
}

type Predicate = (p: DetectedSerialPort) => boolean;

async function listPorts(): Promise<Array<DetectedSerialPort>> {
    const raw: unknown = await NodeSerialPort.list();
    if (!Array.isArray(raw)) return [];
    const out: Array<DetectedSerialPort> = [];
    for (const item of raw) {
        const p: DetectedSerialPort | null = sanitizePort(item);
        if (p) out.push(p);
    }
    return out;
}

function matchesAny(p: DetectedSerialPort, predicates: ReadonlyArray<Predicate>): boolean {
    for (const pred of predicates) {
        if (pred(p)) return true;
    }
    return false;
}

export async function autodetectPorts(
    ...predicates: Array<(p: DetectedSerialPort) => boolean>
): Promise<Array<DetectedSerialPort>> {
    const ports: Array<DetectedSerialPort> = await listPorts();
    if (predicates.length === 0) return ports;
    return ports.filter((p: DetectedSerialPort): boolean => matchesAny(p, predicates));
}
