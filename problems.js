// Base de dados de problemas do AI Programming Tutor
const problems = [
  {
    id: "parity_01",
    title: "Ex 01. Paridade de número",
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
    title: "FizzBuzz básico",
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
  }
];

// Exporta caso seja usado em ambientes node/testes, mas deixa global no navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { problems };
}
