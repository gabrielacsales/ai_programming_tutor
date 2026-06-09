// Cliente do Tutor Socrático com Guardrails e integração com OpenAI API
class SocraticTutor {
  constructor() {
    this.apiKey = localStorage.getItem("openai_api_key") || "";
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem("openai_api_key", this.apiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }

  hasApiKey() {
    return this.apiKey.length > 0;
  }

  // Guardrails locais de verificação de atalhos
  isDirectAnswerRequest(text) {
    const finalAskRe = /\b(resposta|solu[cç][aã]o|c[oó]digo\s*completo|gabarito)\b/i;
    return finalAskRe.test(text || "");
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

  // Executa chamada HTTP para a API da OpenAI
  async _chat(system, user) {
    if (!this.hasApiKey()) {
      throw new Error("Chave de API da OpenAI não configurada.");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (e) {
      console.error("Erro na chamada OpenAI:", e);
      throw e;
    }
  }

  // Pergunta socrática geral
  async ask(userMessage, ctx, currentCode = "") {
    // 1) Interceptação local (gating imediato de resposta pronta)
    if (this.isDirectAnswerRequest(userMessage)) {
      return `Para o ${this._ctxToStr(ctx)}, não posso fornecer o código pronto ou gabarito direto.\n\nVamos dar um passo atrás: qual seria a entrada de dados (argumentos) e o retorno esperado dessa função? Tente esboçar apenas a definição da função (def) e podemos continuar a partir daí.`;
    }

    // 2) Se não tiver chave, devolve fallback amigável
    if (!this.hasApiKey()) {
      return `⚠️ **Aviso:** Insira sua chave OpenAI na barra lateral para habilitar o tutor inteligente.\n\n*Dica socrática genérica:* Tente dividir o problema em pequenas partes. O que seu código deve fazer primeiro? Como obter a entrada e processá-la?`;
    }

    // 3) Chamada de IA real
    const sys = `Você é um professor socrático de programação. Nunca entregue a solução final ou código pronto. Use o contexto fornecido para manter a conversa alinhada ao exercício e à linguagem (Python). Quando o aluno tentar usar atalhos (ex.: usar lib pronta se a meta é implementar do zero), reoriente de forma gentil, propondo pequenos passos e fazendo perguntas.`;
    
    let user = `${this._ctxToStr(ctx)}`;
    if (currentCode) {
      user += `\n[Código atual do aluno]:\n${currentCode}`;
    }
    user += `\nPergunta do aluno: ${userMessage}`;

    return await this._chat(sys, user);
  }

  // Avaliação da ideia inicial (método critique_idea)
  async critiqueIdea(idea, ctx) {
    // 1) Intercepta tentativa de usar bibliotecas prontas
    if (this.suggestsReadyLibrary(idea)) {
      return `No ${this._ctxToStr(ctx)}, o objetivo é que você construa o algoritmo do zero. Evite usar funções prontas de bibliotecas externas.\n\nTente descrever os passos lógicos básicos que você vai usar usando estruturas de controle básicas (como loops, condicionais ou operadores matemáticos).`;
    }

    // 2) Se não tiver chave, heurística local
    if (!this.hasApiKey()) {
      const cleanIdea = (idea || "").trim();
      if (cleanIdea.length < 20) {
        return `⚠️ *(Insira a chave OpenAI para avaliação detalhada)*\n\nSua explicação está muito curta. Tente detalhar um pouco mais as etapas do que planeja fazer.`;
      }
      return `⚠️ *(Insira a chave OpenAI para avaliação detalhada)*\n\nSua ideia parece ter uma boa estrutura. Tente traduzi-la em código Python na aba "Escrever código" para rodar os testes!`;
    }

    // 3) Chamada de IA real
    const sys = `Você é um professor de programação. Avalie se a descrição de ideia do aluno faz sentido em alto nível para o contexto fornecido. Responda em 1 ou 2 frases, sem apresentar nenhum código e sem entregar a resposta final. Se fizer sentido lógico, diga: 'Sim, a lógica faz sentido.' e o incentive a ir para o código. Se houver falhas de lógica ou lacunas, aponte-as de forma socrática, fazendo 1–2 perguntas orientadoras.`;
    
    const user = `${this._ctxToStr(ctx)}\nDescrição da ideia do aluno: ${idea}`;
    return await this._chat(sys, user);
  }

  // Explica erros de compilação ou execução de forma pedagógica
  async explainError(errorMsg, codeExcerpt, ctx) {
    // 1) Se não tiver chave, heurística local para erros comuns de Python
    if (!this.hasApiKey()) {
      let explanation = `⚠️ **Erro detectado:** \`${errorMsg}\`\n*(Insira sua chave OpenAI para receber ajuda passo a passo)*\n\n`;
      if (errorMsg.includes("IndentationError")) {
        explanation += `**Dica sobre Indentação:** Em Python, os blocos de código dentro de funções, ifs ou loops devem ser deslocados para a direita por 4 espaços. Revise o alinhamento das suas linhas.`;
      } else if (errorMsg.includes("SyntaxError")) {
        explanation += `**Dica sobre Sintaxe:** Há um erro de digitação no seu código. Verifique se esqueceu de fechar parênteses, aspas ou os dois pontos (\`:\`) ao final de definições de funções, loops ou condições.`;
      } else if (errorMsg.includes("NameError")) {
        explanation += `**Dica sobre Nomes:** Você usou uma variável ou função que não foi definida ou cujo nome está escrito de forma incorreta.`;
      } else {
        explanation += `Revise o erro acima. Se travar, utilize o botão "💡 Dica" na interface.`;
      }
      return explanation;
    }

    // 2) Chamada de IA real
    const sys = `Você é um professor experiente de Python. Explique a causa provável do erro e indique os próximos passos lógicos para resolvê-lo, sem fornecer o código corrigido pronto. Reforce as restrições e regras do exercício.`;
    
    const user = `${this._ctxToStr(ctx)}\nErro gerado:\n${errorMsg}\n\nTrecho de código do aluno:\n${codeExcerpt.substring(0, 400)}`;
    return await this._chat(sys, user);
  }
}

// Torna global no navegador
window.SocraticTutor = SocraticTutor;
