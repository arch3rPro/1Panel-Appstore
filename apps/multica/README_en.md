# Multica

<div align="center">

A self-hosted workspace where you assign issues to AI coding agents.

[Website](https://multica.ai) · [Docs](https://multica.ai/docs) · [Self-Hosting Guide](https://github.com/multica-ai/multica/blob/main/SELF_HOSTING.md)

</div>

![](https://img.shields.io/badge/Copyright-arch3rPro-ff9800?style=flat&logo=github&logoColor=white)

---

## What this is

Multica is a workspace where you create an issue, assign it to an AI agent, and the agent picks it up the way a teammate would — reporting progress in the issue, raising blockers, and handing it back for review.

Agents do not run inside this app. Everyone who wants to run agents installs the `multica` CLI on their own machine and starts a daemon there; the daemon detects the agent CLIs already installed, registers with the server, and picks up work. So this package covers the server side only: the API, the web UI and the database.

## What is bundled

| Service | Role |
|---|---|
| `multica` | Next.js frontend — the browser entry point, also reverse-proxying `/api` and `/ws` to the backend |
| `multica-backend` | Go backend — REST API + WebSocket, runs database migrations on startup |
| `postgres` | PostgreSQL 17 with pgvector — persistent storage besides uploaded files |

Uploads land in `./data/uploads`, the database in `./data/postgres`.

## First step after install: set the public URL

The **Public URL** field (`APP_URL`) must be the address you actually open Multica at, for example:

```
http://192.168.1.10:3000
```

This field is load-bearing:

- The backend derives the session cookie's `Secure` flag from it. Set `https://` while serving plain http and the browser drops the cookie, which looks like being bounced straight back to the login page.
- The backend uses it as the WebSocket Origin allowlist. With a wrong value the UI loads and login works, but live board updates and agent status fail silently (`/ws` returns 403).

After changing domain or IP, update this value in the app settings and restart.

## Logging in

There is no fixed verification code by default. Two options:

**SMTP configured (recommended):** fill in the SMTP host, port, credentials and sender address in the install form; codes are emailed.

**No SMTP:** the backend generates the code and prints it to the container log. On the server:

```bash
docker logs -f <container-prefix>-backend 2>&1 | grep "Verification code"
```

Enter your email on the login page, then take the six-digit code from the log.

> Do not set `MULTICA_DEV_VERIFICATION_CODE` to save trouble. On a publicly reachable instance it means anyone who knows an email address can log in.

## Setting up agents on each machine

On each machine that should run agents:

```bash
brew install multica-ai/tap/multica
multica setup self-host --server-url http://<server-ip>:8080 --app-url http://<server-ip>:3000
```

At least one supported agent CLI must be on `PATH`, such as `claude` (Claude Code), `codex` (Codex), `copilot` (GitHub Copilot CLI), `opencode` (OpenCode) or `pi` (Pi).

Afterwards, **Settings → Runtimes** in the web UI should list the machine. Create an agent under **Settings → Agents**, then assign issues to it. `multica daemon status` confirms the daemon is running.

## Not included

**Live doc co-editing (collab):** upstream ships an optional `multica-collab` service for real-time collaborative editing of Workspace Docs. Its image `ghcr.io/multica-ai/multica-collab` only started publishing to GHCR with v0.12.1 (v0.11.1 and earlier are not retrievable), and this package does not include it. Add it from upstream's compose if you need it, keeping in mind it must run exactly one replica (every open doc lives in that process's memory) and needs the same `MULTICA_IMAGE_TAG` and a `COLLAB_SECRET`. Docs themselves are off by default anyway (`FF_DOCS_V1=true` to enable) and the board, issues and agents work without it.

**External integrations:** Slack, Lark/Feishu, WeCom, DingTalk, Telegram, Weixin, the GitHub App, Composio and S3 storage all need extra secrets and callback URLs. They are not exposed in the install form.

## Adding configuration manually

Edit the installed app's compose override and add environment variables to `multica-backend`, then restart:

```yaml
environment:
  GITHUB_APP_ID: "123456"
  GITHUB_APP_SLUG: "your-app-slug"
  GITHUB_APP_CLIENT_ID: "..."
  GITHUB_APP_CLIENT_SECRET: "..."
  GITHUB_WEBHOOK_SECRET: "..."
  GITHUB_APP_PRIVATE_KEY: "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
  MULTICA_PUBLIC_URL: "https://api.example.com"
  S3_BUCKET: "..."
  AWS_ENDPOINT_URL: "..."
  AWS_ACCESS_KEY_ID: "..."
  AWS_SECRET_ACCESS_KEY: "..."
```

The full annotated list lives in upstream's [`.env.example`](https://github.com/multica-ai/multica/blob/main/.env.example).

## Backups

Back up three things:

- `./data/postgres` — all business data. Stop the containers and archive it, or use `pg_dump`.
- `./data/uploads` — issue attachments, avatars and other uploaded files.
- The `JWT_SECRET` and `DB_PASSWORD` generated at install time. Losing the former invalidates existing sessions and already-issued download links; losing the latter locks you out of the database.

Back up before upgrading. The backend runs migrations on startup and they are one-way — rolling the version back is not guaranteed to read the old schema.

## Upgrading

```bash
docker compose pull
docker compose up -d
```

Read upstream's `SELF_HOSTING.md` before a major upgrade; some version jumps require running a backfill command first.

## License and usage limits

Multica is not standard open source — it is **source-available**: Apache License 2.0 as the body, plus additional conditions, together forming the "Multica License".

- **Self-hosting and internal organizational use are fine** (multiple workspaces included, no commercial license needed).
- **You may not offer Multica as a hosted service to third parties**, even free of charge, without ads and with no paid tier — that requires a commercial license. Operating it as a SaaS or embedding it in a commercially distributed product needs one first.
- **You may not remove or modify the Multica logo, product name, or the copyright and attribution notices shown in the UI.**
- **Redistribution must ship the complete LICENSE file**; the Apache 2.0 text alone is not compliant.
- Code under `server/ee/` and `packages/ee/` is under a separate commercial license.

This package is deployment wrapping only; no upstream code is modified. Upstream is Index Labs (Hong Kong) Limited — see the repository's [LICENSE](https://github.com/multica-ai/multica/blob/main/LICENSE).

## Risk notice

The images are third-party images published by upstream. This package makes no guarantee about their security, availability or legal compliance; use at your own risk. Before exposing this to the internet: change default ports, configure SMTP and `ALLOW_SIGNUP`, and put a TLS-terminating reverse proxy in front.

## Source

- Project: <https://github.com/multica-ai/multica>
- Version: 0.12.1
- Architectures: amd64 / arm64
