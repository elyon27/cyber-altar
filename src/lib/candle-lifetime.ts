export const CANDLE_LIFETIME_MS = 24 * 60 * 60 * 1000;

export function activeCandleTimes(times: readonly string[] | null | undefined, now: number): string[] {
  return (times ?? []).filter(time => {
    const lit = Date.parse(time);
    return Number.isFinite(lit) && lit <= now && now - lit < CANDLE_LIFETIME_MS;
  });
}

export function candleFraction(time: string, now: number): number {
  const lit = Date.parse(time);
  return Number.isFinite(lit) ? Math.max(0, Math.min(1, 1 - (now - lit) / CANDLE_LIFETIME_MS)) : 0;
}
