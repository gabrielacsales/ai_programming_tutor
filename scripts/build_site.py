#!/usr/bin/env python3
"""Compila somente os arquivos públicos do IA Tutor para a pasta dist/.

Uso local: python scripts/build_site.py
Cloudflare Pages: python3 scripts/build_site.py
Output directory: dist

O build é baseado em uma lista explícita (fail closed): pastas supabase/,
backup/, scripts/, tests/ e páginas antigas de pesquisa jamais são copiadas.
"""
from __future__ import annotations

import argparse
import html.parser
from pathlib import Path
import shutil
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = (
    "index.html",
    "login.html",
    "reset-password.html",
    "conteudos.html",
    "tutor.html",
    "perfil.html",
)
PUBLIC_STYLES = (
    "login.css",
    "perfil.css",
    "module-progress.css",
    "preflight-review.css",
    "code-editor.css",
    "learning-ui.css",
    "study-guide.css",
)
PUBLIC_SCRIPTS = (
    "supabase-config.js",
    "auth-client.js",
    "access-client.js",
    "progress-store.js",
    "module-progress.js",
    "preflight-review.js",
    "code-editor.js",
    "problems.js",
    "runner.js",
    "tutor.js",
    "learning-ui.js",
    "study-guide.js",
    "app.js",
    "perfil.js",
)
OUTPUT_FILES = frozenset((*PUBLIC_PAGES, *PUBLIC_STYLES, *PUBLIC_SCRIPTS))


class LocalReferences(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.files: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for attr, value in attrs:
            if value is None or (
                (tag == "script" and attr == "src")
                or (tag == "link" and attr == "href")
                or (tag in ("a", "form", "iframe", "img") and attr in ("href", "action", "src"))
            ) is False:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or value.startswith(("//", "#", "data:")):
                continue
            path = unquote(url.path).strip()
            if path:
                self.files.append(path)


def validate_source_files() -> None:
    for name in OUTPUT_FILES:
        path = ROOT / name
        if not path.is_file() or path.is_symlink():
            raise RuntimeError(f"Arquivo público ausente ou link simbólico: {name}")
        if path.parent != ROOT:
            raise RuntimeError(f"Arquivo fora da raiz permitida: {name}")

    for page in PUBLIC_PAGES:
        parser = LocalReferences()
        parser.feed((ROOT / page).read_text(encoding="utf-8"))
        for reference in parser.files:
            if reference.startswith("/") and reference != "/":
                raise RuntimeError(f"Referência absoluta não esperada em {page}: {reference}")
            relative = reference.lstrip("/")
            if relative in ("", "index.html"):
                continue
            if relative not in OUTPUT_FILES:
                raise RuntimeError(
                    f"Link local não publicado em {page}: {reference}. "
                    "Atualize a lista explícita de arquivos e revise se é seguro expor."
                )

    config = (ROOT / "supabase-config.js").read_text(encoding="utf-8")
    if "publishableKey:" not in config or ".supabase.co" not in config:
        raise RuntimeError("supabase-config.js sem configuração pública válida")
    # HTMLParser acima inspeciona scripts e links REAIS, ignorando comentários.
    # Qualquer tentativa de carregar um arquivo histórico de pesquisa falha,
    # porque seu nome não pertence à lista OUTPUT_FILES.


def build(output: Path) -> None:
    output = output.resolve()
    if output != ROOT / "dist":
        raise RuntimeError("Por segurança o destino está fixado em dist/ na raiz do repositório.")
    validate_source_files()
    if output.exists():
        if output.is_symlink() or not output.is_dir():
            raise RuntimeError("O destino dist/ precisa ser uma pasta normal.")
        shutil.rmtree(output)
    output.mkdir(parents=True)
    for name in sorted(OUTPUT_FILES):
        shutil.copyfile(ROOT / name, output / name)

    # Segurança e privacidade: não expor índices de diretórios nem permitir
    # que crawlers arquivem conteúdo de perfis ou respostas de exercícios.
    (output / "_headers").write_text(
        "/*\n"
        "  X-Content-Type-Options: nosniff\n"
        "  Referrer-Policy: strict-origin-when-cross-origin\n"
        "  X-Frame-Options: DENY\n"
        "  Permissions-Policy: camera=(), microphone=(), geolocation=()\n"
        "/login.html\n"
        "  X-Robots-Tag: noindex\n"
        "/reset-password.html\n"
        "  X-Robots-Tag: noindex\n"
        "/tutor.html\n"
        "  X-Robots-Tag: noindex\n"
        "/perfil.html\n"
        "  X-Robots-Tag: noindex\n"
        "/conteudos.html\n"
        "  X-Robots-Tag: noindex\n",
        encoding="utf-8",
    )
    produced = {p.name for p in output.iterdir()}
    expected = OUTPUT_FILES | {"_headers"}
    if produced != expected:
        raise RuntimeError(f"Build contém arquivos inesperados: {produced ^ expected}")
    print(f"IA Tutor: {len(OUTPUT_FILES)} recursos públicos + _headers -> {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gera o pacote estático seguro do IA Tutor")
    parser.parse_args()
    try:
        build(ROOT / "dist")
    except (OSError, RuntimeError) as exc:
        print(f"Falha no build de produção: {exc}", file=sys.stderr)
        sys.exit(1)
