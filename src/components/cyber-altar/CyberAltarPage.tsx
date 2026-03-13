// ==============================
// File: components/cyber-altar/CyberAltarPage.tsx
// ==============================
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Screen, UserRecord } from '@/components/cyber-altar/types';
import { ALTAR_IMAGES, CANDLE_DURATION_MS, CROSS_IMAGE } from '@/components/cyber-altar/constants';
import { formatRemaining } from '@/components/cyber-altar/utils';
import SiteHeader from '@/components/cyber-altar/site-header';
import { MainMenu } from '@/components/cyber-altar/main-menu';
import { SignupForm } from '@/components/cyber-altar/signup-form';
import { SigninForm } from '@/components/cyber-altar/signin-form';
import { AltarForm } from '@/components/cyber-altar/altar-form';
import { HolyPlace } from '@/components/cyber-altar/holy-place';

const SESSION_KEY = 'cyber-altar-session-nickname';

export default function CyberAltarPage() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [prayer, setPrayer] = useState('');
  const [selectedAltar, setSelectedAltar] = useState(ALTAR_IMAGES[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const savedNickname = window.localStorage.getItem(SESSION_KEY);
    if (!savedNickname) return;

    const restore = async () => {
      try {
        const response = await fetch(`/api/altar/profile/${encodeURIComponent(savedNickname)}`);
        const payload = await response.json();
        if (!response.ok) return;

        setCurrentUser(payload.profile);
        setNickname(payload.profile.nickname);
        setEmail(payload.profile.email || '');
        setPrayer(payload.profile.prayer || '');
        setSelectedAltar(payload.profile.altarImage || ALTAR_IMAGES[0]);
        setScreen('altarForm');
      } catch {
        // silent restore failure
      }
    };

    restore();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const candleActive = !!(
    currentUser?.candleLitAt &&
    currentUser?.candleExpireAt &&
    new Date(currentUser.candleExpireAt).getTime() > now
  );

  const remainingMs = currentUser?.candleExpireAt
    ? new Date(currentUser.candleExpireAt).getTime() - now
    : 0;

  const progress = currentUser?.candleLitAt && currentUser?.candleExpireAt
    ? Math.max(
        0,
        Math.min(
          1,
          (new Date(currentUser.candleExpireAt).getTime() - now) /
            (new Date(currentUser.candleExpireAt).getTime() -
              new Date(currentUser.candleLitAt).getTime()),
        ),
      )
    : 0;

  const candleHeightPercent = candleActive ? Math.max(10, Math.round(progress * 100)) : 10;
  const remainingText = candleActive
    ? `Burning time remaining: ${formatRemaining(remainingMs)}`
    : 'The candle is currently unlighted.';

  function resetForMenu() {
    setError('');
    setLoading(false);
    setScreen('menu');
  }

  function rememberSession(nick: string) {
    window.localStorage.setItem(SESSION_KEY, nick);
  }

  async function handleSignup() {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/altar/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Failed to sign up.');
        return;
      }

      setCurrentUser(payload.profile);
      setNickname(payload.profile.nickname);
      setEmail(payload.profile.email || '');
      setPrayer(payload.profile.prayer || '');
      setSelectedAltar(payload.profile.altarImage || ALTAR_IMAGES[0]);
      rememberSession(payload.profile.nickname);
      setScreen('altarForm');
    } catch {
      setError('Failed to sign up.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignin() {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/altar/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Failed to sign in.');
        return;
      }

      setCurrentUser(payload.profile);
      setNickname(payload.profile.nickname);
      setEmail(payload.profile.email || '');
      setPrayer(payload.profile.prayer || '');
      setSelectedAltar(payload.profile.altarImage || ALTAR_IMAGES[0]);
      rememberSession(payload.profile.nickname);
      setScreen('altarForm');
    } catch {
      setError('Failed to sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function handleProceedToHolyPlace() {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/altar/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          prayer,
          altarImage: selectedAltar,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Failed to save altar form.');
        return;
      }

      setCurrentUser(payload.profile);
      rememberSession(payload.profile.nickname);
      setScreen('holyPlace');
    } catch {
      setError('Failed to save altar form.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLightCandle() {
    if (!currentUser) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/altar/light', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: currentUser.nickname }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Failed to light candle.');
        return;
      }

      setCurrentUser(payload.profile);
      setNow(Date.now());
    } catch {
      setError('Failed to light candle.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-blue-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl rounded-3xl border border-blue-700/60 bg-blue-900/40 p-6 shadow-2xl backdrop-blur">
        <SiteHeader />

        {error && screen === 'menu' && <p className="mb-4 text-sm text-rose-300">{error}</p>}

        {screen === 'menu' && (
          <MainMenu
            onSignup={() => {
              setError('');
              setNickname('');
              setEmail('');
              setPrayer('');
              setSelectedAltar(ALTAR_IMAGES[0]);
              setScreen('signup');
            }}
            onSignin={() => {
              setError('');
              setNickname('');
              setScreen('signin');
            }}
          />
        )}

        {screen === 'signup' && (
          <SignupForm
            nickname={nickname}
            email={email}
            error={error}
            loading={loading}
            setNickname={setNickname}
            setEmail={setEmail}
            onSubmit={handleSignup}
            onBack={resetForMenu}
          />
        )}

        {screen === 'signin' && (
          <SigninForm
            nickname={nickname}
            error={error}
            loading={loading}
            setNickname={setNickname}
            onSubmit={handleSignin}
            onBack={resetForMenu}
          />
        )}

        {screen === 'altarForm' && (
          <AltarForm
            nickname={nickname}
            prayer={prayer}
            selectedAltar={selectedAltar}
            altarImages={ALTAR_IMAGES}
            error={error}
            loading={loading}
            setPrayer={setPrayer}
            setSelectedAltar={setSelectedAltar}
            onProceed={handleProceedToHolyPlace}
            onBack={resetForMenu}
          />
        )}

        {screen === 'holyPlace' && currentUser && (
          <HolyPlace
            currentUser={currentUser}
            crossImage={CROSS_IMAGE}
            candleActive={candleActive}
            candleHeightPercent={candleHeightPercent}
            remainingText={remainingText}
            loading={loading}
            onLightCandle={handleLightCandle}
            onBack={resetForMenu}
          />
        )}
      </div>
    </main>
  );
}