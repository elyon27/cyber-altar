// ==============================
// File: components/cyber-altar/types.ts
// ==============================
export type UserRecord = {
  id?: string;
  nickname: string;
  email?: string | null;
  prayer?: string | null;
  altarImage?: string | null;
  candleLitAt?: string | null;
  candleExpireAt?: string | null;
  totalLights: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Screen = 'menu' | 'signup' | 'signin' | 'altarForm' | 'holyPlace';
