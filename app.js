// Controlador principal da aplicação (SPA, Roteamento, Orquestração e Métricas)

// Classe Orchestrator para gerenciar o estado da sessão de cada exercício
class ChallengeOrchestrator {
  constructor(problem) {
    this.problem = problem;
    this.state = {
      attempts: [],
      hints_given: [],
      mode: "codigo",
      user_code: "",
      user_idea: "",
      completed: false
    };

    // Métricas comportamentais individuais por exercício
    this.metrics = {
      hints_used: 0,
      code_submissions: 0, // registrado a partir desta atualização
      idea_submissions: 0,
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
      curriculum_version: this.problem.curriculum_version || 1,
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
let showIdeaOnFirstVisit = false; // Uma vez por conta neste navegador.
const ideaNudgesShown = new Set();
let lastInteractionTime = Date.now();

// Evita gravações no banco a cada tecla pressionada.
const progressSaveTimers = new Map();

async function persistExercise(orch) {
  if (!orch) return;
  try {
    await TutorProgress.save(orch.problem.id, {
      user_code: orch.state.user_code,
      user_idea: orch.state.user_idea,
      completed: orch.state.completed,
      metrics: orch.metrics
    });
  } catch (error) {
    console.error("Falha ao salvar progresso no Supabase:", error);
    showToast("Não foi possível salvar o progresso. Verifique a conexão.");
  }
}

function scheduleProgressSave(orch = currentOrch) {
  if (!orch) return;
  const id = orch.problem.id;
  clearTimeout(progressSaveTimers.get(id));
  progressSaveTimers.set(id, setTimeout(() => {
    progressSaveTimers.delete(id);
    persistExercise(orch);
  }, 900));
}


// Elementos DOM
const screenLanding = document.getElementById("screen-landing");
const screenApp = document.getElementById("screen-app");
const btnStartNow = document.getElementById("btn-start-now");
const btnShowFeatures = document.getElementById("btn-show-features");
const btnBackLanding = document.getElementById("btn-back-landing");
const selectExercise = document.getElementById("select-exercise");
const alertToast = document.getElementById("alert-toast");

// Accordions e Expanders
const constraintsExpander = document.getElementById("constraints-expander");
const constraintsList = document.getElementById("constraints-list");

// Controle da Sidebar Retrátil
const sidebar = document.querySelector(".sidebar");
const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
const sidebarHandle = document.getElementById("sidebar-handle");

// Abas de Exercício e Conteúdo
const tabExerciseStatement = document.getElementById("tab-exercise-statement");
const tabExerciseSummary = document.getElementById("tab-exercise-summary");
const tabExerciseExamples = document.getElementById("tab-exercise-examples");
const viewExerciseStatement = document.getElementById("view-exercise-statement");
const viewExerciseSummary = document.getElementById("view-exercise-summary");
const viewExerciseExamples = document.getElementById("view-exercise-examples");
const exerciseSummaryContent = document.getElementById("exercise-summary-content");
const exerciseExamplesContent = document.getElementById("exercise-examples-content");

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
const exerciseStatusBadge = document.getElementById("exercise-status-badge");
const exerciseStatusIcon = document.getElementById("exercise-status-icon");
const exerciseStatusText = document.getElementById("exercise-status-text");


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

function showActionToast(htmlContent) {
  alertToast.innerHTML = htmlContent;
  alertToast.style.display = "block";
}

// A saída da IA e do código do aluno é tratada como TEXTO, não como HTML.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

// Histórico persistido na tabela chat_messages, filtrado automaticamente pela RLS.
let historyRequestNumber = 0;
async function loadChatHistory(exerciseId) {
  const list = document.getElementById("chat-history-list");
  if (!list) return;
  const requestNumber = ++historyRequestNumber;
  list.textContent = "Carregando histórico...";
  const client = window.TutorAuth?.client;
  if (!client) return;
  const { data, error } = await client.from("chat_messages")
    .select("id,role,content,created_at")
    .eq("exercise_id", exerciseId)
    .eq("curriculum_version", problems.find(p => p.id === exerciseId)?.curriculum_version || 1)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(30);
  if (requestNumber !== historyRequestNumber) return;
  list.replaceChildren();
  if (error) {
    list.textContent = "Não foi possível carregar o histórico.";
    return;
  }
  if (!data?.length) {
    list.textContent = "Ainda não há mensagens neste exercício.";
    return;
  }
  for (const message of data.reverse()) {
    const item = document.createElement("div");
    item.className = "rounded-lg p-3 border border-slate-200 bg-slate-50";
    const title = document.createElement("strong");
    title.textContent = message.role === "user" ? "Aluno" : "Tutor";
    const text = document.createElement("p");
    text.style.whiteSpace = "pre-wrap";
    text.textContent = message.content;
    item.append(title, text);
    list.appendChild(item);
  }
}

// Carrega os problemas na lista suspensa
function populateExercises(currentModule = null) {
  selectExercise.innerHTML = "";
  problems.forEach(p => {
    if (!currentModule || p.module === currentModule) {
      const opt = document.createElement("option");
      opt.value = p.id;
      const locked = !TutorAccess.hasAccess(p.id);
      opt.disabled = locked;
      opt.innerText = p.title + (locked ? " 🔒" : "");
      selectExercise.appendChild(opt);
    }
  });
}

// Renderiza o exercício ativo
let loadRequestId = 0;
async function loadActiveExercise(challengeId) {
  const requestId = ++loadRequestId;
  const p = problems.find(prob => prob.id === challengeId);
  if (!p) return;

  // O Supabase valida o acesso mesmo com URL editada ou dropdown modificado.
  try {
    const allowed = await TutorAccess.verify(challengeId);
    if (requestId !== loadRequestId) return;
    if (!allowed) {
      window.location.replace("conteudos.html");
      return;
    }
  } catch (error) {
    console.error("Erro ao verificar acesso ao exercício:", error);
    showToast("Não foi possível verificar as permissões. Confira a migração SQL.");
    return;
  }

  // Garante que a edição anterior seja persistida antes de trocar de exercício.
  if (currentOrch && currentOrch.problem.id !== challengeId) {
    clearTimeout(progressSaveTimers.get(currentOrch.problem.id));
    progressSaveTimers.delete(currentOrch.problem.id);
    persistExercise(currentOrch);
  }

  populateExercises(p.module);
  selectExercise.value = challengeId;

  // Busca ou cria a sessão do Orchestrator
  if (sessionMap.has(challengeId)) {
    currentOrch = sessionMap.get(challengeId);
  } else {
    currentOrch = new ChallengeOrchestrator(p);
    const saved = TutorProgress.get(challengeId);
    if (saved) {
      currentOrch.state.user_code = saved.user_code || "";
      currentOrch.state.user_idea = saved.user_idea || "";
      currentOrch.state.completed = !!saved.completed;
      if (saved.metrics && typeof saved.metrics === "object") {
        currentOrch.metrics = { ...currentOrch.metrics, ...saved.metrics };
      }
    }
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

  // Preenche Resumos do Tema e Exemplos
  exerciseSummaryContent.innerHTML = p.theory || `<p class="text-slate-600">${p.statement}</p>`;
  TutorEditor.renderExample(p.solution || "");

  const codeNotice = document.getElementById("code-input-notice");
  if (codeNotice) {
    codeNotice.textContent = p.function_name
      ? "Este exercício recebe o valor pelo parâmetro da função. Não altere o nome da função e use return (não print) para devolver o resultado."
      : "O ambiente já fornece a variável entrada e muda seu valor em cada teste. NÃO escreva entrada = 6 (ou outro valor fixo): use apenas entrada para calcular o resultado.";
  }

  // Restaura o estado da aba
  textareaDesc.value = currentOrch.state.user_idea;
  TutorEditor.setValue(currentOrch.state.user_code || (p.function_name
    ? `def ${p.function_name}(${p.function_parameter || 'dados'}):\n    # Escreva sua lógica aqui\n    pass`
    : `# entrada é definida automaticamente em cada caso de teste. NÃO a redefina.\n# Utilize print() para exibir o resultado.\n\n`));

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

  // O código é o fluxo principal. A primeira visita oferece uma única
  // oportunidade inicial de descrever a ideia, sem obrigar nas demais sessões.
  const mode = showIdeaOnFirstVisit ? "desc" : "code";
  showIdeaOnFirstVisit = false;
  switchMode(mode);
  const ideaNudge = document.getElementById("idea-nudge");
  if (ideaNudge) ideaNudge.hidden = true;
  lastInteractionTime = Date.now();

  // Reseta para a aba "Desafio"
  switchExerciseTab("statement");

  updateUIState();
  loadChatHistory(challengeId);
  // A revisão aparece ao entrar em qualquer exercício e não interfere
  // no estado do aluno nem nas métricas acadêmicas já instrumentadas.
  window.TutorResearch?.startExercise(p.id);
  window.TutorResearch?.record(p.id, "exercise_opened");
  if (window.TutorReview) TutorReview.open(p, (quiz) => {
    lastInteractionTime = Date.now(); // não contar o tempo gasto no popup como inatividade
    window.TutorResearch?.record(p.id, quiz?.completed ? "review_completed" : "review_skipped", {
      mistakes: quiz?.mistakes || 0
    });
  });
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
    TutorEditor.refresh();
  }
}

// Alterna entre abas de visualização do exercício ("Desafio", "Resumo do Tema" e "Exemplos do Professor")
function switchExerciseTab(tabId) {
  tabExerciseStatement.classList.remove("active");
  tabExerciseSummary.classList.remove("active");
  tabExerciseExamples.classList.remove("active");

  viewExerciseStatement.classList.add("hidden");
  viewExerciseSummary.classList.add("hidden");
  viewExerciseExamples.classList.add("hidden");

  if (tabId === "statement") {
    tabExerciseStatement.classList.add("active");
    viewExerciseStatement.classList.remove("hidden");
  } else if (tabId === "summary") {
    tabExerciseSummary.classList.add("active");
    viewExerciseSummary.classList.remove("hidden");
  } else if (tabId === "examples") {
    tabExerciseExamples.classList.add("active");
    viewExerciseExamples.classList.remove("hidden");
  }
}

// Atualiza o painel de métricas e status na tela
function updateUIState() {
  if (!currentOrch) return;

  // Status Badge no Card do Módulo
  if (exerciseStatusBadge && exerciseStatusIcon && exerciseStatusText) {
    if (currentOrch.state.completed) {
      exerciseStatusBadge.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-green-200 bg-green-50 text-green-700 self-start md:self-auto transition-all duration-300";
      exerciseStatusIcon.setAttribute("icon", "solar:check-circle-bold-duotone");
      exerciseStatusIcon.className = "text-sm text-green-500";
      exerciseStatusText.innerText = "Status: Concluído";
    } else {
      exerciseStatusBadge.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600 self-start md:self-auto transition-all duration-300";
      exerciseStatusIcon.setAttribute("icon", "solar:hourglass-line-duotone");
      exerciseStatusIcon.className = "text-sm text-slate-400";
      exerciseStatusText.innerText = "Status: Em andamento";
    }
  }

  // Dashboard de Métricas
  metricIpt.innerText = currentOrch.IPT();
  metricTrib.innerText = currentOrch.TRIB().toFixed(2);
  metricRer.innerText = currentOrch.RER().toFixed(2);
  metricIt.innerText = Math.round(currentOrch.IT()) + "s";
}


// ==================== 2. EVENT LISTENERS ====================

// Navegação de Telas
if (btnStartNow) {
  btnStartNow.addEventListener("click", () => {
    window.location.href = "tutor.html";
  });
}

if (btnShowFeatures) {
  btnShowFeatures.addEventListener("click", () => {
    const el = document.getElementById("features-anch");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  });
}

if (btnBackLanding) {
  btnBackLanding.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// Alternância de Exercício
selectExercise.addEventListener("change", (e) => {
  loadActiveExercise(e.target.value);
});

// Ordenação no DOM: código antes de ideia, inclusive para navegação por teclado.
tabCode.parentNode.insertBefore(tabCode, tabDesc);
panelCode.parentNode.insertBefore(panelCode, panelDesc);

// Ajuda opcional após 90s sem interação, nunca troca de aba sozinha.
const ideaNudgeElement = document.getElementById("idea-nudge");
document.getElementById("idea-nudge-open")?.addEventListener("click", () => {
  if (ideaNudgeElement) ideaNudgeElement.hidden = true;
  lastInteractionTime = Date.now();
  switchMode("desc");
  textareaDesc.focus();
});
document.getElementById("idea-nudge-dismiss")?.addEventListener("click", () => {
  if (ideaNudgeElement) ideaNudgeElement.hidden = true;
  lastInteractionTime = Date.now();
});

// Alternância de Abas
tabDesc.addEventListener("click", () => switchMode("desc"));
tabCode.addEventListener("click", () => switchMode("code"));

// Salvar input em tempo real no estado
textareaDesc.addEventListener("input", (e) => {
  if (currentOrch) currentOrch.state.user_idea = e.target.value;
  scheduleProgressSave();
  lastInteractionTime = Date.now();
});

textareaCode.addEventListener("input", (e) => {
  if (currentOrch) currentOrch.state.user_code = e.target.value;
  scheduleProgressSave();
  lastInteractionTime = Date.now();
});

// Realce/indentação CodeMirror: sincroniza o textarea escondido com o rascunho.
TutorEditor.start((value) => {
  if (currentOrch) currentOrch.state.user_code = value;
  scheduleProgressSave();
  lastInteractionTime = Date.now();
});

// Ao sair de um campo, grava o rascunho imediatamente.
textareaDesc.addEventListener("change", () => persistExercise(currentOrch));
textareaCode.addEventListener("change", () => persistExercise(currentOrch));

// Suporte para indentação com TAB de 4 espaços no editor
textareaCode.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 4;

    // Atualiza estado
    if (currentOrch) currentOrch.state.user_code = this.value;
    scheduleProgressSave();
    lastInteractionTime = Date.now();
  }
});

// Accordion de Restrições
if (constraintsExpander) {
  const trigger = constraintsExpander.querySelector(".expander-trigger");
  if (trigger) {
    trigger.addEventListener("click", () => {
      constraintsExpander.classList.toggle("open");
    });
  }
}

// Salva as últimas alterações antes de sair do exercício para ver estatísticas.
document.getElementById("nav-student-profile")?.addEventListener("click", async (event) => {
  if (!currentOrch) return;
  event.preventDefault();
  const button = event.currentTarget;
  button.style.pointerEvents = "none";
  const id = currentOrch.problem.id;
  clearTimeout(progressSaveTimers.get(id));
  progressSaveTimers.delete(id);
  currentOrch.state.user_code = TutorEditor.getValue();
  await persistExercise(currentOrch);
  window.location.href = "perfil.html";
});

// Event Listeners para Controle da Sidebar Retrátil
if (sidebarHandle) {
  sidebarHandle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

if (btnToggleSidebar) {
  btnToggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// Event Listeners para as Abas Superiores de Exercício
if (tabExerciseStatement) {
  tabExerciseStatement.addEventListener("click", () => switchExerciseTab("statement"));
}
if (tabExerciseSummary) {
  tabExerciseSummary.addEventListener("click", () => switchExerciseTab("summary"));
}
if (tabExerciseExamples) {
  tabExerciseExamples.addEventListener("click", () => switchExerciseTab("examples"));
}

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
    window.TutorResearch?.record(currentOrch.problem.id, "idea_submitted");
    currentOrch.metrics.idea_submissions = (Number(currentOrch.metrics.idea_submissions) || 0) + 1;
    currentOrch.recordReengagement(); // Considera reengajamento após bloqueios anteriores

    const critique = await tutor.critiqueIdea(idea, currentOrch.buildContext());
    feedbackDesc.innerHTML = `<strong>Feedback do Professor:</strong><br>${escapeHtml(critique)}`;
    await loadChatHistory(currentOrch.problem.id);
  } catch (e) {
    feedbackDesc.innerHTML = `<strong>Erro ao conectar com o Tutor:</strong><br>${escapeHtml(e.message)}`;
    feedbackDesc.className = "feedback-box error";
  } finally {
    btnSubmitDesc.disabled = false;
    updateUIState();
    scheduleProgressSave();
  }
});

// 2. Dicas (Hints)
[btnHintDesc, btnHintCode].forEach(btn => {
  btn.addEventListener("click", () => {
    lastInteractionTime = Date.now();
    if (!currentOrch) return;
    const beforeHintCount = currentOrch.metrics.hints_used;
    const hint = currentOrch.requestHint();
    if (currentOrch.metrics.hints_used > beforeHintCount) {
      window.TutorResearch?.record(currentOrch.problem.id, "hint_viewed");
    }
    showToast(`💡 Dica: ${hint}`);
    updateUIState();
    scheduleProgressSave();
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
  window.TutorResearch?.record(currentOrch.problem.id, "tutor_question");
  if (isDirect) window.TutorResearch?.record(currentOrch.problem.id, "tutor_blocked_request");

  try {
    const reply = await tutor.ask(q, currentOrch.buildContext(), "");

    if (isDirect) {
      replySocraticDesc.innerHTML = `<strong style="color: var(--color-error)">🚨 Bloqueio de Resposta Direta:</strong><br>${escapeHtml(reply)}`;
    } else {
      replySocraticDesc.innerHTML = `<strong>Resposta do Professor:</strong><br>${escapeHtml(reply)}`;
    }
  } catch (e) {
    replySocraticDesc.innerHTML = `<strong>Erro:</strong> ${escapeHtml(e.message)}`;
  } finally {
    btnSendSocraticDesc.disabled = false;
    updateUIState();
    loadChatHistory(currentOrch.problem.id);
    scheduleProgressSave();
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
  window.TutorResearch?.record(currentOrch.problem.id, "tutor_question");
  if (isDirect) window.TutorResearch?.record(currentOrch.problem.id, "tutor_blocked_request");

  try {
    const reply = await tutor.ask(q, currentOrch.buildContext(), code);

    if (isDirect) {
      replySocraticCode.innerHTML = `<strong style="color: var(--color-error)">🚨 Bloqueio de Resposta Direta:</strong><br>${escapeHtml(reply)}`;
    } else {
      replySocraticCode.innerHTML = `<strong>Resposta do Professor:</strong><br>${escapeHtml(reply)}`;
    }
  } catch (e) {
    replySocraticCode.innerHTML = `<strong>Erro:</strong> ${escapeHtml(e.message)}`;
  } finally {
    btnSendSocraticCode.disabled = false;
    updateUIState();
    loadChatHistory(currentOrch.problem.id);
    scheduleProgressSave();
  }
});

// Envio por Enter, nas duas abas, usando exatamente a mesma ação do botão.
// Mantém o botão funcionando e não duplica pedidos durante uma chamada pendente.
[
  [inputSocraticDesc, btnSendSocraticDesc],
  [inputSocraticCode, btnSendSocraticCode]
].forEach(([input, button]) => {
  input.addEventListener("keydown", (event) => {
    if (
      event.key !== "Enter" ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.repeat
    ) return;
    event.preventDefault();
    if (!button.disabled && input.value.trim()) {
      button.click();
    }
  });
});

// 6. Registrar e Testar Código Python (Pyodide)
btnSubmitCode.addEventListener("click", async () => {
  lastInteractionTime = Date.now();
  const code = TutorEditor.getValue();

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
    window.TutorResearch?.record(currentOrch.problem.id, "code_submitted");
    currentOrch.state.user_code = code;
    currentOrch.metrics.code_submissions = (Number(currentOrch.metrics.code_submissions) || 0) + 1;
    currentOrch.recordReengagement();

    // Roda no Pyodide
    const res = await runner.run(code, currentOrch.problem.function_name, currentOrch.problem.tests);

    // Evidências sobre os testes (auto-relato do navegador, não validação server-side).
    const testCases = Array.isArray(res.test_results) ? res.test_results : [];
    const passedTests = testCases.filter(t => t.ok).length;
    window.TutorResearch?.record(currentOrch.problem.id, "test_result", {
      passed: passedTests,
      total: testCases.length,
      success: testCases.length > 0 && passedTests === testCases.length && !res.error
    });

    // A saída do console pertence somente ao primeiro caso de teste.
    execResults.style.display = "flex";
    stdoutOutput.innerText = currentOrch.problem.function_name
      ? "A função devolve valores com return. Veja o resultado de cada caso abaixo."
      : (res.stdout || "(sem saída no primeiro teste)");

    // Tratamento de Erros de Execução/Compilação
    if (res.error) {
      errorWrapper.style.display = "block";
      errorOutput.innerText = res.error;
      errorAiHelp.innerHTML = "<em>IA analisando o erro...</em>";

      // Tutor explica erro
      const errorExplanation = await tutor.explainError(res.error, code, currentOrch.buildContext());
      errorAiHelp.innerHTML = `<strong>Explicação do Professor:</strong><br>${escapeHtml(errorExplanation)}`;
      loadChatHistory(currentOrch.problem.id);

      currentOrch.state.completed = false;
      document.getElementById("tests-wrapper").style.display = "none";
    } else {
      errorWrapper.style.display = "none";
      document.getElementById("tests-wrapper").style.display = "block";

      // Cada caso deixa explícita a entrada, o resultado e a saída esperada.
      // Saídas geradas pelo aluno entram no DOM como texto, nunca como HTML.
      testListContainer.replaceChildren();
      const cases = Array.isArray(res.test_results) ? res.test_results : [];
      const passed = cases.filter(t => t.ok).length;
      const allTestsPassed = cases.length > 0 && passed === cases.length;

      const summary = document.getElementById("test-summary");
      summary.className = "execution-summary " + (allTestsPassed ? "ok" : "partial");
      summary.textContent = allTestsPassed
        ? `Todos os ${cases.length} testes passaram. Excelente!`
        : `${passed} de ${cases.length} testes passaram. Seu código precisa funcionar com entradas diferentes.`;

      cases.forEach(t => {
        const item = document.createElement("div");
        item.className = `test-item ${t.ok ? "passed" : "failed"}`;
        const details = document.createElement("div");
        details.className = "test-case-text";

        const head = document.createElement("strong");
        head.textContent = "Caso " + t.id;
        const entry = document.createElement("div");
        entry.className = "test-case-input";
        entry.textContent = "Entrada fornecida: " + (t.input ?? "—");

        const values = document.createElement("div");
        values.className = "test-case-values";
        const expected = document.createElement("span");
        expected.textContent = "Esperado: ";
        const expectedCode = document.createElement("code");
        expectedCode.textContent = String(t.expected ?? "");
        expected.appendChild(expectedCode);
        const received = document.createElement("span");
        received.textContent = "Obtido: ";
        const receivedCode = document.createElement("code");
        receivedCode.textContent = t.result === null || t.result === undefined
          ? "(sem retorno)" : String(t.result);
        received.appendChild(receivedCode);
        values.append(expected, received);
        details.append(head, entry, values);

        if (t.error) {
          const err = document.createElement("div");
          err.className = "test-case-error";
          err.textContent = "Erro Python: " + t.error;
          details.appendChild(err);
        }
        const badge = document.createElement("span");
        badge.className = `test-badge ${t.ok ? "pass" : "fail"}`;
        badge.textContent = t.ok ? "PASSOU" : "REVER";
        item.append(details, badge);
        testListContainer.appendChild(item);
      });

      if (!allTestsPassed) {
        // Feedback determinístico, sem uma chamada Gemini automática a cada falha.
        // A ajuda socrática permanece disponível ao clicar em "Pergunte ao professor".
        testAiHelp.style.display = "block";
        testAiHelp.className = "feedback-box warning";
        testAiHelp.textContent = res.input_overwritten && !currentOrch.problem.function_name
          ? "Atenção: você atribuiu um valor a 'entrada' no próprio código. O avaliador já define essa variável com um valor diferente em cada caso. Remova a linha 'entrada = ...' e use o valor recebido."
          : "Compare a entrada, o resultado esperado e o obtido em cada caso. Tente localizar qual parte do seu raciocínio não funciona para todos os valores. Se precisar, use Dica ou Pergunte ao professor.";
        currentOrch.state.completed = false;
      } else {
        testAiHelp.style.display = "none";
        const newlyCompleted = !currentOrch.state.completed;
        currentOrch.state.completed = true;
        if (newlyCompleted) window.TutorResearch?.record(currentOrch.problem.id, "exercise_completed");

        // Salva antes de exibir o botão Próximo Desafio, evitando perder
        // a conclusão caso o aluno navegue imediatamente para outra página.
        await persistExercise(currentOrch);
        // O banco atualiza o desbloqueio do próximo desafio após a conclusão.
        try {
          await TutorAccess.refresh();
          populateExercises(currentOrch.problem.module);
          selectExercise.value = currentOrch.problem.id;
        } catch (error) {
          console.error("Falha ao atualizar desbloqueios:", error);
        }

        // A conclusão é persistida no Supabase ao terminar esta submissão.
        // ATENÇÃO: o resultado de testes do navegador não é prova acadêmica antifraude.

        // Achar próximo exercício do módulo
        let nextExerciseId = null;
        let isLastOfModule = true;
        let foundCurrent = false;
        
        for (let prob of problems) {
            if (prob.module === currentOrch.problem.module) {
                if (foundCurrent) {
                    nextExerciseId = prob.id;
                    isLastOfModule = false;
                    break;
                }
                if (prob.id === currentOrch.problem.id) {
                    foundCurrent = true;
                }
            }
        }
        
        if (isLastOfModule) {
            showActionToast(`
              <div class="flex flex-col items-center gap-2">
                <span>Parabéns! Todos os testes passaram! 🎉</span>
                <button onclick="window.location.href='conteudos.html'" class="px-4 py-1.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">Voltar aos Módulos ➔</button>
              </div>
            `);
        } else {
            showActionToast(`
              <div class="flex flex-col items-center gap-2">
                <span>Parabéns! Todos os testes passaram! 🎉</span>
                <button onclick="window.location.href='tutor.html?exercise=${nextExerciseId}'" class="px-4 py-1.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">Próximo Desafio ➔</button>
              </div>
            `);
        }
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
    scheduleProgressSave();
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
      if (currentOrch.metrics.idle_time_seconds % 20 === 0) {
        scheduleProgressSave();
        window.TutorResearch?.record(currentOrch.problem.id, "idle_interval", { idle_seconds: 20 });
      }
    }
  }
  const dialogActive = Boolean(document.querySelector(".tutor-review-dialog[open]"));
  if (
    currentOrch && !currentOrch.state.completed &&
    currentOrch.state.mode === "codigo" &&
    !dialogActive &&
    ideaNudgeElement?.hidden &&
    !ideaNudgesShown.has(currentOrch.problem.id) &&
    Date.now() - lastInteractionTime >= 90000
  ) {
    ideaNudgesShown.add(currentOrch.problem.id);
    ideaNudgeElement.hidden = false; // convite discreto, não troca de aba
  }
}, 1000);

// Init: lê primeiro os dados da conta, depois monta a interface.
(async function startTutor() {
  try {
    await TutorProgress.init();
    await TutorAccess.init();
    // Consentimento e pré-teste são verificados no Supabase antes de habilitar coleta.
    if (window.TutorResearch) await window.TutorResearch.init();
  } catch (error) {
    console.error("Erro ao carregar progresso:", error);
    showToast("Falha ao carregar progresso ou permissões. Execute developer-access.sql, se ainda não fez.");
    return;
  }
  // Por usuário e por navegador: somente a primeira abertura recomenda começar
  // pela ideia. Depois, o fluxo normal abre direto no editor Python.
  const authInfo = await TutorAuth.client.auth.getUser();
  const signedInId = authInfo.data?.user?.id;
  if (signedInId) {
    const firstVisitKey = "tutor_first_visit_intro_" + signedInId;
    showIdeaOnFirstVisit = localStorage.getItem(firstVisitKey) !== "1";
    if (showIdeaOnFirstVisit) localStorage.setItem(firstVisitKey, "1");
  }

  populateExercises();
  if (TutorAccess.isDeveloper()) {
    const badge = document.createElement("div");
    badge.textContent = "Modo desenvolvedora · Todos os exercícios liberados";
    badge.className = "text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 my-2";
    const anchor = document.querySelector(".sidebar-content") || document.body;
    anchor.prepend(badge);
  }
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseParam = urlParams.get("exercise");
  if (exerciseParam && problems.some(p => p.id === exerciseParam)) {
    loadActiveExercise(exerciseParam);
    if (selectExercise) selectExercise.value = exerciseParam;
  } else if (problems.length > 0) {
    loadActiveExercise(problems[0].id);
  }
  // Não inicializar Pyodide enquanto o popup de revisão estiver aberto.
  // A inicialização pesada podia bloquear os primeiros cliques no quiz.
  // CodeRunner.run() já carrega o interpretador sob demanda quando necessário.
})();

// A chave Gemini é exclusiva da Supabase Edge Function.
