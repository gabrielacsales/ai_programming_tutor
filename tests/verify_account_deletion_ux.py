#!/usr/bin/env python3
"""Regressão estática da exclusão de conta e seu retorno à landing."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AccountDeletionUXTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile_html = (ROOT / "perfil.html").read_text(encoding="utf-8")
        cls.profile_js = (ROOT / "perfil.js").read_text(encoding="utf-8")
        cls.profile_css = (ROOT / "perfil.css").read_text(encoding="utf-8")
        cls.home = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.edge = (ROOT / "supabase/functions/delete-account/index.ts").read_text(encoding="utf-8")

    def test_account_settings_follow_site_design(self):
        self.assertIn('class="account-settings"', self.profile_html)
        self.assertIn('class="delete-account-trigger"', self.profile_html)
        self.assertIn('icon="solar:trash-bin-trash-linear"', self.profile_html)
        self.assertIn("var(--line)", self.profile_css)
        self.assertIn("var(--surface)", self.profile_css)
        self.assertIn(".delete-account-dialog", self.profile_css)

    def test_user_must_confirm_before_deleting(self):
        self.assertIn('id="delete-account-dialog"', self.profile_html)
        self.assertIn('id="delete-account-password"', self.profile_html)
        self.assertIn('id="delete-account-confirmation"', self.profile_html)
        self.assertIn('id="confirm-delete-account" class="delete-dialog-confirm" type="submit" disabled', self.profile_html)
        self.assertIn('confirmation.value.trim() !== "EXCLUIR"', self.profile_js)
        self.assertIn('id="cancel-delete-account"', self.profile_html)
        self.assertIn('dialog.showModal()', self.profile_js)
        self.assertIn('client.functions.invoke("delete-account"', self.profile_js)

    def test_return_home_only_after_server_confirms_success(self):
        self.assertIn('if (error || !data?.success)', self.profile_js)
        self.assertIn('location.replace("index.html?account_deleted=1")', self.profile_js)
        self.assertNotIn('location.replace("login.html?deleted=1")', self.profile_js)
        self.assertIn('id="account-deleted-notice"', self.home)
        self.assertIn('Sua conta foi excluída com sucesso.', self.home)
        self.assertIn("currentUrl.searchParams.delete('account_deleted')", self.home)
        self.assertIn('#account-deleted-notice[hidden] { display: none !important; }', self.home)

    def test_backend_checks_identity_and_password(self):
        self.assertIn('auth.getUser(token)', self.edge)
        self.assertIn('auth.signInWithPassword(', self.edge)
        self.assertIn('check?.user?.id !== user.id', self.edge)
        self.assertIn('admin.auth.admin.deleteUser(user.id)', self.edge)


if __name__ == "__main__":
    unittest.main(verbosity=2)
