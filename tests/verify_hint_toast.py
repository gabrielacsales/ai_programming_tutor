"""Regressão estática: dicas visíveis acima do aviso de cookies no mobile."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class HintToastRegressionTests(unittest.TestCase):
    def test_hint_layer_is_higher_than_cookie_banner(self):
        mobile_css = (ROOT / "challenge-mobile.css").read_text(encoding="utf-8")
        privacy_css = (ROOT / "privacy.css").read_text(encoding="utf-8")

        hint_rule = re.search(
            r"#alert-toast\.hint-toast\s*\{([^}]*)\}", mobile_css, re.S
        )
        privacy_rule = re.search(
            r"\.privacy-banner\s*\{([^}]*)\}", privacy_css, re.S
        )
        self.assertIsNotNone(hint_rule)
        self.assertIsNotNone(privacy_rule)
        hint_layer = re.search(r"z-index:\s*(\d+)", hint_rule.group(1))
        privacy_layer = re.search(r"z-index:\s*(\d+)", privacy_rule.group(1))
        self.assertIsNotNone(hint_layer)
        self.assertIsNotNone(privacy_layer)
        self.assertGreater(int(hint_layer.group(1)), int(privacy_layer.group(1)))

    def test_hint_timer_is_longer_and_dismissible(self):
        app_js = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertIn("isHint ? 15000 : 4000", app_js)
        self.assertIn('showToast(`💡 Dica: ${hint}`, { isHint: true });', app_js)
        self.assertIn('closeButton.setAttribute("aria-label", "Fechar dica")', app_js)
        self.assertIn('closeButton.addEventListener("click", hideToast)', app_js)
        self.assertIn("clearTimeout(toastHideTimer)", app_js)
        self.assertIn("document.body.appendChild(alertToast)", app_js)

    def test_cookie_shortcut_is_hidden_only_during_hint(self):
        app_js = (ROOT / "app.js").read_text(encoding="utf-8")
        privacy_css = (ROOT / "privacy.css").read_text(encoding="utf-8")

        rule = re.search(
            r"body\.hint-toast-active \.privacy-floating-control\s*\{([^}]*)\}",
            privacy_css, re.S,
        )
        self.assertIsNotNone(rule)
        for declaration in ("visibility:hidden", "pointer-events:none", "opacity:0"):
            self.assertIn(declaration, rule.group(1))

        self.assertIn('document.body.classList.toggle("hint-toast-active", isHint)', app_js)
        # hideToast() e showActionToast() devem restaurar a visibilidade.
        self.assertEqual(app_js.count('document.body.classList.remove("hint-toast-active")'), 2)

    def test_tutor_loads_versioned_hint_resources(self):
        page = (ROOT / "tutor.html").read_text(encoding="utf-8")
        for resource in ("app.js", "privacy.css", "challenge-mobile.css"):
            self.assertRegex(page, rf'{re.escape(resource)}\\?v=f15-cookies-[0-9-]+')
        # Garante que nenhum recurso importante do toast use o endereço sem versão.
        self.assertNotIn('src="app.js"', page)
        self.assertNotIn('href="privacy.css"', page)
        self.assertNotIn('href="challenge-mobile.css"', page)

    def test_normal_toasts_do_not_inherit_hint_layer(self):
        app_js = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertIn('alertToast.classList.toggle("hint-toast", isHint)', app_js)
        self.assertIn('alertToast.classList.remove("hint-toast")', app_js)


if __name__ == "__main__":
    unittest.main()
