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
      <header aria-label="Crown above the prayer candles" className="flex shrink-0 justify-center pb-3 pt-3 sm:pb-6">
        <svg viewBox="0 0 160 112" width="146" height="102" role="img" aria-label="Golden crown"
          className="h-24 w-36 drop-shadow-[0_0_22px_rgba(251,191,36,0.32)] sm:h-28 sm:w-40"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="candleCrownGold" x1="24" y1="12" x2="135" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF3BA" />
              <stop offset=".45" stopColor="#F7C75A" />
              <stop offset="1" stopColor="#B8751B" />
            </linearGradient>
          </defs>
          <path d="M19 38L43 61L79 13L115 61L141 38L131 88H29L19 38Z"
            stroke="url(#candleCrownGold)" strokeWidth="5" strokeLinejoin="round"/>
          <path d="M30 89H130V100H30V89Z" fill="url(#candleCrownGold)" stroke="#FFF1B4" strokeWidth="2"/>
          <path d="M31 79H129" stroke="#FFE5A0" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="19" cy="36" r="7" fill="#F8CE68" stroke="#FFF4C4" strokeWidth="2"/>
          <circle cx="79" cy="12" r="7" fill="#FFE6A2" stroke="#FFF4C4" strokeWidth="2"/>
          <circle cx="141" cy="36" r="7" fill="#F8CE68" stroke="#FFF4C4" strokeWidth="2"/>
          <path d="M79 43L86 55L79 68L72 55L79 43Z" fill="#A9D5E9" stroke="#FFF4C4" strokeWidth="2"/>
          <path d="M47 65L52 72L47 79L42 72L47 65ZM111 65L116 72L111 79L106 72L111 65Z"
            fill="#D66D75" stroke="#FFE5A0" strokeWidth="1.5"/>
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
