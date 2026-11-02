# Operação e implantação do IA Tutor

**Ambiente público:** https://iatutor.com.br/ · **Origem de homologação:** https://ai-programming-tutor.pages.dev/ · **Código:** `main` do GitHub · **Cloudflare Pages:** projeto `ai-programming-tutor`.

Este roteiro descreve o ambiente configurado. Não execute migrações antigas, troque DNS ou redefina segredos apenas para reproduzir os passos históricos.

## Infraestrutura

| Responsabilidade | Serviço | Observações |
| --- | --- | --- |
| Aplicação estática | Cloudflare Pages | Build `python3 scripts/build_site.py`, saída `dist/`, branch `main` |
| Registro do domínio | Registro.br | Domínio de produção `iatutor.com.br` |
| DNS e HTTPS | Cloudflare | Zona DNS ativa para o domínio principal; confirmar certificado e eventual `www` |
| Identidade e dados | Supabase Auth + PostgreSQL | Login, recuperação, progresso e histórico por conta |
| IA | Supabase Edge Function `gemini-tutor` → Gemini API | Função exige JWT; chave e modelo configurados em Secrets do servidor |
| E-mails | Supabase Auth → Brevo SMTP | Remetente autenticado; preservar DNS DKIM e DMARC na Cloudflare |

## URLs e autenticação

Verificar no Supabase (**Authentication → URL Configuration**) que:

- **Site URL** usa `https://iatutor.com.br`;
- Redirect URLs incluem `https://iatutor.com.br/login.html` e `https://iatutor.com.br/reset-password.html`;
- as URLs `pages.dev` autorizadas são mantidas apenas enquanto necessárias à homologação;
- cadastro, confirmação por e-mail, login, logout, sessão e reset foram repetidos **no domínio final**.

**Atenção:** o acesso à página inicial ter funcionado em navegador não comprova automaticamente que todos esses redirecionamentos estejam corretos.

## DNS e Brevo

Na zona Cloudflare preservar, com proxy desligado quando aplicável:

- `TXT @` com código de autenticação de domínio da Brevo;
- `CNAME brevo1._domainkey` e `CNAME brevo2._domainkey`, ambos **DNS only**;
- `TXT _dmarc` para política DMARC;
- outros registros de e-mail existentes, incluindo MX e SPF, se utilizados.

O domínio principal é associado ao projeto Pages via custom domain; o Cloudflare gerencia seu apontamento. Para recebimento de e-mails, é preciso também um serviço de caixa postal e registros MX, que são **independentes** da capacidade de envio da Brevo.

Não exponha SMTP password, API key Gemini, JWT ou chaves de serviço em páginas, Git ou capturas.

## Processo de release

1. Criar branch para uma mudança pequena e explicar risco, decisão e critério de aceite no PR.
2. Executar os testes locais e conferir o GitHub Actions.
3. Gerar o pacote seguro:
   ```bash
   python -m unittest discover -s tests -p "verify_*.py" -v
   node tests/sticky_completion.mjs
   python scripts/build_site.py
   ```
4. Garantir que `dist/` contenha **somente** os arquivos públicos previstos pelo build; excluir documentos, SQL, testes, backups e segredos.
5. Após merge na `main`, conferir a implantação do projeto no Cloudflare Pages.
6. Validar HTTP público:
   ```bash
   python scripts/smoke_site.py https://iatutor.com.br
   ```
7. Fazer o *smoke test funcional*: login, trilha, um exercício com erro e acerto, progresso após atualização, uma interação com o tutor, perfil, logout e recuperação de senha.

Se alguma verificação crítica falhar, interromper a homologação, identificar o commit causador e usar o histórico de *deployments* da Cloudflare e do GitHub para regressar a uma versão validada. Evite reverter banco/dados sem plano e backup.

## Backend e banco: não são atualizados pelo Pages

- O código da Edge Function é versionado em `supabase/functions/gemini-tutor/index.ts`. Um merge no GitHub **não** faz deploy automático dessa função.
- Scripts em `supabase/` documentam esquema, roles e migrações. Podem ser úteis para engenharia, mas **não** devem ser executados repetidamente sobre produção.
- Confirmar a função implantada, autenticação JWT, Secret `GEMINI_API_KEY`, modelo e limites diretamente no painel Supabase/Google.
- A migração histórica de restauração do desbloqueio fica em `docs/historico/` para rastreabilidade, não para execução rotineira.

## Pendências de aceite antes da entrega acadêmica

- Capturas e execução documentada de testes no domínio oficial.
- Testes de celular nas resoluções 320, 360, 390, 768 e 1024 px.
- Validação do isolamento de dados com duas contas e das regras RLS.
- Observação de erros 429/503, cotas e comportamento da IA em uso coletivo; testes de carga se o escopo exigir.
- Confirmar acesso via `www.iatutor.com.br` e redirecionamento canônico se esse endereço for divulgado.
- Revisar avisos de segurança do Supabase, política de dados e acessibilidade.

Registre cada evidência conforme [roteiros de validação](validacao/README.md); não trate as pendências como aprovadas por antecipação.
