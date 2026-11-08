'use client';
import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import VerifiedPilgrimGate from '@/components/cyber-altar/VerifiedPilgrimGate';
function DeleteForm() {
  const [confirmation, setConfirmation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current || confirmation !== 'DELETE' || !agreed) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in again.');
      const response = await fetch('/api/account', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ confirmation }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to delete your account.');
      // Clear this app's cached personal data, including legacy keys in the WebView.
      for (const storage of [localStorage, sessionStorage]) {
        for (const key of Object.keys(storage)) {
          if (/^cyber[_-]altar|^sb-.*-auth-token/.test(key)) storage.removeItem(key);
        }
      }
      window.location.replace('/?accountDeleted=1');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete your account.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">
    <section className="w-full max-w-lg rounded-3xl border border-red-500/40 bg-white/5 p-6">
      <h1 className="text-2xl font-bold">Delete Account</h1>
      <p className="mt-4 text-slate-200">This permanently deletes your Cyber-Altar account, pilgrim name, all public and private prayers, seven-layer reflections, candles, altar history, and dedications. This cannot be undone.</p>
      <form onSubmit={submit} className="mt-6 space-y-5" aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-5">
          <label className="flex items-start gap-3"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required className="mt-1 h-5 w-5 shrink-0" /><span>I understand that my entire account and its data will be permanently deleted.</span></label>
          <label className="block" htmlFor="delete-confirmation">Type DELETE to confirm</label>
          <input id="delete-confirmation" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={confirmation} onChange={e => setConfirmation(e.target.value)} required className="w-full rounded-xl border border-white/20 bg-slate-800 p-3" />
          <button disabled={!agreed || confirmation !== 'DELETE'} className="w-full rounded-xl bg-red-600 p-3 font-semibold disabled:opacity-50">{busy ? 'Deleting…' : 'Permanently Delete My Account'}</button>
        </fieldset>
        <p role="alert" className="text-amber-100">{error}</p>
      </form>
      <Link href="/select-altar" className="mt-6 block underline">Cancel and Return to Altar Selection</Link>
    </section>
  </main>;
}
export default function DeleteAccount() { return <VerifiedPilgrimGate><DeleteForm /></VerifiedPilgrimGate>; }
