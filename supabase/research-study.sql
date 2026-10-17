-- Pesquisa TCC: Execute APÓS schema.sql, developer-access.sql e curriculum-v2.sql.
-- Modo opt-in para ADULTOS (18+), pesquisa metodologicamente/eticamente aprovada.
-- Não concede acesso a dados de outros alunos pela interface.
BEGIN;

CREATE TABLE IF NOT EXISTS public.researcher_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.researcher_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.researcher_accounts FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.research_study_settings (
  id int PRIMARY KEY CHECK (id=1),
  enrollment_open boolean NOT NULL DEFAULT false,
  institution text NOT NULL DEFAULT '',
  researcher_contact text NOT NULL DEFAULT '',
  retention_text text NOT NULL DEFAULT '',
  consent_text text NOT NULL DEFAULT '',
  protocol_reference text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.research_study_settings (id,enrollment_open)
VALUES (1,false) ON CONFLICT(id) DO NOTHING;
ALTER TABLE public.research_study_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_study_settings FROM anon,authenticated;
-- O recrutamento só começa quando a pesquisadora liberar manualmente no SQL Editor.

CREATE TABLE IF NOT EXISTS public.research_participants (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_code text UNIQUE NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  consent_version text NOT NULL DEFAULT 'tcc-v1',
  consented_at timestamptz NOT NULL DEFAULT now(),
  adult_confirmed boolean NOT NULL DEFAULT false,
  withdrawn_at timestamptz,
  withdrawal_requested_at timestamptz
);
ALTER TABLE public.research_participants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_participants FROM anon;
GRANT SELECT ON public.research_participants TO authenticated;
DROP POLICY IF EXISTS "Own research participation" ON public.research_participants;
CREATE POLICY "Own research participation" ON public.research_participants
  FOR SELECT TO authenticated USING ((select auth.uid())=user_id);

CREATE TABLE IF NOT EXISTS public.research_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.research_participants(user_id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  curriculum_version int NOT NULL DEFAULT 2 CHECK (curriculum_version=2),
  event_type text NOT NULL CHECK (event_type IN (
    'exercise_opened','review_completed','review_skipped','hint_viewed',
    'code_submitted','test_result','exercise_completed','idea_submitted',
    'tutor_question','tutor_blocked_request','idle_interval'
  )),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS research_events_user_date ON public.research_events(user_id,recorded_at);
CREATE INDEX IF NOT EXISTS research_events_type_date ON public.research_events(event_type,recorded_at);
ALTER TABLE public.research_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_events FROM anon, authenticated;
-- Somente RPC de coleta pode escrever; alunos não leem event logs de outros.

CREATE TABLE IF NOT EXISTS public.research_assessments (
  user_id uuid NOT NULL REFERENCES public.research_participants(user_id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('pre','post')),
  instrument_version text NOT NULL DEFAULT 'tcc-v1',
  answers jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,phase)
);
ALTER TABLE public.research_assessments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_assessments FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.research_surveys (
  user_id uuid PRIMARY KEY REFERENCES public.research_participants(user_id) ON DELETE CASCADE,
  responses jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.research_surveys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_surveys FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.research_interview_notes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  participant_user_id uuid NOT NULL REFERENCES public.research_participants(user_id) ON DELETE CASCADE,
  researcher_user_id uuid NOT NULL REFERENCES auth.users(id),
  theme_code text NOT NULL,
  excerpt text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.research_interview_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_interview_notes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_researcher()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
  SELECT (select auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.researcher_accounts r WHERE r.user_id=(select auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.is_researcher() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.enroll_in_research(p_adult boolean, p_consent boolean, p_version text DEFAULT 'tcc-v1')
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid := auth.uid(); v_code text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Faça login para participar.'; END IF;
  IF p_adult IS DISTINCT FROM true OR p_consent IS DISTINCT FROM true OR p_version <> 'tcc-v1'
  THEN RAISE EXCEPTION 'Confirmação de maioridade, consentimento e versão vigente são obrigatórios.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.research_study_settings
    WHERE id=1 AND enrollment_open=true
      AND char_length(trim(institution))>=3
      AND char_length(trim(researcher_contact))>=6
      AND char_length(trim(retention_text))>=10
      AND char_length(trim(consent_text))>=200
      AND char_length(trim(protocol_reference))>=3)
  THEN RAISE EXCEPTION 'Coleta fechada ou termo/contatos oficiais incompletos.'; END IF;
  IF EXISTS(SELECT 1 FROM public.research_participants WHERE user_id=v_uid AND withdrawn_at IS NOT NULL)
  THEN RAISE EXCEPTION 'Participação retirada: fale com a pesquisadora antes de nova inclusão.'; END IF;
  INSERT INTO public.research_participants(user_id,adult_confirmed,consent_version)
    VALUES (v_uid,true,p_version) ON CONFLICT(user_id) DO NOTHING;
  SELECT participant_code INTO v_code FROM public.research_participants WHERE user_id=v_uid AND withdrawn_at IS NULL;
  RETURN v_code;
END; $$;

CREATE OR REPLACE FUNCTION public.research_public_info()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $research_info$
SELECT jsonb_build_object(
 'ready', enrollment_open AND char_length(trim(institution))>=3
   AND char_length(trim(researcher_contact))>=6
   AND char_length(trim(retention_text))>=10
   AND char_length(trim(consent_text))>=200
   AND char_length(trim(protocol_reference))>=3,
 'institution',institution,'contact',researcher_contact,
 'retention',retention_text,'consent',consent_text,'protocol',protocol_reference
) FROM public.research_study_settings WHERE id=1;
$research_info$;

CREATE OR REPLACE FUNCTION public.research_my_status()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $research_status$
SELECT jsonb_build_object(
  'enrolled', EXISTS(SELECT 1 FROM public.research_participants p WHERE p.user_id=(select auth.uid()) AND p.withdrawn_at IS NULL),
  'withdrawn', EXISTS(SELECT 1 FROM public.research_participants p WHERE p.user_id=(select auth.uid()) AND p.withdrawn_at IS NOT NULL),
  'code', (SELECT p.participant_code FROM public.research_participants p WHERE p.user_id=(select auth.uid()) AND p.withdrawn_at IS NULL),
  'pre', EXISTS(SELECT 1 FROM public.research_assessments a WHERE a.user_id=(select auth.uid()) AND a.phase='pre'),
  'post', EXISTS(SELECT 1 FROM public.research_assessments a WHERE a.user_id=(select auth.uid()) AND a.phase='post'),
  'survey', EXISTS(SELECT 1 FROM public.research_surveys s WHERE s.user_id=(select auth.uid()))
) WHERE (select auth.uid()) IS NOT NULL;
$research_status$;

CREATE OR REPLACE FUNCTION public.research_submit_assessment(p_phase text,p_answers jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid := auth.uid(); v_n int;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.research_participants WHERE user_id=v_uid AND withdrawn_at IS NULL)
  THEN RAISE EXCEPTION 'Consentimento de pesquisa não registrado.'; END IF;
  IF p_phase NOT IN ('pre','post') THEN RAISE EXCEPTION 'Etapa inválida.'; END IF;
  IF p_phase='post' AND NOT EXISTS(SELECT 1 FROM public.research_assessments WHERE user_id=v_uid AND phase='pre')
  THEN RAISE EXCEPTION 'Complete o pré-teste primeiro.'; END IF;
  IF jsonb_typeof(p_answers) <> 'object' THEN RAISE EXCEPTION 'Formato inválido.'; END IF;
  SELECT count(*) INTO v_n FROM jsonb_object_keys(p_answers);
  IF v_n <> 8 OR EXISTS (
    SELECT 1 FROM jsonb_each_text(p_answers) AS kv
    WHERE kv.key NOT IN ('q1','q2','q3','q4','q5','q6','q7','q8')
       OR kv.value NOT IN ('A','B','C','D','E')
  ) THEN RAISE EXCEPTION 'Responda às oito questões com A, B, C, D ou E (Não sei).'; END IF;
  INSERT INTO public.research_assessments(user_id,phase,answers) VALUES(v_uid,p_phase,p_answers);
  RETURN true;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'Este teste já foi enviado e não pode ser repetido.'; END; $$;

CREATE OR REPLACE FUNCTION public.research_submit_survey(p_responses jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid := auth.uid(); v_item record;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.research_participants WHERE user_id=v_uid AND withdrawn_at IS NULL)
  THEN RAISE EXCEPTION 'Consentimento de pesquisa não registrado.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.research_assessments WHERE user_id=v_uid AND phase='post')
  THEN RAISE EXCEPTION 'Complete o pós-teste antes do questionário final.'; END IF;
  IF jsonb_typeof(p_responses) <> 'object' OR
    (SELECT count(*) FROM jsonb_object_keys(p_responses)) <> 8
  THEN RAISE EXCEPTION 'Questionário incompleto.'; END IF;
  FOR v_item IN SELECT key,value FROM jsonb_each_text(p_responses) LOOP
    IF v_item.key IN ('s1','s2','s3','s4','s5','s6') THEN
      IF v_item.value NOT IN ('1','2','3','4','5') THEN RAISE EXCEPTION 'Escala inválida.'; END IF;
    ELSIF v_item.key IN ('s7','s8') THEN
      IF char_length(v_item.value)>1000 THEN RAISE EXCEPTION 'Resposta textual muito longa.'; END IF;
    ELSE RAISE EXCEPTION 'Campo inválido.'; END IF;
  END LOOP;
  INSERT INTO public.research_surveys(user_id,responses) VALUES(v_uid,p_responses);
  RETURN true;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'Questionário já enviado.'; END; $$;

CREATE OR REPLACE FUNCTION public.research_record_event(p_exercise_id text,p_event_type text,p_details jsonb DEFAULT '{}'::jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid:=auth.uid(); v_safe jsonb;
BEGIN
  -- Eventos são observações do navegador: NÃO são prova antifraude de competência.
  IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.research_participants WHERE user_id=v_uid AND withdrawn_at IS NULL)
  THEN RETURN false; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.research_assessments WHERE user_id=v_uid AND phase='pre')
  THEN RETURN false; END IF;
  IF EXISTS(SELECT 1 FROM public.research_assessments WHERE user_id=v_uid AND phase='post')
  THEN RETURN false; END IF;
  IF p_event_type NOT IN ('exercise_opened','review_completed','review_skipped','hint_viewed',
    'code_submitted','test_result','exercise_completed','idea_submitted','tutor_question',
    'tutor_blocked_request','idle_interval')
    OR char_length(p_exercise_id)>80 OR NOT EXISTS(
      SELECT 1 FROM public.exercise_access_rules WHERE exercise_id=p_exercise_id)
  THEN RETURN false; END IF;
  -- Lista explícita: preserva somente metadados quantitativos.
  -- Nenhum trecho de código, texto livre ou conversa entra em research_events.
  v_safe = jsonb_strip_nulls(jsonb_build_object(
    'session_id', CASE
      WHEN jsonb_typeof(p_details->'session_id') = 'string'
        AND (p_details->>'session_id') ~ '^[A-Za-z0-9_-]{8,60}$'
      THEN p_details->>'session_id' ELSE NULL END,
    'passed', CASE
      WHEN jsonb_typeof(p_details->'passed') = 'number'
      THEN least(100, greatest(0, (p_details->>'passed')::numeric))::int
      ELSE NULL END,
    'total', CASE
      WHEN jsonb_typeof(p_details->'total') = 'number'
      THEN least(100, greatest(0, (p_details->>'total')::numeric))::int
      ELSE NULL END,
    'success', CASE
      WHEN jsonb_typeof(p_details->'success') = 'boolean'
      THEN (p_details->>'success')::boolean ELSE NULL END,
    'idle_seconds', CASE
      WHEN jsonb_typeof(p_details->'idle_seconds') = 'number'
      THEN least(300, greatest(0, (p_details->>'idle_seconds')::numeric))::int
      ELSE NULL END,
    'mistakes', CASE
      WHEN jsonb_typeof(p_details->'mistakes') = 'number'
      THEN least(100, greatest(0, (p_details->>'mistakes')::numeric))::int
      ELSE NULL END
  ));
  INSERT INTO public.research_events(user_id,exercise_id,event_type,details)
  VALUES(v_uid,p_exercise_id,p_event_type,v_safe);
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.research_withdraw()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid:=auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sessão ausente.'; END IF;
  -- Exclui da pesquisa os eventos, instrumentos e anotações vinculados;
  -- o serviço educacional (login, rascunhos) continua separado.
  DELETE FROM public.research_interview_notes WHERE participant_user_id=v_uid;
  DELETE FROM public.research_events WHERE user_id=v_uid;
  DELETE FROM public.research_assessments WHERE user_id=v_uid;
  DELETE FROM public.research_surveys WHERE user_id=v_uid;
  UPDATE public.research_participants SET withdrawn_at=now(),withdrawal_requested_at=now()
    WHERE user_id=v_uid AND withdrawn_at IS NULL;
  RETURN true;
END; $$;

-- Função de administração: agrega dados e retorna código pseudônimo, jamais email/nome.
CREATE OR REPLACE FUNCTION public.research_dashboard()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_data jsonb;
BEGIN
  IF NOT public.is_researcher() THEN RAISE EXCEPTION 'Acesso restrito à pesquisadora.'; END IF;
  SELECT coalesce(jsonb_agg(row_to_json(t) ORDER BY t.code),'[]'::jsonb) INTO v_data
  FROM (
    SELECT p.participant_code AS code, p.consented_at,
      (SELECT min(a.submitted_at) FROM public.research_assessments a WHERE a.user_id=p.user_id AND a.phase='pre') AS pre_at,
      (SELECT min(a.submitted_at) FROM public.research_assessments a WHERE a.user_id=p.user_id AND a.phase='post') AS post_at,
      (SELECT min(s.submitted_at) FROM public.research_surveys s WHERE s.user_id=p.user_id) AS survey_at,
      (SELECT count(*) FROM public.research_events e WHERE e.user_id=p.user_id) AS events,
      (SELECT count(*) FROM public.research_events e WHERE e.user_id=p.user_id AND e.event_type='code_submitted') AS code_submissions,
      (SELECT count(*) FROM public.research_events e WHERE e.user_id=p.user_id AND e.event_type='hint_viewed') AS hints,
      (SELECT count(*) FROM public.research_events e WHERE e.user_id=p.user_id AND e.event_type='tutor_question') AS tutor_questions,
      (SELECT count(*) FROM public.research_events e WHERE e.user_id=p.user_id AND e.event_type='test_result'
          AND (e.details->>'success')::boolean IS TRUE) AS successful_tests,
      (SELECT count(distinct e.exercise_id) FROM public.research_events e WHERE e.user_id=p.user_id AND e.event_type='exercise_completed') AS completed_exercises,
      (SELECT count(distinct (e.recorded_at AT TIME ZONE 'America/Sao_Paulo')::date)
        FROM public.research_events e WHERE e.user_id=p.user_id) AS active_days
    FROM public.research_participants p WHERE p.withdrawn_at IS NULL
    ORDER BY p.consented_at
  ) t;
  RETURN jsonb_build_object('participants',coalesce(v_data,'[]'::jsonb),'exported_at',now());
END; $$;

CREATE OR REPLACE FUNCTION public.research_export(p_kind text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.is_researcher() THEN RAISE EXCEPTION 'Acesso restrito à pesquisadora.'; END IF;
  IF p_kind='assessments' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('code',p.participant_code,'phase',a.phase,
      'submitted_at',a.submitted_at,'answers',a.answers) ORDER BY p.participant_code,a.phase),'[]'::jsonb)
    INTO v_result FROM public.research_assessments a JOIN public.research_participants p
    ON p.user_id=a.user_id WHERE p.withdrawn_at IS NULL;
  ELSIF p_kind='surveys' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('code',p.participant_code,
      'submitted_at',s.submitted_at,'responses',s.responses) ORDER BY p.participant_code),'[]'::jsonb)
    INTO v_result FROM public.research_surveys s JOIN public.research_participants p
    ON p.user_id=s.user_id WHERE p.withdrawn_at IS NULL;
  ELSIF p_kind='events' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('code',p.participant_code,'exercise_id',e.exercise_id,
      'event_type',e.event_type,'recorded_at',e.recorded_at,'details',e.details) ORDER BY p.participant_code,e.recorded_at),'[]'::jsonb)
    INTO v_result FROM public.research_events e JOIN public.research_participants p
    ON p.user_id=e.user_id WHERE p.withdrawn_at IS NULL;
  ELSIF p_kind='interviews' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('code',p.participant_code,'theme',i.theme_code,
      'excerpt',i.excerpt,'recorded_at',i.recorded_at) ORDER BY p.participant_code,i.recorded_at),'[]'::jsonb)
    INTO v_result FROM public.research_interview_notes i JOIN public.research_participants p
    ON p.user_id=i.participant_user_id WHERE p.withdrawn_at IS NULL;
  ELSE RAISE EXCEPTION 'Tipo de exportação inválido.'; END IF;
  RETURN coalesce(v_result,'[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION public.research_save_interview(p_code text,p_theme text,p_excerpt text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid;
BEGIN
  IF NOT public.is_researcher() THEN RAISE EXCEPTION 'Acesso restrito à pesquisadora.'; END IF;
  IF p_theme NOT IN ('autonomia','feedback','clareza','dificuldade','confianca','dependencia','usabilidade','outro')
     OR char_length(trim(coalesce(p_excerpt,'')))<5 OR char_length(p_excerpt)>1500
  THEN RAISE EXCEPTION 'Tema ou trecho inválidos.'; END IF;
  SELECT user_id INTO v_uid FROM public.research_participants WHERE participant_code=p_code AND withdrawn_at IS NULL;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Participante não encontrado.'; END IF;
  INSERT INTO public.research_interview_notes(participant_user_id,researcher_user_id,theme_code,excerpt)
  VALUES(v_uid,auth.uid(),p_theme,trim(p_excerpt));
  RETURN true;
END; $$;

-- APENAS RPCs explicitamente autorizadas.
DO $do$ DECLARE f record;
BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p
   JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public'
   AND p.proname IN ('enroll_in_research','research_my_status','research_submit_assessment',
    'research_submit_survey','research_record_event','research_withdraw','research_dashboard',
    'research_export','research_save_interview','research_public_info')
  LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature); END LOOP;
END $do$;
GRANT EXECUTE ON FUNCTION public.enroll_in_research(boolean,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_my_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_public_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_submit_assessment(text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_submit_survey(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_record_event(text,text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_withdraw() TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_export(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.research_save_interview(text,text,text) TO authenticated;
COMMIT;
notify pgrst, 'reload schema';

-- Autorize sua conta SOMENTE pelo SQL Editor, depois de executar a migração:
-- INSERT INTO public.researcher_accounts(user_id)
-- SELECT id FROM auth.users WHERE lower(email)=lower('SEU_EMAIL_AQUI')
-- ON CONFLICT(user_id) DO NOTHING;
--
-- NÃO envie emails nem credenciais ao chat/GitHub. A conta researcher é
-- DIFERENTE da autorização developer para liberar exercícios.

-- Depois da aprovação ética e dos testes: desbloqueie SOMENTE no SQL Editor:
-- UPDATE public.research_study_settings SET enrollment_open=true,updated_at=now() WHERE id=1;
-- Para interromper novos cadastros: UPDATE public.research_study_settings SET enrollment_open=false,updated_at=now() WHERE id=1;

-- Antes de abrir inscrições, preencher no SQL Editor os dados reais da pesquisa:
-- UPDATE public.research_study_settings SET
-- institution='SUA INSTITUIÇÃO',
-- researcher_contact='CONTATO INSTITUCIONAL PÚBLICO',
-- retention_text='PRAZO E MÉTODO DE EXCLUSÃO APROVADOS',
-- consent_text='TEXTO INTEGRAL DO TCLE FINAL APROVADO (AO MENOS 200 CARACTERES)',
-- protocol_reference='PROTOCOLO/PARECER OU DISPENSA INSTITUCIONAL FORMALMENTE CONFIRMADA',
-- updated_at=now() WHERE id=1;
-- Somente depois abrir enrollment_open=true com orientação institucional.
