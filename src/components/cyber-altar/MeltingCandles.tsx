'use client';

import type { CSSProperties } from 'react';
import { activeCandleTimes, candleFraction } from '@/lib/candle-lifetime';

export default function MeltingCandles({ times, now }: { times: string[]; now: number }) {
  const active = activeCandleTimes(times, now);
  if (!active.length) return null;
  return (
    <div className="prayer-candles" role="img" aria-label={`${active.length} candles burning; each lasts 24 hours`}>
      {active.map((time, index) => {
        const remaining = candleFraction(time, now);
        return (
          <span className="prayer-candle" key={`${time}-${index}`}
            style={{ '--wax-height': `${40 * remaining}px` } as CSSProperties}
            title={`${Math.ceil(remaining * 24 * 60)} minutes remaining`} aria-hidden="true">
            <span className="prayer-candle-flame" style={{
              animationDelay: `${-(index % 11) * 0.19}s`,
              animationDuration: `${1.1 + (index % 7) * 0.13}s`,
            }} />
            <span className="prayer-candle-wick" />
            <span className="prayer-candle-wax" />
          </span>
        );
      })}
    </div>
  );
}
