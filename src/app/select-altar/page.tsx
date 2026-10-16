'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AltarSelectionForm from '@/components/cyber-altar/AltarSelectionForm';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

function normalizeSlug(value?: string) {
  return (value || '').trim().toLowerCase();
}

function safeParseHistory(raw: string | null): PreviousAltarItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse altar history from localStorage:', error);
    return [];
  }
}

function mergeHistories(...lists: PreviousAltarItem[][]): PreviousAltarItem[] {
  const merged = lists.flat();
  const map = new Map<string, PreviousAltarItem>();

  for (const item of merged) {
    const slug = normalizeSlug(item?.altar_slug);
    if (!slug) continue;

    const existing = map.get(slug);

    if (!existing) {
      map.set(slug, {
        altar_slug: slug,
        created_at: item?.created_at,
      });
      continue;
    }

    const existingDate = existing.created_at
      ? new Date(existing.created_at).getTime()
      : 0;

    const incomingDate = item?.created_at
      ? new Date(item.created_at).getTime()
      : 0;

    if (incomingDate > existingDate) {
      map.set(slug, {
        altar_slug: slug,
        created_at: item?.created_at,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export default function SelectAltarPage() {
  const [identity, setIdentity] = useState<{ username: string; email: string } | null>(null);
  const [previousAltars, setPreviousAltars] = useState<PreviousAltarItem[]>([]);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    let active = true;
    let generation = 0;
    const load = async () => {
      const requestId = ++generation;
      const username = (localStorage.getItem('cyber_altar_username') || '').trim();
      const email = (localStorage.getItem('cyber_altar_email') || '').trim().toLowerCase();
      setIdentity({ username, email });
      setHistoryError('');
      const keys = email
        ? [`cyber_altar_history_${email}`, `cyber_altar_history_${email}__${username.toLowerCase()}`]
        : username ? [`cyber_altar_history_${username.toLowerCase()}`] : [];
      const local = mergeHistories(...keys.map(key => safeParseHistory(localStorage.getItem(key))));
      setPreviousAltars(local);
      if (!email) return;
      try {
        const { data, error } = await supabase.from('altar_profiles')
          .select('altar_slug, created_at').eq('email', email)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (active && requestId === generation) setPreviousAltars(mergeHistories(local, data || []));
      } catch {
        if (active && requestId === generation) setHistoryError('Saved altar history could not be loaded. Showing history available on this device.');
      }
    };
    const refresh = () => { if (!document.hidden) void load(); };
    void load();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('cyber-altar-history-updated', refresh);
    return () => {
      active = false; generation++;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('cyber-altar-history-updated', refresh);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-black">
      {historyError && <p role="status" className="mx-auto max-w-7xl px-6 pt-4 text-amber-200">{historyError}</p>}
      {!identity ? <p className="p-6 text-white">Loading your altar history...</p> : !identity.username ?
        <p className="p-6 text-white">Please return to the <a href="/" className="underline">entrance</a> and enter your pilgrim details.</p> :
        <AltarSelectionForm key={`${identity.email}__${identity.username}`} username={identity.username} previousAltars={previousAltars} />}
    </main>
  );
}
