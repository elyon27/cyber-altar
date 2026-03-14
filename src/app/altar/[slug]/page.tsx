'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AltarProfile = {
  id: string;
  username: string;
  email: string | null;
  altar_slug: string;
  candle_count: number;
  created_at: string;
  updated_at: string;
};

type AltarPrayer = {
  id: string;
  profile_id: string;
  username: string;
  altar_slug: string;
  prayer_text: string;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function getCandleStorageKey(username: string, altarSlug: string) {
  return `cyber_altar_candles_${username}_${altarSlug}`;
}

export default function HolyPlacePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const altarSlug = typeof params?.slug === 'string' ? params.slug : '';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<AltarProfile | null>(null);
  const [prayers, setPrayers] = useState<AltarPrayer[]>([]);
  const [prayerText, setPrayerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [globalCandleCount, setGlobalCandleCount] = useState(0);

  const altarImageSrc = useMemo(() => {
    return altarSlug ? `/altar/${altarSlug}.jpg` : '';
  }, [altarSlug]);

  const loadGlobalCandleCount = useCallback(async (currentAltarSlug: string) => {
    const { data, error } = await supabase
      .from('altar_profiles')
      .select('candle_count')
      .eq('altar_slug', currentAltarSlug);

    if (error) {
      throw new Error(
        `altar_profiles candle total load failed: ${error.message}${
          error.details ? ` | details: ${error.details}` : ''
        }${error.hint ? ` | hint: ${error.hint}` : ''}`
      );
    }

    const total = (data ?? []).reduce(
      (sum, item) => sum + (Number(item.candle_count) || 0),
      0
    );

    setGlobalCandleCount(total);
  }, []);

  const loadPrayers = useCallback(async (profileId: string) => {
    const { data, error } = await supabase
      .from('altar_prayers')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `altar_prayers load failed: ${error.message}${
          error.details ? ` | details: ${error.details}` : ''
        }${error.hint ? ` | hint: ${error.hint}` : ''}`
      );
    }

    setPrayers((data ?? []) as AltarPrayer[]);
  }, []);

  const ensureProfile = useCallback(
    async (
      currentUsername: string,
      currentEmail: string,
      currentAltarSlug: string
    ) => {
      const { error: upsertError } = await supabase.from('altar_profiles').upsert(
        {
          username: currentUsername,
          email: currentEmail || null,
          altar_slug: currentAltarSlug,
        },
        {
          onConflict: 'username,altar_slug',
        }
      );

      if (upsertError) {
        throw new Error(
          `altar_profiles upsert failed: ${upsertError.message}${
            upsertError.details ? ` | details: ${upsertError.details}` : ''
          }${upsertError.hint ? ` | hint: ${upsertError.hint}` : ''}`
        );
      }

      const { data: profileData, error: profileError } = await supabase
        .from('altar_profiles')
        .select('*')
        .eq('username', currentUsername)
        .eq('altar_slug', currentAltarSlug)
        .single();

      if (profileError) {
        throw new Error(
          `altar_profiles select failed: ${profileError.message}${
            profileError.details ? ` | details: ${profileError.details}` : ''
          }${profileError.hint ? ` | hint: ${profileError.hint}` : ''}`
        );
      }

      let nextProfile = profileData as AltarProfile;

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(
          currentUsername,
          currentAltarSlug
        );
        const storedCandleCount = localStorage.getItem(candleStorageKey);
        const parsedStoredCount = storedCandleCount
          ? Number.parseInt(storedCandleCount, 10)
          : NaN;

        if (
          Number.isFinite(parsedStoredCount) &&
          parsedStoredCount > (nextProfile.candle_count ?? 0)
        ) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('altar_profiles')
            .update({ candle_count: parsedStoredCount })
            .eq('id', nextProfile.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            nextProfile = updatedProfile as AltarProfile;
          }
        }

        localStorage.setItem(
          candleStorageKey,
          String(nextProfile.candle_count ?? 0)
        );
      }

      setProfile(nextProfile);
      await loadPrayers(nextProfile.id);
      await loadGlobalCandleCount(currentAltarSlug);

      return nextProfile;
    },
    [loadGlobalCandleCount, loadPrayers]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const storedUsername =
          typeof window !== 'undefined'
            ? localStorage.getItem('cyber_altar_username') || ''
            : '';

        const storedEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('cyber_altar_email') || ''
            : '';

        const storedSelectedSlug =
          typeof window !== 'undefined'
            ? localStorage.getItem('cyber_altar_selected_slug') || ''
            : '';

        if (!storedUsername) {
          setErrorMessage(
            'No pilgrim was found. Please return to the altar selection screen.'
          );
          setLoading(false);
          return;
        }

        if (!altarSlug) {
          setErrorMessage('No altar was selected.');
          setLoading(false);
          return;
        }

        if (typeof window !== 'undefined' && storedSelectedSlug !== altarSlug) {
          localStorage.setItem('cyber_altar_selected_slug', altarSlug);
        }

        setUsername(storedUsername);
        setEmail(storedEmail);

        await ensureProfile(storedUsername, storedEmail, altarSlug);
      } catch (error: any) {
        console.error('Holy Place load error:', error);
        setErrorMessage(
          `Failed to load the Holy Place: ${
            error?.message ||
            error?.details ||
            error?.hint ||
            JSON.stringify(error)
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [altarSlug, ensureProfile]);

  useEffect(() => {
    if (!altarSlug || !profile?.id) return;

    const prayerChannel = supabase
      .channel(`holy-place-prayers-${altarSlug}-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'altar_prayers',
          filter: `profile_id=eq.${profile.id}`,
        },
        async () => {
          await loadPrayers(profile.id);
        }
      )
      .subscribe();

    const candleChannel = supabase
      .channel(`holy-place-candles-${altarSlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'altar_profiles',
          filter: `altar_slug=eq.${altarSlug}`,
        },
        async () => {
          await loadGlobalCandleCount(altarSlug);

          const { data } = await supabase
            .from('altar_profiles')
            .select('*')
            .eq('username', username)
            .eq('altar_slug', altarSlug)
            .single();

          if (data) {
            setProfile(data as AltarProfile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prayerChannel);
      supabase.removeChannel(candleChannel);
    };
  }, [altarSlug, loadGlobalCandleCount, loadPrayers, profile?.id, username]);

  const handleSubmitPrayer = async (event: FormEvent) => {
    event.preventDefault();

    if (!profile) return;

    const trimmedPrayer = prayerText.trim();
    if (!trimmedPrayer) return;

    try {
      setSubmittingPrayer(true);
      setErrorMessage('');

      const { error } = await supabase.from('altar_prayers').insert({
        profile_id: profile.id,
        username: profile.username,
        altar_slug: profile.altar_slug,
        prayer_text: trimmedPrayer,
      });

      if (error) {
        throw error;
      }

      setPrayerText('');
      await loadPrayers(profile.id);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to submit prayer.');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleLightCandle = async () => {
    if (!profile) return;

    try {
      setLightingCandle(true);
      setErrorMessage('');

      const nextCount = (profile.candle_count ?? 0) + 1;

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(username, altarSlug);
        localStorage.setItem(candleStorageKey, String(nextCount));
      }

      const { data, error } = await supabase
        .from('altar_profiles')
        .update({ candle_count: nextCount })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedProfile = data as AltarProfile;
      setProfile(updatedProfile);

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(username, altarSlug);
        localStorage.setItem(
          candleStorageKey,
          String(updatedProfile.candle_count ?? nextCount)
        );
      }

      await loadGlobalCandleCount(altarSlug);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to light candle.');
    } finally {
      setLightingCandle(false);
    }
  };

  const handleReturnToSelection = () => {
    if (typeof window !== 'undefined') {
      if (username) {
        localStorage.setItem('cyber_altar_username', username);
      }

      if (email) {
        localStorage.setItem('cyber_altar_email', email);
      }

      if (altarSlug) {
        localStorage.setItem('cyber_altar_selected_slug', altarSlug);
      }

      if (profile) {
        const candleStorageKey = getCandleStorageKey(username, altarSlug);
        localStorage.setItem(
          candleStorageKey,
          String(profile.candle_count ?? 0)
        );
      }
    }

    router.push('/select-altar');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-lg font-medium">Loading the Holy Place...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <h1 className="text-3xl font-bold">Holy Place</h1>
            <p className="mt-1 text-white/75">Pilgrim: {username}</p>
            <p className="text-white/60">Selected Altar: {altarSlug}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReturnToSelection}
              className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10"
            >
              Return to Altar Selection
            </button>

            <Link
              href="https://crownmind.netlify.app"
              className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950"
            >
              Exit to CrownMind
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="relative mx-auto mb-5 h-[420px] w-full max-w-xl overflow-hidden rounded-2xl border border-white/10">
              {altarImageSrc ? (
                <Image
                  src={altarImageSrc}
                  alt={`Selected altar ${altarSlug}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5">
              <p className="text-lg font-semibold">Your Candles Lighted</p>
              <p className="mt-2 text-4xl font-bold">
                {profile?.candle_count ?? 0}
              </p>

              <p className="mt-5 text-lg font-semibold text-amber-100">
                Global Candles for this Altar
              </p>
              <p className="mt-2 text-4xl font-bold text-amber-300">
                {globalCandleCount}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Image
                  src="/images/candle.jpg"
                  alt="Candle"
                  width={60}
                  height={120}
                  className="rounded-lg shadow-lg"
                />

                <button
                  type="button"
                  onClick={handleLightCandle}
                  disabled={lightingCandle}
                  className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {lightingCandle ? 'Lighting Candle...' : 'Light Candle'}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <form
              onSubmit={handleSubmitPrayer}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h2 className="text-xl font-semibold">Enter Your Prayer</h2>

              <div className="mt-4 rounded-2xl border border-white/20 bg-slate-900/70 p-3">
                <textarea
                  value={prayerText}
                  onChange={(event) => setPrayerText(event.target.value)}
                  placeholder="Write your prayer here..."
                  className="min-h-[160px] w-full resize-none bg-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPrayer || !prayerText.trim()}
                className="mt-4 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingPrayer ? 'Submitting Prayer...' : 'Submit Prayer'}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Former Prayers</h2>

              {prayers.length === 0 ? (
                <p className="mt-4 text-white/70">No former prayers yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {prayers.map((prayer) => (
                    <div
                      key={prayer.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-wide text-white/50">
                        {formatDate(prayer.created_at)}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-white/90">
                        {prayer.prayer_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}