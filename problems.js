// Currículo 2: progressão introdutória auditada (sem listas antes do módulo 4).
// Os IDs permanecem estáveis para URLs/histórico; curriculum_version distingue a nova avaliação.
// Cada tarefa sincroniza enunciado, dicas graduais, teoria, exemplo paralelo e testes.
const problems = [
  {
    "id": "m1_imc",
    "module": 1,
    "title": "Módulo 1: Dobro de um Número",
    "statement": "Seu primeiro programa!\n\nA variável `entrada` já contém um número inteiro. Crie uma variável para guardar o dobro desse número e utilize `print()` para mostrar o resultado.\n\nExemplo: se `entrada = 6`, o programa deve exibir `12`.\n\nVocê não precisa criar uma lista, ler dados com `input()` nem definir uma função: a variável `entrada` já está disponível.",
    "function_name": "",
    "tests": [
      {
        "in": 6,
        "out": 12
      },
      {
        "in": 0,
        "out": 0
      },
      {
        "in": -4,
        "out": -8
      },
      {
        "in": 15,
        "out": 30
      }
    ],
    "hints": [
      "Qual operação transforma um número em seu dobro? Pense no significado de multiplicar por 2.",
      "O número inicial já está guardado em `entrada`. Você pode armazenar o resultado em outra variável, como `dobro`.",
      "Para mostrar um valor, escreva `print(nome_da_variavel)`, substituindo pelo nome que escolheu."
    ],
    "solution": "# Exemplo do professor (diferente do desafio): calcular o TRIPLO de um número.\nnumero = entrada\ntriplo = numero * 3\nprint(triplo)",
    "constraints": [
      "Use apenas números, variáveis, multiplicação e `print()`.",
      "Exiba somente o valor do dobro, sem mensagens adicionais."
    ],
    "theory": "<p class=\"mb-3\"><strong>Variáveis</strong> guardam informações que o programa pode utilizar. Em Python, usamos <code>=</code> para atribuir um valor: <code>quantidade = 4</code>. O símbolo não significa comparação; é uma atribuição.</p>\n<p class=\"mb-3\">Com números, podemos usar <code>+</code> (somar), <code>-</code> (subtrair) e <code>*</code> (multiplicar). Por exemplo, <code>trio = quantidade * 3</code> cria uma nova variável.</p>\n<p class=\"mb-3\">A função <code>print()</code> exibe um resultado. Aqui, a variável <code>entrada</code> já foi criada pelo ambiente de exercícios; você só precisa usá-la.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m1_conversor_temp",
    "module": 1,
    "title": "Módulo 1: Converter Temperatura",
    "statement": "A variável `entrada` contém uma temperatura em graus Celsius (um número). Calcule a temperatura em Fahrenheit e mostre o resultado com `print()`.\n\nUse a fórmula matemática: Fahrenheit = Celsius × 9 ÷ 5 + 32.\n\nArredonde para **uma casa decimal** com `round(valor, 1)`.\n\nExemplo: se `entrada = 20`, a saída esperada é `68.0`.\n\nVocê continua trabalhando com **um único número**, sem listas.",
    "function_name": "",
    "tests": [
      {
        "in": 20,
        "out": 68
      },
      {
        "in": 0,
        "out": 32
      },
      {
        "in": 37,
        "out": 98.6
      },
      {
        "in": -40,
        "out": -40
      }
    ],
    "hints": [
      "Identifique a operação: primeiro multiplique Celsius por 9, depois divida por 5 e, por último, some 32.",
      "Guarde a temperatura convertida em uma variável antes de mostrá-la; parênteses podem ajudar a visualizar a conta.",
      "A função `round(numero, 1)` arredonda para uma casa decimal; use `print()` para exibir o resultado."
    ],
    "solution": "# Exemplo do professor: converter uma distância de quilômetros para metros.\nquilometros = entrada\nmetros = quilometros * 1000\nprint(round(metros, 1))",
    "constraints": [
      "Considere `entrada` como um único número em Celsius.",
      "Exiba somente o resultado numérico arredondado a uma casa decimal."
    ],
    "theory": "<p class=\"mb-3\">Um cálculo pode envolver <strong>várias operações</strong>. Em Python, <code>*</code> multiplica e <code>/</code> divide. A divisão com <code>/</code> produz um número decimal (<code>float</code>).</p>\n<p class=\"mb-3\">Multiplicações e divisões acontecem antes das somas. Os parênteses ajudam a deixar sua intenção clara.</p>\n<p class=\"mb-3\">Use <code>round(valor, 1)</code> para arredondar a uma casa decimal. <code>print()</code> mostra o resultado. O número já está na variável <code>entrada</code>.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m1_calculo_desconto",
    "module": 1,
    "title": "Módulo 1: Desconto de 10%",
    "statement": "Uma loja aplica **10% de desconto** sobre qualquer produto. A variável `entrada` já contém o preço original (um único número).\n\nCalcule o preço que a pessoa pagará depois do desconto e mostre-o com `print()`, arredondado a **duas casas decimais**.\n\nExemplo: se `entrada = 80.0`, o resultado é `72.0`.\n\nNão é necessário trabalhar com listas ou receber dados por `input()`.",
    "function_name": "",
    "tests": [
      {
        "in": 80,
        "out": 72
      },
      {
        "in": 100,
        "out": 90
      },
      {
        "in": 50,
        "out": 45
      },
      {
        "in": 0,
        "out": 0
      },
      {
        "in": 49.9,
        "out": 44.91
      }
    ],
    "hints": [
      "De cada R$ 100,00, a loja desconta R$ 10,00. Que fração do preço isso representa?",
      "Você pode calcular o desconto e depois subtraí-lo do preço original, usando variáveis intermediárias.",
      "Multiplique por `10 / 100` para calcular dez por cento; `round(valor, 2)` arredonda para duas casas."
    ],
    "solution": "# Exemplo do professor: adicionar taxa de serviço de 5% a um valor.\nvalor = entrada\ntaxa = valor * (5 / 100)\ntotal = valor + taxa\nprint(round(total, 2))",
    "constraints": [
      "O desconto é sempre 10% sobre o número único em `entrada`.",
      "Imprima somente o preço final, arredondado a duas casas decimais."
    ],
    "theory": "<p class=\"mb-3\">Porcentagem representa uma parte de 100. Para descobrir 10% de um número, multiplicamos esse número por <code>10 / 100</code>.</p>\n<p class=\"mb-3\">Uma solução pode ser construída em <strong>etapas</strong>: guardar o valor original, calcular uma parcela e obter um novo total. Dar nomes significativos às variáveis ajuda a compreender as contas.</p>\n<p class=\"mb-3\">Em operações com dinheiro, é comum usar <code>round(valor, 2)</code> para duas casas decimais. O exercício recebe um <strong>valor único</strong> pela variável <code>entrada</code>.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m2_maioridade",
    "module": 2,
    "title": "Módulo 2: Verificar Maioridade",
    "statement": "A variável `entrada` contém a idade de uma pessoa (número inteiro). Mostre exatamente `Maior de idade` quando a idade for **18 ou mais**, e `Menor de idade` nos outros casos.\n\nExemplos: `entrada = 18` → `Maior de idade`; `entrada = 17` → `Menor de idade`.\n\nUse uma decisão com `if` e `else`.",
    "function_name": "",
    "tests": [
      {
        "in": 18,
        "out": "Maior de idade"
      },
      {
        "in": 17,
        "out": "Menor de idade"
      },
      {
        "in": 0,
        "out": "Menor de idade"
      },
      {
        "in": 35,
        "out": "Maior de idade"
      }
    ],
    "hints": [
      "A condição precisa comparar a idade com 18. Pense no que deve ocorrer quando a idade for exatamente 18.",
      "O operador `>=` significa 'maior ou igual'; `if` decide qual bloco executar.",
      "No `else`, trate o caso em que a condição anterior não é verdadeira. Observe os dois-pontos e a indentação."
    ],
    "solution": "# Exemplo do professor: verificar acesso a um brinquedo com altura mínima de 120 cm.\nif entrada >= 120:\n    print('Pode entrar')\nelse:\n    print('Altura insuficiente')",
    "constraints": [
      "Exiba exatamente uma das duas frases do enunciado.",
      "Considere que 18 anos já representa maioridade."
    ],
    "theory": "<p class=\"mb-3\">Programas usam <strong>condicionais</strong> para tomar decisões. A instrução <code>if</code> executa um bloco quando a condição é verdadeira; <code>else</code> cobre a alternativa.</p>\n<p class=\"mb-3\">O operador <code>&gt;=</code> significa 'maior ou igual'. Em <code>if saldo &gt;= 10:</code>, a condição é verdadeira para 10 e valores maiores.</p>\n<p class=\"mb-3\">Os dois-pontos <code>:</code> iniciam um bloco e a indentação (quatro espaços) marca as linhas que pertencem a ele.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m2_par_impar",
    "module": 2,
    "title": "Módulo 2: Número Par ou Ímpar",
    "statement": "A variável `entrada` contém um número inteiro. Mostre exatamente `Par` se o número for divisível por 2; caso contrário, mostre `Impar` (sem acento).\n\nExemplos: `entrada = 8` → `Par`; `entrada = 7` → `Impar`.\n\nUse `if` e `else` com o operador de resto `%`.",
    "function_name": "",
    "tests": [
      {
        "in": 8,
        "out": "Par"
      },
      {
        "in": 7,
        "out": "Impar"
      },
      {
        "in": 0,
        "out": "Par"
      },
      {
        "in": -4,
        "out": "Par"
      },
      {
        "in": -5,
        "out": "Impar"
      }
    ],
    "hints": [
      "Um número é par quando a divisão dele por 2 não deixa resto.",
      "O operador `%` calcula o resto: por exemplo, `7 % 3` resulta em 1.",
      "Compare o resto com zero usando `==` e mostre a frase correspondente em cada ramo."
    ],
    "solution": "# Exemplo do professor: mostrar se um número é múltiplo de 3.\nif entrada % 3 == 0:\n    print('Multiplo de 3')\nelse:\n    print('Nao multiplo de 3')",
    "constraints": [
      "Exiba somente `Par` ou `Impar`, sem outras palavras.",
      "Trate zero e números negativos como números inteiros."
    ],
    "theory": "<p class=\"mb-3\">O operador <strong>resto</strong> <code>%</code> informa quanto sobra de uma divisão inteira: <code>10 % 3</code> é 1.</p>\n<p class=\"mb-3\">Podemos usar <code>==</code> para verificar se dois valores são iguais. Atenção: <code>=</code> atribui valores, enquanto <code>==</code> compara.</p>\n<p class=\"mb-3\">Condições simples com <code>if</code> e <code>else</code> classificam dados em dois grupos.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m2_desconto_categoria",
    "module": 2,
    "title": "Módulo 2: Classificação de Pontuação",
    "statement": "Um jogo atribui uma pontuação inteira de 0 a 100, já armazenada em `entrada`. Mostre exatamente uma classificação:\n\n- Menor que 40: `Iniciante`\n- De 40 até 69: `Intermediario`\n- A partir de 70: `Avancado`\n\nExemplos: `entrada = 25` → `Iniciante`; `entrada = 70` → `Avancado`.\n\nUse `if`, `elif` e `else`. Não há listas neste exercício.",
    "function_name": "",
    "tests": [
      {
        "in": 0,
        "out": "Iniciante"
      },
      {
        "in": 39,
        "out": "Iniciante"
      },
      {
        "in": 40,
        "out": "Intermediario"
      },
      {
        "in": 69,
        "out": "Intermediario"
      },
      {
        "in": 70,
        "out": "Avancado"
      },
      {
        "in": 100,
        "out": "Avancado"
      }
    ],
    "hints": [
      "Há três resultados possíveis. Qual faixa deve ser testada primeiro?",
      "Se a pontuação já não é menor que 40, o próximo teste pode comparar com 70.",
      "Use `elif` para a segunda condição; `else` trata a faixa restante, sem repetir todas as comparações."
    ],
    "solution": "# Exemplo do professor: classificar o nível de bateria de um dispositivo.\nif entrada < 20:\n    print('Baixa')\nelif entrada < 80:\n    print('Media')\nelse:\n    print('Alta')",
    "constraints": [
      "A entrada é um único inteiro de 0 a 100.",
      "Use as grafias exatas: `Iniciante`, `Intermediario`, `Avancado`."
    ],
    "theory": "<p class=\"mb-3\">Quando há mais de dois caminhos, podemos usar <strong><code>if</code>, <code>elif</code> e <code>else</code></strong>. As condições são avaliadas de cima para baixo.</p>\n<p class=\"mb-3\">Ao encontrar a primeira condição verdadeira, Python executa aquele bloco e ignora os demais. Por isso, a <strong>ordem dos limites</strong> é importante.</p>\n<p class=\"mb-3\">Uma faixa pode ser reconhecida sem duas comparações: se o primeiro caso já foi descartado, o <code>elif</code> sabe que esse limite inferior ficou para trás.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m3_contagem",
    "module": 3,
    "title": "Módulo 3: Contagem Regressiva",
    "statement": "A variável `entrada` contém um número inteiro **não negativo**. Use um laço `while` para mostrar uma contagem regressiva desse número até 1, com **um número por linha**.\n\nExemplo: se `entrada = 3`, a saída deverá ser:\n`3`\n`2`\n`1`\n\nSe `entrada = 0`, não mostre nada. Não é preciso criar uma lista.",
    "function_name": "",
    "tests": [
      {
        "in": 3,
        "out": "3\n2\n1"
      },
      {
        "in": 1,
        "out": "1"
      },
      {
        "in": 0,
        "out": ""
      },
      {
        "in": 5,
        "out": "5\n4\n3\n2\n1"
      }
    ],
    "hints": [
      "A repetição deve continuar enquanto o contador for maior que zero.",
      "Comece com o valor recebido em `entrada`. A cada volta, mostre o número atual.",
      "Lembre-se de diminuir o contador a cada repetição para o `while` terminar."
    ],
    "solution": "# Exemplo do professor: contar para cima de 1 até o limite recebido.\ncontador = 1\nwhile contador <= entrada:\n    print(contador)\n    contador += 1",
    "constraints": [
      "Mostre um inteiro por linha, do valor inicial até 1.",
      "Não crie uma lista; utilize `while` e atualize o contador.",
      "Para entrada zero, a saída deve ficar vazia."
    ],
    "theory": "<p class=\"mb-3\">O laço <code>while</code> repete um bloco enquanto uma condição é verdadeira. Ele é útil quando precisamos verificar continuamente se ainda podemos continuar.</p>\n<p class=\"mb-3\">O laço costuma ter três partes: valor inicial, condição e atualização. Sem atualizar o valor, a repetição pode se tornar infinita.</p>\n<p class=\"mb-3\">Cada chamada a <code>print()</code> produz uma nova linha. Não precisamos construir uma lista para exibir uma sequência.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m3_soma_limite",
    "module": 3,
    "title": "Módulo 3: Somar de 1 até N",
    "statement": "A variável `entrada` contém um inteiro **não negativo**. Some todos os números inteiros de 1 até `entrada`, incluindo o próprio limite, usando um laço `while`. Ao final, mostre **somente a soma** com `print()`.\n\nExemplo: `entrada = 4` → `10`, porque 1 + 2 + 3 + 4 = 10.\n\nSe `entrada = 0`, a resposta é `0`.",
    "function_name": "",
    "tests": [
      {
        "in": 0,
        "out": 0
      },
      {
        "in": 1,
        "out": 1
      },
      {
        "in": 4,
        "out": 10
      },
      {
        "in": 5,
        "out": 15
      },
      {
        "in": 10,
        "out": 55
      }
    ],
    "hints": [
      "Você precisa de duas variáveis: um número que percorre a sequência e outra que acumula o total.",
      "O acumulador pode começar em zero, pois ainda não somamos nada.",
      "A cada volta do `while`, atualize o total e avance para o próximo inteiro. Pare depois de incluir o limite."
    ],
    "solution": "# Exemplo do professor: calcular a soma dos números pares até o limite.\ncontador = 2\ntotal = 0\nwhile contador <= entrada:\n    total += contador\n    contador += 2\nprint(total)",
    "constraints": [
      "Utilize um laço `while` e um acumulador.",
      "Exiba apenas o valor da soma.",
      "A entrada é um único inteiro, não uma lista."
    ],
    "theory": "<p class=\"mb-3\">Um <strong>acumulador</strong> guarda um resultado parcial que cresce durante a repetição. Uma soma normalmente começa com zero.</p>\n<p class=\"mb-3\">Um <strong>contador</strong> indica qual passo estamos processando. Podemos usar <code>contador += 1</code> para avançá-lo e <code>total += contador</code> para acrescentar valores.</p>\n<p class=\"mb-3\">Antes de escrever um laço, simule-o no papel para uma entrada pequena: quais valores estão guardados após cada iteração?</p>",
    "curriculum_version": 2
  },
  {
    "id": "m3_tabuada",
    "module": 3,
    "title": "Módulo 3: Tabuada de 1 a 5",
    "statement": "A variável `entrada` contém um número inteiro. Use o laço `for` e `range()` para mostrar os resultados de multiplicar esse número por **1, 2, 3, 4 e 5**, com **um resultado por linha**.\n\nExemplo: `entrada = 3` deve mostrar:\n`3`\n`6`\n`9`\n`12`\n`15`\n\nNão é necessário montar uma lista.",
    "function_name": "",
    "tests": [
      {
        "in": 3,
        "out": "3\n6\n9\n12\n15"
      },
      {
        "in": 1,
        "out": "1\n2\n3\n4\n5"
      },
      {
        "in": 0,
        "out": "0\n0\n0\n0\n0"
      },
      {
        "in": -2,
        "out": "-2\n-4\n-6\n-8\n-10"
      }
    ],
    "hints": [
      "O laço `for` permite percorrer um conjunto de valores conhecidos.",
      "Lembre que o último argumento de `range(inicio, fim)` não entra na sequência.",
      "Em cada volta, multiplique o número recebido pelo valor atual do laço e mostre o produto."
    ],
    "solution": "# Exemplo do professor: mostrar o quadrado dos números de 1 a 3.\nfor numero in range(1, 4):\n    print(numero * numero)",
    "constraints": [
      "Use `for` e `range()` para percorrer de 1 a 5.",
      "Mostre cinco resultados, um por linha.",
      "Não é necessário usar listas."
    ],
    "theory": "<p class=\"mb-3\">O laço <strong><code>for</code></strong> percorre uma sequência de valores. Com <code>range(1, 4)</code>, os valores são 1, 2 e 3.</p>\n<p class=\"mb-3\">O limite superior de <code>range()</code> não está incluído. Para repetir uma quantidade conhecida de vezes, essa estrutura costuma ser mais simples que <code>while</code>.</p>\n<p class=\"mb-3\">Você pode calcular e mostrar um resultado em cada volta do <code>for</code>. Cada <code>print()</code> escreve uma linha.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m4_busca_linear",
    "module": 4,
    "title": "Módulo 4: Primeiro Elemento de uma Lista",
    "statement": "Agora vamos começar a trabalhar com listas e funções.\n\nCrie uma função chamada `m4_primeiro_elemento(lista)` que recebe uma **lista de números** e devolve o **primeiro elemento** usando `return`.\n\nSe a lista estiver vazia, devolva `None` (sem aspas).\n\nExemplos: `m4_primeiro_elemento([7, 9, 2])` → `7`; `m4_primeiro_elemento([])` → `None`.\n\nDesta vez, use `return`, não `print()`.",
    "function_name": "m4_primeiro_elemento",
    "tests": [
      {
        "in": [
          7,
          9,
          2
        ],
        "out": 7
      },
      {
        "in": [
          4
        ],
        "out": 4
      },
      {
        "in": [
          0,
          -2,
          8
        ],
        "out": 0
      },
      {
        "in": [],
        "out": null
      }
    ],
    "hints": [
      "O primeiro elemento de uma lista está na posição zero.",
      "Antes de acessar uma posição, pense no que acontece se a lista não tiver elementos.",
      "Você pode verificar `if not lista:` e usar `return` para devolver um valor; para o caso comum, acesse o índice inicial."
    ],
    "solution": "# Exemplo do professor: retornar o ÚLTIMO item de uma lista.\ndef ultimo_elemento(lista):\n    if not lista:\n        return None\n    return lista[-1]",
    "constraints": [
      "A função deve se chamar exatamente `m4_primeiro_elemento`.",
      "Use `return`, não `print()`.",
      "Retorne `None` quando a lista estiver vazia."
    ],
    "theory": "<p class=\"mb-3\"><strong>Listas</strong> agrupam valores em uma sequência: <code>numeros = [4, 9, 2]</code>. Os índices começam em zero; <code>numeros[0]</code> vale 4.</p>\n<p class=\"mb-3\"><strong>Funções</strong> recebem dados por parâmetros e podem devolver um resultado. Sua estrutura começa com <code>def nome(parametro):</code>. O conteúdo é indentado.</p>\n<p class=\"mb-3\">Use <code>return</code> para devolver o valor da função. Uma lista vazia (<code>[]</code>) não tem primeiro item; podemos testar <code>if not lista:</code> antes do acesso.</p>\n<p class=\"mb-3\">Neste módulo, o sistema verifica o <strong>retorno da função</strong>; imprimir o resultado não é suficiente.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m4_contagem_vogais",
    "module": 4,
    "title": "Módulo 4: Contar Vogais de um Texto",
    "statement": "Implemente a função `m4_contagem_vogais(texto)` que recebe uma **string** e retorna quantas vogais `a, e, i, o, u` existem nela.\n\nMaiúsculas e minúsculas contam igualmente. Neste exercício, considere apenas as cinco vogais sem acento.\n\nExemplo: `m4_contagem_vogais('Abacaxi')` deve retornar `4`.\n\nUse `return`, não `print()`.",
    "function_name": "m4_contagem_vogais",
    "tests": [
      {
        "in": "Abacaxi",
        "out": 4
      },
      {
        "in": "Python",
        "out": 1
      },
      {
        "in": "AEIOU",
        "out": 5
      },
      {
        "in": "bc dfg",
        "out": 0
      },
      {
        "in": "",
        "out": 0
      },
      {
        "in": "Educação",
        "out": 4
      }
    ],
    "hints": [
      "Você pode percorrer as letras de uma string usando um `for`.",
      "Crie um contador iniciado em zero e acrescente um quando encontrar uma vogal.",
      "Para ignorar letras maiúsculas, use `.lower()` no texto. O operador `in` verifica se uma letra pertence à sequência `'aeiou'`."
    ],
    "solution": "# Exemplo do professor: contar algarismos dentro de um texto.\ndef contar_digitos(texto):\n    contador = 0\n    for caractere in texto:\n        if caractere in '0123456789':\n            contador += 1\n    return contador",
    "constraints": [
      "Retorne um número inteiro com `return`.",
      "Considere `a, e, i, o, u` sem acentos e ignore diferenças de maiúsculas."
    ],
    "theory": "<p class=\"mb-3\">Uma <strong>string</strong> é uma sequência de caracteres. Podemos percorrê-la com <code>for letra in palavra:</code>, observando cada letra por vez.</p>\n<p class=\"mb-3\">Usamos <code>in</code> para verificar a presença de um caractere em um texto: <code>'e' in 'elefante'</code> é verdadeiro.</p>\n<p class=\"mb-3\">O método <code>.lower()</code> transforma letras em minúsculas, permitindo uma comparação única para 'A' e 'a'. Um contador soma ocorrências; uma função devolve o resultado por <code>return</code>.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m4_status_nota",
    "module": 4,
    "title": "Módulo 4: Classificar uma Lista de Notas",
    "statement": "Crie a função `m4_status_nota(notas)` que recebe uma **lista de números** e devolve uma **nova lista de textos**, com um resultado para cada nota:\n\n- Nota maior ou igual a 7: `Aprovado`\n- Nota de 5 até menos de 7: `Recuperacao`\n- Nota menor que 5: `Reprovado`\n\nExemplo: `m4_status_nota([8.5, 6.0, 4.0])` → `['Aprovado', 'Recuperacao', 'Reprovado']`.\n\nSe a lista de entrada estiver vazia, devolva `[]`.",
    "function_name": "m4_status_nota",
    "tests": [
      {
        "in": [
          8.5,
          6,
          4
        ],
        "out": [
          "Aprovado",
          "Recuperacao",
          "Reprovado"
        ]
      },
      {
        "in": [
          10,
          7
        ],
        "out": [
          "Aprovado",
          "Aprovado"
        ]
      },
      {
        "in": [
          4.9,
          5,
          6.99,
          7
        ],
        "out": [
          "Reprovado",
          "Recuperacao",
          "Recuperacao",
          "Aprovado"
        ]
      },
      {
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "O resultado deve ter a mesma quantidade de elementos que a lista original.",
      "Crie uma lista vazia e percorra cada nota com `for`.",
      "Dentro do laço, teste as faixas em ordem com `if`, `elif` e `else`, e use `.append()` para registrar o status."
    ],
    "solution": "# Exemplo do professor: transformar temperaturas em sensações.\ndef sensacoes(temperaturas):\n    saida = []\n    for temp in temperaturas:\n        if temp >= 30:\n            saida.append('Quente')\n        elif temp >= 18:\n            saida.append('Agradavel')\n        else:\n            saida.append('Frio')\n    return saida",
    "constraints": [
      "Retorne uma nova lista de strings na mesma ordem das notas.",
      "Use as grafias exatas: `Aprovado`, `Recuperacao`, `Reprovado`."
    ],
    "theory": "<p class=\"mb-3\">O método <code>.append(valor)</code> acrescenta um elemento ao final de uma lista. É útil para criar uma nova sequência a partir de outra.</p>\n<p class=\"mb-3\">Uma <strong>transformação</strong> percorre cada item de entrada e registra um item correspondente no resultado. Um laço <code>for</code> pode combinar o percurso com condições.</p>\n<p class=\"mb-3\">Em regras por faixa, trate os limites com atenção. Depois de construir a nova lista, devolva-a com <code>return</code>.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m5_extremos",
    "module": 5,
    "title": "Módulo 5: Menor e Maior Valor",
    "statement": "Implemente a função `m5_extremos(lista)` que recebe uma lista de números e devolve outra lista contendo o **menor valor** e depois o **maior valor**.\n\nExemplo: `m5_extremos([5, 2, 9, 4])` → `[2, 9]`.\n\nSe a lista estiver vazia, retorne `[]`. A lista também pode conter números negativos.",
    "function_name": "m5_extremos",
    "tests": [
      {
        "in": [
          5,
          2,
          9,
          4
        ],
        "out": [
          2,
          9
        ]
      },
      {
        "in": [
          -9,
          -1,
          -4
        ],
        "out": [
          -9,
          -1
        ]
      },
      {
        "in": [
          8,
          8,
          8
        ],
        "out": [
          8,
          8
        ]
      },
      {
        "in": [
          3
        ],
        "out": [
          3,
          3
        ]
      },
      {
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "Primeiro trate a lista vazia; nesse caso, não existe mínimo ou máximo.",
      "Pense como compararia dois valores para decidir qual é menor e qual é maior.",
      "Você pode atualizar duas variáveis durante um `for`; Python também oferece `min()` e `max()` quando uma lista não é vazia."
    ],
    "solution": "# Exemplo do professor: retornar a DIFERENÇA entre maior e menor valor.\ndef amplitude(numeros):\n    if not numeros:\n        return 0\n    return max(numeros) - min(numeros)",
    "constraints": [
      "O resultado deve seguir a ordem `[menor, maior]`.",
      "Trate lista vazia e listas com um único número.",
      "Considere números negativos."
    ],
    "theory": "<p class=\"mb-3\">Ao percorrer uma coleção, podemos procurar <strong>valores extremos</strong>: o maior e o menor. É possível fazer isso com comparações sucessivas, guardando o melhor valor encontrado até cada momento.</p>\n<p class=\"mb-3\">Python também fornece funções integradas <code>min(lista)</code> e <code>max(lista)</code> para coleções não vazias.</p>\n<p class=\"mb-3\">Antes de calcular extremos, é essencial tratar o caso da lista vazia. Se a lista tiver apenas um valor, ele será o menor e o maior ao mesmo tempo.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m5_filtrar_nomes",
    "module": 5,
    "title": "Módulo 5: Filtrar Nomes",
    "statement": "Implemente a função `m5_filtrar_nomes(nomes)` que recebe uma lista de palavras e retorna uma **nova lista** somente com os nomes que têm **pelo menos cinco caracteres**.\n\nMantenha a ordem original. Não altere a lista de entrada.\n\nExemplo: `m5_filtrar_nomes(['Ana', 'Carlos', 'João', 'Beatriz'])` → `['Carlos', 'Beatriz']`.",
    "function_name": "m5_filtrar_nomes",
    "tests": [
      {
        "in": [
          "Ana",
          "Carlos",
          "João",
          "Beatriz"
        ],
        "out": [
          "Carlos",
          "Beatriz"
        ]
      },
      {
        "in": [
          "Leo",
          "Max",
          "Mia"
        ],
        "out": []
      },
      {
        "in": [
          "Pedro",
          "Maria"
        ],
        "out": [
          "Pedro",
          "Maria"
        ]
      },
      {
        "in": [
          "Alana",
          "A",
          "Sofia",
          "Ana"
        ],
        "out": [
          "Alana",
          "Sofia"
        ]
      },
      {
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "Pense em como percorrer todos os nomes, sem escolher apenas um deles.",
      "A função `len(texto)` informa a quantidade de caracteres de uma string.",
      "Guarde em uma nova lista somente os nomes que passam pelo teste e devolva essa lista."
    ],
    "solution": "# Exemplo do professor: filtrar números maiores que 10.\ndef maiores_que_dez(numeros):\n    filtrados = []\n    for numero in numeros:\n        if numero > 10:\n            filtrados.append(numero)\n    return filtrados",
    "constraints": [
      "Use a quantidade de caracteres, não o número de palavras.",
      "Retorne uma nova lista preservando a ordem original."
    ],
    "theory": "<p class=\"mb-3\"><strong>Filtrar</strong> significa selecionar apenas os elementos que cumprem uma condição, preservando a ordem dos selecionados.</p>\n<p class=\"mb-3\">A função <code>len()</code> conta caracteres de uma string e elementos de uma lista. Podemos compará-la com um limite dentro de <code>if</code>.</p>\n<p class=\"mb-3\">O padrão mais comum é criar uma lista de resultados, percorrer os dados com <code>for</code> e adicionar somente os itens desejados com <code>.append()</code>.</p>",
    "curriculum_version": 2
  },
  {
    "id": "m5_remover_duplicatas",
    "module": 5,
    "title": "Módulo 5: Remover Números Repetidos",
    "statement": "Implemente a função `m5_remover_duplicatas(lista)` que recebe uma lista de números inteiros e devolve uma nova lista sem repetições, mantendo a **primeira ocorrência** de cada valor na ordem original.\n\nExemplo: `m5_remover_duplicatas([1, 2, 2, 3, 1])` → `[1, 2, 3]`.\n\nSe a entrada for vazia, devolva `[]`.",
    "function_name": "m5_remover_duplicatas",
    "tests": [
      {
        "in": [
          1,
          2,
          2,
          3,
          1
        ],
        "out": [
          1,
          2,
          3
        ]
      },
      {
        "in": [
          5,
          5,
          5
        ],
        "out": [
          5
        ]
      },
      {
        "in": [
          1,
          2,
          3
        ],
        "out": [
          1,
          2,
          3
        ]
      },
      {
        "in": [
          -1,
          0,
          -1,
          0
        ],
        "out": [
          -1,
          0
        ]
      },
      {
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "Percorra a lista do começo ao fim e construa outra lista para o resultado.",
      "Antes de adicionar um valor, pergunte se ele já apareceu na sua lista de resultados.",
      "O operador `not in` verifica se o valor está ausente; use essa condição antes de `.append()`."
    ],
    "solution": "# Exemplo do professor: guardar letras distintas de uma palavra, na ordem.\ndef letras_distintas(palavra):\n    resultado = []\n    for letra in palavra:\n        if letra not in resultado:\n            resultado.append(letra)\n    return resultado",
    "constraints": [
      "Preserve a ordem da primeira ocorrência.",
      "Não modifique a lista original.",
      "A função deve retornar uma nova lista."
    ],
    "theory": "<p class=\"mb-3\">Uma <strong>lista sem duplicatas</strong> mantém um único exemplar de cada valor. Se a ordem importa, precisamos lembrar a primeira vez que cada valor apareceu.</p>\n<p class=\"mb-3\">A expressão <code>valor not in valores</code> é verdadeira quando <code>valor</code> não faz parte da coleção.</p>\n<p class=\"mb-3\">Percorrer, verificar e adicionar são três passos de raciocínio que podem ser escritos dentro de um <code>for</code>. Para este nível, uma lista de resultados é suficiente.</p>",
    "curriculum_version": 2
  },
  {
    "id": "analisar_turma",
    "module": "final",
    "title": "Desafio Final: Resumo de Notas da Turma",
    "statement": "Chegou a hora de combinar o que você aprendeu: variáveis, operações, condicionais, laços, listas e funções.\n\nCrie a função `analisar_turma(notas)` que recebe uma **lista de notas** de 0 a 10. Ela deve devolver uma lista com **dois valores nesta ordem**:\n\n1. A média aritmética das notas, arredondada a uma casa decimal.\n2. A quantidade de notas maiores ou iguais a 7 (aprovados).\n\nExemplo: `analisar_turma([8, 6, 7])` → `[7.0, 2]`.\n\nSe não houver notas (`[]`), devolva `[0.0, 0]`. Não há dicionários ou estruturas ainda não ensinadas.",
    "function_name": "analisar_turma",
    "tests": [
      {
        "in": [
          8,
          6,
          7
        ],
        "out": [
          7,
          2
        ]
      },
      {
        "in": [
          10,
          5,
          9,
          6
        ],
        "out": [
          7.5,
          2
        ]
      },
      {
        "in": [
          6,
          6,
          6
        ],
        "out": [
          6,
          0
        ]
      },
      {
        "in": [
          7
        ],
        "out": [
          7,
          1
        ]
      },
      {
        "in": [],
        "out": [
          0,
          0
        ]
      },
      {
        "in": [
          8.5,
          6.5
        ],
        "out": [
          7.5,
          1
        ]
      }
    ],
    "hints": [
      "O que deve acontecer se a lista estiver vazia? Trate esse caso antes de dividir valores.",
      "Você pode percorrer as notas acumulando a soma e contando quantas atingem o limite da aprovação.",
      "A média é a soma dividida pela quantidade de notas. Lembre-se de arredondar a uma casa e retornar uma lista com os dois valores."
    ],
    "solution": "# Exemplo do professor: resumir uma lista de preços com total e quantidade de itens caros.\ndef resumir_precos(precos):\n    total = 0\n    caros = 0\n    for preco in precos:\n        total += preco\n        if preco > 50:\n            caros += 1\n    return [round(total, 1), caros]",
    "constraints": [
      "Retorne `[media, total_aprovados]`, com média arredondada a uma casa.",
      "Em lista vazia, retorne `[0.0, 0]`.",
      "Não utilize dicionários: a entrada é apenas uma lista de notas."
    ],
    "theory": "<p class=\"mb-3\">O desafio final integra conceitos trabalhados na trilha, sem introduzir novas estruturas. Uma <strong>função</strong> recebe uma lista e retorna um resultado.</p>\n<p class=\"mb-3\">A <strong>média aritmética</strong> é a soma dos valores dividida pela quantidade deles. Um acumulador pode somar as notas durante um <code>for</code>; um contador separado pode registrar quantas atendem a uma condição.</p>\n<p class=\"mb-3\">Para evitar divisão por zero, trate <code>if not notas:</code> antes de calcular a média. A lista de retorno deve manter a ordem definida no enunciado e pode conter valores de tipos diferentes.</p>",
    "curriculum_version": 2
  }
];

// Exporta caso seja usado em ambientes node/testes, mas deixa global no navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { problems };
}
