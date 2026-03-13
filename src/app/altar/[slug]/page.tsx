import CyberAltarPage from "@/components/cyber-altar/CyberAltarPage";

type PageParams = {
  slug: string;
};

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  return <CyberAltarPage slug={slug} />;
}