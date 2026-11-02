#!/usr/bin/env python3
"""Regressões estáticas: separação entre código publicado, documentação e legado."""
from __future__ import annotations

import re
import unittest
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "index.html", "login.html", "reset-password.html",
    "conteudos.html", "tutor.html", "perfil.html",
}
CURRENT_DOCS = [
    ROOT / "README.md",
    ROOT / "docs/arquitetura.md",
    ROOT / "docs/decisoes-tecnicas.md",
    ROOT / "docs/operacao.md",
    ROOT / "docs/validacao/README.md",
    ROOT / "docs/artefatos/README.md",
    ROOT / "docs/historico/README.md",
]


class RepositoryLayoutTests(unittest.TestCase):
    def test_only_supported_root_pages(self):
        self.assertEqual({p.name for p in ROOT.glob("*.html")}, PAGES)
        self.assertFalse((ROOT / "backup").exists())
        for file in (
            "gabi-site.webp", "index.css", "research.css", "research-admin.css",
            "research-collector.js", "research-instruments.js",
            "research-page.js", "research-admin.js", "senac-onboarding.js",
            "pesquisa.html", "inicio-senac.html", "painel-pesquisa.html",
            "scripts/analyze_study.py", "supabase/research-study.sql",
            "supabase/senac-onboarding.sql",
        ):
            with self.subTest(file=file):
                self.assertFalse((ROOT / file).exists())

    def test_archived_material_is_outside_public_build(self):
        self.assertTrue((ROOT / "docs/historico/restore-course-without-senac.sql").is_file())
        build = (ROOT / "scripts/build_site.py").read_text(encoding="utf-8")
        self.assertIn("OUTPUT_FILES", build)
        self.assertIn("validate_source_files()", build)
        self.assertIn('shutil.copyfile(ROOT / name, output / name)', build)
        self.assertNotIn('"research-study.sql"', build)
        self.assertNotIn('"index.css"', build)

    def test_current_documentation_links_resolve(self):
        for source in CURRENT_DOCS:
            self.assertTrue(source.is_file(), str(source))
            body = source.read_text(encoding="utf-8")
            for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", body):
                parsed = urlsplit(target)
                if parsed.scheme or parsed.netloc or target.startswith("#"):
                    continue
                path = unquote(parsed.path)
                if not path:
                    continue
                linked = (source.parent / path).resolve()
                with self.subTest(source=str(source.relative_to(ROOT)), target=target):
                    self.assertTrue(linked.is_relative_to(ROOT))
                    self.assertTrue(linked.exists(), f"Broken doc link: {source} -> {target}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
