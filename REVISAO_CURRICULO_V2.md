# Revisão pedagógica profunda — Currículo 2 do AI Programming Tutor

## Objetivo e abordagem

O protótipo busca apoiar estudantes **iniciantes em programação Python** com uma progressão conceitual explícita. Esta é uma **auditoria editorial/técnica fundamentada em práticas de ensino**, não um estudo formal com participantes nem uma certificação por especialista humano externo.

Referências usadas como princípios de projeto:
- Sentance e colaboradores — PRIMM (Predict, Run, Investigate, Modify, Make), enfatizando compreensão e apoio gradual: https://doi.org/10.1145/3287324.3287477
- ACM ICER — uso de problemas do tipo Parsons (blocos de código) como andaime para iniciantes: https://doi.org/10.1145/3501385.3543977
- Raspberry Pi Foundation — PRIMM para o ensino inicial de programação: https://www.raspberrypi.org/blog/using-primm-to-teach-programming-a-new-short-course-for-educators/

## Critérios aplicados (evidências verificáveis)

1. **Um conceito novo central por etapa:** evita exigir listas e indexação no primeiro exercício, quando o aluno ainda não sabe atribuição e `print()`.
2. **Complexidade crescente:** variáveis/aritmética → condicionais → laços/contadores → funções/listas → transformação e filtragem → síntese.
3. **Exemplos paralelos:** a seção Exemplos do Professor demonstra o *mesmo conceito* num contexto diferente, sem entregar o código do próprio desafio.
4. **Dicas em camadas:** em geral (1) pergunta conceitual → (2) decomposição do problema → (3) ferramenta/sintaxe pertinente. A solução completa não aparece nas dicas.
5. **Resumo do tema sincronizado:** explica as construções realmente exigidas no enunciado, com exemplos mínimos.
6. **Enunciados verificáveis:** descrevem entrada, tipo, formato de saída e casos de borda relevantes.
7. **Redução de erros de avaliação:** números são comparados por valor, evitando falsos erros de formatação como `77` versus `77.0`; saída em texto ainda exige conteúdo preciso.
8. **Domínio progressivo:** nos módulos 1–3, o ambiente passa um único número em `entrada`, sem exigir `input()`, listas ou `append()`. A partir do módulo 4 são introduzidos parâmetros de funções, listas e `return`.
9. **Microrevisão contextualizada:** popup ordenável aparece antes do desafio com sintaxe relevante, mas não reproduz a solução avaliada.
10. **Dados anteriores protegidos:** a migração `supabase/curriculum-v2.sql` arquiva rascunhos anteriores e só utiliza conclusões da versão 2 no desbloqueio.

## Auditoria do currículo anterior e ação tomada

| ID técnico (mantido para compatibilidade) | Antes / problema | Agora / foco |
| --- | --- | --- |
| m1_imc | IMC: lista + dois índices + potência + arredondamento logo de início | **Dobro de um Número**: atribuição, multiplicação, saída |
| m1_conversor_temp | Conversão escalar, mas sem apoio suficiente sobre operações | **Converter Temperatura**: expressão sequencial, arredondamento |
| m1_calculo_desconto | Percentual a partir de dois elementos de lista antes de ensinar listas | **Desconto de 10%**: uma entrada, percentual fixo, variáveis |
| m2_maioridade | Condicional correta, instruções pouco graduais | **Verificar Maioridade**: if/else, limite inclusivo |
| m2_par_impar | Saída booleana pouco intuitiva antes da consolidação do if | **Número Par ou Ímpar**: comparação e saídas de texto |
| m2_desconto_categoria | Mistura listas, texto e condições, mais cálculo de preço | **Classificação de Pontuação**: if/elif/else com um inteiro |
| m3_contagem | While e lista/append ensinados simultaneamente | **Contagem Regressiva**: while com números por linha |
| m3_soma_limite | Critério de parada e lista de duas entradas prematuros | **Somar de 1 até N**: contador + acumulador |
| m3_tabuada | Introdução a for misturada com construção de lista | **Tabuada de 1 a 5**: for/range com impressão por linha |
| m4_busca_linear | Primeira função exigia lista aninhada, busca e enumerate | **Primeiro Elemento de uma Lista**: lista, índice zero, return e None |
| m4_contagem_vogais | Boa ideia, falta estabelecer strings/lower antes | **Contar Vogais**: for sobre string, in, case-insensitive |
| m4_status_nota | Transformação de lista com condições; possível, mas intensa | **Classificar uma Lista de Notas**: for/append com regras explícitas |
| m5_extremos | Tarefa adequada, mas enunciado não explorava negativos | **Menor e Maior Valor**: bordas, lista vazia, negativos |
| m5_filtrar_nomes | Dica de exemplo inconsistente com o catálogo visual | **Filtrar Nomes**: tamanho >=5, ordem original preservada |
| m5_remover_duplicatas | Exemplo do professor praticamente recontava a mesma solução | **Remover Números Repetidos**: exemplo paralelo com caracteres |
| analisar_turma | Dicionários e listas aninhadas introduzidos pela primeira vez no final | **Resumo de Notas da Turma**: soma, média, condicionais e lista, sem conceito novo |

> **Nota sobre IDs:** os identificadores internos foram mantidos para não quebrar URLs, histórico de conversa e relações do banco. Títulos, instruções e nomes de função exibidos ao aluno são os do currículo 2. Por exemplo, `m1_imc` é apenas um identificador técnico legado, não um exercício de IMC.

## Checklist por exercício

Em cada um dos 16 objetos de `problems.js` foram escritos/revisados e alinhados:
- `title`, `statement`, `constraints`;
- `hints` (3 por exercício) com ajuda progressiva;
- `theory` (resumo conceitual), inclusive explicações de sintaxe nova;
- `solution` (exemplo didático de um problema **diferente**);
- `tests` cobrindo exemplos e casos de borda;
- `curriculum_version: 2`, e `function_parameter` nos exercícios de função.

Também foram sincronizados `conteudos.html`, `preflight-review.js`, `runner.js`, `app.js` e as regras de acesso SQL.

## Garantia de avaliação

Foram conferidos logicamente **76 casos de teste** contra comportamentos de referência, a correspondência entre os 16 IDs do banco, cards, microrevisões, a sintaxe dos arquivos JavaScript e o catálogo de dependências. **Isso não substitui** executar o curso no navegador e observar erros reais de iniciantes.

### Atenção: proteção dos registros anteriores

**Antes de abrir o código novo**, execute o arquivo `supabase/curriculum-v2.sql` (depois de `supabase/developer-access.sql`, caso este último ainda não tenha sido executado).

- O SQL cria `exercise_progress_v1_archive` com RLS para preservar registros da versão anterior.
- Os dados originais não são apagados pelo script. Quando o aluno trabalha em um exercício revisto, novos salvamentos substituirão a linha ativa antiga; sua cópia permanece no arquivo.
- Os exercícios já concluídos no currículo anterior **não aparecem como concluídos no currículo novo** e não desbloqueiam conteúdos que mudaram de objetivo.
- O histórico do tutor também é versionado: a migração adiciona `chat_messages.curriculum_version` (mensagens anteriores ficam na versão 1). O frontend e o Gemini recuperam apenas conversas da versão corrente, evitando misturar diálogo sobre IMC com diálogo sobre Dobro de um Número.

## Próximas verificações obrigatórias antes de pesquisa com participantes reais

- Testar a execução real no Pyodide, incluindo números decimais, saída multilinha, None e retornos de listas.
- Validar didaticamente com pessoas iniciantes: nível percebido, tempo por tarefa, compreensão do enunciado e efeito das dicas.
- Auditar anti-plágio e verificação da conclusão no backend: atualmente os testes do Python rodam no navegador e um aluno tecnicamente habilidoso pode falsificar registros `completed`.
- Revisar acessibilidade, consentimento, retenção e LGPD para coleta acadêmica.
- Avaliar se o método de intervenção do professor Socrático realmente estimula a autonomia, com exemplos representativos; instruções LLM não garantem conformidade perfeita.

## Implantação coordenada — não pule a ordem

1. **SQL Editor do Supabase:** se ainda não aplicou `supabase/developer-access.sql`, aplique-o primeiro. Depois execute o conteúdo atual de `supabase/curriculum-v2.sql`, que cria o arquivo do progresso anterior, atualiza pré-requisitos e adiciona a versão do histórico de IA.
2. **Edge Functions → gemini-tutor → Code:** substitua pelo conteúdo atual de `supabase/functions/gemini-tutor/index.ts` e clique em **Deploy updates**. A nova função reconhece `curriculum_version` para ler/gravar o diálogo correto. O segredo Gemini permanece inalterado.
3. **VS Code:** baixe uma nova cópia da branch, extraia em outra pasta, inicie `python -m http.server 8000` e entre na conta.
4. Teste o **primeiro exercício** com `entrada = 6` → `12`, saída decimal `77.0` e `77`, saída de laço em várias linhas e função retornando `None`.
5. Verifique um aluno sem permissão de desenvolvedor e a progressão de módulos no Supabase; teste novamente o histórico do Gemini numa atividade atualizada.

Não é necessário criar novas Secrets nem recriar a função. **Não execute o `supabase/schema.sql` de novo** em um banco já configurado. Não publique para alunos reais antes de validar todas as etapas.
