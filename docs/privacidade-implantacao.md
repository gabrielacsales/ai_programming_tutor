# Privacidade e proteção de dados — implantação do IA Tutor

**Estado:** proposta em revisão (não equivale a adequação jurídica completa). Data de referência: 02/11/2026.

## Inventário observado no código

- **Identidade:** e-mail, senha gerenciada pelo Supabase Auth (o frontend não armazena a senha bruta no banco da aplicação), nome informado e vínculo opcional ao Senac em metadados.
- **Aprendizado:** IDs de exercícios, código Python e ideias salvos, conclusão, dicas, contagem de envios, bloqueios, reengajamento, inatividade observada e timestamps.
- **Tutor:** mensagens recebidas e respostas do professor virtual armazenadas em `chat_messages`; perguntas e contexto pertinente podem ser transmitidos à Google Gemini API.
- **Navegador:** sessão autenticada persistida pela SDK do Supabase; preferências locais como primeiro acesso; chave de ciência do aviso `iatutor_essential_storage_notice_v1`.
- **Provedores:** Cloudflare Pages, Supabase Auth/Postgres/Edge Functions, Brevo SMTP, Google Gemini, Google Fonts e CDNs de bibliotecas.

Não foram encontrados pixel de marketing ou scripts próprios de analytics no frontend auditado. Isso não elimina registros técnicos de terceiros, cookies configurados fora do repositório ou a necessidade de nova análise quando a implantação mudar.

## Interfaces propostas

1. `privacidade.html` — aviso de dados e riscos do Gemini gratuito.
2. `termos.html` — regras educacionais, limitações e uso responsável.
3. `cookies.html` — armazenamento necessário e explicação sobre a inexistência atual de rastreamento próprio para publicidade.
4. Cadastro com checkbox **desmarcada**, obrigatório somente em modo `signup`, para aceitar os Termos e declarar leitura do Aviso.
5. `options.data` do Supabase Auth recebe `terms_accepted_version`, `terms_accepted_at`, `privacy_notice_version` e `privacy_notice_acknowledged_at`, para rastreabilidade básica.
6. Aviso informativo com botão **Entendi**, sem pedir um consentimento falso para armazenamento estritamente necessário.

**Limitação da rastreabilidade:** `user_metadata` preenchido pelo cliente e timestamp do relógio do navegador **não são prova independente, imutável ou segura de aceite**. Para uma trilha de auditoria formal, adotar registro no servidor com versão, horário gerado pelo servidor e política de retenção, evitando modificações por usuários. Isso depende de decisão técnica, base legal e migração do banco.

## Pendências antes de publicar a nova interface

- [ ] **Identificar formalmente o controlador/operador** do protótipo e **disponibilizar canal privado funcional** para titulares, com e-mail realmente capaz de receber mensagens. A zona DNS atualmente configurada para envio transacional pela Brevo não prova capacidade de recebimento; `privacidade@iatutor.com.br` seria apenas uma sugestão de endereço, não uma caixa já existente. **Não inserir e-mail pessoal sem autorização.**
- [ ] Estabelecer um fluxo de atendimento a direitos LGPD (solicitação, conferência de identidade, acesso/correção/exclusão quando cabível, prazo e registro de atendimento).
- [ ] Definir prazos de retenção de mensagens, código, progresso, backups, registros de segurança e mecanismo de exclusão. A versão atual não dispõe de exclusão completa via interface.
- [ ] Revisar os contratos, transferências internacionais e configurações de Supabase, Cloudflare, Brevo, CDNs e Google.
- [ ] **Rever o uso da API Gemini gratuita com conteúdos reais de alunos.** Os termos da Google permitem usar prompts/respostas para aprimorar produtos, com revisão humana; não enviar informações pessoais ou sensíveis. Avaliar modalidade adequada ou limitar o uso a dados sintéticos/sem identificação.
- [ ] **Avaliar menores de idade e ECA Digital.** Não existe verificação robusta de idade ou mecanismos de supervisão parental no frontend atual. Uma checkbox de aceite não é suficiente. Antes de permitir uso irrestrito por menores, avaliar deveres e controles adequados.
- [ ] Se forem incluídos analytics, pixels ou cookies opcionais, implementar bloqueio prévio, escolha granular e revogação com igual facilidade.
- [ ] Validar fluxo no domínio final em desktop e mobile: login, signup sem aceite, aceite marcado, envio confirmado, reset, links legais e aviso acessível.
- [ ] Revisão jurídica do conteúdo final para o contexto de controladoria, menores, prestadores e tratamento efetivo.

## Fontes

- ANPD — Guia Cookies e Proteção de Dados: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais
- ANPD — Direitos dos titulares: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares
- ANPD — ECA Digital: https://www.gov.br/anpd/pt-br/assuntos/eca-digital
- Google — Termos adicionais da API Gemini: https://ai.google.dev/gemini-api/terms?hl=pt-BR

Estas páginas e controles são parte do desenvolvimento técnico do TCC II, **não constituem certificação de conformidade à LGPD**, nem autorizam pesquisa com estudantes.
