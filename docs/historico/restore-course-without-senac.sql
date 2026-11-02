-- Restaura o desbloqueio original do currículo 2, sem depender do Senac.
-- OPCIONAL: só execute no Supabase SQL Editor se uma migração anterior
-- já tiver substituído can_access_exercise() e os exercícios continuarem bloqueados.
-- Não apaga inscrições, respostas, progresso ou dados de pesquisa.
-- Pré-requisito: supabase/developer-access.sql aplicado (tabelas/roles existentes).

begin;

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
              'm3_tabuada', 'm4_status_nota', 'm5_remover_duplicatas'
            )
        ) = 5
      )
    )
  );
$$;

revoke all on function public.can_access_exercise(text) from public, anon, authenticated;
grant execute on function public.can_access_exercise(text) to authenticated;

commit;
notify pgrst, 'reload schema';
