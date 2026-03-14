'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HolyPlace from '@/components/cyber-altar/HolyPlace';

export default function HolyPlacePage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [selectedAltar, setSelectedAltar] = useState('al001');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem('cyber_altar_username') || 'Pilgrim';

    const storedAltar =
      localStorage.getItem('cyber_altar_selected_altar') || 'al001';

    setUsername(storedUser);
    setSelectedAltar(storedAltar);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading the Holy Place...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-black">
      <HolyPlace
        username={username}
        selectedAltar={selectedAltar}
        onBackToAltarSelection={() => router.push('/select-altar')}
        onExit={() => router.push('/')}
      />
    </main>
  );
}