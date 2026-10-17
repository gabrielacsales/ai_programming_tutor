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
    return /^(?:(?:conteudos|tutor)\.html(?:\?exercise=[a-zA-Z0-9_]+)?|perfil\.html|pesquisa\.html|painel-pesquisa\.html|inicio-senac\.html)$/.test(raw || "")
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

  async function requireCourseReady() {
    if (!client) {
      document.body.textContent = "Supabase não configurado. Confira supabase-config.js.";
      document.body.style.visibility = "visible";
      return false;
    }
    const { data: userData, error: authError } = await client.auth.getUser();
    const user = userData?.user;
    if (authError || !user) {
      location.replace("login.html?next=" + encodeURIComponent(
        safeNext(location.pathname.split("/").pop() + location.search)));
      return false;
    }
    try {
      let { data, error } = await client.rpc("senac_my_onboarding");
      if (error) throw error;
      if (!data?.affiliation && typeof user.user_metadata?.senac_student === "boolean") {
        // Opção escolhida no cadastro, salva na primeira sessão confirmada.
        const result = await client.rpc("senac_set_affiliation", {
          p_is_senac: user.user_metadata.senac_student
        });
        if (result.error) throw result.error;
        data = result.data;
      }
      if (!data?.course_ready) {
        location.replace("inicio-senac.html");
        return false;
      }
      document.body.style.visibility = "visible";
      return true;
    } catch (err) {
      // Não permitir acesso à área de exercícios se a migração estiver ausente.
      document.body.replaceChildren();
      const main = document.createElement("main");
      main.style.cssText = "font:15px system-ui;padding:40px;max-width:680px;margin:auto;line-height:1.6";
      const title = document.createElement("h1");
      title.textContent = "Preparação da trilha indisponível";
      const para = document.createElement("p");
      para.textContent = "A configuração de entrada do Senac ainda não está pronta no Supabase. Execute supabase/senac-onboarding.sql depois de research-study.sql e recarregue.";
      const detail = document.createElement("p");
      detail.textContent = err.message || "Erro desconhecido";
      const link = document.createElement("a");
      link.href = "inicio-senac.html";
      link.textContent = "Voltar aos primeiros passos";
      main.append(title,para,detail,link);
      document.body.appendChild(main);
      document.body.style.visibility = "visible";
      return false;
    }
  }

  async function logout() {
    if (client) await client.auth.signOut();
    // Não reaproveitar progresso local de uma pessoa na conta de outra.
    localStorage.removeItem("completed_exercises");
    location.replace("login.html");
  }

  window.TutorAuth = { client, requireLogin, requireCourseReady, logout, safeNext };
})();
