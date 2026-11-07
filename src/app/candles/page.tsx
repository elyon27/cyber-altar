'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import VerifiedPilgrimGate from '@/components/cyber-altar/VerifiedPilgrimGate';
import MeltingCandles from '@/components/cyber-altar/MeltingCandles';
import { activeCandleTimes } from '@/lib/candle-lifetime';
import { supabase } from '@/lib/supabase';

type CandlePrayer = {
  id: string;
  altar_slug: string;
  created_at: string;
  candle_lit_at: string[] | null;
};

const PAGE_SIZE = 500;

function CandlesContent() {
  const [prayers, setPrayers] = useState<CandlePrayer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      const email = user?.email?.trim().toLowerCase();
      const pilgrimEmail = (localStorage.getItem('cyber_altar_email') || '').trim().toLowerCase();
      if (authError || !user?.email_confirmed_at || !email || email !== pilgrimEmail) {
        throw new Error('Sign in with your verified pilgrim email to view your candles.');
      }

      // Fetch the owner's candles across ALL altars, not only the chosen altar.
      // Paginate to avoid Supabase's default API row limit.
      const results: CandlePrayer[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await supabase.from('altar_prayers')
          .select('id, altar_slug, created_at, candle_lit_at')
          .eq('owner_email', email)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) throw error;
        const batch = (data ?? []) as CandlePrayer[];
        results.push(...batch);
        if (batch.length < PAGE_SIZE) break;
      }
      setPrayers(results);
      setNow(Date.now());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load your candles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    // The existing melting candle visual is time-based and updates every second.
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const onFocus = () => { if (!document.hidden) void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const activeRows = useMemo(() => prayers
    .map(prayer => ({ ...prayer, activeTimes: activeCandleTimes(prayer.candle_lit_at, now) }))
    .filter(prayer => prayer.activeTimes.length > 0), [prayers, now]);
  const totalActive = activeRows.reduce((sum, prayer) => sum + prayer.activeTimes.length, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#10172e] to-black px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Cyber-Altar</p>
          <h1 className="mt-2 text-3xl font-bold">Candles</h1>
          <p className="mt-2 text-white/70">Your burning candles from every altar, displayed row by row. Each candle melts and disappears after 24 hours.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/select-altar" className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10">
              Return to Altar Selection
            </Link>
            <button type="button" disabled={loading} onClick={() => void refresh()}
              className="rounded-xl border border-amber-300/50 bg-amber-400/10 px-4 py-3 font-semibold text-amber-100 disabled:opacity-50">
              {loading ? 'Loading…' : 'Refresh Candles'}
            </button>
          </div>
        </header>

        {errorMessage && <p role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{errorMessage}</p>}
        {loading ? (
          <p className="mt-6 text-white/70">Loading your burning candles…</p>
        ) : !errorMessage && (
          <section aria-label="All active prayer candles" className="mt-6">
            <p role="status" aria-live="polite" className="mb-4 text-sm text-amber-100">
              {totalActive} {totalActive === 1 ? 'candle' : 'candles'} burning across {activeRows.length} {activeRows.length === 1 ? 'prayer' : 'prayers'}
            </p>
            {activeRows.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                You have no burning candles at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {activeRows.map((prayer, index) => (
                  <div key={prayer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <p className="mb-3 text-sm font-semibold text-amber-100">
                      Row {index + 1} · {prayer.altar_slug.toUpperCase()} · {prayer.activeTimes.length} {prayer.activeTimes.length === 1 ? 'candle' : 'candles'}
                    </p>
                    <MeltingCandles times={prayer.activeTimes} now={now} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default function CandlesPage() {
  return <VerifiedPilgrimGate><CandlesContent /></VerifiedPilgrimGate>;
}
