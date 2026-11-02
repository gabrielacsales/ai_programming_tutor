# Plano de validação funcional do IA Tutor — TCC II

A avaliação deste TCC limita-se à **validação técnica e funcional do protótipo**, sem medição de aprendizagem de participantes. As evidências devem ter data, versão, ambiente e resultado observado. **A existência de código e a aprovação do CI não equivalem à aprovação dos testes de ponta a ponta.**

## Estado dos ensaios anteriores

A homologação inicial em `ai-programming-tutor.pages.dev` incluiu testes de abertura/login, persistência, editor/execução Python, Professor Socrático e separação entre contas. Houve correção posterior da conclusão persistente, ajustes de responsividade, SMTP e apontamento do domínio.

**A validação no endereço definitivo `iatutor.com.br` deve ser registrada separadamente.** Não reutilizar uma aprovação antiga sem identificar URL, commit, data e limites do ensaio. Em particular, fluxo de recuperação de senha, configuração dos redirecionamentos, acesso mobile e testes de concorrência exigem atenção.

## Matriz de testes finais

| ID | Componente | Procedimento/resposta esperada | Estado no domínio definitivo |
| --- | --- | --- | --- |
| F01 | Home e navegação | Abrir `/`, entrar no login e visualizar favicon correto; páginas sem erros de assets | Pendente de registro |
| F02 | Cadastro e e-mails | Conta nova recebe mensagem; confirmação leva ao domínio esperado | Pendente de registro |
| F03 | Login, sessão e logout | Entrar, atualizar, sair e exigir nova autenticação para páginas privadas | Pendente de registro |
| F04 | Recuperação | Solicitar e-mail; link abre `reset-password.html` no domínio correto; nova senha permite login | Pendente de registro |
| F05 | Currículo | Conferir 5 módulos, 16 atividades e regras de desbloqueio por conclusão | Pendente de registro |
| F06 | Editor e Pyodide | Código correto e incorreto produzem resultados explícitos, sem código pronto do tutor | Pendente de registro |
| F07 | Conclusão persistente | Teste correto conclui; teste incorreto posterior não apaga conclusão; recarregar mantém progresso | Pendente de registro |
| F08 | Professor Socrático | Perguntas contextuais, continuidade, resposta conceitual e tentativa de gabarito | Pendente de registro |
| F09 | Histórico | Reabrir exercício e verificar histórico do próprio aluno, inclusive após atualizar | Pendente de registro |
| F10 | RLS e isolamento | Conta A não visualiza progresso/histórico da conta B | Pendente de registro |
| F11 | Dicas/revisão/exemplos | Cada recurso aparece, responde ao clique e não entrega a solução do próprio desafio | Pendente de registro |
| F12 | Perfil e métricas | Dados por módulo e indicadores refletem atividades reais, sem mistura entre usuários | Pendente de registro |
| F13 | Responsividade | 320/360/390/768/1024 px: abrir menu, mudar atividade, usar editor, feedback e teclado | Pendente de registro |
| F14 | Build e segurança básica | Rodar CI e `smoke_site.py`; bloquear URLs SQL, docs, backup e pesquisa | Pendente de registro |
| F15 | Falhas externas | Simular/observar limite da IA, e-mail e rede; apresentar mensagem adequada sem expor chave | Pendente de registro |

**Importante:** testes de segurança e carga completos não são automaticamente cobertos por essa matriz. Descrever limitações e não afirmar resistência a ataques ou escala garantida.

## Roteiros complementares

- [Editor Python](testes/TESTE_EDITOR_PYTHON.md).
- [Professor Socrático](testes/TESTE_SOCRATICO.md).
- [Perfil do aluno](testes/TESTE_PERFIL_ALUNO.md).
- [Revisão em blocos](testes/TESTE_REVISAO_BLOCOS.md).

Esses roteiros foram escritos ao longo do desenvolvimento e podem mencionar nomes antigos de branches, telas ou botões. Este plano é a **referência operacional vigente**; ao executar os casos, anotar diferenças reais da versão publicada.

## Registro de evidência por cenário

Copiar e preencher um registro por teste:

```text
Identificador: F__
Objetivo e requisito: 
Data e hora:
URL do sistema:
Commit da main / implantação:
Dispositivo, sistema e navegador:
Resolução de tela:
Conta fictícia utilizada:
Pré-condições:
Passos executados:
Resultado esperado:
Resultado observado:
Classificação: Conforme / Parcial / Não conforme / Não executado
Captura ou log associado (sem credenciais nem dados pessoais):
Correção e reteste (quando aplicável):
Observações e limitações:
```

## Comandos automáticos de apoio

Na raiz do repositório:

```bash
python -m unittest discover -s tests -p "verify_*.py" -v
node tests/sticky_completion.mjs
python scripts/build_site.py
python scripts/smoke_site.py https://iatutor.com.br
```

Os testes unitários e verificações estáticas são evidências de regressão do código, não substitutos para testes de navegador e integrações externas. O smoke test é somente HTTP e não acessa dados pessoais.

## Regras para redação do TCC

- **Capítulo 3:** método, requisitos, critérios e procedimento de execução dos testes.
- **Capítulo 4:** componentes realmente implementados e decisões de engenharia.
- **Capítulo 5:** apenas resultados efetivamente registrados, com aprovação/falha e evidência.
- **Capítulo 6:** conclusões limitadas ao funcionamento testado; estudos com estudantes ficam como trabalho futuro.

É legítimo registrar falhas conhecidas, limitações e funcionalidades pendentes. Não afirmar que as restrições contra respostas prontas previnem 100% dos casos ou que um avanço de progresso prova aprendizagem.
