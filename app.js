// Controlador principal da aplicação (SPA, Roteamento, Orquestração e Métricas)

// Classe Orchestrator para gerenciar o estado da sessão de cada exercício
class ChallengeOrchestrator {
  constructor(problem) {
    this.problem = problem;
    this.state = {
      attempts: [],
      hints_given: [],
      mode: "descricao",
      user_code: "",
      user_idea: "",
      completed: false
    };
    
    // Métricas comportamentais individuais por exercício
    this.metrics = {
      hints_used: 0,
      blocked_direct_answer_attempts: 0,
      direct_answer_attempts: 0,
      reengagement_after_block: 0,
      idle_time_seconds: 0
    };
  }

  IPT() {
    return this.metrics.hints_used;
  }

  TRIB() {
    const denom = this.metrics.blocked_direct_answer_attempts + this.metrics.direct_answer_attempts;
    return denom === 0 ? 0.0 : this.metrics.blocked_direct_answer_attempts / Math.max(1, denom);
  }

  RER() {
    if (this.metrics.blocked_direct_answer_attempts === 0) return 0.0;
    return this.metrics.reengagement_after_block / Math.max(1, this.metrics.blocked_direct_answer_attempts);
  }

  IT() {
    return this.metrics.idle_time_seconds;
  }

  recordAttempt(text) {
    this.state.attempts.push({
      time: Date.now(),
      text: text
    });
  }

  recordDirectAnswerAttempt(wasBlocked) {
    if (wasBlocked) {
      this.metrics.blocked_direct_answer_attempts += 1;
    } else {
      this.metrics.direct_answer_attempts += 1;
    }
  }

  recordReengagement() {
    // Aluno faz uma tentativa legítima e tem bloqueios anteriores registrados
    if (this.metrics.blocked_direct_answer_attempts > this.metrics.reengagement_after_block) {
      this.metrics.reengagement_after_block += 1;
    }
  }

  requestHint() {
    const hints = this.problem.hints || [];
    const idx = this.state.hints_given.length;
    if (idx < hints.length) {
      const hint = hints[idx];
      this.state.hints_given.push(hint);
      this.metrics.hints_used += 1;
      return hint;
    }
    return "Não há mais dicas disponíveis para esta tarefa.";
  }

  buildContext() {
    let shortStmt = (this.problem.statement || "").trim();
    if (shortStmt.length > 220) {
      shortStmt = shortStmt.substring(0, 220) + "...";
    }
    return {
      id: this.problem.id,
      title: this.problem.title,
      statement: shortStmt,
      constraints: this.problem.constraints || []
    };
  }
}

// Inicializa os módulos globais
const runner = new CodeRunner();
const tutor = new SocraticTutor();

// Estado geral da aplicação
let currentOrch = null;
const sessionMap = new Map(); // Guarda instâncias do Orchestrator por Challenge ID
let lastInteractionTime = Date.now();

// Elementos DOM
const screenLanding = document.getElementById("screen-landing");
const screenApp = document.getElementById("screen-app");
const btnStartNow = document.getElementById("btn-start-now");
const btnShowFeatures = document.getElementById("btn-show-features");
const btnBackLanding = document.getElementById("btn-back-landing");
const selectExercise = document.getElementById("select-exercise");
const inputApiKey = document.getElementById("input-api-key");
const btnSaveKey = document.getElementById("btn-save-key");
const alertToast = document.getElementById("alert-toast");

// Accordions e Expanders
const accordionSummary = document.getElementById("accordion-summary");
const accordionSummaryContent = document.getElementById("accordion-summary-content");
const accordionExamples = document.getElementById("accordion-examples");
const accordionExamplesContent = document.getElementById("accordion-examples-content");
const constraintsExpander = document.getElementById("constraints-expander");
const constraintsList = document.getElementById("constraints-list");

// Abas de Modo
const tabDesc = document.getElementById("tab-desc");
const tabCode = document.getElementById("tab-code");
const panelDesc = document.getElementById("panel-desc");
const panelCode = document.getElementById("panel-code");

// Inputs de Exercício
const problemTitle = document.getElementById("problem-title");
const problemStatement = document.getElementById("problem-statement");
const textareaDesc = document.getElementById("textarea-desc");
const textareaCode = document.getElementById("textarea-code");
const statusBanner = document.getElementById("status-banner");

// Botões e Feedback - Aba Descrição
const btnSubmitDesc = document.getElementById("btn-submit-desc");
const btnHintDesc = document.getElementById("btn-hint-desc");
const btnAskTutorDesc = document.getElementById("btn-ask-tutor-desc");
const feedbackDesc = document.getElementById("feedback-desc");
const accSocraticDesc = document.getElementById("accordion-socratic-desc");
const inputSocraticDesc = document.getElementById("input-socratic-desc");
const btnSendSocraticDesc = document.getElementById("btn-send-socratic-desc");
const replySocraticDesc = document.getElementById("reply-socratic-desc");

// Botões e Feedback - Aba Código
const btnSubmitCode = document.getElementById("btn-submit-code");
const btnHintCode = document.getElementById("btn-hint-code");
const btnAskTutorCode = document.getElementById("btn-ask-tutor-code");
const feedbackCode = document.getElementById("feedback-code");
const pyodideSpinner = document.getElementById("pyodide-spinner");
const accSocraticCode = document.getElementById("accordion-socratic-code");
const inputSocraticCode = document.getElementById("input-socratic-code");
const btnSendSocraticCode = document.getElementById("btn-send-socratic-code");
const replySocraticCode = document.getElementById("reply-socratic-code");

// Seções de Resultado
const execResults = document.getElementById("execution-results");
const stdoutOutput = document.getElementById("stdout-output");
const errorWrapper = document.getElementById("error-wrapper");
const errorOutput = document.getElementById("error-output");
const errorAiHelp = document.getElementById("error-ai-help");
const testListContainer = document.getElementById("test-list-container");
const testAiHelp = document.getElementById("test-ai-help");

// Métricas DOM
const metricIpt = document.getElementById("metric-ipt");
const metricTrib = document.getElementById("metric-trib");
const metricRer = document.getElementById("metric-rer");
const metricIt = document.getElementById("metric-it");


// ==================== 1. FUNÇÕES AUXILIARES ====================

function showToast(message) {
  alertToast.innerText = message;
  alertToast.style.display = "block";
  setTimeout(() => {
    alertToast.style.display = "none";
  }, 4000);
}

// Atualiza o painel lateral de chaves
function initApiKey() {
  if (tutor.hasApiKey()) {
    inputApiKey.value = tutor.apiKey;
  }
}

// Carrega os problemas na lista suspensa
function populateExercises() {
  selectExercise.innerHTML = "";
  problems.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.innerText = p.title;
    selectExercise.appendChild(opt);
  });
}

// Renderiza o exercício ativo
function loadActiveExercise(challengeId) {
  const p = problems.find(prob => prob.id === challengeId);
  if (!p) return;

  // Busca ou cria a sessão do Orchestrator
  if (sessionMap.has(challengeId)) {
    currentOrch = sessionMap.get(challengeId);
  } else {
    currentOrch = new ChallengeOrchestrator(p);
    sessionMap.set(challengeId, currentOrch);
  }

  // Preenche metadados do exercício
  problemTitle.innerText = p.title;
  problemStatement.innerText = p.statement;

  // Preenche Restrições (constraints)
  constraintsList.innerHTML = "";
  if (p.constraints && p.constraints.length > 0) {
    p.constraints.forEach(c => {
      const li = document.createElement("li");
      li.innerText = c;
      constraintsList.appendChild(li);
    });
    document.getElementById("constraints-expander").style.display = "block";
  } else {
    document.getElementById("constraints-expander").style.display = "none";
  }

  // Preenche Resumos do Tema e Exemplos na Sidebar
  accordionSummaryContent.innerText = p.statement; // Usa o enunciado como resumo simples
  accordionExamplesContent.innerHTML = p.solution ? `<strong>Exemplo de solução:</strong><br><pre style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-top: 8px; white-space: pre-wrap;">${p.solution}</pre>` : "Este exercício não possui exemplos.";

  // Restaura o estado da aba
  textareaDesc.value = currentOrch.state.user_idea;
  textareaCode.value = currentOrch.state.user_code || `def ${p.function_name}(n):\n    # Escreva sua lógica aqui\n    pass`;

  // Reseta elementos de feedback visual da interface
  feedbackDesc.style.display = "none";
  feedbackCode.style.display = "none";
  accSocraticDesc.style.display = "none";
  accSocraticCode.style.display = "none";
  inputSocraticDesc.value = "";
  inputSocraticCode.value = "";
  replySocraticDesc.innerText = "";
  replySocraticCode.innerText = "";
  execResults.style.display = "none";

  // Sincroniza abas
  if (currentOrch.state.mode === "descricao") {
    switchMode("desc");
  } else {
    switchMode("code");
  }

  updateUIState();
}

// Alterna entre abas "Descrever Ideia" e "Código"
function switchMode(mode) {
  if (mode === "desc") {
    tabDesc.classList.add("active");
    tabCode.classList.remove("active");
    panelDesc.classList.add("active");
    panelCode.classList.remove("active");
    if (currentOrch) currentOrch.state.mode = "descricao";
  } else {
    tabCode.classList.add("active");
    tabDesc.classList.remove("active");
    panelCode.classList.add("active");
    panelDesc.classList.remove("active");
    if (currentOrch) currentOrch.state.mode = "codigo";
  }
}

// Atualiza o painel de métricas e status na tela
function updateUIState() {
  if (!currentOrch) return;

  // Status Banner
  if (currentOrch.state.completed) {
    statusBanner.innerText = "Status do exercício: Concluído ✅";
    statusBanner.className = "status-banner completed";
  } else {
    statusBanner.innerText = "Status do exercício: Em andamento";
    statusBanner.className = "status-banner";
  }

  // Dashboard de Métricas
  metricIpt.innerText = currentOrch.IPT();
  metricTrib.innerText = currentOrch.TRIB().toFixed(2);
  metricRer.innerText = currentOrch.RER().toFixed(2);
  metricIt.innerText = Math.round(currentOrch.IT()) + "s";
}


// ==================== 2. EVENT LISTENERS ====================

// Navegação de Telas
btnStartNow.addEventListener("click", () => {
  screenLanding.classList.remove("active");
  screenApp.classList.add("active");
  // Inicializa o Pyodide em background assim que entra no workspace
  runner.init().catch(() => {});
});

btnShowFeatures.addEventListener("click", () => {
  document.getElementById("features-anch").scrollIntoView({ behavior: "smooth" });
});

btnBackLanding.addEventListener("click", () => {
  screenApp.classList.remove("active");
  screenLanding.classList.add("active");
});

// Salvamento da OpenAI API Key
btnSaveKey.addEventListener("click", () => {
  tutor.setApiKey(inputApiKey.value);
  showToast("Configurações de chave atualizadas!");
});

// Alternância de Exercício
selectExercise.addEventListener("change", (e) => {
  loadActiveExercise(e.target.value);
});

// Alternância de Abas
tabDesc.addEventListener("click", () => switchMode("desc"));
tabCode.addEventListener("click", () => switchMode("code"));

// Salvar input em tempo real no estado
textareaDesc.addEventListener("input", (e) => {
  if (currentOrch) currentOrch.state.user_idea = e.target.value;
  lastInteractionTime = Date.now();
});

textareaCode.addEventListener("input", (e) => {
  if (currentOrch) currentOrch.state.user_code = e.target.value;
  lastInteractionTime = Date.now();
});

// Suporte para indentação com TAB de 4 espaços no editor
textareaCode.addEventListener("keydown", function(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 4;
    
    // Atualiza estado
    if (currentOrch) currentOrch.state.user_code = this.value;
    lastInteractionTime = Date.now();
  }
});

// Accordions Gerais
[accordionSummary, accordionExamples, constraintsExpander].forEach(elem => {
  if (!elem) return;
  const trigger = elem.querySelector(".accordion-header") || elem.querySelector(".expander-trigger");
  trigger.addEventListener("click", () => {
    elem.classList.toggle("open");
    // Se for um accordion de sidebar, fecha o outro ao abrir um
    if (elem.classList.contains("accordion-item") && elem.classList.contains("open")) {
      const other = elem.id === "accordion-summary" ? accordionExamples : accordionSummary;
      other.classList.remove("open");
    }
  });
});

// Rastreamento global de inatividade
document.addEventListener("click", () => { lastInteractionTime = Date.now(); });
document.addEventListener("keypress", () => { lastInteractionTime = Date.now(); });
document.addEventListener("scroll", () => { lastInteractionTime = Date.now(); });


// ==================== 3. ENVIOS E TUTOR SOCRÁTICO ====================

// 1. Registrar tentativa de Ideia
btnSubmitDesc.addEventListener("click", async () => {
  lastInteractionTime = Date.now();
  const idea = textareaDesc.value.trim();
  
  if (idea.length < 10) {
    showToast("Escreva pelo menos 10 caracteres para registrar.");
    return;
  }

  btnSubmitDesc.disabled = true;
  feedbackDesc.style.display = "block";
  feedbackDesc.className = "feedback-box";
  feedbackDesc.innerHTML = "<em>Professor avaliando sua ideia...</em>";

  try {
    currentOrch.recordAttempt(idea);
    currentOrch.recordReengagement(); // Considera reengajamento após bloqueios anteriores

    const critique = await tutor.critiqueIdea(idea, currentOrch.buildContext());
    feedbackDesc.innerHTML = `<strong>Feedback do Professor:</strong><br>${critique}`;
  } catch (e) {
    feedbackDesc.innerHTML = `<strong>Erro ao conectar com o Tutor:</strong><br>${e.message}`;
    feedbackDesc.className = "feedback-box error";
  } finally {
    btnSubmitDesc.disabled = false;
    updateUIState();
  }
});

// 2. Dicas (Hints)
[btnHintDesc, btnHintCode].forEach(btn => {
  btn.addEventListener("click", () => {
    lastInteractionTime = Date.now();
    if (!currentOrch) return;
    const hint = currentOrch.requestHint();
    showToast(`💡 Dica: ${hint}`);
    updateUIState();
  });
});

// 3. Pergunte ao Professor (Alternador de Caixa de Perguntas)
btnAskTutorDesc.addEventListener("click", () => {
  accSocraticDesc.style.display = accSocraticDesc.style.display === "none" ? "block" : "none";
});

btnAskTutorCode.addEventListener("click", () => {
  accSocraticCode.style.display = accSocraticCode.style.display === "none" ? "block" : "none";
});

// 4. Enviar pergunta socrática - Aba Ideia
btnSendSocraticDesc.addEventListener("click", async () => {
  lastInteractionTime = Date.now();
  const q = inputSocraticDesc.value.trim();
  if (!q) return;

  btnSendSocraticDesc.disabled = true;
  replySocraticDesc.innerHTML = "<em>Professor digitando...</em>";

  const isDirect = tutor.isDirectAnswerRequest(q);
  currentOrch.recordDirectAnswerAttempt(isDirect);

  try {
    const reply = await tutor.ask(q, currentOrch.buildContext(), "");
    
    if (isDirect) {
      replySocraticDesc.innerHTML = `<strong style="color: var(--color-error)">🚨 Bloqueio de Resposta Direta:</strong><br>${reply}`;
    } else {
      replySocraticDesc.innerHTML = `<strong>Resposta do Professor:</strong><br>${reply}`;
    }
  } catch (e) {
    replySocraticDesc.innerHTML = `<strong>Erro:</strong> ${e.message}`;
  } finally {
    btnSendSocraticDesc.disabled = false;
    updateUIState();
  }
});

// 5. Enviar pergunta socrática - Aba Código
btnSendSocraticCode.addEventListener("click", async () => {
  lastInteractionTime = Date.now();
  const q = inputSocraticCode.value.trim();
  const code = textareaCode.value;
  if (!q) return;

  btnSendSocraticCode.disabled = true;
  replySocraticCode.innerHTML = "<em>Professor digitando...</em>";

  const isDirect = tutor.isDirectAnswerRequest(q);
  currentOrch.recordDirectAnswerAttempt(isDirect);

  try {
    const reply = await tutor.ask(q, currentOrch.buildContext(), code);
    
    if (isDirect) {
      replySocraticCode.innerHTML = `<strong style="color: var(--color-error)">🚨 Bloqueio de Resposta Direta:</strong><br>${reply}`;
    } else {
      replySocraticCode.innerHTML = `<strong>Resposta do Professor:</strong><br>${reply}`;
    }
  } catch (e) {
    replySocraticCode.innerHTML = `<strong>Erro:</strong> ${e.message}`;
  } finally {
    btnSendSocraticCode.disabled = false;
    updateUIState();
  }
});

// 6. Registrar e Testar Código Python (Pyodide)
btnSubmitCode.addEventListener("click", async () => {
  lastInteractionTime = Date.now();
  const code = textareaCode.value;

  if (code.trim().length < 3) {
    showToast("Escreva seu código antes de submeter.");
    return;
  }

  // Desabilita botões e mostra spinner
  btnSubmitCode.disabled = true;
  pyodideSpinner.style.display = "inline-block";
  execResults.style.display = "none";
  feedbackCode.style.display = "none";

  try {
    currentOrch.recordAttempt(code);
    currentOrch.recordReengagement();

    // Roda no Pyodide
    const res = await runner.run(code, currentOrch.problem.function_name, currentOrch.problem.tests);

    // Renderiza resultados de saída
    execResults.style.display = "flex";
    stdoutOutput.innerText = res.stdout.trim() || "(saída vazia)";
    
    // Tratamento de Erros de Execução/Compilação
    if (res.error) {
      errorWrapper.style.display = "block";
      errorOutput.innerText = res.error;
      errorAiHelp.innerHTML = "<em>IA analisando o erro...</em>";
      
      // Tutor explica erro
      const errorExplanation = await tutor.explainError(res.error, code, currentOrch.buildContext());
      errorAiHelp.innerHTML = `<strong>Explicação do Professor:</strong><br>${errorExplanation}`;
      
      currentOrch.state.completed = false;
      document.getElementById("tests-wrapper").style.display = "none";
    } else {
      errorWrapper.style.display = "none";
      document.getElementById("tests-wrapper").style.display = "block";
      
      // Renderiza lista de testes
      testListContainer.innerHTML = "";
      let allTestsPassed = true;

      res.test_results.forEach(t => {
        const item = document.createElement("div");
        item.className = `test-item ${t.ok ? 'passed' : 'failed'}`;
        
        const details = document.createElement("div");
        details.innerHTML = `<strong>Caso ${t.id}:</strong> ${t.error ? 'Exceção gerada' : `Obtido: <code>${t.result}</code> | Esperado: <code>${t.expected}</code>`}`;
        
        const badge = document.createElement("span");
        badge.className = `test-badge ${t.ok ? 'pass' : 'fail'}`;
        badge.innerText = t.ok ? "PASS" : "FAIL";
        
        item.appendChild(details);
        item.appendChild(badge);
        testListContainer.appendChild(item);

        if (!t.ok) allTestsPassed = false;
      });

      // Se falhou nos testes, IA dá dicas sobre falha
      if (!allTestsPassed) {
        testAiHelp.style.display = "block";
        testAiHelp.className = "feedback-box warning";
        testAiHelp.innerHTML = "<em>Professor analisando as falhas...</em>";
        
        const testHint = await tutor.ask(
          "Me ajude a entender por que meus casos de teste falharam e o que verificar no código (sem dar a resposta pronta).",
          currentOrch.buildContext(),
          code
        );
        testAiHelp.innerHTML = `<strong>Dica do Professor:</strong><br>${testHint}`;
        
        currentOrch.state.completed = false;
      } else {
        testAiHelp.style.display = "none";
        currentOrch.state.completed = true;
        showToast("Parabéns! Todos os testes passaram! 🎉");
      }
    }
  } catch (e) {
    console.error(e);
    feedbackCode.style.display = "block";
    feedbackCode.innerText = `Erro interno ao rodar o Python: ${e.message}`;
  } finally {
    btnSubmitCode.disabled = false;
    pyodideSpinner.style.display = "none";
    updateUIState();
  }
});


// ==================== 4. INICIALIZAÇÃO E MONITOR DE MÉTRICAS ====================

// Loop periódico para contar o Tempo de Inatividade (IT)
setInterval(() => {
  if (currentOrch && !currentOrch.state.completed && screenApp.classList.contains("active")) {
    const elapsedSinceInteraction = Date.now() - lastInteractionTime;
    // Se o aluno está sem interagir por mais de 5 segundos, incrementa o tempo de inatividade
    if (elapsedSinceInteraction > 5000) {
      currentOrch.metrics.idle_time_seconds += 1;
      updateUIState();
    }
  }
}, 1000);

// Init
initApiKey();
populateExercises();
if (problems.length > 0) {
  loadActiveExercise(problems[0].id);
}
