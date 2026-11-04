#!/usr/bin/env python3
"""Verifica o aviso de cookies, os documentos públicos e o checkbox de cadastro."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PAGES = (
    "index.html", "login.html", "reset-password.html",
    "conteudos.html", "tutor.html", "perfil.html",
    "termos-de-uso.html", "politica-de-privacidade.html",
)

class PrivacyUxTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.login = (ROOT / "login.html").read_text(encoding="utf-8")
        cls.cookie_js = (ROOT / "privacy.js").read_text(encoding="utf-8")
        cls.cookie_css = (ROOT / "privacy.css").read_text(encoding="utf-8")
        cls.build = (ROOT / "scripts/build_site.py").read_text(encoding="utf-8")

    def test_banner_loaded_on_every_public_page(self):
        for path in PAGES:
            with self.subTest(page=path):
                body = (ROOT / path).read_text(encoding="utf-8")
                self.assertIn('href="privacy.css"', body)
                self.assertIn('src="privacy.js"', body)

    def test_signup_has_explicit_unchecked_checkbox_with_real_links(self):
        self.assertIn('id="policies-block"', self.login)
        self.assertIn('id="accept-policies" name="accept-policies" type="checkbox"', self.login)
        self.assertNotIn('id="accept-policies" name="accept-policies" type="checkbox" checked', self.login)
        self.assertIn('href="termos-de-uso.html" target="_blank" rel="noopener noreferrer"', self.login)
        self.assertIn('href="politica-de-privacidade.html" target="_blank" rel="noopener noreferrer"', self.login)
        self.assertIn('acceptPolicies.required = nextMode === "signup"', self.login)
        self.assertIn('policiesBlock.hidden = nextMode !== "signup"', self.login)
        self.assertIn('mode === "signup" && !acceptPolicies.checked', self.login)
        self.assertIn('terms_version: POLICY_VERSION', self.login)
        self.assertIn('privacy_notice_version: POLICY_VERSION', self.login)

    def test_cookie_notice_does_not_pretend_to_request_advertising_consent(self):
        self.assertIn('ia_tutor_cookie_notice_seen_v1', self.cookie_js)
        self.assertIn('document.createElement("section")', self.cookie_js)
        self.assertIn('localStorage.setItem(KEY, "1")', self.cookie_js)
        self.assertIn('reopen.textContent = "Cookies e privacidade"', self.cookie_js)
        self.assertIn('banner.hidden = false', self.cookie_js)
        self.assertIn('Entendi', self.cookie_js)
        # O banner abre o documento em nova guia, preservando a tela em uso.
        self.assertIn('href="${POLICY}" target="_blank" rel="noopener noreferrer"', self.cookie_js)
        self.assertNotIn('Aceitar todos', self.cookie_js)
        self.assertNotIn('Rejeitar todos', self.cookie_js)
        self.assertIn('.privacy-banner{', self.cookie_css)
        self.assertIn('bottom:0', self.cookie_css)

    def test_documents_exist_and_are_published_by_allowlist(self):
        for path in ("termos-de-uso.html", "politica-de-privacidade.html"):
            with self.subTest(path=path):
                body = (ROOT / path).read_text(encoding="utf-8")
                self.assertIn("Versão 2026-11-03", body)
                self.assertIn(path, self.build)
        self.assertIn('"privacy.js"', self.build)
        self.assertIn('"privacy.css"', self.build)

    def test_contact_is_published_without_placeholder(self):
        policy = (ROOT / "politica-de-privacidade.html").read_text(encoding="utf-8")
        terms = (ROOT / "termos-de-uso.html").read_text(encoding="utf-8")
        self.assertNotIn("INSERIR E-MAIL", policy)
        self.assertIn('href="mailto:privacidade@iatutor.com.br"', policy)
        self.assertIn("privacidade@iatutor.com.br", terms)
        self.assertIn('const POLICY_VERSION = "2026-11-03";', self.login)


if __name__ == "__main__":
    unittest.main(verbosity=2)
