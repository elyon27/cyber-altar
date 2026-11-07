'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import VerifiedPilgrimGate from '@/components/cyber-altar/VerifiedPilgrimGate';
import MeltingCandles from '@/components/cyber-altar/MeltingCandles';
import { activeCandleTimes } from '@/lib/candle-lifetime';
import { supabase } from '@/lib/supabase';

type CandlePrayer = {
  id: string;
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
          .select('id, created_at, candle_lit_at')
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

  // Every active candle is displayed together, regardless of which prayer or altar
  // it came from. Keep the original lighting timestamps so the wax keeps melting.
  const activeTimes = useMemo(
    () => prayers.flatMap(prayer => activeCandleTimes(prayer.candle_lit_at, now)),
    [prayers, now]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#10172e] to-black px-4 py-8 text-white sm:px-6">
      {errorMessage ? (
        <p role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{errorMessage}</p>
      ) : loading ? (
        <p role="status" className="sr-only">Loading your burning candles…</p>
      ) : (
        <section aria-label="All your active burning prayer candles"
          className="mx-auto max-w-6xl [&_.prayer-candles]:max-h-none [&_.prayer-candles]:justify-center [&_.prayer-candles]:overflow-visible [&_.prayer-candles]:bg-transparent">
          <MeltingCandles times={activeTimes} now={now} />
        </section>
      )}
    </main>
  );
}

export default function CandlesPage() {
  return <VerifiedPilgrimGate><CandlesContent /></VerifiedPilgrimGate>;
}
