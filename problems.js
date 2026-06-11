// Base de dados de problemas do AI Programming Tutor
const problems = [
  {
    "id": "m1_imc",
    "module": 1,
    "title": "M\u00f3dulo 1: C\u00e1lculo de IMC",
    "statement": "Escreva um script que receba os dados por meio da vari\u00e1vel global `entrada` (uma lista contendo o peso em kg e a altura em metros, nessa ordem). Calcule e utilize a fun\u00e7\u00e3o `print()` para exibir o \u00cdndice de Massa Corporal (IMC) arredondado para duas casas decimais.\n\nF\u00f3rmula: IMC = peso / (altura * altura)\n\nExemplo:\nSe `entrada = [70.0, 1.75]`, seu programa deve exibir `22.86`.",
    "function_name": "",
    "tests": [
      {
        "in": [
          70.0,
          1.75
        ],
        "out": 22.86
      },
      {
        "in": [
          85.5,
          1.8
        ],
        "out": 26.39
      },
      {
        "in": [
          50.0,
          1.6
        ],
        "out": 19.53
      },
      {
        "in": [
          100.0,
          2.0
        ],
        "out": 25.0
      }
    ],
    "hints": [
      "A lista 'entrada' tem o peso no \u00edndice 0 e a altura no \u00edndice 1.",
      "Calcule a altura ao quadrado usando 'altura * altura' ou 'altura ** 2'.",
      "Use a fun\u00e7\u00e3o built-in 'round(valor, 2)' para arredondar para duas casas decimais."
    ],
    "solution": "# Exemplo: Calcular a velocidade m\u00e9dia de uma viagem\n# Considere que 'entrada' traz [distancia_km, tempo_horas]\n\ndistancia = entrada[0]\ntempo = entrada[1]\nvelocidade = distancia / tempo\n\nprint(round(velocidade, 2))",
    "constraints": [
      "Imprima um float arredondado.",
      "Use apenas vari\u00e1veis e opera\u00e7\u00f5es aritm\u00e9ticas simples."
    ],
    "theory": "\n          <p class=\"mb-3\">Em Python, os tipos de dados b\u00e1sicos incluem <strong>inteiros (int)</strong> e <strong>n\u00fameros decimais (float)</strong>. Para opera\u00e7\u00f5es matem\u00e1ticas, utilizamos os operadores b\u00e1sicos:</p>\n          <ul class=\"list-disc list-inside space-y-1 mb-3 text-slate-600 font-medium\">\n            <li><code>+</code> para soma</li>\n            <li><code>-</code> para subtra\u00e7\u00e3o</li>\n            <li><code>*</code> para multiplica\u00e7\u00e3o</li>\n            <li><code>/</code> para divis\u00e3o (sempre resulta em float)</li>\n            <li><code>**</code> para exponencia\u00e7\u00e3o (ex: <code>altura ** 2</code>)</li>\n          </ul>\n          <p class=\"mb-3\">Para exibir um valor na tela, utilizamos a fun\u00e7\u00e3o <code>print(resultado)</code>. Para extrair valores de uma lista (como os dados vindos em <code>entrada</code>), usamos o <strong>\u00edndice</strong> num\u00e9rico que come\u00e7a em 0. Portanto, <code>entrada[0]</code> pega o primeiro elemento e <code>entrada[1]</code> o segundo.</p>\n        "
  },
  {
    "id": "m1_conversor_temp",
    "module": 1,
    "title": "M\u00f3dulo 1: Conversor de Temperatura",
    "statement": "Escreva um script que leia a vari\u00e1vel global `entrada` (indicando uma temperatura em graus Celsius) e calcule o valor correspondente em Fahrenheit. Utilize a fun\u00e7\u00e3o `print()` para exibir o resultado arredondado para uma casa decimal.\n\nF\u00f3rmula: F = (C * 9/5) + 32\n\nExemplo:\nSe `entrada = 25.0`, exiba `77.0`.",
    "function_name": "",
    "tests": [
      {
        "in": 25.0,
        "out": 77.0
      },
      {
        "in": 0.0,
        "out": 32.0
      },
      {
        "in": 100.0,
        "out": 212.0
      },
      {
        "in": -10.0,
        "out": 14.0
      }
    ],
    "hints": [
      "Multiplique a temperatura em Celsius por 9/5 (que \u00e9 1.8).",
      "Some 32 ao resultado.",
      "Use 'print(round(valor, 1))' para imprimir."
    ],
    "solution": "# Exemplo: Convers\u00e3o de Moedas (Reais para D\u00f3lares)\n# A 'entrada' tem o valor em reais\n\ntaxa_cambio = 5.0\ndolares = entrada / taxa_cambio\n\nprint(round(dolares, 1))",
    "constraints": [
      "Imprima um float arredondado com uma casa decimal."
    ],
    "theory": "\n          <p class=\"mb-3\">As opera\u00e7\u00f5es em Python seguem a <strong>ordem de preced\u00eancia matem\u00e1tica</strong>. Multiplica\u00e7\u00f5es e divis\u00f5es s\u00e3o resolvidas antes de somas e subtra\u00e7\u00f5es.</p>\n          <p class=\"mb-3\">Voc\u00ea pode usar par\u00eanteses <code>()</code> para garantir que uma opera\u00e7\u00e3o seja feita antes da outra, como em <code>(C * 9/5) + 32</code>. Embora neste caso a multiplica\u00e7\u00e3o j\u00e1 acontecesse primeiro, os par\u00eanteses ajudam na legibilidade do c\u00f3digo.</p>\n        "
  },
  {
    "id": "m1_calculo_desconto",
    "module": 1,
    "title": "M\u00f3dulo 1: C\u00e1lculo de Desconto",
    "statement": "Escreva um script que leia a vari\u00e1vel `entrada` (uma lista com dois valores: o pre\u00e7o original de um produto e a porcentagem de desconto). Calcule e utilize `print()` para exibir o pre\u00e7o final ap\u00f3s aplicar o desconto (arredondado para duas casas decimais).\n\nExemplo: Se o pre\u00e7o for 100.0 e o desconto 15.0%, o valor descontado \u00e9 15.0, e o pre\u00e7o final \u00e9 85.0.\n\nSe `entrada = [100.0, 15.0]`, o programa deve exibir `85.0`.",
    "function_name": "",
    "tests": [
      {
        "in": [
          100.0,
          15.0
        ],
        "out": 85.0
      },
      {
        "in": [
          50.0,
          10.0
        ],
        "out": 45.0
      },
      {
        "in": [
          200.0,
          25.0
        ],
        "out": 150.0
      },
      {
        "in": [
          99.9,
          0.0
        ],
        "out": 99.9
      }
    ],
    "hints": [
      "Acesse entrada[0] e entrada[1].",
      "Encontre o valor monet\u00e1rio do desconto multiplicando o pre\u00e7o pela porcentagem e dividindo por 100.",
      "Subtraia esse valor monet\u00e1rio do pre\u00e7o original e fa\u00e7a print."
    ],
    "solution": "# Exemplo: Calcular o valor da gorjeta em um restaurante\n# Considere que 'entrada' traz [valor_da_conta, porcentagem_gorjeta]\n\nconta = entrada[0]\nporcentagem = entrada[1]\n\nvalor_gorjeta = conta * (porcentagem / 100)\ntotal_a_pagar = conta + valor_gorjeta\n\nprint(round(total_a_pagar, 2))",
    "constraints": [
      "Imprima o valor com precis\u00e3o de duas casas decimais."
    ],
    "theory": "\n          <p class=\"mb-3\">Criar <strong>vari\u00e1veis com nomes descritivos</strong> \u00e9 uma pr\u00e1tica essencial. Em vez de calcular tudo em uma \u00fanica linha complexa, dividir o racioc\u00ednio em etapas torna seu c\u00f3digo mais f\u00e1cil de ler e depurar.</p>\n          <p class=\"mb-3\">Por exemplo, separar o c\u00e1lculo da porcentagem em <code>valor_desconto</code> antes de calcular o <code>preco_final</code> \u00e9 uma excelente abordagem estrutural para iniciantes.</p>\n        "
  },
  {
    "id": "m2_maioridade",
    "module": 2,
    "title": "M\u00f3dulo 2: Verificar Maioridade",
    "statement": "Escreva um script que leia a vari\u00e1vel global `entrada` indicando a idade de uma pessoa (inteiro). Utilize `print()` para exibir a string `'Maior de idade'` se a idade for 18 ou mais, e `'Menor de idade'` caso contr\u00e1rio.",
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
        "in": 25,
        "out": "Maior de idade"
      },
      {
        "in": 0,
        "out": "Menor de idade"
      }
    ],
    "hints": [
      "Use um bloco if-else com a vari\u00e1vel entrada.",
      "O operador de maior ou igual \u00e9 >="
    ],
    "solution": "# Exemplo: Verificar se um aluno foi aprovado (nota m\u00ednima 7)\n# Considere que 'entrada' representa a nota do aluno\n\nif entrada >= 7:\n    print('Aprovado')\nelse:\n    print('Reprovado')",
    "constraints": [
      "Deve exibir exatamente as strings indicadas, respeitando mai\u00fasculas e min\u00fasculas."
    ],
    "theory": "\n          <p class=\"mb-3\">A <strong>L\u00f3gica Condicional</strong> permite que o programa tome decis\u00f5es. Em Python, usamos <code>if</code> e <code>else</code>.</p>\n          <p class=\"mb-3\">Observe a <strong>indenta\u00e7\u00e3o</strong>: os blocos de c\u00f3digo dentro do if e else devem estar recuados (normalmente com 4 espa\u00e7os). Essa \u00e9 a forma que o Python entende onde come\u00e7a e termina o bloco.</p>\n        "
  },
  {
    "id": "m2_par_impar",
    "module": 2,
    "title": "M\u00f3dulo 2: Par ou \u00cdmpar",
    "statement": "Escreva um script que utilize a vari\u00e1vel `entrada` (um n\u00famero inteiro). Use `print()` para exibir `True` se o n\u00famero for par, ou `False` se ele for \u00edmpar.",
    "function_name": "",
    "tests": [
      {
        "in": 0,
        "out": true
      },
      {
        "in": 2,
        "out": true
      },
      {
        "in": -4,
        "out": true
      },
      {
        "in": 7,
        "out": false
      },
      {
        "in": -3,
        "out": false
      }
    ],
    "hints": [
      "O operador de m\u00f3dulo (%) te diz o resto de uma divis\u00e3o inteira.",
      "Um n\u00famero \u00e9 par se o resto da divis\u00e3o dele por 2 for 0."
    ],
    "solution": "# Exemplo: Verificar se um n\u00famero \u00e9 m\u00faltiplo de 5\n# O operador % calcula o resto da divis\u00e3o.\n\nprint((entrada % 5) == 0)",
    "constraints": [
      "Imprima um tipo booleano (True ou False)."
    ],
    "theory": "\n          <p class=\"mb-3\">A divisibilidade e o resto da divis\u00e3o inteira s\u00e3o verificados por meio do operador <strong>m\u00f3dulo</strong>, representado pelo s\u00edmbolo de porcentagem (<code>%</code>) em Python.</p>\n          <p class=\"mb-3\">A express\u00e3o <code>entrada % d</code> calcula o resto da divis\u00e3o de <code>entrada</code> por <code>d</code>. Se <code>entrada % 2 == 0</code>, significa que o n\u00famero n\u00e3o deixa resto ao ser dividido por 2, logo, \u00e9 par.</p>\n        "
  },
  {
    "id": "m2_desconto_categoria",
    "module": 2,
    "title": "M\u00f3dulo 2: Desconto por Categoria",
    "statement": "Escreva um script que receba os dados pela vari\u00e1vel `entrada` (uma lista com o pre\u00e7o de um produto e a categoria dele em formato de string). Calcule e utilize `print()` para exibir o pre\u00e7o final seguindo as regras:\n\n- 'eletronico': 10% de desconto.\n- 'vestuario': 20% de desconto.\n- 'alimento': 5% de desconto.\n- Qualquer outra categoria: 0% de desconto.\n\nExemplo:\nPara `entrada = [100.0, 'vestuario']`, exiba `80.0`.",
    "function_name": "",
    "tests": [
      {
        "in": [
          100.0,
          "vestuario"
        ],
        "out": 80.0
      },
      {
        "in": [
          200.0,
          "eletronico"
        ],
        "out": 180.0
      },
      {
        "in": [
          50.0,
          "alimento"
        ],
        "out": 47.5
      },
      {
        "in": [
          100.0,
          "limpeza"
        ],
        "out": 100.0
      }
    ],
    "hints": [
      "Extraia o pre\u00e7o e a categoria da lista 'entrada'.",
      "Use if, elif e else para encadear as condi\u00e7\u00f5es de categoria.",
      "Aten\u00e7\u00e3o \u00e0 string da categoria ao comparar (ex: == 'eletronico')."
    ],
    "solution": "# Exemplo: Calcular taxa de imposto baseada no pa\u00eds\n# Considere que 'entrada' traz [valor_produto, pais_origem]\n\nvalor = entrada[0]\npais = entrada[1]\n\nif pais == 'brasil':\n    print(valor * 1.20)  # 20% de imposto\nelif pais == 'eua':\n    print(valor * 1.10)  # 10% de imposto\nelse:\n    print(valor * 1.05)  # 5% de imposto padr\u00e3o",
    "constraints": [
      "Lide com categorias desconhecidas caindo na condi\u00e7\u00e3o else (sem desconto)."
    ],
    "theory": "\n          <p class=\"mb-3\">O <code>elif</code> (abrevia\u00e7\u00e3o de else if) permite encadear m\u00faltiplas verifica\u00e7\u00f5es condicionais excludentes.</p>\n          <p class=\"mb-3\">Quando o Python encontra a primeira condi\u00e7\u00e3o verdadeira em uma cadeia de <code>if-elif</code>, ele executa aquele bloco e ignora todos os outros <code>elif</code> e o <code>else</code> finais.</p>\n        "
  },
  {
    "id": "m3_contagem",
    "module": 3,
    "title": "M\u00f3dulo 3: Contagem Regressiva",
    "statement": "Escreva um script que leia a vari\u00e1vel `entrada` (um n\u00famero inteiro maior que 0) e armazene uma contagem regressiva de `entrada` at\u00e9 1 em uma lista. Ao final, use `print()` para exibir a lista completa.\n\nExemplo:\nPara `entrada = 5`, exiba `[5, 4, 3, 2, 1]`.",
    "function_name": "",
    "tests": [
      {
        "in": 5,
        "out": [
          5,
          4,
          3,
          2,
          1
        ]
      },
      {
        "in": 3,
        "out": [
          3,
          2,
          1
        ]
      },
      {
        "in": 1,
        "out": [
          1
        ]
      }
    ],
    "hints": [
      "Use um loop 'while n > 0:' sendo n a vari\u00e1vel entrada.",
      "Crie uma lista vazia antes do loop.",
      "Dentro do loop, adicione 'n' \u00e0 lista com o m\u00e9todo '.append(n)'.",
      "Diminua 'n' em 1 a cada itera\u00e7\u00e3o (n -= 1) para evitar loop infinito."
    ],
    "solution": "# Exemplo: Contar para cima (de 1 at\u00e9 o n\u00famero informado na entrada)\nresultado = []\ncontador = 1\n\nwhile contador <= entrada:\n    resultado.append(contador)\n    contador += 1\n\nprint(resultado)",
    "constraints": [
      "Imprima uma lista de inteiros."
    ],
    "theory": "\n          <p class=\"mb-3\">O la\u00e7o <strong>while</strong> executa um bloco de c\u00f3digo repetidamente <em>enquanto</em> uma condi\u00e7\u00e3o for verdadeira.</p>\n          <p class=\"mb-3\">\u00c9 fundamental garantir que a condi\u00e7\u00e3o eventualmente se torne falsa, caso contr\u00e1rio o programa entrar\u00e1 em um <strong>loop infinito</strong>. Por isso n\u00e3o podemos esquecer de atualizar a vari\u00e1vel controladora do fluxo (ex: <code>n -= 1</code>) a cada passada no loop.</p>\n        "
  },
  {
    "id": "m3_soma_limite",
    "module": 3,
    "title": "M\u00f3dulo 3: Soma at\u00e9 o Limite",
    "statement": "Escreva um script que receba na vari\u00e1vel `entrada` uma lista com um valor inicial e um limite m\u00e1ximo. Voc\u00ea deve somar iterativamente o valor inicial com ele mesmo at\u00e9 que a soma alcance ou ultrapasse o limite estipulado. Use `print()` para exibir quantas somas (itera\u00e7\u00f5es) foram necess\u00e1rias.\n\nExemplo: Para `entrada = [5, 20]`:\nIn\u00edcio: 5\nItera\u00e7\u00e3o 1: 5 + 5 = 10\nItera\u00e7\u00e3o 2: 10 + 5 = 15\nItera\u00e7\u00e3o 3: 15 + 5 = 20 (Alcan\u00e7ou o limite)\nResultado: Exiba `3`.",
    "function_name": "",
    "tests": [
      {
        "in": [
          5,
          20
        ],
        "out": 3
      },
      {
        "in": [
          2,
          10
        ],
        "out": 4
      },
      {
        "in": [
          10,
          100
        ],
        "out": 9
      },
      {
        "in": [
          50,
          40
        ],
        "out": 0
      }
    ],
    "hints": [
      "Extraia o valor e o limite de 'entrada'.",
      "Mantenha um 'contador' para as itera\u00e7\u00f5es e uma vari\u00e1vel de 'soma_atual'.",
      "Use 'while soma_atual < limite:'.",
      "Se o valor inicial j\u00e1 for maior ou igual ao limite, o while nem executar\u00e1, e o print deve resultar em 0."
    ],
    "solution": "# Exemplo: Dobrar um valor enquanto ele for menor ou igual a 100\n# e contar quantas itera\u00e7\u00f5es foram feitas\n\nvalor_atual = entrada\niteracoes = 0\n\nwhile valor_atual <= 100:\n    valor_atual = valor_atual * 2\n    iteracoes += 1\n    \nprint(iteracoes)",
    "constraints": [
      "Imprima o n\u00famero inteiro de itera\u00e7\u00f5es."
    ],
    "theory": "\n          <p class=\"mb-3\">O <strong>while</strong> \u00e9 muito poderoso quando n\u00e3o sabemos exatamente quantas vezes precisamos repetir um bloco de c\u00f3digo, mas sabemos a <em>condi\u00e7\u00e3o de parada</em> (quando a soma atingir o limite).</p>\n          <p class=\"mb-3\">Este padr\u00e3o de usar um acumulador e um contador juntos dentro do la\u00e7o \u00e9 onipresente na programa\u00e7\u00e3o.</p>\n        "
  },
  {
    "id": "m3_tabuada",
    "module": 3,
    "title": "M\u00f3dulo 3: Tabuada Completa",
    "statement": "Escreva um script que use a vari\u00e1vel inteira `entrada` para gerar uma tabuada de 1 at\u00e9 10 para esse n\u00famero. Utilize `print()` para exibir todos os resultados juntos em formato de lista.\n\nExemplo:\nPara `entrada = 3`, o programa exibe `[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]`.",
    "function_name": "",
    "tests": [
      {
        "in": 3,
        "out": [
          3,
          6,
          9,
          12,
          15,
          18,
          21,
          24,
          27,
          30
        ]
      },
      {
        "in": 5,
        "out": [
          5,
          10,
          15,
          20,
          25,
          30,
          35,
          40,
          45,
          50
        ]
      },
      {
        "in": 1,
        "out": [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10
        ]
      }
    ],
    "hints": [
      "Para percorrer de 1 a 10, o la\u00e7o 'for' em conjunto com a fun\u00e7\u00e3o 'range()' \u00e9 ideal.",
      "Use 'for i in range(1, 11):'",
      "Crie uma lista vazia antes, fa\u00e7a append(entrada * i) e printe no final."
    ],
    "solution": "# Exemplo: Criar uma lista com o quadrado dos n\u00fameros de 1 at\u00e9 o valor de 'entrada'\n\nquadrados = []\nfor i in range(1, entrada + 1):\n    quadrados.append(i * i)\n    \nprint(quadrados)",
    "constraints": [
      "Utilize um la\u00e7o de repeti\u00e7\u00e3o for."
    ],
    "theory": "\n          <p class=\"mb-3\">O la\u00e7o <strong>for</strong> \u00e9 utilizado quando queremos iterar sobre uma sequ\u00eancia conhecida. Em Python, a fun\u00e7\u00e3o <code>range(inicio, fim)</code> gera n\u00fameros inteiros a partir do 'inicio' at\u00e9 'fim - 1'.</p>\n          <p class=\"mb-3\">Por isso <code>range(1, 11)</code> nos entrega de 1 at\u00e9 10. O 'fim' estipulado \u00e9 exclusivo (n\u00e3o \u00e9 inclu\u00eddo).</p>\n        "
  },
  {
    "id": "m4_busca_linear",
    "module": 4,
    "title": "M\u00f3dulo 4: Busca em Lista",
    "statement": "Implemente a fun\u00e7\u00e3o `m4_busca_linear(dados)` que recebe uma lista de dois elementos: uma lista de n\u00fameros e um n\u00famero alvo. A fun\u00e7\u00e3o deve retornar o **\u00edndice** (posi\u00e7\u00e3o) da primeira ocorr\u00eancia do alvo na lista. Se o alvo n\u00e3o estiver na lista, retorne `-1`.\n\nExemplo:\n`m4_busca_linear([[10, 20, 30, 40], 30])` deve retornar `2`.",
    "function_name": "m4_busca_linear",
    "tests": [
      {
        "in": [
          [
            10,
            20,
            30,
            40
          ],
          30
        ],
        "out": 2
      },
      {
        "in": [
          [
            5,
            2,
            8,
            2
          ],
          2
        ],
        "out": 1
      },
      {
        "in": [
          [
            1,
            3,
            5
          ],
          9
        ],
        "out": -1
      },
      {
        "in": [
          [],
          5
        ],
        "out": -1
      }
    ],
    "hints": [
      "Use a fun\u00e7\u00e3o 'enumerate(lista)' no for para conseguir tanto a posi\u00e7\u00e3o (\u00edndice) quanto o valor ao iterar: 'for indice, valor in enumerate(lista):'",
      "Assim que encontrar o alvo, voc\u00ea pode retornar o \u00edndice imediatamente (early return)."
    ],
    "solution": "# Exemplo: Fun\u00e7\u00e3o que encontra a posi\u00e7\u00e3o do primeiro n\u00famero negativo da lista\n\ndef encontrar_primeiro_negativo(lista: list) -> int:\n    for indice, numero in enumerate(lista):\n        if numero < 0:\n            return indice  # Retorno antecipado interrompe a busca!\n            \n    return -1",
    "constraints": [
      "Retorne o \u00edndice como inteiro ou -1."
    ],
    "theory": "\n          <p class=\"mb-3\">A partir deste m\u00f3dulo, utilizamos <strong>Fun\u00e7\u00f5es</strong>. Fun\u00e7\u00f5es s\u00e3o blocos de c\u00f3digo encapsulados que resolvem um problema e <code>retornam</code> uma resposta diretamente para o sistema, em vez de apenas jogar na tela com <code>print</code>.</p>\n          <p class=\"mb-3\">Em algoritmos de busca, o <strong>Early Return</strong> (retorno antecipado) \u00e9 uma pr\u00e1tica onde a fun\u00e7\u00e3o encerra e retorna o resultado no exato momento que encontra o que precisa. O la\u00e7o \u00e9 quebrado automaticamente.</p>\n        "
  },
  {
    "id": "m4_contagem_vogais",
    "module": 4,
    "title": "M\u00f3dulo 4: Contar Vogais",
    "statement": "Implemente a fun\u00e7\u00e3o `m4_contagem_vogais(texto)` que recebe uma string e retorna a quantidade de vogais (a, e, i, o, u) presentes nela. Ignore a diferen\u00e7a entre mai\u00fasculas e min\u00fasculas.\n\nExemplo:\n`m4_contagem_vogais('Abacaxi')` deve retornar `4`.",
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
      }
    ],
    "hints": [
      "Strings tamb\u00e9m podem ser iteradas como listas: 'for letra in texto:'",
      "Transforme o texto em min\u00fasculas primeiro para facilitar usando 'texto.lower()'.",
      "Voc\u00ea pode verificar se a letra est\u00e1 numa string de vogais: 'if letra in \"aeiou\":'."
    ],
    "solution": "# Exemplo: Fun\u00e7\u00e3o que conta quantas letras MAI\u00daSCULAS existem no texto\n\ndef contar_maiusculas(texto: str) -> int:\n    qtd = 0\n    for letra in texto:\n        if letra.isupper():\n            qtd += 1\n    return qtd",
    "constraints": [
      "O retorno deve ser um inteiro."
    ],
    "theory": "\n          <p class=\"mb-3\">No Python, o operador <code>in</code> \u00e9 poderoso. Ele serve para iterar num <code>for</code>, mas em condicionais serve como verificador de pertin\u00eancia.</p>\n          <p class=\"mb-3\">Escrever <code>letra in \"aeiou\"</code> \u00e9 uma forma super elegante de evitar verifica\u00e7\u00f5es longas como <code>letra == 'a' or letra == 'e' or ...</code>.</p>\n        "
  },
  {
    "id": "m4_status_nota",
    "module": 4,
    "title": "M\u00f3dulo 4: Lista de Status",
    "statement": "Implemente a fun\u00e7\u00e3o `m4_status_nota(notas)` que recebe uma lista de notas (floats) e retorna uma NOVA lista de strings contendo o status de cada nota:\n- 'Aprovado' se a nota for >= 7.0\n- 'Recuperacao' se a nota for >= 5.0 e < 7.0\n- 'Reprovado' se a nota for < 5.0\n\nExemplo:\n`m4_status_nota([8.5, 6.0, 4.0])` deve retornar `['Aprovado', 'Recuperacao', 'Reprovado']`.",
    "function_name": "m4_status_nota",
    "tests": [
      {
        "in": [
          8.5,
          6.0,
          4.0
        ],
        "out": [
          "Aprovado",
          "Recuperacao",
          "Reprovado"
        ]
      },
      {
        "in": [
          10.0,
          7.0
        ],
        "out": [
          "Aprovado",
          "Aprovado"
        ]
      },
      {
        "in": [
          4.9
        ],
        "out": [
          "Reprovado"
        ]
      },
      {
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "Crie uma lista vazia para os resultados.",
      "Itere sobre as 'notas'.",
      "Use if-elif-else para determinar o status de cada nota.",
      "Fa\u00e7a append da string de status resultante e retorne a lista final."
    ],
    "solution": "# Exemplo: Transformar uma lista de temperaturas em categorias clim\u00e1ticas\n\ndef categorizar_temperaturas(temps: list) -> list:\n    categorias = []\n    for t in temps:\n        if t > 30:\n            categorias.append('Quente')\n        elif t >= 15:\n            categorias.append('Agradavel')\n        else:\n            categorias.append('Frio')\n    return categorias",
    "constraints": [
      "Retorne uma lista de strings correspondentes elemento a elemento com a entrada."
    ],
    "theory": "\n          <p class=\"mb-3\">Esta opera\u00e7\u00e3o de iterar sobre uma lista e gerar uma nova lista de mesmo tamanho com valores mapeados baseados numa condi\u00e7\u00e3o \u00e9 extremamente comum na manipula\u00e7\u00e3o de dados.</p>\n          <p class=\"mb-3\">Voc\u00ea est\u00e1 aplicando uma l\u00f3gica de transforma\u00e7\u00e3o aos dados. Mais adiante na sua carreira em Python, aprender\u00e1 um conceito chamado 'List Comprehensions' que far\u00e1 isso em apenas uma linha!</p>\n        "
  },
  {
    "id": "m5_extremos",
    "module": 5,
    "title": "M\u00f3dulo 5: Encontrar Extremos",
    "statement": "Implemente a fun\u00e7\u00e3o `m5_extremos(lista)` que recebe uma lista de n\u00fameros inteiros positivos e retorna uma nova lista com apenas dois elementos: o Menor e o Maior valor encontrados. Se a lista estiver vazia, retorne `[]`.\n\nExemplo:\n`m5_extremos([15, 3, 9, 21, 6])` deve retornar `[3, 21]`.",
    "function_name": "m5_extremos",
    "tests": [
      {
        "in": [
          15,
          3,
          9,
          21,
          6
        ],
        "out": [
          3,
          21
        ]
      },
      {
        "in": [
          10,
          10,
          10
        ],
        "out": [
          10,
          10
        ]
      },
      {
        "in": [
          5
        ],
        "out": [
          5,
          5
        ]
      },
      {
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "Trate o caso da lista vazia primeiro: 'if not lista: return []'",
      "Voc\u00ea pode resolver f\u00e1cil usando as fun\u00e7\u00f5es max(lista) e min(lista).",
      "O retorno \u00e9 uma lista formatada como [minimo, maximo]."
    ],
    "solution": "# Exemplo: Fun\u00e7\u00e3o que retorna apenas o PRIMEIRO e o \u00daLTIMO elemento de uma lista\n\ndef primeiro_e_ultimo(lista: list) -> list:\n    if not lista:\n        return []\n    return [lista[0], lista[-1]]",
    "constraints": [
      "A ordem no retorno importa (primeiro o menor, depois o maior)."
    ],
    "theory": "\n          <p class=\"mb-3\">Em Python puro, procurar o maior e menor n\u00famero n\u00e3o exige que voc\u00ea construa o loop manualmente do zero guardando vari\u00e1veis auxiliares. A linguagem j\u00e1 implementa as fun\u00e7\u00f5es integradas hiperotimizadas <code>min()</code> e <code>max()</code> para cole\u00e7\u00f5es iter\u00e1veis.</p>\n        "
  },
  {
    "id": "m5_filtrar_nomes",
    "module": 5,
    "title": "M\u00f3dulo 5: Filtrar Nomes",
    "statement": "Implemente a fun\u00e7\u00e3o `m5_filtrar_nomes(nomes)` que recebe uma lista de strings e retorna uma NOVA lista contendo apenas os nomes que possuem 5 ou mais letras.\n\nExemplo:\n`m5_filtrar_nomes(['Ana', 'Carlos', 'Jo\u00e3o', 'Beatriz'])` deve retornar `['Carlos', 'Beatriz']`.",
    "function_name": "m5_filtrar_nomes",
    "tests": [
      {
        "in": [
          "Ana",
          "Carlos",
          "Jo\u00e3o",
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
      }
    ],
    "hints": [
      "Use o 'for' para percorrer cada nome.",
      "Utilize a fun\u00e7\u00e3o 'len(nome)' para verificar o tamanho da string.",
      "Adicione \u00e0 nova lista apenas se o tamanho for >= 5."
    ],
    "solution": "# Exemplo: Fun\u00e7\u00e3o que filtra e retorna apenas os N\u00daMEROS PARES de uma lista\n\ndef filtrar_pares(numeros: list) -> list:\n    pares = []\n    for n in numeros:\n        if n % 2 == 0:\n            pares.append(n)\n    return pares",
    "constraints": [
      "Deve retornar uma nova lista, deixando a original intocada."
    ],
    "theory": "\n          <p class=\"mb-3\">Filtrar cole\u00e7\u00f5es de dados \u00e9 um cl\u00e1ssico de programa\u00e7\u00e3o (Padr\u00e3o de Filtro). Iteramos sobre os dados originais e aplicamos um predicado (fun\u00e7\u00e3o que retorna True ou False). Apenas os dados aprovados passam pelo filtro para a cole\u00e7\u00e3o final.</p>\n        "
  },
  {
    "id": "m5_remover_duplicatas",
    "module": 5,
    "title": "M\u00f3dulo 5: Remover Duplicatas",
    "statement": "Implemente a fun\u00e7\u00e3o `m5_remover_duplicatas(lista)` que recebe uma lista de n\u00fameros e retorna uma nova lista onde todas as duplicatas foram removidas, mas mantendo a ordem original da primeira apari\u00e7\u00e3o dos n\u00fameros.\n\nExemplo:\n`m5_remover_duplicatas([1, 2, 2, 3, 1, 4, 3])` deve retornar `[1, 2, 3, 4]`.",
    "function_name": "m5_remover_duplicatas",
    "tests": [
      {
        "in": [
          1,
          2,
          2,
          3,
          1,
          4,
          3
        ],
        "out": [
          1,
          2,
          3,
          4
        ]
      },
      {
        "in": [
          5,
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
        "in": [],
        "out": []
      }
    ],
    "hints": [
      "Crie uma nova lista para os itens \u00fanicos.",
      "Ao iterar pela lista original, use 'if numero not in unicos:' para adicionar o n\u00famero apenas uma vez."
    ],
    "solution": "# Exemplo: Juntar duas listas ignorando os itens repetidos!\n\ndef juntar_listas_unicas(lista1: list, lista2: list) -> list:\n    unicos = []\n    for item in lista1 + lista2:\n        if item not in unicos:\n            unicos.append(item)\n    return unicos",
    "constraints": [
      "A ordem dos itens na lista resultante deve refletir a ordem de apari\u00e7\u00e3o na lista de origem."
    ],
    "theory": "\n          <p class=\"mb-3\">A verifica\u00e7\u00e3o de presen\u00e7a <code>not in</code> aplicada sobre listas \u00e9 muito \u00fatil para gerenciar estados acumulados. Contudo, saiba que para listas imensas, essa verifica\u00e7\u00e3o \u00e9 lenta. Programadores Python experientes geralmente usam estruturas de dados chamadas <code>Set</code> (conjuntos) quando a ordem n\u00e3o importa e precisam remover duplicatas com alt\u00edssima efici\u00eancia!</p>\n        "
  },
  {
    "id": "analisar_turma",
    "module": "final",
    "title": "Desafio Final: Analisar Desempenho da Turma",
    "statement": "Implemente a fun\u00e7\u00e3o `analisar_turma(alunos)` que recebe uma lista de dicion\u00e1rios contendo informa\u00e7\u00f5es de alunos na estrutura:\n`{'nome': 'Ana', 'idade': 20, 'notas': [8, 9, 10]}`.\n\nA fun\u00e7\u00e3o deve processar os dados e retornar uma **lista** contendo exatamente os tr\u00eas valores abaixo nessa exata ordem:\n1. A m\u00e9dia geral da turma (como float, m\u00e9dia aritm\u00e9tica de todas as notas).\n2. A quantidade total de alunos que s\u00e3o maiores de idade (idade >= 18).\n3. Uma lista contendo os nomes dos alunos aprovados (m\u00e9dia >= 7.0).\n\nExemplo:\n`analisar_turma([{'nome': 'Ana', 'idade': 20, 'notas': [8, 9, 10]}, {'nome': 'Bob', 'idade': 16, 'notas': [5, 6, 4]}])` deve retornar:\n`[7.0, 1, ['Ana']]`",
    "function_name": "analisar_turma",
    "tests": [
      {
        "in": [
          {
            "nome": "Ana",
            "idade": 20,
            "notas": [
              8,
              9,
              10
            ]
          },
          {
            "nome": "Bob",
            "idade": 16,
            "notas": [
              5,
              6,
              4
            ]
          }
        ],
        "out": [
          7.0,
          1,
          [
            "Ana"
          ]
        ]
      },
      {
        "in": [
          {
            "nome": "Carlos",
            "idade": 17,
            "notas": [
              7,
              7,
              7
            ]
          },
          {
            "nome": "Julia",
            "idade": 19,
            "notas": [
              10,
              10
            ]
          }
        ],
        "out": [
          8.2,
          1,
          [
            "Carlos",
            "Julia"
          ]
        ]
      },
      {
        "in": [],
        "out": [
          0.0,
          0,
          []
        ]
      }
    ],
    "hints": [
      "Use um loop para percorrer a lista de alunos e obter seus dados usando as chaves de dicion\u00e1rio (ex: aluno['notas']).",
      "Para a m\u00e9dia de cada aluno, use sum(notas) / len(notas).",
      "Mantenha um somador e um contador globais para tirar a m\u00e9dia de TODAS as notas juntadas.",
      "O retorno precisa ser formatado exatamente como [media_geral, total_maiores, lista_aprovados]."
    ],
    "solution": "# Exemplo: Fun\u00e7\u00e3o que analisa um estoque de produtos e retorna m\u00e9tricas.\n# Ex de entrada: [{'nome': 'Ma\u00e7a', 'preco': 2.5, 'estoque': 10}, ...]\n\ndef analisar_estoque(produtos: list) -> list:\n    if not produtos:\n        return [0.0, 0, []]\n        \n    valor_total_inventario = 0\n    produtos_zerados = 0\n    nomes_caros = []\n    \n    for p in produtos:\n        # C\u00e1lculos de agrega\u00e7\u00e3o geral\n        valor_total_inventario += p['preco'] * p['estoque']\n        \n        # Verifica\u00e7\u00e3o condicional simples\n        if p['estoque'] == 0:\n            produtos_zerados += 1\n            \n        # Filtragem\n        if p['preco'] > 50.0:\n            nomes_caros.append(p['nome'])\n            \n    return [valor_total_inventario, produtos_zerados, nomes_caros]",
    "constraints": [
      "O retorno n\u00e3o \u00e9 um dicion\u00e1rio. \u00c9 uma lista com tr\u00eas elementos mistos (float, int, list).",
      "Arredonde a m\u00e9dia geral da sala para 1 casa decimal."
    ],
    "theory": "\n          <p class=\"mb-3\">Este desafio consolida v\u00e1rios conceitos avan\u00e7ados em Python: <strong>dicion\u00e1rios estruturados</strong>, listas aninhadas, itera\u00e7\u00f5es e l\u00f3gica matem\u00e1tica complexa.</p>\n          <p class=\"mb-3\"><strong>Estrutura de Dicion\u00e1rio:</strong> Um dicion\u00e1rio \u00e9 indexado por chaves como strings (ex: <code>aluno['nome']</code> ou <code>aluno['idade']</code>). Voc\u00ea pode obter um valor de forma segura com o m\u00e9todo <code>.get('chave', default)</code>.</p>\n          <p class=\"mb-3\"><strong>C\u00e1lculo Acumulado:</strong> Para computar a m\u00e9dia geral da turma inteira, lembre-se de somar individualmente <i>todas</i> as notas de todos os alunos e dividir pela <i>quantidade total</i> de notas registradas na sala de aula.</p>\n        "
  }
];

// Exporta caso seja usado em ambientes node/testes, mas deixa global no navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { problems };
}
