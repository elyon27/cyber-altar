'use client';

import { useEffect, useState } from 'react';
import AltarSelectionForm from '@/components/cyber-altar/AltarSelectionForm';

type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

export default function SelectAltarPage() {
  const [username, setUsername] = useState('Pilgrim');
  const [previousAltars, setPreviousAltars] = useState<PreviousAltarItem[]>([]);

  useEffect(() => {
    const savedUsername = localStorage.getItem('cyber_altar_username') || 'Pilgrim';
    setUsername(savedUsername);

    const savedAltarsRaw = localStorage.getItem(`cyber_altar_history_${savedUsername}`);

    if (savedAltarsRaw) {
      try {
        const parsed = JSON.parse(savedAltarsRaw);
        if (Array.isArray(parsed)) {
          setPreviousAltars(parsed);
        }
      } catch (error) {
        console.error('Failed to parse altar history from localStorage:', error);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-black">
      <AltarSelectionForm
        username={username}
        previousAltars={previousAltars}
      />
    </main>
  );
}