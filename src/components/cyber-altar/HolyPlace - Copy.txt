'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PrayerRecord = {
  id: string;
  prayer_text: string;
  created_at: string;
};

type HolyPlaceProps = {
  username: string;
  selectedAltar: string; // ex: al004
  onBackToAltarSelection?: () => void;
  onExit?: () => void;
};

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}

export default function HolyPlace({
  username,
  selectedAltar,
  onBackToAltarSelection,
  onExit,
}: HolyPlaceProps) {
  const [prayerInput, setPrayerInput] = useState('');
  const [prayers, setPrayers] = useState<PrayerRecord[]>([]);
  const [candleCount, setCandleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const altarImagePath = useMemo(
    () => `/altar/${selectedAltar}.jpg`,
    [selectedAltar]
  );

  const loadHolyPlaceData = useCallback(async () => {
    if (!username || !selectedAltar) return;

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch(
        `/api/holy-place?username=${encodeURIComponent(
          username
        )}&altar_slug=${encodeURIComponent(selectedAltar)}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load Holy Place data.');
      }

      setPrayers(Array.isArray(data?.prayers) ? data.prayers : []);
      setCandleCount(typeof data?.candleCount === 'number' ? data.candleCount : 0);
    } catch (error) {
      console.error(error);
      setPrayers([]);
      setCandleCount(0);
      setMessage('Unable to load this altar’s prayer and candle records.');
    } finally {
      setLoading(false);
    }
  }, [username, selectedAltar]);

  useEffect(() => {
    loadHolyPlaceData();
  }, [loadHolyPlaceData]);

  const handleSubmitPrayer = async () => {
    const trimmedPrayer = prayerInput.trim();

    if (!trimmedPrayer || !username || !selectedAltar) return;

    try {
      setSubmittingPrayer(true);
      setMessage(null);

      const response = await fetch('/api/holy-place/prayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          altar_slug: selectedAltar,
          prayer_text: trimmedPrayer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit prayer.');
      }

      setPrayerInput('');
      await loadHolyPlaceData();
      setMessage(`Prayer submitted under altar ${selectedAltar}.`);
    } catch (error) {
      console.error(error);
      setMessage('Prayer submission failed.');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleLightCandle = async () => {
    if (!username || !selectedAltar) return;

    try {
      setLightingCandle(true);
      setMessage(null);

      const response = await fetch('/api/holy-place/candle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          altar_slug: selectedAltar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to light candle.');
      }

      await loadHolyPlaceData();
      setMessage(`A candle was lighted under altar ${selectedAltar}.`);
    } catch (error) {
      console.error(error);
      setMessage('Unable to light candle.');
    } finally {
      setLightingCandle(false);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Holy Place</h2>
          <p className="text-blue-100">
            Pilgrim: <span className="font-semibold">{username}</span>
          </p>
          <p className="text-blue-100">
            Selected Altar: <span className="font-semibold text-yellow-300">{selectedAltar}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {onBackToAltarSelection && (
            <button
              type="button"
              onClick={onBackToAltarSelection}
              className="rounded-xl border border-blue-300/30 bg-blue-900/50 px-4 py-2 hover:bg-blue-800/60 transition"
            >
              Return to Altar Selection
            </button>
          )}

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border border-red-300/30 bg-red-900/40 px-4 py-2 hover:bg-red-800/50 transition"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-blue-300/30 bg-white/10 p-4">
        <p className="text-sm text-blue-100 leading-relaxed">
          <span className="font-semibold text-white">Note:</span> All prayers submitted and candles
          lighted are stored under the currently selected altar picture{' '}
          <span className="font-semibold text-yellow-300">{selectedAltar}</span>. If you choose
          another altar picture, that altar will show its own separate prayer list and candle count.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-yellow-300/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.15fr]">
        <div className="rounded-2xl border border-blue-300/30 bg-white/10 p-4 shadow-xl">
          <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl border border-blue-200/20 bg-black/20">
            <Image
              src={altarImagePath}
              alt={selectedAltar}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-300/20 bg-blue-950/40 p-4 text-center">
              <p className="text-sm text-blue-100">Candle Count</p>
              <p className="mt-1 text-3xl font-bold text-yellow-300">{candleCount}</p>
            </div>

            <div className="rounded-xl border border-blue-300/20 bg-blue-950/40 p-4 text-center">
              <p className="text-sm text-blue-100">Prayer Entries</p>
              <p className="mt-1 text-3xl font-bold text-yellow-300">{prayers.length}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLightCandle}
            disabled={lightingCandle || loading}
            className="mt-4 w-full rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {lightingCandle ? 'Lighting Candle...' : 'Light Candle'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-300/30 bg-white/10 p-4 shadow-xl">
            <h3 className="mb-3 text-xl font-semibold">Enter Your Prayer</h3>

            <div className="rounded-xl border border-blue-300/20 bg-blue-950/30 p-3">
              <textarea
                value={prayerInput}
                onChange={(e) => setPrayerInput(e.target.value)}
                placeholder={`Write your prayer for altar ${selectedAltar}...`}
                rows={5}
                className="w-full resize-none rounded-lg border border-blue-300/20 bg-slate-950/40 px-3 py-3 text-white outline-none placeholder:text-blue-200/60"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmitPrayer}
              disabled={submittingPrayer || loading || !prayerInput.trim()}
              className="mt-4 w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submittingPrayer ? 'Submitting Prayer...' : 'Submit Prayer'}
            </button>
          </div>

          <div className="rounded-2xl border border-blue-300/30 bg-white/10 p-4 shadow-xl">
            <h3 className="mb-3 text-xl font-semibold">Former Prayers</h3>

            {loading ? (
              <p className="text-sm text-blue-100">Loading this altar’s prayer records...</p>
            ) : prayers.length === 0 ? (
              <div className="rounded-xl border border-blue-300/20 bg-blue-950/30 p-4 text-sm text-blue-100">
                No prayers stored yet for altar <span className="font-semibold text-yellow-300">{selectedAltar}</span>.
              </div>
            ) : (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {prayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="rounded-xl border border-blue-300/20 bg-blue-950/30 p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                      {prayer.prayer_text}
                    </p>
                    <p className="mt-3 text-xs text-blue-200/80">
                      Date: {formatDate(prayer.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}