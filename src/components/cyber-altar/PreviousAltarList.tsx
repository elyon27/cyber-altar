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
      if (typeof window === 'undefined') return;

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

        if (email) {
          const { data: profilesByEmail, error: profileEmailError } = await supabase
            .from('altar_profiles')
            .select('id, altar_slug')
            .eq('email', email)
            .in('altar_slug', altarSlugs);

          if (profileEmailError) {
            console.error(
              'Failed to load altar profiles by email:',
              profileEmailError
            );
          } else {
            const profileIds = (profilesByEmail || []).map((item: any) => item.id);

            if (profileIds.length > 0) {
              const { data: prayersByProfile, error: prayersProfileError } =
                await supabase
                  .from('altar_prayers')
                  .select('altar_slug, profile_id')
                  .in('profile_id', profileIds);

              if (prayersProfileError) {
                console.error(
                  'Failed to load altar prayers by profile_id:',
                  prayersProfileError
                );
              } else {
                for (const row of prayersByProfile || []) {
                  const slug = normalizeSlug((row as any).altar_slug);
                  if (!slug) continue;
                  if (!nextCounts[slug]) nextCounts[slug] = { prayers: 0, candles: 0 };
                  nextCounts[slug].prayers += 1;
                }
              }
            }
          }
        } else {
          const { data: prayersByUsername, error: prayersError } = await supabase
            .from('altar_prayers')
            .select('altar_slug, username')
            .in('altar_slug', altarSlugs)
            .eq('username', username);

          if (prayersError) {
            console.error('Failed to load altar prayers by username:', prayersError);
          } else {
            for (const row of prayersByUsername || []) {
              const slug = normalizeSlug((row as any).altar_slug);
              if (!slug) continue;
              if (!nextCounts[slug]) nextCounts[slug] = { prayers: 0, candles: 0 };
              nextCounts[slug].prayers += 1;
            }
          }
        }

        const profilesQuery = supabase
          .from('altar_profiles')
          .select('altar_slug, candle_count, username, email')
          .in('altar_slug', altarSlugs);

        const { data: profileRows, error: profileError } = email
          ? await profilesQuery.eq('email', email)
          : await profilesQuery.eq('username', username);

        if (profileError) {
          console.error('Failed to load altar candle counts:', profileError);
        } else {
          for (const row of profileRows || []) {
            const slug = normalizeSlug((row as any).altar_slug);
            if (!slug) continue;
            if (!nextCounts[slug]) nextCounts[slug] = { prayers: 0, candles: 0 };
            nextCounts[slug].candles += Number((row as any).candle_count || 0);
          }
        }

        if (active) {
          setCountsByAltar(nextCounts);
        }
      } catch (error) {
        console.error('Failed to load altar history counts:', error);
      } finally {
        if (active) {
          setLoadingCounts(false);
        }
      }
    };

    loadCounts();

    const handleFocus = () => loadCounts();
    const handleVisibility = () => {
      if (!document.hidden) loadCounts();
    };
    const handleStorage = () => loadCounts();
    const handlePageShow = () => loadCounts();
    const handlePopState = () => loadCounts();
    const handleCustomHistoryUpdate = () => loadCounts();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('cyber-altar-history-updated', handleCustomHistoryUpdate as EventListener);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('cyber-altar-history-updated', handleCustomHistoryUpdate as EventListener);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [username, uniqueAltars]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
        Formerly Chosen Altars
      </p>

      <h3 className="mt-2 text-lg font-semibold text-white">Your Altar History</h3>

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

                    <div
                      className={`mt-1 text-sm ${
                        isSelected ? 'text-amber-100/90' : 'text-slate-300'
                      }`}
                    >
                      {loadingCounts
                        ? 'Loading altar count...'
                        : `Prayers-${counts.prayers} Candles-${counts.candles}`}
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
