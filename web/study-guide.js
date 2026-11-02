// Apresentação editorial do Resumo do Tema (currículo 2).
// Preserva os conceitos de cada theory; as notas e perguntas abaixo são orientações didáticas.
(function () {
  "use strict";

  const guides = {
    m1_imc: {
      title: "Variáveis e operações básicas",
      objective: "Entender como guardar valores, realizar operações e mostrar resultados em Python.",
      headings: ["O que são variáveis?", "Operações com números", "Exibindo um resultado"],
      keywords: ["Variáveis", "Atribuição", "Operadores", "print()"],
      remember: "O sinal = atribui um valor a uma variável. Ele não realiza uma comparação.",
      question: "Qual é a diferença entre guardar um resultado numa variável e mostrá-lo com print()?"
    },
    m1_conversor_temp: {
      title: "Operações e arredondamento",
      objective: "Combinar cálculos, respeitar a ordem das operações e apresentar números decimais.",
      headings: ["Combinando operações", "Ordem das operações", "Arredondando resultados"],
      keywords: ["Multiplicação", "Divisão", "float", "round()"],
      remember: "Multiplicação e divisão têm prioridade sobre soma; parênteses ajudam a explicitar a ordem desejada.",
      question: "Quando você usaria parênteses em uma expressão com soma, multiplicação e divisão?"
    },
    m1_calculo_desconto: {
      title: "Porcentagens no Python",
      objective: "Interpretar porcentagens como partes de um total e organizar cálculos em etapas.",
      headings: ["Porcentagem como proporção", "Raciocínio em etapas", "Valores e casas decimais"],
      keywords: ["Porcentagem", "Variáveis", "Etapas", "round()"],
      remember: "Uma porcentagem é uma parte de 100. Nomes claros para variáveis ajudam a acompanhar cada etapa.",
      question: "Por que calcular uma parcela em uma variável separada pode facilitar a leitura do programa?"
    },
    m2_maioridade: {
      title: "Decisões com if e else",
      objective: "Criar caminhos diferentes no programa usando condições e blocos indentados.",
      headings: ["Como funcionam condicionais", "Comparações com >=" , "Dois-pontos e indentação"],
      keywords: ["Condicionais", "if", "else", "Indentação"],
      remember: "Em Python, o recuo das linhas faz parte da estrutura do programa: ele define o bloco executado.",
      question: "O que acontece com o bloco de else quando a condição do if é verdadeira?"
    },
    m2_par_impar: {
      title: "Resto da divisão e comparações",
      objective: "Usar o operador de resto e distinguir atribuição de comparação em condições.",
      headings: ["O operador de resto %", "Diferença entre = e ==", "Classificação em dois caminhos"],
      keywords: ["Resto (%)", "Comparação (==)", "if", "else"],
      remember: "Use = para atribuir um valor e == quando precisar comparar se dois valores são iguais.",
      question: "Como o resultado de uma operação com % pode ajudar a tomar uma decisão?"
    },
    m2_desconto_categoria: {
      title: "Decisões com vários caminhos",
      objective: "Organizar classificações com mais de duas possibilidades e respeitar os limites das faixas.",
      headings: ["Estrutura if / elif / else", "A ordem das verificações", "Interpretando intervalos"],
      keywords: ["if", "elif", "else", "Ordem dos limites"],
      remember: "As condições são lidas de cima para baixo; apenas o primeiro bloco cuja condição é verdadeira é executado.",
      question: "Por que inverter a ordem de duas condições pode mudar o resultado de uma classificação?"
    },
    m3_contagem: {
      title: "Repetição com while",
      objective: "Entender quando uma repetição continua, quando termina e como atualizar seus valores.",
      headings: ["Repetição condicionada", "Início, teste e atualização", "Saída durante a repetição"],
      keywords: ["while", "Condição", "Atualização", "print()"],
      remember: "Um while precisa de uma condição que eventualmente deixe de ser verdadeira, evitando repetições infinitas.",
      question: "Que variável muda a cada volta do laço e como isso afeta a condição de parada?"
    },
    m3_soma_limite: {
      title: "Contadores e acumuladores",
      objective: "Acompanhar valores que mudam a cada iteração e representar resultados parciais.",
      headings: ["Para que serve o acumulador?", "Contador e atualização", "Simulando um laço"],
      keywords: ["Acumulador", "Contador", "+=", "while"],
      remember: "Um acumulador mantém um resultado parcial; um contador acompanha os passos da repetição.",
      question: "Se você simulasse três iterações no papel, que valores precisaria anotar a cada passo?"
    },
    m3_tabuada: {
      title: "Sequências com for e range",
      objective: "Percorrer uma sequência conhecida e calcular algo diferente a cada passagem.",
      headings: ["Percorrendo sequências", "Entendendo os limites do range", "Uma saída a cada iteração"],
      keywords: ["for", "range()", "Sequência", "print()"],
      remember: "Em range(início, fim), o valor de fim não faz parte da sequência produzida.",
      question: "Que números são percorridos por range(1, 4) e por quê?"
    },
    m4_busca_linear: {
      title: "Listas, funções e retorno",
      objective: "Acessar elementos por índice e trabalhar com funções que recebem e devolvem valores.",
      headings: ["Listas e índices", "Estrutura de uma função", "Devolvendo um valor", "O retorno é avaliado"],
      keywords: ["Lista", "Índice", "def", "return", "None"],
      remember: "Os índices começam em zero. Uma função devolve um valor com return, que não é a mesma coisa que print().",
      question: "Por que é importante verificar se uma lista está vazia antes de acessar um elemento?"
    },
    m4_contagem_vogais: {
      title: "Percorrendo textos em Python",
      objective: "Analisar caracteres de strings, fazer verificações e devolver uma contagem.",
      headings: ["Texto como sequência", "Verificando se um caractere está presente", "Normalizando e contando"],
      keywords: ["String", "for", "in", ".lower()", "return"],
      remember: "Normalizar letras com .lower() permite usar uma mesma regra para caracteres maiúsculos e minúsculos.",
      question: "Como um laço for consegue examinar uma palavra sem precisar conhecer seu tamanho antes?"
    },
    m4_status_nota: {
      title: "Transformação de listas",
      objective: "Construir uma lista de resultados aplicando regras a cada item da lista de entrada.",
      headings: ["Adicionando com append", "Transformando cada item", "Tratando faixas e retornando"],
      keywords: [".append()", "Transformação", "for", "if", "return"],
      remember: "Em uma transformação, cada item de entrada pode gerar um novo item no resultado, mantendo a correspondência.",
      question: "Por que vale a pena criar uma lista nova para guardar os resultados da transformação?"
    },
    m5_extremos: {
      title: "Encontrando valores extremos",
      objective: "Identificar os maiores e menores elementos e pensar nos casos especiais de uma coleção.",
      headings: ["Comparações sucessivas", "Funções integradas", "Listas vazias e casos-limite"],
      keywords: ["Maior", "Menor", "min()", "max()", "Lista vazia"],
      remember: "min() e max() dependem de uma coleção não vazia. Pense nos casos-limite antes de usá-las.",
      question: "O que pode mudar na análise quando a lista está vazia ou contém um único número?"
    },
    m5_filtrar_nomes: {
      title: "Filtragem de dados",
      objective: "Selecionar elementos de uma lista sem perder a ordem dos itens aprovados por uma condição.",
      headings: ["O que significa filtrar", "Medindo com len()", "Construindo uma lista filtrada"],
      keywords: ["Filtro", "len()", "for", "if", ".append()"],
      remember: "Filtrar é selecionar, não modificar o conteúdo de cada item. A nova lista mantém a ordem dos selecionados.",
      question: "Em que momento do laço você decidiria incluir ou não um item na lista de resultados?"
    },
    m5_remover_duplicatas: {
      title: "Trabalhando com itens únicos",
      objective: "Reconhecer repetições e organizar a seleção de valores sem perder a primeira ocorrência.",
      headings: ["O que é uma lista sem duplicatas", "Verificando a ausência de um valor", "Percorrer, verificar e adicionar"],
      keywords: ["Duplicatas", "not in", "for", ".append()"],
      remember: "Quando a ordem importa, observe a primeira aparição de cada valor durante o percurso.",
      question: "Por que testar se um valor já foi incluído antes de adicioná-lo novamente?"
    },
    analisar_turma: {
      title: "Integrando os conceitos aprendidos",
      objective: "Revisar funções, listas, médias, contadores e o tratamento de situações especiais.",
      headings: ["Combinando estruturas", "Média e contagem", "Casos especiais e formato do retorno"],
      keywords: ["Função", "Lista", "Média aritmética", "Acumulador", "return"],
      remember: "Antes de calcular uma média, verifique se existe ao menos um elemento para evitar divisão por zero.",
      question: "Quais cuidados são necessários quando uma função devolve mais de uma informação?"
    }
  };

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }

  function getConceptParagraphs(theory) {
    // As explicações originais do currículo usam parágrafos HTML curtos e
    // controlados pela própria aplicação, com marcações strong e code.
    const paragraphs = String(theory || "").match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);
    return paragraphs && paragraphs.length
      ? paragraphs.map(p => p.replace(/^<p\b[^>]*>/i, "").replace(/<\/p>$/i, "").trim())
      : [];
  }

  function render(problem, curriculum) {
    const guide = guides[problem?.id];
    const origin = getConceptParagraphs(problem?.theory);
    if (!guide || !origin.length) {
      return '<div class="study-guide-empty"><p>Resumo em preparação para este exercício.</p></div>';
    }

    const all = Array.isArray(curriculum) ? curriculum : [];
    const position = Math.max(0, all.findIndex(p => p.id === problem.id)) + 1;
    const moduleLabel = problem.module === "final" ? "Desafio final" : "Módulo " + problem.module;

    const sections = origin.map((content, i) =>
      '<section class="study-guide-section" aria-labelledby="study-section-' + i + '">' +
      '<div class="study-guide-index" aria-hidden="true">' + String(i + 1).padStart(2, "0") + '</div>' +
      '<div class="study-guide-section-body">' +
      '<h3 id="study-section-' + i + '">' + escapeHTML(guide.headings[i] || "Conceito essencial") + '</h3>' +
      '<p class="study-guide-copy">' + content + '</p>' +
      '</div></section>'
    ).join("");

    const tags = guide.keywords.map(term => '<li>' + escapeHTML(term) + '</li>').join("");

    return '<article class="study-guide" aria-label="Apostila do tema">' +
      '<header class="study-guide-cover">' +
      '<div class="study-guide-meta"><span class="study-guide-series">CADERNO DE ESTUDOS / PYTHON</span>' +
      '<span class="study-guide-lesson-count">Aula ' + String(position || 1).padStart(2, "0") + ' / ' + String(all.length || 16).padStart(2, "0") + '</span></div>' +
      '<div class="study-guide-cover-content">' +
      '<span class="study-guide-module">' + escapeHTML(moduleLabel) + '</span>' +
      '<h2>' + escapeHTML(guide.title) + '</h2>' +
      '<p>' + escapeHTML(guide.objective) + '</p>' +
      '</div><div class="study-guide-cover-bottom"><span aria-hidden="true">✳</span> CONCEITOS PARA SUA PRÓXIMA TENTATIVA</div>' +
      '</header>' +
      '<div class="study-guide-body">' +
      '<section class="study-guide-glossary" aria-label="Palavras-chave desta aula">' +
      '<h3>Palavras-chave</h3><ul>' + tags + '</ul></section>' +
      '<div class="study-guide-sections"><h3 class="study-guide-chapter-heading">Entenda o conceito</h3>' +
      sections + '</div>' +
      '<aside class="study-guide-remember"><div class="study-guide-remember-symbol" aria-hidden="true">!</div><div>' +
      '<h3>Para lembrar</h3><p>' + escapeHTML(guide.remember) + '</p></div></aside>' +
      '<section class="study-guide-reflection" aria-labelledby="study-reflection-title">' +
      '<span class="study-guide-reflection-caption">PAUSA PARA REVISÃO</span>' +
      '<h3 id="study-reflection-title">Conseguiu explicar com suas palavras?</h3>' +
      '<p>' + escapeHTML(guide.question) + '</p></section>' +
      '<footer class="study-guide-footer"><p>Aprenda o conceito, experimente outra situação e depois volte ao desafio.</p>' +
      '<div class="study-guide-actions"><button type="button" data-study-tab="examples">Ver Exemplos Práticos <span aria-hidden="true">→</span></button>' +
      '<button type="button" data-study-tab="statement">Voltar ao desafio</button></div></footer>' +
      '</div></article>';
  }

  window.StudyGuide = { render };
})();