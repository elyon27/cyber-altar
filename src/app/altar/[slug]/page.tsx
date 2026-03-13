import CyberAltarPage from "@/components/cyber-altar/CyberAltarPage";

type PageProps = {
  params: {
    slug: string;
  };
};

export default function AltarPage({ params }: PageProps) {
  return <CyberAltarPage slug={params.slug} />;
}