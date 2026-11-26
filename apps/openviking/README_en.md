# OpenViking

OpenViking is Volcengine's open-source context database for agent knowledge, memory and skills, organized as a `viking://` filesystem. This package uses the official `ghcr.io/volcengine/openviking` image and includes the HTTP service, Web Studio and VikingBot (disabled by default). The pinned version is `0.5.6`; `latest` follows upstream changes. Configuration behavior was checked against v0.5.6.

## Installation parameters

Embedding and VLM have separate provider, API base, key and model fields. They can use different vendors, or explicitly use the same base and key. Empty values never inherit from the other group. There is no shared model preset.

Choose your own system management key, or generate a random value on your machine and enter it in the form:

```bash
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

| Field | Purpose and conditions |
| --- | --- |
| HTTP Host Port | Host access port, default `1933`; the container port stays `1933`. The mapping remains editable after installation |
| System Management API Key (Root) | Required for managing service configuration, accounts and users |
| Embedding Provider | `openai` (OpenAI-compatible), `volcengine` (Ark) or `ollama` (compatible embedding API); Configure later leaves it unset |
| Embedding API Base | Enter a custom service base; leave blank for the OpenAI/Ark official endpoint or Ollama on the host at `11434/v1` |
| Embedding Service API Key | Only for this embedding service; required for Ark, optional for unauthenticated compatible services or Ollama |
| Embedding Model | Actual model name or endpoint ID; required for this group |
| Embedding Output Dimension | Actual model output dimension as a positive integer; required for this group |
| Embedding Input Type | Empty means `text` when configured. `multimodal` requires both adapter and model support; Ollama embeddings are text only |
| VLM Provider (Summary / Chat / Vision) | `openai` (OpenAI-compatible) or `volcengine` (Ark); Configure later leaves it unset |
| VLM API Base | Enter a custom service base, or leave blank for the OpenAI/Ark official endpoint |
| VLM Service API Key | Independent of Embedding; required for Ark, optional for an unauthenticated compatible service |
| VLM Chat / Vision Model | Actual model name or endpoint ID; required for this group. Text summaries do not require vision; verify vision or tool-call capability for the intended task |

All parameters except the port are used only to **create** `./data/ov.conf` and are marked noneditable after installation. Once a file exists, the script preserves its bytes, permissions, keys, storage settings and all other configuration. Make subsequent changes in Studio's server configuration file mode or the actual `./data/ov.conf`, then restart. Changing installation environment variables does not overwrite an existing file.

For Embedding, provide the provider, model and actual output dimension. For VLM, provide the provider and model. Official OpenAI and Ark services require their respective API keys and can use an empty API base. For a self-hosted service, enter its base and any required credentials.

### Two custom OpenAI-compatible services

Replace every angle-bracket placeholder below. Model names come from the respective services; there is no assumed model or universal dimension:

| Field | Embedding group | VLM group |
| --- | --- | --- |
| Provider | `openai` | `openai` |
| API base | `<OpenAI-compatible base specified by embedding service>` | `<OpenAI-compatible base specified by chat service>` |
| API key | `<embedding service key; empty if unauthenticated>` | `<chat service key; empty if unauthenticated>` |
| Model | `<actual embedding model>` | `<actual summary/chat/vision model>` |
| Output dimension | `<actual vector length, entered as an integer>` | Not applicable |
| Input type | `text`, or `multimodal` only when supported | Not applicable |

Enter the complete base path specified by a custom service. Official OpenAI and Ark services can omit the base and use their adapter defaults; Ark typically uses `/api/v3`. Configure Azure api_version, VikingDB AK/SK and custom headers in `ov.conf`.

Unauthenticated services may have empty keys; cloud services still need their own valid credentials. The v0.5.6 OpenAI embedding adapter uses an internal placeholder when a base is provided. VLM configuration and the OpenAI SDK require a nonempty key, so this package writes `no-key` only when `VLM_PROVIDER=openai` and its key is empty. It is an adapter placeholder, not a real credential, an authentication bypass or a key inherited from Embedding.

### Ollama protocol selection

For an already prepared Ollama service, select Embedding provider `ollama`. An empty base connects to `http://host.docker.internal:11434/v1`; for another instance, enter its OpenAI-compatible base. Supply the model and actual dimension, and select `text`. The container reaches the host through `host.docker.internal`; Ollama must accept connections from the container.

For VLM select **`openai`** and independently enter that Ollama service's `/v1` compatible base. Its model must support the chat/vision/tools used by your tasks. This selects upstream OpenAIVLM and the OpenAI-compatible protocol, **not LiteLLM's native `ollama/` route**. The groups can address different Ollama instances. A native `/api/chat` URL is not a compatible API base. The form does not offer a native Ollama VLM provider.

This describes the generated adapter/address mapping only. Real Ollama requests and complete container startup were not tested.

### Leaving models unconfigured

Leave every field in a group empty to omit that group and configure only the other one. With both groups empty, the script can still create a basic configuration containing the management key, listener and local storage. Selecting Configure later while filling other fields in that group is a partial configuration and produces an error.

**This path has not been verified through full HTTP/Studio startup.** Omitting Embedding makes upstream v0.5.6 select its default `local` model with 512 dimensions; it does not disable embeddings. The standard image's build dependency chain does not select `local-embed`, and installed packages inside the image were not inspected. Default local functionality is not guaranteed. Omitting VLM also does not provide working summary/chat/vision functionality.

A collection may first be created with 512 dimensions; changing the embedding model afterwards remains subject to existing dimension/metadata checks. Establish the intended model and actual dimension before importing data. Do not delete the workspace to bypass checks or add `enable_default_resources`, which v0.5.6 does not recognize.

## Access and verification

After the complete service starts successfully, open `http://<server>:<http-host-port>/studio/`. Studio connects using API keys, rather than a `root` username and password:

- System Management API Key (Root): control-plane administration, including service configuration, accounts and users.
- User Access API Key (User/Admin): obtained when creating an account/user; used for ordinary data access and CLI/SDK searches. Root cannot replace a data identity.
- Embedding/VLM Service API Keys: independently authenticate calls to the two external model services. They are unrelated to the preceding identities.

Use Root in the appropriate Studio administration connection when initializing accounts. Save the resulting user key for everyday workspace and data API access. Bot is disabled by default and also requires a suitable User/Admin data-access key when enabled.

`/health` indicates service liveness. `/ready` checks initialization, storage and other conditions, but its Embedding subcheck only looks for a provider object rather than calling a model. Neither healthy nor ready proves correct model behavior.

Studio connection testing checks one request against the current draft. Saving performs configuration validation. Neither guarantees complete startup or compatibility with an existing collection. `openviking-server doctor` can supplement Embedding diagnostics; its VLM PASS is not itself proof of a real VLM request. Check actual ingestion, background task results and retrieval for business functionality. This package revision was checked using local scripts and configuration modules only, without those runtime tests.

Without `ov.conf`, upstream's pending configuration server returns `503` on every route; it is not Studio. This package's script creates a basic file or exits on invalid parameters. Do not confuse either condition with an already running UI.

## Enable VikingBot

Bot is included in the official image and disabled by default in this package. Start with a service already running normally in API-key mode:

1. In Studio, use the Root management identity to create an account and user, then save the user's User/Admin API key. Bot needs that user key to access data; Root alone cannot provide this access.
2. Back up the mounted `./data/ov.conf` and merge the following fields into it: add `with_bot` to the existing `server` object and user credentials to `bot.ov_server`. Keep the existing host, port, Root key, models, storage and other settings. **Do not replace the whole file with this fragment.**

   ```json
   {
     "server": {"with_bot": true},
     "bot": {
       "ov_server": {
         "api_key_type": "user",
         "api_key": "<User/Admin access key>"
       }
     }
   }
   ```

3. Bot inherits the root `vlm` by default; ensure that model supports the tool calls needed by your tasks. No third model service is required. Explicit `bot.agents.model` or `bot.agents.credentials` selects a separate Bot model.
4. Save, restart the app in 1Panel and open Studio's VikingBot page using the user identity to test a conversation. Look for `Vikingbot gateway started` in startup logs and verify an actual reply in the page.

Use `server.with_bot` as the switch. Keep compose's `OPENVIKING_WITH_BOT` at `0`; no second switch or additional Bot port mapping is needed, as the service proxies through its existing HTTP port. To disable Bot, set `server.with_bot` to `false` and restart. If enabling fails, restore the backup and diagnose the actual startup errors without clearing the workspace.

## Existing installations, model changes and troubleshooting

Existing `ov.conf` files always take priority, including files created by older packages. `MODEL_PRESET`, `MODEL_API_BASE` and `MODEL_API_KEY` no longer generate configuration. Compose retains optional mappings solely for migration detection. A missing file with legacy-only variables produces a migration error: restore the backed-up configuration or populate the new independent groups in the deployment environment. When new groups are supplied, old shared values are ignored and never injected into either group. Old model/dimension variables whose names overlap with new fields still require their matching provider and other group fields; the script does not guess them.

Before changing models, back up the entire data directory, compare redacted configuration revisions and check actual output dimensions against the existing collection schema and embedding metadata. Equal dimensions do not guarantee compatible vector spaces. The script never rebuilds indexes or re-embeds data. Edit the actual configuration and preserve server failure traces; a Web rollback notification does not identify the cause.

For a restart rollback, collect stdout/stderr over the failing interval, the redacted before/after configuration diff, actual running image and command/mount information, plus vector dimensions and embedding metadata from `collection_meta.json`. `replay complete (0 records)` counts that incremental replay, not total collection or workspace data. This package change does not claim to diagnose or fix a user's restart rollback incident.

For public access, configure HTTPS through a 1Panel reverse proxy and set `server.public_base_url` and appropriate `server.cors_origins`.

For the upstream terminal wizard, back up the configuration and manually run `docker exec -it <container-name> openviking-server init`. It is interactive and is not part of the automatic startup script.

## Data and upgrades

The app-relative `./data` directory is mounted at `/app/.openviking`:

- `./data/ov.conf`: server configuration, published atomically with mode `600` when new; existing files are never overwritten.
- `./data/ovcli.conf`: CLI configuration.
- `./data/data`: workspace at container path `/app/.openviking/data`, containing accounts/user credentials, resources, vectors and queues.
- `./data/scripts`: this package's startup script.

Stop the app and back up all of `./data` before upgrading. Preserve both configuration and workspace. Multiple local-vector-backend instances must not share a workspace concurrently. `./data/data` is not a disposable empty index directory.

Compose retains a commented mainland China mirror with the same tag for ghcr.io connectivity issues. Users must assess third-party image security, availability and compliance risks. This revision was not verified by pulling an image or running a container.

The logo comes from upstream's `docs/images/ov-logo-square.png`. OpenViking authorship and licensing are recorded in the [upstream repository](https://github.com/volcengine/OpenViking).

## Links

- Website: <https://openviking.ai/>
- Docs: <https://docs.openviking.ai/>
- GitHub: <https://github.com/volcengine/OpenViking>
- [v0.5.6 deployment guide](https://github.com/volcengine/OpenViking/blob/831ad81f5838d3502812a48bbec2e1d2930ed13c/docs/en/guides/03-deployment.md)
- [v0.5.6 configuration guide](https://github.com/volcengine/OpenViking/blob/831ad81f5838d3502812a48bbec2e1d2930ed13c/docs/en/guides/01-configuration.md)
