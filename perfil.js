/* Painel pessoal do aluno: dados reais do Supabase, isolados pela conta autenticada.
 * Nunca usa a tabela de arquivo da versão anterior nem soma dados de outro aluno.
 */
(function () {
  "use strict";

  const VERSION = 2;
  // problems.js declara `const problems` no escopo global lexical, não em window.
  const curriculum = typeof problems !== "undefined" && Array.isArray(problems) ? problems : [];
  const modules = [
    { key: 1, label: "Módulo 1", topic: "Variáveis e operações" },
    { key: 2, label: "Módulo 2", topic: "Condicionais" },
    { key: 3, label: "Módulo 3", topic: "Laços de repetição" },
    { key: 4, label: "Módulo 4", topic: "Funções e listas" },
    { key: 5, label: "Módulo 5", topic: "Manipulação de dados" },
    { key: "final", label: "Desafio final", topic: "Integração dos conteúdos" }
  ];



  function metric(row, name) {
    const num = Number(row?.metrics?.[name] ?? 0);
    return Number.isFinite(num) ? Math.max(0, num) : 0;
  }

  function compileStatistics(rows, lessonCatalog = curriculum) {
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
      reengagement: current.reduce((sum, row) => sum + metric(row, "reengagement_after_block"), 0),
      idleSeconds: current.reduce((sum, row) => sum + metric(row, "idle_time_seconds"), 0),
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
    const lessons = (curriculum).filter((p) => p.module === section.key);
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


  // Para o dashboard usamos somente agregações reais dos registros atuais.
  // Sem eventos históricos de conclusão, seria incorreto desenhar linha de evolução temporal.
  function summarizeModules(stat, lessonCatalog = curriculum) {
    return modules.map((section) => {
      const lessons = lessonCatalog.filter((p) => p.module === section.key);
      const rows = lessons.map((p) => stat.byExercise.get(p.id)).filter(Boolean);
      return {
        ...section,
        total: lessons.length,
        completed: rows.filter((row) => row.completed === true).length,
        hints: rows.reduce((sum, row) => sum + metric(row, "hints_used"), 0),
        submissions: rows.reduce((sum, row) => sum + metric(row, "code_submissions"), 0)
      };
    });
  }

  function makeChartElement(tag, className, text = null) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== null) element.textContent = String(text);
    return element;
  }

  function renderModuleGraph(summary) {
    const chart = get("chart-modules");
    chart.replaceChildren();
    summary.forEach((entry) => {
      const row = makeChartElement("div", "module-chart-row");
      const label = makeChartElement("span", "module-chart-label", entry.label);
      const track = makeChartElement("div", "module-chart-track");
      const fill = makeChartElement("span", "module-chart-fill");
      const ratio = entry.total > 0 ? entry.completed / entry.total * 100 : 0;
      fill.style.width = ratio + "%";
      track.appendChild(fill);
      track.setAttribute("role", "img");
      track.setAttribute("aria-label", entry.label + ": " + entry.completed + " de " + entry.total + " concluídos");
      const value = makeChartElement("strong", "module-chart-value", entry.completed + "/" + entry.total);
      row.append(label, track, value);
      chart.appendChild(row);
    });
  }

  function localDayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  // Os timestamps são eventos reais de chat_messages, não snapshots de progresso.
  // Agrupamos pelo dia LOCAL do aluno para corresponder ao calendário que ele vê.
  function summarizeTutorTimeline(messages, today = new Date()) {
    const days = [];
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13);
    const counts = new Map();
    for (const message of messages || []) {
      const when = new Date(message.created_at);
      if (!Number.isFinite(when.getTime()) || when < start || when > today) continue;
      const key = localDayKey(when);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (let i = 0; i < 14; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = localDayKey(date);
      days.push({
        key, date,
        label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        count: counts.get(key) || 0
      });
    }
    return days;
  }

  // Paginação explícita: não perder eventos se a conta tiver mais de 1000 mensagens.
  async function fetchTutorTimeline(client, userId, today = new Date()) {
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13);
    const pageSize = 500;
    const all = [];
    let offset = 0;
    while (true) {
      const { data, error } = await client.from("chat_messages")
        .select("id,created_at")
        .eq("user_id", userId)
        .eq("role", "user")
        .eq("curriculum_version", VERSION)
        .gte("created_at", from.toISOString())
        .lte("created_at", today.toISOString())
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (error) throw new Error("Linha do tempo: " + error.message);
      all.push(...(data || []));
      if (!data || data.length < pageSize) break;
      offset += pageSize;
    }
    return all;
  }

  function svgNode(tag, attributes = {}, text = null) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [name, value] of Object.entries(attributes)) {
      node.setAttribute(name, String(value));
    }
    if (text !== null) node.textContent = String(text);
    return node;
  }

  function renderTutorTimeline(messages, today = new Date()) {
    const days = summarizeTutorTimeline(messages, today);
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const chart = get("chart-timeline");
    chart.replaceChildren();
    setText("chart-timeline-total", total + (total === 1 ? " interação" : " interações"));
    get("chart-timeline-empty").hidden = total !== 0;
    chart.setAttribute("aria-label", "Mensagens ao tutor nos últimos 14 dias: " +
      days.map(d => d.label + ", " + d.count).join("; "));

    const width = 940, height = 265;
    const margin = { left: 46, right: 18, top: 16, bottom: 40 };
    const bottom = height - margin.bottom;
    const plotHeight = bottom - margin.top;
    const plotWidth = width - margin.left - margin.right;
    const highest = Math.max(0, ...days.map(day => day.count));
    const yMax = Math.max(2, Math.ceil(highest / 2) * 2);
    const x = i => margin.left + plotWidth * i / (days.length - 1);
    const y = count => bottom - plotHeight * count / yMax;

    const svg = svgNode("svg", {
      viewBox: "0 0 " + width + " " + height,
      preserveAspectRatio: "xMidYMid meet",
      class: "timeline-svg",
      "aria-hidden": "true"
    });

    [0, yMax / 2, yMax].forEach(tick => {
      const yy = y(tick);
      svg.appendChild(svgNode("line", {
        x1: margin.left, x2: width - margin.right, y1: yy, y2: yy,
        class: "timeline-grid-line"
      }));
      svg.appendChild(svgNode("text", {
        x: margin.left - 10, y: yy + 4, "text-anchor": "end",
        class: "timeline-axis-label"
      }, tick));
    });

    const points = days.map((day, i) => [x(i), y(day.count)]);
    const polyline = points.map(([xx, yy], i) =>
      (i === 0 ? "M" : "L") + xx.toFixed(2) + " " + yy.toFixed(2)).join(" ");
    const shade = polyline +
      " L" + x(days.length - 1).toFixed(2) + " " + bottom +
      " L" + x(0).toFixed(2) + " " + bottom + " Z";

    svg.appendChild(svgNode("path", { d: shade, class: "timeline-area" }));
    svg.appendChild(svgNode("path", { d: polyline, class: "timeline-line" }));

    days.forEach((day, i) => {
      if (i % 3 === 0 || i === days.length - 1) {
        svg.appendChild(svgNode("text", {
          x: x(i), y: height - 12, "text-anchor": "middle",
          class: "timeline-axis-label"
        }, day.label));
      }
      const dot = svgNode("circle", {
        cx: x(i), cy: y(day.count), r: day.count ? 4.8 : 3.1,
        class: day.count ? "timeline-dot active" : "timeline-dot"
      });
      dot.appendChild(svgNode("title", {}, day.label + ": " + day.count +
        (day.count === 1 ? " mensagem" : " mensagens")));
      svg.appendChild(dot);
    });

    chart.appendChild(svg);
    return days;
  }

  function renderCharts(stat) {
    const percent = Math.max(0, Math.min(100, stat.percentage));
    const remaining = Math.max(0, stat.total - stat.completed);
    const donut = get("chart-donut");
    donut.style.background =
      "conic-gradient(var(--blue) 0% " + percent + "%, #ececee " + percent + "% 100%)";
    donut.setAttribute("aria-label", stat.completed + " de " + stat.total +
      " exercícios concluídos; " + remaining + " restantes.");
    setText("chart-donut-number", percent + "%");
    setText("chart-done-count", stat.completed);
    setText("chart-remaining-count", remaining);
    const summary = summarizeModules(stat);
    renderModuleGraph(summary);

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
    setText("stat-reengagement", stat.reengagement);
    setText("stat-idle", Math.floor(stat.idleSeconds / 60) + " min " + Math.round(stat.idleSeconds % 60) + " s");
    get("overall-progressbar").setAttribute("aria-valuemax", String(stat.total));
    get("overall-progressbar").setAttribute("aria-valuenow", String(stat.completed));
    get("overall-fill").style.width = stat.percentage + "%";
    renderCharts(stat);
    renderTutorTimeline(data.timelineMessages || [], data.timelineNow || new Date());

    const list = get("module-grid");
    list.replaceChildren();
    for (const item of modules) list.appendChild(buildModuleCard(item, stat.byExercise));

    const available = Array.isArray(data.access?.unlocked) ? new Set(data.access.unlocked) : null;
    const next = (curriculum).find((p) =>
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

    // O big number continua abrangendo todas as mensagens da versão atual.
    // Somente o gráfico 03 recebe os eventos datados dos últimos 14 dias.
    const timelineNow = new Date();
    const timelineMessages = await fetchTutorTimeline(client, user.id, timelineNow);

    render({
      user, profile: profileResult.data, progress: progressResult.data || [],
      messages: messagesResult.count ?? 0, access: roleResult.error ? null : roleResult.data,
      timelineMessages, timelineNow
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
  window.TutorProfileStats = { compileStatistics, summarizeModules, summarizeTutorTimeline, renderTutorTimeline };
})();