# Roteiros de validação funcional

A validação do TCC II se concentra em **requisitos técnicos e pedagógicos observáveis**, sem recrutamento de alunos ou comparação pré/pós-teste. Os roteiros antigos aqui reunidos descrevem critérios e passos; **um roteiro não comprova que o caso foi executado no domínio definitivo**.

## Evidência mínima por caso

Registrar: código do caso e requisito, data/hora, versão (commit), URL e navegador, dispositivo/resolução, conta fictícia utilizada, resultado esperado, resultado observado, classificação (conforme/parcial/não conforme/não executado) e caminho ou referência da captura de tela. Ocultar e-mails, tokens e dados reais nas evidências publicadas.

## Matriz resumida para a homologação do domínio

| Grupo | Cenário | Situação de evidência |
| --- | --- | --- |
| Auth | Cadastro, confirmação de e-mail, login, logout, recuperação e sessão | Retestar todos em `https://iatutor.com.br` |
| Acesso | Proteção de páginas sem login; desbloqueio sequencial; privilégios de desenvolvedora | Retestar com duas contas |
| Currículo | 5 módulos, 16 desafios, conteúdo e revisão coerentes | Testes estáticos existentes; inspeção no navegador pendente |
| Editor | Código inválido, erro Python, execução, resultado por caso e conclusão | Roteiro existente; retestar no domínio |
| Persistência | Rascunho, conclusão, histórico, perfil e refresh/logout/login | Roteiro existente; retestar no domínio |
| Pedagogia | Dicas graduais, bloqueio de gabarito, continuidade socrática | Testar comportamentos; não inferir ganhos de aprendizagem |
| Mobile | 320/360/390/768/1024 px, navegação, editor, teclado e feedback | Verificação manual pendente |
| Operação | Recursos públicos, `noindex`, bloqueio de fontes/SQL, SMTP e erros 429/503 | CI + smoke HTTP complementares; testes externos pendentes |

Os testes em `tests/` e o CI são verificações automatizadas; as capturas e resultados de integração precisam ser registrados separadamente, com data/versão correspondente.

## Roteiros preservados

- [Editor Python e avaliação](teste-editor-python.md)
- [Perfil e métricas](teste-perfil-aluno.md)
- [Revisão em blocos](teste-revisao-blocos.md)
- [Professor Socrático](teste-socratico.md)

Outros documentos: [arquitetura](../arquitetura.md), [operação no domínio](../operacao.md), [currículo V2](../artefatos/revisao-curriculo-v2.md).

**Status:** ter o domínio acessível e o CI aprovado não é o mesmo que ter todos os requisitos aprovados em produção. O capítulo de resultados do TCC só deve afirmar conformidade quando houver execução documentada.
