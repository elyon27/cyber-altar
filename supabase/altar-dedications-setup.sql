begin;

create table if not exists public.altar_dedications (
  owner_email text not null default lower(auth.jwt()->>'email'),
  altar_slug text not null check (altar_slug ~ '^al(00[1-9]|0[1-6][0-9]|07[0-2])$'),
  dedicatee text not null check (char_length(trim(dedicatee)) between 1 and 200),
  primary key (owner_email, altar_slug)
);
alter table public.altar_dedications enable row level security;
drop policy if exists dedication_owner on public.altar_dedications;
create policy dedication_owner on public.altar_dedications for all to authenticated
  using (owner_email = lower((select auth.jwt())->>'email'))
  with check (owner_email = lower((select auth.jwt())->>'email'));
revoke all on public.altar_dedications from public, anon, authenticated;
grant select, insert, update on public.altar_dedications to authenticated;

commit;
