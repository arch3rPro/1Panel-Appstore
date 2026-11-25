# OpenViking

OpenViking is Volcengine's open-source self-evolving context database: agent memory, knowledge and skills all live in one `viking://` filesystem you can browse, search and manage like files.

Before installing, prepare one thing: a working model API key (OpenAI, Volcengine Ark, or your own OpenAI-compatible endpoint), or an Ollama instance with the models pulled. The key is **required** — the server will install, start and look healthy without it, but every ingest and retrieval will fail. Section 4 explains why.

This app packages the official image `ghcr.io/volcengine/openviking`, pinned to `0.5.6` (verified for `linux/amd64` and `linux/arm64`); a `latest` channel is also available — back up before using it. It includes the HTTP service (default port `1933`), the Web Studio console, and VikingBot (disabled by default).

## 1. Install

The form has eight fields: the first four are what you normally touch, the last four are only needed when the preset is Custom.

| Field | What to enter |
| --- | --- |
| HTTP Port | `1933` by default; usually leave it |
| Root API Key | Randomly generated — **save it now**; it is your Studio login password |
| Model Preset | One of OpenAI (compatible proxies included), Volcengine Ark, Ollama, Custom (OpenAI-compatible). Defaults to OpenAI |
| Model API Key | The key for that preset. **Required for OpenAI / Ark / Custom; leave empty for Ollama** |
| Advanced - override API base URL | Custom preset only |
| Advanced - override embedding model | Custom preset only |
| Advanced - override embedding dimension | Custom preset only |
| Advanced - override VLM model | Custom preset only |

With the first three presets there are no model names, base URLs or dimensions to fill in — the preset covers them:

| Preset | Chat and vision model | Embedding model (dimension) |
| --- | --- | --- |
| OpenAI | `gpt-4o` | `text-embedding-3-small` (1536) |
| Volcengine Ark | `doubao-seed-2-0-lite-260428` | `doubao-embedding-vision-251215` (1024) |
| Ollama | `qwen2.5:7b` | `nomic-embed-text` (768) |

### Using a custom model endpoint

To point OpenViking at your own OpenAI-compatible service (a self-hosted gateway, One-API, another vendor's compatible endpoint), choose the Custom preset and fill all five: the model API key (above), Advanced - override API base URL, Advanced - override embedding model, Advanced - override embedding dimension, and Advanced - override VLM model.

The base URL must include `/v1`, for example `https://your-proxy.example.com/v1`. The dimension must match what that embedding model actually outputs — an empty or wrong value leaves the server without models. If any value is missing, the server starts with no models and the container log (`[ov-init]`) names what is missing.

### Using local Ollama

1. Install Ollama on the host and pull two models: `ollama pull nomic-embed-text` and `ollama pull qwen2.5:7b`.
2. Ollama listens on `127.0.0.1` by default, which containers cannot reach. Start it with `OLLAMA_HOST=0.0.0.0` and allow the Docker subnet.
3. Choose the Ollama preset and leave the model API key empty. The container already maps `host.docker.internal` to the host, and the preset points at port `11434`.
4. To use different Ollama models, either pick the Custom preset with the base URL set to `http://host.docker.internal:11434/v1` and your own embedding/VLM models, or edit `ov.conf` in Studio's file mode after installing (section 4).

Do not expose the Ollama port to the internet.

## 2. Three steps after installing

1. Open `http://<your-ip>:<configured-http-port>/studio`, log in as `root` with the **root API key** from the app's parameter page.
2. On the **Users** page, create an account and a user. The user's **User API Key** is shown right away — copy it.
3. Use that User key for everything (CLI, SDKs, `curl`). The root key is for administration only; calling data APIs with it returns `PERMISSION_DENIED`.

```bash
curl http://<your-ip>:1933/health
curl "http://<your-ip>:1933/api/v1/fs/ls?uri=viking://" -H "X-API-Key: <User API Key>"
```

## 3. How to tell it actually works

Three checks, each covering only its own part:

| Endpoint | What it checks | How much to trust it |
| --- | --- | --- |
| `GET /health` | The process is alive | Only that it has not crashed. Says nothing about models |
| `GET /ready` | Component readiness | **The model part is meaningless — it always shows ok.** It only checks whether an `embedding` section exists in the config, never calls the model. A wrong key or a failed local embedder still shows all green. The only thing it catches is an unreachable Ollama (`unreachable`) |
| `openviking-server doctor` | Actually reaches the models | The only way to find out a model is broken. **Its vision (VLM) line is not a real probe either** — PASS there means little |

So run doctor once after installing:

```bash
docker exec -it <container-name> openviking-server doctor
```

Check one line: `Embedding` must be PASS. If it says `FAIL` / `probe failed`, recheck the key, the API base, or whether Ollama is reachable.

## 4. Troubleshooting

**Changing install parameters does nothing.**
`ov.conf` is generated once, on first start; form edits never touch it again. To make the form apply again, back up `./data/ov.conf`, delete it, and restart the container — this discards everything you configured in Studio since.

**Changed the embedding model and old data is no longer found.**
Vectors are tied to the model (and its dimension). Switching models makes existing collections incompatible, so re-import or rebuild the index.

**ghcr.io is slow or unreachable.**
Enable the commented image line in `docker-compose.yml` (`openviking-cn-beijing.cr.volces.com/volcengine/openviking:v0.5.6`) and drop the ghcr one.

**Need a different API base, embedding model or vision model.**
The Custom preset covers most cases: enter the base URL, embedding model, its dimension and the VLM model, with the key in the same field above. Deeper control (`thinking`, `temperature`, `cors_origins`, `public_base_url` and similar) still means Studio → Settings → Server configuration → **file mode**, editing `ov.conf` directly and pressing Save and restart. Editing `./data/ov.conf` on the host and restarting the container works the same way. Use the in-container wizard (`docker exec -it <container-name> openviking-server init`) only when you want to regenerate from scratch.

**Enabling VikingBot.**
Disabled by default. In API-key mode the Bot needs a User/Admin key (a root key does not work). Put the User key in `bot.ov_server.api_key` in `./data/ov.conf`, set `OPENVIKING_WITH_BOT` to `1` in the compose file, and restart.

**Public access and HTTPS.**
Proxy to the configured port with 1Panel and set `server.public_base_url` in `ov.conf` to the external HTTPS URL. Narrow `server.cors_origins` from `*` to your own origins where appropriate.

## 5. Data directory and upgrades

`./data` is mounted at `/app/.openviking` inside the container:

- `ov.conf` — server configuration (generated on first start, mode `600`, never overwritten once it exists)
- `ovcli.conf` — CLI configuration
- `data/` — workspace: accounts, resources, vector data

To upgrade, stop the app, back up the entire `./data` directory (not just `ov.conf`), then upgrade and start. Multiple instances must not share one workspace with the local vector backend. The logo comes from the upstream repo's `docs/images/ov-logo-square.png`.

The container always listens on `1933`; change the host port in the app parameters.

## 6. What it does

- One filesystem for knowledge, memory and skills, each reachable by `viking://` path.
- Directory-scoped semantic search, so you can look inside one project or memory subtree instead of scanning everything.
- Three context layers: L0 abstract, L1 overview, L2 full content — judge relevance before reading.
- Sessions become readable Markdown with extracted memories.
- Multiple accounts with user isolation, opt-in resource ACLs, API-key authentication.
- Python / Go / TypeScript SDKs and a complete HTTP API.

## Links

- Website: <https://openviking.ai/>
- Docs: <https://docs.openviking.ai/>
- GitHub: <https://github.com/volcengine/OpenViking>
- Deployment guide: <https://docs.openviking.ai/en/guides/03-deployment>
- Configuration guide: <https://docs.openviking.ai/en/guides/01-configuration>
