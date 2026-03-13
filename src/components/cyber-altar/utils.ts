// ==============================
// File: components/cyber-altar/utils.ts
// ==============================
export function normalizeNickname(value: string) {
  return value.trim().toLowerCase();
}

export function formatRemaining(ms: number) {
  if (ms <= 0) return '0h 0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function mapProfileRow(row: any) {
  return {
    id: row.id,
    nickname: row.nickname,
    email: row.email,
    prayer: row.prayer,
    altarImage: row.altar_image,
    candleLitAt: row.candle_lit_at,
    candleExpireAt: row.candle_expire_at,
    totalLights: row.total_lights ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}