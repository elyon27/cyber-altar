'use client';

import { useEffect, useState } from 'react';
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
  const [username, setUsername] = useState('Pilgrim');
  const [previousAltars, setPreviousAltars] = useState<PreviousAltarItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUsername =
      localStorage.getItem('cyber_altar_username') || 'Pilgrim';

    const savedEmail =
      (localStorage.getItem('cyber_altar_email') || '')
        .trim()
        .toLowerCase();

    setUsername(savedUsername);

    const usernameHistory = safeParseHistory(
      localStorage.getItem(`cyber_altar_history_${savedUsername}`)
    );

    const emailHistory = savedEmail
      ? safeParseHistory(
          localStorage.getItem(`cyber_altar_history_${savedEmail}`)
        )
      : [];

    const sharedHistory = safeParseHistory(
      localStorage.getItem('cyber_altar_history_shared')
    );

    const mergedHistory = mergeHistories(
      emailHistory,
      usernameHistory,
      sharedHistory
    );

    setPreviousAltars(mergedHistory);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-black">
      <AltarSelectionForm
        username={username}
        previousAltars={previousAltars}
      />
    </main>
  );
}
