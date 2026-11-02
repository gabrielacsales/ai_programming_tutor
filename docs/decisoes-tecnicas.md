# Decisões técnicas e critérios de refatoração

> Registro explicativo para a apresentação de Engenharia da Computação. Não descreve testes de carga ou segurança que não tenham sido executados.

## Critérios utilizados

1. **Responsabilidade única e coesão:** deixar cada arquivo/grupo associado a uma responsabilidade identificável (autenticação, currículo, execução, tutoria, dados, testes e operação).
2. **Baixo acoplamento e compatibilidade:** evitar mudanças em URLs, nomes de banco, RPCs e ordem de carregamento dos scripts sem necessidade. Uma refatoração segura não deve mudar o comportamento observado pelo aluno.
3. **YAGNI e simplicidade:** não adotar framework/bundler apenas para reorganizar pastas. O projeto é pequeno, estático e já tem CI e um build de whitelist.
4. **Separação de produção, documentação e legado:** código carregado pelo site permanece na raiz; fonte SQL e Edge Function ficam em `supabase/`; testes em `tests/`; material técnico-acadêmico em `docs/`; código abandonado é retirado da árvore ativa, recuperável pelo Git.
5. **Segurança por padrão:** nenhum arquivo adicional é publicado automaticamente; `scripts/build_site.py` exige inclusão explícita em `OUTPUT_FILES`. Segredos ficam fora do repositório.
6. **Rastreabilidade e reversibilidade:** alterações passam por PR, testes e ficam documentadas com histórico. Dados remotos do Supabase e DNS não são apagados por uma limpeza no Git.
7. **Evidência antes de conclusão:** testes de CI garantem propriedades estáticas selecionadas; conformidade real exige testes no navegador e integração com serviços.

## Escolhas de arquitetura

| Decisão | Benefício para o protótipo | Limitação / consequência |
| --- | --- | --- |
| HTML/CSS/JS sem framework SPA | Baixa complexidade de implantação e URLs simples | Recursos compartilhados podem exigir atualização em mais de uma página |
| Cloudflare Pages com `dist/` gerado | Hospedagem estática e lista explícita do que é publicado | Modificações na whitelist exigem revisão do build |
| Pyodide no navegador | Execução Python real sem infraestrutura própria para rodar código de terceiros | Custo de carregamento no dispositivo; testes visíveis e sem garantia antifraude |
| Supabase Auth + PostgreSQL + RLS | Sessão, progresso e isolamento individual com serviços gerenciados | Dependência de quotas externas, migrações e políticas corretamente aplicadas |
| Gemini via Supabase Edge Function | Chave privada não chega ao browser, validação JWT e controle de histórico | Custo/cota compartilhada; respostas variáveis, limites por usuário não atômicos |
| Brevo SMTP | Envio de mensagens de cadastro e recuperação fora do limite mínimo do provedor padrão | Requer registros DNS, configuração segura e atenção às cotas de envio |
| Currículo V2 com 16 desafios | Sequência verificável, exercícios associados a requisitos e testes | Metadados e casos de teste no cliente; IDs antigos mantidos por compatibilidade |
| GitHub Actions + testes estáticos e regressão Node | Detecta regressões de estrutura, conteúdo e lógica selecionada antes do merge | Não equivale à homologação visual, de performance ou ao teste de serviços externos |

## O que a refatoração removeu

Os arquivos abaixo foram examinados à luz da publicação atual e **não aparecem no pacote `dist/` nem participam da experiência de aprendizagem vigente**:

- `index.css`: folha de estilos da versão inicial sem referência nas páginas HTML atuais;
- `gabi-site.webp`: versão antiga e não utilizada do retrato, substituída pelo JPG original;
- `backup/`: cópias históricas de páginas e anotações; seu conteúdo permanece recuperável no Git;
- páginas e scripts da **pesquisa/pré-pós-teste** e do antigo bloqueio de entrada Senac: fora do escopo atual do TCC II e já desvinculados do fluxo de autenticação;
- scripts e SQL específicos do experimento antigo: não são requeridos pelo build nem pelo backend atual.

**Importante:** eliminar arquivos versionados não equivale a executar `DROP TABLE` no banco; nenhuma tabela, conta, registro de aluno ou serviço externo foi removido nesta refatoração. As migrações correntes e o código da Edge Function foram preservados.

## O que foi preservado deliberadamente

- As seis páginas de produção, **nomes e URLs**;
- JS/CSS efetivamente importados e os assets do favicon e retrato;
- `supabase/schema.sql`, `supabase/developer-access.sql`, `supabase/curriculum-v2.sql` e `supabase/functions/gemini-tutor/index.ts`, que documentam os componentes de servidor;
- `tests/`, `.github/workflows/` e scripts de build/smoke;
- documentos de revisão pedagógica, roteiros de testes e registros de mudanças de escopo, organizados em `docs/`.

O SQL de restauração da regra de desbloqueio foi mantido **somente como referência histórica** em `docs/historico/`; nunca executá-lo automaticamente contra um banco em produção.

## Por que não dividir `app.js` e os HTMLs nesta rodada?

O controlador possui múltiplos estados de interação e dependências entre interfaces, métricas e persistência. Dividi-lo em módulos ES ou reescrever os HTMLs com templates exigiria alterar a ordem de importação, o bootstrapping das páginas e testes de integração. Sem teste completo de navegador e regressão de estado, essa mudança perto da entrega teria **risco maior que o ganho imediato de legibilidade**.

Para uma próxima versão, o caminho seria separar por contratos (estado do exercício, executor, tutoria e persistência), definir testes unitários independentes e então fazer migrações pequenas de cada módulo. Esta decisão de **não reescrever por estética** é um critério técnico de gestão de risco.

## Riscos e melhorias futuras

- Validação no servidor da submissão, caso haja necessidade de avaliação formal.
- Controle transacional de cota e fila de chamadas ao Gemini em caso de muitas contas simultâneas.
- Testes automatizados de interface em navegador (desktop/móvel) e testes de integração isolados dos provedores.
- Política explícita de retenção/exclusão de mensagens e revisão de conformidade de privacidade antes de estudos com participantes.
- Revisão de dependências CDN, acessibilidade e performance de carregamento do Pyodide.

Documentos relacionados: [arquitetura](arquitetura.md), [validação](validacao/README.md), [histórico de escopo](historico/README.md).
