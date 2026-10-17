// Recursos de apresentação pedagógica: Markdown seguro, exemplos e guia contextual.
(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function renderInlineMarkdown(value) {
    let html = escapeHTML(value);
    html = html.replace(/\x60([^\x60]+)\x60/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return html;
  }

  function renderMixedLines(lines) {
    let output = "";
    let paragraph = [];
    let currentList = "";

    function flushParagraph() {
      if (paragraph.length) {
        output += "<p>" + paragraph.map(renderInlineMarkdown).join("<br>") + "</p>";
        paragraph = [];
      }
    }
    function closeList() {
      if (currentList) {
        output += "</" + currentList + ">";
        currentList = "";
      }
    }

    lines.forEach(function (line) {
      const match = line.match(/^\s*(?:([-*])\s+|(\d+)\.\s+)(.+)$/);
      if (match) {
        flushParagraph();
        const type = match[2] ? "ol" : "ul";
        if (currentList !== type) {
          closeList();
          output += "<" + type + ">";
          currentList = type;
        }
        output += "<li>" + renderInlineMarkdown(match[3]) + "</li>";
      } else {
        closeList();
        paragraph.push(line);
      }
    });

    flushParagraph();
    closeList();
    return output;
  }

  function renderExerciseStatementMarkdown(source) {
    const blocks = String(source || "").replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
    return blocks.map(function (block) {
      const value = block.trim();
      if (!value) return "";

      const fenced = value.match(/^\x60{3}[^\n]*\n([\s\S]*?)\n\x60{3}$/);
      if (fenced) return '<pre class="statement-code"><code>' + escapeHTML(fenced[1]) + "</code></pre>";

      const header = value.match(/^(#{1,3})\s+(.+)$/);
      if (header) {
        const level = Math.min(header[1].length + 2, 5);
        return "<h" + level + ">" + renderInlineMarkdown(header[2]) + "</h" + level + ">";
      }

      const note = value.match(/^(Fórmula|Exemplo|Resultado|Entrada|Saída):\s*/i);
      if (note) {
        const kind = /^Fórmula/i.test(note[1]) ? "formula" : "example";
        const body = value.slice(note[0].length).trim();
        return '<aside class="statement-callout statement-callout-' + kind + '"><strong class="statement-callout-title">' +
          escapeHTML(note[1]) + '</strong>' + renderMixedLines(body.split("\n").filter(Boolean)) + "</aside>";
      }

      if (value.startsWith("> ")) {
        return '<blockquote class="statement-quote">' + renderInlineMarkdown(value.replace(/^>\s?/gm, "")) + "</blockquote>";
      }

      return renderMixedLines(value.split("\n"));
    }).join("");
  }

  function renderPracticeExamples(problem) {
    const examples = Array.isArray(problem.practicalExamples) ? problem.practicalExamples : [];
    if (examples.length < 2) {
      return '<p class="text-slate-600">Exemplos em preparação para este exercício.</p>';
    }

    return '<p class="practical-intro">Estude estas duas aplicações semelhantes e adapte o raciocínio ao desafio. Os códigos não entregam a resposta pronta.</p>' +
      examples.map(function (example, index) {
        return '<article class="practical-example">' +
          '<div class="practical-example-number">Exemplo ' + (index + 1) + ' de ' + examples.length + "</div>" +
          "<h3>" + escapeHTML(example.title) + "</h3>" +
          "<p>" + escapeHTML(example.description) + "</p>" +
          '<pre class="teacher-code-pre cm-s-material-darker"><code>' + escapeHTML(example.code) + "</code></pre>" +
          "</article>";
      }).join("");
  }

  // Usa o mesmo tema e parser Python do CodeMirror utilizado no editor do aluno.
  // A função runMode apenas colore o texto, sem criar editores ou executar código.
  function highlightPracticalExamples(container) {
    if (!container || !window.CodeMirror || typeof window.CodeMirror.runMode !== "function") {
      return; // Mantém o código legível e escapado se o CDN estiver indisponível.
    }
    container.querySelectorAll(".practical-example pre code").forEach(function (codeElement) {
      window.CodeMirror.runMode(
        codeElement.textContent,
        { name: "python", version: 3, singleLineStringErrors: false },
        codeElement
      );
    });
  }

  function setFeedbackVisible(kind, visible) {
    const details = document.getElementById("feedback-panel-" + kind);
    if (!details) return;
    details.style.display = visible ? "block" : "none";
    if (visible) details.open = true;
  }

  const tourSteps = [
    {
      title: "Escreva com suas palavras",
      body: "Tem uma ideia, mas não sabe se ela faz sentido? Descreva os passos da sua estratégia aqui e registre a tentativa para receber uma avaliação do professor, mesmo antes de escrever Python.",
      getTarget: function () { return document.getElementById("tab-desc"); }
    },
    {
      title: "Dicas graduais",
      body: "Se ficar sem saber como continuar, peça uma dica. Cada solicitação revela uma pista para avançar no raciocínio, sem mostrar a solução completa.",
      getTarget: function () { return document.querySelector("#panel-code.active #btn-hint-code") || document.getElementById("btn-hint-desc"); }
    },
    {
      title: "Professor Socrático",
      body: "Faça perguntas sobre sua ideia, seu código ou o que não entendeu. O professor ajuda com perguntas e orientações para você construir a resposta.",
      getTarget: function () { return document.querySelector("#panel-code.active #btn-ask-tutor-code") || document.getElementById("btn-ask-tutor-desc"); }
    },
    {
      title: "Resumo e Exemplos Práticos",
      body: "Quer revisar o conteúdo antes de tentar? Abra o Resumo do Tema e confira também Exemplos Práticos: duas situações relacionadas para estudar e adaptar por conta própria.",
      getTarget: function () { return document.getElementById("tab-exercise-summary"); }
    }
  ];
  let currentStep = -1;
  let singleTip = false;
  let currentTarget = null;
  let popover = null;
  let tutorialReady = false;

  function markTourSeen() {
    try { localStorage.setItem("tutor-guided-tour-v1", "1"); } catch (_) { /* storage may be unavailable */ }
  }

  function clearHighlight() {
    if (currentTarget) currentTarget.classList.remove("feature-tour-target");
    currentTarget = null;
  }

  function closeTour() {
    clearHighlight();
    if (popover) popover.hidden = true;
    if (!singleTip) markTourSeen();
    currentStep = -1;
  }

  function positionTour() {
    if (!popover || popover.hidden || !currentTarget) return;
    const rect = currentTarget.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    popover.style.width = width + "px";
    const height = popover.offsetHeight;
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2));
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < height + 24 && rect.top > height + 24;
    const top = above ? Math.max(12, rect.top - height - 12) : Math.min(window.innerHeight - height - 12, rect.bottom + 12);
    popover.classList.toggle("feature-tour-above", above);
    popover.style.left = left + "px";
    popover.style.top = Math.max(12, top) + "px";
  }

  function showTourStep(index) {
    if (index >= tourSteps.length) {
      closeTour();
      return;
    }
    clearHighlight();
    currentStep = index;
    const step = tourSteps[index];
    const target = step.getTarget();
    if (!target || !popover) return;
    currentTarget = target;
    currentTarget.classList.add("feature-tour-target");

    popover.innerHTML =
      '<div class="feature-tour-heading"><span>' + (singleTip ? "Dica de uso" : "Passo " + (index + 1) + " de " + tourSteps.length) +
      '</span><button class="feature-tour-close" type="button" aria-label="Fechar dica">×</button></div>' +
      '<h3 id="feature-tour-title">' + escapeHTML(step.title) + '</h3>' +
      '<p>' + escapeHTML(step.body) + '</p>' +
      '<div class="feature-tour-actions"><button type="button" class="feature-tour-skip">' +
      (singleTip ? "Fechar" : "Pular guia") + '</button><button type="button" class="feature-tour-next">' +
      (singleTip ? "Entendi" : index === tourSteps.length - 1 ? "Concluir" : "Próximo") + "</button></div>";
    popover.hidden = false;
    popover.querySelector(".feature-tour-close").addEventListener("click", closeTour);
    popover.querySelector(".feature-tour-skip").addEventListener("click", closeTour);
    popover.querySelector(".feature-tour-next").addEventListener("click", function () {
      if (singleTip) closeTour();
      else showTourStep(currentStep + 1);
    });

    const rect = target.getBoundingClientRect();
    if (rect.top < 16 || rect.bottom > window.innerHeight - 16) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    positionTour();
    window.setTimeout(positionTour, 280);
  }

  function startTour(index, oneTipOnly) {
    singleTip = !!oneTipOnly;
    showTourStep(index);
  }

  function initFeatureTour() {
    if (tutorialReady) return;
    tutorialReady = true;
    popover = document.createElement("section");
    popover.id = "feature-tour-popover";
    popover.className = "feature-tour-popover";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-labelledby", "feature-tour-title");
    popover.setAttribute("aria-modal", "false");
    popover.hidden = true;
    document.body.appendChild(popover);

    const launch = document.getElementById("btn-feature-tour");
    if (launch) launch.addEventListener("click", function () { startTour(0, false); });

    document.querySelectorAll("[data-tour-step]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startTour(Number(button.getAttribute("data-tour-step")), true);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && currentStep !== -1) closeTour();
    });
    window.addEventListener("resize", positionTour);
    window.addEventListener("scroll", positionTour, true);

    let seen = false;
    try { seen = localStorage.getItem("tutor-guided-tour-v1") === "1"; } catch (_) { /* ignore */ }
    if (!seen) startTour(0, false);
  }

  window.learningUI = {
    renderExerciseStatementMarkdown: renderExerciseStatementMarkdown,
    renderPracticeExamples: renderPracticeExamples,
    highlightPracticalExamples: highlightPracticalExamples,
    setFeedbackVisible: setFeedbackVisible,
    initFeatureTour: initFeatureTour
  };
})();