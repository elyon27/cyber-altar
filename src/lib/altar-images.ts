export type AltarImage = {
  id: string;
  src: string;
  alt: string;
};

export const altarImages: AltarImage[] = Array.from({ length: 72 }, (_, i) => {
  const num = String(i + 1).padStart(3, "0");
  return {
    id: `al${num}`,
    src: `/altar/al${num}.jpg`,
    alt: `Altar image ${num}`,
  };
});