# Currículo de Python — AI Programming Tutor

Este documento descreve os objetivos de aprendizagem e os conteúdos técnicos cobertos pela plataforma, divididos em 5 módulos progressivos mais um desafio final de integração.

---

## Módulo 1 — Variáveis, Tipos de Dados e Operações

### Objetivos e Conteúdos
Introduzir a sintaxe básica do Python, armazenamento de dados em memória e manipulação algébrica.
- **Variáveis e Tipos Básicos**: Declaração, regras de nomeação, tipos numéricos (`int`, `float`), textuais (`str`) e booleanos (`bool`).
- **Operadores Aritméticos**: Soma (`+`), Subtração (`-`), Multiplicação (`*`), Divisão (`/`), Resto (`%`) e Potência (`**`).
- **Entrada e Saída**: O uso prático da função `print()` e a injeção da variável global de ambiente `entrada`.
- **Formatação**: Arredondamento de valores decimais utilizando `round()`.

### Exercícios Práticos
1. **Cálculo de IMC**: Uso de variáveis matemáticas básicas e exponenciação para determinar o Índice de Massa Corporal.
2. **Conversor de Temperatura**: Prática da ordem de precedência matemática utilizando parênteses.
3. **Cálculo de Desconto**: Divisão estrutural de problemas e cálculo de porcentagens sobre preços.

---

## Módulo 2 — Estruturas Condicionais

### Objetivos e Conteúdos
Garantir que o estudante compreenda fluxos de decisão e lógica booleana.
- **Controle de Fluxo**: Estruturas de decisão utilizando `if`, `elif` e `else`.
- **Comparadores Matemáticos**: Igualdade (`==`), diferença (`!=`), maior/menor ou igual (`>=`, `<=`).
- **Lógica Booleana Prática**: Avaliação de sentenças condicionais complexas e exclusão mútua em encadeamentos lógicos.

### Exercícios Práticos
1. **Verificar Maioridade**: Criação de um bloco condicional simples (`if/else`) para idades.
2. **Par ou Ímpar**: Utilização do operador de módulo (`%`) e retorno de tipos Booleanos (`True/False`).
3. **Desconto por Categoria**: Encadeamento múltiplo (`elif`) para distribuir descontos baseados em checagem de *strings*.

---

## Módulo 3 — Estruturas de Repetição (Loops)

### Objetivos e Conteúdos
Ensinar o reaproveitamento de rotinas e execução em lote.
- **Laço `while`**: Execução orientada a condições dinâmicas, sentinelas e precauções contra "loops infinitos".
- **Laço `for`**: Iteração sobre sequências delimitadas utilizando a função `range()`.
- **Contadores e Acumuladores**: Variáveis que atualizam seus próprios valores a cada ciclo iterativo (Ex: `soma += valor`).

### Exercícios Práticos
1. **Contagem Regressiva**: Utilização do laço `while` decrescente até zero para preencher uma lista.
2. **Soma até o Limite**: Combinação de um acumulador de somas com um contador de iterações em um `while` com limite dinâmico.
3. **Tabuada Completa**: Uso clássico do laço `for` atrelado ao `range(1, 11)`.

---

## Módulo 4 — Funções e Modularização

### Objetivos e Conteúdos
Apresentar a abstração e a criação de blocos de códigos reutilizáveis e autossuficientes.
- **Assinatura de Função**: Declaração de rotinas isoladas via palavra-chave `def`.
- **Escopo e Parâmetros**: Envio de argumentos para o contexto interno da função.
- **Saída de Dados (`return`)**: Transição entre imprimir no terminal e retornar efetivamente valores para o sistema avaliador.
- **Padrões de Algoritmos**: *Early return* (retorno antecipado ao encontrar o resultado).

### Exercícios Práticos
1. **Busca em Lista**: Iterar e retornar antecipadamente o índice (`enumerate()`) de um valor específico.
2. **Contagem de Vogais**: Iteração de *strings* e verificação de continência (`in`) com tratamento de capitalização (`lower()`).
3. **Lista de Status**: Transformação em massa mapeando um conjunto de notas em uma nova lista de rótulos climáticos/status.

---

## Módulo 5 — Estruturas de Dados Avançadas

### Objetivos e Conteúdos
Aprofundar nas coleções de dados, iteração complexa e otimização de processamento.
- **Manipulação de Listas**: Inserção seletiva (`append`), e acesso rápido ao primeiro/último elemento via indexação negativa.
- **Funções Integradas de Coleção**: Aproveitamento das funções hiperotimizadas nativas como `max()` e `min()`.
- **Filtros e Presença**: Padrões de filtragem condicional (`not in`) para garantir unicidade e limpeza de dados.

### Exercícios Práticos
1. **Encontrar Extremos**: Extração eficiente do menor e maior valor sem a necessidade de desenhar loops manuais.
2. **Filtrar Nomes**: Algoritmo de filtragem clássico preservando apenas itens cujo tamanho de *string* seja maior que cinco letras.
3. **Remover Duplicatas**: Algoritmo de *deduplicação* processando valores ignorando os que já foram registrados em uma lista única.

---

## Desafio Final 

O desafio final integra todos os módulos anteriores, apresentando uma estrutura de dados de nível de produção (*Lista de Dicionários*).

### Conteúdos abordados:
- Compreensão de chaves e valores estruturados.
- Desempacotamento de arrays aninhados (ex: acessar a chave `notas` de cada aluno em um loop principal).
- Agregação matemática global (Soma global cumulativa VS Contador de unidades).
- Resolução de formato de lista mista de retorno para o integrador (Float, Inteiro e Arrays agregados juntos).

### Exercício Prático:
- **Analisar Desempenho da Turma**: Dada uma lista de alunos com propriedades de idade e múltiplas notas dinâmicas, calcular a média global do sistema acadêmico, o total de alunos adultos, e extrair individualmente uma sub-lista dos alunos aprovados.
