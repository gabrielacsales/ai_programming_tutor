#!/usr/bin/env python3
"""Verificações estáticas do fluxo responsivo dos desafios (sem browser)."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class MarkupInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.buttons = 0
        self.nested_buttons = []
        self.ids = []
        self.roles = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "button":
            if self.buttons:
                self.nested_buttons.append(attributes.get("id") or "unnamed")
            self.buttons += 1
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        if attributes.get("role"):
            self.roles.append(attributes["role"])

    def handle_endtag(self, tag):
        if tag == "button":
            self.buttons -= 1


class ChallengeMobileTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "tutor.html").read_text(encoding="utf-8")
        cls.app = (ROOT / "app.js").read_text(encoding="utf-8")
        cls.css = (ROOT / "challenge-mobile.css").read_text(encoding="utf-8")
        cls.editor = (ROOT / "code-editor.js").read_text(encoding="utf-8")
        cls.build = (ROOT / "scripts/build_site.py").read_text(encoding="utf-8")

    def test_mobile_nav_accessible_and_closed_by_default(self):
        for required in ('id="exercise-sidebar"', 'id="btn-toggle-sidebar"',
                         'aria-controls="exercise-sidebar"', 'aria-expanded="false"',
                         'id="mobile-sidebar-close"', 'id="mobile-nav-backdrop"'):
            self.assertIn(required, self.html)
        self.assertIn('setMobileNavigation(false);', self.app)
        self.assertIn('sidebar.inert = mobileViewport.matches && !show;', self.app)
        self.assertIn('event.key === "Escape"', self.app)
        self.assertIn('selectExercise.addEventListener("change", async', self.app)
        self.assertIn('.app-layout .sidebar.mobile-open', self.css)

    def test_editor_and_feedback_mobile_useability(self):
        self.assertIn('id="btn-indent-code"', self.html)
        self.assertIn('TutorEditor.insertIndent();', self.app)
        self.assertIn('insertIndent', self.editor)
        self.assertIn('lineWrapping: mobileEditor.matches', self.editor)
        self.assertIn('font-size: 16px;', self.css)
        self.assertIn('execResults.scrollIntoView(', self.app)
        self.assertIn('Resultados da última execução', self.html)
        self.assertIn('Testar meu código', self.html)

    def test_keyboard_and_focus(self):
        self.assertIn('role="tablist"', self.html)
        self.assertEqual(self.html.count('role="tab"'), 3)
        self.assertIn('aria-selected', self.app)
        self.assertIn('event.key === "ArrowRight"', self.app)
        self.assertIn('tabDesc.setAttribute("aria-pressed"', self.app)
        parser = MarkupInspector()
        parser.feed(self.html)
        self.assertEqual(parser.nested_buttons, [], "Não deve existir botão dentro de botão")
        self.assertEqual(len(parser.ids), len(set(parser.ids)))

    def test_instrumentation_is_optional_and_course_content_untouched(self):
        self.assertIn('id="metrics-disclosure"', self.html)
        self.assertIn('metrics-disclosure > summary', self.css)
        self.assertIn('id="view-exercise-examples"', self.html)
        self.assertIn('id="view-exercise-summary"', self.html)
        self.assertIn('TutorProgress.save', self.app)
        self.assertIn('TutorAccess.verify', self.app)
        self.assertIn('"challenge-mobile.css",', self.build)
        self.assertIn('href="challenge-mobile.css"', self.html)


if __name__ == "__main__":
    unittest.main(verbosity=2)
