import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prayer Wall",
  description: "The Holy Place where prayers are lifted."
}

export default function PrayerWallPage() {
  return (
    <div>
      <h1>Prayer Wall</h1>
    </div>
  )
}


export default async function HolyPlacePage({ params }: Props) {
  const { slug } = params;

  return (
    <div>
      <h1>Holy Place</h1>
      <p>Welcome pilgrim: {slug}</p>
    </div>
  );
}