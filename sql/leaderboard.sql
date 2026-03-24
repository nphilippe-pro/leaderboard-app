create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  pseudo text not null unique,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  constraint pseudo_format_check check (pseudo ~ '^[A-Za-z0-9_-]{3,24}$')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_pseudo text;
begin
  requested_pseudo := trim(coalesce(new.raw_user_meta_data ->> 'pseudo', ''));
  if requested_pseudo = '' then raise exception 'Pseudo requis'; end if;
  if requested_pseudo !~ '^[A-Za-z0-9_-]{3,24}$' then raise exception 'Pseudo invalide'; end if;

  insert into public.profiles (id, email, pseudo)
  values (new.id, new.email, requested_pseudo);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.prevent_pseudo_change()
returns trigger
language plpgsql
as $$
begin
  if new.pseudo is distinct from old.pseudo then
    raise exception 'Le pseudo ne peut pas être modifié';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_pseudo_change on public.profiles;
create trigger trg_prevent_pseudo_change
before update on public.profiles
for each row execute procedure public.prevent_pseudo_change();

create or replace view public.leaderboard_public as
select pseudo, score
from public.profiles
where pseudo is not null;

alter table public.profiles enable row level security;

drop policy if exists "public can read leaderboard fields" on public.profiles;
create policy "public can read leaderboard fields"
on public.profiles
for select
using (true);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "users can update own profile except pseudo guarded by trigger" on public.profiles;
create policy "users can update own profile except pseudo guarded by trigger"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "no client insert on profiles" on public.profiles;
create policy "no client insert on profiles"
on public.profiles
for insert
with check (false);
