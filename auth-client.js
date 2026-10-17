// Supabase Auth compartilhado pelas páginas HTML, sem framework.
(function () {
  const config = window.AI_TUTOR_SUPABASE || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.url || "") &&
    typeof config.publishableKey === "string" && config.publishableKey.trim().length > 0;
  const client = configured && window.supabase?.createClient
    ? window.supabase.createClient(config.url, config.publishableKey)
    : null;

  function safeNext(raw) {
    // Nunca redirecionar para URL externa passada por parâmetro.
    return /^(?:(?:conteudos|tutor)\.html(?:\?exercise=[a-zA-Z0-9_]+)?|perfil\.html|pesquisa\.html|painel-pesquisa\.html)$/.test(raw || "")
      ? raw : "conteudos.html";
  }

  async function requireLogin() {
    if (!client) {
      document.body.innerHTML =
        '<main style="font:16px system-ui;padding:48px;max-width:680px;margin:auto">' +
        '<h1>Configuração pendente</h1><p>Preencha supabase-config.js com a URL e a chave publicável do seu projeto Supabase.</p>' +
        '<a href="index.html">Voltar</a></main>';
      document.body.style.visibility = "visible";
      return false;
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      const next = location.pathname.split("/").pop() + location.search;
      location.replace("login.html?next=" + encodeURIComponent(safeNext(next)));
      return false;
    }
    document.body.style.visibility = "visible";
    return true;
  }

  async function logout() {
    if (client) await client.auth.signOut();
    // Não reaproveitar progresso local de uma pessoa na conta de outra.
    localStorage.removeItem("completed_exercises");
    location.replace("login.html");
  }

  window.TutorAuth = { client, requireLogin, logout, safeNext };
})();
