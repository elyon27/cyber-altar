-- Run AFTER prayer-visibility-setup.sql, before deploying this package.
-- Existing altar candle totals are preserved; old candles cannot be assigned to a prayer.
begin;
alter table public.altar_prayers
  add column if not exists candle_count integer not null default 0 check (candle_count >= 0);
grant update (candle_count) on public.altar_prayers to authenticated;

-- Both increments commit together; SQL increments avoid lost concurrent clicks.
-- RLS and verified email ownership remain enforced (no SECURITY DEFINER).
create or replace function public.light_prayer_candle(p_prayer_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_prayer public.altar_prayers%rowtype;
  v_profile public.altar_profiles%rowtype;
  v_profile_id uuid;
  v_email text := lower(auth.jwt()->>'email');
begin
  if auth.uid() is null or nullif(v_email, '') is null then
    raise exception 'Verify your email before lighting a candle';
  end if;
  select profile_id into v_profile_id from public.altar_prayers
    where id = p_prayer_id and owner_email = v_email;
  if v_profile_id is null then raise exception 'Prayer not found or not owned by you'; end if;

  -- Lock the profile first, matching delete_owned_altar lock order.
  select * into v_profile from public.altar_profiles
    where id = v_profile_id and lower(trim(email)) = v_email for update;
  if not found then raise exception 'Altar not found or not owned by you'; end if;

  update public.altar_prayers set candle_count = coalesce(candle_count, 0) + 1
    where id = p_prayer_id and profile_id = v_profile.id
      and altar_slug = v_profile.altar_slug and owner_email = v_email
    returning * into v_prayer;
  if not found then raise exception 'Prayer not found or not owned by you'; end if;

  update public.altar_profiles set candle_count = coalesce(candle_count, 0) + 1
    where id = v_profile.id and lower(trim(email)) = v_email
    returning * into v_profile;
  if not found then raise exception 'Altar candle total could not be updated'; end if;
  return jsonb_build_object('prayer', to_jsonb(v_prayer), 'profile', to_jsonb(v_profile));
end $$;
revoke all on function public.light_prayer_candle(uuid) from public, anon;
grant execute on function public.light_prayer_candle(uuid) to authenticated;
commit;
