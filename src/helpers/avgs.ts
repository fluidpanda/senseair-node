import { SlidingWindowAvg } from "@/state/history";

export type AvgKey = "m1" | "m5" | "m10" | "m30" | "m60";

const min = 60 * 1_000;

const AVG_WINDOWS: Readonly<Record<AvgKey, number>> = {
    m1: min,
    m5: 5 * min,
    m10: 10 * min,
    m30: 30 * min,
    m60: 60 * min,
} as const;

export const avgs: Map<AvgKey, SlidingWindowAvg> = new Map(
    (Object.entries(AVG_WINDOWS) as Array<[AvgKey, number]>).map(
        ([k, ms]: [AvgKey, number]): [AvgKey, SlidingWindowAvg] => [k, new SlidingWindowAvg(ms)],
    ),
);

export function calcAvg(now: number): Record<AvgKey, number | null> {
    const out: Partial<Record<AvgKey, number | null>> = {};
    for (const [k, w] of avgs) {
        out[k] = w.avg(now);
    }
    return out as Record<AvgKey, number | null>;
}
