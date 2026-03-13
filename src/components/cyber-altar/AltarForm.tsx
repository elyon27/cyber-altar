// ==============================
// File: components/cyber-altar/AltarForm.tsx
// ==============================
'use client';

import Image from 'next/image';
import { AltarImagePicker } from '@/components/cyber-altar/AltarImagePicker';

type AltarFormProps = {
  nickname: string;
  prayer: string;
  selectedAltar: string;
  altarImages: string[];
  error: string;
  loading: boolean;
  setPrayer: (value: string) => void;
  setSelectedAltar: (value: string) => void;
  onProceed: () => void;
  onBack: () => void;
};

export function AltarForm({
  nickname,
  prayer,
  selectedAltar,
  altarImages,
  error,
  loading,
  setPrayer,
  setSelectedAltar,
  onProceed,
  onBack,
}: AltarFormProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6">
        <h2 className="text-2xl font-semibold">Altar Form</h2>
        <p className="mt-2 text-blue-100/80">
          Pilgrim name on the altar: <span className="font-bold text-amber-300">{nickname}</span>
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-sm text-blue-200">Your Prayer</label>
          <textarea
            value={prayer}
            onChange={(e) => setPrayer(e.target.value)}
            placeholder="Write the prayer you wish to lay before the altar..."
            rows={7}
            className="w-full rounded-2xl border border-blue-700 bg-blue-950/70 px-4 py-3 outline-none placeholder:text-blue-300/40"
          />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm text-blue-200">Choose the altar picture</p>
          <AltarImagePicker
            images={altarImages}
            selectedAltar={selectedAltar}
            onSelect={setSelectedAltar}
          />
        </div>

        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onProceed}
            disabled={loading}
            className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Proceed to the Holy Place'}
          </button>
          <button
            onClick={onBack}
            disabled={loading}
            className="rounded-2xl border border-blue-600 px-5 py-3 font-semibold text-blue-100 transition hover:bg-blue-800/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back to Main Menu
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6">
        <h3 className="text-xl font-semibold">Preview</h3>
        <div className="relative mt-5 aspect-[4/5] overflow-hidden rounded-3xl border border-blue-700 bg-blue-950/60">
          <Image src={selectedAltar} alt="Selected altar" fill className="object-cover" />
        </div>
      </div>
    </section>
  );
}