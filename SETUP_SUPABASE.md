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

## 3. Atenção: não publicar como produção ainda
- A API do Gemini é chamada do navegador no `tutor.js`, com chave no localStorage ou recuperada via fetch de `.env`. **Não hospedar esse .env nem divulgar chave compartilhada!** A chamada deve ir para uma função backend protegida.
- O progresso ainda fica em `localStorage` no código legado. A tabela `exercise_progress` foi preparada, mas a sincronização ainda precisa ser implementada; neste ponto NÃO há histórico sincronizado entre aparelhos.
- O código de testes e soluções dos desafios está no navegador; para evidência acadêmica confiável, não confie em `completed` vindo do cliente. Crie uma validação no backend com casos de teste privados e registre tentativas de maneira auditável.
- O botão de bypass dos módulos ainda modifica o progresso local, útil apenas para demonstração. Ocultar ou remover antes do estudo.
- Revise renderizações feitas com `innerHTML` a partir das respostas da IA/dados do aluno para reduzir risco de XSS.
- A recuperação de senha depende de link válido, política de SMTP e URLs configuradas no Supabase.
- Antes da publicação, revise a LGPD/termo de consentimento da pesquisa, política de retenção e exclusão de dados.

## 4. Publicar depois
O frontend estático poderá ser publicado no Cloudflare Pages via GitHub (sem build e com diretório raiz do projeto); a função de backend para Gemini pode ser hospedada em Supabase Edge Functions. Conecte seu domínio nas configurações de Custom Domains do Pages.

## Arquivos novos
- `supabase/schema.sql` — tabelas e RLS.
- `supabase-config.js` — URL e chave pública (vazias, aguardando configuração).
- `auth-client.js` — sessão e logout.
- `login.html` — cadastro, entrada, recuperação.
- `reset-password.html` — formulário de nova senha.

**Segurança:** nunca envie suas senhas, API keys privadas, tokens de acesso ou sua service_role para o chat nem faça commit dessas credenciais.

## 5. Etapa 4 — Testar progresso persistente (implementação inicial)

Atualize a pasta local baixando **novamente** a branch `feature/supabase-auth-and-database` (não a `main`). Não precisa executar o SQL mais uma vez.

1. Rode `python -m http.server 8000`, entre com uma conta de teste e acesse um exercício.
2. Digite uma ideia e/ou código, espere ao menos 2 segundos e atualize a página. Os textos deverão reaparecer.
3. Solucione um exercício passando todos os casos. Volte à página de conteúdos e confira o indicador de conclusão.
4. Clique em **Sair**, entre com outra conta e verifique que o progresso da primeira não aparece.
5. Entre novamente na primeira conta: a ideia, o código e a conclusão devem ser restaurados.
6. No Supabase, abra **Table Editor > exercise_progress** e confira as linhas de progresso de cada ID de usuário.

As tabelas já foram criadas na etapa 2; não há nova migração SQL neste teste. Os controles de bypass da demonstração foram removidos da página de conteúdos.

**Limite importante:** a validação Python ainda acontece no browser. Os registros `completed` podem ser forjados por um navegador modificado e **não devem ser usados como prova antifraude ou dado confiável para a pesquisa**. Para coleta científica válida, falta validação do resultado no backend e trilhas de auditoria; ainda falta também mover Gemini para servidor e revisar HTML gerado a partir de conteúdo externo.
