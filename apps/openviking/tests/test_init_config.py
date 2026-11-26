"""File-only behavior tests: no entrypoint, container, network or model calls.

Run: python3 -B -m unittest discover -s apps/openviking/tests -v
Both shipped copies are exercised independently. All keys are ephemeral test
values generated at runtime and never sent to a model service.
"""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import secrets
import stat
import sys
import tempfile
import unittest
from unittest import mock

APP = Path(__file__).resolve().parents[1]


class GeneratorCases:
    def setUp(self):
        script = APP / self.version / "data/scripts/init-config.py"
        spec = importlib.util.spec_from_file_location("ov_init_test", script)
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.directory = Path(self.temporary.name)
        self.path = self.directory / "data/ov.conf"
        self.module.CONFIG_PATH = str(self.path)
        self.root = secrets.token_hex(32)
        self.embedding_key = secrets.token_hex(24)
        self.vlm_key = secrets.token_hex(24)
        self.embedding = {
            "EMBEDDING_PROVIDER": "openai",
            "EMBEDDING_API_BASE": "https://embedding.example.invalid/api/v1",
            "EMBEDDING_API_KEY": self.embedding_key,
            "EMBEDDING_MODEL": "test-embedding-model",
            "EMBEDDING_DIMENSION": "1024",
        }
        self.vlm = {
            "VLM_PROVIDER": "openai",
            "VLM_API_BASE": "https://chat.example.invalid/compatible/v1",
            "VLM_API_KEY": self.vlm_key,
            "VLM_MODEL": "test-chat-model",
        }
        self.all_values = {**self.embedding, **self.vlm}

    def invoke(self, values=None, args=()):
        output = io.StringIO()
        with mock.patch.dict(os.environ, {"ROOT_API_KEY": self.root, **(values or {})}, clear=True), \
             mock.patch.object(sys, "argv", ["init-config.py", *args]), \
             mock.patch.object(self.module.os, "execv") as entrypoint, \
             contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            code = 0
            try:
                self.module.main()
            except SystemExit as exc:
                code = exc.code
        text = output.getvalue()
        for key in (self.root, self.embedding_key, self.vlm_key):
            self.assertNotIn(key, text)
        return code, text, entrypoint

    def load(self):
        return json.loads(self.path.read_text())

    def assert_rejected(self, values):
        code, _, entrypoint = self.invoke(values)
        self.assertEqual(code, 1)
        self.assertFalse(self.path.exists())
        entrypoint.assert_not_called()
        self.assertEqual(list(self.path.parent.glob(".ov.conf.init-*")), [])

    def test_two_independent_services_and_keys(self):
        code, _, entrypoint = self.invoke(self.all_values)
        self.assertEqual(code, 0)
        cfg = self.load()
        emb, vlm = cfg["embedding"]["dense"], cfg["vlm"]
        self.assertEqual(emb["api_base"], self.embedding["EMBEDDING_API_BASE"])
        self.assertEqual(vlm["api_base"], self.vlm["VLM_API_BASE"])
        self.assertEqual(emb["api_key"], self.embedding_key)
        self.assertEqual(vlm["api_key"], self.vlm_key)
        self.assertEqual(emb["dimension"], 1024)
        self.assertEqual(cfg["storage"]["workspace"], "./data")
        self.assertEqual(cfg["server"]["root_api_key"], self.root)
        entrypoint.assert_called_once_with(self.module.ENTRYPOINT, [self.module.ENTRYPOINT])

    def test_same_service_and_key_are_explicitly_supported(self):
        values = {**self.all_values,
                  "VLM_API_BASE": self.embedding["EMBEDDING_API_BASE"],
                  "VLM_API_KEY": self.embedding_key}
        self.assertEqual(self.invoke(values)[0], 0)
        cfg = self.load()
        self.assertEqual(cfg["embedding"]["dense"]["api_base"], cfg["vlm"]["api_base"])
        self.assertEqual(cfg["embedding"]["dense"]["api_key"], cfg["vlm"]["api_key"])

    def test_embedding_only(self):
        self.assertEqual(self.invoke(self.embedding)[0], 0)
        self.assertIn("embedding", self.load())
        self.assertNotIn("vlm", self.load())

    def test_vlm_only(self):
        self.assertEqual(self.invoke(self.vlm)[0], 0)
        self.assertIn("vlm", self.load())
        self.assertNotIn("embedding", self.load())

    def test_both_groups_empty_create_only_basic_configuration(self):
        code, text, _ = self.invoke()
        self.assertEqual(code, 0)
        self.assertEqual(set(self.load()), {"server", "storage"})
        self.assertIn("local/512", text)
        self.assertNotIn("enable_default_resources", self.load())

    def test_each_partial_group_rejected(self):
        for key, value in self.all_values.items():
            with self.subTest(field=key):
                self.assert_rejected({key: value})
        self.assert_rejected({"EMBEDDING_INPUT": "multimodal"})
        # The fully valid other group must not hide a partial group.
        self.assert_rejected({**self.embedding, "VLM_MODEL": "incomplete"})
        self.assert_rejected({**self.vlm, "EMBEDDING_MODEL": "incomplete"})

    def test_invalid_dimensions_do_not_fall_back_or_write(self):
        for dimension in ("", "0", "-1", "1.5", "invalid", "65537", "1e3", "9" * 5000):
            with self.subTest(dimension_length=len(dimension)):
                self.assert_rejected({**self.embedding, "EMBEDDING_DIMENSION": dimension})

    def test_dimension_boundaries(self):
        for dimension in ("1", "65536"):
            with self.subTest(dimension=dimension):
                self.assertEqual(self.invoke({**self.embedding, "EMBEDDING_DIMENSION": dimension})[0], 0)
                self.assertEqual(self.load()["embedding"]["dense"]["dimension"], int(dimension))
                self.path.unlink()

    def test_provider_values_are_not_echoed(self):
        self.assert_rejected({**self.embedding, "EMBEDDING_PROVIDER": self.embedding_key})
        self.assert_rejected({**self.vlm, "VLM_PROVIDER": self.vlm_key})
        self.assert_rejected({**self.vlm, "VLM_PROVIDER": "azure"})
        self.assert_rejected({**self.embedding, "EMBEDDING_PROVIDER": "vikingdb"})

    def test_invalid_bases_are_not_echoed(self):
        for base in ("not-a-url", "file:///tmp/config", "https://host:0/v1", "https://host:99999/v1",
                     "https://host/v1?key=" + self.embedding_key,
                     "https://host/v1#" + self.embedding_key,
                     "https://user:" + self.embedding_key + "@host/v1"):
            self.assert_rejected({**self.embedding, "EMBEDDING_API_BASE": base})
        self.assert_rejected({**self.vlm, "VLM_API_BASE": "file:///tmp"})

    def test_unauthenticated_compatible_services(self):
        values = {**self.all_values, "EMBEDDING_API_KEY": "", "VLM_API_KEY": ""}
        self.assertEqual(self.invoke(values)[0], 0)
        self.assertNotIn("api_key", self.load()["embedding"]["dense"])
        self.assertEqual(self.load()["vlm"]["api_key"], "no-key")

    def test_empty_key_does_not_inherit_other_group_key(self):
        self.assertEqual(self.invoke({**self.all_values, "VLM_API_KEY": ""})[0], 0)
        self.assertEqual(self.load()["vlm"]["api_key"], "no-key")
        self.assertEqual(self.load()["embedding"]["dense"]["api_key"], self.embedding_key)

    def test_empty_embedding_key_does_not_inherit_vlm_key(self):
        self.assertEqual(self.invoke({**self.all_values, "EMBEDDING_API_KEY": ""})[0], 0)
        self.assertNotIn("api_key", self.load()["embedding"]["dense"])
        self.assertEqual(self.load()["vlm"]["api_key"], self.vlm_key)

    def test_ark_requires_its_own_keys(self):
        self.assert_rejected({**self.embedding, "EMBEDDING_PROVIDER": "volcengine", "EMBEDDING_API_KEY": ""})
        self.assert_rejected({**self.vlm, "VLM_PROVIDER": "volcengine", "VLM_API_KEY": ""})
        values = {**self.all_values, "EMBEDDING_PROVIDER": "volcengine", "VLM_PROVIDER": "volcengine",
                  "EMBEDDING_API_BASE": "https://ark.example.invalid/api/v3",
                  "VLM_API_BASE": "https://ark-chat.example.invalid/api/v3"}
        self.assertEqual(self.invoke(values)[0], 0)
        self.assertEqual(self.load()["embedding"]["dense"]["api_base"], values["EMBEDDING_API_BASE"])
        self.assertEqual(self.load()["vlm"]["api_base"], values["VLM_API_BASE"])

    def test_ollama_uses_separate_openai_compatible_adapters(self):
        values = {**self.all_values, "EMBEDDING_PROVIDER": "ollama", "EMBEDDING_API_KEY": "",
                  "EMBEDDING_API_BASE": "http://host.docker.internal:11434/v1",
                  "VLM_PROVIDER": "openai", "VLM_API_KEY": "",
                  "VLM_API_BASE": "http://other-ollama.example.invalid:11434/v1"}
        self.assertEqual(self.invoke(values)[0], 0)
        cfg = self.load()
        self.assertEqual(cfg["embedding"]["dense"]["provider"], "ollama")
        self.assertEqual(cfg["vlm"]["provider"], "openai")
        self.assertNotEqual(cfg["embedding"]["dense"]["api_base"], cfg["vlm"]["api_base"])
        self.assertEqual(cfg["vlm"]["api_key"], "no-key")
        self.path.unlink()
        self.assert_rejected({**values, "EMBEDDING_API_BASE": "http://host:11434"})
        self.assert_rejected({**values, "VLM_PROVIDER": "ollama"})

    def test_input_capability(self):
        self.assert_rejected({**self.embedding, "EMBEDDING_INPUT": "unknown"})
        self.assert_rejected({**self.embedding, "EMBEDDING_PROVIDER": "ollama", "EMBEDDING_INPUT": "multimodal"})
        for provider in ("openai", "volcengine"):
            self.assertEqual(self.invoke({**self.embedding, "EMBEDDING_PROVIDER": provider,
                                          "EMBEDDING_INPUT": "multimodal"})[0], 0)
            self.assertEqual(self.load()["embedding"]["dense"]["input"], "multimodal")
            self.path.unlink()

    def test_existing_file_bytes_mode_and_mtime_preserved(self):
        self.path.parent.mkdir(parents=True)
        original = b'\xef\xbb\xbf{ "server": {"root_api_key":"existing-test-value"}, "storage":{"workspace":"/private"}}\r\n'
        self.path.write_bytes(original)
        self.path.chmod(0o640)
        before = self.path.stat()
        code, _, entrypoint = self.invoke({"ROOT_API_KEY": "", "EMBEDDING_PROVIDER": "invalid",
                                          "EMBEDDING_DIMENSION": "bad", "MODEL_API_KEY": self.embedding_key})
        self.assertEqual(code, 0)
        self.assertEqual(self.path.read_bytes(), original)
        after = self.path.stat()
        self.assertEqual((after.st_mode, after.st_mtime_ns, after.st_ino),
                         (before.st_mode, before.st_mtime_ns, before.st_ino))
        entrypoint.assert_called_once()

    def test_dangling_symlink_is_never_overwritten(self):
        self.path.parent.mkdir(parents=True)
        self.path.symlink_to("missing-config")
        self.assertEqual(self.invoke({"ROOT_API_KEY": ""})[0], 0)
        self.assertTrue(self.path.is_symlink())
        self.assertEqual(os.readlink(self.path), "missing-config")

    def test_healthcheck_does_not_generate_or_validate(self):
        code, _, entrypoint = self.invoke({"ROOT_API_KEY": "", "EMBEDDING_PROVIDER": "bad"}, ("--healthcheck",))
        self.assertEqual(code, 0)
        self.assertFalse(self.path.exists())
        entrypoint.assert_called_once_with(self.module.ENTRYPOINT, [self.module.ENTRYPOINT, "--healthcheck"])

    def test_legacy_without_file_gets_migration_error(self):
        for key in self.module.LEGACY_FIELDS:
            values = {key: "old-test-value", "EMBEDDING_MODEL": "legacy-model", "EMBEDDING_DIMENSION": "512"}
            code, text, entrypoint = self.invoke(values)
            self.assertEqual(code, 1)
            self.assertIn("migrate", text)
            self.assertFalse(self.path.exists())
            entrypoint.assert_not_called()

    def test_new_groups_take_priority_over_legacy_without_key_or_base_leak(self):
        values = {**self.all_values, "MODEL_PRESET": "openai", "MODEL_API_KEY": secrets.token_hex(20),
                  "MODEL_API_BASE": "https://legacy.example.invalid/v1", "VLM_API_KEY": ""}
        code, text, _ = self.invoke(values)
        self.assertEqual(code, 0)
        cfg = self.load()
        self.assertEqual(cfg["vlm"]["api_key"], "no-key")
        self.assertEqual(cfg["vlm"]["api_base"], self.vlm["VLM_API_BASE"])
        self.assertNotIn(values["MODEL_API_KEY"], text)
        self.assertNotIn(values["MODEL_API_KEY"], self.path.read_text())
        self.assertNotIn(values["MODEL_API_BASE"], self.path.read_text())

    def test_missing_or_weak_management_key(self):
        for key in ("", "short"):
            self.assert_rejected({**self.all_values, "ROOT_API_KEY": key})

    def test_new_file_is_private_even_with_permissive_umask(self):
        old_mask = os.umask(0)
        try:
            self.assertEqual(self.invoke(self.all_values)[0], 0)
        finally:
            os.umask(old_mask)
        self.assertEqual(stat.S_IMODE(self.path.stat().st_mode), 0o600)
        self.assertEqual(list(self.path.parent.glob(".ov.conf.init-*")), [])

    def test_serialization_failure_leaves_no_partial_file(self):
        def broken_write(config, stream, **kwargs):
            stream.write('{"partial":')
            raise OSError("injected failure")
        with mock.patch.object(self.module.json, "dump", side_effect=broken_write):
            self.assert_rejected(self.all_values)

    def test_flush_failure_leaves_no_partial_file(self):
        with mock.patch.object(self.module.os, "fsync", side_effect=OSError("injected failure")):
            self.assert_rejected(self.all_values)

    def test_publish_failure_leaves_no_partial_file(self):
        with mock.patch.object(self.module.os, "link", side_effect=PermissionError("injected failure")):
            self.assert_rejected(self.all_values)

    def test_concurrent_configuration_writer_wins(self):
        original = b'{"external_writer":true}\n'
        real_link = os.link
        def raced_link(source, target):
            # The file is fully serialized and private before it becomes visible.
            self.assertEqual(stat.S_IMODE(Path(source).stat().st_mode), 0o600)
            json.loads(Path(source).read_text())
            Path(target).write_bytes(original)
            Path(target).chmod(0o640)
            return real_link(source, target)
        with mock.patch.object(self.module.os, "link", side_effect=raced_link):
            self.assertEqual(self.invoke(self.all_values)[0], 0)
        self.assertEqual(self.path.read_bytes(), original)
        self.assertEqual(stat.S_IMODE(self.path.stat().st_mode), 0o640)
        self.assertEqual(list(self.path.parent.glob(".ov.conf.init-*")), [])

    def test_entrypoint_failure_does_not_disclose_values(self):
        with mock.patch.object(self.module.os, "execv", side_effect=OSError(self.embedding_key)), \
             contextlib.redirect_stdout(io.StringIO()) as output:
            with self.assertRaises(SystemExit):
                self.module.hand_over()
        self.assertNotIn(self.embedding_key, output.getvalue())


class PinnedTests(GeneratorCases, unittest.TestCase):
    version = "0.5.6"


class LatestTests(GeneratorCases, unittest.TestCase):
    version = "latest"


if __name__ == "__main__":
    unittest.main()
