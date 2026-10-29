#!/usr/bin/env python3
"""Regressão: tentativas incorretas não apagam uma conclusão anterior.

Esses testes são estáticos: a persistência real no Supabase deve ser
validada separadamente no ambiente de homologação.
"""
from __future__ import annotations

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class StickyCompletionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = (ROOT / "app.js").read_text(encoding="utf-8")
        cls.store = (ROOT / "progress-store.js").read_text(encoding="utf-8")

    def test_failure_never_clears_completed_state(self):
        self.assertNotRegex(
            self.app, r"currentOrch\.state\.completed\s*=\s*false\s*;"
        )
        self.assertIn("currentOrch.state.completed = true;", self.app)
        self.assertIn("await persistExercise(currentOrch);", self.app)

    def test_failure_feedback_is_distinct_from_completion(self):
        self.assertIn("Seu código precisa funcionar com entradas diferentes", self.app)
        self.assertIn("Esta tentativa não passou, mas sua conclusão anterior continua registrada.", self.app)
        self.assertIn('errorOutput.innerText = res.error;', self.app)

    def test_save_preserves_existing_completion(self):
        self.assertIn('const saved = records.get(exerciseId)', self.store)
        self.assertIn('saved?.completed === true && isCurrentCurriculum(saved)', self.store)
        self.assertIn('completed: previouslyCompleted || changes.completed === true', self.store)
        self.assertIn('const previous = writeQueues.get(exerciseId) || Promise.resolve()', self.store)
        self.assertIn('curriculum_version: CURRICULUM_VERSION', self.store)

    def test_no_legacy_completion_used_as_authority(self):
        self.assertNotRegex(self.store, r'JSON\.parse\(localStorage\.getItem\("completed_exercises"\)')
        self.assertIn('const row = records.get(exerciseId)', self.store)


if __name__ == "__main__":
    unittest.main(verbosity=2)
