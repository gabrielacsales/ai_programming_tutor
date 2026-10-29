#!/usr/bin/env python3
"""Verifica arquivos públicos em uma URL de homologação (sem usar credenciais).

Exemplo: python scripts/smoke_site.py https://SEU-PROJETO.pages.dev

Este script testa apenas HTTP, links e cabeçalhos públicos.
Não substitui cadastro real, RLS, Gemini, Pyodide ou usabilidade.
"""
from __future__ import annotations

import argparse
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ALLOWED = (
    "/",
    "/index.html",
    "/login.html",
    "/reset-password.html",
    "/conteudos.html",
    "/tutor.html",
    "/perfil.html",
    "/supabase-config.js",
    "/module-progress.js",
    "/study-guide.js",
)
BLOCKED = (
    "/README.md",
    "/PRODUCAO_IATUTOR.md",
    "/scripts/build_site.py",
    "/supabase/schema.sql",
    "/supabase/functions/gemini-tutor/index.ts",
    "/pesquisa.html",
    "/painel-pesquisa.html",
    "/inicio-senac.html",
    "/.env",
)


def fetch(url: str) -> tuple[int, bytes, dict[str, str]]:
    req = Request(url, headers={"User-Agent": "IATutor-Homologacao/1.0"})
    try:
        with urlopen(req, timeout=20) as response:
            return response.status, response.read(600_000), dict(response.headers)
    except HTTPError as err:
        return err.code, err.read(100_000), dict(err.headers)


def check(base: str) -> bool:
    good = True
    for path in ALLOWED:
        try:
            status, content, headers = fetch(base + path)
            ok = status == 200 and bool(content)
            if ok and path.endswith(".js"):
                ok = b"<!doctype html" not in content[:200].lower()
            if ok and path in ("/login.html", "/tutor.html"):
                ok = headers.get("X-Robots-Tag", "").lower() == "noindex"
            print(("OK" if ok else "FALHA"), "PUBLIC", path, status)
        except (OSError, URLError) as exc:
            print("ERRO", "PUBLIC", path, str(exc))
            ok = False
        good = good and ok
    for path in BLOCKED:
        try:
            status, _, _ = fetch(base + path)
            ok = status in (403, 404, 410)
            print(("OK" if ok else "FALHA"), "PRIVATE", path, status)
        except (OSError, URLError) as exc:
            print("ERRO", "PRIVATE", path, str(exc))
            ok = False
        good = good and ok
    return good


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="URL HTTPS exata criada pela hospedagem")
    args = parser.parse_args()
    target = urlsplit(args.url)
    if target.scheme != "https" or not target.netloc or target.username or target.password or target.path not in ("", "/") or target.query or target.fragment:
        parser.error("Use uma origem HTTPS simples, ex.: https://nome.pages.dev")
    base = args.url.rstrip("/")
    print("Alvo:", base)
    ok = check(base)
    print("RESULTADO:", "PÚBLICO ESTÁTICO CONFORME" if ok else "PENDÊNCIAS ENCONTRADAS")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
