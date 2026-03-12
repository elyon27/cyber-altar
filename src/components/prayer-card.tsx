type PrayerCardProps = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

export default function PrayerCard({
  name,
  message,
  createdAt,
}: PrayerCardProps) {
  const formattedDate = new Date(createdAt).toLocaleString();

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-white">
          {name || "Anonymous"}
        </h3>
        <span className="text-xs text-white/50">{formattedDate}</span>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
        {message}
      </p>
    </article>
  );
}