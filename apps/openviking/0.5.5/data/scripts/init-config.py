#!/usr/bin/env python3
"""Generate the first-start ov.conf from a few preset values, then hand over.

Upstream writes ov.conf only when it is absent, so this runs once and never
overwrites a configuration edited in Studio or in data/ov.conf.
"""
import json
import os
import sys

ENTRYPOINT = "/usr/local/bin/openviking-entrypoint"
CONFIG_PATH = os.environ.get("OPENVIKING_CONFIG_FILE", "/app/.openviking/ov.conf")

# provider, base URL, embedding model, dimension, input type, VLM model
PRESETS = {
    "openai": (
        "openai",
        "https://api.openai.com/v1",
        "text-embedding-3-small",
        1536,
        "text",
        "gpt-4o",
    ),
    "volcengine": (
        "volcengine",
        "https://ark.cn-beijing.volces.com/api/v3",
        "doubao-embedding-vision-251215",
        1024,
        "multimodal",
        "doubao-seed-2-0-lite-260428",
    ),
    "ollama": (
        "ollama",
        "http://host.docker.internal:11434/v1",
        "nomic-embed-text",
        768,
        "text",
        "qwen2.5:7b",
    ),
}
CUSTOM_PROVIDER = "openai"


def log(message):
    print(f"[ov-init] {message}", flush=True)


def hand_over():
    """Replace this process with the official entrypoint; never returns."""
    try:
        os.execv(ENTRYPOINT, [ENTRYPOINT, *sys.argv[1:]])
    except OSError as exc:
        # Never fall through to writing config: an existing ov.conf must survive.
        log(f"cannot start {ENTRYPOINT}: {exc}")
        os._exit(1)


def env(name):
    return (os.environ.get(name) or "").strip()


def resolve_models():
    """Return (embedding, vlm) or (None, None) when models cannot be resolved."""
    preset = env("MODEL_PRESET").lower() or "openai"
    base_override = env("MODEL_API_BASE")
    model_override = env("EMBEDDING_MODEL")
    vlm_override = env("VLM_MODEL")
    dimension_override = env("EMBEDDING_DIMENSION")
    api_key = env("MODEL_API_KEY")

    if preset in PRESETS:
        provider, base, model, dimension, embedding_input, vlm = PRESETS[preset]
    elif preset == "custom":
        provider, base, model, dimension, embedding_input, vlm = (
            CUSTOM_PROVIDER, "", "", 0, "text", "",
        )
    else:
        log(f"unknown MODEL_PRESET={preset!r}; known: {', '.join(PRESETS)}, custom")
        return None, None

    # Explicit overrides win over the preset, so one preset can be retargeted
    # (for example a proxy URL or a different embedding model) without extra fields.
    base = base_override or base
    model = model_override or model
    vlm = vlm_override or vlm
    if dimension_override:
        try:
            dimension = int(dimension_override)
        except ValueError:
            log(f"ignoring EMBEDDING_DIMENSION={dimension_override!r}: not an integer")
    if preset == "ollama" and not api_key:
        # Ollama ignores the key, but upstream still expects a non-empty value.
        api_key = "ollama"

    missing = [
        name
        for name, value in (
            ("MODEL_API_BASE", base),
            ("MODEL_API_KEY", api_key),
            ("EMBEDDING_MODEL", model),
            ("EMBEDDING_DIMENSION", dimension),
            ("VLM_MODEL", vlm),
        )
        if not value
    ]
    if missing:
        if preset == "custom":
            log("preset custom needs " + ", ".join(missing) + "; starting without models")
        else:
            log("no model API key yet; starting without models for later setup in Studio")
        return None, None
    if not 0 < dimension <= 65536:
        log(f"ignoring out-of-range embedding dimension {dimension}; starting without models")
        return None, None

    embedding = {
        "dense": {
            "provider": provider,
            "model": model,
            "api_base": base,
            "api_key": api_key,
            "dimension": dimension,
            "input": embedding_input,
        }
    }
    vlm_config = {
        "provider": provider,
        "model": vlm,
        "api_base": base,
        "api_key": api_key,
        "thinking": False,
        "temperature": 0.0,
        "max_retries": 2,
    }
    log(f"models from preset={preset}: embedding={model} ({dimension}d), vlm={vlm}")
    return embedding, vlm_config


def main():
    # Never touch an existing file: it may hold Studio edits or a newer format.
    if "--healthcheck" in sys.argv[1:] or os.path.exists(CONFIG_PATH):
        return hand_over()

    root_api_key = env("ROOT_API_KEY")
    if not root_api_key:
        # Binding 0.0.0.0 in dev mode makes upstream refuse to start, so fail
        # before the container looks healthy-but-broken.
        log("ROOT_API_KEY is required when the server listens on 0.0.0.0")
        sys.exit(1)

    config = {
        "server": {
            "host": "0.0.0.0",
            "port": 1933,
            "root_api_key": root_api_key,
            "cors_origins": ["*"],
        },
        "storage": {
            "workspace": "./data",
            "agfs": {"backend": "local"},
            "vectordb": {"backend": "local"},
        },
    }
    embedding, vlm = resolve_models()
    if embedding:
        config["embedding"] = embedding
        config["vlm"] = vlm

    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(CONFIG_PATH), "data"), exist_ok=True)
    with open(CONFIG_PATH, "w", encoding="utf-8") as handle:
        json.dump(config, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.chmod(CONFIG_PATH, 0o600)
    log(f"wrote {CONFIG_PATH}")
    if not embedding:
        log("configure models later at /studio > 设置 > 服务端配置, or rerun after removing ov.conf")
    return hand_over()


if __name__ == "__main__":
    main()
