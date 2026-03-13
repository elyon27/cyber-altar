type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AltarPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>The Holy Place</h1>
      <p>Altar: {slug}</p>
    </div>
  );
}
