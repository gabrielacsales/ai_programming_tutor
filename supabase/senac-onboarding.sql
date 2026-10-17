-- Migração de onboarding Senac (executar DEPOIS de research-study.sql,
-- developer-access.sql e curriculum-v2.sql). NÃO execute schema.sql novamente.
-- Consentimento para PESQUISA não é condição para o uso educacional.
begin;

create table if not exists public.course_onboarding (
 user_id uuid primary key references auth.users(id) on delete cascade,
 affiliation text not null check (affiliation in ('senac','other')),
 chosen_at timestamptz not null default now(),
 diagnostic_completed_at timestamptz,
 diagnostic_instrument text,
 -- Não armazenar respostas de diagnóstico sem consentimento para pesquisa.
 constraint only_senac_needs_diagnostic check (
  affiliation='senac' or diagnostic_completed_at is null
 )
);
alter table public.course_onboarding enable row level security;
revoke all on public.course_onboarding from anon,authenticated;
grant select on public.course_onboarding to authenticated;
drop policy if exists "Read own course onboarding" on public.course_onboarding;
create policy "Read own course onboarding" on public.course_onboarding
 for select to authenticated using (user_id=(select auth.uid()));

create or replace function public.senac_my_onboarding()
returns jsonb language sql stable security definer set search_path=''
as $$
select jsonb_build_object(
 'affiliation',(select o.affiliation from public.course_onboarding o where o.user_id=(select auth.uid())),
 'diagnostic_done',coalesce(
   (select o.diagnostic_completed_at is not null from public.course_onboarding o where o.user_id=(select auth.uid())),false),
 'course_ready', exists(
   select 1 from public.course_onboarding o
   where o.user_id=(select auth.uid())
     and (o.affiliation='other' or o.diagnostic_completed_at is not null)
 ),
 'research_pre_recorded', exists(
   select 1 from public.research_assessments a
   where a.user_id=(select auth.uid()) and a.phase='pre'
 )
)
where (select auth.uid()) is not null;
$$;

create or replace function public.senac_set_affiliation(p_is_senac boolean)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_existing text;
begin
 if v_uid is null then raise exception 'Faça login primeiro.'; end if;
 if p_is_senac is null then raise exception 'Escolha Sim ou Não.'; end if;
 select affiliation into v_existing from public.course_onboarding where user_id=v_uid;
 if v_existing is null then
  insert into public.course_onboarding(user_id,affiliation)
    values(v_uid,case when p_is_senac then 'senac' else 'other' end)
    on conflict(user_id) do nothing;
 elsif v_existing<>(case when p_is_senac then 'senac' else 'other' end) then
  raise exception 'A identificação foi registrada. Para corrigir, solicite a revisão da pesquisadora.';
 end if;
 return public.senac_my_onboarding();
end; $$;

create or replace function public.senac_submit_diagnostic(p_answers jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_record public.course_onboarding%rowtype;
begin
 if v_uid is null then raise exception 'Sessão inválida.'; end if;
 select * into v_record from public.course_onboarding where user_id=v_uid for update;
 if not found or v_record.affiliation <> 'senac'
 then raise exception 'O diagnóstico é destinado a alunos do Senac.'; end if;
 if v_record.diagnostic_completed_at is not null
 then raise exception 'Seu diagnóstico inicial já foi concluído.'; end if;
 if jsonb_typeof(p_answers)<>'object'
    or (select count(*) from jsonb_object_keys(p_answers))<>8
    or exists(
      select 1 from jsonb_each_text(p_answers) v
      where v.key not in ('q1','q2','q3','q4','q5','q6','q7','q8')
         or v.value not in ('A','B','C','D','E')
    )
 then raise exception 'Responda às oito questões (pode marcar Não sei).'; end if;

 -- Se a pessoa consentiu ANTES do diagnóstico, registra suas respostas na
 -- tabela da pesquisa de forma atômica com a conclusão do pré-teste.
 if exists(
   select 1 from public.research_participants p
   where p.user_id=v_uid and p.withdrawn_at is null
 ) then
   if not exists(select 1 from public.research_assessments a
                 where a.user_id=v_uid and a.phase='pre') then
     perform public.research_submit_assessment('pre',p_answers);
   end if;
 end if;
 -- Para quem não consentiu, deliberadamente NÃO guardamos respostas individuais.
 update public.course_onboarding
   set diagnostic_completed_at=now(),diagnostic_instrument='tcc-v1'
   where user_id=v_uid and diagnostic_completed_at is null;
 return jsonb_build_object('completed',true,'research_saved',
   exists(select 1 from public.research_assessments a where a.user_id=v_uid and a.phase='pre'));
end; $$;

-- Depois do diagnóstico inicial, um novo consentimento não pode transformar
-- retroativamente um teste educacional já respondido em linha de base de pesquisa.
create or replace function public.enroll_in_research(p_adult boolean, p_consent boolean, p_version text DEFAULT 'tcc-v1')
returns text language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_code text;
begin
 if v_uid is null then raise exception 'Faça login para participar.'; end if;
 if p_adult is distinct from true or p_consent is distinct from true or p_version<>'tcc-v1'
 then raise exception 'Consentimento, versão e confirmação de maioridade obrigatórios.'; end if;
 if exists(select 1 from public.course_onboarding o
   where o.user_id=v_uid and o.diagnostic_completed_at is not null)
   and not exists(select 1 from public.research_participants p
   where p.user_id=v_uid and p.withdrawn_at is null)
 then raise exception 'O diagnóstico inicial já ocorreu; a inclusão retroativa não é possível. Consulte a pesquisadora.'; end if;
 if not exists(select 1 from public.research_study_settings
  where id=1 and enrollment_open=true
   and char_length(trim(institution))>=3
   and char_length(trim(researcher_contact))>=6
   and char_length(trim(retention_text))>=10
   and char_length(trim(consent_text))>=200
   and char_length(trim(protocol_reference))>=3)
 then raise exception 'O período da pesquisa ainda não está aberto ou o termo institucional está incompleto.'; end if;
 if exists(select 1 from public.research_participants
   where user_id=v_uid and withdrawn_at is not null)
 then raise exception 'Participação já retirada. Contate a pesquisadora.'; end if;
 insert into public.research_participants(user_id,adult_confirmed,consent_version)
   values(v_uid,true,p_version) on conflict(user_id) do nothing;
 select participant_code into v_code from public.research_participants
   where user_id=v_uid and withdrawn_at is null;
 return v_code;
end; $$;

-- Liberação da trilha assegurada também no servidor: digitar URL do tutor
-- ou manipular os botões não ignora o diagnóstico do Senac.
create or replace function public.can_access_exercise(p_exercise_id text)
returns boolean language sql stable security definer set search_path=''
as $$
 select (select auth.uid()) is not null
 and exists(
  select 1 from public.course_onboarding o
  where o.user_id=(select auth.uid())
    and (o.affiliation='other' or o.diagnostic_completed_at is not null)
 )
 and exists(
  select 1 from public.exercise_access_rules e
  where e.exercise_id=p_exercise_id and (
   public.is_tutor_developer()
   or (not e.is_final and (
     e.required_exercise_id is null or exists(
       select 1 from public.exercise_progress p
       where p.user_id=(select auth.uid())
       and p.exercise_id=e.required_exercise_id
       and p.completed=true and p.metrics->>'curriculum_version'='2'
     )
   ))
   or (e.is_final and (
     select count(distinct p.exercise_id) from public.exercise_progress p
     where p.user_id=(select auth.uid()) and p.completed=true
       and p.metrics->>'curriculum_version'='2'
       and p.exercise_id in (
        'm1_calculo_desconto','m2_desconto_categoria','m3_tabuada',
        'm4_status_nota','m5_remover_duplicatas'
       )
   )=5)
  )
 );
$$;

revoke all on function public.senac_my_onboarding() from public,anon,authenticated;
revoke all on function public.senac_set_affiliation(boolean) from public,anon,authenticated;
revoke all on function public.senac_submit_diagnostic(jsonb) from public,anon,authenticated;
revoke all on function public.can_access_exercise(text) from public,anon,authenticated;
grant execute on function public.senac_my_onboarding() to authenticated;
grant execute on function public.senac_set_affiliation(boolean) to authenticated;
grant execute on function public.senac_submit_diagnostic(jsonb) to authenticated;
grant execute on function public.can_access_exercise(text) to authenticated;
commit;
notify pgrst, 'reload schema';

-- Em uma conta de teste, consulte no SQL Editor:
-- select affiliation,diagnostic_completed_at from public.course_onboarding;
-- select proname from pg_proc where proname in ('research_dashboard','senac_my_onboarding','senac_submit_diagnostic');
-- IMPORTANTE: é autodeclaração de vínculo ao Senac; não comprova matrícula.
