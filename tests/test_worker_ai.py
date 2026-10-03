import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.ai import AIError
from app.worker import Worker
from tests.fakes import FakeDB, make_cfg, make_post, to_post


class RequiredAITests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.db = FakeDB()
        self.db.posts = [make_post(3, ai_status="failed")]
        self.w = Worker(make_cfg(ai_enabled=True, ai_required=True), self.db, None)

    async def test_previous_failure_still_blocks_required_publish(self):
        with self.assertRaises(AIError):
            await self.w._ai(to_post(self.db.posts[0]), None, await self.w.rt.view())

    async def test_optional_failure_keeps_original(self):
        self.w.cfg.ai_required = False
        self.assertIsNone(await self.w._ai(to_post(self.db.posts[0]), None, await self.w.rt.view()))

    async def test_required_no_preview_is_rejected(self):
        self.db.posts[0].update(ai_status="unchecked", text="")
        with self.assertRaises(AIError):
            await self.w._ai(to_post(self.db.posts[0]), None, await self.w.rt.view())

    async def test_generated_caption_reused_without_provider(self):
        self.db.posts[0].update(ai_status="generated", ai_caption="ready")
        with patch("app.worker.generate_caption", AsyncMock(side_effect=AssertionError("unexpected request"))):
            self.assertEqual(await self.w._ai(to_post(self.db.posts[0]), None, await self.w.rt.view()), "ready")
