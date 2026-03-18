'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  username: string;
  altar_slug: string;
  candle_count: number;
};

type Prayer = {
  id: string;
  prayer_text: string;
  created_at: string;
};

function normalizeSlug(value?: string) {
  return (value || '').toLowerCase();
}

export default function HolyPlacePage() {
  const params = useParams();
  const router = useRouter();

  const altarSlug = normalizeSlug(params?.slug as string);

  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [prayerText, setPrayerText] = useState('');
  const [globalCandles, setGlobalCandles] = useState(0);
  const [globalPrayers, setGlobalPrayers] = useState(0);
  const [loading, setLoading] = useState(true);

  const imageSrc = `/altar/${altarSlug}.jpg`;

  // INIT
  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem('cyber_altar_username') || '';
      if (!storedUser || !altarSlug) return;

      setUsername(storedUser);

      // GET OR CREATE PROFILE
      let { data: profile } = await supabase
        .from('altar_profiles')
        .select('*')
        .eq('username', storedUser)
        .eq('altar_slug', altarSlug)
        .maybeSingle();

      if (!profile) {
        const { data } = await supabase
          .from('altar_profiles')
          .insert({
            username: storedUser,
            altar_slug: altarSlug,
            candle_count: 0,
          })
          .select()
          .single();

        profile = data;
      }

      setProfile(profile);

      // LOAD DATA
      loadPrayers(profile.id);
      loadGlobal(profile.altar_slug);

      setLoading(false);
    };

    init();
  }, [altarSlug]);

  const loadPrayers = async (profileId: string) => {
    const { data } = await supabase
      .from('altar_prayers')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    setPrayers(data || []);
  };

  const loadGlobal = async (slug: string) => {
    const { data: candles } = await supabase
      .from('altar_profiles')
      .select('candle_count')
      .eq('altar_slug', slug);

    const { count } = await supabase
      .from('altar_prayers')
      .select('*', { count: 'exact', head: true })
      .eq('altar_slug', slug);

    setGlobalCandles(
      (candles || []).reduce((sum, c) => sum + (c.candle_count || 0), 0)
    );

    setGlobalPrayers(count || 0);
  };

  const submitPrayer = async (e: any) => {
    e.preventDefault();
    if (!profile || !prayerText.trim()) return;

    await supabase.from('altar_prayers').insert({
      profile_id: profile.id,
      username: profile.username,
      altar_slug: profile.altar_slug,
      prayer_text: prayerText,
    });

    setPrayerText('');
    loadPrayers(profile.id);
    loadGlobal(profile.altar_slug);
  };

  const lightCandle = async () => {
    if (!profile) return;

    const next = profile.candle_count + 1;

    const { data } = await supabase
      .from('altar_profiles')
      .update({ candle_count: next })
      .eq('id', profile.id)
      .select()
      .single();

    setProfile(data);
    loadGlobal(profile.altar_slug);
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <main className="p-6 text-white bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Holy Place</h1>
      <p>Pilgrim: {username}</p>
      <p>Altar: {altarSlug}</p>

      <Image src={imageSrc} alt="" width={800} height={500} className="mt-4 rounded-xl" />

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>🕯 Your Candles: {profile?.candle_count}</div>
        <div>🌍 Global Candles: {globalCandles}</div>
        <div>🙏 Your Prayers: {prayers.length}</div>
        <div>🌍 Global Prayers: {globalPrayers}</div>
      </div>

      <button
        onClick={lightCandle}
        className="mt-4 px-4 py-2 bg-yellow-500 rounded"
      >
        Light Candle
      </button>

      <form onSubmit={submitPrayer} className="mt-6">
        <textarea
          value={prayerText}
          onChange={(e) => setPrayerText(e.target.value)}
          className="w-full p-3 rounded text-black"
          placeholder="Write your prayer..."
        />
        <button className="mt-2 px-4 py-2 bg-blue-500 rounded">
          Offer Prayer
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {prayers.map((p) => (
          <div key={p.id} className="bg-white/10 p-3 rounded">
            {p.prayer_text}
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/select-altar')}
        className="mt-6 underline"
      >
        Back
      </button>
    </main>
  );
}