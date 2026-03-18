'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type AltarOption = {
  altar_slug: string;
  label?: string;
  title?: string;
  image?: string;
  image_src?: string;
  prayer_count?: number;
  candle_count?: number;
};

type FormerAltarRecord = {
  altar_slug: string;
  created_at?: string;
  prayer_count?: number;
  candle_count?: number;
};

type Props = {
  altarOptions?: AltarOption[];
  username?: string;
  email?: string;
};

function normalizeSlug(value?: string) {
  return (value || '').trim().toLowerCase();
}

function getUsernameKey(username?: string) {
  const safeUsername = (username || 'pilgrim').trim().toLowerCase() || 'pilgrim';
  return `cyber_altar_history_${safeUsername}`;
}

function getEmailKey(email?: string) {
  const safeEmail = (email || '').trim().toLowerCase();
  return safeEmail ? `cyber_altar_history_email_${safeEmail}` : '';
}

function getSelectedSlugKey(username?: string) {
  const safeUsername = (username || 'pilgrim').trim().toLowerCase() || 'pilgrim';
  return `cyber_altar_selected_slug_${safeUsername}`;
}

function safeParseHistory(value: string | null): FormerAltarRecord[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        altar_slug: normalizeSlug(item?.altar_slug),
        created_at: typeof item?.created_at === 'string' ? item.created_at : undefined,
        prayer_count: Number.isFinite(Number(item?.prayer_count)) ? Number(item.prayer_count) : 0,
        candle_count: Number.isFinite(Number(item?.candle_count)) ? Number(item.candle_count) : 0,
      }))
      .filter((item) => item.altar_slug);
  } catch (error) {
    console.error('Failed to parse altar history from localStorage:', error);
    return [];
  }
}

function dedupeHistory(records: FormerAltarRecord[]) {
  const map = new Map<string, FormerAltarRecord>();

  for (const record of records) {
    if (!record.altar_slug) continue;

    const existing = map.get(record.altar_slug);
    if (!existing) {
      map.set(record.altar_slug, record);
      continue;
    }

    map.set(record.altar_slug, {
      altar_slug: record.altar_slug,
      created_at: record.created_at || existing.created_at,
      prayer_count: Math.max(record.prayer_count ?? 0, existing.prayer_count ?? 0),
      candle_count: Math.max(record.candle_count ?? 0, existing.candle_count ?? 0),
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

function buildAltarHref(altarSlug: string, username?: string, email?: string) {
  const params = new URLSearchParams();
  if (username) params.set('username', username);
  if (email) params.set('email', email);
  const query = params.toString();
  return `/altar/${altarSlug}${query ? `?${query}` : ''}`;
}

function resolveImageSrc(option?: AltarOption | FormerAltarRecord) {
  const slug = normalizeSlug(option?.altar_slug);
  if (!slug) return '/images/altar/al001.jpg';

  const withOptionImage = option as AltarOption | undefined;
  if (withOptionImage?.image_src) return withOptionImage.image_src;
  if (withOptionImage?.image) return withOptionImage.image;

  return `/images/altar/${slug}.jpg`;
}

export default function AltarSelectionForm({ altarOptions = [], username = 'Pilgrim', email = '' }: Props) {
  const normalizedOptions = useMemo(
    () =>
      (Array.isArray(altarOptions) ? altarOptions : []).map((item) => ({
        ...item,
        altar_slug: normalizeSlug(item.altar_slug),
      })),
    [altarOptions]
  );

  const [selectedAltarSlug, setSelectedAltarSlug] = useState(
    normalizeSlug(normalizedOptions[0]?.altar_slug)
  );
  const [formerAltars, setFormerAltars] = useState<FormerAltarRecord[]>([]);

  const loadHistory = useCallback(() => {
    if (typeof window === 'undefined') return;

    const usernameHistory = safeParseHistory(localStorage.getItem(getUsernameKey(username)));
    const emailKey = getEmailKey(email);
    const emailHistory = emailKey ? safeParseHistory(localStorage.getItem(emailKey)) : [];
    const mergedHistory = dedupeHistory([...usernameHistory, ...emailHistory]);

    setFormerAltars(mergedHistory);

    const storedSelectedSlug = normalizeSlug(
      localStorage.getItem(getSelectedSlugKey(username)) || mergedHistory[0]?.altar_slug || normalizedOptions[0]?.altar_slug
    );

    if (storedSelectedSlug) {
      setSelectedAltarSlug(storedSelectedSlug);
    }
  }, [email, normalizedOptions, username]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selectedAltarSlug) return;

    localStorage.setItem(getSelectedSlugKey(username), selectedAltarSlug);
  }, [selectedAltarSlug, username]);

  const selectedAltar = useMemo(
    () => normalizedOptions.find((item) => item.altar_slug === selectedAltarSlug) ?? normalizedOptions[0],
    [normalizedOptions, selectedAltarSlug]
  );

  const selectedHref = useMemo(
    () => buildAltarHref(selectedAltar?.altar_slug || selectedAltarSlug, username, email),
    [email, selectedAltar?.altar_slug, selectedAltarSlug, username]
  );

  const handleSelectAltar = useCallback((altarSlug: string) => {
    const normalizedSlug = normalizeSlug(altarSlug);
    if (!normalizedSlug) return;
    setSelectedAltarSlug(normalizedSlug);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (formerAltars.length === 0) return;
    if (!selectedAltarSlug) return;

    const nextHistory = formerAltars.filter((item) => item.altar_slug !== selectedAltarSlug);
    setFormerAltars(nextHistory);

    localStorage.setItem(getUsernameKey(username), JSON.stringify(nextHistory));

    const emailKey = getEmailKey(email);
    if (emailKey) {
      localStorage.setItem(emailKey, JSON.stringify(nextHistory));
    }

    const nextSelectedSlug = nextHistory[0]?.altar_slug || normalizeSlug(normalizedOptions[0]?.altar_slug);
    setSelectedAltarSlug(nextSelectedSlug);
    if (nextSelectedSlug) {
      localStorage.setItem(getSelectedSlugKey(username), nextSelectedSlug);
    } else {
      localStorage.removeItem(getSelectedSlugKey(username));
    }
  }, [email, formerAltars, normalizedOptions, selectedAltarSlug, username]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)] md:p-6">
          <p className="text-sm text-slate-300">Pilgrim: {username}</p>
          {!!email && <p className="mt-1 text-sm text-slate-400">Email: {email}</p>}
          <h1 className="mt-3 text-2xl font-semibold text-amber-100 md:text-3xl">Choose A Holy Place</h1>
          <p className="mt-2 text-sm text-slate-400">
            Select an altar below. You may proceed directly to the current altar selection even when the formerly chosen altar list is empty.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,420px)]">
          <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-amber-100">Altar Picture Selection</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {normalizedOptions.map((altar) => {
                const isSelected = altar.altar_slug === selectedAltarSlug;
                return (
                  <button
                    key={altar.altar_slug}
                    type="button"
                    onClick={() => handleSelectAltar(altar.altar_slug)}
                    className={`overflow-hidden rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-amber-300 bg-amber-400/10 shadow-[0_0_25px_rgba(251,191,36,0.12)]'
                        : 'border-slate-700 bg-slate-900/70 hover:border-cyan-400/30 hover:bg-slate-900'
                    }`}
                  >
                    <img
                      src={resolveImageSrc(altar)}
                      alt={altar.title || altar.label || altar.altar_slug}
                      className="h-44 w-full object-cover"
                    />
                    <div className="space-y-1 p-3">
                      <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">
                        {altar.label || altar.title || altar.altar_slug}
                      </p>
                      <p className="text-xs text-slate-400">{altar.altar_slug}</p>
                      <p className="pt-1 text-xs text-slate-400">Click to select this altar picture</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-amber-100">Current Selection</h2>
              {selectedAltar ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
                  <img
                    src={resolveImageSrc(selectedAltar)}
                    alt={selectedAltar.title || selectedAltar.label || selectedAltar.altar_slug}
                    className="h-52 w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <p className="text-base font-semibold uppercase tracking-wide text-amber-100">
                      {selectedAltar.label || selectedAltar.title || selectedAltar.altar_slug}
                    </p>
                    <p className="text-sm text-slate-400">{selectedAltar.altar_slug}</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                        Prayer {selectedAltar.prayer_count ?? 0}
                      </span>
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-100">
                        Candles {selectedAltar.candle_count ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-3">
                      <Link
                        href={selectedHref}
                        className="inline-flex items-center justify-center rounded-xl border border-amber-300/50 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
                      >
                        Proceed to Altar
                      </Link>
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        disabled={formerAltars.length === 0}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete Altar
                      </button>
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-500/50 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                      >
                        Return To Main
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No altar is currently selected.</p>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-amber-100">Formerly Chosen Altars</h2>
              {formerAltars.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  No formerly chosen altar list yet. Proceeding will use the current selected altar.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {formerAltars.map((record) => {
                    const option = normalizedOptions.find((item) => item.altar_slug === record.altar_slug);
                    const href = buildAltarHref(record.altar_slug, username, email);
                    const isSelected = record.altar_slug === selectedAltarSlug;

                    return (
                      <div
                        key={record.altar_slug}
                        className={`overflow-hidden rounded-2xl border bg-slate-900/70 ${
                          isSelected ? 'border-amber-300/60' : 'border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                          <img
                            src={resolveImageSrc(option || record)}
                            alt={option?.title || option?.label || record.altar_slug}
                            className="h-24 w-full rounded-xl object-cover sm:w-32"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">
                              {option?.label || option?.title || record.altar_slug}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">{record.altar_slug}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                                Prayer {record.prayer_count ?? 0}
                              </span>
                              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-100">
                                Candles {record.candle_count ?? 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <button
                              type="button"
                              onClick={() => handleSelectAltar(record.altar_slug)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-500/40 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                            >
                              Select
                            </button>
                            <Link
                              href={href}
                              className="inline-flex items-center justify-center rounded-xl border border-amber-300/50 bg-amber-400/20 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
                            >
                              Proceed
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
