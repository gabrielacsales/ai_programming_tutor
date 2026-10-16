// Revisão interativa de sintaxe Python antes de cada exercício.
// Exemplos independentes: não revelam a solução dos desafios avaliados.
(function () {
  "use strict";

  const reviews = {
    m1_imc: { prompt: "Crie uma variável chamada idade com valor 20.", parts: ["idade", "=", "20"], note: "Em Python, = guarda um valor em uma variável." },
    m1_conversor_temp: { prompt: "Guarde a temperatura de 23 graus em uma variável.", parts: ["temperatura", "=", "23"], note: "O nome da variável fica à esquerda do sinal de atribuição." },
    m1_calculo_desconto: { prompt: "Monte uma soma entre dois números.", parts: ["resultado", "=", "8", "+", "4"], note: "O operador + representa a soma." },
    m2_maioridade: { prompt: "Monte uma condição que verifica se a nota é maior que 5.", parts: ["if", "nota", ">", "5", ":"], note: "O if verifica uma condição e termina com dois-pontos." },
    m2_par_impar: { prompt: "Guarde o resto da divisão de 9 por 4.", parts: ["resto", "=", "9", "%", "4"], note: "O operador % calcula o resto de uma divisão." },
    m2_desconto_categoria: { prompt: "Compare uma cor com a palavra 'azul'.", parts: ["if", "cor", "==", "'azul'", ":"], note: "Usamos == para comparar e = para atribuir." },
    m3_contagem: { prompt: "Reduza o valor de uma variável em uma unidade.", parts: ["contador", "-=", "1"], note: "O operador -= subtrai e atualiza a variável." },
    m3_soma_limite: { prompt: "Adicione cinco a um acumulador.", parts: ["total", "+=", "5"], note: "O operador += adiciona e atualiza a variável." },
    m3_tabuada: { prompt: "Crie um laço que percorra os números de 0 a 2.", parts: ["for", "i", "in", "range(3)", ":"], note: "range(3) gera os valores 0, 1 e 2." },
    m4_busca_linear: { prompt: "Acesse o primeiro elemento da lista.", parts: ["primeiro", "=", "lista", "[", "0", "]"], note: "O primeiro índice de uma lista em Python é zero." },
    m4_contagem_vogais: { prompt: "Percorra as letras de uma palavra.", parts: ["for", "letra", "in", "palavra", ":"], note: "O for pode percorrer cada caractere de uma string." },
    m4_status_nota: { prompt: "Declare uma função chamada avaliar, com um parâmetro nota.", parts: ["def", "avaliar", "(", "nota", ")", ":"], note: "Definimos funções com def, parênteses e dois-pontos." },
    m5_extremos: { prompt: "Crie uma lista com dois números.", parts: ["valores", "=", "[", "3", ",", "9", "]"], note: "Listas usam colchetes e elementos separados por vírgula." },
    m5_filtrar_nomes: { prompt: "Percorra os nomes de uma lista.", parts: ["for", "nome", "in", "nomes", ":"], note: "O for percorre os elementos de uma coleção." },
    m5_remover_duplicatas: { prompt: "Crie uma lista com dois itens.", parts: ["itens", "=", "[", "1", ",", "2", "]"], note: "Uma lista Python pode conter vários valores." },
    analisar_turma: { prompt: "Crie um dicionário com o nome de uma pessoa.", parts: ["pessoa", "=", "{", "'nome'", ":", "'Ana'", "}"], note: "Dicionários usam chaves e pares de chave e valor separados por dois-pontos." }
  };
  const fallback = { prompt: "Guarde o número 20 em uma variável.", parts: ["idade", "=", "20"], note: "O operador = atribui um valor." };
  let dialog = null;
  let task = fallback;
  let ordered = [];
  let remaining = [];
  let mistakes = 0;
  let completed = false;
  let onFinish = null;
  let previousFocus = null;

  function shuffle(parts) {
    const result = parts.map((part, index) => ({ part, index }));
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    if (result.length > 1 && result.every((item, i) => item.index === i)) {
      const temp = result[0];
      result[0] = result[1];
      result[1] = temp;
    }
    return result;
  }

  function get(selector) {
    return dialog.querySelector(selector);
  }

  function initDialog() {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.className = "tutor-review-dialog";
    dialog.setAttribute("aria-labelledby", "tutor-review-title");
    dialog.setAttribute("aria-describedby", "tutor-review-desc");
    dialog.innerHTML = [
      '<div class="tutor-review-shell">',
      '<div class="tutor-review-header">',
      '<span class="tutor-review-symbol" aria-hidden="true">✦</span>',
      '<div><p class="tutor-review-eyebrow">ANTES DO DESAFIO</p>',
      '<h2 id="tutor-review-title">Revisão rápida</h2></div>',
      '<button class="tutor-review-skip" type="button">Pular</button>',
      '</div>',
      '<div class="tutor-review-progress"><div class="tutor-review-progress-fill"></div></div>',
      '<p id="tutor-review-desc">Clique nos blocos na ordem correta para montar um comando Python.</p>',
      '<p class="tutor-review-question"></p>',
      '<div class="tutor-review-answer" aria-label="Sua resposta"></div>',
      '<p class="tutor-review-caption">ESCOLHA O PRÓXIMO BLOCO</p>',
      '<div class="tutor-review-bank" role="group" aria-label="Blocos disponíveis"></div>',
      '<p class="tutor-review-feedback" role="status" aria-live="polite"></p>',
      '<button class="tutor-review-continue" type="button" hidden>Começar exercício →</button>',
      '</div>'
    ].join("");
    get(".tutor-review-skip").addEventListener("click", () => finish(true));
    get(".tutor-review-continue").addEventListener("click", () => finish(false));
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(true);
    });
    document.body.appendChild(dialog);
  }

  function renderBank() {
    const bank = get(".tutor-review-bank");
    bank.replaceChildren();
    for (const item of remaining) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tutor-review-token";
      button.textContent = item.part;
      button.setAttribute("aria-label", "Selecionar " + item.part);
      button.addEventListener("click", () => choose(item, button));
      bank.appendChild(button);
    }
  }

  function choose(item, button) {
    if (completed) return;
    const feedback = get(".tutor-review-feedback");
    if (item.index !== ordered.length) {
      mistakes += 1;
      feedback.className = "tutor-review-feedback incorrect";
      feedback.textContent = "Ainda não! Pense em qual bloco vem agora e tente outra vez.";
      button.classList.remove("tutor-review-wrong");
      void button.offsetWidth;
      button.classList.add("tutor-review-wrong");
      return;
    }
    ordered.push(item);
    remaining = remaining.filter((entry) => entry.index !== item.index);
    const piece = document.createElement("span");
    piece.className = "tutor-review-placed";
    piece.textContent = item.part;
    get(".tutor-review-answer").appendChild(piece);
    get(".tutor-review-progress-fill").style.width = String(100 * ordered.length / task.parts.length) + "%";
    feedback.className = "tutor-review-feedback";
    feedback.textContent = "Boa! Continue.";
    renderBank();
    if (ordered.length === task.parts.length) {
      completed = true;
      feedback.className = "tutor-review-feedback correct";
      feedback.textContent = "✓ Correto! " + task.note;
      get(".tutor-review-continue").hidden = false;
      get(".tutor-review-continue").focus();
    } else {
      const nextButton = get(".tutor-review-bank button");
      if (nextButton) nextButton.focus();
    }
  }

  function finish(skipped) {
    if (!dialog || !dialog.open) return;
    dialog.close();
    document.body.style.overflow = dialog.dataset.previousOverflow || "";
    const callback = onFinish;
    onFinish = null;
    if (typeof callback === "function") {
      callback({ skipped, completed: !skipped, mistakes });
    }
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }

  function open(problem, callback) {
    if (!problem || !problem.id) return;
    initDialog();
    if (dialog.open) dialog.close();
    task = reviews[problem.id] || fallback;
    ordered = [];
    remaining = shuffle(task.parts);
    mistakes = 0;
    completed = false;
    onFinish = callback;
    previousFocus = document.activeElement;
    dialog.dataset.previousOverflow = document.body.style.overflow;
    get(".tutor-review-question").textContent = task.prompt;
    get(".tutor-review-answer").replaceChildren();
    get(".tutor-review-feedback").className = "tutor-review-feedback";
    get(".tutor-review-feedback").textContent = "Somente o bloco correto entra na sequência.";
    get(".tutor-review-continue").hidden = true;
    get(".tutor-review-progress-fill").style.width = "0%";
    renderBank();
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const firstButton = get(".tutor-review-bank button");
    if (firstButton) firstButton.focus();
  }
  window.TutorReview = { open };
})();