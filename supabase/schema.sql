create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text not null,
  altar_slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists altars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  slug text unique not null,
  altar_name text not null,
  theme text not null default 'lamb-light',
  created_at timestamptz not null default now()
);

create table if not exists prayers (
  id uuid primary key default gen_random_uuid(),
  altar_id uuid not null references altars(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  candle_count int not null default 6 check (candle_count between 2 and 12),
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table altars enable row level security;
alter table prayers enable row level security;

create policy "Users can read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "Users can read own altar"
on altars for select
using (auth.uid() = user_id);

create policy "Users can insert own altar"
on altars for insert
with check (auth.uid() = user_id);

create policy "Users can update own altar"
on altars for update
using (auth.uid() = user_id);

create policy "Users can read own prayers"
on prayers for select
using (auth.uid() = user_id);

create policy "Users can insert own prayers"
on prayers for insert
with check (auth.uid() = user_id);

create policy "Users can update own prayers"
on prayers for update
using (auth.uid() = user_id);

create index if not exists idx_altars_user_id on altars(user_id);
create index if not exists idx_prayers_altar_id on prayers(altar_id);
create index if not exists idx_prayers_user_id on prayers(user_id);