#!/usr/bin/env python3
"""Conferência estática de logo oficial e progresso por módulo."""
from __future__ import annotations

import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class ModuleProgressTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = (ROOT / "conteudos.html").read_text(encoding="utf-8")
        cls.login = (ROOT / "login.html").read_text(encoding="utf-8")
        cls.landing = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.tutor = (ROOT / "tutor.html").read_text(encoding="utf-8")
        cls.module_js = (ROOT / "module-progress.js").read_text(encoding="utf-8")
        cls.module_css = (ROOT / "module-progress.css").read_text(encoding="utf-8")
        cls.problems = json.JSONDecoder().raw_decode(
            (ROOT / "problems.js").read_text(encoding="utf-8")
            .split("const problems = ", 1)[1].lstrip()
        )[0]

    def test_official_logo_in_main_screens(self):
        for name, page in (("login", self.login), ("landing", self.landing),
                           ("tutor", self.tutor), ("modules", self.content)):
            with self.subTest(screen=name):
                self.assertIn('icon="solar:infinity-bold"', page)
        self.assertNotIn('class="auth-brand-mark" aria-hidden="true">∞', self.login)
        self.assertNotIn('<div class="logo-dot"></div>', self.landing)
        self.assertNotIn('<div class="logo-dot"></div>', self.tutor)

    def test_five_modules_have_three_exercises_each(self):
        blocks = re.findall(
            r'<div data-module-number="([1-5])"([\s\S]*?)(?=<!-- Módulo [1-5] -->|<!-- Desafio Final)',
            self.content
        )
        self.assertEqual(len(blocks), 5)
        for module, html in blocks:
            ids = re.findall(r'data-exercise-id="([^"]+)"', html)
            current_ids = [p["id"] for p in self.problems if p["module"] == int(module)]
            with self.subTest(module=module):
                self.assertEqual(ids, current_ids)
                self.assertEqual(len(ids), 3)

    def test_progress_uses_actual_saved_user_data(self):
        self.assertIn('TutorProgress.getCompletedIds()', self.content)
        self.assertIn('TutorModuleProgress.update(TutorProgress.getCompletedIds())', self.content)
        self.assertIn('src="module-progress.js"', self.content)
        self.assertIn('href="module-progress.css"', self.content)
        self.assertIn("new Set(completedIds || [])", self.module_js)
        self.assertIn("Math.round(done * 100 / total)", self.module_js)
        self.assertIn('aria-valuenow', self.module_js)
        self.assertIn('aria-valuetext', self.module_js)
        self.assertIn('is-complete', self.module_css)
        self.assertNotIn("localStorage", self.module_js)
        self.assertNotIn("client.rpc", self.module_js)
        self.assertNotIn("supabase", self.module_js.lower())


if __name__ == "__main__":
    unittest.main(verbosity=2)
