-- Run once in the Cyber Altar project's Supabase SQL Editor before deploying.
begin;
create table if not exists public.cyber_altar_pilgrims (
  email text primary key check (email = lower(btrim(email))),
  pilgrim_name text not null check (length(btrim(pilgrim_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_altar_pilgrims enable row level security;
revoke all on public.cyber_altar_pilgrims from anon, authenticated;
grant select, insert, update on public.cyber_altar_pilgrims to service_role;

-- Only the server may call this transaction; no SECURITY DEFINER bypass.
create or replace function public.cyber_altar_onboarding(
  p_email text, p_action text, p_name text default '', p_expected_name text default ''
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  v_email text := lower(btrim(p_email));
  v_name text;
  v_new_name text := btrim(p_name);
begin
  if v_email is null or length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Please enter a valid email address.';
  end if;
  if p_action not in ('lookup', 'register', 'continue', 'rename') then
    raise exception 'Invalid onboarding action.';
  end if;
  -- Serialize simultaneous enrollment/rename requests for the same email.
  perform pg_advisory_xact_lock(hashtextextended(v_email, 0));
  select pilgrim_name into v_name from public.cyber_altar_pilgrims where email = v_email;
  if v_name is null then
    select btrim(username) into v_name from public.altar_profiles
      where lower(btrim(email)) = v_email and nullif(btrim(username), '') is not null
      order by created_at asc, id asc limit 1;
  end if;
  if p_action = 'lookup' then
    return jsonb_build_object('exists', v_name is not null, 'name', coalesce(v_name, ''));
  end if;
  if p_action = 'register' and v_name is not null then
    raise exception 'This email is already enrolled. Check the email again.';
  end if;
  if p_action in ('continue', 'rename') and (v_name is null or v_name <> p_expected_name) then
    raise exception 'The saved name changed. Check the email again.';
  end if;
  if p_action = 'continue' then v_new_name := v_name; end if;
  if v_new_name is null or length(v_new_name) not between 1 and 80 then
    raise exception 'Please enter a Pilgrim Name of 1 to 80 characters.';
  end if;
  -- Existing history routes still use names, so do not merge different pilgrims.
  if p_action in ('register', 'rename') then
    perform pg_advisory_xact_lock(hashtextextended('pilgrim-name:' || lower(v_new_name), 0));
    if exists(select 1 from public.cyber_altar_pilgrims where lower(pilgrim_name) = lower(v_new_name) and email <> v_email)
       or exists(select 1 from public.altar_profiles where lower(btrim(username)) = lower(v_new_name) and lower(btrim(coalesce(email, ''))) <> v_email) then
      raise exception 'This Pilgrim Name is already in use. Please choose another.';
    end if;
  end if;
  insert into public.cyber_altar_pilgrims(email, pilgrim_name) values(v_email, v_new_name)
    on conflict(email) do update set pilgrim_name = excluded.pilgrim_name, updated_at = now();
  update public.altar_prayers pr set username = v_new_name
    from public.altar_profiles ap
    where pr.profile_id = ap.id and lower(btrim(ap.email)) = v_email and pr.username is distinct from v_new_name;
  update public.altar_profiles set username = v_new_name
    where lower(btrim(email)) = v_email and username is distinct from v_new_name;
  return jsonb_build_object('exists', true, 'name', v_new_name);
end;
$$;
revoke all on function public.cyber_altar_onboarding(text,text,text,text) from public, anon, authenticated;
grant execute on function public.cyber_altar_onboarding(text,text,text,text) to service_role;
commit;
