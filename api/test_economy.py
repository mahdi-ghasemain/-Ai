"""Run with: python -m unittest test_economy -v (from api/).

Uses a temporary database and fake providers. No network or paid requests.
"""
import os
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

bootstrap = tempfile.TemporaryDirectory()
os.environ["DATABASE_PATH"] = str(Path(bootstrap.name) / "bootstrap.db")
os.environ["APP_ENV"] = "development"
os.environ["AI_PAID_ENABLED"] = "false"
import main
from fastapi.testclient import TestClient


class EconomyTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.settings = patch.multiple(
            main, DB_PATH=str(Path(self.folder.name) / "test.db"),
            AI_PAID_ENABLED=True, OPENAI_API_KEY="test-not-a-real-key",
            GLOBAL_MONTHLY_CREDITS=100,
            PLAN_QUOTAS={"free": 5, "starter": 30, "creator": 100, "studio": 300},
        )
        self.settings.start()
        self.addCleanup(self.settings.stop)
        main.init_db()
        self.provider = Mock()
        self.provider.responses.create.return_value = SimpleNamespace(output_text="Test answer")
        self.provider.images.generate.return_value = SimpleNamespace(data=[SimpleNamespace(b64_json="aGVsbG8=", url=None)])
        self.provider_patch = patch.object(main, "ai_client", return_value=self.provider)
        self.provider_patch.start()
        self.addCleanup(self.provider_patch.stop)
        main.app.dependency_overrides[main.current_user] = lambda: {"id": 1}
        self.addCleanup(main.app.dependency_overrides.clear)
        self.client = TestClient(main.app)
        self.addCleanup(self.client.close)

    def test_disabled_never_contacts_provider(self):
        main.AI_PAID_ENABLED = False
        response = self.client.post("/v1/assistant", json={"message": "Hello", "mode": "text"})
        self.assertEqual(response.status_code, 503)
        self.provider.responses.create.assert_not_called()

    def test_text_history_and_credit(self):
        response = self.client.post("/v1/assistant", json={
            "message": "Explain further", "mode": "text",
            "history": [{"role": "user", "content": "Hello"}],
        })
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["subscription"]["used"], 1)
        request = self.provider.responses.create.call_args.kwargs
        self.assertEqual(request["input"][0]["content"], "Hello")
        self.assertEqual(request["max_output_tokens"], main.MAX_OUTPUT_TOKENS)

    def test_image_reserves_five_and_blocks_next_call(self):
        first = self.client.post("/v1/assistant", json={"message": "Make a photo", "mode": "image"})
        self.assertEqual(first.status_code, 200, first.text)
        self.assertEqual(first.json()["subscription"]["used"], 5)
        self.assertEqual(first.json()["image_kind"], "b64")
        second = self.client.post("/v1/assistant", json={"message": "Hello", "mode": "text"})
        self.assertEqual(second.status_code, 402)
        self.provider.responses.create.assert_not_called()
        self.assertEqual(self.provider.images.generate.call_args.kwargs["quality"], "low")

    def test_failure_refunds_user_but_keeps_attempt_ceiling(self):
        self.provider.responses.create.side_effect = RuntimeError("private provider error")
        response = self.client.post("/v1/assistant", json={"message": "Hello", "mode": "text"})
        self.assertEqual(response.status_code, 502)
        self.assertNotIn("private provider error", response.text)
        self.assertEqual(main.get_subscription(1)["used"], 0)
        with main.closing(main.db()) as conn:
            self.assertEqual(conn.execute("SELECT used FROM generation_budget").fetchone()["used"], 1)

    def test_global_cap_applies_across_users(self):
        main.GLOBAL_MONTHLY_CREDITS = 1
        main.reserve_quota(1, 1)
        with self.assertRaises(main.HTTPException) as caught:
            main.reserve_quota(2, 1)
        self.assertEqual(caught.exception.status_code, 429)

    def test_empty_result_refunds_user(self):
        self.provider.responses.create.return_value = SimpleNamespace(output_text="")
        response = self.client.post("/v1/assistant", json={"message": "Hello", "mode": "text"})
        self.assertEqual(response.status_code, 502)
        self.assertEqual(main.get_subscription(1)["used"], 0)

    def test_concurrent_requests_cannot_overdraw(self):
        def reserve(_):
            try:
                main.reserve_quota(1, 1)
                return True
            except main.HTTPException:
                return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            accepted = list(pool.map(reserve, range(15)))
        self.assertEqual(sum(accepted), 5)
        self.assertEqual(main.get_subscription(1)["used"], 5)

    def test_paid_plan_is_not_unlimited(self):
        main.get_subscription(1)
        with main.closing(main.db()) as conn:
            conn.execute("UPDATE subscriptions SET plan='starter',used=30 WHERE user_id=1")
            conn.commit()
        with self.assertRaises(main.HTTPException):
            main.reserve_quota(1, 1)

    def test_video_is_explicitly_a_plan(self):
        response = self.client.post("/v1/assistant", json={"message": "Make a video", "mode": "video"})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["kind"], "video_plan")
        self.provider.images.generate.assert_not_called()

    def test_legacy_chat_cannot_bypass_quota(self):
        main.reserve_quota(1, 5)
        response = self.client.post("/v1/chat", json={"message": "Hello"})
        self.assertEqual(response.status_code, 402)
        self.provider.responses.create.assert_not_called()

    def test_unbounded_history_rejected(self):
        response = self.client.post("/v1/assistant", json={
            "message": "Hello", "history": [{"role": "user", "content": "hello"}] * 7,
        })
        self.assertEqual(response.status_code, 422)
        self.provider.responses.create.assert_not_called()


if __name__ == "__main__":
    unittest.main()
