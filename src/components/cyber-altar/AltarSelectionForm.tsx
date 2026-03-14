'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PreviousAltarList from './PreviousAltarList';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

type Props = {
  username: string;
  previousAltars?: PreviousAltarItem[];
};

const TOTAL_ALTARS = 72;

function buildAltarList() {
  return Array.from({ length: TOTAL_ALTARS }, (_, index) => {
    const number = String(index + 1).padStart(3, '0');
    return {
      altar_slug: `al${number}`,
      image: `/altar/al${number}.jpg`,
    };
  });
}

export default function AltarSelectionForm({
  username,
  previousAltars = [],
}: Props) {
  const router = useRouter();
  const altarOptions = useMemo(() => buildAltarList(), []);
  const safePreviousAltars = Array.isArray(previousAltars) ? previousAltars : [];
  const [selectedAltarSlug, setSelectedAltarSlug] = useState<string>('al001');

  useEffect(() => {
    const savedSelected =
      typeof window !== 'undefined'
        ? localStorage.getItem('cyber_altar_selected_slug')
        : '';

    if (savedSelected) {
      setSelectedAltarSlug(savedSelected);
      return;
    }

    if (safePreviousAltars.length > 0) {
      setSelectedAltarSlug(safePreviousAltars[0].altar_slug);
    }
  }, [safePreviousAltars]);

  const selectedAltar =
    altarOptions.find((item) => item.altar_slug === selectedAltarSlug) ??
    altarOptions[0];

  const handleSelectAltar = (altarSlug: string) => {
    setSelectedAltarSlug(altarSlug);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_altar_selected_slug', altarSlug);
      localStorage.setItem('cyber_altar_username', username);
    }
  };

  const handleProceed = () => {
    if (!selectedAltarSlug) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_altar_selected_slug', selectedAltarSlug);
      localStorage.setItem('cyber_altar_username', username);

      const historyKey = `cyber_altar_history_${username}`;
      const existingRaw = localStorage.getItem(historyKey);

      let history: PreviousAltarItem[] = [];

      try {
        history = existingRaw ? JSON.parse(existingRaw) : [];
      } catch {
        history = [];
      }

      const alreadyExists = history.some(
        (item) => item.altar_slug === selectedAltarSlug
      );

      if (!alreadyExists) {
        history.unshift({
          altar_slug: selectedAltarSlug,
          created_at: new Date().toISOString(),
        });
      }

      localStorage.setItem(historyKey, JSON.stringify(history));
    }

    router.push(
      `/altar/${selectedAltarSlug}?username=${encodeURIComponent(username)}`
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)] md:p-6">
          <p className="text-sm text-slate-300">Pilgrim: {username}</p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
            Select the Altar Picture
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Choose the altar picture that will represent this Holy Place. If you
            click a formerly chosen altar from your history, the matching altar
            in the general list below will also highlight.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-amber-300/25 bg-slate-950/75 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
                  Presently Chosen Altar
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
                  {selectedAltar.altar_slug.toUpperCase()}
                </h2>
              </div>

              <div className="bg-black/20 p-4 md:p-5">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={selectedAltar.image}
                    alt={selectedAltar.altar_slug}
                    className="h-[260px] w-full object-cover md:h-[420px]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/75 p-4 md:p-5">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  General Altar List
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Choose from all altar pictures
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {altarOptions.map((item) => {
                  const isSelected = item.altar_slug === selectedAltarSlug;
                  const isFormerlyChosen = safePreviousAltars.some(
                    (altar) => altar.altar_slug === item.altar_slug
                  );

                  return (
                    <button
                      key={item.altar_slug}
                      type="button"
                      onClick={() => handleSelectAltar(item.altar_slug)}
                      className={`group overflow-hidden rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-amber-300 bg-amber-300/10 ring-2 ring-amber-300/60'
                          : isFormerlyChosen
                          ? 'border-cyan-300/35 bg-cyan-400/5 hover:border-cyan-300/70'
                          : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-black/20">
                        <img
                          src={item.image}
                          alt={item.altar_slug}
                          className={`h-full w-full object-cover transition duration-200 ${
                            isSelected
                              ? 'scale-[1.03]'
                              : 'group-hover:scale-[1.02]'
                          }`}
                        />
                      </div>

                      <div
                        className={`px-3 py-2 text-xs font-medium md:text-sm ${
                          isSelected
                            ? 'text-amber-100'
                            : isFormerlyChosen
                            ? 'text-cyan-100'
                            : 'text-slate-200'
                        }`}
                      >
                        {item.altar_slug.toUpperCase()}
                        {isSelected
                          ? ' • Selected'
                          : isFormerlyChosen
                          ? ' • Former'
                          : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProceed}
                className="rounded-2xl border border-amber-300/40 bg-amber-400/20 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
              >
                Proceed to the Holy Place
              </button>
            </div>
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-4 md:p-5">
              <PreviousAltarList
                username={username}
                previousAltars={safePreviousAltars}
                selectedAltarSlug={selectedAltarSlug}
                onSelectAltar={handleSelectAltar}
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}