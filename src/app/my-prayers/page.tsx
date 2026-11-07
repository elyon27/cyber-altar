'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import VerifiedPilgrimGate from '@/components/cyber-altar/VerifiedPilgrimGate';
import { supabase } from '@/lib/supabase';
import { activeCandleTimes } from '@/lib/candle-lifetime';
import { loadDedications, readLocalDedications } from '@/lib/altar-dedications';

type PrayerRow = {
  id: string;
  altar_slug: string;
  prayer_text: string;
  created_at: string;
  candle_lit_at: string[] | null;
  is_public: boolean;
};
type AltarRow = { altar_slug: string; created_at: string };
const PAGE_SIZE = 500;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function MyPrayersPage() {
  return <VerifiedPilgrimGate><MyPrayersContent /></VerifiedPilgrimGate>;
}

function MyPrayersContent() {
  const [prayers, setPrayers] = useState<PrayerRow[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [dedications, setDedications] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState('all');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      const accountEmail = user?.email?.trim().toLowerCase();
      const storedEmail = (localStorage.getItem('cyber_altar_email') || '').trim().toLowerCase();
      if (authError || !user?.email_confirmed_at || !accountEmail || accountEmail !== storedEmail) {
        throw new Error('Please sign in using the same verified email as your pilgrim account.');
      }

      // Server-backed history includes altars with no saved dedication and those with no prayers.
      const { data: profiles, error: profileError } = await supabase.from('altar_profiles')
        .select('altar_slug, created_at').eq('email', accountEmail)
        .order('created_at', { ascending: false });
      if (profileError) throw profileError;

      // Read in pages so pilgrims with more than the default Supabase row limit see all prayers.
      const allPrayers: PrayerRow[] = [];
      for (let start = 0; ; start += PAGE_SIZE) {
        const { data, error } = await supabase.from('altar_prayers')
          .select('id, altar_slug, prayer_text, created_at, candle_lit_at, is_public')
          .eq('owner_email', accountEmail)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(start, start + PAGE_SIZE - 1);
        if (error) throw error;
        const batch = (data ?? []) as PrayerRow[];
        allPrayers.push(...batch);
        if (batch.length < PAGE_SIZE) break;
      }

      const altarCodes = Array.from(new Set([
        ...((profiles ?? []) as AltarRow[]).map(row => row.altar_slug),
        ...allPrayers.map(row => row.altar_slug),
      ].filter(code => /^al[0-9]{3}$/.test(code))));

      let names = readLocalDedications(altarCodes, accountEmail);
      try {
        // Reads all existing dedication labels, leaving blanks for unnamed altars.
        const remote = await loadDedications(altarCodes);
        names = { ...names, ...remote };
      } catch (error) {
        console.warn('Could not synchronize altar dedications:', error);
      }
      setPrayers(allPrayers);
      setHistory(altarCodes);
      setDedications(names);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load your prayers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [loadAll]);

  const visiblePrayers = useMemo(
    () => filter === 'all' ? prayers : prayers.filter(prayer => prayer.altar_slug === filter),
    [filter, prayers]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#10172e] to-black px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Cyber-Altar · Your personal prayer archive</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">My Prayers</h1>
          <p className="mt-3 text-white/70">All your offered prayers across your altar history. Secret prayers on this page are visible only when you are signed in to your verified account.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/select-altar" className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10">Return to Altar Selection</Link>
            <Link href="/" className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10">Main Introduction</Link>
            <button type="button" onClick={() => void loadAll()} disabled={loading}
              className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 font-medium text-cyan-100 disabled:opacity-50">
              {loading ? 'Loading...' : 'Refresh Prayers'}
            </button>
          </div>
        </div>

        {errorMessage && <p role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Total Offered Prayers</p>
                <p className="mt-1 text-3xl font-bold">{prayers.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Altars in History</p>
                <p className="mt-1 text-3xl font-bold">{history.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Active Candles (24 Hours)</p>
                <p className="mt-1 text-3xl font-bold">{prayers.reduce((n, prayer) => n + activeCandleTimes(prayer.candle_lit_at ?? [], now).length, 0)}</p>
              </div>
            </div>

            <div className="mt-7">
              <label htmlFor="filter-my-prayers" className="mb-2 block font-semibold text-white/85">Filter prayers by altar</label>
              <select id="filter-my-prayers" value={filter} onChange={event => setFilter(event.target.value)}
                className="w-full max-w-lg rounded-xl border border-white/25 bg-slate-800 px-4 py-3 text-white">
                <option value="all">All Altars ({prayers.length} prayers)</option>
                {history.map(slug => (
                  <option key={slug} value={slug}>
                    {slug.toUpperCase()} — {dedications[slug]?.trim() || 'No dedication saved'}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-white/60">
                Showing {visiblePrayers.length} {visiblePrayers.length === 1 ? 'prayer' : 'prayers'}, newest first.
                Candle totals show candles still burning within their 24-hour lifetime.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {visiblePrayers.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                  {prayers.length === 0 ? 'No prayers have been offered yet.' : 'No prayers are recorded for this altar.'}
                </div>
              ) : visiblePrayers.map(prayer => {
                const count = activeCandleTimes(prayer.candle_lit_at ?? [], now).length;
                return (
                  <article key={prayer.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-amber-100">{prayer.altar_slug.toUpperCase()}</h2>
                        <p className="mt-1 text-sm text-white/80"><span className="text-white/60">Dedicated to:</span> {dedications[prayer.altar_slug]?.trim() || 'No dedication saved'}</p>
                      </div>
                      <Link href={`/altar/${prayer.altar_slug}`} className="rounded-xl border border-cyan-400/30 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/10">
                        Visit Altar
                      </Link>
                    </div>
                    <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-sm">
                      <div><dt className="inline text-white/60">Date: </dt><dd className="inline">{formatDate(prayer.created_at)}</dd></div>
                      <div><dt className="inline text-white/60">Candles lighted (active): </dt><dd className="inline font-semibold text-amber-100">{count}</dd></div>
                      <div><dt className="inline text-white/60">Visibility: </dt><dd className="inline">{prayer.is_public ? 'Public' : 'Secret'}</dd></div>
                    </dl>
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Offered Prayer</p>
                      <p className="whitespace-pre-wrap break-words text-base leading-7 text-white/90">{prayer.prayer_text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
