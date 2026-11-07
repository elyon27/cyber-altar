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
    <main className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-gradient-to-b from-[#080e22] via-[#10172e] to-black px-3 pt-[max(24px,env(safe-area-inset-top))] text-white sm:px-6">
      <header aria-label="Cross above the prayer candles" className="flex shrink-0 justify-center pb-3 pt-3 sm:pb-6">
        <svg viewBox="0 0 160 150" width="146" height="136" role="img" aria-label="Illuminated golden Christian cross"
          className="h-28 w-36 drop-shadow-[0_0_22px_rgba(251,191,36,0.42)] sm:h-36 sm:w-40"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="candleCrossGold" x1="53" y1="10" x2="106" y2="148" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF9D5" />
              <stop offset=".42" stopColor="#F6D477" />
              <stop offset="1" stopColor="#AE6B1D" />
            </linearGradient>
            <radialGradient id="candleCrossHalo" cx="0" cy="0" r="1"
              gradientTransform="translate(80 69) rotate(90) scale(69 62)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" stopOpacity=".32" />
              <stop offset="1" stopColor="#FDE68A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="70" rx="63" ry="69" fill="url(#candleCrossHalo)" />
          <path d="M68 12H92V48H132V72H92V140H68V72H28V48H68V12Z"
            fill="url(#candleCrossGold)" stroke="#FFF2B5" strokeWidth="3" strokeLinejoin="round" />
          <path d="M74 19H86V54H126V66H86V133H74V66H34V54H74V19Z"
            stroke="#FFF9DF" strokeOpacity=".8" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="80" cy="60" r="5.5" fill="#FFF7D6" stroke="#C18B34" strokeWidth="1.5" />
          <path d="M80 0V7M80 145V150M15 60H22M138 60H145"
            stroke="#FDE7A6" strokeWidth="2" strokeLinecap="round" opacity=".7" />
        </svg>
      </header>
      {errorMessage ? (
        <p role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{errorMessage}</p>
      ) : loading ? (
        <p role="status" className="sr-only">Loading your burning candles…</p>
      ) : (
        <section aria-label="All your active burning prayer candles"
          className="mx-auto flex w-full max-w-6xl flex-1 items-end justify-center pb-[max(24px,env(safe-area-inset-bottom))] [&_.prayer-candles]:w-full [&_.prayer-candles]:max-h-none [&_.prayer-candles]:justify-center [&_.prayer-candles]:overflow-visible [&_.prayer-candles]:bg-transparent">
          <MeltingCandles times={activeTimes} now={now} />
        </section>
      )}
    </main>
  );
}

export default function CandlesPage() {
  return <VerifiedPilgrimGate><CandlesContent /></VerifiedPilgrimGate>;
}
