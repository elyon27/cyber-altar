type Props = {
  params: {
    slug: string;
  };
  searchParams: {
    altarImage?: string;
    prayer?: string;
  };
};

export default function HolyPlacePage({ params, searchParams }: Props) {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-bold mb-6">
          The Holy Place
        </h1>

        <p className="mb-4">
          Pilgrim: {params.slug}
        </p>

        {searchParams.altarImage && (
          <img
            src={searchParams.altarImage}
            alt="Altar"
            className="mb-6 w-full max-w-xl rounded-xl border border-white/20"
          />
        )}

        <div className="bg-neutral-900 border border-white/20 rounded-xl p-6 whitespace-pre-wrap">
          {searchParams.prayer}
        </div>

      </div>
    </main>
  );
}