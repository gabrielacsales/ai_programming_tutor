-- Atualização didática do TCC, currículo versão 2.
-- EXECUTE no Supabase SQL Editor ANTES de abrir o novo frontend no navegador.
-- Pré-requisito: supabase/developer-access.sql da branch atual já executado.
-- 1) Preserva os registros da versão anterior numa tabela restrita.
-- 2) Faz somente conclusões da versão 2 liberarem próximos exercícios.
-- Sem excluir registros das tabelas já existentes.

begin;

create table if not exists public.exercise_progress_v1_archive (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  user_code text not null default '',
  user_idea text not null default '',
  completed boolean not null default false,
  metrics jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  archived_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

alter table public.exercise_progress_v1_archive enable row level security;
revoke all on public.exercise_progress_v1_archive from anon, authenticated;
grant select on public.exercise_progress_v1_archive to authenticated;

drop policy if exists "Read own archived curriculum v1 progress" on public.exercise_progress_v1_archive;
create policy "Read own archived curriculum v1 progress"
  on public.exercise_progress_v1_archive for select to authenticated
  using ((select auth.uid()) = user_id);

-- Cópia feita antes que o currículo novo sobrescreva rascunhos antigos.
insert into public.exercise_progress_v1_archive
  (user_id, exercise_id, user_code, user_idea, completed, metrics, updated_at)
select user_id, exercise_id, user_code, user_idea, completed, metrics, updated_at
from public.exercise_progress
where coalesce(metrics ->> 'curriculum_version', '1') <> '2'
on conflict (user_id, exercise_id) do nothing;

-- Estudantes concluem cada exercício da nova versão antes de avançar.
-- Mantém a exceção para desenvolvedora, com autorização exclusivamente no banco.
create or replace function public.can_access_exercise(p_exercise_id text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.exercise_access_rules e
    where e.exercise_id = p_exercise_id and (
      public.is_tutor_developer()
      or (
        not e.is_final and (
          e.required_exercise_id is null or exists (
            select 1 from public.exercise_progress p
            where p.user_id = (select auth.uid())
              and p.exercise_id = e.required_exercise_id
              and p.completed = true
              and p.metrics ->> 'curriculum_version' = '2'
          )
        )
      )
      or (
        e.is_final and (
          select count(distinct p.exercise_id)
          from public.exercise_progress p
          where p.user_id = (select auth.uid())
            and p.completed = true
            and p.metrics ->> 'curriculum_version' = '2'
            and p.exercise_id in (
              'm1_calculo_desconto', 'm2_desconto_categoria',
              'm3_soma_limite', 'm4_status_nota', 'm5_remover_duplicatas'
            )
        ) = 5
      )
    )
  );
$$;

revoke all on function public.can_access_exercise(text) from public, anon, authenticated;
grant execute on function public.can_access_exercise(text) to authenticated;

commit;

-- Conferência opcional (SQL Editor):
-- select exercise_id, completed, updated_at
-- from public.exercise_progress_v1_archive
-- order by updated_at desc limit 20;
