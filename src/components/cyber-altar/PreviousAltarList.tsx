'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

type Props = {
  username: string;
  previousAltars?: PreviousAltarItem[];
  selectedAltarSlug?: string;
  onSelectAltar?: (altarSlug: string) => void;
};

type CountMap = Record<
  string,
  {
    prayers: number;
    candles: number;
  }
>;

function normalizeSlug(value?: string) {
  return (value || '').trim().toLowerCase();
}

export default function PreviousAltarList({
  username,
  previousAltars = [],
  selectedAltarSlug,
  onSelectAltar,
}: Props) {
  const safePreviousAltars = Array.isArray(previousAltars) ? previousAltars : [];
  const [countsByAltar, setCountsByAltar] = useState<CountMap>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  const uniqueAltars = useMemo(() => {
    const seen = new Set<string>();

    return safePreviousAltars.filter((item) => {
      const slug = normalizeSlug(item.altar_slug);
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
  }, [safePreviousAltars]);

  useEffect(() => {
    let active = true;

    const loadCounts = async () => {
      if (!uniqueAltars.length) {
        if (active) {
          setCountsByAltar({});
          setLoadingCounts(false);
        }
        return;
      }

      try {
        setLoadingCounts(true);

        const email = (localStorage.getItem('cyber_altar_email') || '')
          .trim()
          .toLowerCase();

        const altarSlugs = uniqueAltars
          .map((item) => normalizeSlug(item.altar_slug))
          .filter(Boolean);

        const nextCounts: CountMap = {};

        for (const slug of altarSlugs) {
          nextCounts[slug] = { prayers: 0, candles: 0 };
        }

        // PRAYERS
        const { data: prayers, error: prayerError } = await supabase
          .from('altar_prayers')
          .select('altar_slug, username')
          .in('altar_slug', altarSlugs)
          .eq('username', username);

        if (!prayerError) {
          for (const row of prayers || []) {
            const slug = normalizeSlug((row as any).altar_slug);
            if (!slug) continue;
            nextCounts[slug].prayers += 1;
          }
        }

        // CANDLES
        const { data: profiles, error: profileError } = await supabase
          .from('altar_profiles')
          .select('altar_slug, candle_count')
          .in('altar_slug', altarSlugs)
          .eq('username', username);

        if (!profileError) {
          for (const row of profiles || []) {
            const slug = normalizeSlug((row as any).altar_slug);
            if (!slug) continue;
            nextCounts[slug].candles += Number((row as any).candle_count || 0);
          }
        }

        if (active) setCountsByAltar(nextCounts);
      } catch (error) {
        console.error('Failed to load altar counts:', error);
      } finally {
        if (active) setLoadingCounts(false);
      }
    };

    loadCounts();
    window.addEventListener('focus', loadCounts);

    return () => {
      active = false;
      window.removeEventListener('focus', loadCounts);
    };
  }, [username, uniqueAltars]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
        Formerly Chosen Altars
      </p>

      <h3 className="mt-2 text-lg font-semibold text-white">
        Your Altar History
      </h3>

      <div className="mt-4 space-y-3">
        {uniqueAltars.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4 text-sm text-slate-300">
            No formerly selected altars yet.
          </div>
        ) : (
          uniqueAltars.map((item) => {
            const slug = normalizeSlug(item.altar_slug);
            const counts = countsByAltar[slug] || { prayers: 0, candles: 0 };
            const isSelected = slug === normalizeSlug(selectedAltarSlug);
            const imageSrc = `/altar/${slug}.jpg`;

            return (
              <button
                key={`${item.altar_slug}-${item.created_at || 'history'}`}
                type="button"
                onClick={() => onSelectAltar?.(slug)}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  isSelected
                    ? 'border-amber-300 bg-amber-300/10 text-amber-100'
                    : 'border-white/10 bg-slate-900/60 text-slate-100 hover:border-cyan-300/40 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <Image
                      src={imageSrc}
                      alt={slug.toUpperCase()}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[1rem] font-semibold uppercase">
                      {slug.toUpperCase()}
                    </div>

                    <div className="mt-1 text-sm text-slate-300">
                      {loadingCounts
                        ? 'Loading...'
                        : `Prayer ${counts.prayers} | Candles ${counts.candles}`}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}