/* Instrumentação do estudo; coleta opt-in, sem texto de código/chat.
 * Ausência de consentimento/pré-teste => nenhuma inserção.
 * Timestamp, conta e schema são controlados por RPC no banco, MAS resultados
 * passados pelo navegador continuam auto-relatados e não são prova antifraude.
 */
(function () {
  "use strict";
  let allowed = false;
  let started = false;
  let lastError = "";
  const client = window.TutorAuth?.client;
  let pending = Promise.resolve();
  const exerciseSessions = new Map();
  function startExercise(exerciseId) {
    const rand = Math.random().toString(36).slice(2, 13);
    const token = "s" + Date.now().toString(36) + "_" + rand;
    exerciseSessions.set(exerciseId, token);
    return token;
  }
  async function init() {
    if (started) return allowed;
    if (!client) return false;
    const { data, error } = await client.rpc("research_my_status");
    started = !error;
    if (error) {
      // A aplicação educacional continua normalmente sem o módulo opcional de pesquisa.
      console.warn("Pesquisa não configurada ou indisponível:", error.message);
      return false;
    }
    allowed = Boolean(data?.enrolled && data?.pre && !data?.post && !data?.withdrawn);
    return allowed;
  }

  function record(exerciseId, eventType, details = {}) {
    if (!allowed || !client || typeof exerciseId !== "string") return Promise.resolve(false);
    // Sessão capturada imediatamente, antes da execução assíncrona em fila.
    const detailsWithSession = { ...details, session_id: exerciseSessions.get(exerciseId) || null };
    // Escritas serializadas evitam perder ordem observacional em chamadas muito rápidas.
    const job = pending.catch(() => false).then(async () => {
      const { data, error } = await client.rpc("research_record_event", {
        p_exercise_id: exerciseId,
        p_event_type: eventType,
        p_details: detailsWithSession
      });
      if (error) {
        if (lastError !== error.message) {
          console.warn("Evento de pesquisa não salvo:", error.message);
          lastError = error.message;
        }
        return false;
      }
      return data === true;
    });
    pending = job;
    return job;
  }

  function status() { return { enabled: allowed, configured: started }; }
  function stop() { allowed = false; }

  window.TutorResearch = { init, record, startExercise, stop, status };
})();