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
└─ tutor.js         # Integração socrática com a API da OpenAI com guardrails
```

## Referência teórica
ZHAI; WIBOWO; LI (2024). *The effects of over-reliance on AI dialogue systems on students’ cognitive abilities: a systematic review.* Smart Learning Environments.
