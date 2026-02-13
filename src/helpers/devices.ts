import { runtimeState } from "@/state/runtime";

export function getDeviceId(): string {
    const device = runtimeState.device;
    if (!device) return "UNKNOWN";
    if (device.mode === "mock") return "MOCK-SENSOR";
    const identity: Array<string | null> = [device.vendorId, device.productId, device.serialNumber];
    const fullId: Array<string> = identity.filter((x: string | null): x is string => Boolean(x));
    if (fullId.length === 3) return fullId.join(":");
    return device.serialNumber ?? device.path.replace(/[/\\:]/g, "-");
}

export function getDeviceDescription(): string {
    const device = runtimeState.device;
    if (!device) return "No device connected";
    if (device.mode === "mock") return "Demo mode, sensor device not detected";
    const parts: Array<string | null> = [
        device.manufacturer,
        device.serialNumber ? `SN:${device.serialNumber}` : null,
        `@${device.path}`,
    ].filter((x: string | null): x is string => Boolean(x));
    return parts.join(":");
}
