# Configuração inicial: Supabase + login (branch de revisão)

Esta branch é uma **primeira entrega**, ainda não pronta para liberar aos alunos.

## 1. Supabase
1. Crie um projeto em https://supabase.com/dashboard.
2. Abra **SQL Editor** e execute `supabase/schema.sql` uma vez. Ele cria perfis, progresso, histórico e políticas RLS por usuário.
3. Em **Project Settings > API Keys**, copie a **Project URL** e a **publishable key** para `supabase-config.js`. Esses dois dados são públicos. **Não** use service_role/secret nem Gemini API key nesse arquivo.
4. Em **Authentication > URL Configuration**, defina Site URL e Allowed Redirect URLs para o domínio definitivo e para o endereço de teste; inclua os caminhos `/login.html` e `/reset-password.html`. Para localhost, inclua sua URL e porta de desenvolvimento.
5. Habilite autenticação por e-mail/senha e configure serviço SMTP para envios confiáveis antes de convidar alunos.

## 2. Testar localmente
- Rode `python -m http.server 8000` na pasta do projeto.
- Acesse `http://localhost:8000/login.html`.
- Crie duas contas de teste e valide login, confirmação por e-mail, logout e redefinição de senha.
- `conteudos.html` e `tutor.html` agora redirecionam para login se a sessão não existir.

## 3. Status atualizado
- Cadastro, confirmação por e-mail, login e recuperação: código preparado; cadastro/login **testados pela usuária**.
- Progresso por aluno no Supabase: **testado pela usuária** (permanece após atualizar, logout/login e aparece no `exercise_progress`).
- Gemini seguro e histórico: código preparado, **ainda requer implantar `gemini-tutor` e testar**. Siga `SETUP_GEMINI.md`.
- Hospedagem no Cloudflare Pages e domínio: **ainda não configurados**.
- Antes de estudantes reais ou coleta acadêmica: verifique consentimento LGPD, logs e testes validados no servidor (o navegador é manipulável).

## 4. Publicar depois
O frontend estático poderá ser publicado no Cloudflare Pages via GitHub (sem build e com diretório raiz do projeto); a função de backend para Gemini pode ser hospedada em Supabase Edge Functions. Conecte seu domínio nas configurações de Custom Domains do Pages.

## Arquivos novos
- `supabase/schema.sql` — tabelas e RLS.
- `supabase-config.js` — URL e chave pública do projeto Supabase (públicas e já configuradas).
- `auth-client.js` — sessão e logout.
- `login.html` — cadastro, entrada, recuperação.
- `reset-password.html` — formulário de nova senha.

**Segurança:** nunca envie suas senhas, API keys privadas, tokens de acesso ou sua service_role para o chat nem faça commit dessas credenciais.

## 5. Etapa 4 — Progresso
Os testes de persistência de progresso por aluno já foram realizados com sucesso. Para testar a integração com o Gemini, use [SETUP_GEMINI.md](SETUP_GEMINI.md).

