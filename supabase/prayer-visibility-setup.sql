-- Run once in the Cyber-Altar project's SQL Editor before deploying the matching package.
-- Review a backup first. No prayer text is deleted. Existing prayers remain public.
begin;

alter table public.altar_prayers add column if not exists is_public boolean not null default true;
alter table public.altar_prayers alter column is_public set default false;
alter table public.altar_prayers add column if not exists owner_email text;

-- Snapshot historical ownership; later changes to a profile cannot transfer a prayer.
update public.altar_prayers q set owner_email = lower(trim(p.email))
from public.altar_profiles p
where q.profile_id = p.id and q.owner_email is null and nullif(trim(p.email), '') is not null;

create or replace function public.guard_prayer_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    if auth.uid() is null or nullif(auth.jwt()->>'email', '') is null then
      raise exception 'Verify your email before offering a prayer';
    end if;
    new.owner_email := lower(auth.jwt()->>'email');
  elsif TG_OP = 'UPDATE' then
    if new.owner_email is distinct from old.owner_email or new.profile_id is distinct from old.profile_id then
      raise exception 'Prayer ownership cannot be changed';
    end if;
  elsif TG_OP = 'DELETE' then
    -- Also protects prayers against an unauthenticated profile deletion with FK cascade.
    if (auth.jwt()->>'role') is distinct from 'service_role' and
      (auth.uid() is null or old.owner_email is distinct from lower(auth.jwt()->>'email')) then
      raise exception 'Only the verified owner can delete a prayer';
    end if;
    return old;
  end if;
  return new;
end $$;
drop trigger if exists guard_prayer_owner on public.altar_prayers;
create trigger guard_prayer_owner before insert or update or delete on public.altar_prayers
for each row execute function public.guard_prayer_owner();

alter table public.altar_prayers enable row level security;
-- Replace permissive legacy policies so they cannot expose secret prayers.
do $$ declare item record; begin
  for item in select policyname from pg_policies where schemaname = 'public' and tablename = 'altar_prayers'
  loop execute format('drop policy %I on public.altar_prayers', item.policyname); end loop;
end $$;
create policy prayer_read on public.altar_prayers for select to anon, authenticated
using (is_public or (auth.uid() is not null and owner_email = lower(auth.jwt()->>'email')));
create policy prayer_insert on public.altar_prayers for insert to authenticated
with check (auth.uid() is not null and owner_email = lower(auth.jwt()->>'email') and exists (
  select 1 from public.altar_profiles p where p.id = profile_id and lower(trim(p.email)) = lower(auth.jwt()->>'email')
));
create policy prayer_update on public.altar_prayers for update to authenticated
using (auth.uid() is not null and owner_email = lower(auth.jwt()->>'email'))
with check (auth.uid() is not null and owner_email = lower(auth.jwt()->>'email'));
create policy prayer_delete on public.altar_prayers for delete to authenticated
using (auth.uid() is not null and owner_email = lower(auth.jwt()->>'email'));

revoke all on public.altar_prayers from public, anon, authenticated;
grant select on public.altar_prayers to anon, authenticated;
grant insert, delete on public.altar_prayers to authenticated;
grant update (is_public) on public.altar_prayers to authenticated;
-- Delete prayers and their owned profile together, even when no FK cascade exists.
create or replace function public.delete_owned_altar(p_username text, p_slug text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_profile uuid;
begin
  if auth.uid() is null then raise exception 'Verify your email first'; end if;
  select id into v_profile from public.altar_profiles
    where username = p_username and altar_slug = p_slug
      and lower(trim(email)) = lower(auth.jwt()->>'email') for update;
  if v_profile is null then return false; end if;
  delete from public.altar_prayers where profile_id = v_profile;
  delete from public.altar_profiles where id = v_profile;
  return true;
end $$;
revoke all on function public.delete_owned_altar(text,text) from public, anon;
grant execute on function public.delete_owned_altar(text,text) to authenticated;

-- Historical prayers missing an email require manual ownership reconciliation; do not auto-claim by name.
commit;
