# Registro histórico — materiais não vigentes

Os textos nesta pasta documentam **etapas e decisões anteriores** do IA Tutor. Servem como evidência de evolução do protótipo, não como instrução para executar diretamente em produção. Algumas referências a branches, limites, telas do Supabase, pesquisa com estudantes e status “a implantar” estão desatualizadas.

## Escopo abandonado

O TCC II atual **não exige pré-teste, pós-teste, diagnóstico do Senac ou pesquisa com alunos**. As telas e scripts relacionados foram retirados da árvore ativa, juntamente com versões antigas em `backup/`, assets sem uso e SQL do experimento. O histórico de commits no GitHub preserva esses arquivos se um estudo futuro, com autorização e delineamento próprios, vier a requerê-los.

**Ponto de consulta anterior à limpeza:** commit `b73bdc7084ccb9222aff7cabbcaa32d4a35cc551` da `main`. Consulte o histórico Git para recuperar fontes antigas; não copie scripts ou SQL históricos sobre o ambiente atual.

## Documentos preservados

- [Checklist inicial de publicação](checklist-publicacao-inicial.md) — roteiro original de homologação e aceite, antes da ativação do domínio;
- [Configuração inicial do Supabase](configuracao-supabase.md) — instalação e SQL da versão anterior;
- [Configuração do Gemini](configuracao-gemini.md) — roteiro e tratamento de falhas da integração;
- [Conta desenvolvedora](configuracao-dev-role.md) — regras de acesso e antigo procedimento;
- [Projeto anterior de pesquisa](pesquisa-tcc.md) e [fluxo Senac](teste-fluxo-senac.md) — propostas substituídas pela validação funcional;
- [SQL histórico para restaurar desbloqueio](restore-course-without-senac.sql) — referência de correção de migração, **não executar sem auditoria e backup**.

Para a versão atual, use exclusivamente o [README principal](../../README.md), [arquitetura](../arquitetura.md), [operação](../operacao.md) e [validação](../validacao/README.md).
