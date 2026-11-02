#!/usr/bin/env python3
"""Regressões de transparência, dados e UX do cadastro do IA Tutor."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
APP_PAGES = ("index.html", "login.html", "conteudos.html", "tutor.html",
             "perfil.html", "reset-password.html")
LEGAL_PAGES = ("privacidade.html", "termos.html", "cookies.html")
POLICY_LINKS = ('href="privacidade.html"', 'href="termos.html"', 'href="cookies.html"')


class InputParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inputs = []

    def handle_starttag(self, tag, attrs):
        if tag == "input":
            self.inputs.append(dict(attrs))


class PrivacyTests(unittest.TestCase):
    def test_signup_requires_distinct_legal_acknowledgement(self):
        html = (ROOT / "login.html").read_text(encoding="utf-8")
        form = InputParser()
        form.feed(html)
        inputs = [data for data in form.inputs if data.get("id") == "legal-ack"]
        self.assertEqual(len(inputs), 1)
        self.assertEqual(inputs[0].get("type"), "checkbox")
        self.assertIn("required", inputs[0])
        self.assertNotIn("checked", inputs[0])
        self.assertIn('legalBlock.hidden = nextMode !== "signup"', html)
        self.assertIn('legalAck.required = nextMode === "signup"', html)
        self.assertIn('if (!legalAck.checked)', html)
        self.assertIn('terms_accepted_version: LEGAL_VERSION', html)
        self.assertIn('privacy_notice_acknowledged_at: acknowledgedAt', html)
        self.assertIn("senac_student", html)
        self.assertNotIn('consent_to_all_cookies', html)

    def test_policies_linked_from_all_public_pages(self):
        for name in (*APP_PAGES, *LEGAL_PAGES):
            with self.subTest(page=name):
                text = (ROOT / name).read_text(encoding="utf-8")
                for link in POLICY_LINKS:
                    self.assertIn(link, text)
                self.assertIn("privacy-notice.js", text)
                self.assertIn("legal.css", text)

    def test_privacy_policy_names_data_and_gemini_risks(self):
        privacy = (ROOT / "privacidade.html").read_text(encoding="utf-8")
        for term in ("Gabriela Sales", "Supabase", "Brevo", "Google Gemini",
                     "RLS", "direitos", "Crianças e adolescentes", "revisão humana",
                     "Canal de privacidade pendente"):
            self.assertIn(term, privacy)
        cookie_page = (ROOT / "cookies.html").read_text(encoding="utf-8")
        self.assertIn("localStorage", cookie_page)
        self.assertIn("cookies", cookie_page.lower())

    def test_information_only_banner(self):
        js = (ROOT / "privacy-notice.js").read_text(encoding="utf-8")
        self.assertIn('button.textContent = "Entendi"', js)
        self.assertIn('banner.remove()', js)
        self.assertIn('localStorage.setItem(key, "acknowledged")', js)
        self.assertNotIn("gtag(", js)
        self.assertNotIn("marketing:", js)

    def test_secure_build_whitelist_contains_policies(self):
        source = (ROOT / "scripts/build_site.py").read_text(encoding="utf-8")
        for name in (*LEGAL_PAGES, "legal.css", "privacy-notice.js"):
            with self.subTest(asset=name):
                self.assertTrue((ROOT / name).is_file())
                self.assertIn('"' + name + '"', source)


if __name__ == "__main__":
    unittest.main(verbosity=2)
