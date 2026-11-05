# Nitter Introduction

## Overview

Nitter is a free and open-source, privacy-focused alternative Twitter/X front-end. It does not rely on JavaScript, shows no ads, performs no tracking, and has no paywalls. You can browse tweets, timelines and search results without logging in, making it ideal for anonymous self-hosted access to Twitter/X.

This app is built from [xiaoY233/nitter](https://github.com/xiaoY233/nitter), a fork of zedeus/nitter. Alongside the web front-end it ships the fork's custom features:

- **Agent API**: seven read-only tools, served over REST (`/api/v1/...`) and MCP (`POST /mcp`) for AI agents.
- **New web interface**: X-style three-column layout with six themes (X, Vercel, Mono, Claude, Codex, TikTok, each in light and dark) and a one-click Simplified Chinese interface.
- **Works out of the box**: an API token is generated at install time, and Redis is bundled for caching.

## Key Features

- **Read-only agent tools**: `get_user`, `get_user_timeline`, `get_tweet`, `get_thread`, `search_tweets`, `search_users`, `get_user_connections`, with Markdown/JSON output and uniform pagination
- **REST + MCP**: `/api/v1/...`, `/mcp` (Streamable HTTP), plus self-describing `/llms.txt` and `/api/v1/openapi.json`
- **Privacy-friendly**: no login, no tracking, no ads, no JavaScript on the web side
- **RSS support**: feeds for users, lists and search keywords
- **Themes and Chinese UI**: six colour themes with light/dark/system, interface language switchable to Simplified Chinese
- **Bundled Redis cache**: better performance, fewer repeated requests to X
- **Tokens and rate limits**: Bearer tokens, per-token limits and Origin checks keep your session quota safe

## API token and endpoints

Installation generates `NITTER_API_TOKENS` automatically. You can view or change it in the app's parameters; the format is `name:secret` (a bare `secret` also works). Clients send the part after the colon:

```bash
# Health check (no token needed)
curl http://server-ip:port/api/v1/health

# Profile lookup (Markdown output)
curl -H "Authorization: Bearer <secret>" \
  "http://server-ip:port/api/v1/users/jack?format=markdown"

# MCP endpoint: http://server-ip:port/mcp
```

MCP client example (Claude Code):

```bash
claude mcp add --transport http nitter http://server-ip:port/mcp \
  --header "Authorization: Bearer <secret>"
```

> Security: the API is meant for a trusted network; every call spends your X session quota. Do not expose the port directly to the internet; put a reverse proxy with HTTPS in front of it.

## ⚠️ Important: X sessions required

Nitter **requires** an X account session file `sessions.jsonl` to read tweet data — there is no anonymous/guest mode anymore. Generate it with the tools shipped in this repository (a real X account is needed):

```bash
# Clone the repo and install dependencies
git clone https://github.com/xiaoY233/nitter && cd nitter
pip install -r tools/requirements.txt

# Log in and create a session (add --headless to run without a window)
python3 tools/create_session_browser.py your_x_username your_x_password TOTP_secret --append sessions.jsonl
```

Put the generated `sessions.jsonl` content into `data/sessions.jsonl` under the app directory (replacing the empty file created at install), then restart the app.

> Note: installation ships an empty `sessions.jsonl` placeholder so the container starts cleanly. Until real sessions are added, the web pages open but cannot load tweets, and `/api/v1/health` reports `no_sessions`.

## Usage

1. After installation, visit `http://server-ip:port`. The appearance menu at the foot of the left rail switches the interface language (English / 中文) and the theme.
2. Most configuration lives in `data/nitter.conf` in the app directory:
   - Set `hostname` under `[Server]` to your domain or IP so links are generated correctly.
   - Set `hmacKey` under `[Config]` to a random value (e.g. `openssl rand -hex 32`) to sign media URLs.
   - The Agent API is enabled under `[Api]` by default. Its token is passed in through the `NITTER_API_TOKENS` environment variable, or can be written into `tokens`.
   - For HTTPS, use a reverse proxy (e.g. a 1Panel website) and keep `https = false`.
3. Restart the app after changing the configuration or replacing `sessions.jsonl`.
4. Redis data is stored in `data/redis`; the cache can be safely cleared without affecting usage.

## Notes

- `nitter.conf` and `sessions.jsonl` must exist; do not delete them or turn them into directories. Both are mounted read-only.
- With an empty `sessions.jsonl` the app starts but cannot load tweets; real sessions are required.
- If the log says `[Api] enabled = true but no tokens are configured`, set `NITTER_API_TOKENS` again in the app parameters, or set `[Api] enabled = false` in `nitter.conf`.
- When upgrading from the old zedeus/nitter-based package, the existing `data/nitter.conf` is kept; add the `[Api]` block and a token manually to use the Agent API.
- The published image is amd64 only; arm64 requires a local build.
- The project is licensed under AGPL-3.0: if you offer it over a network, you must make the source of the running version available.

## Links

- [Project repository](https://github.com/xiaoY233/nitter)
- [Deployment docs](https://github.com/xiaoY233/nitter/blob/master/docs/deployment.md)
- [Agent API / MCP docs](https://github.com/xiaoY233/nitter/blob/master/docs/agent-api.md)
- [Sessions docs](https://github.com/xiaoY233/nitter/blob/master/docs/sessions.md)
- [Upstream Nitter](https://github.com/zedeus/nitter)
- [Docker image](https://hub.docker.com/r/vuldocker/nitter)
