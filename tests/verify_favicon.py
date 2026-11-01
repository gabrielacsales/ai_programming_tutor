"""Regressão da identidade visual do IA Tutor nas abas e nos dispositivos."""
from __future__ import annotations

import struct
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ("index.html", "login.html", "reset-password.html", "conteudos.html", "tutor.html", "perfil.html")
FAVICONS = {
    "favicon.ico": "image/x-icon",
    "favicon-16x16.png": "image/png",
    "favicon-32x32.png": "image/png",
    "favicon.svg": "image/svg+xml",
    "apple-touch-icon.png": "image/png",
}


class IconParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.icons = []

    def handle_starttag(self, tag, attrs):
        if tag == "link":
            props = dict(attrs)
            if "icon" in (props.get("rel", "")):
                self.icons.append(props)


class FaviconTests(unittest.TestCase):
    def test_all_public_pages_have_local_favicon_and_apple_icon(self):
        for page in PAGES:
            with self.subTest(page=page):
                parser = IconParser()
                parser.feed((ROOT / page).read_text(encoding="utf-8"))
                found = {x.get("href", "").split("?")[0]: x for x in parser.icons}
                self.assertEqual(set(found), set(FAVICONS))
                for name, content_type in FAVICONS.items():
                    self.assertEqual(found[name].get("type"), content_type if name != "apple-touch-icon.png" else None)
                    self.assertTrue((ROOT / name).is_file())
                self.assertEqual(found["apple-touch-icon.png"]["rel"], "apple-touch-icon")

    def test_actual_image_formats_and_sizes(self):
        self.assertTrue((ROOT / "favicon.ico").read_bytes().startswith(b"\x00\x00\x01\x00"))
        for filename, size in (("favicon-16x16.png", 16), ("favicon-32x32.png", 32), ("apple-touch-icon.png", 180)):
            data = (ROOT / filename).read_bytes()
            self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"), filename)
            self.assertEqual(struct.unpack(">II", data[16:24]), (size, size))
        root = ET.fromstring((ROOT / "favicon.svg").read_text(encoding="utf-8"))
        self.assertEqual(root.attrib["viewBox"], "0 0 64 64")
        self.assertTrue(any(x.tag.endswith("path") for x in root))

    def test_safe_build_whitelist_includes_icons(self):
        build = (ROOT / "scripts/build_site.py").read_text(encoding="utf-8")
        for name in FAVICONS:
            self.assertIn('"' + name + '"', build)


if __name__ == "__main__":
    unittest.main(verbosity=2)
