"use client";

<h2 className="text-red-400 text-3xl">NEW FORM TEST</h2>
import { useState } from "react";
import { useRouter } from "next/navigation";
import { altarImages } from "@/lib/altar-images";

type Props = {
  slug: string;
  nickname: string;
};

export default function AltarSelectionForm({ slug, nickname }: Props) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string>("");

  function handleProceed() {
    if (!selectedImage) {
      alert("Please choose an altar picture first.");
      return;
    }

    const params = new URLSearchParams({
      altarImage: selectedImage,
    });

    router.push(`/altar/${slug}/prayer?${params.toString()}`);
  }

  return (
    <section className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-white">Choose Your Altar</h2>

        <p className="mt-2 text-sm text-white/70">
          Pilgrim: <span className="font-medium text-yellow-300">{nickname}</span>
        </p>

        <p className="mt-1 text-sm text-white/60">
          Select one altar picture before proceeding to the prayer form.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* LEFT SIDE — ALTAR OPTIONS */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white/80">
            Choose the altar picture
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {altarImages.map((image) => {
              const isSelected = selectedImage === image.src;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image.src)}
                  className={`overflow-hidden rounded-xl border transition ${
                    isSelected
                      ? "border-yellow-400 ring-2 ring-yellow-300"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="aspect-square bg-black/20">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="bg-black/40 px-2 py-2 text-center text-xs text-white">
                    Altar {image.id}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE — PREVIEW */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white/80">
            Preview
          </h3>

          <div className="flex h-[320px] items-center justify-center rounded-xl border border-white/10 bg-black/30">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected altar"
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="text-sm text-white/50">
                Select an altar image to preview it here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PROCEED BUTTON */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={handleProceed}
          className="rounded-full bg-yellow-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-yellow-400"
        >
          Proceed to Prayer Form
        </button>
      </div>
    </section>
  );
}