type Props = {
  params: {
    slug: string;
  };
};

export default async function HolyPlacePage({ params }: Props) {
  const { slug } = params;

  return (
    <div>
      <h1>Holy Place</h1>
      <p>Welcome pilgrim: {slug}</p>
    </div>
  );
}