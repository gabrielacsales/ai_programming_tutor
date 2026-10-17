// Cliente do Tutor Socrático com Guardrails e integração com API Google Gemini
class SocraticTutor {
  constructor() {
    // Limpa chaves antigas guardadas no navegador (Gemini agora roda no servidor).
    localStorage.removeItem("google_api_key");
  }

  // Guardrails locais de verificação de atalhos
  isDirectAnswerRequest(text) {
    const explicitRequest = /(?:me\s+(?:d[aáe]|pass(?:a|e)|mostr(?:a|e)|mand(?:a|e)|entreg(?:a|ue))|quero\s+(?:a|o)|qual\s+(?:é\s+)?(?:a|o)).{0,40}(?:gabarito|solu[cç][aã]o|resposta|c[oó]digo)/i;
    const readySolution = /(?:gabarito|c[oó]digo\s+(?:completo|pronto)|(?:resposta|solu[cç][aã]o)\s+(?:final|pronta|completa))/i;
    const solveForMe = /(?:resolv[ae]\s+(?:esse|o)\s+exerc[ií]cio\s+(?:para|pra)\s+mim|fa[çc]a\s+(?:esse|o)\s+exerc[ií]cio\s+(?:para|pra)\s+mim)/i;
    return explicitRequest.test(text || "") || readySolution.test(text || "") || solveForMe.test(text || "");
  }

  suggestsReadyLibrary(text) {
    const libSkipRe = /\b(us(ar|o)\s+(uma\s+)?fun[cç][aã]o\s+pronta|biblioteca|lib|import\s+\w+)\b/i;
    return libSkipRe.test(text || "");
  }

  // Helper para formatar o cabeçalho de contexto pedagógico
  _ctxToStr(ctx) {
    const title = ctx.title || "Exercício";
    const constraints = ctx.constraints || [];
    const constraintsTxt = constraints.length > 0 ? constraints.join(", ") : "siga as instruções do enunciado";
    return `[contexto] exercício: ${title} | restrições: ${constraintsTxt}`;
  }

  // Chamada autenticada à Supabase Edge Function: a chave Gemini nunca chega ao browser.
  async _chat(mode, message, ctx, code = "") {
    const client = window.TutorAuth?.client;
    if (!client) throw new Error("Faça login para usar o professor.");
    const { data, error } = await client.functions.invoke("gemini-tutor", {
      body: {
        mode,
        message,
        code,
        exercise: {
          id: ctx.id,
          title: ctx.title,
          statement: ctx.statement || "",
          constraints: ctx.constraints || []
        }
      }
    });
    if (error) {
      const backendError = (data && data.error) ||
        (error.context && typeof error.context.json === "function"
          ? await error.context.json().then(x => x?.error).catch(() => "")
          : "");
      throw new Error(backendError || "Não foi possível acessar o tutor. Confira se a Edge Function gemini-tutor foi publicada.");
    }
    if (!data || typeof data.reply !== "string") throw new Error("Resposta inválida do tutor.");
    return data.reply;
  }

  // Pergunta socrática geral (a proteção contra pedido de gabarito também roda no servidor).
  async ask(userMessage, ctx, currentCode = "") {
    return this._chat("ask", userMessage, ctx, currentCode);
  }

  async critiqueIdea(idea, ctx) {
    return this._chat("critique", idea, ctx);
  }

  async explainError(errorMsg, codeExcerpt, ctx) {
    return this._chat("error", errorMsg, ctx, codeExcerpt);
  }
}

// Torna global no navegador
window.SocraticTutor = SocraticTutor;
