type PageProps = {
  params: {
    slug: string;
  };
};

export default function AltarPage({ params }: PageProps) {
  const { slug } = params;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Holy Place</h1>
      <p>Altar: {slug}</p>
    </div>
  );
}
