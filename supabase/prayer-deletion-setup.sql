begin;

create or replace function public.delete_owned_prayer(p_prayer_id uuid, p_profile_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_email text := lower(auth.jwt()->>'email');
  v_candle_count integer;
  v_prayer_count integer;
begin
  if auth.uid() is null or nullif(v_email, '') is null then
    raise exception 'Verify your email before deleting a prayer';
  end if;

  -- Match the profile-before-prayer lock order used when lighting candles.
  perform 1 from public.altar_profiles
    where id = p_profile_id and lower(trim(email)) = v_email for update;
  if not found then raise exception 'Altar not found or not owned by you'; end if;

  delete from public.altar_prayers
    where id = p_prayer_id and profile_id = p_profile_id and owner_email = v_email;
  if not found then raise exception 'Prayer not found or not owned by you'; end if;

  select count(*) into v_candle_count
    from public.altar_prayers p cross join unnest(p.candle_lit_at) t
    where p.profile_id = p_profile_id and t > statement_timestamp() - interval '24 hours';
  update public.altar_profiles set candle_count = v_candle_count where id = p_profile_id;

  select count(*) into v_prayer_count from public.altar_prayers
    where profile_id = p_profile_id and owner_email = v_email;
  return jsonb_build_object('candle_count', v_candle_count, 'prayer_count', v_prayer_count);
end $$;

revoke all on function public.delete_owned_prayer(uuid, uuid) from public, anon;
grant execute on function public.delete_owned_prayer(uuid, uuid) to authenticated;

commit;
