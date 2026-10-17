#!/usr/bin/env python3
"""Checagens de regressão da landing e autenticação. Execute: python -m unittest tests/verify_login_ux.py"""
from __future__ import annotations

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class LoginUXTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.landing = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.login = (ROOT / "login.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "login.css").read_text(encoding="utf-8")
        cls.auth = (ROOT / "auth-client.js").read_text(encoding="utf-8")

    def test_landing_start_button_goes_to_login(self):
        self.assertIn("window.location.href = 'login.html';", self.landing)
        self.assertNotIn("window.location.href = 'conteudos.html';", self.landing)
        header = re.search(r"<header\b[^>]*>(.*?)</header>", self.landing, re.S)
        self.assertIsNotNone(header)
        self.assertIn('id="header-login-link"', header.group(1))
        self.assertEqual(self.landing.count('href="login.html"'), 1)

    def test_login_uses_design_system_and_remains_responsive(self):
        self.assertIn('href="login.css"', self.login)
        self.assertIn("Inter", self.login)
        self.assertIn("JetBrains+Mono", self.login)
        self.assertIn("auth-card", self.login)
        self.assertIn("auth-header", self.login)
        self.assertIn("@media (max-width: 480px)", self.css)

    def test_login_signup_and_reset_still_work(self):
        for symbol in ("signInWithPassword", "signUp", "resetPasswordForEmail",
                       "senac_student", "switchMode", 'id="forgot-password"'):
            self.assertIn(symbol, self.login)
        self.assertNotIn("senac_my_onboarding", self.login)
        self.assertNotIn("inicio-senac.html", self.login)

    def test_session_is_preserved_and_safe_navigation_used(self):
        self.assertIn("persistSession: true", self.auth)
        self.assertIn("autoRefreshToken: true", self.auth)
        self.assertIn("detectSessionInUrl: true", self.auth)
        self.assertIn("client.auth.getUser()", self.login)
        self.assertIn("TutorAuth.safeNext(", self.login)
        self.assertIn('id="already-signed-in"', self.login)


if __name__ == "__main__":
    unittest.main(verbosity=2)
