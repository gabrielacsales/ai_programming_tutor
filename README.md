# IA Tutor

**Protótipo educacional para apoiar a aprendizagem de lógica de programação em Python, com tutoria socrática baseada em IA.**

**Aplicação:** https://iatutor.com.br · **Repositório:** https://github.com/gabrielacsales/ai_programming_tutor

O projeto integra exercícios progressivos, revisão de conceitos, dicas graduais, editor Python, testes de código e um professor virtual que orienta por perguntas em vez de fornecer soluções prontas. Faz parte de um TCC de Engenharia da Computação voltado ao **desenvolvimento e à validação técnica/funcional do protótipo**, sem estudo de eficácia com estudantes nesta etapa.

## Como funciona

1. O estudante entra com uma conta Supabase e acessa o currículo com **5 módulos e 1 desafio integrador** (16 atividades).
2. O navegador apresenta os desafios e executa o Python com **Pyodide/WebAssembly**; os casos de teste dão feedback imediato.
3. Dicas e revisões guiadas fazem parte do conteúdo local, sem consumir necessariamente a API de IA.
4. As perguntas ao professor passam por uma **Supabase Edge Function autenticada**, que encaminha a solicitação ao **Gemini** e registra as mensagens.
5. O Supabase guarda progresso e histórico por conta, com políticas RLS para isolar os dados.

**Limitação importante:** a execução e os testes de código ocorrem no navegador, de modo que uma conclusão registrada é um indicador educacional, **não** uma certificação antifraude. As restrições do tutor reduzem a entrega direta de respostas, mas não garantem eficácia pedagógica ou ausência de respostas inadequadas.

## Estrutura do repositório

```text
ai_programming_tutor/
├── web/             # Frontend estático: 6 páginas, CSS, JS, fontes de dados e imagens
├── supabase/        # Banco, funções SQL e Edge Function gemini-tutor
├── scripts/         # Build de produção e verificação HTTP do site publicado
├── tests/           # Testes estáticos e de regressão (Python e Node.js)
├── docs/            # Arquitetura, operação, validação e artefatos do TCC II
│   ├── testes/      # Roteiros manuais de funcionalidades
│   └── historico/   # Guias de fases anteriores; não executar sem revisão
├── .github/workflows/ # CI: validação e build seguro
├── README.md
└── LICENSE
```

A pasta `web/` concentra os arquivos do site, mantidos com **nomes e caminhos relativos simples**, sem adicionar framework, empacotador JavaScript ou dependências desnecessárias. O build copia apenas os arquivos permitidos para `dist/` na **raiz do pacote publicado**; por isso as URLs `/login.html`, `/tutor.html` etc. continuam iguais.

### Componentes principais

| Arquivo ou grupo | Responsabilidade |
| --- | --- |
| `web/index.html`, `web/login.html`, `web/conteudos.html`, `web/tutor.html`, `web/perfil.html`, `web/reset-password.html` | Interface, acesso e navegação |
| `web/problems.js` e `web/study-guide.js` | Currículo, enunciados, materiais didáticos |
| `web/app.js`, `web/learning-ui.js` e `web/preflight-review.js` | Orquestração dos desafios e experiência de estudo |
| `web/code-editor.js` e `web/runner.js` | Edição e execução Python no navegador |
| `web/auth-client.js`, `web/access-client.js`, `web/progress-store.js` | Autenticação, autorização e persistência |
| `web/tutor.js` e `supabase/functions/gemini-tutor/index.ts` | Cliente do tutor e integração protegida com Gemini |
| `web/perfil.js` e `web/module-progress.js` | Indicadores e progresso |
| `scripts/build_site.py` e `scripts/smoke_site.py` | Empacotamento seguro e verificação HTTP |

Para o desenho das camadas, decisões de engenharia e limitações, consulte **[Arquitetura](docs/ARQUITETURA.md)**.

## Executar localmente

**Pré-requisito:** Python 3.11+; Node.js é necessário apenas para o teste de regressão em JavaScript. O frontend não requer `npm install` nem dependências Python via `pip`.

No terminal, a partir da raiz do repositório:

```bash
cd web
python -m http.server 8000
```

Abra `http://localhost:8000/login.html`. A experiência completa depende dos serviços Supabase e Gemini configurados. O Supabase precisa permitir o endereço local nos redirecionamentos de autenticação. **Não** abra as páginas via `file://`.

## Testes e build de produção

Execute na **raiz do repositório**:

```bash
python -m unittest discover -s tests -p "verify_*.py" -v
node tests/sticky_completion.mjs
python scripts/build_site.py
```

O build gera `dist/` somente com o frontend necessário e cabeçalhos `_headers`; não inclui `docs/`, `supabase/`, `tests/`, `scripts/`, arquivos sensíveis ou pesquisas descontinuadas. O GitHub Actions executa automaticamente os mesmos testes e o build em pull requests.

Depois de publicar:

```bash
python scripts/smoke_site.py https://iatutor.com.br
```

O smoke test verifica páginas públicas, alguns cabeçalhos e o bloqueio de caminhos internos, **sem** testar sozinho login real, Pyodide, Gemini, segurança completa ou responsividade.

## Implantação

O site utiliza **Cloudflare Pages** conectado à branch `main`. Configuração do projeto existente:

- Framework: **None**
- Root directory: **raiz do repositório**
- Build command: `python3 scripts/build_site.py`
- Build output directory: `dist`

O domínio oficial é `iatutor.com.br`. O Supabase fornece autenticação/banco e executa a função `gemini-tutor`; a Brevo é utilizada como SMTP transacional. **A Edge Function é implantada separadamente; publicar um commit no GitHub não sincroniza automaticamente a função no Supabase.**

**Segredos:** jamais versionar `GEMINI_API_KEY`, senhas, tokens de sessão ou a chave SMTP. A chave pública do Supabase no cliente não equivale a uma chave de serviço.

Documentação operacional e verificações pendentes: **[Operação e deploy](docs/OPERACAO.md)** e **[Plano de validação](docs/VALIDACAO.md)**.

## Documentação do TCC

- **[Arquitetura e decisões técnicas](docs/ARQUITETURA.md):** desenho e fluxo de uma interação.
- **[Critérios da refatoração](docs/DECISOES_REFATORACAO.md):** arquivos removidos, motivação e histórico no Git.
- **[Revisão pedagógica do currículo](docs/REVISAO_CURRICULO_V2.md):** critérios e materiais da trilha.
- **[Roteiros de teste](docs/testes/):** procedimentos manuais registrados em versões anteriores; conferir sua aplicação à versão atual.
- **[Documentos históricos](docs/historico/):** registros das etapas anteriores, inclusive uma proposta de pesquisa posteriormente retirada do escopo. **Não executar migrações ou procedimentos históricos em produção.**

### Escopo acadêmico

A validação funcional verifica comportamentos observáveis e requisitos técnicos/pedagógicos. Não demonstra ganho de aprendizagem, redução de superdependência ou desempenho para determinado número de alunos simultâneos; essas hipóteses exigem avaliações adicionais. Registros de teste devem indicar versão, data, ambiente, resultado esperado, obtido e evidência.
