'use client';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

type Props = {
  username: string;
  previousAltars: PreviousAltarItem[];
  selectedAltarSlug: string;
  onSelectAltar: (altarSlug: string) => void;
};

export default function PreviousAltarList({
  previousAltars,
  selectedAltarSlug,
  onSelectAltar,
}: Props) {
  const uniqueAltars = Array.from(
    new Map(previousAltars.map((item) => [item.altar_slug, item])).values()
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
        Formerly Chosen Altars
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">
        Your Altar History
      </h3>

      {uniqueAltars.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-slate-300">
          No previously chosen altar pictures yet.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {uniqueAltars.map((item) => {
            const isActive = item.altar_slug === selectedAltarSlug;

            return (
              <button
                key={item.altar_slug}
                type="button"
                onClick={() => onSelectAltar(item.altar_slug)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-amber-300 bg-amber-300/10 text-amber-100'
                    : 'border-white/10 bg-slate-900/60 text-slate-200 hover:border-cyan-300/60 hover:bg-cyan-400/10 hover:text-white'
                }`}
              >
                <div className="text-sm font-semibold">
                  {item.altar_slug.toUpperCase()}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Click to reselect this altar picture
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}