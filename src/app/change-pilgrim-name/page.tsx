'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import VerifiedPilgrimGate from '@/components/cyber-altar/VerifiedPilgrimGate';

function NameForm() {
  const [name, setName] = useState('');
  const [current, setCurrent] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Please sign in first.');
        const response = await fetch('/api/pilgrim/session', { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) { setCurrent(result.name); setName(result.name); }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : 'Unable to load your name.'); }
    })();
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current || !current) return;
    pending.current = true; setBusy(true); setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.email) throw new Error('Please sign in first.');
      const response = await fetch('/api/pilgrim', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'rename', email: session.user.email, name: name.trim(), expectedName: current }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save your name.');
      localStorage.setItem('cyber_altar_username', result.name);
      localStorage.setItem('cyber_altar_email', session.user.email.toLowerCase());
      // Email-owned history and dedications remain attached to the same account.
      window.location.replace('/select-altar');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save your name.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">
    <section className="w-full max-w-lg rounded-3xl border border-amber-300/30 bg-white/5 p-6">
      <h1 className="text-2xl font-bold">Change Pilgrim Name</h1>
      <p className="mt-3 text-slate-300">Your prayers, candles, and chosen altars stay with your account.</p>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <label className="block" htmlFor="pilgrim-name">Pilgrim Name</label>
        <input id="pilgrim-name" autoComplete="nickname" value={name} onChange={e => setName(e.target.value)} required maxLength={80} disabled={busy || !current} className="w-full rounded-xl border border-white/20 bg-slate-800 p-3" />
        <button disabled={busy || !current || !name.trim() || name.trim() === current} className="w-full rounded-xl bg-amber-500 p-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? 'Saving…' : 'Save Pilgrim Name'}</button>
        <p role="alert" className="text-amber-100">{message}</p>
      </form>
      <Link href="/select-altar" className="mt-6 block underline">Return to Altar Selection</Link>
    </section>
  </main>;
}
export default function ChangePilgrimName() { return <VerifiedPilgrimGate><NameForm /></VerifiedPilgrimGate>; }
