#!/usr/bin/env python3
"""Verificações estáticas dos recursos didáticos. Execute: python -m unittest tests/verify_ux_exercicios.py"""
from __future__ import annotations

import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class ExerciseUXTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.problems_source = (ROOT / "problems.js").read_text(encoding="utf-8")
        cls.ui = (ROOT / "learning-ui.js").read_text(encoding="utf-8")
        cls.app = (ROOT / "app.js").read_text(encoding="utf-8")
        cls.html = (ROOT / "tutor.html").read_text(encoding="utf-8")
        cls.style = (ROOT / "learning-ui.css").read_text(encoding="utf-8")
        source = cls.problems_source
        cls.problems = json.JSONDecoder().raw_decode(
            source.split("const problems = ", 1)[1].lstrip()
        )[0]
        cls.additional_examples = json.JSONDecoder().raw_decode(
            source.split("const complementaryPracticalExamples = ", 1)[1].lstrip()
        )[0]

    def test_two_examples_for_all_curriculum_v2_exercises(self):
        ids = {p["id"] for p in self.problems}
        self.assertEqual(len(ids), 16)
        self.assertEqual(ids, set(self.additional_examples))
        for problem in self.problems:
            with self.subTest(problem=problem["id"]):
                self.assertTrue(problem.get("solution", "").startswith("# Exemplo do professor"))
                other = self.additional_examples[problem["id"]]
                self.assertTrue(other.get("title"))
                self.assertTrue(other.get("description"))
                self.assertTrue(other.get("code"))
                self.assertNotEqual(problem["solution"], other["code"])

    def test_markdown_and_collapsible_panels_exist(self):
        self.assertIn("renderExerciseStatementMarkdown(p.statement)", self.app)
        self.assertIn("escapeHTML", self.ui)
        self.assertIn("btn-toggle-statement", self.html)
        for element_id in ("feedback-panel-desc", "feedback-panel-code", "execution-feedback-details"):
            self.assertIn('id="' + element_id + '"', self.html)
        self.assertIn("setFeedbackVisible", self.app)

    def test_tour_examples_and_compatibility(self):
        self.assertIn("Exemplos Práticos", self.html)
        self.assertIn("learningUI.renderPracticeExamples(p)", self.app)
        self.assertIn("btn-feature-tour", self.html)
        self.assertEqual(len(re.findall(r'data-tour-step="[0-3]"', self.html)), 6)
        self.assertIn("TutorEditor.start", self.app)
        self.assertIn("TutorAccess.verify", self.app)
        self.assertIn("TutorAuth.requireCourseReady", self.app)
        self.assertIn('href="learning-ui.css"', self.html)
        self.assertLess(self.html.index('src="learning-ui.js"'), self.html.index('src="app.js"'))

    def test_unique_html_ids(self):
        ids = re.findall(r'\bid="([^"]+)"', self.html)
        self.assertEqual(len(ids), len(set(ids)))


if __name__ == "__main__":
    unittest.main(verbosity=2)
