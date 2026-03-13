type Prayer = {
  nickname: string;
  prayer: string;
  altar: string;
};

export default function PrayerCard({ nickname, prayer }: Prayer) {
  return (
    <div className="rounded-2xl border border-blue-700 bg-blue-950/60 p-4 shadow-md">
      <p className="text-blue-200 text-sm mb-2">Pilgrim:</p>

      <h3 className="text-lg font-semibold text-white mb-3">
        {nickname}
      </h3>

      <p className="text-blue-100 text-sm leading-relaxed">
        {prayer}
      </p>
    </div>
  );
}