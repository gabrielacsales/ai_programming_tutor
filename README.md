# IA Tutor — tutor socrático para lógica de programação

**Protótipo de Engenharia da Computação (TCC II)** para apoiar iniciantes na resolução de desafios de Python. A interface reúne currículo progressivo, revisão de conceitos, dicas graduais, execução de código e professor virtual orientado por perguntas. O escopo acadêmico atual é **desenvolvimento e validação técnica/funcional**, não avaliação de ganhos de aprendizagem com estudantes.

**Site:** [iatutor.com.br](https://iatutor.com.br/) · **Hospedagem:** Cloudflare Pages · **Branch de produção:** `main`.

## Arquitetura em uma visão

```text
Navegador (HTML, CSS e JavaScript)
├── Conteúdo dos 16 exercícios ──► Editor + Pyodide (execução/testes locais)
├── Autenticação, regras e progresso ──► Supabase Auth + PostgreSQL (RLS)
└── Professor Socrático ──► Supabase Edge Function (JWT) ──► Gemini API
                                          └── Histórico no PostgreSQL
E-mails de autenticação: Supabase Auth ──► SMTP Brevo
Publicação: GitHub main ──► GitHub Actions ──► build_site.py ──► Cloudflare Pages
```

**Limites importantes:** testes e execução Python acontecem no navegador, portanto o progresso não comprova autoria para fins de certificação. As instruções do tutor procuram evitar soluções prontas, mas não garantem conformidade pedagógica em todas as respostas. A cota da API Gemini é compartilhada pelo projeto Google; o controle de 6 respostas/min e 80 respostas/24h por usuário, existente na função, é simples e **não atômico**.

## Organização do repositório

| Local | Responsabilidade |
| --- | --- |
| `index.html`, `login.html`, `reset-password.html` | Apresentação, cadastro/login e recuperação de senha |
| `conteudos.html`, `tutor.html`, `perfil.html` | Módulos, ambiente de desafios e indicadores individuais |
| `problems.js`, `study-guide.js`, `preflight-review.js` | Currículo V2 (5 módulos, 3 desafios cada, mais desafio final), apostilas e revisão prévia |
| `app.js`, `learning-ui.js`, `code-editor.js`, `runner.js`, `tutor.js` | Orquestração, interface, editor, avaliação local em Python e cliente do tutor |
| `auth-client.js`, `access-client.js`, `progress-store.js`, `module-progress.js`, `perfil.js` | Sessão, permissões, persistência, progresso e perfil |
| `*.css`, `favicon.*`, `foto-gabi.jpg` | Estilos e recursos públicos referenciados pelas páginas |
| `supabase/` | Modelo SQL, regras de acesso, migração de currículo e fonte da Edge Function `gemini-tutor` |
| `scripts/`, `tests/`, `.github/workflows/` | Build de publicação, verificações e CI |
| `docs/` | Arquitetura, decisões, operação, roteiros de validação e histórico acadêmico |

O frontend é intencionalmente **estático, sem React, sem servidor Node e sem empacotador obrigatório**. Os arquivos públicos permanecem na raiz para preservar suas URLs e reduzir o risco de mudanças durante a homologação. O script de build funciona como uma lista de permissão explícita: apenas o que está em `OUTPUT_FILES` é publicado em `dist/`.

## Executar localmente

Requisitos: **Python 3.11+**, navegador moderno e conexão com os serviços externos configurados. Não é necessário instalar bibliotecas Python para servir as páginas.

```bash
git clone https://github.com/gabrielacsales/ai_programming_tutor.git
cd ai_programming_tutor
python -m http.server 8000
```

Abra `http://localhost:8000/login.html`. Para testar login/recuperação local, a origem e os redirecionamentos correspondentes precisam estar autorizados no **Supabase Authentication → URL Configuration**. Não execute a aplicação via `file://`.

## Testes e publicação

```bash
python -m unittest discover -s tests -p "verify_*.py" -v
node tests/sticky_completion.mjs
python scripts/build_site.py
python scripts/smoke_site.py https://iatutor.com.br
```

O último comando verifica apenas recursos HTTP públicos e exposição acidental de caminhos privados; **não substitui** testes em navegador de cadastro, RLS, Pyodide, Gemini, responsividade ou acessibilidade. O GitHub Actions executa testes e build em PRs e na `main`.

**Cloudflare Pages:** framework `None`; build `python3 scripts/build_site.py`; saída `dist`; produção pela `main`. Não use a raiz do repositório como diretório público: há SQL, testes e documentos que não podem ser publicados.

**Segredos:** `GEMINI_API_KEY` fica somente nas Secrets da Supabase Edge Function; a chave SMTP fica nas configurações privadas do Auth. A URL e a chave publicável do Supabase são configurações do cliente, não privilégios administrativos. Nunca adicione `service_role`, tokens ou senhas ao repositório.

**Banco:** arquivos SQL versionados não são executados automaticamente pelo Cloudflare ou pelo GitHub Actions. Não reaplique migrações antigas sem conferir o estado real do projeto e fazer backup.

## Privacidade e dados pessoais

O cadastro requer a aceitação dos [Termos de Uso](termos.html) e a declaração de leitura do [Aviso de Privacidade](privacidade.html). A [Política de Cookies e Armazenamento](cookies.html) descreve tecnologias usadas na sessão e preferências. Não foram identificados scripts próprios de publicidade/analytics no frontend atual; por isso o aviso de armazenamento essencial é informativo, e não um falso consentimento para cookies necessários.

Os campos de versão/data de aceite são armazenados em metadados de cadastro pelo cliente e **não constituem registro imutável auditado no servidor**. O protótipo ainda precisa de canal privado funcional para titulares, regras de retenção e adequação específica antes de utilização irrestrita por menores. Consulte o [checklist de privacidade](docs/privacidade-implantacao.md). No tier gratuito, a API Gemini pode utilizar entradas/saídas para aprimoramento dos serviços conforme seus termos: não enviar dados pessoais ou sensíveis.

## Documentação técnica para o TCC

- [Arquitetura, componentes e fluxo de dados](docs/arquitetura.md)
- [Decisões de engenharia, trade-offs e limitações](docs/decisoes-tecnicas.md)
- [Operação e checklist do domínio oficial](docs/operacao.md)
- [Validação e roteiros de teste](docs/validacao/README.md)
- [Revisão pedagógica do currículo V2](docs/artefatos/revisao-curriculo-v2.md)
- [Registro de escolhas antigas e materiais não vigentes](docs/historico/README.md)

A documentação distingue **funcionalidade implementada**, **teste automatizado** e **comportamento validado em produção**. Evidência de interface deve registrar data, URL, commit, navegador, cenário, resultado esperado e observado. O projeto não afirma impacto comprovado sobre aprendizagem ou redução de superdependência de IA.

## Manutenção e evolução

Mudanças devem começar em uma branch, passar pelo CI e ser integradas à `main` via Pull Request. Para adicionar um recurso local usado pelas páginas, atualizar `scripts/build_site.py` e os testes correspondentes. Alterações de esquema e da Edge Function requerem implantação no Supabase separadamente; alterar apenas o GitHub **não implanta** código de função nem SQL.

**Histórico de refatoração:** código de pesquisa, páginas de diagnóstico Senac, backups e assets sem uso foram excluídos da árvore ativa; os commits anteriores preservam essas versões para auditoria histórica. Os documentos úteis foram reunidos em `docs/`.
