# AI Programming Tutor for Coding Challenges (Anti-Overreliance)

Protótipo de **engenharia** que desencoraja superdependência em LLMs por meio de:
- **Scaffolding** (hints graduais) e **tutoria socrática**;
- **GATING POR TESTES**: a conclusão do exercício é automática e **só ocorre se seu código passar em todos os testes** (públicos e ocultos) rodados em WebAssembly (Pyodide).

Métricas instrumentadas: **IPT, TRIB, RER, IT**.

## Rodar Localmente

Como a aplicação roda inteiramente no lado do cliente (navegador), você pode executá-la:

1. Iniciando um servidor local de desenvolvimento (recomendado para evitar problemas de CORS no carregamento de assets):
   ```bash
   python -m http.server 8000
   ```
   E acesse `http://localhost:8000`.

2. Ou abrindo diretamente o arquivo `index.html` no navegador.

## Estrutura do Projeto
```
ai_programming_tutor/
├─ index.html       # Estrutura geral da SPA (Landing Page e Workspace)
├─ index.css        # Design System (Estilos, cores, layouts e botões 3D)
├─ app.js           # Orquestração do app, abas de modo e rastreio de métricas
├─ problems.js      # Banco de dados de desafios de lógica em Python
├─ runner.js        # Executador e validador de Python usando Pyodide (Wasm)
└─ tutor.js         # Integração socrática via Supabase Edge Function (Gemini), sem chave no browser
```

## Referência teórica
ZHAI; WIBOWO; LI (2024). *The effects of over-reliance on AI dialogue systems on students’ cognitive abilities: a systematic review.* Smart Learning Environments.


## Deploy e integração

1. [Configuração do Supabase](SETUP_SUPABASE.md) — login e banco de dados.
2. [Etapa de integração segura do Gemini](SETUP_GEMINI.md) — função autenticada, segredo Gemini e histórico.
3. Publicação do frontend no Cloudflare Pages e conexão do domínio (após validar a função).

**Importante:** mantenha chaves Gemini apenas nos Secrets do Supabase; o progresso `completed` calculado no navegador não é válido como certificação ou medida antifraude sem validação no servidor.
