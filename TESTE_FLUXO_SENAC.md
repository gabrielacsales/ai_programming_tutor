# Fluxo de entrada do Senac e pré-teste inicial

**Status:** arquivos preparados na branch `feature/supabase-auth-and-database`. **Não foram publicados no Supabase pelo GitHub.** Execute a migração apenas depois de conferir backup e usar um projeto staging para os primeiros testes.

## Como funciona

1. **Cadastro e login:** aparece a pergunta "Você é estudante do Senac?" com **Sim/Não**. Quem criou conta antes dessa atualização verá a escolha na primeira entrada, em `inicio-senac.html`.
2. **Não estuda no Senac:** identifica-se uma vez e acessa os módulos normalmente, respeitando os pré-requisitos da trilha.
3. **Estuda no Senac:** recebe uma explicação dos objetivos do diagnóstico, reforço de honestidade ("responda apenas o que sabe") e oito questões A/B/C/D/**E — Não sei**.
4. **Não precisa ser imediatamente:** poderá ir ao perfil e voltar em outro dia. Até concluir o diagnóstico, o catálogo e `tutor.html?exercise=...` são bloqueados por validação no servidor (`can_access_exercise`), além da verificação nas páginas.
5. **Participação no TCC é opcional:** se o estudo estiver aberto com termo institucional validado, o participante adulto pode aceitar voluntariamente o termo **antes do pré-teste**. Nesse caso, as respostas integram a pesquisa. Se recusar ou o recrutamento estiver fechado, faz o mesmo diagnóstico como atividade educacional, sem salvar respostas na base da pesquisa; salvamos apenas a informação de que concluiu o diagnóstico.
6. O pós-teste e questionário de pesquisa continuam em `pesquisa.html` somente para quem consentiu. Quem não consentiu pode continuar no curso sem pesquisa.

**A autodeclaração não comprova matrícula no Senac.** Para uma amostra oficial, defina critérios de inclusão e verificação pelo pesquisador sem expor dados pessoais no frontend.

## Ordem correta no Supabase SQL Editor

Se os arquivos anteriores **já foram executados**, não os execute novamente sem necessidade e sem backup. A ordem é:

1. `supabase/schema.sql` (somente configuração inicial de projeto novo).
2. `supabase/developer-access.sql` (caso ainda não exista).
3. `supabase/curriculum-v2.sql` (caso ainda não tenha migrado).
4. `supabase/research-study.sql`: cria, entre outras funções, **`research_dashboard()`**. Deve terminar sem erros.
5. `supabase/senac-onboarding.sql`: cria `course_onboarding`, `senac_my_onboarding()`, `senac_set_affiliation(boolean)`, `senac_submit_diagnostic(jsonb)` e atualiza `can_access_exercise`.

Depois que **cada SQL** tiver terminado com sucesso, confira no editor:

```sql
select proname
from pg_proc join pg_namespace ns on ns.oid=pg_proc.pronamespace
where ns.nspname='public'
  and proname in ('research_dashboard','senac_my_onboarding',
                  'senac_submit_diagnostic','can_access_exercise')
order by proname;
```

Devem aparecer quatro funções. Se elas EXISTIREM mas o navegador ainda acusar `PGRST202` (schema cache), execute:

```sql
notify pgrst, 'reload schema';
```

Se **não** existirem, rodar `NOTIFY` não as cria: volte à migração correspondente. **Não compartilhe chaves privadas do Supabase.**

### Seu acesso ao painel da pesquisadora

`research_dashboard` não é a mesma coisa que habilitar sua conta. Depois de criar a função, autorize seu e-mail **somente no SQL Editor**, substituindo o texto abaixo pelo e-mail do seu login (não o envie no chat ou commit):

```sql
insert into public.researcher_accounts (user_id)
select id from auth.users
where lower(email)=lower('SEU_EMAIL_AQUI')
on conflict (user_id) do nothing;
```

O papel de desenvolvedora (desbloquear exercícios) não é automaticamente o de pesquisadora.

## Testes manuais antes da coleta

- [ ] Cadastro com "Não": depois de confirmar e entrar, módulos disponíveis normalmente.
- [ ] Cadastro com "Sim": depois de confirmar, a tela inicial abre primeiro.
- [ ] Cadastro antigo: escolher vínculo na tela de primeiros passos.
- [ ] Aluno Senac sem pré: `conteudos.html` redireciona para `inicio-senac.html`.
- [ ] Aluno Senac sem pré: `tutor.html?exercise=m1_imc` também redireciona, mesmo digitando URL.
- [ ] Aluno Senac sem pré: `can_access_exercise('m1_imc')` (RPC autenticada) retorna `false`.
- [ ] Clicar "Responder em outra visita" não conclui o pré nem permite exercícios.
- [ ] Pré-teste mostra a opção "Não sei" em **todas** as oito perguntas, sem penalizar ou revelar gabarito.
- [ ] Após o pré-teste: curso liberado, respeitando bloqueios normais dos módulos, inclusive conta dev.
- [ ] Sem consentimento, os oito valores individuais não aparecem em `research_assessments`.
- [ ] Com consentimento e recrutamento aberto, `research_assessments` registra **um** pré-teste para o participante.
- [ ] Outro aluno autenticado não consegue ver dados pessoais nem registros da pesquisa dos demais.
- [ ] O painel `painel-pesquisa.html` mostra erro de migração distinto do erro de falta de autorização.

## Antes de usar dados reais no TCC

- O TCLE mostrado na inscrição precisa de aprovação/revisão institucional, contato e prazo de retenção; até lá, o recrutamento oficial fica fechado por padrão.
- As provas paralelas de oito itens são exploratórias, sem validação psicométrica; teste a clareza com um piloto fora da amostra.
- A participação na pesquisa é voluntária. O diagnóstico educacional pode ser obrigatório para **essa trilha específica**, mas não exija consentimento científico como condição de estudar.
- O navegador executa Python via Pyodide; a execução e seus indicadores ainda não são antifraude.
- Execute primeiro num **projeto Supabase de testes**, para confirmar RLS, sessões, consentimento, bloqueios e proteção de dados.

## Arquivos que mudaram
`login.html`, `auth-client.js`, `conteudos.html`, `tutor.html`, `app.js`, `research-page.js`, `research-admin.js`, `supabase/research-study.sql`, além dos novos `inicio-senac.html`, `senac-onboarding.js` e `supabase/senac-onboarding.sql`.
