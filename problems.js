// Base de dados de problemas do AI Programming Tutor
const problems = [
  {
    id: "calcular_media",
    title: "Módulo 1: Calcular média de notas",
    statement: "Implemente a função `calcular_media(notas)` que recebe uma lista de números inteiros ou decimais contendo notas de um aluno e retorna a média aritmética simples dessas notas.\n\nExemplo:\n`calcular_media([10, 8, 6])` deve retornar `8.0`.",
    function_name: "calcular_media",
    tests: [
      { in: [10, 8, 6], out: 8.0 },
      { in: [7, 7, 7, 7], out: 7.0 },
      { in: [0, 10], out: 5.0 },
      { in: [9.5, 8.5], out: 9.0 }
    ],
    hints: [
      "Use a função sum() para somar todos os elementos da lista.",
      "Use a função len() para descobrir o número de notas na lista.",
      "A média é a soma dividida pelo número total de notas."
    ],
    solution: "def calcular_media(notas: list) -> float:\n    if len(notas) == 0:\n        return 0.0\n    return sum(notas) / len(notas)",
    constraints: [
      "Retorna um valor do tipo float.",
      "Evita erros caso a lista de notas venha vazia.",
      "Não utilize loops adicionais; utilize as funções sum() e len()."
    ]
  },
  {
    id: "maior_idade",
    title: "Módulo 2: Verificar maioridade",
    statement: "Implemente a função `maior_idade(idade)` que recebe um número inteiro contendo a idade de uma pessoa e retorna `True` se ela for maior de idade (18 anos ou mais) e `False` caso contrário.",
    function_name: "maior_idade",
    tests: [
      { in: 18, out: true },
      { in: 17, out: false },
      { in: 25, out: true },
      { in: 0, out: false }
    ],
    hints: [
      "Use o operador de comparação maior ou igual (>=) para verificar se a idade é 18 ou mais.",
      "Lembre-se de retornar True ou False diretamente."
    ],
    solution: "def maior_idade(idade: int) -> bool:\n    return idade >= 18",
    constraints: [
      "Retorna um valor booleano (True ou False).",
      "O código deve ser enxuto, preferencialmente sem if-else se puder retornar a própria expressão booleana."
    ]
  },
  {
    id: "parity_01",
    title: "Módulo 2: Par ou Ímpar",
    statement: "Dado um número inteiro n, determine se é par ou ímpar.\nImplemente a função `eh_par(n)` que retorna True para par e False para ímpar.",
    function_name: "eh_par",
    tests: [
      { in: 0, out: true },
      { in: 2, out: true },
      { in: -4, out: true },
      { in: 7, out: false },
      { in: -3, out: false }
    ],
    hints: [
      "Pense em como representar 'ser divisível por 2' com operadores em Python.",
      "O operador de módulo (%) te diz o resto de uma divisão inteira.",
      "Você pode retornar diretamente a expressão booleana sem if-else."
    ],
    solution: "def eh_par(n: int) -> bool:\n    return (n % 2) == 0",
    constraints: [
      "Cobre casos negativos e zero.",
      "Evita ifs desnecessários; pode retornar expressão booleana.",
      "Inclui docstring ou comentário curto explicando a lógica."
    ]
  },
  {
    id: "fizzbuzz_01",
    title: "Módulo 2: FizzBuzz básico",
    statement: "Para um inteiro n, retorne:\n- 'FizzBuzz' se múltiplo de 3 e 5\n- 'Fizz' se múltiplo de 3\n- 'Buzz' se múltiplo de 5\n- caso contrário, o próprio n como string.\nImplemente `fizzbuzz(n)`.",
    function_name: "fizzbuzz",
    tests: [
      { in: 3, out: "Fizz" },
      { in: 5, out: "Buzz" },
      { in: 15, out: "FizzBuzz" },
      { in: 2, out: "2" },
      { in: 0, out: "FizzBuzz" }
    ],
    hints: [
      "Avalie primeiro a condição mais restrita (múltiplo de 3 e 5).",
      "Use n % 3 == 0 e n % 5 == 0.",
      "A ordem dos ifs altera o comportamento."
    ],
    solution: "def fizzbuzz(n: int) -> str:\n    if n % 3 == 0 and n % 5 == 0:\n        return \"FizzBuzz\"\n    elif n % 3 == 0:\n        return \"Fizz\"\n    elif n % 5 == 0:\n        return \"Buzz\"\n    else:\n        return str(n)",
    constraints: [
      "Ordem correta dos condicionais.",
      "Testes com números negativos e zero.",
      "Complexidade e clareza."
    ]
  },
  {
    id: "contar_pares",
    title: "Módulo 5: Contar números pares",
    statement: "Implemente a função `contar_pares(lista)` que recebe uma lista de números inteiros e retorna a quantidade de números pares presentes nela.\n\nExemplo:\n`contar_pares([1, 2, 3, 4, 5])` deve retornar `2`.",
    function_name: "contar_pares",
    tests: [
      { in: [1, 2, 3, 4, 5], out: 2 },
      { in: [2, 4, 6, 8], out: 4 },
      { in: [1, 3, 5], out: 0 },
      { in: [], out: 0 }
    ],
    hints: [
      "Use um loop 'for' para percorrer cada número na lista.",
      "Use uma variável contadora inicializada em 0 para guardar a contagem.",
      "Para cada número, verifique se ele é par usando o operador módulo %."
    ],
    solution: "def contar_pares(lista: list) -> int:\n    qtd = 0\n    for num in lista:\n        if num % 2 == 0:\n            qtd += 1\n    return qtd",
    constraints: [
      "Retorna um número inteiro contendo a quantidade.",
      "Funciona corretamente para uma lista vazia, retornando 0.",
      "Percorra a lista usando um laço de repetição."
    ]
  },
  {
    id: "analisar_turma",
    title: "Desafio Final: Analisar Desempenho da Turma",
    statement: "Implemente a função `analisar_turma(alunos)` que recebe uma lista de dicionários contendo informações de alunos na estrutura:\n`{'nome': 'Ana', 'idade': 20, 'notas': [8, 9, 10]}`.\n\nA função deve processar os dados e retornar um dicionário com as seguintes estatísticas da turma:\n1. `'media_geral'`: a média aritmética de todas as notas de todos os alunos da turma (como float).\n2. `'maiores_de_idade'`: a quantidade total de alunos que são maiores de idade (18 anos ou mais).\n3. `'aprovados'`: uma lista contendo os nomes dos alunos que obtiveram média de notas maior ou igual a 7.0.\n\nExemplo:\n`analisar_turma([{'nome': 'Ana', 'idade': 20, 'notas': [8, 9, 10]}, {'nome': 'Bob', 'idade': 16, 'notas': [5, 6, 4]}])` deve retornar:\n`{'media_geral': 7.0, 'maiores_de_idade': 1, 'aprovados': ['Ana']}`",
    function_name: "analisar_turma",
    tests: [
      {
        in: [
          { nome: "Ana", idade: 20, notas: [8, 9, 10] },
          { nome: "Bob", idade: 16, notas: [5, 6, 4] }
        ],
        out: { media_geral: 7.0, maiores_de_idade: 1, aprovados: ["Ana"] }
      },
      {
        in: [
          { nome: "Carlos", idade: 17, notas: [7, 7, 7] },
          { nome: "Julia", idade: 19, notas: [10, 10] }
        ],
        out: { media_geral: 8.2, maiores_de_idade: 1, aprovados: ["Carlos", "Julia"] }
      },
      {
        in: [],
        out: { media_geral: 0.0, maiores_de_idade: 0, aprovados: [] }
      }
    ],
    hints: [
      "Use um loop para percorrer a lista de alunos e obter seus dados.",
      "Para cada aluno, calcule a média de suas notas. Se a média for >= 7.0, adicione o nome dele à lista de aprovados.",
      "Mantenha um contador para os alunos com idade >= 18.",
      "Some todas as notas de todos os alunos e divida pelo total de notas para a média geral. Se não houver notas, a média é 0.0."
    ],
    solution: "def analisar_turma(alunos: list) -> dict:\n    if not alunos:\n        return {'media_geral': 0.0, 'maiores_de_idade': 0, 'aprovados': []}\n    \n    total_notas = 0\n    qtd_notas = 0\n    maiores = 0\n    aprovados = []\n    \n    for aluno in alunos:\n        if aluno['idade'] >= 18:\n            maiores += 1\n        \n        notas = aluno.get('notas', [])\n        if notas:\n            media_aluno = sum(notas) / len(notas)\n            total_notas += sum(notas)\n            qtd_notas += len(notas)\n        else:\n            media_aluno = 0.0\n            \n        if media_aluno >= 7.0:\n            aprovados.append(aluno['nome'])\n            \n    media_geral = total_notas / qtd_notas if qtd_notas > 0 else 0.0\n    return {\n        'media_geral': round(media_geral, 1),\n        'maiores_de_idade': maiores,\n        'aprovados': aprovados\n    }",
    constraints: [
      "Retorna um dicionário com as três chaves: 'media_geral', 'maiores_de_idade' e 'aprovados'.",
      "Arredonde 'media_geral' para uma casa decimal (pode usar a função round()).",
      "Funciona corretamente se a lista de alunos vier vazia."
    ]
  }
];

// Exporta caso seja usado em ambientes node/testes, mas deixa global no navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { problems };
}
