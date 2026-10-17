-- Execute ESTE arquivo uma única vez no SQL Editor do Supabase (idempotente).
-- O papel developer é controlado exclusivamente pelo banco, não pelo navegador.
-- NÃO envie seu e-mail ou ID para o chat; autorize sua conta no SQL Editor depois.

begin;

create table if not exists public.developer_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table public.developer_accounts enable row level security;
revoke all on public.developer_accounts from anon, authenticated;
-- Não criar políticas de escrita para clientes. Só o administrador/SQL Editor gerencia.

create table if not exists public.exercise_access_rules (
  exercise_id text primary key,
  required_exercise_id text,
  is_final boolean not null default false
);
alter table public.exercise_access_rules enable row level security;
revoke all on public.exercise_access_rules from anon, authenticated;

-- Cadeia fiel aos 15 exercícios de problems.js + desafio final.
insert into public.exercise_access_rules (exercise_id, required_exercise_id, is_final) values
('m1_imc', null, false),
('m1_conversor_temp', 'm1_imc', false),
('m1_calculo_desconto', 'm1_conversor_temp', false),
('m2_maioridade', 'm1_calculo_desconto', false),
('m2_par_impar', 'm2_maioridade', false),
('m2_desconto_categoria', 'm2_par_impar', false),
('m3_contagem', 'm2_desconto_categoria', false),
('m3_tabuada', 'm3_contagem', false),
('m3_soma_limite', 'm3_tabuada', false),
('m4_busca_linear', 'm3_soma_limite', false),
('m4_contagem_vogais', 'm4_busca_linear', false),
('m4_status_nota', 'm4_contagem_vogais', false),
('m5_extremos', 'm4_status_nota', false),
('m5_filtrar_nomes', 'm5_extremos', false),
('m5_remover_duplicatas', 'm5_filtrar_nomes', false),
('analisar_turma', null, true)
on conflict (exercise_id) do update set
  required_exercise_id = excluded.required_exercise_id,
  is_final = excluded.is_final;

create or replace function public.is_tutor_developer()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.developer_accounts d where d.user_id = (select auth.uid())
  );
$$;

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

create or replace function public.get_tutor_access()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'role', case when public.is_tutor_developer() then 'developer' else 'student' end,
    'unlocked', coalesce(
      (select jsonb_agg(e.exercise_id order by e.exercise_id)
       from public.exercise_access_rules e
       where public.can_access_exercise(e.exercise_id)),
      '[]'::jsonb
    )
  )
  where (select auth.uid()) is not null;
$$;

revoke all on function public.is_tutor_developer() from public, anon, authenticated;
revoke all on function public.can_access_exercise(text) from public, anon, authenticated;
revoke all on function public.get_tutor_access() from public, anon, authenticated;
grant execute on function public.can_access_exercise(text) to authenticated;
grant execute on function public.get_tutor_access() to authenticated;

-- Quem não está liberado para um exercício não pode inserir ou alterar
-- seu progresso pela API do Supabase, mesmo modificando o frontend.
drop policy if exists "Create own progress" on public.exercise_progress;
create policy "Create own progress" on public.exercise_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.can_access_exercise(exercise_id)));
drop policy if exists "Update own progress" on public.exercise_progress;
create policy "Update own progress" on public.exercise_progress
  for update to authenticated
  using ((select auth.uid()) = user_id and (select public.can_access_exercise(exercise_id)))
  with check ((select auth.uid()) = user_id and (select public.can_access_exercise(exercise_id)));

commit;

-- PASSO SEPARADO, SOMENTE DEPOIS DESTE SCRIPT CONCLUIR:
-- Substitua SEU_EMAIL_AQUI pelo e-mail da SUA conta já cadastrada no Auth.
-- Execute APENAS este INSERT no SQL Editor; nunca no navegador:
--
-- insert into public.developer_accounts(user_id)
-- select id from auth.users where lower(email) = lower('SEU_EMAIL_AQUI')
-- on conflict (user_id) do nothing;
--
-- Confirme que aparece 1 linha:
-- select d.user_id, d.granted_at, u.email
-- from public.developer_accounts d join auth.users u on u.id = d.user_id;
--
-- Para revogar: delete from public.developer_accounts where user_id = 'UUID_DA_CONTA';
