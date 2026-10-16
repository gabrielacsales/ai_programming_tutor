// Perfis e permissões vêm de funções seguras do Supabase, nunca do localStorage.
(function () {
  const client = window.TutorAuth?.client;
  let loading = null;
  let role = "student";
  let unlocked = new Set();

  async function refresh() {
    if (!client) throw new Error("Supabase não está configurado.");
    const { data, error } = await client.rpc("get_tutor_access");
    if (error) throw new Error("Permissões indisponíveis. Execute supabase/developer-access.sql no Supabase. " + error.message);
    if (!data || !Array.isArray(data.unlocked)) {
      throw new Error("Resposta inválida ao consultar permissões.");
    }
    role = data.role === "developer" ? "developer" : "student";
    unlocked = new Set(data.unlocked);
    return { role, unlocked: [...unlocked] };
  }

  async function init() {
    if (!loading) {
      loading = refresh().catch(error => {
        loading = null;
        throw error;
      });
    }
    return loading;
  }

  function isDeveloper() { return role === "developer"; }
  function hasAccess(exerciseId) { return unlocked.has(exerciseId); }

  // Reconsulta o banco em cada entrada na página de exercício:
  // não é possível usar um parâmetro de URL para ignorar a progressão.
  async function verify(exerciseId) {
    if (!client) return false;
    const { data, error } = await client.rpc("can_access_exercise", {
      p_exercise_id: exerciseId
    });
    if (error) throw error;
    return data === true;
  }

  window.TutorAccess = { init, refresh, isDeveloper, hasAccess, verify };
})();