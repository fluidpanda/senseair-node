export interface Co2Sample {
    atMs: number;
    ppm: number;
}

export class SlidingWindowAvg {
    private readonly windowMs: number;
    private readonly samples: Co2Sample[] = [];
    private prune(nowMs: number): void {
        const minMs: number = nowMs - this.windowMs;
        let index = 0;
        while (index < this.samples.length && this.samples[index].atMs < minMs) index++;
        if (index > 0) this.samples.splice(0, index);
    }
    constructor(windowMs: number) {
        this.windowMs = windowMs;
    }
    push(ppm: number, atMs: number): void {
        this.samples.push({ ppm, atMs });
        this.prune(atMs);
    }
    avg(nowMs: number): number | null {
        this.prune(nowMs);
        if (this.samples.length === 0) return null;
        let sum = 0;
        for (const s of this.samples) sum += s.ppm;
        return Math.floor(sum / this.samples.length);
    }
    count(nowMs: number): number {
        this.prune(nowMs);
        return this.samples.length;
    }
}
