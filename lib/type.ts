export type Profile = {
  id: string;
  email: string;
  display_name: string;
  altar_slug: string;
  created_at: string;
};

export type Altar = {
  id: string;
  user_id: string;
  slug: string;
  altar_name: string;
  theme: string;
  created_at: string;
};

export type Prayer = {
  id: string;
  altar_id: string;
  user_id: string;
  title: string;
  body: string;
  candle_count: number;
  is_private: boolean;
  created_at: string;
};