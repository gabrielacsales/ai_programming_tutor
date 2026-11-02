// Editor Python progressivo: CodeMirror 5 com fallback para textarea simples.
// Todas as leituras/escritas passam por TutorEditor para não perder rascunhos.
(function () {
  "use strict";
  let instance = null;
  let suppressChange = false;
  const textarea = document.getElementById("textarea-code");
  const exampleContainer = document.getElementById("exercise-examples-content");

  function start(onChange) {
    if (!textarea) return false;
    if (window.CodeMirror && !instance) {
      const mobileEditor = window.matchMedia("(max-width: 640px)");
      instance = window.CodeMirror.fromTextArea(textarea, {
        mode: { name: "python", version: 3, singleLineStringErrors: false },
        theme: "material-darker",
        lineNumbers: true,
        firstLineNumber: 1,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        smartIndent: true,
        lineWrapping: mobileEditor.matches,
        viewportMargin: 12,
        autofocus: false,
        extraKeys: {
          Tab: cm => {
            if (cm.somethingSelected()) cm.indentSelection("add");
            else cm.replaceSelection("    ", "end");
          },
          "Shift-Tab": cm => cm.indentSelection("subtract")
        }
      });
      instance.on("change", () => {
        if (suppressChange) return;
        instance.save(); // sincroniza valor com textarea original
        if (typeof onChange === "function") onChange(getValue());
      });
      mobileEditor.addEventListener("change", (event) => {
        instance.setOption("lineWrapping", event.matches);
        instance.refresh();
      });
    }
    return Boolean(instance);
  }

  function getValue() {
    return instance ? instance.getValue() : (textarea ? textarea.value : "");
  }

  function setValue(value) {
    const next = String(value ?? "");
    if (instance) {
      suppressChange = true;
      try {
        instance.setValue(next);
        instance.save();
        instance.clearHistory();
      } finally {
        suppressChange = false;
      }
    } else if (textarea) {
      textarea.value = next;
    }
  }

  function refresh() {
    if (instance) requestAnimationFrame(() => instance.refresh());
  }

  function isEnabled() { return Boolean(instance); }

  function insertIndent() {
    if (instance) {
      instance.replaceSelection("    ", "end");
      instance.focus();
      return;
    }
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.setRangeText("    ", start, end, "end");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  }

  function renderExample(code) {
    if (!exampleContainer) return;
    exampleContainer.replaceChildren();
    if (!code) {
      exampleContainer.textContent = "Este exercício não possui exemplo de código.";
      return;
    }
    const card = document.createElement("div");
    card.className = "teacher-code-window";
    const header = document.createElement("div");
    header.className = "teacher-code-title";
    const dots = document.createElement("span");
    dots.className = "teacher-code-dots";
    for (let i = 0; i < 3; i++) dots.appendChild(document.createElement("i"));
    const name = document.createElement("span");
    name.textContent = "exemplo.py • Apenas leitura";
    header.append(dots, name);
    const pre = document.createElement("pre");
    pre.className = "teacher-code-pre cm-s-material-darker";
    pre.setAttribute("aria-label", "Exemplo de código Python do professor");
    if (window.CodeMirror && typeof window.CodeMirror.runMode === "function") {
      window.CodeMirror.runMode(code, "python", pre);
    } else {
      pre.textContent = code;
    }
    card.append(header, pre);
    const note = document.createElement("p");
    note.className = "text-xs text-slate-500 mt-3";
    note.textContent = "Exemplo de outro problema para estudar a sintaxe, não é a solução do desafio.";
    exampleContainer.append(card, note);
  }

  window.TutorEditor = { start, getValue, setValue, refresh, renderExample, isEnabled, insertIndent };
})();