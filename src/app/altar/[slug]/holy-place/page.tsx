type Props = {
  params: Promise<{ slug: string }>;
};

export default async function HolyPlacePage({ params }: Props) {
  const { slug } = await params;

  return (
    <div>
      <h1>The Holy Place</h1>
      <p>Welcome Pilgrim: {slug}</p>
    </div>
  );
}