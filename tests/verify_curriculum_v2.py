#!/usr/bin/env python3
"""Validação estática do currículo 2, sem armazenar soluções dos desafios.

Executar na raiz do projeto: python tests/verify_curriculum_v2.py
Esta verificação não substitui testar o CodeRunner/Pyodide no navegador.
"""
from __future__ import annotations

import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


def load_problems():
    source = (ROOT / "problems.js").read_text(encoding="utf-8")
    marker = "const problems = "
    start = source.index(marker) + len(marker)
    return json.JSONDecoder().raw_decode(source[start:].lstrip())[0]


class CurriculumV2Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.problems = load_problems()
        cls.by_id = {p["id"]: p for p in cls.problems}
        cls.cards = (ROOT / "conteudos.html").read_text(encoding="utf-8")
        cls.reviews = (ROOT / "preflight-review.js").read_text(encoding="utf-8")
        cls.rules = (ROOT / "supabase" / "developer-access.sql").read_text(encoding="utf-8")
        cls.migration = (ROOT / "supabase" / "curriculum-v2.sql").read_text(encoding="utf-8")

    def test_sixteen_unique_exercises_in_order(self):
        self.assertEqual(len(self.problems), 16)
        self.assertEqual(len(self.by_id), 16)
        self.assertEqual([p["module"] for p in self.problems],
                         [1]*3 + [2]*3 + [3]*3 + [4]*3 + [5]*3 + ["final"])

    def test_every_exercise_has_synchronized_pedagogical_parts(self):
        for p in self.problems:
            with self.subTest(id=p["id"]):
                self.assertTrue(p["title"])
                self.assertTrue(p["statement"])
                self.assertTrue(p["constraints"])
                self.assertEqual(len(p["hints"]), 3)
                self.assertTrue(all(p["hints"]))
                self.assertIn("<p", p["theory"])
                self.assertTrue(p["solution"].startswith("# Exemplo do professor"))
                self.assertGreaterEqual(len(p["tests"]), 4)
                self.assertEqual(p["curriculum_version"], 2)
                for test in p["tests"]:
                    self.assertIn("in", test)
                    self.assertIn("out", test)

    def test_no_list_inputs_before_first_list_lesson(self):
        for p in self.problems:
            if isinstance(p["module"], int) and p["module"] <= 3:
                with self.subTest(id=p["id"]):
                    self.assertEqual(p["function_name"], "")
                    self.assertTrue(all(not isinstance(t["in"], (list, dict)) for t in p["tests"]))

    def test_functions_use_explicit_parameters(self):
        for p in self.problems:
            if p["module"] == "final" or (isinstance(p["module"], int) and p["module"] >= 4):
                with self.subTest(id=p["id"]):
                    self.assertTrue(p["function_name"])
                    self.assertTrue(p["function_parameter"])
                    self.assertIn(p["function_name"], p["statement"])

    def test_exercise_cards_follow_actual_order_and_dependencies(self):
        links = re.findall(
            r'<a href="tutor\.html\?exercise=([^"]+)"'
            r' data-exercise-id="([^"]+)" data-requires="([^"]+)"',
            self.cards,
        )
        self.assertEqual([id_ for _, id_, _ in links],
                         [p["id"] for p in self.problems if p["id"] != "analisar_turma"])
        for i, (_, id_, prereq) in enumerate(links):
            self.assertEqual(prereq, "none" if i == 0 else links[i-1][1],
                             msg=f"Pré-requisito incorreto de {id_}")

    def test_each_exercise_has_a_contextual_quiz(self):
        for p in self.problems:
            with self.subTest(id=p["id"]):
                self.assertRegex(
                    self.reviews,
                    rf"(?m)^\s+{re.escape(p['id'])}: \{{ prompt:",
                )

    def test_legacy_progress_is_archived_and_isolated(self):
        progress = (ROOT / "progress-store.js").read_text(encoding="utf-8")
        backend = (ROOT / "supabase" / "functions" / "gemini-tutor" / "index.ts").read_text(encoding="utf-8")
        app = (ROOT / "app.js").read_text(encoding="utf-8")
        for text in [progress, self.rules, self.migration, app, backend]:
            self.assertIn("curriculum_version", text)
        self.assertIn("exercise_progress_v1_archive", self.migration)
        self.assertIn("chat_messages", self.migration)

    def test_first_lesson_is_only_simple_arithmetic(self):
        first = self.problems[0]
        self.assertIn("Dobro", first["title"])
        self.assertIn("multiplica", first["theory"])
        self.assertEqual(first["tests"][0], {"in": 6, "out": 12})
        self.assertNotIn("entrada[", first["statement"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
