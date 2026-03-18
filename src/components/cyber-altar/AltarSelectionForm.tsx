'use client';

<<<<<<< HEAD
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
=======
import { useEffect, useMemo, useState } from 'react';
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
import { useRouter } from 'next/navigation';
import PreviousAltarList from './PreviousAltarList';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

type Props = {
  username: string;
  previousAltars?: PreviousAltarItem[];
};

const TOTAL_ALTARS = 72;

function buildAltarList() {
  return Array.from({ length: TOTAL_ALTARS }, (_, index) => {
    const number = String(index + 1).padStart(3, '0');
    return {
      altar_slug: `al${number}`,
      image: `/altar/al${number}.jpg`,
    };
  });
}

<<<<<<< HEAD
function normalizeSlug(value?: string) {
  return (value || '').trim().toLowerCase();
}

function normalizeUserValue(value?: string) {
  return (value || '').trim().toLowerCase();
}

function parseHistory(value: string | null | undefined): PreviousAltarItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        altar_slug: normalizeSlug(item?.altar_slug),
        created_at: item?.created_at,
      }))
      .filter((item) => item.altar_slug);
  } catch {
    return [];
  }
}

function mergeHistories(...sources: PreviousAltarItem[][]): PreviousAltarItem[] {
  const map = new Map<string, PreviousAltarItem>();

  for (const source of sources) {
    for (const item of source) {
      const slug = normalizeSlug(item?.altar_slug);
      if (!slug) continue;

      const existing = map.get(slug);
      const nextDate = item?.created_at || '';
      const existingDate = existing?.created_at || '';

      if (!existing || nextDate > existingDate) {
        map.set(slug, {
          altar_slug: slug,
          created_at: item?.created_at,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aDate = a.created_at || '';
    const bDate = b.created_at || '';
    return bDate.localeCompare(aDate);
  });
}

function getOwnerParts(username: string) {
  const savedEmail = normalizeUserValue(
    typeof window !== 'undefined' ? localStorage.getItem('cyber_altar_email') || '' : ''
  );
  const normalizedUsername = normalizeUserValue(username);

  return {
    savedEmail,
    normalizedUsername,
  };
}

function getOwnerKey(username: string) {
  const { savedEmail, normalizedUsername } = getOwnerParts(username);

  if (savedEmail && normalizedUsername) {
    return `${savedEmail}__${normalizedUsername}`;
  }

  if (normalizedUsername) return normalizedUsername;
  if (savedEmail) return savedEmail;
  return 'guest';
}

function getHistoryKey(username: string) {
  return `cyber_altar_history_${getOwnerKey(username)}`;
}

function getSelectedSlugKey(username: string) {
  return `cyber_altar_selected_slug_${getOwnerKey(username)}`;
}

function getDeletedAltarsKey(username: string) {
  return `cyber_altar_deleted_altars_${getOwnerKey(username)}`;
}

function getLegacyHistoryKeys(username: string) {
  const { savedEmail, normalizedUsername } = getOwnerParts(username);
  const keys = new Set<string>();

  keys.add(getHistoryKey(username));

  if (savedEmail) {
    keys.add(`cyber_altar_history_${savedEmail}`);
  }

  if (normalizedUsername) {
    keys.add(`cyber_altar_history_${normalizedUsername}`);
  }

  return Array.from(keys);
}

function getDeletedAltars(username: string) {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const raw = localStorage.getItem(getDeletedAltarsKey(username));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(
      Array.isArray(parsed) ? parsed.map((item) => normalizeSlug(item)).filter(Boolean) : []
    );
  } catch {
    return new Set<string>();
  }
}

function setDeletedAltars(username: string, deleted: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    getDeletedAltarsKey(username),
    JSON.stringify(Array.from(deleted.values()))
  );
}

function removeSlugFromStoredCounts(storageKey: string, altarSlug: string) {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : {};

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

    if (altarSlug in parsed) {
      delete parsed[altarSlug];
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    }
  } catch {
    // ignore malformed cached data
  }
}

function purgeLocalAltarData(username: string, altarSlug: string) {
  if (typeof window === 'undefined') return;

  const normalizedSlug = normalizeSlug(altarSlug);
  const ownerKey = getOwnerKey(username);
  const normalizedUsername = normalizeUserValue(username);

  const candidateKeys = new Set<string>([
    `cyber_altar_candles_${username}_${normalizedSlug}`,
    `cyber_altar_candles_${normalizedUsername}_${normalizedSlug}`,
  ]);

  candidateKeys.forEach((key) => localStorage.removeItem(key));

  removeSlugFromStoredCounts(`cyber_altar_prayer_counts_${ownerKey}`, normalizedSlug);
  removeSlugFromStoredCounts(`cyber_altar_candle_counts_${ownerKey}`, normalizedSlug);
}

=======
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
export default function AltarSelectionForm({
  username,
  previousAltars = [],
}: Props) {
  const router = useRouter();
  const altarOptions = useMemo(() => buildAltarList(), []);
<<<<<<< HEAD
  const [selectedAltarSlug, setSelectedAltarSlug] = useState<string>('al001');
  const [displayPreviousAltars, setDisplayPreviousAltars] = useState<PreviousAltarItem[]>(
    Array.isArray(previousAltars) ? previousAltars : []
  );
  const [isDeletingAltar, setIsDeletingAltar] = useState(false);

  const loadPreviousAltars = useCallback(() => {
    if (typeof window === 'undefined') return;

    const historyKey = getHistoryKey(username);
    const selectedSlugKey = getSelectedSlugKey(username);
    const deletedAltars = getDeletedAltars(username);

    const localHistories = getLegacyHistoryKeys(username).map((key) =>
      parseHistory(localStorage.getItem(key))
    );

    const serverHistory = Array.isArray(previousAltars) ? previousAltars : [];

    const mergedHistory = mergeHistories(serverHistory, ...localHistories).filter(
      (item) => !deletedAltars.has(normalizeSlug(item.altar_slug))
    );

    localStorage.setItem(historyKey, JSON.stringify(mergedHistory));
    setDisplayPreviousAltars(mergedHistory);

    const savedSelected = normalizeSlug(localStorage.getItem(selectedSlugKey) || '');

    if (savedSelected && !deletedAltars.has(savedSelected)) {
      setSelectedAltarSlug(savedSelected);
    } else if (mergedHistory.length > 0) {
      const firstSlug = normalizeSlug(mergedHistory[0].altar_slug);
      setSelectedAltarSlug(firstSlug);
      localStorage.setItem(selectedSlugKey, firstSlug);
    } else {
      setSelectedAltarSlug('al001');
      localStorage.setItem(selectedSlugKey, 'al001');
    }
  }, [previousAltars, username]);

  useEffect(() => {
    loadPreviousAltars();

    const handleFocus = () => loadPreviousAltars();
    const handleStorage = () => loadPreviousAltars();
    const handleVisibility = () => {
      if (!document.hidden) loadPreviousAltars();
    };
    const handlePageShow = () => loadPreviousAltars();
    const handlePopState = () => loadPreviousAltars();
    const handleCustomHistoryUpdate = () => loadPreviousAltars();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener(
      'cyber-altar-history-updated',
      handleCustomHistoryUpdate as EventListener
    );
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(
        'cyber-altar-history-updated',
        handleCustomHistoryUpdate as EventListener
      );
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadPreviousAltars]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const selectedSlugKey = getSelectedSlugKey(username);
    const savedSelected = normalizeSlug(localStorage.getItem(selectedSlugKey) || '');
    const deletedAltars = getDeletedAltars(username);

    if (savedSelected && !deletedAltars.has(savedSelected)) {
=======
  const safePreviousAltars = Array.isArray(previousAltars) ? previousAltars : [];
  const [selectedAltarSlug, setSelectedAltarSlug] = useState<string>('al001');

  useEffect(() => {
    const savedSelected =
      typeof window !== 'undefined'
        ? localStorage.getItem('cyber_altar_selected_slug')
        : '';

    if (savedSelected) {
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
      setSelectedAltarSlug(savedSelected);
      return;
    }

<<<<<<< HEAD
    if (displayPreviousAltars.length > 0) {
      const firstSlug = normalizeSlug(displayPreviousAltars[0].altar_slug);
      setSelectedAltarSlug(firstSlug);
      localStorage.setItem(selectedSlugKey, firstSlug);
      return;
    }

    setSelectedAltarSlug('al001');
    localStorage.setItem(selectedSlugKey, 'al001');
  }, [displayPreviousAltars, username]);

  const selectedAltar =
    altarOptions.find((item) => item.altar_slug === normalizeSlug(selectedAltarSlug)) ??
    altarOptions[0];

  const handleSelectAltar = (altarSlug: string) => {
    const normalizedSlug = normalizeSlug(altarSlug);
    setSelectedAltarSlug(normalizedSlug);

    if (typeof window !== 'undefined') {
      const deletedAltars = getDeletedAltars(username);

      if (deletedAltars.has(normalizedSlug)) {
        deletedAltars.delete(normalizedSlug);
        setDeletedAltars(username, deletedAltars);
      }

      localStorage.setItem(getSelectedSlugKey(username), normalizedSlug);
=======
    if (safePreviousAltars.length > 0) {
      setSelectedAltarSlug(safePreviousAltars[0].altar_slug);
    }
  }, [safePreviousAltars]);

  const selectedAltar =
    altarOptions.find((item) => item.altar_slug === selectedAltarSlug) ??
    altarOptions[0];

  const handleSelectAltar = (altarSlug: string) => {
    setSelectedAltarSlug(altarSlug);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_altar_selected_slug', altarSlug);
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
      localStorage.setItem('cyber_altar_username', username);
    }
  };

<<<<<<< HEAD
  const writeHistory = (altarSlug: string) => {
    if (typeof window === 'undefined') return [];

    const normalizedSlug = normalizeSlug(altarSlug);
    const historyKey = getHistoryKey(username);
    const selectedSlugKey = getSelectedSlugKey(username);

    localStorage.setItem(selectedSlugKey, normalizedSlug);
    localStorage.setItem('cyber_altar_username', username);

    const deletedAltars = getDeletedAltars(username);
    if (deletedAltars.has(normalizedSlug)) {
      deletedAltars.delete(normalizedSlug);
      setDeletedAltars(username, deletedAltars);
    }

    const existingHistory = parseHistory(localStorage.getItem(historyKey));
    const serverHistory = Array.isArray(previousAltars) ? previousAltars : [];

    const nextHistory = mergeHistories(
      [
        {
          altar_slug: normalizedSlug,
          created_at: new Date().toISOString(),
        },
      ],
      existingHistory,
      serverHistory
    ).filter((item) => !deletedAltars.has(normalizeSlug(item.altar_slug)));

    localStorage.setItem(historyKey, JSON.stringify(nextHistory));
    window.dispatchEvent(new CustomEvent('cyber-altar-history-updated'));

    setDisplayPreviousAltars(nextHistory);
    return nextHistory;
  };

  const handleDeleteAltar = async () => {
    if (typeof window === 'undefined') return;
    if (!selectedAltarSlug) return;
    if (!displayPreviousAltars || displayPreviousAltars.length === 0) return;

    const slugToDelete = normalizeSlug(selectedAltarSlug);
    const confirmed = window.confirm(
      `Delete ${slugToDelete.toUpperCase()} from the formerly chosen altar list?`
    );

    if (!confirmed) return;

    setIsDeletingAltar(true);

    try {
      purgeLocalAltarData(username, slugToDelete);

      try {
        await fetch('/api/delete-altar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            altar_slug: slugToDelete,
          }),
        });
      } catch {
        // keep local deletion working even if the API route is not present yet
      }

      const deletedAltars = getDeletedAltars(username);
      deletedAltars.add(slugToDelete);
      setDeletedAltars(username, deletedAltars);

      const nextHistoryByKey = new Map<string, PreviousAltarItem[]>();

      for (const key of getLegacyHistoryKeys(username)) {
        const updated = parseHistory(localStorage.getItem(key)).filter(
          (item) => normalizeSlug(item.altar_slug) !== slugToDelete
        );
        localStorage.setItem(key, JSON.stringify(updated));
        nextHistoryByKey.set(key, updated);
      }

      const canonicalHistory = nextHistoryByKey.get(getHistoryKey(username)) || [];
      setDisplayPreviousAltars(canonicalHistory);

      const selectedSlugKey = getSelectedSlugKey(username);

      if (canonicalHistory.length > 0) {
        const nextSlug = normalizeSlug(canonicalHistory[0].altar_slug);
        setSelectedAltarSlug(nextSlug);
        localStorage.setItem(selectedSlugKey, nextSlug);
      } else {
        setSelectedAltarSlug('al001');
        localStorage.setItem(selectedSlugKey, 'al001');
      }

      window.dispatchEvent(new CustomEvent('cyber-altar-history-updated'));
    } finally {
      setIsDeletingAltar(false);
    }
  };

  const handleProceed = () => {
    if (!selectedAltarSlug) return;

    writeHistory(selectedAltarSlug);

    router.push(
      `/altar/${normalizeSlug(selectedAltarSlug)}?username=${encodeURIComponent(username)}`
    );
  };

  const handleProceedByLink = () => {
    if (!selectedAltar?.altar_slug) return;
    writeHistory(selectedAltar.altar_slug);
  };

=======
  const handleProceed = () => {
    if (!selectedAltarSlug) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_altar_selected_slug', selectedAltarSlug);
      localStorage.setItem('cyber_altar_username', username);

      const historyKey = `cyber_altar_history_${username}`;
      const existingRaw = localStorage.getItem(historyKey);

      let history: PreviousAltarItem[] = [];

      try {
        history = existingRaw ? JSON.parse(existingRaw) : [];
      } catch {
        history = [];
      }

      const alreadyExists = history.some(
        (item) => item.altar_slug === selectedAltarSlug
      );

      if (!alreadyExists) {
        history.unshift({
          altar_slug: selectedAltarSlug,
          created_at: new Date().toISOString(),
        });
      }

      localStorage.setItem(historyKey, JSON.stringify(history));
    }

    router.push(
      `/altar/${selectedAltarSlug}?username=${encodeURIComponent(username)}`
    );
  };

>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
  const handleReturnToMain = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_altar_username', username);
    }

    router.push('/');
  };

  const handleExitToCrownMind = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://crownmind.netlify.app/';
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)] md:p-6">
          <p className="text-sm text-slate-300">Pilgrim: {username}</p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
            Select the Altar Picture
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Choose the altar picture that will represent this Holy Place. If you
            click a formerly chosen altar from your history, the matching altar
            in the general list below will also highlight.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-amber-300/25 bg-slate-950/75 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <div className="border-b border-white/10 px-5 py-4">
<<<<<<< HEAD
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
                      Presently Chosen Altar
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
                      {selectedAltar?.altar_slug?.toUpperCase() || 'NO ALTAR SELECTED'}
                    </h2>
                  </div>

                  {selectedAltar?.altar_slug && (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/altar/${selectedAltar.altar_slug}?username=${encodeURIComponent(
                          username
                        )}`}
                        onClick={handleProceedByLink}
                        className="inline-flex items-center justify-center rounded-xl border border-amber-300/50 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
                      >
                        Proceed to Altar
                      </Link>

                      <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-amber-300/50 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
                      >
                        Return to Main
                      </Link>

                      <a
                        href="https://crownmind.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-amber-300/50 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
                      >
                        Exit to CrownMind
                      </a>

                      <button
                        type="button"
                        onClick={handleDeleteAltar}
                        disabled={isDeletingAltar || displayPreviousAltars.length === 0}
                        className="inline-flex items-center justify-center rounded-xl border border-red-500/70 bg-red-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeletingAltar ? 'Deleting...' : 'Delete Altar'}
                      </button>
                    </div>
                  )}
                </div>
=======
                <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
                  Presently Chosen Altar
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
                  {selectedAltar.altar_slug.toUpperCase()}
                </h2>
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
              </div>

              <div className="bg-black/20 p-4 md:p-5">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={selectedAltar.image}
                    alt={selectedAltar.altar_slug}
                    className="h-[260px] w-full object-cover md:h-[420px]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/75 p-4 md:p-5">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  General Altar List
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Choose from all altar pictures
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {altarOptions.map((item) => {
<<<<<<< HEAD
                  const isSelected = item.altar_slug === normalizeSlug(selectedAltarSlug);
                  const isFormerlyChosen = displayPreviousAltars.some(
                    (altar) => normalizeSlug(altar.altar_slug) === item.altar_slug
=======
                  const isSelected = item.altar_slug === selectedAltarSlug;
                  const isFormerlyChosen = safePreviousAltars.some(
                    (altar) => altar.altar_slug === item.altar_slug
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
                  );

                  return (
                    <button
                      key={item.altar_slug}
                      type="button"
                      onClick={() => handleSelectAltar(item.altar_slug)}
                      className={`group overflow-hidden rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-amber-300 bg-amber-300/10 ring-2 ring-amber-300/60'
                          : isFormerlyChosen
                          ? 'border-cyan-300/35 bg-cyan-400/5 hover:border-cyan-300/70'
                          : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-black/20">
                        <img
                          src={item.image}
                          alt={item.altar_slug}
                          className={`h-full w-full object-cover transition duration-200 ${
<<<<<<< HEAD
                            isSelected ? 'scale-[1.03]' : 'group-hover:scale-[1.02]'
=======
                            isSelected
                              ? 'scale-[1.03]'
                              : 'group-hover:scale-[1.02]'
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
                          }`}
                        />
                      </div>

                      <div
                        className={`px-3 py-2 text-xs font-medium md:text-sm ${
                          isSelected
                            ? 'text-amber-100'
                            : isFormerlyChosen
                            ? 'text-cyan-100'
                            : 'text-slate-200'
                        }`}
                      >
                        {item.altar_slug.toUpperCase()}
<<<<<<< HEAD
                        {isSelected ? ' • Selected' : isFormerlyChosen ? ' • Former' : ''}
=======
                        {isSelected
                          ? ' • Selected'
                          : isFormerlyChosen
                          ? ' • Former'
                          : ''}
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleReturnToMain}
                className="rounded-2xl border border-cyan-300/40 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Return To Main
              </button>

              <button
                type="button"
                onClick={handleProceed}
                className="rounded-2xl border border-amber-300/40 bg-amber-400/20 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
              >
                Proceed to the Holy Place
              </button>

              <button
                type="button"
                onClick={handleExitToCrownMind}
                className="rounded-2xl border border-red-400/40 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                Exit To CrownMind
              </button>
            </div>
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 p-4 md:p-5">
              <PreviousAltarList
                username={username}
<<<<<<< HEAD
                previousAltars={displayPreviousAltars}
=======
                previousAltars={safePreviousAltars}
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
                selectedAltarSlug={selectedAltarSlug}
                onSelectAltar={handleSelectAltar}
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 81b4ab6c4f05e009b867cafac571aaa160ca4cc4
