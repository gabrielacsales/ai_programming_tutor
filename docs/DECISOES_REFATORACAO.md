# Critérios e registro da refatoração final

Esta reorganização foi feita após a publicação do IA Tutor no domínio próprio, para **tornar a implementação compreensível por outros estudantes, facilitar a apresentação do TCC II e reduzir arquivos sem uso**.

**Base anterior à refatoração:** commit `b73bdc7084ccb9222aff7cabbcaa32d4a35cc551` da branch `main`. O histórico completo do repositório permanece disponível no GitHub mesmo após arquivos serem removidos da versão atual.

## Objetivos e critérios

1. **Separação de responsabilidades (Separation of Concerns):** `web/` contém apenas o frontend; `supabase/` contém lógica e estrutura de dados de servidor; `scripts/` automação; `tests/` verificações; `docs/` documentação.
2. **KISS:** manter HTML/CSS/JavaScript e os nomes de arquivos estáticos; evitar instalar um framework, bundler ou introduzir aliases de caminho para uma aplicação pequena.
3. **YAGNI:** retirar código e páginas do antigo estudo com participantes, fora do escopo atual (desenvolvimento e validação funcional).
4. **Mudança segura:** não alterar contratos de banco, regras de progressão, API Gemini, conteúdo dos exercícios nem os caminhos públicos (`/login.html`, `/tutor.html` etc.).
5. **Reprodutibilidade:** build único com lista permitida, CI, documentação e roteiros de homologação.

## O que mudou

| Antes | Agora | Motivo |
| --- | --- | --- |
| 34 recursos públicos espalhados na raiz | `web/` | Um único lugar para encontrar o site; preservação das URLs no build |
| Muitos `SETUP_*.md` e `TESTE_*.md` na raiz | `docs/historico/`, `docs/testes/` | Distinguir instruções antigas de documentação válida |
| README com instruções de versões antigas | README atual, curto e com mapa do software | Onboarding de novos colaboradores e uso acadêmico |
| `scripts/build_site.py` lendo arquivos da raiz | Lê apenas `web/` e gera `dist/` plano | Frontend separado do artefato de produção |
| Testes procurando HTML/JS na raiz | Testes atualizados para `web/` | Preservação da cobertura de regressão |

## Removido da árvore ativa

Os itens a seguir **não compunham o pacote público do build anterior** e foram retirados da branch refatorada:

- **Backups e cópias antigas de interfaces:** tudo que estava em `backup/`.
- **Imagem descartada:** `gabi-site.webp` (a imagem usada pelo site permanece `web/foto-gabi.jpg`).
- **CSS antigo:** `index.css` (não constava da lista de arquivos públicos e não era referenciado pela Home vigente).
- **Páginas de pesquisa/diagnóstico anteriores:** `pesquisa.html`, `inicio-senac.html`, `painel-pesquisa.html`.
- **Scripts/estilos do fluxo antigo:** `research-admin.css`, `research-admin.js`, `research-collector.js`, `research-instruments.js`, `research-page.js`, `research.css`, `senac-onboarding.js`.
- **Ferramenta antiga de análise de pré/pós-teste:** `scripts/analyze_study.py`.
- **SQL fora do escopo atual:** `supabase/research-study.sql` e `supabase/senac-onboarding.sql`.

A opção facultativa de informar vínculo com o Senac, existente no formulário de cadastro, **não obriga pesquisa, pré-teste ou consentimento**. O teste de regressão confirma que as páginas de pesquisa não fazem parte da navegação nem da árvore ativa.

Esses arquivos não foram publicados pelo build anterior; sua remoção **não altera o estado dos dados existentes no Supabase** nem desfaz migrações previamente executadas. Não executar SQL de remoção/destruição como parte desta refatoração.

## O que foi preservado

- As seis páginas e seus arquivos necessários, incluídos em `web/`.
- Conteúdo dos 16 desafios, Pyodide, CodeMirror, Professor Socrático, dicas, progresso e perfil.
- `supabase/functions/gemini-tutor/index.ts`, `supabase/schema.sql`, `supabase/developer-access.sql`, `supabase/curriculum-v2.sql` e o script opcional de restauração do fluxo sem diagnóstico.
- Scripts de build, smoke test, regressões em Python/Node.js e pipeline GitHub Actions.
- Revisão do currículo em `docs/`.
- Guias de desenvolvimento/implantação antigos em `docs/historico/`, **rotulados como históricos**: podem mencionar branches, fluxos e etapas que já mudaram. Roteiros de testes anteriores em `docs/testes/` são apoio, não resultados aprovados.

## Como recuperar algo antigo sem poluir o código atual

As versões anteriores podem ser consultadas por `git log` ou `git show`. Exemplo:

```bash
git show b73bdc7084ccb9222aff7cabbcaa32d4a35cc551:pesquisa.html
```

Isso permite estudar a evolução do protótipo e o recorte de escopo do TCC, sem misturar funcionalidades descontinuadas ao software em produção.

## O que deliberadamente NÃO foi modificado

- Não foi reescrito o orquestrador `app.js`; seu fluxo de estado e eventos depende de muitos elementos da interface. Dividi-lo sem testes de integração mais abrangentes traria risco desnecessário no fim do projeto.
- Não foi adotado React, Next.js, Vite, Babel ou uma camada de servidor adicional.
- Não foram modificadas tabelas, migrações efetivas no banco, políticas RLS, secrets, chave do Gemini ou DNS.
- Não houve alteração da API pública, nomes das páginas, casos de teste pedagógicos ou perfis de usuários.
- A capacidade de usuários simultâneos e a segurança completa **não foram comprovadas** por esta reorganização.

## Validação da refatoração

O GitHub Actions verifica os testes estáticos Python, a regressão executável de progresso em Node.js e o build restrito a `dist/`. Após a integração à `main`, testar novamente no domínio oficial login, execução de Python, persistência e Professor Socrático; esses fluxos dependem de serviços externos e **não são cobertos integralmente pelo CI**.

Consulte [Arquitetura](ARQUITETURA.md), [Operação](OPERACAO.md) e [Validação](VALIDACAO.md).
