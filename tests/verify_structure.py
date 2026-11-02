"""Garante que a refatoração não reintroduza arquivos legados nem altere o build."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"


def load_build_module():
    spec = importlib.util.spec_from_file_location("iatutor_build", ROOT / "scripts" / "build_site.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("Não foi possível carregar o build")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class StructureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.build = load_build_module()

    def test_frontend_is_separated_from_backend_docs_and_tests(self):
        self.assertTrue(WEB.is_dir())
        self.assertTrue((ROOT / "supabase/functions/gemini-tutor/index.ts").is_file())
        for dirname in ("docs", "scripts", "tests"):
            self.assertTrue((ROOT / dirname).is_dir())
        self.assertEqual(len(self.build.OUTPUT_FILES), 34)
        self.assertEqual(len(self.build.PUBLIC_PAGES), 6)
        for name in self.build.OUTPUT_FILES:
            with self.subTest(asset=name):
                self.assertTrue((WEB / name).is_file())
                self.assertFalse((ROOT / name).exists())

    def test_build_validate_sources_and_keep_flat_public_urls(self):
        self.assertEqual(self.build.WEB, WEB)
        self.assertEqual(self.build.ROOT, ROOT)
        self.build.validate_source_files()
        for page in self.build.PUBLIC_PAGES:
            source = (WEB / page).read_text(encoding="utf-8")
            self.assertNotIn('href="web/', source)
            self.assertNotIn('src="web/', source)

    def test_unused_legacy_code_does_not_return(self):
        unused = (
            "index.css", "gabi-site.webp",
            "pesquisa.html", "inicio-senac.html", "painel-pesquisa.html",
            "senac-onboarding.js", "research-collector.js", "research-admin.js",
        )
        for name in unused:
            with self.subTest(file=name):
                self.assertFalse((WEB / name).exists())
                self.assertFalse((ROOT / name).exists())
        self.assertFalse((ROOT / "backup").exists())
        self.assertFalse((ROOT / "supabase/research-study.sql").exists())
        self.assertFalse((ROOT / "supabase/senac-onboarding.sql").exists())

    def test_documentation_has_one_current_entrypoint(self):
        for path in ("README.md", "docs/ARQUITETURA.md", "docs/OPERACAO.md",
                     "docs/VALIDACAO.md", "docs/DECISOES_REFATORACAO.md"):
            with self.subTest(path=path):
                self.assertTrue((ROOT / path).is_file())
        self.assertTrue((ROOT / "docs/historico").is_dir())
        self.assertTrue((ROOT / "docs/testes").is_dir())


if __name__ == "__main__":
    unittest.main()
