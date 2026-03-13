import type { PageProps } from "next";

type Params = {
  slug: string;
};

export default async function AltarPage({ params }: PageProps<Params>) {
  const { slug } = await params;

  return (
    <div>
      <h1>Cyber Altar</h1>
      <p>Pilgrim: {slug}</p>
    </div>
  );
}