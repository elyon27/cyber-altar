'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { loadDedications, readLocalDedications } from '@/lib/altar-dedications';

type Destination = { slug: string; dedication: string; createdAt: string };
type Props = {
  prayerId: string;
  sourceAltar: string;
  sourceProfileId: string;
  ownerEmail: string;
  disabled?: boolean;
  onTransferred: (result: {
    source_altar: string;
    target_altar: string;
    source_prayer_count: number;
    target_prayer_count: number;
    source_candle_count: number;
    target_candle_count: number;
  }) => void;
};

export default function TransferPrayerControl({
  prayerId, sourceAltar, sourceProfileId, ownerEmail, disabled, onTransferred,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function openDestinations() {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      const email = user?.email?.trim().toLowerCase();
      if (authError || !user || !user.email_confirmed_at || !email ||
          email !== ownerEmail.trim().toLowerCase()) {
        throw new Error('Verify your pilgrim email to view your altar history.');
      }
      // Profile rows are server-backed altar visits; they include altars without dedication names.
      const { data, error } = await supabase.from('altar_profiles')
        .select('altar_slug, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []).filter(row => /^al[0-9]{3}$/.test(row.altar_slug)
        && row.altar_slug !== sourceAltar);
      const slugs = [...new Set(rows.map(row => row.altar_slug))];
      let names = readLocalDedications(slugs, email);
      try {
        const synced = await loadDedications(slugs);
        names = { ...names, ...synced };
      } catch (reason) {
        console.warn('Remote dedication labels are unavailable; using saved local labels.', reason);
      }
      setDestinations(slugs.map(slug => ({
        slug,
        dedication: names[slug]?.trim() ?? '',
        createdAt: rows.find(row => row.altar_slug === slug)?.created_at ?? '',
      })));
    } catch (reason) {
      setDestinations([]);
      setErrorMessage(reason instanceof Error ? reason.message : 'Could not load altar history.');
    } finally {
      setLoading(false);
    }
  }

  async function transferTo(slug: string) {
    if (!slug || transferring || disabled) return;
    const selected = destinations.find(item => item.slug === slug);
    if (!selected) return;
    const label = selected.dedication || 'No dedication saved';
    if (!window.confirm(`Transfer this prayer, all its candles, and seven-layer reflections to ${slug.toUpperCase()} — ${label}? The prayer will be removed from this altar.`)) {
      return;
    }
    setErrorMessage('');
    setTransferring(true);
    try {
      const { data, error } = await supabase.rpc('transfer_owned_prayer', {
        p_prayer_id: prayerId,
        p_source_profile_id: sourceProfileId,
        p_target_altar_slug: slug,
      });
      if (error || !data || data.target_altar !== slug) {
        throw error || new Error('The transfer was not confirmed.');
      }
      onTransferred(data);
      setExpanded(false);
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Transfer failed; the prayer has not been moved.');
    } finally {
      setTransferring(false);
    }
  }

  return (
    <div className="mt-3" aria-busy={loading || transferring}>
      <button type="button" onClick={() => void openDestinations()}
        disabled={disabled || transferring}
        aria-expanded={expanded}
        className="rounded-xl border border-sky-300/60 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-400/20 disabled:opacity-50">
        {transferring ? 'Transferring Prayer...' : 'Transfer To Other Altars'}
      </button>
      {expanded && (
        <div className="mt-3 rounded-xl border border-sky-300/20 bg-slate-900 p-3">
          <label htmlFor={`transfer-${prayerId}`} className="mb-2 block text-sm font-medium text-sky-100">
            Choose another altar from your history
          </label>
          {loading ? <p className="text-sm text-white/70">Loading your altar history...</p> :
            destinations.length === 0 ? <p className="text-sm text-white/70">No other previously visited altars are available.</p> :
            <select id={`transfer-${prayerId}`} defaultValue="" disabled={transferring || disabled}
              onChange={event => {
                const slug = event.target.value;
                event.target.value = '';
                void transferTo(slug);
              }}
              className="w-full min-w-0 rounded-lg border border-white/20 bg-slate-800 p-3 text-sm text-white focus:border-sky-300 focus:outline-none">
              <option value="" disabled>Select destination altar...</option>
              {destinations.map(destination => (
                <option key={destination.slug} value={destination.slug}>
                  {destination.slug.toUpperCase()} — {destination.dedication || 'No dedication saved'}
                </option>
              ))}
            </select>
          }
          <p className="mt-2 text-xs text-white/60">
            Selecting an altar asks you to confirm the move. The prayer, visibility, candles,
            and saved inner reflections stay together.
          </p>
        </div>
      )}
      {errorMessage && <p role="alert" className="mt-2 text-sm text-red-200">{errorMessage}</p>}
    </div>
  );
}
