import type { DetectedSerialPort } from "@/serial/autodetect";

export function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

export function getString(x: unknown): string | null {
    return typeof x === "string" && x.length > 0 ? x : null;
}

export function normHex(x: string | null): string | null {
    if (!x) return null;
    const s: string = x.toLowerCase().replace(/^0x/, "");
    return /^[0-9a-f]+$/.test(s) ? s : null;
}

export function sanitizePort(x: unknown): DetectedSerialPort | null {
    if (!isRecord(x)) return null;
    const path: string | null = getString(x.path);
    if (!path) return null;
    const vendorId: string | null = normHex(getString(x.vendorId));
    const productId: string | null = normHex(getString(x.productId));
    const manufacturer: string | null = getString(x.manufacturer);
    const serialNumber: string | null = getString(x.serialNumber);
    return { path, vendorId, productId, manufacturer, serialNumber };
}
