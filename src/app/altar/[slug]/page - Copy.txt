import AltarSelectionForm from "@/components/cyber-altar/Altar-Selection-Form";

type Props = {
  params: {
    slug: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <main className="min-h-screen bg-blue-950 px-4 py-10">
      <AltarSelectionForm slug={params.slug} nickname={params.slug} />
    </main>
  );
}