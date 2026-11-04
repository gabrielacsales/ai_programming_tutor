# Publicação: Termos de Uso, Política de Privacidade e aviso de cookies

## Status e pendências de revisão

**Canal de contato preenchido:** `privacidade@iatutor.com.br` (encaminhamento de e-mail confirmado pela criadora em 03/11/2026). A política mostra o endereço publicamente por meio de link `mailto:`. Os textos permanecem sujeitos a revisão jurídica e operacional.

Antes de publicar, revisar com responsável jurídico/privacidade:
- identificação e contato do controlador e adequação do atendimento a direitos;
- se menores de idade poderão se cadastrar, e as salvaguardas correspondentes;
- definição das bases legais, prazos de retenção, políticas dos operadores, eventual transferência internacional;
- se existem scripts/cookies de terceiros adicionais configurados no Cloudflare e integrações fora do código do repositório.

Esta implementação não equivale a um parecer jurídico nem garante conformidade integral à LGPD.

## Experiência implementada

1. O cadastro exibe um checkbox **não pré-marcado**: `Li e concordo com os Termos de Uso e declaro estar ciente da Política de Privacidade.` Links abrem as páginas em nova aba.
2. Sem marcar o checkbox, o frontend impede `auth.signUp` por validação nativa e checagem explícita. O checkbox não aparece nem é exigido no login ou recuperação.
3. `auth.signUp.options.data` armazena como metadados `terms_version`, `privacy_notice_version`, `terms_accepted_at`. **Metadados de usuário são editáveis no Supabase** e a hora é fornecida pelo navegador: não constituem auditoria imutável nem comprovação robusta de consentimento; para prova forte e fiscalização, implementar registro validado do lado servidor antes de afirmar conformidade.
4. O banner inferior aparece nas páginas públicas e autenticadas, explica sessão e armazenamento essencial e oferece `Entendi` + política. Não exibe botões falsos de “Aceitar todos/Rejeitar todos” porque não há cookies opcionais próprios no código atual. `Entendi` **não é consentimento** para rastreamento.
5. Uma preferência local `ia_tutor_cookie_notice_seen_v1` oculta o aviso nas próximas visitas; o controle no rodapé (ou flutuante em páginas sem rodapé) permite reabri-lo a qualquer momento.
6. As novas páginas e `privacy.css` / `privacy.js` entram explicitamente no pacote estático de produção pelo `scripts/build_site.py`.

## Verificações antes e depois do deploy

- `python -m unittest discover -s tests -p 'verify_*.py' -v`
- `python scripts/build_site.py`
- Entrar na landing em janela anônima: banner visível e no rodapé, legível no celular.
- Clicar em Entendi, recarregar, confirmar que não reaparece; reabrir no controle Cookies e privacidade.
- Clicar em Criar conta: checkbox visível e inicialmente vazio; sem ele, impedir cadastro.
- Alternar para Entrar/Recuperar: checkbox oculto e não obrigatório.
- Marcar e cadastrar **com e-mail de teste**; verificar o e-mail de confirmação e metadados.
- Verificar páginas `termos-de-uso.html` e `politica-de-privacidade.html` por links diretos e pelo formulário.
- Inspecionar cookies/requests de terceiros e atualizar aviso se algum script opcional for ativado.

## Referências de elaboração

- ANPD: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais
- Lei 13.709/2018: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html
- Supabase signup: https://supabase.com/docs/reference/javascript/auth-signup
