'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function VerifiedPilgrimGate({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    const check = async () => {
      const selected = (localStorage.getItem('cyber_altar_email') || '').trim().toLowerCase();
      if (active) setEmail(selected);
      const { data: { user } } = await supabase.auth.getUser();
      if (active) { setReady(!!selected && !!user?.email_confirmed_at && user.email?.toLowerCase() === selected); setChecking(false); }
    };
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Do not await another auth call inside the auth event callback.
      if (active && event === 'SIGNED_OUT') setReady(false);
      window.setTimeout(() => { if (active) void check(); }, 0);
    });
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    return () => { active = false; subscription.unsubscribe(); window.removeEventListener('storage', check); window.removeEventListener('focus', check); };
  }, []);

  async function sendCode() {
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setSent(true); setMessage('Check your email for your verification code.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to send the code. Please try again.'); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: 'email' });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at || user.email?.toLowerCase() !== email) throw new Error('Please verify the email used at the entrance.');
      setReady(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to verify the code.'); }
    finally { setBusy(false); }
  }
  if (checking) return <main className="min-h-screen bg-slate-950 p-8 text-white">Checking your prayer access...</main>;
  if (ready) return <>{children}</>;
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
    <section className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/5 p-6">
      <h1 className="text-2xl font-semibold">Protect your personal prayers</h1>
      <p className="mt-3 text-white/80">Verify your email to offer prayers, view secret prayers, and choose what to share on the Prayer Wall.</p>
      <p className="mt-3 break-words font-semibold">{email || 'Please enter your email at the entrance first.'}</p>
      <button type="button" onClick={sendCode} disabled={busy || !email} className="mt-5 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? 'Please wait...' : sent ? 'Send Another Code' : 'Send Verification Code'}</button>
      {sent && <form onSubmit={verify} className="mt-4 space-y-3">
        <label htmlFor="prayer-code" className="block text-sm">Email verification code</label>
        <input id="prayer-code" value={token} onChange={event => setToken(event.target.value)} autoComplete="one-time-code" inputMode="numeric" required maxLength={10} className="w-full rounded-xl bg-slate-800 p-3" />
        <button disabled={busy || !token.trim()} className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">Verify and Continue</button>
      </form>}
      <p role="status" className="mt-3 text-sm text-amber-200">{message}</p>
      <Link href="/" className="mt-5 block underline">Back to Entrance</Link>
    </section>
  </main>;
}
