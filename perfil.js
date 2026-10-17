/* Painel pessoal do aluno: dados reais do Supabase, isolados pela conta autenticada.
 * Nunca usa a tabela de arquivo da versão anterior nem soma dados de outro aluno.
 */
(function () {
  "use strict";

  const VERSION = 2;
  const modules = [
    { key: 1, label: "Módulo 1", topic: "Variáveis e operações" },
    { key: 2, label: "Módulo 2", topic: "Condicionais" },
    { key: 3, label: "Módulo 3", topic: "Laços de repetição" },
    { key: 4, label: "Módulo 4", topic: "Funções e listas" },
    { key: 5, label: "Módulo 5", topic: "Manipulação de dados" },
    { key: "final", label: "Desafio final", topic: "Integração dos conteúdos" }
  ];

  const byId = new Map((window.problems || []).map((problem) => [problem.id, problem]));

  function metric(row, name) {
    const num = Number(row?.metrics?.[name] ?? 0);
    return Number.isFinite(num) ? Math.max(0, num) : 0;
  }

  function compileStatistics(rows, lessonCatalog = window.problems || []) {
    const known = new Set(lessonCatalog.map((p) => p.id));
    const current = (rows || []).filter((row) =>
      known.has(row.exercise_id) && Number(row?.metrics?.curriculum_version) === VERSION
    );
    const byExercise = new Map(current.map((row) => [row.exercise_id, row]));
    const completed = lessonCatalog.filter((p) => byExercise.get(p.id)?.completed === true).length;
    const started = current.filter((row) =>
      row.completed !== true && (
        String(row.user_code || "").trim().length > 0 ||
        String(row.user_idea || "").trim().length > 0 ||
        metric(row, "code_submissions") > 0
      )
    ).length;
    const lastDate = current
      .map((row) => new Date(row.updated_at))
      .filter((date) => Number.isFinite(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;

    return {
      total: lessonCatalog.length,
      completed,
      started,
      percentage: lessonCatalog.length ? Math.round(completed / lessonCatalog.length * 100) : 0,
      hints: current.reduce((sum, row) => sum + metric(row, "hints_used"), 0),
      submissions: current.reduce((sum, row) => sum + metric(row, "code_submissions"), 0),
      blocked: current.reduce((sum, row) => sum + metric(row, "blocked_direct_answer_attempts"), 0),
      lastDate,
      byExercise
    };
  }

  function get(id) { return document.getElementById(id); }
  function setText(id, value) {
    const element = get(id);
    if (element) element.textContent = String(value);
  }

  function formatDate(raw) {
    if (!raw) return "—";
    const date = raw instanceof Date ? raw : new Date(raw);
    if (!Number.isFinite(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  function initials(name) {
    return String(name || "").trim().split(/\s+/).slice(0, 2)
      .map((part) => Array.from(part)[0] || "").join("").toLocaleUpperCase("pt-BR") || "AL";
  }

  function buildModuleCard(section, records) {
    const lessons = (window.problems || []).filter((p) => p.module === section.key);
    const solved = lessons.filter((p) => records.get(p.id)?.completed === true).length;
    const card = document.createElement("article");
    card.className = "module-card";

    const top = document.createElement("div");
    top.className = "module-top";
    const label = document.createElement("span");
    label.className = "eyebrow";
    label.textContent = section.label;
    const amount = document.createElement("span");
    amount.className = "module-count";
    amount.textContent = solved + "/" + lessons.length;
    top.append(label, amount);
    const title = document.createElement("h3");
    title.textContent = section.topic;

    const bar = document.createElement("div");
    bar.className = "track";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", section.label + " concluído");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(lessons.length));
    bar.setAttribute("aria-valuenow", String(solved));
    const fill = document.createElement("span");
    fill.className = "fill";
    fill.style.width = (lessons.length ? solved / lessons.length * 100 : 0) + "%";
    bar.appendChild(fill);

    const list = document.createElement("ul");
    for (const problem of lessons) {
      const row = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = problem.title.replace(/^Módulo \d+:\s*/i, "").replace(/^Desafio Final:\s*/i, "");
      const status = document.createElement("strong");
      const progress = records.get(problem.id);
      const didStart = progress && (String(progress.user_code || "").trim() ||
        String(progress.user_idea || "").trim() || metric(progress, "code_submissions") > 0);
      status.textContent = progress?.completed === true ? "Concluído" : didStart ? "Em andamento" : "Não iniciado";
      if (progress?.completed === true) status.classList.add("done");
      row.append(name, status);
      list.appendChild(row);
    }
    card.append(top, title, bar, list);
    return card;
  }

  function render(data) {
    const user = data.user;
    const name = String(data.profile?.display_name || user.user_metadata?.display_name || "")
      .trim() || "Aluno";
    setText("profile-heading", name);
    setText("avatar-initials", initials(name));
    setText("student-email", user.email || "E-mail não disponível");
    setText("member-since", "Participando desde " + formatDate(data.profile?.created_at || user.created_at));

    if (data.access && ["developer", "student"].includes(data.access.role)) {
      const role = get("role-label");
      role.hidden = false;
      role.textContent = data.access.role === "developer" ? "Desenvolvedora" : "Aluno";
    }

    const stat = compileStatistics(data.progress);
    setText("stat-completed", stat.completed);
    setText("stat-percent", stat.percentage + "%");
    setText("stat-started", stat.started);
    setText("stat-last-active", formatDate(stat.lastDate));
    setText("progress-caption", stat.completed + " de " + stat.total + " desafios");
    setText("stat-hints", stat.hints);
    setText("stat-submissions", stat.submissions);
    setText("stat-tutor", data.messages ?? 0);
    setText("stat-blocked", stat.blocked);
    get("overall-progressbar").setAttribute("aria-valuemax", String(stat.total));
    get("overall-progressbar").setAttribute("aria-valuenow", String(stat.completed));
    get("overall-fill").style.width = stat.percentage + "%";

    const list = get("module-grid");
    list.replaceChildren();
    for (const item of modules) list.appendChild(buildModuleCard(item, stat.byExercise));

    const available = Array.isArray(data.access?.unlocked) ? new Set(data.access.unlocked) : null;
    const next = (window.problems || []).find((p) =>
      !stat.byExercise.get(p.id)?.completed && (!available || available.has(p.id))
    );
    get("continue-link").href = next && available
      ? "tutor.html?exercise=" + encodeURIComponent(next.id) : "conteudos.html";

    get("load-status").hidden = true;
    get("error-status").hidden = true;
    get("profile-content").hidden = false;
  }

  async function load() {
    get("load-status").hidden = false;
    get("profile-content").hidden = true;
    get("error-status").hidden = true;
    const ok = await window.TutorAuth.requireLogin();
    if (!ok) return;
    const client = window.TutorAuth.client;
    const { data: authData, error: authError } = await client.auth.getUser();
    const user = authData?.user;
    if (authError || !user) throw new Error("Não foi possível verificar sua sessão. Entre novamente.");

    // Todas as consultas filtram explicitamente a conta; RLS também exige auth.uid().
    const [profileResult, progressResult, messagesResult, roleResult] = await Promise.all([
      client.from("profiles").select("display_name,created_at").eq("id", user.id).maybeSingle(),
      client.from("exercise_progress")
        .select("exercise_id,user_code,user_idea,completed,metrics,updated_at")
        .eq("user_id", user.id),
      client.from("chat_messages").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("role", "user").eq("curriculum_version", VERSION),
      client.rpc("get_tutor_access")
    ]);
    if (profileResult.error) throw new Error("Dados da conta: " + profileResult.error.message);
    if (progressResult.error) throw new Error("Progresso: " + progressResult.error.message);
    if (messagesResult.error) throw new Error("Histórico do tutor: " + messagesResult.error.message +
      ". Confira se curriculum-v2.sql foi executado no Supabase.");
    // A leitura do papel é adicional; falhas dela não expõem dados de outra conta.
    if (roleResult.error) console.warn("Não foi possível consultar o nível de acesso:", roleResult.error.message);

    render({
      user, profile: profileResult.data, progress: progressResult.data || [],
      messages: messagesResult.count ?? 0, access: roleResult.error ? null : roleResult.data
    });
  }

  async function refresh() {
    try {
      await load();
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      get("load-status").hidden = true;
      get("profile-content").hidden = true;
      setText("error-details", error?.message || "Confira sua conexão e tente novamente.");
      get("error-status").hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    get("logout-btn").addEventListener("click", () => window.TutorAuth.logout());
    get("retry-btn").addEventListener("click", refresh);
    refresh();
  });

  // Utilitário puro exposto para testes do cálculo, sem divulgar dados pessoais.
  window.TutorProfileStats = { compileStatistics };
})();