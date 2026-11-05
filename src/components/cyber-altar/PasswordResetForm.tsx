'use client';

import { FormEvent, useRef, useState } from 'react';
import { createPasswordResetClient } from '@/lib/supabase';

const inputClass = 'mt-2 block w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3';
const buttonClass = 'w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950';

export default function PasswordResetForm({ email, onEmailChange, onReturn }: {
  email: string;
  onEmailChange: (email: string) => void;
  onReturn: () => void;
}) {
  const [stage, setStage] = useState<'email' | 'code' | 'password' | 'done'>('email');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const verifiedClient = useRef<ReturnType<typeof createPasswordResetClient> | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');

    try {
      const accountEmail = email.trim().toLowerCase();
      if (stage === 'email') {
        const { error } = await createPasswordResetClient().auth.signInWithOtp({
          email: accountEmail,
          options: { shouldCreateUser: false },
        });
        if (error && error.code !== 'otp_disabled' && error.code !== 'user_not_found') {
          throw new Error('Unable to send a code. Please wait a moment and try again.');
        }
        setStage('code');
      } else if (stage === 'code') {
        const client = createPasswordResetClient();
        const { data, error } = await client.auth.verifyOtp({ email: accountEmail, token: token.trim(), type: 'email' });
        if (error || !data.session || data.user?.email?.toLowerCase() !== accountEmail || !data.user.email_confirmed_at) {
          throw new Error('That code could not be verified. Check it or request a new code.');
        }
        verifiedClient.current = client;
        setToken('');
        setStage('password');
      } else if (stage === 'password' && verifiedClient.current) {
        if (password !== confirmation) throw new Error('The passwords must match.');
        if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
          throw new Error('Use at least 8 characters and no more than 72 bytes.');
        }
        const { error } = await verifiedClient.current.auth.updateUser({ password });
        if (error) throw new Error(error.message);
        verifiedClient.current = null;
        setPassword('');
        setConfirmation('');
        setStage('done');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to reset your password. Please try again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return <>
    <h1 className="text-3xl font-bold">Reset Your Password</h1>
    {stage === 'done' ? <p className="mt-3" role="status">Your password was updated. Sign in with your new password.</p> :
      <form className="mt-6 space-y-5" onSubmit={submit} aria-busy={busy}>
        <fieldset className="space-y-5 disabled:opacity-70" disabled={busy}>
          {stage === 'email' && <label className="block">Account email
            <input type="email" autoComplete="username" required maxLength={254} className={inputClass}
              value={email} onChange={event => onEmailChange(event.target.value)} />
          </label>}
          {stage === 'code' && <>
            <p role="status">If a Cyber-Altar account exists for <strong className="break-all">{email.trim()}</strong>, check that inbox for a verification code.</p>
            <label className="block">Email verification code
              <input autoComplete="one-time-code" inputMode="numeric" required maxLength={10} className={inputClass}
                value={token} onChange={event => setToken(event.target.value)} />
            </label>
          </>}
          {stage === 'password' && <>
            <label className="block">New Password
              <input type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                className={inputClass} value={password} onChange={event => setPassword(event.target.value)} />
            </label>
            <label className="block">Confirm New Password
              <input type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                className={inputClass} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
            </label>
          </>}
          <button className={buttonClass}>
            {busy ? 'Please wait…' : { email: 'Send Reset Code', code: 'Verify Code', password: 'Save New Password' }[stage]}
          </button>
          {(stage === 'code' || stage === 'password') && <button type="button" className="underline" onClick={() => {
            verifiedClient.current = null;
            setToken('');
            setPassword('');
            setConfirmation('');
            setError('');
            setStage('email');
          }}>Request a New Code</button>}
        </fieldset>
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm">{error}</p>}
      </form>}
    <button type="button" disabled={busy} onClick={onReturn} className="mt-6 block w-full text-center underline">
      Back to Sign In
    </button>
  </>;
}
