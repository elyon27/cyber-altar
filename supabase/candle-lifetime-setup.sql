-- Each candle burns for 24 elapsed hours. Legacy candle lighting times were
-- not recorded: give existing counted candles a fresh lifetime at migration.
begin;
alter table public.altar_prayers
  add column candle_lit_at timestamptz[] not null default '{}';
update public.altar_prayers
set candle_lit_at = array_fill(statement_timestamp(), array[candle_count])
where candle_count > 0;
grant update (candle_lit_at) on public.altar_prayers to authenticated;

create or replace function public.light_prayer_candle(p_prayer_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_prayer public.altar_prayers%rowtype;
  v_profile public.altar_profiles%rowtype;
  v_profile_id uuid;
  v_email text := lower(auth.jwt()->>'email');
  v_now timestamptz := statement_timestamp();
begin
  if auth.uid() is null or nullif(v_email, '') is null then
    raise exception 'Verify your email before lighting a candle';
  end if;
  select profile_id into v_profile_id from public.altar_prayers
    where id = p_prayer_id and owner_email = v_email;
  if v_profile_id is null then raise exception 'Prayer not found or not owned by you'; end if;
  select * into v_profile from public.altar_profiles
    where id = v_profile_id and lower(trim(email)) = v_email for update;
  if not found then raise exception 'Altar not found or not owned by you'; end if;

  update public.altar_prayers p set
    candle_lit_at = array_append(array(select t from unnest(p.candle_lit_at) t
      where t > v_now - interval '24 hours'), v_now),
    candle_count = 1 + (select count(*) from unnest(p.candle_lit_at) t
      where t > v_now - interval '24 hours')
    where p.id = p_prayer_id and p.profile_id = v_profile.id
      and p.altar_slug = v_profile.altar_slug and p.owner_email = v_email
    returning * into v_prayer;
  if not found then raise exception 'Prayer not found or not owned by you'; end if;

  update public.altar_profiles set candle_count = (
    select count(*) from public.altar_prayers p, unnest(p.candle_lit_at) t
    where p.profile_id = v_profile.id and t > v_now - interval '24 hours'
  ) where id = v_profile.id returning * into v_profile;
  return jsonb_build_object('prayer', to_jsonb(v_prayer), 'profile', to_jsonb(v_profile));
end $$;
revoke all on function public.light_prayer_candle(uuid) from public, anon;
grant execute on function public.light_prayer_candle(uuid) to authenticated;

-- Administrator-only maintenance, also runs when all browsers are closed.
create or replace function public.expire_prayer_candles()
returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_profile_id uuid;
  v_now timestamptz := statement_timestamp();
begin
  -- Same profile-before-prayer lock order as lighting and altar deletion.
  for v_profile_id in select id from public.altar_profiles order by id loop
    perform 1 from public.altar_profiles where id = v_profile_id for update;
    update public.altar_prayers p set
      candle_lit_at = array(select t from unnest(p.candle_lit_at) t
        where t > v_now - interval '24 hours'),
      candle_count = (select count(*) from unnest(p.candle_lit_at) t
        where t > v_now - interval '24 hours')
    where p.profile_id = v_profile_id and
      (exists(select 1 from unnest(p.candle_lit_at) t where t <= v_now - interval '24 hours')
       or p.candle_count <> cardinality(p.candle_lit_at));
    update public.altar_profiles a set candle_count = (
      select coalesce(sum(p.candle_count),0) from public.altar_prayers p where p.profile_id = a.id
    ) where a.id = v_profile_id and a.candle_count is distinct from (
      select coalesce(sum(p.candle_count),0) from public.altar_prayers p where p.profile_id = a.id
    );
  end loop;
  update public.altar_prayers p set
    candle_lit_at = array(select t from unnest(p.candle_lit_at) t where t > v_now - interval '24 hours'),
    candle_count = (select count(*) from unnest(p.candle_lit_at) t where t > v_now - interval '24 hours')
  where p.profile_id is null and exists (
    select 1 from unnest(p.candle_lit_at) t where t <= v_now - interval '24 hours');
end $$;
revoke all on function public.expire_prayer_candles() from public, anon, authenticated;
select public.expire_prayer_candles();
create extension if not exists pg_cron;
select cron.schedule('cyber-altar-expire-candles', '30 seconds', 'select public.expire_prayer_candles()');
commit;
