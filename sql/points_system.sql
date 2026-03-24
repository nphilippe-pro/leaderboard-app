
-- Système de points cumulatifs pour les parties quotidiennes
-- Le score total du classement reste cumulatif et n'est jamais remis à zéro.

create extension if not exists pgcrypto;

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_key text not null,
  play_date date not null default (timezone('Europe/Paris', now())::date),
  attempts integer not null check (attempts >= 1),
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, game_key, play_date)
);

create or replace function public.points_from_attempts(p_attempts integer)
returns integer
language sql
immutable
as $$
  select case
    when p_attempts between 1 and 3 then 100
    when p_attempts = 4 then 90
    when p_attempts = 5 then 80
    when p_attempts = 6 then 70
    when p_attempts = 7 then 60
    when p_attempts = 8 then 50
    when p_attempts = 9 then 40
    when p_attempts = 10 then 30
    when p_attempts = 11 then 20
    when p_attempts = 12 then 10
    when p_attempts = 13 then 5
    when p_attempts = 14 then 3
    when p_attempts = 15 then 2
    when p_attempts = 16 then 1
    else 0
  end;
$$;

create or replace function public.submit_game_points(
  p_user_id uuid,
  p_game_key text,
  p_attempts integer
)
returns table (
  accepted boolean,
  already_played boolean,
  points_awarded integer,
  attempts integer,
  total_score integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_play_date date := timezone('Europe/Paris', now())::date;
  v_points integer := public.points_from_attempts(p_attempts);
  v_inserted_id uuid;
  v_total integer;
begin
  if p_attempts < 1 then
    raise exception 'attempts must be >= 1';
  end if;

  insert into public.game_results (user_id, game_key, play_date, attempts, points_awarded)
  values (p_user_id, p_game_key, v_play_date, p_attempts, v_points)
  on conflict (user_id, game_key, play_date) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    select p.score
      into v_total
    from public.profiles p
    where p.id = p_user_id;

    return query
    select
      false as accepted,
      true as already_played,
      gr.points_awarded,
      gr.attempts,
      coalesce(v_total, 0) as total_score
    from public.game_results gr
    where gr.user_id = p_user_id
      and gr.game_key = p_game_key
      and gr.play_date = v_play_date;
    return;
  end if;

  update public.profiles
  set score = score + v_points
  where id = p_user_id
  returning score into v_total;

  return query
  select
    true as accepted,
    false as already_played,
    v_points as points_awarded,
    p_attempts as attempts,
    coalesce(v_total, 0) as total_score;
end;
$$;

grant execute on function public.submit_game_points(uuid, text, integer) to anon, authenticated, service_role;
grant execute on function public.points_from_attempts(integer) to anon, authenticated, service_role;
