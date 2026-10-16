// Persistência dos exercícios do IA Tutor no Supabase (sempre isolada pelo usuário autenticado).
// Não confie neste arquivo para certificação: o navegador não é uma fonte confiável de resultados.
(function () {
  const client = window.TutorAuth?.client;
  let userId = null;
  let loadPromise = null;
  let records = new Map();
  const writeQueues = new Map();

  function syncLegacyIndicators() {
    // Mantém temporariamente a compatibilidade visual com telas antigas.
    // O banco, e não o localStorage, é a fonte dos dados da conta.
    const done = [...records.values()].filter(row => row.completed).map(row => row.exercise_id);
    localStorage.setItem("completed_exercises", JSON.stringify(done));
  }

  async function init() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      if (!client) throw new Error("Supabase não configurado.");
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) throw new Error("Faça login para carregar seu progresso.");
      userId = userData.user.id;
      const { data, error } = await client
        .from("exercise_progress")
        .select("exercise_id,user_code,user_idea,completed,metrics");
      if (error) throw error;
      records = new Map((data || []).map(row => [row.exercise_id, row]));
      syncLegacyIndicators();
      return true;
    })().catch(error => {
      loadPromise = null;
      throw error;
    });
    return loadPromise;
  }

  function get(exerciseId) {
    return records.get(exerciseId) || null;
  }

  function getCompletedIds() {
    return [...records.values()].filter(row => row.completed).map(row => row.exercise_id);
  }

  function save(exerciseId, changes) {
    if (!exerciseId || typeof exerciseId !== "string") {
      return Promise.reject(new Error("Exercício inválido."));
    }
    // Ordena escritas do mesmo exercício: um salvamento antigo não sobrescreve o mais recente.
    const previous = writeQueues.get(exerciseId) || Promise.resolve();
    const current = previous.catch(() => {}).then(async () => {
      await init();
      const row = {
        user_id: userId,
        exercise_id: exerciseId,
        user_code: String(changes.user_code ?? ""),
        user_idea: String(changes.user_idea ?? ""),
        completed: !!changes.completed,
        metrics: changes.metrics ?? {},
        updated_at: new Date().toISOString()
      };
      const { data, error } = await client.from("exercise_progress")
        .upsert(row, { onConflict: "user_id,exercise_id" })
        .select("exercise_id,user_code,user_idea,completed,metrics")
        .single();
      if (error) throw error;
      records.set(exerciseId, data);
      syncLegacyIndicators();
      return data;
    });
    writeQueues.set(exerciseId, current);
    current.finally(() => {
      if (writeQueues.get(exerciseId) === current) writeQueues.delete(exerciseId);
    }).catch(() => {});
    return current;
  }

  window.TutorProgress = { init, get, getCompletedIds, save };
})();
