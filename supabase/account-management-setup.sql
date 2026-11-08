-- Auth deletion and personal-data deletion succeed or roll back together.
create or replace function public.cyber_altar_cleanup_deleted_account()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(btrim(old.email));
  v_names text[];
begin
  perform pg_advisory_xact_lock(hashtextextended(v_email, 0));
  select array_agg(distinct n) into v_names from (
    select pilgrim_name as n from public.cyber_altar_pilgrims where lower(btrim(email)) = v_email
    union select username from public.altar_profiles where lower(btrim(email)) = v_email
    union select username from public.altar_prayers where lower(btrim(owner_email)) = v_email
    union select old.raw_user_meta_data ->> 'cyber_altar_pilgrim_name'
    union select nickname from public.holy_place_records where lower(btrim(email)) = v_email
  ) names where n is not null;
  -- Name-only legacy records are included only when no other account owns that name.
  select array_agg(n) into v_names from unnest(v_names) n
    where not exists(select 1 from public.cyber_altar_pilgrims p where p.pilgrim_name = n and p.email <> v_email)
      and not exists(select 1 from public.altar_profiles p where p.username = n and nullif(lower(btrim(p.email)), '') <> v_email)
      and not exists(select 1 from public.altar_prayers p where p.username = n and nullif(lower(btrim(p.owner_email)), '') <> v_email);
  delete from public.prayer_inner_reflections where owner_id = old.id;
  delete from public.altar_prayers where lower(btrim(owner_email)) = v_email
    or profile_id in (select id from public.altar_profiles where lower(btrim(email)) = v_email)
    or (username = any(v_names) and nullif(btrim(owner_email), '') is null
      and (profile_id is null or profile_id in (select id from public.altar_profiles where nullif(btrim(email), '') is null)));
  delete from public.altar_dedications where lower(btrim(owner_email)) = v_email;
  delete from public.altar_candles where username = any(v_names);
  delete from public.altar_history where username = any(v_names);
  delete from public.cyber_altar_candles where pilgrim_name = any(v_names);
  delete from public.cyber_altar_prayers where pilgrim_name = any(v_names);
  delete from public.holy_place_records where lower(btrim(email)) = v_email;
  delete from public.altar_profiles where lower(btrim(email)) = v_email
    or (username = any(v_names) and nullif(btrim(email), '') is null);
  delete from public.cyber_altar_pilgrims where lower(btrim(email)) = v_email;
  return old;
end;
$$;
-- Privilege elevation is restricted to the Auth trigger, with no caller-selected identity.
revoke all on function public.cyber_altar_cleanup_deleted_account() from public, anon, authenticated, service_role;
drop trigger if exists cyber_altar_delete_account_data on auth.users;
create trigger cyber_altar_delete_account_data before delete on auth.users
for each row execute function public.cyber_altar_cleanup_deleted_account();

-- Keep legacy name-based records aligned when the verified account is renamed.
create or replace function public.cyber_altar_sync_pilgrim_name()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.pilgrim_name is not distinct from new.pilgrim_name then return new; end if;
  if exists(select 1 from public.cyber_altar_pilgrims where pilgrim_name = old.pilgrim_name and email <> old.email)
    or exists(select 1 from public.altar_profiles where username = old.pilgrim_name and lower(btrim(coalesce(email,''))) <> old.email) then
    raise exception 'This legacy name is shared. Please contact support before renaming.';
  end if;
  update public.altar_history set username = new.pilgrim_name where username = old.pilgrim_name;
  update public.altar_candles set username = new.pilgrim_name where username = old.pilgrim_name;
  update public.cyber_altar_prayers set pilgrim_name = new.pilgrim_name where pilgrim_name = old.pilgrim_name;
  update public.cyber_altar_candles set pilgrim_name = new.pilgrim_name where pilgrim_name = old.pilgrim_name;
  update public.holy_place_records set nickname = new.pilgrim_name where lower(btrim(email)) = old.email;
  return new;
end;
$$;
revoke all on function public.cyber_altar_sync_pilgrim_name() from public, anon, authenticated, service_role;
drop trigger if exists cyber_altar_sync_name on public.cyber_altar_pilgrims;
create trigger cyber_altar_sync_name after update of pilgrim_name on public.cyber_altar_pilgrims
for each row execute function public.cyber_altar_sync_pilgrim_name();
