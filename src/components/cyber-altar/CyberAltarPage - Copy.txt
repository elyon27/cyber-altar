'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

type Props = {
  username: string;
  selectedAltarSlug: string;
  previousAltars: PreviousAltarItem[];
  onSelectCurrentAltar?: (altarSlug: string) => void;
};

export default function PreviousAltarList({
  username,
  selectedAltarSlug,
  previousAltars,
  onSelectCurrentAltar,
}: Props) {
  const router = useRouter();

  const uniqueAltars = useMemo(() => {
    const seen = new Set<string>();
    return previousAltars.filter((item) => {
      if (!item?.altar_slug || seen.has(item.altar_slug)) return false;
      seen.add(item.altar_slug);
      return true;
    });
  }, [previousAltars]);

  const handleOpenAltar = (altarSlug: string) => {
    if (!altarSlug || !username) return;

    localStorage.setItem('cyber_altar_username', username);
    localStorage.setItem('cyber_altar_selected_slug', altarSlug);

    if (onSelectCurrentAltar) {
      onSelectCurrentAltar(altarSlug);
    }

    router.push(`/altar/${altarSlug}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
        Previously Chosen Altars
      </h3>

      {uniqueAltars.length === 0 ? (
        <p className="text-sm text-slate-300">No previously chosen altar pictures yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {uniqueAltars.map((item) => {
            const isActive = item.altar_slug === selectedAltarSlug;

            return (
              <button
                key={item.altar_slug}
                type="button"
                onClick={() => handleOpenAltar(item.altar_slug)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100'
                    : 'border-white/10 bg-black/20 text-slate-200 hover:border-cyan-300/60 hover:bg-cyan-400/10 hover:text-white'
                }`}
              >
                <div className="font-medium">{item.altar_slug.toUpperCase()}</div>
                <div className="text-xs text-slate-400">
                  Click to enter this altar’s Holy Place
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}