# Perfil do aluno e estatísticas — como testar

Implementado na branch `feature/supabase-auth-and-database`, em `perfil.html`, `perfil.css` e `perfil.js`.

## Funcionalidades

- Perfil privado com nome exibido, e-mail da conta e data de criação do cadastro.
- Indicador **Aluno** ou **Desenvolvedora** informado pelo Supabase (não altera permissões).
- 16 exercícios: concluídos, porcentagem geral, exercícios em andamento, última atividade.
- Progresso por módulo com lista de atividades, estados e barras.
- Indicadores: dicas utilizadas, envios de código, interações registradas com o tutor e solicitações diretas bloqueadas.
- Botão **Continuar aprendendo** leva ao primeiro desafio incompleto **já liberado** para aquela conta, quando a consulta de acesso está disponível.
- Link **Meu perfil** na página de módulos e na barra lateral de exercícios.
- Botão **Sair**, com sessão Supabase.

As consultas filtram a conta autenticada e as tabelas têm RLS. As métricas usam apenas registros com `metrics.curriculum_version=2` e o histórico Gemini com `chat_messages.curriculum_version=2`. Usuários não visualizam dados de terceiros.

## Testes no navegador

1. Baixe uma nova cópia da branch. Abra o VS Code e execute `python -m http.server 8000`.
2. Faça login e abra `http://localhost:8000/perfil.html` (ou use **Meu perfil** na tela dos módulos/exercícios).
3. Confira o nome e o e-mail cadastrados e se a quantidade de exercícios concluídos **realmente corresponde** à sua conta.
4. Na conta desenvolvedora, todos os exercícios podem estar liberados, mas só os concluídos devem entrar no contador.
5. Na conta aluno nova, espere `0 de 16`, `0%`, nenhuma dica e nenhum envio.
6. Execute um exercício, use uma dica e registre uma pergunta ao tutor; volte ao perfil e recarregue para conferir os números.
7. Verifique que **Continuar aprendendo** leva a um exercício desbloqueado e ainda não concluído.
8. Saia e entre em outra conta: confira que o primeiro aluno **não** aparece com dados, estatísticas ou e-mail da conta anterior.
9. Em celular/janela estreita, confira se os cartões se reorganizam sem rolagem horizontal.

## Definições das métricas

- **Concluídos:** número de exercícios marcados como `completed=true` na versão 2; não confundir com liberados para conta desenvolvedora.
- **Em andamento:** atividades da versão 2 ainda não concluídas com código, ideia ou submissão salvos.
- **Progresso geral:** concluídos / 16, arredondado para porcentagem inteira.
- **Dicas consultadas:** soma de `metrics.hints_used` dos exercícios atuais.
- **Envios de código:** soma de `metrics.code_submissions` (inserido nesta melhoria). **Contagens anteriores não são reconstruídas retroativamente**.
- **Interações com o tutor:** mensagens de papel `user` na tabela `chat_messages`, versão 2. Inclui perguntas e solicitações de análise/feedback feitas pela interface.
- **Solicitações bloqueadas:** soma de `metrics.blocked_direct_answer_attempts`.
- **Reengajamentos após bloqueios:** soma de `metrics.reengagement_after_block`.
- **Inatividade registrada:** soma de `metrics.idle_time_seconds`, exibida em minutos e segundos; não é tempo total dedicado ao curso.
- **Última atividade:** data do registro `exercise_progress.updated_at` mais recente na versão 2.

## Observações de segurança e avaliação

- **Nenhuma nova migration necessária** para essa funcionalidade, mas as etapas anteriores `supabase/developer-access.sql` e `supabase/curriculum-v2.sql` precisam estar aplicadas.
- O acesso é controlado pelo Supabase Auth e RLS; perfil é privado, não existe pesquisa pública por estudante.
- A conclusão continua sendo informada pelo frontend. **Não usar estes números como certificação antifraude ou evidência de aprendizagem validada até implementar avaliação confiável no backend.**
- Não incluir dados pessoais reais em prints do perfil ao compartilhar testes.
- Foram feitos testes estáticos de JavaScript e cálculos com dados sintéticos; os testes reais no Supabase/navegador ainda dependem de validação.
