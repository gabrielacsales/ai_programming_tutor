/* Aviso informativo: não coleta consentimento para cookies essenciais.
 * Não carrega cookies de publicidade ou analytics. */
(function () {
  "use strict";
  const key = "iatutor_essential_storage_notice_v1";

  function init() {
    let dismissed = false;
    try { dismissed = localStorage.getItem(key) === "acknowledged"; } catch (_) {}
    if (dismissed || document.getElementById("iatutor-privacy-banner")) return;

    const banner = document.createElement("aside");
    banner.className = "privacy-banner";
    banner.id = "iatutor-privacy-banner";
    banner.setAttribute("aria-label", "Informações sobre armazenamento no navegador");

    const summary = document.createElement("p");
    const title = document.createElement("strong");
    title.textContent = "Privacidade e armazenamento";
    summary.appendChild(title);
    summary.appendChild(document.createTextNode(
      "O IA Tutor mantém dados essenciais no navegador para sessão e preferências. Não utiliza cookies próprios de publicidade nesta versão. "
    ));
    const link = document.createElement("a");
    link.href = "cookies.html";
    link.textContent = "Saiba mais";
    summary.appendChild(link);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Entendi";
    button.addEventListener("click", () => {
      try { localStorage.setItem(key, "acknowledged"); } catch (_) {}
      banner.remove();
    });
    banner.append(summary, button);
    document.body.appendChild(banner);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
