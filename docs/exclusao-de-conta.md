# Exclusão de conta (LGPD)

Implementada na branch `feature/self-service-account-deletion`.

## Publicação

1. No Supabase, confirme que as tabelas que referenciam `auth.users` têm **ON DELETE CASCADE**. Estão assim nos arquivos `supabase/schema.sql`, `supabase/developer-access.sql` e `supabase/curriculum-v2.sql`, incluindo `exercise_progress_v1_archive`. Confira outras tabelas adicionadas manualmente antes de habilitar.
2. Implante `supabase/functions/delete-account/index.ts` como Edge Function chamada **delete-account**, com verificação JWT habilitada, no mesmo projeto Supabase do site. As variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` devem existir nos secrets do ambiente da função; nunca no repositório ou código do navegador.
3. Publique o frontend pelo fluxo do Cloudflare Pages existente.
4. Teste somente com uma conta descartável: excluir pelo Perfil, conferir ausência do usuário em Authentication > Users, linhas vinculadas no banco, sessão encerrada e novo cadastro com o mesmo endereço.

## Segurança e comportamento

- A função aceita somente POST com token de usuário válido. Obtém o ID da sessão no servidor; nunca recebe ID arbitrário do navegador.
- Exige confirmação de senha no servidor antes de chamar a API administrativa do Supabase. Não retorna detalhes internos de falhas.
- A exclusão é **irreversível** e apaga o cadastro no Supabase Auth; as tabelas relacionais citadas são apagadas por cascata. O progresso é reiniciado ao criar uma conta nova.
- A interface pede senha e a confirmação textual `EXCLUIR`; permite cancelar. Se o serviço falhar, apresenta mensagem de erro e mantém o usuário no perfil.
- Não há exclusão executada na interface antes de receber sucesso do backend.
- Contas que usam provedores externos sem senha precisarão de outro fluxo de reautenticação.
- Uma nova inscrição com o mesmo e-mail ainda poderá ficar sujeita aos limites de e-mails/cadastros do Supabase, inclusive rate limiting, e a eventual demora na entrega do e-mail.
- Não há promessa de apagar logs de plataforma, backups, registros fora das tabelas listadas ou mensagens de e-mail já enviadas. Esses prazos e bases legais precisam ser descritos na Política de Privacidade.
- Se existirem objetos de Storage pertencentes ao usuário, o Supabase pode bloquear a exclusão até que sejam removidos por um fluxo administrativo apropriado.

## Testes de aceitação

- [ ] Cancelar fecha a janela sem apagar nada.
- [ ] Sem senha ou sem digitar EXCLUIR, o botão permanece inativo.
- [ ] Senha incorreta gera erro e mantém conta e histórico.
- [ ] Sem token válido, a função retorna 401.
- [ ] Senha correta apaga só a conta autenticada.
- [ ] `profiles`, `exercise_progress`, `exercise_progress_v1_archive`, `chat_messages`, `developer_accounts` não retêm linhas vinculadas.
- [ ] Depois da exclusão confirmada pelo backend, a sessão local é encerrada e a pessoa é redirecionada para `index.html`, com confirmação visível de sucesso. Uma nova inscrição começa sem progresso.
- [ ] Testar em desktop e mobile; validar o fluxo após deploy da função e do site.
