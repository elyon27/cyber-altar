"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PrayerCard from "@/components/prayer-card";
import SubmitPrayer from "@/components/submit-prayer";

type Prayer = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

export default function AltarPage() {
  const searchParams = useSearchParams();
  const pilgrimName = searchParams.get("name") || "Pilgrim";

  const [prayers, setPrayers] = useState<Prayer[]>([]);

  useEffect(() => {
    async function loadPrayers() {
      const res = await fetch("/api/prayers");
      const data = await res.json();
      setPrayers(data);
    }

    loadPrayers();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-white/50">
            Holy Place
          </p>
          <h1 className="text-3xl font-bold">Welcome, {pilgrimName}</h1>
          <p className="mt-3 text-white/70">
            You have entered the prayer wall. Offer your prayer, reflection, or
            petition upon the altar.
          </p>
        </div>

        <div className="mb-8">
          <SubmitPrayer
            defaultName={pilgrimName}
            onPrayerAdded={(newPrayer) =>
              setPrayers((current) => [newPrayer, ...current])
            }
          />
        </div>

        <section className="space-y-4">
          {prayers.map((prayer) => (
            <PrayerCard key={prayer.id} {...prayer} />
          ))}
        </section>
      </section>
    </main>
  );
}