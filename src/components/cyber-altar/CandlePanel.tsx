// ==============================
// File: components/cyber-altar/CandlePanel.tsx
// ==============================
'use client';

type CandlePanelProps = {
  candleActive: boolean;
  candleHeightPercent: number;
  remainingText: string;
};

export function CandlePanel({ candleActive, candleHeightPercent, remainingText }: CandlePanelProps) {
  return (
    <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6 text-center">
      <h3 className="mb-3 text-lg font-semibold">Candle</h3>
      <div className="mx-auto flex h-80 w-full max-w-[220px] flex-col items-center justify-end">
        <div className="relative flex h-64 w-28 items-end justify-center">
          {candleActive && (
            <div className="absolute -top-10 h-14 w-10 animate-pulse rounded-full bg-amber-300/80 blur-md" />
          )}
          <div
            className="relative w-24 overflow-hidden rounded-t-3xl border border-amber-100/40 bg-amber-50/90 transition-all duration-1000"
            style={{ height: `${candleHeightPercent}%` }}
          />
          <div className="absolute bottom-0 h-4 w-32 rounded-full bg-blue-950/90" />
          {candleActive && <div className="absolute top-0 h-10 w-1 rounded-full bg-black/80" />}
          {candleActive && <div className="absolute -top-4 h-8 w-5 rounded-full bg-amber-300 blur-[1px]" />}
        </div>
        <p className="mt-4 text-sm text-blue-100/80">{remainingText}</p>
      </div>
    </div>
  );
}