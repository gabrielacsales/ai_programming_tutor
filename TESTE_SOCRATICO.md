# Ajustes do professor socrático — validação

O código desta melhoria foi atualizado na branch `feature/supabase-auth-and-database`. **A versão do Supabase não muda automaticamente quando o GitHub é atualizado.**

## 1. Atualizar a Edge Function Gemini
1. Supabase → **Edge Functions → gemini-tutor → Code**.
2. Abra `supabase/functions/gemini-tutor/index.ts` **da branch atualizada**, copie o arquivo inteiro para o editor da função.
3. Clique **Deploy updates**.
4. Não altere a `GEMINI_API_KEY`, nem o nome da função. Não execute SQL.

## 2. Atualizar o frontend
Baixe novamente o ZIP da branch, extraia em uma nova pasta e execute `python -m http.server 8000`. Teste em `http://localhost:8000/login.html` com conta de teste.

## 3. Checklist
- [ ] Na aba **Descrever ideia**, clique em **Pergunte ao Professor**, digite uma pergunta e pressione **Enter**: deve enviar.
- [ ] Digite outra pergunta e clique em **Enviar Pergunta**: deve funcionar também.
- [ ] Repita os dois envios na aba **Escrever código**.
- [ ] Pressionar Enter várias vezes enquanto a resposta é gerada não deve registrar mensagens duplicadas.
- [ ] Ao perguntar "Não sei por onde começar", deve receber uma pergunta reflexiva contextual, **não** uma lista de instruções ou o código pronto.
- [ ] Após responder à pergunta do tutor, envie outra: o professor deve **continuar de onde você parou**, sem repetir sempre a primeira orientação.
- [ ] Pergunte "O que é uma variável?": uma breve explicação conceitual e uma pergunta conectando a dúvida ao raciocínio; sem código pronto.
- [ ] Peça "me dê a solução completa": não deve entregar o gabarito nem trechos completos.
- [ ] O histórico deve continuar sendo salvo em `chat_messages` e reaparecer após entrar novamente.
- [ ] O botão **Dicas** continua separado, mais direto do que a tutoria socrática.

## O que mudou
- `app.js` — Enter dispara o mesmo handler do botão nas duas abas e evita chamadas duplicadas.
- `tutor.html` — campos mostram a dica **Enter para enviar**.
- `supabase/functions/gemini-tutor/index.ts` — instruções pedagógicas específicas para `ask`, histórico recente filtrado pelo usuário/exercício, resposta curta e pergunta reflexiva, com filtro de respostas excessivamente diretas. As modalidades `critique` e `error` continuam disponíveis, com orientações específicas mais breves.

## Limitações
- Os controles pedagógicos de modelo generativo reduzem o risco, mas **não garantem 100%** que toda resposta será ideal. Avalie com exemplos representativos de alunos antes da pesquisa.
- Histórico buscado da tabela existente, sem novas migrations; inclui, por enquanto, mensagens de outros modos do mesmo exercício (crítica/depuração), pois a tabela não possui coluna de tipo da interação.
- O filtro de respostas muito diretas usa heurísticas: em alguns casos será apresentada uma pergunta genérica de recuperação; registre exemplos para melhoria.
