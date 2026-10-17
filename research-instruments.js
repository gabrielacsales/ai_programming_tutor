/* Instrumentos educacionais paralelos exploratórios — currículo Python v2.
 * Não contém gabarito! Correção manual em documento da pesquisadora fora do site.
 * Mantenha esta versão congelada durante o estudo; reporte versão e limitações.
 */
window.RESEARCH_INSTRUMENTS = {
  version: "tcc-v1",
  pre: [
    { id:"q1", skill:"Variáveis", prompt:"Qual é a saída deste código?", code:"pontos = 4\ndobro = pontos * 2\nprint(dobro)", options:{A:"6",B:"8",C:"4",D:"Erro"} },
    { id:"q2", skill:"Operações", prompt:"Qual é o valor da variável resultado?", code:"resultado = 2 + 3 * 4", options:{A:"20",B:"14",C:"24",D:"9"} },
    { id:"q3", skill:"Condicionais", prompt:"Qual texto será mostrado?", code:"idade = 18\nif idade >= 18:\n    print('A')\nelse:\n    print('B')", options:{A:"A",B:"B",C:"A e B",D:"Nenhum"} },
    { id:"q4", skill:"Resto", prompt:"Qual é o resultado da expressão 9 % 2 em Python?", options:{A:"0",B:"1",C:"2",D:"4"} },
    { id:"q5", skill:"While", prompt:"O que será impresso, uma linha após a outra?", code:"n = 3\nwhile n > 0:\n    print(n)\n    n -= 1", options:{A:"1, 2, 3",B:"3, 2, 1",C:"3, 3, 3",D:"2, 1, 0"} },
    { id:"q6", skill:"For", prompt:"Quais valores aparecem na saída?", code:"for i in range(1, 4):\n    print(i)", options:{A:"1, 2, 3, 4",B:"0, 1, 2, 3",C:"1, 2, 3",D:"4"} },
    { id:"q7", skill:"Listas", prompt:"Qual valor é mostrado?", code:"itens = [10, 20, 30]\nprint(itens[1])", options:{A:"10",B:"20",C:"30",D:"Erro"} },
    { id:"q8", skill:"Funções", prompt:"Qual saída será produzida?", code:"def triplo(n):\n    return n * 3\n\nprint(triplo(2))", options:{A:"2",B:"3",C:"6",D:"Nenhuma"} }
  ],
  post: [
    { id:"q1", skill:"Variáveis", prompt:"Qual saída este código produz?", code:"valor = 5\ntotal = valor + 5\nprint(total)", options:{A:"5",B:"25",C:"10",D:"Erro"} },
    { id:"q2", skill:"Operações", prompt:"Qual é o valor da variável resultado?", code:"resultado = 3 + 2 * 5", options:{A:"25",B:"13",C:"30",D:"10"} },
    { id:"q3", skill:"Condicionais", prompt:"Qual texto será mostrado?", code:"nota = 6\nif nota > 6:\n    print('alto')\nelse:\n    print('baixo')", options:{A:"alto",B:"baixo",C:"alto e baixo",D:"Erro"} },
    { id:"q4", skill:"Resto", prompt:"Qual é o resultado da expressão 14 % 3 em Python?", options:{A:"4",B:"3",C:"2",D:"1"} },
    { id:"q5", skill:"While", prompt:"O que será impresso, uma linha após a outra?", code:"n = 2\nwhile n < 5:\n    print(n)\n    n += 1", options:{A:"2, 3, 4",B:"2, 3, 4, 5",C:"5, 4, 3",D:"1, 2, 3"} },
    { id:"q6", skill:"For", prompt:"Quais valores aparecem na saída?", code:"for i in range(2, 5):\n    print(i)", options:{A:"2, 3, 4, 5",B:"0, 1, 2, 3, 4",C:"3, 4, 5",D:"2, 3, 4"} },
    { id:"q7", skill:"Listas", prompt:"Qual valor é mostrado?", code:"valores = [4, 8, 12]\nprint(valores[0])", options:{A:"4",B:"8",C:"12",D:"Erro"} },
    { id:"q8", skill:"Funções", prompt:"Qual saída será produzida?", code:"def somar_dois(n):\n    return n + 2\n\nprint(somar_dois(4))", options:{A:"4",B:"2",C:"8",D:"6"} }
  ],
  survey: [
    { id:"s1", statement:"Consegui pensar nos próximos passos sem receber o código pronto." },
    { id:"s2", statement:"As perguntas do professor me ajudaram a entender meus erros." },
    { id:"s3", statement:"As dicas e exemplos tinham o nível de detalhe adequado." },
    { id:"s4", statement:"Eu me senti mais confiante para resolver exercícios sozinho(a)." },
    { id:"s5", statement:"Eu dependi do professor de IA para decidir o que fazer a seguir." },
    { id:"s6", statement:"O sistema foi fácil de utilizar." },
    { id:"s7", statement:"Descreva um momento em que uma pergunta do tutor ajudou (ou não ajudou) seu raciocínio.", type:"text" },
    { id:"s8", statement:"O que mudaria nas dicas, no professor ou nos exercícios?", type:"text" }
  ]
};