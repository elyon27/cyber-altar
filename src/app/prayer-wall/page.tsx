'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type PrayerWallItem = {
  id: string;
  profile_id: string;
  username: string;
  altar_slug: string;
  prayer_text: string;
  created_at: string;
  candle_count: number | null;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

export default function PrayerWallPage() {
  const [prayers, setPrayers] = useState<PrayerWallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [holyPlaceHref, setHolyPlaceHref] = useState('/select-altar');

  useEffect(() => {
    const requestedAltar = new URLSearchParams(window.location.search).get('altar');
    let savedAltar = '';
    try { savedAltar = localStorage.getItem('cyber_altar_selected_slug') || ''; } catch {}
    const altar = requestedAltar || savedAltar;
    if (/^al[0-9]{3}$/.test(altar)) setHolyPlaceHref(`/altar/${altar}`);
  }, []);

  const [errorMessage, setErrorMessage] = useState('');

  const loadPrayers = useCallback(async () => {
    const { data, error } = await supabase
      .from('altar_prayers')
      .select('id, profile_id, username, altar_slug, prayer_text, created_at, candle_count')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    setPrayers((data ?? []) as PrayerWallItem[]);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        await loadPrayers();
      } catch (error: any) {
        console.error(error);
        setErrorMessage(`Failed to load prayer wall: ${error?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadPrayers]);

  useEffect(() => {
    const channel = supabase
      .channel('public-prayer-wall-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'altar_prayers',
        },
        async () => {
          try { await loadPrayers(); } catch { setPrayers([]); setErrorMessage('Unable to refresh the Prayer Wall.'); }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPrayers]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        loadPrayers().catch(() => { setPrayers([]); setErrorMessage('Unable to refresh the Prayer Wall.'); });
      }
    };
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [loadPrayers]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <h1 className="text-3xl font-bold">Public Prayer Wall</h1>
            <p className="mt-1 text-white/70">
              Live prayer stream from the Cyber Altar
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={holyPlaceHref}
              className="rounded-xl border border-cyan-400/40 bg-cyan-400/20 px-4 py-3 font-semibold text-cyan-100 hover:bg-cyan-400/30"
            >
              Back to My Holy Place
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10"
            >
              Back to Entrance
            </Link>

            <Link
              href="https://crownmind.netlify.app"
              className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950"
            >
              Return To CrownMind
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            Loading prayer wall...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-4">
          {prayers.length === 0 && !loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No prayers yet.
            </div>
          ) : null}

          {prayers.map((prayer) => (
            <div
              key={prayer.id}
              className="rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <p className="text-sm font-semibold text-cyan-200">
                    Pilgrim: {prayer.username}
                  </p>
                  <p className="text-sm text-amber-100">
                    Candles Lighted: <strong>{prayer.candle_count ?? 0}</strong>
                  </p>
                </div>
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Altar: {prayer.altar_slug.toUpperCase()}
                </p>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-white/90">
                {prayer.prayer_text}
              </p>

              <p className="mt-4 text-xs text-white/50">
                {formatDate(prayer.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
