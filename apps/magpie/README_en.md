# magpie

Every agent's model, one place. One gateway that gives every AI coding tool the models you choose: Claude Code on Kimi, Codex on DeepSeek, Gemini CLI on GLM — switching a model means changing it once.

> 1Panel packaging of [yetone/magpie](https://github.com/yetone/magpie). The desktop (menu bar) app is out of scope here: this runs **gateway mode**, serving models, accounts and routing to the agents on your other machines.
>
> **Versions**: `latest/` tracks the upstream `latest` image; `0.1.3150/` is the pinned version directory (image tag `0.1.3150`) and is the recommended install. Upstream publishes one `0.1.x` image tag per release, so the version number is a build number and upgrade jumps are normal.

## Features

- **Any model, any agent**: Claude Code, Codex, Gemini CLI, OpenCode, Cursor CLI, Copilot CLI, Qwen Code, Crush, Zed, Cline and dozens more
- **Reuse subscriptions**: a ChatGPT, Claude, GitHub Copilot, Gemini, Antigravity or Grok plan works as a provider, with failover across accounts
- **Routing groups**: `smart` / `order` / `rotate` / `usage` / `pace`; when a quota runs out the request moves on to the next account or model, and the agent never sees the error
- **Usage and cost**: tokens, cache reads/writes, reasoning and cost per account, key and model, with OTLP export
- **Privacy masking**: keys, passwords and emails in a prompt are swapped for placeholders before the request leaves, and put back in the reply
- **Plugins and gateway middleware**: Bun-based plugins sign in to subscriptions, rewrite requests, filter words, map model names
- **Extra tools**: web search, image and video generation over MCP for any agent
- **Browser UI**: providers, gateway keys, routing, usage, sessions, plugins and settings, all in one page
- **One gateway, four APIs**: OpenAI Chat, OpenAI Responses, Anthropic Messages and Gemini on `3425`, translated both ways

## Usage

### 1. Open the UI

```text
http://<server-ip>:3430
```

The page asks for the access key on first visit: it is the `MAGPIE_WEB_KEY` you set at install time (if it was generated, see **Parameters / Environment** on the 1Panel app page, e.g. `magpie-web-key-change-me_ab12cd`). The key can also be passed in the link:

```text
http://<server-ip>:3430/?k=<MAGPIE_WEB_KEY>
```

The browser stays signed in for 400 days.

> ⚠️ Replace `MAGPIE_WEB_KEY` with your own strong value (`openssl rand -hex 16`; letters, digits and `- . _ ~` only, 16 characters or more).

### 2. Add a provider

**Providers → Add provider**: pick a preset (DeepSeek, Kimi, Zhipu GLM, MiniMax, Qwen, Volcengine Ark, OpenRouter, SiliconFlow, Ollama, LM Studio …) and paste a key, or add any OpenAI/Anthropic-compatible URL.

For subscription sign-ins (ChatGPT, Claude…) the vendor sends the browser back to `http://localhost:1455/...` — that is your computer, not the container, so the page doesn't load. **Copy the whole callback URL from the address bar and paste it into magpie's Callback field.**

### 3. Make a gateway key for each machine

**Gateway → Gateway keys → add**, which prints `sk-magpie-key-...`. One per client machine, each with its own model list and daily/weekly/monthly limit if you like.

### 4. Point an agent at the gateway

On the machine running the agent (model ids are `provider/model`, or a group's `group/name`):

```bash
# OpenAI-compatible clients (Codex, Cursor, Cline, OpenCode, Qwen Code …)
export OPENAI_BASE_URL=http://<server-ip>:3425/v1
export OPENAI_API_KEY=sk-magpie-key-...

# Anthropic-compatible clients (Claude Code)
export ANTHROPIC_BASE_URL=http://<server-ip>:3425
export ANTHROPIC_API_KEY=sk-magpie-key-...

# Gemini-compatible clients
export GOOGLE_GEMINI_BASE_URL=http://<server-ip>:3425
export GEMINI_API_KEY=sk-magpie-key-...
```

Or add this app as a remote magpie so a local magpie wires your agents for you:
`magpie provider add remote-magpie sk-magpie-key-... url=http://<server-ip>:3425 id=office`

### 5. CLI

From the 1Panel app terminal (or `docker exec -it <container> bash`):

```bash
magpie provider add deepseek sk-…      # add a provider
magpie provider add ollama             # a local model server
magpie presets                         # built-in presets
magpie group add "Opus anywhere" models=claude/claude-opus,copilot/claude-opus routing=smart
magpie gateway-key add "Laptop"        # new gateway key
magpie quota                           # what is left on each plan
magpie usage                           # tokens and cost
```

## Ports

| Port | Purpose |
| --- | --- |
| `3430` | Web UI |
| `3425` | Gateway API (OpenAI / Anthropic / Gemini compatible) |

## Data Directory

Everything persistent lives in `./data` (`/config` in the container):

| Path | Contents |
| --- | --- |
| `data/magpie` | settings, providers, gateway keys, routing groups |
| `data/home` | the container's `HOME`: the sign-ins of subscription accounts |
| `data/cache` | model catalog, the Bun runtime plugins use, downloaded Claude Code |
| `data/data`, `data/state` | the rest |

> The container runs as root because the upstream image runs as uid 65532, which cannot write the `./data` directory 1Panel creates as root — a non-root run would silently lose all data. The container itself stays unprivileged with no extra host mounts.

## Environment Variables

| Variable | Description |
| --- | --- |
| `MAGPIE_WEB_KEY` | the UI's access key: 16+ characters, letters, digits and `- . _ ~` only |
| `MAGPIE_PUBLIC_URL` | the address other machines reach the gateway at, e.g. `http://192.168.1.20:3425`; the UI and log then show that address |
| `MAGPIE_ALLOW_IPS` | client IPs / CIDRs allowed to reach the gateway and UI, comma separated; anything else gets 403 |
| `DO_NOT_TRACK` | `1` turns the upstream anonymous usage report off (the default here); `0` leaves it on |
| `MAGPIE_TLS_CERT` / `MAGPIE_TLS_KEY` | optional: mount a certificate pair and magpie serves HTTPS itself (add to the compose file) |

## Notes

- **Do not expose this to the internet as-is.** The `3430` UI is the keys themselves, and `3425` needs gateway keys. Use a VPN (Tailscale / WireGuard), a 1Panel reverse proxy with HTTPS, or `MAGPIE_ALLOW_IPS`.
- **First use needs network access**: plugins download Bun, and a Claude subscription downloads Anthropic's Claude Code (kept in `data/cache`, a few hundred MB). With a restricted network, start with API-key providers.
- **Upgrading**: with the pinned version installed, 1Panel offers the new version; you can also recreate the container from the `latest` image. Everything in `./data` is kept either way.
- Upstream releases very often (one tag per release); the repository's updater moves the pinned version directory forward daily.

## Links

- Website: https://usemagpie.ai
- GitHub: https://github.com/yetone/magpie
- Docker docs: https://usemagpie.ai/docs/docker
- Full reference: https://github.com/yetone/magpie/blob/main/docs/reference.md
