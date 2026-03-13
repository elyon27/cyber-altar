import PrayerClient from "@/components/cyber-altar/PrayerClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ altarImage?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { altarImage } = await searchParams;

  return (
    <PrayerClient
      nickname={slug}
      altarImage={altarImage || "/altar/altar1.jpg"}
    />
  );
}