
# LLM Scaffold Tutor (Anti-Overreliance Demo) — v3 (test-based gating)

Protótipo de **engenharia** que desencoraja superdependência em LLMs por meio de:
- **Scaffolding** (hints graduais) e **tutoria socrática**;
- **GATING POR TESTES**: a conclusão do exercício é automática e **só ocorre se seu código passar em todos os testes** (públicos e ocultos).

Métricas instrumentadas: **IPT, TRIB, RER, IT**.

## Rodar
```bash
pip install -r requirements.txt
streamlit run app.py
```

Opcional (LLM real): `OPENAI_API_KEY`.

## Estrutura
```
llm_scaffold_tutor/
├─ app.py
├─ core.py
├─ landing_page.py
├─ problems/logic_basics.yaml
├─ requirements.txt
└─ logs/
```

## Referência teórica
ZHAI; WIBOWO; LI (2024). *The effects of over-reliance on AI dialogue systems on students’ cognitive abilities: a systematic review.* Smart Learning Environments.
