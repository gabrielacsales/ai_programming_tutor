# Publicação do IA Tutor em iatutor.com.br

> Este documento é o roteiro operacional do TCC II (validação **técnica/funcional**).
> Não executar pesquisa com alunos, questionários ou pré/pós-teste para colocar a plataforma no ar.

## Estado do projeto e regra de segurança

- Fonte única da próxima versão: branch `main`, após aprovação do PR de preparação da produção.
- Aplicação pública: 6 páginas HTML, arquivos CSS e JavaScript listados em `scripts/build_site.py`.
- Arquivos SQL, backups, fontes de pesquisa, testes, scripts e documentos **não devem ser publicados**.
- A chave publicável e URL do Supabase no frontend não são credenciais secretas. Nunca publicar `service_role`, JWTs, senhas ou `GEMINI_API_KEY` no GitHub/Cloudflare.
- A execução Python via Pyodide acontece no navegador: a conclusão dos exercícios **não é prova antifraude/certificação**.

## Etapa A — Revisar a versão e preparar build

1. Verificar testes em GitHub Actions: `IA Tutor - validação e build seguro`.
2. Executar `python3 scripts/build_site.py` ou `py scripts/build_site.py` na raiz.
3. Conferir `dist/`: apenas páginas principais, dependências públicas e `_headers`; sem `supabase/`, `backup/`, `pesquisa.html`, `inicio-senac.html`, `painel-pesquisa.html` ou `.env`.
4. Opcionalmente testar localmente via `cd dist && python -m http.server 8000`, abrir `http://localhost:8000/login.html`. Usar a mesma porta configurada no Supabase.

## Etapa B — Cloudflare Pages de homologação

1. Entrar em https://dash.cloudflare.com → **Workers & Pages** → criar projeto Pages → **Connect to Git**.
2. Autorizar conexão ao repositório `gabrielacsales/ai_programming_tutor`.
3. Selecionar **No framework / None**.
4. **Production branch:** `main`.
5. **Build command:** `python3 scripts/build_site.py`.
6. **Build output directory:** `dist`. **Root directory:** raiz do repositório.
7. Se não existir Python apropriado no build, definir variável `PYTHON_VERSION=3.11`.
8. Implantar e guardar a URL `*.pages.dev` **efetivamente criada pelo Cloudflare** (não inventar o endereço).
9. Lembrar: URLs `pages.dev` podem ser acessadas por qualquer pessoa que tenha o endereço. Usar apenas contas e dados de teste nesta etapa.

O serviço Git do Cloudflare permite previews de Pull Requests e controle de deployments por branch; não ligar o domínio definitivo antes da homologação.

## Etapa C — Autenticação Supabase

No dashboard do projeto existente em https://supabase.com/dashboard:

1. Authentication → URL Configuration: configurar **Site URL** para a URL de homologação durante os testes; após aprovação, alterar para `https://iatutor.com.br`.
2. Adicionar em **Redirect URLs** os caminhos completos para `/login.html` e `/reset-password.html` na URL de homologação e no domínio definitivo. Considerar também `http://localhost:8000/login.html` e `http://localhost:8000/reset-password.html` durante testes locais.
3. Testar cadastro, confirmação por e-mail, login, sessão persistente, logout e recuperação de senha.
4. Para usuários públicos reais, configurar SMTP próprio/serviço transacional para entrega confiável de e-mails.
5. Testar com **duas contas diferentes**, sem compartilhar os históricos ou o progresso.
6. Conferir funções `get_tutor_access()` e `can_access_exercise(text)` e políticas RLS: nenhum diagnóstico Senac deve ser exigido. Não executar todas as migrações novamente. Se uma migração antiga deixou bloqueio no banco, revisar `supabase/restore-course-without-senac.sql` antes de aplicá-la.

## Etapa D — Gemini e dados

1. Supabase → Edge Functions → `gemini-tutor`: verificar se a versão implantada é a mesma de `supabase/functions/gemini-tutor/index.ts` em `main`.
2. Edge Function Secrets: confirmar `GEMINI_API_KEY` no **servidor**. Não colocar chaves privadas no frontend.
3. Testar perguntas socráticas, situações de pedido de resposta pronta, limite por conta, indisponibilidade/erro e retomada.
4. Confirmar as tabelas `exercise_progress` e `chat_messages` por conta de teste e as regras RLS.
5. Atenção: o limitador simples da Edge Function não é resistente a alta concorrência. Estabelecer limites/monitoramento de custo e abuso antes de divulgar amplamente o site.

## Etapa E — Critérios de aceitação antes do domínio

Registrar cenário, data, versão do GitHub, navegador, conta de teste, esperado, observado, aprovado/falhou, evidência e reteste.

- Página inicial e logo oficial; login; cadastro; sessão; reset.
- 5 módulos, 16 desafios, regras progressivas e perfil.
- Execução Pyodide, resultados dos testes e comportamento quando código falha.
- Popup de revisão, dicas graduais, professor socrático, exemplos Python coloridos e apostila.
- Barra de progresso 0%, 33%, 67%, 100% com atualização após novo exercício.
- Persistência após refresh/logout/login e dados isolados por usuário.
- Celular/tablet/desktop, carregamento, acessibilidade básica, mensagens de erro.
- Inexistência de redirecionamento para pesquisa Senac.
- Checagem manual das restrições de segurança, acesso não autorizado e políticas RLS.

Testes estáticos do GitHub Actions não substituem os testes de integração reais.

## Etapa F — Ativar iatutor.com.br após aprovação

1. No Cloudflare Pages → **Custom domains**, adicionar `iatutor.com.br` e seguir as instruções específicas mostradas pela conta.
2. Para o domínio raiz (`apex`), o domínio deve estar em uma zona do Cloudflare. No Registro.br, configurar **somente os nameservers informados pelo Cloudflare** (não usar endereços inventados).
3. Conferir registros DNS existentes antes da mudança; preservar registros de e-mail (MX/TXT) se houver.
4. Configurar também `www.iatutor.com.br` e seu encaminhamento/alias para o domínio oficial.
5. Verificar HTTPS, certificado, DNS e que todas as telas/URLs funcionam no domínio final.
6. Atualizar **Supabase Authentication Site URL** para `https://iatutor.com.br` e garantir os Redirect URLs.
7. Reexecutar testes mínimos de cadastro/login, reset, persistência, AI, progresso e acesso por duas contas.
8. Monitorar erros de rede/servidor, custos e limites da IA durante o lançamento.

## Registro acadêmico

A seção de validação do TCC II apresenta conformidade técnica e pedagógica **observável**. Não afirma ganho de aprendizagem, redução de reprovação ou superioridade educacional; tais hipóteses dependem de estudo futuro com participantes.
