# Preparação da Pesquisa do TCC — IA Tutor (tcc-v1)

ATENÇÃO: implementado apenas na branch de testes; NENHUMA migração foi executada no seu Supabase por esta atualização. O recrutamento começa fechado pelo servidor. Não abra coleta antes de revisar TCLE, ética e retenção com orientador(a) e instituição.

## Componentes preparados
- supabase/research-study.sql — novas tabelas de consentimento, participantes, eventos com data/hora, respostas pré/pós, questionários e notas de entrevista. Inclui regras de acesso e consultas administrativas restritas.
- pesquisa.html + research-page.js + research-instruments.js + research.css — consentimento voluntário, pré-teste, pós-teste e questionário de percepção. Instrumentos de oito questões paralelas e oito itens de percepção. Não expõe gabarito.
- research-collector.js — monitora eventos de exercícios somente após consentimento e pré-teste, e interrompe após pós-teste/retirada.
- painel-pesquisa.html + research-admin.js + research-admin.css — painel pseudonimizado, acompanhamento dos participantes, exportação CSV e categorização de trechos anonimizados de entrevista.
- scripts/analyze_study.py — pontuação local de pré/pós com gabarito privado fora do repositório.
- Kit_Pesquisa_TCC_IA_Tutor_CONFIDENCIAL.docx (entregue nesta conversa) — testes completos, gabarito, roteiro de entrevista, plano de análise, rascunho de consentimento e cautelas.
- research-answer-key.private.json (entregue nesta conversa) — chave de correção. NÃO a envie ao GitHub.

## Ordem segura de configuração
1. Prefira um projeto Supabase de teste/staging separado; faça backup antes de qualquer migração no projeto existente.
2. Verifique que schema.sql, developer-access.sql e curriculum-v2.sql já foram aplicados. Não execute novamente schema.sql num projeto existente.
3. Supabase > SQL Editor > New query: copie e execute o arquivo supabase/research-study.sql. O cadastro da pesquisa inicia FECHADO no banco.
4. No SQL Editor, autorize somente a sua conta como pesquisadora, substituindo SEU_EMAIL_AQUI no seu computador (não publique e-mail em arquivos públicos):

    insert into public.researcher_accounts(user_id)
    select id from auth.users where lower(email)=lower('SEU_EMAIL_AQUI')
    on conflict(user_id) do nothing;

5. Abra a nova branch localmente com python -m http.server 8000. Acesse http://localhost:8000/painel-pesquisa.html com sua conta. Inicialmente deve mostrar zero participantes. Outra conta deve receber Acesso restrito.
6. Acesse http://localhost:8000/pesquisa.html: mesmo marcando as caixas o servidor deve bloquear inscrição, pois o recrutamento está FECHADO.
7. Substitua o rascunho do termo por TCLE/protocolo aprovado e inclua identificação/contato da pesquisadora, orientador(a), instituição, riscos, hipóteses legais, procedimentos, armazenamento, prazo de retenção, acesso, retirada e gravação separada para entrevista quando usada. Obtenha orientação formal quanto às exigências éticas.
8. SOMENTE num ambiente de teste, com contas fictícias, abra temporariamente no SQL Editor:

    update public.research_study_settings set enrollment_open=true,updated_at=now() where id=1;

   Após o teste, feche com enrollment_open=false. Não misture contas de teste e a amostra oficial.
9. Teste inscrição fictícia > pré > exercícios/dicas/código/Gemini > pós > questionário > exports > retirada de consentimento. Confirme tabelas research_participants, research_events, research_assessments e research_surveys no Supabase.
10. Somente depois de concluir validações, autorizações e plano metodológico decida a data de abertura real.

## Indicadores disponíveis
- Eventos observacionais: exercício aberto, revisão concluída/pulada, dica consultada, código enviado, testes realizados (número de casos aprovados), conclusão observada, ideia registrada, pergunta ao tutor, pedido direto bloqueado e intervalo de inatividade.
- Servidor registra timestamp de cada evento. Eventos não sobrescrevem eventos anteriores.
- Progresso do exercício e histórico de conversas permanecem nas tabelas educacionais existentes.
- Pré e pós: oito respostas A–D cada, únicas por conta e fase. Questionário: seis respostas Likert 1–5 + duas abertas opcionais.
- Painel mostra códigos pseudônimos e agregações; nunca nome, e-mail, UUID, texto de código ou chats em exports de eventos.

## Exportação e análise local
1. Em painel-pesquisa.html, exporte Respostas pré/pós.
2. Salve o JSON de gabarito privado recebido nesta conversa fora de pastas sincronizadas/publicadas.
3. No terminal da pasta do projeto, execute o script, ajustando o nome do CSV exportado:

    python scripts/analyze_study.py --assessments tcc_assessments_DATA.csv --key research-answer-key.private.json --output resultados

4. Arquivos gerados: paired_scores.csv (por código, pré/pós/diferença) e descriptive_summary.json (N pareado, média, mediana, dispersão e diferenças). Não divulgue CSV bruto.
5. Para análise qualitativa: entrevistas semiestruturadas e codificação temática por autonomia, feedback, clareza, dificuldade, confiança, dependência, usabilidade e temas emergentes. Extraia trechos sem nomes e sem detalhes identificadores.

## Limitações metodológicas
- Os oito itens A e B formam provas paralelas EXPLORATÓRIAS, não instrumentos psicometricamente validados. Realize piloto de clareza/dificuldade fora da amostra e congele a versão antes do estudo.
- Não há grupo-controle definido: diferenças pré/pós não demonstram causalidade da IA.
- O Python ainda roda no navegador (Pyodide). Alunos experientes podem falsificar resultados/autodeclarar eventos. O registro de eventos usa horário de servidor e acesso autenticado, mas NÃO torna o avaliador de código antifraude. Supervisione pré/pós e considere avaliação independente se a validade exigir.
- Falhas de rede podem provocar perda de eventos, pois a fila de envio é em memória. Teste qualidade dos dados e prefira conexão estável.
- Pseudonimização não equivale a anonimização: respostas abertas e trechos de entrevistas exigem revisão manual.
- PDR (antigo TRIB) foi renomeado na UI: representa proporção de solicitações detectadas como pedidos diretos, NÃO resiliência psicológica; descreva sua definição operacional antes de analisar. IPT = dicas; RER = reengajamentos após bloqueio / bloqueios; IT = segundos estimados de inatividade em aba visível (>60 segundos, fora do popup da revisão), não tempo total de estudo.
- Para gravação de entrevistas, obtenha consentimento específico e defina armazenamento separado.

## Fontes institucionais úteis
Guia ANPD: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-tratamento-de-dados-pessoais-para-fins-academicos-e-para-a-realizacao-de-estudos-e-pesquisas

Resolução CNS 510/2016: https://www.gov.br/conselho-nacional-de-saude/pt-br/atos-normativos/resolucoes/2016/resolucao-no-510.pdf/view

Consultar orientador(a) e instituição sobre aplicabilidade concreta e requisitos de aprovação/dispensa ética antes de recrutar pessoas.
