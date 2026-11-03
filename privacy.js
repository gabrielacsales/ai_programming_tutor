/* IA Tutor: banner informativo sobre tecnologias essenciais.
 * O projeto não ativa cookies opcionais de publicidade/analytics próprios.
 * "Entendi" apenas fecha o aviso; NÃO é autorização para rastreamento.
 */
(function () {
  "use strict";
  const KEY = "ia_tutor_cookie_notice_seen_v1";
  const POLICY = "politica-de-privacidade.html#cookies";

  function acknowledged() {
    try { return localStorage.getItem(KEY) === "1"; }
    catch (_) { return false; }
  }

  function storeAcknowledgement() {
    try { localStorage.setItem(KEY, "1"); }
    catch (_) { /* Armazenamento indisponível: próximo acesso mostrará o aviso. */ }
  }

  function initialise() {
    if (document.getElementById("privacy-banner")) return;
    const banner = document.createElement("section");
    banner.id = "privacy-banner";
    banner.className = "privacy-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Informações sobre cookies e armazenamento");
    banner.innerHTML = `
      <div class="privacy-banner-inner">
        <div class="privacy-banner-copy">
          <span class="privacy-banner-kicker">PRIVACIDADE / IA TUTOR</span>
          <p class="privacy-banner-title">Sobre cookies e armazenamento</p>
          <p class="privacy-banner-text">Usamos armazenamento essencial para autenticação e preferências. Não ativamos cookies próprios de publicidade ou analytics opcionais. Saiba mais na <a href="${POLICY}">Política de Privacidade</a>.</p>
        </div>
        <button type="button" id="privacy-banner-close" class="privacy-banner-action">Entendi</button>
      </div>`;
    banner.hidden = acknowledged();
    document.body.appendChild(banner);

    document.getElementById("privacy-banner-close").addEventListener("click", () => {
      storeAcknowledgement();
      banner.hidden = true;
    });

    const reopen = document.createElement("button");
    reopen.type = "button";
    reopen.className = "privacy-footer-control";
    reopen.textContent = "Cookies e privacidade";
    reopen.setAttribute("aria-label", "Reabrir aviso de cookies");
    reopen.addEventListener("click", () => {
      banner.hidden = false;
      document.getElementById("privacy-banner-close").focus();
    });
    const footer = document.querySelector("footer");
    if (footer) footer.appendChild(reopen);
    else {
      reopen.className = "privacy-floating-control";
      document.body.appendChild(reopen);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise);
  else initialise();
  window.IATutorPrivacy = { showNotice: () => {
    const banner = document.getElementById("privacy-banner");
    if (banner) banner.hidden = false;
  }};
})();
