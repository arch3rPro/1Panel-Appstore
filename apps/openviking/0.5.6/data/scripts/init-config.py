#!/usr/bin/env python3
"""Create ov.conf once from independent model groups, then use upstream's entrypoint.

Only the Python standard library is needed. Existing files are never rewritten.
"""
import json
import os
import re
import sys
import tempfile
from urllib.parse import urlsplit

ENTRYPOINT = "/usr/local/bin/openviking-entrypoint"
CONFIG_PATH = os.environ.get("OPENVIKING_CONFIG_FILE", "/app/.openviking/ov.conf")
# Package limit, not a promise that every model/backend accepts this dimension.
MAX_DIMENSION = 65536
EMBEDDING_INPUTS = {
    "openai": {"text", "multimodal"},
    "volcengine": {"text", "multimodal"},
    "ollama": {"text"},
}
VLM_PROVIDERS = {"openai", "volcengine"}
LEGACY_FIELDS = ("MODEL_PRESET", "MODEL_API_BASE", "MODEL_API_KEY")


class ConfigurationError(ValueError):
    """A safe error containing field names/instructions, never supplied values."""


def log(message):
    print(f"[ov-init] {message}", flush=True)


def env(name):
    return (os.environ.get(name) or "").strip()


def hand_over():
    try:
        os.execv(ENTRYPOINT, [ENTRYPOINT, *sys.argv[1:]])
    except OSError as exc:
        log(f"cannot start the official entrypoint ({type(exc).__name__})")
        raise SystemExit(1) from None


def require(values, *names):
    missing = [name for name in names if not values[name]]
    if missing:
        raise ConfigurationError("missing fields: " + ", ".join(missing))


def api_base(value, field):
    try:
        parsed = urlsplit(value)
        valid = (
            parsed.scheme in {"http", "https"}
            and parsed.hostname
            and parsed.port != 0
            and parsed.username is None
            and parsed.password is None
            and not parsed.query
            and not parsed.fragment
            and not any(char.isspace() for char in value)
        )
    except ValueError:
        valid = False
    if not valid:
        raise ConfigurationError(
            field + " must be an HTTP(S) API base without URL credentials, query or fragment"
        )
    # Keep the caller's protocol path; do not append /v1 to arbitrary providers.
    return value


def model_group(prefix, providers, extra_fields=(), required_extra=()):
    """Read one independent form group, keeping field-level input errors local."""
    fields = ("PROVIDER", "API_BASE", "API_KEY", "MODEL", *extra_fields)
    values = {f"{prefix}_{field}": env(f"{prefix}_{field}") for field in fields}
    if not any(values.values()):
        return None
    require(values, *(f"{prefix}_{field}" for field in ("PROVIDER", "API_BASE", "MODEL", *required_extra)))
    provider = values[f"{prefix}_PROVIDER"].lower()
    if provider not in providers:
        raise ConfigurationError(f"{prefix}_PROVIDER must be one of: " + ", ".join(sorted(providers)))
    if provider == "volcengine":
        require(values, f"{prefix}_API_KEY")
    config = {
        "provider": provider,
        "api_base": api_base(values[f"{prefix}_API_BASE"], f"{prefix}_API_BASE"),
        "model": values[f"{prefix}_MODEL"],
    }
    if values[f"{prefix}_API_KEY"]:
        config["api_key"] = values[f"{prefix}_API_KEY"]
    config.update((field.lower(), values[f"{prefix}_{field}"]) for field in extra_fields)
    return config


def embedding_config():
    config = model_group("EMBEDDING", EMBEDDING_INPUTS, ("DIMENSION", "INPUT"), ("DIMENSION",))
    if config is None:
        return None
    provider = config["provider"]
    if provider == "ollama" and not urlsplit(config["api_base"]).path.rstrip("/").endswith("/v1"):
        raise ConfigurationError("EMBEDDING_API_BASE for ollama must end in /v1 (OpenAI-compatible embeddings)")
    raw_dimension = config["dimension"]
    try:
        if not re.fullmatch(r"[0-9]+", raw_dimension):
            raise ValueError
        dimension = int(raw_dimension)
    except ValueError:
        raise ConfigurationError("EMBEDDING_DIMENSION must be an explicit positive integer") from None
    if not 1 <= dimension <= MAX_DIMENSION:
        raise ConfigurationError("EMBEDDING_DIMENSION must be in the package range 1..65536")
    input_type = config["input"] or "text"
    if input_type not in EMBEDDING_INPUTS[provider]:
        raise ConfigurationError("EMBEDDING_INPUT is unsupported by the selected provider; ollama supports text only")
    config.update(dimension=dimension, input=input_type)
    # v0.5.6 supplies the Embedding no-key placeholder inside its own adapter.
    return {"dense": config}


def vlm_config():
    config = model_group("VLM", VLM_PROVIDERS)
    if config is not None and "api_key" not in config:
        # v0.5.6 VLMConfig and the OpenAI SDK require a non-empty placeholder.
        config["api_key"] = "no-key"
        log("VLM_API_KEY is empty; using an OpenAI-adapter placeholder for an unauthenticated service")
    return config


def create_config(config):
    """Publish a complete 0600 file atomically, without replacing a racing writer."""
    path = os.path.abspath(CONFIG_PATH)
    parent = os.path.dirname(path)
    os.makedirs(parent, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".ov.conf.init-", dir=parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            os.fchmod(stream.fileno(), 0o600)
            json.dump(config, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        try:
            # Same-filesystem link publishes the finished file only if absent.
            # replace/rename could overwrite a file created after our first check.
            os.link(temporary, path)
        except FileExistsError:
            log("using existing configuration; install parameters do not overwrite it")
            return False
        return True
    finally:
        os.unlink(temporary)


def main():
    if "--healthcheck" in sys.argv[1:]:
        return hand_over()
    if os.path.lexists(CONFIG_PATH):
        log("using existing configuration; install parameters do not overwrite it")
        return hand_over()
    try:
        root_key = env("ROOT_API_KEY")
        if len(root_key) < 32:
            raise ConfigurationError("ROOT_API_KEY must contain at least 32 characters; generate a private management key")
        legacy = any(env(name) for name in LEGACY_FIELDS)
        if legacy and not (env("EMBEDDING_PROVIDER") or env("VLM_PROVIDER")):
            raise ConfigurationError(
                "legacy MODEL_* parameters found without ov.conf; migrate to the separate "
                "EMBEDDING_* and VLM_* fields or restore your existing ov.conf; nothing was written"
            )
        if legacy:
            log("legacy MODEL_* parameters ignored; only the independent model groups are used")
        embedding = embedding_config()
        vlm = vlm_config()
        config = {
            "server": {"host": "0.0.0.0", "port": 1933, "root_api_key": root_key, "cors_origins": ["*"]},
            "storage": {"workspace": "./data", "agfs": {"backend": "local"}, "vectordb": {"backend": "local"}},
        }
        if embedding is not None:
            config["embedding"] = embedding
        else:
            log("Embedding group omitted: upstream defaults to local/512; full startup and model use are not validated")
        if vlm is not None:
            config["vlm"] = vlm
        else:
            log("VLM group omitted: summary/chat/vision functions need a suitable model configuration")
        if create_config(config):
            log("created configuration (mode 600); later changes belong in ov.conf or Studio")
    except ConfigurationError as exc:
        log(str(exc))
        raise SystemExit(1) from None
    except (OSError, ValueError, TypeError) as exc:
        # Exception text can contain user input or paths. Never print it.
        log(f"could not create configuration ({type(exc).__name__}); check filesystem access")
        raise SystemExit(1) from None
    return hand_over()


if __name__ == "__main__":
    main()
