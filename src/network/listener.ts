import * as dgram from "node:dgram";
import type { AnnouncePayloadV1 } from "@/network/announce";

const PORT = 45_454;
const socket = dgram.createSocket("udp4");
socket.on("listening", (): void => {
    const a = socket.address();
    console.log(`listening for UDP announce on ${a.address}:${a.port}`);
});
socket.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo): void => {
    console.log(`from ${rinfo.address}:${rinfo.port}`);
    console.log(`bytes ${msg.length}`);
    try {
        const parsed = JSON.parse(msg.toString("utf8")) as AnnouncePayloadV1;
        console.log("parsed Json");
        console.log(parsed);
    } catch {
        console.log("raw");
        console.log(msg.toString("utf8"));
    }
});
socket.on("error", (err: Error): void => {
    console.error("udp socket error:", err.message);
});
socket.bind(PORT, "0.0.0.0");
