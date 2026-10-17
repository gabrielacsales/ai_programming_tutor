#!/usr/bin/env python3
"""Regressão estática: curso independente do diagnóstico Senac (sem acesso ao banco)."""
from __future__ import annotations

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class OptionalResearchFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.auth = (ROOT / "auth-client.js").read_text(encoding="utf-8")
        cls.login = (ROOT / "login.html").read_text(encoding="utf-8")
        cls.contents = (ROOT / "conteudos.html").read_text(encoding="utf-8")
        cls.tutor = (ROOT / "tutor.html").read_text(encoding="utf-8")
        cls.app = (ROOT / "app.js").read_text(encoding="utf-8")
        cls.access = (ROOT / "access-client.js").read_text(encoding="utf-8")
        cls.rollback = (ROOT / "supabase" / "restore-course-without-senac.sql").read_text(encoding="utf-8")

    def test_auth_requires_login_but_not_senac_diagnostic(self):
        self.assertRegex(self.auth, r"async function requireCourseReady\(\)\s*\{\s*return requireLogin\(\)")
        self.assertNotIn('rpc("senac_my_onboarding"', self.auth)
        self.assertNotIn('rpc("senac_set_affiliation"', self.auth)
        for page in (self.contents, self.tutor, self.app):
            self.assertIn("TutorAuth.requireLogin()", page)

    def test_login_keeps_question_without_triggering_diagnostic(self):
        self.assertIn("Você é estudante do Senac?", self.login)
        self.assertIn("senac_student", self.login)
        self.assertNotIn("senac_my_onboarding", self.login)
        self.assertNotIn("senac_set_affiliation", self.login)
        self.assertNotIn('location.replace("inicio-senac.html")', self.login)

    def test_research_is_out_of_navigation_and_instrumentation(self):
        for source in (self.contents, self.tutor, self.login):
            self.assertNotRegex(source, r'href="(?:pesquisa|inicio-senac|painel-pesquisa)\.html"')
        self.assertNotIn('<script src="research-collector.js"></script>', self.tutor)
        self.assertNotIn("TutorResearch", self.app)
        # Páginas e módulos de pesquisa continuam guardados para reativação posterior.
        self.assertTrue((ROOT / "pesquisa.html").exists())
        self.assertTrue((ROOT / "inicio-senac.html").exists())

    def test_progress_permissions_remain(self):
        self.assertIn('client.rpc("get_tutor_access"', self.access)
        self.assertIn('client.rpc("can_access_exercise"', self.access)
        self.assertIn("TutorProgress.init()", self.app)
        self.assertIn("TutorEditor.start", self.app)
        self.assertIn("TutorAuth.requireLogin()", self.app)

    def test_optional_sql_rollback_only_removes_senac_gate(self):
        self.assertIn("create or replace function public.can_access_exercise", self.rollback)
        self.assertNotIn("course_onboarding", self.rollback)
        self.assertNotIn("drop table", self.rollback.lower())


if __name__ == "__main__":
    unittest.main(verbosity=2)
