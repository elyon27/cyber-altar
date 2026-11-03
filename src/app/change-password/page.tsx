'use client';

import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError('');
    setSaved(false);
    if (password !== confirmation || password === current || password.length < 8 ||
        new TextEncoder().encode(password).length > 72) {
      setError('Enter a different password of at least 8 characters and at most 72 bytes, then confirm it.');
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || !user.email_confirmed_at) {
        throw new Error('Sign in with your password before changing it.');
      }
      const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (authError) throw new Error('Unable to verify your current password.');
      const { error: updateError } = await supabase.auth.updateUser({ password, current_password: current });
      if (updateError) throw new Error(updateError.message);
      setCurrent('');
      setPassword('');
      setConfirmation('');
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to change your password.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const inputClass = 'mt-2 block w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3';
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
    <section className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-8">
      <h1 className="text-3xl font-bold">Change Password</h1>
      <form className="mt-6 space-y-5" onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-5">
          <label className="block">Current Password
            <input type="password" autoComplete="current-password" required className={inputClass}
              value={current} onChange={event => setCurrent(event.target.value)} />
          </label>
          <label className="block">New Password
            <input type="password" autoComplete="new-password" required minLength={8} maxLength={72}
              className={inputClass} value={password} onChange={event => setPassword(event.target.value)} />
          </label>
          <label className="block">Confirm New Password
            <input type="password" autoComplete="new-password" required className={inputClass}
              value={confirmation} onChange={event => setConfirmation(event.target.value)} />
          </label>
          <button className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950">
            {busy ? 'Saving…' : 'Save New Password'}
          </button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
        {saved && <p role="status">Your password was changed.</p>}
      </form>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className="underline" href="/select-altar">Return to Altar Selection</Link>
        <Link className="underline" href="/sign-in">Sign In With Password</Link>
      </div>
    </section>
  </main>;
}
