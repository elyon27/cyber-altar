// ==============================
// File: components/cyber-altar/AltarImagePicker.tsx
// ==============================
'use client';

import Image from 'next/image';

type AltarImagePickerProps = {
  images: string[];
  selectedAltar: string;
  onSelect: (imagePath: string) => void;
};

export function AltarImagePicker({ images, selectedAltar, onSelect }: AltarImagePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {images.map((imagePath) => {
        const active = selectedAltar === imagePath;
        return (
          <button
            key={imagePath}
            type="button"
            onClick={() => onSelect(imagePath)}
            className={`overflow-hidden rounded-2xl border transition ${
              active
                ? 'border-amber-400 ring-2 ring-amber-300/70'
                : 'border-blue-700 hover:border-blue-400'
            }`}
          >
            <div className="relative h-32 w-full bg-blue-950/60">
              <Image src={imagePath} alt="Altar option" fill className="object-cover" />
            </div>
          </button>
        );
      })}
    </div>
  );
}