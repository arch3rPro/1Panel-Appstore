# OpenViking

OpenViking is an open-source, self-evolving **context database for AI agents** from Volcengine. It unifies agent memory, knowledge RAG (resources) and skills in one `viking://` virtual filesystem, so agents can `ls`, `tree`, `read`, `write`, `grep` and `find` everything they know. Every directory carries generated summaries (L0/L1) so agents can judge relevance before reading full content (L2).

This app packages the official image `ghcr.io/volcengine/openviking` and includes:

- **OpenViking HTTP service** (default port `1933`)
- **Web Studio console** (`http://<IP>:1933/studio`)
- **VikingBot** (disabled by default; see below)

## Versions and Deployment

- Pinned version: `0.5.2.1`, using `ghcr.io/volcengine/openviking:v0.5.2.1`; the existing `0.5.2` package is retained.
- Rolling version: `latest`, using the official `:latest` tag. Back up before upgrading.
- The official `v0.5.2.1` image manifest has been verified for `linux/amd64` and `linux/arm64`.
- Uses embedded local filesystem and vector storage; no separate Redis, vector database or Caddy is required. Use 1Panel for HTTPS reverse proxying.
- The logo is from the upstream repository's `docs/images/ov-logo-square.png`.

## Features

- One filesystem for knowledge, memory and skills, each with a `viking://` URI.
- Directory-scoped semantic search, instead of scanning a flat vector pool.
- Three context layers: L0 abstract, L1 overview, L2 full content.
- Sessions become readable Markdown with extracted memories.
- Accounts and user isolation, opt-in resource ACLs, API-key authentication.
- Python / Go / TypeScript SDKs and a full HTTP API.

## Usage

1. Pick a **model preset** (OpenAI by default) and paste its **API key**, or leave everything empty and configure later. Then open `http://<your-ip>:<configured-http-port>/studio` (default port: `1933`).
2. In Web Studio settings, enter the **Root API Key** generated during installation.
3. Create an account and a user on the **Users** page. The user's **User API Key** is shown immediately. Use User/Admin keys for data access; the root key is for administration only.
4. You can also connect with the CLI, SDKs or `curl`:

   ```bash
   curl http://<your-ip>:1933/health
   curl "http://<your-ip>:1933/api/v1/fs/ls?uri=viking://" -H "X-API-Key: <User API Key>"
   ```

## Model Configuration (important)

OpenViking needs an **embedding model** and a **VLM** to ingest and retrieve content. The official Docker image does **not** bundle local embedding dependencies, so models must come from an API.

The install form asks for two things; the rest is derived from the preset:

| Field | Required | Notes |
| --- | --- | --- |
| HTTP Port | yes | `1933` by default; usually unchanged |
| Root API Key | yes | Randomly generated; just keep it |
| Model Preset | yes | Dropdown, defaults to OpenAI; no model names to type |
| Model API Key | no | **The only field you normally type into** |
| Advanced overrides (base URL / embedding model / dimension / VLM) | no | Only for proxies or different models |

What each preset resolves to:

| Preset | provider | API base | Embedding (dimension, input) | VLM |
| --- | --- | --- | --- | --- |
| OpenAI | `openai` | `https://api.openai.com/v1` | `text-embedding-3-small` (1536, `text`) | `gpt-4o` |
| Volcengine Ark | `volcengine` | `https://ark.cn-beijing.volces.com/api/v3` | `doubao-embedding-vision-251215` (1024, `multimodal`) | `doubao-seed-2-0-lite-260428` |
| Ollama | `ollama` | `http://host.docker.internal:11434/v1` | `nomic-embed-text` (768, `text`) | `qwen2.5:7b` |
| Custom | `openai` | fill the base-URL override | fill model and dimension overrides | fill the VLM override |

Key points:

- **Empty API key = install first, configure later.** The server starts and reports healthy (`/health` only checks the process), while `/ready` shows `embedding: not_initialized` and ingest/retrieval fail until models are configured. Afterwards use Web Studio **Settings → Server configuration** to enter models and press **Save and restart**, or switch to **File mode** to edit the whole `ov.conf`. This is upstream's supported path; no reinstall needed.
- **Ollama needs no key at all**; the preset supplies a placeholder. Ollama must listen on a container-reachable address and allow the Docker subnet; do not expose it publicly.
- **Proxy or a different model**: keep the preset and fill only the relevant advanced override. Overrides win over the preset.
- **Custom (OpenAI-compatible)** needs base URL, embedding model, dimension and VLM together; if one is missing the server starts without models and the container log (`[ov-init]`) names what is missing.
- The startup helper writes only the required `server` and `storage` sections, adding models only when the values are complete. The generated `ov.conf` is mode `600` and is **never overwritten when it already exists** (Studio edits survive reinstalls).
- Third-party model APIs may incur charges. Changing the embedding model or dimension makes existing vector collections incompatible and requires reindexing.

## Data Directory

- `./data` is mounted at `/app/.openviking` inside the container:
  - `ov.conf` — server configuration
  - `ovcli.conf` — CLI configuration
  - `data/` — workspace (accounts, resources, vector data, ...)

Stop the app and back up the entire `./data` directory before upgrading, not just `ov.conf`. Multiple instances must not share a workspace with the local vector backend.

## Changing Configuration

`ov.conf` is generated from the preset only on first start (when it does not exist), written with mode `600` and persisted at `./data/ov.conf`. **Changing the form later does not regenerate it.** Any of these works:

1. **Web Studio (recommended)**: log in as ROOT, open Settings → Server configuration, edit `embedding` / `vlm` in form mode, or switch to File mode to edit the whole `ov.conf` (port, `root_api_key`, `storage`, ...) and press Save and restart.
2. Edit `./data/ov.conf` on the host, then restart the container.
3. Re-run the wizard inside the container:

```bash
docker exec -it <container-name> openviking-server init
```

## Notes

- **Enabling VikingBot**: disabled by default. In API-key mode the Bot needs a User/Admin key (a root key cannot be used). Configure `bot.ov_server.api_key` in `./data/ov.conf`, set `OPENVIKING_WITH_BOT` to `1` in the compose file, then restart.
- **Mainland China mirror**: if `ghcr.io` is slow, switch to the commented Volcengine image `openviking-cn-beijing.cr.volces.com/volcengine/openviking`.
- **Public access / HTTPS**: proxy to the configured HTTP port using 1Panel and set `server.public_base_url` in `ov.conf` to the external HTTPS URL. Restrict direct port access, protect root and user keys, and narrow `server.cors_origins` from `*` to your actual origins where appropriate.
- **Health checks**: `/health` only checks process liveness, not model credentials. Use `/ready` and `openviking-server doctor` to check readiness and model access.

## Port

- `1933` — HTTP service and Web Studio (configurable during installation).

## Links

- Website: <https://openviking.ai/>
- Docs: <https://docs.openviking.ai/>
- GitHub: <https://github.com/volcengine/OpenViking>
- Deployment guide: <https://docs.openviking.ai/en/guides/03-deployment>
- Configuration guide: <https://docs.openviking.ai/en/guides/01-configuration>
