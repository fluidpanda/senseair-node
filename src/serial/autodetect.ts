import { SerialPort as NodeSerialPort } from "serialport";

// {
//     path: '/dev/ttyUSB0',
//     manufacturer: 'FTDI',
//     serialNumber: 'BG02PWGZ',
//     pnpId: 'usb-FTDI_FT232R_USB_UART_BG02PWGZ-if00-port0',
//     locationId: undefined,
//     vendorId: '0403',
//     productId: '6001'
// }

export interface DetectedSerialPort {
    path: string;
    vendorId: string | null;
    productId: string | null;
    manufacturer: string | null;
}

export interface DetectedPort {
    path: string;
    reason: string;
}

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

function getString(x: unknown): string | null {
    return typeof x === "string" && x.length > 0 ? x : null;
}

function normHex(x: string | null): string | null {
    if (!x) return null;
    const s: string = x.toLowerCase().replace(/^0x/, "");
    return /^[0-9A-f]+$/.test(s) ? s : null;
}

function sanitizePort(x: unknown): DetectedSerialPort | null {
    if (!isRecord(x)) return null;
    const path: string | null = getString(x.path);
    if (!path) return null;
    const vendorId: string | null = normHex(getString(x.vendorId));
    const productId: string | null = normHex(getString(x.productId));
    const manufacturer: string | null = getString(x.manufacturer);
    return { path, vendorId, productId, manufacturer };
}

async function listPorts(): Promise<DetectedSerialPort[]> {
    const raw: unknown = await NodeSerialPort.list();
    if (!Array.isArray(raw)) return [];
    const out: DetectedSerialPort[] = [];
    for (const item of raw) {
        const p: DetectedSerialPort | null = sanitizePort(item);
        if (p) out.push(p);
    }
    return out;
}

export async function autodetectPort(): Promise<DetectedPort | null> {
    const ports: DetectedSerialPort[] = await listPorts();
    for (const p of ports) {
        if (p.vendorId === "0403" && p.productId === "6001") {
            return { path: p.path, reason: `FTDI VID/PID ${p.vendorId}:${p.productId}` };
        }
        if ((p.manufacturer ?? "").toLowerCase().includes("ftdi")) {
            return { path: p.path, reason: `manufacturer ${p.manufacturer}` };
        }
    }
    const fallback: DetectedSerialPort | undefined = ports.find((p: DetectedSerialPort): boolean => {
        const v: string = p.path.toLowerCase();
        return v.includes("ttyusb") || v.startsWith("com");
    });
    return fallback ? { path: fallback.path, reason: `first serial-like port ${fallback.path}` } : null;
}
