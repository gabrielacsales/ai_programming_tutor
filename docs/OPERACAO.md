# Operação e publicação — IA Tutor

Este roteiro registra a forma **atual** de executar, testar e publicar o protótipo. Para reconstruir um ambiente novo do zero, revisar as migrações com atenção: **não executar todos os arquivos SQL indiscriminadamente** em um banco existente.

## Requisitos

- Python 3.11+ para hospedar a pasta estática localmente e executar o build.
- Node.js para a regressão `tests/sticky_completion.mjs`.
- Navegador moderno para carregar Pyodide (WebAssembly).
- Projeto Supabase configurado, Edge Function `gemini-tutor` implantada e credenciais públicas em `web/supabase-config.js`.
- Para publicar: conta Cloudflare Pages conectada ao repositório GitHub.

Não há instalação de pacotes via `pip install` ou `npm install` para desenvolver o frontend atual. Bibliotecas de interface e Pyodide são carregadas por CDN conforme os HTML.

## Desenvolvimento local

Na raiz do repositório:

```bash
cd web
python -m http.server 8000
```

Acessar `http://localhost:8000/login.html`. Para testar cadastro e recuperação localmente, esse endereço deve estar permitido na configuração de redirecionamento do Supabase. Evitar abrir arquivos diretamente com `file://`.

## Verificações antes de publicar

Ainda na raiz, executar:

```bash
python -m unittest discover -s tests -p "verify_*.py" -v
node tests/sticky_completion.mjs
python scripts/build_site.py
```

Inspecionar `dist/`, que deve conter somente os arquivos públicos do frontend e `_headers`. Nada de `supabase/`, `docs/`, `tests/`, `scripts/`, segredos, backups ou dados de pesquisa.

Para testar o pacote gerado localmente:

```bash
cd dist
python -m http.server 8000
```

Para validar a publicação no domínio:

```bash
python scripts/smoke_site.py https://iatutor.com.br
```

Este *smoke test* não prova que Gemini, autenticação, Python ou progresso funcionam para usuários; esses casos exigem testes de navegador descritos em [Validação](VALIDACAO.md).

## Configuração de produção

| Componente | Configuração |
| --- | --- |
| Host do frontend | Cloudflare Pages |
| Projeto Pages | `ai-programming-tutor` |
| Branch de produção | `main` |
| Framework | None |
| Diretório raiz do build | raiz do repositório (`/`) |
| Build command | `python3 scripts/build_site.py` |
| Output directory | `dist` |
| Domínio | `https://iatutor.com.br` |
| Ambiente antigo | `https://ai-programming-tutor.pages.dev` |

**Não alterar o Root directory do Cloudflare para `web/`**: o build encontra `scripts/build_site.py` a partir da raiz. O frontend está em `web/` somente como código-fonte; `dist/` permanece na raiz.

O domínio foi adquirido no Registro.br e delega DNS à Cloudflare. Os registros da Brevo para verificação do domínio, DKIM e DMARC devem permanecer válidos após modificações de DNS. No Cloudflare, os CNAMEs DKIM são **DNS only**.

## Supabase Auth e Brevo

Configurar em Supabase **Authentication → URL Configuration**:
- Site URL: `https://iatutor.com.br`.
- Redirect URLs: `https://iatutor.com.br/login.html` e `https://iatutor.com.br/reset-password.html`.
- Durante a transição, manter também as URLs equivalentes do domínio `pages.dev`, se ainda utilizadas.
- Para testes locais, autorizar `http://localhost:8000/login.html` e `http://localhost:8000/reset-password.html` apenas quando necessário.

Envios transacionais usam o SMTP da Brevo com `smtp-relay.brevo.com`, porta `587`, login SMTP e **chave SMTP mantida exclusivamente no Supabase**. Não versionar essas credenciais.

Validar cadastro, confirmação, login e redefinição de senha **no domínio oficial**, não apenas no endereço antigo. Ajustar limites por hora e por IP segundo o tamanho da turma e as cotas dos serviços, sem desabilitar proteções indevidamente.

## Edge Function Gemini

Código-fonte: `supabase/functions/gemini-tutor/index.ts`. Configuração no projeto Supabase:
- Exigir sessão válida de usuário e **JWT verification**.
- `GEMINI_API_KEY`: segredo do servidor, nunca no GitHub/browser.
- `GEMINI_MODEL`: opcional; verificar o modelo realmente configurado no painel antes de informar cotas.
- **A implantação da Edge Function não é automática quando a `main` muda**. Se esse arquivo mudar, publicar sua nova versão separadamente e testar.

O limite local por aluno é um mecanismo simples. Não garante proteção completa contra concorrência nem amplia as cotas disponíveis da API Gemini.

## Banco e permissões

Os arquivos SQL em `supabase/` são referências para entendimento e manutenção, não passos que devam ser sempre executados. Um projeto existente pode já ter tabelas, políticas e funções diferentes da primeira versão desses scripts. **Não rodar `schema.sql` nem refazer migrações em produção sem comparar o estado atual do banco e planejar rollback.**

Verificar especialmente:
- RLS das tabelas de perfil, progresso e conversas;
- acesso às regras de desbloqueio e funções `can_access_exercise` / `get_tutor_access`;
- isolamento entre duas contas;
- avisos do Security Advisor, incluindo proteção de senha vazada quando disponível.

## Diagnóstico rápido

- **Site não atualiza:** conferir última implantação em Cloudflare Pages → Deployments, commit e limpar cache do navegador.
- **E-mail aponta para localhost:** conferir Supabase Auth → URL Configuration e gerar novo link.
- **E-mail não chega:** conferir remetente autorizado, SMTP, logs e limites Supabase/Brevo.
- **IA retorna 429/503:** conferir cotas do Google AI Studio, limites por conta e logs da Edge Function.
- **Sem progresso após atualização:** conferir sessão, RLS e respostas do Supabase; não limpar dados dos alunos.
- **Teste do build falha:** validar links locais no HTML e se todos os recursos estão listados em `PUBLIC_*` em `scripts/build_site.py`.

Documentos anteriores de implantação estão em `docs/historico/` para rastreabilidade, mas podem conter configurações obsoletas. Priorize este guia.
