# Etapa 5 — Gemini com chave segura e histórico de conversa

**Status: código preparado, ainda precisa implantar a função e testar.**
Não mexer no SQL: a tabela `chat_messages` já existe no Supabase e a RLS foi criada na Etapa 2.

## A. Preparar a chave da IA no Supabase
1. Entre no seu projeto em https://supabase.com/dashboard.
2. Abra **Edge Functions → Secrets** (também chamada de **Edge Function Secrets**).
3. Crie um segredo **Key:** `GEMINI_API_KEY`; em **Value**, cole a chave que você usa para a API do Gemini. **Nunca envie essa chave ao chat nem coloque no GitHub.**
4. Clique em **Save**.
5. Opcionalmente adicione `GEMINI_MODEL` com valor `gemini-3.5-flash-lite` (padrão, mais econômico) ou outro modelo disponível na sua conta, por exemplo `gemini-3.6-flash`.

Se ainda não tiver uma chave válida, crie uma no Google AI Studio: https://aistudio.google.com/apikey. Verifique cotas e cobrança da sua conta Google.

## B. Publicar a Edge Function no painel (sem CLI)
1. No Supabase, entre em **Edge Functions**.
2. Clique em **Deploy a new function → Via Editor** (ou escolha criar uma função em branco).
3. Nome da função: `gemini-tutor` — exatamente com hífen.
4. Copie **todo** o código de `supabase/functions/gemini-tutor/index.ts` do GitHub para o editor da função (substituindo o exemplo padrão).
5. Confirme que **Verify JWT** / **JWT verification** está **ATIVADO** (não desabilite para resolver um 401). A função exige login.
6. Clique em **Deploy function** e aguarde.

O código permanece versionado no GitHub; o editor do Supabase não sincroniza automaticamente com essa branch.

## C. Rebaixar a versão local e testar
1. Baixe de novo `feature/supabase-auth-and-database` no GitHub para ter os arquivos atualizados.
2. Extraia numa pasta separada, abra no VS Code.
3. Rode `python -m http.server 8000` na raiz da pasta.
4. Abra http://localhost:8000/login.html e entre na sua conta já existente.
5. Abra um exercício e teste: **Pergunte ao professor** → digite algo como "Como posso começar a decompor esse problema?". A resposta deverá vir da Edge Function.
6. Abra **Histórico com o professor (este exercício)**. Deve aparecer o par de mensagens Aluno e Tutor.
7. Confirme **Table Editor → chat_messages** no Supabase. Deve haver 2 linhas por interação (um registro de aluno e outro de tutor), ambas com seu user_id.
8. Saia e entre com outra conta; o histórico da primeira não deve aparecer para a segunda.

## Erros comuns
- **404**: `gemini-tutor` não foi implantada ou nome diferente.
- **401**: a sessão expirou, a chamada não incluiu token JWT ou JWT verification rejeitou o token. Saia e entre novamente; mantenha JWT verification ligada.
- **502 com log `Gemini request status: 503`**: o serviço Google ficou temporariamente indisponível ou sobrecarregado. **Não apague a função**; primeiro tente novamente mais tarde. Atualize o código e clique em **Deploy** outra vez para receber o retry automático (até 3 tentativas, com espera crescente).
- **502 com status 400/403/404**: confira chave, conta e modelo; não são falhas temporárias.
- **503**: falha de configuração ou gravação do banco; confira o texto completo do erro.
- **503 "A chave Gemini ainda não foi configurada"**: salve a chave em Edge Function Secrets.
- **429**: limite simples de testes: até 6 respostas/minuto e 80/dia por conta (limite **não atômico**).
- **Histórico vazio**: confira se a RLS e as permissões da tabela `chat_messages` foram criadas no SQL da etapa 2.

## Segurança e próximos passos
- A chave Gemini **não deve** aparecer em `tutor.js`, `.env` servido ao navegador ou armazenamento local. Chaves antigas no navegador são apagadas ao carregar a nova versão.
- As mensagens são salvas no Supabase, associadas ao usuário autenticado; a função exige JWT e usa cliente sujeito às regras RLS.
- O histórico fica no banco mesmo após logout. Se incluir dados dos alunos reais na pesquisa, providencie consentimento, informação de uso e prazo de retenção conforme LGPD.
- Antes de pesquisa acadêmica confiável, faltam: validação de testes no backend, logs de tentativas auditáveis, proteção robusta contra abuso/limites de custo, e política de retenção/exclusão de dados.
- O site continua LOCAL. Cloudflare Pages e domínio serão configurados depois do teste do Gemini.

Fontes:
- https://supabase.com/docs/guides/functions/quickstart-dashboard
- https://supabase.com/docs/guides/functions/auth
- https://supabase.com/docs/guides/functions/secrets
- https://ai.google.dev/gemini-api/docs/generate-content/text-generation

## Resolução de 503 do Google (após primeiro deploy)
1. A API retornou `503`, confirmando que a requisição chegou ao provedor Google.
2. `index.ts` foi atualizado com até 3 tentativas e backoff exponencial. No Dashboard, reabra **Edge Functions > gemini-tutor > Code**, cole o código **atual** da branch e clique em **Deploy updates**; a edição do GitHub não atualiza a função já publicada.
3. Repita a pergunta do site. Se o erro continuar, confira no log `Gemini transient HTTP status` e, se persistente, tente temporariamente um modelo diferente criando/alterando o secret `GEMINI_MODEL` para `gemini-3.1-flash-lite` e reteste (sem colocar chave em frontend). Confirme o acesso do modelo na conta do Google AI Studio.
4. Não precisa recriar a função nem apagar o segredo.
