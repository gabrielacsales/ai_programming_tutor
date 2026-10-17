-- AI Programming Tutor: execute uma única vez no SQL Editor do Supabase.
-- A autenticação de e-mail/senha é gerenciada pelo Supabase Auth.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  user_code text not null default '',
  user_idea text not null default '',
  completed boolean not null default false,
  metrics jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_exercise_date
  on public.chat_messages (user_id, exercise_id, created_at);

-- Defense in depth: permissões SQL e políticas RLS por usuário.
alter table public.profiles enable row level security;
alter table public.exercise_progress enable row level security;
alter table public.chat_messages enable row level security;

revoke all on public.profiles, public.exercise_progress, public.chat_messages from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.exercise_progress to authenticated;
grant select, insert on public.chat_messages to authenticated;
grant usage, select on sequence public.chat_messages_id_seq to authenticated;

create policy "Profile belongs to signed-in user" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "User updates own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Read own progress" on public.exercise_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own progress" on public.exercise_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.exercise_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Read own chat" on public.chat_messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Write own chat" on public.chat_messages
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Cria perfil automaticamente após cadastro. Não armazene senha nessa tabela.
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_tutor on auth.users;
create trigger on_auth_user_created_tutor
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();
