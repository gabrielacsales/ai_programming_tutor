# AI Programming Tutor for Coding Challenges (Anti-Overreliance)

Protótipo de **engenharia** que desencoraja superdependência em LLMs por meio de:
- **Scaffolding** (hints graduais) e **tutoria socrática**;
- **GATING POR TESTES**: a interface conclui o exercício quando o código passa nos testes disponíveis no navegador (Pyodide); isso **não equivale a avaliação segura no servidor**, nem há testes verdadeiramente ocultos enquanto estiverem em `problems.js`.

Métricas instrumentadas: **IPT, TRIB, RER, IT**.

## Rodar Localmente

O frontend roda no navegador; autenticação, progresso e Gemini utilizam Supabase. Para executar localmente:

1. Iniciando um servidor local de desenvolvimento (recomendado para evitar problemas de CORS no carregamento de assets):
   ```bash
   python -m http.server 8000
   ```
   E acesse `http://localhost:8000/login.html`.

2. Evite abrir os arquivos com `file://`, pois autenticação e APIs podem falhar fora de um servidor HTTP.

## Estrutura do Projeto
```
ai_programming_tutor/
├─ login.html             # Cadastro, login e sessão
├─ conteudos.html         # Trilha e bloqueio progressivo dos módulos
├─ tutor.html             # Workspace de programação e professor
├─ problems.js            # Currículo 2, 16 exercícios com dica/teoria/exemplo
├─ preflight-review.js    # Minijogo de revisão sintática antes do exercício
├─ preflight-review.css   # Interface responsiva do minijogo
├─ progress-store.js      # Persistência individual do aluno, com versão
├─ runner.js              # Executor de código Python via Pyodide
├─ tutor.js               # Cliente Gemini seguro (sem chave no navegador)
├─ access-client.js       # Papéis developer/student consultados no Supabase
├─ supabase/              # SQL, migração do currículo e Edge Function
└─ tests/                 # Validação estática da trilha
```

## Referência teórica
ZHAI; WIBOWO; LI (2024). *The effects of over-reliance on AI dialogue systems on students’ cognitive abilities: a systematic review.* Smart Learning Environments.


## Deploy e integração

1. [Configuração do Supabase](SETUP_SUPABASE.md) — login e banco de dados.
2. [Etapa de integração segura do Gemini](SETUP_GEMINI.md) — função autenticada, segredo Gemini e histórico.
3. [Revisão pedagógica do Currículo 2](REVISAO_CURRICULO_V2.md) — revisão integral dos 16 desafios, critérios e 76 testes revisados.
4. **Antes do novo frontend:** execute [migração do currículo 2](supabase/curriculum-v2.sql) no Supabase SQL Editor (após [developer-access.sql](supabase/developer-access.sql), se ainda não executou), preservando progresso e histórico antigo.
5. Atualize a Edge Function `gemini-tutor` com o conteúdo **atual** da branch, para separar os históricos por versão.
6. Baixe a branch atualizada e teste em `http://localhost:8000/login.html`.
7. Gerar o pacote público com `python scripts/build_site.py`, validar a URL de homologação no Cloudflare Pages e conectar o domínio após aprovação técnica.

**Importante:** mantenha chaves Gemini apenas nos Secrets do Supabase; o progresso `completed` calculado no navegador não é válido como certificação ou medida antifraude sem validação no servidor.

## Situação do TCC II e fluxo de acesso

O TCC II concentra-se no **desenvolvimento e na validação técnica/funcional da plataforma**. Não há pré-teste, pós-teste ou participação de estudantes em pesquisa vinculados ao fluxo de acesso ao curso.

O cadastro pode manter a pergunta opcional sobre vínculo com o Senac, mas **essa identificação não libera, bloqueia ou exige pesquisa**. Alunos autenticados seguem o currículo e suas regras normais de progressão.

Os arquivos de pesquisa anteriores (`pesquisa.html`, `inicio-senac.html`, `painel-pesquisa.html`, scripts e migrações) permanecem versionados apenas para histórico: **não fazem parte do build de publicação** e não devem ser reativados sem novo protocolo, revisão institucional e escopo de pesquisa.

## Build para publicação segura

Rode `python scripts/build_site.py` na raiz. O comando valida dependências locais e cria `dist/` contendo apenas HTML, JS e CSS necessários ao site, com cabeçalhos HTTP básicos.

Nunca configure o Cloudflare Pages para publicar a raiz do repositório. Pastas `supabase/`, `backup/`, `scripts/`, `tests/`, documentação e páginas da pesquisa não devem ser servidas como arquivos públicos.

**Cloudflare Pages, via GitHub**: framework `None` / sem framework; branch de produção `main`; diretório raiz `/`; comando de build `python3 scripts/build_site.py`; diretório de saída `dist`. Antes da conexão do domínio, valide a URL de teste `*.pages.dev` e configure URLs de autenticação permitidas no Supabase.

As validações do código no GitHub Actions são estáticas: **não comprovam** que a autenticação externa, a Edge Function Gemini e a execução real do Pyodide passaram nos testes de navegador.

## Próximas verificações em ambiente real

1. Testar login, cadastro, verificação de e-mail, redefinição de senha e sessão persistente.
2. Confirmar no Supabase regras RLS, funções de acesso e progresso isolado por conta, sem bloqueio Senac.
3. Implantar/conferir a versão atual da Edge Function `gemini-tutor` e o segredo `GEMINI_API_KEY` no servidor.
4. Executar exercícios e comparar os resultados, verificar as métricas, o histórico e a restrição às respostas prontas.
5. Validar o ambiente de homologação Cloudflare e então conectar `iatutor.com.br`.
6. Registrar versões, casos de teste, evidências e falhas para o TCC II.

## Perfil do aluno

A página autenticada [perfil.html](perfil.html) reúne nome, e-mail, ingresso no curso e indicadores reais da conta: exercícios concluídos, percentual, progresso por módulo, dicas, envios de código, interações com o professor e pedidos diretos bloqueados. Utiliza RLS Supabase e somente o **currículo 2**. A contagem de envios de código foi adicionada nesta versão e não recupera tentativas anteriores.

Acesse **Meu perfil** na página de módulos ou no exercício. Veja [TESTE_PERFIL_ALUNO.md](TESTE_PERFIL_ALUNO.md) para o roteiro de validação e as definições das estatísticas. Não é necessário executar SQL adicional se as migrations anteriores já foram aplicadas.

## Editor e avaliação do código

O editor Python (CodeMirror) destaca palavras-chave, mostra números de linha e auxilia na indentação; o Pyodide executa de verdade cada entrada de teste **no navegador**. Nos scripts dos módulos 1–3, a variável `entrada` já é fornecida: **não a redefina com `entrada = 6`**. A tela mostra entrada, resultado esperado e obtido para cada teste. A aba **Código** é o fluxo normal; na primeira visita neste navegador, a aba **Ideia** aparece como orientação inicial e depois torna-se apoio opcional (inclusive após 90 segundos sem interação).

Veja [TESTE_EDITOR_PYTHON.md](TESTE_EDITOR_PYTHON.md) para o roteiro de validação.

## Verificação do currículo

Execute `python tests/verify_curriculum_v2.py` na pasta raiz para conferir estrutura, pré-requisitos, enunciados, revisões e versionamento. Isso não substitui testes do Pyodide no navegador nem avaliação didática com iniciantes.
