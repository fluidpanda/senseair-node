import type { DetectedSerialPort } from "@/serial/autodetect";

export function isFtdi(p: DetectedSerialPort): boolean {
    if (p.vendorId === "0403" && p.productId === "6001") return true;
    return (p.manufacturer ?? "").toLowerCase().includes("ftdi");
}
